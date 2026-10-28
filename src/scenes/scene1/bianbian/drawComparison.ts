import {TrendSet,dayShort} from './trendData';
import {relationTracks,focusDay,highlightedDays} from './visualTrends';
export function drawComparison(ctx:CanvasRenderingContext2D,data:TrendSet,left:number,top:number,width:number){
 const tracks=relationTracks(data),x=(i:number)=>left+65+i*(width-90)/6,selected=focusDay(data);
 const text=(s:string,xx:number,yy:number,size=20,color='#888')=>{ctx.fillStyle=color;ctx.font=`400 ${size}px 'PingFang SC','Microsoft YaHei',sans-serif`;ctx.fillText(s,xx,yy);};
 highlightedDays(data).forEach(i=>{ctx.fillStyle=i===selected?'#ffe8bd':'#fff4df';ctx.fillRect(x(i)-25,top+5,50,380);});
 tracks.forEach((s,k)=>{const base=top+110+k*130,y=(v:number)=>base-(v-s.min)/(s.max-s.min)*64;text(`${s.label} · ${s.unit}`,left,top+20+k*130,22,s.color);ctx.strokeStyle='#e3e3e8';ctx.beginPath();ctx.moveTo(left+40,base);ctx.lineTo(left+width,base);ctx.stroke();text(String(s.min),left,base,16);text(String(s.max),left,base-64,16);ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();s.values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.stroke();s.values.forEach((v,i)=>{ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(x(i),y(v),4,0,Math.PI*2);ctx.fill();ctx.textAlign='center';text(String(v),x(i),y(v)-12,19,s.color);ctx.textAlign='left';});});
 data.days.forEach((d,i)=>{ctx.textAlign='center';text(dayShort(d.date),x(i),top+405,18);});ctx.textAlign='left';ctx.lineWidth=1;text('黄底：同日两项及以上变化或便便关注日。',left,top+447,19);
}
