# Verificação do projeto

## Dados e método

- Resultados nacionais, UFs e 5.571 unidades eleitorais nacionais reconciliados nos dois turnos, incluindo exterior no total nacional. O retrato original passou por 122.166 verificações numéricas e estruturais em 11.572 arquivos EA20.
- 3.800.511 linhas do CSV presidencial por seção lidas integralmente. O CSV só contém o primeiro turno. Todas as seções foram agregadas por município e os cinco campos de votos coincidiram exatamente com o EA20: Lula, Flávio, válidos, brancos e nulos.
- 1.034.358 linhas do cadastro de locais lidas: 517.179 por turno. Para unidades nacionais, foram preservados 514.464 registros de seções e 497.897 urnas com votação no primeiro turno.
- 36 BUs reais do segundo turno de município de amostra-PE consultados e somados: Lula 7.734, Flávio 1.986, válidos 9.720, brancos 86, nulos 209, comparecimento 10.015 e aptos 12.361. Todos coincidem com o EA20 municipal. URLs e relatório em `tests/município de amostra-validation.json`.
- BUs adicionais do Acre, com outra eleição coexistente, e de Katmandu, com Sistema de Apuração, usados para validar variantes.
- Cinco arquivos de BU reais preservados para testes. Conteúdo truncado, bytes extras, ambiente simulado, tamanho e estrutura inválidos são rejeitados.
- Assinaturas criptográficas não verificadas. Os testes conferem leitura numérica e identidade, não são auditoria da eleição.

## Testes automáticos

`npm test`: 15 testes passaram, incluindo reconciliação de todas as cidades, matemática da virada, leitura de BUs reais, rejeição de dados inválidos, escolha única de geração totalizada e recusa de parâmetros não permitidos na API.

Os manifestos em `sources/` registram as fontes e os hashes dos ZIPs oficiais usados na coleta; os ZIPs não são versionados no repositório. O CSV nominal de primeira geração e o EA20 têm diferenças de destinação descritas no README; a montagem só foi aceita após fechar as somas em todos os municípios.

## Navegador

O registro final de verificações de navegação, publicação e limites está na seção abaixo, preenchida durante a entrega. Testes em viewport de celular não substituem teste em aparelho físico ou Safari/WebKit.

Testado no navegador integrado Chromium com dados reais:

- Tela de 390 × 844: abertura, leitura dos três passos, conta e navegação.
- Telas de 320 × 844, 430 × 932 e 1.440 × 1.000: ausência de excesso horizontal da página; navegação, abertura e ranking inspecionados.
- Busca município de amostra-PE → Escola local de exemplo → soma automática de dez urnas em cada turno. Resultado observado: Lula 1.954 → 2.180; Flávio 531 → 607; mudança de margem +150.
- Seleção separada da seção 113 / zona 94: Lula 196 → 218, Flávio 47 → 60, mudança de margem +9. Links oficiais exibidos.
- Seção 98 / zona 17 de Alta Floresta D'Oeste-RO: mapeada à urna principal 81, aviso de grupo 81 + 98 e votos conjuntos. Lula 91 → 110, Flávio 50 → 41.
- Seção 80 / zona 17 do mesmo município: aviso de mudança no cadastro do local e grupo 80 + 100. Não foi apresentada como votação isolada.
- Mapa carregou 5.570 polígonos, filtro PE, modo mudança de margem e zoom por botão.
- Card para stories gerado por clique e baixado: PNG 1080 × 1920.
- Prévia social renderizada e salva: JPEG 1199 × 630.
- Nenhum erro/aviso de console na sessão inspecionada.

Não houve teste em iPhone físico, Safari/WebKit ou navegador interno do Instagram. Pinça foi implementada, mas não testada em aparelho físico. Não foi feita uma simulação de queda de rede ou bloqueio de CORS no navegador; a API evita a dependência de CORS do TSE e trata falhas sem inventar resultados. Não foram consultadas todas as urnas do segundo turno: a busca consulta sob demanda, e a reconciliação completa de 36 urnas foi feita em município de amostra.

## Publicação pública e reprodução do erro informado

- GitHub Pages e espelho responderam HTTP 200 sem autenticação. HTML, JavaScript, CSS, JSON de município de amostra e prévia JPEG também responderam 200.
- API hospedada retornou HTTP 200 e Access-Control-Allow-Origin: * para a seção 142 / zona 94 de município de amostra. O retorno real foi Lula 212, Flávio 62, válidos 274, brancos 5 e nulos 8.
- No navegador, o GitHub Pages consultou a API do espelho por CORS e exibiu a seção 142: Lula 191 → 212 e Flávio 58 → 62.
- A Escola Padre Antonio Barbosa Junior foi consultada pelo site público: oito urnas por turno, Lula 1.627 → 1.791, Flávio 444 → 474, mudança de margem +134. Nenhum erro ou aviso de console na consulta.
- O erro de conexão informado pelo usuário coincidiu com a publicação inicial da API pública. Depois da publicação, tanto a seção quanto a soma completa da escola funcionaram no mesmo fluxo.
- Acrescentada uma nova tentativa automática para interrupção de rede, mensagens em português e botão explícito de repetir a soma da escola. O cache da página passou a identificar a nova versão dos scripts. A queda de rede não foi simulada no navegador; os resultados positivos acima foram consultados de fato.

## Compatibilidade com a hospedagem do espelho

A checagem do endereço do espelho encontrou respostas 500 nas rotas de dados. Os logs de produção identificaram a causa: o ambiente não permite acessar o cache padrão. Essa dependência foi removida das rotas de dados e da API. Os dados estáticos continuam com cache HTTP no navegador e CDN de origem, e a API mantém cache em memória e deduplicação. Foi adicionado um teste de regressão que simula a indisponibilidade do cache da hospedagem e confirma tanto JSON quanto BU, além de um teste que recusa encaminhar URLs arbitrárias.
