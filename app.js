document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    
    // Variável de controle de tempo (para não travar a busca)
    let debounceTimer;

    // --- 1. SEGURANÇA: Verifica se a base de dados carregou ---
    if (typeof dados === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro Crítico: A base de dados não foi carregada. Verifique o arquivo dados.js.</div>';
        return;
    }

    // --- 2. INPUT COM "DEBOUNCE" (Melhoria de Busca) ---
    function handleInput() {
        const query = searchInput.value.trim();
        
        // Mostra/Esconde o botão X
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        
        // Cancela a busca anterior se você ainda estiver digitando
        clearTimeout(debounceTimer);
        
        // Espera 300ms antes de buscar de verdade (Performance)
        debounceTimer = setTimeout(() => {
            performSearch(query);
        }, 300); 
    }

    // --- 3. LÓGICA DE BUSCA ---
    function performSearch(query) {
        // Normaliza (remove acentos e põe em minúsculo)
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        const results = dados.filter(item => {
            const itemCode = item.code.toLowerCase();
            const itemDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Busca tanto no código quanto na descrição
            return itemCode.includes(normalizedQuery) || itemDesc.includes(normalizedQuery);
        });

        displayResults(results, normalizedQuery);
    }

    // --- 4. EXIBIR RESULTADOS ---
    function displayResults(results, query) {
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

            // --- MELHORIA: Hierarquia (Breadcrumb) ---
            const hierarchy = getBreadcrumb(item.code);
            let breadcrumbHtml = '';
            if (hierarchy) {
                breadcrumbHtml = `<span class="breadcrumb">${hierarchy}</span>`;
            }

            // --- MELHORIA: Highlight (Grifar termo) ---
            // Cria um Regex seguro para grifar o termo digitado
            let descHtml = item.desc;
            if (query) {
                try {
                    const regex = new RegExp(`(${query})`, 'gi'); // 'gi' = global e case-insensitive
                    descHtml = item.desc.replace(regex, '<mark>$1</mark>');
                } catch (e) {
                    // Se o usuário digitar caracteres especiais regex inválidos, ignora o highlight
                    descHtml = item.desc; 
                }
            }

            card.innerHTML = `
                <span class="level-tag">Classe ${mainClass}00</span>
                <div class="level-content">
                    ${breadcrumbHtml}
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${descHtml}</span>
                </div>
            `;
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 5. FUNÇÃO DE HIERARQUIA (Contexto) ---
    function getBreadcrumb(currentCode) {
        if (!currentCode) return '';
        const parents = new Set();
        const c = currentCode;

        // Regra 1: Classe Principal (ex: 500)
        if (c.length >= 3) parents.add(c.charAt(0) + "00");
        
        // Regra 2: Divisão Inteira (ex: 510) - Só adiciona se não for zero
        if (c.length >= 3 && c.charAt(1) !== '0') parents.add(c.substring(0, 2) + "0");
        
        // Regra 3: Seção Inteira (ex: 512)
        if (c.includes('.')) parents.add(c.split('.')[0]);

        // Regra 4: Decimais (ex: 001.9 para 001.94)
        if (c.includes('.')) {
            let parts = c.split('.');
            let prefix = parts[0] + '.';
            let decimals = parts[1];
            for (let i = 1; i < decimals.length; i++) {
                parents.add(prefix + decimals.substring(0, i));
            }
        }

        parents.delete(currentCode); // Remove o próprio item

        // Busca os nomes dos pais na base de dados
        const trail = Array.from(parents).sort().map(p => {
            const found = dados.find(d => d.code === p);
            // Pega só a primeira palavra para não ocupar muito espaço
            return found ? `${found.code} ${found.desc.split(' ')[0]}...` : null; 
        }).filter(item => item !== null);

        if (trail.length === 0) return '';
        return trail.join(' &rsaquo; ');
    }

    // --- 6. EVENTOS ---
    searchInput.addEventListener('input', handleInput);
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        handleInput();
    });

    // Tecla ESC limpa, Barra (/) foca
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

    // --- 7. MODO ESCURO ---
    if (localStorage.getItem('theme') === 'dark') {
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

    // --- 8. REGISTRO PWA ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js');
        });
    }
});