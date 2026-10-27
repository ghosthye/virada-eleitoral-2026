export const STORY_CARDS = Object.freeze([
  {id:'virada',title:'A virada nacional',description:'De onde vieram os 10 milhões?',path:'',filename:'a-virada-2026-story.png'},
  {id:'secao',title:'Sua seção',description:'Quer entender como sua seção votou?',path:'#meu-voto',filename:'a-virada-2026-secao.png'},
  {id:'cidade',title:'Sua cidade',description:'Quanto cada candidato ganhou na sua cidade?',path:'#meu-voto',filename:'a-virada-2026-cidade.png'},
  {id:'estado',title:'Seu estado',description:'Onde a disputa mudou no seu estado?',path:'#mapa',filename:'a-virada-2026-estado.png'}
]);

const palette={paper:'#f6f5ee',ink:'#142e3e',muted:'#64736f',red:'#bb493d',blue:'#28688f',green:'#286750',line:'#d5dccf'};
function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function text(c,value,x,y,size=30,color=palette.ink,weight='400',family='Inter, Segoe UI, Arial, sans-serif'){c.fillStyle=color;c.font=weight+' '+size+'px '+family;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(value,x,y);}
function heading(c,lines){lines.forEach((line,i)=>{let size=84;c.font=(i===lines.length-1?'italic ':'700 ')+size+'px Georgia, serif';while(c.measureText(line).width>940&&size>60){size-=2;c.font=(i===lines.length-1?'italic ':'700 ')+size+'px Georgia, serif';}c.fillStyle=i===lines.length-1?palette.red:palette.ink;c.fillText(line,66,272+i*94);});}
function arrow(c,x,y,w=38,color=palette.red){c.save();c.strokeStyle=color;c.lineWidth=5;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x,y+w);c.lineTo(x+w,y);c.moveTo(x+w*.4,y);c.lineTo(x+w,y);c.lineTo(x+w,y+w*.6);c.stroke();c.restore();}
function base(c,kicker){c.fillStyle=palette.paper;c.fillRect(0,0,1080,1920);c.fillStyle='#eee5d9';c.beginPath();c.arc(1100,-10,245,0,Math.PI*2);c.fill();c.fillStyle=palette.red;c.beginPath();c.arc(1100,-25,170,0,Math.PI*2);c.fill();c.fillStyle=palette.blue;c.beginPath();c.arc(1195,205,175,0,Math.PI*2);c.fill();arrow(c,68,56,34);text(c,'A VIRADA / 2026',130,86,30,palette.ink,'700','Georgia, serif');text(c,kicker,68,170,25,palette.green,'700');}
function sticker(c){text(c,'QUER CONFERIR? ENTRE PELO LINK.',202,990,24,palette.green,'700');c.save();c.setLineDash([9,8]);box(c,200,1010,680,125,20,'#faf9f3',palette.line);c.restore();}
function footer(c,title,subtitle){box(c,64,1680,952,130,22,palette.ink);text(c,title,95,1732,29,'#fff','700');text(c,subtitle,95,1775,25,'#d7e1dc');arrow(c,938,1723,35,'#fff');c.textAlign='center';c.fillStyle=palette.green;c.font='700 34px Inter, Segoe UI, Arial, sans-serif';c.fillText('avirada.pages.dev',540,1860);c.fillStyle=palette.muted;c.font='22px Inter, Segoe UI, Arial, sans-serif';c.fillText('Dados TSE · mapa IBGE · análise independente',540,1900);}
function chip(c,label,x,y,w=225,color=palette.ink){box(c,x,y,w,62,15,'#fffdf7',palette.line);text(c,label,x+22,y+41,27,color,'700');}
function legend(c){c.fillStyle=palette.red;c.beginPath();c.arc(96,946,9,0,Math.PI*2);c.fill();text(c,'Lula',115,955,24);c.fillStyle=palette.blue;c.beginPath();c.arc(216,946,9,0,Math.PI*2);c.fill();text(c,'Flávio',235,955,24);text(c,'Mais votado · 2º turno',385,955,22,palette.muted);}

export async function drawStoryHook(c,card,drawBrazil){
  c.save();c.textAlign='left';c.textBaseline='alphabetic';
  if(card.id==='secao'){
    base(c,'O RESULTADO PERTO DE VOCÊ');heading(c,['Quer entender','como votou','a sua seção?']);
    text(c,'Quantos votos Lula e Flávio tiveram?',68,535,34);text(c,'Compare os dois turnos, seção por seção.',68,583,31,palette.muted);
    box(c,70,630,940,310,28,'#e9eee5',palette.line);chip(c,'1º TURNO',120,680,245,palette.blue);chip(c,'2º TURNO',715,680,245,palette.red);
    c.strokeStyle='#a7b6a4';c.lineWidth=4;c.beginPath();c.moveTo(375,712);c.lineTo(705,712);c.stroke();
    c.save();c.translate(515,710);c.rotate(-.13);box(c,-62,-55,160,165,12,'#fffdf7',palette.green);c.strokeStyle=palette.green;c.lineWidth=8;c.beginPath();c.moveTo(-25,10);c.lineTo(0,35);c.lineTo(55,-15);c.stroke();c.restore();
    box(c,402,785,276,120,18,palette.ink);text(c,'SUA SEÇÃO',448,858,30,'#fff','700');sticker(c);
    text(c,'COMECE PELA SUA CIDADE',70,1232,26,palette.green,'700');
    text(c,'Encontre a escola.',70,1307,53,palette.ink,'700','Georgia, serif');text(c,'Escolha a seção. Compare.',70,1372,53,palette.ink,'700','Georgia, serif');
    chip(c,'1 · Cidade',70,1426,280);chip(c,'2 · Escola',400,1426,280);chip(c,'3 · Seção',730,1426,280);
    text(c,'Resultados públicos da urna, com links para conferir.',70,1550,29,palette.muted);text(c,'Seções agregadas são identificadas como grupo.',70,1600,27,palette.muted);
    footer(c,'VEJA O RESULTADO DA SUA SEÇÃO.','Busque sua cidade, escola e seção.');
  }else{
    const city=card.id==='cidade';
    base(c,city?'OS DOIS TURNOS, NA SUA CIDADE':'A VIRADA NO SEU ESTADO');
    heading(c,city?['Quanto cada candidato','ganhou na','sua cidade?']:['Onde a disputa','mudou no','seu estado?']);
    text(c,city?'Compare os votos do 1º e do 2º turno.':'Quais cidades mais mexeram na margem?',68,535,33);
    text(c,city?'Veja quem cresceu, quanto e onde.':'Explore o mapa e compare os resultados.',68,583,31,palette.muted);
    box(c,70,630,940,300,28,'#eeeee6',palette.line);await drawBrazil(c,92,646,430,274);
    text(c,city?'COMPARE AQUI':'ESCOLHA SEU ESTADO',570,689,25,palette.green,'700');
    const labels=city?['Votos','Percentuais','Mudança de margem']:['Estado','Cidades','Ranking da mudança'];
    labels.forEach((label,i)=>{box(c,565,712+i*66,395,53,12,'#fffdf7');text(c,label,585,748+i*66,27,palette.ink,'700');});legend(c);sticker(c);
    text(c,city?'SUA CIDADE, EM NÚMEROS':'OLHE ALÉM DA COR DO MAPA',70,1232,26,palette.green,'700');
    text(c,city?'O que mudou':'Cada cidade tem',70,1307,54,palette.ink,'700','Georgia, serif');
    text(c,city?'entre os turnos?':'um peso em votos.',70,1372,54,palette.ink,'700','Georgia, serif');
    text(c,city?'Quanto cada candidato ganhou ou perdeu?':'Quem cresceu mais em votos?',70,1452,32,palette.ink);
    text(c,city?'Qual foi a mudança na diferença entre eles?':'Onde a diferença entre os candidatos mudou?',70,1501,30,palette.muted);
    chip(c,city?'1º turno × 2º turno':'Mapa + dados + rankings',70,1550,600,palette.green);
    footer(c,city?'COMPARE O RESULTADO DA SUA CIDADE.':'ABRA O MAPA. ESCOLHA SEU ESTADO.',city?'Digite o município e explore os números.':'Explore as cidades e confira as fontes.');
  }
  c.restore();
}
