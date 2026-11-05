import {demoReport} from './analysis';
import {mockBabyProfile} from './babyProfile';
import {SavedReport} from './records';
import {createMockTrends} from './trendData';

// Fixed editorial sample, independent of user records, model responses and the clock.
export const entrySampleConclusion='本次便便呈芥末黄、夹杂深棕绿色，质地柔软糊状、整体较均匀，与四个月混合喂养宝宝这一阶段的常见外观和性状相近。照片中未发现血丝、奶瓣或灰白色区域，未见明显水样分离，本次分析为低风险。可继续留意后续排便的颜色、质地及宝宝状态变化。';
export function createEntrySample():SavedReport {
 const createdAt='2026-10-29T04:00:00.000Z';
 const trends=createMockTrends(new Date(createdAt));
 return JSON.parse(JSON.stringify({id:'entry-preview-v45',createdAt,thumbnail:'',demo:true,
  report:{...demoReport,risk:'green',summary:entrySampleConclusion,
   actionPlan:[
    {title:'留下下一次排便对照',when:'下次排便时',steps:['在自然光下拍照，记录排便时间、颜色和稀稠程度','当天每次排便都记一笔，与前一天对照'],watchFor:''},
    {title:'补齐喂养与宝宝状态',when:'下一次喂奶时',steps:['记录喂奶时间、已知奶量及是否有呕吐或明显不适；亲喂只记录时长，不估算奶量'],watchFor:''},
    {title:'遇到明显变化及时咨询',when:'后续出现血丝、灰白色便，或便便明显变稀且宝宝不适时',steps:['联系儿科医生，说明开始时间、排便次数和伴随症状，并提供照片'],watchFor:'不要为了补齐记录而延后就医。'}],
   deepAnalysis:[
    {title:'外观与性状解读',body:'这份示例中的便便以芥末黄色为主，夹杂深棕绿色，质地柔软、呈糊状，整体分布较均匀。黄色、绿色或棕色都可以出现在婴儿便便中，颜色还会受到喂养方式及照片光线影响。观察重点是后续是否出现持续的颜色改变、明显水样便或干硬便。'},
    {title:'当前阶段与喂养背景',body:'示例宝宝为四个月、混合喂养且尚未添加辅食。母乳与配方奶混合喂养时，便便颜色和稠度可能有所变化，这张照片的柔软糊状表现与该阶段常见外观相近。还应结合吃奶、精神状态及后续排便变化理解本次表现，不能只看一次照片。'},
    {title:'需要留意的变化',body:'本次示例照片中，血丝、奶瓣、灰白色三个观察项均为未发现，报告标记为低风险。这个标记描述的是本次可见表现，后续若出现血丝、明显灰白色便或宝宝不适，应将新照片、出现时间和症状提供给医生，便于进一步评估。'}]},
  profileSnapshot:mockBabyProfile,trendSnapshot:trends,regularitySnapshot:trends}));
}
