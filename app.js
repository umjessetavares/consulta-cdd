document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS ---
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const dbRadios = document.querySelectorAll('input[name="database"]');
    
    let debounceTimer;
    
    // --- 1 INICIALIZAÇÃO ---
    // Carrega a base padrão (CDD) ou lista vazia se der erro
    let dadosAtivos = (typeof baseCDD !== 'undefined') ? baseCDD : [];

    if (typeof baseCDD === 'undefined' || typeof baseCDU === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: Arquivos de dados não carregados.</div>';
        return;
    }

    // --- 2 TROCA DE BASE ---
    dbRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            searchInput.value = '';
            resultsArea.innerHTML = '<div class="empty-state">Base alterada. Faça sua consulta!</div>';
            clearBtn.style.display = 'none';

            if (e.target.value === 'cdu') {
                dadosAtivos = baseCDU;
                searchInput.placeholder = "CDU: código ou termo...";
            } else {
                dadosAtivos = baseCDD;
                searchInput.placeholder = "CDD: código ou assunto...";
            }
            searchInput.focus();
        });
    });

    // --- 3 INPUT ---
    function handleInput() {
        const query = searchInput.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(query), 300); 
    }

    // --- 4 BUSCA ---
    function performSearch(query) {
        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (query.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
            return;
        }

        // Filtra na lista ativa (seja CDD ou CDU)
        const results = dadosAtivos.filter(item => {
            const code = item.code.toLowerCase();
            const desc = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return code.includes(normalizedQuery) || desc.includes(normalizedQuery);
        });
        
        displayResults(results, normalizedQuery);
    }

    // --- 5 EXIBIÇÃO (COM HIERARQUIA CLICÁVEL) ---
    function displayResults(results, q) {
        resultsArea.innerHTML = ''; 
        if (results.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Nada encontrado.</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        // Identifica qual base está selecionada para ajustar a lógica de pais
        const isCDU = document.querySelector('input[name="database"]:checked').value === 'cdu';
        const currentDbLabel = isCDU ? 'CDU' : 'CDD';

        results.slice(0, 50).forEach(item => {
            const mainClass = item.code.charAt(0);
            // Define cor (usa cinza '0' se não começar com número)
            const colorClass = (isNaN(mainClass) && mainClass !== '(' && mainClass !== '"') ? '0' : mainClass.replace(/[^0-9]/g, '').charAt(0) || '0';
            
            const card = document.createElement('div');
            card.className = `level-card class-${colorClass}`;

            // Grifa o termo buscado
            const regex = new RegExp(`(${q})`, 'gi');
            let highlightedDesc = item.desc;
            try { highlightedDesc = item.desc.replace(regex, '<mark>$1</mark>'); } catch(e){}

            // Estrutura do Card
            card.innerHTML = `
                <span class="level-tag">${currentDbLabel}</span>
                <div class="level-content">
                    <div class="level-header">
                        <span class="level-code">${item.code}</span>
                    </div>
                    <span class="level-desc">${highlightedDesc}</span>
                </div>
            `;

            // --- CÁLCULO DOS PAIS (HIERARQUIA) ---
            const parents = getParents(item.code, isCDU);
            
            if (parents.length > 0) {
                // HTML Versão Curta (Linha única)
                const shortHtml = parents.map(p => 
                    `<span>${p.code} ${truncate(p.desc)}</span>`
                ).join(' &rsaquo; ');

                // HTML Versão Longa (Expandido verticalmente)
                const fullHtml = parents.map(p => 
                    `<div style="margin: 4px 0;"><strong>${p.code}</strong> ${p.desc}</div>`
                ).join('<div style="color:var(--border); text-align:center; line-height:10px; font-size:12px;">↓</div>');

                // Cria elemento clicável
                const breadcrumbDiv = document.createElement('div');
                breadcrumbDiv.className = 'breadcrumb';
                breadcrumbDiv.innerHTML = shortHtml;
                breadcrumbDiv.title = "Clique para ver a hierarquia completa";
                
                // Evento de Clique (Expandir/Recolher)
                breadcrumbDiv.onclick = (e) => {
                    e.stopPropagation(); // Impede clique fantasma
                    
                    if (breadcrumbDiv.innerHTML === shortHtml) {
                        // EXPANDE
                        breadcrumbDiv.innerHTML = fullHtml;
                        breadcrumbDiv.style.whiteSpace = "normal";
                        breadcrumbDiv.style.overflow = "visible";
                        breadcrumbDiv.style.borderBottom = "1px solid var(--border)";
                        breadcrumbDiv.style.paddingBottom = "8px";
                        breadcrumbDiv.style.marginBottom = "8px";
                    } else {
                        // RECOLHE
                        breadcrumbDiv.innerHTML = shortHtml;
                        breadcrumbDiv.style.whiteSpace = "nowrap";
                        breadcrumbDiv.style.overflow = "hidden";
                        breadcrumbDiv.style.borderBottom = "none";
                        breadcrumbDiv.style.paddingBottom = "4px";
                        breadcrumbDiv.style.marginBottom = "0.5rem";
                    }
                };

                // Insere no topo do card
                card.querySelector('.level-content').prepend(breadcrumbDiv);
            }

            fragment.appendChild(card);
        });

        resultsArea.appendChild(fragment);
    }

    // --- 6 FUNÇÕES AUXILIARES ---
    
    function getParents(code, isCDU) {
        const potentialParents = new Set();
        
        if (isCDU) {
            // Lógica para CDU: Fatiar o código (Prefixos)
            // Ex: "004.2" -> tenta achar "0", "00", "004"
            let accumulated = "";
            // Remove pontos para iterar, mas reconstrói com cuidado se necessário. 
            // Simplificação: gera substrings progressivas
            for (let i = 1; i < code.length; i++) {
                // Pega prefixos (ex: "0", "00")
                let part = code.substring(0, i);
                // Evita adicionar ponto sozinho
                if (part.endsWith('.')) part = part.slice(0, -1);
                if (part.length > 0 && part !== code) potentialParents.add(part);
            }
            // Garante que pega antes do ponto (ex: 331.1 -> 331)
            if (code.includes('.')) potentialParents.add(code.split('.')[0]);

        } else {
            // Lógica para CDD: Baseada em centenas/dezenas (Decimal estrito)
            if (code.length >= 3) potentialParents.add(code.charAt(0) + "00"); // 512 -> 500
            if (code.length >= 3 && !isNaN(code.substring(0,2))) potentialParents.add(code.substring(0, 2) + "0"); // 512 -> 510
            if (code.includes('.')) potentialParents.add(code.split('.')[0]);
        }
        
        // Remove o próprio código da lista de pais
        potentialParents.delete(code);

        // Busca os códigos gerados no banco de dados real
        return Array.from(potentialParents)
            .map(pCode => dadosAtivos.find(d => d.code === pCode)) // Encontra o objeto
            .filter(Boolean) // Remove nulos (códigos que não existem na base)
            .sort((a, b) => a.code.length - b.code.length); // Ordena do mais curto (geral) para o longo (específico)
    }

    function truncate(str, n = 22) {
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
    }

    // --- 7 EVENTOS GERAIS ---
    searchInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); handleInput(); });
    
    // Tema
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
});
