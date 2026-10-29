import {useState} from 'react';
import {ReportContent} from './BianbianReport';
import {makeRecord} from './records';
import {demoReport} from './analysis';
import {mockBabyProfile} from './babyProfile';
import {createMockTrends} from './trendData';
import {Icon} from './ui';
import {KitIcon} from './KitIcon';
export function EntryPreview({onBack,onActivate}:{onBack:()=>void;onActivate:()=>void}){
 const [sample]=useState(()=>makeRecord({...demoReport,risk:'green'},'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()}));
 return <><header className="br-nav be-entry-nav"><button type="button" onClick={onBack} aria-label="返回育儿"><Icon name="back"/></button><h1>便便智能分析 <span>VIP</span></h1><span/></header><div className="br-scroll be-entry-scroll">

 <article className="be-sample-full" aria-label="便便解读示例"><div className="be-sample-report" ref={el=>el?.setAttribute('inert','')}><ReportContent record={sample} showTimestamp={false}/></div><div className="be-sample-cover" aria-hidden="true"><strong>示例数据</strong></div><span className="be-sample-accessible">完整示例包含观察总结、颜色与性状、近七天规律、行动建议、参考解读和育儿参考资料。未分析真实照片。</span></article></div>
 <footer className="be-entry-footer"><div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折</span><button type="button" className="bm-open-button" onClick={onActivate}>立即开通</button></div></footer></>;
}
export function CameraDock({onPhoto}:{onPhoto:()=>void}){return <footer className="be-camera-dock"><button className="be-camera-button" type="button" onClick={onPhoto} aria-label="拍照分析"><span className="be-camera-icon"><KitIcon name="camera"/></span><strong>拍照分析</strong></button></footer>;}
