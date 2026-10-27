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

## Atualização do kit editorial e da decomposição territorial (26/10/2026)

- `npm test`: 20 testes passaram. Foram acrescentadas cinco verificações para a identidade contábil municipal, o caso de Palmares, componentes negativos, inversão de margem e totais incoerentes.
- `node --check docs/app.js`: passou.
- Prévia local em Chromium integrado, viewport reportado de 618 × 764: a aplicação carregou como módulo, respondeu à seleção de cidade e mostrou Palmares com valores do conjunto TSE. A conta detalhada fechou: demais candidatos +1.484; comparecimento +1.330; redução de brancos/nulos +580; crescimento conjunto +3.394; Lula +2.957; Flávio +437; mudança da margem +2.520.
- O mapa interativo foi preparado e o documento não excedeu a largura da viewport (documento 603 px; viewport 618 px). Isso não substitui testes em aparelhos físicos, Safari/iPhone ou telas desktop largas.
- A nova cronologia e o FAQ foram incluídos com as fontes indicadas junto às afirmações. Não foi feita uma nova auditoria externa de cada página durante esta verificação local.
- Não foi publicado nem enviado ao repositório remoto nesta atualização; o trabalho está na branch `codex/kit-update-2026`.

## Restauração do card original e mapa (27/10/2026)

- Restaurada a arte enviada pelo usuário, com proporções preservadas, domínio avirada.pages.dev e uma faixa para o adesivo de link entre o mapa e os dados de crescimento. O mapa ilustrativo da arte é substituído pelo resultado municipal do segundo turno antes da montagem do PNG 1080 × 1920.
- Geração e prévia do card conferidas visualmente no Chromium integrado; mapa oficial, domínio e espaço para o adesivo apareceram na prévia.
- O mapa interativo passou a usar até 3 pixels por pixel CSS em telas compatíveis, limitado a 2,2 milhões de pixels. O redesenho imediato dos botões de zoom mantém o cache durante gestos.
- Seleção real no navegador: com filtro PE, o clique num município vizinho selecionou Ouro Branco-RN e atualizou o filtro para RN; o rótulo e os dados corresponderam à cidade. O botão de zoom foi exercitado.
- npm test: 20/20 passaram; node --check docs/app.js e git diff --check passaram. Não houve teste em iPhone físico nem medição de fluidez em aparelho real.

## Revisão editorial e funcional para publicação (27/10/2026)

- Conteúdo revisado como perguntas factuais, sem pressupor preferência partidária: 10 milhões versus votos nas candidaturas eliminadas; limites da inferência de migração individual; mudanças de liderança nas parciais; votos após 17h e fila; prorrogação; mapa por área versus soma de votos; BU; escopo do TCU em 2022; pesquisas eleitorais.
- As dez perguntas agora são cartões expansíveis separados. A conta nacional ganhou uma explicação direta sobre por que saldos não rastreiam quem trocou de candidato. A comparação dos registros após 17h com a margem final foi identificada como aritmética, com limite do recorte. A descrição do TCU foi precisada para os votos confrontados nas amostras, incluindo a existência de outros achados no relatório.
- Fontes primárias consultadas: totalizações nacionais atuais dos dois turnos, nota do TSE sobre pausa e retomada, decisão/notícia do STF, sigilo do voto pelo TRE-SP e relatório/notícia do TCU. Os 27 links externos do HTML responderam HTTP 200; resposta HTTP, isoladamente, não é validação do conteúdo. As fontes jornalísticas permanecem atribuídas e as contagens de recortes diferentes não são misturadas.
- 20/20 testes Node passaram, com reconciliação municipal, matemática, BUs e API.
- 16/16 verificações adicionais passaram em Brave/Chromium headless, usando perfil independente: viewports 1440×1000, 320×844, 390×844 e 430×932; abertura sem excesso horizontal; legenda sem sobreposição; três passos; conta exata; dez dúvidas; busca município de amostra-PE; Escola local de exemplo e soma completa; município de amostra seção 142/zona 94; Palmares seção 31/zona 37 e conta municipal; mapa/filtro/seleção/modos/zoom; PNG real 1080×1920; erro de consulta simulado com preservação do primeiro turno e nova tentativa; ausência de exceções JavaScript.
- A primeira execução identificou a sobreposição da legenda no desktop, corrigida antes da execução final. A simulação retornou HTTP 503 de propósito na API da seção; esse erro esperado consta no relatório.
- API pública do espelho: seção 142/zona 94 de município de amostra retornou HTTP 200, CORS `*`, Lula 212 e Flávio 62. A assinatura criptográfica não é verificada pelo aplicativo.
- Relatório: `tests/publication-review-2026-10-27.json`. Não houve teste em iPhone físico, Safari/WebKit ou no aplicativo Instagram. A revisão não promete responder a toda alegação possível nem equivale a auditoria forense da eleição.
