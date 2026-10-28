import {beforeEach,it,expect} from 'vitest';
import {entryKey,readEntryStage,saveEntryStage} from '../../src/scenes/scene1/bianbian/entryFlow';
import {mockBabyProfile,saveBabyProfile,loadBabyProfile,profileKey} from '../../src/scenes/scene1/bianbian/babyProfile';
import {clearBianbianData} from '../../src/scenes/scene1/bianbian/records';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
it('模拟开通中断后继续确认，缺失有效资料不能跳过确认',()=>{
 expect(readEntryStage(true)).toBe('preview');
 saveEntryStage('profile');expect(readEntryStage(true)).toBe('profile');
 saveEntryStage('ready');expect(readEntryStage(false)).toBe('profile');expect(readEntryStage(true)).toBe('ready');
});
it('新会话保留已确认档案与入口进度，清除后重置首次体验',()=>{
 saveBabyProfile(mockBabyProfile);saveEntryStage('ready');sessionStorage.clear();
 expect(loadBabyProfile().confirmed).toBe(true);expect(readEntryStage(loadBabyProfile().confirmed)).toBe('ready');
 clearBianbianData();expect(localStorage.getItem(profileKey)).toBeNull();expect(localStorage.getItem(entryKey)).toBeNull();expect(loadBabyProfile().confirmed).toBe(false);expect(readEntryStage(false)).toBe('preview');
});

it('有完整默认资料跳过01，缺少分娩方式或损坏资料时必须补充',()=>{
 expect(loadBabyProfile().needsBasicInfo).toBe(false);
 localStorage.setItem(profileKey,JSON.stringify({...mockBabyProfile,version:4,deliveryMode:undefined}));
 expect(loadBabyProfile()).toMatchObject({confirmed:false,needsBasicInfo:true});
 localStorage.setItem(profileKey,'broken');expect(loadBabyProfile().needsBasicInfo).toBe(true);
});
