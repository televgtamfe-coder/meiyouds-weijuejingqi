import {describe,it,expect,vi} from 'vitest';
import {wrapReportRuns,wrapReportText} from '../../src/scenes/scene1/bianbian/reportExportLayout';
import {reportImage} from '../../src/scenes/scene1/bianbian/reportExport';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {reportDesign as D,formatReportText} from '../../src/scenes/scene1/bianbian/reportDesign';
import {riskPresentation} from '../../src/scenes/scene1/bianbian/riskPresentation';
import {reportRegularity} from '../../src/scenes/scene1/bianbian/reportRegularity';

const measure=(text:string,strong=false)=>Array.from(text).length*(strong?2:1);
const plain=(lines:ReturnType<typeof wrapReportRuns>)=>lines.map(line=>line.map(run=>run.text).join(''));

describe('报告导出文字布局',()=>{
 it('将逗号句号和右括号留在上一行且不丢失文字',()=>{
  const value='观察正常，继续记录。（留意变化）';
  const lines=wrapReportText(value,5,measure);
  expect(lines.join('')).toBe(value);
  expect(lines.every(line=>! /^[，。；：！？、）】》”’]/.test(line))).toBe(true);
  expect(lines.every(line=>! /[（【《“‘]$/.test(line))).toBe(true);
  expect(lines.every(line=>measure(line)<=5)).toBe(true);
 });
 it('数字和单位一起换行并保持规范化后的完整文本',()=>{
  const lines=wrapReportText('奶量增加150ml，睡眠减少1.5小时。',8,measure);
  expect(lines.join('')).toBe(formatReportText('奶量增加150ml，睡眠减少1.5小时。'));
  expect(lines.some(line=>line.includes(formatReportText('150ml')))).toBe(true);
  expect(lines.some(line=>line.includes(formatReportText('1.5小时')))).toBe(true);
  expect(lines.every(line=>measure(line)<=8)).toBe(true);
 });
 it.each([
  ['观察2周',3,'2周'],
  ['持续10分钟',5,'10分钟'],
  ['温度38.5°C',7,'38.5°C'],
  ['观察2星期',4,'2星期'],
  ['体重增加500克',5,'500克'],
 ])('保留完整单位：%s', (value,width,quantity)=>{
  const lines=wrapReportText(value,Number(width),measure);
  expect(lines.join('')).toBe(formatReportText(value));
  expect(lines.some(line=>line.includes(formatReportText(String(quantity))))).toBe(true);
  expect(lines.every(line=>measure(line)<=Number(width))).toBe(true);
 });
 it('按实际字重宽度换行并在跨行后保留强调范围',()=>{
  const lines=wrapReportRuns([{text:'普通',strong:false},{text:'风险增加，',strong:true},{text:'继续记录。',strong:false}],8,measure);
  expect(plain(lines).join('')).toBe('普通风险增加，继续记录。');
  expect(lines.every(line=>line.reduce((sum,run)=>sum+run.width,0)<=8)).toBe(true);
  expect(lines.flat().filter(run=>run.strong).map(run=>run.text).join('')).toBe('风险增加，');
  expect(lines.flat().filter(run=>!run.strong).map(run=>run.text).join('')).toBe('普通继续记录。');
 });
 it('保留段落和空行，极窄布局也不会丢失完整数字单位',()=>{
  expect(wrapReportText('第一段\n\n第二段',10,measure)).toEqual(['第一段','','第二段']);
  expect(wrapReportText('150mL',2,measure)).toEqual([formatReportText('150mL')]);
 });
 it('超长英文可降级换行，保留强调和结尾标点且不溢出',()=>{
  const value='abcdefghijklmnopqrstuvwx。';
  const lines=wrapReportRuns([{text:value,strong:true}],12,measure);
  expect(plain(lines).join('')).toBe(value);
  expect(lines.every(line=>line.reduce((sum,run)=>sum+run.width,0)<=12)).toBe(true);
  expect(lines.flat().every(run=>run.strong)).toBe(true);
  expect(plain(lines).every(line=>!line.startsWith('。'))).toBe(true);
 });
 it.each([['观察2周',3,'2周'],['持续10分钟',4,'10分钟'],['温度38.5°C',6,'38.5°C']])('未经格式化的量值仍保持一组：%s',(value,width,quantity)=>{
  const lines=plain(wrapReportRuns([{text:String(value)}],Number(width),measure));
  expect(lines.join('')).toBe(value);
  expect(lines.some(line=>line.includes(String(quantity)))).toBe(true);
 });
});

it.each(['red','orange','green'] as const)('%s导出保留风险样式、优先提示、序号和图表总次数，文字不少于11px',async(level)=>{
 const record=makeRecord({...demoReport,risk:level,detail:'血丝表现需要关注，建议记录后续变化。'},'',true);
 record.regularitySnapshot=reportRegularity(record);
 record.regularitySnapshot.days[0].stools=[];
 const drawn:{value:string;font:string;color:unknown}[]=[];
 const dots:unknown[]=[];
 const context={font:'',fillStyle:'',textAlign:'left',strokeStyle:'',fillText(value:string){drawn.push({value,font:this.font,color:this.fillStyle});},measureText(value:string){return {width:Array.from(value).length*parseFloat(this.font.split(' ')[1])*0.55};},fillRect(){},beginPath(){},roundRect(_x:number,_y:number,w:number,h:number){if(w===6*2.4&&h===6*2.4)dots.push(this.fillStyle);},fill(){},setLineDash(){},moveTo(){},lineTo(){},stroke(){}};
 const getContext=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
 const toBlob=vi.spyOn(HTMLCanvasElement.prototype,'toBlob').mockImplementation(callback=>callback(new Blob(['image'],{type:'image/png'})));
 try{
  expect((await reportImage(record)).type).toBe('image/png');
  expect(drawn.some(item=>item.value.includes('血丝')&&item.font.startsWith('600 ')&&item.color===riskPresentation[level].color)).toBe(true);
  expect(drawn.filter(item=>item.value==='1'&&item.color===D.brand)).toHaveLength(2);
  expect(drawn.some(item=>item.value===String(reportRegularity(record).days.reduce((sum,day)=>sum+day.stools.length,0))&&item.font.includes(`${D.number*2.4}px`)&&item.color===D.action)).toBe(true);
  expect(drawn.every(item=>parseFloat(item.font.split(' ')[1])/2.4>=11)).toBe(true);
  expect(dots[0]).toBe(D.muted);
  expect(drawn.every(item=>item.color!==D.muted)).toBe(true);
  const priority=level==='red'?'请优先联系医生，不要等待进一步分析。':level==='orange'?'请优先咨询医生，结合宝宝实际状态评估。':'';
  const beforeConclusion=drawn.slice(0,drawn.findIndex(item=>item.value===riskPresentation[level].label)).map(item=>item.value).join('');
  if(priority)expect(beforeConclusion).toContain(priority);
  else expect(beforeConclusion).not.toMatch(/请优先联系医生|请优先咨询医生/);
 }finally{getContext.mockRestore();toBlob.mockRestore();}
});
