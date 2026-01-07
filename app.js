document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    let dados = []; 
    let debounceTimer;

    // --- 1. CARREGAR DADOS (JSON) ---
    fetch('./dados.json')
        .then(response => response.json())
        .then(json => { dados = json; })
        .catch(() => {
            resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: dados.json não encontrado ou inválido.</div>';
        });

    // --- 2. CONTROLE DE DIGITAÇÃO ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 3. LÓGICA DE BUSCA ---
    function performSearch(query) {
        if (!dados.length) return;
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

    // --- 4. EXIBIR RESULTADOS ---
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
            
            // Breadcrumb
            const hierarchy = getBreadcrumb(item.code);
            let breadcrumbHtml = hierarchy ? `<span class="breadcrumb">${hierarchy}</span>` : '';

            // Highlight
            const regex = new RegExp(`(${q})`, 'gi');
            const highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>');

            card.innerHTML = `
                <span class="level-tag">Classe ${mainClass}00</span>
                <div class="level-content">
                    ${breadcrumbHtml}
                    <span class="level-code">${item.code}</span>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;
            fragment.appendChild(card);
        });
        resultsArea.appendChild(fragment);
    }

    // --- 5. HIERARQUIA ---
    function getBreadcrumb(code) {
        if (!code || !dados.length) return '';
        const parents = new Set();
        // Lógica de pais: 500 -> 510 -> 512 -> 512.x
        if (code.length >= 3) parents.add(code.charAt(0) + "00");
        if (code.length >= 3 && code.charAt(1) !== '0') parents.add(code.substring(0, 2) + "0");
        if (code.includes('.')) {
            parents.add(code.split('.')[0]);
            let parts = code.split('.'), pre = parts[0] + '.', dec = parts[1];
            for (let i = 1; i < dec.length; i++) parents.add(pre + dec.substring(0, i));
        }
        parents.delete(code);
        
        const trail = Array.from(parents).sort().map(p => {
            const f = dados.find(d => d.code === p);
            return f ? `${f.code} ${f.desc.split(' ')[0]}...` : null;
        }).filter(Boolean);
        
        return trail.join(' &rsaquo; ');
    }

    // --- EVENTOS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { searchInput.value = ''; searchInput.focus(); handleInput(); }
        if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    });
    
    // Tema
    const themeBtn = document.getElementById('themeBtn');
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // PWA
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
