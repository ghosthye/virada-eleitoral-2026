# Verificação do projeto — revisão de 27/10/2026

## Correção metodológica

A interface retirou as taxas centrais do experimento de regressão ecológica anterior. Seus testes verificavam somas, implementação e funcionamento, não validavam transferências reais. O experimento e seus diagnósticos permanecem arquivados para examinar a correção, com STATUS.md explícito. A interface não os carrega.

A análise atual apresenta saldos oficiais e limites condicionais de tabelas de contingência. Mínimo = máx(0, X + Y − N), máximo = mín(X,Y), por unidade. Limites estaduais e nacionais são somas de limites locais. A base comum e o ajuste cadastral são hipóteses contábeis, não prova de população individual idêntica. Limites não são probabilidades nem intervalos de confiança. Os extremos são atingíveis separadamente e não precisam ocorrer juntos.

## Testes numéricos e fontes

- Seis novos testes conferem os limites contra enumeração exaustiva de todas as tabelas pequenas 2x3 e 3x3, recomputam os 5.757 recortes publicados, verificam agregações, saldos negativos, ajustes locais e rejeição de bases inválidas.
- Uma contraprova constrói dois fluxos com diferença de um milhão em brancos/nulos para Flávio, preservando exatamente cada margem em cada unidade. Isso demonstra não identificação; não estima o fluxo verdadeiro.
- O manifesto local contém 11.514 arquivos oficiais EA20 identificados por URL e hash (5.757 recortes × 2 turnos). A auditoria de totalização inclui mais 58 agregados (27 UFs, Exterior e Brasil × 2 turnos), totalizando 11.572. Nova consulta direta aos dois arquivos nacionais, registrada em tests/official-national-recheck-2026-10-27.json, coincidiu com candidatos, válidos, brancos/nulos, comparecimento, aptos e ausentes publicados.
- Os 39 testes da suíte completa passaram. Ela inclui os testes de API, BUs reais, reconciliação territorial, matemática dos saldos e os testes históricos do experimento retirado. Passar nesses testes não valida comportamento individual nem audita assinaturas criptográficas das urnas.

## Navegador

Dezesseis verificações passaram em Chromium real, em 320, 390, 430 e 1.440 pixels: retirada da taxa central, saldos nacionais, grupos separados, mudança de destino, Recife por teclado, São Paulo e UF, falha HTTP 503 sem zerar resultados e recuperação, fontes, ausência de transbordamento, mapa e troca de turnos, quatro cards e ausência de exceções JavaScript. Relatório: tests/flow-bounds-review-2026-10-27.json. Capturas mobile foram inspecionadas visualmente.

Não foi testado em iPhone físico ou Safari/WebKit. Emulação de largura não substitui esses testes. Os relatórios anteriores documentam versões anteriores, não a validação das transferências.

## Reprodução

Execute node scripts/build-flow-bounds.mjs e npm test. As entradas e hashes estão em docs/data/migration/; os limites atuais em docs/data/flow-bounds/. As referências estatísticas e as análises de CNN e Quaest consultadas estão no README e na seção de fontes do site, com datas e limitações.

## Sankey contábil · revisão de 27/10/2026

O fluxo verificado foi seleção de Brasil/UF/município → arquivos estáticos do retrato TSE → identidade de saldos → SVG interativo. Não há nova API nem nova credencial nesse percurso.

Nove testes direcionados passaram (balance-sankey e territory-math): conferem a identidade em todos os 5.571 municípios publicados e estados, os valores nacionais, casos de queda local, parcelas negativas, ausência de mudança e rejeição de totais inconsistentes. O diagrama não usa o ajuste cadastral sintético das faixas.

Dezessete verificações em Chrome real passaram: gráfico nacional, toque e teclado, Pernambuco, Recife, saldo negativo de Acrelândia, limites técnicos recolhidos, rede HTTP 200, ausência de exceções e de transbordamento em 320, 390, 430 e 1.440 pixels. Relatório: tests/balance-sankey-review-2026-10-27.json. As capturas de celular e computador foram inspecionadas. Mobile foi emulado; não houve teste em iPhone físico nem em Safari nesta revisão.

## Interface do Sankey sem faixas de transferência · 27/10/2026

A interface atual apresenta o Sankey, os totais oficiais e a conta exata dos saldos. Os controles de mínimos/máximos, o seletor de destino e os textos sobre versões anteriores foram removidos do HTML, do JavaScript em uso e das fontes da página. Os arquivos compactos em docs/data/balance/ contêm apenas as contagens das candidaturas eliminadas.

Quatro testes numéricos do Sankey passaram com a nova base, incluindo a reconciliação de todos os municípios e estados. Dezenove verificações em Chrome real passaram; além das buscas, recortes, toque, teclado e larguras de 320/390/430/1.440 pixels, confirmam a ausência dos blocos antigos no DOM e que o app não solicita arquivos de limites. Relatório: tests/sankey-cleanup-review-2026-10-27.json. Sem teste em iPhone físico nesta revisão.
