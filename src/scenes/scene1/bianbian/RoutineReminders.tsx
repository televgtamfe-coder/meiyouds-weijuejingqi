import {useState} from 'react';
import {TrendSet} from './trendData';
import {routineWindow,feedingReminder,reminderCalendar} from './reminderLogic';
export function RoutineReminders({data}:{data:TrendSet}){
 const [notice,setNotice]=useState(''),window=routineWindow(data),feeding=feedingReminder(data);
 function add(){if(!window)return;const url=URL.createObjectURL(new Blob([reminderCalendar(window.at)],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='宝宝换尿布提醒.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('提醒文件已下载，请在手机或电脑日历中导入并确认通知。');}
 return <section className="bv-routine"><div className="br-section-title"><h2>智能提醒</h2><span className="bt-mock">模拟记录</span></div>{window?<div className="bv-routine-time"><span>历史常见排便时段</span><strong>{window.label}</strong><p>过去 {window.days} 天中，有 {window.count} 天在这个时段记录过排便。下次也可能在这一时段，留意宝宝的小变化。</p><button type="button" className="br-secondary" onClick={add}>添加换尿布提醒</button><small>时间估计置信度低，仅作参考。发现排便后及时更换，不必等到提醒时间。</small></div>:<p>当前记录不足或已过期，暂不估计下次排便时段。</p>}{feeding&&<div className="bv-routine-feeding"><h3>{feeding.title}</h3><p>{feeding.body}</p><p>{feeding.attention}</p><small>瓶喂记录不含未量化亲喂；模拟提醒不代表宝宝实际状态。若腹部明显胀硬、伴呕吐或精神差，请及时就医。</small></div>}{notice&&<p role="status">{notice}</p>}<a href="https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-challenges/constipation-and-bottle-feeding/" target="_blank" rel="noreferrer">提醒参考：婴儿排便与不适表现</a></section>;
}

