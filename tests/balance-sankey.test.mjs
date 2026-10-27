import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildBalance,balanceSVG} from '../docs/balance-sankey.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../docs/data/'+p,import.meta.url),'utf8'));
const overview=read('overview.json'),model=read('balance/overview.json');
const groups=m=>model.groups.map((g,i)=>({id:g.key,label:g.label,value:m[i]}));
test('The national Sankey displays the exact net identity, with eight inputs and two gains',()=>{
 const b=buildBalance(overview.national,groups(model.national));
 assert.equal(b.total,14098232);assert.equal(b.net,14098232);assert.equal(b.sources.length,8);
 assert.deepEqual(b.targets.map(x=>x.value),[10376694,3721538]);
 assert.deepEqual(b.sources.slice(-3).map(x=>x.value),[2960239,870302,950944]);
 assert.ok(!b.terms.some(x=>x.id==='ajuste'));
});
test('All municipalities, states and the national result close without a synthetic population adjustment',()=>{
 const files=new Map();
 for(const city of overview.municipalities){if(!files.has(city.uf))files.set(city.uf,read('balance/'+city.uf.toLowerCase()+'.json'));const b=buildBalance(city,groups(files.get(city.uf).cities[city.id]));assert.equal(b.net,(city.b[0]-city.a[0])+(city.b[1]-city.a[1]));}
 for(const state of overview.ufs)if(model.states[state.uf])buildBalance(state,groups(model.states[state.uf]));
});
test('Local declines move to the other side of the identity without negative ribbons',()=>{
 const b=buildBalance({a:[50,40,100,5,5,110],b:[55,35,90,6,8,104]},[{id:'other',label:'Outros',value:10}]);
 assert.equal(b.net,0);assert.equal(b.total,15);assert.deepEqual(b.sources.map(x=>x.value),[10,5]);
 assert.deepEqual(b.targets.map(x=>x.value),[6,1,3,5]);
 assert.ok([...b.sources,...b.targets].every(x=>x.value>0));
});
test('Zero change is readable, inconsistent candidate totals are rejected and rendering stays finite',()=>{
 const same={a:[50,50,100,0,0,100],b:[50,50,100,0,0,100]};
 assert.match(balanceSVG(buildBalance(same,[])),/Não houve parcelas/);
 assert.throws(()=>buildBalance(overview.national,[]));
 for(const width of [260,320,390,780]){const svg=balanceSVG(buildBalance(overview.national,groups(model.national)),width);assert.ok(!/NaN|Infinity/.test(svg));assert.match(svg,/data-balance="cury"/);assert.match(svg,/BALANÇO/);}
});
