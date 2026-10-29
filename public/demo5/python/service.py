"""只连接已实现算法；所有会话为本地联调，不接真实健康档案。"""
import copy
import json
from datetime import date, timedelta
from pathlib import Path
from body_age import core
from body_age.pipeline import evaluate, serializable

KEYS=('B','Y','L','PsyDaily','Udaily')
SCENARIOS=('empty','complete','insufficient','missing_base','safety_hold','source_changed','no_device')


class Session:
    def __init__(self,today=None):
        self.today=today or date.today()
        self.records={}
        self.raw_inputs=None; self.raw_analysis=None
        self.request=None
        self.evaluation=None
        self.revision=0
        self.dirty=False
        self.scenario='empty'

    def save_daily(self,day,scores,expected_revision):
        if type(expected_revision) is not int or expected_revision!=self.revision:
            raise core.ModelError('REVISION_CONFLICT')
        when=core.parse_date(day)
        if when>self.today:
            raise core.ModelError('FUTURE_MEASUREMENT')
        core.daily_score(scores)
        normalized={k:scores.get(k) for k in KEYS}
        self.records[day]={'date':day,'scores':normalized,'urinary_concerns':copy.deepcopy(self.records.get(day,{}).get('urinary_concerns',[])), 'sleep_concerns':copy.deepcopy(self.records.get(day,{}).get('sleep_concerns',[]))}
        if self.request is not None:
            self.request['daily_records']=copy.deepcopy(list(sorted(self.records.values(),key=lambda r:r['date'])))
        self.revision+=1
        self.dirty=self.evaluation is not None and self.request is not None
        return self.state(day)

    def save_sleep_concerns(self,day,concerns,revision):
        if type(revision) is not int or revision!=self.revision:raise core.ModelError('REVISION_CONFLICT')
        if day not in self.records:raise core.ModelError('MISSING_DAILY_RECORD')
        allowed={'difficulty_falling_asleep','repeated_waking','early_waking','hot_flash_sweats','other','none'}
        if not isinstance(concerns,list) or any(not isinstance(x,str) or x not in allowed for x in concerns) or len(set(concerns))!=len(concerns):raise core.ModelError('INVALID_SLEEP_CONCERNS')
        if 'none' in concerns and len(concerns)>1:raise core.ModelError('INVALID_SLEEP_CONCERNS')
        self.records[day]['sleep_concerns']=list(concerns)
        self.revision+=1
        return self.state(day)

    def save_urinary_concerns(self,day,concerns,revision):
        if type(revision) is not int or revision!=self.revision:raise core.ModelError('REVISION_CONFLICT')
        if day not in self.records:raise core.ModelError('MISSING_DAILY_RECORD')
        allowed={'frequency','urgency','leakage','urination_discomfort','dryness_intimacy','other','none'}
        if not isinstance(concerns,list) or any(not isinstance(x,str) or x not in allowed for x in concerns) or len(set(concerns))!=len(concerns):raise core.ModelError('INVALID_URINARY_CONCERNS')
        if 'none' in concerns and len(concerns)>1:raise core.ModelError('INVALID_URINARY_CONCERNS')
        self.records[day]['urinary_concerns']=list(concerns)
        self.revision+=1
        return self.state(day)

    def load_scenario(self,name):
        if name not in SCENARIOS:
            raise core.ModelError('UNKNOWN_SCENARIO')
        if name=='empty':
            self.request=None; self.records={}; self.evaluation=None
        else:
            r=json.loads((Path(__file__).parent/'examples'/'synthetic_input.json').read_text(encoding='utf-8'))
            old_today=core.parse_date(r['as_of']); shift=self.today-old_today
            r['as_of']=self.today.isoformat()
            try: r['birth_date']=self.today.replace(year=self.today.year-48).isoformat()
            except ValueError: r['birth_date']=date(self.today.year-48,2,28).isoformat()
            for window in ('baseline','current'):
                for key in ('start','end'):
                    r[window][key]=(core.parse_date(r[window][key])+shift).isoformat()
            for row in r['daily_records']:
                row['date']=(core.parse_date(row['date'])+shift).isoformat()
            for row in r['external_devices']:
                for key in ('measured_at','valid_until'):
                    row[key]=(core.parse_date(row[key])+shift).isoformat()
            if name=='insufficient': r['daily_records']=r['daily_records'][:41]
            elif name=='missing_base': del r['external_base']['S_age']
            elif name=='safety_hold': r['safety_state']='hold'
            elif name=='source_changed':
                r['previous_device_modules']=['CR','BC']; r['external_devices']=r['external_devices'][:1]
            elif name=='no_device': r['external_devices']=[]
            self.request=r
            self.records={row['date']:copy.deepcopy(row) for row in r['daily_records']}
            self.evaluation=evaluate(r)
        self.raw_inputs=None; self.raw_analysis=None
        self.scenario=name; self.dirty=False; self.revision+=1
        return self.state()

    def save_raw_inputs(self,payload,expected_revision):
        if type(expected_revision) is not int or expected_revision!=self.revision:
            raise core.ModelError('REVISION_CONFLICT')
        from raw_inputs import analyze
        result=analyze(payload,self.today)
        self.raw_inputs=copy.deepcopy(result['input_snapshot']);self.raw_analysis=result
        self.request=None;self.evaluation=result;self.dirty=False;self.scenario='raw_manual';self.revision+=1
        return self.state()

    def apply_inputs(self,payload,expected_revision):
        if type(expected_revision) is not int or expected_revision!=self.revision:
            raise core.ModelError('REVISION_CONFLICT')
        from input_forms import build_request
        candidate=build_request(payload,self)
        evaluation=evaluate(candidate)
        self.request=candidate
        self.records={row['date']:copy.deepcopy(row) for row in candidate['daily_records']}
        self.evaluation=evaluation;self.dirty=False;self.scenario='manual';self.revision+=1
        return self.state()

    def recalculate(self):
        if self.request is None:
            raise core.ModelError('BASE_RULES_UNAVAILABLE')
        self.evaluation=evaluate(self.request)
        self.dirty=False
        self.revision+=1
        return self.state()

    def preview(self,request):
        return evaluate(request)

    def state(self,day=None):
        day=day or self.today.isoformat()
        core.parse_date(day)
        scores=copy.deepcopy(self.records.get(day,{}).get('scores',dict.fromkeys(KEYS)))
        daily=core.daily_score(scores)
        windows={}
        if self.request:
            vals=[{'date':r['date'],'value':core.daily_score(r['scores'])['total']} for r in self.records.values()]
            for key in ('baseline','current'):
                w=self.request[key]
                windows[key]=core.symptom_window(vals,w['start'],w['end'],self.today.isoformat())
        ev=self.evaluation
        current=ev.get('current_result') if ev and not self.dirty else None
        status='stale' if self.dirty else ev['status'] if ev else 'collecting'
        result={'today':self.today.isoformat(),'selected_date':day,'revision':self.revision,'scenario':self.scenario,
                'daily':{'scores':scores,'total':daily['total'],'somatic':daily['somatic'],
                         'body_score':None if daily['total'] is None else ((core.D(44)-daily['total'])*100/44).quantize(core.D('0.1'),rounding=core.ROUND_HALF_UP),
                         'body_score_scale':100,'body_score_formula':'100 * (1 - symptom_total / 44)',
                         'urinary_concerns':copy.deepcopy(self.records.get(day,{}).get('urinary_concerns',[])), 'sleep_concerns':copy.deepcopy(self.records.get(day,{}).get('sleep_concerns',[])),
                         'complete':daily['valid_for_window'],'answered':sum(v is not None for v in scores.values())},
                'records':sorted(copy.deepcopy(list(self.records.values())),key=lambda r:r['date']),
                'windows':windows,'request':copy.deepcopy(self.request),'evaluation':copy.deepcopy(ev),
                'report_status':status,'result':current,'last_result':ev.get('current_result') if ev and self.dirty else None,
                'raw_inputs':copy.deepcopy(self.raw_inputs),'raw_analysis':copy.deepcopy(self.raw_analysis),
                'synthetic':True,'can_publish':False}
        return serializable(copy.deepcopy(result))
