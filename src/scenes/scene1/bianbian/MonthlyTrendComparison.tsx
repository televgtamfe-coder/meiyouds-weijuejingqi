import {useEffect,useRef,useState} from 'react';
import {MonthComparison,dayShort} from './trendData';
import {monthMetrics,deltaLabel} from './visualTrends';
import {Icon,IconName} from './ui';
import {MonthRelationChart} from './MonthRelationChart';
import {analyzeMonth,MonthReading,monthDays,monthFocus,monthDayObservation} from './monthlyAnalysis';
const icons:IconName[]=['file','info','milk','moon','birthday','user'];
const readings=new Map<string,MonthReading>();
export function MonthlyTrendComparison({data}:{data:MonthComparison}){
 const key=JSON.stringify(data),[selected,setSelected]=useState(()=>monthFocus(data)),[reading,setReading]=useState<MonthReading|null>(()=>readings.get(key)||null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[phase,setPhase]=useState(0),controller=useRef<AbortController|null>(null);
 const {current}=monthDays(data);
 useEffect(()=>{setSelected(monthFocus(data));setReading(readings.get(key)||null);setLoading(false);setError('');return()=>{controller.current?.abort();controller.current=null;};},[key]);
 useEffect(()=>{if(!loading)return;setPhase(0);const timer=window.setInterval(()=>setPhase(p=>Math.min(p+1,3)),6000);return()=>window.clearInterval(timer);},[loading]);
 async function generate(){if(controller.current)return;const request=new AbortController();controller.current=request;setLoading(true);setError('');let timedOut=false;const timer=window.setTimeout(()=>{timedOut=true;request.abort();},75000);
  try{const result=await analyzeMonth(data,request.signal);if(controller.current!==request||request.signal.aborted)return;readings.set(key,result);if(readings.size>3)readings.delete(readings.keys().next().value!);setReading(result);}
  catch(e){if(controller.current===request)setError(request.signal.aborted?(timedOut?'等待较久，请稍后重试。':'已停止解读，月度图表已保留。'):e instanceof Error?e.message:'月度解读暂未完成，请重试。');}
  finally{window.clearTimeout(timer);if(controller.current===request){controller.current=null;setLoading(false);}}
 }
 return <section className="bv-month bm-joint-month" aria-label="月度联合成长分析"><div className="br-section-title"><h2>月度联合成长分析</h2><span className="bt-mock">模拟记录</span></div><p className="bv-month-period">{data.current.label} 对照 {data.previous.label} · 同为前 {data.comparisonDays} 天</p>
 <MonthRelationChart data={data} selected={selected} onSelect={setSelected} linkedDates={reading?.connections.map(c=>c.date)}/>
 <section className="bm-month-day"><label><span>这一天，发生了什么</span><select aria-label="查看月度关联日期" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{current.map((d,i)=><option key={d.date} value={i}>{dayShort(d.date)}</option>)}</select></label><p>{monthDayObservation(data,selected)}</p></section>
 <section className="bm-month-reading" aria-live="polite"><h3><Icon name="spark"/>月度联合解读</h3>{reading&&<><p className="bm-month-takeaway">{reading.summary}</p>{reading.connections.map(c=><div className="bm-month-connection" key={c.date+c.note}><button type="button" onClick={()=>setSelected(current.findIndex(d=>d.date===c.date))} aria-label={`在图中查看${dayShort(c.date)}关联`}>{dayShort(c.date)}<Icon name="next"/></button><p>{c.note}</p></div>)}<p className="bm-month-limit">{reading.limitations.join('；')}</p></>}
 {!reading&&!loading&&<p>结合整月五类记录，查看值得关注的共同变化。</p>}{loading&&<p className="bm-month-loading">{['正在对齐上月与本月的记录范围…','正在对照便便、奶量、睡眠与生长测量…','正在整理变化日期和可核对的依据…','仍在等待月度解读，图表可以继续查看…'][phase]}</p>}{error&&<p className="br-error" role="status">{error}</p>}
 {loading?<button type="button" className="br-text-button" onClick={()=>controller.current?.abort()}>停止月度解读</button>:<button type="button" className={reading?'br-text-button':'br-secondary'} onClick={()=>void generate()}>{reading?'重新生成月度解读':error?'重试月度联合解读':'生成月度联合解读'}</button>}</section>
 <details className="bm-month-metrics"><summary><span>查看月度对比明细</span><Icon name="next"/></summary><div className="bv-month-grid">{monthMetrics(data).map((m,i)=>{const max=Math.max(1,Math.abs(m.previous||0),Math.abs(m.current||0));const color=m.key==='risk'?'#387cb6':'#ed78a2';return <section key={m.key} className="bv-metric"><h3><Icon name={icons[i]}/>{m.label}</h3><strong>{['height','weight'].includes(m.key)?m.current===null?'记录不足':`本月${m.current>=0?'增长':'减少'} ${Math.abs(m.current)} ${m.unit}`:deltaLabel(m.previous,m.current,m.unit)}</strong><svg viewBox="0 0 148 72" role="img" aria-label={`${m.label}：上月${m.previous??'记录不足'}${m.unit}，本月${m.current??'记录不足'}${m.unit}`}><text x="0" y="17" fontSize="10" fill="#999">上月</text><text x="148" y="17" textAnchor="end" fontSize="12" fill="#777">{m.previous===null?'未记录':m.previous+' '+m.unit}</text><rect x="0" y="24" width={m.previous===null?0:Math.abs(m.previous)/max*148} height="6" rx="3" fill="#dcdce7"/><text x="0" y="51" fontSize="10" fill="#999">本月</text><text x="148" y="51" textAnchor="end" fontSize="12" fill={color}>{m.current===null?'未记录':m.current+' '+m.unit}</text><rect x="0" y="58" width={m.current===null?0:Math.abs(m.current)/max*148} height="6" rx="3" fill={color}/></svg></section>;})}</div></details>
 </section>;
}
