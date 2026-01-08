document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do DOM
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
    let currentBrowsePath = []; // Histórico da navegação
    
    // 1. Inicialização Segura
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados (CDD/CDU) não carregados.</div>';
        return;
    }

    // 2. Troca de Base (CDD <-> CDU)
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            resetInterface(); // Reseta a tela ao trocar
            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU;
                searchInput.placeholder = "CDU: código ou termo...";
            } else {
                dadosAtivos = baseCDD;
                searchInput.placeholder = "CDD: código ou assunto...";
            }
        });
    });

    // Alternar Modo Navegação
    browseBtn.addEventListener('click', () => {
        isBrowseMode = !isBrowseMode;
        browseBtn.classList.toggle('active');
        
        if (isBrowseMode) {
            // Ativa navegação
            resultsArea.style.display = 'none';
            browseArea.style.display = 'block';
            currentBrowsePath = []; // Começa do zero
            renderBrowseLevel('');
        } else {
            // Volta para busca
            resultsArea.style.display = 'block';
            browseArea.style.display = 'none';
            searchInput.focus();
        }
    });

    function resetInterface() {
        searchInput.value = '';
        resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
        clearBtn.style.display = 'none';
        isBrowseMode = false;
        browseBtn.classList.remove('active');
        browseArea.style.display = 'none';
        resultsArea.style.display = 'block';
    }

    // 3. Lógica de Navegação (Browse Mode)
    function renderBrowseLevel(parentCode) {
        // Encontra filhos baseados no código pai
        const children = findDirectChildren(parentCode, dadosAtivos);
        
        updateBreadcrumbUI();
        browseList.innerHTML = '';
        
        if (children.length === 0) {
            browseList.innerHTML = '<div class="empty-state">Esta categoria não tem subitens.</div>';
            return;
        }

        children.forEach(item => {
            // Verifica se este item tem subitens para decidir se é pasta ou arquivo
            const subItems = findDirectChildren(item.code, dadosAtivos);
            const isFolder = subItems.length > 0;
            
            const div = document.createElement('div');
            div.className = `folder-item ${isFolder ? 'has-children' : 'is-leaf'}`;
            
            div.onclick = () => {
                if (isFolder) {
                    currentBrowsePath.push(item); // Entra na pasta
                    renderBrowseLevel(item.code);
                } else {
                    // Feedback visual se for folha
                    searchInput.value = item.code;
                    browseBtn.click(); // Volta para busca mostrando esse item
                    handleInput();
                }
            };

            div.innerHTML = `
                <span style="font-size:1.2rem; margin-right:10px;">${isFolder ? '📁' : '📄'}</span>
                <div class="folder-info">
                    <span class="folder-code">${item.code}</span>
                    <span class="folder-desc">${item.desc}</span>
                </div>
            `;
            browseList.appendChild(div);
        });
    }

    // Algoritmo: Encontra filhos em lista plana
    function findDirectChildren(parentCode, db) {
        const isCDU = (dadosAtivos === baseCDU);
        
        // Filtra candidatos que começam com o código pai
        const candidates = db.filter(item => {
            if (parentCode === '') {
                // Na raiz CDD: exibe 000, 100, 200... (tamanho 3, termina em 00)
                if (!isCDU) return item.code.length === 3 && item.code.endsWith('00');
                // Na raiz CDU: exibe 0, 1, 2... (tamanho 1)
                return item.code.length === 1 && !isNaN(item.code);
            }
            return item.code.startsWith(parentCode) && item.code !== parentCode;
        });

        // Filtra apenas o nível imediatamente abaixo
        return candidates.filter(child => {
            // Regra simplificada para performance:
            // CDU: Se pai é "0", filho deve ser "00", "01"...
            if (isCDU) {
                // Aceita apenas se for uma extensão lógica direta
                // Ex: de "0" para "00", de "00" para "001"
                return child.code.length > parentCode.length; 
            }
            // CDD: Lógica decimal estrita
            // Ex: de "300" para "330", de "330" para "331"
            return true; 
        }).filter((child, index, self) => {
            // Remove duplicatas lógicas mais profundas (Ex: não mostrar 331 se estou vendo 300, mostrar só 330)
            if (isCDU) {
                 // CDU é complexa, mostra tudo que começa com o pai e ordena
                 // Para melhorar, removemos itens que já têm um pai na lista atual
                 const parentInList = self.some(p => p !== child && child.code.startsWith(p.code));
                 return !parentInList;
            } else {
                // CDD
                if (parentCode.endsWith('00')) { // Estou em 300 -> quero 310, 320...
                    return child.code.charAt(1) !== '0' && child.code.endsWith('0'); 
                }
                if (parentCode.endsWith('0')) { // Estou em 330 -> quero 331, 332...
                    return !child.code.endsWith('0') && !child.code.includes('.');
                }
                return true;
            }
        }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    }

    function updateBreadcrumbUI() {
        browseBreadcrumb.innerHTML = '';
        const home = document.createElement('span');
        home.className = 'crumb';
        home.innerText = '🏠 Início';
        home.onclick = () => {
            currentBrowsePath = [];
            renderBrowseLevel('');
        };
        browseBreadcrumb.appendChild(home);

        currentBrowsePath.forEach((item, index) => {
            browseBreadcrumb.appendChild(document.createTextNode(' › '));
            const span = document.createElement('span');
            span.className = 'crumb';
            span.innerText = item.code;
            span.onclick = () => {
                currentBrowsePath = currentBrowsePath.slice(0, index + 1);
                renderBrowseLevel(item.code);
            };
            browseBreadcrumb.appendChild(span);
        });
    }

    // 4. Busca Normal
    function handleInput() {
        if(isBrowseMode) return;
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        const results = dadosAtivos.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        const isCDU = (dadosAtivos === baseCDU);
        const currentDbLabel = isCDU ? 'CDU' : 'CDD';

        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            card.innerHTML = `
                <span class="level-tag">${currentDbLabel}</span>
                <div class="level-content">
                    <div class="level-header"><span class="level-code">${item.code}</span></div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;
            
            // Breadcrumb Completo (Sem cortes)
            const parents = getParents(item.code, isCDU);
            if (parents.length > 0) {
                const fullPathHTML = parents.map(p => `<span>${p.code} ${p.desc}</span>`).join(' &rsaquo; ');
                const div = document.createElement('div');
                div.className = 'breadcrumb';
                div.innerHTML = fullPathHTML;
                card.querySelector('.level-content').prepend(div);
            }

            fragment.appendChild(card);
        });
        resultsArea.appendChild(fragment);
    }

    function getParents(code, isCDU) {
        const potentialParents = new Set();
        if (isCDU) {
            for (let i = 1; i < code.length; i++) {
                let part = code.substring(0, i);
                if (part.endsWith('.')) part = part.slice(0, -1);
                if (part.length > 0 && part !== code) potentialParents.add(part);
            }
            if (code.includes('.')) potentialParents.add(code.split('.')[0]);
        } else {
            if (code.length >= 3) potentialParents.add(code.charAt(0) + "00"); 
            if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.add(code.substring(0, 2) + "0"); 
            if (code.includes('.')) potentialParents.add(code.split('.')[0]);
        }
        potentialParents.delete(code);
        return Array.from(potentialParents)
            .map(pCode => dadosAtivos.find(d => d.code === pCode))
            .filter(Boolean)
            .sort((a, b) => a.code.length - b.code.length);
    }

    // Eventos Gerais
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
});
