/* Additional Week 2 activities; isolated from the original playground state. */
(() => {
 const $=id=>document.getElementById(id);
 if(!$('week2More'))return;
 const palette=['#32cfdf','#df50bb','#e1d744','#a898ef','#7ce0a7','#f3ab6e','#94bee9','#ed8f9d'];
 const fmt=(value,digits=3)=>Number(value).toLocaleString(undefined,{maximumFractionDigits:digits});
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sound=()=>window.LabShared?.playSound('tap');
 let lastHelp='';
 function speak(text){if(typeof tourStage!=='undefined'&&tourStage>=0)return;if($('botHandle')?.getAttribute('aria-pressed')==='false')return;lastHelp=text;window.botSay?.(text)}
 // Hover and keyboard focus offer quiet help; selecting a value gives specific feedback.
 function help(node,message){if(!node)return;const show=()=>{const text=typeof message==='function'?message():message;if(text!==lastHelp&&!$('botBubble')?.hidden)speak(text)};node.addEventListener('pointerenter',show);node.addEventListener('focus',show)}
 function pointHelp(index){const g=data.mixture,p=g.probabilities[index];return 'Observation '+(index+1)+': GMM component 1 '+fmt(p[0]*100,1)+'%, component 2 '+fmt(p[1]*100,1)+'%. '+(Math.max(...p)<.7?'Both components have substantial membership here: notice the overlap. ':'The fitted model favours one component here. ')+'K-means assigns group '+(g.hardLabels[index]+1)+'. These probabilities describe the fitted model, not verified class labels.'}
 function kHelp(value){const f=data.examples[example].fits[value-1];return 'At k = '+value+', SSE is '+fmt(f.sse)+', and '+(f.silhouette===null?'silhouette is undefined because there is only one group.':'mean silhouette is '+fmt(f.silhouette)+'. Values near 1 indicate separation; near 0 suggest overlap; negative values suggest a point may fit another group better.')+' Compare the plotted grouping and neighbouring k values; lower SSE alone does not choose k.'}
 let data=null,example='separated',k=3,mode='hard',selected=0;
 function scale(points,width=520,height=340){
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
   const lo=[Math.min(...xs),Math.min(...ys)],hi=[Math.max(...xs),Math.max(...ys)];
   const px=x=>52+((x-lo[0])/(hi[0]-lo[0]||1))*(width-82),py=y=>height-50-((y-lo[1])/(hi[1]-lo[1]||1))*(height-90);
   return {px,py,lo,hi,width,height};
 }
 function axes(s){let out='<path d="M42 25V'+(s.height-40)+'H'+(s.width-18)+'" stroke="#648ca6" fill="none"/>';
   for(let i=0;i<4;i++){const x=s.lo[0]+(s.hi[0]-s.lo[0])*i/3,y=s.lo[1]+(s.hi[1]-s.lo[1])*i/3;out+='<text x="'+s.px(x)+'" y="'+(s.height-23)+'" text-anchor="middle">'+fmt(x,1)+'</text><text x="35" y="'+(s.py(y)+4)+'" text-anchor="end">'+fmt(y,1)+'</text>'}
   return out+'<text x="'+(s.width/2)+'" y="'+(s.height-5)+'" text-anchor="middle">Standardised feature 1</text><text transform="translate(12 '+(s.height/2)+') rotate(-90)" text-anchor="middle">Standardised feature 2</text>';
 }
 const cross=(x,y,color)=>'<path d="M'+(x-6)+' '+(y-6)+'L'+(x+6)+' '+(y+6)+'M'+(x+6)+' '+(y-6)+'L'+(x-6)+' '+(y+6)+'" stroke="'+color+'" stroke-width="3"/>';
 function scatter(points,labels,centers){const s=scale(points);let out='<svg viewBox="0 0 520 340" role="img" aria-label="Selected K-means grouping for k = '+k+'">'+axes(s);
   points.forEach((p,i)=>out+='<circle cx="'+s.px(p[0])+'" cy="'+s.py(p[1])+'" r="4.2" fill="'+palette[labels[i]]+'" fill-opacity=".85"/>');centers.forEach((p,i)=>out+=cross(s.px(p[0]),s.py(p[1]),'#ffffff'));return out+'</svg>';
 }
 function chart(fits,key,title){const valid=fits.filter(f=>f[key]!==null);const w=520,h=230,left=58,right=495,top=35,bottom=177;const min=key==='silhouette'?-1:0,max=key==='silhouette'?1:Math.max(...valid.map(f=>f[key]))*1.06;
   const px=n=>left+(n-1)/7*(right-left),py=v=>bottom-(v-min)/(max-min)*(bottom-top);
   let out='<svg viewBox="0 0 '+w+' '+h+'" aria-label="'+title+'. Select a point to compare k." role="group"><text x="'+left+'" y="20" font-weight="700">'+title+'</text>';
   for(let i=0;i<3;i++){const v=min+(max-min)*i/2;out+='<path d="M'+left+' '+py(v)+'H'+right+'" stroke="#56758d44"/><text x="'+(left-8)+'" y="'+(py(v)+4)+'" text-anchor="end">'+fmt(v,1)+'</text>'}
   out+='<polyline points="'+valid.map(f=>px(f.k)+','+py(f[key])).join(' ')+'" fill="none" stroke="#89e2ed" stroke-width="2"/>';
   for(let n=1;n<=8;n++)out+='<text x="'+px(n)+'" y="197" text-anchor="middle">'+n+'</text>';
   valid.forEach(f=>{const chosen=f.k===k;out+='<g class="w2-chart-choice" role="button" tabindex="0" data-k="'+f.k+'" aria-pressed="'+chosen+'" aria-label="k = '+f.k+', '+title+' '+fmt(f[key])+'"><circle cx="'+px(f.k)+'" cy="'+py(f[key])+'" r="12" fill="transparent"/><circle cx="'+px(f.k)+'" cy="'+py(f[key])+'" r="'+(chosen?7:4.5)+'" fill="'+(chosen?'#e1d744':'#32cfdf')+'"/></g>'});
   return out+'<text x="275" y="220" text-anchor="middle">Number of clusters, k</text></svg>';
 }
 function wireChoices(id,attr,handler){$(id).querySelectorAll('['+attr+']').forEach(node=>{
   help(node,()=>attr==='data-k'?kHelp(Number(node.getAttribute(attr))):pointHelp(Number(node.getAttribute(attr))));
   node.addEventListener('click',()=>handler(Number(node.getAttribute(attr)),false));
   node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();handler(Number(node.getAttribute(attr)),true)}});
 })}
 function renderSelection(){if(!data)return;const d=data.examples[example],fit=d.fits[k-1];$('w2K').value=k;$('w2KValue').textContent=k;$('w2GroupingTitle').textContent=d.name+' · k = '+k;
   $('w2Grouping').innerHTML=scatter(d.points,fit.labels,fit.centers);
   $('w2Metrics').innerHTML='<span>SSE: '+fmt(fit.sse)+'</span><span>Mean silhouette: '+(fit.silhouette===null?'not defined for k = 1':fmt(fit.silhouette))+'</span>';
   $('w2Elbow').innerHTML=chart(d.fits,'sse','Elbow plot · SSE');$('w2Silhouette').innerHTML=chart(d.fits,'silhouette','Mean silhouette');
   const candidates=d.fits.filter(f=>f.silhouette!==null),best=candidates.reduce((a,b)=>a.silhouette>b.silhouette?a:b);
   $('w2SelectionExplanation').textContent=(k===1?'One cluster gives no other group for a silhouette comparison. ':'For k = '+k+', inspect the grouping and compare the SSE reduction with neighbouring k values. ')+(example==='rings'?'These data form rings. K-means can divide them into spatial slices rather than recover ring-shaped groups. ':'')+'Among k = 2–8, the largest mean silhouette here is '+fmt(best.silhouette)+' at k = '+best.k+'. Treat this as evidence alongside the elbow, geometry and purpose, not as a guaranteed correct answer.';
   for(const id of ['w2Elbow','w2Silhouette'])wireChoices(id,'data-k',(value,keyboard)=>{selectK(value);if(keyboard)$(id).querySelector('[data-k="'+k+'"]')?.focus()});
 }
 function selectK(value){k=Math.max(1,Math.min(8,Math.round(Number(value)||1)));sound();renderSelection();if(data)speak(kHelp(k))}
 function selectExample(value){if(!data?.examples[value])return;example=value;$('w2Example').value=value;sound();renderSelection();speak(value==='rings'?'The rings illustrate a limitation of K-means: it prefers compact regions and can miss non-convex structure, even when a score seems favourable.':'Keep the observations fixed while changing k. Compare both metrics and the grouping before explaining your choice.')}
 function renderMixture(){if(!data)return;const g=data.mixture,s=scale(g.points.concat(g.contours.flat())),p=g.probabilities[selected];
   let out='<svg viewBox="0 0 520 340" role="group" aria-label="'+(mode==='hard'?'K-means hard assignments':'Gaussian mixture membership probabilities')+'. Select an observation.">'+axes(s);
   if(mode==='soft')g.contours.forEach((curve,i)=>out+='<polyline points="'+curve.map(p=>s.px(p[0])+','+s.py(p[1])).join(' ')+'" fill="none" stroke="'+palette[i]+'" stroke-width="1.4" stroke-dasharray="5 4"/>');
   g.points.forEach((point,i)=>{const probability=g.probabilities[i][0],color=mode==='hard'?palette[g.hardLabels[i]]:'rgb('+Math.round(50*probability+223*(1-probability))+','+Math.round(207*probability+80*(1-probability))+','+Math.round(223*probability+187*(1-probability))+')';out+='<g class="w2-data-point" data-point="'+i+'" tabindex="0" role="button" aria-pressed="'+(i===selected)+'" aria-label="Observation '+(i+1)+', GMM component 1 probability '+fmt(probability*100,1)+' percent"><circle cx="'+s.px(point[0])+'" cy="'+s.py(point[1])+'" r="'+(i===selected?7:4)+'" fill="'+color+'"/></g>'});
   (mode==='hard'?g.hardCenters:g.means).forEach(point=>out+=cross(s.px(point[0]),s.py(point[1]),'#fff'));
   $('w2GmmPlot').innerHTML=out+'</svg>';
   $('w2GmmCaption').textContent=mode==='hard'?'Each colour is a single K-means assignment; white crosses are centroids.':'Blended colours show GMM membership probabilities; crosses are means. Dashed ellipses are two-standard-deviation contours, not membership boundaries.';
   $('w2GmmMode').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
   $('w2GmmPoint').value=selected;
   const bar=$('w2ProbabilityBar');bar.children[0].style.width=p[0]*100+'%';bar.children[1].style.width=p[1]*100+'%';bar.setAttribute('aria-label','Component 1 '+fmt(p[0]*100,1)+' percent; component 2 '+fmt(p[1]*100,1)+' percent');
   $('w2MembershipTitle').textContent='Observation '+(selected+1)+' · fitted GMM membership';
   $('w2Probabilities').textContent='Component 1: '+fmt(p[0]*100,1)+'% · Component 2: '+fmt(p[1]*100,1)+'%';
   $('w2HardAssignment').textContent='K-means assigns this observation to group '+(g.hardLabels[selected]+1)+'. Both models use the same observations, but have different objectives and assumptions.';
   wireChoices('w2GmmPlot','data-point',(value,keyboard)=>{selectPoint(value);if(keyboard)$('w2GmmPlot').querySelector('[data-point="'+selected+'"]')?.focus()});
 }
 function selectPoint(value){if(!data)return;selected=Math.max(0,Math.min(data.mixture.points.length-1,Math.round(Number(value)||0)));sound();renderMixture();speak(pointHelp(selected))}
 function selectMode(value){if(!['hard','soft'].includes(value))return;mode=value;sound();renderMixture();speak(value==='soft'?'The same observation can have substantial membership in both Gaussian components. Probabilities depend on the fitted model; they are not supplied or verified class labels.':'K-means chooses one group per observation using its nearest centroid. A hard assignment does not describe uncertainty about membership.')}
 $('w2K').addEventListener('input',event=>{k=Math.max(1,Math.min(8,Math.round(Number(event.target.value)||1)));renderSelection()});$('w2K').addEventListener('change',()=>selectK(k));
 $('w2Example').addEventListener('change',event=>selectExample(event.target.value));$('w2GmmPoint').addEventListener('change',event=>selectPoint(event.target.value));
 $('w2GmmMode').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.mode)));

 const guidance={
  plot:'Dots are observations and crossed rings are centroids. Click or tap inside the axes to add an observation; use arrow keys and Enter with the plot focused. Then step through assignment and centroid movement.',
  w2K:'Drag the slider, or use the arrow keys, to choose k from 1 to 8. The grouping, elbow and silhouette charts update together on the same fixed observations.',
  w2Example:'Compare separated clouds, overlapping clouds and rings. Ask whether the geometry suits K-means before trusting a numerical score.',
  w2Grouping:'Each dot is an observation; colour shows its assigned group and white crosses mark centroids. Look for compact groups and check whether their shapes make sense.',
  w2Elbow:'Select a plotted point to set k. SSE always falls or stays the same as k increases. Look for diminishing improvement rather than simply choosing the lowest value.',
  w2Silhouette:'Select a point to compare k. Mean silhouette combines within-group cohesion and separation from other groups. It is undefined at k = 1 and should be checked alongside the geometry.',
  w2GmmPlot:'Click a dot to inspect its membership probabilities in the panel. Switch to Gaussian mixture to see blended colours and model contours. Tab to a point and press Enter for keyboard selection.',
  w2GmmPoint:'Choose an observation to inspect its two GMM membership probabilities and compare its single K-means assignment. Try observations in the overlap.',
  w2ProbabilityBar:'The cyan and magenta segments show the selected observation’s two fitted membership probabilities. They sum to 100%; a more even split indicates less certain membership.',
  w2Launch:'Launch Lab Week 2, wait for Python to load, and run setup first. Explain your choices in code comments as you compare preprocessing, k, initialisation and model assumptions.',
  w2Expand:'Expand the notebook for more working space. Return to split view to keep the activity instructions beside your code.',
  w2DownloadPdf:'Run and save your notebook first so comments, plots and outputs are included. Download the PDF here, then submit it through your course submission platform.',
  week2Recap:'Open this checklist and explain each idea in your own words. Use your graph experiments and notebook results as evidence.'
 };
 Object.entries(guidance).forEach(([id,text])=>help($(id),text));
 help($('week2Recap')?.querySelector('summary'),guidance.week2Recap);
 $('w2GmmMode').querySelectorAll('button').forEach(button=>help(button,button.dataset.mode==='soft'?'Gaussian mixtures model overlapping components and provide membership probabilities. Dashed contours show spread, not hard boundaries.':'K-means assigns each observation to its nearest centroid. The colour shows one group and does not express uncertainty.'));
 // Notebook has its own state; launching or expanding it never mutates the playground.
 const tasks=Array.from(document.querySelectorAll('#week2Lab .w2-lab-task'));let task=0,launched=false,loadingTimer;
 function renderTask(focus=false){tasks.forEach((node,i)=>node.hidden=i!==task);$('w2TaskPosition').textContent='Task '+(task+1)+' / '+tasks.length;$('w2TaskPrevious').disabled=task===0;$('w2TaskNext').disabled=task===tasks.length-1;if(focus){tasks[task].querySelector('h3')?.focus({preventScroll:true});speak('Lab Week 2 · Task '+(task+1)+'. '+tasks[task].querySelector('p').textContent)}}
 function launch(){if(launched)return;launched=true;sound();const frame=$('w2NotebookFrame');frame.hidden=false;frame.src=frame.dataset.src;$('w2NotebookPlaceholder').hidden=true;$('w2Launch').disabled=true;$('w2Launch').textContent='Notebook launched ✓';$('w2NotebookStatus').textContent='Loading the notebook interface. Python and packages load separately; run the setup cell first.';loadingTimer=setTimeout(()=>{$('w2NotebookStatus').textContent='First startup can take a little while. If the notebook has not appeared, try Open notebook in new tab and check your connection.'},45000)}
 $('w2Launch').addEventListener('click',()=>{launch();speak('Run the setup and data cells before the clustering tasks. Keep the same prepared data when comparing k or initialisations, and explain your decisions.')});
 $('w2NotebookFrame').addEventListener('load',()=>{if(!launched)return;clearTimeout(loadingTimer);$('w2NotebookStatus').textContent='Notebook interface loaded. Wait for Python (Pyodide), then run the setup cell with Shift + Enter.'});
 $('w2NotebookFrame').addEventListener('error',()=>{clearTimeout(loadingTimer);$('w2NotebookStatus').textContent='The embedded notebook could not load. Try the new-tab link or check your connection.'});
 $('w2Expand').addEventListener('click',()=>{launch();const expanded=$('w2NotebookWorkspace').classList.toggle('w2-expanded');$('w2Expand').setAttribute('aria-pressed',String(expanded));$('w2Expand').textContent=expanded?'Return to split view ↙':'Expand notebook ↗';sound()});
 $('w2TaskPrevious').addEventListener('click',()=>{if(task>0){task--;sound();renderTask(true)}});$('w2TaskNext').addEventListener('click',()=>{if(task<tasks.length-1){task++;sound();renderTask(true)}});
 $('w2DownloadPdf').addEventListener('click',()=>window.LabNotebookPdf?.download({buttonId:'w2DownloadPdf',statusId:'w2PdfStatus',frameId:'w2NotebookFrame',title:'Lab Week 2 · K-means and clustering'}));
 renderTask();$('w2K').disabled=true;$('w2Example').disabled=true;
 const ready=fetch('assets/data/week2-examples.json').then(response=>{if(!response.ok)throw new Error('Fixed examples could not load.');return response.json()}).then(value=>{data=value;selected=data.mixture.selected;$('w2K').disabled=false;$('w2Example').disabled=false;$('w2GmmPoint').innerHTML=data.mixture.points.map((_,i)=>'<option value="'+i+'">Observation '+(i+1)+'</option>').join('');renderSelection();renderMixture();return true}).catch(()=>{$('w2SelectionExplanation').textContent='The fixed examples could not load. Refresh to try again; the original playground and notebook links remain available.';return false});
 window.Week2Extension={ready,selectK,selectExample,selectMode,selectPoint,chart,scatter};
})();
