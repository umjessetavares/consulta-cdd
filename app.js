document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const tabs = { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') };
    const views = { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') };
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const browseList = document.getElementById('browseList');
    const clearBtn = document.getElementById('clearBtn');
    const historyContainer = document.getElementById('searchHistory');
    const toggleSwitch = document.getElementById('checkbox');
    const themeIcon = document.getElementById('theme-icon');
    const offlineIcon = document.getElementById('offline-icon');

    // --- SETUP INICIAL ---
    const getDB = (type) => (type === 'cdu' ? (typeof baseCDU !== 'undefined' ? baseCDU : []) : (typeof baseCDD !== 'undefined' ? baseCDD : []));
    
    // Tema e Offline
    const setTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        if(toggleSwitch) toggleSwitch.checked = (t === 'dark');
        if(themeIcon) themeIcon.innerText = (t === 'dark') ? '☀️' : '🌙';
    };
    setTheme(localStorage.getItem('theme') || 'light');
    if(toggleSwitch) toggleSwitch.addEventListener('change', e => setTheme(e.target.checked ? 'dark' : 'light'));
    
    const updateStatus = () => { if(offlineIcon) offlineIcon.style.display = navigator.onLine ? 'none' : 'inline-block'; };
    window.addEventListener('online', updateStatus); window.addEventListener('offline', updateStatus); updateStatus();

    // --- NAVEGAÇÃO ENTRE ABAS ---
    function switchView(viewName) {
        views.search.style.display = (viewName === 'search') ? 'block' : 'none';
        views.browse.style.display = (viewName === 'browse') ? 'block' : 'none';
        tabs.search.classList.toggle('active', viewName === 'search');
        tabs.browse.classList.toggle('active', viewName === 'browse');
        if (viewName === 'browse') initTree(); // Inicia a árvore
    }
    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    // --- SOLUÇÃO 1: ANÁLISE SEMÂNTICA DE SÍMBOLOS ---
    function analyzeCode(code, type) {
        let label = type.toUpperCase();
        let semanticClass = '';

        if (type === 'cdu') {
            if (code.startsWith('"') && code.endsWith('"')) { label = 'TEMPO'; semanticClass = 'semantic-badge'; }
            else if (code.startsWith('(') && code.endsWith(')')) { 
                if (code.startsWith('(=') || code.startsWith('(0')) label = 'FORMA';
                else label = 'LUGAR'; 
                semanticClass = 'semantic-badge';
            }
            else if (code.startsWith('=')) { label = 'LÍNGUA'; semanticClass = 'semantic-badge'; }
        } 
        
        return { label, semanticClass };
    }

    // --- SOLUÇÃO 3: BUSCA COM NOTAÇÕES COMPOSTAS ---
    window.performSearch = (q) => {
        if(!q) q = searchInput.value;
        const type = document.querySelector('input[name="dbTypeSearch"]:checked').value;
        const db = getDB(type);

        if (!q || q.trim().length < 2) {
            resultsArea.innerHTML = '<div class="empty-state">Digite ao menos 2 caracteres.</div>';
            return;
        }

        // Detecta composição (ex: 016+981 ou 016:981)
        const separators = /[:\+]/;
        if (separators.test(q)) {
            const parts = q.split(separators).map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length > 1) {
                renderCompoundResult(parts, db, type);
                return;
            }
        }

        // Busca Normal
        const norm = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const terms = norm(q).split(' ').filter(t => t.trim().length > 0);

        const found = db.filter(item => {
            const dNorm = norm(item.desc);
            const cNorm = item.code.toLowerCase();
            return terms.every(t => dNorm.includes(t) || cNorm.includes(t));
        }).sort((a, b) => (a.code === q ? -1 : 1));

        renderResults(found, terms, type);
    };

    function renderCompoundResult(parts, db, type) {
        resultsArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'level-card compound-card';
        
        let htmlParts = '';
        let validParts = 0;

        parts.forEach(partCode => {
            const match = db.find(d => d.code === partCode) || { code: partCode, desc: "(Não encontrado na base)" };
            if(match.desc !== "(Não encontrado na base)") validParts++;
            htmlParts += `
                <div class="compound-part-tag">
                    <b>${match.code}</b>: ${match.desc}
                </div>
            `;
        });

        if (validParts === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nenhum dos códigos da composição foi encontrado.</div>';
            return;
        }

        container.innerHTML = `
            <div class="level-tag">SÍNTESE DETECTADA (${type.toUpperCase()})</div>
            <div class="level-code">${parts.join(' + ')}</div>
            <div class="level-desc">Assunto Composto / Relação</div>
            <div class="compound-parts">${htmlParts}</div>
        `;
        resultsArea.appendChild(container);
    }

    function renderResults(results, terms, type) {
        resultsArea.innerHTML = results.length ? '' : '<div class="empty-state">Nada encontrado.</div>';
        const db = getDB(type);

        results.slice(0, 50).forEach(item => {
            const parents = getParents(item.code, db, type);
            const { label, semanticClass } = analyzeCode(item.code, type);
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${color}`;
            card.onclick = () => saveToHistory(searchInput.value);

            let pathHTML = '';
            if (parents.length > 0) {
                const pathStr = parents.map(p => `<b>${p.code}</b> ${p.desc}`).join(' › '); // Correção: Breadcrumb corrido
                pathHTML = `<div class="breadcrumb">📂 ${pathStr}</div>`;
            }

            const regex = new RegExp(`(${terms.join('|')})`, 'gi');
            
            card.innerHTML = `
                ${pathHTML}
                <div>
                    <span class="level-tag ${semanticClass}">${label}</span>
                </div>
                <div class="level-code">${item.code}</div>
                <div class="level-desc">${item.desc.replace(regex, '<mark>$1</mark>')}</div>
            `;
            resultsArea.appendChild(card);
        });
    }

    // --- SOLUÇÃO 4: ÁRVORE HIERÁRQUICA (TREE VIEW) ---
    function initTree() {
        browseList.innerHTML = ''; // Limpa a lista antiga
        browseList.className = 'tree-container';
        const type = document.querySelector('input[name="dbTypeSearch"]:checked').value;
        const db = getDB(type);

        // Renderiza apenas os nós raiz (0-9)
        const roots = db.filter(item => isRoot(item.code, type));
        roots.forEach(root => {
            browseList.appendChild(createTreeNode(root, db, type));
        });
    }

    function isRoot(code, type) {
        if (type === 'cdd') return code.length === 3 && code.endsWith('00'); // 000, 100...
        return /^[0-9]$/.test(code); // CDU: 0, 1, 2...
    }

    function createTreeNode(item, db, type) {
        const details = document.createElement('details');
        details.className = 'tree-node';
        
        const summary = document.createElement('summary');
        summary.className = 'tree-summary';
        
        // Verifica se tem filhos para decidir o ícone
        const hasChildren = checkChildren(item.code, db, type);
        const icon = hasChildren ? '▶' : '•';
        
        summary.innerHTML = `
            <span class="tree-icon">${icon}</span>
            <span class="tree-code">${item.code}</span>
            <span>${item.desc}</span>
        `;

        details.appendChild(summary);

        if (hasChildren) {
            // Lazy Load: Carrega filhos apenas ao abrir
            const content = document.createElement('div');
            content.className = 'tree-content';
            
            details.addEventListener('toggle', function onToggle() {
                if (details.open && content.childElementCount === 0) {
                    const children = findTreeChildren(item.code, db, type);
                    children.forEach(child => {
                        content.appendChild(createTreeNode(child, db, type));
                    });
                }
            });
            details.appendChild(content);
        } else {
            // Se for folha, clica para buscar
            summary.addEventListener('click', (e) => {
                e.preventDefault(); // Evita toggle
                switchView('search');
                searchInput.value = item.code;
                performSearch(item.code);
            });
        }

        return details;
    }

    function checkChildren(parent, db, type) {
        // Otimização: Retorna true assim que achar 1 filho
        return db.some(item => isChild(parent, item.code, type));
    }

    function findTreeChildren(parent, db, type) {
        return db.filter(item => isChild(parent, item.code, type))
                 .sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric: true}));
    }

    function isChild(parent, code, type) {
        if (code === parent) return false;
        if (type === 'cdd') {
            // Lógica estrita CDD: 000 -> 010 -> 011 -> 011.1
            if (parent.endsWith('00')) return code.startsWith(parent[0]) && code.endsWith('0') && code.length === 3 && code !== parent;
            if (parent.endsWith('0') && !parent.endsWith('00')) return code.startsWith(parent.slice(0,2)) && code.length === 3 && !code.endsWith('0');
            if (!parent.includes('.') && code.includes('.')) return code.startsWith(parent + '.') && !code.slice(parent.length+1).includes('.'); 
            return false;
        } else {
            // Lógica CDU: Pai deve ser prefixo, mas não avô
            if (!code.startsWith(parent)) return false;
            // Filtra descendentes diretos (simplificado)
            const suffix = code.slice(parent.length);
            // Evita pular níveis (ex: 3 -> 33) se houver intermediários, 
            // mas como a base é simples, assumimos prefixo direto.
            return suffix.length > 0 && !suffix.includes('.') && !suffix.includes('::'); // Ajuste básico
        }
    }

    // --- UTILITÁRIOS (PAIS E HISTÓRICO) ---
    function getParents(code, db, type) {
        let parentCodes = new Set();
        let parents = [];
        // (Mesma lógica robusta da versão anterior)
        if (type === 'cdd') {
            const levels = [];
            if (code.length >= 1) levels.push(code.charAt(0) + '00'); 
            if (code.length >= 2) levels.push(code.substring(0, 2) + '0'); 
            if (code.includes('.')) levels.push(code.split('.')[0]); 
            levels.forEach(lvl => {
                if (lvl !== code && !parentCodes.has(lvl)) {
                    const match = db.find(d => d.code === lvl);
                    if (match) { parents.push(match); parentCodes.add(lvl); }
                }
            });
        } else {
            for (let i = 1; i < code.length; i++) {
                const sub = code.substring(0, i);
                if (sub !== code && !parentCodes.has(sub)) {
                    const match = db.find(d => d.code === sub);
                    if (match) { parents.push(match); parentCodes.add(sub); }
                }
            }
        }
        return parents.sort((a, b) => a.code.length - b.code.length);
    }

    // Gestos e Inputs
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX, {passive: true});
    document.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 80) switchView(diff > 0 ? 'search' : 'browse');
    }, {passive: true});

    searchInput.oninput = (e) => {
        clearBtn.style.display = e.target.value ? 'block' : 'none';
        performSearch(e.target.value);
    };
    clearBtn.onclick = () => { searchInput.value = ''; performSearch(''); clearBtn.style.display = 'none'; searchInput.focus(); };

    document.querySelectorAll('input[name^="dbType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            document.querySelectorAll(`input[value="${val}"]`).forEach(r => r.checked = true);
            if (views.browse.style.display === 'block') initTree();
            if (searchInput.value) performSearch(searchInput.value);
        });
    });

    function saveToHistory(term) {
        if (!term || term.length < 3) return;
        let h = JSON.parse(localStorage.getItem('sh')) || [];
        h = [term, ...h.filter(x => x !== term)].slice(0, 5);
        localStorage.setItem('sh', JSON.stringify(h));
        renderHistory();
    }
    function renderHistory() {
        const h = JSON.parse(localStorage.getItem('sh')) || [];
        historyContainer.innerHTML = h.length ? '<div style="font-size:12px;color:var(--subtext)">Recentes:</div>' : '';
        h.forEach(t => {
            const s = document.createElement('span'); s.className = 'history-tag'; s.innerText = t;
            s.onclick = () => { searchInput.value = t; performSearch(t); };
            historyContainer.appendChild(s);
        });
    }
    renderHistory();
});