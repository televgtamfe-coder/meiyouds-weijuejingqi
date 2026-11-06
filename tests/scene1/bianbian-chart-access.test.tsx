import {it,expect} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {StoolWeekChart} from '../../src/scenes/scene1/bianbian/TrendCharts';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
import {recordTimestamp} from '../../src/scenes/scene1/bianbian/records';
import {reportDateLabel} from '../../src/scenes/scene1/bianbian/reportDesign';
it('紧凑报告也可按日期读取风险及每次时间，不依赖色点',()=>{
 const data=createMockTrends(new Date('2026-11-06T10:00:00+08:00'));
 data.days[0].stools=[{time:'09:15',color:'red',risk:'high'}];
 const view=render(<StoolWeekChart data={data} compact/>);
 fireEvent.change(screen.getByRole('combobox',{name:'查看某日便便记录'}),{target:{value:'0'}});
 expect(view.container.querySelector('.bt-selected-day strong')?.textContent).toBe('建议就医');
 expect(view.container.querySelector('[aria-live=polite]')?.textContent).toContain('09:15');
 expect(view.container.querySelector('[aria-live=polite]')?.textContent).toContain('建议就医');
 data.days[1].stools=[];view.rerender(<StoolWeekChart data={data} compact/>);
 fireEvent.change(screen.getByRole('combobox'),{target:{value:'1'}});
 expect(view.container.querySelector('.bt-selected-day strong')?.textContent).toBe('未记录');
 expect(screen.getByText('当天暂无照片分析记录')).toBeInTheDocument();cleanup();
});
it('报告与历史使用相同的上海日期，不影响时分秒',()=>{
 const value='2026-11-05T17:02:03Z';
 expect(reportDateLabel(value)).toBe('2026年11月6日');
 expect(recordTimestamp(value)).toBe('2026年11月6日 01:02:03');
});
