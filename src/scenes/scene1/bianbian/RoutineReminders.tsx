import {useEffect,useState} from 'react';
import {TrendSet} from './trendData';
import {routineWindow,reminderCalendar} from './reminderLogic';
export function DailyBrief({data}:{data:TrendSet}){
 const [notice,setNotice]=useState(''),[now,setNow]=useState(()=>new Date()),window=routineWindow(data,now,18);
 useEffect(()=>{const timer=globalThis.setInterval(()=>setNow(new Date()),30000);return()=>globalThis.clearInterval(timer);},[]);
 function add(){const next=routineWindow(data,new Date(),18);if(!next||next.status==='finished'){setNow(new Date());setNotice('今天的参考时段已结束，暂不添加过期提醒。');return;}const url=URL.createObjectURL(new Blob([reminderCalendar(next.at)],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='宝宝换尿布提醒.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('提醒已下载，请添加到日历并开启通知。');}
 return <div className="bv-daily-brief"><p><span className="bv-daily-title">今日密报</span>{window?<>{window.status==='finished'?'今天参考的排便时段已结束，请继续留意尿布情况。':<>根据历史排便规律，预测今天 <strong>{window.start} 点至 {window.end} 点</strong> 宝宝可能排便，注意及时更换尿不湿。</>}<button type="button" className="bv-reminder-inline" onClick={add} disabled={window.status==='finished'}>{window.status==='finished'?'今日时段已结束':'添加换尿布提醒'}</button></>:<>历史记录还不够，先记录宝宝的排便时间吧。</>}</p>{notice&&<p className="bv-daily-notice" role="status">{notice}</p>}</div>;
}
