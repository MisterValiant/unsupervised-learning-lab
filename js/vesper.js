/* Reusable Vesper guide and decorative orbiting mascot. */
window.LabVesper = (() => {
const {$, reducedMotion, playSound}=LabShared;
function createGuide(options={}){
  if(!$('guideBot'))return null;
  let orbitEnabled=true;
  const tipMap=options.tips||{};
  const positionArrow=()=>options.onPosition?.();
function setOrbitEnabled(enabled){if(enabled!==orbitEnabled)playSound(enabled?'on':'off');orbitEnabled=enabled;options.onEnabled?.(enabled);$('botPower').textContent=enabled?'(On)':'(Off)';$('botHandle').setAttribute('aria-pressed',String(enabled));$('botHandle').setAttribute('aria-label','Vesper '+(enabled?'on. Click to turn off.':'off. Click to turn on.')+' Drag to move; arrow keys reposition.');$('guideBot').classList.toggle('orbit-off',!enabled);if(!enabled){options.onDisable?.();$('botBubble').hidden=true;$('guideArrow').hidden=true}else{if(options.isActivityLocked?.()){$('botBubble').hidden=false;positionBubble()}else botSay(options.welcome||'Vesper is on. Hover over a control for a tip.')}clampBot()}
function botSay(text,activity=false){if(!orbitEnabled||(options.isActivityLocked?.()&&!activity))return;let changed=$('botTip').textContent!==text;$('botBubble').hidden=false;$('botTip').textContent=text;if(changed&&!reducedMotion.matches){const face=$('orbitFace');face.classList.remove('tip-react');void face.offsetWidth;face.classList.add('tip-react')}positionBubble()}
function showTip(el){if(!orbitEnabled||options.isTourActive?.()||options.isActivityLocked?.())return;let node=el?.closest?.('[data-orbit-tip]');if(node){let key=node.id.replace("Trigger","");if(key==="kMinus"||key==="kPlus")key="k";if(tipMap[key])botSay(tipMap[key])}}
Object.keys(tipMap).forEach(id=>{let el=$(id);if(el)el.setAttribute('data-orbit-tip','true')});
document.addEventListener('pointerover',e=>showTip(e.target));document.addEventListener('focusin',e=>showTip(e.target));
$('botHide').onclick=()=>{options.onClose?.();$('botBubble').hidden=true;$('guideArrow').hidden=true;clampBot()};let botDrag=null,moved=false;const bot=$('guideBot'),handle=$('botHandle');
function placeBot(x,y){let width=bot.offsetWidth,height=bot.offsetHeight;bot.style.right='auto';bot.style.bottom='auto';bot.style.left=Math.max(12,Math.min(window.innerWidth-width-12,x))+'px';bot.style.top=Math.max(12,Math.min(window.innerHeight-height-12,y))+'px'}
function positionBubble(){const bubble=$('botBubble');if(bubble.hidden)return;const r=$('guideBot').getBoundingClientRect(),above=Math.max(0,r.top-22),below=Math.max(0,window.innerHeight-r.bottom-22);const upward=above>=Math.min(bubble.scrollHeight,280)||above>=below;bubble.style.bottom=upward?'calc(100% + 10px)':'auto';bubble.style.top=upward?'auto':'calc(100% + 10px)';bubble.style.maxHeight=Math.max(0,upward?above:below)+'px'}
function clampBot(){if(bot.style.left){let r=bot.getBoundingClientRect();placeBot(r.left,r.top)}positionBubble();positionArrow()}
handle.addEventListener('pointerdown',e=>{let r=bot.getBoundingClientRect();botDrag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};moved=false;handle.setPointerCapture(e.pointerId)});handle.addEventListener('pointermove',e=>{if(!botDrag)return;let dx=e.clientX-botDrag.x,dy=e.clientY-botDrag.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;if(moved){placeBot(botDrag.left+dx,botDrag.top+dy);bot.style.pointerEvents='none';handle.style.pointerEvents='none';$('botBubble').style.pointerEvents='none';showTip(document.elementFromPoint(e.clientX,e.clientY));handle.style.pointerEvents='';$('botBubble').style.pointerEvents='';clampBot()}});handle.addEventListener('pointerup',()=>{botDrag=null;if(!moved)setOrbitEnabled(!orbitEnabled)});handle.addEventListener('pointercancel',()=>{botDrag=null});handle.addEventListener('click',e=>{if(e.detail===0)setOrbitEnabled(!orbitEnabled)});handle.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();let r=bot.getBoundingClientRect();placeBot(r.left+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),r.top+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0))});
window.addEventListener('resize',clampBot);
$('orbitFace')?.addEventListener('animationend',()=>{$('orbitFace').classList.remove('tip-react')});
positionBubble();
return {setEnabled:setOrbitEnabled,say:botSay,showTip,positionBubble,clamp:clampBot};
}
function initScene(){
// Keep repulsion tangential: the markers always remain on their circular tracks.
const vesperScene=document.querySelector('.vesper-scene'),vesperImage=document.querySelector('.vesper-image');let vesperPointer=null,orbitFrame=null,orbitLast=0;
if(!vesperScene||!vesperImage)return;
const orbitParticles=Array.from(vesperScene.querySelectorAll('.orbit-data,.orbit-centroid')).map((node,i)=>({node,track:node.parentElement,angle:([-2.08,.14,2.25,2.3,-.85][i]),offset:0,velocity:0,speed:(i<3?1:-1)*Math.PI*2/(i<3?22:17)}));
function wrapAngle(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function tangentialRepulsion(angle,trackRect,pointer){if(!pointer)return 0;const radius=trackRect.width/2,cx=trackRect.left+radius,cy=trackRect.top+trackRect.height/2,px=cx+Math.cos(angle)*radius,py=cy+Math.sin(angle)*radius,distance=Math.hypot(px-pointer.x,py-pointer.y);if(distance>=48)return 0;let mouseAngle=Math.atan2(pointer.y-cy,pointer.x-cx),direction=Math.sign(wrapAngle(angle-mouseAngle))||1;return direction*.38*(1-distance/48)}
function renderVesperOrbits(now){let dt=Math.min(.04,orbitLast?(now-orbitLast)/1000:0);orbitLast=now;for(const p of orbitParticles){if(!reducedMotion.matches){p.angle+=p.speed*dt;let target=tangentialRepulsion(p.angle+p.offset,p.track.getBoundingClientRect(),vesperPointer);p.velocity+=(target-p.offset)*42*dt;p.velocity*=Math.exp(-9*dt);p.offset=Math.max(-.42,Math.min(.42,p.offset+p.velocity*dt))}else{p.offset=0;p.velocity=0}let radius=p.track.clientWidth/2,theta=p.angle+p.offset;p.node.style.right='auto';p.node.style.bottom='auto';p.node.style.left=(radius+Math.cos(theta)*radius-p.node.offsetWidth/2)+'px';p.node.style.top=(radius+Math.sin(theta)*radius-p.node.offsetHeight/2)+'px'}if(!document.hidden&&!reducedMotion.matches)orbitFrame=requestAnimationFrame(renderVesperOrbits);else orbitFrame=null}
function resumeVesperOrbits(){if(orbitFrame)cancelAnimationFrame(orbitFrame);orbitLast=0;renderVesperOrbits(performance.now())}
vesperScene.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')vesperPointer={x:e.clientX,y:e.clientY}});vesperScene.addEventListener('pointerleave',()=>{vesperPointer=null});vesperImage.addEventListener('pointerenter',()=>{if(reducedMotion.matches)return;vesperImage.classList.remove('vesper-greet');void vesperImage.offsetWidth;vesperImage.classList.add('vesper-greet')});vesperImage.addEventListener('animationend',e=>{if(e.animationName==='vesper-greet')vesperImage.classList.remove('vesper-greet')});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(orbitFrame)cancelAnimationFrame(orbitFrame);orbitFrame=null}else resumeVesperOrbits()});reducedMotion.addEventListener('change',resumeVesperOrbits);window.addEventListener('resize',()=>{if(reducedMotion.matches)resumeVesperOrbits()});resumeVesperOrbits();


}
return {createGuide,initScene};
})();

/* LAB RADIO SHARED START */
(() => {
 if(window.parent!==window||!document.head||document.getElementById('labRadioLoader'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='css/music-player.css';document.head.appendChild(css);
 const catalogue=document.createElement('script');catalogue.id='labRadioLoader';catalogue.src='js/music-playlists.js';
 catalogue.onload=()=>{const player=document.createElement('script');player.src='js/music-player.js';document.head.appendChild(player)};
 document.head.appendChild(catalogue);
})();
/* LAB RADIO SHARED END */
