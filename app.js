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
                dadosAtivos = baseCDU;
                searchInput.placeholder = "CDU: código ou termo...";
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

    // --- 4. BUSCA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];

        // Lógica unificada de filtro (já que seus dados CDU agora são lista plana igual CDD)
        results = dadosAtivos.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    // --- 5. EXIBIÇÃO COM BREADCRUMB INTERATIVO ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        const currentDbName = document.querySelector('input[name="database"]:checked').value.toUpperCase();

        // Limita a 50 resultados para performance
        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            // Highlight
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Estrutura básica do card
            card.innerHTML = `
                <span class="level-tag">${currentDbName}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // --- LÓGICA DO CAMINHO (BREADCRUMB) ---
            const parents = getParents(item.code);
            
            if (parents.length > 0) {
                // 1. Texto Curto (Linha única, truncado)
                const shortHtml = parents.map(p => 
                    `<span>${p.code} ${truncate(p.desc)}</span>`
                ).join(' &rsaquo; ');

                // 2. Texto Completo (Vertical, expandido)
                const fullHtml = parents.map(p => 
                    `<div style="margin: 2px 0;"><strong>${p.code}</strong> ${p.desc}</div>`
                ).join('<div style="color:var(--border); text-align:center; line-height:10px;">↓</div>');

                // Cria o elemento DIV
                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = shortHtml; // Começa curto
                breadcrumbDiv.title = "Clique para ver hierarquia completa";
                
                // EVENTO DE CLIQUE (A Mágica)
                breadcrumbDiv.onclick = (e) => {
                    e.stopPropagation(); // Não ativa cliques do card pai se houver
                    
                    // Se estiver curto, expande
                    if (breadcrumbDiv.innerHTML === shortHtml) {
                        breadcrumbDiv.innerHTML = fullHtml;
                        breadcrumbDiv.style.whiteSpace = "normal"; // Permite quebra de linha
                        breadcrumbDiv.style.overflow = "visible";
                        breadcrumbDiv.style.borderBottom = "1px solid var(--border)";
                        breadcrumbDiv.style.paddingBottom = "8px";
                        breadcrumbDiv.style.marginBottom = "8px";
                    } 
                    // Se estiver expandido, recolhe
                    else {
                        breadcrumbDiv.innerHTML = shortHtml;
                        breadcrumbDiv.style.whiteSpace = "nowrap"; // Volta para linha única
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

    // --- 6. FUNÇÕES AUXILIARES ---
    
    // Encontra os pais baseados na lógica decimal (ex: 331 -> pai 330 -> pai 300)
    function getParents(code) {
        const potentialParents = [];
        
        // Regra geral para CDD/CDU decimal
        if (code.length >= 3) potentialParents.push(code.charAt(0) + "00"); // Centena (300)
        if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.push(code.substring(0, 2) + "0"); // Dezena (330)
        if (code.includes('.')) potentialParents.push(code.split('.')[0]); // Antes do ponto
        
        // Remove duplicatas e o próprio código da lista de pais
        return [...new Set(potentialParents)]
            .filter(p => p !== code)
            .map(p => dadosAtivos.find(d => d.code === p)) // Busca o objeto real no banco
            .filter(Boolean) // Remove undefined se não achar
            .sort((a, b) => a.code.length - b.code.length); // Ordena do mais geral para o específico
    }

    // Corta texto longo
    function truncate(str, n = 20) {
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
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

    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
