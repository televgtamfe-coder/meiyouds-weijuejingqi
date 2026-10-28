import {beforeEach,describe,it,expect} from 'vitest';
import {loadBabyProfile,saveBabyProfile,mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {buildMetadata,emptyForm,demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {createMockTrends,mockDetailDefaults} from '../../src/scenes/scene1/bianbian/trendData';
import {parseJointAnalysis} from '../../src/scenes/scene1/bianbian/trendAnalysis';
import {makeRecord,recordTimestamp} from '../../src/scenes/scene1/bianbian/records';
beforeEach(()=>{sessionStorage.clear();localStorage.clear();});
describe('第四版资料、趋势和报告边界',()=>{
 it('默认自然分娩，确认后的剖宫产可保存重读',()=>{
  expect(loadBabyProfile().profile.deliveryMode).toBe('vaginal');
  saveBabyProfile({...mockBabyProfile,deliveryMode:'cesarean'});
  expect(loadBabyProfile().profile.deliveryMode).toBe('cesarean');
 });
 it('迁移旧档案保留昵称，同时要求确认新增分娩信息',()=>{
  sessionStorage.setItem('meiyou.bianbian.confirmed-profile.v3',JSON.stringify({...mockBabyProfile,nickname:'小宝',deliveryMode:undefined,version:3}));
  expect(loadBabyProfile()).toMatchObject({confirmed:false,profile:{nickname:'小宝',deliveryMode:'vaginal'}});
 });
 it('七天日期使用上海日期，缺失身高不插值成真实测量',()=>{
  const data=createMockTrends(new Date('2026-10-27T17:00:00Z'));
  expect(data.days).toHaveLength(7);expect(data.days[6].date).toBe('2026-10-28');
  expect(data.days.filter(d=>d.heightCm!==null)).toHaveLength(2);
  expect(data.source).toBe('mock');
 });
 it('选填默认数据保留模拟来源，基础表单不替代界面同意状态',()=>{
  const data=createMockTrends(new Date('2026-10-27T09:00:00Z'));
  const form={...emptyForm,...mockBabyProfile,...mockDetailDefaults(data),trendContext:data};
  expect(form.frequency).toBe('2');expect(form.consent).toBe(false);
  const meta=buildMetadata(form);
  expect(meta.delivery_mode).toBe('vaginal');expect(meta.trend_context.source).toBe('mock');
  expect(meta.mock_prefilled_fields).toContain('symptoms');
 });
 it('保存记录捕获昵称和趋势快照，显示时间不依赖设备时区',()=>{
  const profile={...mockBabyProfile,nickname:'小宝'};const trends=createMockTrends();
  const r=makeRecord(demoReport,'',false,{profile,trendSnapshot:trends});
  profile.nickname='改名后';trends.days[0].sleepHours=1;
  expect(r.babyName).toBe('小宝');expect(r.trendSnapshot?.days[0].sleepHours).not.toBe(1);
  expect(recordTimestamp('2026-10-27T09:56:24Z')).toBe('2026年10月27日17:56:24');
 });
 it('联合结果缺少必要领域不得冒充完整分析',()=>{
  expect(()=>parseJointAnalysis('{"summary":"一切正常"}')).toThrow();
  expect(()=>parseJointAnalysis('服务暂不可用')).toThrow();
 });
});
