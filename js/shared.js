/* Shared lab services. No K-means state or page startup lives here. */
window.LabShared = (() => {
const $=id=>document.getElementById(id);
const colors=['#32cfdf','#df50bb','#e1d744','#946ddf','#719aef','#ed855b'];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let celebrationTimer=null;
let soundEnabled=true,audioContext=null,lastSoundAt=-10,lastSoundKind=null,soundResumePending=false,pendingSound=null;
try{soundEnabled=localStorage.getItem('vesper-lab-sound')!=='off'}catch{}
function updateSoundToggle(){$('soundLabel').textContent=soundEnabled?'Sound on':'Sound off';$('soundToggle').setAttribute('aria-pressed',String(soundEnabled));$('soundToggle').setAttribute('aria-label',soundEnabled?'Sound on. Click to mute sound effects.':'Sound off. Click to enable sound effects.')}
// Retain one cue while the browser unlocks a suspended AudioContext.
function resumeAudio(){
 if(!audioContext||soundResumePending)return;
 soundResumePending=true;
 try{Promise.resolve(audioContext.resume()).then(()=>{
  soundResumePending=false;
  const cue=pendingSound;pendingSound=null;
  if(soundEnabled&&audioContext.state==='running'&&cue)playSound(cue);
 }).catch(()=>{soundResumePending=false;pendingSound=null})}catch{soundResumePending=false;pendingSound=null}
}
function unlockAudio(){if(!soundEnabled)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioContext)audioContext=new Audio();if(audioContext.state!=='running')resumeAudio()}catch{}}
function playSound(kind){if(!soundEnabled||!audioContext||document.hidden)return;if(audioContext.state!=='running'){if(pendingSound!=='celebrate')pendingSound=kind;resumeAudio();return}try{const t=audioContext.currentTime;if(kind!=='celebrate'&&lastSoundKind!=='hover'&&t-lastSoundAt<.055)return;lastSoundAt=t;lastSoundKind=kind;const patterns={celebrate:[[523.25,0,.15],[659.25,.10,.15],[783.99,.20,.17],[1046.5,.32,.27]],flip:[[390,0,.10],[585,.045,.10]],step:[[440,0,.08],[660,.07,.10]],assign:[[560,0,.12]],move:[[420,0,.10],[630,.07,.12]],toggle:[[620,0,.09]],wrong:[[310,0,.12],[245,.10,.15]],point:[[880,0,.055]],draw:[[740,0,.08],[980,.065,.10]],clear:[[430,0,.09],[570,.07,.10]],deck:[[480,0,.065],[720,.06,.09]],on:[[470,0,.09],[705,.08,.12]],off:[[705,0,.09],[470,.08,.12]],tap:[[650,0,.075]],hover:[[1050,0,.035]],open:[[480,0,.08],[720,.055,.11]],navigate:[[520,0,.06],[780,.045,.08]]};for(const [frequency,delay,duration]of(patterns[kind]||patterns.step)){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,t+delay);if(kind==='flip')oscillator.frequency.exponentialRampToValueAtTime(frequency*1.3,t+delay+duration);gain.gain.setValueAtTime(0,t+delay);gain.gain.linearRampToValueAtTime(kind==='celebrate'?.045:kind==='point'?.008:kind==='hover'?.006:.035,t+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+delay+duration);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t+delay);oscillator.stop(t+delay+duration+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()}}}catch{}}
function initSound(){
 if(!$('soundToggle'))return;
 updateSoundToggle();
 document.addEventListener('pointerdown',unlockAudio,{passive:true,capture:true});
 document.addEventListener('keydown',unlockAudio,true);
 $('soundToggle').onclick=()=>{
  soundEnabled=!soundEnabled;
  try{localStorage.setItem('vesper-lab-sound',soundEnabled?'on':'off')}catch{}
  updateSoundToggle();
  if(soundEnabled){unlockAudio();playSound('toggle')}
  else {pendingSound=null;if(audioContext)audioContext.suspend().catch(()=>{})}
 };
 let lastHover=-1000,lastHoverControl=null;
 document.addEventListener('pointerover',event=>{
  if(event.pointerType==='touch'||!audioContext)return;
  const control=event.target?.closest?.('#labSelectTrigger, a[href="week2.html"].button-link, a[href="week1.html"].button-link, #openCurrentLab, .vesper-image');
  if(!control||control.disabled||control===event.relatedTarget||control.contains?.(event.relatedTarget))return;
  const now=performance.now();if(control===lastHoverControl||now-lastHover<1200)return;lastHover=now;lastHoverControl=control;playSound('hover');
 });
 document.addEventListener('click',event=>{
  const control=event.target?.closest?.('a,summary,#restart,#reset,#kMinus,#kPlus,#botHide');
  if(!control||control.disabled)return;
  playSound(control.tagName==='A'?'navigate':control.tagName==='SUMMARY'?'open':'tap');
 },true);
}

// Celebrations accept a page-specific origin.
function celebrate(anchor, palette=colors){playSound('celebrate');const layer=$('celebration');if(celebrationTimer)clearTimeout(celebrationTimer);layer.replaceChildren();const rect=anchor?anchor.getBoundingClientRect():{left:0,top:0,width:window.innerWidth,height:window.innerHeight},cx=Math.max(80,Math.min(window.innerWidth-80,rect.left+rect.width/2)),cy=Math.max(90,Math.min(window.innerHeight-110,rect.top+rect.height/2));for(let i=0;i<70;i++){let bit=document.createElement('i');bit.className='confetti-bit';let dx=(Math.random()-.5)*Math.min(600,window.innerWidth*.85),dy=100+Math.random()*210,spin=(Math.random()-.5)*900;bit.style.background=palette[i%palette.length];bit.style.left=(reducedMotion.matches?Math.max(8,Math.min(window.innerWidth-15,cx+dx)):cx)+'px';bit.style.top=(reducedMotion.matches?Math.max(8,Math.min(window.innerHeight-20,cy+(Math.random()-.5)*160)):cy)+'px';bit.style.setProperty('--drift',dx+'px');bit.style.setProperty('--fall',dy+'px');bit.style.setProperty('--spin',spin+'deg');layer.appendChild(bit);if(!reducedMotion.matches){if(typeof bit.animate==='function')bit.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:'translate('+dx*.55+'px,-'+(40+Math.random()*90)+'px) rotate('+spin*.45+'deg)',opacity:1,offset:.4},{transform:'translate('+dx+'px,'+dy+'px) rotate('+spin+'deg)',opacity:0}],{duration:1900+Math.random()*350,easing:'cubic-bezier(.15,.65,.4,1)',fill:'forwards'});else bit.style.animation='confetti-local 2s ease-out forwards'}else{bit.style.transform='rotate('+spin+'deg)';bit.style.opacity='.9'}}celebrationTimer=setTimeout(()=>{layer.replaceChildren();celebrationTimer=null},2500)}
// Keyboard-accessible themed dropdowns.
function initSelectMenus(ids, onChange){
  ids=ids.filter(id=>$(id)&&$(id+'Trigger'));
  if(!ids.length||!$('labOptions'))return null;
  function syncSelectLabels(){ids.forEach(id=>{const select=$(id);$(id+'Trigger').querySelector('span').textContent=select.options[select.selectedIndex].textContent})}
let activeSelect=null;const menu=$('labOptions');function closeLabMenu(returnFocus=false){if(activeSelect){$(activeSelect+'Trigger').setAttribute('aria-expanded','false');if(returnFocus)$(activeSelect+'Trigger').focus()}menu.hidden=true;activeSelect=null}
function openLabMenu(id){playSound('open');if(activeSelect===id){closeLabMenu();return}closeLabMenu();activeSelect=id;let select=$(id),trigger=$(id+'Trigger');menu.replaceChildren();menu.setAttribute('aria-label',id==='dataset'?'Dataset choices':'Lab choices');Array.from(select.options).forEach(option=>{const button=document.createElement('button');button.type='button';button.className='select-option';button.setAttribute('role','option');button.setAttribute('aria-selected',String(option.selected));button.textContent=option.textContent;button.disabled=option.disabled;button.onclick=()=>{playSound('tap');select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));syncSelectLabels();onChange?.();closeLabMenu(true)};menu.appendChild(button)});menu.hidden=false;trigger.setAttribute('aria-expanded','true');let r=trigger.getBoundingClientRect();menu.style.width=Math.min(Math.max(r.width,210),window.innerWidth-24)+'px';menu.style.left=Math.max(12,Math.min(r.left,window.innerWidth-menu.offsetWidth-12))+'px';menu.style.top=(r.bottom+8)+'px';if(r.bottom+8+menu.offsetHeight>window.innerHeight-12)menu.style.top=Math.max(12,r.top-menu.offsetHeight-8)+'px';let current=menu.querySelector('[aria-selected="true"]');if(current&&!current.disabled)current.focus()}
ids.forEach(id=>{let trigger=$(id+'Trigger');trigger.setAttribute('data-orbit-tip','true');trigger.onclick=()=>openLabMenu(id);trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openLabMenu(id)}});document.querySelector('label[for="'+id+'"]')?.setAttribute('for',id+'Trigger')});menu.addEventListener('keydown',e=>{let items=Array.from(menu.querySelectorAll('button:not(:disabled)')),index=items.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();closeLabMenu(true)}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus()}else if(e.key==='Tab')closeLabMenu()});document.addEventListener('pointerdown',e=>{if(activeSelect&&!menu.contains(e.target)&&!$(activeSelect+'Trigger').contains(e.target))closeLabMenu()});window.addEventListener('scroll',()=>closeLabMenu(),{passive:true});window.addEventListener('resize',()=>closeLabMenu());

  syncSelectLabels();
  return {open:openLabMenu, close:closeLabMenu, sync:syncSelectLabels};
}

// Navigation remains native: no timer or animation blocks a page change.
function initNavigation(){
 initCursor();
 const prefetched=new Set();
 const assets={
  'week1.html':['css/week1.css','js/week1-core.js','js/week1-visuals.js','js/week1.js','assets/images/vesper-discovery.webp'],
  'week3.html':['css/week3.css','js/week3-core.js','js/week3.js'],
  'week2.html':['css/week2.css','js/week2.js','assets/images/vesper-kmeans.webp'],
  'index.html':['css/homepage.css','js/homepage.js','assets/images/vesper-welcome.webp']
 };
 const current=()=>window.location?.pathname?.split('/').pop()||'index.html';
 function warmPage(path){
  if(!assets[path]||path===current()||navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||''))return;
  for(const href of [path,...assets[path]]){
   if(prefetched.has(href))continue;prefetched.add(href);
   const link=document.createElement('link');link.rel='prefetch';link.href=href;document.head.appendChild(link);
  }
 }
 function indicate(){document.body.classList.add('is-navigating')}
 const select=$('labSelect');
 if(select){
  select.addEventListener('change',()=>{
   const href=select.options[select.selectedIndex].dataset?.href;
   if(href&&href!==current()){playSound('navigate');indicate();window.location.href=href}
  });
  $('labSelectTrigger')?.addEventListener('pointerenter',()=>Object.keys(assets).forEach(warmPage));
  $('labSelectTrigger')?.addEventListener('focus',()=>Object.keys(assets).forEach(warmPage));
 }
 for(const event of ['pointerover','focusin'])document.addEventListener(event,e=>{
  const link=e.target?.closest?.('a[href]');if(link)warmPage(link.getAttribute('href'));
 },{passive:true});
 document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button>0)return;
  const link=e.target?.closest?.('a[href]');if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
  const href=link.getAttribute('href');if(assets[href]&&href!==current())indicate();
 });
 window.addEventListener('pageshow',()=>document.body.classList.remove('is-navigating'));
}

// Chronos's winged V/heart companion preserves the native precision pointer.
function initCursor(){
 const companion=$('vesperPointer');if(!companion)return;
 const media=window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
 let x=-60,y=-60,frame=null;
 function hide(){companion.style.opacity='0';if(frame!==null){cancelAnimationFrame(frame);frame=null}}
 function paint(){frame=null;if(!media.matches||document.hidden)return;companion.style.transform=`translate3d(${x}px,${y}px,0)`}
 window.addEventListener('pointermove',e=>{
  if(!media.matches||document.hidden||!['mouse','pen'].includes(e.pointerType))return;
  x=e.clientX+13;y=e.clientY+12;companion.style.opacity='1';
  if(frame===null)frame=requestAnimationFrame(paint);
 },{passive:true});
 document.addEventListener('mouseleave',hide);window.addEventListener('blur',hide);
 media.addEventListener('change',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
}
return { $, colors, reducedMotion, initSound, playSound, unlockAudio, celebrate, initSelectMenus, initNavigation, initCursor };
})();
