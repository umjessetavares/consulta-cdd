document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    
    // Variável que guardará os dados baixados do JSON
    let dados = []; 
    let debounceTimer;

    // --- 0. CARREGAMENTO DOS DADOS (JSON) ---
    fetch('./dados.json')
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar JSON");
            return response.json();
        })
        .then(json => {
            dados = json;
            console.log('Base de dados CDD carregada com sucesso.');
        })
        .catch(erro => {
            console.error(erro);
            resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro ao carregar dados. Recarregue a página.</div>';
        });

    // --- 1. CONTROLE DE DIGITAÇÃO ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        
        clearTimeout(debounceTimer);
        // Espera 300ms antes de buscar
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 2. LÓGICA DE BUSCA ---
    function performSearch(query) {
        if (!dados || dados.length === 0) return; // Proteção caso JSON não tenha carregado

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

    // --- 3. EXIBIR RESULTADOS (COM HIERARQUIA) ---
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

            // Tag da Classe
            const tag = document.createElement('span');
            tag.className = 'level-tag';
            tag.textContent = `Classe ${mainClass}00`;

            const content = document.createElement('div');
            content.className = 'level-content';

            // --- BREADCRUMB (Hierarquia) ---
            const hierarchy = getBreadcrumb(item.code);
            if (hierarchy) {
                const breadcrumbSpan = document.createElement('span');
                breadcrumbSpan.className = 'breadcrumb';
                breadcrumbSpan.innerHTML = hierarchy;
                content.appendChild(breadcrumbSpan);
            }

            // Cabeçalho (Código + Botão Copiar)
            const codeHeader = document.createElement('div');
            codeHeader.style.display = 'flex';
            codeHeader.style.justifyContent = 'space-between';
            codeHeader.style.alignItems = 'center';

            const codeSpan = document.createElement('span');
            codeSpan.className = 'level-code';
            codeSpan.textContent = item.code;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '📋';
            copyBtn.title = 'Copiar código';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(item.code);
                copyBtn.innerHTML = '✅';
                setTimeout(() => copyBtn.innerHTML = '📋', 1500);
            };

            codeHeader.appendChild(codeSpan);
            codeHeader.appendChild(copyBtn);

            // Descrição com Highlight
            const descSpan = document.createElement('span');
            descSpan.className = 'level-desc';
            descSpan.innerHTML = highlightTerm(item.desc, normalizedQuery);

            content.appendChild(codeHeader);
            content.appendChild(descSpan);
            card.appendChild(tag);
            card.appendChild(content);
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- FUNÇÃO AUXILIAR: Monta a trilha (000 > 001...) ---
    function getBreadcrumb(currentCode) {
        if (!currentCode) return '';
        const parents = new Set();
        
        // Regra 1: Classe Principal (ex: 500)
        if (currentCode.length >= 3) parents.add(currentCode.charAt(0) + "00");
        
        // Regra 2: Divisão Inteira (ex: 512)
        if (currentCode.length > 3) parents.add(currentCode.substring(0, 3));

        // Regra 3: Decimais (ex: 001.9 para 001.94)
        if (currentCode.includes('.')) {
            let parts = currentCode.split('.');
            let prefix = parts[0] + '.';
            let decimals = parts[1];
            for (let i = 1; i < decimals.length; i++) {
                parents.add(prefix + decimals.substring(0, i));
            }
        }

        parents.delete(currentCode); // Remove a si mesmo

        // Busca no JSON carregado
        const trail = Array.from(parents).sort().map(c => {
            const found = dados.find(d => d.code === c);
            // Pega só a primeira palavra da descrição para não ficar gigante
            return found ? `${found.code} ${found.desc.split(' ')[0]}...` : null; 
        }).filter(item => item !== null);

        if (trail.length === 0) return '';
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
