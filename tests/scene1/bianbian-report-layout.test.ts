import {it,expect} from 'vitest';
import {reportSections} from '../../src/scenes/scene1/bianbian/reportExport';
import {reportContext} from '../../src/scenes/scene1/bianbian/reportSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('保存内容先精简总结再七天规律，完整依据仅在末尾参考解读',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});const titles=reportSections(r).map(x=>x.title);
 expect(titles.slice(0,3)).toEqual(['观察总结','近 7 天便便规律','结合喂养与睡眠']);
 expect(reportSections(r)[0].body).not.toContain(demoReport.detail);expect(reportSections(r).find(s=>s.title==='参考解读')?.body).toContain(demoReport.detail);expect(titles).not.toContain('颜色与性状情况');
 expect(titles.indexOf('行动建议')).toBeLessThan(titles.indexOf('参考解读'));expect(titles.at(-1)).toBe('育儿参考资料');
});
it('没有同日睡眠数据时不借用其他日期的记录',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});r.createdAt='2020-01-01T04:00:00Z';
 expect(reportContext(r).find(x=>x.label==='睡眠背景')?.value).toBe('本次没有同日睡眠记录');
});

it('喂养睡眠差值根据同日与前一日记录生成，不把减少写成增加',()=>{
 const data=createMockTrends();const d=data.days[4],prev=data.days[3];const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:data});r.createdAt=d.date+'T04:00:00Z';
 const context=reportContext(r);expect(context[0].change).toContain(String(d.loggedMilkMl));expect(context[0].change).toContain(d.loggedMilkMl>prev.loggedMilkMl?'增加':'减少');expect(context[1].change).toContain(d.sleepHours>prev.sleepHours?'增加':'减少');
});
