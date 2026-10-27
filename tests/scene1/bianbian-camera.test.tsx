import {afterEach,describe,it,expect,vi} from 'vitest';
import {act,render,screen,waitFor} from '@testing-library/react';
import {CameraCapture} from '../../src/scenes/scene1/bianbian/CameraCapture';
afterEach(()=>vi.restoreAllMocks());
const props={onClose:()=>{},onPhoto:()=>{},onAlbum:()=>{},onNative:()=>{}};
describe('摄像头生命周期',()=>{
 it('关闭时停止视频轨道，避免后台继续占用相机',async()=>{
  const stop=vi.fn(),stream={getTracks:()=>[{stop}]};
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:vi.fn().mockResolvedValue(stream)},configurable:true});
  const page=render(<CameraCapture {...props}/>);
  await waitFor(()=>expect(screen.getByRole('button',{name:'拍摄照片'})).not.toBeDisabled());
  page.unmount();expect(stop).toHaveBeenCalledOnce();
 });
 it('已关闭后才授权也立即停止轨道',async()=>{
  const stop=vi.fn();let resolve!:(value:unknown)=>void;
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>new Promise(r=>{resolve=r;})},configurable:true});
  const page=render(<CameraCapture {...props}/>);page.unmount();
  await act(async()=>{resolve({getTracks:()=>[{stop}]});});expect(stop).toHaveBeenCalledOnce();
 });
 it('拒绝权限仍保留相册和系统相机，快门不可用',async()=>{
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>Promise.reject(new DOMException('denied','NotAllowedError'))},configurable:true});
  render(<CameraCapture {...props}/>);
  await screen.findByText(/摄像头权限未开启/);
  expect(screen.getByRole('button',{name:'拍摄照片'})).toBeDisabled();expect(screen.getByRole('button',{name:'相册'})).toBeEnabled();
 });
});
