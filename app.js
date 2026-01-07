document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');

    // --- 1 LÓGICA DE BUSCA ---
    function performSearch() {
        // Pega o texto, remove espaços extras e converte para minúsculo
        const query = searchInput.value.trim().toLowerCase();
        
        // Normaliza para ignorar acentos (ex: 'história' vira 'historia')
        const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Mostra ou esconde o botão "X"
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        // Filtra os dados (procura no código ou na descrição)
        const results = dados.filter(item => {
            const itemCode = item.code.toLowerCase();
            const itemDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Permite buscar por palavras parciais (ex: "dir const" acha "Direito Constitucional")
            return itemCode.includes(normalizedQuery) || itemDesc.includes(normalizedQuery);
        });

        displayResults(results, query);
    }

    // --- 2 EXIBIR RESULTADOS ---
    function displayResults(results, originalQuery) {
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nenhum código encontrado.</div>';
            return;
        }

        let html = '';
        results.forEach(item => {
            // Define a cor baseada no primeiro dígito
            const mainClass = item.code.charAt(0);
            
            html += `
                <div class="level-card class-${mainClass}">
                    <span class="level-tag">Classe ${mainClass}00</span>
                    <div class="level-content">
                        <span class="level-code">${item.code}</span>
                        <span class="level-desc">${highlightTerm(item.desc, originalQuery)}</span>
                    </div>
                </div>
            `;
        });

        resultsArea.innerHTML = html;
    }

    // Função auxiliar para grifar o texto encontrado
    function highlightTerm(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // --- 3 EVENTOS ---
    
    // Ao digitar
    searchInput.addEventListener('input', performSearch);

    // Botão Limpar (X)
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        performSearch();
    });

    // *** Tecla ESC e Atalho '/' ***
    document.addEventListener('keydown', (e) => {
        // Se apertar ESC, limpa a busca
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.focus();
            performSearch();
        }
        // Atalho: se apertar "/" foca na busca (se já não estiver nela)
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // --- 4 MODO ESCURO ---
    // Verifica memória
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeBtn) themeBtn.textContent = '☀️';
    }

    // Botão de troca
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

    // --- 5 REGISTRO PWA (Service Worker) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => console.log('SW registrado:', registration.scope))
                .catch(err => console.log('SW falhou:', err));
        });
    }

});
