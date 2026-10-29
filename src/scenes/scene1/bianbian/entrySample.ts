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
  report:{...demoReport,risk:'green',summary:entrySampleConclusion},
  profileSnapshot:mockBabyProfile,trendSnapshot:trends,regularitySnapshot:trends}));
}
