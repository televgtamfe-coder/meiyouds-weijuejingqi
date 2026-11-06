import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,fireEvent,render,screen,within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {BianbianPage} from '../../src/scenes/scene1/bianbian/BianbianPage';
import {DemoFlowControl} from '../../src/scenes/scene1/bianbian/DemoFlowControl';
import {saveBabyProfile,mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {saveEntryStage} from '../../src/scenes/scene1/bianbian/entryFlow';
import {recordsKey} from '../../src/scenes/scene1/bianbian/records';
const next=()=>fireEvent.click(within(screen.getByRole('complementary',{name:'演示流程控制'})).getByRole('button',{name:'下一步'}));
beforeEach(()=>{localStorage.clear();sessionStorage.clear();saveBabyProfile(mockBabyProfile);saveEntryStage('ready');Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise(()=>{})},configurable:true});vi.stubGlobal('fetch',vi.fn());});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
function open(){const view=render(<MemoryRouter><BianbianPage/></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:'拍照分析'}));return view;}
it('相机授权未完成也可由独立按钮走完整演示，不调用接口、不写真实记录',()=>{
 open();expect(screen.getByRole('dialog',{name:'拍摄便便照片'})).toBeVisible();
 const original=localStorage.getItem('meiyou.bianbian.previous-bowel.v1');next();
 expect(screen.getByRole('heading',{name:'补充信息'})).toBeVisible();
 expect(screen.getByLabelText(/补充说明/)).toHaveValue('今天排便2次，颜色和稀稠程度与平时接近。');
 fireEvent.change(screen.getByLabelText(/补充说明/),{target:{value:'演示编辑'}});
 expect(localStorage.getItem('meiyou.bianbian.previous-bowel.v1')).toBe(original);
 next();expect(screen.getByRole('dialog',{name:'正在分析宝宝的便便'})).toBeVisible();
 next();expect(screen.getByRole('heading',{name:'便便分析报告'})).toBeVisible();
 expect(screen.getByRole('heading',{name:'深度分析'})).toBeVisible();
 expect(fetch).not.toHaveBeenCalled();expect(localStorage.getItem(recordsKey)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'结束演示'}));
 expect(screen.getByRole('heading',{name:'便便智能分析'})).toBeVisible();
 expect(screen.queryByRole('complementary',{name:'演示流程控制'})).not.toBeInTheDocument();
});
it('演示中的开始分析自动完成，不会误走真实模型',()=>{
 open();next();vi.useFakeTimers();fireEvent.click(screen.getByRole('button',{name:'开始分析'}));
 act(()=>vi.advanceTimersByTime(3500));
 expect(screen.getByRole('heading',{name:'便便分析报告'})).toBeVisible();expect(fetch).not.toHaveBeenCalled();
});
it('关闭相机不进入演示，独立组件可关闭',()=>{
 const page=open();fireEvent.click(screen.getByRole('button',{name:'关闭相机'}));
 expect(screen.queryByRole('complementary',{name:'演示流程控制'})).not.toBeInTheDocument();page.unmount();
 render(<DemoFlowControl step="camera" enabled={false} onNext={()=>{}}/>);
 expect(screen.queryByRole('button',{name:'下一步'})).not.toBeInTheDocument();
});

