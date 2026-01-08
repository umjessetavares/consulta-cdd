document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO ---
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados não carregados.</div>';
        return;
    }

    // --- 2. TROCA DE BASE ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // É um Objeto (Árvore)
                searchInput.placeholder = "CDU: código ou termo...";
            } else {
                dadosAtivos = baseCDD; // É um Array (Lista)
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

    // --- 4. MOTOR DE BUSCA (HÍBRIDO) ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // Verifica se é Lista (CDD) ou Árvore (CDU)
        if (Array.isArray(dadosAtivos)) {
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // Busca especial para a estrutura de árvore da CDU
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Função Recursiva para varrer a Árvore CDU e já capturar o caminho (Path)
    function searchCDU(database, query) {
        let found = [];

        // 1. Busca nas Auxiliares
        if (database.auxiliares) {
            const auxResults = database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            });
            found = found.concat(auxResults.map(r => ({...r, path: []})));
        }

        // 2. Busca na Hierarquia Principal (Recursiva)
        function traverse(nodes, currentPath = []) {
            for (const key in nodes) {
                const node = nodes[key];
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                // Cria o objeto do caminho atual
                const pathNode = { code: key, desc: node.desc };

                // Se deu match
                if (key.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({
                        code: key,
                        desc: node.desc,
                        path: [...currentPath] // Salva o histórico de pais
                    });
                }

                // Mergulha nos filhos, passando o caminho atualizado
                if (node.children) {
                    traverse(node.children, [...currentPath, pathNode]);
                }
            }
        }

        if (database.principal) {
            traverse(database.principal);
        }

        return found;
    }

    // --- 5. EXIBIÇÃO ---
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

            // Highlight
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Estrutura Base
            card.innerHTML = `
                <span class="level-tag">${currentDbName}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // --- LÓGICA DO BREADCRUMB (PAIS) ---
            let parents = [];

            // Se o item já tem o caminho (veio da CDU Recursiva)
            if (item.path && item.path.length > 0) {
                parents = item.path;
            } 
            // Se não tem (é CDD), calcula com lógica decimal
            else if (Array.isArray(dadosAtivos)) {
                parents = getCDDParents(item.code);
            }

            // Exibe o caminho se houver
            if (parents.length > 0) {
                // Monta o texto completo sem cortes, separado por setas
                const fullPathHTML = parents.map(p => 
                    `<span>${p.code} ${p.desc}</span>`
                ).join(' &rsaquo; ');

                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = fullPathHTML;
                
                // Insere no topo do card
                card.querySelector('.level-content').prepend(breadcrumbDiv);
            }

            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6. AUXILIARES (Apenas para CDD) ---
    function getCDDParents(code) {
        const potentialParents = [];
        if (code.length >= 3) potentialParents.push(code.charAt(0) + "00"); 
        if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.push(code.substring(0, 2) + "0");
        if (code.includes('.')) potentialParents.push(code.split('.')[0]);
        
        return [...new Set(potentialParents)]
            .filter(p => p !== code)
            .map(p => dadosAtivos.find(d => d.code === p))
            .filter(Boolean)
            .sort((a, b) => a.code.length - b.code.length);
    }

    // --- 7. EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    // Tema
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // PWA
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
