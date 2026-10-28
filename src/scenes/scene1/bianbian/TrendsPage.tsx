import {displayCopy} from './presentationCopy';
import {firstObservationSentence} from './reportSummary';
import {JointAnalysis,domainLabels} from './trendAnalysis';
import {TrendSet} from './trendData';
import {TrendComparisonChart} from './TrendComparisonChart';

import {AnalysisWaiting} from './AnalysisWaiting';
import {Icon} from './ui';
export function JointAnalysisContent({analysis,data,monthly=false}:{analysis:JointAnalysis;data?:TrendSet;monthly?:boolean}){
 analysis=displayCopy(analysis);
 const relationships=[...new Set(analysis.relationships)].filter(x=>x.trim()).slice(0,2);
 return <div className="bt-joint-content bc-concise-joint">
  {data&&<section className="bt-joint-summary"><TrendComparisonChart data={data}/></section>}
  {relationships.length>0&&<section className="bt-white-card bc-connections"><h3>同日变化重点</h3>{relationships.map((text,i)=>{const cleaned=text.trim(),lead=firstObservationSentence(cleaned);return <div className="bt-relation" key={i}><span>{i+1}</span><p><strong>{lead}</strong>{cleaned.slice(lead.length)}</p></div>;})}</section>}
  <details className="bc-fold bc-domain-details"><summary><span>查看分项观察</span><Icon name="next"/></summary><div className="bt-domain-grid">{analysis.domains.filter(d=>d.key!=='growth').map(d=><section key={d.key}><h3>{domainLabels[d.key]}</h3><p>{d.observation}</p><small>{d.relation}</small></section>)}</div></details>
  {analysis.alert&&<p className="bc-joint-boundary">{analysis.alert}</p>}
 </div>;
}
export function JointStatus({loading,error,onRetry,onCancel}:{loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <section className="bt-joint-status" aria-live="polite"><span className="bt-status-icon"><Icon name="spark"/></span><h3>{loading?'正在结合三类记录观察':error?'联合分析暂未完成':'查看三类趋势之间的联系'}</h3>{loading?<AnalysisWaiting kind="joint"/>:<p>{error||'看看便便、奶量和睡眠有哪些共同变化。'}</p>}{loading?<><button type="button" className="br-text-button" onClick={onCancel}>停止联合分析</button></>:<button type="button" className="br-secondary" onClick={onRetry}>{error?'重新生成联合分析':'生成联合分析'}</button>}</section>;
}
export function TrendsPage({data,analysis,loading,error,onRetry,onCancel}:{data:TrendSet;analysis:JointAnalysis|null;loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <div className="br-scroll bt-joint-page"><p className="bt-data-banner">近 7 天记录 · 对照便便、奶量与睡眠</p>{analysis?<JointAnalysisContent analysis={analysis} data={data}/>:<JointStatus loading={loading} error={error} onRetry={onRetry} onCancel={onCancel}/>}</div>;
}
