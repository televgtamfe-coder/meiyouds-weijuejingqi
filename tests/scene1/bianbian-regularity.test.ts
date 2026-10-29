import {beforeEach,it,expect} from 'vitest';
import {demoReport,normalizeReport} from '../../src/scenes/scene1/bianbian/analysis';
import {SavedReport,makeRecord,saveRecord,loadRecords,clearBianbianData} from '../../src/scenes/scene1/bianbian/records';
import {regularityTrend,rememberRegularity} from '../../src/scenes/scene1/bianbian/regularity';
import {riskQuantity,readRiskObservations,missingRiskLabels} from '../../src/scenes/scene1/bianbian/riskObservations';
import {reportSections} from '../../src/scenes/scene1/bianbian/reportExport';
const now=new Date('2026-10-29T12:00:00+08:00');
function row(day:number,id=String(day)):SavedReport{return {id,createdAt:new Date(now.getTime()-day*86400000).toISOString(),report:demoReport,thumbnail:'',demo:false};}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
it('30天按上海自然日去重，七天不出现，八天出现，示例与未来不算',()=>{
 const seven=Array.from({length:7},(_,i)=>row(i));
 expect(regularityTrend([...seven,row(0,'duplicate'),row(30),row(-1),{...row(7),demo:true}],now)).toBeUndefined();
 const chart=regularityTrend([...seven,row(29)],now)!;
 expect(chart.source).toBe('records');expect(chart.days).toHaveLength(7);expect(chart.days.reduce((sum,x)=>sum+x.stools.length,0)).toBe(7);
});
it('规律记录独立于最近20份完整报告，清空后也清除统计',()=>{
 rememberRegularity(Array.from({length:8},(_,i)=>row(i)),now);
 expect(regularityTrend([],now)).toBeDefined();clearBianbianData();expect(regularityTrend([],now)).toBeUndefined();
});
it('导出仅展示报告当时保存的规律，不用后续数据补造历史',()=>{
 const r=row(0);expect(reportSections(r).some(x=>x.title==='便便规律性解读')).toBe(false);
 r.regularitySnapshot=regularityTrend(Array.from({length:8},(_,i)=>row(i)),now);
 expect(reportSections(r).some(x=>x.title==='便便规律性解读')).toBe(true);
});
it('三个新字段从接口到持久化和导出一致，旧异常不猜数量',()=>{
 const report=normalizeReport({status:'success',risk_level:'yellow',risk_observations:{blood:{status:'少量',evidence:'可见少量血丝'},milk_curds:{status:'大量',evidence:'可见大量奶瓣'},pale:{status:'未发现',evidence:'未发现灰白色区域'}}});
 expect(readRiskObservations(report).map(x=>riskQuantity(x.value))).toEqual(['少量','大量','未发现']);
 const r=makeRecord(report);saveRecord(r);expect(loadRecords()[0].report.riskObservations).toEqual(report.riskObservations);
 expect(reportSections(r)[1].body).toContain('血丝：少量；奶瓣：大量；灰白色：未发现');
 const old=normalizeReport({status:'success',risk_level:'red',objective_facts:{foreign_bodies:'发现血丝异常'}});
 expect(riskQuantity(readRiskObservations(old)[0].value)).toBe('');expect(missingRiskLabels(old)).toContain('血丝');
});
