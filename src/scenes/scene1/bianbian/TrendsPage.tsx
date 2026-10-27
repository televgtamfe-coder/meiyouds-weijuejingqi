import {JointAnalysis,domainLabels} from './trendAnalysis';
import {TrendSet} from './trendData';
import {StoolWeekChart} from './TrendCharts';
import {Icon} from './ui';
export function JointAnalysisContent({analysis}:{analysis:JointAnalysis}){
 return <div className="bt-joint-content"><section className="bt-joint-summary"><div><Icon name="spark"/><span>四维联合观察</span><span className="bt-mock">模拟数据</span></div><h2>{analysis.summary}</h2><p>置信度低：仅用于演示，不能判断真实宝宝的健康情况。</p></section><div className="bt-domain-grid">{analysis.domains.map(d=><section key={d.key}><h3>{domainLabels[d.key]}</h3><p>{d.observation}</p><small>{d.relation}</small></section>)}</div><section className="bt-white-card"><h3>这些变化有什么联系？</h3>{analysis.relationships.map((text,i)=><div className="bt-relation" key={i}><span>{i+1}</span><p>{text}</p></div>)}</section><section className="bt-white-card"><h3>接下来可以怎么做</h3>{analysis.plan.map((p,i)=><div className="bt-plan" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{p.title}</h4><p>{p.action}</p></div></div>)}</section><section className="bt-limits"><h3>这份分析的边界</h3><ul>{analysis.limitations.map((l,i)=><li key={i}>{l}</li>)}</ul>{analysis.alert&&<p>{analysis.alert}</p>}</section></div>;
}
export function JointStatus({loading,error,onRetry,onCancel}:{loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <section className="bt-joint-status" aria-live="polite"><span className="bt-status-icon"><Icon name="spark"/></span><h3>{loading?'正在结合四类记录观察':error?'联合分析暂未完成':'查看四类趋势之间的联系'}</h3><p>{loading?'正在整理便便、身高体重、饮食与睡眠信息。':error||'基于当前模拟记录生成联合观察与建议。'}</p>{loading?<><div className="br-loading-progress"/><button type="button" className="br-text-button" onClick={onCancel}>停止联合分析</button></>:<button type="button" className="br-secondary" onClick={onRetry}>{error?'重新生成联合分析':'生成联合分析'}</button>}</section>;
}
export function TrendsPage({data,analysis,loading,error,onRetry,onCancel}:{data:TrendSet;analysis:JointAnalysis|null;loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <div className="br-scroll bt-joint-page"><p className="bt-data-banner">正在查看 7 天模拟记录，结果仅用于流程演示</p><StoolWeekChart data={data} compact/>{analysis?<JointAnalysisContent analysis={analysis}/>:<JointStatus loading={loading} error={error} onRetry={onRetry} onCancel={onCancel}/>}</div>;
}
