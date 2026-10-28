import {Risk} from './analysis';
export const riskPresentation:Record<Risk,{label:string;color:string;background:string;doctor:boolean}>={
 green:{label:'低风险',color:'#23866c',background:'#edf8f3',doctor:false},
 yellow:{label:'需要关注',color:'#387cb6',background:'#edf5fc',doctor:false},
 unknown:{label:'需要关注',color:'#387cb6',background:'#edf5fc',doctor:false},
 orange:{label:'建议就医',color:'#c74858',background:'#fff0f1',doctor:true},
 red:{label:'建议就医',color:'#c74858',background:'#fff0f1',doctor:true},
};
