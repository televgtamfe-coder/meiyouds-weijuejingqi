import {TrendSet,dayShort} from './trendData';
import {comparisonSeries,comparisonScale} from './trendComparison';
export function drawComparison(ctx:CanvasRenderingContext2D,data:TrendSet,left:number,top:number,width:number){
 const series=comparisonSeries(data),scale=comparisonScale(data),plotLeft=left+74,plotRight=left+width-14,plotTop=top+60,plotBottom=top+300;
 const x=(i:number)=>plotLeft+i*(plotRight-plotLeft)/6,y=(v:number)=>plotBottom-(v-scale.min)/(scale.max-scale.min)*(plotBottom-plotTop);
 const text=(s:string,x:number,y:number,size=21,color='#999')=>{ctx.fillStyle=color;ctx.font=`400 ${size}px 'PingFang SC','Microsoft YaHei',sans-serif`;ctx.fillText(s,x,y);};
 text('四类变化趋势 · 相对各自起点的变化',left,top+24,25,'#666');
 for(const v of scale.ticks){ctx.strokeStyle='#e3dce0';ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(plotLeft,y(v));ctx.lineTo(plotRight,y(v));ctx.stroke();text(`${v>0?'+':''}${v}%`,left,y(v)+7,19);}
 for(const s of series){const pts=s.changes.map((v,i)=>v===null?null:{x:x(i),y:y(v)}).filter((p):p is {x:number;y:number}=>p!==null);ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.setLineDash(s.dash?s.dash.split(' ').map(Number).map(v=>v*2):[]);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);for(const p of pts){ctx.fillStyle='white';ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();ctx.stroke();}}
 ctx.lineWidth=1;ctx.setLineDash([]);data.days.forEach((d,i)=>{ctx.textAlign='center';text(dayShort(d.date),x(i),top+333,19);});ctx.textAlign='left';
 series.forEach((s,i)=>{const lx=left+(i%2)*(width/2),ly=top+375+Math.floor(i/2)*36;ctx.fillStyle=s.color;ctx.fillRect(lx,ly-9,14,8);text(`${s.label} ${s.values[6]===null?'未测量':s.values[6]+' '+s.unit}`,lx+24,ly,21,'#666');});
 text('图例为最后一天数值。体重虚线仅连接两次测量。',left,top+454,19);text('奶量不含未量化亲喂；共同变化不代表因果。',left,top+482,19);
}
