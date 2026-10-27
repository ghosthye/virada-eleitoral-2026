# A Virada · Eleições 2026

Uma explicação simples da virada presidencial, com resultados oficiais do TSE, mapa municipal e consulta por **cidade → escola/local → seção**. Interface pensada primeiro para celular.

- Site principal: https://avirada.pages.dev/
- GitHub Pages: https://ghosthye.github.io/virada-eleitoral-2026/
- Espelho e API dos boletins: https://atlas-eleitoral-2026-luiz.luizluizluii.chatgpt.site/

## O que a página explica

Flávio começou com **2.224.965 votos de vantagem**. Entre os turnos, Lula cresceu **10.376.694 votos** e Flávio **3.721.538**. A diferença entre os crescimentos foi de **6.655.156**, suficiente para terminar com **4.430.191 votos de vantagem para Lula**.

```
  9.316.747  votos em outras candidaturas no primeiro turno
+ 2.960.239  aumento líquido do comparecimento
+   870.302  redução líquida de votos brancos
+   950.944  redução líquida de votos nulos, incluindo técnicos
− 3.721.538  crescimento de Flávio
=10.376.694  crescimento de Lula
```

A identidade compara **saldos agregados**. Não identifica transferências individuais nem demonstra, sozinha, causas políticas da vitória. A seção revisada publica limites matemáticos, sem estimativa central de transferência. Não identifica o voto de pessoas, alunos ou funcionários de escolas.

## Consulta por escola e seção

O CSV de votação por seção publicado na coleta de **26/10/2026** contém somente o primeiro turno (3.800.511 registros). O segundo é consultado nos **BUs oficiais individuais do pleito 3221**, usando o índice EA18 para escolher uma única geração marcada como totalizada. O nome do arquivo não é adivinhado.

O leitor ASN.1 segue o [esquema oficial BU/RDV 2026 do TSE](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/formato-arquivos-de-bu-rdv-e-assinatura-digital). Valida ambiente oficial, ano, pleito, eleição, cargo, município, zona, seção, comparecimento e soma dos votos. **Não verifica assinaturas criptográficas.**

- Identidade da seção: UF + código TSE do município + zona + seção.
- Local: município + zona + código do local, preservando nomes e endereços de cada turno e aliases do cadastro.
- Agregação: resolve a seção principal por turno. A mesma urna não é somada duas vezes.
- O resultado de uma seção agregada é o da **urna que atende todo o grupo**, com os números das seções informados.
- Mudanças no cadastro/endereço são sinalizadas. Grupos diferentes não são apresentados como um conjunto estável de eleitores.
- A soma de uma escola só é exibida quando todos os BUs necessários foram obtidos; erros não viram zero voto nem soma parcial.
- O segundo turno exige conexão. Falhas de formato, fonte ou rede aparecem como indisponibilidade, preservando os dados já disponíveis.

## Fontes

- [TSE, resultados 2026 e votação por seção](https://dadosabertos.tse.jus.br/dataset/resultados-2026)
- [TSE, eleitorado e locais de votação](https://dadosabertos.tse.jus.br/dataset/eleitorado-2026)
- [TSE, primeiro turno nacional](https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json)
- [TSE, segundo turno nacional](https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json)
- [TSE, documentação de divulgação](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados)
- [IBGE, malhas geográficas simplificadas](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3)
- [TRE-CE, agregação e alocação provisória](https://www.tre-ce.jus.br/eleicao/eleicoes-2026/locais-de-votacao-e-secoes)
- [TSE, mudança de endereço de seções no segundo turno](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/entenda-por-que-a-justica-eleitoral-trocou-o-endereco-de-algumas-secoes-para-o-2o-turno)

O total nacional inclui exterior. O mapa cobre 5.570 polígonos IBGE; a busca municipal cobre 5.571 unidades eleitorais nacionais, incluindo DF e Fernando de Noronha. Boa Esperança do Norte-MT está na consulta, sem polígono na malha simplificada usada.

### Destinação de votos no primeiro turno

O CSV nominal ainda traz 5.246 votos no código 28, fora do conjunto de candidaturas válidas do retrato EA20 usado. A montagem identifica candidaturas válidas pelo EA20, reconcilia os demais nominais na categoria de destinação não válida e **exige igualdade exata, em cada município**, com `vvc`, `vb` e `tvn`. Esses 5.246 correspondem ao total `vnt` do arquivo nacional. Não se infere o motivo jurídico dessa destinação. O arquivo de fontes e a auditoria permitem conferir a diferença entre os formatos.

## Desenvolvimento local

Requer Node.js 22 ou posterior, sem dependências adicionais:

```sh
npm run dev
# http://localhost:8787
npm test
```

O servidor local serve `docs/` e a API `/api/section`. No GitHub Pages, as páginas e os arquivos públicos são estáticos; a consulta de BU usa a API pública do espelho. A API permite apenas consultas a arquivos oficiais, com parâmetros limitados, timeout, cache e deduplicação.

O espelho incorpora HTML/CSS/JS em um Worker e busca os dados estáticos nesta fonte GitHub com **commit fixo**. Assim, código de apresentação e dados têm uma versão definida. O Worker não contém token GitHub, credencial do TSE, conta de visitante ou segredo.

## Organização

```
docs/                 página, estilos, interação, prévia social e dados públicos
docs/data/cities/     cadastro local e votos do primeiro turno, por município
server/              API somente leitura e leitor ASN.1 de BU
scripts/             servidor, coleta e montagem reproduzível
sources/             fontes nacionais, esquema oficial e manifestos de integridade
tests/               dados reais de teste, testes automáticos e reconciliações com fontes oficiais
deploy/              adaptação do mesmo projeto para o espelho
```

Os ZIPs oficiais são grandes e ficam fora do Git. Para refazer os dados, use `node scripts/download-data.cjs`, depois `node scripts/prepare-data.cjs`. O processo falha se as somas não coincidirem com o retrato municipal. Leia [TESTES.md](TESTES.md) para saber o que foi realmente verificado e seus limites.

## Privacidade e atribuição

Sem cadastro, título eleitoral, CPF, geolocalização ou bibliotecas de rastreamento no código da página. São resultados públicos agregados, não informações sobre eleitores individuais. Os provedores de hospedagem seguem suas próprias políticas de logs e rede.

Código deste projeto: licença MIT. Dados eleitorais: TSE, com atribuição conforme o portal. Geografia: IBGE, com atribuição. Este projeto não é um site oficial da Justiça Eleitoral.

## Análise de migração revisada em 27/10/2026

As taxas centrais do modelo anterior foram retiradas da interface: as somas fechavam, mas as transferências não foram validadas. Não trocamos os percentuais por valores escolhidos para parecerem mais plausíveis. O modelo antigo e seus diagnósticos ficam arquivados em docs/data/migration/ para permitir examinar a correção; não são usados pela interface atual.

A comparação publica os saldos oficiais e limites de tabelas de contingência (Duncan–Davis): para cada célula, máximo(0, X + Y − N) e mínimo(X,Y). Calculamos por unidade e somamos os limites por UF e Brasil. Esses extremos são atingíveis separadamente sob a hipótese de população local comum e equivalente, equilibrada com ajuste cadastral. Não são intervalos de confiança, probabilidades ou faixas prováveis. Extremos diferentes não precisam ser compatíveis simultaneamente.

A base inclui 5.571 municípios e 186 recortes no exterior. Lula, Flávio, Cury, Caiado, Renan, Zema e outros candidatos têm grupos separados. Ausência e brancos/nulos são separados. Fórmulas: docs/migration-bounds.js; entradas e hashes oficiais: docs/data/migration/inputs.json e sources.json; saídas: docs/data/flow-bounds/. Reconstrua com:

```sh
node scripts/build-flow-bounds.mjs
npm test
```

Fontes metodológicas: [Imai, Lu e Strauss, método de limites](https://imai.fas.harvard.edu/software/files/eco.pdf), [Forcina e Pellegrino, viés ecológico em transições](https://arxiv.org/abs/1411.4411), [Jiang e colaboradores, identificação parcial](https://arxiv.org/abs/1804.05803).

Contexto consultado: [CNN, 20/10/2026](https://www.cnnbrasil.com.br/eleicoes/analise-a-aritmetica-da-ausencia/) e [Quaest, 22/10/2026](https://quaest.com.br/segundo-turno-2026-votos-brancos-nulos/). São análises anteriores ao resultado, não medições de transferências efetivas. As intenções divulgadas não foram impostas às urnas ou a municípios.

Exemplos públicos de navegação e testes usam São Paulo-SP e Recife-PE. O cadastro oficial permanece completo, sem associar qualquer município à localização do mantenedor.
