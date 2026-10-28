import {it,expect} from 'vitest';
import {riskPresentation} from '../../src/scenes/scene1/bianbian/riskPresentation';
import {doctorSummary} from '../../src/scenes/scene1/bianbian/doctorSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
import {demoReport} from '../../src/scenes/scene1/bianbian/analysis';
import {mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
import {createMockTrends} from '../../src/scenes/scene1/bianbian/trendData';
it('保留原始紧急程度但用三色显示，信息不足不能变成健康',()=>{
 expect(riskPresentation.green.label).toBe('低风险');expect(riskPresentation.unknown.label).toBe('需要关注');expect(riskPresentation.yellow.color).toBe(riskPresentation.unknown.color);
 expect(riskPresentation.orange.doctor).toBe(true);expect(riskPresentation.red.doctor).toBe(true);expect(riskPresentation.green.doctor).toBe(false);
});
it('医生摘要标注AI描述，排除模拟趋势和原照片，并提示核对预填',()=>{
 const record=makeRecord({...demoReport,risk:'red'},'data:image/png;base64,private',false,{profile:mockBabyProfile,trendSnapshot:createMockTrends()});
 const text=doctorSummary(record);expect(text).toContain('建议就医');expect(text).toContain('AI照片描述');expect(text).toContain('示例预填');expect(text).not.toContain('data:image');expect(text).not.toContain('780');expect(text).not.toContain('710');
});
