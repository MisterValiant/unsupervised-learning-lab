/* Homepage enhancement only. The full learning journey is readable without JS. */
(() => {
  const {$, reducedMotion, playSound} = LabShared;
  LabShared.initSound();
  LabShared.initNavigation();
  LabShared.initSelectMenus(['labSelect']);
  LabVesper.initScene();

  const tips = {
    journeyStart: 'Begin with the Discovery Lab: follow six introductory topics, from ML basics to preprocessing, then apply them in Lab Week 1 before studying K-means.',
    openCurrentLab: 'The K-means playground is ready. Assign observations, move centroids, draw your own case study and try the quiz quest.'
  };
  const items = Array.from(document.querySelectorAll('.journey-item'));
  items.forEach(item => {
    const heading = item.querySelector('h3');
    const description = item.querySelector('article > p');
    tips[item.id] = heading.textContent + '. ' + description.textContent;
  });
  LabVesper.createGuide({
    tips,
    welcome: 'Hi, I’m Vesper! Follow the learning journey or open the Discovery and K-means labs. Hover over a topic for a little guidance.'
  });

  // Reveal each stop once. Reduced motion and older browsers retain static content.
  let observer = null;
  function revealAll() {
    document.body.classList.remove('motion-ready');
    items.forEach(item => item.classList.add('is-revealed'));
    observer?.disconnect();
  }
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    observer = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -30px 0px'});
    items.forEach(item => observer.observe(item));
    document.body.classList.add('motion-ready');
  } else revealAll();

  // One scheduled frame handles scroll progress and restrained background parallax.
  const shell = document.querySelector('.journey-shell');
  const art = document.querySelector('.hero-art');
  const plane = document.querySelector('.home-parallax-plane');
  let pointer = {x: 0, y: 0}, frame = null;
  function paint() {
    frame = null;
    if (document.hidden) return;
    const rect = shell.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - rect.top) / Math.max(1, rect.height)));
    shell.style.setProperty('--journey-progress', String(progress));
    const scroll = window.scrollY || 0;
    document.body.style.setProperty('--ambient-shift', reducedMotion.matches ? '0px' : -Math.min(60, scroll * 0.035) + 'px');
    plane.style.setProperty('--mascot-x', reducedMotion.matches ? '0px' : pointer.x * 5 + 'px');
    plane.style.setProperty('--mascot-y', reducedMotion.matches ? '0px' : pointer.y * 5 - Math.min(18, scroll * 0.035) + 'px');
  }
  function schedule() {
    if (frame === null && !document.hidden) frame = requestAnimationFrame(paint);
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  art.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = art.getBoundingClientRect();
    pointer = {x: Math.max(-1,Math.min(1,(event.clientX - rect.left) / rect.width * 2 - 1)), y: Math.max(-1,Math.min(1,(event.clientY - rect.top) / rect.height * 2 - 1))};
    schedule();
  });
  art.addEventListener('pointerleave', () => {pointer = {x: 0, y: 0}; schedule()});
  reducedMotion.addEventListener('change', () => {if (reducedMotion.matches) revealAll(); schedule()});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame !== null) {cancelAnimationFrame(frame); frame = null}
    else schedule();
  });
  document.querySelectorAll('.journey-card details').forEach(details => {
    details.addEventListener('toggle', () => {if (details.open) playSound('deck'); schedule()});
  });
  paint();
})();
