(() => {
 'use strict';const $=id=>document.getElementById(id),C=Week4Core,D=C.datasets(),colors=LabShared.colors||['#32cfdf','#df50bb','#e1d744','#946ddf','#719aef','#ed855b'],fmt=(n,d=3)=>Number.isFinite(n)?n.toFixed(d):'Unavailable';
 LabShared.initSound();LabShared.initNavigation();const menus=LabShared.initSelectMenus(['labSelect','evalDataset','evalAlgorithm','evalLinkage','mini-evalDataset','mini-evalAlgorithm','mini-evalLinkage']);
 const tips={evalDataset:'Keep features and observations fixed when comparing algorithms. Reference labels never enter fitting.',evalAlgorithm:'Each method defines a group differently. Compare geometry, coverage and practical purpose.',evalK:'Choose the cluster count for K-means or agglomerative clustering. A one-group result has no internal score.',evalEps:'DBSCAN uses this Euclidean radius. Scores exclude noise, so always read coverage too.',evalMin:'MinPts counts the observation itself. More support can mean fewer core observations.',evalLinkage:'Ward favours compact groups; single linkage can form chains. Check whether the metric favours the same geometry.',evalPlot:'Click a point, or Tab to it and press Enter. Inspect its mean within-group and nearest competing-group distances.',runStress:'Ten reproducible trials compare memberships on the same original IDs. Agreement alone does not establish useful groups.',segmentK:'Customer segments use standardised visits and spending, with 12 K-means starts.',w4DownloadPdf:'Run relevant notebook cells first. Export your current code, explanations and outputs, then review the PDF.',week4Recap:'Use your experiments to explain the evidence and its limitations.'};const guide=LabVesper.createGuide({tips,welcome:'Welcome to Week 4! Measure the groups, test what survives a change, and explain why a result is useful.'});const say=text=>guide.say(text),tap=()=>LabShared.playSound('tap');
 let settings={algorithm:'kmeans',k:3,eps:9,minPts:5,linkage:'ward'},data=D.clouds,result,metrics,selected=0,renamed=false,reference=false,stressData=[],stressSelected=0,segment=0;
 function scatter(X,labels,{selected=-1,nearest=null,axes=['Feature 1','Feature 2'],interactive=false,idPrefix='p',domain=null,equal=true}={}){let lo=domain?.[0]||[Math.min(...X.map(p=>p[0]))-5,Math.min(...X.map(p=>p[1]))-5],hi=domain?.[1]||[Math.max(...X.map(p=>p[0]))+5,Math.max(...X.map(p=>p[1]))+5];const span=Math.max(hi[0]-lo[0],hi[1]-lo[1],1),cx=(lo[0]+hi[0])/2,cy=(lo[1]+hi[1])/2,x=v=>equal?285+(v-cx)/span*280:70+(v-lo[0])/(hi[0]-lo[0])*430,y=v=>equal?195-(v-cy)/span*280:335-(v-lo[1])/(hi[1]-lo[1])*280;let out=`<svg viewBox="0 0 560 400" role="group" aria-label="${axes[0]} and ${axes[1]} observations"><path d="M70 45V335H510" fill="none" stroke="#688da6"/>`;
 for(let i=0;i<3;i++){const xv=equal?cx-span/2+span*i/2:lo[0]+(hi[0]-lo[0])*i/2,yv=equal?cy-span/2+span*i/2:lo[1]+(hi[1]-lo[1])*i/2;out+=`<text x="${x(xv)}" y="358" text-anchor="middle">${fmt(xv,0)}</text><text x="60" y="${y(yv)+4}" text-anchor="end">${fmt(yv,0)}</text>`}
 out+=`<text x="290" y="386" text-anchor="middle">${axes[0]}</text><text transform="translate(18 195) rotate(-90)" text-anchor="middle">${axes[1]}</text>`;
 X.forEach((p,i)=>{const l=labels[i],px=x(p[0]),py=y(p[1]),color=l<0?'#b3bccc':colors[l%colors.length],tag=interactive?'g':'g',attrs=interactive?` role="button" tabindex="0" data-${idPrefix}="${i}" aria-label="Observation ${i+1}, ${l<0?'noise':'group '+(l+1)}"`:'';out+=`<${tag}${attrs}>`;if(l<0)out+=`<path d="M${px-4} ${py-4}l8 8m-8 0l8-8" stroke="${color}" stroke-width="2"/>`;else out+=`<circle cx="${px}" cy="${py}" r="${selected===i?7:4.8}" fill="${color}" opacity="${selected<0||labels[selected]===l?1:.58}" stroke="${selected===i?'#fff':l===nearest?'#f0e58e':'#0c2232'}" stroke-width="${selected===i||l===nearest?2:1}"/>`;if(interactive)out+=`<circle cx="${px}" cy="${py}" r="9" fill="transparent"/>`;out+='</g>'});return out+'</svg>'}
 function wire(container,attr,fn){$(container).querySelectorAll('['+attr+']').forEach(el=>{const run=key=>{const i=Number(el.getAttribute(attr));fn(i);if(key)$(container).querySelector('['+attr+'="'+i+'"]')?.focus()};el.onclick=()=>run(false);el.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();run(true)}}})}
 function card(title,value,note){return `<article class="w4-metric-card"><h3>${title}</h3><strong class="w4-score">${value}</strong><small>${note}</small></article>`}
 function readSettings(){settings={algorithm:$('evalAlgorithm').value,k:Number($('evalK').value),eps:Number($('evalEps').value),minPts:Number($('evalMin').value),linkage:$('evalLinkage').value};data=D[$('evalDataset').value];$('kControl').hidden=settings.algorithm==='dbscan';$('linkControl').hidden=settings.algorithm!=='hierarchy';$('epsControl').hidden=$('minControl').hidden=settings.algorithm!=='dbscan';$('evalEpsValue').textContent=fmt(settings.eps,1);}
 function renderSample(){const m=metrics.samples[selected];$('sampleHeading').textContent='Observation '+(selected+1)+(result.labels[selected]<0?' · noise':' · group '+(result.labels[selected]+1));$('evalPlot').innerHTML=scatter(data.X,result.labels,{selected,nearest:m?.nearest,interactive:true,idPrefix:'evalpoint'});wire('evalPlot','data-evalpoint',i=>{selected=i;renderSample()});$('sampleDetail').textContent=result.labels[selected]<0?'DBSCAN marks this observation as noise. It is excluded from internal scores; this is not proof of measurement error.':!metrics.valid?metrics.reason:m.singleton?'This observation is alone in its group. Its silhouette is defined as 0, rather than reporting an artificially perfect fit.':`a = ${fmt(m.a)}, b = ${fmt(m.b)} (group ${m.nearest+1}). Its silhouette is ${fmt(m.s)}. ${m.s<0?'Another group is closer on average.':m.s<.25?'Its assignment is relatively ambiguous.':'It is closer on average to its own group.'}`;}
 function renderExternal(){if(!reference)return;const labels=result.labels.map(l=>renamed&&l>=0?100-l:l),a=C.agreement(data.y,labels);$('referencePlot').innerHTML=scatter(data.X,data.y);$('externalPlot').innerHTML=scatter(data.X,labels.map(l=>l>=0&&renamed?100-l:l));$('externalMetrics').innerHTML=card('Adjusted Rand Index',fmt(a.ari),'1 = identical partitions · chance-adjusted')+card('Normalized Mutual Information',fmt(a.nmi),'0–1 · not chance-adjusted');$('contingency').innerHTML='<table><caption>Reference groups × fitted identifiers · counts of observations</caption><thead><tr><th scope="col">Reference</th>'+a.bk.map(l=>`<th scope="col">${l<0?'Noise −1':'Cluster '+(renamed?l:l+1)}</th>`).join('')+'</tr></thead><tbody>'+a.ak.map((l,i)=>`<tr><th scope="row">Group ${l+1}</th>${a.table[i].map(n=>'<td>'+n+'</td>').join('')}</tr>`).join('')+'</tbody></table>';$('externalStatus').textContent=(renamed?'Cluster identifiers renamed; memberships and agreement are unchanged. ':'Original cluster identifiers. ')+`${data.X.length} observations compared; ${metrics.noise} noise observations included as label −1.`;}
 function render(){readSettings();result=C.fit(data.X,settings);metrics=C.internal(data.X,result.labels);selected=Math.min(selected,data.X.length-1);$('evalMetrics').innerHTML=card('Silhouette',metrics.valid?fmt(metrics.silhouette):'—','Higher ↑ · −1 to 1')+card('Davies–Bouldin',metrics.valid?fmt(metrics.db):'—','Lower ↓ · centroid-based ratio')+card('Calinski–Harabasz',metrics.valid?fmt(metrics.ch,1):'—','Higher ↑ · dispersion ratio');$('evalCoverage').textContent=`${metrics.k} retained group(s) · ${metrics.n} / ${data.X.length} observations retained for scoring · ${metrics.noise} noise excluded.`+(metrics.valid?' No universal score threshold.':' '+metrics.reason);renderSample();renderMiniView();renderExternal();$('baselinePlot').innerHTML=scatter(data.X,result.labels);$('stressPlot').innerHTML=scatter(data.X,result.labels);$('stressPlotTitle').textContent='Trial preview · run the experiment';stressData=[];$('stressTrials').innerHTML='';$('stressSummary').textContent='Settings updated. Run 10 trials to test these settings.';$('stressQuality').textContent='';menus.sync();}
 ['evalDataset','evalAlgorithm','evalLinkage'].forEach(id=>$(id).addEventListener('change',()=>{tap();selected=0;render()}));$('evalEps').addEventListener('input',render);
 function stepper(id,callback){
  const input=$(id),minus=$(id+'Minus'),plus=$(id+'Plus');
  const min=Number(input.min),max=Number(input.max);
  let last=Number(input.value);
  function sync(){
   last=Number(input.value);
   minus.disabled=last===min;
   plus.disabled=last===max;
  }
  function commit(){
   const value=input.value.trim()===''?last:Number(input.value);
   input.value=Math.max(min,Math.min(max,Number.isFinite(value)?Math.round(value):last));
   sync();
   callback();
  }
  minus.onclick=()=>{input.value=last-1;tap();commit()};
  plus.onclick=()=>{input.value=last+1;tap();commit()};
  input.onchange=commit;
  input.oninput=()=>{
   const value=Number(input.value);
   if(input.value!==''&&Number.isInteger(value)&&value>=min&&value<=max)commit();
  };
  input.onblur=()=>{if(input.value!==String(last))commit()};
  input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();commit()}};
  sync();
  return sync;
 }

 const sharedControls=['evalDataset','evalAlgorithm','evalLinkage','evalK','evalEps','evalMin'];
 function applyMiniSetting(id,eventName){
  const input=$(id);
  const value=$('mini-'+id).value;
  if(input.value===value)return;
  input.value=value;
  input.dispatchEvent(new Event(eventName));
 }
 ['evalDataset','evalAlgorithm','evalLinkage'].forEach(id=>{
  $('mini-'+id).addEventListener('change',()=>applyMiniSetting(id,'change'));
 });
 $('mini-evalEps').addEventListener('input',()=>applyMiniSetting('evalEps','input'));
 stepper('evalK',render);
 stepper('evalMin',render);
 const syncMiniSteppers=['evalK','evalMin'].map(id=>stepper('mini-'+id,()=>applyMiniSetting(id,'change')));
 function renderMiniView(){
  sharedControls.forEach(id=>{$('mini-'+id).value=$(id).value});
  ['kControl','linkControl','epsControl','minControl'].forEach(id=>{
   $('mini-'+id).hidden=$(id).hidden;
  });
  syncMiniSteppers.forEach(sync=>sync());
  $('mini-evalEpsValue').textContent=$('evalEpsValue').textContent;
 }

 $('revealReference').onclick=()=>{tap();reference=!reference;$('referenceResults').hidden=!reference;$('revealReference').setAttribute('aria-expanded',String(reference));$('revealReference').textContent=reference?'Hide reference labels':'Reveal reference labels';renderExternal()};$('renameClusters').onclick=()=>{tap();renamed=!renamed;if(!reference){reference=true;$('referenceResults').hidden=false;$('revealReference').setAttribute('aria-expanded','true');$('revealReference').textContent='Hide reference labels'}renderExternal();say('Cluster numbers are just names. ARI and NMI compare membership relationships, so renaming does not change them.')};
 const qMessages={
  compact:'The groups are tight and separated by visible gaps. That makes it easier to describe groups such as customers who visit often but spend relatively little. You could test an offer designed for frequent visits.',
  overlap:'Look where different colours meet. Two customers with similar visits and spending can fall into different groups. Inspect those boundary points before deciding who should receive a different offer.',
  purpose:'The plot is the same as in the first card, but the shop now wants to know which products to promote. Visits and spending show how often and how much people shop. To learn what they buy, you need product or basket data.'
 };
 document.querySelectorAll('[data-quality]').forEach(button=>{
  const key=button.dataset.quality;
  const dataset=key==='overlap'?D.overlap:D.clouds;
  const customers=dataset.X.map(([visits,spending])=>[Math.max(0,visits/8),Math.max(0,spending*120)]);
  const labels=C.fit(C.standardize(customers)).labels;
  $('quality'+key).innerHTML=scatter(customers,labels,{axes:['Monthly visits','Monthly spending (MUR)'],equal:false,domain:[[0,0],[16,15000]]});
  button.onclick=()=>{
   tap();
   document.querySelectorAll('[data-quality]').forEach(card=>card.setAttribute('aria-pressed',String(card===button)));
   $('qualityFeedback').textContent=qMessages[key];
   say(qMessages[key]);
  };
 });
 ['stressJitter','stressOutliers'].forEach(id=>$(id).oninput=()=>{$(id+'Value').textContent=$(id).value;stressData=[];$('stressTrials').innerHTML='';$('stressSummary').textContent='Conditions changed. Run the trials again.';$('stressQuality').textContent='';$('stressPlot').innerHTML=scatter(data.X,result.labels)});
 function showTrial(i){stressSelected=i;const t=stressData[i],all=[...data.X,...t.X],domain=[[Math.min(...all.map(p=>p[0]))-5,Math.min(...all.map(p=>p[1]))-5],[Math.max(...all.map(p=>p[0]))+5,Math.max(...all.map(p=>p[1]))+5]];$('stressPlotTitle').textContent='Trial '+(i+1)+' · perturbed + added outliers';$('baselinePlot').innerHTML=scatter(data.X,result.labels,{domain});$('stressPlot').innerHTML=scatter(t.X,t.fit.labels,{domain});$('stressQuality').textContent=`Showing trial ${i+1}. Internal silhouette: ${t.metric.valid?fmt(t.metric.silhouette):'unavailable — '+t.metric.reason} on ${t.metric.n} / ${t.X.length} retained observations; ${t.metric.noise} noise. Internal scores across different retained sets are not directly comparable.`;document.querySelectorAll('[data-trial]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.trial)===i)));}
 $('runStress').onclick=()=>{tap();const jitter=Number($('stressJitter').value),outliers=Number($('stressOutliers').value);stressData=Array.from({length:10},(_,i)=>{const X=C.perturb(data.X,jitter,outliers,91+i*37),fit=C.fit(X,{...settings,seed:91+i*37,starts:1});return {X,fit,metric:C.internal(X,fit.labels),ari:C.agreement(result.labels,fit.labels.slice(0,data.X.length)).ari}});const scores=stressData.map(t=>t.ari),mean=scores.reduce((a,b)=>a+b,0)/scores.length;$('stressSummary').textContent=`Mean ARI ${fmt(mean)} · range ${fmt(Math.min(...scores))}–${fmt(Math.max(...scores))} across 10 trials on ${data.X.length} original observation IDs. ${outliers} new outliers per trial affect fitting, but are excluded from agreement. ${settings.algorithm==='kmeans'?'Single-start K-means trials also vary initialisation.':'Deterministic method: changes arise from the perturbed data.'}`;$('stressTrials').innerHTML=stressData.map((t,i)=>`<button type="button" data-trial="${i}" aria-pressed="${i===0}" aria-label="Inspect trial ${i+1}, ARI ${fmt(t.ari)}"><span>Trial ${i+1}</span><strong>${fmt(t.ari,2)}</strong></button>`).join('');wire('stressTrials','data-trial',showTrial);showTrial(0);say('Compare the membership agreement with group count, coverage and the actual shape. Stable all-noise output is not successful grouping.')};
 const shoppers=D.clouds.X.map(p=>[Math.max(.1,p[0]/8),Math.max(100,p[1]*120)]);let shopperFit;
 function renderSegments(){shopperFit=C.fit(C.standardize(shoppers),{k:Number($('segmentK').value)});const keys=[...new Set(shopperFit.labels)].sort((a,b)=>a-b);if(!keys.includes(segment))segment=keys[0];$('segmentChoices').innerHTML=keys.map(l=>`<button type="button" data-segment="${l}" aria-pressed="${l===segment}">Segment ${l+1}</button>`).join('');wire('segmentChoices','data-segment',l=>{segment=l;renderSegments()});$('segmentPlot').innerHTML=scatter(shoppers,shopperFit.labels,{selected:shopperFit.labels.indexOf(segment),axes:['Monthly visits','Monthly spending (MUR)'],interactive:true,idPrefix:'shopper',equal:false,domain:[[0,0],[12,11000]]});wire('segmentPlot','data-shopper',i=>{segment=shopperFit.labels[i];renderSegments()});const ids=shopperFit.labels.map((v,i)=>v===segment?i:-1).filter(i=>i>=0),m=[0,1].map(j=>ids.reduce((s,i)=>s+shoppers[i][j],0)/ids.length);$('segmentProfile').innerHTML=`<span class="eyebrow">Segment ${segment+1}</span><h3>${ids.length} shoppers · ${fmt(ids.length/shoppers.length*100,1)}% of the sample</h3><p>Mean visits: <strong>${fmt(m[0],1)} / month</strong><br>Mean spending: <strong>MUR ${fmt(m[1],0)} / month</strong></p><p>Describe these observed habits before proposing a name or an action. Check individual variation and missing context.</p>`;}
 stepper('segmentK',renderSegments);
 let task=0,launched=false,loading;const tasks=[...document.querySelectorAll('.w4-task')];function renderTask(focus=false){tasks.forEach((t,i)=>t.hidden=i!==task);$('w4TaskPosition').textContent=`Task ${task+1} / 7`;$('w4TaskPrevious').disabled=task===0;$('w4TaskNext').disabled=task===6;if(focus)tasks[task].querySelector('h3').focus({preventScroll:true})}function launch(){if(launched)return;launched=true;const f=$('w4NotebookFrame');f.src=f.dataset.src;f.hidden=false;$('w4NotebookPlaceholder').hidden=true;$('w4Launch').disabled=true;$('w4Launch').textContent='Notebook launched ✓';$('w4NotebookStatus').textContent='Loading the notebook interface. Wait for Python, then run the setup cell.';loading=setTimeout(()=>{$('w4NotebookStatus').textContent='First launch can take a while. Try the new-tab link if the interface does not appear.'},45000)}$('w4Launch').onclick=()=>{tap();launch()};$('w4NotebookFrame').onload=()=>{if(launched){clearTimeout(loading);$('w4NotebookStatus').textContent='Notebook interface loaded. Wait for Python, then run setup with Shift + Enter.'}};$('w4Expand').onclick=()=>{tap();launch();const on=$('w4NotebookWorkspace').classList.toggle('w3-expanded');$('w4Expand').setAttribute('aria-pressed',String(on));$('w4Expand').textContent=on?'Return to split view ↙':'Expand notebook ↗'};$('w4TaskPrevious').onclick=()=>{if(task>0){task--;tap();renderTask(true)}};$('w4TaskNext').onclick=()=>{if(task<6){task++;tap();renderTask(true)}};$('w4DownloadPdf').onclick=()=>{tap();LabNotebookPdf.download({buttonId:'w4DownloadPdf',statusId:'w4PdfStatus',frameId:'w4NotebookFrame',title:'Lab Week 4 · Evaluate and Explain'})};
 const hero=document.querySelector('.w4-hero-art');
 if('IntersectionObserver' in window){
  new IntersectionObserver(([entry])=>hero.classList.toggle('is-in-view',entry.isIntersecting)).observe(hero);
 }else hero.classList.add('is-in-view');
 render();renderSegments();renderTask();say('Welcome to Week 4! Measure the groups, test what survives a change, and explain why a result is useful.');
})();
