import {beforeEach,expect,it,vi} from 'vitest';
import {render} from '@testing-library/react';
import {EntryPreview} from '../../src/scenes/scene1/bianbian/EntryPreview';
import {createEntrySample,entrySampleConclusion} from '../../src/scenes/scene1/bianbian/entrySample';
import {regularityTrend} from '../../src/scenes/scene1/bianbian/regularity';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
it('首次示例固定完整结论和指标下方的七天18次规律，真实记录仍不受示例影响',()=>{
 const {container}=render(<EntryPreview onBack={()=>{}} onActivate={()=>{}}/>);
 expect(container.querySelector('.bs-observation-result p')?.textContent).toBe(entrySampleConclusion);
 const chart=container.querySelector('.bt-stool-card')||container.querySelector('svg[aria-label*="时间、次数"]')?.closest('section');
 expect(chart).toBeTruthy();
 expect(container.querySelector('.bs-important-indicators')?.nextElementSibling).toBe(chart);
 expect(container.querySelectorAll('[data-stool-risk]')).toHaveLength(18);
 expect(entrySampleConclusion.length).toBeGreaterThan(100);
 expect(regularityTrend([])).toBeUndefined();
});
it('跨日期与重新进入都使用同一份样例，修改副本不会污染固定内容',()=>{
 const first=createEntrySample();
 vi.useFakeTimers();vi.setSystemTime(new Date('2027-01-01'));
 try {expect(createEntrySample()).toEqual(first);} finally {vi.useRealTimers();}
 first.regularitySnapshot!.days[0].stools=[];
 expect(createEntrySample().regularitySnapshot!.days.every(d=>d.stools.length>0)).toBe(true);
});
