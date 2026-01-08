document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO ---
    // Verifica se os arquivos de dados foram carregados
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados (CDD/CDU) não carregados. Verifique o index.html.</div>';
        return;
    }

    // --- 2. EVENTO DE TROCA (CDD <-> CDU) ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // Agora é um Objeto Hierárquico
                searchInput.placeholder = "Buscar na CDU (ex: (81), 004...)";
            } else {
                dadosAtivos = baseCDD; // Continua sendo Array
                searchInput.placeholder = "Buscar na CDD...";
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

    // --- 4. BUSCA HÍBRIDA (A Principal Mudança) ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // Verifica o tipo da base de dados ativa
        if (Array.isArray(dadosAtivos)) {
            // LÓGICA ANTIGA (Para CDD - Lista Plana)
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // NOVA LÓGICA (Para CDU - Hierárquica/Objeto)
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Nova função para varrer a árvore da CDU
    function searchCDU(database, query) {
        let found = [];

        // 1. Busca nas Auxiliares (Lista simples dentro do objeto)
        if (database.auxiliares) {
            const auxResults = database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            });
            found = found.concat(auxResults);
        }

        // 2. Busca Recursiva na Principal (Árvore)
        function traverse(nodes) {
            for (const key in nodes) {
                const node = nodes[key];
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                // Se der match no código (key) ou descrição
                if (key.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({ code: key, desc: node.desc });
                }

                // Se tiver filhos, continua descendo (Recursão)
                if (node.children) {
                    traverse(node.children);
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
            resultsArea.innerHTML = '<div class="empty-state">Nenhum código encontrado.</div>';
            return;
        }
        
        // Limita resultados para não travar a tela se a busca for muito genérica
        const limitedResults = results.slice(0, 50);
        
        const fragment = document.createDocumentFragment();
        const currentDbName = document.querySelector('input[name="database"]:checked').value.toUpperCase();

        limitedResults.forEach(item => {
            const mainClass = item.code.charAt(0);
            const card = document.createElement('div');
            
            // Tratamento de cor para auxiliares (que começam com parênteses ou aspas)
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            card.className = `level-card class-${colorClass}`;
            
            // Breadcrumb
            const breadcrumbData = getBreadcrumbData(item.code);
            let breadcrumbElement = null;
            
            if (breadcrumbData) {
                breadcrumbElement = document.createElement('span');
                breadcrumbElement.className = 'breadcrumb';
                breadcrumbElement.innerHTML = breadcrumbData.short;
                breadcrumbElement.title = "Clique para expandir";
                breadcrumbElement.onclick = function() {
                    this.innerHTML = this.innerHTML.includes('...') ? breadcrumbData.full : breadcrumbData.short;
                };
            }

            // Highlight do termo buscado
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            card.innerHTML = `
                <span class="level-tag">${currentDbName} - ${item.code.length < 3 ? 'CLASSE' : 'SUBDIVISÃO'}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;
            
            if (breadcrumbElement) {
                card.querySelector('.level-content').prepend(breadcrumbElement);
            }

            fragment.appendChild(card);
        });

        if (results.length > 50) {
            const more = document.createElement('div');
            more.style.textAlign = 'center';
            more.style.padding = '10px';
            more.style.color = 'var(--subtext)';
            more.innerText = `+ ${results.length - 50} resultados não exibidos. Refine sua busca.`;
            fragment.appendChild(more);
        }

        resultsArea.appendChild(fragment);
    }

    // --- 6. HIERARQUIA INTELIGENTE (Breadcrumb Adaptado) ---
    function getBreadcrumbData(code) {
        if (!code) return null;
        
        // Se for CDD (Array), usa a lógica antiga de fatiar strings
        if (Array.isArray(dadosAtivos)) {
            const parents = new Set();
            if (code.length >= 3) parents.add(code.charAt(0) + "00");
            if (code.length >= 3 && !isNaN(code.substring(0,2))) parents.add(code.substring(0, 2) + "0");
            if (code.includes('.')) parents.add(code.split('.')[0]);
            parents.delete(code);
            
            const parentItems = Array.from(parents).sort().map(p => dadosAtivos.find(d => d.code === p)).filter(Boolean);
            if (parentItems.length === 0) return null;
            
            const shortText = parentItems.map(p => `${p.code}`).join(' > ');
            const fullText = parentItems.map(p => `${p.code} ${p.desc}`).join(' > ');
            return { short: shortText, full: fullText };
        } 
        
        // Se for CDU (Árvore), precisamos buscar na estrutura
        // Nota: Implementação simplificada para performance
        // A CDU é complexa, então para esta versão, vamos focar apenas em classes pai diretas se existirem na chave
        return null; // Breadcrumb desativado temporariamente para CDU para evitar complexidade excessiva
    }

    // --- EVENTOS FINAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { searchInput.value = ''; searchInput.focus(); handleInput(); }
        if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    });
    
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
