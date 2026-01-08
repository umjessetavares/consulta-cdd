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

    // --- 4. MOTOR DE BUSCA HÍBRIDO ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // VERIFICA SE É ARRAY (CDD) OU OBJETO (CDU)
        if (Array.isArray(dadosAtivos)) {
            // BUSCA SIMPLES (CDD)
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // BUSCA RECURSIVA NA ÁRVORE (CDU)
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Função Especial para Varrer a Árvore CDU
    function searchCDU(database, query) {
        let found = [];

        // 1. Busca nas Tabelas Auxiliares
        if (database.auxiliares) {
            const auxResults = database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            });
            // Adiciona propriedade 'path' vazia para auxiliares
            found = found.concat(auxResults.map(r => ({...r, path: []})));
        }

        // 2. Busca na Hierarquia Principal (Recursiva)
        function traverse(nodes, currentPath = []) {
            for (const key in nodes) {
                const node = nodes[key];
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                // Cria o objeto do nó atual
                const currentNode = { code: key, desc: node.desc };

                // Se deu match no código ou descrição
                if (key.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({
                        code: key,
                        desc: node.desc,
                        path: [...currentPath] // Salva o caminho até aqui
                    });
                }

                // Continua descendo se tiver filhos
                if (node.children) {
                    traverse(node.children, [...currentPath, currentNode]);
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

            // Se for CDD (Lista), calcula os pais
            if (Array.isArray(dadosAtivos)) {
                parents = getCDDParents(item.code);
            } 
            // Se for CDU (Objeto), usa o caminho que a busca recursiva já encontrou
            else if (item.path) {
                parents = item.path;
            }

            // Se houver pais, cria o elemento clicável
            if (parents.length > 0) {
                // Versão Curta
                const shortHtml = parents.map(p => 
                    `<span>${p.code} ${truncate(p.desc)}</span>`
                ).join(' &rsaquo; ');

                // Versão Longa (Expandida)
                const fullHtml = parents.map(p => 
                    `<div style="margin: 4px 0;"><strong>${p.code}</strong> ${p.desc}</div>`
                ).join('<div style="color:var(--border); text-align:center; line-height:10px; font-size:12px;">↓</div>');

                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = shortHtml;
                breadcrumbDiv.title = "Clique para ver a hierarquia completa";
                
                // Evento de Clique
                breadcrumbDiv.onclick = (e) => {
                    e.stopPropagation();
                    if (breadcrumbDiv.innerHTML === shortHtml) {
                        breadcrumbDiv.innerHTML = fullHtml;
                        breadcrumbDiv.style.whiteSpace = "normal";
                        breadcrumbDiv.style.overflow = "visible";
                        breadcrumbDiv.style.borderBottom = "1px solid var(--border)";
                        breadcrumbDiv.style.paddingBottom = "8px";
                        breadcrumbDiv.style.marginBottom = "8px";
                    } else {
                        breadcrumbDiv.innerHTML = shortHtml;
                        breadcrumbDiv.style.whiteSpace = "nowrap";
                        breadcrumbDiv.style.overflow = "hidden";
                        breadcrumbDiv.style.borderBottom = "none";
                        breadcrumbDiv.style.paddingBottom = "4px";
                        breadcrumbDiv.style.marginBottom = "0.5rem";
                    }
                };

                // Insere no topo do card
                card.querySelector('.level-content').prepend(breadcrumbDiv);
            }

            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6. AUXILIARES ---
    
    // Calcula pais apenas para a CDD (Lista Plana)
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

    function truncate(str, n = 22) {
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
