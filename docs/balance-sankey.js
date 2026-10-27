const number = new Intl.NumberFormat('pt-BR');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum = rows => rows.reduce((total, row) => total + row.value, 0);

// This is an identity of net changes. No edge links a first-round group
// directly to a finalist: all terms meet at an accounting node.
export function buildBalance(official, groups) {
  const {a, b} = official;
  if (![a,b].every(r => Array.isArray(r) && r.slice(0,6).length === 6 && r.slice(0,6).every(v => Number.isSafeInteger(v) && v >= 0))) throw Error('Totais oficiais inválidos para o diagrama.');
  const sources = [], targets = [], terms = [];
  const eliminated = a[2] - a[0] - a[1];
  if (groups.reduce((total, g) => total + g.value, 0) !== eliminated) throw Error('As candidaturas eliminadas não conferem com o total oficial.');
  for (const g of groups) {
    const term = {...g, color:'#45846b', description:`${g.label} recebeu ${number.format(g.value)} votos válidos no 1º turno. Esse total entra na conta do crescimento conjunto. Os dados agregados não dizem quantos desses eleitores escolheram cada finalista.`};
    if (g.value < 0 || !Number.isSafeInteger(g.value)) throw Error('Grupo de origem inválido.');
    terms.push({...term, signedValue:g.value});
    if (g.value) sources.push(term);
  }
  function contribution(id, delta, positive, negative, before, after, explanation, color) {
    const label = delta >= 0 ? positive : negative;
    const term = {id,label,value:Math.abs(delta),color,description:`${number.format(before)} no 1º turno → ${number.format(after)} no 2º. ${explanation}`};
    terms.push({...term,signedValue:delta});
    if (delta) (delta > 0 ? sources : targets).push(term);
  }
  contribution('turnout', b[5]-a[5], 'Mais comparecimento', 'Menos comparecimento', a[5], b[5], 'É a diferença entre os totais de comparecimento. Entradas e saídas individuais podem se compensar.', '#648d80');
  contribution('blank', a[3]-b[3], 'Menos brancos', 'Mais brancos', a[3], b[3], 'Uma queda libera espaço na identidade dos votos válidos; não identifica quem deixou de votar em branco nem seu destino.', '#87977a');
  contribution('null', a[4]-b[4], 'Menos nulos', 'Mais nulos', a[4], b[4], 'Inclui nulos técnicos do retrato oficial. O saldo não permite distribuir esses votos entre Lula e Flávio.', '#9b9974');
  const gains = [b[0]-a[0], b[1]-a[1]];
  gains.forEach((gain, i) => {
    if (!gain) return;
    const name = i ? 'Flávio' : 'Lula';
    const row = {id:i?'flavio':'lula',label:gain>0?`${name} cresceu`:`Queda de ${name}`,value:Math.abs(gain),color:i?'#28688f':'#bb493d',description:`${number.format(a[i])} → ${number.format(b[i])} votos. ${gain>0?'Ganho':'Queda'} líquido de ${number.format(Math.abs(gain))}. É a diferença entre duas contagens, sem atribuir a origem ou o destino de votos individuais.`};
    (gain>0?targets:sources).push(row);
  });
  const total = sum(sources);
  if (total !== sum(targets) || terms.reduce((n,t)=>n+t.signedValue,0) !== gains[0]+gains[1]) throw Error('A conta do diagrama não fecha.');
  return {sources,targets,terms,total,gains,net:gains[0]+gains[1]};
}

function wrap(text, limit) {
  const lines = [''];
  for (const word of text.split(' ')) {
    if (lines.at(-1).length && lines.at(-1).length+word.length+1 > limit) lines.push(word);
    else lines[lines.length-1] += (lines.at(-1)?' ':'')+word;
  }
  return lines;
}

export function balanceSVG(balance, width = 390) {
  if (!balance.total) return '<p class="balance-empty">Não houve parcelas diferentes de zero neste recorte.</p>';
  const W=Math.max(260,Math.min(780,width)), labelWidth=W*.38, left=labelWidth+4, middle=W*.58, right=W-9, bar=7;
  const bandHeight=W<500?220:280, gap=44;
  const bodyHeight=Math.max(bandHeight+(balance.sources.length-1)*gap,bandHeight+(balance.targets.length-1)*gap);
  const H=bodyHeight+110, top=75, centerTop=top+(bodyHeight-bandHeight)/2;
  const scale=bandHeight/balance.total;
  const font=W<500?12:15, fontNum=font+1;
  const path=(x1,y1,x2,y2,h)=>{const d=(x2-x1)*.5;return `M${x1},${y1}C${x1+d},${y1} ${x2-d},${y2} ${x2},${y2}L${x2},${y2+h}C${x2-d},${y2+h} ${x1+d},${y1+h} ${x1},${y1+h}Z`;};
  let content='';
  for (const [side,rows] of [['source',balance.sources],['target',balance.targets]]) {
    let y=top+(bodyHeight-(bandHeight+gap*(rows.length-1)))/2, cumulative=0;
    for (const row of rows) {
      const h=row.value*scale, cy=centerTop+cumulative*scale, target=side==='target';
      const curve=target?path(middle+bar,cy,right,y,h):path(left+bar,y,middle,cy,h);
      const x=target?right:left;
      const lines=wrap(row.label,Math.max(13,Math.floor((target?right-middle-16:labelWidth-7)/(font*.53))));
      const textX=target?right-8:labelWidth-4, baseline=y+h/2-(lines.length*15)/2;
      content+=`<g class="balance-item" data-balance="${esc(row.id)}" role="button" tabindex="0" aria-label="${esc(row.label)}: ${number.format(row.value)}. Ver explicação"><title>${esc(row.label)}: ${number.format(row.value)}</title><rect x="${target?middle+bar+3:0}" y="${y+h/2-22}" width="${target?right-middle-bar-3:left}" height="44" fill="transparent"/><path d="${curve}" fill="${row.color}" fill-opacity=".25"/><rect x="${x}" y="${y}" width="${bar}" height="${Math.max(.5,h)}" rx="2" fill="${row.color}"/><text x="${textX}" y="${baseline}" text-anchor="end" font-size="${font}">${lines.map((line,i)=>`<tspan x="${textX}" dy="${i?15:0}">${esc(line)}</tspan>`).join('')}<tspan x="${textX}" dy="18" font-size="${fontNum}" font-weight="750">${number.format(row.value)}</tspan></text></g>`;
      y+=h+gap;cumulative+=row.value;
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Diagrama Sankey da conta de saldos. Todas as parcelas se encontram no balanço; não há ligação individual de eleitores aos candidatos."><text x="0" y="20" class="balance-column">PARCELAS QUE ENTRAM</text><text x="${W}" y="20" text-anchor="end" class="balance-column">PARCELAS QUE SAEM</text>${content}<rect x="${middle}" y="${centerTop}" width="${bar}" height="${bandHeight}" rx="2" fill="#142e3e"/><text x="${middle+bar/2}" y="${centerTop-30}" text-anchor="middle" font-size="11">BALANÇO</text><text x="${middle+bar/2}" y="${centerTop-13}" text-anchor="middle" font-size="12" font-weight="750">${number.format(balance.total)}</text></svg>`;
}
