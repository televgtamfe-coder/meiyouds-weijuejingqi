import {dayRisk,dayShort,trendRisks,trendRiskLabels} from './trendData';
import {deepAnalysisSections} from './deepAnalysis';
import {missingRiskMessage,riskQuantity} from './riskObservations';
import {displayCopy} from './presentationCopy';
import {riskObservations,indicatorDetails,overviewConclusion} from './reportSummary';
import {riskPresentation} from './riskPresentation';
import {importantActions} from './importantActions';
import { SavedReport,riskLabels,recordTimestamp } from './records';
import { referenceSources } from './referenceSources';
export function reportSections(record:SavedReport) {
 record=displayCopy(record);
 const r=record.report;
 return [
 {title:'本次分析结论',body:overviewConclusion(record)},
 {title:'重要指标解读',body:indicatorDetails(record).map(f=>`${f.label}：${f.value}${f.description?'\n'+f.description:''}`).join('\n\n')+'\n\n'+[...riskObservations(record).filter(x=>riskQuantity(x.value)).map(x=>`${x.label}：${riskQuantity(x.value)}`),missingRiskMessage(r)].filter(Boolean).join('；')+(r.risk==='red'?'\n请优先联系医生，不要等待再次拍照或 AI 分析。':'')},
 ...(record.regularitySnapshot?[{title:'便便规律性解读',body:record.regularitySnapshot.days.map(d=>d.stools.length?`${d.date} · ${d.stools.length}次 · ${trendRisks[dayRisk(d)].label}`:`${d.date} · 未记录`).join('\n')}]:[]),
 ...(r.question?[{title:'可补充的信息',body:r.question}]:[]),
 {title:'行动建议',body:importantActions(record).map((a,i)=>`${i+1}. ${a.title}\n${a.action}`).join('\n\n')||'本次未返回可用行动点。'},
 {title:'深度分析',body:deepAnalysisSections(record).map(s=>s.title+'\n'+s.body).join('\n\n')||'本次未返回进一步解读。'},
 {title:'育儿参考资料',body:'育儿科普资料\n'+referenceSources.map(x=>`${x.title}\n${x.url}`).join('\n\n')},
 ];
}
export function reportText(record:SavedReport){return ['便便分析报告',`${recordTimestamp(record.createdAt)}`,riskLabels[record.report.risk],...reportSections(record).map(s=>`${s.title}\n${s.body}`),'如宝宝出现不适，请及时咨询医生。'].join('\n\n');}
export async function reportImage(record:SavedReport):Promise<Blob>{
 await document.fonts?.ready;
 const width=900,pad=48,inner=width-pad*2,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('当前浏览器无法生成长图，请复制报告文字。');
 const font="'PingFang SC','Microsoft YaHei',sans-serif";
 function lines(text:string,size:number,max=inner-64){ctx!.font=`400 ${size}px ${font}`;const out:string[]=[];for(const paragraph of text.split('\n')){let line='';for(const ch of paragraph){if(ctx!.measureText(line+ch).width>max&&line){out.push(line);line=ch;}else line+=ch;}out.push(line);}return out;}
 const subheadings=new Set([...deepAnalysisSections(record).map(x=>x.title),...importantActions(record).map((x,i)=>`${i+1}. ${x.title}`)]);
 const sections=reportSections(record).map(s=>({...s,week:s.title==='便便规律性解读',lines:lines(s.title==='育儿参考资料'?'育儿科普资料\n'+referenceSources.map(x=>`${x.title}\n${new URL(x.url).hostname}`).join('\n\n')+'\n\n完整资料链接可在报告页面查看。':s.body,31)}));
 const bodyHeight=(value:string[])=>value.reduce((n,line)=>n+(line.trim()?55:22),0);
 const chartHeight=record.regularitySnapshot?590:0;
 const height=300+sections.reduce((sum,s)=>sum+(s.week?chartHeight:124+bodyHeight(s.lines)),0)+180;
 if(height>30000)throw new Error('报告内容较长，请使用复制文字保存完整内容。');
 canvas.width=width;canvas.height=height;ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 const text=(s:string,x:number,y:number,size:number,color='#323232',weight=400)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(s,x,y);};
 text('便便分析报告',pad,72,36,'#323232',500);
 text(recordTimestamp(record.createdAt),pad,118,23,'#999');
 const riskColor=riskPresentation[record.report.risk].color;
 text(riskLabels[record.report.risk],pad,168,26,riskColor,500);
 let y=214;

 function drawWeek(){if(record.regularitySnapshot){
  const data=record.regularitySnapshot;ctx.fillStyle='#fff6f9';ctx.beginPath();ctx.roundRect(pad,y,inner,560,24);ctx.fill();text('便便规律性解读',pad+28,y+49,38,'#323232',600);text('时间、次数与风险等级',pad+28,y+88,25,'#999');
  const left=pad+70,step=(inner-100)/7,top=y+120,bottom=y+390;
  [24,18,12,6,0].forEach(hour=>{const yy=bottom-hour/24*(bottom-top);ctx.strokeStyle='#e4dce1';ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(width-pad-24,yy);ctx.stroke();ctx.setLineDash([]);text(hour+'时',pad+16,yy+7,17,'#999');});
  data.days.forEach((d,i)=>{const x=left+(i+.5)*step;d.stools.forEach(e=>{const [h,m]=e.time.split(':').map(Number);ctx.fillStyle=trendRisks[e.risk].color;ctx.beginPath();ctx.roundRect(x-16,bottom-(h+m/60)/24*(bottom-top)-5,32,10,5);ctx.fill();});ctx.textAlign='center';text(dayShort(d.date),x,y+425,19,'#999');text(d.stools.length?d.stools.length+'次':'—',x,y+457,23);text(d.stools.length?trendRisks[dayRisk(d)].label:'未记录',x,y+488,20,trendRisks[dayRisk(d)].color);ctx.textAlign='left';});
  let lx=pad+28;(['low','watch','high'] as const).forEach(risk=>{ctx.fillStyle=trendRisks[risk].color;ctx.fillRect(lx,y+510,16,7);text(trendRiskLabels[risk],lx+24,y+520,18,'#777');lx+=185;});
  y+=chartHeight;
 }}

 for(const [index,s]of sections.entries()){
  if(s.week){drawWeek();continue;}

  const h=100+bodyHeight(s.lines);ctx.fillStyle=index===0?riskPresentation[record.report.risk].background:'#f7f7f9';
  ctx.beginPath();ctx.roundRect(pad,y,inner,h,24);ctx.fill();
  ctx.textAlign=index===0?'center':'left';
  text(index===0?riskLabels[record.report.risk]:s.title,index===0?width/2:pad+32,y+54,38,index===0?riskColor:'#323232',600);ctx.textAlign='left';
  let lineY=y+108;for(const line of s.lines){if(line.trim())text(line,pad+32,lineY,31,subheadings.has(line)?'#323232':'#666',subheadings.has(line)?600:400);lineY+=line.trim()?55:22;}
  y+=h+24;
 }
 text('便便分析报告',pad,y+30,23,'#999');
 text('如宝宝出现不适，请及时咨询医生。',pad,y+68,23,'#999');
 text('美柚育儿 · 便便分析',pad,y+118,23,'#ff4d88');
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('长图生成失败，请重试。')),'image/png'));
}
