import {emptyForm,AnalysisForm} from './analysis';
import {createEntrySample} from './entrySample';
import poopIcon from '../../../assets/scene1-habit/habit-poop.png';

export const demoPhoto = poopIcon;
export function createDemoDraft():AnalysisForm {
 const sample=createEntrySample();
 return {...emptyForm,...sample.profileSnapshot,profileSource:'demo',bowelPattern:'usual',frequency:'2',baseline:'2',symptoms:['无以下情况'],notes:'今天排便2次，颜色和稀稠程度与平时接近。',consent:true,trendContext:sample.trendSnapshot};
}
// Fixed sample is never passed to saveRecord or the real analysis endpoint.
export function createDemoResult(){return createEntrySample();}
