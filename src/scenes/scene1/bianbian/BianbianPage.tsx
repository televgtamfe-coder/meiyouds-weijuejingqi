import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar';
import babyAvatar from '../../../assets/scene1-parenting/Ellipse_8_34771.png';
import { AnalysisForm, Report, analyze, demoReport, emptyForm, prepareImage } from './analysis';
import { BianbianIcon } from './BianbianIcon';
import { BianbianReport } from './BianbianReport';
import { BabyProfile, babyAge, profileSummary, loadBabyProfile, saveBabyProfile } from './babyProfile';
import { BabyProfileSheet } from './BabyProfileSheet';
import { BottomSheet } from './BottomSheet';
import { KitIcon } from './KitIcon';
import './bianbian.css';

const symptoms = ['无以下情况', '发热', '呕吐', '精神差', '持续哭闹', '便中有血', '尿量减少'];

export function BianbianPage() {
  const navigate = useNavigate();
  const [initial] = useState(loadBabyProfile);
  const [profile, setProfile] = useState<BabyProfile>(initial.profile);
  const [profileConfirmed, setProfileConfirmed] = useState(initial.confirmed);
  const [profileOpen, setProfileOpen] = useState(!initial.confirmed);
  const [photoOpen, setPhotoOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<AnalysisForm>({ ...emptyForm, ...initial.profile, profileSource: 'mock_confirmed' });
  function confirmProfile(next: BabyProfile) {
    setProfile(next); saveBabyProfile(next); setProfileConfirmed(true); setProfileOpen(false);
    setForm(prev => ({ ...prev, ...next }));
  }
  function closeProfile() { if (!profileConfirmed) navigate('/scene1-parenting'); else setProfileOpen(false); }

  const [image, setImage] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { contentRef.current?.toggleAttribute('inert', profileOpen || photoOpen || loading); }, [profileOpen, photoOpen, loading]);

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
    if (!profileConfirmed) { setProfileOpen(true); return; }
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
    <div className="bb-main" ref={contentRef} aria-hidden={profileOpen || photoOpen || loading ? true : undefined}>
    <StatusBar />
    <header className="bb-nav"><button type="button" onClick={back} aria-label={report ? '返回分析表单' : '返回育儿'}><BianbianIcon type="back" /></button><h1>{report ? '便便分析报告' : '宝宝便便分析'}</h1><span>AI 分析</span></header>
    {report ? <BianbianReport report={report} demo={demo} image={demo ? '' : image} onEdit={() => { setReport(null); setDemo(false); }} onHome={() => navigate('/scene1-parenting')} /> : <>
      <form id="bb-form" className="bb-scroll" onSubmit={submit}>
        <section className="bb-profile-summary">
          <img src={babyAvatar} alt=""/>
          <div><div className="bb-profile-name"><strong>{profile.nickname}</strong><span>{babyAge(profile.birthDate)}</span><span className="bb-mock-tag">示例</span></div><p>{profileSummary(profile)}</p></div>
          <button type="button" aria-label="修改宝宝信息" onClick={() => setProfileOpen(true)}>修改<span aria-hidden="true"> ›</span></button>
        </section>
        <section className="bb-card bb-photo-card">
          <div className="bb-section-heading"><h2>便便照片</h2><span className="bb-required">必填</span></div>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden aria-label="选择便便照片" />
          <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={upload} hidden aria-label="拍摄便便照片" />
          {image ? <div className="bb-photo-preview"><img src={image} alt="已选择的便便照片"/><button type="button" disabled={preparing || loading} onClick={() => setPhotoOpen(true)}>更换照片</button></div> : <button className="bb-upload" aria-label="添加照片" type="button" disabled={preparing || loading} onClick={() => setPhotoOpen(true)}><span className="bb-camera-tile"><KitIcon name="camera"/></span><strong>{preparing ? '正在读取照片…' : '添加照片'}</strong><span>自然光下拍摄，让便便完整入镜</span></button>}
          <p className="bb-footnote">避免滤镜与人脸 · 支持 JPG / PNG / WebP，最大 10 MB</p>
        </section>
        <section className="bb-card">
          <h2>这次的排便情况</h2>
          <div className="bb-number-grid"><label className="bb-field"><span>近 24 小时排便<span className="bb-required">必填</span></span><div className="bb-unit-input"><input type="number" min="0" max="50" step="1" inputMode="numeric" placeholder="填写次数" required value={form.frequency} onChange={e => update('frequency', e.target.value)}/><span>次</span></div></label><label className="bb-field"><span>平时每天<span className="bb-optional">选填</span></span><div className="bb-unit-input"><input type="number" min="0" max="50" step="1" inputMode="numeric" placeholder="平时次数" value={form.baseline} onChange={e => update('baseline', e.target.value)}/><span>次</span></div></label></div>
          <fieldset className="bb-fieldset"><legend>伴随情况<span className="bb-required">必填，可多选</span></legend><div className="bb-options bb-symptoms">{symptoms.map(s => <button type="button" key={s} className={form.symptoms.includes(s) ? 'selected' : ''} aria-pressed={form.symptoms.includes(s)} onClick={() => update('symptoms', s === symptoms[0] ? [s] : form.symptoms.includes(s) ? form.symptoms.filter(x => x !== s) : [...form.symptoms.filter(x => x !== symptoms[0]), s])}>{s}</button>)}</div></fieldset>
          <label className="bb-field"><span>近期饮食或其他变化<span className="bb-optional">选填</span></span><textarea rows={3} maxLength={500} value={form.notes} placeholder="如持续时间、近期饮食变化、早产或过敏史" onChange={e => update('notes', e.target.value)} /><span className="bb-counter">{form.notes.length}/500</span></label>
        </section>
        <div ref={feedback} className="bb-feedback" aria-live="polite">{error && <div className="bb-error" role="alert">{error}</div>}{question && <div className="bb-followup"><strong>还需要补充一点信息</strong><p>{question}</p><p>请在上方补充说明中填写，再次提交即可。</p></div>}</div>
        <label className="bb-consent"><input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)}/><span>我同意将照片和填写信息提交至分析服务，照片与报告会保存于服务器。结果仅供参考，不用于诊断。</span></label>
        <button className="bb-example" type="button" onClick={() => { setDemo(true); setReport(demoReport); }}>先看看报告长什么样<span aria-hidden="true"> ›</span></button>
      </form>
      <footer className="bb-footer"><button form="bb-form" type="submit" className="bb-primary" disabled={loading || preparing}>{loading ? '正在分析…' : '开始分析'}</button><p>一次提交，直接查看结果</p></footer>
    </>}
    </div>
    {profileOpen && <BabyProfileSheet profile={profile} first={!profileConfirmed} onConfirm={confirmProfile} onClose={closeProfile} />}
    {photoOpen && <BottomSheet title="添加便便照片" onClose={() => setPhotoOpen(false)} className="bb-photo-sheet"><div className="bb-sheet-handle"/><h2>添加便便照片</h2><button type="button" className="bb-sheet-option" onClick={() => { setPhotoOpen(false); cameraInput.current?.click(); }}>拍照</button><button type="button" className="bb-sheet-option" onClick={() => { setPhotoOpen(false); photoInput.current?.click(); }}>从相册选择</button><button type="button" className="bb-sheet-cancel" onClick={() => setPhotoOpen(false)}>取消</button></BottomSheet>}
    {loading && <div className="bb-loading" role="dialog" aria-modal="true" aria-labelledby="bb-loading-title" onKeyDown={e => { if (e.key === 'Tab') e.preventDefault(); if (e.key === 'Escape') controller.current?.abort(); }}><div className="bb-loading-card"><span className="bb-loading-icon"><BianbianIcon /></span><h2 id="bb-loading-title">正在认真查看</h2><p>结合照片和宝宝近况生成分析<br/>请稍等，通常需要几十秒</p><div className="bb-loading-line"/><button autoFocus type="button" onClick={() => controller.current?.abort()}>停止等待，返回填写</button></div></div>}
  </div>;
}
