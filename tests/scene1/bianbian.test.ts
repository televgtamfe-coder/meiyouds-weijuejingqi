import { describe, it, expect } from 'vitest';
import { normalizeReport, buildMetadata } from '../../src/scenes/scene1/bianbian/analysis';

describe('便便分析数据边界', () => {
  it('风险缺失绝不默认健康，不补正常描述', () => {
    const r = normalizeReport({ status: 'success', objective_facts: {}, core_conclusion: {} });
    expect(r.risk).toBe('unknown');
    expect(r.facts[0].value).toBe('未提供');
    expect(r.summary).not.toContain('正常');
  });
  it('保留红色风险和 comparison，不被安慰话覆盖', () => {
    const r = normalizeReport({ status: 'success', risk_level: 'red',
      objective_facts: { color: { main: '红色', comparison: '颜色异常' } },
      emergency_handling: ['优先处理项'], core_conclusion: { summary: '需要关注' } });
    expect(r.risk).toBe('red');
    expect(r.facts[0].comparison).toBe('颜色异常');
    expect(r.actions[0].items).toEqual(['优先处理项']);
  });
  it('拒绝非报告结果，识别不合格图片与待补充信息', () => {
    expect(() => normalizeReport({ error: 'upstream' })).toThrow();
    expect(() => normalizeReport(null)).toThrow();
    expect(normalizeReport({ status: 'unqualified', message: '请重新拍摄' }).kind).toBe('unqualified');
    expect(normalizeReport({ status: 'success', follow_up_question: '是否近期更换奶粉？' }).kind).toBe('followup');
  });
  it('高风险即使附带追问，也先呈现风险报告', () => {
    expect(normalizeReport({ status: 'success', risk_level: 'red', follow_up_question: '还想确认什么？' }).kind).toBe('report');
  });
  it('将真实出生日期、年龄和伴随情况一起发送，不读取首页示例年龄', () => {
    const m = buildMetadata({ birthDate: '2026-07-01', feeding: 'pure_breast', complementary: 'none',
      frequency: '5', baseline: '2', symptoms: ['发热'], notes: '昨晚开始', formula: '', consent: true }, new Date('2026-10-27T12:00:00'));
    expect(m.birthDate).toBe('2026-07-01');
    expect(m.age_days).toBe(118);
    expect(m.daily_frequency).toBe(5);
    expect(m.baseline_frequency).toBe(2);
    expect(m.symptoms).toEqual(['发热']);
    expect(m.additional_notes).toBe('昨晚开始');
  });
});
