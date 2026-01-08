document.addEventListener('DOMContentLoaded', () => {
    // Elementos de Interface
    const tabs = { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') };
    const views = { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') };
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const browseList = document.getElementById('browseList');
    const browseBreadcrumb = document.getElementById('browseBreadcrumb');
    const clearBtn = document.getElementById('clearBtn');

    let currentBrowsePath = []; // Array de {code, desc}

    // --- 1. GESTÃO DE ABAS ---
    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    function switchView(viewName) {
        Object.keys(views).forEach(v => {
            views[v].style.display = (v === viewName) ? 'block' : 'none';
            tabs[v].classList.toggle('active', v === viewName);
        });
        if (viewName === 'browse') renderBrowse();
    }

    // --- 2. LÓGICA DE NAVEGAÇÃO (BROWSE) ---
    function renderBrowse() {
        const isCDU = document.querySelector('input[name="dbBrowse"]:checked').value === 'cdu';
        const db = isCDU ? baseCDU : baseCDD;
        let items = [];

        if (isCDU) {
            // Navegação no Objeto CDU
            let level = db.principal;
            currentBrowsePath.forEach(p => { if(level[p.code]) level = level[p.code].children; });
            items = Object.keys(level).map(k => ({ code: k, desc: level[k].desc, folder: !!level[k].children }));
        } else {
            // Navegação na Lista CDD (Hierarquia Simulada)
            const parent = currentBrowsePath.length > 0 ? currentBrowsePath[currentBrowsePath.length-1].code : '';
            items = db.filter(item => {
                if (parent === '') return item.code.length === 3 && item.code.endsWith('00');
                if (parent.endsWith('00')) return item.code.startsWith(parent[0]) && item.code.endsWith('0') && item.code !== parent;
                if (parent.endsWith('0')) return item.code.startsWith(parent.substring(0,2)) && !item.code.includes('.') && item.code !== parent;
                return item.code.startsWith(parent + ".") && item.code.split('.').length === parent.split('.').length + 1;
            }).map(item => ({ ...item, folder: db.some(c => c.code.startsWith(item.code) && c.code !== item.code) }));
        }

        renderBrowseUI(items);
    }

    function renderBrowseUI(items) {
        // Breadcrumb
        browseBreadcrumb.innerHTML = '';
        const home = document.createElement('span');
        home.className = 'crumb'; home.innerText = '🏠 Início';
        home.onclick = () => { currentBrowsePath = []; renderBrowse(); };
        browseBreadcrumb.appendChild(home);

        currentBrowsePath.forEach((p, i) => {
            browseBreadcrumb.appendChild(document.createTextNode(' › '));
            const span = document.createElement('span');
            span.className = 'crumb'; span.innerText = p.code;
            span.onclick = () => { currentBrowsePath = currentBrowsePath.slice(0, i+1); renderBrowse(); };
            browseBreadcrumb.appendChild(span);
        });

        // Lista
        browseList.innerHTML = items.length ? '' : '<div class="empty-state">Sem subníveis.</div>';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'folder-item';
            div.innerHTML = `<span style="margin-right:10px">${item.folder ? '📁' : '📄'}</span> <div><b>${item.code}</b> ${item.desc}</div>`;
            div.onclick = () => {
                if (item.folder) {
                    currentBrowsePath.push(item);
                    renderBrowse();
                } else {
                    switchView('search');
                    searchInput.value = item.code;
                    performSearch(item.code);
                }
            };
            browseList.appendChild(div);
        });
    }

    // --- 3. LÓGICA DE PROCURA ---
    function performSearch(q) {
        const isCDU = document.querySelector('input[name="dbSearch"]:checked').value === 'cdu';
        const db = isCDU ? baseCDU : baseCDD;
        const query = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (!q) { resultsArea.innerHTML = '<div class="empty-state">Introduza um termo.</div>'; return; }

        let found = [];
        if (isCDU) {
            // Busca recursiva na CDU
            function traverse(nodes, path = []) {
                for (const k in nodes) {
                    if (k.includes(query) || nodes[k].desc.toLowerCase().includes(query)) 
                        found.push({ code: k, desc: nodes[k].desc, path: [...path] });
                    if (nodes[k].children) traverse(nodes[k].children, [...path, {code: k, desc: nodes[k].desc}]);
                }
            }
            traverse(db.principal);
        } else {
            // Busca na CDD + Cálculo de Pais
            found = db.filter(i => i.code.includes(query) || i.desc.toLowerCase().includes(query))
                      .map(i => ({ ...i, path: getCDDParents(i.code, db) }));
        }

        renderResultsUI(found, query, isCDU);
    }

    function renderResultsUI(results, q, isCDU) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Nada encontrado.</div>';
        results.slice(0, 50).forEach(item => {
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div');
            card.className = `level-card class-${color}`;
            
            const breadcrumbHTML = item.path?.length ? 
                `<div class="breadcrumb">📂 ${item.path.map(p => `${p.code} ${p.desc}`).join(' › ')}</div>` : '';

            card.innerHTML = `
                ${breadcrumbHTML}
                <div class="level-tag">${isCDU ? 'CDU' : 'CDD'}</div>
                <div class="level-code">${item.code}</div>
                <div class="level-desc">${item.desc.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')}</div>
            `;
            resultsArea.appendChild(card);
        });
    }

    function getCDDParents(code, db) {
        const pts = [];
        if (code.length >= 3) pts.push(code[0] + "00");
        if (code.length >= 3 && !isNaN(code.substring(0,2))) pts.push(code.substring(0,2) + "0");
        if (code.includes('.')) pts.push(code.split('.')[0]);
        return [...new Set(pts)].filter(p => p !== code).map(p => db.find(d => d.code === p)).filter(Boolean);
    }

    // Eventos
    searchInput.oninput = (e) => {
        clearBtn.style.display = e.target.value ? 'block' : 'none';
        performSearch(e.target.value);
    };
    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); searchInput.focus(); };
    document.querySelectorAll('input[name="dbBrowse"]').forEach(r => r.onchange = () => { currentBrowsePath = []; renderBrowse(); });
    
    // Tema
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
});
