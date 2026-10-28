import {displayCopy} from './presentationCopy';
import {SavedReport,recordTimestamp,riskLabels} from './records';
import {feedingOptions,allergySummary} from './babyProfile';
export function doctorSummary(record:SavedReport){
 record=displayCopy(record);
 const p=record.profileSnapshot,r=record.report;
 return ['宝宝就医沟通摘要',record.demo?'模拟示例，未分析真实照片，不代表宝宝健康情况。':'发送前请核对资料：宝宝档案和补充信息可能包含示例预填。',`宝宝：${record.babyName||'未填写'}；记录时间：${recordTimestamp(record.createdAt)}`,p?`出生日期：${p.birthDate}；喂养方式：${feedingOptions.find(([key])=>key===p.feeding)?.[1]||'未填'}；过敏情况：${allergySummary(p)}`:'宝宝背景资料未提供',`本次观察提示：${riskLabels[r.risk]}，不代表诊断`,...r.facts.filter(f=>f.value&&f.value!=='未提供').map(f=>`AI照片描述 · ${f.label}：${[f.value,f.detail].filter(Boolean).join('；')}`),`AI观察总结：${r.summary}`,r.detail,`需向医生核对：伴随症状、持续时间、近期喂养变化及其他不适。`, '本摘要不附原始照片，也不包含模拟的七天或月度趋势。咨询时可另行提供原始照片与真实记录。','如宝宝明显不适，请及时就医，不要等待线上问诊。'].filter(Boolean).join('\n\n');
}
