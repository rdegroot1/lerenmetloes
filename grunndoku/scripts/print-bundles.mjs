// Render the seven downloadable books from their current source data.
// Uses only local route fixtures, never a real account or external service.
import {chromium} from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import {fileURLToPath} from 'node:url';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://apmxwvxdldpfemwtaouq.supabase.co/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 await page.route('http://grunndoku.local/**',route=>{const u=new URL(route.request().url()),file=path.join(root,u.pathname==='/'?'index.html':u.pathname);return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});});
 await page.goto('http://grunndoku.local/');await page.waitForSelector('#homeScreen:visible');await page.evaluate(()=>window.print=()=>{});await page.emulateMedia({media:'print'});
 let skip=Math.max(0,Number(process.env.GRUNNDOKU_PRINT_SKIP)||0);
 for(const [name,series,tower,pages]of [['stadse-speurtochten','stad',false,19],['nacht-in-stad','nacht',false,6],['moord-in-de-martini','martini',false,18],['martinitoren','martini',true,6],['winterwelvaart','winter',false,11],['noorderzon','noorderzon',false,10],['print',null,false,56]]){
  if(skip>0){skip--;continue;}
  await page.evaluate(async({series,tower})=>{const {printPuzzles}=await import('./view.js?v=20261028-cast'),all=await(await fetch('./puzzles.json')).json();const selected=all.filter(p=>(!series||(p.seriesId||'stad')===series)&&(!tower||p.setting==='tower'));printPuzzles(selected);},{series,tower});
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('.print-sheet').count(),pages,name);
  const overflow=await page.locator('.print-sheet').evaluateAll(es=>es.map((e,i)=>({i,height:e.clientHeight,scroll:e.scrollHeight,width:e.clientWidth,sw:e.scrollWidth})).filter(e=>e.scroll>e.height+1||e.sw>e.width+1));assert.deepEqual(overflow,[],name);
  assert.ok((await page.locator('.intro-sheet').first().textContent()).includes('Noteer C en T'));
  await page.pdf({path:'/tmp/grunndoku-'+name+'-cast.pdf',preferCSSPageSize:true,printBackground:true});console.log(name,pages,'landscape pages; no overflow');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
