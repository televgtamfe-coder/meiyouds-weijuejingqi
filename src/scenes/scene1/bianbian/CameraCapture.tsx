import {useEffect,useRef,useState} from 'react';
import {Icon} from './ui';
export function CameraCapture({onClose,onPhoto,onAlbum,onNative}:{onClose:()=>void;onPhoto:(file:File)=>void;onAlbum:()=>void;onNative:()=>void}){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),frame=useRef<HTMLDivElement>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const root=useRef<HTMLDivElement>(null),mounted=useRef(true);
 useEffect(()=>{let active=true;mounted.current=true;const before=document.activeElement as HTMLElement|null;root.current?.querySelector<HTMLButtonElement>('button')?.focus();
  async function start(){try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(!active){next.getTracks().forEach(t=>t.stop());return;}stream.current=next;if(video.current){video.current.srcObject=next;await video.current.play();if(active)setReady(true);}}
   catch(e){if(active)setError(e instanceof DOMException&&e.name==='NotAllowedError'?'摄像头权限未开启，可以从相册上传，或在浏览器设置中允许访问。':'暂时无法打开摄像头，可以从相册上传或调用系统相机。');}}
  void start();return()=>{active=false;mounted.current=false;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;window.setTimeout(()=>before?.isConnected&&before.focus(),0);};
 },[]);
 async function capture(){const v=video.current;if(!v||!ready||busy)return;setBusy(true);try{const c=document.createElement('canvas');const box=frame.current!.getBoundingClientRect(),viewport=v.getBoundingClientRect();const scale=Math.max(viewport.width/v.videoWidth,viewport.height/v.videoHeight);const sx=(box.left-viewport.left+(v.videoWidth*scale-viewport.width)/2)/scale,sy=(box.top-viewport.top+(v.videoHeight*scale-viewport.height)/2)/scale;const sw=box.width/scale,sh=box.height/scale;c.width=Math.round(sw);c.height=Math.round(sh);c.getContext('2d')!.drawImage(v,sx,sy,sw,sh,0,0,c.width,c.height);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve,'image/jpeg',.9));if(!blob)throw new Error('拍摄失败，请重试。');if(!mounted.current)return;onPhoto(new File([blob],'宝宝便便照片.jpg',{type:'image/jpeg'}));}catch{if(mounted.current){setError('拍摄失败，请重试或从相册选择。');setBusy(false);}}}
 return <div ref={root} className="bc-camera" role="dialog" aria-modal="true" aria-label="拍摄便便照片" onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const buttons=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);const i=buttons.indexOf(document.activeElement as HTMLButtonElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}}}>
  <video ref={video} autoPlay playsInline muted/><div className="bc-shade"/>
  <header><button type="button" aria-label="关闭相机" onClick={onClose}><Icon name="close"/></button><span>请将尿布放入取景框内</span></header>
  <div ref={frame} className="bc-frame" aria-hidden="true"><i/><i/><i/><i/></div>
  {error&&<div className="bc-camera-error" role="status"><p>{error}</p><button type="button" onClick={onNative}>打开系统相机</button></div>}
  {!ready&&!error&&<p className="bc-permission" role="status">请允许访问摄像头，或从相册上传</p>}
  <footer><p>光线充足 · 避免闪光反光 · 平放尿布</p><div><button type="button" className="bc-album" onClick={onAlbum}><Icon name="gallery"/>相册</button><button type="button" className="bc-shutter" aria-label="拍摄照片" disabled={!ready||busy} onClick={capture}><span/></button><span className="bc-balance"/></div></footer>
 </div>;
}
