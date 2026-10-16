/* Pure data/preprocessing functions; independent of DOM and browser services. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DiscoveryCore=api})(typeof window!=='undefined'?window:globalThis,()=>{
  const datasets={
    environment:{name:'Environmental plots',unit:'forest plot',prefix:'P',x:'Canopy height (m)',y:'Greenness index (0–1)',file:'environment-lab0.csv',story:'One observation is a synthetic forest plot, described by canopy height and a greenness index. No habitat labels are supplied.',unusual:'P6 is much taller than the other plots. It could be a large tree, a unit mismatch or a measurement issue. Inspect the context before removing it.',values:[[6,.2],[10,.3],[12,.55],[14,.62],[18,null],[60,.25]]},
    customers:{name:'Customer profiles',unit:'customer',prefix:'C',x:'Annual income (Rs)',y:'Spending score (0–100)',file:'customers-lab0.csv',story:'One observation is a synthetic customer profile, described by annual income and a spending score. No customer-segment labels are supplied.',unusual:'C6 has a much higher income than the others. It could be a real customer rather than an error. Investigate before removing it.',values:[[240000,20],[300000,30],[480000,60],[540000,70],[420000,null],[1800000,25]]}
  };
  Object.assign(datasets,{
    students:{name:'Student study habits',unit:'student',prefix:'S',x:'Study time (hours/week)',y:'Attendance (%)',file:'students-lab0.csv',story:'Each row is a synthetic student, described by study time and attendance. No exam grades or predefined student groups are supplied.',unusual:'S6 reports more study hours than the other examples. This could be genuine or a reporting difference. Check the context before excluding the observation.',values:[[2,50],[3,60],[6,85],[8,95],[5,null],[20,55]]},
    music:{name:'Songs and listening',unit:'song',prefix:'M',x:'Song length (minutes)',y:'Plays this week',file:'music-lab0.csv',story:'Each row is a synthetic song, described by its length and how often it was played this week. No genre labels or predefined song groups are supplied.',unusual:'M6 is longer than the other recordings. It may be an extended track or a recording error; check the song details before excluding it.',values:[[2,5],[3,8],[4,20],[5,25],[3.5,null],[15,4]]}
  });
  const median=values=>{const a=values.filter(Number.isFinite).slice().sort((x,y)=>x-y),n=a.length;return n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):null};
  const moments=values=>{const a=values.filter(Number.isFinite),n=a.length;if(!n)return {mean:0,std:0};const mean=a.reduce((s,v)=>s+v,0)/n;return {mean,std:Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/n)}};
  function rawRows(key){const d=datasets[key];return d.values.map(([x,y],i)=>({id:d.prefix+(i+1),x,y,unusual:i===5,imputed:false}))}
  function prepare(key,options={}){
    const missing=options.missing||'leave',include=options.includeUnusual!==false,standard=options.scale==='standard';
    let rows=rawRows(key).filter(r=>include||!r.unusual);const medians={x:median(rows.map(r=>r.x)),y:median(rows.map(r=>r.y))};
    if(missing==='median')rows=rows.map(r=>({...r,x:r.x===null?medians.x:r.x,y:r.y===null?medians.y:r.y,imputed:r.x===null||r.y===null}));
    if(missing==='drop')rows=rows.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y));
    const complete=rows.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y));
    const stats={x:moments(complete.map(r=>r.x)),y:moments(complete.map(r=>r.y))};
    if(standard)rows=rows.map(r=>({...r,...Object.fromEntries(['x','y'].map(k=>[k,r[k]===null?null:stats[k].std?(r[k]-stats[k].mean)/stats[k].std:0]))}));
    const plotted=rows.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y));
    const a=rows[0],b=rows[1],dx2=(a.x-b.x)**2,dy2=(a.y-b.y)**2,total=dx2+dy2;
    return {rows,plotted,stats,medians,missingCount:rows.filter(r=>r.x===null||r.y===null).length,imputedCount:rows.filter(r=>r.imputed).length,dropped:6-rows.length,contribution:{x:dx2,y:dy2,total,xPercent:total?100*dx2/total:0,yPercent:total?100*dy2/total:0}};
  }
  function csv(key,rows,standard=false){const d=datasets[key],quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return [['sample_id',d.x+(standard?' [z-score]':''),d.y+(standard?' [z-score]':'')],...rows.map(r=>[r.id,r.x,r.y])].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n'}
  return {datasets,median,moments,rawRows,prepare,csv};
});
