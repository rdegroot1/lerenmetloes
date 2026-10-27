// Local fixture saves only; never touches a real player's dossier or a service.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {solve} from '../engine.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs');
const root=fileURLToPath(new URL('../',import.meta.url)),puzzles=JSON.parse(fs.readFileSync(path.join(root,'puzzles.json')));
const fixtures=puzzles.slice(0,30).map(p=>({id:p.id,positions:solve(p)[0]}));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://apmxwvxdldpfemwtaouq.supabase.co/rest/v1/grunndoku_bundles**',route=>route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 await page.route('http://grunndoku.local/**',async route=>{const u=new URL(route.request().url()),file=path.join(root,u.pathname==='/'?'index.html':u.pathname);await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});});
 await page.addInitScript(()=>{const pending=localStorage.getItem('test-next-save');if(pending){const f=JSON.parse(pending);localStorage.setItem('grunmurdoku:v1:'+f.id,JSON.stringify(f.state));localStorage.removeItem('test-next-save');}});
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');
 await page.evaluate(fixtures=>{for(const f of fixtures.slice(1))localStorage.setItem('grunmurdoku:v1:'+f.id,JSON.stringify({positions:f.positions,crosses:[],checked:[],solved:true}));localStorage.setItem('grunmurdoku:v1:'+fixtures[0].id,JSON.stringify({positions:{},crosses:[],checked:[],solved:true}));},fixtures);
 await page.reload();await page.waitForSelector('#homeScreen:visible');assert.match(await page.locator('#dossierCount').innerText(),/^29 van/);assert.equal(await page.locator('#generalStart').isVisible(),true);
 await page.click('#classicSeries');assert.equal(await page.locator('#themeTutorial').isVisible(),true);assert.equal(await page.locator('#themeHelp').isVisible(),false);
 await page.evaluate(f=>localStorage.setItem('test-next-save',JSON.stringify({id:f.id,state:{positions:f.positions,crosses:[],checked:[],solved:true}})),fixtures[0]);
 await page.reload();await page.waitForSelector('#themeStartScreen:visible');assert.equal(await page.locator('#themeTutorial').isVisible(),false);assert.equal(await page.locator('#themeHelp').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#themeCaseSelect').isVisible(),true);assert.equal(await page.locator('#themeStartPdf').isVisible(),true);
 await page.click('#themeHelp');assert.equal(await page.locator('#themeTutorial').isVisible(),true);await page.click('#themeHelp');assert.equal(await page.locator('#themeTutorial').isVisible(),false);
 await page.click('#beginTheme');assert.equal(await page.locator('#lesson').isVisible(),false);assert.equal(await page.locator('.keyboard-tip').isVisible(),false);assert.equal(await page.locator('#shapeNote').isVisible(),false);assert.equal(await page.locator('#hint').isVisible(),true);assert.doesNotMatch(await page.locator('#message').innerText(),/Eén klik|derde klik/);
 await page.click('#rules');await page.waitForSelector('#rulesDialog:visible');await page.keyboard.press('Escape');await page.click('#hint');assert.equal(await page.locator('#hintPanel').isVisible(),true);await page.click('#hintClose');
 // Earned experience survives replay; an invalid saved proof never counts.
 await page.locator('#caseMenu>summary').click();await page.click('#reset');await page.click('#backTheme');assert.equal(await page.locator('#themeTutorial').isVisible(),false);
 await page.click('#backHome');assert.equal(await page.locator('#generalStart').isVisible(),false);await page.click('#howToPlay');assert.equal(await page.locator('#generalStart').isVisible(),true);await page.click('#howToPlay');assert.equal(await page.locator('#generalStart').isVisible(),false);
 await page.setViewportSize({width:390,height:844});await page.click('#martiniSeries');assert.equal(await page.locator('#themeTutorial').isVisible(),false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/grunndoku-experienced-mobile.png'});
 const rulesCase=puzzles.find(p=>p.seriesId==='martini'&&p.rulesNote);if(rulesCase){await page.selectOption('#themeCaseSelect',String(puzzles.indexOf(rulesCase)));await page.click('#beginTheme');assert.equal(await page.locator('#shapeNote').getAttribute('hidden'),null);}
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');await page.evaluate(id=>{const key='grunmurdoku:v1:'+id,s=JSON.parse(localStorage.getItem(key));s.achievement={positions:{}};localStorage.setItem('test-next-save',JSON.stringify({id,state:s}));},fixtures[0].id);await page.reload();await page.waitForSelector('#homeScreen:visible');assert.equal(await page.locator('#generalStart').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('29/30 threshold, validated historical solves, opt-in explanations, rules/hints, replay, mobile and special rules OK.');
}finally{await browser.close();}
