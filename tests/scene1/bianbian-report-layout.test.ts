import {it,expect} from 'vitest';
import {reportSections} from '../../src/scenes/scene1/bianbian/reportExport';
import {reportContext,appearanceConclusion,observationConclusion,referenceParagraphs,riskObservations} from '../../src/scenes/scene1/bianbian/reportSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('保存内容先精简总结再七天规律，完整依据仅在末尾参考解读',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});const titles=reportSections(r).map(x=>x.title);
 expect(titles.slice(0,3)).toEqual(['观察总结','近 7 天便便规律','联合成长分析']);
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

it('总结保留颜色性状描述和完整句结论，喂养睡眠只归入一个联合模块',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});
 expect(appearanceConclusion(r).every(f=>f.description.length>0)).toBe(true);expect(observationConclusion(r)).toBe(demoReport.summary);
 const sections=reportSections(r);expect(sections.filter(x=>x.title==='联合成长分析')).toHaveLength(1);expect(sections.some(x=>x.title==='结合喂养与睡眠')).toBe(false);expect(sections[0].body).toContain('观察结论：');
});

it('重复结论只展示一次，完整依据保留新的信息及否定表述',()=>{
 const r=makeRecord({...demoReport,summary:'观察结论。',detail:'观察结论。\n未见明显红色。仍需留意后续变化。',cause:'未见明显红色。',evidence:['仍需留意后续变化。','照片光线可能影响颜色。']},'',true);
 expect(referenceParagraphs(r).join('\n')).toBe('未见明显红色。仍需留意后续变化。\n照片光线可能影响颜色。');
});

it('风险观察只使用当前照片的明确事实，不把缺失、疑似或建议当成阴性',()=>{
 const r=makeRecord({...demoReport,facts:[{label:'可见混合物',value:'未见明显血丝或灰白色区域，可见少量奶瓣。',detail:'',comparison:''}]},'',true);
 expect(riskObservations(r).map(x=>x.state)).toEqual(['absent','present','absent']);
 expect(reportSections(r)[0].body).toContain('奶瓣：可见');
 r.report.facts=[{label:'可见混合物',value:'无法排除血丝，疑似奶瓣。',detail:'若出现灰白色需注意。',comparison:'未见血丝'}];
 expect(riskObservations(r).every(x=>x.state==='unknown')).toBe(true);
 r.report.facts=[{label:'可见混合物',value:'未见血丝。',detail:'可见血丝。',comparison:''}];
 expect(riskObservations(r)[0].state).toBe('unknown');
});
