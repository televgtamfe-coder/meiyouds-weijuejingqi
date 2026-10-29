/* 只生成模拟记录，身体年龄计算仍调用原后端。原始会话不写入。 */
(()=>{'use strict';const button=document.getElementById('simulate-cycle');if(!button)return;
const result=document.getElementById('simulation-result'),detail=document.getElementById('simulation-detail'),json=document.getElementById('simulation-json');
const keys=['B','Y','L','PsyDaily','Udaily'];let snapshotRevision;
function dateAt(today,offset){const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
button.onclick=async()=>{button.disabled=true;detail.hidden=true;result.textContent='正在生成并计算模拟周期…';try{
 const state=window.AlgorithmUI?.getState();if(!state)throw new Error('数据尚未加载，请稍后重试。');
 const recent=[...state.records].sort((a,b)=>b.date.localeCompare(a.date))[0];
 if(!recent||keys.some(k=>!Number.isInteger(recent.scores[k])))throw new Error('请先完整填写最近一天的五项评分，再模拟周期。');
 const daily=Array.from({length:56},(_,i)=>({date:dateAt(state.today,i-55),scores:{...recent.scores}}));
 const windows={baseline:{id:'sim-baseline',start:dateAt(state.today,-55),end:dateAt(state.today,-28)},current:{id:'sim-current',start:dateAt(state.today,-27),end:state.today}};
 const output={simulation:true,can_publish:false,source_date:recent.date,source_revision:state.revision,assumption:'当前五项评分保持不变，重复56天；不推断病情改善，不复制设备测量次数',windows,daily_records:daily,raw_inputs:state.raw_inputs,device_measurements_repeated:false};
 if(state.request){const request=structuredClone(state.request);request.daily_records=daily;request.baseline=windows.baseline;request.current=windows.current;request.as_of=state.today;output.evaluation=await window.AlgorithmUI.previewCycle(request);
  const age=output.evaluation.current_result;
  result.textContent=age?`模拟完成：56天，基线及本期各28个有效日。最终模拟身体年龄 ${age.display} 岁。两期症状相同，症状变化贡献为0。仅为当前数据保持不变的试算，不是预测。`:`模拟周期已补齐，仍未生成年龄：${output.evaluation.reason_codes.join('、')}。这是规则或数据条件缺失，不是记录天数不足。`;
 }else{output.evaluation=state.raw_analysis||{status:'blocked',reason_codes:['BASE_RULES_UNAVAILABLE'],current_result:null};output.symptom_change_assumption={G_sym:0,reason:'两个周期使用相同的完整评分'};
  result.textContent='模拟周期已补齐：基线28天＋本期28天，各28个有效日；两期症状相同，症状变化贡献为0。最终身体年龄暂不可用：症状匹配年龄、月经周期年龄、设备参考曲线及质量转换规则仍待补齐，增加记录天数不能替代这些规则。';
 }
 if(window.AlgorithmUI.getState().revision!==state.revision)throw new Error('输入在模拟期间已更新，请重新模拟。');
 snapshotRevision=state.revision;json.textContent=JSON.stringify(output,null,2);detail.hidden=false;
 }catch(e){result.textContent=e.message;}finally{button.disabled=false;}};
setInterval(()=>{if(snapshotRevision!==undefined&&window.AlgorithmUI?.getState()?.revision!==snapshotRevision){result.textContent='当前数据已修改，请重新模拟完整周期。';detail.hidden=true;snapshotRevision=undefined;}},500);
})();
