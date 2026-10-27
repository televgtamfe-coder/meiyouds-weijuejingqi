import {useState} from 'react';
import {DayTrend,TrendSet,dayRisk,dayShort,stoolColors,trendRisks} from './trendData';
import {Icon} from './ui';
export function StoolWeekChart({data,compact=false}:{data:TrendSet;compact?:boolean}){
 const [selected,setSelected]=useState(6);const day=data.days[selected]||data.days[6];
 const width=320,left=28,right=8,top=18,bottom=162,step=(width-left-right)/7;
 const total=data.days.reduce((n,d)=>n+d.stools.length,0);
 const colours=[...new Set(data.days.flatMap(d=>d.stools.map(s=>s.color)))];
 return <section className={`bt-stool-card ${compact?'is-compact':''}`} aria-label="近7天便便规律">
  <div className="bt-chart-heading"><div><h2>近 7 天便便规律<span className="bt-mock">模拟</span></h2><p>每天的时间、次数、颜色与风险</p></div><strong>{total}<small>次</small></strong></div>
  <svg className="bt-stool-chart" viewBox="0 0 320 224" role="img" aria-label={`七天模拟便便记录，共${total}次，每列显示时间、次数、颜色和风险等级`}>
   {[24,18,12,6,0].map(hour=>{const y=bottom-hour/24*(bottom-top);return <g key={hour}><line x1={left} y1={y} x2={width-right} y2={y} stroke="#e9e9ee" strokeDasharray="3 3"/><text x="0" y={y+3} fontSize="9" fill="#999">{hour}时</text></g>;})}
   {data.days.map((d,i)=>{const x=left+(i+.5)*step,risk=trendRisks[dayRisk(d)];return <g key={d.date}>
    {i===selected&&<rect x={x-step/2+2} y={top-6} width={step-4} height={bottom-top+12} fill="#ff4d88" opacity=".04" rx="6"/>}
    {d.stools.map((e,j)=>{const [h,m]=e.time.split(':').map(Number);return <rect key={j} x={x-8} y={bottom-(h+m/60)/24*(bottom-top)-3} width="16" height="6" rx="3" fill={stoolColors[e.color].fill}/>;})}
    <text x={x} y="181" textAnchor="middle" fontSize="9" fill="#999">{dayShort(d.date)}</text><text x={x} y="197" textAnchor="middle" fontSize="11" fill="#323232">{d.stools.length}次</text><circle cx={x-9} cy="212" r="2.5" fill={risk.color}/><text x={x+3} y="215" textAnchor="middle" fontSize="8.5" fill={risk.color}>{risk.label}</text>
   </g>;})}
  </svg>
  <div className="bt-color-legend">{colours.map(c=><span key={c}><i style={{background:stoolColors[c].fill}}/>{stoolColors[c].label}</span>)}<span className="bt-risk-note">下排为风险等级</span></div>
  {!compact&&<div className="bt-selected-day"><select aria-label="查看某日便便记录" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.days.map((d,i)=><option key={d.date} value={i}>{dayShort(d.date)} 详情</option>)}</select><p>{day.stools.map(e=>`${e.time} ${stoolColors[e.color].label}`).join(' · ')}</p></div>}
  <p className="bt-chart-footnote">模拟风险为独立标记，不能仅凭颜色判断健康。</p>
 </section>;
}
function LineChart({values,max,min=0,color,label}:{values:(number|null)[];min?:number;max:number;color:string;label:string}){
 const pts=values.map((v,i)=>v===null?null:{x:24+i*18.7,y:62-(v-min)/(max-min)*46,v}).filter((v):v is {x:number;y:number;v:number}=>v!==null);
 return <svg viewBox="0 0 144 82" className="bt-line-chart" role="img" aria-label={label}>
  {[0,1].map(i=><g key={i}><line x1="24" y1={16+i*46} x2="138" y2={16+i*46} stroke="#eeeef2"/><text x="0" y={19+i*46} fontSize="8" fill="#aaa">{i?min:max}</text></g>)}
  <polyline points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeDasharray={pts.length<7?'4 3':undefined}/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke={color} strokeWidth="1.5"/>)}<text x="24" y="79" fontSize="8" fill="#aaa">第1天</text><text x="138" y="79" textAnchor="end" fontSize="8" fill="#aaa">第7天</text>
 </svg>;
}
export function TrendDashboard({data,onAnalyze,analyzing=false,hasAnalysis=false}:{data:TrendSet;onAnalyze:()=>void;analyzing?:boolean;hasAnalysis?:boolean}){
 const last=data.days[6];const heights=data.days.map(d=>d.heightCm),weights=data.days.map(d=>d.weightKg);
 return <div className="bt-dashboard"><div className="br-section-title bt-dashboard-title"><h2>成长趋势</h2><span className="bt-mock">7 天模拟记录</span></div><StoolWeekChart data={data}/>
  <section className="bt-growth-card"><div className="bt-card-title"><h3>身高体重变化</h3><span>仅 2 次测量</span></div><div className="bt-growth-grid"><div><span>身高 · cm</span><strong>{last.heightCm}<small>cm</small></strong><LineChart values={heights} min={62} max={65} color="#a790bb" label="身高模拟测量，两次分别63.2和63.4厘米，其余日期未测"/></div><div><span>体重 · kg</span><strong>{last.weightKg}<small>kg</small></strong><LineChart values={weights} min={6.5} max={7.2} color="#dca166" label="体重模拟测量，两次分别6.8和6.9千克，其余日期未测"/></div></div><p className="bt-chart-footnote">虚线连接两次测量，不代表每天都测量；不能据此判断生长是否达标。</p></section>
  <div className="bt-trend-pair"><section className="bt-mini-card"><div className="bt-card-title"><h3>饮食变化</h3><Icon name="milk"/></div><strong>{last.loggedMilkMl}<small>ml</small></strong><p>今日已记录奶量</p><LineChart values={data.days.map(d=>d.loggedMilkMl)} max={1000} color="#e5a16d" label="7天已记录奶量，依次为780、800、790、760、710、750、780毫升"/><span className="bt-chart-footnote">不含未量化亲喂</span></section><section className="bt-mini-card"><div className="bt-card-title"><h3>睡眠变化</h3><Icon name="moon"/></div><strong>{last.sleepHours}<small>小时</small></strong><p>今日睡眠 · 夜醒 {last.nightWakings} 次</p><LineChart values={data.days.map(d=>d.sleepHours)} max={16} color="#899fd1" label="7天睡眠模拟记录，依次14、14.5、14、13.5、12.5、13.5、14小时"/><span className="bt-chart-footnote">仅展示模拟记录</span></section></div>
  <section className="bt-joint-entry"><div className="bt-joint-entry-heading"><span><Icon name="spark"/></span><div><h3>把四种变化，一起看</h3><p>便便 · 身高体重 · 饮食 · 睡眠</p></div></div><button type="button" className="br-primary" onClick={onAnalyze} disabled={analyzing}>{analyzing?'正在联合分析…':hasAnalysis?'查看联合分析':'智能联合分析'}</button><p className="bt-chart-footnote">使用模拟记录生成观察与建议，不作为真实健康判断。</p></section>
 </div>;
}
