import {riskPresentation} from './riskPresentation';
import {importantActions} from './importantActions';
import {StoolWeekChart} from './TrendCharts';
import {JointAnalysisContent,JointStatus} from './TrendsPage';
import { SavedReport,recordTimestamp,riskLabels } from './records';
import { referenceSources } from './referenceSources';
import { Icon } from './ui';
export function BianbianReport({record,onPhoto,onShare,onDoctor,onEdit,notice,canEdit,jointLoading,jointError,onJoint,onCancelJoint,saving}:{record:SavedReport;onPhoto:()=>void;onShare:()=>void;onDoctor:()=>void; jointLoading:boolean;jointError:string;onJoint:()=>void;onCancelJoint:()=>void;saving:boolean;onEdit:()=>void;notice?:string;canEdit:boolean}) {
 const r=record.report,color=r.facts.find(f=>f.label==='颜色'),texture=r.facts.find(f=>f.label==='性状');
 const appearance=[{label:'颜色',fact:color},{label:'性状',fact:texture}];
 const hasAppearanceDetail=appearance.some(({fact})=>fact?.detail||fact?.comparison);
 return <><div className="br-scroll br-report-scroll">
  {record.demo&&<p className="br-demo-note">示例报告 · 未分析真实照片，不代表健康结论</p>}
  {notice&&<p className="br-error" role="status">{notice}</p>}
  <article className="br-report-paper"><div className="br-report-brand">美柚 · 宝宝成长观察</div>
   <div className="br-report-meta"><div><h2>{record.babyName||'宝宝'}</h2><p>{recordTimestamp(record.createdAt)}</p></div><span className={`br-risk-badge br-risk-${r.risk}`}>{riskLabels[r.risk]}</span></div><p className="br-report-classification">照片观察与背景分析 · 观察状态不代表诊断{r.risk==='unknown'?' · 当前信息不足':''}</p>
   {['red','orange'].includes(r.risk)&&<p className="bt-priority-alert" role="alert">{r.risk==='red'?'请优先联系医生，不要等待进一步分析。':'请优先咨询医生，结合宝宝实际状态评估。'}</p>}
   {record.trendSnapshot&&<StoolWeekChart data={record.trendSnapshot} compact/>}
   <section className={`br-summary br-summary-compact br-risk-${r.risk}`}><div className="br-summary-heading"><h3>观察总结</h3><span>{riskLabels[r.risk]}</span></div><h2>{r.summary}</h2>{r.risk==='red'&&<strong className="br-urgent">请优先联系医生，不要等待再次拍照或 AI 分析。</strong>}{r.risk==='orange'&&<strong className="br-urgent">请优先咨询医生，结合宝宝的实际状态评估。</strong>}{r.detail&&<details className="br-summary-details" open><summary><span>查看完整分析依据</span><Icon name="next"/></summary><p>{r.detail}</p></details>}</section>
   <section className="br-report-section br-appearance br-appearance-compact"><h3>01 颜色与性状</h3><div className="br-appearance-grid">{appearance.map(({label,fact})=><div className="br-appearance-item" key={label}><h4>{label}</h4><strong className="br-fact-main">{fact?.value||'暂无描述'}</strong></div>)}</div>{hasAppearanceDetail&&<details className="br-appearance-details" open><summary><span>查看观察细节</span><Icon name="next"/></summary>{appearance.filter(({fact})=>fact?.detail||fact?.comparison).map(({label,fact})=><div key={label}><h4>{label}说明</h4>{fact?.detail&&<p>{fact.detail}</p>}{fact?.comparison&&<p>{fact.comparison}</p>}</div>)}</details>}</section>
   <section className="br-report-section"><h3>02 参考解读</h3>{r.cause&&<div className="br-insight"><span><Icon name="plus"/></span><p><strong>综合观察：</strong>{r.cause}</p></div>}{r.evidence.map((e,i)=><div className="br-insight" key={i}><span><Icon name="plus"/></span><p><strong>分析依据：</strong>{e}</p></div>)}{r.facts.filter(f=>!['颜色','性状'].includes(f.label)).map(f=><div className="br-insight" key={f.label}><span><Icon name="plus"/></span><p><strong>{f.label}：</strong>{[f.value,f.detail,f.comparison].filter(Boolean).join('；')}</p></div>)}{!r.cause&&!r.evidence.length&&<p>本次未返回进一步解读。</p>}</section>
   {r.question&&<section className="br-report-section"><h3>可补充的信息</h3><p>{r.question}</p><button className="br-text-button" type="button" onClick={onEdit}>补充信息<Icon name="next"/></button></section>}
   {record.trendSnapshot&&<section className="bt-report-joint"><div className="br-section-title"><h2>成长联合分析</h2><span className="bt-mock">独立模拟记录</span></div>{record.jointAnalysis?<JointAnalysisContent analysis={record.jointAnalysis} data={record.trendSnapshot}/>:<JointStatus loading={jointLoading} error={jointError} onRetry={onJoint} onCancel={onCancelJoint}/>}</section>}
   <section className="br-report-section bv-actions"><h3>03 重要行动点</h3>{importantActions(record).map((a,i)=><div className="bt-plan" key={i}><span>{i+1}</span><div><h4>{a.title}</h4><p>{a.action}</p></div></div>)}</section>
   <section className="br-report-section br-sources"><h3><Icon name="book"/>育儿参考资料</h3><p>以下为通用科普资料，不代表本次结果已逐条核对。部分资料为英文。</p>{referenceSources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.title}<span aria-hidden="true">↗</span></a>)}</section>
   <p className="br-report-disclaimer">仅供育儿记录和信息参考。<br/>照片不能单独判断疾病，请结合宝宝状态咨询医生。</p>
  </article><button className="br-text-button br-report-again" type="button" onClick={onEdit}>{record.demo?'开始我的分析':canEdit?'补充信息或再次分析':'再次拍照分析'}<Icon name="next"/></button>
 </div><footer className={`br-action-footer be-report-actions ${riskPresentation[r.risk].doctor?'has-doctor':''}`}>{riskPresentation[r.risk].doctor?<><button type="button" className="br-primary br-doctor-cta" onClick={onDoctor}><Icon name="share"/>分享给医生 · 一键问诊</button><button type="button" className="br-secondary" onClick={onPhoto}>拍照分析</button></>:<><button type="button" className="br-primary" onClick={onPhoto}><Icon name="gallery"/>拍照分析</button><button type="button" className="br-secondary" onClick={onShare}><Icon name="share"/>分享给家人</button></>}</footer></>;
}
