import fs from 'node:fs';
import {unitBounds,sumBounds,accounting} from '../docs/migration-bounds.js';
const data=JSON.parse(fs.readFileSync('docs/data/migration/inputs.json','utf8')),output='docs/data/flow-bounds';
fs.mkdirSync(output,{recursive:true});
const states={};
for(const uf of [...new Set(data.units.map(u=>u.uf))].sort()){
 const units=data.units.filter(u=>u.uf===uf);states[uf]=sumBounds(units);states[uf].accounting=accounting(states[uf]);
 const cities=Object.fromEntries(units.map(u=>{const b=unitBounds(u);return[u.id,{...b,accounting:accounting(b),registered:u.registered,name:u.name}];}));
 fs.writeFileSync(`${output}/${uf.toLowerCase()}.json`,JSON.stringify({version:1,kind:'conditional-mathematical-bounds',uf,cities}));
}
const national=sumBounds(data.units);national.accounting=accounting(national);
const model={version:1,kind:'conditional-mathematical-bounds',builtAt:'2026-10-27',sourceDigest:data.sourceDigest,sourceFileCount:data.sourceFileCount,sourceGroups:data.sourceGroups,targetGroups:data.targetGroups,national,states,method:{formula:'max(0, X_i + Y_j - N) <= flow_ij <= min(X_i, Y_j)',aggregation:'sum of separate local bounds; not bounds of pooled totals',assumption:'closed comparable local population with accounting adjustment; not observed individual trajectories',probability:false,confidenceInterval:false,pointEstimate:false,oldModelStatus:'withdrawn: arithmetic validated, transition estimates not validated'}};
fs.writeFileSync(`${output}/bounds.json`,JSON.stringify(model));
console.log(JSON.stringify({units:data.units.length,accounting:national.accounting,bnToFlavio:[national.low[7][1],national.high[7][1]],absentToFlavio:[national.low[8][1],national.high[8][1]]}));
