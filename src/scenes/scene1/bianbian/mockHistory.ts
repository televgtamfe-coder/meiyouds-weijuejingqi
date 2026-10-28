import {BabyProfile} from './babyProfile';
import {SavedReport} from './records';
import {TrendSet} from './trendData';
export function mockHistory(profile:BabyProfile,data:TrendSet):SavedReport[]{
 const states=[{risk:'green' as const,title:'低风险',color:'黄色',texture:'糊状'},{risk:'yellow' as const,title:'需要关注',color:'绿色',texture:'偏稀'},{risk:'red' as const,title:'建议就医',color:'待复核',texture:'待评估'}];
 return states.map((s,i)=>({id:`mock-history-${data.days[6-i].date}-${s.risk}`,createdAt:new Date(`${data.days[6-i].date}T12:00:00+08:00`).toISOString(),demo:true,thumbnail:'',babyName:profile.nickname,profileSnapshot:profile,report:{kind:'report',risk:s.risk,summary:`模拟状态：${s.title}`,detail:'这是一条用于展示历史报告样式的模拟记录，未分析真实照片，不代表宝宝健康情况。',question:'',cause:'',evidence:[],actions:[],facts:[{label:'颜色',value:s.color,detail:'模拟标签，不用于判断风险。',comparison:''},{label:'性状',value:s.texture,detail:'模拟标签，仅作页面展示。',comparison:''}]}}));
}
export function historyMonthDay(value:string){const parts=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).formatToParts(new Date(value));return `${parts.find(p=>p.type==='month')!.value}月${parts.find(p=>p.type==='day')!.value}日`;}
