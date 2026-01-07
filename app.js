document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    let debounceTimer;

    // --- 1. VERIFICAÇÃO DE DADOS ---
    if (typeof dados === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: dados.js não carregado.</div>';
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
            const itemCode = item.code.toLowerCase();
            const itemDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return itemCode.includes(normalizedQuery) || itemDesc.includes(normalizedQuery);
        });

        displayResults(results, normalizedQuery);
    }

    // --- 4. EXIBIR RESULTADOS ---
    function displayResults(results, normalizedQuery) {
        resultsArea.innerHTML = ''; 

        if (results.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'Nenhum código encontrado.';
            resultsArea.appendChild(emptyState);
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach(item => {
            const mainClass = item.code.charAt(0);
            
            const card = document.createElement('div');
            card.className = `level-card class-${mainClass}`;

            const tag = document.createElement('span');
            tag.className = 'level-tag';
            tag.textContent = `Classe ${mainClass}00`;

            const content = document.createElement('div');
            content.className = 'level-content';

            // --- BREADCRUMB (HIERARQUIA) CORRIGIDO ---
            // Mostra o caminho (ex: 000 > 001 > 001.9...)
            const hierarchy = getBreadcrumb(item.code);
            if (hierarchy) {
                const breadcrumbSpan = document.createElement('span');
                breadcrumbSpan.className = 'breadcrumb';
                breadcrumbSpan.innerHTML = hierarchy; // Insere o caminho formatado
                content.appendChild(breadcrumbSpan);
            }

            // Código
            const codeSpan = document.createElement('span');
            codeSpan.className = 'level-code';
            codeSpan.textContent = item.code;

            // Descrição
            const descSpan = document.createElement('span');
            descSpan.className = 'level-desc';
            descSpan.innerHTML = highlightTerm(item.desc, normalizedQuery);

            content.appendChild(codeSpan);
            content.appendChild(descSpan);
            card.appendChild(tag);
            card.appendChild(content);
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- FUNÇÃO DE HIERARQUIA REVISADA ---
    function getBreadcrumb(currentCode) {
        if (!currentCode) return '';
        const parents = new Set();
        const c = currentCode;

        // 1. Classe Principal (Centena): ex "500" para "512"
        if (c.length >= 3) {
            parents.add(c.charAt(0) + "00");
        }

        // 2. Divisão (Dezena): ex "510" para "512"
        if (c.length >= 3 && c.charAt(1) !== '0') {
            parents.add(c.substring(0, 2) + "0");
        }

        // 3. Seção (Unidade): ex "512" (se tiver decimais depois)
        if (c.includes('.')) {
            parents.add(c.split('.')[0]); // Pega tudo antes do ponto
        }

        // 4. Decimais Intermediários: ex "001.9" para "001.94"
        if (c.includes('.')) {
            let parts = c.split('.');
            let prefix = parts[0] + '.';
            let decimals = parts[1];
            // Vai montando casa por casa (001.9, 001.94...)
            for (let i = 1; i < decimals.length; i++) {
                parents.add(prefix + decimals.substring(0, i));
            }
        }

        // Remove o próprio código da lista de pais
        parents.delete(currentCode);

        // Transforma os códigos encontrados em texto
        // Só exibe se o código "pai" existir no arquivo dados.js
        const trail = Array.from(parents)
            .sort()
            .map(parentCode => {
                const found = dados.find(d => d.code === parentCode);
                // Retorna apenas o código e a primeira palavra para economizar espaço
                return found ? `${found.code} ${found.desc.split(' ')[0]}...` : null; 
            })
            .filter(item => item !== null); // Remove os nulos (pais não encontrados na base)

        if (trail.length === 0) return '';
        
        // Retorna com setinha (>)
        return trail.join(' &rsaquo; ');
    }

    function highlightTerm(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // --- EVENTOS ---
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
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // --- MODO ESCURO ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeBtn) themeBtn.textContent = '☀️';
    }

    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeBtn.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.textContent = '☀️';
            }
        });
    }

    // --- PWA ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
    }
});
