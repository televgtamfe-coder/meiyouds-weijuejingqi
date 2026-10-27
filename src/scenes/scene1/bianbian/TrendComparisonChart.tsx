import {useState} from 'react';
import {TrendSet,dayShort} from './trendData';
import {focusDay,relationTracks,dayChanges} from './visualTrends';
export function TrendComparisonChart({data}:{data:TrendSet}){
 const [selected,setSelected]=useState(()=>focusDay(data)),tracks=relationTracks(data),day=data.days[selected],changes=dayChanges(data,selected);
 const x=(i:number)=>44+i*42;
 return <section className="bc-comparison bv-relations" aria-label="七天同日变化对照"><div className="bc-comparison-heading"><h3>同一天，发生了什么</h3><span className="bt-mock">7 天模拟</span></div><p className="bc-comparison-sub">沿同一日期向下看，对照便便、奶量和睡眠</p>
  <svg className="bc-comparison-chart" viewBox="0 0 320 334" role="img" aria-label="七天便便、奶量、睡眠三行对照图；每行使用自己的单位和刻度，共用日期列">
   <rect x={x(selected)-17} y="2" width="34" height="306" rx="8" fill="#fff0dc"/>
   {tracks.map((s,k)=>{const top=28+k*100,bottom=top+56,y=(v:number)=>bottom-(v-s.min)/(s.max-s.min)*44;return <g key={s.key}><text x="0" y={top-12} fontSize="11" fill={s.color}>{s.label} · {s.unit}</text><text x="0" y={top+14} fontSize="9" fill="#aaa">{s.max}</text><text x="0" y={bottom+3} fontSize="9" fill="#aaa">{s.min}</text><line x1="30" x2="310" y1={bottom} y2={bottom} stroke="#eeeef2"/>{s.key==='stool'?s.values.map((v,i)=><rect key={i} x={x(i)-8} y={y(v)} width="16" height={bottom-y(v)} rx="4" fill={data.days[i].stools.some(e=>e.risk==='watch'||e.risk==='high')?'#dba152':s.color} opacity=".75"/>):<polyline points={s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round"/>}{s.values.map((v,i)=><g key={i}>{s.key!=='stool'&&<circle cx={x(i)} cy={y(v)} r="3" fill="white" stroke={s.color} strokeWidth="1.5"/>}<text x={x(i)} y={y(v)-8} textAnchor="middle" fontSize="9" fill={i===selected?s.color:'#888'}>{v}</text></g>)}</g>;})}
   {data.days.map((d,i)=><text key={d.date} x={x(i)} y="327" textAnchor="middle" fontSize="9" fill={i===selected?'#ad722d':'#999'}>{dayShort(d.date)}</text>)}
  </svg>
  <div className="bv-day-observation"><label><span>同日变化提醒</span><select aria-label="查看同日变化" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.days.map((d,i)=><option key={d.date} value={i}>{dayShort(d.date)}</option>)}</select></label><div>{changes.map(s=><p key={s.key}><span>{s.label}</span><strong>{s.value}<small>{s.unit}</small></strong><em>{s.change}</em></p>)}</div><p className="bv-day-caption">{day.stools.some(s=>s.risk==='watch'||s.risk==='high')?'这一天有便便关注标记，奶量和睡眠的同期变化也值得一起留意。':'对照这一天的三类记录，留意它们是否一起发生变化。'}</p></div><p className="bc-comparison-note">三行刻度各不相同，只对照同一天的变化。共同变化提示可能关联，不代表因果或喂养过量。</p>
 </section>;
}
