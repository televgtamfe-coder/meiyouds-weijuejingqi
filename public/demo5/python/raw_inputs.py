"""原始数据接入。只实现有明确依据的算术；不生成缺少映射规则的年龄。"""
import copy
from body_age import core
from body_age.pipeline import serializable
METRICS={'CR':{'vo2','resting_hr','max_hr'},'BC':{'body_fat_pct','fat_mass_kg','fat_free_mass_kg','skeletal_muscle_kg'},'FUNCTION':{'grip_kg','resting_hr','peak_hr','hr_1min','hr_2min','steps','active_minutes'},'BACKGROUND':{'sleep_hours','hrv_ms'}}
PROFILE={'birth_date','height_cm','weight_kg','weight_measured_at','menstrual_recency','cycle_length_days','devices'}
DEVICE={'kind','brand','model','algorithm_version','measured_at','source','method','wear_days','wear_hours','abnormal_note','metrics','vo2_unit','vo2_mode'}
def optional(value,positive=False,maximum=None,integer=False):
 if value is None or value=='':return None
 n=core.number(value)
 if n<0 or (positive and n==0) or (maximum is not None and n>maximum) or (integer and n!=int(n)):raise core.ModelError('INVALID_RAW_VALUE')
 return n

@core.calculation
def analyze(payload,today):
 if not isinstance(payload,dict) or set(payload)-PROFILE:raise core.ModelError('RAW_FIELDS_ONLY')
 p=copy.deepcopy(payload);p['weight_measured_at']=p.get('weight_measured_at') or today.isoformat();derived={'C':None,'bmi':None,'vo2_ml_kg_min':None};notes=[]
 def past(value):
  d=core.parse_date(value)
  if d>today:raise core.ModelError('FUTURE_MEASUREMENT')
  return d
 if p.get('birth_date'):derived['C']=core.chronological_age(p['birth_date'],today.isoformat())
 h=optional(p.get('height_cm'),True);w=optional(p.get('weight_kg'),True)
 for k in ('weight_measured_at',):
  if p.get(k):past(p[k])
 optional(p.get('cycle_length_days'),True,integer=True)
 ranges={'7d':{'label':'近7天','lower':0,'upper':7,'unit':'days','lower_inclusive':True},
         '1m':{'label':'1个月','lower':'7 days','upper':'1 month'},
         '3m':{'label':'3个月','lower':1,'upper':3,'unit':'calendar_months'},
         '6m':{'label':'半年','lower':3,'upper':6,'unit':'calendar_months'},
         '1y':{'label':'1年','lower':6,'upper':12,'unit':'calendar_months'}}
 recency=p.get('menstrual_recency')
 if recency not in (None,'') and recency not in ranges:raise core.ModelError('INVALID_MENSTRUAL_RECENCY')
 derived['time_since_last_menstruation']=None if not recency else {**ranges[recency],'as_of':today.isoformat(),'precision':'self_reported_interval','lower_inclusive':recency=='7d','upper_inclusive':True}
 derived['amenorrhea_months']=None  # 区间自报不能推出精确连续未行经月数。

 if h is not None and w is not None:derived['bmi']=w/(h/100)**2
 devices=p.get('devices',[])
 if not isinstance(devices,list) or len(devices)>4:raise core.ModelError('INVALID_REQUEST')
 seen=set()
 for row in devices:
  if not isinstance(row,dict) or set(row)-DEVICE:raise core.ModelError('RAW_FIELDS_ONLY')
  kind=row.get('kind')
  if kind not in METRICS or kind in seen:raise core.ModelError('UNKNOWN_OR_DUPLICATE_MODULE')
  seen.add(kind)
  for key in ('brand','model','algorithm_version','method'):
   if row.get(key) is None or row.get(key)=='':row[key]='unknown'
   if not isinstance(row[key],str):raise core.ModelError('INVALID_REQUEST')
  row['source']=row.get('source') or 'manual_device'
  row['measured_at']=row.get('measured_at') or today.isoformat()
  if row.get('source') not in ('manual_device','manual_report'):raise core.ModelError('INVALID_SOURCE')
  measured=past(row.get('measured_at'))
  optional(row.get('wear_days'),maximum=28,integer=True);optional(row.get('wear_hours'),maximum=672)
  if row.get('abnormal_note') is not None and not isinstance(row['abnormal_note'],str):raise core.ModelError('INVALID_REQUEST')
  metrics=row.get('metrics')
  if not isinstance(metrics,dict) or set(metrics)-METRICS[kind]:raise core.ModelError('RAW_FIELDS_ONLY')
  vals={}
  for key,v in metrics.items():
   vals[key]=optional(v,positive=key in ('vo2','resting_hr','max_hr','peak_hr','hr_1min','hr_2min'),maximum=100 if key=='body_fat_pct' else 24 if key=='sleep_hours' else None,integer=key=='steps')
  if kind=='CR':
   mode=row.get('vo2_mode','direct')
   if mode not in ('direct','heart_rate_ratio'):raise core.ModelError('INVALID_VO2_MODE')
   if mode=='heart_rate_ratio':
    rest=vals.get('resting_hr');maximum=vals.get('max_hr')
    derived['vo2_hr_estimate']=None
    if vals.get('vo2') is not None:raise core.ModelError('CONFLICTING_VO2_INPUT')
    if rest is None or maximum is None:notes.append('心率估算需静息心率和已有最大心率记录，缺项不估算。')
    elif maximum<=rest:raise core.ModelError('INVALID_HEART_RATE_PAIR')
    else:derived['vo2_hr_estimate']={'value':core.D('14.5')*maximum/rest,'unit':'mL/kg/min','method':'female_hr_ratio_uth2005','formula':'14.5 * HRmax / HRrest','source':'https://pubmed.ncbi.nlm.nih.gov/16237622/','validation':'NOT_VALIDATED_FOR_PERIMENOPAUSE','eligible_for_age':False}
    notes.append('心率比值法为实验估算，不是实测摄氧量，不进入身体年龄计算。')
    continue
   if vals.get('resting_hr') is not None or vals.get('max_hr') is not None:raise core.ModelError('CONFLICTING_VO2_INPUT')
   unit=row.get('vo2_unit')
   if unit not in ('mL/kg/min','L/min','mL/min'):raise core.ModelError('INVALID_UNIT')
   if vals.get('vo2') is not None:
    if unit=='mL/kg/min':derived['vo2_ml_kg_min']=core.normalize_vo2(vals['vo2'],unit)
    elif w is not None and p.get('weight_measured_at')==row['measured_at']:derived['vo2_ml_kg_min']=core.normalize_vo2(vals['vo2'],unit,w)
    else:notes.append('绝对摄氧量换算需同一测量日的体重，当前未换算。')
  if kind=='FUNCTION':
   for key in ('hr_1min','hr_2min'):
    if vals.get('peak_hr') is not None and vals.get(key) is not None:derived['recovery_'+key]=vals['peak_hr']-vals[key]
  if kind=='BC' and w is not None:
   for key in ('fat_mass_kg','fat_free_mass_kg','skeletal_muscle_kg'):
    if vals.get(key) is not None and vals[key]>w:notes.append(key+'大于体重，请核对日期、单位和测量来源。')
  if not any(v is not None for v in vals.values()):notes.append(kind+'未填写测量值。')
 reasons=['SYMPTOM_AGE_MAPPING_UNAVAILABLE','MENSTRUAL_AGE_MAPPING_UNAVAILABLE','REFERENCE_CURVES_UNAVAILABLE','QUALITY_RULES_UNAVAILABLE']
 trace=[{'module_id':'RAW01','status':'valid','input':p,'output':{'device_groups':sorted(seen),'source':'manual_raw'},'downstream':['RAW02']},
 {'module_id':'RAW02','status':'partial','input':p,'output':{'derived':derived,'notes':notes},'downstream':['A04','A05','A11','A12']},
 {'module_id':'RAW03','status':'blocked','input':{'available_raw_groups':sorted(seen)},'output':{'missing_rules':reasons,'current_result':None},'downstream':[]}]
 return serializable({'status':'blocked','current_result':None,'can_publish':False,'reason_codes':reasons,'trace':trace,'derived':derived,'notes':notes,'input_snapshot':p})
