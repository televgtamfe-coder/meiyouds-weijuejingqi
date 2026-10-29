import {it,expect,vi,afterEach} from 'vitest';
import {normalizeReport,analyze,emptyForm} from '../../src/scenes/scene1/bianbian/analysis';
import {riskObservations,overviewConclusion} from '../../src/scenes/scene1/bianbian/reportSummary';
import {makeRecord} from '../../src/scenes/scene1/bianbian/records';
const response=(text:string)=>({status:'success',risk_level:'green',objective_facts:{foreign_bodies:{main:text}},core_conclusion:{summary:'黄绿色糊状便。',detail:'本次便便为黄绿色糊状。'}});
const values=(text:string)=>riskObservations(makeRecord(normalizeReport(response(text)))).map(x=>x.value);
afterEach(()=>vi.unstubAllGlobals());
it('识别字段在前和未检测到等明确阴性格式',()=>{
 expect(values('血丝：未见明显；奶瓣：未检测到；灰白色：未检出。')).toEqual(['未发现','未发现','未发现']);
 expect(values('未观察到血丝；奶瓣：疑似少量；灰白色：发现异常。')).toEqual(['未发现','少量','发现异常']);
});
it('完整结构化结果直接使用四个标准值',()=>{
 const r=normalizeReport({...response(''),risk_observations:{blood:{status:'未见明显',evidence:'未见血丝'},milk_curds:{status:'疑似少量',evidence:'可见少量奶瓣'},pale:{status:'未见明显',evidence:'未见灰白色'}}});
 expect(riskObservations(makeRecord(r)).map(x=>x.value)).toEqual(['未发现','少量','未发现']);
});
it('结构化状态不覆盖相反事实，不把无法判断或未见增多当成阴性',()=>{
 const r=normalizeReport({...response('可见血丝。'),risk_observations:{blood:{status:'未见明显',evidence:'未见血丝'},milk_curds:{status:'未见明显',evidence:'无法判断是否存在奶瓣'}}});
 expect(riskObservations(makeRecord(r)).slice(0,2).every(x=>x.state==='unknown')).toBe(true);
 expect(values('未见血丝增多；未见大量奶瓣；灰白色待确认。')).toEqual(['','','']);
 expect(values('若发现血丝请就医；此前未见奶瓣；历史未见灰白色。')).toEqual(['','','']);
});
it('兼容文字型客观事实，同时保存结构化结果到历史快照',()=>{
 const r=normalizeReport({...response(''),objective_facts:{foreign_bodies:'血丝：无；奶瓣：无；灰白色：无。'}});
 expect(riskObservations(makeRecord(r)).map(x=>x.value)).toEqual(['未发现','未发现','未发现']);
 const structured=normalizeReport({...response(''),risk_observations:{blood:{status:'疑似大量',evidence:'可见大量血丝'}}});
 const saved=JSON.parse(JSON.stringify(makeRecord(structured)));
 expect(riskObservations(saved)[0].value).toBe('大量');
});
it('缺失内容不能当作正常，也不拼接待确认到结论',()=>{
 const r=makeRecord(normalizeReport(response('')));
 expect(riskObservations(r).every(x=>x.state==='unknown')).toBe(true);
 expect(overviewConclusion(r)).not.toContain('待确认');
 expect(overviewConclusion(r)).not.toContain('未发现');
});
it('接口首次缺项补取一次，仍缺项则拒绝生成低风险完整报告',async()=>{
 const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>response('')});vi.stubGlobal('fetch',fetchMock);
 await expect(analyze('image',emptyForm,new AbortController().signal)).rejects.toThrow(/观察信息不完整/);
 expect(fetchMock).toHaveBeenCalledTimes(2);
 const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body.metadata.risk_observation_contract).toContain('大量');
});
it('补取成功使用明确结果，高风险报告不会被缺项拦住',async()=>{
 const fetchMock=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>response('')}).mockResolvedValueOnce({ok:true,json:async()=>response('未见血丝、奶瓣及灰白色。')});vi.stubGlobal('fetch',fetchMock);
 expect((await analyze('image',emptyForm,new AbortController().signal)).risk).toBe('green');
 fetchMock.mockReset().mockResolvedValue({ok:true,json:async()=>({...response(''),risk_level:'red'})});
 expect((await analyze('image',emptyForm,new AbortController().signal)).risk).toBe('red');expect(fetchMock).toHaveBeenCalledTimes(1);
});
