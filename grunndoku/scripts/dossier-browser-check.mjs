import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scoreFor} from '../scoring.js';
import {solve,region} from '../engine.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs');
const root=fileURLToPath(new URL('../',import.meta.url)),puzzles=JSON.parse(fs.readFileSync(path.join(root,'puzzles.json')));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://apmxwvxdldpfemwtaouq.supabase.co/rest/v1/grunndoku_bundles**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 await page.route('http://grunndoku.local/**',async route=>{const url=new URL(route.request().url()),file=path.join(root,url.pathname==='/'?'index.html':url.pathname),ext=path.extname(file);await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.pdf':'application/pdf'})[ext]||'application/octet-stream'});});
 await page.clock.install();
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierCount').innerText(),/^0 van 47/);assert.equal(await page.locator('#resumeCase').isVisible(),false);
 await page.click('#classicSeries');await page.click('#beginTheme');await page.waitForSelector('#puzzleScreen:visible');
 assert.equal(await page.locator('#rules').count(),1);assert.equal(await page.locator('#boardRules').count(),0);
 await page.locator('#caseMenu>summary').click();assert.equal(await page.locator('#printCase').isVisible(),true);assert.match(await page.locator('#headerThemePdf').getAttribute('href'),/stadse-speurtochten/);await page.keyboard.press('Escape');assert.equal(await page.locator('#caseMenu').getAttribute('open'),null);
 await page.click('#rules');assert.equal(await page.locator('#rulesDialog').isVisible(),true);await page.keyboard.press('Escape');
 assert.equal(await page.locator('#helpOffer').isVisible(),false);
 await page.clock.fastForward(181000);await page.waitForSelector('#helpOffer:visible');
 await page.click('#helpOfferDismiss');assert.equal(await page.locator('#helpOffer').isVisible(),false);
 await page.clock.fastForward(60000);assert.equal(await page.locator('#helpOffer').isVisible(),false);
 // Hidden tabs accrue no time and never reveal a hint.
 const getSaved=()=>page.evaluate(id=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id)),puzzles[0].id);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hiddenStart=(await getSaved()).playTimeMs;await page.clock.fastForward(60000);assert.equal((await getSaved()).playTimeMs,hiddenStart);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.click('#hint');assert.match(await page.locator('#hintStep').innerText(),/Tammo helpt/);assert.match(await page.locator('#hintText').innerText(),/^Moi, Tammo hier/);assert.match(await page.locator('#hintStep').innerText(),/1\/4/);assert.doesNotMatch(await page.locator('#hintText').innerText(),/rij \d+, kolom \d+/);
 await page.click('#hintNext');assert.match(await page.locator('#hintStep').innerText(),/2\/4/);const hintBefore=await getSaved();
 await page.click('#hintClose');await page.click('#hint');assert.match(await page.locator('#hintStep').innerText(),/2\/4/);assert.deepEqual((await getSaved()).coaching.hintViews,hintBefore.coaching.hintViews);
 await page.reload();await page.waitForSelector('#puzzleScreen:visible');await page.click('#hint');assert.match(await page.locator('#hintStep').innerText(),/2\/4/);
 await page.click('#hintNext');await page.click('#hintNext');assert.match(await page.locator('#hintStep').innerText(),/4\/4/);assert.equal(await page.locator('#hintNext').isVisible(),false);assert.match(await page.locator('#hintText').innerText(),/rij \d+, kolom \d+/);
 await page.click('#hintClose');
 const first=puzzles[0],solution=solve(first)[0],who=first.people.findIndex((_,i)=>!Object.hasOwn(first.givens,i));
 await page.locator(`.person-header[aria-label^="${first.people[who].name},"]`).click();await page.locator(`#board [data-cell="${solution[who]}"]`).click();
 await page.click('#backHome');assert.equal(await page.locator('#resumeCase').isVisible(),true);await page.click('#resumeCase');assert.equal(await page.locator('#board .pencil').count(),1);
 async function finish(q){
  const solution=solve(q)[0];
  for(let who=0;who<q.people.length;who++){
   if(Object.hasOwn(q.givens,who))continue;
   await page.locator(`.person-header[aria-label^="${q.people[who].name},"]`).evaluate(e=>e.click());
   // Respect the three-state cycle, including any existing pencil notes.
   const cell=page.locator(`#board [data-cell="${solution[who]}"]`);
   for(let click=0;click<2;click++){
    const placed=await page.evaluate(({id,who,cell})=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id))?.positions[who]===cell,{id:q.id,who,cell:solution[who]});
    if(placed)break;await cell.evaluate(e=>e.click());
   }
  }
  await page.click('#accuse');const culprit=q.people.findIndex((_,i)=>i!==q.victim&&region(q,solution[i])===region(q,solution[q.victim]));
  await page.locator('#accusations button').filter({hasText:q.people[culprit].name}).click();
  assert.equal(await page.locator('#completionPanel').isVisible(),true);assert.equal(await page.locator('#accusations').isVisible(),false);assert.equal(await page.locator('#difficultyFeedback').getAttribute('open'),null);
  assert.ok((await page.locator('#celebrationText').innerText()).length>35);assert.match(await page.locator('#completionTime').innerText(),/Jouw speeltijd:/);
  return page.evaluate(id=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id)),q.id);
 }
 const saved=await finish(first);assert.equal(saved.solved,true);const expectedScore=scoreFor(first,saved);assert.equal(expectedScore.total,900);await page.waitForFunction(total=>document.querySelector('#scoreCounter').textContent===String(total),expectedScore.total);assert.equal(await page.locator('#scoreMeter').getAttribute('aria-valuenow'),String(expectedScore.total));
 // Native sharing, cancellation and both clipboard fallbacks, without contacting any service.
 await page.waitForFunction(()=>!document.querySelector('#downloadShareMap').hidden);
 await page.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files?.[0]?.type==='image/png'});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedResult=data;}});});
 await page.click('#shareResult');const shared=await page.evaluate(()=>window.sharedResult);assert.ok(shared.text.includes(expectedScore.total+' / 1.000 speurpunten'));assert.equal(shared.url,'http://grunndoku.local/?serie=stad&zaak='+first.id);assert.equal(await page.evaluate(()=>window.sharedResult.files[0].type),'image/png');assert.ok(await page.evaluate(()=>window.sharedResult.files[0].size>1000));assert.doesNotMatch(JSON.stringify(shared),/positions|access_token|is de dader/);
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedResult=text;}}});});
 await page.click('#shareResult');assert.match(await page.locator('#shareStatus').innerText(),/gekopieerd/i);assert.match(await page.evaluate(()=>window.copiedResult),/speurpunten/);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Unavailable');}}}));
 await page.click('#shareResult');assert.equal(await page.locator('#shareFallback').isVisible(),true);assert.equal(await page.locator('#shareText').inputValue(),await page.evaluate(()=>window.copiedResult));
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}}));
 await page.click('#shareResult');assert.equal(await page.locator('#shareFallback').isVisible(),false);assert.equal(await page.locator('#shareStatus').innerText(),'');
 const png=await page.evaluate(async()=>Array.from(new Uint8Array(await window.sharedResult.files[0].arrayBuffer())));fs.writeFileSync('/tmp/grunndoku-share-map.png',Buffer.from(png));
 await page.goto(shared.url);await page.waitForSelector('#puzzleScreen:visible');assert.equal(await page.locator('#caseTitle').innerText(),first.title);await page.click('#accuse');
 assert.ok((await page.locator('#completionScore').innerText()).includes(expectedScore.total+' / 1.000'));assert.match(await page.locator('#scoreExplanation').innerText(),/Tijd kost geen punten/);await page.screenshot({path:'/tmp/grunndoku-dossier-complete.png'});
 await page.click('#resultMap');assert.equal(await page.locator('#completionPanel').isVisible(),false);await page.emulateMedia({reducedMotion:'reduce'});await page.click('#accuse');assert.equal(await page.locator('#scoreCounter').innerText(),String(expectedScore.total));await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.locator('#completionPanel').isVisible(),true);assert.equal(await page.locator('#celebrationText').innerText(),(await import('../detective-voice.js')).celebrationMessage(saved.celebrationIndex));
 await page.click('#resultNext');const second=puzzles.find(q=>q.seriesId===first.seriesId&&q.id!==first.id);const savedSecond=await finish(second);assert.notEqual(savedSecond.celebrationIndex,saved.celebrationIndex);
 await page.click('#resultMap');await page.click('#backHome');assert.match(await page.locator('#dossierCount').innerText(),/^2 van 47/);assert.match(await page.locator('#dossierScore').innerText(),/1950 speurpunten/);assert.equal(await page.locator('.theme-stad progress').getAttribute('value'),'2');await page.screenshot({path:'/tmp/grunndoku-dossier-home.png',fullPage:true});
 await page.reload();await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierCount').innerText(),/^2 van 47/);
 await page.click('#classicSeries');assert.match(await page.locator('#themeCaseSelect option').first().innerText(),/^✓ Zaak/);
 await page.selectOption('#themeCaseSelect','2');await page.click('#beginTheme');await page.locator('#caseOverview>summary').click();await page.locator('#caseTrail button').first().click();assert.equal(await page.locator('#caseOverview').getAttribute('open'),null);assert.equal(await page.locator('#caseTitle').innerText(),first.title);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.click('#accuse');assert.equal(await page.locator('#completionPanel').isVisible(),true);const box=await page.locator('#accuseDialog').boundingBox();assert.ok(box.width<=390&&box.height<=844);await page.screenshot({path:'/tmp/grunndoku-dossier-mobile.png'});
 await page.locator('#accuseDialog .close').click();await page.locator('#caseMenu>summary').click();await page.click('#reset');await page.click('#backHome');assert.match(await page.locator('#dossierScore').innerText(),/1950 speurpunten/,'earned points survive replay reset');
 const old=puzzles[2];await page.evaluate(({id,positions})=>localStorage.setItem('grunmurdoku:v1:'+id,JSON.stringify({positions,crosses:[],checked:[],solved:true})),{id:old.id,positions:solve(old)[0]});
 await page.goto('http://grunndoku.local/?serie=stad&zaak='+old.id);await page.waitForSelector('#puzzleScreen:visible');await page.click('#accuse');assert.match(await page.locator('#completionScore').innerText(),/eerdere afronding/);assert.equal(await page.locator('#scoreMeter').getAttribute('aria-valuemax'),'120');
 await page.locator('#accuseDialog .close').click();await page.locator('#caseMenu>summary').click();await page.click('#reset');const replay=await finish(old);assert.equal(replay.scoreVersion,2);assert.equal(replay.achievement.score.total,1000);assert.equal(replay.achievement.score.levelBonus,50);
 assert.deepEqual(errors,[]);console.log('Dossier, resume, progressive Tammo hints, two real solves, saved non-repeating reactions, optional feedback, theme progress, header menus and mobile result OK.');
}finally{await browser.close();}
