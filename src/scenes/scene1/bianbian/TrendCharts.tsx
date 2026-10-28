import {RoutineReminders} from './RoutineReminders';
import {MonthlyTrendComparison} from './MonthlyTrendComparison';
import {useState} from 'react';
import {TrendSet,dayRisk,dayShort,stoolColors,trendRisks,trendRiskLabels} from './trendData';
import {Icon} from './ui';
export function StoolWeekChart({data,compact=false}:{data:TrendSet;compact?:boolean}){
 const [selected,setSelected]=useState(6);const day=data.days[selected]||data.days[6];
 const width=320,left=28,right=8,top=18,bottom=162,step=(width-left-right)/7;
 const total=data.days.reduce((n,d)=>n+d.stools.length,0);
 return <section className={`bt-stool-card ${compact?'is-compact':''}`} aria-label="近7天便便规律">
  <div className="bt-chart-heading"><div><h2>近 7 天便便规律<span className="bt-mock">模拟</span></h2><p>每天的时间、次数与风险等级</p></div><strong>{total}<small>次</small></strong></div>
  <svg className="bt-stool-chart" viewBox="0 0 320 224" role="img" aria-label={`七天模拟便便记录，共${total}次，每列显示时间、次数和风险等级，绿色健康、蓝色需要关注、红色建议就医`}>
   {[24,18,12,6,0].map(hour=>{const y=bottom-hour/24*(bottom-top);return <g key={hour}><line x1={left} y1={y} x2={width-right} y2={y} stroke="#e9e9ee" strokeDasharray="3 3"/><text x="0" y={y+3} fontSize="9" fill="#999">{hour}时</text></g>;})}
   {data.days.map((d,i)=>{const x=left+(i+.5)*step,risk=trendRisks[dayRisk(d)];return <g key={d.date}>
    {i===selected&&<rect x={x-step/2+2} y={top-6} width={step-4} height={bottom-top+12} fill="#ff4d88" opacity=".04" rx="6"/>}
    {d.stools.map((e,j)=>{const [h,m]=e.time.split(':').map(Number);return <rect key={j} x={x-8} y={bottom-(h+m/60)/24*(bottom-top)-3} width="16" height="6" rx="3" fill={trendRisks[e.risk].color} data-stool-risk={e.risk}><title>{`${dayShort(d.date)} ${e.time} · ${trendRiskLabels[e.risk]} · 原始便色：${stoolColors[e.color].label}`}</title></rect>;})}
    <text x={x} y="181" textAnchor="middle" fontSize="9" fill="#999">{dayShort(d.date)}</text><text x={x} y="197" textAnchor="middle" fontSize="11" fill="#323232">{d.stools.length}次</text><circle cx={x-9} cy="212" r="2.5" fill={risk.color}/><text x={x+3} y="215" textAnchor="middle" fontSize="8.5" fill={risk.color}>{risk.label}</text>
   </g>;})}
  </svg>
  <div className="bt-color-legend bt-risk-legend">{(['low','watch','high'] as const).map(risk=><span key={risk}><i style={{background:trendRisks[risk].color}}/>{trendRiskLabels[risk]}</span>)}<span className="bt-risk-note">图中颜色代表风险等级</span></div>
  {!compact&&<div className="bt-selected-day"><select aria-label="查看某日便便记录" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.days.map((d,i)=><option key={d.date} value={i}>{dayShort(d.date)} 详情</option>)}</select><p>{day.stools.map(e=>`${e.time} ${stoolColors[e.color].label} · ${trendRiskLabels[e.risk]}`).join(' · ')}</p></div>}
  <p className="bt-chart-footnote">风险为独立模拟标记，原始便色不用于直接推断风险。</p>
 </section>;
}
export function TrendDashboard({data,onAnalyze,analyzing=false,hasAnalysis=false}:{data:TrendSet;onAnalyze:()=>void;analyzing?:boolean;hasAnalysis?:boolean}){

 return <div className="bt-dashboard"><div className="br-section-title bt-dashboard-title"><h2>宝宝成长趋势</h2><span className="bt-mock">模拟记录</span></div><StoolWeekChart data={data}/><RoutineReminders data={data}/>{data.months&&<MonthlyTrendComparison data={data.months}/>}<section className="bt-joint-entry"><div className="bt-joint-entry-heading"><span><Icon name="spark"/></span><div><h3>联合智能分析</h3><p>对照近七天便便、奶量与睡眠的同日变化</p></div></div><button type="button" className="br-primary" onClick={onAnalyze} disabled={analyzing}>{analyzing?'正在联合分析…':hasAnalysis?'查看联合分析':'智能联合分析'}</button><p className="bt-chart-footnote">使用模拟记录提示可能的关联，不作为真实健康判断。</p></section>
 </div>;
}
