import {reportContext,appearanceConclusion,observationConclusion} from './reportSummary';
import {riskPresentation} from './riskPresentation';
import {importantActions} from './importantActions';
import {StoolWeekChart} from './TrendCharts';
import {JointAnalysisContent,JointStatus} from './TrendsPage';
import { SavedReport,recordTimestamp,riskLabels } from './records';
import { referenceSources } from './referenceSources';
import { Icon } from './ui';
export function BianbianReport({record,onShare,onDoctor,onEdit,notice,jointLoading,jointError,onJoint,onCancelJoint,saving}:{record:SavedReport;onShare:()=>void;onDoctor:()=>void; jointLoading:boolean;jointError:string;onJoint:()=>void;onCancelJoint:()=>void;saving:boolean;onEdit:()=>void;notice?:string;}) {
 const r=record.report;
 return <><div className="br-scroll br-report-scroll">
  {record.demo&&<p className="br-demo-note">示例报告</p>}
  {notice&&<p className="br-error" role="status">{notice}</p>}
  <ReportContent record={record} jointLoading={jointLoading} jointError={jointError} onJoint={onJoint} onCancelJoint={onCancelJoint} onEdit={onEdit}/>
 </div><footer className="br-action-footer bs-share-footer"><button type="button" className={`br-primary ${riskPresentation[r.risk].doctor?'br-doctor-cta':''}`} onClick={riskPresentation[r.risk].doctor?onDoctor:onShare}><Icon name="share"/>{riskPresentation[r.risk].doctor?'分享给医生 · 一键问诊':'分享给家人'}</button></footer></>;

}

export function ReportContent({record,jointLoading=false,jointError='',onJoint=()=>{},onCancelJoint=()=>{},onEdit=()=>{}}:{record:SavedReport;jointLoading?:boolean;jointError?:string;onJoint?:()=>void;onCancelJoint?:()=>void;onEdit?:()=>void}){
 const r=record.report;
 return (  <article className="br-report-paper">
   <div className="br-report-meta bs-report-meta"><time dateTime={record.createdAt}>{recordTimestamp(record.createdAt)}</time><span className={`br-risk-badge br-risk-${r.risk}`}>{riskLabels[r.risk]}</span></div>
   {['red','orange'].includes(r.risk)&&<p className="bt-priority-alert" role="alert">{r.risk==='red'?'请优先联系医生，不要等待进一步分析。':'请优先咨询医生，结合宝宝实际状态评估。'}</p>}

   <section className={`br-summary br-summary-compact bs-short-summary bs-observation-summary br-risk-${r.risk}`} aria-label="观察总结"><div className="br-summary-heading"><h3>观察总结</h3></div><div className="bs-observation-facts">{appearanceConclusion(record).map(f=><div key={f.label}><p className="bs-observation-fact"><span>{f.label}</span><strong>{f.value}</strong></p>{f.description&&f.description!==f.value&&<p className="bs-observation-description">{f.description}</p>}</div>)}</div><div className="bs-observation-result"><h4>观察结论</h4><p>{observationConclusion(record)}</p></div></section>
   {record.trendSnapshot&&<StoolWeekChart data={record.trendSnapshot} compact/>}
   <section className="bt-report-joint bs-joint-unified" aria-label="联合成长分析"><div className="br-section-title"><h2>联合成长分析</h2>{record.trendSnapshot&&<span className="bt-mock">示例数据</span>}</div>   <div className="bs-context bs-context-short bs-joint-context">{reportContext(record).map(x=><p className="bs-context-line" key={x.label}><span>{x.label==='喂养背景'?'喂养':'睡眠'}</span><span><strong>{x.value}</strong>{x.change&&<strong className="bs-key-change">{x.change}</strong>}</span></p>)}</div>
{record.trendSnapshot&&(record.jointAnalysis?<JointAnalysisContent analysis={record.jointAnalysis} data={record.trendSnapshot}/>:<JointStatus loading={jointLoading} error={jointError} onRetry={onJoint} onCancel={onCancelJoint}/>)}</section>
   {r.question&&<section className="br-report-section"><h3>可补充的信息</h3><p>{r.question}</p><button className="br-text-button" type="button" onClick={onEdit}>补充信息<Icon name="next"/></button></section>}
   <section className="br-report-section bv-actions"><h3>行动建议</h3>{importantActions(record).map((a,i)=><div className="bt-plan" key={i}><span>{i+1}</span><div><h4>{a.title}</h4><p>{a.action}</p></div></div>)}</section>
   <section className="br-report-section bs-reference"><h3>参考解读</h3><details className="br-summary-details" open><summary><span>完整分析依据</span><Icon name="next"/></summary>{r.summary&&<p>{r.summary}</p>}{r.detail&&<p>{r.detail}</p>}{r.cause&&r.cause!==r.detail&&<p>{r.cause}</p>}{r.evidence.filter((e,i,all)=>e!==r.detail&&e!==r.cause&&all.indexOf(e)===i).map((e,i)=><p key={i}>{e}</p>)}{r.facts.filter(f=>!['颜色','性状'].includes(f.label)).map(f=><p key={f.label}><strong>{f.label}：</strong>{[f.value,f.detail,f.comparison].filter(Boolean).join('；')}</p>)}</details></section>
   <section className="br-report-section br-sources"><h3><Icon name="book"/>育儿参考资料</h3>{referenceSources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<span aria-hidden="true">↗</span></a>)}</section>
   <p className="br-report-disclaimer">如宝宝出现不适，请及时咨询医生。</p>
  </article>);
}
