document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    let debounceTimer; // Controle de tempo para a digitação

    // --- 1 CONTROLE DE DIGITAÇÃO (DEBOUNCE) ---
    function handleInput() {
        // Mostra o botão X imediatamente
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        // Cancela a busca anterior se o usuário ainda estiver digitando
        clearTimeout(debounceTimer);

        // Espera 300ms antes de processar a busca (Performance)
        debounceTimer = setTimeout(() => {
            performSearch(query);
        }, 300); 
    }

    // --- 2 LÓGICA DE BUSCA ---
    function performSearch(query) {
        // Normaliza texto (remove acentos e põe em minúsculo)
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        // Filtra a lista 'dados' (carregada do dados.js)
        const results = dados.filter(item => {
            const itemCode = item.code.toLowerCase();
            const itemDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            return itemCode.includes(normalizedQuery) || itemDesc.includes(normalizedQuery);
        });

        displayResults(results, normalizedQuery);
    }

    // --- 3. EXIBIR RESULTADOS ---
    function displayResults(results, normalizedQuery) {
        resultsArea.innerHTML = ''; // Limpa a área

        if (results.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'Nenhum código encontrado.';
            resultsArea.appendChild(emptyState);
            return;
        }

        // Fragmento para melhorar performance (insere tudo de uma vez)
        const fragment = document.createDocumentFragment();

        results.forEach(item => {
            const mainClass = item.code.charAt(0);
            
            // Cria o Cartão
            const card = document.createElement('div');
            card.className = `level-card class-${mainClass}`;

            // Cria a Tag (ex: CLASSE 300)
            const tag = document.createElement('span');
            tag.className = 'level-tag';
            tag.textContent = `Classe ${mainClass}00`;

            // Cria o Conteúdo
            const content = document.createElement('div');
            content.className = 'level-content';

            // --- Linha do Código + Botão Copiar ---
            const codeHeader = document.createElement('div');
            codeHeader.style.display = 'flex';
            codeHeader.style.justifyContent = 'space-between';
            codeHeader.style.alignItems = 'center';

            const codeSpan = document.createElement('span');
            codeSpan.className = 'level-code';
            codeSpan.textContent = item.code;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn'; // Requer CSS simples
            copyBtn.innerHTML = '📋'; // Ícone
            copyBtn.title = 'Copiar código';
            copyBtn.style.border = 'none';
            copyBtn.style.background = 'transparent';
            copyBtn.style.cursor = 'pointer';
            
            // Ação de Copiar
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(item.code);
                copyBtn.innerHTML = '✅'; // Feedback visual
                setTimeout(() => copyBtn.innerHTML = '📋', 1500);
            };

            codeHeader.appendChild(codeSpan);
            codeHeader.appendChild(copyBtn);

            // Descrição com Highlight
            const descSpan = document.createElement('span');
            descSpan.className = 'level-desc';
            descSpan.innerHTML = highlightTerm(item.desc, normalizedQuery);

            // Monta o card
            content.appendChild(codeHeader);
            content.appendChild(descSpan);
            card.appendChild(tag);
            card.appendChild(content);
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // Função auxiliar para grifar o termo
    function highlightTerm(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // --- 4 EVENTOS ---
    searchInput.addEventListener('input', handleInput);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        handleInput();
    });

    // Tecla ESC e Atalho '/'
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

    // --- 5 MODO ESCURO ---
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

    // --- 6 REGISTRO PWA ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => console.log('SW registrado:', registration.scope))
                .catch(err => console.log('SW falhou:', err));
        });
    }
});
