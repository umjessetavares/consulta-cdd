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

    // 1. Sincronização Global da Base (CDD/CDU)
    document.querySelectorAll('input[name="dbType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            // Marca o mesmo valor em todos os seletores
            document.querySelectorAll(`input[name="dbType"][value="${val}"]`).forEach(r => r.checked = true);
            
            currentBrowsePath = []; // Reseta navegação
            if (views.browse.style.display === 'block') renderBrowse();
            performSearch(searchInput.value);
        });
    });

    // 2. Troca de Abas
    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    function switchView(viewName) {
        Object.keys(views).forEach(v => {
            views[v].style.display = (v === viewName) ? 'block' : 'none';
            tabs[v].classList.toggle('active', v === viewName);
        });
        if (viewName === 'browse') renderBrowse();
    }

    // 3. Navegação (Browse Mode)
    function renderBrowse() {
        const isCDU = document.querySelector('input[name="dbType"]:checked').value === 'cdu';
        const db = isCDU ? baseCDU : baseCDD;
        const parentCode = currentBrowsePath.length > 0 ? currentBrowsePath[currentBrowsePath.length-1].code : '';
        
        const children = findChildren(parentCode, db, isCDU);
        renderBrowseUI(children);
    }

    function findChildren(parent, db, isCDU) {
        // Filtra itens que começam com o código pai
        const candidates = db.filter(item => {
            if (parent === '') {
                if (isCDU) return /^\d$/.test(item.code) || item.code.startsWith('('); 
                return item.code.endsWith('00');
            }
            return item.code.startsWith(parent) && item.code !== parent;
        });

        // Retorna apenas filhos diretos (sem intermediários)
        return candidates.filter(child => {
            return !candidates.some(other => 
                other.code !== child.code && 
                child.code.startsWith(other.code) && 
                other.code.length > parent.length
            );
        }).map(item => ({
            ...item,
            folder: db.some(c => c.code.startsWith(item.code) && c.code !== item.code)
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

        browseList.innerHTML = items.length ? '' : '<div class="empty-state">Fim da hierarquia.</div>';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'folder-item';
            div.innerHTML = `<span style="margin-right:12px; font-size:1.2rem;">${item.folder ? '📁' : '📄'}</span> <div class="folder-info"><b>${item.code}</b> <span>${item.desc}</span></div>`;
            div.onclick = () => {
                if (item.folder) { currentBrowsePath.push(item); renderBrowse(); }
                else { switchView('search'); searchInput.value = item.code; performSearch(item.code); }
            };
            browseList.appendChild(div);
        });
    }

    // 4. Procura
    function performSearch(q) {
        const val = document.querySelector('input[name="dbType"]:checked').value;
        const db = val === 'cdu' ? baseCDU : baseCDD;
        const query = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (!q) { resultsArea.innerHTML = '<div class="empty-state">Introduza um termo.</div>'; return; }

        const found = db.filter(i => {
            const cleanDesc = i.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return i.code.includes(query) || cleanDesc.includes(query);
        }).map(i => ({ ...i, path: getParents(i.code, db) }));

        renderResultsUI(found, query, val.toUpperCase());
    }

    function renderResultsUI(results, q, label) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Sem resultados.</div>';
        results.slice(0, 50).forEach(item => {
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div');
            card.className = `level-card class-${color}`;
            
            const pathHTML = item.path?.length ? 
                `<div class="breadcrumb">📂 ${item.path.map(p => `<b>${p.code}</b> ${p.desc}`).join(' › ')}</div>` : '';

            card.innerHTML = `
                ${pathHTML}
                <div class="level-tag">${label}</div>
                <div class="level-code">${item.code}</div>
                <div class="level-desc">${item.desc.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')}</div>
            `;
            resultsArea.appendChild(card);
        });
    }

    function getParents(code, db) {
        const pts = [];
        for (let i = 1; i < code.length; i++) {
            let prefix = code.substring(0, i);
            if (prefix.endsWith('.')) prefix = prefix.slice(0, -1);
            const match = db.find(d => d.code === prefix);
            if (match) pts.push(match);
        }
        // Lógica de centenas para CDD se não houver prefixo exato
        if (code.length >= 3 && !pts.find(p => p.code.endsWith('00'))) {
            const c = db.find(d => d.code === code[0] + "00");
            if (c) pts.unshift(c);
        }
        return [...new Set(pts)].filter(p => p.code !== code).sort((a,b) => a.code.length - b.code.length);
    }

    searchInput.oninput = (e) => {
        clearBtn.style.display = e.target.value ? 'block' : 'none';
        performSearch(e.target.value);
    };
    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); searchInput.focus(); };
    
    // Tema
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.onclick = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    };
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
});
