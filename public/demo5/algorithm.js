/* 所有年龄和评分由Python返回。这里只收集输入并展示输出。 */
(() => {
  'use strict';
  const page=document.body.dataset.algorithmPage;
  const fields=[['B','躯体状态','潮热之外的身体状态和功能受影响程度'],['Y','具体症状困扰','当天最困扰的围绝经相关症状'],['L','睡眠困扰','入睡、夜醒、早醒或恢复感带来的困扰'],['PsyDaily','心理状态','情绪、焦虑、易怒或精力受影响程度'],['Udaily','泌尿生殖困扰','干涩、性生活或排尿相关困扰，可暂不填写']];
  const routes={home:'meiyou-menopause-home.html',daily:'meiyou-menopause-daily-check.html',analysis:'meiyou-menopause-analysis.html',body:'meiyou-menopause-body-age.html',record:'meiyou-menopause-record.html',plan:'meiyou-menopause-todolist.html',debug:'algorithm-debug.html'};
  const labels={SYMPTOM_AGE_MAPPING_UNAVAILABLE:'原始数据已接收，年龄转换规则待补齐',RAW_FIELDS_ONLY:'只接受原始测量与来源信息，不接受年龄差或评分结论',RAW_SOURCE_REQUIRED:'请填写设备品牌、型号、版本和测量方法',INVALID_RAW_VALUE:'原始测量值或单位不符合格式要求',INVALID_DATE:'日期无效，请检查生日、测量日期和有效期',INVALID_AGE:'年龄输入须在0至130岁之间',INVALID_AGE_DELTA:'设备年龄差须在-12至8岁之间',INVALID_QUALITY:'设备质量子分须为0至1',INVALID_LAMBDA:'收缩系数须为0至0.35，无设备时须为0',MISSING_REQUIRED_FIELD:'请补齐必填输入',INVALID_REQUEST:'输入格式不正确，请检查后重试',INSUFFICIENT_DAYS:'记录不足',WINDOW_INCOMPLETE:'窗口尚未完成',S_AGE_RULE_UNAVAILABLE:'基础规则未齐',M_RULE_UNAVAILABLE:'基础规则未齐',SAFETY_HOLD:'暂停评估',SOURCE_CHANGED:'数据来源变化',DEVICE_DATA_UNAVAILABLE:'设备数据暂不可用',BASE_RULES_UNAVAILABLE:'基础规则未齐',LAMBDA_RULE_UNAVAILABLE:'设备组合规则未齐'};
  let state=null,token='',draft={},busy=false,unsaved=false;
  const el=id=>document.getElementById(id);
  const text=(id,value)=>{if(el(id))el(id).textContent=value;};
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(value,digits=1)=>value===null||value===undefined?'待补充':Number(value).toFixed(digits).replace(/\.0$/,'');
  const signed=value=>{const s=String(value);return Number(value)>0?'+'+s:s;};
  const statusOf=s=>s.report_status==='research_only'?'研究试算 · 非正式评估':s.report_status==='stale'?'记录已更新，报告待更新':s.report_status==='collecting'?'正在积累记录':labels[s.evaluation?.reason_codes?.[0]]||'暂不能评估';
  function error(message){if(!state){text('home-record-state','加载未完成，请点击上方重试');text('home-report-state','等待计算环境就绪');text('daily-complete','加载未完成，请重试');}el('algorithm-error').hidden=false;text('algorithm-error-text',message);}
  function clearError(){el('algorithm-error').hidden=true;}
  async function request(url,body){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),120000);
    try{
      const response=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:body?{'Content-Type':'application/json','X-CSRF-Token':token}:{},body:body?JSON.stringify(body):undefined});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error==='REVISION_CONFLICT'?'记录已在其他页面更新，请刷新后重新填写。':labels[data.error]||`操作未完成（${data.error||response.status}）`);
      if(data.csrf_token)token=data.csrf_token;
      return data;
    }finally{clearTimeout(timer);}
  }
  async function action(fn){
    if(busy)return;busy=true;clearError();
    document.querySelectorAll('[data-action],#save-daily,#load-scenario,#run-input,#record-date,#scenario,#debug-input,[data-score]').forEach(b=>b.disabled=true);
    try{await fn();}catch(e){error(e.name==='AbortError'?'连接超时，填写内容仍保留，请重试。':e.message==='Failed to fetch'?'无法连接本地算法服务，请检查服务后重试。':e.message);}
    finally{busy=false;document.querySelectorAll('[data-action],#save-daily,#load-scenario,#run-input,#record-date,#scenario,#debug-input,[data-score]').forEach(b=>b.disabled=false);}
  }
  function renderScores(){
    const list=el('algorithm-score-list');if(!list)return;
    list.innerHTML=fields.map(([key,title,copy])=>`<fieldset class="alg-score-field" data-score-field="${key}" aria-label="${title}"><div class="alg-field-title"><span>${title}</span><span class="alg-field-state">${draft[key]===null||draft[key]===undefined?'未填写':draft[key]+' / 6'}</span></div><p class="alg-copy">${copy}</p><div class="alg-scale">${[0,1,2,3,4,5,6].map(v=>`<button type="button" data-score="${v}" aria-label="${title} ${v}分" aria-pressed="${draft[key]===v}">${v}</button>`).join('')}</div><div class="alg-ends"><span>0 没有困扰</span><span>6 困扰最重</span></div>${key==='Udaily'?'<button class="alg-skip" type="button" id="edit-urinary-concerns">补充泌尿生殖困扰</button>':''}${key==='L'?'<button class="alg-skip" type="button" id="edit-sleep-concerns">补充昨晚困扰</button>':''}<button class="alg-skip" type="button" data-score="null">${key==='Udaily'?'暂不填写':'清除本项'}</button></fieldset>`).join('');
  }
  function renderDaily(){
    if(!el('algorithm-score-list'))return;
    draft={...state.daily.scores};renderScores();
    text('daily-total',fmt(state.daily.body_score));
    text('daily-complete',`${state.daily.answered}/5 项已填写`);
    text('daily-date-label',state.selected_date);
    if(el('record-date')){el('record-date').max=state.today;el('record-date').value=state.selected_date;}
  }
  function renderHome(){
    text('home-vitality-score',fmt(state.daily.body_score));
    text('home-record-state',`${state.daily.answered}/5 项已填写`);
    text('home-report-state',statusOf(state));
    text('home-report-value',state.result?state.result.display+' 岁':'暂不显示年龄');
    text('home-report-copy',state.result?'模型试算结果来自当前合成数据。查看各项贡献及限制。':'日记录可继续保存；完整年龄仍需合格窗口及基础规则。');
  }
  function renderBody(){
    const r=state.result;
    text('body-status',statusOf(state));text('body-age-value',r?r.display:'暂不可用');
    el('body-age-value')?.parentElement.classList.toggle('is-empty',!r);
    if(el('body-age-unit'))el('body-age-unit').hidden=!r;
    text('body-age-gap',r?`未舍入结果相对实际年龄差 ${signed(r.age_gap_display)} 岁`:'没有用演示数字代替缺失结果');
    text('body-period-delta','暂无可比的上期完整报告');
    text('body-actual-age',r?fmt(r.C)+'岁':'未形成完整评估');
    text('body-valid-days',state.windows.current?`${state.windows.current.valid_days}/28天`:'正在积累');
    text('body-confidence','模型尚未完成有效性验证');
    text('body-window',state.request?`${state.request.current.start} 至 ${state.request.current.end}`:'尚未建立正式评估窗口');
    const holder=el('contribution-list');
    if(holder){
      const c=r?state.evaluation?.contributions:null;
      const rows=c?[['基础年龄相对实际年龄',c.base_offset,'基础组成，并非干预效果'],['心肺贡献',c.device_offsets.CR,'合成参考年龄差，经权重及λ缩放'],['体成分贡献',c.device_offsets.BC,'合成参考年龄差，经权重及λ缩放'],['运动功能贡献',c.device_offsets.FUNCTION,'未纳入时不以0代表健康状态'],['症状持续变化',c.symptom_offset,'两个合格28天窗口比较后的模型贡献'],['展示边界调整',c.display_clip_adjustment,'模型显示限制，不是健康变化']]:[];
      holder.innerHTML=rows.length?rows.map(([name,value,description])=>`<details class="alg-factor-detail"><summary class="alg-factor"><span>${name}</span><b>${value===undefined?'未纳入':escape(signed(value))+' 岁'}</b></summary><p class="alg-copy">${description}</p></details>`).join(''):'<p class="alg-copy">当前结果不可用，暂不拆分年龄贡献。步数、睡眠打卡或运动次数不会直接兑换年龄。</p>';
      text('body-raw',r?`未舍入结果 ${r.raw} 岁；分项相对实际年龄合计 ${signed(c.raw_gap)} 岁。`:'');
    }
    text('last-result-note',state.last_result?`上次试算为 ${state.last_result.display} 岁，仅作历史参考；本次记录保存没有自动改龄。`:'');
    document.querySelectorAll('[data-action="evaluate"]').forEach(b=>{b.hidden=!state.request;});
  }
  function renderAnalysis(){
    const value=document.querySelector('.body-age-entry-value');if(!value)return;
    value.textContent=state.result?state.result.display+' 岁':'暂不可用';
    document.querySelector('.body-age-entry-delta').textContent=state.result?`未舍入结果年龄差 ${signed(state.result.age_gap_display)} 岁`:statusOf(state);
    document.querySelector('.body-age-entry-confidence').textContent='研究模型 · 未验证';
    text('analysis-updated',state.request?'截止 '+state.request.as_of:'尚无周期报告');
    text('analysis-record-count',`${state.records.length} 天有记录；是否完整另行校验。`);
  }
  function renderRecords(){
    const holder=el('record-list');if(!holder)return;
    holder.innerHTML=state.records.length?`<table class="alg-table"><thead><tr><th>记录日期</th><th>填写</th><th>操作</th></tr></thead><tbody>${[...state.records].reverse().map(row=>`<tr><td>${escape(row.date)}</td><td>${Object.values(row.scores).filter(v=>v!==null).length}/5 项</td><td><a href="${routes.daily}?date=${encodeURIComponent(row.date)}">查看/修改</a></td></tr>`).join('')}</tbody></table>`:'<p class="alg-copy">暂无记录。未填写不是0分。</p>';
  }
  function renderPlan(){
    text('plan-daily-state',state.daily.complete?'今天五项已完整保存':`今天已填写 ${state.daily.answered}/5 项`);
    text('plan-window-state',state.windows.current?`${state.windows.current.valid_days}个有效日 / 28天窗口`:'尚未建立完整周期');
  }
  function renderDebug(result){
    if(!el('debug-result'))return;
    const ev=result||state.evaluation;
    const current=result?result.current_result:state.result;
    text('debug-status',result?(result.status==='research_only'?'研究试算 · 非正式评估':labels[result.reason_codes?.[0]]||'输入被阻断'):statusOf(state));
    text('debug-result',current?`未舍入 ${current.raw} 岁；显示 ${current.display} 岁；can_publish=false`:'当前无完整结果，可载入合成测试场景。');
    if(!result)text('debug-preview-note',state.report_status==='stale'?'下方输出与轨迹是上次计算，当前记录已改变，须重新计算。':'');
    if(!result)el('debug-input').value=state.request?JSON.stringify(state.request,null,2):'';
    text('debug-output',JSON.stringify(ev||{status:'collecting',current_result:null},null,2));
    el('debug-trace').innerHTML=(ev?.trace||[]).map((step,i)=>`<details class="debug-step"><summary>${i+1}. ${escape(step.module_id)} · ${escape(step.status)} → ${escape(step.downstream.join(' / ')||'结果')}</summary><p class="alg-note">输入</p><pre class="debug-pre">${escape(JSON.stringify(step.input,null,2))}</pre><p class="alg-note">输出</p><pre class="debug-pre">${escape(JSON.stringify(step.output,null,2))}</pre></details>`).join('');
  }
  function render(){renderDaily();renderHome();renderBody();renderAnalysis();renderRecords();renderPlan();renderDebug();}
  async function load(){await action(async()=>{const day=new URLSearchParams(location.search).get('date');state=await request('/api/state'+(day?'?date='+encodeURIComponent(day):''));render();});}
  document.addEventListener('click',event=>{
    const score=event.target.closest('[data-score]');
    if(score&&!busy){const key=score.closest('[data-score-field]').dataset.scoreField;draft[key]=score.dataset.score==='null'?null:Number(score.dataset.score);unsaved=true;const selected=score.dataset.score;renderScores();document.querySelector(`[data-score-field="${key}"] [data-score="${selected}"]`)?.focus();text('save-status','正在自动保存…');saveDaily(key==='L'&&Number(selected)>=4,key==='Udaily'&&Number(selected)>=4);return;}
    const target=event.target.closest('[data-action]');if(!target)return;
    if(target.dataset.action==='retry'){if(unsaved)saveDaily();else load();}
    if(target.dataset.action==='evaluate')action(async()=>{state=await request('/api/evaluate',{});render();});
  });
  function saveDaily(promptSleep=false,promptUrinary=false){return action(async()=>{
    state=await request('/api/daily',{date:state.selected_date,scores:draft,revision:state.revision});unsaved=false;render();
    if(promptSleep===true)window.dispatchEvent(new CustomEvent('sleep-concern-prompt'));
    if(promptUrinary===true)window.dispatchEvent(new CustomEvent('urinary-concern-prompt'));
    text('save-status',state.daily.complete?'已自动保存。每日记录不会直接改变身体年龄。':'已自动保存部分记录，尚未生成当日总分。');
  });}
  el('save-daily')?.addEventListener('click',saveDaily);
  el('record-date')?.addEventListener('change',()=>action(async()=>{
    if(unsaved){el('record-date').value=state.selected_date;throw new Error('请先保存当前修改，再切换日期。');}
    try{state=await request('/api/state?date='+encodeURIComponent(el('record-date').value));render();}finally{el('record-date').value=state.selected_date;}
  }));
  el('load-scenario')?.addEventListener('click',()=>action(async()=>{state=await request('/api/scenario',{name:el('scenario').value});render();}));
  el('run-input')?.addEventListener('click',()=>action(async()=>{text('debug-status','输入待校验');text('debug-result','本次输入尚未成功计算');text('debug-output','');el('debug-trace').innerHTML='';text('debug-preview-note','独立试算结果尚未生成，其他页面会话不变。');let data;try{data=JSON.parse(el('debug-input').value);}catch{throw new Error('输入不是有效JSON，请检查后重试。');}const result=await request('/api/evaluate-request',{request:data});renderDebug(result);text('debug-preview-note','此结果为独立输入试算，未替换当前页面会话。');}));
  el('back')?.addEventListener('click',()=>{
    const origin=new URLSearchParams(location.search).get('from');
    const fallback={body:'analysis',analysis:'record',daily:'plan',plan:'home',record:'home'};
    const dest=Object.hasOwn(routes,origin)?origin:(fallback[page]||'home');
    location.href=routes[dest];
  });
  el('body-age-entry')?.addEventListener('click',()=>{location.href=routes.body;});
  window.addEventListener('beforeunload',event=>{if(unsaved){event.preventDefault();event.returnValue='';}});
  window.AlgorithmUI={getState:()=>state,saveUrinary:async(day,concerns,revision)=>{state=await request('/api/urinary-concerns',{date:day,concerns,revision});render();return state;},saveSleep:async(day,concerns,revision)=>{state=await request('/api/sleep-concerns',{date:day,concerns,revision});render();return state;},previewCycle:async r=>{if(busy||unsaved)throw new Error("请等待记录保存完成后再模拟。");return request("/api/evaluate-request",{request:r});},applyInputs:async(inputs,revision)=>{
    if(busy||unsaved)throw new Error('请等待日记录保存完成后再提交资料。');
    state=await request('/api/inputs',{inputs,revision});render();return state;
  }};
  load();
})();
