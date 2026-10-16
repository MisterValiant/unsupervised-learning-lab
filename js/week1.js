/* Week 1: conceptual exploration, honest preprocessing and learner-authored cases. */
(() => {
  const {$,playSound}=LabShared,Core=DiscoveryCore;
  const state={dataset:'environment',row:'P1',feature:null,paradigm:'supervised',technique:'clusters',missing:'leave',includeUnusual:true,scale:'original',program:'rules',challenge:'evaluate',encoding:'words',prepStep:0};
  const explored=new Set();
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=value=>value===null?'missing':Number(value).toLocaleString(undefined,{maximumFractionDigits:4});
  const dataset=()=>Core.datasets[state.dataset];
  function mark(id){explored.add(id);$('discoveryProgress').textContent=explored.size+' / 6 topics explored'}
  function pressed(group,attribute,value){$(group).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attribute]===value)))}
  function renderProgramIllustration(){
    const learning=state.program==='learn', readings=[20,22,24,34,28,30,32,45],reference=[20,22,24,26,28,30,32,34];
    const x=i=>54+i*57,y=v=>179-(v-15)*4;
    const flagged=readings.map((value,i)=>learning?Math.abs(value-reference[i])>3:value>30);
    let svg='<svg viewBox="0 0 520 230" role="img" aria-label="'+(learning?'Illustrative rising reference band flags readings 4 and 8.':'A fixed rule above 30 flags readings 4, 7 and 8.')+'"><title>Same eight synthetic sensor readings; '+(learning?'reference pattern comparison':'fixed threshold comparison')+'</title>';
    for(const value of [20,30,40,50])svg+='<path d="M36 '+y(value)+'H480" class="program-grid"/><text x="26" y="'+(y(value)+4)+'" text-anchor="end">'+value+'</text>';
    svg+='<path d="M36 28V185H480" class="program-axis"/><text x="36" y="18">Sensor value</text><text x="260" y="225" text-anchor="middle">Reading number</text>';
    if(learning){
      const upper=reference.map((v,i)=>x(i)+','+y(v+3)).join(' '),lower=reference.map((v,i)=>x(i)+','+y(v-3)).reverse().join(' ');
      svg+='<polygon points="'+upper+' '+lower+'" class="program-reference-band"/><polyline points="'+reference.map((v,i)=>x(i)+','+y(v)).join(' ')+'" class="program-reference-line"/><text x="260" y="163" class="program-band-label">Illustrative reference band</text>';
    }else svg+='<path d="M36 '+y(30)+'H480" class="program-fixed-line"/><text x="270" y="29" class="program-limit-label">Human rule: flag above 30</text>';
    readings.forEach((v,i)=>{
      svg+='<text x="'+x(i)+'" y="203" text-anchor="middle">'+(i+1)+'</text><g class="program-reading" style="--reading-delay:'+(i*55)+'ms"><title>Reading '+(i+1)+': '+v+'; '+(flagged[i]?'flagged for review':'not flagged')+'</title>';
      if(flagged[i])svg+='<polygon points="'+x(i)+','+(y(v)-7)+' '+(x(i)+7)+','+y(v)+' '+x(i)+','+(y(v)+7)+' '+(x(i)-7)+','+y(v)+'" class="program-flag"/>';
      else svg+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="5.5" class="program-normal"/>';
      svg+='</g>';
    });
    $('programPlot').innerHTML=svg+'</svg>';
    $('programVisualTitle').textContent=learning?'Compare with a reference pattern':'A person chooses a fixed limit';
    $('programVisualExplanation').textContent=learning?'The blue band stands for a usual pattern learned from historical readings. Here, readings 4 and 8 fall outside it. Reading 7 stays within the rising reference pattern.':'The person writes “flag values above 30”. Readings 4, 7 and 8 exceed that limit. The system applies the rule exactly; it does not learn a pattern.';
  }
  function renderProgram(){
    window.DiscoveryVisuals?.setMode('mlFoundations',state.program);
    renderProgramIllustration();
    pressed('programChoices','program',state.program);
    const a=state.program==='rules'
      ?['Readings + a hand-written threshold','Apply: flag a reading above the chosen limit','Flags defined by that rule','A person specifies the rule. The system executes it; it does not learn the threshold from these examples.']
      :['Historical readings + a learning objective','Fit a model of the usual reading patterns','Flags based on the learned pattern','A model learns a reference pattern from past readings, then flags departures. People still choose the data and method and investigate the flags. This example is unsupervised anomaly detection.'];
    ['programInput','programProcess','programResult','programExplanation'].forEach((id,i)=>$(id).textContent=a[i]);
  }
  const challengeCases={
  "evaluate": [
    "No labels to check the answer",
    "The model divides customers into three groups. But we have no known customer-group labels to compare them with.",
    "Compare a few runs and ask whether the groups make sense for the task. A tidy-looking plot does not prove that the groups are useful."
  ],
  "interpret": [
    "A group needs an explanation",
    "Two forest plots are placed in the same group. What makes them similar?",
    "Look at their measurements: are their canopy heights or greenness values similar? Use knowledge of the situation to explain the group."
  ],
  "noise": [
    "An unusual value might be real",
    "A song lasts 15 minutes. Is that an error, or just a long song?",
    "Check the original recording or data entry. Keep the value if it is valid; do not remove it only because it is unusual."
  ],
  "dimensions": [
    "More measurements do not always help",
    "You want to group songs by listening habits, but include unrelated measurements as well.",
    "Choose features that help answer the question. Extra, unrelated features can hide useful similarities between observations."
  ],
  "parameters": [
    "Different settings can change the groups",
    "Ask for two groups, then four groups. The same observations will be divided differently.",
    "Try a few sensible settings and compare the results. Explain why you chose a setting instead of assuming there is one correct answer."
  ],
  "compute": [
    "A large dataset may take longer",
    "A method runs quickly on six observations but is slow on a million.",
    "First try a smaller sample that reflects the full dataset. Check how much time and computer memory the method needs before using all the data."
  ]
};
  function renderChallenge(){
    pressed('challengeChoices','challenge',state.challenge);const a=challengeCases[state.challenge];
    ['challengeCaseTitle','challengeExample','challengeCheck'].forEach((id,i)=>$(id).textContent=a[i]);
  }
  function renderEncoding(){
    const encoded=state.encoding==='onehot';pressed('encodingChoices','encoding',state.encoding);
    const rows=[['S1','Sand',1,0,0],['S2','Clay',0,1,0],['S3','Rock',0,0,1]];
    $('encodingTable').innerHTML='<table class="discovery-table"><caption>Separate synthetic soil example · '+(encoded?'one-hot indicators':'original category feature')+'</caption><thead><tr><th scope="col">Plot ID</th>'+(encoded?'<th scope="col">Soil: Sand</th><th scope="col">Soil: Clay</th><th scope="col">Soil: Rock</th>':'<th scope="col">Soil type</th>')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r[0]+'</td>'+(encoded?r.slice(2).map(v=>'<td>'+v+'</td>').join(''):'<td>'+r[1]+'</td>')+'</tr>').join('')+'</tbody></table>';
    $('encodingFeedback').textContent=encoded?'1 means this category is present; 0 means it is absent. Each row has one soil type. The plot ID remains an identifier, not an input feature.':'Soil type is an input feature in this example. Sand, clay and rock have no natural numerical order.';
  }
  function renderDataPlot(rows){
    const d=dataset(),xs=rows.map(r=>r.x),ys=rows.map(r=>r.y),range=values=>{const min=Math.min(...values),max=Math.max(...values),pad=(max-min||1)*.2;return [min-pad,max+pad]};
    const [xmin,xmax]=range(xs),[ymin,ymax]=range(ys),px=x=>76+(x-xmin)/(xmax-xmin)*404,py=y=>236-(y-ymin)/(ymax-ymin)*193;
    let svg='<svg viewBox="0 0 520 310" role="group" aria-label="Four observations, shown by their two features. Select a point with a click, or focus it and press Enter or Space."><title>One table row becomes one point</title>';
    for(let i=0;i<3;i++){const x=xmin+(xmax-xmin)*i/2,y=ymin+(ymax-ymin)*i/2;svg+='<path d="M'+px(x)+' 43V236M76 '+py(y)+'H480" class="data-plot-grid"/><text x="'+px(x)+'" y="256" text-anchor="middle" class="data-tick">'+fmt(x)+'</text><text x="66" y="'+(py(y)+4)+'" text-anchor="end" class="data-tick">'+fmt(y)+'</text>'}
    svg+='<path d="M76 35V236H488" class="data-plot-axis"/><text x="278" y="290" text-anchor="middle" class="data-axis-label '+(state.feature==='x'?'is-selected-feature':'')+'">'+escape(d.x)+'</text><text transform="translate(18 138) rotate(-90)" text-anchor="middle" class="data-axis-label '+(state.feature==='y'?'is-selected-feature':'')+'">'+escape(d.y)+'</text>';
    rows.forEach(r=>{const selected=r.id===state.row;svg+='<g class="data-plot-point '+(selected?'is-selected':'')+'" data-point="'+r.id+'" role="button" tabindex="0" aria-pressed="'+selected+'" aria-label="Select '+r.id+': '+escape(d.x)+' '+fmt(r.x)+', '+escape(d.y)+' '+fmt(r.y)+'"><title>'+r.id+' · one '+d.unit+'</title><circle cx="'+px(r.x)+'" cy="'+py(r.y)+'" r="22" class="data-point-hit"/><circle cx="'+px(r.x)+'" cy="'+py(r.y)+'" r="14" class="data-selection-ring"/><circle cx="'+px(r.x)+'" cy="'+py(r.y)+'" r="6.5" class="data-observation-dot"/><text x="'+(px(r.x)+12)+'" y="'+(py(r.y)-10)+'" class="data-point-id">'+r.id+'</text></g>'});
    $('dataPointPlot').innerHTML=svg+'</svg>';
    const selected=rows.find(r=>r.id===state.row);$('dataSelectedValues').innerHTML=selected?['x','y'].map(k=>'<div><span>'+escape(d[k])+'</span><strong>'+fmt(selected[k])+'</strong></div>').join(''):'';
    $('dataPointPlot').querySelectorAll('[data-point]').forEach(point=>{point.onclick=()=>selectDataRow(point.dataset.point,'point');point.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDataRow(point.dataset.point,'point')}})});
  }
  function selectDataRow(id,origin){
    state.row=id;playSound('tap');renderData();const group=origin==='point'?'dataPointPlot':'observationRows',selector=origin==='point'?'[data-point]':'button',key=origin==='point'?'point':'row';
    Array.from($(group).querySelectorAll(selector)).find(node=>node.dataset[key]===id)?.focus?.({preventScroll:true});
  }
  function renderData(){
    const d=dataset(),rows=Core.rawRows(state.dataset).slice(0,4);if(!rows.some(r=>r.id===state.row))state.row=rows[0].id;
    $('datasetStory').textContent=d.story;pressed('datasetChoices','dataset',state.dataset);
    $('dataObservationDefinition').textContent='One '+d.unit;
    $('dataFeaturesDefinition').textContent=d.x+' + '+d.y;
    $('dataLabelsDefinition').textContent={environment:'Habitat labels are not supplied',customers:'Customer-segment labels are not supplied',students:'Exam grades are not supplied',music:'Genre labels are not supplied'}[state.dataset];
    $('observationHead').innerHTML='<tr><th scope="col">Observation ID</th>'+['x','y'].map(k=>'<th scope="col"><button type="button" data-feature="'+k+'" aria-pressed="'+(state.feature===k)+'">'+escape(d[k])+'</button></th>').join('')+'</tr>';
    $('observationRows').innerHTML=rows.map(row=>'<tr class="'+(state.row===row.id?'chosen-row':'')+'"><td><button type="button" class="row-id" data-row="'+row.id+'" aria-pressed="'+(state.row===row.id)+'">'+row.id+'</button></td>'+['x','y'].map(k=>'<td class="'+(state.feature===k?'chosen-feature':'')+'">'+fmt(row[k])+'</td>').join('')+'</tr>').join('');
    $('observationHead').querySelectorAll('button').forEach(button=>button.onclick=()=>{state.feature=button.dataset.feature;playSound('tap');renderData();Array.from($('observationHead').querySelectorAll('button')).find(node=>node.dataset.feature===state.feature)?.focus?.({preventScroll:true})});
    $('observationRows').querySelectorAll('button').forEach(button=>button.onclick=()=>selectDataRow(button.dataset.row,'row'));
    renderDataPlot(rows);
    $('dataFeedback').textContent=state.row+' is the same '+d.unit+' in the table and on the plot. '+(state.feature?d[state.feature]+' is shown on the '+(state.feature==='x'?'horizontal':'vertical')+' axis. ':'')+'Its ID identifies it; no group label is supplied.';
    if(state.row&&state.feature)mark('data');
  }
  function renderLearningModelFlow(){
    const mode=state.paradigm,rows=Core.rawRows(state.dataset),d=dataset();
    const graphic=body=>'<svg class="learning-stage-art" viewBox="0 0 200 92" aria-hidden="true">'+body+'</svg>';
    const connector='<div class="learning-connector" aria-hidden="true"><span class="learning-packet"></span><span class="learning-arrowhead">›</span></div>';
    const stage=(number,title,art,description,kind)=>'<div class="learning-stage '+kind+'"><span class="learning-stage-number">'+number+'</span><h4>'+title+'</h4>'+art+'<p>'+description+'</p></div>';
    const model=graphic('<rect x="40" y="6" width="120" height="76" rx="14" class="model-frame"/><path d="M61 27H139M61 46H139M61 65H139" class="model-rail"/><circle cx="83" cy="27" r="6" class="model-adjust adjust-a"/><circle cx="117" cy="46" r="6" class="model-adjust adjust-b"/><circle cx="95" cy="65" r="6" class="model-adjust adjust-c"/>');
    const sample=(r,label)=>'<span class="learning-example"><span class="example-values">('+fmt(r.x)+', '+fmt(r.y)+')</span>'+(label?'<b class="known-label">'+label+'</b>':'')+'</span>';
    const fieldNames='<span class="learning-feature-key">Pairs: '+escape(d.x)+' + '+escape(d.y)+'</span>';
    const points=[[32,29],[47,18],[58,39],[70,25],[126,62],[145,48],[161,69],[173,51]];
    const cloud=grouped=>graphic((grouped?'<ellipse cx="51" cy="29" rx="39" ry="23" class="learned-region region-one"/><ellipse cx="148" cy="58" rx="39" ry="23" class="learned-region region-two"/>':'')+points.map(([x,y],i)=>grouped&&i>=4?'<rect x="'+(x-5)+'" y="'+(y-5)+'" width="10" height="10" rx="2" class="learned-point group-two"/>':'<circle cx="'+x+'" cy="'+y+'" r="5" class="learned-point '+(grouped?'group-one':'unlabelled-point')+'"/>').join(''));
    let title,description,input,centre,output,feedback,after;
    if(mode==='supervised'){
      title='Supervised · learn from inputs and known outputs';description='During learning, predictions are compared with the supplied labels. The comparison helps adjust the model.';
      input=stage('1','Labelled examples','<div class="learning-examples">'+sample(rows[0],'A')+sample(rows[2],'B')+'</div>'+fieldNames,'Features are paired with known outputs. A and B are hypothetical labels.','examples-stage');
      centre=stage('2','Model learns',model,'It uses the inputs to make predictions; the known outputs are used to check them.','model-stage');
      output=stage('3','Predict and compare','<div class="prediction-comparison"><span>Prediction <b>A</b></span><span>Known label <b>B</b></span></div>','In this example, the prediction differs from the known label, so the model is adjusted.','prediction-stage');
      feedback='Compare predictions with known outputs → adjust the model → repeat with training examples.';
      after='<b>After learning</b><span>New input without its label</span><i aria-hidden="true">→</i><span>Trained model</span><i aria-hidden="true">→</i><span>Predicted output</span>';
    }else if(mode==='unsupervised'){
      title='Unsupervised · discover structure without supplied labels';description='This clustering example groups observations using patterns in their features. No correct group labels are supplied.';
      input=stage('1','Unlabelled examples',cloud(false),'Observations have features but no supplied group labels.','examples-stage');
      centre=stage('2','Find structure',model,'A clustering method looks for observations that are similar under its chosen assumptions.','model-stage');
      output=stage('3','Candidate groups',cloud(true),'Circle and square groups are discovered assignments, not known classes.','prediction-stage');
      feedback='The method follows its own grouping objective; it does not compare with supplied correct class labels.';
      after='<b>Then investigate</b><span>Discovered groups</span><i aria-hidden="true">→</i><span>Inspect features and stability</span><i aria-hidden="true">→</i><span>Interpret with domain evidence</span>';
    }else{
      title='Self-supervised · create a learning task from the data';description='An observed value is hidden from the model input. Its original value is kept separately to check the prediction.';
      input=stage('1','Hide a known value','<div class="masked-example"><span>'+escape(rows[3].id)+' · ('+fmt(rows[3].x)+', <b>[MASK]</b>)</span><small>Original value kept for checking</small></div>'+fieldNames,'The input is incomplete on purpose. The original observation supplies the known output.','examples-stage');
      centre=stage('2','Predict what is hidden',model,'The model uses the visible information to predict the hidden measurement.','model-stage');
      output=stage('3','Compare and learn','<div class="prediction-comparison"><span>Predicted value <b>?</b></span><span>Original hidden value <b>✓</b></span></div>','Compare the prediction with the original value, then adjust the model. The prediction here is symbolic.','prediction-stage');
      feedback='Compare with the original hidden value → adjust the model → repeat with other masked examples.';
      after='<b>After learning</b><span>Reuse learned representations</span><i aria-hidden="true">→</i><span>Explore data or support a later task</span>';
    }
    $('learningFlowTitle').textContent=title;$('learningFlowDescription').textContent=description;
    $('learningModelFlow').innerHTML='<span class="learning-phase">During learning</span><div class="learning-stage-grid">'+input+connector+centre+connector+output+'</div><div class="learning-feedback-loop"><span aria-hidden="true">↶</span><p>'+feedback+'</p></div><div class="learning-after">'+after+'</div>';
  }
  function renderSetup(){
    window.DiscoveryVisuals?.setMode('learningSetup',state.paradigm);
    renderLearningModelFlow();
    const setups={
      supervised:['Labelled data: inputs + known outputs','Provided labels or known outputs','Predict outputs for new inputs','Imagine a known output was supplied for each observation: a habitat category, customer segment, exam grade or song genre. A supervised model learns from the inputs and these known outputs. Outputs may also be numerical. The A/B labels below are hypothetical teaching examples.'],
      unsupervised:['Unlabelled data: inputs only','Patterns in the data; no supplied labels','Find groups, relationships or representations','There are no supplied correct answers or group labels. We explore patterns in the inputs, then investigate whether they are useful. Discovered groups are not automatically real-world classes.'],
      self:['Unlabelled data','A learning task created from the data','Learn useful representations','Hide an observed measurement and learn to predict its original value. The known output for this task comes from the data itself, without someone manually labelling each example. This differs from simply discovering groups.']
    };
    const a=setups[state.paradigm];['setupInput','setupSignal','setupGoal','setupExplanation'].forEach((id,i)=>$(id).textContent=a[i]);pressed('paradigmChoices','paradigm',state.paradigm);
    const demo=Core.rawRows(state.dataset).slice(0,4), supplied=state.paradigm==='supervised',self=state.paradigm==='self';
    $('labelComparison').innerHTML='<table class="discovery-table"><caption>Same four observations · '+(supplied?'hypothetical supplied labels for illustration only; not verified classes':self?'one known value deliberately hidden for a prediction task':'no supplied labels or known outputs')+'</caption><thead><tr><th scope="col">ID</th><th scope="col">'+escape(dataset().x)+'</th><th scope="col">'+escape(dataset().y)+'</th>'+(supplied?'<th scope="col">Supplied category</th>':'')+'</tr></thead><tbody>'+demo.map((r,i)=>'<tr><td>'+r.id+'</td><td>'+fmt(r.x)+'</td><td>'+(self&&i===3?'[MASK]':fmt(r.y))+'</td>'+(supplied?'<td>Category '+(i<2?'A':'B')+'</td>':'')+'</tr>').join('')+'</tbody></table>';
    $('maskExample').hidden=state.paradigm!=='self';const row=Core.rawRows(state.dataset)[3];$('maskPrompt').textContent=row.id+': '+dataset().x+' = '+fmt(row.x)+'; '+dataset().y+' = [MASK]. The original value is the known output for this prediction task.';$('maskAnswer').textContent='';
  }
  const previews={
    clusters:['Clustering: find candidate groups','Group observations that are similar under a chosen definition of similarity. Later labs introduce K-means, hierarchical clustering and DBSCAN.','Different definitions of similarity can give different groupings. A cluster colour is not a verified class.'],
    reduce:['Dimensionality reduction: use fewer coordinates','Represent many measurements with fewer dimensions for exploration or modelling. PCA, t-SNE and UMAP make different choices about what to preserve.','Compression loses information. A separated-looking 2D picture is not proof of distinct classes.'],
    anomalies:['Anomaly detection: investigate the unusual','Find observations that differ from a reference pattern. Such points can suggest a rare event, a new condition or a data problem.','Unusual does not mean wrong. A detection flag needs contextual investigation.'],
    rules:['Association discovery: find co-occurrences','Look for combinations that occur together, such as products in a basket. Association rules describe these co-occurrences.','An association does not establish causation. Common items may co-occur simply because they are common.'],
    represent:['Representation learning: learn useful features','Learn a new encoding of the observations. An autoencoder, for example, passes data through a bottleneck and tries to reconstruct the input.','A compact representation can discard important detail. A good reconstruction alone does not establish usefulness for every later task.']
  };
  function renderTechnique(){
    pressed('techniqueChoices','technique',state.technique);const p=previews[state.technique];$('techniqueTitle').textContent=p[0];$('techniqueExplanation').textContent=p[1];$('techniqueCaution').textContent=p[2];
    let content='';
    if(state.technique==='rules')content='<div class="basket-examples"><strong>Five illustrative baskets</strong><br>1 · Bread + milk<br>2 · Bread + milk<br>3 · Bread + milk + fruit<br>4 · Bread<br>5 · Fruit<br><strong>Notice: bread and milk appear together.</strong></div>';
    else if(state.technique==='represent')content='<div class="technique-equation" role="img" aria-label="Input passes through an encoder into a bottleneck representation, then a decoder reconstructs the input"><span>Input<br>x</span>→<span>Latent code<br>z</span>→<span>Reconstruction<br>x̂</span></div>';
    else {
      const points=[[55,65],[75,50],[90,90],[105,72],[220,140],[240,120],[265,155],[280,132],[350,40]];
      const projected=state.technique==='reduce';content='<svg viewBox="0 0 420 220" role="img" aria-label="'+escape(p[0])+': conceptual illustration"><path d="M30 20V185H400" stroke="#7393b350" fill="none"/>'+(projected?'<path d="M40 145L380 50" stroke="#e1d744" stroke-width="2"/><text x="70" y="204" fill="#acc6d8" font-size="11">Illustrative projection onto one direction</text>':'');
      points.forEach(([x,y],i)=>{const unusual=state.technique==='anomalies'&&i===8;const color=state.technique==='clusters'?(i<4?'#32cfdf':i<8?'#df50bb':'#e1d744'):'#b7cddd';if(projected){const t=((x-40)*340+(y-145)*-95)/(340**2+95**2),px=40+t*340,py=145-t*95;content+='<path d="M'+x+' '+y+'L'+px+' '+py+'" stroke="#7393b350" stroke-dasharray="3 4"/><circle cx="'+px+'" cy="'+py+'" r="4" fill="#e1d744"/>'}content+='<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+color+'" stroke="#ffffff99"/>'+(unusual?'<circle class="preview-highlight" cx="'+x+'" cy="'+y+'" r="15" fill="none" stroke="#e1d744" stroke-width="2"/>':'')});content+='</svg>';
    }
    $('techniqueVisual').innerHTML=content;
  }
  function plotPrepared(prepared){
    const d=dataset(),rows=prepared.plotted,xs=rows.map(r=>r.x),ys=rows.map(r=>r.y);const extent=a=>{const min=Math.min(...a),max=Math.max(...a),pad=(max-min||1)*.12;return [min-pad,max+pad]};const [xmin,xmax]=extent(xs),[ymin,ymax]=extent(ys),px=x=>65+(x-xmin)/(xmax-xmin)*545,py=y=>240-(y-ymin)/(ymax-ymin)*210;
    let svg='<svg viewBox="0 0 640 310" role="img" aria-label="Prepared observations: '+escape(d.x)+' against '+escape(d.y)+'. '+rows.length+' complete points shown."><title>Prepared observations</title>';
    for(let i=0;i<4;i++){const x=xmin+(xmax-xmin)*i/3,y=ymin+(ymax-ymin)*i/3;svg+='<path d="M'+px(x)+' 30V240M65 '+py(y)+'H610" stroke="#7393b320"/><text x="'+px(x)+'" y="260" text-anchor="middle" fill="#91adbf" font-size="10">'+fmt(x)+'</text><text x="55" y="'+(py(y)+3)+'" text-anchor="end" fill="#91adbf" font-size="10">'+fmt(y)+'</text>'}
    rows.forEach(r=>{const color=r.unusual?'#e1d744':r.imputed?'#df50bb':'#32cfdf';svg+='<circle cx="'+px(r.x)+'" cy="'+py(r.y)+'" r="7" fill="'+color+'" stroke="#effaff" stroke-width="1.2"/><text x="'+(px(r.x)+10)+'" y="'+(py(r.y)-9)+'" fill="#c6dce9" font-size="10">'+r.id+(r.imputed?' *':'')+'</text>'});
    svg+='<text x="338" y="289" text-anchor="middle" fill="#b8d0df" font-size="11">'+escape(d.x)+(state.scale==='standard'?' [z-score]':'')+'</text><text transform="translate(14 143) rotate(-90)" text-anchor="middle" fill="#b8d0df" font-size="11">'+escape(d.y)+(state.scale==='standard'?' [z-score]':'')+'</text></svg>';
    $('prepPlot').innerHTML=svg;
  }
  const prepStepNames=['Inspect the data','Handle missing values','Check unusual observations','Compare feature scales','Turn categories into numbers'];
  function renderPrepWalkthrough(focus=false){
    const step=state.prepStep;
    prepStepNames.forEach((name,i)=>{
      $('prepStep'+i).hidden=i!==step;
      $('prepProgress'+i).setAttribute('aria-current',i===step?'step':'false');
      $('prepProgress'+i).textContent=(i===step?'→ ':i<step?'✓ ':'')+(i+1)+'. '+name;
    });
    $('prepStepStatus').textContent='Step '+(step+1)+' of 5 · '+prepStepNames[step];
    $('prepPrevious').disabled=step===0;
    $('prepNext').disabled=step===4;
    $('prepNext').textContent=step===4?'Walkthrough complete ✓':'Next: '+prepStepNames[step+1].toLowerCase()+' →';
    $('prepNumericResult').hidden=step===4;
    $('prepEncodingResult').hidden=step!==4;
    $('prepScaleComparison').hidden=step!==3;
    $('prepFinalNote2').hidden=step!==4;
    if(focus)$('prepStepHeading'+step).focus({preventScroll:true});
  }
  function renderPreparation(){
    renderPrepWalkthrough();
    const p=Core.prepare(state.dataset,state),d=dataset();pressed('missingChoices','missing',state.missing);pressed('scaleChoices','scale',state.scale);
    $('includeUnusual').setAttribute('aria-pressed',String(state.includeUnusual));$('includeUnusual').textContent='Unusual observation: '+(state.includeUnusual?'included':'excluded');$('unusualExplanation').textContent=d.unusual;
    $('missingExplanation').textContent=state.missing==='leave'?'The missing measurement remains unknown. Its observation cannot be placed on a two-feature plot.':state.missing==='drop'?'The incomplete row is excluded. Dropping rows can remove useful information or introduce bias.':'The missing value is filled with '+fmt(p.medians.y)+', the median of the currently included observed values for '+d.y+'. This is an estimate, not a recovered measurement.';
    $('prepCounts').innerHTML='<span>'+p.rows.length+' rows retained</span><span>'+p.plotted.length+' plottable</span><span>'+p.missingCount+' incomplete</span><span>'+p.imputedCount+' imputed</span>';
    plotPrepared(p);const c=p.contribution;
    $('contributionNames').textContent='Cyan: '+d.x+' · Magenta: '+d.y;
    $('xContribution').style.width=c.xPercent+'%';$('yContribution').style.width=c.yPercent+'%';$('contributionBar').setAttribute('aria-label',d.x+' contributes '+c.xPercent.toFixed(2)+' percent; '+d.y+' contributes '+c.yPercent.toFixed(2)+' percent.');
    $('contributionValues').textContent='Squared gaps: '+fmt(c.x)+' + '+fmt(c.y)+' = '+fmt(c.total)+'. Contributions: '+c.xPercent.toFixed(2)+'% and '+c.yPercent.toFixed(2)+'%.';
    $('prepInterpretation').textContent=state.scale==='standard'?'The comparison now uses standard deviations rather than the original units. The scaling statistics were fitted on the retained complete observations. Excluding the unusual point can change those statistics.':'Different numerical scales can dominate distance: a large squared gap in one feature can overwhelm the other. Compare this with standardised values.';
    $('preparedCaption').textContent=(state.scale==='standard'?'Standardised values (z-scores)':'Original feature units')+' · * denotes an imputed value';
    $('preparedHead').innerHTML='<tr><th>Observation</th><th>'+escape(d.x)+'</th><th>'+escape(d.y)+'</th></tr>';
    $('preparedRows').innerHTML=p.rows.map(r=>'<tr><td>'+r.id+(r.imputed?'<span class="imputed-tag">*</span>':'')+'</td><td>'+fmt(r.x)+'</td><td>'+fmt(r.y)+'</td></tr>').join('');
  }
  LabShared.initSound();LabShared.initNavigation();LabShared.initSelectMenus(['labSelect']);LabVesper.initScene();
  window.Week1Guide=LabVesper.createGuide({tips:{},welcome:'Start with ML basics and follow the six numbered lecture topics. Then bring your choices together in Lab Week 1.'});
  $('programChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.program=b.dataset.program;playSound('deck');mark('foundations');renderProgram()});
  $('challengeChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.challenge=b.dataset.challenge;playSound('deck');mark('challenges');renderChallenge()});
  $('encodingChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.encoding=b.dataset.encoding;playSound('tap');mark('preprocessing');renderEncoding()});
  $('datasetChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.dataset=b.dataset.dataset;state.row=null;state.feature=null;state.prepStep=0;state.encoding='words';renderEncoding();state.missing='leave';state.scale='original';state.includeUnusual=true;playSound('tap');renderData();renderSetup();renderPreparation()});
  $('paradigmChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.paradigm=b.dataset.paradigm;playSound('deck');mark('setups');renderSetup()});
  $('revealTarget').onclick=()=>{const row=Core.rawRows(state.dataset)[3];$('maskAnswer').textContent='Hidden value: '+fmt(row.y)+'. It is the original observed '+dataset().y+' value for '+row.id+'. Artificially hiding a known value is different from filling a genuinely missing measurement.';playSound('tap');mark('setups')};
  $('techniqueChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.technique=b.dataset.technique;playSound('deck');mark('techniques');renderTechnique()});
  $('missingChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.missing=b.dataset.missing;playSound('tap');mark('preprocessing');renderPreparation()});
  $('scaleChoices').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.scale=b.dataset.scale;playSound('tap');mark('preprocessing');renderPreparation()});
  $('includeUnusual').onclick=()=>{state.includeUnusual=!state.includeUnusual;playSound('tap');mark('preprocessing');renderPreparation()};
  $('resetPreparation').onclick=()=>{state.prepStep=0;state.encoding='words';renderEncoding();state.missing='leave';state.scale='original';state.includeUnusual=true;playSound('tap');renderPreparation()};
  $('prepPrevious').onclick=()=>{if(state.prepStep>0){state.prepStep--;playSound('deck');renderPrepWalkthrough(true)}};
  $('prepNext').onclick=()=>{if(state.prepStep<4){state.prepStep++;playSound('deck');mark('preprocessing');renderPrepWalkthrough(true)}};
  renderProgram();renderChallenge();renderEncoding();renderData();renderSetup();renderTechnique();renderPreparation();
})();
