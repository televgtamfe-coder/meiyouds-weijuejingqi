"""Static-host adapter: reuse the original Python Session and algorithms unchanged."""
import json
from datetime import date
from decimal import Decimal
from service import Session
from body_age.core import ModelError
from body_age.pipeline import serializable

session=Session()
FIELDS=('records','raw_inputs','raw_analysis','request','evaluation','revision','dirty','scenario')

def encode(value):
    if isinstance(value,Decimal): return {'__decimal__':str(value)}
    raise TypeError(type(value).__name__)

def decode(value):
    if set(value)=={'__decimal__'}: return Decimal(value['__decimal__'])
    return value

def restore(snapshot):
    global session
    value=json.loads(snapshot,object_hook=decode)
    if value.get('version')!=1: raise ValueError('Unsupported session version')
    restored=Session()
    for key in FIELDS:
        if key in value['data']: setattr(restored,key,value['data'][key])
    restored.state()
    session=restored

def export():
    return json.dumps({'version':1,'data':{k:getattr(session,k) for k in FIELDS}},default=encode)

def dispatch(path,method,body,day,today):
    session.today=date.fromisoformat(today)
    try:
        payload=json.loads(body) if body else {}
        if method=='GET' and path=='/api/state': result=session.state(day or None)
        elif method=='GET' and path=='/api/trace': result=session.state()['evaluation'] or {'status':'collecting','trace':[]}
        elif method!='POST': return json.dumps({'status':404,'data':{'error':'NOT_FOUND'}})
        elif path=='/api/daily': result=session.save_daily(payload['date'],payload['scores'],payload['revision'])
        elif path=='/api/scenario': result=session.load_scenario(payload['name'])
        elif path=='/api/sleep-concerns': result=session.save_sleep_concerns(payload['date'],payload['concerns'],payload['revision'])
        elif path=='/api/urinary-concerns': result=session.save_urinary_concerns(payload['date'],payload['concerns'],payload['revision'])
        elif path=='/api/inputs': result=session.save_raw_inputs(payload['inputs'],payload['revision'])
        elif path=='/api/evaluate': result=session.recalculate()
        elif path=='/api/evaluate-request': result=session.preview(payload['request'])
        else: return json.dumps({'status':404,'data':{'error':'NOT_FOUND'}})
        return json.dumps({'status':200,'data':serializable(result)},allow_nan=False)
    except ModelError as exc:
        return json.dumps({'status':409 if exc.code=='REVISION_CONFLICT' else 400,'data':{'error':exc.code}})
    except (KeyError,TypeError,ValueError):
        return json.dumps({'status':400,'data':{'error':'INVALID_REQUEST'}})
