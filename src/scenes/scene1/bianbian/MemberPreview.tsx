import {useEffect,useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {Icon,IconName} from './ui';
const benefits:{icon:IconName;title:string;body:string;tag:string}[]=[
 {icon:'gallery',title:'便便智能分析',body:'拍照或上传图片，查看颜色、性状、风险观察和重点行动建议。',tag:'低风险 · 需要关注 · 建议就医'},
 {icon:'file',title:'近 7 天便便规律',body:'回看每天的排便时间、次数和风险等级，快速找到变化日期。',tag:'时间分布 · 次数变化'},
 {icon:'restore',title:'完整历史报告',body:'保留分析当时的结论、资料和趋势，修改当前资料也不影响旧报告。',tag:'当前浏览器保留最近 20 条'},
 {icon:'share',title:'报告保存与分享',body:'保存完整报告长图，分享给家人；需要就医时整理报告分享给医生。',tag:'长图保存 · 家人分享 · 医生分享'},
];
export function MemberPreview({onClose,onActivate}:{onClose:()=>void;onActivate?:()=>void}){
 const [seconds,setSeconds]=useState(29*60+48),[message,setMessage]=useState('');
 useEffect(()=>{const timer=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(timer);},[]);
 const clock=`00:${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 return <BottomSheet title="美柚会员" onClose={onClose} className="bm-member-sheet bm-v7">
  <header className="bm-member-nav"><button type="button" aria-label={onActivate?'关闭美柚会员页，返回示例':'关闭美柚会员页'} onClick={onClose}><Icon name="close"/></button><h2>美柚会员</h2><span/></header>
  <div className="bm-member-content">
   <div className="bm-v7-path"><span><Icon name="gallery"/>拍照记录</span><i/><span><Icon name="spark"/>查看分析</span><i/><span><Icon name="bell"/>关注变化</span></div>
   <section className="bm-v7-benefits"><h3>美柚会员权益<span>{benefits.length} 项</span></h3>{benefits.map(b=><div className="bm-v7-benefit" key={b.title}><span className="bm-v7-icon"><Icon name={b.icon}/></span><div><h4>{b.title}</h4><p>{b.body}</p><small>{b.tag}</small></div></div>)}</section>

  </div>
  <footer className="bm-member-footer">{message&&<p className="bm-member-message" role="status">{message}</p>}<div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折 <time>{clock}</time></span><button type="button" className="bm-open-button" onClick={()=>onActivate?onActivate():setMessage('美柚会员暂未接入真实支付，不会扣费。')}>{onActivate?'开通并继续':'了解美柚会员权益'}</button></div></footer>
 </BottomSheet>;
}
