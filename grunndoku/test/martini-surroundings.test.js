import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,valid,canStand,cellCount,matches,rowOf,columnOf} from '../engine.js';
import {explain} from '../explain.js';
import {printPageCount,printSheet,boardMarkup,portraitMarkup,legendMarkup} from '../view.js';
import {introductionSheets} from '../print-layouts.js';
import {personEntries} from '../person-order.js';
import {objectArt} from '../art.js';
const all=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))),cases=all.filter(p=>p.setting==='martini-surroundings');
test('three surroundings cases extend Martini without moving earlier cases',()=>{
 assert.equal(all.length,47);assert.equal(all.filter(p=>p.seriesId==='martini').length,12);
 assert.deepEqual(cases.map(p=>p.number),[45,46,47]);assert.deepEqual(cases.map(p=>p.seriesNumber),[10,11,12]);
 assert.deepEqual(cases.map(p=>p.difficultyStars),[3,4,5]);assert.deepEqual(cases.map(p=>p.people.length),[8,9,10]);
 assert.deepEqual(cases.map(p=>p.theme),['De Kostery','Prinsentuin','Prinsenhof']);
 assert.equal(printPageCount(all.filter(p=>p.seriesId==='martini')),18);assert.equal(printPageCount(all),56);
});
for(const p of cases)test(`${p.id}: broad witness clues, one deductive solution and one landscape sheet`,()=>{
 const ss=solve(p);assert.equal(ss.length,1);assert.ok(valid(p,ss[0],true));
 const e=explain(p);assert.deepEqual(e.positions,ss[0]);assert.ok(e.deductions.every(d=>!d.searched));
 assert.deepEqual(p.givens,{});assert.equal(p.people[p.victim].name,'Fokko');assert.equal(personEntries(p).at(-1).i,p.victim);
 for(let i=0;i<p.people.length;i++){
  const own=p.clues.filter(c=>c.a===i);assert.equal(own.length,i===p.victim?0:1);
  if(own.length)assert.ok(Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>canStand(p,c)&&matches(p,{[i]:c},own[0])).length>=2);
 }
 assert.ok(p.clues.every(c=>c.a!==p.victim&&c.b!==p.victim&&!c.text.includes('Fokko')));
 for(let a=0;a<p.areas.length;a++){
  const cells=p.regions.flatMap((area,c)=>area===a?[c]:[]);assert.ok(cells.length>=4,p.areas[a]);const seen=new Set([cells[0]]),queue=[cells[0]];
  while(queue.length){const c=queue.pop();for(const d of [c-1,c+1,c-p.width,c+p.width])if(p.regions[d]===a&&Math.abs(rowOf(p,c)-rowOf(p,d))+Math.abs(columnOf(p,c)-columnOf(p,d))===1&&!seen.has(d)){seen.add(d);queue.push(d);}}
  assert.equal(seen.size,cells.length,p.areas[a]);
 }
 assert.equal(new Set(p.objects.map(o=>o.cell)).size,p.objects.length);
 for(const o of p.objects){assert.equal(canStand(p,o.cell),o.occupiable);if(o.type!=='bench')assert.notEqual(objectArt(o.type),objectArt('unknown'),o.type);}
 for(const id of new Set(p.objects.map(o=>o.furnitureId).filter(Boolean))){const os=p.objects.filter(o=>o.furnitureId===id),o=os[0];assert.equal(os.length,o.tile.width*o.tile.height);assert.equal(new Set(os.map(o=>p.regions[o.cell])).size,1);}
 assert.ok(p.clues.filter(c=>c.b!=null).length>=2);assert.equal(printPageCount([p]),1);assert.equal((printSheet(p).match(/class="print-sheet/g)||[]).length,1);
 assert.ok(printSheet(p).includes('ROND DE MARTINI'));
});
test('garden and café furniture appear in the expanded Martini introduction',()=>{
 const html=introductionSheets({boardMarkup,portraitMarkup,legendMarkup},{church:true,surroundings:true});
 for(const word of ['Bankje: bezetbaar','Vloerkleed: bezetbaar'])assert.ok(!html.includes(word),'occupancy suffixes are presentation metadata');
 for(const word of ['Rozenperk','Kruidenbed','Espressoapparaat','Zonnewijzerpoort'])assert.ok(html.includes(word));
 assert.ok(cases[0].areas.includes('Bovenzaal'));assert.ok(cases[0].mapCaption.includes('uitgeklapt'));
 assert.ok(cases[1].objects.some(o=>o.type==='roseBed'&&o.tile?.width===2&&o.tile?.height===2));
 assert.ok(cases[1].objects.some(o=>o.type==='herbBed'));assert.ok(cases[1].objects.some(o=>o.type==='sundialGate'));
});
