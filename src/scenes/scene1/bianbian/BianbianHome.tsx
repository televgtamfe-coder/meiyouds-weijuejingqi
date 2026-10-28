import {DailyBrief} from './RoutineReminders';
import {riskPresentation} from './riskPresentation';
import {historyMonthDay} from './mockHistory';
import {TrendSet} from './trendData';
import {TrendDashboard} from './TrendCharts';
import { BabyProfile,allergyTag,feedingOptions } from './babyProfile';
import { SavedReport,riskLabels } from './records';
import { Icon } from './ui';
export function BianbianHome({profile,records,onEdit,onPhoto,onHistory,onRecord,trends}:{profile:BabyProfile;records:SavedReport[];onEdit:(section?:'feeding'|'allergies'|'formula')=>void;onPhoto:()=>void;onHistory:()=>void;onRecord:(record:SavedReport)=>void;trends:TrendSet}) {
 return <div className="br-scroll br-home">
  <section className="br-baby-card">
   <div className="br-baby-tags"><button type="button" aria-label="修改喂养方式" onClick={()=>onEdit('feeding')}><Icon name="mixed"/><span>{feedingOptions.find(([v])=>v===profile.feeding)?.[1]}</span><Icon name="edit"/></button><button type="button" aria-label="修改过敏原" onClick={()=>onEdit('allergies')}><Icon name="none"/><span title={allergyTag(profile)}>{allergyTag(profile)}</span><Icon name="edit"/></button>{['mixed','pure_formula'].includes(profile.feeding)&&profile.formula.trim()&&<button type="button" className="br-formula-tag" aria-label="修改奶粉品牌" onClick={()=>onEdit('formula')}><Icon name="milk"/><span title={profile.formula.trim()}>{profile.formula.trim()}</span><Icon name="edit"/></button>}</div>
  <DailyBrief data={trends}/></section>
  <section className="br-history-preview"><div className="br-section-title"><h2>历史报告</h2><div className="bv-history-tools"><button type="button" aria-label="添加一次便便记录" onClick={onPhoto}><Icon name="plus"/></button><button type="button" aria-label="查看全部历史报告" onClick={onHistory}><Icon name="next"/></button></div></div>
   <div className="br-history-strip">{records.slice(0,3).map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)}/>)}</div>
  </section>
  <TrendDashboard data={trends}/>
 </div>;
}
export function BianbianHistory({records,onRecord,onPhoto}:{records:SavedReport[];onRecord:(r:SavedReport)=>void;onPhoto:()=>void}) {
 return <div className="br-scroll br-history"><p className="br-support">重要报告请及时保存。</p>{records.length?records.map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)}/>):<div className="br-empty"><Icon name="file"/><h2>还没有分析记录</h2><p>添加一张照片，记录宝宝的便便变化。</p><button type="button" className="br-primary" onClick={onPhoto}>添加第一条记录</button></div>}</div>;
}

function HistoryCard({record:r,onClick}:{record:SavedReport;onClick:()=>void}){
 const tags=r.report.facts.filter(f=>['颜色','性状'].includes(f.label)&&f.value&&f.value!=='未提供').slice(0,2),date=historyMonthDay(r.createdAt);
 const risk=riskPresentation[r.report.risk];
 return <button type="button" className="bv-history-card" onClick={onClick} aria-label={`${riskLabels[r.report.risk]}，${date}`}><i aria-hidden="true" style={{background:risk.color}}/><strong style={{color:risk.color}}>{risk.label}</strong><time dateTime={r.createdAt}>{date}</time><div>{tags.length?tags.map(t=><span key={t.label} title={t.value}>{t.value}</span>):<span>照片观察</span>}</div></button>;
}
