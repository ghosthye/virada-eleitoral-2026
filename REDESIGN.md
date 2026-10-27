# A Virada / 2026 — primeira etapa editorial

Branch: `redesign/editorial-homepage` · base: `0950bff` · 27/10/2026.

## Entrega

Homepage com leitura contínua de reportagem, marca tipográfica, manchete serifada compacta, quadro das margens e placares exatos. A sequência é Conta → Mapa → Seu local → Cards → Fontes, igual no conteúdo e no menu. A cronologia fica em uma abertura opcional, e o mapa real vem acompanhado do ranking territorial. Paleta: papel `#F5F2EA`, tinta `#132C3A`, vermelho `#B43E35`, azul `#276487`. Fontes do sistema, filetes, composição compacta e dados substituem as grandes áreas de respiro da primeira proposta.

`docs/editorial.css` concentra a nova composição e os ajustes responsivos. As seções de explicação, consulta, Sankey, rankings, Stories e fontes recebem a mesma direção visual. A geração das imagens de Stories permanece intacta nesta etapa.

## Auditoria e limites da alteração

- `docs/index.html`: IDs dos controles mantidos. Conteúdo e navegação reordenados na mesma sequência, sem duplicar canvas ou controles. Âncoras preservadas; link para pular ao conteúdo adicionado. A comparação por candidato mantém todos os números e percentuais em quadro compacto.
- `docs/app.js`: cores do mapa, inicialização da navegação e comportamento de rolagem mudaram. Fetches, fórmulas, cache, gestos, zoom, seleção municipal, busca, parâmetros `cidade`, `zona`, `secao`, `local` e compartilhamento permanecem iguais.
- `docs/reading-nav.js`: acompanha a posição de leitura, agrupa conta/Sankey e mapa/ranking e atualiza um único item com `aria-current`. Rolagem direta evita atravessar e expandir gráficos antes de alcançar a seção solicitada.
- `server/`, arquivos em `docs/data/`, módulos de cálculo, leitor de BU e `docs/story-cards.js`: sem alterações.
- `scripts/build-worker.cjs`: inclui o novo CSS e o módulo de navegação entre os arquivos incorporados. Nenhum comando de publicação de produção foi executado.
- `docs/favicon.svg`: monograma tipográfico substitui a seta de crescimento.
- A falha inicial em `tests/migration-model.test.mjs` já estava na base: cobrava textos e carregamento de limites condicionais que a versão publicada retirou. O teste agora verifica o Sankey de saldos, a ressalva sobre voto individual e a ausência de carregamento das antigas estimativas e limites. Os testes numéricos foram preservados.
- O adaptador de espelho já possui uma lista restrita de módulos e dados; esta etapa adiciona seu CSS e módulo de navegação. O caminho principal testado é o servidor local que serve `docs/`, correspondente à publicação estática.

## Validação executada

- `npm test`: 45 testes, 45 aprovados, nenhuma falha. Dois testes novos conferem a ordem do menu, destinos únicos e item atual em seções longas.
- Navegador Chromium, larguras 320, 390, 430, 768 e 1440 px: sem transbordamento horizontal da página. O carrossel mantém sua própria rolagem.
- Os cinco destinos do menu abrem a seção certa e marcam o item correspondente. O gráfico não desloca o destino durante uma animação de rolagem.
- Mapa: malha real carregada, primeiro e segundo turnos, mudança de margem, filtro PE, retorno ao Brasil e seleção municipal com resultado.
- Busca por teclado: Recife PE; resultado municipal; seção 31, zona 1, Colégio Boa Viagem.
- API local → índice oficial → BU → interface: seção consultada apresentou 138 votos para Lula e 173 para Flávio no segundo turno, com aviso sobre assinatura criptográfica preservado.
- Link direto `?cidade=2611606&zona=1&secao=31`: reabriu o mesmo recorte.
- Explicação: navegação entre os três passos e resultado final.
- Sankey: carregamento da conta nacional.
- Stories: quatro imagens geradas e troca de seleção; link de download preparado.

Teste mobile realizado por dimensões de viewport; não houve teste em iPhone físico, Safari/WebKit ou envio a Instagram/WhatsApp. Dados e fontes foram preservados do repositório; esta revisão visual não é uma nova auditoria independente dos resultados eleitorais.

## Revisão local

Execute `npm run dev`. Se a porta 8787 estiver ocupada, defina `PORT=8788` antes de iniciar. Prévia online da branch: https://redesign-editorial-homepage.avirada.pages.dev/ . A Cloudflare gera essa prévia automaticamente quando a branch recebe commits. Nenhum deploy de produção foi feito; a produção só deve receber esta etapa após pedido do usuário.
