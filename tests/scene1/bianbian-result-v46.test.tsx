import {beforeEach,it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import {ReportContent} from '../../src/scenes/scene1/bianbian/BianbianReport';
import {createEntrySample,entrySampleConclusion} from '../../src/scenes/scene1/bianbian/entrySample';
import {normalizeReport,buildMetadata,emptyForm} from '../../src/scenes/scene1/bianbian/analysis';
import {deepAnalysisSections} from '../../src/scenes/scene1/bianbian/deepAnalysis';
import {importantActions} from '../../src/scenes/scene1/bianbian/importantActions';
import {saveRecord,loadRecords} from '../../src/scenes/scene1/bianbian/records';
import {reportSections,reportText} from '../../src/scenes/scene1/bianbian/reportExport';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
it('有记录快照的报告与分享均保留图表，深度分析保持展开',()=>{
 const row=createEntrySample();const view=render(<ReportContent record={row}/>);
 expect(view.container.querySelector('.bt-stool-card')).not.toBeNull();expect(view.container.querySelector('details')).toBeNull();
 expect(reportSections(row).map(s=>s.title)).toContain('便便规律性解读');
 expect(view.container.querySelector('.bs-important-indicators')?.nextElementSibling).toHaveClass('bt-stool-card');
 expect(screen.getByText('外观与性状解读')).toBeVisible();
 view.rerender(<ReportContent record={row} showRegularity conclusionText={entrySampleConclusion}/>);
 expect(view.container.querySelectorAll('[data-stool-risk]')).toHaveLength(18);
});
it('接口保留结构化行动和解读到历史及导出，去除模型内部过程',()=>{
 const report=normalizeReport({status:'success',risk_level:'green',action_plan:[{title:'拍照记录',when:'下次排便时',steps:['记下时间、颜色和稠度'],watch_for:'宝宝不适时联系医生。'}],deep_analysis:{appearance:'<think>我需要先思考诊断。</think>颜色呈黄色，质地柔软。',feeding_context:'母乳与配方奶混合喂养时，便色可能有所变化。',attention:'我需要推理后续过程。留意是否出现血丝。'}});
 const row={...createEntrySample(),id:'real-v46',demo:false,regularitySnapshot:undefined,report};
 saveRecord(row);const saved=loadRecords().find(r=>r.id===row.id)!;
 expect(saved.report.actionPlan).toEqual(report.actionPlan);expect(saved.report.deepAnalysis).toEqual(report.deepAnalysis);
 expect(importantActions(saved)[0].action).toContain('下次排便时');
 const output=reportText(saved);expect(output).toContain('记下时间、颜色和稠度');expect(output).toContain('留意是否出现血丝');expect(output).not.toContain('我需要');expect(output).not.toContain('think');
 expect(buildMetadata({...emptyForm,birthDate:'2026-06-01'}).report_content_contract).toContain('deep_analysis');
});
it('急需处理的指引优先且完整保留，最多三个行动点',()=>{
 const row=createEntrySample();row.report.actions=[{title:'优先处理',items:['立即就医，不要等待拍照。','带上已有报告。']}];
 const actions=importantActions(row);expect(actions).toHaveLength(3);expect(actions[0].action).toContain('立即就医');expect(actions[0].action).toContain('带上已有报告');
 expect(deepAnalysisSections(row)).toHaveLength(3);
});
