document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const tabs = { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') };
    const views = { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') };
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const browseList = document.getElementById('browseList');
    const browseBreadcrumb = document.getElementById('browseBreadcrumb');
    const clearBtn = document.getElementById('clearBtn');

    let currentBrowsePath = []; 

    // --- 1. SINCRONIZAÇÃO DE BASES ---
    // Faz com que mudar CDD/CDU em uma aba mude na outra também
    document.querySelectorAll('input[name="dbType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            document.querySelectorAll(`input[name="dbType"][value="${val}"]`).forEach(r => r.checked = true);
            
            // Reseta navegação ao trocar base
            currentBrowsePath = [];
            if (views.browse.style.display === 'block') renderBrowse();
            if (searchInput.value) performSearch(searchInput.value);
        });
    });

    // --- 2. GESTÃO DE ABAS ---
    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    function switchView(viewName) {
        Object.keys(views).forEach(v => {
            views[v].style.display = (v === viewName) ? 'block' : 'none';
            tabs[v].classList.toggle('active', v === viewName);
        });
        if (viewName === 'browse') renderBrowse();
    }

    // --- 3. LÓGICA DE NAVEGAÇÃO (BROWSE) ---
    function renderBrowse() {
        const isCDU = document.querySelector('input[name="dbType"]:checked').value === 'cdu';
        const db = isCDU ? baseCDU : baseCDD;
        let items = [];

        if (isCDU) {
            // Navegação no Objeto CDU
            let level = db.principal;
            currentBrowsePath.forEach(p => { if(level[p.code]?.children) level = level[p.code].children; });
            items = Object.keys(level).map(k => ({ 
                code: k, 
                desc: level[k].desc, 
                folder: !!level[k].children 
            }));
        } else {
            // Navegação na Lista CDD (Lógica Decimal Corrigida)
            const parent = currentBrowsePath.length > 0 ? currentBrowsePath[currentBrowsePath.length-1].code : '';
            items = findDirectChildrenCDD(parent, db);
        }
        renderBrowseUI(items);
    }

    function findDirectChildrenCDD(parent, db) {
        return db.filter(item => {
            if (parent === '') return item.code.endsWith('00'); // Centenas (Raiz)
            if (parent.endsWith('00')) {
                // De 200 para 210, 220...
                return item.code.startsWith(parent[0]) && item.code.endsWith('0') && item.code !== parent;
            }
            if (parent.endsWith('0')) {
                // De 210 para 211, 212...
                return item.code.startsWith(parent.substring(0, 2)) && !item.code.includes('.') && item.code !== parent;
            }
            // Subdivisões com ponto
            return item.code.startsWith(parent + ".") && item.code.split('.').length === parent.split('.').length + 1;
        }).map(item => ({
            ...item,
            // Verifica se este item tem "filhos" na lista
            folder: db.some(c => {
                if (item.code.endsWith('00')) return c.code.startsWith(item.code[0]) && c.code !== item.code;
                if (item.code.endsWith('0')) return c.code.startsWith(item.code.substring(0,2)) && c.code !== item.code;
                return c.code.startsWith(item.code + ".");
            })
        })).sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric: true}));
    }

    function renderBrowseUI(items) {
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

        browseList.innerHTML = items.length ? '' : '<div class="empty-state">Sem subníveis.</div>';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'folder-item';
            div.innerHTML = `<span style="margin-right:12px; font-size:1.2rem;">${item.folder ? '📁' : '📄'}</span> <div class="folder-info"><b>${item.code}</b> <span>${item.desc}</span></div>`;
            div.onclick = () => {
                if (item.folder) { currentBrowsePath.push(item); renderBrowse(); }
                else { 
                    switchView('search'); 
                    searchInput.value = item.code; 
                    performSearch(item.code); 
                    window.scrollTo(0,0);
                }
            };
            browseList.appendChild(div);
        });
    }

    // --- 4. MOTOR DE PROCURA ---
    function performSearch(q) {
        const isCDU = document.querySelector('input[name="dbType"]:checked').value === 'cdu';
        const db = isCDU ? baseCDU : baseCDD;
        const query = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (!q) { resultsArea.innerHTML = '<div class="empty-state">Introduza um termo para pesquisar.</div>'; return; }

        let found = [];
        if (isCDU) {
            // Busca recursiva no objeto CDU
            function traverse(nodes, path = []) {
                for (const k in nodes) {
                    const cleanDesc = nodes[k].desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (k.includes(query) || cleanDesc.includes(query)) 
                        found.push({ code: k, desc: nodes[k].desc, path: [...path] });
                    if (nodes[k].children) traverse(nodes[k].children, [...path, {code: k, desc: nodes[k].desc}]);
                }
            }
            traverse(db.principal);
        } else {
            // Busca simples na lista CDD
            found = db.filter(i => {
                const cleanDesc = i.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return i.code.includes(query) || cleanDesc.includes(query);
            }).map(i => ({ ...i, path: getCDDParents(i.code, db) }));
        }
        renderResultsUI(found, query, isCDU);
    }

    function renderResultsUI(results, q, isCDU) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Nenhum resultado encontrado.</div>';
        results.slice(0, 50).forEach(item => {
            const firstDigit = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div');
            card.className = `level-card class-${firstDigit}`;
            
            const pathHTML = item.path?.length ? 
                `<div class="breadcrumb">📂 ${item.path.map(p => `<b>${p.code}</b> ${p.desc}`).join(' › ')}</div>` : '';

            card.innerHTML = `
                ${pathHTML}
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
    searchInput.oninput = (e) => performSearch(e.target.value);
    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); searchInput.focus(); };
    
    // Tema
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
});
