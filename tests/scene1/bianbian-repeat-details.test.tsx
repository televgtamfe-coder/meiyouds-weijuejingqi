import {beforeEach,expect,it,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import {emptyForm,demoReport,buildMetadata} from '../../src/scenes/scene1/bianbian/analysis';
import {BianbianDetails} from '../../src/scenes/scene1/bianbian/BianbianDetails';
import {bowelSnapshot,loadPreviousBowel,savePreviousBowel,reusePreviousBowel,previousBowelKey} from '../../src/scenes/scene1/bianbian/previousBowel';
import {makeRecord,clearBianbianData} from '../../src/scenes/scene1/bianbian/records';
import {allergyTag,mockBabyProfile} from '../../src/scenes/scene1/bianbian/babyProfile';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
const form={...emptyForm,...mockBabyProfile,bowelPattern:'increased',frequency:'4',baseline:'2',symptoms:['发热'],notes:'上次备注',mockFields:['baseline','notes']};
it('跨页面读取上次排便字段，不沿用旧症状和备注，保留字段来源',()=>{
 savePreviousBowel(bowelSnapshot(form));
 const fresh={...form,frequency:'1',symptoms:['无以下情况'],notes:'本次备注',mockFields:['frequency','symptoms']};
 const next=reusePreviousBowel(fresh,loadPreviousBowel([]));
 expect(next.frequency).toBe('4');expect(next.baseline).toBe('2');expect(next.bowelPattern).toBe('increased');
 expect(next.symptoms).toEqual(['无以下情况']);expect(next.notes).toBe('本次备注');
 expect(next.mockFields).toEqual(['symptoms','baseline']);
 expect(buildMetadata(next)).toMatchObject({daily_frequency:4,baseline_frequency:2,bowel_pattern:'increased'});
});
it('没有草稿时读取真实历史快照，示例历史不触发非首次流程',()=>{
 const record={...makeRecord(demoReport),formSnapshot:form};
 expect(loadPreviousBowel([{...record,demo:true}])).toBeNull();
 expect(loadPreviousBowel([record])?.frequency).toBe('4');
 savePreviousBowel(null);expect(loadPreviousBowel([record])).toBeNull();
 clearBianbianData();expect(localStorage.getItem(previousBowelKey)).toBeNull();
});
it('非法排便缓存不能隐藏首次输入项',()=>{
 expect(bowelSnapshot({...form,frequency:'-1'})).toBeNull();
 expect(bowelSnapshot({...form,bowelPattern:'bad'})).toBeNull();
});
it('非首次仅展示症状和备注；首次仍可填写排便情况和次数',()=>{
 const props={image:'data:image/png;base64,',form,onChange:vi.fn(),onSubmit:vi.fn(),onPhoto:vi.fn(),error:'',question:'',busy:false};
 const view=render(<BianbianDetails {...props}/>);
 expect(screen.getByRole('group',{name:'排便变化'})).toBeVisible();expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
 view.rerender(<BianbianDetails {...props} repeat/>);
 expect(screen.queryByRole('group',{name:'排便变化'})).not.toBeInTheDocument();expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
 expect(screen.getByText('伴随症状')).toBeVisible();expect(screen.getByRole('button',{name:'发热',exact:true})).toBeVisible();expect(screen.getByRole('textbox')).toBeVisible();
});
it('过敏标签明确说明所选过敏原与未知状态',()=>{
 expect(allergyTag({...mockBabyProfile,allergies:['gluten']})).toBe('麸质过敏');
 expect(allergyTag({...mockBabyProfile,allergies:['milk','nuts']})).toBe('牛奶及乳制品、花生及坚果过敏');
 expect(allergyTag({...mockBabyProfile,allergies:['none']})).toBe('无已知过敏');
 expect(allergyTag({...mockBabyProfile,allergies:['unsure']})).toBe('过敏情况不确定');
});
