# Portal de Serviços Profissionais

Sistema web para conectar prestadores de serviço e empresas, com cadastro de currículos e busca por profissão.

## Funcionalidades

### Para Prestadores de Serviço
- Cadastro e login exclusivo
- Adicionar/editar currículo profissional
- Visualizar exemplo de currículo bem elaborado
- Campos completos: experiência, formação, habilidades, certificações, idiomas

### Para Empresas
- Cadastro e login exclusivo
- Visualizar todos os currículos dos prestadores cadastrados
- Filtrar currículos por profissão
- Ver detalhes completos e informações de contato

## Como Usar

1. Abra o arquivo `index.html` no navegador
2. Escolha se você é Prestador de Serviço ou Empresa
3. Faça seu cadastro ou login
4. **Prestadores**: Adicione seu currículo na área do prestador
5. **Empresas**: Navegue pelos currículos e filtre por profissão

## Estrutura de Arquivos

- `index.html` - Página inicial com login/cadastro
- `prestador.html` - Área do prestador de serviço
- `empresa.html` - Área da empresa
- `styles.css` - Estilos e design formal
- `script.js` - Sistema de autenticação
- `prestador.js` - Funcionalidades do prestador
- `empresa.js` - Funcionalidades da empresa

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage para persistência de dados

## Notas

- Os dados são armazenados localmente no navegador (LocalStorage)
- Para produção, recomenda-se implementar um backend com banco de dados
- O design é responsivo e funciona em dispositivos móveis
