/* Reusable live-notebook PDF export with page-specific controls and title. */
(() => {
  const join=value=>Array.isArray(value)?value.join(''):String(value??'');
  const plain=value=>join(value).replace(/\x1b\[[0-9;]*[A-Za-z]/g,'');
  const inline=value=>plain(value).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map(part=>part.startsWith('**')?{text:part.slice(2,-2),bold:true}:part.startsWith('`')?{text:part.slice(1,-1),font:'NotebookCode',fontSize:9}:{text:part});
  function definition(notebook,filename,title='Lab Week 1 · Data preprocessing'){
    if(!Array.isArray(notebook?.cells))throw new Error('Choose an open notebook before exporting.');
    const content=[{text:title,style:'title'},{text:filename,style:'meta'},{text:'Notebook snapshot: code, explanations and outputs present at export time.',style:'meta'}];
    const code=text=>({text:plain(text)||' ',font:'NotebookCode',fontSize:7.3,lineHeight:1.15,preserveLeadingSpaces:true,margin:[0,5,0,10]});
    notebook.cells.forEach((cell,index)=>{
      if(cell.cell_type==='markdown'){
        plain(cell.source).split(/\n\s*\n/).forEach(block=>{
          const heading=block.match(/^(#{1,6})\s+([^\n]+)$/);
          if(heading)content.push({text:inline(heading[2]),style:heading[1].length===1?'heading1':'heading2',headlineLevel:1});
          else if(block.trim()){
            const paragraph={text:inline(block),margin:[0,3,0,8]};
            // Keep a heading and its first paragraph together at page boundaries.
            if(content[content.length-1]?.headlineLevel){const title=content.pop();content.push({stack:[title,paragraph],unbreakable:true})}
            else content.push(paragraph);
          }
        });
      }else if(cell.cell_type==='code'){
        content.push({text:'Code cell '+(index+1)+' · execution '+(cell.execution_count??'not run'),style:'cellLabel'});
        content.push(code(cell.source));
        for(const output of cell.outputs||[]){
          if(output.output_type==='stream')content.push(code(output.text));
          else if(output.output_type==='error')content.push({...code(output.traceback?.length?output.traceback:[output.ename+': '+output.evalue]),color:'#a32b25'});
          else if(output.data){
            const data=output.data;
            if(data['image/png'])content.push({image:'data:image/png;base64,'+join(data['image/png']).replace(/\s/g,''),fit:[505,320],margin:[0,6,0,12]});
            else if(data['image/jpeg'])content.push({image:'data:image/jpeg;base64,'+join(data['image/jpeg']).replace(/\s/g,''),fit:[505,320],margin:[0,6,0,12]});
            else if(data['text/plain'])content.push(code(data['text/plain']));
            else content.push({text:'[Rich output not available as a static image or text. Check this output in the notebook.]',italics:true,margin:[0,4,0,8]});
          }
        }
      }else if(join(cell.source).trim())content.push(code(cell.source));
    });
    return {pageSize:'A4',pageMargins:[42,44,42,45],info:{title:filename.replace(/\.ipynb$/i,''),subject:title},defaultStyle:{font:'Roboto',fontSize:10,color:'#172d40',lineHeight:1.2},styles:{title:{fontSize:19,bold:true,margin:[0,0,0,10]},meta:{fontSize:8,color:'#526779',margin:[0,0,0,5]},heading1:{fontSize:17,bold:true,margin:[0,18,0,8]},heading2:{fontSize:13,bold:true,margin:[0,16,0,7]},cellLabel:{fontSize:8,color:'#486173',bold:true,margin:[0,10,0,2]}},content,footer:(page,total)=>({text:page+' / '+total,alignment:'center',fontSize:8,color:'#526779',margin:[0,12,0,0]}),pageBreakBefore:(node,following)=>Boolean(node.headlineLevel&&following.length===0)};
  }
  const loaded=new Map();
  function script(src){
    if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const tag=document.createElement('script');tag.src=src;tag.onload=resolve;tag.onerror=()=>{loaded.delete(src);reject(new Error('PDF tools could not load. Check your connection and try again.'))};document.head.appendChild(tag)}));
    return loaded.get(src);
  }
  async function download(options={}){
    const button=document.getElementById(options.buttonId||'downloadNotebookPdf'),status=document.getElementById(options.statusId||'notebookPdfStatus');
    button.disabled=true;status.textContent='Preparing your current notebook PDF…';
    try{
      const frame=document.getElementById(options.frameId||'week1NotebookFrame');
      const app=frame.contentWindow?.jupyterapp;
      if(!app)throw new Error('Launch the notebook and wait for its interface to finish loading, then try again.');
      const panel=app.shell.currentWidget;
      const notebook=panel?.context?.model?.toJSON?.();
      if(!Array.isArray(notebook?.cells))throw new Error('Select your notebook tab inside JupyterLite, then try again.');
      if(['busy','starting','restarting'].includes(panel.sessionContext?.session?.kernel?.status))throw new Error('Wait for the running code cell to finish before downloading its results.');
      // Read the live model, not the starter file, so edits and outputs are included.
      const snapshot=JSON.parse(JSON.stringify(notebook));
      const filename=panel.context.path.split('/').pop()||'Lab-Week-1.ipynb';
      await script('js/vendor/pdfmake.min.js');await script('js/vendor/notebook-code-font.js');
      window.pdfMake.fonts={Roboto:{normal:'Roboto-Regular.ttf',bold:'Roboto-Medium.ttf',italics:'Roboto-Italic.ttf',bolditalics:'Roboto-MediumItalic.ttf'},NotebookCode:{normal:'NotebookCode.ttf',bold:'NotebookCode.ttf',italics:'NotebookCode.ttf',bolditalics:'NotebookCode.ttf'}};
      const pdf=window.pdfMake.createPdf(definition(snapshot,filename,options.title));
      // Build the bytes first so generation errors can be reported before download.
      const blob=await new Promise((resolve,reject)=>{try{pdf.getBlob(resolve)}catch(error){reject(error)}});
      const link=document.createElement('a'),url=URL.createObjectURL(blob);
      link.href=url;link.download=filename.replace(/\.ipynb$/i,'')+'.pdf';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      status.textContent='PDF download started. Review it, then upload it on your submission platform.';
    }catch(error){status.textContent=error.message||'The PDF could not be created. Please try again.'}
    finally{button.disabled=false}
  }
  window.LabNotebookPdf={definition,download};
  document.getElementById('downloadNotebookPdf')?.addEventListener('click',download);
})();
