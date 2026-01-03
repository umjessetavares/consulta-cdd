# Busca CDD (Classificação Decimal de Dewey)

> Uma ferramenta web progressiva (PWA) leve, offline e rápida para consulta de códigos de classificação biblioteconômica.

![Status](https://img.shields.io/badge/Status-Funcional-green)
![Licença](https://img.shields.io/badge/License-MIT-yellow)
![Platforma](https://img.shields.io/badge/Plataforma-Web-orange)

## Acesse Agora
**[Clique aqui para usar o App](https://tr.ee/consulta)**

---

## Sobre o Projeto
Este projeto foi criado para facilitar a vida de bibliotecários, estudantes e organizadores de acervos pessoais. Diferente de sistemas complexos, o **Busca CDD** foca em:
1.  **Velocidade:** Resultados instantâneos enquanto digita.
2.  **Offline:** Funciona sem internet após o primeiro acesso.
3.  **Simplicidade:** Interface limpa e direta.

## Funcionalidades
- **Busca Híbrida:** Pesquise pelo código numérico (ex: `512`) ou por palavras-chave (ex: `Matemática`).
- **Visualização Hierárquica:** Ao digitar um código específico, o sistema mostra automaticamente a Classe e a Divisão a qual ele pertence.
- **Instalável (PWA):** Pode ser instalado no Android/iOS como um aplicativo nativo (Adicionar à Tela Inicial).
- **Feedback Visual:** Indica quando um código é válido ou se não consta na base de dados.

## Tecnologias
- **HTML5 & CSS3:** Design responsivo e moderno.
- **JavaScript:** Lógica de busca e renderização sem frameworks pesados.
- **JSON:** Base de dados simples e desacoplada em arquivo separado.

## Licença e Direitos Autorais

### O Software
O código-fonte deste aplicativo (HTML, CSS, Lógica JavaScript e Algoritmos de busca) é distribuído sob a licença **MIT**. Sinta-se livre para usar a estrutura do app em seus próprios projetos.

### Os Dados (CDD)
As descrições das classes e categorias contidas no arquivo `dados.js` baseiam-se na **Classificação Decimal de Dewey (DDC)**, que é propriedade intelectual da **OCLC (Online Computer Library Center)**. Este projeto utiliza os dados dos "Sumários da DDC" para fins de **estudo, catalogação pessoal e referência educacional**.

> **Atenção:** Se você pretende fazer um fork deste projeto para uso comercial, recomenda-se adquirir uma licença oficial da OCLC ou substituir o arquivo de dados por outra classificação de domínio público.
