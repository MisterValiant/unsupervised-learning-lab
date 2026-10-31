(() => {
 const frame=document.getElementById('learningPage');
 const root=new URL('./',location.href);
 const pages=new Set(['index.html','week1.html','week2.html','week2-original.html','week3.html']);
 function valid(value){try{const url=new URL(value,root);return url.origin===root.origin&&url.pathname.startsWith(root.pathname)&&pages.has(url.pathname.slice(root.pathname.length))?url:null}catch{return null}}
 let first;try{first=valid(decodeURIComponent(location.hash.slice(1)))}catch{}
 first ||= new URL('index.html',root);
 // Copy the visible route into the address bar; refreshing rebuilds this shell.
 history.replaceState({labPage:first.href},'',first.href);
 frame.src=first.href;
 window.LabShared={playSound:kind=>{frame.contentWindow.LabShared?.unlockAudio();frame.contentWindow.LabShared?.playSound(kind)}};
 function record(url,push){const next=valid(url);if(!next)return;const current=location.href;if(current===next.href)return;history[push?'pushState':'replaceState']({labPage:next.href},'',next.href)}
 frame.addEventListener('load',()=>{
  let doc;try{doc=frame.contentDocument;if(!doc||!valid(frame.contentWindow.location.href))return}catch{return}
  document.title=doc.title;record(frame.contentWindow.location.href,true);
  // Explicit navigation in the frame gives the outer document reliable history.
  doc.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
   const next=valid(link.href);if(!next)return;
   if(next.pathname===frame.contentWindow.location.pathname&&next.search===frame.contentWindow.location.search)return;
   event.preventDefault();record(next.href,true);frame.contentWindow.location.replace(next.href);
  });
  frame.contentWindow.addEventListener('hashchange',()=>record(frame.contentWindow.location.href,true));
 });
 window.addEventListener('popstate',()=>{const next=valid(location.href);if(next&&frame.contentWindow.location.href!==next.href)frame.contentWindow.location.replace(next.href)});
})();
