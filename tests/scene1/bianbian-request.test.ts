import {afterEach,expect,it,vi} from 'vitest';
import {analyze,emptyForm,ANALYSIS_TIMEOUT_MS} from '../../src/scenes/scene1/bianbian/analysis';
afterEach(()=>vi.unstubAllGlobals());
it.each([[504,'ANALYZE_TIMEOUT','等待超时'],[502,'UPSTREAM_ERROR','暂时繁忙'],[503,'UPSTREAM_ERROR','暂时繁忙'],[429,'RATE_LIMITED','使用人数较多']])('明确提示 %s 且不重复调用失败请求',async(status,code,message)=>{
 const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:code}),{status:Number(status)}));
 vi.stubGlobal('fetch',fetchMock);
 await expect(analyze('photo',emptyForm,new AbortController().signal)).rejects.toThrow(String(message));
 expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('兼容网关非 JSON 错误，且不向用户输出上游原文',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('upstream internal error',{status:502})));
 await expect(analyze('photo',emptyForm,new AbortController().signal)).rejects.toThrow('照片和填写内容已保留');
});
it('总等待时限覆盖两轮服务器处理且取消信号传递给请求',async()=>{
 expect(ANALYSIS_TIMEOUT_MS).toBeGreaterThan(2*(120_000+5_000));
 const controller=new AbortController();controller.abort();
 const fetchMock=vi.fn().mockImplementation((_url,options)=>{expect(options.signal).toBe(controller.signal);throw new DOMException('Aborted','AbortError');});
 vi.stubGlobal('fetch',fetchMock);
 await expect(analyze('photo',emptyForm,controller.signal)).rejects.toThrow('Aborted');
 expect(fetchMock).toHaveBeenCalledTimes(1);
});
