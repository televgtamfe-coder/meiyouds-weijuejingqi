import {useEffect,useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {Icon,IconName} from './ui';
const benefits:{icon:IconName;title:string;body:string;tag:string}[]=[
 {icon:'gallery',title:'便便照片分析',body:'拍照或上传照片，结合宝宝资料，查看颜色、性状与行动点。',tag:'一次提交 · 完整报告'},
 {icon:'spark',title:'变化趋势对照',body:'近 7 天对照便便、奶量与睡眠；月度结合身高体重，查看共同变化。',tag:'同日关联 · 月度对比'},
 {icon:'bell',title:'智能记录提醒',body:'参考历史排便时段，预测今天的参考时间，添加换尿布提醒。',tag:'日历导入后提醒'},
 {icon:'share',title:'报告保存与分享',body:'保存报告长图，分享给家人，一起了解宝宝近期的变化。',tag:'长图保存 · 家人分享'},
];
export function MemberPreview({onClose,onActivate}:{onClose:()=>void;onActivate?:()=>void}){
 const [seconds,setSeconds]=useState(29*60+48),[message,setMessage]=useState('');
 useEffect(()=>{const timer=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(timer);},[]);
 const clock=`00:${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 return <BottomSheet title="美柚会员" onClose={onClose} className="bm-member-sheet bm-v7">
  <header className="bm-member-nav"><button type="button" aria-label={onActivate?'关闭美柚会员页，返回示例':'关闭美柚会员页'} onClick={onClose}><Icon name="close"/></button><h2>美柚会员<span>体验</span></h2><span/></header>
  <div className="bm-member-content">
   <div className="bm-v7-path"><span><Icon name="gallery"/>拍照记录</span><i/><span><Icon name="spark"/>查看分析</span><i/><span><Icon name="bell"/>关注变化</span></div>
   <section className="bm-v7-benefits"><h3>当前可体验的功能<span>4 项</span></h3>{benefits.map(b=><div className="bm-v7-benefit" key={b.title}><span className="bm-v7-icon"><Icon name={b.icon}/></span><div><h4>{b.title}</h4><p>{b.body}</p><small>{b.tag}</small></div></div>)}</section>

  </div>
  <footer className="bm-member-footer">{message&&<p className="bm-member-message" role="status">{message}</p>}<div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折 <time>{clock}</time></span><button type="button" className="bm-open-button" onClick={()=>onActivate?onActivate():setMessage('当前为美柚会员体验，未接入真实支付，不会扣费。')}>{onActivate?'开通并继续':'了解美柚会员权益'}</button></div></footer>
 </BottomSheet>;
}
