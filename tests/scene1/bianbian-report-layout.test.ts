import {cleanReportCopy} from '../../src/scenes/scene1/bianbian/presentationCopy';
import {it,expect} from 'vitest';
import {reportSections} from '../../src/scenes/scene1/bianbian/reportExport';
import {reportContext,appearanceConclusion,observationConclusion,referenceParagraphs,riskObservations,observationTrendConclusion,indicatorDetails,riskObservationConclusion,conclusionSegments,overviewConclusion} from '../../src/scenes/scene1/bianbian/reportSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('保存内容先精简总结再七天规律，完整依据仅在末尾深度分析',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});const titles=reportSections(r).map(x=>x.title);
 expect(titles.slice(0,3)).toEqual(['本次分析结论','重要指标解读','行动建议']);
 expect(reportSections(r)[0].body).not.toContain('这是一份中文文案示例');expect(reportSections(r).find(s=>s.title==='深度分析')?.body).toContain(demoReport.detail);expect(titles).not.toContain('颜色与性状情况');
 expect(titles.indexOf('行动建议')).toBeLessThan(titles.indexOf('深度分析'));expect(titles.at(-1)).toBe('育儿参考资料');
});
it('没有同日睡眠数据时不借用其他日期的记录',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});r.createdAt='2020-01-01T04:00:00Z';
 expect(reportContext(r).find(x=>x.label==='睡眠背景')?.value).toBe('本次没有同日睡眠记录');
});

it('喂养睡眠差值根据同日与前一日记录生成，不把减少写成增加',()=>{
 const data=createMockTrends();const d=data.days[4],prev=data.days[3];const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:data});r.createdAt=d.date+'T04:00:00Z';
 const context=reportContext(r);expect(context[0].change).toContain(String(d.loggedMilkMl));expect(context[0].change).toContain(d.loggedMilkMl>prev.loggedMilkMl?'增加':'减少');expect(context[1].change).toContain(d.sleepHours>prev.sleepHours?'增加':'减少');
});

it('总结保留颜色性状描述和完整句结论，删除联合喂养睡眠模块',()=>{
 const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});
 expect(appearanceConclusion(r).every(f=>f.description.length>0)).toBe(true);expect(observationConclusion(r)).toBe(demoReport.summary);
 const sections=reportSections(r);expect(sections.filter(x=>x.title==='联合喂养睡眠分析')).toHaveLength(0);expect(sections.some(x=>x.title==='结合喂养与睡眠')).toBe(false);expect(sections[0].title).toBe('本次分析结论');
});

it('重复结论只展示一次，完整依据保留新的信息及否定表述',()=>{
 const r=makeRecord({...demoReport,facts:[],summary:'观察结论。',detail:'观察结论。\n未见明显红色。仍需留意后续变化。',cause:'未见明显红色。',evidence:['仍需留意后续变化。','照片光线可能影响颜色。']},'',true);
 expect(referenceParagraphs(r).join('\n')).toBe('观察结论。\n未见明显红色。仍需留意后续变化。\n照片光线可能影响颜色。');
});

it('风险观察只使用当前照片的明确事实，不把缺失、疑似或建议当成阴性',()=>{
 const r=makeRecord({...demoReport,facts:[{label:'可见混合物',value:'未见明显血丝或灰白色区域，可见少量奶瓣。',detail:'',comparison:''}]},'',true);
 expect(riskObservations(r).map(x=>x.state)).toEqual(['absent','present','absent']);
 expect(reportSections(r)[1].body).toContain('奶瓣：少量');
 r.report.facts=[{label:'可见混合物',value:'无法排除血丝，疑似奶瓣。',detail:'若出现灰白色需注意。',comparison:'未见血丝'}];
 expect(riskObservations(r).every(x=>x.state==='unknown')).toBe(true);
 r.report.facts=[{label:'可见混合物',value:'未见血丝。',detail:'可见血丝。',comparison:''}];
 expect(riskObservations(r)[0].state).toBe('unknown');
});

it('完整示例的结论与三个风险指标一致，导出先结论再指标',()=>{
 const r=makeRecord(demoReport,'',true);
 expect(riskObservations(r).map(x=>x.value)).toEqual(['未发现','未发现','未发现']);
 expect(observationConclusion(r)).toContain('柔软糊状');expect(observationConclusion(r)).toContain('未见明显血丝、奶瓣或灰白色区域');
 expect(reportSections(r).slice(0,2).map(x=>x.title)).toEqual(['本次分析结论','重要指标解读']);
});

it('顶部概括排便规律与同日关联，不把奶量减少写成增加或解释成因果',()=>{
 const data=createMockTrends(new Date('2026-10-28T04:00:00Z'));const r=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:data});r.createdAt='2026-10-28T04:00:00Z';
 const text=observationTrendConclusion(r);expect(text).toContain('多为每天 2 次');expect(text).toContain('10/26 排便增多');expect(text).toContain('奶量与睡眠同步减少');expect(text).not.toMatch(/导致|因为/);expect(text.length).toBeLessThan(100);
 r.createdAt='2026-10-23T04:00:00Z';expect(observationTrendConclusion(r)).toBe('');
 r.trendSnapshot=undefined;expect(observationTrendConclusion(r)).toBe('');
});

it('去掉关联解释套话但保留数据和临床否定描述',()=>{
 expect(cleanReportCopy('今天奶量减少，可能有关联，不能认定因果。')).toBe('今天奶量减少。');
 expect(cleanReportCopy('共同变化不代表因果。今天睡眠减少 1 小时。')).toBe('今天睡眠减少 1 小时。');
 expect(cleanReportCopy('未见明显血丝，不能排除其他情况。')).toBe('未见明显血丝，不能排除其他情况。');
});

it('顶部补齐风险观察，未知项目不当作未见，已有描述不重复',()=>{
 const r=makeRecord({...demoReport,summary:'本次为棕色糊状便。',facts:[{label:'可见混合物',value:'未见血丝，未见灰白色。',detail:'',comparison:''}]},'',true);
 expect(riskObservationConclusion(r)).toBe('未发现血丝、灰白色');
 expect(riskObservationConclusion(makeRecord(demoReport,'',true))).toBe('未发现血丝、奶瓣、灰白色');
 expect(conclusionSegments('排便增多，奶量与睡眠同步减少。').every(x=>x.strong)).toBe(true);
});
it('指标卡不复述颜色结论，细节移至默认展开的完整依据',()=>{
 const r=makeRecord({...demoReport,summary:'棕色糊状便。',facts:[{label:'颜色',value:'棕色',detail:'整体呈棕色，未见灰白色。',comparison:''},{label:'性状',value:'糊状',detail:'稠厚糊状，局部夹少量软块，边缘不规则。',comparison:''}]},'',true);
 expect(indicatorDetails(r)[0].description).toBe('');expect(indicatorDetails(r)[1].description).toBe('局部夹少量软块；边缘不规则');
 expect(referenceParagraphs(r).join('')).toContain('整体呈棕色，未见灰白色。');
});

it('未带句末标点的模型结论与风险补充自然分句',()=>{
 const r=makeRecord({...demoReport,summary:'本次为糊状便',detail:'',cause:''},'',true);
 expect(overviewConclusion(r)).toContain('本次为糊状便。未发现');
});

it('结论开头保留本次完整依据首句，不固定套用四个月混合喂养或低风险',()=>{
 const detail='结合本次照片与八个月配方奶喂养背景，血丝表现需要关注。后续完整依据。';
 const r=makeRecord({...demoReport,risk:'red',summary:'建议就医。',detail},'',true);
 const result=overviewConclusion(r);expect(result.startsWith('结合本次照片与八个月配方奶喂养背景，血丝表现需要关注。')).toBe(true);expect(result).not.toContain('四个月');expect(result).toContain('建议就医');expect(result).not.toContain('后续完整依据');
 r.report.detail=r.report.summary;expect(overviewConclusion(r).match(/建议就医。/g)).toHaveLength(1);
});

it('开头合并颜色性状与阶段判断，不再追加一遍模型总结',()=>{
 const r=makeRecord(demoReport,'',true);const result=overviewConclusion(r);
 expect(result.startsWith('本次便便呈芥末黄与深棕绿色、质地柔软糊状，与四个月混合喂养宝宝的常见便便表现相近。')).toBe(true);
 expect(result.match(/柔软糊状/g)).toHaveLength(1);expect(result.match(/未发现/g)).toHaveLength(1);
 expect(result).not.toContain('便便质地柔软糊状');expect(result).not.toContain('当前观察为低风险');
 expect(referenceParagraphs(r).join('')).toContain(demoReport.summary);
});
