document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------
    // Utilitários de segurança e texto
    // -----------------------------
    function removeAcentos(str) {
        if (!str) return "";
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function escapeHtml(unsafe) {
        if (unsafe == null) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // -----------------------------
    // Elementos e estado
    // -----------------------------
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const resultsArea = document.getElementById('resultsArea');
    let timeoutId;

    // Se dados não carregaram, bloqueia interação e mostra erro (evita exceções)
    if (typeof cddDatabase === 'undefined') {
        resultsArea.innerHTML = '<div class="empty-state" style="color:red">Erro: O arquivo dados.js não foi carregado.</div>';
        if (input) input.disabled = true;
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        // Inicializar handlers apenas se a base existir
        function updateClearButtonVisibility() {
            if (input.value && input.value.length > 0) {
                clearBtn.style.display = 'block';
            } else {
                clearBtn.style.display = 'none';
            }
        }

        input.addEventListener('input', (e) => {
            updateClearButtonVisibility();
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                executarBusca(e.target.value);
            }, 300);
        });

        clearBtn.addEventListener('click', clearSearch);

        // Exibir inicialmente conforme placeholder
        updateClearButtonVisibility();
    }

    // -----------------------------
    // Lógica de busca
    // -----------------------------
    function executarBusca(rawValue) {
        if (typeof cddDatabase === 'undefined') return;

        const cleanValue = rawValue.trim();

        if (cleanValue.length === 0) {
            resultsArea.innerHTML = '<div class="empty-state">Acervo CDD.</div>';
            return;
        }

        let resultsHTML = '';
        const isNumberSearch = /^\d/.test(cleanValue);

        if (isNumberSearch) {
            // Tratar somente dígitos e limitar à primeira parte significativa
            const digits = cleanValue.replace(/\D/g, '').slice(0, 3);

            if (digits.length >= 1) {
                const level1 = digits.charAt(0) + "00";
                resultsHTML += buildCardHTML(level1, "Classe Principal", cddDatabase[level1], !!cddDatabase[level1]);
            }
            if (digits.length >= 2) {
                const level2 = digits.substring(0, 2) + "0";
                if (level2 !== (digits.charAt(0) + "00")) {
                    resultsHTML += buildCardHTML(level2, "Divisão", cddDatabase[level2], !!cddDatabase[level2]);
                }
            }
            if (digits.length >= 3) {
                const level3 = digits.substring(0, 3);
                resultsHTML += buildCardHTML(level3, "Seção / Específico", cddDatabase[level3], !!cddDatabase[level3]);
            }

        } else {
            // --- Busca Inteligente (Múltiplos Termos) ---
            const searchTerms = removeAcentos(cleanValue).split(/\s+/).filter(t => t.length > 0);
            
            let count = 0;
            const maxResults = 30;

            for (const [code, desc] of Object.entries(cddDatabase)) {
                if (!desc) continue;
                
                const normalizedDesc = removeAcentos(desc);
                
                // Verifica se TODAS as palavras digitadas existem na descrição
                const allTermsMatch = searchTerms.every(term => normalizedDesc.includes(term));

                if (allTermsMatch) {
                    // Destaque apenas no primeiro termo encontrado para simplificar visualização
                    const highlightedDesc = highlightText(desc, searchTerms[0]); 
                    resultsHTML += buildCardHTML(code, "Encontrado", highlightedDesc, true);
                    count++;
                    if (count >= maxResults) break;
                }
            }

            if (count === 0) {
                resultsHTML = '<div class="empty-state">Nenhum termo encontrado. Tente sinônimos.</div>';
            }
        }

        resultsArea.innerHTML = resultsHTML;
    }

    function clearSearch() {
        input.value = '';
        resultsArea.innerHTML = '<div class="empty-state">Faça sua consulta!</div>';
        input.focus();
        clearBtn.style.display = 'none';
    }

    function highlightText(text, term) {
        if (!term) return escapeHtml(text);
        const normalizedText = removeAcentos(text);
        const normalizedTerm = removeAcentos(term).toLowerCase();
        if (!normalizedTerm) return escapeHtml(text);

        let startIndex = 0;
        let resultParts = [];
        let lastIndex = 0;
        const lowerNormText = normalizedText.toLowerCase();

        while (true) {
            const idx = lowerNormText.indexOf(normalizedTerm, startIndex);
            if (idx === -1) break;
            const before = escapeHtml(text.slice(lastIndex, idx));
            const match = escapeHtml(text.slice(idx, idx + normalizedTerm.length));
            resultParts.push(before);
            resultParts.push(`<mark>${match}</mark>`);
            lastIndex = idx + normalizedTerm.length;
            startIndex = lastIndex;
        }
        resultParts.push(escapeHtml(text.slice(lastIndex)));
        return resultParts.join('');
    }

    function buildCardHTML(code, tagLabel, content, exists) {
        const firstDigit = String(code).charAt(0) || '0';
        const colorClass = `class-${!isNaN(firstDigit) ? firstDigit : '0'}`;
        const finalContent = exists ? content : "Código não cadastrado na base";
        const missingClass = !exists ? 'desc-missing' : '';

        return `
            <div class="level-card ${colorClass}">
                <span class="level-tag">${escapeHtml(tagLabel)}</span>
                <div class="level-content">
                    <span class="level-code">${escapeHtml(code)}</span>
                    <span class="level-desc ${missingClass}">${finalContent}</span>
                </div>
            </div>
        `;
    }
});
