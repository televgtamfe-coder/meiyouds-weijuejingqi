import {afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,act} from '@testing-library/react';
import {createMockTrends,monthComparisonSummary} from '../../src/scenes/scene1/bianbian/trendData';
import {relativeChange,comparisonSeries} from '../../src/scenes/scene1/bianbian/trendComparison';
import {TrendDashboard} from '../../src/scenes/scene1/bianbian/TrendCharts';
import {AnalysisWaiting} from '../../src/scenes/scene1/bianbian/AnalysisWaiting';
afterEach(()=>vi.useRealTimers());
describe('联合趋势与精简布局',()=>{
 it('不同单位按自身起点比较，保留缺失体重，不除零',()=>{
  expect(relativeChange([2,4,2])).toEqual([0,100,0]);expect(relativeChange([0,3,null])).toEqual([null,null,null]);
  const series=comparisonSeries(createMockTrends());
  expect(series.find(s=>s.key==='weight')?.changes).toEqual([0,null,null,null,null,null,1.5]);
  expect(series.find(s=>s.key==='feeding')?.changes[4]).toBe(-9);
 });
 it('三类详情默认收起，首页恢复七天规律并展示月度指标',()=>{
  const view=render(<TrendDashboard data={createMockTrends()} onAnalyze={()=>{}}/>);
  expect(view.container.querySelectorAll('.bt-growth-card:not([open]),.bt-mini-card:not([open])')).toHaveLength(3);
  expect(screen.getByRole('region',{name:'月度变化对比'})).toBeVisible();
  expect(screen.getByRole('button',{name:'智能联合分析'})).toBeVisible();
 });
 it('月度对比使用相同天数且缺测不补数',()=>{
  const data=createMockTrends(new Date('2026-10-27T10:00:00Z')),months=data.months!;
  expect(months.previous.days).toHaveLength(30);expect(months.current.days).toHaveLength(27);
  const summary=monthComparisonSummary(months);expect(summary.previous.days).toBe(27);expect(summary.current.days).toBe(27);
  expect(months.current.days[21].weightKg).toBe(null);expect(months.current.days[26]).toEqual(data.days[6]);
  expect(comparisonSeries(months.current,true)).toHaveLength(5);
 });
 it('大小月只比较共同天数，跨年月份正确',()=>{
  const march=createMockTrends(new Date('2027-03-31T10:00:00Z')).months!;expect(march.previous.days.length).toBe(28);expect(march.comparisonDays).toBe(28);
  const january=createMockTrends(new Date('2027-01-02T10:00:00Z'));expect(january.months?.previous.label).toBe('2026年12月');expect(january.months?.current.days.length).toBe(2);
 });
 it('等待说明逐步变化，长时间等待保持未完成状态',()=>{
  vi.useFakeTimers();const view=render(<AnalysisWaiting kind="joint"/>);
  expect(screen.getByText(/将便便、奶量和睡眠/)).toBeVisible();
  act(()=>vi.advanceTimersByTime(6000));expect(screen.getByText(/重点关注同时出现的变化/)).toBeVisible();
  act(()=>vi.advanceTimersByTime(6000));expect(screen.getByText(/呈现同一天的变化/)).toBeVisible();
  act(()=>vi.advanceTimersByTime(12000));expect(screen.getByText(/仍在等待分析结果/)).toBeVisible();
  view.unmount();expect(vi.getTimerCount()).toBe(0);
 });
});
