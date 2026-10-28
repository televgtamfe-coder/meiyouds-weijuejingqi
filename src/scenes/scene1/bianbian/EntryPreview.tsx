import {Icon} from './ui';
import {KitIcon} from './KitIcon';
export function EntryPreview({onBack,onActivate}:{onBack:()=>void;onActivate:()=>void}){
 return <><header className="br-nav be-entry-nav"><button type="button" onClick={onBack} aria-label="返回育儿"><Icon name="back"/></button><h1>宝宝便便解读 <span>VIP</span></h1><span/></header><div className="br-scroll be-entry-scroll">
 <div className="be-entry-banner"><KitIcon name="camera"/><div><strong>拍一张，读懂宝宝的日常变化</strong><p>照片观察 · 成长对照 · 家人分享</p></div></div>
 <section className="be-entry-intro"><h2>一份解读，帮你看清这些变化</h2><p>结合宝宝月龄、喂养方式与照片，记录便便颜色、性状及值得关注的表现。</p></section>
 <article className="be-sample-paper" aria-label="便便解读示例"><header><div><span className="be-sample-label">解读示例</span><h2>宝宝的便便观察报告</h2><p>示例宝宝 · 4 个月 · 混合喂养</p></div><span className="be-sample-risk">健康</span></header>
 <section className="be-sample-summary"><h3>观察总结</h3><h2>黄色糊状便，记录一次日常变化</h2><p>这是报告样式示例。实际解读会结合照片和你确认的宝宝资料，展示观察依据与需要留意的表现。</p></section>
 <section className="be-sample-facts"><h3>颜色与性状</h3><div><p><span>颜色观察</span><strong>黄色</strong></p><p><span>性状观察</span><strong>糊状</strong></p></div></section>
 <section className="be-sample-growth"><h3><Icon name="spark"/>成长联合观察</h3><p>把便便、奶量、睡眠放在同一天对照，月度结合身高、体重，查看值得关注的共同变化。</p><div><span>便便</span><i/><span>奶量</span><i/><span>睡眠</span></div></section>
 <section className="be-sample-actions"><h3>重要行动点</h3><p>解读会把值得关注的内容集中呈现，支持保存或分享，方便家人一起了解记录。</p></section><p className="be-sample-note">以上全部为示例内容，不代表宝宝实际健康情况。</p>
 </article><p className="be-entry-boundary">仅供育儿记录和信息参考，不替代医生评估。</p></div>
 <footer className="be-entry-footer"><div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折 · 体验展示</span><button type="button" className="bm-open-button" onClick={onActivate}>立即开通</button></div><p>当前为模拟开通，不产生费用</p></footer></>;
}
export function CameraDock({onPhoto}:{onPhoto:()=>void}){return <footer className="be-camera-dock"><button className="be-camera-button" type="button" onClick={onPhoto} aria-label="拍照分析"><span className="be-camera-icon"><KitIcon name="camera"/></span><span><strong>拍照分析</strong><small>拍一张或从相册选择</small></span><Icon name="next"/></button></footer>;}
