import {formatReportText,reportDesignVariables} from './reportDesign';
import {reportRegularity} from './reportRegularity';
import {deepAnalysisSections} from './deepAnalysis';
import {missingRiskMessage,riskQuantity} from './riskObservations';
import {displayCopy} from './presentationCopy';
import {reportContext,appearanceConclusion,observationConclusion,referenceParagraphs,riskObservations,observationTrendConclusion,indicatorDetails,riskObservationConclusion,conclusionSegments,overviewConclusion} from './reportSummary';
import {riskPresentation} from './riskPresentation';
import {importantActions} from './importantActions';
import {StoolWeekChart} from './TrendCharts';
import { SavedReport,recordTimestamp,riskLabels } from './records';
import { referenceSources } from './referenceSources';
import { Icon } from './ui';
export function BianbianReport({record,onShare,onDoctor,onEdit,notice,jointLoading,jointError,onJoint,onCancelJoint,saving}:{record:SavedReport;onShare:()=>void;onDoctor?:()=>void; jointLoading:boolean;jointError:string;onJoint:()=>void;onCancelJoint:()=>void;saving:boolean;onEdit:()=>void;notice?:string;}) {
 record=displayCopy(record);
 const r=record.report;
 return <><div className="br-scroll br-report-scroll">

  {notice&&<p className="br-error" role="status">{notice}</p>}
  <ReportContent record={record} jointLoading={jointLoading} jointError={jointError} onJoint={onJoint} onCancelJoint={onCancelJoint} onEdit={onEdit}/>
 </div></>;

}

export function ReportContent({record,conclusionText,showSampleLabel=false,showRegularity=true,showTimestamp=true,jointLoading=false,jointError='',onJoint=()=>{},onCancelJoint=()=>{},onEdit=()=>{}}:{record:SavedReport;conclusionText?:string;showSampleLabel?:boolean;showRegularity?:boolean;showTimestamp?:boolean;jointLoading?:boolean;jointError?:string;onJoint?:()=>void;onCancelJoint?:()=>void;onEdit?:()=>void}){
 record=displayCopy(record);
 const r=record.report;
 const conclusion=conclusionText??overviewConclusion(record);
 return (  <article className="br-report-paper" style={reportDesignVariables}>
   {showTimestamp&&<div className="br-report-meta bs-report-meta"><time dateTime={record.createdAt}>{recordTimestamp(record.createdAt)}</time></div>}
   {['red','orange'].includes(r.risk)&&<p className="bt-priority-alert" role="alert">{r.risk==='red'?'请优先联系医生，不要等待进一步分析。':'请优先咨询医生，结合宝宝实际状态评估。'}</p>}

   <section className={`br-summary bs-observation-summary bs-observation-v19 br-risk-${r.risk}`} aria-label="本次分析结论" style={{'--observation-color':riskPresentation[r.risk].color,'--observation-background':riskPresentation[r.risk].background} as import('react').CSSProperties}>
    <div className="bs-observation-result"><h3 className="bs-risk-heading">{riskLabels[r.risk]}</h3><p>{conclusionSegments(formatReportText(conclusion)).map((part,i)=>part.strong?<strong key={i}>{part.text}</strong>:<span key={i}>{part.text}</span>)}</p></div>
    </section>{showSampleLabel&&<div className="be-sample-flow-label" aria-hidden="true">示例数据</div>}<section className="br-report-section bs-important-indicators bs-observation-v19"><h3>重要指标解读</h3><div className="bs-observation-facts">{indicatorDetails(record).map(f=><div key={f.label}><p className="bs-observation-fact"><span>{f.label}</span><strong>{formatReportText(f.value)}</strong></p>{f.description&&f.description!==f.value&&<p className="bs-observation-description">{formatReportText(f.description)}</p>}</div>)}</div>
     <div className="bs-risk-observations" aria-label="风险观察"><div>{riskObservations(record).filter(item=>riskQuantity(item.value)).map(item=><span className={`bs-risk-observation bs-risk-observation-${item.state}`} key={item.label}><span>{item.label}</span><strong title={item.value}>{riskQuantity(item.value)}</strong></span>)}</div>{missingRiskMessage(r)&&<p className="br-support">{missingRiskMessage(r)}</p>}</div>
   </section>
   {r.question&&<section className="br-report-section"><h3>可补充的信息</h3><p>{r.question}</p><button className="br-text-button" type="button" onClick={onEdit}>补充信息<Icon name="next"/></button></section>}
   <section className="br-report-section bv-actions"><h3>行动建议</h3>{importantActions(record).map((a,i)=><div className="bt-plan" key={i}><span>{i+1}</span><div><h4>{a.title}</h4><p>{formatReportText(a.action)}</p></div></div>)}</section>
   <section className="br-report-section bs-reference"><h3>深度分析</h3><div className="br-deep-sections">{deepAnalysisSections(record).map((s,i)=><section className="br-deep-item" key={s.title}><h4><span aria-hidden="true">{i+1}</span>{s.title}</h4>{s.paragraphs.map((text,j)=><p key={j}>{formatReportText(text)}</p>)}</section>)}</div></section>
   {showRegularity&&<StoolWeekChart data={reportRegularity(record)} compact/>}
   <section className="br-report-section br-sources"><h3><Icon name="book"/>育儿参考资料</h3>{referenceSources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>)}</section>
   <p className="br-report-disclaimer">如宝宝出现不适，请及时咨询医生。</p>
  </article>);
}
