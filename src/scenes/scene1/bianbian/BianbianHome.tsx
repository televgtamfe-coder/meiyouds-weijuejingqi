import { BabyProfile,allergySummary,babyAge,feedingOptions } from './babyProfile';
import { SavedReport,dateLabel,riskLabels } from './records';
import { Avatar,Icon } from './ui';
export function BianbianHome({profile,records,onEdit,onPhoto,onHistory,onRecord,onExample}:{profile:BabyProfile;records:SavedReport[];onEdit:()=>void;onPhoto:()=>void;onHistory:()=>void;onRecord:(record:SavedReport)=>void;onExample:()=>void}) {
 return <div className="br-scroll br-home">
  <section className="br-baby-card">
   <button type="button" className="br-profile-edit" aria-label="修改宝宝资料" onClick={onEdit}><Avatar name={profile.nickname}/><span><Icon name="edit"/></span></button>
   <div className="br-baby-title"><h2>{profile.nickname}</h2><span className="br-example-label">示例档案</span></div>
   <p className="br-baby-age"><Icon name="birthday"/>{babyAge(profile.birthDate)}</p>
   <div className="br-baby-tags"><span><Icon name="mixed"/>{feedingOptions.find(([v])=>v===profile.feeding)?.[1]}</span><span><Icon name="none"/>{allergySummary(profile)}</span></div>
  </section>
  <section className="br-history-preview"><div className="br-section-title"><h2>历史报告</h2><button type="button" aria-label="查看全部历史报告" onClick={onHistory}><Icon name="next"/></button></div>
   <div className="br-history-strip"><button type="button" className="br-add-record" aria-label="添加一次便便记录" onClick={onPhoto}><Icon name="plus"/><span>添加记录</span></button>{records.slice(0,3).map(r=><button type="button" className="br-record-thumb" key={r.id} onClick={()=>onRecord(r)}>{r.thumbnail?<img src={r.thumbnail} alt="便便记录缩略图"/>:<Icon name="file"/>}<span>{dateLabel(r.createdAt).split(' ')[0]}</span></button>)}</div>
  </section>
  <section className="br-daily"><div className="br-section-title"><h2>每日小贴士</h2><span className="br-tip-tag">育儿提示</span><button type="button" aria-label="看看报告示例" onClick={onExample}><Icon name="next"/></button></div><div className="br-daily-card"><Icon name="book"/><p>记录每天的小变化，<br/>一起关注宝宝的便便、<br/>喂养和日常状态。</p></div></section>
 </div>;
}
export function BianbianHistory({records,onRecord,onPhoto}:{records:SavedReport[];onRecord:(r:SavedReport)=>void;onPhoto:()=>void}) {
 return <div className="br-scroll br-history"><p className="br-support">仅显示当前浏览器会话的记录，最多保留 20 条。</p>{records.length?records.map(r=><button type="button" className="br-history-row" key={r.id} onClick={()=>onRecord(r)}>{r.thumbnail?<img src={r.thumbnail} alt="记录照片"/>:<span className="br-history-placeholder"><Icon name="file"/></span>}<span><strong>{dateLabel(r.createdAt)}</strong><small className={`br-risk-text-${r.report.risk}`}>{riskLabels[r.report.risk]}</small></span><Icon name="next"/></button>):<div className="br-empty"><Icon name="file"/><h2>还没有分析记录</h2><p>添加一张照片，记录宝宝的便便变化。</p><button type="button" className="br-primary" onClick={onPhoto}>添加第一条记录</button></div>}</div>;
}
