document.addEventListener('DOMContentLoaded', () => {
    const tabs = { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') };
    const views = { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') };
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const browseList = document.getElementById('browseList');
    const browseBreadcrumb = document.getElementById('browseBreadcrumb');
    const clearBtn = document.getElementById('clearBtn');
    // NOVO ELEMENTO
    const historyContainer = document.getElementById('searchHistory');

    let currentBrowsePath = []; 

    // --- CARREGAR HISTÓRICO AO INICIAR ---
    renderHistory();

    // --- SINCRONIZAÇÃO ---
    document.querySelectorAll('input[name^="dbType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            const searchRadio = document.querySelector(`input[name="dbTypeSearch"][value="${val}"]`);
            const browseRadio = document.querySelector(`input[name="dbTypeBrowse"][value="${val}"]`);
            if(searchRadio) searchRadio.checked = true;
            if(browseRadio) browseRadio.checked = true;
            
            currentBrowsePath = [];
            if (views.browse.style.display === 'block') renderBrowse();
            if (searchInput.value) performSearch(searchInput.value);
        });
    });

    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    function switchView(viewName) {
        Object.keys(views).forEach(v => {
            views[v].style.display = (v === viewName) ? 'block' : 'none';
            tabs[v].classList.toggle('active', v === viewName);
        });
        if (viewName === 'browse') renderBrowse();
    }

    function getCurrentType() {
        const el = document.querySelector('input[name="dbTypeSearch"]:checked');
        return el ? el.value : 'cdd';
    }

    // --- HISTÓRICO DE BUSCA (NOVO) ---
    function saveToHistory(term) {
        if (!term || term.length < 3) return; // Só salva termos relevantes
        
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        // Remove se já existir para colocar no topo
        history = history.filter(h => h !== term);
        // Adiciona no início
        history.unshift(term);
        // Mantém apenas os últimos 5
        history = history.slice(0, 5);
        
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        historyContainer.innerHTML = '';
        
        if (history.length === 0) return;

        const label = document.createElement('div');
        label.style.width = '100%';
        label.style.fontSize = '12px';
        label.style.color = '#94a3b8';
        label.style.marginBottom = '4px';
        label.innerText = 'Recentes:';
        historyContainer.appendChild(label);

        history.forEach(term => {
            const tag = document.createElement('span');
            tag.className = 'history-tag';
            tag.innerText = term;
            tag.onclick = () => {
                searchInput.value = term;
                performSearch(term);
            };
            historyContainer.appendChild(tag);
        });
    }

    // --- PROCURA ---
    function performSearch(q) {
        const type = getCurrentType();
        const activeDB = (type === 'cdu') ? baseCDU : baseCDD;
        
        if (!q || q.trim() === '') { resultsArea.innerHTML = '<div class="empty-state">Introduza um termo.</div>'; return; }

        // Salva no histórico se o usuário parou de digitar (debounce simples visual)
        // Na prática, vamos salvar apenas quando tiver resultados relevantes
        
        const normalizedQuery = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const stopWords = ['de', 'do', 'da', 'e', 'a', 'o', 'em', 'para', 'com', 'no', 'na', 'dos', 'das'];
        const terms = normalizedQuery.split(' ').filter(t => t.length > 0 && !stopWords.includes(t));

        if (terms.length === 0) { resultsArea.innerHTML = '<div class="empty-state">Seja mais específico.</div>'; return; }

        let found = activeDB.filter(i => {
            const cleanDesc = i.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cleanCode = i.code.toLowerCase();
            return terms.every(term => cleanCode.includes(term) || cleanDesc.includes(term));
        }).map(i => ({ ...i, path: getParents(i.code, activeDB, type) }));

        found.sort((a, b) => {
            const aCodeMatch = a.code.toLowerCase() === normalizedQuery;
            const bCodeMatch = b.code.toLowerCase() === normalizedQuery;
            if (aCodeMatch && !bCodeMatch) return -1;
            if (!aCodeMatch && bCodeMatch) return 1;
            return a.code.length - b.code.length;
        });

        renderResultsUI(found, terms, type.toUpperCase());
    }

    function renderResultsUI(results, terms, label) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Nada encontrado.</div>';
        const highlightRegex = new RegExp(`(${terms.join('|')})`, 'gi');

        results.slice(0, 50).forEach(item => {
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div'); 
            card.className = `level-card class-${color}`;
            
            // Ao clicar num resultado, salva a busca no histórico!
            card.onclick = () => saveToHistory(document.getElementById('searchInput').value);

            const pathHTML = item.path && item.path.length ? `<div class="breadcrumb">📂 ${item.path.map(p => `<b>${p.code}</b> ${p.desc}`).join(' › ')}</div>` : '';
            const highlightedDesc = item.desc.replace(highlightRegex, '<mark>$1</mark>');

            card.innerHTML = `${pathHTML}<div class="level-tag">${label}</div><div class="level-code">${item.code}</div><div class="level-desc">${highlightedDesc}</div>`;
            resultsArea.appendChild(card);
        });
    }

    // ... (Resto do código de Navegação e Parents igual ao anterior) ...
    function renderBrowse() {
        const type = getCurrentType();
        const activeDB = (type === 'cdu') ? baseCDU : baseCDD;
        const parentCode = currentBrowsePath.length > 0 ? currentBrowsePath[currentBrowsePath.length - 1].code : '';
        const children = findChildren(parentCode, activeDB, type);
        renderBrowseUI(children, activeDB, type);
    }

    function findChildren(parent, db, type) {
        return db.filter(item => {
            if (item.code === parent) return false;
            if (type === 'cdd') {
                if (parent === '') return item.code.length === 3 && item.code.endsWith('00');
                if (parent.endsWith('00')) return item.code.startsWith(parent.charAt(0)) && item.code.endsWith('0') && item.code.length === 3;
                if (parent.endsWith('0') && !parent.endsWith('00')) return item.code.startsWith(parent.substring(0, 2)) && !item.code.endsWith('0') && !item.code.includes('.');
                return item.code.startsWith(parent + '.');
            } else {
                if (parent === '') return /^\d$/.test(item.code) || item.code.startsWith('(') || item.code.startsWith('"') || item.code.startsWith('=');
                if (!item.code.startsWith(parent)) return false;
                const isGrandChild = db.some(other => other.code !== parent && other.code !== item.code && other.code.startsWith(parent) && item.code.startsWith(other.code));
                return !isGrandChild;
            }
        }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    function renderBrowseUI(items, activeDB, type) {
        browseBreadcrumb.innerHTML = '';
        const home = document.createElement('span'); home.className = 'crumb'; home.innerText = '🏠 Início';
        home.onclick = () => { currentBrowsePath = []; renderBrowse(); };
        browseBreadcrumb.appendChild(home);
        currentBrowsePath.forEach((step, i) => {
            browseBreadcrumb.appendChild(document.createTextNode(' › '));
            const span = document.createElement('span'); span.className = 'crumb'; 
            span.innerText = `${step.code} ${step.desc}`; 
            span.onclick = () => { currentBrowsePath = currentBrowsePath.slice(0, i + 1); renderBrowse(); };
            browseBreadcrumb.appendChild(span);
        });
        browseList.innerHTML = items.length ? '' : '<div class="empty-state">Fim da hierarquia.</div>';
        items.forEach(item => {
            const hasKids = findChildren(item.code, activeDB, type).length > 0;
            const div = document.createElement('div'); div.className = 'folder-item';
            div.innerHTML = `<span style="margin-right:10px">${hasKids ? '📁' : '📄'}</span> <div><b>${item.code}</b> <span>${item.desc}</span></div>`;
            div.onclick = () => {
                if (hasKids) { currentBrowsePath.push(item); renderBrowse(); }
                else { switchView('search'); searchInput.value = item.code; performSearch(item.code); }
            };
            browseList.appendChild(div);
        });
    }

    function getParents(code, db, type) {
        const parents = [];
        for (let i = 1; i < code.length; i++) {
            const prefix = code.substring(0, i).replace(/\.$/, '');
            const match = db.find(d => d.code === prefix);
            if (match) parents.push(match);
        }
        if (type === 'cdd' && code.length >= 3) {
            const hundred = code.charAt(0) + '00';
            const match = db.find(d => d.code === hundred);
            if (match && !parents.includes(match) && match.code !== code) parents.unshift(match);
        }
        return [...new Set(parents)].sort((a,b) => a.code.length - b.code.length);
    }

    searchInput.oninput = (e) => { 
        clearBtn.style.display = e.target.value ? 'block' : 'none'; 
        performSearch(e.target.value); 
    };

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveToHistory(searchInput.value); // Salva ao dar Enter
        if (e.key === 'Escape') { e.preventDefault(); searchInput.value = ''; performSearch(''); clearBtn.style.display = 'none'; searchInput.focus(); }
    });

    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); searchInput.focus(); clearBtn.style.display = 'none'; };
    
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
});
