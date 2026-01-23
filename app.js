document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const ui = {
        tabs: { search: document.getElementById('tabSearch'), browse: document.getElementById('tabBrowse') },
        views: { search: document.getElementById('viewSearch'), browse: document.getElementById('viewBrowse') },
        inputs: {
            search: document.getElementById('searchInput'),
            clear: document.getElementById('clearBtn'),
            dbRadios: document.querySelectorAll('input[name^="dbType"]'),
            toggle: document.getElementById('checkbox')
        },
        containers: {
            results: document.getElementById('resultsArea'),
            browse: document.getElementById('browseList'),
            history: document.getElementById('searchHistory'),
            fav: null, // Será criado dinamicamente
            toast: document.getElementById('toast')
        },
        icons: {
            theme: document.getElementById('theme-icon'),
            offline: document.getElementById('offline-icon')
        }
    };

    // Inicializa container de favoritos
    let favContainer = document.getElementById('favContainer');
    if (!favContainer) {
        favContainer = document.createElement('div');
        favContainer.id = 'favContainer';
        favContainer.className = 'history-container';
        ui.containers.history.parentNode.insertBefore(favContainer, ui.containers.history);
    }
    ui.containers.fav = favContainer;

    // --- ESTRATÉGIAS (Lógica Específica de cada Banco) ---
    
    // Regras visuais para CDU (Lookup Table)
    const cduRules = [
        { test: c => /^".*"$/.test(c), label: 'TEMPO' },
        { test: c => /^\(=|^\(0/.test(c), label: 'FORMA' },
        { test: c => /^\(.*\)$/.test(c), label: 'LUGAR' },
        { test: c => /^=/.test(c), label: 'LÍNGUA' }
    ];

    const strategies = {
        cdd: {
            label: 'CDD',
            getDB: () => (typeof baseCDD !== 'undefined' ? baseCDD : []),
            
            // Lógica de raiz: CDD são centenas exatas (ex: 100, 200) com 3 dígitos
            isRoot: (code) => code.length === 3 && code.endsWith('00'),
            
            // Lógica hierárquica específica da Dewey
            isChild: (parent, code) => {
                if (code === parent) return false;
                if (parent.endsWith('00')) {
                    // 300 -> 310, 320 (mas não 300)
                    return code.startsWith(parent[0]) && code.endsWith('0') && code.length === 3;
                }
                if (parent.endsWith('0') && !parent.endsWith('00')) {
                    // 310 -> 311, 312
                    return code.startsWith(parent.slice(0, 2)) && code.length === 3 && !code.endsWith('0');
                }
                if (!parent.includes('.') && code.includes('.')) {
                    // 311 -> 311.1
                    return code.startsWith(parent + '.') && !code.slice(parent.length + 1).includes('.');
                }
                return false;
            },

            getParents: (code, db) => {
                const parents = [];
                const levels = [];
                if (code.length >= 1) levels.push(code.charAt(0) + '00');
                if (code.length >= 2) levels.push(code.substring(0, 2) + '0');
                if (code.includes('.')) levels.push(code.split('.')[0]);

                // Filtra duplicatas e o próprio código
                [...new Set(levels)].forEach(lvl => {
                    if (lvl !== code) {
                        const match = db.find(d => d.code === lvl);
                        if (match) parents.push(match);
                    }
                });
                return parents.sort((a, b) => a.code.length - b.code.length);
            },

            analyze: () => ({ label: 'CDD', semanticClass: '' })
        },

        cdu: {
            label: 'CDU',
            getDB: () => (typeof baseCDU !== 'undefined' ? baseCDU : []),
            
            // Lógica de raiz: CDU são classes principais de 0 a 9
            isRoot: (code) => /^[0-9]$/.test(code),
            
            // Lógica hierárquica baseada em string pura
            isChild: (parent, code) => {
                if (!code.startsWith(parent)) return false;
                const suffix = code.slice(parent.length);
                // Evita filhos profundos ou auxiliares complexos na árvore básica
                return suffix.length > 0 && !suffix.includes('.') && !suffix.includes('::');
            },

            getParents: (code, db) => {
                const parents = [];
                // Itera substring por substring
                for (let i = 1; i < code.length; i++) {
                    const sub = code.substring(0, i);
                    const match = db.find(d => d.code === sub);
                    if (match) parents.push(match);
                }
                return parents;
            },

            analyze: (code) => {
                const match = cduRules.find(r => r.test(code));
                return match 
                    ? { label: match.label, semanticClass: 'semantic-badge' } 
                    : { label: 'CDU', semanticClass: '' };
            }
        }
    };

    // Helper para pegar a estratégia atual baseada no input selecionado
    const getCurrentStrategy = (context = 'Search') => {
        const type = document.querySelector(`input[name="dbType${context}"]:checked`).value;
        return strategies[type];
    };

    // --- UTILITÁRIOS ---
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function showToast(msg) {
        ui.containers.toast.innerText = msg;
        ui.containers.toast.style.display = 'block';
        setTimeout(() => { ui.containers.toast.style.display = 'none'; }, 2000);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => showToast(`Copiado: ${text}`))
                .catch(err => console.error('Erro ao copiar', err));
        } else {
            alert(`Código: ${text}`);
        }
    }

    // --- FAVORITOS & HISTÓRICO ---
    function toggleFavorite(code, desc) {
        let favs = JSON.parse(localStorage.getItem('favs')) || [];
        const index = favs.findIndex(f => f.code === code);
        
        if (index > -1) {
            favs.splice(index, 1);
            showToast('Removido dos favoritos');
        } else {
            favs.push({ code, desc });
            showToast('Salvo em favoritos');
        }
        localStorage.setItem('favs', JSON.stringify(favs));
        renderFavorites();
        
        // Atualiza visualmente se houver busca ativa
        if (ui.inputs.search.value) performSearch(ui.inputs.search.value);
    }

    function isFavorite(code) {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        return favs.some(f => f.code === code);
    }

    function renderFavorites() {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        ui.containers.fav.innerHTML = favs.length 
            ? '<div style="font-size:12px;color:var(--primary);margin-top:10px;width:100%">⭐ Favoritos:</div>' 
            : '';
        
        favs.forEach(f => {
            const s = document.createElement('span'); 
            s.className = 'history-tag';
            s.style.borderColor = 'var(--primary)';
            s.textContent = f.code;
            s.onclick = () => { ui.inputs.search.value = f.code; performSearch(f.code); };
            ui.containers.fav.appendChild(s);
        });
    }

    function saveToHistory(term) {
        if (!term || term.length < 3) return;
        const cleanTerm = term.length > 50 ? term.substring(0, 50) + "..." : term;
        
        let h = JSON.parse(localStorage.getItem('sh')) || [];
        h = [cleanTerm, ...h.filter(x => x !== cleanTerm)].slice(0, 5);
        localStorage.setItem('sh', JSON.stringify(h));
        renderHistory();
    }
    
    function renderHistory() {
        const h = JSON.parse(localStorage.getItem('sh')) || [];
        ui.containers.history.innerHTML = h.length 
            ? '<div style="font-size:12px;color:var(--subtext)">Recentes:</div>' 
            : '';
        
        h.forEach(t => {
            const s = document.createElement('span'); 
            s.className = 'history-tag'; 
            s.textContent = t;
            s.onclick = () => { 
                const codeOnly = t.split(' ')[0];
                ui.inputs.search.value = codeOnly; 
                performSearch(codeOnly); 
            };
            ui.containers.history.appendChild(s);
        });
    }

    // --- SETUP & TEMA ---
    const setTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        if(ui.inputs.toggle) ui.inputs.toggle.checked = (t === 'dark');
        if(ui.icons.theme) ui.icons.theme.innerText = (t === 'dark') ? '☀️' : '🌙';
    };
    
    const updateStatus = () => { 
        if(ui.icons.offline) ui.icons.offline.style.display = navigator.onLine ? 'none' : 'inline-block'; 
    };

    // --- NAVEGAÇÃO UI ---
    function switchView(viewName) {
        ui.views.search.style.display = (viewName === 'search') ? 'block' : 'none';
        ui.views.browse.style.display = (viewName === 'browse') ? 'block' : 'none';
        ui.tabs.search.classList.toggle('active', viewName === 'search');
        ui.tabs.browse.classList.toggle('active', viewName === 'browse');
        
        if (viewName === 'browse') initTree();
    }

    // --- LÓGICA DE BUSCA ---
    const performSearchLogic = (q) => {
        const strategy = getCurrentStrategy('Search');
        const db = strategy.getDB();

        // Validação Mínima
        if (!q || q.trim().length < 2) {
            ui.containers.results.innerHTML = '';
            const msg = document.createElement('div');
            msg.className = 'empty-state';
            msg.textContent = 'Digite ao menos 2 caracteres.';
            ui.containers.results.appendChild(msg);
            return;
        }

        // 1. Busca Composta (separadores)
        const separators = /[:\+]/;
        if (separators.test(q)) {
            const parts = q.split(separators).map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length > 1) {
                renderCompoundResult(parts, db, strategy);
                return;
            }
        }

        // 2. Busca Normal com Sinônimos
        const norm = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // --- INÍCIO DA EXPANSÃO DE SINÔNIMOS ---
        let queryExpandida = q;
        // Verifica se o objeto global mapaSinonimos existe (carregado via sinonimos.js)
        if (typeof mapaSinonimos !== 'undefined') {
            const termosUsuario = norm(q).split(' ');
            termosUsuario.forEach(termo => {
                // Se o termo digitado tiver uma chave no mapa, adiciona os sinônimos
                if (mapaSinonimos[termo]) {
                    queryExpandida += " " + mapaSinonimos[termo];
                }
            });
        }
        // --- FIM DA EXPANSÃO DE SINÔNIMOS ---

        // Usa queryExpandida para gerar os termos de filtro
        const terms = norm(queryExpandida).split(' ').filter(t => t.trim().length > 0);

        const found = db.filter(item => {
            const dNorm = norm(item.desc);
            const cNorm = item.code.toLowerCase();
            return terms.every(t => dNorm.includes(t) || cNorm.includes(t));
        }).sort((a, b) => (a.code === q ? -1 : 1)); // Exact match primeiro

        renderResults(found, terms, strategy);
    };

    window.performSearch = debounce((q) => performSearchLogic(q), 300);

    function renderCompoundResult(parts, db, strategy) {
        ui.containers.results.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'level-card compound-card';
        
        // Header Composto
        const title = document.createElement('div');
        title.className = 'level-tag';
        title.textContent = `SÍNTESE DETECTADA (${strategy.label})`;
        container.appendChild(title);

        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'level-code';
        codeDisplay.textContent = parts.join(' + ');
        container.appendChild(codeDisplay);

        const descDisplay = document.createElement('div');
        descDisplay.className = 'level-desc';
        descDisplay.textContent = 'Assunto Composto / Relação';
        container.appendChild(descDisplay);

        // Partes
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
            empty.textContent = 'Nenhum código encontrado para compor.';
            ui.containers.results.appendChild(empty);
            return;
        }

        container.appendChild(partsContainer);
        ui.containers.results.appendChild(container);
    }

    function renderResults(results, terms, strategy) {
        ui.containers.results.innerHTML = ''; 
        
        if (results.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'Nada encontrado.';
            ui.containers.results.appendChild(empty);
            return;
        }

        const db = strategy.getDB();
        const escapedTerms = terms.map(escapeRegExp);
        const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

        results.slice(0, 50).forEach(item => {
            const parents = strategy.getParents(item.code, db);
            const { label, semanticClass } = strategy.analyze(item.code);
            const colorClass = `class-${item.code.replace(/[^0-9]/g, '').charAt(0) || '0'}`;
            
            const card = document.createElement('div');
            card.className = `level-card ${colorClass}`;
            card.style.position = 'relative';

            // Estrela de Favorito
            const star = document.createElement('span');
            const faved = isFavorite(item.code);
            Object.assign(star.style, {
                position: 'absolute', top: '10px', right: '10px', 
                cursor: 'pointer', fontSize: '1.2rem',
                color: faved ? 'gold' : 'var(--subtext)'
            });
            star.textContent = faved ? '★' : '☆';
            star.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(item.code, item.desc);
            };
            card.appendChild(star);
            
            // Clique principal
            card.onclick = () => {
                saveToHistory(`${item.code} ${item.desc}`);
                copyToClipboard(item.code);
            };

            // Breadcrumb (Hierarquia)
            if (parents.length > 0) {
                const bc = document.createElement('div');
                bc.className = 'breadcrumb';
                bc.textContent = '📂 '; 
                parents.forEach((p, idx) => {
                    const b = document.createElement('b');
                    b.textContent = p.code;
                    bc.appendChild(b);
                    if (idx < parents.length - 1) bc.appendChild(document.createTextNode(' › '));
                    bc.appendChild(document.createTextNode(` ${p.desc} `));
                    if (idx < parents.length - 1) bc.appendChild(document.createTextNode(' '));
                });
                card.appendChild(bc);
            }

            // Tag Semântica
            const tagContainer = document.createElement('div');
            const spanTag = document.createElement('span');
            spanTag.className = `level-tag ${semanticClass}`; 
            spanTag.textContent = label;
            tagContainer.appendChild(spanTag);
            card.appendChild(tagContainer);

            // Código e Descrição
            const codeDiv = document.createElement('div');
            codeDiv.className = 'level-code';
            codeDiv.textContent = item.code;
            card.appendChild(codeDiv);

            const descDiv = document.createElement('div');
            descDiv.className = 'level-desc';

            // Highlight dos termos
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

            ui.containers.results.appendChild(card);
        });
    }

    // --- ÁRVORE HIERÁRQUICA (BROWSE) ---
    function initTree() {
        ui.containers.browse.innerHTML = ''; 
        ui.containers.browse.className = 'tree-container';
        
        const strategy = getCurrentStrategy('Browse');
        const db = strategy.getDB();
        
        const roots = db.filter(item => strategy.isRoot(item.code));
        roots.forEach(root => {
            ui.containers.browse.appendChild(createTreeNode(root, db, strategy));
        });
    }

    function createTreeNode(item, db, strategy) {
        const details = document.createElement('details');
        details.className = 'tree-node';
        
        const summary = document.createElement('summary');
        summary.className = 'tree-summary';
        
        // Verifica se tem filhos usando a estratégia atual
        const children = db.filter(child => strategy.isChild(item.code, child.code))
                           .sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric: true}));
        const hasChildren = children.length > 0;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'tree-icon';
        iconSpan.textContent = hasChildren ? '▶' : '•';
        
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
            
            // Lazy Loading: só cria os nós filhos quando abre
            details.addEventListener('toggle', function onToggle() {
                if (details.open && content.childElementCount === 0) {
                    children.forEach(child => {
                        content.appendChild(createTreeNode(child, db, strategy));
                    });
                }
            });
            details.appendChild(content);
        } else {
            // Se for folha, clica para buscar
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                switchView('search');
                ui.inputs.search.value = item.code;
                performSearch(item.code);
            });
        }
        return details;
    }

    // --- EVENT LISTENERS E INICIALIZAÇÃO ---
    
    // Gestos (Swipe)
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX, {passive: true});
    document.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 80) switchView(diff > 0 ? 'search' : 'browse');
    }, {passive: true});

    // Inputs
    ui.inputs.search.oninput = (e) => {
        ui.inputs.clear.style.display = e.target.value ? 'block' : 'none';
        performSearch(e.target.value); 
    };
    
    ui.inputs.clear.onclick = () => { 
        ui.inputs.search.value = ''; 
        performSearch(''); 
        ui.inputs.clear.style.display = 'none'; 
        ui.inputs.search.focus(); 
    };

    // Sincroniza Radio Buttons de DB
    ui.inputs.dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            // Marca o mesmo valor em ambas as abas
            document.querySelectorAll(`input[value="${val}"]`).forEach(r => r.checked = true);
            
            if (ui.views.browse.style.display === 'block') initTree();
            if (ui.inputs.search.value) performSearch(ui.inputs.search.value);
        });
    });

    // Abas
    ui.tabs.search.onclick = () => switchView('search');
    ui.tabs.browse.onclick = () => switchView('browse');

    // Tema e Status
    setTheme(localStorage.getItem('theme') || 'light');
    if(ui.inputs.toggle) ui.inputs.toggle.addEventListener('change', e => setTheme(e.target.checked ? 'dark' : 'light'));
    
    window.addEventListener('online', updateStatus); 
    window.addEventListener('offline', updateStatus); 
    updateStatus();

    // Inicialização Final
    renderHistory();
    renderFavorites();
});
