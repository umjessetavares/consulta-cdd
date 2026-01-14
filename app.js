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
    const toast = document.getElementById('toast');

    // Container para Favoritos (Criado dinamicamente se não existir no HTML)
    let favContainer = document.getElementById('favContainer');
    if (!favContainer) {
        favContainer = document.createElement('div');
        favContainer.id = 'favContainer';
        favContainer.className = 'history-container'; // Reutiliza estilo do histórico
        // Insere antes do histórico
        historyContainer.parentNode.insertBefore(favContainer, historyContainer);
    }

    // --- UTILITÁRIOS E SEGURANÇA ---
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(`Copiado: ${text}`);
            }).catch(err => console.error('Erro ao copiar', err));
        } else {
            alert(`Código: ${text}`);
        }
    }

    function showToast(msg) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    // --- GERENCIAMENTO DE FAVORITOS ---
    function toggleFavorite(code, desc) {
        let favs = JSON.parse(localStorage.getItem('favs')) || [];
        const index = favs.findIndex(f => f.code === code);
        
        if (index > -1) {
            favs.splice(index, 1); // Remove
            showToast(`Removido dos favoritos`);
        } else {
            favs.push({ code, desc }); // Adiciona
            showToast(`Salvo em favoritos`);
        }
        localStorage.setItem('favs', JSON.stringify(favs));
        renderFavorites();
        
        // Atualiza ícone se estiver vendo resultados
        if (searchInput.value) performSearch(searchInput.value); 
    }

    function isFavorite(code) {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        return favs.some(f => f.code === code);
    }

    function renderFavorites() {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        favContainer.innerHTML = favs.length ? '<div style="font-size:12px;color:var(--primary);margin-top:10px;width:100%">⭐ Favoritos:</div>' : '';
        
        favs.forEach(f => {
            const s = document.createElement('span'); 
            s.className = 'history-tag';
            s.style.borderColor = 'var(--primary)'; // Destaque visual
            s.textContent = f.code;
            s.onclick = () => { 
                searchInput.value = f.code; 
                performSearch(f.code); 
            };
            favContainer.appendChild(s);
        });
    }

    // --- SETUP INICIAL ---
    const getDB = (type) => (type === 'cdu' ? (typeof baseCDU !== 'undefined' ? baseCDU : []) : (typeof baseCDD !== 'undefined' ? baseCDD : []));
    
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

    // --- NAVEGAÇÃO ---
    function switchView(viewName) {
        views.search.style.display = (viewName === 'search') ? 'block' : 'none';
        views.browse.style.display = (viewName === 'browse') ? 'block' : 'none';
        tabs.search.classList.toggle('active', viewName === 'search');
        tabs.browse.classList.toggle('active', viewName === 'browse');
        if (viewName === 'browse') initTree();
    }
    tabs.search.onclick = () => switchView('search');
    tabs.browse.onclick = () => switchView('browse');

    // --- ANÁLISE E BUSCA ---
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

    const performSearchLogic = (q) => {
        const type = document.querySelector('input[name="dbTypeSearch"]:checked').value;
        const db = getDB(type);

        if (!q || q.trim().length < 2) {
            resultsArea.innerHTML = '';
            const msg = document.createElement('div');
            msg.className = 'empty-state';
            msg.textContent = 'Digite ao menos 2 caracteres.';
            resultsArea.appendChild(msg);
            return;
        }

        // Busca Composta
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

    window.performSearch = debounce((q) => performSearchLogic(q), 300);

    function renderCompoundResult(parts, db, type) {
        resultsArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'level-card compound-card';
        
        const title = document.createElement('div');
        title.className = 'level-tag';
        title.textContent = `SÍNTESE DETECTADA (${type.toUpperCase()})`;
        container.appendChild(title);

        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'level-code';
        codeDisplay.textContent = parts.join(' + ');
        container.appendChild(codeDisplay);

        const descDisplay = document.createElement('div');
        descDisplay.className = 'level-desc';
        descDisplay.textContent = 'Assunto Composto / Relação';
        container.appendChild(descDisplay);

        const partsContainer = document.createElement('div');
        partsContainer.className = 'compound-parts';

        let validParts = 0;
        parts.forEach(partCode => {
            const match = db.find(d => d.code === partCode) || { code: partCode, desc: "(Não encontrado)" };
            if(match.desc !== "(Não encontrado)") validParts++;
            
            const partTag = document.createElement('div');
            partTag.className = 'compound-part-tag';
            
            const b = document.createElement('b');
            b.textContent = match.code;
            partTag.appendChild(b);
            partTag.appendChild(document.createTextNode(`: ${match.desc}`));
            
            partsContainer.appendChild(partTag);
        });

        if (validParts === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'Nenhum código encontrado.';
            resultsArea.appendChild(empty);
            return;
        }

        container.appendChild(partsContainer);
        resultsArea.appendChild(container);
    }

    // --- RENDERIZAÇÃO SEGURA (SEM INNERHTML) ---
    function renderResults(results, terms, type) {
        resultsArea.innerHTML = ''; 
        
        if (results.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'Nada encontrado.';
            resultsArea.appendChild(emptyState);
            return;
        }

        const db = getDB(type);
        const escapedTerms = terms.map(escapeRegExp);
        const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

        results.slice(0, 50).forEach(item => {
            const parents = getParents(item.code, db, type);
            const { label, semanticClass } = analyzeCode(item.code, type);
            const color = item.code.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${color}`;
            card.style.position = 'relative'; // Para posicionar a estrela

            // Ícone de Favorito (Estrela)
            const star = document.createElement('span');
            star.style.position = 'absolute';
            star.style.top = '10px';
            star.style.right = '10px';
            star.style.cursor = 'pointer';
            star.style.fontSize = '1.2rem';
            star.textContent = isFavorite(item.code) ? '★' : '☆';
            star.style.color = isFavorite(item.code) ? 'gold' : 'var(--subtext)';
            
            star.onclick = (e) => {
                e.stopPropagation(); // Evita copiar ao clicar na estrela
                toggleFavorite(item.code, item.desc);
            };
            card.appendChild(star);
            
            // Clique no card (Copiar)
            card.onclick = () => {
                saveToHistory(item.code + " " + item.desc);
                copyToClipboard(item.code);
            };

            // Breadcrumb
            if (parents.length > 0) {
                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.textContent = '📂 '; 

                parents.forEach((p, index) => {
                    const b = document.createElement('b');
                    b.textContent = p.code;
                    breadcrumbDiv.appendChild(b);
                    const separator = index < parents.length - 1 ? ' › ' : '';
                    breadcrumbDiv.appendChild(document.createTextNode(` ${p.desc}${separator}`));
                });
                card.appendChild(breadcrumbDiv);
            }

            // Tag
            const tagContainer = document.createElement('div');
            const spanTag = document.createElement('span');
            spanTag.className = `level-tag ${semanticClass}`; 
            spanTag.textContent = label;
            tagContainer.appendChild(spanTag);
            card.appendChild(tagContainer);

            // Código
            const codeDiv = document.createElement('div');
            codeDiv.className = 'level-code';
            codeDiv.textContent = item.code;
            card.appendChild(codeDiv);

            // Descrição com Highlight seguro
            const descDiv = document.createElement('div');
            descDiv.className = 'level-desc';

            const parts = item.desc.split(regex);
            parts.forEach(part => {
                if (part.match(regex)) {
                    const mark = document.createElement('mark');
                    mark.textContent = part;
                    descDiv.appendChild(mark);
                } else if (part.length > 0) {
                    descDiv.appendChild(document.createTextNode(part));
                }
            });
            card.appendChild(descDiv);

            resultsArea.appendChild(card);
        });
    }

    // --- ÁRVORE HIERÁRQUICA ---
    function initTree() {
        browseList.innerHTML = ''; 
        browseList.className = 'tree-container';
        const type = document.querySelector('input[name="dbTypeSearch"]:checked').value;
        const db = getDB(type);
        const roots = db.filter(item => isRoot(item.code, type));
        roots.forEach(root => {
            browseList.appendChild(createTreeNode(root, db, type));
        });
    }

    function isRoot(code, type) {
        if (type === 'cdd') return code.length === 3 && code.endsWith('00');
        return /^[0-9]$/.test(code);
    }

    function createTreeNode(item, db, type) {
        const details = document.createElement('details');
        details.className = 'tree-node';
        
        const summary = document.createElement('summary');
        summary.className = 'tree-summary';
        
        const hasChildren = checkChildren(item.code, db, type);
        const icon = hasChildren ? '▶' : '•';
        
        // Montagem segura do Summary
        const iconSpan = document.createElement('span');
        iconSpan.className = 'tree-icon';
        iconSpan.textContent = icon;
        
        const codeSpan = document.createElement('span');
        codeSpan.className = 'tree-code';
        codeSpan.textContent = item.code;

        const descSpan = document.createElement('span');
        descSpan.textContent = item.desc;

        summary.appendChild(iconSpan);
        summary.appendChild(codeSpan);
        summary.appendChild(descSpan);
        details.appendChild(summary);

        if (hasChildren) {
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
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                switchView('search');
                searchInput.value = item.code;
                performSearch(item.code);
            });
        }
        return details;
    }

    function checkChildren(parent, db, type) {
        return db.some(item => isChild(parent, item.code, type));
    }

    function findTreeChildren(parent, db, type) {
        return db.filter(item => isChild(parent, item.code, type))
                 .sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric: true}));
    }

    function isChild(parent, code, type) {
        if (code === parent) return false;
        if (type === 'cdd') {
            if (parent.endsWith('00')) return code.startsWith(parent[0]) && code.endsWith('0') && code.length === 3 && code !== parent;
            if (parent.endsWith('0') && !parent.endsWith('00')) return code.startsWith(parent.slice(0,2)) && code.length === 3 && !code.endsWith('0');
            if (!parent.includes('.') && code.includes('.')) return code.startsWith(parent + '.') && !code.slice(parent.length+1).includes('.'); 
            return false;
        } else {
            if (!code.startsWith(parent)) return false;
            const suffix = code.slice(parent.length);
            return suffix.length > 0 && !suffix.includes('.') && !suffix.includes('::');
        }
    }

    function getParents(code, db, type) {
        let parentCodes = new Set();
        let parents = [];
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

    // Gestos, Inputs e Inicialização
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
        if(term.length > 50) term = term.substring(0, 50) + "...";
        let h = JSON.parse(localStorage.getItem('sh')) || [];
        h = [term, ...h.filter(x => x !== term)].slice(0, 5);
        localStorage.setItem('sh', JSON.stringify(h));
        renderHistory();
    }
    
    function renderHistory() {
        const h = JSON.parse(localStorage.getItem('sh')) || [];
        historyContainer.innerHTML = h.length ? '<div style="font-size:12px;color:var(--subtext)">Recentes:</div>' : '';
        h.forEach(t => {
            const s = document.createElement('span'); 
            s.className = 'history-tag'; 
            s.textContent = t;
            s.onclick = () => { 
                const codeOnly = t.split(' ')[0];
                searchInput.value = codeOnly; 
                performSearch(codeOnly); 
            };
            historyContainer.appendChild(s);
        });
    }

    // Inicialização final
    renderHistory();
    renderFavorites(); // Exibe favoritos ao carregar
});
