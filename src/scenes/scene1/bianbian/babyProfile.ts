import { AnalysisForm } from './analysis';

export type BabyProfile = Pick<AnalysisForm, 'birthDate' | 'feeding' | 'complementary' | 'formula'> & { nickname: string };
export const profileKey = 'meiyou.bianbian.confirmed-profile.v2';
export const feedingOptions = [['pure_breast', '纯母乳'], ['pure_formula', '配方奶'], ['mixed', '混合喂养'], ['family_food', '普通饮食']];
export const complementaryOptions = [['none', '未添加'], ['just_started', '刚开始添加'], ['established', '已规律添加']];

// Mock user-profile adapter. Replace this source with the authenticated profile API when available.
export const mockBabyProfile: BabyProfile = { nickname: '小柚子', birthDate: '2026-01-17', feeding: 'mixed', complementary: 'established', formula: '' };
export function loadBabyProfile(): { profile: BabyProfile; confirmed: boolean } {
  try {
    const p = JSON.parse(sessionStorage.getItem(profileKey) || 'null');
    if (p?.version === 2 && typeof p.nickname === 'string' && p.nickname.trim() && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) && feedingOptions.some(([v]) => v === p.feeding) && complementaryOptions.some(([v]) => v === p.complementary)) {
      return { profile: { nickname: p.nickname, birthDate: p.birthDate, feeding: p.feeding, complementary: p.complementary, formula: typeof p.formula === 'string' ? p.formula : '' }, confirmed: true };
    }
  } catch { /* Storage can be disabled; confirmation still works in this visit. */ }
  return { profile: { ...mockBabyProfile }, confirmed: false };
}
export function saveBabyProfile(profile: BabyProfile) {
  try { sessionStorage.setItem(profileKey, JSON.stringify({ ...profile, version: 2, source: 'mock' })); } catch { /* Keep the confirmed state in memory. */ }
}
export function babyAge(birthDate: string, now = new Date()) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth() - (now.getDate() < birth.getDate() ? 1 : 0);
  if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / 86400000))}天`;
  return `${months}个月`;
}
export const profileSummary = (p: BabyProfile) => [feedingOptions.find(([v]) => v === p.feeding)?.[1], complementaryOptions.find(([v]) => v === p.complementary)?.[1]].join(' · ');
