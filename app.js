document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    const browseBtn = document.getElementById('browseBtn');
    const browseArea = document.getElementById('browseArea');
    const browseList = document.getElementById('browseList');
    const browseBreadcrumb = document.getElementById('browseBreadcrumb');
    
    let debounceTimer;
    let isBrowseMode = false;
    let currentBrowsePath = []; // Histórico de navegação (objetos {code, desc})
    
    // --- 1. INICIALIZAÇÃO ---
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Bases de dados não carregadas.</div>';
        return;
    }

    // --- 2. TROCA DE BASE E RESET ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            resetInterface();
            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // Estrutura de Objeto/Árvore
                searchInput.placeholder = "CDU: código ou termo...";
            } else {
                dadosAtivos = baseCDD; // Estrutura de Array/Lista
                searchInput.placeholder = "CDD: código ou assunto...";
            }
        });
    });

    function resetInterface() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        isBrowseMode = false;
        browseBtn.classList.remove('active');
        browseArea.style.display = 'none';
        resultsArea.style.display = 'flex';
        resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
    }

    // --- 3. MODO NAVEGAÇÃO (BROWSE) ---
    browseBtn.addEventListener('click', () => {
        isBrowseMode = !isBrowseMode;
        browseBtn.classList.toggle('active');
        
        if (isBrowseMode) {
            resultsArea.style.display = 'none';
            browseArea.style.display = 'block';
            currentBrowsePath = [];
            renderBrowseLevel(); // Inicia na raiz
        } else {
            resultsArea.style.display = 'flex';
            browseArea.style.display = 'none';
            searchInput.focus();
        }
    });

    function renderBrowseLevel() {
        const isCDU = !Array.isArray(dadosAtivos);
        let items = [];

        if (isCDU) {
            // Lógica para CDU (Navegar no Objeto)
            let currentLevel = dadosAtivos.principal;
            // Percorre o caminho até o nível atual
            currentBrowsePath.forEach(step => {
                if (currentLevel[step.code] && currentLevel[step.code].children) {
                    currentLevel = currentLevel[step.code].children;
                }
            });
            // Transforma as chaves do nível atual em itens para a lista
            items = Object.keys(currentLevel).map(key => ({
                code: key,
                desc: currentLevel[key].desc,
                hasChildren: !!currentLevel[key].children
            }));
        } else {
            // Lógica para CDD (Navegar na Lista Plana)
            const parentCode = currentBrowsePath.length > 0 ? currentBrowsePath[currentBrowsePath.length - 1].code : '';
            items = findDirectChildrenCDD(parentCode);
        }

        updateBrowseUI(items);
    }

    function updateBrowseUI(items) {
        // Atualiza Breadcrumb da Navegação
        browseBreadcrumb.innerHTML = '';
        const home = document.createElement('span');
        home.className = 'crumb';
        home.innerText = '🏠 Início';
        home.onclick = () => { currentBrowsePath = []; renderBrowseLevel(); };
        browseBreadcrumb.appendChild(home);

        currentBrowsePath.forEach((step, index) => {
            browseBreadcrumb.appendChild(document.createTextNode(' › '));
            const span = document.createElement('span');
            span.className = 'crumb';
            span.innerText = step.code;
            span.onclick = () => {
                currentBrowsePath = currentBrowsePath.slice(0, index + 1);
                renderBrowseLevel();
            };
            browseBreadcrumb.appendChild(span);
        });

        // Renderiza Lista de Itens (Pastas/Arquivos)
        browseList.innerHTML = '';
        if (items.length === 0) {
            browseList.innerHTML = '<div class="empty-state">Fim da hierarquia.</div>';
            return;
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = `folder-item ${item.hasChildren ? 'has-children' : 'is-leaf'}`;
            div.onclick = () => {
                if (item.hasChildren) {
                    currentBrowsePath.push(item);
                    renderBrowseLevel();
                } else {
                    // Se for item final, joga para a busca para ver detalhes
                    isBrowseMode = false;
                    browseBtn.classList.remove('active');
                    browseArea.style.display = 'none';
                    resultsArea.style.display = 'flex';
                    searchInput.value = item.code;
                    performSearch(item.code);
                }
            };

            div.innerHTML = `
                <span class="folder-icon">${item.hasChildren ? '📁' : '📄'}</span>
                <div class="folder-info">
                    <span class="folder-code">${item.code}</span>
                    <span class="folder-desc">${item.desc}</span>
                </div>
            `;
            browseList.appendChild(div);
        });
    }

    // Auxiliar para encontrar filhos na CDD (Lista Plana)
    function findDirectChildrenCDD(parentCode) {
        return dadosAtivos.filter(item => {
            if (parentCode === '') return item.code.length === 3 && item.code.endsWith('00');
            if (parentCode.endsWith('00')) return item.code.startsWith(parentCode[0]) && item.code.endsWith('0') && item.code !== parentCode;
            if (parentCode.endsWith('0')) return item.code.startsWith(parentCode.substring(0, 2)) && !item.code.includes('.') && item.code !== parentCode;
            return item.code.startsWith(parentCode + ".") && item.code.split('.').length === parentCode.split('.').length + 1;
        }).map(item => ({
            ...item,
            hasChildren: dadosAtivos.some(child => child.code.startsWith(item.code) && child.code !== item.code)
        })).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    // --- 4. MOTOR DE BUSCA (HÍBRIDO) ---
    function performSearch(query) {
        if (isBrowseMode) return;
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        let results = [];
        if (Array.isArray(dadosAtivos)) {
            // Busca Simples (CDD)
            results = dadosAtivos.filter(item => {
                const code = item.code.toLowerCase();
                const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
            });
        } else {
            // Busca Recursiva (CDU - Objeto)
            results = searchCDU(dadosAtivos, normalizedQuery);
        }
        
        displayResults(results, normalizedQuery);
    }

    function searchCDU(database, query) {
        let found = [];
        if (database.auxiliares) {
            found = found.concat(database.auxiliares.filter(item => {
                const cleanDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return item.code.toLowerCase().includes(query) || cleanDesc.includes(query);
            }).map(r => ({...r, path: []})));
        }

        function traverse(nodes, currentPath = []) {
            for (const key in nodes) {
                const node = nodes[key];
                const cleanDesc = node.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (key.toLowerCase().includes(query) || cleanDesc.includes(query)) {
                    found.push({ code: key, desc: node.desc, path: [...currentPath] });
                }
                if (node.children) traverse(node.children, [...currentPath, {code: key, desc: node.desc}]);
            }
        }
        if (database.principal) traverse(database.principal);
        return found;
    }

    // --- 5. RENDERIZAÇÃO DE RESULTADOS ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const isCDU = !Array.isArray(dadosAtivos);
        const fragment = document.createDocumentFragment();

        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>');

            card.innerHTML = `
                <span class="level-tag">${isCDU ? 'CDU' : 'CDD'}</span>
                <div class="level-content">
                    <div class="level-header"><span class="level-code">${item.code}</span></div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // Breadcrumb do resultado (Caminho Completo)
            let parents = isCDU ? (item.path || []) : getParentsCDD(item.code);
            if (parents.length > 0) {
                const pathHTML = parents.map(p => `<span>${p.code} ${p.desc}</span>`).join(' &rsaquo; ');
                const bDiv = document.createElement('div');
                bDiv.className = 'breadcrumb';
                bDiv.innerHTML = pathHTML;
                card.querySelector('.level-content').prepend(bDiv);
            }

            fragment.appendChild(card);
        });
        resultsArea.appendChild(fragment);
    }

    function getParentsCDD(code) {
        const potential = [];
        if (code.length >= 3) potential.push(code.charAt(0) + "00"); 
        if (code.length >= 3 && !isNaN(code.substring(0,2))) potential.push(code.substring(0, 2) + "0");
        if (code.includes('.')) potential.push(code.split('.')[0]);
        return [...new Set(potential)].filter(p => p !== code).map(p => dadosAtivos.find(d => d.code === p)).filter(Boolean).sort((a,b) => a.code.length - b.code.length);
    }

    // --- 6. EVENTOS ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300);
    });

    clearBtn.addEventListener('click', () => { searchInput.value = ''; handleInput(); searchInput.focus(); });
    
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
});
