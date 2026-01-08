document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO E SEGURANÇA ---
    // Verifica se os arquivos de dados foram carregados corretamente no HTML
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados (CDD/CDU) não carregados. Verifique se dados_cdd.js e dados_cdu.js estão no index.html.</div>';
        return;
    }

    // --- 2. ALTERNÂNCIA DE BASE (CDD <-> CDU) ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // Estrutura de Objeto (Árvore)
                searchInput.placeholder = "CDU: Digite código (ex: 004) ou termo (ex: Brasil)...";
            } else {
                dadosAtivos = baseCDD; // Estrutura de Array (Lista)
                searchInput.placeholder = "CDD: Digite código ou assunto...";
            }
            searchInput.focus();
        });
    });

    // --- 3. CONTROLE DE INPUT ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 4. MOTOR DE BUSCA (HÍBRIDO) ---
    function performSearch(query) {
        // Normaliza o texto (remove acentos e deixa minúsculo)
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // VERIFICAÇÃO DE TIPO DE DADOS
        if (Array.isArray(dadosAtivos)) {
            // LÓGICA CDD (Lista Simples)
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // LÓGICA CDU (Árvore Hierárquica)
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    // Função Recursiva para varrer a CDU
    function searchCDU(database, query) {
        let found = [];

        // A. Busca nas Tabelas Auxiliares (se houver)
        if (database.auxiliares) {
            const auxResults = database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            });
            found = found.concat(auxResults);
        }

        // B. Busca na Árvore Principal
        function traverse(nodes) {
            for (const key in nodes) {
                const node = nodes[key];
                const currentCode = key; 
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Se encontrou match no código ou descrição
                if (currentCode.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({ code: currentCode, desc: node.desc });
                }

                // Se tiver filhos, continua descendo
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

    // --- 5. RENDERIZAÇÃO DOS RESULTADOS ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nenhum código encontrado.</div>';
            return;
        }
        
        // Limite de segurança para renderização
        const limitedResults = results.slice(0, 50);
        
        const fragment = document.createDocumentFragment();
        const currentDbName = document.querySelector('input[name="database"]:checked').value.toUpperCase();

        limitedResults.forEach(item => {
            // Define cor baseada na classe principal (0-9)
            const mainClass = item.code.charAt(0);
            // Se for auxiliar (começa com ( ou "), usa cor neutra '0', senão usa o número
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;
            
            // --- GERAÇÃO DA HIERARQUIA (BREADCRUMB) ---
            const breadcrumbData = getBreadcrumbData(item.code);
            let breadcrumbHTML = '';
            
            if (breadcrumbData) {
                breadcrumbHTML = `
                    <span class="breadcrumb" title="Clique para expandir" onclick="this.innerHTML = this.innerHTML.includes('&rsaquo;') ? '${breadcrumbData.short}' : '${breadcrumbData.full}'">
                        ${breadcrumbData.short}
                    </span>
                `;
            }

            // Grifa o termo buscado
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

        if (results.length > 50) {
            const more = document.createElement('div');
            more.style.textAlign = 'center';
            more.style.padding = '15px';
            more.style.color = 'var(--subtext)';
            more.style.fontSize = '0.9rem';
            more.innerText = `+ ${results.length - 50} resultados ocultos. Continue digitando para refinar.`;
            fragment.appendChild(more);
        }

        resultsArea.appendChild(fragment);
    }

    // --- 6. SISTEMA DE HIERARQUIA INTELIGENTE ---
    function getBreadcrumbData(code) {
        if (!code) return null;
        let parents = [];

        // A. Lógica CDD (Lista)
        if (Array.isArray(dadosAtivos)) {
            const potentialCodes = [];
            // Tenta adivinhar os pais baseados na lógica decimal (ex: 300 -> 330 -> 332)
            if (code.length >= 3) potentialCodes.push(code.charAt(0) + "00");
            if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialCodes.push(code.substring(0, 2) + "0");
            if (code.includes('.')) potentialCodes.push(code.split('.')[0]);
            
            // Filtra duplicatas e busca na lista real
            parents = [...new Set(potentialCodes)]
                .filter(p => p !== code)
                .map(p => dadosAtivos.find(d => d.code === p))
                .filter(Boolean);
        } 
        // B. Lógica CDU (Árvore)
        else {
            if (!dadosAtivos.principal) return null;
            
            // Decomponha o código (ex: "004.2" vira ["0", "00", "004"])
            let parts = [];
            // Pega o primeiro dígito
            if(code.length > 0) parts.push(code.charAt(0));
            // Pega os dois primeiros
            if(code.length > 1) parts.push(code.substring(0,2));
            // Pega antes do ponto
            if(code.includes('.')) parts.push(code.split('.')[0]);

            // Busca cada parte na árvore
            parents = [...new Set(parts)]
                .filter(p => p !== code && p.length > 0)
                .map(p => findNodeByCode(dadosAtivos.principal, p)) // Usa função auxiliar
                .filter(Boolean);
        }

        if (parents.length === 0) return null;

        // Cria os textos curto e longo
        const shortText = parents.map(p => `${p.code}`).join(' &rsaquo; ');
        const fullText = parents.map(p => `${p.code} ${p.desc}`).join(' &rsaquo; '); // Mostra descrição completa ao clicar

        return { short: shortText, full: fullText };
    }

    // Auxiliar: Encontra um nó específico dentro da árvore complexa da CDU
    function findNodeByCode(nodes, targetCode) {
        if (nodes[targetCode]) return { code: targetCode, desc: nodes[targetCode].desc };
        
        for (const key in nodes) {
            if (nodes[key].children) {
                const found = findNodeByCode(nodes[key].children, targetCode);
                if (found) return found;
            }
        }
        return null;
    }

    // --- 7. EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    
    clearBtn.addEventListener('click', () => { 
        searchInput.value = ''; 
        searchInput.focus(); 
        handleInput(); 
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { 
            searchInput.value = ''; 
            searchInput.focus(); 
            handleInput(); 
        }
        // Atalho "/" para focar na busca
        if (e.key === '/' && document.activeElement !== searchInput) { 
            e.preventDefault(); 
            searchInput.focus(); 
        }
    });
    
    // Gerenciamento de Tema (Claro/Escuro)
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Registro do Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
    }
});
