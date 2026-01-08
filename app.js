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
                dadosAtivos = baseCDU; 
                searchInput.placeholder = "CDU: código ou termo (ex: (81), 004...)";
            } else {
                dadosAtivos = baseCDD; 
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

    // --- 4. BUSCA HÍBRIDA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        if (Array.isArray(dadosAtivos)) {
            // Busca CDD (Lista)
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // Busca CDU (Árvore)
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Função Recursiva para CDU
    function searchCDU(database, query) {
        let found = [];

        // Auxiliares
        if (database.auxiliares) {
            found = found.concat(database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            }));
        }

        // Árvore Principal
        function traverse(nodes, path = []) {
            for (const key in nodes) {
                const node = nodes[key];
                const currentCode = key; 
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Se deu match
                if (currentCode.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({ 
                        code: currentCode, 
                        desc: node.desc,
                        path: [...path] // Passa o histórico de pais
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

    // --- 5. EXIBIÇÃO (ATUALIZADO COM CLIQUE) ---
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
            
            // Cria o container do card
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            // Highlight do termo buscado na descrição principal
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Monta o HTML básico do card (sem o breadcrumb ainda)
            card.innerHTML = `
                <span class="level-tag">${currentDbName}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // --- LÓGICA DO BREADCRUMB INTERATIVO ---
            let parents = [];
            
            // Recupera pais (CDD ou CDU)
            if (Array.isArray(dadosAtivos)) {
                parents = getCDDParents(item.code);
            } else if (item.path) {
                parents = item.path;
            }

            // Se houver pais, cria o elemento clicável e insere no card
            if (parents.length > 0) {
                // Versão Curta (Truncada)
                const shortHtml = parents.map(p => 
                    `<span>${p.code} ${truncate(p.desc)}</span>`
                ).join(' &rsaquo; ');

                // Versão Longa (Completa)
                const fullHtml = parents.map(p => 
                    `<span><strong>${p.code}</strong> ${p.desc}</span>`
                ).join('<br>↓<br>'); // Usa setas verticais para ficar bonito quando aberto

                // Cria o elemento DIV via JS para garantir segurança dos eventos
                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = shortHtml; // Começa curto
                breadcrumbDiv.title = "Clique para ver o caminho completo";
                
                // Evento de Clique (Toggle)
                breadcrumbDiv.onclick = (e) => {
                    e.stopPropagation(); // Evita bolhas de evento indesejadas
                    if (breadcrumbDiv.innerHTML === shortHtml) {
                        breadcrumbDiv.innerHTML = fullHtml;
                        breadcrumbDiv.style.whiteSpace = "normal"; // Permite quebra de linha
                    } else {
                        breadcrumbDiv.innerHTML = shortHtml;
                        breadcrumbDiv.style.whiteSpace = "nowrap"; // Volta para linha única
                    }
                };

                // Insere o breadcrumb no topo do conteúdo do card
                card.querySelector('.level-content').prepend(breadcrumbDiv);
            }

            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6. AUXILIARES ---
    
    function getCDDParents(code) {
        const potentialParents = [];
        if (code.length >= 3) potentialParents.push(code.charAt(0) + "00"); 
        if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.push(code.substring(0, 2) + "0");
        if (code.includes('.')) potentialParents.push(code.split('.')[0]);
        
        return [...new Set(potentialParents)]
            .filter(p => p !== code)
            .map(p => dadosAtivos.find(d => d.code === p))
            .filter(Boolean);
    }

    function truncate(str, n = 25) { // Aumentei um pouco o limite
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
    }

    // --- 7. EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
