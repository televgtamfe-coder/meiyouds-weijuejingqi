import {EntryPreview,CameraDock} from './EntryPreview';
import {readEntryStage,saveEntryStage} from './entryFlow';
import {loadMockHistory} from './mockHistory';
import { ChangeEvent,FormEvent,useEffect,useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBar } from '../components/StatusBar';
import { AnalysisForm,analyze,emptyForm,prepareImage } from './analysis';
import { BabyProfile,loadBabyProfile,saveBabyProfile,withMockFormula } from './babyProfile';
import { BabyProfileWizard } from './BabyProfileWizard';
import { BianbianHome,BianbianHistory } from './BianbianHome';
import { BianbianDetails } from './BianbianDetails';
import { BianbianReport } from './BianbianReport';
import { BianbianSettings,BianbianPanels,Panel } from './BianbianSettings';
import {AnalysisWaiting} from './AnalysisWaiting';
import { CameraCapture } from './CameraCapture';
import {createMockTrends,mockDetailDefaults,TrendSet} from './trendData';
import {analyzeTrends,JointAnalysis} from './trendAnalysis';
import {TrendsPage} from './TrendsPage';
import {reportImage} from './reportExport';
import { Icon,PageHeader } from './ui';
import { KitIcon } from './KitIcon';
import { SavedReport,downloadBlob,clearBianbianData,createThumbnail,loadRecords,makeRecord,readFlag,reminderKey,reminderSeenKey,saveRecord,writeFlag } from './records';
import './bianbian.css';
import './reference.css';
import './trends.css';
type View='home'|'details'|'report'|'history'|'settings'|'trends';
export function BianbianPage(){
 const navigate=useNavigate();const [initial]=useState(loadBabyProfile);
 const [entryStage,setEntryStage]=useState(()=>readEntryStage(initial.confirmed));
 const [profile,setProfile]=useState<BabyProfile>(initial.profile),[confirmed,setConfirmed]=useState(initial.confirmed),[wizard,setWizard]=useState(entryStage==='profile');
 const [wizardStep,setWizardStep]=useState(initial.needsBasicInfo?0:1),[wizardQuick,setWizardQuick]=useState(false),[wizardFormula,setWizardFormula]=useState(false);
 function editProfile(section?:'feeding'|'allergies'|'formula'){setWizardStep(section==='feeding'||section==='formula'?1:section==='allergies'?2:0);setWizardQuick(!!section);setWizardFormula(section==='formula');setWizard(true);}
 const [view,setView]=useState<View>('home'),[reportBack,setReportBack]=useState<View>('home'),[panel,setPanel]=useState<Panel>(null);
 const [trends]=useState(createMockTrends);
 const [demoRecords]=useState(()=>loadMockHistory(initial.profile,trends));
 const freshForm=(baby:BabyProfile):AnalysisForm=>({...emptyForm,...mockDetailDefaults(trends),...baby,consent:true,profileSource:'mock_confirmed',trendContext:trends});
 const [form,setForm]=useState<AnalysisForm>(()=>freshForm(initial.profile));
 const [camera,setCamera]=useState(false),[saving,setSaving]=useState(false);
 const jointController=useRef<AbortController|null>(null),jointCache=useRef<{key:string;value:JointAnalysis}|null>(null);
 const [jointState,setJointState]=useState({key:'',loading:false,error:''}),[joint,setJoint]=useState<JointAnalysis|null>(null);
 const jointKey=(p:BabyProfile,t:TrendSet)=>JSON.stringify([p,t]);
 const [image,setImage]=useState(''),[preparing,setPreparing]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[question,setQuestion]=useState(''),[notice,setNotice]=useState('');
 const [draftRecordId,setDraftRecordId]=useState('');const newAnalysis=useRef(true);
 const [records,setRecords]=useState(loadRecords),[record,setRecord]=useState<SavedReport|null>(null),[reminder,setReminder]=useState(()=>readFlag(reminderKey));
 const contentRef=useRef<HTMLDivElement>(null),photoInput=useRef<HTMLInputElement>(null),cameraInput=useRef<HTMLInputElement>(null),controller=useRef<AbortController|null>(null),uploadVersion=useRef(0),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;controller.current?.abort();jointController.current?.abort();};},[]);
 useEffect(()=>{contentRef.current?.toggleAttribute('inert',!!panel||loading||camera);},[panel,loading,camera]);
 useEffect(()=>{if((error||question)&&view==='details')document.querySelector('.br-feedback')?.scrollIntoView?.({block:'center',behavior:'smooth'});},[error,question,view]);
 function confirmProfile(next:BabyProfile){next=withMockFormula(next);const firstSetup=entryStage==='profile';jointController.current?.abort();jointCache.current=null;setJoint(null);setJointState({key:'',loading:false,error:''});setProfile(next);saveBabyProfile(next);setConfirmed(true);setWizard(false);setForm(prev=>({...prev,...next}));saveEntryStage('ready');setEntryStage('ready');if(firstSetup){newAnalysis.current=true;setView('home');setCamera(true);}}
 function closeProfile(){if(entryStage==='ready'&&confirmed)setWizard(false);else navigate('/scene1-parenting');}
 function activateEntry(){saveEntryStage('profile');setEntryStage('profile');setPanel(null);setWizardStep(loadBabyProfile().needsBasicInfo?0:1);setWizardQuick(false);setWizardFormula(false);setWizard(true);}
 function openPhoto(){newAnalysis.current=view!=='details';setCamera(true);}
 async function upload(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(file)await receivePhoto(file);}
 async function receivePhoto(file:File){setCamera(false);const version=++uploadVersion.current;setPreparing(true);setError('');try{const prepared=await prepareImage(file);if(alive.current&&version===uploadVersion.current){setImage(prepared);setDraftRecordId('');if(newAnalysis.current)setForm(freshForm(profile));setView('details');setQuestion('');}}catch(e){if(alive.current&&version===uploadVersion.current)setError(e instanceof Error?e.message:'照片读取失败，请重试。');}finally{if(alive.current&&version===uploadVersion.current)setPreparing(false);}}
 function showRecord(next:SavedReport,from:View){setRecord(next);setReportBack(from);setNotice('');setView('report');}
 function editReport(){if(image&&(record?.demo||record?.id===draftRecordId)){setView('details');setError('');setQuestion('');}else openPhoto();}
 async function submit(event?:FormEvent){event?.preventDefault();if(controller.current||preparing)return;if(!confirmed){setWizard(true);return;}if(!image)return setError('请先添加一张清晰的便便照片。');if(!form.bowelPattern)return setError('请选择最近的排便情况。');if(!form.consent)return setError('请先阅读并勾选照片与资料使用说明。');
  const request=new AbortController();controller.current=request;setLoading(true);setError('');setQuestion('');setNotice('');let timedOut=false;
  const timeout=window.setTimeout(()=>{timedOut=true;request.abort();},90000);
  try{const result=await analyze(image,form,request.signal);if(!alive.current||request.signal.aborted)return;
   if(result.kind==='unqualified')setError(result.question||'这张照片暂时无法识别，请在自然光下重新拍摄。');
   else if(result.kind==='followup')setQuestion(result.question);
   else{let thumbnail='';try{thumbnail=await createThumbnail(image);}catch{/* A missing thumbnail must not discard the report. */}if(!alive.current||request.signal.aborted)return;const cached=jointCache.current?.key===jointKey(profile,trends)?jointCache.current.value:undefined;const next=makeRecord(result,thumbnail,false,{profile,trendSnapshot:trends,jointAnalysis:cached,form});const saved=saveRecord(next);setDraftRecordId(next.id);setRecords(prev=>[next,...prev].slice(0,20));setRecord(next);setReportBack('details');setView('report');if(!cached)void startJoint(next);if(!saved)setNotice('报告已生成，但本地历史保存失败。请下载报告保留。');if(result.risk==='green'&&!reminder&&!readFlag(reminderSeenKey)){writeFlag(reminderSeenKey,true);setPanel('first-reminder');}}
  }catch(e){if(alive.current)setError(request.signal.aborted?(timedOut?'等待时间较长，已停止等待。内容已保留，请稍后再试。':'已停止等待，填写内容已保留。'):e instanceof Error?e.message:'网络连接失败，请检查后重试。');}
  finally{window.clearTimeout(timeout);if(controller.current===request)controller.current=null;if(alive.current)setLoading(false);}
 }

 function resetEntry(){saveEntryStage('preview');setEntryStage('preview');setWizard(false);setCamera(false);setPanel(null);setView('home');setError('');setNotice('');}
 function closePanel(){setPanel(null);}
 function cancelJoint(){jointController.current?.abort();}
 function attachJoint(target:SavedReport,value:JointAnalysis){if(target.jointAnalysis)return;const updated=JSON.parse(JSON.stringify({...target,jointAnalysis:value})) as SavedReport;saveRecord(updated);setRecords(prev=>prev.map(r=>r.id===target.id?updated:r));setRecord(prev=>prev?.id===target.id?updated:prev);}
 async function startJoint(target?:SavedReport){
  if(target&&(!target.profileSnapshot||!target.trendSnapshot)){setNotice('这份历史报告未保存完整背景资料，无法补充联合分析。');return;}
  const baby=target?.profileSnapshot||profile,data=target?.trendSnapshot||trends,key=jointKey(baby,data);
  if(target?.jointAnalysis)return;
  if(jointCache.current?.key===key){if(target)attachJoint(target,jointCache.current.value);else setJoint(jointCache.current.value);return;}
  jointController.current?.abort();const request=new AbortController();jointController.current=request;setJointState({key,loading:true,error:''});let timedOut=false;
  const timer=window.setTimeout(()=>{timedOut=true;request.abort();},75000);
  try{const value=await analyzeTrends(baby,data,request.signal);if(!alive.current||request.signal.aborted)return;jointCache.current={key,value};if(key===jointKey(profile,trends))setJoint(value);if(target)attachJoint(target,value);setJointState({key,loading:false,error:''});}
  catch(e){if(alive.current&&jointController.current===request)setJointState({key,loading:false,error:request.signal.aborted?(timedOut?'等待时间较长，请稍后重试。':'已停止联合分析，记录已保留。'):e instanceof Error?e.message:'联合分析暂不可用，请重试。'});}
  finally{window.clearTimeout(timer);if(jointController.current===request)jointController.current=null;}
 }
 async function saveReport(){if(!record||saving)return;setSaving(true);setNotice('');try{const blob=await reportImage(record);if(!alive.current)return;const name=(record.babyName||'宝宝').replace(/[\/:*?"<>|]/g,'');downloadBlob(blob,`${name}_${record.createdAt.slice(0,10)}_便便分析报告.png`);setNotice('报告长图已生成，请在浏览器下载记录中查看。');}catch(e){setNotice(e instanceof Error?e.message:'报告保存失败，请重试。');}finally{if(alive.current)setSaving(false);}}
 function back(){if(view==='trends')cancelJoint();setError('');if(view==='report')setView(reportBack==='report'?'home':reportBack);else if(view==='home')navigate('/scene1-parenting');else setView('home');}
 function clear(){setEntryStage('preview');jointController.current?.abort();jointController.current=null;jointCache.current=null;setJoint(null);setJointState({key:'',loading:false,error:''});clearBianbianData();setPanel(null);setRecords([]);setRecord(null);setReminder(false);setImage('');setDraftRecordId('');setForm(freshForm(initial.profile));const next=loadBabyProfile();setProfile(next.profile);setConfirmed(false);setWizardStep(0);setWizardQuick(false);setWizardFormula(false);setWizard(false);setView('home');}
 const displayedRecords=[...records,...demoRecords];
 const title={home:'便便智能分析',details:'补充信息',report:'便便分析报告',history:'历史报告',settings:'我的',trends:'成长联合分析'}[view];
 return <div className={`bb-page br-app ${entryStage==='ready'?'be-ready':'be-onboarding'}`} data-testid="bianbian-page">
  <div className="br-main" ref={contentRef} aria-hidden={panel||loading||camera?true:undefined}><StatusBar/>
   {entryStage==='preview'?<EntryPreview onBack={()=>navigate('/scene1-parenting')} onActivate={()=>setPanel('member-first')}/>:wizard?<BabyProfileWizard initialStep={wizardStep} singleStep={wizardQuick} formulaOnly={wizardFormula} profile={profile} first={entryStage==='profile'||!confirmed} onConfirm={confirmProfile} onClose={closeProfile}/>:<>
    <PageHeader title={title} onBack={back} onAction={view==='report'?saveReport:undefined} onReset={view==='home'?resetEntry:undefined}/>
    {view!=='details'&&error&&<p className="br-error br-global-error" role="alert">{error}</p>}{preparing&&<p className="br-upload-status" role="status">正在处理照片…</p>}
    {view==='home'&&<BianbianHome profile={profile} records={demoRecords} onEdit={editProfile} onPhoto={openPhoto} onHistory={()=>setView('history')} onRecord={r=>showRecord(r,'home')} trends={trends}/>}
    {view==='details'&&<BianbianDetails image={image} form={form} onChange={setForm} onSubmit={submit} onPhoto={openPhoto} error={error} question={question} busy={preparing}/>}
    {view==='report'&&record&&<BianbianReport record={record} onShare={()=>setPanel('share')} onDoctor={()=>setPanel('doctor')} saving={saving} jointLoading={jointState.loading&&jointState.key===jointKey(record.profileSnapshot||profile,record.trendSnapshot||trends)} jointError={jointState.key===jointKey(record.profileSnapshot||profile,record.trendSnapshot||trends)?jointState.error:''} onJoint={()=>void startJoint(record)} onCancelJoint={cancelJoint} onEdit={editReport} notice={notice}/>}
    {view==='history'&&<BianbianHistory records={displayedRecords} onRecord={r=>showRecord(r,'history')} onPhoto={openPhoto}/>}
    {view==='trends'&&<TrendsPage data={trends} analysis={joint} loading={jointState.loading} error={jointState.error} onRetry={()=>void startJoint()} onCancel={cancelJoint}/>}
    {view==='settings'&&<BianbianSettings reminder={reminder} onPanel={setPanel}/>}
    {['home','settings','history','trends'].includes(view)&&<CameraDock onPhoto={openPhoto}/>}
   </>}
  </div>
  <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden aria-label="选择便便照片"/>
  <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={upload} hidden aria-label="拍摄便便照片"/>
  {camera&&<CameraCapture onClose={()=>setCamera(false)} onPhoto={file=>void receivePhoto(file)} onAlbum={()=>photoInput.current?.click()} onNative={()=>cameraInput.current?.click()}/>}
  {panel&&panel!=='photo'&&<BianbianPanels key={panel} panel={panel} reminder={reminder} record={record} onClose={closePanel} onReminder={value=>{setReminder(value);writeFlag(reminderKey,value);setPanel(null);}} onClear={clear} onActivate={activateEntry}/>}
  {loading&&<div className="br-loading-mask" tabIndex={-1} ref={el=>el?.focus()} role="dialog" aria-modal="true" aria-labelledby="br-loading-title" onKeyDown={e=>{if(e.key==='Tab')e.preventDefault();if(e.key==='Escape')controller.current?.abort();}}><div className="br-loading-card"><div className="br-loading-symbol"><KitIcon name="camera"/></div><h2 id="br-loading-title">正在分析宝宝的便便</h2><AnalysisWaiting kind="photo"/></div></div>}
 </div>;
}
