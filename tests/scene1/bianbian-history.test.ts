import {beforeEach,it,expect} from 'vitest';
import {demoReport,emptyForm} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends,shanghaiDate} from '../../src/scenes/scene1/bianbian/trendData';
import {makeRecord,saveRecord,loadRecords,recordsKey,clearBianbianData,validRecord} from '../../src/scenes/scene1/bianbian/records';
import {mockHistory,loadMockHistory} from '../../src/scenes/scene1/bianbian/mockHistory';
import {riskObservations} from '../../src/scenes/scene1/bianbian/reportSummary';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
const trends=()=>createMockTrends(new Date('2026-10-28T14:00:00Z'));
it('保存完整独立快照，修改当前资料与表单不改写历史，新会话仍能恢复',()=>{
 const report=structuredClone(demoReport),profile=structuredClone(mockBabyProfile),trend=trends(),form={...emptyForm,notes:'当时备注',symptoms:['无以下情况']};
 const r=makeRecord(report,'',false,{profile,trendSnapshot:trend,form});
 report.detail='后来结果';profile.formula='后来品牌';trend.days[6].loggedMilkMl=999;form.notes='后来备注';
 expect(saveRecord(r)).toBe(true);sessionStorage.clear();
 const saved=loadRecords()[0];expect(saved.report.detail).toBe(demoReport.detail);expect(saved.profileSnapshot?.formula).toBe('');expect(saved.formSnapshot?.notes).toBe('当时备注');expect(saved.trendSnapshot?.days[6].loggedMilkMl).toBe(780);
 expect(saved.createdAt).toBe(r.createdAt);expect(saved.report).toEqual(r.report);
});
it('迁移旧会话报告，不修改内容、时间或补造背景',()=>{
 const legacy=makeRecord(demoReport);sessionStorage.setItem(recordsKey,JSON.stringify([legacy]));
 expect(loadRecords()).toEqual([legacy]);sessionStorage.clear();expect(loadRecords()).toEqual([legacy]);expect(loadRecords()[0].profileSnapshot).toBeUndefined();
});
it('三条示例均包含完整报告、输入、七天和联合分析，日期不越过当时分析时间',()=>{
 const all=mockHistory(mockBabyProfile,trends());expect(all.map(r=>r.report.risk)).toEqual(['green','yellow','red']);
 for(const r of all){expect(validRecord(r,true)).toBe(true);expect(r.report.facts).toHaveLength(3);expect(r.report.actions.length).toBeGreaterThan(0);expect(r.report.evidence.length).toBeGreaterThan(0);expect(r.report.cause).not.toBe('');expect(r.formSnapshot).toBeDefined();expect(r.jointAnalysis?.domains).toHaveLength(3);expect(r.trendSnapshot?.days).toHaveLength(7);expect(r.trendSnapshot?.days.at(-1)?.date).toBe(shanghaiDate(new Date(r.createdAt)));expect(r.trendSnapshot?.days.every(d=>d.date<=shanghaiDate(new Date(r.createdAt)))).toBe(true);}
 expect(riskObservations(all[0]).map(x=>x.value)).toEqual(['未见明显','未见明显','未见明显']);
 expect(riskObservations(all[1]).map(x=>x.value)).toEqual(['未见明显','疑似少量','未见明显']);
 expect(riskObservations(all[2]).map(x=>x.value)).toEqual(['疑似大量','未见明显','发现异常']);
});
it('重新进入和修改宝宝资料不重新生成历史示例，清除本地数据才重建',()=>{
 const first=loadMockHistory(mockBabyProfile,trends());
 const second=loadMockHistory({...mockBabyProfile,formula:'新品牌'},createMockTrends(new Date('2026-11-01T12:00:00Z')));
 expect(second).toEqual(first);first[0].profileSnapshot!.formula='内存修改';expect(loadMockHistory(mockBabyProfile,trends())[0].profileSnapshot?.formula).toBe('');
 clearBianbianData();expect(loadMockHistory({...mockBabyProfile,formula:'新品牌'},trends())[0].profileSnapshot?.formula).toBe('新品牌');
});
it('风险状态固定映射但不猜测缺失结果或互相冲突的数量',()=>{
 const result=(value:string)=>riskObservations(makeRecord({...demoReport,facts:[{label:'可见混合物',value,detail:'',comparison:''}]}));
 expect(result('未见明显血丝；疑似少量奶瓣；发现灰白色异常区域。').map(x=>x.value)).toEqual(['未见明显','疑似少量','发现异常']);
 expect(result('疑似大量血丝。')[0].value).toBe('疑似大量');
 expect(result('未见血丝；可见血丝。')[0].value).toBe('待确认');
 expect(result('疑似少量血丝；疑似大量血丝。')[0].value).toBe('待确认');
 expect(result('无法排除血丝；可见奶瓣。').every(x=>x.value==='待确认')).toBe(true);
});
