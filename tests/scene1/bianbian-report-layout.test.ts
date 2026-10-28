import {it,expect} from 'vitest';
import {reportSections} from '../../src/scenes/scene1/bianbian/reportExport';
import {reportContext} from '../../src/scenes/scene1/bianbian/reportSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('保存内容先观察总结与背景，再七天规律，行动先于参考资料',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});const titles=reportSections(r).map(x=>x.title);
 expect(titles.slice(0,4)).toEqual(['观察总结','颜色与性状情况','结合喂养与睡眠','近 7 天便便规律']);
 expect(titles.indexOf('行动建议')).toBeLessThan(titles.indexOf('参考解读'));expect(titles.at(-1)).toBe('育儿参考资料');
});
it('没有同日睡眠数据时不借用其他日期的记录',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});r.createdAt='2020-01-01T04:00:00Z';
 expect(reportContext(r).find(x=>x.label==='睡眠背景')?.value).toBe('本次没有同日睡眠记录');
});
