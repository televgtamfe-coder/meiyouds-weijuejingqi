export type AnalysisForm = {
  profileSource?: string;
  allergies?: string[];
  bowelPattern?: string;
  birthDate: string; feeding: string; complementary: string; frequency: string;
  baseline: string; symptoms: string[]; notes: string; formula: string; consent: boolean;
};
export const emptyForm: AnalysisForm = { birthDate: '', feeding: '', complementary: '', frequency: '', baseline: '', symptoms: [], notes: '', formula: '', consent: false };
export type Risk = 'green' | 'yellow' | 'orange' | 'red' | 'unknown';
export type Report = {
  kind: 'report' | 'unqualified' | 'followup'; risk: Risk; summary: string; detail: string;
  question: string; facts: { label: string; value: string; detail: string; comparison: string }[];
  actions: { title: string; items: string[] }[]; evidence: string[]; cause: string;
};
const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (v: unknown) => typeof v === 'string' ? v.trim() : '';
const list = (v: unknown): string[] => Array.isArray(v) ? v.map(x => typeof x === 'string' ? x : text(record(x).content) || text(record(x).description)).filter(Boolean) : text(v) ? [text(v)] : [];

export function normalizeReport(value: unknown): Report {
  const d = record(value);
  if (!['success', 'unqualified'].includes(text(d.status))) throw new Error('分析结果不完整，请稍后重试。');
  const facts = record(d.objective_facts), conclusion = record(d.core_conclusion), analysis = record(d.comprehensive_analysis);
  const risk: Risk = ['green', 'yellow', 'orange', 'red'].includes(text(d.risk_level)) ? d.risk_level as Risk : 'unknown';
  const groups = [
    ['emergency_handling', '优先处理'], ['medical_tips', '就医提示'],
    ['general_advice', '日常照护建议'], ['specific_operations', '具体建议'],
    ['home_care', '居家照护'], ['observation_focus', '接下来关注什么'], ['special_population_tips', '特殊情况提醒'],
  ];
  return {
    kind: d.status === 'unqualified' ? 'unqualified' : ['red', 'orange'].includes(risk) ? 'report' : text(d.follow_up_question) ? 'followup' : 'report',
    risk, summary: text(conclusion.summary) || text(d.scenario) || '本次信息暂不足以形成明确结论',
    detail: text(conclusion.detail), question: text(d.follow_up_question) || text(d.message) || text(d.reason),
    cause: text(analysis.core_cause), evidence: list(analysis.evidence),
    facts: [['color', '颜色'], ['consistency', '性状'], ['foreign_bodies', '可见混合物'], ['amount', '量感']].map(([key, label]) => {
      const f = record(facts[key]);
      return { label, value: text(f.main) || '未提供', detail: text(f.detail), comparison: text(f.comparison) || text(f.evaluation) };
    }),
    actions: groups.map(([key, title]) => ({ title, items: list(d[key]) })).filter(x => x.items.length),
  };
}

export function buildMetadata(form: AnalysisForm, now = new Date()) {
  const birthday = new Date(`${form.birthDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    source: 'meiyou_parenting_single_page', profile_source: form.profileSource || 'user_entered', birthDate: form.birthDate,
    age_days: Math.round((today.getTime() - birthday.getTime()) / 86400000),
    feeding_method: form.feeding, feedingType: form.feeding, complementary_food: form.complementary,
    ...(form.frequency.trim() ? { daily_frequency: Number(form.frequency) } : {}),
    ...(form.bowelPattern ? { bowel_pattern: form.bowelPattern, frequencyStatus: ({diarrhea:'increased',constipation:'decreased',usual:'normal'} as Record<string,string>)[form.bowelPattern] || form.bowelPattern } : {}),
    ...(form.allergies ? { allergies: form.allergies } : {}),
    ...(form.baseline ? { baseline_frequency: Number(form.baseline) } : {}),
    ...(form.formula && ['pure_formula', 'mixed'].includes(form.feeding) ? { formula_brand: form.formula } : {}),
    symptoms: form.symptoms, additional_notes: form.notes,
  };
}

export async function analyze(image: string, form: AnalysisForm, signal: AbortSignal) {
  const response = await fetch('https://mybianbian.com/api/analyze', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({ image, metadata: buildMetadata(form) }),
  });
  if (!response.ok) throw new Error(response.status === 429 ? '当前使用人数较多，请稍后重试。' : '暂时没能完成分析，照片和填写内容已保留，请稍后重试。');
  return normalizeReport(await response.json());
}

// Resize locally and re-encode to remove image metadata before upload.
export async function prepareImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 照片。');
  if (file.size > 10 * 1024 * 1024) throw new Error('照片超过 10 MB，请选择较小的图片。');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url;
    await img.decode();
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('当前浏览器无法读取照片，请换一张重试。');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .88);
  } finally { URL.revokeObjectURL(url); }
}

export const demoReport = normalizeReport({
  status: 'success', risk_level: 'unknown',
  objective_facts: {
    color: { main: '示例颜色', detail: '这里展示 AI 对照片颜色的描述' },
    consistency: { main: '示例性状', detail: '这里展示形态与质地描述' },
    foreign_bodies: { main: '示例观察项', detail: '这里展示可见混合物的观察' },
    amount: { main: '示例量感', detail: '照片无法用于精确测量' },
  },
  core_conclusion: { summary: '先了解这次变化，再看下一步', detail: '这是一份用于查看页面结构的示例，没有分析真实照片，也不代表宝宝的健康情况。实际结果会结合你提交的照片和背景信息生成。' },
  comprehensive_analysis: { core_cause: '结合照片、年龄与近期变化给出解释', evidence: ['照片中的可见特征', '你填写的喂养方式与排便变化'] },
  general_advice: ['这里展示本次结果对应的照护建议。'], observation_focus: ['这里展示后续需要关注的变化。'],
});
