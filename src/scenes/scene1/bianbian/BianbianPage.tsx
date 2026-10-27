import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar';
import babyAvatar from '../../../assets/scene1-parenting/Ellipse_8_34771.png';
import { AnalysisForm, Report, analyze, demoReport, emptyForm, prepareImage } from './analysis';
import { BianbianIcon } from './BianbianIcon';
import { BianbianReport } from './BianbianReport';
import './bianbian.css';

const feedingOptions = [['pure_breast', '纯母乳'], ['pure_formula', '配方奶'], ['mixed', '混合喂养'], ['family_food', '普通饮食']];
const complementaryOptions = [['none', '未添加'], ['just_started', '刚开始添加'], ['established', '已规律添加']];
const symptoms = ['无以下情况', '发热', '呕吐', '精神差', '持续哭闹', '便中有血', '尿量减少'];
function Choice({ legend, value, options, onChange }: { legend: string; value: string; options: string[][]; onChange: (v: string) => void }) {
  return <fieldset className="bb-fieldset"><legend>{legend}<span className="bb-required">必填</span></legend><div className="bb-options">{options.map(([v, label]) => <button key={v} type="button" aria-pressed={value === v} className={value === v ? 'selected' : ''} onClick={() => onChange(v)}>{label}</button>)}</div></fieldset>;
}

export function BianbianPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AnalysisForm>({ ...emptyForm });
  const [image, setImage] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [demo, setDemo] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null), cameraInput = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const uploadVersion = useRef(0), feedback = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (error || question) feedback.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }); }, [error, question]);
  function update<K extends keyof AnalysisForm>(key: K, value: AnalysisForm[K]) { setForm(prev => ({ ...prev, [key]: value })); }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    const version = ++uploadVersion.current; setPreparing(true); setError('');
    try { const prepared = await prepareImage(file); if (alive.current && version === uploadVersion.current) setImage(prepared); }
    catch (e) { if (alive.current && version === uploadVersion.current) setError(e instanceof Error ? e.message : '照片读取失败，请换一张重试。'); }
    finally { if (alive.current && version === uploadVersion.current) setPreparing(false); }
  }
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  async function submit(event: FormEvent) {
    event.preventDefault(); if (loading || preparing) return;
    if (!image) return setError('请先添加一张清晰的便便照片。');
    if (!form.birthDate || form.birthDate > today || !form.feeding || !form.complementary || !form.frequency || !form.symptoms.length) return setError('请补全出生日期、喂养、辅食、排便次数和伴随情况。');
    if (!form.consent) return setError('请先阅读并勾选照片与信息使用说明。');
    const request = new AbortController(); controller.current = request;
    setLoading(true); setError(''); setQuestion('');
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; request.abort(); }, 90000);
    try {
      const result = await analyze(image, form, request.signal);
      if (!alive.current || request.signal.aborted) return;
      if (result.kind === 'unqualified') setError(result.question || '这张照片暂时无法识别，请在自然光下重新拍摄。');
      else if (result.kind === 'followup') setQuestion(result.question);
      else { setReport(result); setDemo(false); }
    } catch (e) {
      if (alive.current) setError(request.signal.aborted ? timedOut ? '等待时间较长，已停止等待。内容已保留，请稍后再试。' : '已停止等待，填写内容已保留。' : e instanceof Error ? e.message : '网络连接失败，请检查网络后重试。');
    } finally { window.clearTimeout(timeout); if (alive.current) setLoading(false); }
  }
  function back() { if (report) { setReport(null); setDemo(false); } else { controller.current?.abort(); navigate('/scene1-parenting'); } }
  return <div className="bb-page" data-testid="bianbian-page">
    <StatusBar />
    <header className="bb-nav"><button type="button" onClick={back} aria-label={report ? '返回分析表单' : '返回育儿'}><BianbianIcon type="back" /></button><h1>{report ? '便便分析报告' : '宝宝便便分析'}</h1><span>AI 辅助</span></header>
    {report ? <BianbianReport report={report} demo={demo} image={demo ? '' : image} onEdit={() => { setReport(null); setDemo(false); }} onHome={() => navigate('/scene1-parenting')} /> : <>
      <form id="bb-form" className="bb-scroll" onSubmit={submit}>
        <div className="bb-intro"><span className="bb-intro-icon"><BianbianIcon /></span><div><h2>看懂变化，照顾更有底</h2><p>上传照片，补充近况，一次查看分析</p></div></div>
        <section className="bb-card bb-photo-card">
          <div className="bb-section-heading"><h2><span className="bb-step">01</span>添加便便照片</h2><span className="bb-required">必填</span></div>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden aria-label="选择便便照片" />
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={upload} hidden aria-label="拍摄便便照片" />
          {image ? <div className="bb-photo-preview"><img src={image} alt="已选择的便便照片"/><button type="button" disabled={preparing || loading} onClick={() => photoInput.current?.click()}>更换照片</button></div> : <button className="bb-upload" type="button" disabled={preparing || loading} onClick={() => photoInput.current?.click()}><BianbianIcon type="camera"/><strong>{preparing ? '正在读取照片…' : '添加一张清晰照片'}</strong><span>支持 JPG / PNG / WebP，最大 10 MB</span></button>}
          <div className="bb-photo-actions"><button type="button" disabled={preparing || loading} onClick={() => cameraInput.current?.click()}><BianbianIcon type="camera"/>拍一张</button><button type="button" disabled={preparing || loading} onClick={() => photoInput.current?.click()}>从相册选择</button></div>
          <p className="bb-footnote">自然光下拍摄，便便完整入镜，避免滤镜与人脸。</p>
        </section>
        <section className="bb-card">
          <div className="bb-section-heading"><h2><span className="bb-step">02</span>宝宝基本情况</h2><img className="bb-mini-avatar" src={babyAvatar} alt=""/></div>
          <label className="bb-field"><span>出生日期<span className="bb-required">必填</span></span><input type="date" value={form.birthDate} max={today} min="2008-01-01" required onChange={e => update('birthDate', e.target.value)} /></label>
          <Choice legend="目前主要喂养方式" value={form.feeding} options={feedingOptions} onChange={v => update('feeding', v)} />
          {['pure_formula', 'mixed'].includes(form.feeding) && <label className="bb-field"><span>奶粉品牌或类型<span className="bb-optional">选填</span></span><input value={form.formula} maxLength={80} placeholder="如近期更换，可一起说明" onChange={e => update('formula', e.target.value)}/></label>}
          <Choice legend="辅食情况" value={form.complementary} options={complementaryOptions} onChange={v => update('complementary', v)} />
        </section>
        <section className="bb-card">
          <h2><span className="bb-step">03</span>这次有哪些变化</h2>
          <div className="bb-number-grid"><label className="bb-field"><span>近 24 小时排便<span className="bb-required">必填</span></span><div className="bb-unit-input"><input type="number" min="0" max="50" step="1" inputMode="numeric" placeholder="填写次数" required value={form.frequency} onChange={e => update('frequency', e.target.value)}/><span>次</span></div></label><label className="bb-field"><span>平时每天<span className="bb-optional">选填</span></span><div className="bb-unit-input"><input type="number" min="0" max="50" step="1" inputMode="numeric" placeholder="平时次数" value={form.baseline} onChange={e => update('baseline', e.target.value)}/><span>次</span></div></label></div>
          <fieldset className="bb-fieldset"><legend>伴随情况<span className="bb-required">必填，可多选</span></legend><div className="bb-options bb-symptoms">{symptoms.map(s => <button type="button" key={s} className={form.symptoms.includes(s) ? 'selected' : ''} aria-pressed={form.symptoms.includes(s)} onClick={() => update('symptoms', s === symptoms[0] ? [s] : form.symptoms.includes(s) ? form.symptoms.filter(x => x !== s) : [...form.symptoms.filter(x => x !== symptoms[0]), s])}>{s}</button>)}</div></fieldset>
          <label className="bb-field"><span>其他想补充的情况<span className="bb-optional">选填</span></span><textarea rows={3} maxLength={500} value={form.notes} placeholder="如持续时间、近期饮食变化、早产或过敏史" onChange={e => update('notes', e.target.value)} /><span className="bb-counter">{form.notes.length}/500</span></label>
        </section>
        <div ref={feedback} className="bb-feedback" aria-live="polite">{error && <div className="bb-error" role="alert">{error}</div>}{question && <div className="bb-followup"><strong>还需要补充一点信息</strong><p>{question}</p><p>请在上方补充说明中填写，再次提交即可。</p></div>}</div>
        <label className="bb-consent"><input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)}/><span>我同意将照片和填写信息提交至分析服务，照片与报告会保存于服务器。结果仅供参考，不用于诊断。</span></label>
        <button className="bb-example" type="button" onClick={() => { setDemo(true); setReport(demoReport); }}>先看看报告长什么样<span aria-hidden="true"> ›</span></button>
      </form>
      <footer className="bb-footer"><button form="bb-form" type="submit" className="bb-primary" disabled={loading || preparing}><BianbianIcon />{loading ? '正在分析…' : '开始分析'}</button><p>一次提交，直接查看结果</p></footer>
    </>}
    {loading && <div className="bb-loading" role="dialog" aria-modal="true" aria-labelledby="bb-loading-title" onKeyDown={e => { if (e.key === 'Tab') e.preventDefault(); if (e.key === 'Escape') controller.current?.abort(); }}><div className="bb-loading-card"><span className="bb-loading-icon"><BianbianIcon /></span><h2 id="bb-loading-title">正在认真查看</h2><p>结合照片和宝宝近况生成分析<br/>请稍等，通常需要几十秒</p><div className="bb-loading-line"/><button autoFocus type="button" onClick={() => controller.current?.abort()}>停止等待，返回填写</button></div></div>}
  </div>;
}
