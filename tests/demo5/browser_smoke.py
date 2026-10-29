import sys,json,os
from pathlib import Path
from datetime import date
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'public/demo5/python'))
from service import Session,SCENARIOS
base=os.environ.get('DEMO5_URL','http://127.0.0.1:8767/demo5_static/').rstrip('/')
(root/'.tmp').mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':375,'height':900});errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:requests.append(r.url))
 page.goto(base+'/meiyou-menopause-daily-check.html')
 page.wait_for_function('window.AlgorithmUI?.getState()?.today',timeout=120000)
 def api(path,body=None):
  return page.evaluate('async ([path,body])=>{const r=await fetch(path,body?{method:"POST",body:JSON.stringify(body)}:{});return {status:r.status,data:await r.json()}}',[path,body])
 today=page.evaluate('AlgorithmUI.getState().today')
 for name in SCENARIOS:
  local=Session(date.fromisoformat(today)).load_scenario(name)
  online=api('/api/scenario',{'name':name})['data']
  for key in ('daily','result','evaluation','windows','report_status'):
   assert online[key]==local[key],(name,key)
 api('/api/scenario',{'name':'empty'});page.reload();page.wait_for_function('window.AlgorithmUI?.getState()?.today',timeout=120000)
 for field in ('B','Y','L','PsyDaily','Udaily'):
  page.locator(f'[data-score-field="{field}"] [data-score="0"]').click()
  page.wait_for_function('(key)=>AlgorithmUI.getState().daily.scores[key]===0',arg=field)
 assert float(api('/api/state')['data']['daily']['body_score'])==100
 page.locator('[data-score-field="Udaily"] [data-score="3"]').click();page.wait_for_function('AlgorithmUI.getState().daily.scores.Udaily===3');expect(page.locator('#urinary-concerns-dialog')).not_to_be_visible()
 page.locator('[data-score-field="Udaily"] [data-score="4"]').click();expect(page.locator('#urinary-concerns-dialog')).to_be_visible()
 for v in ('frequency','urgency','none'):page.locator(f'#urinary-concerns-dialog [value="{v}"]').check()
 expect(page.locator('#urinary-concerns-dialog input:checked')).to_have_count(1)
 for v in ('frequency','urgency'):page.locator(f'#urinary-concerns-dialog [value="{v}"]').check()
 before=api('/api/state')['data']['daily']['body_score']
 page.locator('#save-urinary-concerns').click();expect(page.locator('#urinary-concerns-dialog')).not_to_be_visible()
 assert api('/api/state')['data']['daily']['body_score']==before
 page.locator('[data-score-field="L"] [data-score="4"]').click();expect(page.locator('#sleep-concerns-dialog')).to_be_visible();page.locator('#sleep-concerns-dialog [value="early_waking"]').check();page.locator('#save-sleep-concerns').click();expect(page.locator('#sleep-concerns-dialog')).not_to_be_visible()
 page.goto(base+'/meiyou-menopause-home.html');page.wait_for_function('window.AlgorithmUI?.getState()?.today',timeout=120000)
 s=api('/api/state')['data'];assert s['daily']['urinary_concerns']==['frequency','urgency'];assert s['daily']['sleep_concerns']==['early_waking']
 page.locator('#simulate-cycle').click();expect(page.locator('#simulation-detail')).to_be_visible()
 assert len(api('/api/state')['data']['records'])==1
 assert api('/api/urinary-concerns',{'date':today,'concerns':['none','other'],'revision':s['revision']})['status']==400
 assert api('/api/urinary-concerns',{'date':today,'concerns':[],'revision':0})['status']==409
 assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
 assert not [u for u in requests if '/api/' in u], 'API unexpectedly sent over network'
 assert not errors,errors
 page.screenshot(path=str(root/'.tmp/demo5_static_mobile.png'),full_page=True)
 b.close()
print(json.dumps({'scenario_parity':7,'daily_score':True,'urinary_and_sleep':True,'navigation_persistence':True,'simulation':True,'invalid_input':True,'mobile_overflow':False,'network_api_requests':0,'url':base}))
