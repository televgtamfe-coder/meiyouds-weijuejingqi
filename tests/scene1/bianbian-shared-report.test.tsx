import {render} from '@testing-library/react';
import {it,expect} from 'vitest';
import {ReportContent,BianbianReport} from '../../src/scenes/scene1/bianbian/BianbianReport';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('付费前共享正文与实际报告在相同数据下结构、内容完全一致',()=>{
 const record=makeRecord(demoReport,'',true,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});
 const preview=render(<ReportContent record={record}/>);
 const expected=preview.container.querySelector('.br-report-paper')!.outerHTML;preview.unmount();
 const actual=render(<BianbianReport record={record} onShare={()=>{}} onDoctor={()=>{}} onEdit={()=>{}} jointLoading={false} jointError="" onJoint={()=>{}} onCancelJoint={()=>{}} saving={false}/>);
 expect(actual.container.querySelector('.br-report-paper')!.outerHTML).toBe(expected);
 expect(actual.container.querySelectorAll('.bs-overview-trends')).toHaveLength(0);
 expect(actual.container.querySelector('.bs-observation-result')!.textContent).toContain('未见明显血丝、奶瓣或灰白色');
});
