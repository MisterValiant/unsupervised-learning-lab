/* Load the notebook only on request; the Python runtime lives inside JupyterLite. */
(() => {
  const $=id=>document.getElementById(id),frame=$('week1NotebookFrame');
  if(!frame)return;
  const tasks=Array.from(document.querySelectorAll('#week1NotebookWorkspace .week1-lab-task'));
  let launched=false,task=0,timer;
  const sound=()=>window.LabShared?.playSound('deck');
  function renderTask(focus=false){
    tasks.forEach((node,i)=>node.hidden=i!==task);
    $('labTaskPosition').textContent='Task '+(task+1)+' / '+tasks.length;
    $('labTaskPrevious').disabled=task===0;
    $('labTaskNext').disabled=task===tasks.length-1;
    if(focus){window.Week1Guidance?.task(task);const heading=tasks[task].querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true})}
  }
  function launch(){
    if(launched)return;launched=true;sound();
    frame.hidden=false;frame.src=frame.dataset.src;
    $('week1NotebookPlaceholder').hidden=true;
    $('launchWeek1Notebook').disabled=true;
    $('launchWeek1Notebook').textContent='Notebook launched ✓';
    $('week1NotebookStatus').textContent='Loading notebook interface… Python and packages load separately when the kernel starts and you run the setup cell.';
    timer=setTimeout(()=>{$('week1NotebookStatus').textContent='If the notebook has not appeared, try Open in new tab. The first launch needs internet access to download Python and its packages.'},45000);
  }
  frame.addEventListener('load',()=>{
    if(!launched)return;clearTimeout(timer);
    $('week1NotebookStatus').textContent='Notebook interface loaded. Wait for Python (Pyodide) to be ready, then run the first setup cell with Shift + Enter.';
  });
  frame.addEventListener('error',()=>{clearTimeout(timer);$('week1NotebookStatus').textContent='The embedded notebook could not load. Try Open in new tab or check your connection.'});
  $('launchWeek1Notebook').addEventListener('click',launch);
  $('expandWeek1Notebook').addEventListener('click',()=>{
    launch();sound();const expanded=$('week1NotebookWorkspace').classList.toggle('notebook-expanded');
    $('expandWeek1Notebook').setAttribute('aria-pressed',String(expanded));
    $('expandWeek1Notebook').textContent=expanded?'Return to split view ↙':'Expand notebook ↗';
  });
  $('labTaskPrevious').addEventListener('click',()=>{if(task>0){task--;sound();renderTask(true)}});
  $('labTaskNext').addEventListener('click',()=>{if(task<tasks.length-1){task++;sound();renderTask(true)}});
  renderTask();
})();
