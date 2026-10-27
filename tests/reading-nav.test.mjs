import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initReadingNav} from '../docs/reading-nav.js';

test('The reading menu follows the actual page order and targets unique sections',()=>{
 const html=fs.readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 const nav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)[0];
 const targets=[...nav.matchAll(/href="#([^"]+)"/g)].map(match=>match[1]);
 assert.deepEqual(targets,['entenda','mapa','meu-voto','compartilhar','fontes']);
 const positions=targets.map(id=>{assert.equal([...html.matchAll(new RegExp(`id="${id}"`,'g'))].length,1);return html.indexOf(`id="${id}"`);});
 assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
});

test('The current menu item follows long sections and updates its accessible state',()=>{
 const previous=Object.fromEntries(['document','window','requestAnimationFrame','ResizeObserver'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const ids=['inicio','entenda','conta','migracao','mapa','onde','meu-voto','compartilhar','fontes'];
 let scroll=0,queued;const events={};
 const sections=Object.fromEntries(ids.map((id,i)=>[id,{getBoundingClientRect:()=>({top:i*1000-scroll})}]));
 const links=['entenda','mapa','meu-voto','compartilhar','fontes'].map(id=>({hash:'#'+id,active:false,current:null,classList:{toggle(_class,value){links.find(link=>link.hash==='#'+id).active=value;}},setAttribute(_name,value){this.current=value;},removeAttribute(){this.current=null;}}));
 try{
  globalThis.document={querySelectorAll:()=>links,getElementById:id=>sections[id],querySelector:()=>({})};
  globalThis.window={innerHeight:844,addEventListener:(name,callback)=>{events[name]=callback;}};
  globalThis.requestAnimationFrame=callback=>{queued=callback;return 1;};
  globalThis.ResizeObserver=undefined;
  initReadingNav();
  const check=(position,expected)=>{scroll=position;events.scroll();queued();assert.deepEqual(links.filter(link=>link.active).map(link=>link.hash),['#'+expected]);assert.deepEqual(links.filter(link=>link.current==='location').map(link=>link.hash),['#'+expected]);};
  check(0,'entenda');check(2600,'entenda');check(3900,'mapa');check(5700,'mapa');check(6200,'meu-voto');check(7200,'compartilhar');check(8300,'fontes');
 }finally{for(const [key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
