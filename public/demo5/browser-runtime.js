/* Static-host transport. The original Python formulas remain unchanged. */
(() => {
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const base=new URL('.',document.currentScript.src);
  const key='demo5-research-session-v1:'+base.pathname;
  let ready,queue=Promise.resolve(),storageAvailable=true;
  function bounded(promise,signal){return new Promise((resolve,reject)=>{const abort=()=>reject(new DOMException('计算环境加载超时，请点击重试','AbortError'));if(signal?.aborted)return abort();signal?.addEventListener('abort',abort,{once:true});Promise.resolve(promise).then(resolve,reject).finally(()=>signal?.removeEventListener('abort',abort));});}
  const notice=message=>{const el=document.getElementById('runtime-status');if(el)el.textContent=message;};
  function loadScript(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error('计算环境加载失败，请检查网络后刷新重试'));document.head.append(s);});}
  async function init(){
    const signal=AbortSignal.timeout(45000);
    const runtimeURL=new URL('vendor/pyodide/',base).href;
    notice('正在加载计算环境，首次需下载约14 MB，最长等待45秒…');
    await bounded(loadScript(runtimeURL+'pyodide.js'),signal);
    const py=await bounded(loadPyodide({indexURL:runtimeURL}),signal);
    notice('计算环境已加载，正在准备算法和记录…');
    const manifestResponse=await nativeFetch(new URL('python/manifest.json',base),{signal});
    if(!manifestResponse.ok)throw new Error('计算文件清单加载失败');
    const files=await manifestResponse.json();
    await Promise.all(files.map(async file=>{
      const response=await nativeFetch(new URL('python/'+file,base),{signal});
      if(!response.ok)throw new Error('计算文件加载失败：'+file);
      const path='/home/pyodide/'+file;py.FS.mkdirTree(path.slice(0,path.lastIndexOf('/')));
      py.FS.writeFile(path,await response.text(),{encoding:'utf8'});
    }));
    await py.runPythonAsync('import importlib\nimportlib.invalidate_caches()\nimport browser_bridge');
    try{
      const snapshot=sessionStorage.getItem(key);
      if(snapshot){py.globals.set('_saved_demo5',snapshot);try{py.runPython('browser_bridge.restore(_saved_demo5)');}catch(e){throw new Error('测试记录无法恢复，请清除此标签页的会话数据后重试');}finally{py.globals.delete('_saved_demo5');}}
    }catch(e){if(e.name==='SecurityError'){storageAvailable=false;}else throw e;}
    notice(storageAvailable?'计算环境已就绪 · 仅供模拟测试 · 记录仅保留在当前标签页':'计算环境已就绪 · 浏览器禁止存储，离开页面将丢失测试记录');
    return py;
  }
  window.fetch=(input,options={})=>{
    const url=new URL(typeof input==='string'?input:input.url,location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return nativeFetch(input,options);
    const operation=queue.then(async()=>{
      if(!ready)ready=init().catch(e=>{ready=null;notice(e.name==='AbortError'?'加载超时，请点击重试；已保存记录不会清除':e.message);throw e;});
      const py=await bounded(ready,options.signal);
      if(options.signal?.aborted)throw new DOMException('请求超时，请重试','AbortError');
      const d=new Date(),today=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      py.globals.set('_demo5_args',JSON.stringify([url.pathname,options.method||'GET',options.body||'',url.searchParams.get('date')||'',today]));
      let result;
      try{result=JSON.parse(py.runPython('browser_bridge.dispatch(*json.loads(_demo5_args))'.replace('json.loads','browser_bridge.json.loads')));}finally{py.globals.delete('_demo5_args');}
      if(result.status===200&&storageAvailable){try{sessionStorage.setItem(key,py.runPython('browser_bridge.export()'));}catch(e){storageAvailable=false;notice('当前计算已完成，但记录无法保存，离开页面将丢失测试记录');}}
      return new Response(JSON.stringify(result.data),{status:result.status,headers:{'Content-Type':'application/json'}});
    });
    queue=operation.catch(()=>{});
    return operation;
  };
})();
