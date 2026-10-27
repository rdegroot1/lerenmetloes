// UI contract test with explicit Auth/Data API test doubles. Real RLS is checked
// separately with supabase/verify-rls.sql. This does not verify email delivery.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs');
const root=fileURLToPath(new URL('../',import.meta.url)),puzzles=JSON.parse(fs.readFileSync(path.join(root,'puzzles.json'))),p=puzzles[0];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[],rows=new Map();page.on('pageerror',e=>errors.push(e.message));
 const bundle={id:'bundle-browser-fixture',title:'Testbundel',description:'Alleen voor lokale tests',case_count:1},owned=new Set();
 const paid={...p,id:'bundle-browser-case',seriesId:bundle.id,bundleId:bundle.id};
 const user={id:'7fa5f62e-66af-4c13-a541-67e45132eb86',email:'browser-test@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{}};
 const token=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test-signature';
 await page.route('https://apmxwvxdldpfemwtaouq.supabase.co/**',async route=>{
  const req=route.request(),u=new URL(req.url()),headers={'access-control-allow-origin':'http://grunndoku.local','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'};if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}let body,status=200;
  if(u.pathname==='/auth/v1/token')body={access_token:token,refresh_token:'fixture-refresh',expires_in:3600,token_type:'bearer',user};
  else if(u.pathname==='/auth/v1/user')body=user;
  else if(u.pathname==='/auth/v1/logout'){status=204;}
  else if(u.pathname==='/rest/v1/grunndoku_bundles')body=[bundle];
  else if(u.pathname==='/rest/v1/grunndoku_bundle_access')body=[...owned].map(bundle_id=>({bundle_id}));
  else if(u.pathname==='/rest/v1/grunndoku_bundle_puzzles')body=owned.has(bundle.id)?[{data:paid}]:[];
  else if(u.pathname==='/rest/v1/rpc/activate_grunndoku_bundle'){const input=req.postDataJSON();if(input.access_code==='FAKE-BUNDLE-CODE-2026'&&(!input.expected_bundle||input.expected_bundle===bundle.id)){owned.add(bundle.id);body={ok:true,bundle_id:bundle.id};}else body={ok:false,reason:'invalid'};}
  else if(u.pathname==='/rest/v1/grunndoku_progress'){
   const id=u.searchParams.get('puzzle_id')?.slice(3);
   if(req.method()==='GET')body=id?rows.get(id)||null:[...rows.values()];
   else {const data=req.postDataJSON();const previous=rows.get(id||data.puzzle_id);if(req.method()==='PATCH'&&previous?.version!==+u.searchParams.get('version').slice(3))body=null;else{const row={puzzle_id:id||data.puzzle_id,state:data.state,version:(previous?.version||0)+1};rows.set(row.puzzle_id,row);body=row;}}
  }else throw Error('Unexpected fixture request: '+u.pathname);
  await route.fulfill({status,headers,contentType:'application/json',body:body===undefined?'':JSON.stringify(body)});
 });
 await page.route('http://grunndoku.local/**',async route=>{const u=new URL(route.request().url()),file=path.join(root,u.pathname==='/'?'index.html':u.pathname),ext=path.extname(file);await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'})[ext]||'application/octet-stream'});});
 await page.goto('http://grunndoku.local/?accounts=preview');await page.waitForSelector('#accountButton:visible');await page.click('#classicSeries');await page.click('#beginTheme');
 const cell=page.locator('#board button:not([disabled])').first();await cell.click();const guest=await page.evaluate(id=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id)),p.id);assert.ok(Object.keys(guest.notes).length);
 await page.click('#accountButton');await page.fill('#loginEmail',user.email);await page.fill('#loginPassword','Temporary-fixture-123!');await page.locator('#accountForm button[type=submit]').click();await page.waitForSelector('#accountSignedIn:visible');await page.waitForFunction(()=>document.querySelector('#accountStatus').textContent.includes('online bijgewerkt'));
 assert.equal(await page.locator('#board .pencil').count(),0,'guest notes do not silently appear in an account');assert.equal(await page.locator('#guestImport').isVisible(),true);
 await page.click('#importGuest');await page.waitForFunction(()=>document.querySelector('#accountStatus').textContent.includes('online bijgewerkt'));assert.ok(rows.get(p.id));assert.equal(Object.hasOwn(rows.get(p.id).state,'difficultyFeedback'),false);assert.equal(await page.locator('#board .pencil').count(),1);
 // Inject a concurrent remote change, then make a different local edit.
 await page.locator('#accountDialog .close').click();const second=page.locator('#board button:not([disabled])').nth(1);await second.click();const row=rows.get(p.id);rows.set(p.id,{...row,state:{...row.state,notes:{}},version:row.version+1});await page.click('#accountButton');await page.click('#retrySync');await page.waitForSelector('#syncConflicts:visible');assert.ok(await page.locator('#syncConflictList details').count()>=2);await page.locator('#syncConflictList button').first().click();await page.waitForFunction(()=>document.querySelector('#accountStatus').textContent.includes('online bijgewerkt'));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/grunndoku-account-mobile.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.click('#signOutAccount');await page.waitForSelector('#accountSignIn:visible');assert.equal(await page.locator('#board .pencil').count(),1,'the original guest copy is restored');
 await page.locator('#accountDialog .close').click();await page.reload();await page.waitForSelector('#puzzleScreen:visible');assert.equal(await page.locator('#board .pencil').count(),1);
 await page.goto('http://grunndoku.local/?accounts=preview#access_token='+token+'&refresh_token=fixture-refresh&expires_in=3600&token_type=bearer&type=recovery');
 await page.waitForSelector('#passwordRecovery:visible');await page.fill('#newPassword','New-fixture-password-456!');await page.locator('#passwordRecovery button').click();await page.waitForFunction(()=>document.querySelector('#accountMessage').textContent.includes('nieuwe wachtwoord is bewaard'));await page.click('#signOutAccount');await page.waitForSelector('#accountSignIn:visible');
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');assert.equal(await page.locator('#accountButton').isVisible(),false,'public login stays gated until SMTP is verified');assert.deepEqual(errors,[]);
 // Shared theme-code UI contract; real database isolation is verified separately.
 await page.goto('http://grunndoku.local/?accounts=preview');await page.waitForSelector('#openBundles:visible');await page.click('#openBundles');await page.fill('#bundleCode','FAKE-BUNDLE-CODE-2026');await page.locator('#bundleForm button').click();assert.match(await page.locator('#bundleStatus').innerText(),/Meld je eerst aan/);await page.locator('#bundleDialog .close').click();
 await page.goto('http://grunndoku.local/?accounts=preview');await page.waitForSelector('#accountButton:visible');await page.click('#accountButton');await page.fill('#loginEmail',user.email);await page.fill('#loginPassword','Temporary-fixture-123!');await page.locator('#accountForm button[type=submit]').click();await page.waitForSelector('#accountSignedIn:visible');
 await page.fill('#accountBundleCode','WRONG-CODE-123456');await page.locator('#accountBundleForm button').click();await page.waitForFunction(()=>document.querySelector('#accountBundleStatus').textContent.includes('niet geldig'));
 await page.fill('#accountBundleCode','FAKE-BUNDLE-CODE-2026');await page.locator('#accountBundleForm button').click();await page.waitForFunction(()=>document.querySelector('#accountBundleStatus').textContent.includes('staat nu'));
 assert.equal(await page.locator('#accountBundleCode').inputValue(),'');await page.locator('#accountDialog .close').click();await page.locator('.bundle-card button').click();await page.waitForSelector('#themeStartScreen:visible');assert.equal(await page.locator('#themeStartTitle').innerText(),bundle.title);await page.click('#beginTheme');assert.equal(await page.locator('#caseTitle').innerText(),p.title);assert.equal(await page.locator('#caseSelect option').count(),1);
 await page.reload();await page.waitForSelector('#puzzleScreen:visible');assert.equal(await page.locator('#activeSeriesName').innerText(),bundle.title);
 await page.click('#accountButton');await page.click('#signOutAccount');await page.waitForSelector('#accountSignIn:visible');await page.locator('#accountDialog .close').click();assert.equal(await page.locator('#homeScreen').isVisible(),true);assert.match(await page.locator('.bundle-card button').innerText(),/Toegangscode/);assert.ok(!await page.evaluate(()=>document.querySelector('#caseSelect').innerHTML.includes('bundle-browser-case')));
 await page.locator('.bundle-card button').click();assert.equal(await page.locator('#bundleDialog').isVisible(),true);await page.locator('#bundleDialog .close').click();
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}}));
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierStorage').innerText(),/venster openblijft/);await page.click('#classicSeries');await page.click('#beginTheme');await page.locator('#board button:not([disabled])').first().click();assert.equal(await page.locator('#board .pencil').count(),1);assert.deepEqual(errors,[]);
 console.log('Auth/Data API UI contract: scoped caches, explicit import, conflict choice, logout, reload, mobile and public gate OK. Email delivery and real Auth require separate live checks.');
}finally{await browser.close();}
