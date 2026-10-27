export const STORY_CARDS = Object.freeze([
  {
    id: 'secao',
    title: 'Sua seção',
    description: 'Veja quantos votos Lula e Flávio tiveram na sua seção.',
    image: './images/story-section.jpg',
    path: '#meu-voto',
    filename: 'a-virada-sua-secao.jpg',
    linkLabel: { x: 282, y: 884, size: 17, width: 430 }
  },
  {
    id: 'virada',
    title: '10 milhões a mais. De onde?',
    description: 'Veja como os votos mudaram do primeiro para o segundo turno.',
    image: './images/story-hook.jpg',
    path: '#entenda',
    filename: 'a-virada-de-onde.jpg',
    linkLabel: { x: 360, y: 1224, size: 15, width: 198, pill: true }
  },
  {
    id: 'crescimento',
    title: 'O que explica a diferença?',
    description: 'Compare o crescimento em votos de Lula e Flávio.',
    image: './images/story-growth.jpg',
    path: '#entenda',
    filename: 'a-virada-o-que-mudou.jpg',
    linkLabel: { x: 360, y: 1170, size: 18, width: 390 }
  },
  {
    id: 'cidade',
    title: 'Quanto cada candidato ganhou na sua cidade?',
    description: 'Compare votos, percentuais e mudança de margem por cidade.',
    image: './images/story-city.jpg',
    path: '#meu-voto',
    filename: 'a-virada-sua-cidade.jpg',
    linkLabel: { x: 560, y: 947, size: 15, width: 220 }
  }
]);
