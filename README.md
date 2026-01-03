# Busca CDD (Classificação Decimal de Dewey)

> Uma ferramenta web progressiva (PWA) leve, offline e rápida para consulta de códigos de classificação biblioteconômica.

![Status](https://img.shields.io/badge/Status-Funcional-green)
![Licença](https://img.shields.io/badge/License-MIT-yellow)
![Plataforma](https://img.shields.io/badge/Plataforma-Web%20(PWA)-orange)

## Acesse Agora
**[Clique aqui para usar o App](https://tr.ee/consulta)**

---

## Sobre o Projeto
Este projeto foi criado para facilitar a vida de bibliotecários, estudantes e organizadores de acervos pessoais. Diferente de sistemas complexos, o **Busca CDD** foca em:
1. **Velocidade:** Resultados instantâneos enquanto digita.
2. **Offline:** Funciona sem internet após o primeiro acesso (via cache do Service Worker).
3. **Simplicidade:** Interface limpa e direta.

## Plataforma e Compatibilidade
O Busca CDD é um Progressive Web App (PWA) — ou seja, é uma aplicação web que pode ser instalada no dispositivo a partir do navegador. 

Pontos importantes:

- Requer HTTPS para funcionar corretamente como PWA (service worker e cache).
- Suporte completo em: Chrome, Edge, Firefox (desktop e Android).
- iOS/Safari: suporta instalação via "Adicionar à Tela de Início" e cache básico, mas possui limitações.
- Funciona em desktop e em dispositivos móveis — porém não é um aplicativo nativo.

## Instalação
- Android / Chrome: abra o site e selecione "Adicionar à tela inicial" no menu do Chrome.
- iOS / Safari: abra o site, toque em compartilhar → "Adicionar à tela de início".
Observação: para aparecer a opção de instalação, o navegador precisa suportar manifest.json e service workers.

## Funcionalidades
- **Busca Híbrida:** Pesquise pelo código numérico (ex: `512`) ou por palavras-chave (ex: `Matemática`).
- **Visualização Hierárquica:** Ao digitar um código específico, o sistema mostra automaticamente a Classe e a Divisão a qual ele pertence.
- **Instalável (PWA):** Pode ser instalado no Android/iOS como um app (Adicionar à Tela Inicial).
- **Offline:** Após o primeiro carregamento online, a maior parte da aplicação e dos dados ficam disponíveis offline, graças ao service worker.
- **Feedback Visual:** Indica quando um código é válido ou se não consta na base de dados.

## Tecnologias
- **HTML5 & CSS3:** Design responsivo e moderno.
- **JavaScript:** Lógica de busca e renderização sem frameworks pesados.
- **JSON:** Base de dados simples e desacoplada em arquivo separado.  
Arquivos importantes: `manifest.json`, `service-worker.js`, `dados.js`

## Dados e Licenças

### O Software
O código-fonte deste aplicativo (HTML, CSS, lógica JavaScript e algoritmos de busca) é distribuído sob a licença **MIT**. 
Sinta-se livre para usar a estrutura do app em seus próprios projetos.

### Os Dados (CDD / DDC)
As descrições das classes e categorias contidas no arquivo `dados.js` baseiam-se na **Classificação Decimal de Dewey (DDC)**, que é propriedade intelectual da **OCLC (Online Computer Library Center)**.  
- Atenção: os dados da DDC podem estar sujeitos a restrições de uso e licenciamento pela OCLC. Se você pretende usar este projeto em contexto comercial ou distribuir os dados, recomenda-se:
  - Adquirir a licença apropriada da OCLC para a DDC; ou
  - Substituir o arquivo `dados.js` por uma base de dados de classificação alternativa cujos termos de uso permitam o seu uso desejado.

## Contribuição
Contribuições são bem-vindas! Abra issues ou PRs para correções, melhorias e novas features.

## Licença
Código: MIT. Consulte o cabeçalho do repositório para o arquivo LICENSE.
