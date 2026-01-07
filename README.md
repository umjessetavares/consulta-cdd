# Busca CDD (Classificação Decimal de Dewey)

![Status](https://img.shields.io/badge/Status-Funcional-green)
![Licença](https://img.shields.io/badge/License-MIT-yellow)
![Plataforma](https://img.shields.io/badge/Plataforma-Web%20(PWA)-orange)
![Segurança](https://img.shields.io/badge/Security-CSP%20%26%20Sanitized-blue)

## Acesse Agora
**[Clique aqui para usar o App](https://tr.ee/consulta)**

---

## Sobre o Projeto
O **Busca CDD** é uma ferramenta básica para bibliotecários e estudantes que precisam de agilidade. Diferente de PDFs pesados ou sistemas complexos, este app oferece:
1. **Busca Inteligente:** Encontra termos compostos (ex: "historia brasil") instantaneamente.
2. **Modo Escuro:** Interface confortável para uso noturno ou ambientes com pouca luz.
3. **Segurança:** Proteção contra injeção de scripts e privacidade reforçada.

## Novidades 
- **🌙 Modo Escuro:** Alternância de tema (Claro/Escuro) com persistência de preferência do usuário.
- **🔍 Busca Aprimorada:** O algoritmo agora aceita múltiplos termos e ignora acentuação para facilitar a pesquisa.
- **🛡️ Segurança:** Implementação de *Content Security Policy* (CSP) e sanitização de inputs no JavaScript.
- **⚡ Performance:** Lógica separada em arquivo `app.js` para carregamento mais eficiente.

## Funcionalidades
- **Busca Híbrida:** Pesquise pelo código (ex: `512`) ou palavras-chave (ex: `Direito`).
- **Visualização Hierárquica:** Mostra a Classe, Divisão e Seção do código pesquisado.
- **Instalável (PWA):** Funciona como app nativo no Android, iOS e Desktop.
- **Offline:** Acessível sem internet após o primeiro uso.
- **Feedback Visual:** Cores dinâmicas para as classes e mensagens de erro tratadas.

## Tecnologias e Estrutura

- **HTML5:** Estrutura semântica, acessível e otimizada.
- **CSS3:** Estilização modular em arquivo separado (`style.css`), utilizando variáveis (`:root`) para gerenciamento do Modo Escuro.
- **JavaScript (ES6+):** Lógica segura e sem dependências externas.
- **PWA:** Configurado para instalação nativa e uso offline.

### Arquitetura
- `index.html`: Estrutura base e políticas de segurança (CSP).
- `style.css`: Folha de estilos visual (separada do HTML).
- `app.js`: Lógica de busca, manipulação de DOM e controle de tema.
- `dados.js`: Base de dados CDD desacoplada.
- `service-worker.js`: Gerenciamento de cache e funcionamento offline.
- `manifest.json`: Metadados para instalação em dispositivos móveis e desktop.

## Instalação (PWA)
1. **Android / Chrome:** Acesse o site e toque em "Adicionar à tela inicial".
2. **iOS / Safari:** Toque no botão Compartilhar → "Adicionar à tela de início".
3. **PC:** Clique no ícone de instalação (+) na barra de endereço do navegador.

## Dados e Licenças
### O Software
Código-fonte distribuído sob licença **MIT**. Você pode modificar e usar a estrutura livremente.

### Os Dados (CDD)
As descrições baseiam-se na **Classificação Decimal de Dewey (DDC)**, propriedade da **OCLC**. Este projeto é para fins educacionais e de referência rápida.
- *Para uso comercial dos dados, verifique o licenciamento junto à OCLC.*

## Contribuição
Sugestões e correções são bem-vindas. Sinta-se à vontade para abrir uma Issue ou Pull Request.

## Licença
Consulte o arquivo LICENSE no repositório.
