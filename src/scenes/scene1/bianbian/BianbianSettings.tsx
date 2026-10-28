import {DoctorShareSheet} from './DoctorShareSheet';
import {MemberPreview} from './MemberPreview';
import { useEffect, useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { KitIcon } from './KitIcon';
import { Icon,IconName } from './ui';
import { SavedReport,downloadBlob,reminderCalendar } from './records';
import { reportImage,reportText } from './reportExport';
export type Panel='photo'|'member-first'|'member'|'restore'|'reminder'|'first-reminder'|'support'|'privacy'|'terms'|'about'|'delete'|'share'|'doctor'|null;
export function BianbianSettings({reminder,onPanel}:{reminder:boolean;onPanel:(p:Panel)=>void}){
 const row=(icon:IconName,title:string,panel:Panel,sub?:string)=><button type="button" className="br-setting-row" onClick={()=>onPanel(panel)}><span className="br-setting-icon"><Icon name={icon}/></span><span><strong>{title}</strong>{sub&&<small>{sub}</small>}</span><Icon name="next"/></button>;
 return <div className="br-scroll br-settings">
  <section className="br-membership-card"><span className="br-plan-tag">模拟会员体验</span><h2>宝宝成长会员</h2><p>更多记录与家庭照护支持，<br/>陪你了解宝宝的每一次变化。</p><button className="br-primary" type="button" onClick={()=>onPanel('member')}>查看会员权益</button></section>
  <div className="br-setting-card">{row('restore','恢复购买','restore','更换设备后恢复订阅')}</div>
  <div className="br-setting-card"><button type="button" className="br-setting-row" onClick={()=>onPanel('reminder')} role="switch" aria-checked={reminder} aria-label="每日提醒"><span className="br-setting-icon"><Icon name="bell"/></span><span><strong>每日提醒</strong><small>{reminder?'已确认添加到日历':'每天 20:00 · 导入手机日历生效'}</small></span><i className={`br-switch ${reminder?'on':''}`}><span/></i></button></div>
  <div className="br-setting-card">{row('mail','联系支持','support','问题反馈与使用帮助')}</div>
  <div className="br-setting-card">{row('shield','隐私与数据说明','privacy')}{row('file','使用条款','terms')}{row('info','关于宝宝便便分析','about','版本 1.0.0')}</div>
  <button type="button" className="br-clear-data" onClick={()=>onPanel('delete')}>清除本地数据</button><p className="br-support br-center">当前使用示例档案，尚未连接账号</p>
 </div>;
}
function ShareSheet({record,onClose}:{record:SavedReport;onClose:()=>void}){
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(true);
 useEffect(()=>{let active=true,url='';setBusy(true);setFile(null);setPreview('');reportImage(record).then(blob=>{if(!active)return;url=URL.createObjectURL(blob);setPreview(url);setFile(new File([blob],`${(record.babyName||'宝宝').replace(/[\\/:*?"<>|]/g,'')}_${record.createdAt.slice(0,10)}_便便观察报告.png`,{type:'image/png'}));}).catch(e=>{if(active)setMessage(e instanceof Error?e.message:'长图生成失败，请复制报告文字。');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;if(url)URL.revokeObjectURL(url);};},[record]);
 async function share(){if(!file)return;try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'宝宝便便分析报告'});}else if(navigator.share){await navigator.share({title:'宝宝便便分析报告',text:reportText(record)});}else{setMessage('当前浏览器不支持系统分享，请先保存长图。');}}catch(e){if(!(e instanceof Error&&e.name==='AbortError'))setMessage('没有完成分享，你可以保存长图后发送。');}}
 async function copy(){try{await navigator.clipboard.writeText(reportText(record));setMessage('报告文字已复制，可自行粘贴分享。');}catch{setMessage('复制未成功，请使用保存长图。');}}
 return <BottomSheet title="分享报告" onClose={onClose} className="br-panel br-share-sheet"><div className="bb-sheet-handle"/><button className="bb-sheet-close" type="button" aria-label="关闭分享" onClick={onClose}><Icon name="close"/></button><h2>分享给家人</h2><p>先预览报告，再分享给家人</p>{preview?<div className="br-share-preview"><img src={preview} alt="中文报告长图预览"/></div>:<div className="br-share-loading">{busy?'正在生成报告长图…':'可以复制完整报告文字'}</div>}{message&&<p className="br-panel-message" role="status">{message}</p>}<button className="br-primary" type="button" disabled={!file} onClick={()=>file&&downloadBlob(file,file.name)}><Icon name="download"/>保存报告长图</button>{typeof navigator.share==='function'&&<button className="br-secondary" type="button" disabled={!file} onClick={share}>打开系统分享</button>}<button className="br-text-button" type="button" onClick={copy}>复制报告文字</button></BottomSheet>;
}
export function BianbianPanels({panel,reminder,record,onClose,onReminder,onClear,onActivate}:{panel:Exclude<Panel,'photo'|null>;reminder:boolean;record:SavedReport|null;onClose:()=>void;onReminder:(value:boolean)=>void;onClear:()=>void;onActivate?:()=>void}) {
 const [message,setMessage]=useState(''),[downloaded,setDownloaded]=useState(false);
 if(panel==='member'||panel==='member-first')return <MemberPreview onClose={onClose} onActivate={panel==='member-first'?onActivate:undefined}/>;
 if(panel==='doctor')return record?<DoctorShareSheet record={record} onClose={onClose}/>:null;
 if(panel==='share')return record?<ShareSheet record={record} onClose={onClose}/>:null;
 const titles:Record<Exclude<Panel,'photo'|'share'|'doctor'|null>,string>={member:'专业版权益','member-first':'开通会员',restore:'恢复购买',reminder:'每日提醒','first-reminder':'第一次记录完成',support:'联系支持',privacy:'隐私与数据说明',terms:'使用条款',about:'关于宝宝便便分析',delete:'清除本地数据'};
 async function copySupport(){try{await navigator.clipboard.writeText('宝宝便便分析 v1.0.0\n页面：https://televgtamfe-coder.github.io/meiyouds-weijuejingqi/#/scene1-bianbian\n遇到的问题：\n发生时间：');setMessage('反馈模板已复制，请补充问题后交给页面提供方。');}catch{setMessage('请记录问题和发生时间，反馈给页面提供方。');}}
 return <BottomSheet title={titles[panel]} onClose={onClose} className={`br-panel br-panel-${panel}`}><div className="bb-sheet-handle"/><button className="bb-sheet-close" type="button" aria-label="关闭弹窗" onClick={onClose}><Icon name="close"/></button>
  {panel==='reminder'||panel==='first-reminder'?<><div className="br-panel-symbol"><Icon name="bell"/></div><h2>{panel==='first-reminder'?'第一次记录完成':reminder?'管理每日提醒':'开启每日提醒'}</h2><p>{reminder?'如需关闭，请同时在手机日历中删除“宝宝日常记录”重复日程。':'每天晚上 20:00，温柔提醒你记录宝宝的日常。下载并导入手机日历后生效。'}</p>{reminder?<button type="button" className="br-primary" onClick={()=>onReminder(false)}>我已移除日历提醒</button>:<><button type="button" className="br-primary" onClick={()=>{downloadBlob(new Blob([reminderCalendar()],{type:'text/calendar;charset=utf-8'}),'宝宝每日记录提醒.ics');setDownloaded(true);}}>下载日历提醒</button>{downloaded&&<><p className="br-panel-message">请打开下载的日历文件并添加到手机日历。</p><button type="button" className="br-secondary" onClick={()=>onReminder(true)}>我已添加到日历</button></>}</>}<button type="button" className="br-text-button" onClick={onClose}>以后再说</button></>:
  panel==='delete'?<><div className="br-panel-symbol"><Icon name="shield"/></div><h2>清除本地数据？</h2><p>将清除当前浏览器的宝宝资料、体验流程进度、会话中的历史报告和提醒标记。此操作不会删除服务器上的照片、报告或手机日历事件。</p><button type="button" className="br-danger-button" onClick={onClear}>确认清除本地数据</button><button type="button" className="br-text-button" onClick={onClose}>保留数据</button></>:
  <><div className="br-panel-symbol"><Icon name={panel==='restore'?'restore':panel==='support'?'mail':panel==='privacy'?'shield':panel==='terms'?'file':'info'}/></div><h2>{titles[panel]}</h2><div className="br-document">
   {panel==='restore'&&<><p>当前网页尚未接入订阅服务，没有可以恢复的购买记录。</p><p>你仍可继续使用照片分析和记录功能。</p></>}
   {panel==='support'&&<><p>支持渠道暂未配置。</p><p>你可以复制反馈模板，补充问题和发生时间后交给页面提供方。请勿在反馈中附带宝宝姓名或完整照片。</p><button type="button" className="br-secondary" onClick={copySupport}>复制反馈模板</button></>}
   {panel==='privacy'&&<><h3>照片与资料如何使用</h3><p>点击“开始分析”后，所选照片及已确认的宝宝资料、排便情况会发送到 mybianbian.com 分析服务。照片和报告会保存在服务器。</p><h3>当前浏览器中的记录</h3><p>已确认的宝宝基础资料和模拟开通进度保留在当前浏览器，方便下次使用；最近 20 条报告仅保留在当前浏览器会话中。清除本地数据不等于删除服务器资料，也不会移除已导入的日历事件。</p><h3>保存与分享范围</h3><p>点击保存会下载报告长图，其中包含记录时间和观察内容，不附加原始照片。请妥善保管；分享给家人前可先预览，再选择系统分享、保存长图或复制文字。</p><h3>模拟趋势</h3><p>首页四类趋势为模拟记录。点击联合分析，或完成照片分析后，将调用分析服务生成模拟趋势解读。模拟趋势与真实照片观察分别展示。</p><p>当前页面尚未提供服务器数据的保留期限与删除入口。</p></>}
   {panel==='terms'&&<><p>本功能用于育儿记录、照片观察和信息参考，不提供医疗诊断，也不能替代医生评估。</p><p>分析可能受光线、照片质量和背景信息影响。宝宝出现不适时应优先寻求专业帮助。</p><p>当前为体验版本，正式服务条款及会员协议尚未接入。不会通过本页面扣费。</p></>}
   {panel==='about'&&<><p>宝宝便便分析</p><p>版本 1.0.0 · 美柚育儿</p><p>从照片到观察报告，把宝宝的日常变化记录下来。</p><p>当前宝宝档案为可编辑的示例数据，尚未接入真实用户账号。页面使用美柚 UI Kit 组件。</p></>}
  </div>{message&&<p className="br-panel-message" role="status">{message}</p>}<button type="button" className="br-primary" onClick={onClose}>知道了</button></>}
 </BottomSheet>;
}
