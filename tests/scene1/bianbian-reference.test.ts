import {mockHistory,historyMonthDay} from '../../src/scenes/scene1/bianbian/mockHistory';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildMetadata, emptyForm, demoReport } from '../../src/scenes/scene1/bianbian/analysis';
import { toggleAllergy, loadBabyProfile, saveBabyProfile, mockBabyProfile } from '../../src/scenes/scene1/bianbian/babyProfile';
import { loadRecords, saveRecord, makeRecord, recordsKey } from '../../src/scenes/scene1/bianbian/records';
import { reportText } from '../../src/scenes/scene1/bianbian/reportExport';
beforeEach(() => sessionStorage.clear());
describe('参考版资料和记录边界', () => {
 it('没有过敏与不确定不能和具体过敏项并存', () => {
  expect(toggleAllergy(['none'], 'milk')).toEqual(['milk']);
  expect(toggleAllergy(['milk'], 'nuts')).toEqual(['milk','nuts']);
  expect(toggleAllergy(['milk','nuts'], 'unsure')).toEqual(['unsure']);
  expect(toggleAllergy(['unsure'], 'none')).toEqual(['none']);
 });
 it('损坏或未来出生日期不能直接跳过确认', () => {
  saveBabyProfile({ ...mockBabyProfile, birthDate: '2099-01-01' });
  expect(loadBabyProfile().confirmed).toBe(false);
 });
 it('请求发送过敏和排便变化，未填次数不伪造为0', () => {
  const m = buildMetadata({ ...emptyForm, birthDate:'2026-06-27',feeding:'mixed',complementary:'none',bowelPattern:'increased',allergies:['milk'],profileSource:'mock_confirmed' });
  expect(m.bowel_pattern).toBe('increased'); expect(m.allergies).toEqual(['milk']);
  expect(m).not.toHaveProperty('daily_frequency');
  expect(buildMetadata({...emptyForm, frequency:'0'}).daily_frequency).toBe(0);
 });
 it('示例报告不进入历史，损坏记录忽略，真实记录能重读', () => {
  const record = makeRecord(demoReport, '', true);
  expect(saveRecord(record)).toBe(false); expect(loadRecords()).toEqual([]);
  sessionStorage.setItem(recordsKey,'[{"id":"bad","report":{}}]');
  expect(loadRecords()).toEqual([]);
  const actual = makeRecord(demoReport, '', false);
  expect(saveRecord(actual)).toBe(true); expect(loadRecords()[0].id).toBe(actual.id);
 });
 it('导出包含风险和真实内容，不使用正常模板覆盖', () => {
  const actual = makeRecord({...demoReport,risk:'red',summary:'需要立即评估',detail:'测试返回说明'},'',false);
  const text = reportText(actual);
  expect(text).toContain('建议就医');expect(text).toContain('请优先联系医生'); expect(text).toContain('需要立即评估');
  expect(text).not.toContain('小柚子'); expect(text).not.toContain('data:image');
 });
});

it('三个不同状态的历史示例不写入真实历史，仅格式化月日',()=>{const entries=mockHistory(mockBabyProfile,createMockTrends(new Date('2026-10-28T04:00:00Z')));expect(entries).toHaveLength(3);expect(new Set(entries.map(r=>r.report.risk)).size).toBe(3);expect(entries.every(r=>r.demo&&!saveRecord(r))).toBe(true);expect(loadRecords()).toHaveLength(0);expect(historyMonthDay(entries[0].createdAt)).toBe('10月28日');});
