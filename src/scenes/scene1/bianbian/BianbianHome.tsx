import {TrendSet} from './trendData';
import {TrendDashboard} from './TrendCharts';
import { BabyProfile,allergySummary,babyAge,feedingOptions } from './babyProfile';
import { SavedReport,recordTimestamp,riskLabels } from './records';
import { Avatar,Icon } from './ui';
export function BianbianHome({profile,records,onEdit,onPhoto,onHistory,onRecord,onExample,trends,onJoint,analyzing,hasAnalysis}:{profile:BabyProfile;records:SavedReport[];onEdit:()=>void;onPhoto:()=>void;onHistory:()=>void;onRecord:(record:SavedReport)=>void;onExample:()=>void;trends:TrendSet;onJoint:()=>void;analyzing:boolean;hasAnalysis:boolean}) {
 return <div className="br-scroll br-home">
  <section className="br-baby-card">
   <button type="button" className="br-profile-edit" aria-label="修改宝宝资料" onClick={onEdit}><Avatar name={profile.nickname}/><span><Icon name="edit"/></span></button>
   <div className="br-baby-title"><h2>{profile.nickname}</h2><span className="br-example-label">示例档案</span></div>
   <p className="br-baby-age"><Icon name="birthday"/>{babyAge(profile.birthDate)}</p>
   <div className="br-baby-tags"><span><Icon name="mixed"/>{feedingOptions.find(([v])=>v===profile.feeding)?.[1]}</span><span><Icon name="none"/>{allergySummary(profile)}</span></div>
  <p className="bt-daily-inline">每日贴士：一起记录便便、喂养与睡眠的小变化。</p></section>
  <section className="br-history-preview"><div className="br-section-title"><h2>历史报告</h2><button type="button" aria-label="查看全部历史报告" onClick={onHistory}><Icon name="next"/></button></div>
   <div className="br-history-strip"><button type="button" className="br-add-record" aria-label="添加一次便便记录" onClick={onPhoto}><Icon name="plus"/><span>添加记录</span></button>{records.slice(0,3).map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)}/>)}</div>
  </section>
  <TrendDashboard data={trends} onAnalyze={onJoint} analyzing={analyzing} hasAnalysis={hasAnalysis}/>
  <button type="button" className="br-text-button bt-example-link" onClick={onExample}>查看报告示例<Icon name="next"/></button>
 </div>;
}
export function BianbianHistory({records,onRecord,onPhoto}:{records:SavedReport[];onRecord:(r:SavedReport)=>void;onPhoto:()=>void}) {
 return <div className="br-scroll br-history"><p className="br-support">仅显示当前浏览器会话的记录，最多保留 20 条。</p>{records.length?records.map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)}/>):<div className="br-empty"><Icon name="file"/><h2>还没有分析记录</h2><p>添加一张照片，记录宝宝的便便变化。</p><button type="button" className="br-primary" onClick={onPhoto}>添加第一条记录</button></div>}</div>;
}

function HistoryCard({record:r,onClick}:{record:SavedReport;onClick:()=>void}){
 const tags=r.report.facts.filter(f=>['颜色','性状'].includes(f.label)&&f.value&&f.value!=='未提供').slice(0,2),[date,time]=recordTimestamp(r.createdAt).split('日');
 const risk={green:['暂未见异常','#478f87'],yellow:['需要关注','#bf862e'],orange:['需要评估','#ba741e'],red:['优先就医','#c55361'],unknown:['待确认','#999']}[r.report.risk];
 return <button type="button" className="bv-history-card" onClick={onClick} aria-label={`${riskLabels[r.report.risk]}，${recordTimestamp(r.createdAt)}`}><i aria-hidden="true" style={{background:risk[1]}}/><strong style={{color:risk[1]}}>{risk[0]}</strong><time dateTime={r.createdAt}><span>{date}日</span><span>{time}</span></time><div>{tags.length?tags.map(t=><span key={t.label} title={t.value}>{t.value}</span>):<span>照片观察</span>}{r.demo&&<span>示例</span>}</div></button>;
}
