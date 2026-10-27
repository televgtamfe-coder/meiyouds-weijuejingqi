import { FormEvent, useState } from 'react';
import { BabyProfile, feedingOptions, complementaryOptions } from './babyProfile';
import { BottomSheet } from './BottomSheet';
import babyAvatar from '../../../assets/scene1-parenting/Ellipse_8_34771.png';

export function BabyProfileSheet({ profile, first, onConfirm, onClose }: { profile: BabyProfile; first: boolean; onConfirm: (p: BabyProfile) => void; onClose: () => void }) {
  const [draft, setDraft] = useState({ ...profile });
  const [error, setError] = useState('');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.nickname.trim() || !draft.birthDate || draft.birthDate > today) return setError('请检查宝宝昵称和出生日期。');
    onConfirm({ ...draft, nickname: draft.nickname.trim() });
  }
  return <BottomSheet title={first ? '首次分析，请确认宝宝基本信息' : '修改宝宝基本信息'} onClose={onClose} className="bb-profile-sheet">
    <div className="bb-sheet-handle" />
    <button className="bb-sheet-close" type="button" aria-label={first ? '取消首次确认' : '取消修改'} onClick={onClose}>×</button>
    <div className="bb-profile-heading"><img src={babyAvatar} alt=""/><span className="bb-mock-tag">示例档案</span><h2>{first ? <>首次分析，请确认<br/>宝宝基本信息</> : '修改宝宝基本信息'}</h2><p>已带入宝宝资料，你可以确认或直接修改</p></div>
    <form onSubmit={submit} className="bb-profile-form">
      <div className="bb-profile-fields">
        <label className="bb-profile-row"><span>宝宝昵称</span><input aria-label="宝宝昵称" maxLength={12} required value={draft.nickname} onChange={e => setDraft({ ...draft, nickname: e.target.value })}/></label>
        <label className="bb-profile-row"><span>出生日期</span><input aria-label="出生日期" type="date" min="2008-01-01" max={today} required value={draft.birthDate} onChange={e => setDraft({ ...draft, birthDate: e.target.value })}/></label>
        <label className="bb-profile-row"><span>喂养方式</span><select aria-label="喂养方式" value={draft.feeding} onChange={e => setDraft({ ...draft, feeding: e.target.value })}>{feedingOptions.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select><span className="bb-select-arrow" aria-hidden="true">›</span></label>
        <label className="bb-profile-row"><span>辅食情况</span><select aria-label="辅食情况" value={draft.complementary} onChange={e => setDraft({ ...draft, complementary: e.target.value })}>{complementaryOptions.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select><span className="bb-select-arrow" aria-hidden="true">›</span></label>
        {['pure_formula', 'mixed'].includes(draft.feeding) && <label className="bb-profile-row bb-profile-formula"><span>奶粉品牌<span className="bb-optional">选填</span></span><input aria-label="奶粉品牌" maxLength={80} placeholder="品牌或类型" value={draft.formula} onChange={e => setDraft({ ...draft, formula: e.target.value })}/></label>}
      </div>
      {error && <p className="bb-error" role="alert">{error}</p>}
      <div className="bb-profile-bottom"><p>宝宝情况有变化时，可随时修改</p><button className="bb-primary" type="submit">{first ? '确认信息，开始分析' : '保存修改'}</button></div>
    </form>
  </BottomSheet>;
}
