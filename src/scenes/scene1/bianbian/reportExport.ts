import { SavedReport,riskLabels,dateLabel } from './records';
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
 {title:'04 照护建议',body:r.actions.length?r.actions.map(a=>`${a.title}\n${a.items.map((x,i)=>`${i+1}. ${x}`).join('\n')}`).join('\n\n'):'本次未返回可用建议。如宝宝不适，请咨询医生。'},
 ...(r.question?[{title:'可补充的信息',body:r.question}]:[]),
 {title:'育儿参考资料',body:'以下为通用科普资料，不代表本次结果已逐条核对。\n'+referenceSources.map(x=>`${x.title}\n${x.url}`).join('\n\n')},
 ];
}
export function reportText(record:SavedReport){return ['美柚 · 宝宝便便分析',record.demo?'示例报告，未分析真实照片':`记录 ${record.id.slice(0,6).toUpperCase()} · ${dateLabel(record.createdAt)}`,record.demo?'示例内容':riskLabels[record.report.risk],...reportSections(record).map(s=>`${s.title}\n${s.body}`),'仅供育儿记录和信息参考，不用于诊断。请结合宝宝状态咨询医生。'].join('\n\n');}
export async function reportImage(record:SavedReport):Promise<Blob>{
 await document.fonts?.ready;
 const width=900,pad=48,inner=width-pad*2,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('当前浏览器无法生成长图，请复制报告文字。');
 const font="'PingFang SC','Microsoft YaHei',sans-serif";
 function lines(text:string,size:number,max=inner-64){ctx!.font=`400 ${size}px ${font}`;const out:string[]=[];for(const paragraph of text.split('\n')){let line='';for(const ch of paragraph){if(ctx!.measureText(line+ch).width>max&&line){out.push(line);line=ch;}else line+=ch;}out.push(line);}return out;}
 const sections=reportSections(record).map(s=>({...s,lines:lines(s.title==='育儿参考资料'?'通用科普资料，不代表本次结果已逐条核对。\n'+referenceSources.map(x=>`${x.title}\n${new URL(x.url).hostname}`).join('\n\n')+'\n\n完整资料链接可在报告页面查看。':s.body,25)}));
 const height=300+sections.reduce((sum,s)=>sum+106+s.lines.length*40,0)+180;
 if(height>30000)throw new Error('报告内容较长，请使用复制文字保存完整内容。');
 canvas.width=width;canvas.height=height;ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 const text=(s:string,x:number,y:number,size:number,color='#323232',weight=400)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(s,x,y);};
 text('美柚 · 宝宝便便分析',pad,72,36,'#323232',500);
 text(record.demo?'示例报告 · 未分析真实照片':`记录 ${record.id.slice(0,6).toUpperCase()} · ${dateLabel(record.createdAt)}`,pad,118,23,'#999');
 const riskColor=record.report.risk==='red'?'#c63c3c':record.report.risk==='orange'?'#b66b00':'#4f7cae';
 text(record.demo?'示例内容，不代表健康结论':riskLabels[record.report.risk],pad,168,26,riskColor,500);
 let y=214;
 for(const [index,s]of sections.entries()){
  const h=86+s.lines.length*40;ctx.fillStyle=index===0?(record.report.risk==='red'?'#fff0ed':'#fff0f6'):'#f7f7f9';
  ctx.beginPath();ctx.roundRect(pad,y,inner,h,24);ctx.fill();
  text(s.title,pad+32,y+49,28,index===0?'#b62c5e':'#323232',500);
  s.lines.forEach((line,i)=>text(line,pad+32,y+92+i*40,25,index===0?'#9a3156':'#555'));
  y+=h+24;
 }
 text('仅供育儿记录和信息参考，不用于诊断。',pad,y+30,23,'#999');
 text('请结合宝宝状态咨询医生。',pad,y+68,23,'#999');
 text('美柚育儿 · 便便分析',pad,y+118,23,'#ff4d88');
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('长图生成失败，请重试。')),'image/png'));
}
