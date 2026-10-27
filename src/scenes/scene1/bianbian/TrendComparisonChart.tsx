import {useState} from 'react';
import {TrendSet,dayShort} from './trendData';
import {comparisonSeries,comparisonScale} from './trendComparison';
export function TrendComparisonChart({data}:{data:TrendSet}){
 const [selected,setSelected]=useState(6),series=comparisonSeries(data),scale=comparisonScale(data);
 const x=(i:number)=>38+i*44,y=(v:number)=>158-(v-scale.min)/(scale.max-scale.min)*130;
 const points=(values:(number|null)[])=>values.map((v,i)=>v===null?null:{x:x(i),y:y(v),value:v}).filter((v):v is {x:number;y:number;value:number}=>v!==null);
 return <section className="bc-comparison" aria-label="四类变化趋势对照"><div className="bc-comparison-heading"><h3>四类变化，同图对照</h3><span className="bt-mock">7 天模拟</span></div><p className="bc-comparison-sub">近 7 天 · 相对各自起点的变化，不比较数值大小</p>
  <svg className="bc-comparison-chart" viewBox="0 0 320 192" role="img" aria-label="便便次数、体重、已记录奶量与睡眠的相对变化曲线；体重虚线仅连接两次测量">
   {scale.ticks.map(v=><g key={v}><line x1="38" y1={y(v)} x2="302" y2={y(v)} stroke="#ececf1" strokeDasharray="3 3"/><text x="0" y={y(v)+4} fontSize="9" fill="#999">{v>0?'+':''}{v}%</text></g>)}
   <line x1="38" y1={y(0)} x2="302" y2={y(0)} stroke="#d5d5dd" strokeDasharray="3 3"/>
   <line x1={x(selected)} y1="24" x2={x(selected)} y2="164" stroke="#ff4d88" opacity=".16"/>
   {series.map(s=><g key={s.key}><polyline points={points(s.changes).map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash||undefined} strokeLinejoin="round"/>{points(s.changes).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" stroke={s.color} strokeWidth="1.5"/>)}</g>)}
   {data.days.map((d,i)=><text key={d.date} x={x(i)} y="184" textAnchor="middle" fontSize="9" fill="#999">{dayShort(d.date)}</text>)}
  </svg>
  <div className="bc-comparison-values"><label><span>查看原始记录</span><select aria-label="四类趋势查看日期" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.days.map((d,i)=><option key={d.date} value={i}>{dayShort(d.date)}</option>)}</select></label><div>{series.map(s=><span key={s.key}><i style={{background:s.color}}/><span>{s.label}</span><strong>{s.values[selected]===null?'未测量':`${s.values[selected]} ${s.unit}`}</strong></span>)}</div></div>
  <p className="bc-comparison-note">体重虚线只连接两次测量；奶量不含未量化亲喂。曲线同向或反向变化不代表因果关系。</p>
 </section>;
}
