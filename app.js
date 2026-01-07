document.addEventListener('DOMContentLoaded', () => {
    
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    let debounceTimer;

    // --- 1. VERIFICAÇÃO ---
    if (typeof dados === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivo dados.js não carregado.</div>';
        return;
    }

    // --- 2. CONTROLE DE DIGITAÇÃO ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 3. LÓGICA DE BUSCA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        const results = dados.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    // --- 4. EXIBIR RESULTADOS (COM CLIQUE NA HIERARQUIA) ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nenhum código encontrado.</div>';
            return;
        }
        const fragment = document.createDocumentFragment();
        
        results.forEach(item => {
            const mainClass = item.code.charAt(0);
            const card = document.createElement('div');
            card.className = `level-card class-${mainClass}`;
            
            // --- CRIAÇÃO DA HIERARQUIA CLICÁVEL ---
            // Pega o objeto com texto curto e longo
            const breadcrumbData = getBreadcrumbData(item.code);
            let breadcrumbElement = document.createElement('span'); // Elemento vazio por padrão
            
            if (breadcrumbData) {
                breadcrumbElement.className = 'breadcrumb';
                breadcrumbElement.innerHTML = breadcrumbData.short; // Começa com o curto
                breadcrumbElement.title = "Clique para expandir o caminho completo";
                
                // Evento de clique para alternar
                breadcrumbElement.onclick = function() {
                    // Se o texto atual contém "..." (é o curto), troca pelo longo. Senão, volta pro curto.
                    if (this.innerHTML.includes('...')) {
                        this.innerHTML = breadcrumbData.full;
                    } else {
                        this.innerHTML = breadcrumbData.short;
                    }
                };
            }

            // Highlight da descrição
            const regex = new RegExp(`(${q})`, 'gi');
            const highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>');

            // Montagem do Card (Usando appendChild para o breadcrumb funcionar o evento)
            const tag = document.createElement('span');
            tag.className = 'level-tag';
            tag.textContent = `Classe ${mainClass}00`;

            const content = document.createElement('div');
            content.className = 'level-content';
            
            // Adiciona o breadcrumb se existir
            if (breadcrumbData) {
                content.appendChild(breadcrumbElement);
            }

            // Resto do conteúdo (Código e Descrição)
            const codeDiv = document.createElement('div');
            codeDiv.className = 'level-header';
            codeDiv.innerHTML = `<span class="level-code">${item.code}</span>`;
            
            const descSpan = document.createElement('span');
            descSpan.className = 'level-desc';
            descSpan.innerHTML = highlightedDesc;

            content.appendChild(codeDiv);
            content.appendChild(descSpan);
            
            card.appendChild(tag);
            card.appendChild(content);
            fragment.appendChild(card);
        });
        resultsArea.appendChild(fragment);
    }

    // --- 5. HIERARQUIA (Retorna Objeto Curto/Longo) ---
    function getBreadcrumbData(code) {
        if (!code) return null;
        const parents = new Set();
        
        // Regras de pais
        if (code.length >= 3) parents.add(code.charAt(0) + "00");
        if (code.length >= 3 && code.charAt(1) !== '0') parents.add(code.substring(0, 2) + "0");
        if (code.includes('.')) {
            parents.add(code.split('.')[0]);
            let parts = code.split('.'), pre = parts[0] + '.', dec = parts[1];
            for (let i = 1; i < dec.length; i++) parents.add(pre + dec.substring(0, i));
        }
        parents.delete(code);
        
        // Busca os pais na base
        const parentItems = Array.from(parents).sort().map(p => dados.find(d => d.code === p)).filter(Boolean);
        
        if (parentItems.length === 0) return null;

        // Gera versão curta (com reticências)
        const shortText = parentItems.map(p => {
            const firstWord = p.desc.split(' ')[0]; // Pega só a primeira palavra
            return `${p.code} ${firstWord}...`;
        }).join(' &rsaquo; ');

        // Gera versão completa
        const fullText = parentItems.map(p => {
            return `${p.code} ${p.desc}`;
        }).join(' &rsaquo; ');

        return { short: shortText, full: fullText };
    }

    // --- EVENTOS E TEMA ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { searchInput.value = ''; searchInput.focus(); handleInput(); }
        if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    });
    
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});