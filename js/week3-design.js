/* Week 3 presentation: the shared section-guide pattern, and a quiet data wave. */
(() => {
 const nav=document.querySelector('.w3-section-nav'),sections=[...document.querySelectorAll('.w3-section[data-section-number]')],links=[...document.querySelectorAll('.w3-section-links a')],number=document.getElementById('w3CurrentNumber'),name=document.getElementById('w3CurrentName'),marker=document.getElementById('w3CurrentSection');
 let scheduled=null,active=null;
 function update(){scheduled=null;if(!nav)return;document.documentElement.style.setProperty('--w3-nav-height',nav.offsetHeight+'px');const threshold=Math.max(0,nav.getBoundingClientRect().bottom)+42;let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=threshold)current=section;else break}if(!current||current===active)return;active=current;number.textContent=current.dataset.sectionNumber;number.classList.toggle('is-wide',current.dataset.sectionNumber.length>2);name.textContent=current.dataset.sectionTitle;marker.style.setProperty('--current-color',current.style.getPropertyValue('--topic-color'));marker.setAttribute('aria-label','Current section: '+current.dataset.sectionNumber+' · '+current.dataset.sectionTitle);sections.forEach(section=>section.classList.toggle('is-current-section',section===current));links.forEach(link=>{if(link.getAttribute('href')==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});}
 function schedule(){if(scheduled===null&&!document.hidden)scheduled=requestAnimationFrame(update)}
 ['scroll','resize','pageshow','hashchange'].forEach(event=>window.addEventListener(event,schedule,{passive:true}));
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('w3-motion-paused',document.hidden);if(document.hidden&&scheduled!==null){cancelAnimationFrame(scheduled);scheduled=null}else schedule()});
 const stage=document.querySelector('.w3-hero-art'),svg=document.getElementById('heroPlot');
 if(stage&&svg){const colors=['#62dfe9','#ed85c9','#e3d679'];let out='';for(let row=0;row<3;row++){const base=110+row*70,amplitude=25+row*8,points=[];let dots='';for(let i=-40;i<=80;i++){const x=i*12.5,y=base+Math.sin(x/250*Math.PI*2+row*.9)*amplitude;points.push(x+','+y);if(i%2===0)dots+=`<circle cx="${x}" cy="${y}" r="${i%6===0?4:2.6}" fill="${colors[row]}" opacity="${row===0?.65:.5}"/>`}out+=`<g class="w3-wave-stream"><polyline points="${points.join(' ')}" fill="none" stroke="${colors[row]}" stroke-width="1.4" opacity=".25"/>${dots}</g>`}svg.innerHTML=out;
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>stage.classList.toggle('is-in-view',entries[0].isIntersecting),{rootMargin:'40px',threshold:0});observer.observe(stage)}else stage.classList.add('is-in-view');
 }
 // Match the other lessons: greet on pointer entry, then resume the idle float.
 const mascot=stage?.querySelector('.vesper-image'),motion=window.LabShared?.reducedMotion;
 if(mascot){
  mascot.addEventListener('pointerenter',()=>{if(motion?.matches)return;mascot.classList.remove('vesper-greet');void mascot.offsetWidth;mascot.classList.add('vesper-greet')});
  mascot.addEventListener('animationend',event=>{if(event.animationName==='vesper-greet')mascot.classList.remove('vesper-greet')});
  motion?.addEventListener('change',()=>{if(motion.matches)mascot.classList.remove('vesper-greet')});
 }
 update();
 window.Week3Design={update};
})();
