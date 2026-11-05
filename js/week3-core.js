/* Numerical teaching models: deterministic data, Euclidean linkage and DBSCAN. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Week3Core=api})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const mean=(X,ids)=>ids.reduce((a,i)=>[a[0]+X[i][0]/ids.length,a[1]+X[i][1]/ids.length],[0,0]);
 const sse=(X,ids)=>{const m=mean(X,ids);return ids.reduce((s,i)=>s+distance(X[i],m)**2,0)};
 function random(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)}
 function datasets(){const r=random(73),j=()=>r()-.5,clouds=[],moons=[],uneven=[];
  [[22,27],[72,27],[46,75]].forEach(c=>{for(let i=0;i<28;i++)clouds.push([c[0]+j()*18,c[1]+j()*18])});
  for(let i=0;i<45;i++){const t=Math.PI*i/44;moons.push([35+27*Math.cos(t)+j()*2.5,49+27*Math.sin(t)+j()*2.5]);moons.push([62+27*Math.cos(t)+j()*2.5,59-27*Math.sin(t)+j()*2.5])}
  for(let i=0;i<50;i++)uneven.push([27+j()*12,48+j()*12]);for(let i=0;i<42;i++)uneven.push([70+j()*39,49+j()*46]);
  for(let i=0;i<10;i++){const pt=[5+r()*90,5+r()*90];clouds.push(pt);moons.push([...pt]);uneven.push([...pt])}
  const tiny=[[16,20],[20,23],[23,18],[19,29],[27,26],[66,20],[70,25],[76,19],[73,31],[65,29],[41,70],[46,75],[51,68],[45,82],[55,77]];
  const chain=[[10,35],[13,40],[16,32],[19,39],[26,40],[34,42],[42,43],[50,44],[58,45],[66,46],[74,44],[81,42],[87,39],[89,46],[84,50]];
  return {clouds,moons,uneven,tiny:tiny.map((p,i)=>[p[0]+i*.013,p[1]+i*i*.0017]),chain:chain.map((p,i)=>[p[0]+i*.013,p[1]+i*i*.0017])};
 }
 function hierarchy(X,method='average'){
  const nodes=X.map((p,i)=>({id:i,ids:[i],height:0,center:[...p],size:1}));let active=nodes.map(n=>n.id);const merges=[];
  function link(a,b){if(method==='ward')return Math.sqrt(2*a.size*b.size/(a.size+b.size))*distance(a.center,b.center);const ds=a.ids.flatMap(i=>b.ids.map(j=>distance(X[i],X[j])));return method==='single'?Math.min(...ds):method==='complete'?Math.max(...ds):ds.reduce((s,d)=>s+d,0)/ds.length}
  while(active.length>1){let best=Infinity,ai=0,bi=1;for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const d=link(nodes[active[i]],nodes[active[j]]);if(d<best-1e-12){best=d;ai=i;bi=j}}
   const a=nodes[active[ai]],b=nodes[active[bi]],ids=[...a.ids,...b.ids],node={id:nodes.length,left:a.id,right:b.id,ids,height:best,center:mean(X,ids),size:ids.length};nodes.push(node);merges.push(node);active=active.filter((_,i)=>i!==ai&&i!==bi);active.push(node.id);
  }return {nodes,merges,n:X.length};
 }
 function partition(tree,{height=Infinity,steps=Infinity,k=1}={}){let groups=tree.nodes.slice(0,tree.n).map(n=>n.ids);let count=0;for(const m of tree.merges){if(count>=steps||m.height>height||groups.length<=k)break;groups=groups.filter(g=>!g.some(i=>m.ids.includes(i)));groups.push(m.ids);count++}groups.sort((a,b)=>Math.min(...a)-Math.min(...b));const labels=Array(tree.n);groups.forEach((g,i)=>g.forEach(j=>labels[j]=i));return {groups,labels,count}}
 function kmeans(X,k,starts=12){let best=null;for(let run=0;run<starts;run++){const r=random(31+run*97),chosen=new Set();while(chosen.size<k)chosen.add(Math.floor(r()*X.length));let centers=[...chosen].map(i=>[...X[i]]),labels=Array(X.length).fill(-1);for(let iter=0;iter<100;iter++){const next=X.map(p=>centers.reduce((best,c,i)=>distance(p,c)<distance(p,centers[best])-1e-12?i:best,0));const stable=next.every((l,i)=>l===labels[i]);labels=next;centers=centers.map((c,j)=>{const ids=labels.map((l,i)=>l===j?i:-1).filter(i=>i>=0);return ids.length?mean(X,ids):c});if(stable)break}const error=X.reduce((s,p,i)=>s+distance(p,centers[labels[i]])**2,0);if(!best||error<best.sse)best={labels,centers,sse:error}}return best}
 function splitLargest(X,groups){const candidates=groups.filter(g=>g.length>1);if(!candidates.length)return groups;const g=candidates.reduce((a,b)=>sse(X,b)>sse(X,a)?b:a);const fit=kmeans(g.map(i=>X[i]),2);let parts=[0,1].map(l=>g.filter((_,i)=>fit.labels[i]===l));if(parts.some(a=>!a.length))parts=[g.slice(0,1),g.slice(1)];return [...groups.filter(a=>a!==g),...parts]}
 function dbscan(X,eps,minPts){const neighbors=X.map(p=>X.map((q,j)=>distance(p,q)<=eps+1e-10?j:-1).filter(j=>j>=0)),core=neighbors.map(ns=>ns.length>=minPts);const labels=Array(X.length).fill(-2),visited=Array(X.length).fill(false),trace=[];let group=0;
  function snap(point,message){trace.push({point,message,labels:[...labels],visited:[...visited]})}
  for(let i=0;i<X.length;i++){if(visited[i])continue;visited[i]=true;if(!core[i]){labels[i]=-1;snap(i,'Fewer than MinPts neighbours: mark noise provisionally. A later core neighbourhood may reach it.');continue}labels[i]=group;snap(i,'A core point starts group '+(group+1)+'. Add its neighbours to the search.');const queue=[...neighbors[i]],queued=new Set(queue);for(let at=0;at<queue.length;at++){const j=queue[at];if(j===i)continue;const fresh=!visited[j];if(fresh){visited[j]=true;if(core[j])for(const n of neighbors[j])if(!queued.has(n)){queue.push(n);queued.add(n)}}if(labels[j]<0)labels[j]=group;snap(j,core[j]?'Core point: its neighbours can expand this group.':'Border point: it joins this group but does not expand the search.')}group++}
  const types=X.map((_,i)=>core[i]?'core':labels[i]>=0?'border':'noise');return {labels,core,neighbors,types,trace,groups:group,noise:labels.filter(l=>l===-1).length};
 }
 function neighborDistances(X,m){return X.map((p,i)=>({index:i,value:X.map(q=>distance(p,q)).sort((a,b)=>a-b)[m-1]})).sort((a,b)=>a.value-b.value)}
 return {distance,mean,sse,datasets,hierarchy,partition,kmeans,splitLargest,dbscan,neighborDistances};
});
