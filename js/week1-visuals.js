/* Week 1 orientation: section tracking and viewport-limited conceptual motion. */
window.DiscoveryVisuals = (() => {
  const sections=Array.from(document.querySelectorAll('.discovery-section[data-section-number]'));
  const nav=document.querySelector('.discovery-nav');
  const links=Array.from(document.querySelectorAll('.section-links a'));
  const number=document.getElementById('currentSectionNumber');
  const name=document.getElementById('currentSectionName');
  const marker=document.getElementById('currentSection');
  const figures=Array.from(document.querySelectorAll('[data-topic-visual]'));
  const animatedStages=Array.from(document.querySelectorAll('.topic-representation,.technique-visual,.prep-plot'));
  let active=null,frame=null;
  function updateSection(){
    frame=null;if(!nav||!sections.length)return;
    document.documentElement?.style.setProperty('--discovery-nav-height',(nav.offsetHeight||80)+'px');
    const threshold=Math.max(0,nav.getBoundingClientRect().bottom)+42;
    let current=sections[0];
    for(const section of sections){if(section.getBoundingClientRect().top<=threshold)current=section;else break}
    if(current===active)return;active=current;
    window.Week1Guidance?.section(current.id);
    if(number)number.textContent=current.dataset.sectionNumber;
    if(name)name.textContent=current.dataset.sectionTitle;
    if(marker){marker.style.setProperty('--current-color',current.style.getPropertyValue('--topic-color'));marker.setAttribute('aria-label','Current section: '+current.dataset.sectionNumber+' · '+current.dataset.sectionTitle)}
    sections.forEach(section=>section.classList.toggle('is-current-section',section===current));
    links.forEach(link=>{if(link.getAttribute('href')==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  }
  function schedule(){if(frame===null&&!document.hidden)frame=requestAnimationFrame(updateSection)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  window.addEventListener('pageshow',schedule);window.addEventListener('hashchange',schedule);
  const visibility=()=>{document.body.classList.toggle('discovery-tab-hidden',document.hidden);if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null}else schedule()};
  document.addEventListener('visibilitychange',visibility);
  // No hidden/revealed content dependency: without this API the illustrations stay visible.
  if('IntersectionObserver' in window){
    const observer=new window.IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('visual-in-view',entry.isIntersecting)),{rootMargin:'30px 0px',threshold:0});
    document.body.classList.add('discovery-observed');animatedStages.forEach(figure=>observer.observe(figure));
  }
  function setMode(id,mode){figures.filter(f=>f.dataset.topicVisual===id).forEach(figure=>{figure.dataset.mode=mode})}
  updateSection();visibility();
  return {setMode};
})();
