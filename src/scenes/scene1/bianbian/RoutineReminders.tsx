import {useEffect,useState} from 'react';
import {TrendSet} from './trendData';
import {routineWindow,reminderCalendar} from './reminderLogic';
export function RoutineReminders({data}:{data:TrendSet}){
 const [notice,setNotice]=useState(''),[now,setNow]=useState(()=>new Date()),window=routineWindow(data,now);
 useEffect(()=>{const timer=globalThis.setInterval(()=>setNow(new Date()),30000);return()=>globalThis.clearInterval(timer);},[]);
 function add(){const next=routineWindow(data,new Date());if(!next||next.status==='finished'){setNow(new Date());setNotice('今天的参考时段已结束，暂不添加过期提醒。');return;}const url=URL.createObjectURL(new Blob([reminderCalendar(next.at)],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='宝宝换尿布提醒.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('提醒文件已下载，请在手机或电脑日历中导入并确认通知。');}
 return <section className="bv-routine bv-routine-compact"><div className="br-section-title"><h2>智能提醒</h2><span className="bt-mock">模拟记录</span></div>{window?<div className="bv-routine-time"><span>根据历史排便记录，预测今天的排便时间</span><div className="bv-prediction-row"><strong>{window.label}</strong><button type="button" className="br-secondary" onClick={add} disabled={window.status==='finished'}>{window.status==='finished'?'时段已结束':'添加换尿布提醒'}</button></div><p className="bv-prediction-evidence">近 {window.days} 天中有 {window.count} 天在此时段排便{window.status==='current'?'，现在可以留意尿布情况。':window.status==='finished'?'，今日参考时段已结束。':'，今天可留意这个时段。'}</p></div>:<p>历史记录不足或已过期，暂不能预测今天的排便时段。</p>}{notice&&<p role="status">{notice}</p>}</section>;
}
