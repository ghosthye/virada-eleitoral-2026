import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('docs/data/migration/inputs.json','utf8'));
const output='docs/data/balance';
fs.mkdirSync(output,{recursive:true});
const groups=source.sourceGroups.slice(2,7).map(({key,label})=>({key,label}));
const total=units=>units.reduce((sum,u)=>sum.map((v,i)=>v+u.X[i+2]),Array(5).fill(0));
const states={};
for(const uf of [...new Set(source.units.map(u=>u.uf))].sort()){
 const units=source.units.filter(u=>u.uf===uf);states[uf]=total(units);
 fs.writeFileSync(`${output}/${uf.toLowerCase()}.json`,JSON.stringify({version:1,uf,cities:Object.fromEntries(units.map(u=>[u.id,u.X.slice(2,7)]))}));
}
fs.writeFileSync(`${output}/overview.json`,JSON.stringify({version:1,kind:'official-balance-inputs',checkedAt:source.checkedAt,sourceDigest:source.sourceDigest,sourceFileCount:source.sourceFileCount,groups,national:total(source.units),states}));
console.log(JSON.stringify({groups:groups.length,units:source.units.length,states:Object.keys(states).length}));
