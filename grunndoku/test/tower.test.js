import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {solve,valid,canStand,adjacentCells} from '../engine.js';import {explain} from '../explain.js';import {objectArt} from '../art.js';import {printSheet,printPageCount,boardMarkup,legendMarkup,portraitMarkup} from '../view.js';
import {introductionSheets} from '../print-layouts.js';
const all=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))),cases=all.filter(p=>p.setting==='tower');
test('three tower cases add levels 3/4 with varied casts and appropriate paper sizes',()=>{assert.deepEqual(cases.map(p=>p.difficultyStars),[3,4,4]);assert.deepEqual(cases.map(p=>p.people.length),[8,10,12]);assert.deepEqual(cases.map(p=>printPageCount([p])),[1,1,2]);assert.equal(printPageCount(cases),6);assert.equal(printPageCount(all.filter(p=>p.seriesId==='martini')),15);});
for(const p of cases)test(`${p.id}: unique public solution, real tower features and complete footprints`,()=>{
 const solutions=solve(p);assert.equal(solutions.length,1);const [s]=solutions;assert.ok(valid(p,s,true));assert.deepEqual(explain(p).positions,s);assert.equal(p.people[p.victim].name,'Fokko');
 p.people.forEach((person,i)=>assert.equal(p.clues.filter(c=>c.a===i).length,i===p.victim?0:1));
 assert.ok(p.clues.every(c=>c.a!==p.victim&&c.b!==p.victim&&!c.text.includes('Fokko')));assert.equal(p.victimLocationClue,false);
 assert.equal(new Set(p.people.map(x=>x.name[0])).size,p.people.length);assert.equal(new Set(p.objects.map(o=>o.cell)).size,p.objects.length);
 for(const name of ['Eerste trans','Uurwerkzolder','Filmzolder','Klokkenzolder','Trappenhuis'])assert.ok(p.areas.includes(name));
 for(const type of ['towerBell','towerStairs','towerRailing','towerClock']){const objects=p.objects.filter(o=>o.type===type);assert.ok(objects.length>0);assert.ok(objects.every(o=>o.occupiable===(type==='towerStairs')));assert.notEqual(objectArt(type),objectArt('unknown'));}
 for(const id of new Set(p.objects.map(o=>o.furnitureId).filter(Boolean))){const parts=p.objects.filter(o=>o.furnitureId===id),first=parts[0];assert.equal(parts.length,first.tile.width*first.tile.height);assert.equal(new Set(parts.map(o=>p.regions[o.cell])).size,1);for(const o of parts)assert.equal(o.cell,first.cell+o.tile.y*p.width+o.tile.x);}
 const bell=p.objects.find(o=>o.type==='towerBell');assert.equal(canStand(p,bell.cell),false);assert.ok(!adjacentCells(p,['towerBell']).includes(bell.cell));
 assert.ok(Object.values(s).some(c=>p.objects.some(o=>o.cell===c&&o.type==='towerStairs')),'stairs play a genuine role');
 for(let area=0;area<p.areas.length;area++){const cells=p.regions.flatMap((a,c)=>a===area?[c]:[]),seen=new Set([cells[0]]),queue=[cells[0]];while(queue.length){const c=queue.pop();for(const d of [c-1,c+1,c-p.width,c+p.width])if(p.regions[d]===area&&Math.abs(Math.floor(d/p.width)-Math.floor(c/p.width))+Math.abs(d%p.width-c%p.width)===1&&!seen.has(d)){seen.add(d);queue.push(d);}}assert.equal(seen.size,cells.length);}
 const paper=printSheet(p);assert.ok(!paper.includes('UITGEKLAPTE TOREN · HOGER OP DE KAART'));assert.ok(!paper.includes('NOORD ↑'));assert.equal((paper.match(/Was samen met de moordenaar\./g)||[]).length,1);
});

test('standalone tower introduction explains stairs and continuous floor coordinates',()=>{const paper=introductionSheets({boardMarkup,legendMarkup,portraitMarkup},{church:true,tower:true});assert.ok(paper.includes('Wenteltrap'));assert.ok(paper.includes('Luidklok'));assert.ok(paper.includes('rijen en kolommen lopen overal door'));assert.ok(!paper.includes('De zesde Martini-zaak'));});
