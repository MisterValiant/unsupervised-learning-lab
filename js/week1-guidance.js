/* Contextual teaching prompts for Week 1. No hover sounds or repeated scroll prompts. */
(() => {
  const $=id=>document.getElementById(id),guide=window.Week1Guide;
  if(!guide)return;
  const sections={
    mlFoundations:'Machine learning learns patterns from examples. Compare the two buttons: a person writes the rule in conventional programming; an ML model learns a pattern from data. The illustrations explain the idea rather than training a model here.',
    learningSetup:'Ask where the known outputs come from. Supervised learning receives labelled examples. Unsupervised learning explores data without supplied labels. Self-supervised learning creates a prediction task using information already in the data.',
    meetData:'Start with one observation: one row becomes one point. Its feature values determine its position. The ID only identifies the observation; it is not a label telling us its group.',
    discoveries:'Choose a question before choosing a technique. Do you want similar groups, fewer coordinates, unusual observations, co-occurring items, or a useful representation? These previews show different goals, not full algorithms.',
    challenges:'A discovered pattern needs checking. Choose a problem, read its everyday example, then explain what you would check before trusting or using the result.',
    prepareData:'Preprocessing changes the measurements used to compare observations. Follow one step at a time, try a choice, and watch the result beside it. Back lets you revisit a decision without losing your choices.',
    detective:'In Lab Week 1, put preprocessing into practice with Python. Launch the notebook, run its setup cells first, and work through six guided tasks, then try the independent dataset. Write your reasoning as comments or in the explanation cells.'
  };
  const prep=[
    'Inspect before changing anything. The table has six observations; an incomplete observation cannot appear on this two-feature plot. A missing measurement is different from an absent label.',
    'Choose how to handle the blank. Median filling estimates a value and keeps the row. Dropping the incomplete row loses that observation. Compare the table and counts, and explain the trade-off.',
    'Investigate the unusual observation before removing it. It could be a mistake or a valid rare event. Including and excluding it here is a comparison, not proof that deletion is correct.',
    'A feature with much larger numbers can dominate distance. Compare original and standardised values, then inspect the contribution bar. The plot resizes its axes, so screen distances alone can be misleading.',
    'Some features are categories rather than measurements. One-hot encoding makes a separate 0/1 column for each category, avoiding an invented order. This soil example is separate from the numeric plot.'
  ];
  const tasks=[
    'Task 1: inspect the original table, column types and missing-value counts. The bar chart shows which features contain blanks. Explain what one row and each feature represent before changing the data.',
    'Task 2: keep the original data and fill blanks in a working copy. Compare the missingness maps before and after. Explain why you used median filling and what information would be lost by dropping incomplete rows.',
    'Task 3: investigate the large income. Both plots contain the same data; the second is only zoomed in. Explain how you would verify the unusual value. The example keeps it rather than silently deleting it.',
    'Task 4: compare original units with standardised values. The box plots use different vertical axes. Scaling changes numerical comparisons; it does not remove the unusual income or guarantee useful groups.',
    'Task 5: turn the channel categories into 0/1 columns. Each row should have one present category. Combine those indicators with the scaled numerical features, and explain why codes such as 1, 2 and 3 could mislead.',
    'Task 6: check that all eight observations remain and no input features are missing. Passing those checks confirms the table structure, not the quality of every decision. Add your own explanation before exporting.',
    'Task 7 is your independent practice. Inspect the new student dataset, write your own preprocessing code and justify your choices. Use plots as evidence, then explain how your decisions could change similarity. The supplied code only creates the dataset.'
  ];
  const choices={
    program:{rules:'A person writes a fixed threshold. The same rule is applied to every reading; the system does not learn that threshold from the examples.',learn:'Here the reference band represents a pattern learned from historical readings. A departure is flagged for investigation. This is an illustration of unsupervised anomaly detection, not a trained model on this page.'},
    paradigm:{supervised:'Supervised learning uses labelled data: inputs paired with known outputs. During training, predictions are compared with those known outputs. Afterwards the trained model can predict an output for a new input.',unsupervised:'Unsupervised learning receives features without supplied labels or known outputs. The groups shown are candidate patterns, not verified classes. People still decide whether the discovered structure is useful.',self:'Self-supervised learning deliberately hides part of an observed example and learns to predict it. The original hidden value provides the known output. This differs from guessing a genuinely missing measurement.'},
    dataset:{environment:'Each row is a forest plot. Canopy height and greenness are input features; habitat labels are not supplied. Select an ID or a point to connect the two views.',customers:'Each row is a customer. Income and spending are features; customer-group labels are not supplied. Similar measurements may suggest groups, but the groups still need interpretation.',students:'Each row is a student. Study time and attendance are features, while exam grades are not supplied. These measurements do not by themselves establish a student’s ability.',music:'Each row is a song. Song length and listening frequency are features; genre labels are not supplied. Compare observations without assuming that similar listening patterns mean the same genre.'},
    technique:{clusters:'Clustering finds candidate groups of similar observations. The result depends on the features, their scales and the method. A coloured cluster is not automatically a verified real-world class.',reduce:'Dimensionality reduction represents data with fewer coordinates. It can make exploration easier, but some information is lost. A separated-looking picture is not proof that distinct classes exist.',anomalies:'Anomaly detection flags observations that differ from a reference pattern. A flag might indicate an error, a rare valid event or a new condition; investigate the context.',rules:'Association discovery finds things that occur together, such as items in shopping baskets. Co-occurrence describes a relationship; it does not prove that one item causes another.',represent:'Representation learning builds a new set of features. This autoencoder illustration compresses an input and reconstructs it. Good reconstruction does not guarantee that the learned features suit every later task.'},
    missing:{leave:'The missing measurement remains unknown. Its row is retained in the table but cannot be placed on the two-feature plot. A retained row and a plottable point are not always the same thing.',median:'The blank is filled with the median of the included observed values. It is an estimate, not a recovered measurement. Check the marked row and the changed count of plottable observations.',drop:'The incomplete observation is excluded. This avoids estimating its missing measurement but loses the rest of that row too. Explain whether that information loss is acceptable.'},
    scale:{original:'These values use the original measurement units. Look at the contribution bar to see whether one feature dominates similarity because its numbers are larger.',standard:'Each feature has been standardised separately. Compare the table and contribution bar. Standardisation changes the scale of the measurements; it does not assign group labels or remove unusual observations.'},
    encoding:{words:'These are category names. They describe the soil type rather than its position on a numeric scale. One-hot encoding provides numerical inputs without inventing an order.',onehot:'A 1 means the observation has that category; a 0 means it does not. The new columns are input features, not labels or known outputs. IDs still only identify observations.'}
  };
  const componentTips={
    revealTarget:'The revealed value was already known before it was deliberately hidden. It provides the known output for this self-supervised prediction task; this is not the same as filling a genuinely missing value.',
    observationRows:'One row is one observation. Selecting its ID highlights the same observation on the plot. The highlight shows your selection, not a discovered group label.',
    observationHead:'A feature column contains measurements used to position points. Selecting a heading highlights its corresponding axis. The ID column identifies observations; it is not a measurement of similarity.',
    dataPointPlot:'Each point represents one row. Its two feature values give its coordinates. The cyan ring marks your selection; no predefined group label has been supplied.',
    includeUnusual:'Compare the result with this observation included and excluded. Removing it can also change the median and scaling statistics. Verify its meaning before deciding which choice is justified.',
    resetPreparation:'Reset restores the original numeric values, includes the unusual observation and leaves the missing value unfilled. It also returns you to the first preprocessing step.',
    launchWeek1Notebook:'The notebook runs Python in this browser. Wait for its interface and kernel, then run the first package-setup cell and create the dataset. Shift + Enter runs a cell. Your edits are not shared with other students.',
    expandWeek1Notebook:'Expand gives the notebook more space. Return to split view brings the task instructions back. It changes the layout without resetting the notebook.',
    openNotebookTab:'This opens a separate notebook view. The PDF button on this lesson exports the notebook in the embedded panel, so use that panel when preparing your PDF.',
    downloadNotebookPdf:'Finish the cells you want to include and add your explanations. This button downloads the current embedded notebook as a PDF with code, outputs and plots. Review the file, then submit it on your course platform.',
    week1RecapSummary:'Explain the six ideas in your own words: ML basics, learning types, unlabelled data, technique choices, limitations and preprocessing decisions. Use an example from today rather than simply repeating a definition.'
  };
  let last='',timer=null,dismissed=false;const seen=new Set();
  function say(key,text,explicit=true){
    if(!text||document.hidden||$('botHandle')?.getAttribute('aria-pressed')==='false')return;
    if(!explicit&&dismissed)return;
    if(explicit){dismissed=false;clearTimeout(timer)}
    if(last===key&&!$('botBubble')?.hidden)return;
    last=key;guide.say(text);
  }
  function section(id){
    clearTimeout(timer);if(seen.has(id)||!sections[id]||dismissed)return;
    timer=setTimeout(()=>{seen.add(id);say('section:'+id,sections[id],false)},650);
  }
  function currentPrep(){const i=prep.findIndex((_,i)=>$('prepProgress'+i)?.getAttribute('aria-current')==='step');return Math.max(0,i)}
  function help(target){
    if(!target?.closest)return null;
    for(const [attribute,values]of Object.entries(choices)){
      const node=target.closest('[data-'+attribute+']');if(node&&values[node.dataset[attribute]])return [attribute+':'+node.dataset[attribute],values[node.dataset[attribute]]];
    }
    if(target.closest('#prepNext,#prepPrevious')){const i=currentPrep();return ['prep:'+i,prep[i]]}
    if(target.closest('#challengeChoices'))return ['challenge:'+($('challengeCaseTitle')?.textContent||''),$('challengeCheck')?.textContent];
    if(target.closest('#independentDataset summary'))return ['independent-data','This code creates the new dataset only. Keep the original practice table, add your own cells, and choose the missing-value, unusual-value, scaling and encoding decisions yourself. Explain your reasoning rather than copying the customer example unchanged.'];
    if(target.closest('.lab-code summary'))return ['code-hint','The code hint is a starting point. Read the comments, run the cell and inspect its output. Add your own explanation of the decision and what the result means.'];
    for(const [id,text]of Object.entries(componentTips))if(target.closest('#'+id))return [id,text];
    return null;
  }
  document.addEventListener('click',event=>{const tip=help(event.target);if(tip)say(...tip)});
  // Choice explanations happen after selection; focus provides help on other key controls.
  document.addEventListener('focusin',event=>{if(event.target.closest?.('[data-program],[data-paradigm],[data-dataset],[data-technique],[data-missing],[data-scale],[data-encoding],#challengeChoices,#prepNext,#prepPrevious'))return;const tip=help(event.target);if(tip)say(...tip)});
  $('botHide')?.addEventListener('click',()=>{dismissed=true;clearTimeout(timer)});
  const recap=$('week1Recap');recap?.addEventListener('toggle',()=>{if(recap.open)say('recap',componentTips.week1RecapSummary)});
  window.Week1Guidance={section,task:index=>say('task:'+index,tasks[index]),help};
  const current=document.querySelector('.discovery-section.is-current-section');if(current)section(current.id);
})();
