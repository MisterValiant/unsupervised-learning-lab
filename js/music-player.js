/* Audio src is assigned only after a playback gesture: no media fetch on entry. */
(() => {
 const $=id=>document.getElementById(id);
 if(!$('musicPlayer'))document.body.insertAdjacentHTML('beforeend', "<aside id=\"musicPlayer\" class=\"music-player\" aria-label=\"Music player\"><div class=\"music-top\"><div class=\"music-heading\"><button id=\"musicGrip\" class=\"music-grip\" type=\"button\" aria-label=\"Move music player. Drag or use arrow keys; Home resets position.\" title=\"Drag to move \u00b7 arrow keys to reposition \u00b7 Home to reset\"><span aria-hidden=\"true\">\u283f \u266b</span> Lab Radio</button><div id=\"musicCompactStatus\" class=\"music-compact-status\" role=\"status\" aria-label=\"Ready \u00b7 press Play\"><div id=\"musicRadioTrack\" class=\"music-radio-track\" aria-hidden=\"true\"><span id=\"musicRadioText\">Ready \u00b7 press Play</span><span id=\"musicRadioRepeat\" hidden></span></div></div></div><div id=\"musicVisualizer\" class=\"music-visualizer\" aria-hidden=\"true\"><i></i><i></i><i></i><i></i></div><button id=\"musicPlay\" class=\"music-play\" type=\"button\" aria-label=\"Play music\">\u25b6 Play</button><button id=\"musicFold\" type=\"button\" aria-label=\"Expand music player\" aria-expanded=\"false\" aria-controls=\"musicBody\">+</button></div><div id=\"musicBody\" hidden><div class=\"music-now-row\"><button id=\"musicPrevious\" type=\"button\" class=\"music-skip\" aria-label=\"Previous track\" title=\"Previous track\"><svg viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M5 4v12M15 4 7 10l8 6Z\"/></svg></button><div class=\"music-picker-wrap\"><button id=\"musicTrack\" class=\"music-picker-trigger\" type=\"button\" aria-label=\"Choose a track\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"musicPlaylist\"><span id=\"musicTitle\">Shuffled playlist</span><svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path d=\"m4 6 4 4 4-4\"/></svg></button><div id=\"musicPlaylist\" class=\"music-playlist-menu\" role=\"listbox\" aria-label=\"Shuffled music playlist\" hidden></div></div><button id=\"musicNext\" type=\"button\" class=\"music-skip\" aria-label=\"Next track\" title=\"Next track\"><svg viewBox=\"0 0 20 20\" aria-hidden=\"true\"><path d=\"M15 4v12M5 4l8 6-8 6Z\"/></svg></button></div><div class=\"music-controls\"><div class=\"music-timeline\"><span class=\"music-control-label\">Playback</span><input id=\"musicSeek\" type=\"range\" min=\"0\" max=\"0\" value=\"0\" step=\"0.1\" aria-label=\"Playback position\" disabled><div class=\"music-times\"><span id=\"musicTime\">0:00</span><span id=\"musicDuration\">0:00</span></div></div><div class=\"music-volume\" role=\"group\" aria-labelledby=\"musicVolumeLabel\"><span id=\"musicVolumeLabel\" class=\"music-control-label\">Volume</span><div class=\"music-volume-buttons\"><button id=\"musicVolumeDown\" type=\"button\" aria-label=\"Decrease volume by 5 percent\" title=\"Volume \u22125%\">\u2212</button><label class=\"music-volume-entry\"><input id=\"musicVolume\" type=\"number\" min=\"0\" max=\"100\" value=\"30\" step=\"1\" inputmode=\"numeric\" aria-label=\"Volume percentage\"><span aria-hidden=\"true\">%</span></label><button id=\"musicVolumeUp\" type=\"button\" aria-label=\"Increase volume by 5 percent\" title=\"Volume +5%\">+</button></div></div></div></div><audio id=\"labMusic\" preload=\"none\"></audio></aside>");
 const panel=$('musicPlayer');if(!panel||panel.dataset.ready)return;panel.dataset.ready='true';
 // Fisher–Yates: choose both the opening song and queue order without fetching media.
 const playlist=[...(window.LabMusicTracks||[])];
 for(let i=playlist.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[playlist[i],playlist[j]]=[playlist[j],playlist[i]]}
 const tap=()=>window.LabShared?.playSound('tap');
 const audio=$('labMusic'),play=$('musicPlay'),body=$('musicBody'),fold=$('musicFold'),seek=$('musicSeek'),volume=$('musicVolume'),picker=$('musicTrack');
 let index=0,wanted=false,request=0,drag=null,radioState='ready',mediaUrl=null,download=null,scrubbing=false;
 const menu=$('musicPlaylist');
 const clock=value=>{const n=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
 // Duplicate the title only when it overflows. The duplicate makes each radio
 // scroll return seamlessly to the start, where the animation pauses to read.
 function radioScroll(){const box=$('musicCompactStatus'),track=$('musicRadioTrack'),text=$('musicRadioText'),repeat=$('musicRadioRepeat');track.classList.remove('is-scrolling');repeat.hidden=true;if(!['playing','paused'].includes(radioState)||text.scrollWidth<=box.clientWidth)return;repeat.textContent=text.textContent;repeat.hidden=false;const distance=text.scrollWidth+28;track.style.setProperty('--radio-distance',distance+'px');track.style.setProperty('--radio-duration',Math.max(12,distance/32+4)+'s');void track.offsetWidth;track.classList.add('is-scrolling')}
 function status(text,state='ready'){radioState=state;panel.dataset.playback=state;const compact=$('musicCompactStatus'),line=state==='playing'?'Playing: '+playlist[index].title:state==='buffering'?'Buffering':state==='paused'?'Paused: '+playlist[index].title:state==='error'?'Unable to play · press Play to retry':'Ready · press Play';compact.dataset.state=state;compact.setAttribute('aria-label',line);$('musicRadioText').textContent=line;compact.title=line;requestAnimationFrame(radioScroll)}
 function playLabel(){play.textContent=wanted?'Ⅱ Pause':'▶ Play';play.setAttribute('aria-label',wanted?'Pause music':'Play music')}
 function timeline(){const duration=audio.duration,valid=Number.isFinite(duration)&&duration>0,shown=scrubbing?Number(seek.value):audio.currentTime||0;seek.disabled=!valid;seek.max=valid?duration:0;if(!scrubbing)seek.value=shown;seek.style.setProperty('--music-progress',(valid?Math.max(0,Math.min(100,shown/duration*100)):0)+'%');$('musicTime').textContent=clock(shown);$('musicDuration').textContent=clock(duration);seek.setAttribute('aria-valuetext',clock(shown)+' of '+clock(duration))}
 function releaseTrack(){download?.abort();download=null;if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=null}
 function skip(direction){if(!playlist.length)return;const resume=wanted;selectTrack((index+direction+playlist.length)%playlist.length);if(resume)start()}
 $('musicPrevious').addEventListener('click',()=>{tap();skip(-1)});$('musicNext').addEventListener('click',()=>{tap();skip(1)});
 function selectTrack(next){request++;wanted=false;audio.pause();releaseTrack();audio.removeAttribute('src');audio.load();index=next;picker.value=index;$('musicTitle').textContent=playlist[index].title;picker.title=playlist[index].title;picker.setAttribute('aria-label','Choose a track. Selected: '+playlist[index].title);updateChoices();playLabel();timeline();status('Ready · audio loads when you press Play')}
 async function start(){if(!playlist.length)return;const ticket=++request;wanted=true;playLabel();status('Buffering music…','buffering');
  try{
   if(audio.error){releaseTrack();audio.removeAttribute('src')}
   // Fetch just the selected track after Play. A local Blob gives the media
   // element the whole file to seek through, independent of HTTP range support.
   if(!mediaUrl){const controller=new AbortController();download=controller;const response=await fetch(playlist[index].src,{signal:controller.signal});if(!response.ok)throw new Error('Audio unavailable');const blob=await response.blob();if(ticket!==request||!wanted)return;download=null;mediaUrl=URL.createObjectURL(blob);audio.src=mediaUrl}
   await audio.play();if(ticket!==request)return;if(!wanted){audio.pause();return}status('Playing · '+playlist[index].title,'playing')
  }catch(error){if(ticket!==request)return;download=null;wanted=false;playLabel();status('Could not play. Press Play to retry.','error')}
 }
 play.addEventListener('click',()=>{tap();if(wanted){request++;wanted=false;download?.abort();download=null;audio.pause();playLabel();status('Paused','paused')}else start()});
 function setVolume(value){const parsed=Number(value);if(!Number.isFinite(parsed))return;const percent=Math.max(0,Math.min(100,Math.round(parsed)));audio.volume=percent/100;volume.value=percent;$('musicVolumeDown').disabled=percent===0;$('musicVolumeUp').disabled=percent===100}
 setVolume(30);
 volume.addEventListener('input',()=>{if(volume.value!=='')setVolume(volume.value)});
 volume.addEventListener('change',()=>{tap();setVolume(volume.value===''?audio.volume*100:volume.value)});
 $('musicVolumeDown').addEventListener('click',()=>{tap();setVolume(Math.round(audio.volume*100)-5)});
 $('musicVolumeUp').addEventListener('click',()=>{tap();setVolume(Math.round(audio.volume*100)+5)});
 // Keep timeupdate events from pulling the thumb back during a pointer drag.
 seek.addEventListener('pointerdown',()=>{scrubbing=true});
 seek.addEventListener('pointercancel',()=>{scrubbing=false;timeline()});
 seek.addEventListener('input',()=>{if(!scrubbing&&Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Math.min(audio.duration,Math.max(0,Number(seek.value)));timeline()});
 seek.addEventListener('change',()=>{const target=Number(seek.value);scrubbing=false;if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Math.min(audio.duration,Math.max(0,target));timeline();tap()});
 ['loadedmetadata','durationchange','timeupdate','emptied'].forEach(event=>audio.addEventListener(event,timeline));
 audio.addEventListener('waiting',()=>{if(wanted)status('Buffering music…','buffering')});audio.addEventListener('playing',()=>{if(!wanted){audio.pause();return}status('Playing · '+playlist[index].title,'playing')});
 audio.addEventListener('pause',()=>{if(wanted&&mediaUrl&&!download&&audio.paused&&!audio.ended){request++;wanted=false;playLabel();status('Paused','paused')}});
 audio.addEventListener('error',()=>{request++;wanted=false;playLabel();status('Audio unavailable. Check your connection and press Play to retry.','error')});
 audio.addEventListener('ended',()=>{if(!wanted)return;selectTrack((index+1)%playlist.length);start()});
 const options=playlist.map((track,i)=>{const option=document.createElement('button');option.type='button';option.className='music-playlist-option';option.textContent=track.title;option.setAttribute('role','option');option.setAttribute('aria-selected',String(i===index));option.tabIndex=-1;option.addEventListener('click',()=>{tap();const resume=wanted;selectTrack(i);closeMenu(true);if(resume)start()});menu.append(option);return option});
 function updateChoices(){options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===index)))}
 function closeMenu(focus=false){menu.hidden=true;picker.setAttribute('aria-expanded','false');if(focus)picker.focus()}
 function openMenu(){const rect=picker.getBoundingClientRect();menu.classList[rect.top<Math.min(240,window.innerHeight*.45)+16?'add':'remove']('opens-below');menu.hidden=false;picker.setAttribute('aria-expanded','true');options[index]?.focus({preventScroll:true})}
 picker.addEventListener('click',()=>{tap();menu.hidden?openMenu():closeMenu()});
 picker.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();openMenu();if(event.key==='Home')options[0]?.focus();if(event.key==='End')options.at(-1)?.focus()}});
 menu.addEventListener('keydown',event=>{const current=options.indexOf(document.activeElement);if(event.key==='Escape'){event.preventDefault();closeMenu(true)}else if(event.key==='Tab')closeMenu();else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?options.length-1:(current+(event.key==='ArrowUp'?-1:1)+options.length)%options.length;options[next]?.focus()}});
 document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!picker.contains(event.target))closeMenu()});
 function collapse(value){if(value)closeMenu();body.hidden=value;panel.classList[value?'remove':'add']('is-expanded');fold.textContent=value?'+':'−';fold.setAttribute('aria-expanded',String(!value));fold.setAttribute('aria-label',value?'Expand music player':'Collapse music player');clamp();requestAnimationFrame(radioScroll)}
 fold.addEventListener('click',()=>{tap();collapse(!body.hidden)});
 // A back/forward-cache visit must also start with the controls closed.
 window.addEventListener('pageshow',()=>collapse(true));
 function position(x,y){const r=panel.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(window.innerWidth-r.width-8,x))+'px';panel.style.top=Math.max(8,Math.min(window.innerHeight-r.height-8,y))+'px';panel.style.bottom='auto'}
 function clamp(){if(panel.style.top){const r=panel.getBoundingClientRect();position(r.left,r.top)}}
 const grip=$('musicGrip');grip.addEventListener('pointerdown',event=>{if(event.button!==0)return;const r=panel.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX-r.left,y:event.clientY-r.top};grip.setPointerCapture(event.pointerId);panel.classList.add('is-dragging')});
 grip.addEventListener('pointermove',event=>{if(drag&&event.pointerId===drag.id)position(event.clientX-drag.x,event.clientY-drag.y)});
 function stopDrag(){drag=null;panel.classList.remove('is-dragging')}
 ['pointerup','pointercancel','lostpointercapture'].forEach(event=>grip.addEventListener(event,stopDrag));
 grip.addEventListener('keydown',event=>{const moves={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};if(event.key==='Home'){event.preventDefault();panel.style.left='';panel.style.top='';panel.style.bottom='';return}if(moves[event.key]){event.preventDefault();const r=panel.getBoundingClientRect(),[x,y]=moves[event.key];position(r.left+x,r.top+y)}});
 window.addEventListener('resize',()=>{clamp();requestAnimationFrame(radioScroll)});window.addEventListener('pagehide',()=>{request++;wanted=false;download?.abort();download=null;audio.pause();playLabel();status('Paused','paused')});
 if(!playlist.length){play.disabled=true;status('No music added yet');return}
 $('musicTitle').textContent=playlist[0].title;picker.title=playlist[0].title;picker.setAttribute('aria-label','Choose a track. Selected: '+playlist[0].title);status('Ready · audio loads when you press Play');timeline();collapse(true);
})();
