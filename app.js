document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1. INICIALIZAÇÃO ---
    // Verifica se as bases foram carregadas via HTML
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados (CDD/CDU) não carregados.</div>';
        return;
    }

    // --- 2. TROCA DE BASE ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU; // Agora trata como Lista (baseado no seu último arquivo)
                searchInput.placeholder = "CDU: código ou termo...";
            } else {
                dadosAtivos = baseCDD;
                searchInput.placeholder = "CDD: código ou assunto...";
            }
            searchInput.focus();
        });
    });

    // --- 3. INPUT ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 4. BUSCA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        // Busca unificada (ambos são listas)
        const results = dadosAtivos.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    // --- 5. EXIBIÇÃO ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        const isCDU = document.querySelector('input[name="database"]:checked').value === 'cdu';
        const currentDbLabel = isCDU ? 'CDU' : 'CDD';

        // Limita resultados para performance
        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            // Highlight do termo
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Estrutura Básica
            card.innerHTML = `
                <span class="level-tag">${currentDbLabel}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // --- LÓGICA DO BREADCRUMB (Caminho Completo) ---
            const parents = getParents(item.code, isCDU);
            
            if (parents.length > 0) {
                // Monta o HTML com o texto COMPLETO (sem cortes)
                const fullPathHTML = parents.map(p => 
                    `<span>${p.code} ${p.desc}</span>`
                ).join(' &rsaquo; '); // Seta separadora

                // Cria elemento visual
                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = fullPathHTML; // Insere o caminho direto
                
                // Insere no topo do card
                card.querySelector('.level-content').prepend(breadcrumbDiv);
            }

            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6. FUNÇÕES AUXILIARES ---
    function getParents(code, isCDU) {
        const potentialParents = new Set();
        
        if (isCDU) {
            // Lógica CDU: Fatiar prefixos (Ex: 004 -> busca 00 -> busca 0)
            for (let i = 1; i < code.length; i++) {
                let part = code.substring(0, i);
                if (part.endsWith('.')) part = part.slice(0, -1); // Remove ponto final solto
                if (part.length > 0 && part !== code) potentialParents.add(part);
            }
            if (code.includes('.')) potentialParents.add(code.split('.')[0]); // Garante o nível antes do ponto
        } else {
            // Lógica CDD: Decimal Estrito (Ex: 331 -> 330 -> 300)
            if (code.length >= 3) potentialParents.add(code.charAt(0) + "00"); 
            if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.add(code.substring(0, 2) + "0"); 
            if (code.includes('.')) potentialParents.add(code.split('.')[0]);
        }
        
        potentialParents.delete(code); // Remove o próprio item

        // Busca os objetos completos na base de dados
        return Array.from(potentialParents)
            .map(pCode => dadosAtivos.find(d => d.code === pCode))
            .filter(Boolean) // Remove nulos
            .sort((a, b) => a.code.length - b.code.length); // Ordena do menor para o maior
    }

    // --- 7. EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    // Tema Escuro
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // PWA Cache
    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
