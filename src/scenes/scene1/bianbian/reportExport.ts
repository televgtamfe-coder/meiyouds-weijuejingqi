import {importantActions} from './importantActions';
import {dayRisk,dayShort,stoolColors,trendRisks} from './trendData';
import {drawComparison} from './drawComparison';
import { SavedReport,riskLabels,recordTimestamp } from './records';
import { referenceSources } from './referenceSources';
export function reportSections(record:SavedReport) {
 const r=record.report;
 const color=r.facts.find(f=>f.label==='颜色'),texture=r.facts.find(f=>f.label==='性状');
 const factText=(f:typeof color)=>f?[f.value,f.detail,f.comparison].filter(Boolean).join('\n'):'本次未返回该项描述。';
 const others=r.facts.filter(f=>!['颜色','性状'].includes(f.label));
 return [
 {title:'观察总结',body:[r.summary,r.detail, r.risk==='red'?'请优先联系医生，不要等待再次拍照或 AI 分析。':''].filter(Boolean).join('\n')},
 {title:'01 颜色观察',body:factText(color)},
 {title:'02 性状细节',body:factText(texture)},
 {title:'03 参考解读',body:[r.cause,...r.evidence,...others.map(f=>`${f.label}：${factText(f)}`)].filter(Boolean).join('\n')||'本次未返回进一步解读。'},
 ...(r.question?[{title:'可补充的信息',body:r.question}]:[]),
 ...(record.jointAnalysis?[{title:'成长联合分析 · 模拟记录',body:'同日变化提醒：便便、奶量与睡眠。仅用于模拟演示。'},{title:'这些变化可能有关联',body:record.jointAnalysis.relationships.join('\n\n')},{title:'联合分析的边界',body:record.jointAnalysis.limitations.join('\n')+'\n'+record.jointAnalysis.alert}]:record.trendSnapshot?[{title:'成长联合分析',body:'本次保存时尚未生成联合分析结果；上方趋势图为独立模拟记录，不代表本次照片观察。'}]:[]),
 {title:'04 重要行动点',body:importantActions(record).map((a,i)=>`${i+1}. ${a.title}\n${a.action}`).join('\n\n')||'本次未返回可用行动点。'},
 {title:'育儿参考资料',body:'以下为通用科普资料，不代表本次结果已逐条核对。\n'+referenceSources.map(x=>`${x.title}\n${x.url}`).join('\n\n')},
 ];
}
export function reportText(record:SavedReport){return ['美柚 · 宝宝便便分析',`${record.babyName||'宝宝'} ${recordTimestamp(record.createdAt)}${record.demo?' · 示例报告，未分析真实照片':''}`,record.demo?'示例内容':riskLabels[record.report.risk],...(record.trendSnapshot?['近7天便便规律 · 模拟记录',...record.trendSnapshot.days.map(d=>`${d.date} ${d.stools.length}次，模拟风险${trendRisks[dayRisk(d)].label}：${d.stools.map(e=>e.time+' '+stoolColors[e.color].label).join('、')}；体重${d.weightKg===null?'未测量':d.weightKg+'kg'}，已记录奶量${d.loggedMilkMl}ml，睡眠${d.sleepHours}小时，夜醒${d.nightWakings}次`)]:[]),...reportSections(record).map(s=>`${s.title}\n${s.body}`),'仅供育儿记录和信息参考，不用于诊断。请结合宝宝状态咨询医生。'].join('\n\n');}
export async function reportImage(record:SavedReport):Promise<Blob>{
 await document.fonts?.ready;
 const width=900,pad=48,inner=width-pad*2,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('当前浏览器无法生成长图，请复制报告文字。');
 const font="'PingFang SC','Microsoft YaHei',sans-serif";
 function lines(text:string,size:number,max=inner-64){ctx!.font=`400 ${size}px ${font}`;const out:string[]=[];for(const paragraph of text.split('\n')){let line='';for(const ch of paragraph){if(ctx!.measureText(line+ch).width>max&&line){out.push(line);line=ch;}else line+=ch;}out.push(line);}return out;}
 const sections=reportSections(record).map(s=>({...s,comparison:s.title==='成长联合分析 · 模拟记录'&&!!record.trendSnapshot,lines:lines(s.title==='育儿参考资料'?'通用科普资料，不代表本次结果已逐条核对。\n'+referenceSources.map(x=>`${x.title}\n${new URL(x.url).hostname}`).join('\n\n')+'\n\n完整资料链接可在报告页面查看。':s.body,25)}));
 const chartHeight=record.trendSnapshot?590:0;
 const height=300+chartHeight+sections.reduce((sum,s)=>sum+106+s.lines.length*40+(s.comparison?520:0),0)+180;
 if(height>30000)throw new Error('报告内容较长，请使用复制文字保存完整内容。');
 canvas.width=width;canvas.height=height;ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 const text=(s:string,x:number,y:number,size:number,color='#323232',weight=400)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(s,x,y);};
 text('美柚 · 宝宝便便分析',pad,72,36,'#323232',500);
 text(`${(record.babyName||'宝宝').slice(0,20)} ${recordTimestamp(record.createdAt)}`,pad,118,23,'#999');
 const riskColor=record.report.risk==='red'?'#c63c3c':record.report.risk==='orange'?'#b66b00':'#4f7cae';
 text(record.demo?'示例内容，不代表健康结论':riskLabels[record.report.risk],pad,168,26,riskColor,500);
 let y=214;
 if(record.trendSnapshot){
  const data=record.trendSnapshot;ctx.fillStyle='#fff6f9';ctx.beginPath();ctx.roundRect(pad,y,inner,560,24);ctx.fill();text('近 7 天便便规律 · 模拟记录',pad+28,y+45,28,'#bd3565',500);text('时间、次数、颜色与风险等级',pad+28,y+80,21,'#999');
  const left=pad+70,step=(inner-100)/7,top=y+120,bottom=y+390;
  [24,18,12,6,0].forEach(hour=>{const yy=bottom-hour/24*(bottom-top);ctx.strokeStyle='#e4dce1';ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(width-pad-24,yy);ctx.stroke();ctx.setLineDash([]);text(hour+'时',pad+16,yy+7,17,'#999');});
  data.days.forEach((d,i)=>{const x=left+(i+.5)*step;d.stools.forEach(e=>{const [h,m]=e.time.split(':').map(Number);ctx.fillStyle=stoolColors[e.color].fill;ctx.beginPath();ctx.roundRect(x-16,bottom-(h+m/60)/24*(bottom-top)-5,32,10,5);ctx.fill();});ctx.textAlign='center';text(dayShort(d.date),x,y+425,19,'#999');text(d.stools.length+'次',x,y+457,23);text(trendRisks[dayRisk(d)].label,x,y+488,20,trendRisks[dayRisk(d)].color);ctx.textAlign='left';});
  let lx=pad+28;[...new Set(data.days.flatMap(d=>d.stools.map(e=>e.color)))].forEach(color=>{ctx.fillStyle=stoolColors[color].fill;ctx.fillRect(lx,y+510,16,7);text(stoolColors[color].label,lx+24,y+520,18,'#777');lx+=112;});
  text('风险为独立模拟标签，颜色不能单独判断健康。',pad+28,y+547,18,'#999');y+=chartHeight;
 }

 for(const [index,s]of sections.entries()){
  const h=86+s.lines.length*40+(s.comparison?520:0);ctx.fillStyle=index===0?(record.report.risk==='red'?'#fff0ed':'#fff0f6'):'#f7f7f9';
  ctx.beginPath();ctx.roundRect(pad,y,inner,h,24);ctx.fill();
  text(s.title,pad+32,y+49,28,index===0?'#b62c5e':'#323232',500);
  s.lines.forEach((line,i)=>text(line,pad+32,y+92+i*40,25,index===0?'#9a3156':'#555'));
  if(s.comparison&&record.trendSnapshot)drawComparison(ctx,record.trendSnapshot,pad+32,y+100+s.lines.length*40,inner-64);
  y+=h+24;
 }
 text('仅供育儿记录和信息参考，不用于诊断。',pad,y+30,23,'#999');
 text('请结合宝宝状态咨询医生。',pad,y+68,23,'#999');
 text('美柚育儿 · 便便分析',pad,y+118,23,'#ff4d88');
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('长图生成失败，请重试。')),'image/png'));
}
