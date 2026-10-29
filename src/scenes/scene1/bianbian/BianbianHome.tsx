import {useEffect,useRef} from 'react';
import {KitIcon} from './KitIcon';
import {DailyBrief} from './RoutineReminders';
import {riskPresentation} from './riskPresentation';
import {TrendSet} from './trendData';
import {TrendDashboard} from './TrendCharts';
import { BabyProfile,allergyTag,feedingOptions } from './babyProfile';
import { SavedReport,riskLabels } from './records';
import { Icon } from './ui';
export function BianbianHome({profile,records,onEdit,onPhoto,onHistory,onRecord,trends,onCameraVisible}:{profile:BabyProfile;records:SavedReport[];onEdit:(section?:'feeding'|'allergies'|'formula')=>void;onPhoto:()=>void;onHistory:()=>void;onRecord:(record:SavedReport)=>void;trends:TrendSet;onCameraVisible?:(visible:boolean)=>void}) {
 const entry=useRef<HTMLButtonElement>(null),scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  onCameraVisible?.(true);
  if(!entry.current||!scroll.current||typeof IntersectionObserver==='undefined')return;
  const observer=new IntersectionObserver(([item])=>onCameraVisible?.(item.isIntersecting),{root:scroll.current,threshold:0});
  observer.observe(entry.current);return()=>observer.disconnect();
 },[onCameraVisible]);
 const recent=[...records].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,3);
 return <div className="br-scroll br-home" ref={scroll}>
  <button ref={entry} type="button" className="bh-camera-entry" onClick={onPhoto} aria-label="拍照分析"><span className="bh-camera-art" aria-hidden="true"><KitIcon name="camera"/></span><span className="bh-camera-copy"><strong>拍照分析</strong><span>打开相机，拍摄宝宝便便</span></span><span className="bh-camera-go" aria-hidden="true"><Icon name="next"/></span></button>
  <section className="br-baby-card">
   <div className="br-baby-tags"><button type="button" aria-label="修改喂养方式" onClick={()=>onEdit('feeding')}><Icon name="mixed"/><span>{feedingOptions.find(([v])=>v===profile.feeding)?.[1]}</span><Icon name="edit"/></button><button type="button" aria-label="修改过敏原" onClick={()=>onEdit('allergies')}><Icon name="none"/><span title={allergyTag(profile)}>{allergyTag(profile)}</span><Icon name="edit"/></button>{['mixed','pure_formula'].includes(profile.feeding)&&profile.formula.trim()&&<button type="button" className="br-formula-tag" aria-label="修改奶粉品牌" onClick={()=>onEdit('formula')}><Icon name="milk"/><span title={profile.formula.trim()}>{profile.formula.trim()}</span><Icon name="edit"/></button>}</div>
  <DailyBrief data={trends}/></section>
  <section className="br-history-preview bh-history-preview"><div className="br-section-title"><h2>历史报告 <span>最近三次</span></h2><button className="bh-history-more" type="button" aria-label="查看全部历史报告" onClick={onHistory}>更多<Icon name="next"/></button></div>
   <div className="bh-history-feed">{recent.length?recent.map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)} feed/>):<p className="br-support">还没有分析记录，拍一张照片开始记录。</p>}</div>
  </section>
  <TrendDashboard data={trends}/>
 </div>;
}
export function BianbianHistory({records,onRecord,onPhoto}:{records:SavedReport[];onRecord:(r:SavedReport)=>void;onPhoto:()=>void}) {
 return <div className="br-scroll br-history"><p className="br-support">重要报告请及时保存。</p>{records.length?records.map(r=><HistoryCard key={r.id} record={r} onClick={()=>onRecord(r)}/>):<div className="br-empty"><Icon name="file"/><h2>还没有分析记录</h2><p>添加一张照片，记录宝宝的便便变化。</p><button type="button" className="br-primary" onClick={onPhoto}>添加第一条记录</button></div>}</div>;
}

function HistoryCard({record:r,onClick,feed=false}:{record:SavedReport;onClick:()=>void;feed?:boolean}){
 const tags=r.report.facts.filter(f=>['颜色','性状'].includes(f.label)&&f.value&&f.value!=='未提供').slice(0,2),date=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'long',day:'numeric'}).format(new Date(r.createdAt));
 const risk=riskPresentation[r.report.risk];
 if(feed)return <button type="button" className="bh-history-row" onClick={onClick} aria-label={`${date}，${risk.label}，查看报告`}><span className="bh-history-heading"><time dateTime={r.createdAt}>{date}</time><strong style={{color:risk.color,background:risk.background}}>{risk.label}</strong></span><span className="bh-history-facts">{tags.length?tags.map(t=><span key={t.label}>{t.value}</span>):<span>便便分析报告</span>}</span><Icon name="next"/></button>;
 return <button type="button" className="bv-history-card" onClick={onClick} aria-label={`${riskLabels[r.report.risk]}，${date}`}><i aria-hidden="true" style={{background:risk.color}}/><strong style={{color:risk.color}}>{risk.label}</strong><time dateTime={r.createdAt}>{date}</time><div>{tags.length?tags.map(t=><span key={t.label} title={t.value}>{t.value}</span>):<span>照片观察</span>}</div></button>;
}
