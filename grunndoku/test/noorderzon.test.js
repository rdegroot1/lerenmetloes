import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,valid,canStand,cellCount,matches,rowOf,columnOf} from '../engine.js';
import {explain} from '../explain.js';
import {printSheet,printPageCount,boardMarkup,portraitMarkup,legendMarkup} from '../view.js';
import {introductionSheets} from '../print-layouts.js';
import {objectArt} from '../art.js';
import {festivalDecoration} from '../festival-art.js';
import {personEntries} from '../person-order.js';
const all=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))),cases=all.filter(p=>p.seriesId==='noorderzon');
test('Noorderzon is eight normal-size cases on five levels, with its own ten-page book',()=>{
 assert.equal(cases.length,8);assert.deepEqual(cases.map(p=>p.difficultyStars),[1,2,2,3,3,4,5,5]);
 assert.deepEqual(cases.map(p=>p.people.length),[6,6,7,8,8,9,10,10]);
 assert.ok(cases.every(p=>p.width<=10&&p.height<=10));assert.equal(printPageCount(cases),10);
 for(const p of cases){assert.equal(printPageCount([p]),1);assert.equal((printSheet(p).match(/class="print-sheet/g)||[]).length,1);assert.ok(!/XXL|KERKPLATTEGROND/.test(printSheet(p)));}
});
for(const p of cases)test(`${p.id}: connected festival spaces, broad public clues and deductive unique solution`,()=>{
 const ss=solve(p);assert.equal(ss.length,1);assert.ok(valid(p,ss[0],true));
 const e=explain(p);assert.deepEqual(e.positions,ss[0]);assert.ok(e.deductions.every(d=>!d.searched));
 assert.deepEqual(p.givens,{});assert.equal(p.people[p.victim].name,'Fokko');assert.equal(personEntries(p).at(-1).i,p.victim);
 for(let i=0;i<p.people.length;i++){
  const own=p.clues.filter(c=>c.a===i);assert.equal(own.length,i===p.victim?0:1);
  if(own.length)assert.ok(Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>canStand(p,c)&&matches(p,{[i]:c},own[0])).length>=2,'no single-cell giveaway');
 }
 assert.ok(p.clues.every(c=>c.a!==p.victim&&c.b!==p.victim&&!c.text.includes('Fokko')));
 for(let area=0;area<p.areas.length;area++){
  const cells=p.regions.flatMap((a,c)=>a===area?[c]:[]);assert.ok(cells.length>=4,p.areas[area]);const seen=new Set([cells[0]]),queue=[cells[0]];
  while(queue.length){const c=queue.pop();for(const d of [c-1,c+1,c-p.width,c+p.width])if(p.regions[d]===area&&Math.abs(rowOf(p,c)-rowOf(p,d))+Math.abs(columnOf(p,c)-columnOf(p,d))===1&&!seen.has(d)){seen.add(d);queue.push(d);}}
  assert.equal(seen.size,cells.length,p.areas[area]);
 }
 assert.equal(new Set(p.objects.map(o=>o.cell)).size,p.objects.length);
 for(const o of p.objects){assert.equal(canStand(p,o.cell),o.occupiable);if(o.type!=='bench')assert.notEqual(objectArt(o.type),objectArt('unknown'),o.type);}
 for(const id of new Set(p.objects.map(o=>o.furnitureId).filter(Boolean))){const os=p.objects.filter(o=>o.furnitureId===id),o=os[0];assert.equal(os.length,o.tile.width*o.tile.height);assert.equal(new Set(os.map(o=>p.regions[o.cell])).size,1);}
 if(p.difficultyStars>=4){assert.ok(p.clues.filter(c=>c.b!=null).length>=3);assert.ok(p.clues.some(c=>c.type==='objectCount'));}
});
test('pond cases have standing rectangular water with central fountain and playable shore',()=>{
 for(const p of cases.filter(p=>p.pondRect)){const[x,y,w,h]=p.pondRect;assert.ok(h>w);assert.equal(p.waterCells.length,w*h);for(let r=y;r<y+h;r++)for(let c=x;c<x+w;c++){const cell=r*p.width+c;assert.ok(p.waterCells.includes(cell));assert.equal(canStand(p,cell),false);}assert.ok(festivalDecoration(p).includes(`translate(${(x+w/2)*100} ${(y+h/2)*100})`));assert.ok(boardMarkup(p).includes('water-void'));}
 const p=cases[2],area=p.areas.indexOf('Vlonder');assert.ok(p.regions.some((a,c)=>a===area&&canStand(p,c)));
});
test('festival tutorial and original object reference appear only at the start',()=>{
 const html=introductionSheets({boardMarkup,portraitMarkup,legendMarkup},{series:'noorderzon'});assert.ok(html.includes('NOORDERZON'));assert.ok(html.includes('Pizzaoven'));assert.ok(html.includes('Fietsenrek'));assert.equal((html.match(/class="print-sheet/g)||[]).length,2);
 assert.ok(cases.every(p=>!printSheet(p).includes('intro-occupancy')));
});

test('empty-room counts include everyone and reject partial boards that cannot reach the count',()=>{
 const p={size:4,regions:[0,0,1,1,0,0,1,1,2,2,3,3,2,2,3,3],areas:['A','B','C','D'],people:[{},{},{},{}],victim:3,objects:[]};
 const q={type:'emptyRooms',count:2,text:'Precies twee gebieden waren leeg.'};
 assert.equal(matches(p,{0:0,1:5,2:10,3:15},q,true),true);
 assert.equal(matches(p,{0:0,1:6,2:9,3:15},q,true),false);
 assert.equal(matches(p,{0:0,1:5},q),true);
 assert.equal(matches(p,{0:0,1:6,2:9},q),false);
 assert.equal(matches(p,{0:0,1:1,2:4},{...q,count:1}),false);
 for(const c of cases.filter(p=>p.difficultyStars>=4))assert.ok(c.clues.some(q=>q.type==='emptyRooms'));
});
