import {useState} from 'react';
import {MonthComparison,MonthTrend,monthComparisonSummary} from './trendData';
import {comparisonSeries,comparisonScale} from './trendComparison';
function MonthChart({month,title,scale}:{month:MonthTrend;title:string;scale:{min:number;max:number}}){
 const series=comparisonSeries(month,true),x=(i:number)=>38+i*8.8,y=(v:number)=>150-(v-scale.min)/(scale.max-scale.min)*126;
 return <section className="bc-month-card"><div className="bc-month-title"><h3>{title}<span>{month.label}</span></h3><small>1 日至 {month.days.length} 日</small></div><svg viewBox="0 0 320 185" className="bc-month-chart" role="img" aria-label={`${title}${month.label}身高、体重、饮食、睡眠、便便五条变化曲线`}>
  {[scale.max,0,scale.min].map(v=><g key={v}><line x1="38" y1={y(v)} x2="302" y2={y(v)} stroke="#e8e8ef" strokeDasharray="3 3"/><text x="0" y={y(v)+3} fontSize="9" fill="#999">{v>0?'+':''}{v}%</text></g>)}
  {month.days.length<31&&<rect x={x(month.days.length-1)+3} y="18" width={Math.max(0,302-x(month.days.length-1)-3)} height="138" fill="#f5f5f8"/>}
  {series.map(s=>{const pts=s.changes.map((v,i)=>v===null?null:{x:x(i),y:y(v)}).filter((p):p is {x:number;y:number}=>p!==null);return <g key={s.key}><polyline points={pts.map(p=>`${p.x},${p.y}`).join(' ')} stroke={s.color} strokeWidth="1.8" strokeDasharray={s.dash||undefined} strokeLinejoin="round" fill="none"/>{(s.key==='height'||s.key==='weight')&&pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill="white" stroke={s.color} strokeWidth="1.3"/>)}</g>;})}
  {[1,5,10,15,20,25,31].map(d=><text key={d} x={x(d-1)} y="177" fontSize="9" textAnchor="middle" fill="#999">{d}日</text>)}
 </svg></section>;
}
export function MonthlyTrendComparison({data}:{data:MonthComparison}){
 const first=comparisonScale(data.previous,true),second=comparisonScale(data.current,true),scale={min:Math.min(first.min,second.min),max:Math.max(first.max,second.max)};
 const [day,setDay]=useState(data.comparisonDays-1),summary=monthComparisonSummary(data),series=comparisonSeries(data.current,true);
 return <section className="bc-month-comparison" aria-label="上月与本月综合趋势"><div className="bc-month-intro"><p>身高、体重、饮食、睡眠、便便，一起看</p><span className="bt-mock">模拟记录</span></div>
  <div className="bc-month-legend">{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.key==='feeding'?'饮食':s.key==='sleep'?'睡眠':s.key==='stool'?'便便':s.label}</span>)}</div><p className="bc-month-axis-note">相对各月首个有效记录的变化 · 两图刻度一致</p>
  <MonthChart month={data.previous} title="上月" scale={scale}/><MonthChart month={data.current} title="本月" scale={scale}/>
  <div className="bc-month-summary"><span>同为前 {summary.comparisonDays} 天</span><div><p>便便总次数<strong>{summary.previous.stoolTotal}<small> → </small>{summary.current.stoolTotal}<em>次</em></strong></p><p>日均已记录奶量<strong>{summary.previous.milkAverage}<small> → </small>{summary.current.milkAverage}<em>ml</em></strong></p><p>日均睡眠<strong>{summary.previous.sleepAverage}<small> → </small>{summary.current.sleepAverage}<em>小时</em></strong></p></div></div>
  <details className="bc-fold bc-month-data"><summary><span>查看同一天的原始记录</span><span>展开</span></summary><label>对照日期<select aria-label="月度趋势查看日期" value={day} onChange={e=>setDay(Number(e.target.value))}>{Array.from({length:data.comparisonDays},(_,i)=><option value={i} key={i}>{i+1} 日</option>)}</select></label><table><thead><tr><th>指标</th><th>上月</th><th>本月</th></tr></thead><tbody>{series.map((s,i)=>{const prev=comparisonSeries(data.previous,true)[i];return <tr key={s.key}><th>{s.label}</th><td>{prev.values[day]===null?'未测量':`${prev.values[day]} ${s.unit}`}</td><td>{s.values[day]===null?'未测量':`${s.values[day]} ${s.unit}`}</td></tr>;})}</tbody></table></details>
  <p className="bc-comparison-note">身高体重虚线连接实际记录点，未测量日不补数；本月空白处尚无记录。奶量不含未量化亲喂，曲线用于对照变化，不判断生长是否达标。</p>
 </section>;
}
