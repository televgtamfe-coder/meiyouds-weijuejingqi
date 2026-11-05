import {reportDesign as D,reportDayLabel,reportHourLabel,formatReportText} from './reportDesign';
import {reportRegularity} from './reportRegularity';
import {dayRisk,trendRisks,trendRiskLabels} from './trendData';
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
 ...(r.question?[{title:'可补充的信息',body:r.question}]:[]),
 {title:'行动建议',body:importantActions(record).map((a,i)=>`${i+1}. ${a.title}\n${a.action}`).join('\n\n')||'本次未返回可用行动点。'},
 {title:'深度分析',body:deepAnalysisSections(record).map(s=>s.title+'\n'+s.body).join('\n\n')||'本次未返回进一步解读。'},
 {title:'便便规律性解读',body:(reportRegularity(record).source==='mock'?'7 天示例记录\n':'')+reportRegularity(record).days.map(d=>d.stools.length?`${d.date} · ${d.stools.length} 次 · ${trendRisks[dayRisk(d)].label}`:`${d.date} · 未记录`).join('\n')},
 {title:'育儿参考资料',body:'育儿科普资料\n'+referenceSources.map(x=>`${x.title}\n${x.url}`).join('\n\n')},
 ].map(section=>({...section,body:formatReportText(section.body)}));
}
export function reportText(record:SavedReport){return ['便便分析报告',`${recordTimestamp(record.createdAt)}`,riskLabels[record.report.risk],...reportSections(record).map(s=>`${s.title}\n${s.body}`),'如宝宝出现不适，请及时咨询医生。'].join('\n\n');}
export async function reportImage(record:SavedReport):Promise<Blob>{
 await document.fonts?.ready;
 record=displayCopy(record);
 const scale=2.4,width=900,pad=D.padding*scale,inner=width-pad*2,gap=D.gap*scale,inset=12*scale;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('当前浏览器无法生成长图，请复制报告文字。');
 const font=D.fontFamily;
 function wrap(value:string,size:number,max:number,weight=400){ctx!.font=`${weight} ${size*scale}px ${font}`;const out:string[]=[];for(const paragraph of formatReportText(value).split('\n')){let line='';for(const ch of paragraph){if(ctx!.measureText(line+ch).width>max&&line){out.push(line);line=ch;}else line+=ch;}out.push(line);}return out;}
 function text(value:string,x:number,y:number,size:number,color:string=D.primary,weight=400){ctx!.fillStyle=color;ctx!.font=`${weight} ${size*scale}px ${font}`;ctx!.fillText(value,x,y);}
 function box(x:number,y:number,w:number,h:number,color:string,r:number=D.radius){ctx!.fillStyle=color;ctx!.beginPath();ctx!.roundRect(x,y,w,h,r*scale);ctx!.fill();}
 const risk=riskPresentation[record.report.risk],contentWidth=inner-2*inset;
 const sections=reportSections(record);
 const planned=sections.map(s=>{
  if(s.title==='本次分析结论'){const lines=wrap(s.body,D.body,contentWidth);return {...s,kind:'summary',lines,height:(D.riskLine+12+D.bodyLine*lines.length+24)*scale};}
  if(s.title==='重要指标解读'){
   const facts=indicatorDetails(record).map(f=>({...f,valueLines:wrap(f.value,D.item,(contentWidth-8*scale)/2-2*inset,600),detailLines:f.description?wrap(f.description,D.support,(contentWidth-8*scale)/2-2*inset):[]}));
   const factHeight=Math.max(...facts.map(f=>(D.supportLine+4+D.itemLine*f.valueLines.length+(f.detailLines.length?4+D.supportLine*f.detailLines.length:0)+24)*scale));
   const missing=missingRiskMessage(record.report);const missingLines=missing?wrap(missing,D.support,contentWidth):[];
   return {...s,kind:'facts',facts,factHeight,missingLines,height:(D.titleLine+12+24+8+D.supportLine+4+D.itemLine+24)*scale+factHeight+missingLines.length*D.supportLine*scale};
  }
  if(s.title==='便便规律性解读')return {...s,kind:'chart',height:300*scale};
  const parts=s.title==='深度分析'?deepAnalysisSections(record).map(x=>({title:x.title,body:x.body})):s.title==='行动建议'?importantActions(record).map((a,i)=>({title:`${i+1}  ${a.title}`,body:a.action})):s.title==='育儿参考资料'?referenceSources.map(x=>({title:'',body:x.title+'\n'+new URL(x.url).hostname})):[{title:'',body:s.body}];
  const blocks=parts.map(p=>{const size=s.title==='育儿参考资料'?D.item:D.body;const lines=wrap(p.body,size,contentWidth-2*inset);return {...p,lines,size,height:2*inset+(p.title?(D.itemLine+8)*scale:0)+lines.length*(size===D.body?D.bodyLine:D.itemLine)*scale};});
  return {...s,kind:'blocks',blocks,height:(D.titleLine+12+24)*scale+blocks.reduce((n,b)=>n+b.height,0)+(blocks.length-1)*8*scale};
 });
 const top=100*scale,height=top+planned.reduce((n,p)=>n+p.height+gap,0)+70*scale;
 if(height>30000)throw new Error('报告内容较长，请使用复制文字保存完整内容。');
 canvas.width=width;canvas.height=Math.ceil(height);ctx.fillStyle=D.page;ctx.fillRect(0,0,width,height);
 text('便便分析报告',pad,36*scale,D.nav,D.primary,500);text(recordTimestamp(record.createdAt),pad,64*scale,D.support,D.muted);
 let y=top;
 for(const s of planned){
  box(pad,y,inner,s.height,s.kind==='summary'?risk.background:D.surface);
  if(s.kind==='summary'&&'lines'in s){ctx.textAlign='center';text(risk.label,width/2,y+inset+D.risk*scale,D.risk,risk.color,600);ctx.textAlign='left';let lineY=y+inset+(D.riskLine+12+D.body)*scale;s.lines.forEach(l=>{text(l,pad+inset,lineY,D.body,D.primary);lineY+=D.bodyLine*scale;});}
  else{
   text(s.title,pad+inset,y+inset+D.title*scale,D.title,D.primary,500);
   let cy=y+inset+(D.titleLine+12)*scale;
   if(s.kind==='facts'&&'facts'in s){
    const col=(contentWidth-8*scale)/2;
    s.facts.forEach((f,i)=>{const x=pad+inset+i*(col+8*scale);box(x,cy,col,s.factHeight,D.subtle,D.insetRadius);text(f.label,x+inset,cy+inset+D.support*scale,D.support,D.secondary);let fy=cy+inset+(D.supportLine+4+D.item)*scale;f.valueLines.forEach(l=>{text(l,x+inset,fy,D.item,D.primary,600);fy+=D.itemLine*scale;});if(f.detailLines.length)fy+=4*scale;f.detailLines.forEach(l=>{text(l,x+inset,fy,D.support,D.secondary);fy+=D.supportLine*scale;});});
    cy+=s.factHeight+8*scale;const riskHeight=(D.supportLine+4+D.itemLine+24)*scale;box(pad+inset,cy,contentWidth,riskHeight,D.subtle,D.insetRadius);
    riskObservations(record).filter(x=>riskQuantity(x.value)).forEach((r,i)=>{const x=pad+inset+inset+i*(contentWidth-2*inset)/3;text(r.label,x,cy+inset+D.support*scale,D.support,D.secondary);text(riskQuantity(r.value),x,cy+inset+(D.supportLine+4+D.item)*scale,D.item,D.primary,600);});
    cy+=riskHeight;for(const l of s.missingLines){cy+=D.supportLine*scale;text(l,pad+inset,cy,D.support,D.muted);}
   }else if(s.kind==='chart'){
    const data=reportRegularity(record);text(data.source==='mock'?'7 天示例记录':'近 7 天照片分析记录',pad+inset,cy+D.support*scale,D.support,D.muted);cy+=32*scale;
    const left=pad+inset+30*scale,right=width-pad-inset,step=(right-left)/7,plotH=135*scale;
    [24,18,12,6,0].forEach(hour=>{const yy=cy+(24-hour)/24*plotH;ctx.strokeStyle=D.line;ctx.setLineDash([3*scale,3*scale]);ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(right,yy);ctx.stroke();ctx.setLineDash([]);text(reportHourLabel(hour),pad+inset,yy+3*scale,10,D.muted);});
    data.days.forEach((d,i)=>{const x=left+(i+.5)*step;d.stools.forEach(e=>{const [h,m]=e.time.split(':').map(Number);box(x-6*scale,cy+(24-h-m/60)/24*plotH-2*scale,12*scale,4*scale,trendRisks[e.risk].color,2);});ctx.textAlign='center';text(reportDayLabel(d.date),x,cy+plotH+18*scale,10,D.muted);text(d.stools.length?d.stools.length+' 次':'—',x,cy+plotH+34*scale,12,D.primary);text(d.stools.length?trendRisks[dayRisk(d)].label:'未记录',x,cy+plotH+50*scale,9,trendRisks[dayRisk(d)].color);ctx.textAlign='left';});
    let lx=pad+inset;(['low','watch','high'] as const).forEach(r=>{box(lx,cy+plotH+65*scale,8*scale,4*scale,trendRisks[r].color,2);text(trendRiskLabels[r],lx+12*scale,cy+plotH+71*scale,D.label,D.secondary);lx+=91*scale;});
   }else if('blocks'in s){for(const block of s.blocks){if(s.title==='深度分析')box(pad+inset,cy,contentWidth,block.height,D.subtle,D.insetRadius);let by=cy+inset;if(block.title){text(block.title,pad+2*inset,by+D.item*scale,D.item,D.primary,500);by+=(D.itemLine+8)*scale;}for(const l of block.lines){text(l,pad+2*inset,by+block.size*scale,block.size,s.title==='育儿参考资料'?D.link:D.secondary);by+=(block.size===D.body?D.bodyLine:D.itemLine)*scale;}cy+=block.height+8*scale;}}
  }
  y+=s.height+gap;
 }
 text('如宝宝出现不适，请及时咨询医生。',pad,y+24*scale,D.label,D.muted);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('长图生成失败，请重试。')),'image/png'));
}
