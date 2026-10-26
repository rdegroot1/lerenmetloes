import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,valid,canStand,adjacentCells,gridWidth,gridHeight} from '../engine.js';
import {printSheet,printPageCount,boardMarkup,legendMarkup,portraitMarkup} from '../view.js';
import {TUTORIAL,introductionSheets} from '../print-layouts.js';
import {explain} from '../explain.js';
const all=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))),cases=all.filter(p=>p.seriesId==='martini'&&p.setting!=='tower');
test('Martini progresses from six people to an exceptional sixteen-person finale',()=>{assert.equal(cases.length,6);assert.deepEqual(cases.map(p=>p.people.length),[6,8,10,12,14,16]);assert.deepEqual(cases.map(p=>p.difficultyStars),[1,2,3,4,5,6]);assert.deepEqual(cases.map(p=>Object.keys(p.givens).length),[4,2,0,0,0,0]);});
for(const p of cases)test(`${p.id}: rectangular church, public clues, unique solution and printable dossier`,()=>{
 assert.equal(p.regions.length,gridWidth(p)*gridHeight(p));assert.ok(p.width>p.height);assert.ok(p.regions.includes(-1));
 assert.equal(new Set(p.objects.map(o=>o.cell)).size,p.objects.length);
 for(const id of new Set(p.objects.map(o=>o.furnitureId).filter(Boolean))){const parts=p.objects.filter(o=>o.furnitureId===id),first=parts[0];assert.equal(parts.length,first.tile.width*first.tile.height);assert.equal(new Set(parts.map(o=>p.regions[o.cell])).size,1);for(const o of parts)assert.equal(o.cell,first.cell-first.tile.x-first.tile.y*p.width+o.tile.x+o.tile.y*p.width);}
 assert.ok(p.objects.some(o=>o.type==='churchOrgan'));assert.ok(p.objects.some(o=>o.type==='churchPew'&&o.occupiable));assert.ok(!p.objects.some(o=>/altar|confession/i.test(o.type)));
 const solutions=solve(p);assert.equal(solutions.length,1);assert.ok(valid(p,solutions[0],true));assert.equal(Object.keys(solutions[0]).length,p.people.length);
 p.people.forEach((person,i)=>{assert.equal(p.clues.filter(c=>c.a===i).length,i===p.victim||Object.hasOwn(p.givens,i)?0:1);});
 for(const clue of p.clues){assert.notEqual(clue.a,p.victim);assert.notEqual(clue.b,p.victim);assert.ok(!clue.text.includes(p.people[p.victim].name));}
 assert.equal(new Set(p.people.map(x=>x.name[0])).size,p.people.length);
 const explanation=explain(p);assert.ok(explanation.steps.length>=p.people.length+1);
 const paper=printSheet(p);assert.equal((paper.match(/class="print-sheet/g)||[]).length,p.people.length<=10?1:2);assert.ok(!paper.includes('class="ribbon"'));assert.equal((paper.match(/class="church-print-person/g)||[]).length,p.people.length);
});
test('rectangular coordinates never wrap at a row boundary',()=>{const p={width:6,height:3,size:6,regions:Array(18).fill(0),objects:[{cell:5,type:'tree'}]};assert.equal(canStand(p,18),false);assert.ok(!adjacentCells(p,['tree']).includes(6));assert.ok(adjacentCells(p,['tree']).includes(11));});
test('original tutorial has one solution, four people and two original learning pages',()=>{const s=solve(TUTORIAL);assert.equal(s.length,1);assert.deepEqual(s[0],{0:0,1:6,2:9,3:15});const html=introductionSheets({boardMarkup,legendMarkup,portraitMarkup},{church:true});assert.equal((html.match(/class="print-sheet/g)||[]).length,2);});
test('paper page counts include two introductions once and separate Martini maps',()=>{assert.equal(printPageCount(all),36);assert.equal(printPageCount(cases),11);assert.equal(printPageCount(all.filter(p=>p.seriesId==='nacht')),6);assert.equal(printPageCount([cases[0]]),1);assert.equal(printPageCount([all[0]]),1);});
