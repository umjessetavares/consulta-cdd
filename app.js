document.addEventListener('DOMContentLoaded', () => {
    const tabs = { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') };
    const views = { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') };
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const browseList = document.getElementById('browseList');
    const browseBreadcrumb = document.getElementById('browseBreadcrumb');
    const clearBtn = document.getElementById('clearBtn');

    let currentBrowsePath = []; 

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

    // --- NAVEGAÇÃO ---
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
        const home = document.createElement('span'); 
        home.className = 'crumb'; 
        home.innerText = '🏠 Início';
        home.onclick = () => { currentBrowsePath = []; renderBrowse(); };
        browseBreadcrumb.appendChild(home);

        currentBrowsePath.forEach((step, i) => {
            browseBreadcrumb.appendChild(document.createTextNode(' › '));
            const span = document.createElement('span'); 
            span.className = 'crumb'; 
            
            // --- MUDANÇA AQUI: Removi o "truncate" ---
            // Agora exibe o Código + Nome completo
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

    // --- PROCURA ---
    function performSearch(q) {
        const type = getCurrentType();
        const activeDB = (type === 'cdu') ? baseCDU : baseCDD;
        const query = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!q) { resultsArea.innerHTML = '<div class="empty-state">Introduza um termo.</div>'; return; }
        const found = activeDB.filter(i => {
            const cleanDesc = i.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return i.code.toLowerCase().includes(query) || cleanDesc.includes(query);
        }).map(i => ({ ...i, path: getParents(i.code, activeDB, type) }));
        renderResultsUI(found, query, type.toUpperCase());
    }

    function renderResultsUI(results, q, label) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Nada encontrado.</div>';
        results.slice(0, 50).forEach(item => {
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div'); card.className = `level-card class-${color}`;
            const pathHTML = item.path && item.path.length ? `<div class="breadcrumb">📂 ${item.path.map(p => `<b>${p.code}</b> ${p.desc}`).join(' › ')}</div>` : '';
            card.innerHTML = `${pathHTML}<div class="level-tag">${label}</div><div class="level-code">${item.code}</div><div class="level-desc">${item.desc.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')}</div>`;
            resultsArea.appendChild(card);
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

    searchInput.oninput = (e) => { clearBtn.style.display = e.target.value ? 'block' : 'none'; performSearch(e.target.value); };
    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); searchInput.focus(); clearBtn.style.display = 'none'; };
    
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
});
