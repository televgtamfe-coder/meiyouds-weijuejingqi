"""只接受合成研究夹具的可回放计算链，不含医学推断或正式发布。"""
import copy
import hashlib
import json
from decimal import Decimal
from . import core

FORMULA = 'candidate_gate_lambda_v0.2'


def serializable(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, dict):
        return {k:serializable(v) for k,v in value.items()}
    if isinstance(value, (list,tuple)):
        return [serializable(v) for v in value]
    return value


def evaluate(request):
    """输入JSON对象，输出含每站input/output/downstream的研究结果。"""
    trace=[]
    result={'status':'blocked','can_publish':False,'current_result':None,
            'reason_codes':[],'trace':trace,'comparison':{'comparable':False,'raw_delta':None,
            'reason':'CROSS_PERIOD_ATTRIBUTION_NOT_IMPLEMENTED'},
            'limitations':['S_age、M及设备年龄差为显式合成注入，未运行原模型或真实常模',
                          '未执行医学安全判别、正式量表校准及跨期Shapley分解',
                          '工程先验未冻结，不用于临床或正式发布']}
    module='A00'
    step_input={}

    def emit(mid, inputs, outputs, downstream, status='valid'):
        trace.append({'module_id':mid,'status':status,'input':serializable(inputs),
                      'output':serializable(outputs),'downstream':downstream})

    try:
        if not isinstance(request,dict):
            raise core.ModelError('INVALID_REQUEST')
        try:
            canonical=json.dumps(request,sort_keys=True,ensure_ascii=False,allow_nan=False,separators=(',',':'))
        except (ValueError,TypeError):
            raise core.ModelError('INVALID_JSON_NUMBER') from None
        request=copy.deepcopy(request)
        fingerprint=hashlib.sha256(canonical.encode('utf-8')).hexdigest()
        result.update(input_snapshot_id=fingerprint,evaluation_id='eval-'+fingerprint[:20],
                      input_snapshot=request,formula_version=FORMULA)
        if request.get('mode')!='research':
            raise core.ModelError('PRODUCTION_NOT_SUPPORTED')
        if request.get('synthetic') is not True:
            raise core.ModelError('REAL_DATA_NOT_SUPPORTED')
        if request.get('formula_version')!=FORMULA:
            raise core.ModelError('UNKNOWN_FORMULA')
        config=request['config']
        for key in ('version','alpha','T','lambda_table'):
            if key not in config:
                raise core.ModelError('MISSING_REQUIRED_FIELD', 'config.'+key)
        if not request.get('subject_id') or not config['version']:
            raise core.ModelError('MISSING_REQUIRED_FIELD')
        cutoff=core.parse_date(request['as_of'])
        context={'subject_id':request['subject_id'],'as_of':request['as_of'],
                 'formula_version':FORMULA,'config_version':config['version'],
                 'snapshot_id':fingerprint}
        emit('A00',context,context,['A01','A02','A03'])
        module='A02'; step_input={'safety_state':request.get('safety_state')}
        safety=request.get('safety_state')
        if safety=='hold':
            raise core.ModelError('SAFETY_HOLD')
        if safety=='out_of_scope':
            raise core.ModelError('OUT_OF_SCOPE')
        if safety!='clear_for_test':
            raise core.ModelError('SAFETY_RULES_UNAVAILABLE')
        emit(module,step_input,{'test_gate_only':True,'can_publish':False},['A15','A19'])

        module='A03'; step_input={'birth_date':request['birth_date'],'as_of':request['as_of']}
        c=core.chronological_age(**step_input)
        emit(module,step_input,{'C':c,'unit':'years','leap_day_policy':'feb28'},['A06','A12','A15'])
        external=request.get('external_base',{})
        for mid,key,reason in [('A04','S_age','S_AGE_RULE_UNAVAILABLE'),('A05','M','M_RULE_UNAVAILABLE')]:
            module=mid; step_input={'external_base':external}
            if external.get(key) is None:
                raise core.ModelError(reason)
            if external.get('source')!='synthetic_fixture':
                raise core.ModelError('UNVERIFIED_EXTERNAL_INPUT')
            emit(mid,step_input,{key:external[key],'unit':'years','origin':'synthetic_override'},['A06'],'external_fixture')
        module='A06'; step_input={'C':c,'S_age':external['S_age'],'M':external['M']}
        base=core.base_age(**step_input)
        emit(module,step_input,base,['A15','A16'])

        module='A01'; rows=request['daily_records']; step_input={'daily_records':rows}
        if not isinstance(rows,list):
            raise core.ModelError('INVALID_REQUEST')
        dates=set()
        for row in rows:
            day=core.parse_date(row['date'])
            if day>cutoff:
                raise core.ModelError('FUTURE_MEASUREMENT')
            if day in dates:
                raise core.ModelError('DUPLICATE_DAY')
            dates.add(day)
        emit(module,step_input,{'unique_days':len(dates),'deduplication':'reject_duplicates'},['A07'])
        module='A07'; step_input={'daily_records':rows}
        day_outputs=[]; daily_values=[]
        for row in rows:
            out=core.daily_score(row['scores'])
            day_outputs.append({'date':row['date'],**out})
            daily_values.append({'date':row['date'],'value':out['total'],'excluded':row.get('excluded',False)})
        emit(module,step_input,day_outputs,['A09'])
        emit('A08',{}, {'status':'not_implemented','reason':'FORMAL_SCALE_CALIBRATION_UNAVAILABLE'},['A19'],'unavailable')
        module='A09'; baseline=request['baseline']; current=request['current']
        step_input={'baseline':baseline,'current':current,'daily_values':daily_values,'as_of':request['as_of']}
        if core.parse_date(current['start'])<=core.parse_date(baseline['end']):
            raise core.ModelError('WINDOW_OVERLAP')
        if not baseline['id'] or not current['id'] or baseline['id']==current['id']:
            raise core.ModelError('INVALID_WINDOW')
        windows=[]
        for window in (baseline,current):
            windows.append(core.symptom_window(daily_values,window['start'],window['end'],request['as_of']))
        emit(module,step_input,{'baseline':windows[0],'current':windows[1]},['A10'])
        for window in windows:
            if window['status']!='valid':
                raise core.ModelError(window['reason'])
        module='A10'; step_input={'M0':windows[0]['median'],'Mt':windows[1]['median'],'T':config['T']}
        symptom=core.symptom_change(**step_input)
        symptom['threshold_evidence']='engineering_prior'
        emit(module,step_input,symptom,['A15','A16'])

        module='A11'; device_rows=request['external_devices']; step_input={'external_devices':device_rows}
        if not isinstance(device_rows,list):
            raise core.ModelError('INVALID_REQUEST')
        seen=set(); device_quality={}; eligible={}; deltas={}; tiers={}
        for row in device_rows:
            name=row['module']
            if name not in ('CR','FUNCTION','BC'):
                raise core.ModelError('UNKNOWN_MODULE')
            if name in seen:
                raise core.ModelError('DUPLICATE_MODULE')
            seen.add(name)
            measured=core.parse_date(row['measured_at']); expiry=core.parse_date(row['valid_until'])
            if measured>cutoff:
                raise core.ModelError('FUTURE_MEASUREMENT')
            if expiry<measured:
                raise core.ModelError('INVALID_DATE')
            if not row['segment_id']:
                raise core.ModelError('MISSING_REQUIRED_FIELD')
            quality=core.quality_score(row['quality_components'])
            allowed=row.get('validated_for_test') is True and measured<=cutoff<=expiry and quality>=Decimal('.4')
            device_quality[name]=quality; eligible[name]=allowed
            deltas[name]=row['d'] if allowed else None
            tiers[name]=row['evidence_tier']
        emit(module,step_input,{'quality':device_quality,'eligible':eligible,
             'source':'synthetic_supplied_subscores'},['A12','A14','A18'])
        module='A12'; step_input={'deltas':deltas,'eligible':eligible}
        emit(module,step_input,{'deltas':deltas,'reference_mapping':'NOT_IMPLEMENTED',
             'origin':'synthetic_override'},['A13'],'external_fixture')
        module='A13'; step_input={'deltas':deltas,'alpha':config['alpha']}
        fusion=core.fuse_devices(**step_input)
        emit(module,step_input,fusion,['A14','A15','A16'])
        previous=set(request.get('previous_device_modules',[]))
        active=set(fusion['weights'])
        if previous and previous!=active:
            raise core.ModelError('SOURCE_CHANGED')
        if device_rows and not active:
            raise core.ModelError('DEVICE_DATA_UNAVAILABLE')
        module='A14'
        tier=tiers.get('CR','consumer') if active else 'none'
        combination=('+'.join(sorted(active)) if active else 'NONE')+'|'+tier
        step_input={'combination':combination,'lambda_table':config['lambda_table']}
        if combination not in config['lambda_table']:
            raise core.ModelError('LAMBDA_RULE_UNAVAILABLE')
        lam=core.bounded(config['lambda_table'][combination],0,'.35','INVALID_LAMBDA')
        if not active and lam!=0:
            raise core.ModelError('INVALID_LAMBDA')
        emit(module,step_input,{'lambda':lam,'combination':combination},['A15','A16'])
        module='A15'; step_input={'C':c,'P':base['P'],'G_E':fusion['G_E'],'lambda_':lam,'G_sym':symptom['G_sym']}
        total=core.composite_age(**step_input)
        emit(module,step_input,total,['A16','A19'])
        module='A16'; step_input={'C':c,'P':base['P'],'G_sym':symptom['G_sym'],'lambda_':lam,'fusion':fusion}
        contributions=core.current_contributions(**step_input)
        emit(module,step_input,contributions,['A19'])
        emit('A17',{},result['comparison'],['A19'],'unavailable')
        emit('A18',{'device_quality':device_quality},{'overall_confidence':None,
             'validation_status':'UNVALIDATED','reason':'QUALITY_AGGREGATION_RULES_NOT_FROZEN'},['A19'],'unavailable')
        result.update(status='research_only',current_result=serializable(total),
                      contributions=serializable(contributions),reason_codes=['RESEARCH_ONLY'])
        emit('A19',{'formula_version':FORMULA,'snapshot_id':fingerprint},
             {'status':'research_only','can_publish':False},[],'research_only')
    except core.ModelError as exc:
        result['reason_codes']=[exc.code]
        emit(module,step_input,{'reason':exc.code,'detail':exc.detail},[],'blocked')
    except (KeyError,TypeError,AttributeError) as exc:
        result['reason_codes']=['MISSING_REQUIRED_FIELD' if isinstance(exc,KeyError) else 'INVALID_REQUEST']
        emit(module,{}, {'reason':result['reason_codes'][0]},[],'blocked')
    return serializable(result)
