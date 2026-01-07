document.addEventListener('DOMContentLoaded', () => {
    
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    
    // Variável que receberá o JSON
    let dados = []; 
    let debounceTimer;

    // --- 1 CARREGAR DADOS (JSON) ---
    fetch('./dados.json')
        .then(response => {
            if (!response.ok) throw new Error("Erro HTTP: " + response.status);
            return response.json();
        })
        .then(json => {
            dados = json;
            console.log('Base de dados carregada via JSON.');
        })
        .catch(err => {
            console.error(err);
            resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro ao carregar dados.json</div>';
        });

    // --- 2 CONTROLE DE DIGITAÇÃO ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 3 LÓGICA DE BUSCA ---
    function performSearch(query) {
        // Se o JSON ainda não carregou, para aqui
        if (!dados || dados.length === 0) return;

        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        const results = dados.filter(item => {
            const itemCode = item.code.toLowerCase();
            const itemDesc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return itemCode.includes(normalizedQuery) || itemDesc.includes(normalizedQuery);
        });

        displayResults(results, normalizedQuery);
    }

    // --- 4 EXIBIR RESULTADOS ---
    function displayResults(results, normalizedQuery) {
        resultsArea.innerHTML = ''; 

        if (results.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'Nenhum código encontrado.';
            resultsArea.appendChild(emptyState);
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach(item => {
            const mainClass = item.code.charAt(0);
            
            const card = document.createElement('div');
            card.className = `level-card class-${mainClass}`;

            const tag = document.createElement('span');
            tag.className = 'level-tag';
            tag.textContent = `Classe ${mainClass}00`;

            const content = document.createElement('div');
            content.className = 'level-content';

            // --- HIERARQUIA (BREADCRUMB) ---
            const hierarchy = getBreadcrumb(item.code);
            if (hierarchy) {
                const breadcrumbSpan = document.createElement('span');
                breadcrumbSpan.className = 'breadcrumb';
                breadcrumbSpan.innerHTML = hierarchy;
                content.appendChild(breadcrumbSpan);
            }

            // Código
            const codeSpan = document.createElement('span');
            codeSpan.className = 'level-code';
            codeSpan.textContent = item.code;

            // Descrição
            const descSpan = document.createElement('span');
            descSpan.className = 'level-desc';
            descSpan.innerHTML = highlightTerm(item.desc, normalizedQuery);

            content.appendChild(codeSpan);
            content.appendChild(descSpan);
            card.appendChild(tag);
            card.appendChild(content);
            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- FUNÇÃO DE HIERARQUIA (Baseada no JSON) ---
    function getBreadcrumb(currentCode) {
        if (!currentCode) return '';
        const parents = new Set();
        const c = currentCode;

        // Regras para encontrar os "pais"
        if (c.length >= 3) parents.add(c.charAt(0) + "00"); // Classe (500)
        if (c.length >= 3 && c.charAt(1) !== '0') parents.add(c.substring(0, 2) + "0"); // Divisão (510)
        if (c.includes('.')) parents.add(c.split('.')[0]); // Seção inteira (512)
        
        // Decimais intermediários (ex: 001.9 -> 001.94)
        if (c.includes('.')) {
            let parts = c.split('.');
            let prefix = parts[0] + '.';
            let decimals = parts[1];
            for (let i = 1; i < decimals.length; i++) {
                parents.add(prefix + decimals.substring(0, i));
            }
        }

        parents.delete(currentCode); // Remove o próprio item

        // Busca os pais dentro da variável 'dados' (que veio do JSON)
        const trail = Array.from(parents)
            .sort()
            .map(parentCode => {
                const found = dados.find(d => d.code === parentCode);
                return found ? `${found.code} ${found.desc.split(' ')[0]}...` : null; 
            })
            .filter(item => item !== null);

        if (trail.length === 0) return '';
        return trail.join(' &rsaquo; ');
    }

    function highlightTerm(text, query) {
        if (!query) return text;
