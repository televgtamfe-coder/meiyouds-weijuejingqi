import {formatReportText,REPORT_UNIT_PATTERN} from './reportDesign';

export type ReportTextRun={text:string;strong?:boolean};
export type MeasuredReportRun={text:string;strong:boolean;width:number};
type MeasureText=(text:string,strong:boolean)=>number;

export function wrapReportRuns(runs:ReportTextRun[],maxWidth:number,measure:MeasureText):MeasuredReportRun[][]{
 const glyphs=runs.flatMap(run=>Array.from(run.text,text=>({text,strong:!!run.strong})));
 const paragraphs:typeof glyphs[]=[[]];
 for(const glyph of glyphs){if(glyph.text==='\n')paragraphs.push([]);else paragraphs[paragraphs.length-1].push(glyph);}
 const measured=(line:typeof glyphs)=>{
  const result:MeasuredReportRun[]=[];
  for(const glyph of line){const last=result[result.length-1];if(last&&last.strong===glyph.strong)last.text+=glyph.text;else result.push({...glyph,width:0});}
  return result.map(run=>({...run,width:measure(run.text,run.strong)}));
 };
 return paragraphs.flatMap(paragraph=>{
  // Number + unit and Latin words are indivisible. Attach closing punctuation
  // to the preceding token and opening punctuation to the following token.
  const tokens=paragraph.map(glyph=>glyph.text).join('').match(new RegExp(`\\d+(?:\\.\\d+)?(?:[ \\t\\u00a0]*(?:${REPORT_UNIT_PATTERN}))?|[a-zA-Z]+|[^\\n]`,'gu'))||[];
  const units:typeof glyphs[]=[];let offset=0;
  for(const token of tokens){
   const length=Array.from(token).length,unit=paragraph.slice(offset,offset+length);offset+=length;
   const previous=units[units.length-1];
   if(previous&&(/^[，。；：！？、）】》”’…,.!?;:)}\]]/.test(token)||/[（【《“‘({\[]$/.test(previous.map(g=>g.text).join(''))))previous.push(...unit);
   else units.push(unit);
  }
  const fittingUnits=units.flatMap(unit=>{
   if(unit.some(glyph=>/\d/.test(glyph.text))||measured(unit).reduce((sum,run)=>sum+run.width,0)<=maxWidth)return [unit];
   // A long Latin word can wrap by character, while its closing punctuation
   // and opening brackets still obey the same line-breaking rules.
   const pieces:typeof glyphs[]=[];
   for(const glyph of unit){const previous=pieces[pieces.length-1];if(previous&&(/^[，。；：！？、）】》”’…,.!?;:)}\]]/.test(glyph.text)||/[（【《“‘({\[]$/.test(previous.map(g=>g.text).join(''))))previous.push(glyph);else pieces.push([glyph]);}
   return pieces;
  });
  const lines:MeasuredReportRun[][]=[];let line:typeof glyphs=[];
  for(const unit of fittingUnits){
   const candidate=measured([...line,...unit]);
   if(line.length&&candidate.reduce((sum,run)=>sum+run.width,0)>maxWidth){lines.push(measured(line));line=[...unit];}
   else line.push(...unit);
  }
  // An atom wider than the entire column remains intact rather than dropping
  // content or splitting a number from its unit. Normal report columns fit it.
  lines.push(measured(line));return lines;
 });
}
export function wrapReportText(value:string,maxWidth:number,measure:MeasureText){
 return wrapReportRuns([{text:formatReportText(value)}],maxWidth,measure).map(line=>line.map(run=>run.text).join(''));
}
