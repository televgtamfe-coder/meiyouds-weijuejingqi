import { FormEvent } from 'react';
import { AnalysisForm } from './analysis';
import { Icon } from './ui';
export const bowelOptions=[['diarrhea','腹泻'],['increased','次数增多'],['usual','和平时一样'],['decreased','次数减少'],['constipation','便秘']];
const symptoms=['无以下情况','发热','呕吐','精神差','持续哭闹','便中有血','尿量减少'];
export function BianbianDetails({image,form,onChange,onSubmit,onPhoto,error,question,busy,membershipSeen,onMember}:{image:string;form:AnalysisForm;onChange:(form:AnalysisForm)=>void;onSubmit:(e:FormEvent)=>void;onPhoto:()=>void;error:string;question:string;busy:boolean;membershipSeen:boolean;onMember:()=>void}) {
 function set<K extends keyof AnalysisForm>(key:K,value:AnalysisForm[K]){onChange({...form,[key]:value,mockFields:(form.mockFields||[]).filter(k=>k!==key)});}
 return <><form id="br-analysis" className="br-scroll br-details" onSubmit={onSubmit}>
  <div className="br-photo-preview"><img src={image} alt="已选择的便便照片"/><button type="button" onClick={onPhoto} disabled={busy}><Icon name="edit"/>更换照片</button></div>
  <p className="bt-prefill-note">以下内容已按示例预填，请确认或修改后再分析。</p><section className="br-details-card"><fieldset><legend>排便情况</legend><p>和宝宝平时相比，最近有什么变化？</p><div className="br-patterns" role="group" aria-label="排便变化">{bowelOptions.map(([v,label])=><button type="button" key={v} aria-pressed={form.bowelPattern===v} onClick={()=>set('bowelPattern',v)}>{label}</button>)}</div></fieldset>
   <div className="br-notes"><label htmlFor="br-notes">补充说明<span>选填</span></label><p>例如喂养变化、持续时间或不适表现</p><textarea id="br-notes" rows={4} maxLength={500} placeholder="在这里补充宝宝的近况…" value={form.notes} onChange={e=>set('notes',e.target.value)}/><small className="br-count">{form.notes.length}/500</small></div>
   <details className="br-more-details" open><summary>补充排便次数与伴随情况<span>选填</span></summary><div className="br-number-fields"><label>近 24 小时排便<input type="number" inputMode="numeric" min="0" max="50" step="1" placeholder="次数" value={form.frequency} onChange={e=>set('frequency',e.target.value)}/></label><label>平时每天<input type="number" inputMode="numeric" min="0" max="50" step="1" placeholder="次数" value={form.baseline} onChange={e=>set('baseline',e.target.value)}/></label></div><p className="br-support">伴随情况，可多选</p><div className="br-symptoms">{symptoms.map(s=><button type="button" key={s} aria-pressed={form.symptoms.includes(s)} onClick={()=>set('symptoms',s===symptoms[0]?[s]:form.symptoms.includes(s)?form.symptoms.filter(x=>x!==s):[...form.symptoms.filter(x=>x!==symptoms[0]),s])}>{s}</button>)}</div></details>
  </section>
  <div className="br-feedback" aria-live="polite">{error&&<p className="br-error" role="alert">{error}</p>}{question&&<section className="br-followup"><strong>还需要补充一点信息</strong><p>{question}</p><p>请在补充说明中填写后重新提交。</p></section>}</div>
  <label className="br-consent"><input type="checkbox" checked={form.consent} onChange={e=>set('consent',e.target.checked)}/><span>同意将照片和填写资料提交分析。照片与报告会保存在服务器，分析仅供参考，不用于诊断。</span></label>
 </form><footer className="br-action-footer"><button form="br-analysis" type={membershipSeen?'submit':'button'} onClick={membershipSeen?undefined:onMember} className="br-primary" disabled={busy}>{busy?'正在读取照片…':membershipSeen?'开始分析':'立即开通会员'}</button></footer></>;
}
