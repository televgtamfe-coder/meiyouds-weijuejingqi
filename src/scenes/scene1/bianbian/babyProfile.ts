import { AnalysisForm } from './analysis';
export type BabyProfile = Pick<AnalysisForm, 'birthDate' | 'feeding' | 'complementary' | 'formula'> & { nickname: string; allergies: string[]; deliveryMode:'vaginal'|'cesarean' };
export const profileKey = 'meiyou.bianbian.confirmed-profile.v4';
export const deliveryOptions=[['vaginal','自然分娩'],['cesarean','剖宫产']] as const;
export const feedingOptions = [['pure_breast', '纯母乳喂养'], ['pure_formula', '纯配方奶喂养'], ['mixed', '混合喂养']];
export const complementaryOptions = [['none', '未添加辅食'], ['just_started', '刚开始添加辅食'], ['established', '已添加辅食']];
export const allergyOptions = [['none','无已知过敏'],['milk','牛奶及乳制品'],['nuts','花生及坚果'],['gluten','小麦等谷物蛋白（麸质）'],['unsure','不确定']];
export const mockFormula='皇家美素佳尔3段';
export const mockBabyProfile: BabyProfile = { nickname:'小柚子', deliveryMode:'vaginal', birthDate:'2026-06-27', feeding:'mixed', complementary:'none', formula:mockFormula, allergies:['none'] };
export function withMockFormula(profile:BabyProfile):BabyProfile{return {...profile,formula:profile.formula.trim()||(['mixed','pure_formula'].includes(profile.feeding)?mockFormula:'')};}
export function validBirthDate(value: unknown) {
 if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const date = new Date(`${value}T00:00:00`);
 return Number.isFinite(date.getTime()) && date.getFullYear() === Number(value.slice(0,4)) && date.getMonth()+1 === Number(value.slice(5,7)) && date.getDate() === Number(value.slice(8)) && value >= '2008-01-01' && date <= new Date();
}
export function toggleAllergy(current: string[], value: string) {
 if (value === 'none' || value === 'unsure') return [value];
 const list = current.filter(x => x !== 'none' && x !== 'unsure');
 return list.includes(value) ? list.filter(x => x !== value) : [...list, value];
}
export function loadBabyProfile(): {profile: BabyProfile; confirmed: boolean; needsBasicInfo:boolean} {
 let hadStored=false;
 try {
  let stored:string|null=null;try{stored=localStorage.getItem(profileKey);}catch{}
  const raw=stored || sessionStorage.getItem(profileKey) || sessionStorage.getItem('meiyou.bianbian.confirmed-profile.v3');hadStored=!!raw;const p=JSON.parse(raw||'null');
  if((p?.version===4||p?.version===3) && typeof p.nickname==='string' && p.nickname.trim() && p.nickname.length<=12 && validBirthDate(p.birthDate) && feedingOptions.some(([v])=>v===p.feeding) && complementaryOptions.some(([v])=>v===p.complementary) && Array.isArray(p.allergies) && p.allergies.length>0 && p.allergies.every((v: unknown)=>allergyOptions.some(([a])=>v===a)) && !(p.allergies.length>1 && p.allergies.some((v:string)=>v==='none'||v==='unsure'))) {
   return {profile:withMockFormula({nickname:p.nickname,birthDate:p.birthDate,feeding:p.feeding,complementary:p.complementary,formula:typeof p.formula==='string'?p.formula:'',allergies:p.allergies,deliveryMode:p.deliveryMode==='cesarean'?'cesarean':'vaginal'}),needsBasicInfo:!['vaginal','cesarean'].includes(p.deliveryMode),confirmed:p.version===4&&['vaginal','cesarean'].includes(p.deliveryMode)};
  }
 } catch { /* A disabled or corrupt session never bypasses confirmation. */ }
 return {profile:{...mockBabyProfile,allergies:[...mockBabyProfile.allergies]},confirmed:false,needsBasicInfo:hadStored};
}
export function saveBabyProfile(profile:BabyProfile) { const value=JSON.stringify({...profile,version:4,source:'mock'});for(const getStorage of [()=>localStorage,()=>sessionStorage]){try{getStorage().setItem(profileKey,value);}catch{/* Current page keeps the confirmed profile in memory. */}} }
export function babyAge(birthDate:string,now=new Date()) {
 const birth=new Date(`${birthDate}T00:00:00`);
 const months=(now.getFullYear()-birth.getFullYear())*12+now.getMonth()-birth.getMonth()-(now.getDate()<birth.getDate()?1:0);
 if(months<1) return `${Math.max(0,Math.floor((now.getTime()-birth.getTime())/86400000))}天`;
 return `${months}个月`;
}
export const profileSummary=(p:BabyProfile)=>[feedingOptions.find(([v])=>v===p.feeding)?.[1],complementaryOptions.find(([v])=>v===p.complementary)?.[1]].join(' · ');
export const allergySummary=(p:BabyProfile)=>p.allergies.map(v=>allergyOptions.find(([key])=>key===v)?.[1]).filter(Boolean).join('、');

export const allergyTag=(p:BabyProfile)=>p.allergies.includes('none')?'无已知过敏':p.allergies.includes('unsure')?'过敏情况不确定':allergySummary(p)?`${allergySummary(p)}过敏`:'未填写过敏情况';
