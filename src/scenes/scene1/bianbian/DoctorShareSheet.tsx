import {useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {SavedReport,downloadBlob} from './records';
import {doctorSummary} from './doctorSummary';
import {Icon} from './ui';
export function DoctorShareSheet({record,onClose}:{record:SavedReport;onClose:()=>void}){
 const [message,setMessage]=useState(''),summary=doctorSummary(record);
 async function share(){try{if(navigator.share){await navigator.share({title:'宝宝就医沟通摘要',text:summary});}else{downloadBlob(new Blob([summary],{type:'text/plain;charset=utf-8'}),'宝宝就医沟通摘要.txt');setMessage('就医摘要已下载，请核对后自行发送给医生。');}}catch(e){if(!(e instanceof Error&&e.name==='AbortError'))setMessage('尚未完成分享，可复制摘要后发送给医生。');}}
 async function copy(){try{await navigator.clipboard.writeText(summary);setMessage('就医摘要已复制，请核对后发送给医生。');}catch{setMessage('复制未成功，请保存就医摘要。');}}
 return <BottomSheet title="分享给医生" onClose={onClose} className="br-panel br-doctor-sheet"><div className="bb-sheet-handle"/><button type="button" className="bb-sheet-close" onClick={onClose} aria-label="关闭医生分享"><Icon name="close"/></button><span className="br-doctor-label">建议就医</span><h2>把观察记录，带给医生</h2><p>已整理本次观察与宝宝背景，请先核对示例预填信息。分享内容不含模拟趋势或原始照片。</p><details className="br-doctor-preview"><summary>查看就医摘要</summary><textarea aria-label="就医沟通摘要" readOnly value={summary} rows={7}/></details><div className="br-doctor-boundary"><strong>问诊入口预览</strong><p>尚未接入医生服务。点击不会发起问诊或产生费用；如宝宝明显不适，请及时就医。</p></div>{message&&<p className="br-panel-message" role="status">{message}</p>}<button type="button" className="br-primary br-doctor-cta" onClick={()=>setMessage('问诊服务尚未接入。你可以先分享或保存摘要，向已有医生咨询。')}>一键问诊</button><button type="button" className="br-secondary" onClick={share}>{typeof navigator.share==='function'?'分享就医摘要':'保存就医摘要'}</button><button type="button" className="br-text-button" onClick={copy}>复制就医摘要</button></BottomSheet>;
}
