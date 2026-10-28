import type {TrendSet} from './trendData';
export type AnalysisForm = {
  profileSource?: string;
  deliveryMode?: 'vaginal'|'cesarean';
  mockFields?: string[];
  trendContext?: TrendSet;
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
    source: 'meiyou_parenting_single_page', delivery_mode: form.deliveryMode || 'unknown',
    mock_prefilled_fields: form.mockFields || [], trend_context: form.trendContext,
    ...(form.trendContext ? {analysis_scope:'趋势为模拟记录，带有 mock_prefilled_fields 的日常字段也仍为示例。请明确标注模拟背景，不据此判断真实健康或生长达标。结合照片与背景给出观察；不得把同时变化写成因果；输出仅呈现实际观察和重点，不输出“可能有关联”“不能认定因果”等解释性文案。'} : {}), profile_source: form.profileSource || 'user_entered', birthDate: form.birthDate,
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

// Chinese copy adapted from the user's reference screenshots, never used as a live result.
export const demoReport = normalizeReport({
  status: 'success', risk_level: 'unknown',
  objective_facts: {
    color: { main: '芥末黄，夹杂深棕绿色', detail: '参考示例中，便便在尿布上呈现芥末黄色与较深的棕绿色混合。这类颜色变化可见于母乳与配方奶混合喂养的宝宝。' },
    consistency: { main: '柔软、糊状', detail: '参考示例中的便便质地柔软、呈糊状，整体较均匀。未添加辅食的四个月婴儿中，可以观察到类似外观。' },
    foreign_bodies: { main: '未见明显血丝、奶瓣或灰白色区域', detail: '示例照片中未见明显血丝，未见明显奶瓣，未见明显灰白色区域。' },
    amount: { main: '照片无法精确测量' },
  },
  core_conclusion: { summary: '本次便便呈芥末黄与深棕绿色、质地柔软糊状，未见明显血丝、奶瓣或灰白色区域，当前观察为低风险。', detail: '参考截图中的便便外观，与四个月、混合喂养宝宝的常见描述相近。黄色与绿色的综合色调，可见于这一阶段宝宝的便便中。\n这是一份中文文案示例，未分析你上传的照片。' },
  comprehensive_analysis: { core_cause: '参考照片呈现柔软、摊开的便便，可见芥末黄色与深绿褐色混合，示例中未见明显血丝、奶瓣或灰白色区域。', evidence: ['一般背景：黄色、绿色和棕色的组合，可见于混合喂养宝宝的便便中；个体情况仍需结合宝宝状态判断。'] },
  general_advice: ['继续记录每天的尿布更换、排便次数，以及喂养时的舒适程度。', '如果之后发现颜色或质地变化，可以在相近光线下拍摄参考照片，便于对照。', '维持平时的喂养节奏，关注宝宝的摄入和状态；具体喂养安排可向医生咨询。'],
});
