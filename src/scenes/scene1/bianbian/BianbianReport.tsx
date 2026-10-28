import {displayCopy} from './presentationCopy';
import {reportContext,appearanceConclusion,observationConclusion,referenceParagraphs,riskObservations,observationTrendConclusion,indicatorDetails,riskObservationConclusion,conclusionSegments,overviewConclusion} from './reportSummary';
import {riskPresentation} from './riskPresentation';
import {importantActions} from './importantActions';
import {StoolWeekChart} from './TrendCharts';
import {JointAnalysisContent,JointStatus} from './TrendsPage';
import { SavedReport,recordTimestamp,riskLabels } from './records';
import { referenceSources } from './referenceSources';
import { Icon } from './ui';
export function BianbianReport({record,onShare,onDoctor,onEdit,notice,jointLoading,jointError,onJoint,onCancelJoint,saving}:{record:SavedReport;onShare:()=>void;onDoctor:()=>void; jointLoading:boolean;jointError:string;onJoint:()=>void;onCancelJoint:()=>void;saving:boolean;onEdit:()=>void;notice?:string;}) {
 record=displayCopy(record);
 const r=record.report;
 return <><div className="br-scroll br-report-scroll">

  {notice&&<p className="br-error" role="status">{notice}</p>}
  <ReportContent record={record} jointLoading={jointLoading} jointError={jointError} onJoint={onJoint} onCancelJoint={onCancelJoint} onEdit={onEdit}/>
 </div><footer className="br-action-footer bs-share-footer"><button type="button" className={`br-primary ${riskPresentation[r.risk].doctor?'br-doctor-cta':''}`} onClick={riskPresentation[r.risk].doctor?onDoctor:onShare}><Icon name="share"/>{riskPresentation[r.risk].doctor?'分享给医生 · 一键问诊':'分享给家人'}</button></footer></>;

}

export function ReportContent({record,jointLoading=false,jointError='',onJoint=()=>{},onCancelJoint=()=>{},onEdit=()=>{}}:{record:SavedReport;jointLoading?:boolean;jointError?:string;onJoint?:()=>void;onCancelJoint?:()=>void;onEdit?:()=>void}){
 record=displayCopy(record);
 const r=record.report;
 const conclusion=overviewConclusion(record);
 return (  <article className="br-report-paper">
   <div className="br-report-meta bs-report-meta"><time dateTime={record.createdAt}>{recordTimestamp(record.createdAt)}</time><span className={`br-risk-badge br-risk-${r.risk}`}>{riskLabels[r.risk]}</span></div>
   {['red','orange'].includes(r.risk)&&<p className="bt-priority-alert" role="alert">{r.risk==='red'?'请优先联系医生，不要等待进一步分析。':'请优先咨询医生，结合宝宝实际状态评估。'}</p>}

   <section className={`br-summary bs-observation-summary bs-observation-v19 br-risk-${r.risk}`} aria-label="观察总结" style={{'--observation-color':riskPresentation[r.risk].color,'--observation-background':riskPresentation[r.risk].background} as import('react').CSSProperties}>
    <div className="bs-observation-result"><h3>本次观察结论</h3><p>{conclusionSegments(conclusion).map((part,i)=>part.strong?<strong key={i}>{part.text}</strong>:<span key={i}>{part.text}</span>)}</p></div>
    <div className="bs-important-indicators"><h3>重要指标解读</h3><div className="bs-observation-facts">{indicatorDetails(record).map(f=><div key={f.label}><p className="bs-observation-fact"><span>{f.label}</span><strong>{f.value}</strong></p>{f.description&&f.description!==f.value&&<p className="bs-observation-description">{f.description}</p>}</div>)}</div>
     <div className="bs-risk-observations" aria-label="风险观察"><h4>风险观察</h4><div>{riskObservations(record).map(item=><span className={`bs-risk-observation bs-risk-observation-${item.state}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></span>)}</div></div>
    </div>
   </section>
   {record.trendSnapshot&&<StoolWeekChart data={record.trendSnapshot} compact/>}
   <section className="bt-report-joint bs-joint-unified" aria-label="联合成长分析"><div className="br-section-title"><h2>联合成长分析</h2></div>   <div className="bs-context bs-context-short bs-joint-context">{reportContext(record).map(x=><p className="bs-context-line" key={x.label}><span>{x.label==='喂养背景'?'喂养':'睡眠'}</span><span><strong>{x.value}</strong>{x.change&&<strong className="bs-key-change">{x.change}</strong>}</span></p>)}</div>
{record.trendSnapshot&&(record.jointAnalysis?<JointAnalysisContent analysis={record.jointAnalysis} data={record.trendSnapshot}/>:<JointStatus loading={jointLoading} error={jointError} onRetry={onJoint} onCancel={onCancelJoint}/>)}</section>
   {r.question&&<section className="br-report-section"><h3>可补充的信息</h3><p>{r.question}</p><button className="br-text-button" type="button" onClick={onEdit}>补充信息<Icon name="next"/></button></section>}
   <section className="br-report-section bv-actions"><h3>行动建议</h3>{importantActions(record).map((a,i)=><div className="bt-plan" key={i}><span>{i+1}</span><div><h4>{a.title}</h4><p>{a.action}</p></div></div>)}</section>
   <section className="br-report-section bs-reference"><h3>参考解读</h3><details className="br-summary-details" open><summary><span>完整分析依据</span><Icon name="next"/></summary>{referenceParagraphs(record).map((text,i)=><p key={i}>{text}</p>)}{r.facts.filter(f=>!['颜色','性状'].includes(f.label)).map(f=><p key={f.label}><strong>{f.label}：</strong>{[f.value,f.detail,f.comparison].filter(Boolean).join('；')}</p>)}</details></section>
   <section className="br-report-section br-sources"><h3><Icon name="book"/>育儿参考资料</h3>{referenceSources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<span aria-hidden="true">↗</span></a>)}</section>
   <p className="br-report-disclaimer">如宝宝出现不适，请及时咨询医生。</p>
  </article>);
}
