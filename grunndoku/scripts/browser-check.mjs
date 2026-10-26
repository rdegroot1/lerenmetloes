// Optional browser regression check. Start a local server, then run with
// PLAYWRIGHT_MODULE (if needed), CHROMIUM_PATH and GRUNNDOKU_TEST_URL.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,canStand} from '../engine.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
const base=process.env.GRUNNDOKU_TEST_URL||'http://127.0.0.1:8080/grunndoku/';
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForSelector('.person-card');
 const currentState=id=>page.evaluate(id=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id)),id);
 const select=async id=>{const i=puzzles.findIndex(p=>p.id===id);assert.ok(i>=0);await page.selectOption('#caseSelect',String(i));return puzzles[i];};
 for(const id of [puzzles[0].id,'martini-v1-1','martini-v1-3','winterwelvaart-v1-1','winterwelvaart-v1-2','winterwelvaart-v1-3'].filter(id=>puzzles.some(p=>p.id===id))){
  const p=await select(id);await page.click('#reset');const positions=solve(p)[0],who=p.people.findIndex((_,i)=>!Object.hasOwn(p.givens,i)),cell=positions[who];
  assert.match(await page.locator('#people .person-header').last().getAttribute('aria-label'),/^Fokko,/);assert.match(await page.locator('#quickPerson option').last().innerText(),/^Fokko/);assert.equal(await page.locator('#legend,#areaKey,#objectLegend').count(),0);
  const layout=await page.evaluate(()=>{const a=document.querySelector('.clue-page').getBoundingClientRect(),b=document.querySelector('.map-panel').getBoundingClientRect();return {left:a.x,right:b.x,topDifference:Math.abs(a.y-b.y),height:document.querySelector('.book').getBoundingClientRect().height};});
  assert.ok(layout.left<layout.right&&layout.topDifference<2,JSON.stringify(layout));
  await page.locator(`.person-header[aria-label^="${p.people[who].name},"]`).click();const target=page.locator(`#board [data-cell="${cell}"]`);await target.scrollIntoViewIfNeeded();await target.evaluate(e=>window.testCell=e);const before=await target.boundingBox();
  await target.dblclick({delay:70});assert.equal((await currentState(p.id)).positions[who],cell);assert.equal(await target.evaluate(e=>e===window.testCell),true);
  const after=await target.boundingBox();assert.ok(Math.abs(before.x-after.x)<1&&Math.abs(before.y-after.y)<1,'two clicks keep the same pointer target');
  await target.click();assert.equal((await currentState(p.id)).positions[who],undefined);assert.ok((await currentState(p.id)).notes[cell].includes(who));
  await target.click({button:'right'});assert.ok((await currentState(p.id)).crosses.includes(cell));assert.equal(await page.locator('#place').getAttribute('aria-pressed'),'true');await target.click({button:'right'});
  console.log(`${p.id}: side-by-side, native double-click, stable button, third click and right-click OK; book ${Math.round(layout.height)}px`);
 }
 const p=await select('winterwelvaart-v1-2');await page.click('#reset');
 const width=await page.locator('#board').evaluate(e=>e.getBoundingClientRect().width),avatar=await page.locator('.avatar').first().evaluate(e=>e.getBoundingClientRect().width);
 await page.click('#peopleZoomIn');assert.ok(await page.locator('.avatar').first().evaluate(e=>e.getBoundingClientRect().width)>avatar);assert.ok(Math.abs(await page.locator('#board').evaluate(e=>e.getBoundingClientRect().width)-width)<1);
 await page.click('#zoomIn');assert.ok(await page.locator('#board').evaluate(e=>e.getBoundingClientRect().width)>width*1.08);assert.equal(await page.locator('#peopleZoomValue').innerText(),'110%');
 await page.reload();await page.waitForSelector('.person-card');assert.equal(await page.locator('#zoomValue').innerText(),'110%');assert.equal(await page.locator('#peopleZoomValue').innerText(),'110%');await page.click('#zoomValue');await page.click('#peopleZoomValue');
 const beforePrint=await page.locator('#board').evaluate(e=>e.getBoundingClientRect().width);await page.emulateMedia({media:'print'});await page.evaluate(()=>{window.dispatchEvent(new Event('resize'));});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.ok(Math.abs(await page.locator('#board').evaluate(e=>e.getBoundingClientRect().width)-beforePrint)<1);
 await page.locator('.brand').focus();await page.keyboard.press('C');assert.match(await page.locator('.person-header[aria-pressed=true]').getAttribute('aria-label'),/^Cora/);
 const pictures=[['winterwelvaart-v1-1','.floor-ship-wood'],['winterwelvaart-v1-4','.floor-warehouse-tile'],['martini-v1-3','.floor-church-stone'],['martinitoren-v1-2','.floor-tower-brick']];
 for(const [id,selector]of pictures){await select(id);assert.match(await page.locator('#board '+selector).first().evaluate(e=>getComputedStyle(e).backgroundImage),/data:image\/svg\+xml/);}
 await page.setViewportSize({width:390,height:844});for(const id of ['martini-v1-1','winterwelvaart-v1-3','winterwelvaart-v1-6']){await select(id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}}),phone=await touch.newPage();await phone.goto(base+'?serie=winter');await phone.waitForSelector('.person-card');const winter=puzzles.find(p=>p.id==='winterwelvaart-v1-1'),who=winter.people.findIndex((_,i)=>!Object.hasOwn(winter.givens,i)),cell=solve(winter)[0][who];await phone.locator(`.person-header[aria-label^="${winter.people[who].name},"]`).tap();const t=phone.locator(`#board [data-cell="${cell}"]`);await t.scrollIntoViewIfNeeded();const box=await t.boundingBox();for(let i=0;i<2;i++)await phone.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
 const saved=await phone.evaluate(id=>JSON.parse(localStorage.getItem('grunmurdoku:v1:'+id)),winter.id);assert.equal(saved.positions[who],cell);await touch.close();
 assert.deepEqual(errors,[]);console.log('Independent zoom, saved preferences, initials, textures, mobile and rapid touch taps OK');
}finally{await browser.close();}
