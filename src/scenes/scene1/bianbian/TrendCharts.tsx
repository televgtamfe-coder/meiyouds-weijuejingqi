import {reportDayLabel,reportHourLabel} from './reportDesign';
import {MonthlyTrendComparison} from './MonthlyTrendComparison';
import {useState} from 'react';
import {TrendSet,dayRisk,dayShort,stoolColors,trendRisks,trendRiskLabels} from './trendData';
import {Icon} from './ui';
export function StoolWeekChart({data,compact=false}:{data:TrendSet;compact?:boolean}){
 const [selected,setSelected]=useState(6);const day=data.days[selected]||data.days[6];
 const width=280,top=8,bottom=152,step=width/7;
 const total=data.days.reduce((n,d)=>n+d.stools.length,0);
 return <section className={`bt-stool-card ${compact?'is-compact':''}`} aria-label="便便规律性解读">
  <div className="bt-chart-heading"><h2>便便规律性解读{data.source==='mock'&&<span className="br-chart-sample">示例</span>}</h2><strong>{total}<small>次</small></strong><p>{data.source==='mock'?'7 天示例记录 · 时间、次数与风险等级':'近 7 天照片分析记录的时间、次数与风险等级'}</p></div>
  <div className="bt-plot"><div className="bt-y-axis" aria-hidden="true">{[24,18,12,6,0].map(hour=><span key={hour}>{reportHourLabel(hour)}</span>)}</div>
  <svg className="bt-stool-chart" viewBox="0 0 280 160" preserveAspectRatio="none" role="img" aria-label={`七天便便记录，共${total}次，每列显示时间、次数和风险等级，绿色低风险、蓝色需要关注、红色建议就医`}>
   {[24,18,12,6,0].map(hour=>{const y=bottom-hour/24*(bottom-top);return <line key={hour} x1="0" y1={y} x2={width} y2={y} stroke="#e9e9ee" strokeDasharray="3 3"/>;})}
   {data.days.map((d,i)=>{const x=(i+.5)*step;return <g key={d.date}>
    {i===selected&&<rect x={x-step/2+2} y={top-6} width={step-4} height={bottom-top+12} fill="#ff4d88" opacity=".04" rx="6"/>}
    {d.stools.map((e,j)=>{const [h,m]=e.time.split(':').map(Number);return <rect key={j} x={x-8} y={bottom-(h+m/60)/24*(bottom-top)-3} width="16" height="6" rx="3" fill={trendRisks[e.risk].color} data-stool-risk={e.risk}><title>{`${dayShort(d.date)} ${e.time} · ${trendRiskLabels[e.risk]} · 原始便色：${stoolColors[e.color].label}`}</title></rect>;})}
   </g>;})}
  </svg></div>
  <div className="bt-day-labels">{data.days.map(d=><div key={d.date}><time dateTime={d.date}>{reportDayLabel(d.date)}</time><span>{d.stools.length?`${d.stools.length} 次`:'—'}</span><i style={{background:d.stools.length?trendRisks[dayRisk(d)].color:'#999'}} aria-label={d.stools.length?trendRiskLabels[dayRisk(d)]:'未记录'}/></div>)}</div>
  <div className="bt-color-legend bt-risk-legend">{(['low','watch','high'] as const).map(risk=><span key={risk}><i style={{background:trendRisks[risk].color}}/>{trendRiskLabels[risk]}</span>)}</div>
  <div className="bt-selected-day"><select aria-label="查看某日便便记录" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.days.map((d,i)=><option key={d.date} value={i}>{reportDayLabel(d.date)} 详情</option>)}</select><strong style={{color:day.stools.length?trendRisks[dayRisk(day)].color:'#666'}}>{day.stools.length?trendRiskLabels[dayRisk(day)]:'未记录'}</strong><p aria-live="polite">{day.stools.map(e=>`${e.time} ${stoolColors[e.color].label} · ${trendRiskLabels[e.risk]}`).join('；')||'当天暂无照片分析记录'}</p></div>

 </section>;
}
export function TrendDashboard({data}:{data:TrendSet}){

 return <div className="bt-dashboard"><StoolWeekChart data={data}/>{data.months&&<MonthlyTrendComparison data={data.months}/>}
 </div>;
}
