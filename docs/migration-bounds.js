// Deterministic contingency-table bounds, conditional on a common local population.
// Each cell bound is attainable separately; all bounds cannot generally hold together.
export function unitBounds({X,Y,N}) {
  if (!Number.isSafeInteger(N)||N<=0||![X,Y].every(a=>Array.isArray(a)&&a.length&&a.every(v=>Number.isSafeInteger(v)&&v>=0)&&a.reduce((s,v)=>s+v,0)===N)) throw Error('Bases incompatíveis.');
  return {X:[...X],Y:[...Y],N,low:X.map(x=>Y.map(y=>Math.max(0,x+y-N))),high:X.map(x=>Y.map(y=>Math.min(x,y)))};
}
export function sumBounds(units) {
  if(!units.length)throw Error('Nenhum recorte para somar.');
  const result={X:units[0].X.map(()=>0),Y:units[0].Y.map(()=>0),N:0,low:units[0].X.map(()=>units[0].Y.map(()=>0)),high:units[0].X.map(()=>units[0].Y.map(()=>0)),units:units.length};
  for(const unit of units){const b=unitBounds(unit);result.N+=b.N;for(let i=0;i<b.X.length;i++){result.X[i]+=b.X[i];for(let j=0;j<b.Y.length;j++){result.low[i][j]+=b.low[i][j];result.high[i][j]+=b.high[i][j];}}for(let j=0;j<b.Y.length;j++)result.Y[j]+=b.Y[j];}
  return result;
}
export function accounting(b) {
  const eliminated=b.X.slice(2,7).reduce((s,v)=>s+v,0),invalidReduction=b.X[7]-b.Y[2],absenceReduction=b.X[8]-b.Y[3],adjustment=b.X[9]-b.Y[4],gains=[b.Y[0]-b.X[0],b.Y[1]-b.X[1]];
  if(eliminated+invalidReduction+absenceReduction+adjustment!==gains[0]+gains[1])throw Error('A identidade de saldos não fecha.');
  return {eliminated,invalidReduction,absenceReduction,adjustment,gains,totalGain:gains[0]+gains[1]};
}
