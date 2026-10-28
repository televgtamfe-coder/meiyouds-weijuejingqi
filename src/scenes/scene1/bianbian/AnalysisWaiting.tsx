import {useEffect,useState} from 'react';
const copy={
 photo:[['观察照片','观察重点：照片清晰度，以及便便的颜色与性状。'],['结合背景','结合信息：已确认的月龄、喂养方式与近期排便情况。'],['整理建议','报告将包含观察结论、需要关注的变化与下一步建议。']],
 joint:[['对照记录','将便便、奶量和睡眠放在同一日期下对照。'],['梳理联系','重点关注同时出现的变化，区分共同变化与信息不足。'],['整理关联','呈现同一天的变化，突出值得关注的地方。']],
};
export function AnalysisWaiting({kind}:{kind:'photo'|'joint'}){
 const [seconds,setSeconds]=useState(0);
 const phase=Math.floor(seconds/6);
 const milestones=[15,40,65,82,92];
 const progress=Math.round(milestones[phase]+(phase<4?(milestones[phase+1]-milestones[phase])*(seconds%6)/6:0));
 useEffect(()=>{const timer=window.setInterval(()=>setSeconds(n=>Math.min(n+1,24)),1000);return()=>window.clearInterval(timer);},[]);
 const current=Math.min(phase,2);
 return <div className="bc-waiting" role="status" aria-live="polite"><div className="bc-waiting-steps" aria-label="本次分析关注点">{copy[kind].map(([title],i)=><span key={title} className={i===current?'active':''}>{title}</span>)}</div><p>{phase<4?copy[kind][current][1]:'仍在等待分析结果，填写内容已保留。'}</p><div className="bc-waiting-progress"><div><span>{phase<4?'预估进度':'正在等待结果'}</span><strong>{progress}%</strong></div><div className="bc-progress-track" role="progressbar" aria-label="分析预估进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:`${progress}%`}}/></div></div></div>;
}
