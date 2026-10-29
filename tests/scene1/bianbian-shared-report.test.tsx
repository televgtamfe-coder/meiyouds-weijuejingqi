import {render} from '@testing-library/react';
import {it,expect} from 'vitest';
import {ReportContent,BianbianReport} from '../../src/scenes/scene1/bianbian/BianbianReport';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport,normalizeReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('付费前共享正文与实际报告在相同数据下结构、内容完全一致',()=>{
 const record=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});
 const preview=render(<ReportContent record={record}/>);
 const expected=preview.container.querySelector('.br-report-paper')!.outerHTML;preview.unmount();
 const actual=render(<BianbianReport record={record} onShare={()=>{}} onDoctor={()=>{}} onEdit={()=>{}} jointLoading={false} jointError="" onJoint={()=>{}} onCancelJoint={()=>{}} saving={false}/>);
 expect(actual.container.querySelector('.br-report-paper')!.outerHTML).toBe(expected);
 expect(actual.container.querySelectorAll('.bs-overview-trends,.bs-joint-unified,.bt-report-joint')).toHaveLength(0);
 expect(actual.container.querySelector('.bs-observation-result')!.textContent).toContain('未见明显血丝、奶瓣、灰白色');
});
it('示例可隐藏时间，指标仅显示有无，详细状态仍保留',()=>{
 const record=makeRecord(normalizeReport({status:'success',risk_level:'green',objective_facts:{foreign_bodies:{main:'未见血丝、灰白色；疑似少量奶瓣。'}}}));
 const view=render(<ReportContent record={record} showTimestamp={false}/>);
 expect(view.container.querySelector('time')).toBeNull();
 expect(view.container.querySelector('.bs-risk-observations h4')).toBeNull();
 expect([...view.container.querySelectorAll('.bs-risk-observation strong')].map(e=>e.textContent)).toEqual(['无','有','无']);
 expect(view.container.querySelectorAll('.bs-risk-observation strong')[1]).toHaveAttribute('title','疑似少量');
 view.rerender(<ReportContent record={record}/>);
 expect(view.container.querySelector('.bs-report-meta time')).toBeInTheDocument();
});
