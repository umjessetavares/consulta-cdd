document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO ---
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    // Verificação de Segurança
    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Verifique se dados_cdd.js e dados_cdu.js estão carregados.</div>';
        return;
    }

    // --- 2. EVENTO DE TROCA (CDD <-> CDU) ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // Objeto (Árvore)
                searchInput.placeholder = "CDU: código ou termo (ex: (81), 004...)";
            } else {
                dadosAtivos = baseCDD; // Array (Lista)
                searchInput.placeholder = "CDD: código ou assunto...";
            }
            searchInput.focus();
        });
    });

    // --- 3. INPUT ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 4. MOTOR DE BUSCA HÍBRIDO ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // Verifica Tipo: Array (CDD) ou Objeto (CDU)
        if (Array.isArray(dadosAtivos)) {
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // Busca na Árvore CDU
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Função Recursiva para CDU
    function searchCDU(database, query) {
        let found = [];

        // Busca auxiliares
        if (database.auxiliares) {
            found = found.concat(database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            }));
        }

        // Busca na árvore principal
        function traverse(nodes, path = []) {
            for (const key in nodes) {
                const node = nodes[key];
                const currentCode = key; 
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Se deu match
                if (currentCode.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    // Salva também o caminho (path) para usar no breadcrumb depois
                    found.push({ 
                        code: currentCode, 
                        desc: node.desc,
                        path: [...path] // Cópia do caminho até aqui
                    });
                }

                // Recursão
                if (node.children) {
                    traverse(node.children, [...path, { code: key, desc: node.desc }]);
                }
            }
        }

        if (database.principal) traverse(database.principal);
        return found;
    }

    // --- 5. EXIBIÇÃO E BREADCRUMBS ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        const currentDbName = document.querySelector('input[name="database"]:checked').value.toUpperCase();

        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            // --- GERAÇÃO DA HIERARQUIA (A Mágica acontece aqui) ---
            let breadcrumbHTML = '';
            
            // Lógica CDD (Lista)
            if (Array.isArray(dadosAtivos)) {
                const parents = getCDDParents(item.code);
                if (parents.length > 0) {
                    // Formata: "000 Geral > 010 Bibliografias"
                    const pathString = parents.map(p => 
                        `<span title="${p.desc}">${p.code} ${truncate(p.desc)}</span>`
                    ).join(' &rsaquo; ');
                    
                    breadcrumbHTML = `<div class="breadcrumb">${pathString}</div>`;
                }
            } 
            // Lógica CDU (Árvore)
            else if (item.path && item.path.length > 0) {
                // O caminho já vem pronto da busca recursiva
                const pathString = item.path.map(p => 
                    `<span title="${p.desc}">${p.code} ${truncate(p.desc)}</span>`
                ).join(' &rsaquo; ');
                
                breadcrumbHTML = `<div class="breadcrumb">${pathString}</div>`;
            }

            // Highlight
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            card.innerHTML = `
                <span class="level-tag">${currentDbName}</span>
                <div class="level-content">
                    ${breadcrumbHTML}
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6. FUNÇÕES AUXILIARES ---
    
    // Calcula os pais para CDD baseado na lógica decimal
    function getCDDParents(code) {
        const potentialParents = [];
        if (code.length >= 3) potentialParents.push(code.charAt(0) + "00"); // ex: 300
        if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.push(code.substring(0, 2) + "0"); // ex: 330
        if (code.includes('.')) potentialParents.push(code.split('.')[0]); // ex: 331
        
        // Remove duplicatas e o próprio código, e busca os objetos reais
        return [...new Set(potentialParents)]
            .filter(p => p !== code)
            .map(p => dadosAtivos.find(d => d.code === p))
            .filter(Boolean); // Remove nulos se não achar
    }

    // Corta textos muito longos para caber no celular
    function truncate(str, n = 20) {
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
    }

    // --- 7. EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    // Tema e PWA (mantidos iguais)
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
