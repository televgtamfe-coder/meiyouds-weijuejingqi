import {JointAnalysis,domainLabels} from './trendAnalysis';
import {TrendSet} from './trendData';
import {TrendComparisonChart} from './TrendComparisonChart';
import {MonthlyTrendComparison} from './MonthlyTrendComparison';
import {AnalysisWaiting} from './AnalysisWaiting';
import {Icon} from './ui';
export function JointAnalysisContent({analysis,data,monthly=false}:{analysis:JointAnalysis;data?:TrendSet;monthly?:boolean}){
 return <div className="bt-joint-content bc-concise-joint">
  <section className="bt-joint-summary"><div><Icon name="spark"/><span>四类变化，一起看</span><span className="bt-mock">模拟数据</span></div><h2>{analysis.summary}</h2>{data?.months&&!monthly&&<p className="bc-comparison-note">结论结合月度同天数对比，下图展示近 7 天变化。</p>}{data&&(monthly&&data.months?<MonthlyTrendComparison data={data.months}/>:<TrendComparisonChart data={data}/>)}</section>
  <section className="bt-white-card bc-connections"><h3>这些变化有什么联系？</h3>{analysis.relationships.map((text,i)=><div className="bt-relation" key={i}><span>{i+1}</span><p>{text}</p></div>)}<div className="bc-next-actions"><h3>接下来，具体这样做</h3>{analysis.plan.map((p,i)=><div className="bt-plan" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{p.title}</h4><p>{p.action}</p></div></div>)}</div></section>
  <details className="bc-fold bc-domain-details"><summary><span>查看分项观察与分析边界</span><Icon name="next"/></summary><div className="bt-domain-grid">{analysis.domains.map(d=><section key={d.key}><h3>{domainLabels[d.key]}</h3><p>{d.observation}</p><small>{d.relation}</small></section>)}</div><ul>{analysis.limitations.map((l,i)=><li key={i}>{l}</li>)}</ul></details>
  <p className="bc-joint-boundary">模拟记录仅用于演示，不能判断真实宝宝健康。{analysis.alert}</p>
 </div>;
}
export function JointStatus({loading,error,onRetry,onCancel}:{loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <section className="bt-joint-status" aria-live="polite"><span className="bt-status-icon"><Icon name="spark"/></span><h3>{loading?'正在结合四类记录观察':error?'联合分析暂未完成':'查看四类趋势之间的联系'}</h3>{loading?<AnalysisWaiting kind="joint"/>:<p>{error||'基于当前模拟记录生成联合观察与建议。'}</p>}{loading?<><div className="br-loading-progress"/><button type="button" className="br-text-button" onClick={onCancel}>停止联合分析</button></>:<button type="button" className="br-secondary" onClick={onRetry}>{error?'重新生成联合分析':'生成联合分析'}</button>}</section>;
}
export function TrendsPage({data,analysis,loading,error,onRetry,onCancel}:{data:TrendSet;analysis:JointAnalysis|null;loading:boolean;error:string;onRetry:()=>void;onCancel:()=>void}){
 return <div className="br-scroll bt-joint-page"><p className="bt-data-banner">基于上月与本月模拟记录，按相同天数对比</p>{analysis?<JointAnalysisContent analysis={analysis} data={data} monthly/>:<JointStatus loading={loading} error={error} onRetry={onRetry} onCancel={onCancel}/>}</div>;
}
