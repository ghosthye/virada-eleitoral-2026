import test from 'node:test';
import assert from 'node:assert/strict';
import { territoryBreakdown } from '../docs/territory-math.js';
import overview from '../docs/data/overview.json' with { type: 'json' };

test('the city breakdown reconciles for every published municipal dataset',()=>{
  for(const m of overview.municipalities){
    const x=territoryBreakdown(m.a,m.b);
    assert.equal(x.eliminated+x.turnout+x.invalidReduction,x.combined,m.name+'-'+m.uf);
    assert.equal(x.lula-x.flavio,x.marginChange,m.name+'-'+m.uf);
  }
});

test('Palmares regression matches the supplied TSE dataset and closes the balance',()=>{
  const m=overview.municipalities.find(x=>x.id==='2610004');
  assert.ok(m);
  assert.equal(m.a[0],20803);
  assert.equal(m.b[0],23760);
  assert.equal(m.a[1],8493);
  assert.equal(m.b[1],8930);
  const x=territoryBreakdown(m.a,m.b);
  assert.equal(x.combined,3394);
  assert.equal(x.marginChange,2520);
});

test('negative turnout, invalid-vote and candidate gains are represented without breaking the identity',()=>{
  const a=[100,120,300,20,30,350];
  const b=[130,110,240,25,35,300];
  const x=territoryBreakdown(a,b);
  assert.equal(x.eliminated,80);
  assert.equal(x.turnout,-50);
  assert.equal(x.invalidReduction,-10);
  assert.equal(x.lula,30);
  assert.equal(x.flavio,-10);
  assert.equal(x.combined,20);
  assert.equal(x.marginChange,40);
});

test('the margin identity handles a winner changing between turns',()=>{
  const a=[90,110,250,15,25,290];
  const b=[130,100,230,10,20,260];
  const x=territoryBreakdown(a,b);
  assert.ok((a[0]-a[1])<0);
  assert.ok((b[0]-b[1])>0);
  assert.equal(x.marginChange,50);
});

test('rejects totals that do not reconcile',()=>{
  assert.throws(()=>territoryBreakdown([10,10,25,2,3,20],[15,15,32,2,3,22]),/não fecham/);
});
