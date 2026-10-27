// Match the reading order, including sections grouped under the same menu item.
export function initReadingNav(){
 const links=[...document.querySelectorAll('.bottom-nav a')];
 const chapters=[['inicio','entenda'],['entenda','entenda'],['conta','entenda'],['migracao','entenda'],['mapa','mapa'],['onde','mapa'],['meu-voto','meu-voto'],['compartilhar','compartilhar'],['fontes','fontes']].map(([id,nav])=>({element:document.getElementById(id),nav})).filter(chapter=>chapter.element);
 let frame=0;
 function update(){
  frame=0;let current=chapters[0]?.nav;
  const readingLine=Math.min(150,window.innerHeight*.22);
  for(const chapter of chapters){if(chapter.element.getBoundingClientRect().top<=readingLine)current=chapter.nav;}
  for(const link of links){const active=link.hash==='#'+current;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 window.addEventListener('hashchange',schedule);
 if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.querySelector('main'));
 update();
}
