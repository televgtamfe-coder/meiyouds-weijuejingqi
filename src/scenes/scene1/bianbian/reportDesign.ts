import type {CSSProperties} from 'react';
// Meiyou UI Kit 519 and Design System-meiyou-V1.0: shared screen/export tokens.
export const reportDesign={
 fontFamily:"'PingFang SC',-apple-system,BlinkMacSystemFont,'Microsoft YaHei','Segoe UI',sans-serif",
 page:'#f2f2f5',surface:'#ffffff',subtle:'#f7f7f9',primary:'#323232',secondary:'#666666',muted:'#999999',line:'rgba(0,0,0,.08)',brand:'#ff4d88',brandSoft:'rgba(255,77,136,.08)',link:'#4f7cae',
 nav:17,navLine:24,title:21,titleLine:26,body:17,bodyLine:25,item:15,itemLine:22,support:13,supportLine:20,label:12,labelLine:16,risk:28,riskLine:34,number:32,numberLine:36,
 radius:12,insetRadius:8,gap:12,padding:16,action:'#ad2d5a',axis:11,axisLine:16,buttonHeight:44,
} as const;
export const reportDesignVariables=Object.fromEntries(Object.entries(reportDesign).map(([key,value])=>['--mr-'+key,typeof value==='number'?value+'px':value])) as CSSProperties;
export const reportDayLabel=(date:string)=>date.slice(5).replace('-','/');
export const reportHourLabel=(hour:number)=>String(hour).padStart(2,'0')+':00';
export const REPORT_UNIT_PATTERN='毫升|小时|分钟|个月|星期|厘米|公斤|千克|毫克|周|月|年|日|秒|次|天|克|mL|ml|ML|cm|kg|mg|g|℃|°C|%';
export function formatReportText(text:string){return text.replace(new RegExp('(\\d+(?:\\.\\d+)?)\\s*('+REPORT_UNIT_PATTERN+')','g'),(_,n,u)=>n+'\u00a0'+(/^(?:毫升|ml)$/i.test(u)?'mL':u));}

export function reportDateLabel(value:string){return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",year:"numeric",month:"long",day:"numeric"}).format(new Date(value));}
