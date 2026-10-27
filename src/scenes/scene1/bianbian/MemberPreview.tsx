import {useEffect,useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {Icon} from './ui';
export function MemberPreview({onClose}:{onClose:()=>void}){
 const [seconds,setSeconds]=useState(29*60+48),[message,setMessage]=useState('');
 useEffect(()=>{const timer=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(timer);},[]);
 const clock=`00:${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 return <BottomSheet title="开通会员" onClose={onClose} className="bm-member-sheet">
  <header className="bm-member-nav"><button type="button" aria-label="关闭会员页，继续分析" onClick={onClose}><Icon name="close"/></button><h2>宝宝成长解读<span>会员</span></h2><span/></header>
  <div className="bm-member-content"><p className="bm-preview-label">会员页面预览 · 暂不收费</p><div className="bm-member-hero"><span className="bm-member-symbol"><Icon name="star"/></span><h2>让每次变化，都有迹可循</h2><p>便便观察与成长记录，一起看懂</p></div>
   <div className="bm-benefits"><h3>会员权益展示</h3>{[['file','照片观察报告','便便颜色、性状与需要关注的变化'],['spark','成长联合分析','身高、体重、饮食、睡眠与便便一起对照'],['share','和家人一起记录','保存报告，分享照护信息']] .map(([icon,title,body])=><div key={title}><span><Icon name={icon as 'file'|'spark'|'share'}/></span><section><h4>{title}</h4><p>{body}</p></section><Icon name="check"/></div>)}</div>
   <div className="bm-member-offer"><div><strong>成长陪伴会员</strong><span>限时优惠</span></div><p>专属报告与成长趋势解读</p><small>价格及活动待上线，本页仅展示开通样式</small></div>
   {message&&<p className="bm-member-message" role="status">{message}</p>}
  </div>
  <footer className="bm-member-footer"><div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折 <time>{clock}</time></span><button type="button" className="bm-open-button" onClick={()=>setMessage('会员服务尚未开放，本次不会收费。关闭此页即可继续分析体验。')}>立即开通</button></div><p>折扣与倒计时为演示，不产生支付或订阅</p><button type="button" className="br-text-button" onClick={onClose}>暂不开通，继续分析</button></footer>
 </BottomSheet>;
}
