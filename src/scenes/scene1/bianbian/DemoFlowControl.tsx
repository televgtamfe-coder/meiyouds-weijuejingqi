import {createPortal} from 'react-dom';
import {reportDesignVariables} from './reportDesign';
import './demoFlow.css';

// The presentation control can be removed independently of the real capture flow.
export const DEMO_FLOW_ENABLED = true;
export const DEMO_CONTROL_ID = 'bianbian-demo-control';
export type DemoStep = 'camera'|'details'|'waiting'|'complete';
const hints:Record<DemoStep,string>={camera:'预置照片进入补充信息',details:'预置数据进入分析',waiting:'直接查看预置报告',complete:'预置报告展示完成'};
export function DemoFlowControl({step,onNext,enabled=DEMO_FLOW_ENABLED}:{step:DemoStep|null;onNext:()=>void;enabled?:boolean}) {
 if(!enabled||!step)return null;
 return createPortal(<aside id={DEMO_CONTROL_ID} className="bd-demo-control" style={reportDesignVariables} aria-label="演示流程控制">
  <div><strong>演示流程</strong><span>{hints[step]}</span></div>
  <button type="button" onClick={onNext}>{step==='complete'?'结束演示':'下一步'}</button>
 </aside>,document.body);
}
