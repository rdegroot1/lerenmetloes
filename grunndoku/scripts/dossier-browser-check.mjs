import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {solve,region} from '../engine.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs');
const root=fileURLToPath(new URL('../',import.meta.url)),puzzles=JSON.parse(fs.readFileSync(path.join(root,'puzzles.json')));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://grunndoku.local/**',async route=>{const url=new URL(route.request().url()),file=path.join(root,url.pathname==='/'?'index.html':url.pathname),ext=path.extname(file);await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.pdf':'application/pdf'})[ext]||'application/octet-stream'});});
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierCount').innerText(),/^0 van 47/);assert.equal(await page.locator('#resumeCase').isVisible(),false);
 await page.click('#classicSeries');await page.click('#beginTheme');await page.waitForSelector('#puzzleScreen:visible');
 assert.equal(await page.locator('#rules').count(),1);assert.equal(await page.locator('#boardRules').count(),0);
 await page.locator('#caseMenu>summary').click();assert.equal(await page.locator('#printCase').isVisible(),true);assert.match(await page.locator('#headerThemePdf').getAttribute('href'),/stadse-speurtochten/);await page.keyboard.press('Escape');assert.equal(await page.locator('#caseMenu').getAttribute('open'),null);
 await page.click('#rules');assert.equal(await page.locator('#rulesDialog').isVisible(),true);await page.keyboard.press('Escape');
 await page.click('#hint');assert.match(await page.locator('#hintStep').innerText(),/Fokko helpt/);assert.match(await page.locator('#hintText').innerText(),/^Moi, Fokko hier/);await page.click('#hintClose');
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
 const saved=await finish(first);assert.equal(saved.solved,true);await page.screenshot({path:'/tmp/grunndoku-dossier-complete.png'});
 await page.click('#resultMap');assert.equal(await page.locator('#completionPanel').isVisible(),false);await page.click('#accuse');assert.equal(await page.locator('#completionPanel').isVisible(),true);assert.equal(await page.locator('#celebrationText').innerText(),(await import('../detective-voice.js')).celebrationMessage(saved.celebrationIndex));
 await page.click('#resultNext');const second=puzzles.find(q=>q.seriesId===first.seriesId&&q.id!==first.id);const savedSecond=await finish(second);assert.notEqual(savedSecond.celebrationIndex,saved.celebrationIndex);
 await page.click('#resultMap');await page.click('#backHome');assert.match(await page.locator('#dossierCount').innerText(),/^2 van 47/);assert.equal(await page.locator('.theme-stad progress').getAttribute('value'),'2');await page.screenshot({path:'/tmp/grunndoku-dossier-home.png',fullPage:true});
 await page.reload();await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierCount').innerText(),/^2 van 47/);
 await page.click('#classicSeries');assert.match(await page.locator('#themeCaseSelect option').first().innerText(),/^✓ Zaak/);
 await page.selectOption('#themeCaseSelect','2');await page.click('#beginTheme');await page.locator('#caseOverview>summary').click();await page.locator('#caseTrail button').first().click();assert.equal(await page.locator('#caseOverview').getAttribute('open'),null);assert.equal(await page.locator('#caseTitle').innerText(),first.title);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.click('#accuse');assert.equal(await page.locator('#completionPanel').isVisible(),true);const box=await page.locator('#accuseDialog').boundingBox();assert.ok(box.width<=390&&box.height<=844);await page.screenshot({path:'/tmp/grunndoku-dossier-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Dossier, resume, progressive Fokko hints, two real solves, saved non-repeating reactions, optional feedback, theme progress, header menus and mobile result OK.');
}finally{await browser.close();}
