"""手填测试表单转换为既有算法合同；不会推断真实设备测量的年龄映射。"""
import copy
from datetime import timedelta
from body_age import core

def build_request(payload, session):
 if not isinstance(payload,dict):raise core.ModelError('INVALID_REQUEST')
 required={'birth_date','S_age','M','safety_state','record_mode','devices'}
 if not required<=payload.keys():raise core.ModelError('MISSING_REQUIRED_FIELD')
 birth=payload['birth_date'];cutoff=session.today.isoformat()
 c=core.chronological_age(birth,cutoff);core.base_age(c,payload['S_age'],payload['M'])
 if payload['safety_state'] not in ('clear_for_test','hold','out_of_scope'):raise core.ModelError('INVALID_SAFETY_STATE')
 if payload['record_mode'] not in ('existing','simulate'):raise core.ModelError('INVALID_RECORD_MODE')
 # 初始化窗口来自明示候选配置，生日、基础映射和设备不沿用样例隐含值。
 from service import Session
 fixture=Session(session.today);fixture.load_scenario('complete');r=fixture.request
 if session.request:r['config']=copy.deepcopy(session.request['config'])
 r['birth_date']=birth;r['safety_state']=payload['safety_state'];r['subject_id']='MANUAL-SYNTHETIC'
 r['external_base']={'S_age':payload['S_age'],'M':payload['M'],'source':'synthetic_fixture'}
 if payload['record_mode']=='existing':r['daily_records']=copy.deepcopy(list(session.records.values()))
 else:
  records=[]
  for name in ('baseline','current'):
   scores=payload.get(name+'_scores');core.daily_score(scores)
   start=core.parse_date(r[name]['start'])
   for i in range(28):records.append({'date':(start+timedelta(days=i)).isoformat(),'scores':copy.deepcopy(scores)})
  r['daily_records']=records
 devices=payload['devices']
 if not isinstance(devices,list) or len(devices)>3:raise core.ModelError('INVALID_REQUEST')
 seen=set()
 for row in devices:
  if not isinstance(row,dict):raise core.ModelError('INVALID_REQUEST')
  if not {'module','d','quality_components','evidence_tier','measured_at','valid_until','validated_for_test','segment_id'}<=row.keys():raise core.ModelError('MISSING_REQUIRED_FIELD')
  name=row['module']
  if name not in ('CR','BC','FUNCTION') or name in seen:raise core.ModelError('UNKNOWN_OR_DUPLICATE_MODULE')
  seen.add(name);core.bounded(row['d'],-12,8,'INVALID_AGE_DELTA');core.quality_score(row['quality_components'])
  measured=core.parse_date(row['measured_at']);expiry=core.parse_date(row['valid_until'])
  if measured>session.today or expiry<measured:raise core.ModelError('INVALID_DATE')
  if row['evidence_tier'] not in ('higher','consumer'):raise core.ModelError('INVALID_EVIDENCE_TIER')
  if type(row['validated_for_test']) is not bool:raise core.ModelError('INVALID_REQUEST')
  if not isinstance(row['segment_id'],str) or not row['segment_id'].strip():raise core.ModelError('MISSING_REQUIRED_FIELD')
 r['external_devices']=copy.deepcopy(devices)
 if type(payload.get('new_baseline',False)) is not bool:raise core.ModelError('INVALID_REQUEST')
 previous=session.evaluation or {}
 old_modules=(session.request or {}).get('previous_device_modules',[])
 if not old_modules and previous.get('status')=='research_only':
  fusion=next((t['output'] for t in previous.get('trace',[]) if t['module_id']=='A13' and t['status']=='valid'),{})
  old_modules=list(fusion.get('weights',{}))
 r['previous_device_modules']=[] if payload.get('new_baseline') else list(old_modules)
 r['manual_lambda_override']=(session.request or {}).get('manual_lambda_override')
 # 可选的显式试验参数只作用于本次模块组合，不擅自推断未知λ。
 if payload.get('lambda_override') is not None:
  lam=core.bounded(payload['lambda_override'],0,'.35','INVALID_LAMBDA')
  r['manual_lambda_override']=str(lam)
  active=[d for d in devices if d['validated_for_test'] and core.parse_date(d['valid_until'])>=session.today and core.quality_score(d['quality_components'])>=core.D('.4')]
  tier=next((d['evidence_tier'] for d in active if d['module']=='CR'),'consumer') if active else 'none'
  combination=('+'.join(sorted(d['module'] for d in active)) if active else 'NONE')+'|'+tier
  if not active and lam!=0:raise core.ModelError('INVALID_LAMBDA')
  r['config']['lambda_table'][combination]=str(lam);r['config']['version']='manual_experiment_v0.4'
 return r
