import sys,json,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'public/demo5/python'))
import browser_bridge as bridge
from service import Session,SCENARIOS
from datetime import date

class BridgeTests(unittest.TestCase):
 def setUp(self): bridge.session=Session(date(2026,10,29))
 def call(self,path,body=None,day='',today='2026-10-29'):
  return json.loads(bridge.dispatch(path,'POST' if body is not None else 'GET',json.dumps(body) if body is not None else '',day,today))
 def test_scenario_parity_and_decimal_roundtrip(self):
  for name in SCENARIOS:
   bridge.session=Session(date(2026,10,29))
   result=self.call('/api/scenario',{'name':name})['data']
   self.assertEqual(result,Session(date(2026,10,29)).load_scenario(name))
   snapshot=bridge.export();bridge.session=Session();bridge.restore(snapshot)
   self.assertEqual(self.call('/api/state')['data'],result)
 def test_prompt_persistence_no_extra_score(self):
  self.call('/api/daily',{'date':'2026-10-29','scores':dict(B=0,Y=0,L=0,PsyDaily=0,Udaily=4),'revision':0})
  before=self.call('/api/state')['data']['daily']['body_score']
  self.assertEqual(self.call('/api/urinary-concerns',{'date':'2026-10-29','concerns':['urgency'],'revision':1})['status'],200)
  snapshot=bridge.export();bridge.session=Session();bridge.restore(snapshot)
  daily=self.call('/api/state')['data']['daily']
  self.assertEqual(daily['urinary_concerns'],['urgency']);self.assertEqual(daily['body_score'],before)
 def test_new_day(self):
  self.assertEqual(self.call('/api/state',today='2026-10-30')['data']['today'],'2026-10-30')
 def test_invalid_and_revision(self):
  self.assertEqual(self.call('/api/daily',{'date':'2026-10-29','scores':{},'revision':99})['status'],409)
  self.assertEqual(self.call('/api/daily',{})['status'],400)

if __name__=='__main__':unittest.main()
