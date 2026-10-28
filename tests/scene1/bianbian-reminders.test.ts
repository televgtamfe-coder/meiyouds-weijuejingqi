import {describe,it,expect} from 'vitest';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
import {monthMetrics,relationTracks,focusDay,dayChanges,highlightedDays} from '../../src/scenes/scene1/bianbian/visualTrends';
import {routineWindow,feedingReminder,reminderCalendar} from '../../src/scenes/scene1/bianbian/reminderLogic';
import {importantActions} from '../../src/scenes/scene1/bianbian/importantActions';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {parseJointAnalysis} from '../../src/scenes/scene1/bianbian/trendAnalysis';
const now=new Date('2026-10-27T04:00:00Z'),data=()=>createMockTrends(now);
describe('实际值对照和有依据的提醒',()=>{
 it('六个月度指标按共同天数计算，风险独立于颜色，缺测不作零',()=>{const d=data(),m=d.months!;m.current.days[0].stools=[{time:'09:00',color:'yellow',risk:'high'}];m.current.days.forEach(x=>x.weightKg=null);const metrics=monthMetrics(m);expect(metrics).toHaveLength(6);expect(metrics.find(x=>x.key==='risk')!.current).toBeGreaterThan(0);expect(metrics.find(x=>x.key==='weight')!.current).toBeNull();});
 it('七天只对照便便奶量睡眠，关注日高亮且差值不捏造',()=>{const d=data();expect(relationTracks(d).map(s=>s.key)).toEqual(['stool','milk','sleep']);expect(focusDay(d)).toBe(4);expect(dayChanges(d,4).map(s=>s.change)).toEqual(['比前日增加 2 次','比前日减少 50 ml','比前日减少 1 小时']);});
 it('时段需至少三天支持，只生成未来日历；旧记录不能预估',()=>{const d=data(),w=routineWindow(d,now)!;expect(w.count).toBeGreaterThanOrEqual(3);expect(w.at.getTime()).toBeGreaterThan(now.getTime());expect(reminderCalendar(w.at)).toContain('BEGIN:VALARM');expect(routineWindow(d,new Date('2026-11-01T04:00:00Z'))).toBeNull();d.days.forEach(x=>x.stools=[]);expect(routineWindow(d,now)).toBeNull();});
 it('奶量增多且排便少时给观察提醒，不把平常波动说成过量',()=>{const d=data();expect(feedingReminder(d)?.marked).toBe(false);d.days[6].loggedMilkMl=950;d.days[6].stools=d.days[6].stools.slice(0,1);const r=feedingReminder(d)!;expect(r.marked).toBe(true);expect(r.attention).toContain('不能判断便秘或喂养过量');});
 it('行动点去重最多三项，优先处理内容完整保留',()=>{const r=makeRecord({...demoReport,actions:[{title:'日常照护建议',items:['重复动作','重复动作','另一动作','末项']},{title:'优先处理',items:['紧急一','紧急二']}]});const points=importantActions(r);expect(points).toHaveLength(3);expect(points[0].action).toContain('紧急二');expect(points.filter(x=>x.action==='重复动作')).toHaveLength(1);});
 it('接受三类关联且不要求AI输出行动方案',()=>{const d={summary:'模拟',domains:['stool','feeding','sleep'].map(key=>({key,observation:'变化',relation:'可能关联'})),relationships:['同日变化'],plan:[],limitations:['模拟'],alert:''};expect(parseJointAnalysis(JSON.stringify(d)).plan).toEqual([]);d.domains[1].key='stool';expect(()=>parseJointAnalysis(JSON.stringify(d))).toThrow();});
});

it('当日时段结束不伪装成今天的未来预测',()=>{const d=data();const w=routineWindow(d,new Date('2026-10-27T14:00:00Z'))!;expect(w.status).toBe('finished');expect(w.label).toContain('今天');expect(w.label).not.toContain('明天');});
it('正在预测窗口内的日历提醒仍在未来，跨日旧数据不沿用',()=>{const d=data(),now=new Date('2026-10-27T10:30:00Z'),w=routineWindow(d,now)!;expect(w.status).toBe('current');expect(w.at.getTime()).toBeGreaterThan(now.getTime());expect(routineWindow(d,new Date('2026-10-27T16:00:00Z'))).toBeNull();});

it('共同变化标记覆盖所有日期，单项变化或首日不误标',()=>{
 const d=data();const base=d.days[0];d.days=d.days.map(day=>({...base,date:day.date,stools:base.stools.map(s=>({...s,risk:'low' as const}))}));
 expect(highlightedDays(d)).toEqual([]);
 d.days[1].loggedMilkMl+=10;expect(highlightedDays(d)).toEqual([]);
 d.days[1].sleepHours+=.5;expect(highlightedDays(d)).toEqual([1,2]);
 d.days[4].stools[0].risk='watch';expect(highlightedDays(d)).toEqual([1,2,4]);
 d.days[0].stools[0].risk='high';expect(highlightedDays(d)).toEqual([0,1,2,4]);
});

it('今日密报优先展示有历史依据的晚间时段，没有依据不固定输出18点',()=>{const d=data();expect(routineWindow(d,now,18)).toMatchObject({start:18,end:21,status:'upcoming'});d.days.forEach(x=>x.stools=x.stools.filter(s=>Number(s.time.slice(0,2))<18));expect(routineWindow(d,now,18)?.start).not.toBe(18);});
