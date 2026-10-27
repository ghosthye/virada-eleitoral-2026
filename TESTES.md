# Verificação do projeto — 27/10/2026

## Dados e estimativa própria

A estimativa utiliza 5.757 unidades territoriais (municípios e locais no exterior), com 11.514 arquivos oficiais EA20 identificados por URL e SHA-256. Todos os totais de origem e destino são preservados. A base contábil por unidade usa o maior eleitorado dos dois turnos; o ajuste não acrescenta votos aos candidatos.

O modelo usa regressão ecológica com restrições por região, calibração às margens municipais, 200 reamostragens estratificadas por UF e seis especificações alternativas. As faixas são envelopes de sensibilidade, não intervalos de confiança validados. O fechamento das somas e os testes sintéticos não comprovam transferências individuais.

Seis testes específicos verificam fontes, matrizes, agregações, totais nacionais, diagnósticos e interface. Três testes Python verificam recuperação de parâmetros em dados sintéticos, calibração/arredondamento e envelopes de sensibilidade.

## Funcionalidades preservadas

Vinte testes cobrem API, boletins reais, rejeição de entradas inválidas, resultados territoriais, hospedagem e matemática das diferenças entre turnos. Os exemplos usam São Paulo-SP e Recife-PE. Boletins oficiais de Recife, São Paulo, Acre e exterior verificam variantes do formato. Não verificamos assinaturas criptográficas; estes testes não constituem auditoria eleitoral.

## Navegador

Dezoito verificações passaram em Chromium real, com larguras de 320, 390, 430 e 1.440 pixels: carregamento do modelo, grupos e detalhes, clique real e teclado no Sankey, buscas de Recife e São Paulo, troca de UF, ampliação, ausência de transbordamento da página, mapas e cards, fontes e recuperação após erro HTTP 503 simulado. A falha não substitui resultados por zero. Relatório em `tests/own-migration-review-2026-10-27.json`.

Não foi realizado teste em iPhone físico ou Safari/WebKit. A emulação de largura mobile não substitui esses testes.

## Reprodução

Execute `npm test`. Para os testes numéricos, instale `scripts/migration-requirements.txt` e execute `python -m unittest discover -s tests -p test_migration_fit.py -v`. A reconstrução dos dados requer os arquivos oficiais originais; consulte o README e os manifestos em `docs/data/migration/`.
