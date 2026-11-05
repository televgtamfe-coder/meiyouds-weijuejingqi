import type {CSSProperties} from 'react';
// Meiyou UI Kit 519 and Design System-meiyou-V1.0: shared screen/export tokens.
export const reportDesign={
 fontFamily:"'PingFang SC','Microsoft YaHei',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
 page:'#f2f2f5',surface:'#ffffff',subtle:'#f7f7f9',primary:'#323232',secondary:'#666666',muted:'#999999',line:'rgba(0,0,0,.08)',brand:'#ff4d88',brandSoft:'rgba(255,77,136,.08)',link:'#4f7cae',
 nav:17,navLine:24,title:21,titleLine:26,body:17,bodyLine:25,item:15,itemLine:22,support:13,supportLine:20,label:12,labelLine:16,risk:28,riskLine:34,number:32,numberLine:36,
 radius:12,insetRadius:8,gap:12,padding:16,
} as const;
export const reportDesignVariables=Object.fromEntries(Object.entries(reportDesign).map(([key,value])=>['--mr-'+key,typeof value==='number'?value+'px':value])) as CSSProperties;
export const reportDayLabel=(date:string)=>date.slice(5).replace('-','/');
export const reportHourLabel=(hour:number)=>String(hour).padStart(2,'0')+':00';
export function formatReportText(text:string){return text.replace(/(\d+(?:\.\d+)?)\s*(毫升|ml|mL|ML|小时|次|天|个月|厘米|公斤|cm|kg|℃)/g,(_,n,u)=>n+' '+(/^(?:毫升|ml)$/i.test(u)?'mL':u));}
