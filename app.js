document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]'); // Os botões de troca
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO DA BASE ---
    // Começa com CDD por padrão, ou vazio se der erro
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    // Verificação de Segurança
    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro Crítico: Variáveis baseCDD ou baseCDU não encontradas no dados.js.</div>';
        return;
    }

    // --- 2. EVENTO DE TROCA (CDD <-> CDU) ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = ''; // Limpa a busca ao trocar
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU;
                searchInput.placeholder = "Buscar na CDU...";
            } else {
                dadosAtivos = baseCDD;
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

    // --- 4. BUSCA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        // Pesquisa na lista que estiver ativa no momento (dadosAtivos)
        const results = dadosAtivos.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    // --- 5. EXIBIÇÃO ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nenhum código encontrado nesta base.</div>';
            return;
        }
        const fragment = document.createDocumentFragment();
        
        // Verifica qual base está selecionada para escrever na etiqueta
        const currentDbName = document.querySelector('input[name="database"]:checked').value.toUpperCase();

        results.forEach(item => {
            const mainClass = item.code.charAt(0);
            const card = document.createElement('div');
            
            // Usa cor neutra se o código não começar com número (comum na CDU ex: "34(81)")
            const colorClass = isNaN(mainClass) ? '0' : mainClass;
            card.className = `level-card class-${colorClass}`;
            
            // Breadcrumb Clicável
            const breadcrumbData = getBreadcrumbData(item.code);
            let breadcrumbElement = document.createElement('span');
            if (breadcrumbData) {
                breadcrumbElement.className = 'breadcrumb';
                breadcrumbElement.innerHTML = breadcrumbData.short;
                breadcrumbElement.title = "Clique para expandir";
                breadcrumbElement.onclick = function() {
                    this.innerHTML = this.innerHTML.includes('...') ? breadcrumbData.full : breadcrumbData.short;
                };
            }

            // Highlight
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Montagem
            card.innerHTML = `
                <span class="level-tag">${currentDbName} CLASSE ${mainClass}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;
            
            // Insere o breadcrumb via DOM (para preservar o evento onclick)
            if (breadcrumbData) {
                card.querySelector('.level-content').prepend(breadcrumbElement);
            }

            fragment.appendChild(card);
        });
        resultsArea.appendChild(fragment);
    }

    // --- 6. HIERARQUIA INTELIGENTE ---
    function getBreadcrumbData(code) {
        if (!code) return null;
        const parents = new Set();
        
        // Lógica Genérica (Funciona bem para CDD e razoável para CDU simples)
        if (code.length >= 3) parents.add(code.charAt(0) + "00"); // Centena
        if (code.length >= 3 && !isNaN(code.substring(0,2))) parents.add(code.substring(0, 2) + "0"); // Dezena
        if (code.includes('.')) parents.add(code.split('.')[0]); // Antes do ponto
        
        parents.delete(code);
        
        // Busca os pais na lista ATIVA
        const parentItems = Array.from(parents).sort().map(p => dadosAtivos.find(d => d.code === p)).filter(Boolean);
        
        if (parentItems.length === 0) return null;

        const shortText = parentItems.map(p => `${p.code} ${p.desc.split(' ')[0]}...`).join(' &rsaquo; ');
        const fullText = parentItems.map(p => `${p.code} ${p.desc}`).join(' &rsaquo; ');

        return { short: shortText, full: fullText };
    }

    // --- EVENTOS ---
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
