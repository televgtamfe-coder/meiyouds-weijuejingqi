import {TrendSet,dayShort,dayRisk,trendRisks} from './trendData';
import {focusDay,relationTracks,highlightedDays} from './visualTrends';
export function TrendComparisonChart({data}:{data:TrendSet}){
 const selected=focusDay(data),tracks=relationTracks(data),highlighted=highlightedDays(data);
 const x=(i:number)=>44+i*42;
 return <section className="bc-comparison bv-relations" aria-label="七天同日变化对照">
  <svg className="bc-comparison-chart" viewBox="0 0 320 334" role="img" aria-label="七天便便、奶量、睡眠三行对照图；每行使用自己的单位和刻度，共用日期列">
   {highlighted.map(i=><rect key={data.days[i].date} data-highlight-date={data.days[i].date} x={x(i)-17} y="2" width="34" height="306" rx="8" fill={i===selected?'#ffe8bd':'#fff4df'}/>)}
   <rect x={x(selected)-17} y="2" width="34" height="306" rx="8" fill="none" stroke="#d8aa65" strokeWidth="1" strokeDasharray="3 3"/>
   {tracks.map((s,k)=>{const top=28+k*100,bottom=top+56,y=(v:number)=>bottom-(v-s.min)/(s.max-s.min)*44;return <g key={s.key}><text x="0" y={top-12} fontSize="11" fill={s.color}>{s.label} · {s.unit}</text><text x="0" y={top+14} fontSize="9" fill="#aaa">{s.max}</text><text x="0" y={bottom+3} fontSize="9" fill="#aaa">{s.min}</text><line x1="30" x2="310" y1={bottom} y2={bottom} stroke="#eeeef2"/>{s.key==='stool'?s.values.map((v,i)=><rect key={i} x={x(i)-8} y={y(v)} width="16" height={bottom-y(v)} rx="4" fill={trendRisks[dayRisk(data.days[i])].color} opacity=".75"/>):<polyline points={s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round"/>}{s.values.map((v,i)=><g key={i}>{s.key!=='stool'&&<circle cx={x(i)} cy={y(v)} r="3" fill="white" stroke={s.color} strokeWidth="1.5"/>}<text x={x(i)} y={y(v)-8} textAnchor="middle" fontSize="9" fill={i===selected?s.color:'#888'}>{v}</text></g>)}</g>;})}
   {data.days.map((d,i)=><text key={d.date} x={x(i)} y="327" textAnchor="middle" fontSize="9" fill={i===selected?'#ad722d':'#999'}>{dayShort(d.date)}</text>)}
  </svg>

 </section>;
}
