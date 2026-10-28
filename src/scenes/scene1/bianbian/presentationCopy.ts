// Remove generic relationship boilerplate from display copy, preserving observed facts.
export function cleanReportCopy(text:string){
 const parts=text.split(/([，,；;。！？\n]+)/),out:string[]=[];
 const generic=/可能(?:存在)?(?:有关联|关联)|(?:不能|无法|不应|不可|不代表|不等于|不意味着).{0,8}因果|(?:共同|同期|同步|同日)变化.{0,8}因果/;
 for(let i=0;i<parts.length;i+=2){if(parts[i].trim()&&!generic.test(parts[i]))out.push(parts[i]+(parts[i+1]||''));}
 return out.join('').replace(/[，,；;]+(?=[。！？\n]|$)/g,'。').trim();
}
export function displayCopy<T>(value:T):T{
 if(typeof value==='string')return cleanReportCopy(value) as T;
 if(Array.isArray(value))return value.map(x=>displayCopy(x)) as T;
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,displayCopy(v)])) as T;
 return value;
}
