import {MonthComparison,dayShort,dayRisk,trendRisks,trendRiskLabels} from './trendData';
import {monthDays,monthTracks,monthHighlights} from './monthlyAnalysis';
export function MonthRelationChart({data,selected,onSelect,linkedDates=[]}:{data:MonthComparison;selected:number;onSelect:(index:number)=>void;linkedDates?:string[]}){
 const {current}=monthDays(data),tracks=monthTracks(data),count=current.length,highlighted=new Set([...monthHighlights(data),...current.flatMap((d,i)=>linkedDates.includes(d.date)?[i]:[])]),x=(i:number)=>count===1?176:42+i*268/(count-1),bar=Math.max(4,Math.min(14,220/count));
 const ticks=[...new Set([0,6,13,20,count-1].filter(i=>i<count))];
 return <div className="bm-month-chart"><div className="bm-month-legend"><span><i/>{data.current.label}</span><span><i/>{data.previous.label}</span><small>同一日对照上下五行</small></div>
 <div className="bm-month-risk-legend"><span>便便柱</span>{(['low','watch','high'] as const).map(risk=><span key={risk}><i style={{background:trendRisks[risk].color}}/>{trendRiskLabels[risk]}</span>)}</div>
 <svg viewBox="0 0 320 496" role="img" aria-label="月度联合关联图，按日期对照本月与上月便便、奶量、睡眠、身高和体重，各行使用独立刻度">
  {[...highlighted].map(i=><rect key={i} data-month-highlight={current[i].date} x={x(i)-bar/2-1} y="4" width={bar+2} height="462" rx="3" fill={i===selected?'#ffe4b0':'#fff5e4'}/>)}
  <line x1={x(selected)} x2={x(selected)} y1="4" y2="466" stroke="#cf9a49" strokeDasharray="3 3"/>
  {tracks.map((t,k)=>{const top=22+k*92,bottom=top+62,y=(v:number)=>bottom-(v-t.min)/(t.max-t.min)*42,fmt=(v:number)=>Number(v.toFixed(t.key==='weight'?1:0));return <g key={t.key} data-month-track={t.key}>
   <text x="0" y={top-4} fontSize="11" fill="#666">{t.label} · {t.unit}</text><text x="310" y={top-4} textAnchor="end" fontSize="11" fill="#bf4972">{t.current[selected]===null?'当日未测量':t.current[selected]+' '+t.unit}</text>
   <text x="0" y={top+22} fontSize="8" fill="#aaa">{fmt(t.max)}</text><text x="0" y={bottom+2} fontSize="8" fill="#aaa">{fmt(t.min)}</text><line x1="32" x2="315" y1={bottom} y2={bottom} stroke="#ededf2"/>
   {[{values:t.previous,color:'#b6b8c4',previous:true},{values:t.current,color:'#ed6d9b',previous:false}].map(s=>{const points=s.values.flatMap((v,i)=>v===null?[]:[{i,v}]);return <g key={s.previous?'previous':'current'}>
    {t.key==='stool'&&!s.previous?s.values.map((v,i)=>v===null?null:<rect key={i} x={x(i)-bar/2} y={y(v)} width={bar} height={bottom-y(v)} rx="2" fill={trendRisks[dayRisk(current[i])].color}/>):<polyline points={points.map(p=>`${x(p.i)},${y(p.v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={s.previous?'1.5':'1.8'} strokeDasharray={t.measure?'3 3':undefined}/>}
    {t.key!=='stool'&&points.map(p=><circle key={p.i} data-measurement={t.measure?`${t.key}-${s.previous?'previous':'current'}`:undefined} cx={x(p.i)} cy={y(p.v)} r={p.i===selected?3: t.measure?2.5:1.2} fill={s.previous?s.color:'white'} stroke={s.color} strokeWidth="1.3"/>)}
   </g>;})}
  </g>;})}
  {ticks.map(i=><text key={i} x={x(i)} y="489" textAnchor="middle" fontSize="9" fill="#999">{i+1}日</text>)}
  {current.map((d,i)=><rect key={d.date} x={x(i)-(count===1?120:134/(count-1))} y="0" width={count===1?240:268/(count-1)} height="470" fill="transparent" onClick={()=>onSelect(i)}><title>{dayShort(d.date)}，点击查看当日五项记录</title></rect>)}
 </svg><p className="bm-month-chart-note">黄底为同步变化或关注日期；便便柱按风险着色。身高、体重仅展示测量点，虚线连接已有记录。</p></div>;
}
