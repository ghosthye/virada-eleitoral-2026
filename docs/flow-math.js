// Transportation scenarios, not ecological inference or estimates of individual votes.
export function flowMargins(a,b){
  const groups=v=>{
    if(!Array.isArray(v)||v.length<8||!v.slice(0,8).every(Number.isSafeInteger)||v.slice(0,8).some(x=>x<0))throw Error('Totais inválidos.');
    const other=v[2]-v[0]-v[1],outside=v[6]-v[2],unclassified=outside-v[3]-v[4]-v[7];
    if(other<0||outside<0||unclassified<0)throw Error('As categorias não fecham com o eleitorado.');
    return {other,outside,unclassified};
  };
  const x=groups(a),y=groups(b);if(y.other!==0)throw Error('O segundo turno precisa ter apenas os dois candidatos.');
  const rows=[{key:'lula',label:'Lula',value:a[0]},{key:'flavio',label:'Flávio',value:a[1]},{key:'outros',label:'Demais candidatos',value:x.other},{key:'invalidos',label:'Brancos e nulos',value:a[3]+a[4]},{key:'abstencao',label:'Abstenção',value:a[7]}];
  const cols=[{key:'lula',label:'Lula',value:b[0]},{key:'flavio',label:'Flávio',value:b[1]},{key:'invalidos',label:'Brancos e nulos',value:b[3]+b[4]},{key:'abstencao',label:'Abstenção',value:b[7]}];
  if(x.unclassified||y.unclassified){rows.push({key:'saldo',label:'Saldo não classificado',value:x.unclassified});cols.push({key:'saldo',label:'Saldo não classificado',value:y.unclassified});}
  const adjustment=b[6]-a[6];
  if(adjustment>0)rows.push({key:'base',label:'Ajuste de base',value:adjustment});
  if(adjustment<0)cols.push({key:'base',label:'Ajuste de base',value:-adjustment});
  return {rows,cols,total:Math.max(a[6],b[6]),adjustment,unclassified:[x.unclassified,y.unclassified]};
}

export function flowBounds(model,row,col){
  const r=model.rows[row],c=model.cols[col];if(!r||!c)throw Error('Categoria inválida.');
  return {min:Math.max(0,r.value+c.value-model.total),max:Math.min(r.value,c.value)};
}

export function makeFlow(model,fixed=null){
  const {rows,cols}=model,R=rows.length,C=cols.length,source=R+C,sink=source+1,size=sink+1,graph=Array.from({length:size},()=>[]),matrix=rows.map(()=>cols.map(()=>0));
  const remainingRows=rows.map(x=>x.value),remainingCols=cols.map(x=>x.value);
  if(fixed){const bounds=flowBounds(model,fixed.row,fixed.col);if(!Number.isSafeInteger(fixed.value)||fixed.value<bounds.min||fixed.value>bounds.max)throw Error('Hipótese fora dos limites matemáticos.');remainingRows[fixed.row]-=fixed.value;remainingCols[fixed.col]-=fixed.value;matrix[fixed.row][fixed.col]=fixed.value;}
  function edge(u,v,cap,cost){const forward={to:v,reverse:graph[v].length,cap,cost,initial:cap},back={to:u,reverse:graph[u].length,cap:0,cost:-cost,initial:0};graph[u].push(forward);graph[v].push(back);return forward;}
  remainingRows.forEach((v,i)=>edge(source,i,v,0));remainingCols.forEach((v,j)=>edge(R+j,sink,v,0));
  const links=[];for(let i=0;i<R;i++)for(let j=0;j<C;j++){if(fixed&&i===fixed.row&&j===fixed.col)continue;const e=edge(i,R+j,model.total,rows[i].key===cols[j].key?0:1);links.push({i,j,e});}
  let remaining=remainingRows.reduce((s,v)=>s+v,0);
  while(remaining>0){
    const distance=Array(size).fill(Infinity),previous=Array(size);distance[source]=0;
    for(let k=0;k<size-1;k++){let changed=false;for(let u=0;u<size;u++)if(Number.isFinite(distance[u]))for(let ei=0;ei<graph[u].length;ei++){const e=graph[u][ei];if(e.cap>0&&distance[e.to]>distance[u]+e.cost){distance[e.to]=distance[u]+e.cost;previous[e.to]=[u,ei];changed=true;}}if(!changed)break;}
    if(!previous[sink])throw Error('Não foi possível fechar este cenário.');
    let amount=remaining;for(let v=sink;v!==source;){const [u,ei]=previous[v];amount=Math.min(amount,graph[u][ei].cap);v=u;}
    for(let v=sink;v!==source;){const [u,ei]=previous[v],e=graph[u][ei];e.cap-=amount;graph[v][e.reverse].cap+=amount;v=u;}remaining-=amount;
  }
  for(const {i,j,e}of links)matrix[i][j]+=e.initial-e.cap;
  if(matrix.some((row,i)=>row.some(v=>!Number.isSafeInteger(v)||v<0)||row.reduce((s,v)=>s+v,0)!==rows[i].value)||cols.some((c,j)=>matrix.reduce((s,row)=>s+row[j],0)!==c.value))throw Error('O cenário não reconciliou.');
  return matrix;
}
