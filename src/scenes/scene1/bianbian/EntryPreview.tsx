import {useState} from 'react';
import {ReportContent} from './BianbianReport';
import {makeRecord} from './records';
import {demoReport} from './analysis';
import {mockBabyProfile} from './babyProfile';
import {createMockTrends,dayShort} from './trendData';
import type {JointAnalysis} from './trendAnalysis';
import {Icon} from './ui';
import {KitIcon} from './KitIcon';
export function EntryPreview({onBack,onActivate}:{onBack:()=>void;onActivate:()=>void}){
 const [sample]=useState(()=>{
 const data=createMockTrends(),d=data.days[4],previous=data.days[3];
 const joint:JointAnalysis={summary:'示例记录的同日变化',domains:[{key:'stool',observation:`${dayShort(d.date)} 记录 ${d.stools.length} 次便便。`,relation:'与同日记录对照。'},{key:'feeding',observation:`已记录奶量 ${d.loggedMilkMl} ml。`,relation:'不包含未量化的亲喂。'},{key:'sleep',observation:`记录睡眠 ${d.sleepHours} 小时。`,relation:'对照同日排便与奶量变化。'}],relationships:[`${dayShort(d.date)} 便便 ${d.stools.length} 次、已记录奶量 ${d.loggedMilkMl} ml、睡眠 ${d.sleepHours} 小时；前一天分别为 ${previous.stools.length} 次、${previous.loggedMilkMl} ml、${previous.sleepHours} 小时。这些同日变化值得一起留意。`,'黄色背景标出了值得关注的日期，可继续留意之后几天的排便、奶量和睡眠变化。'],plan:[],limitations:['全部为模拟记录，不判断真实宝宝健康。','记录覆盖与测量方式可能不同，对照同日排便与奶量变化。'],alert:''};
 return makeRecord({...demoReport,risk:'green'},'',true,{profile:mockBabyProfile,trendSnapshot:data,jointAnalysis:joint});
 });
 return <><header className="br-nav be-entry-nav"><button type="button" onClick={onBack} aria-label="返回育儿"><Icon name="back"/></button><h1>便便智能分析 <span>VIP</span></h1><span/></header><div className="br-scroll be-entry-scroll">
 <div className="be-entry-banner"><KitIcon name="camera"/><strong>拍一张，读懂宝宝的日常变化</strong></div>

 <article className="be-sample-full" aria-label="便便解读示例"><div className="be-sample-report" ref={el=>el?.setAttribute('inert','')}><ReportContent record={sample}/></div><div className="be-sample-cover" aria-hidden="true"><strong>示例数据</strong></div><span className="be-sample-accessible">完整示例包含观察总结、颜色与性状、喂养睡眠背景、近七天规律、联合喂养睡眠分析、行动建议、参考解读和育儿参考资料。未分析真实照片。</span></article></div>
 <footer className="be-entry-footer"><div className="bm-cta-wrap"><span className="bm-discount">限时 4.1 折</span><button type="button" className="bm-open-button" onClick={onActivate}>立即开通</button></div></footer></>;
}
export function CameraDock({onPhoto}:{onPhoto:()=>void}){return <footer className="be-camera-dock"><button className="be-camera-button" type="button" onClick={onPhoto} aria-label="拍照分析"><span className="be-camera-icon"><KitIcon name="camera"/></span><strong>拍照分析</strong></button></footer>;}
