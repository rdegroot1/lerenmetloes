import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {canStand,valid,matches,solve,furnitureCells,adjacentCells} from '../engine.js';
import {restorePencilNotes,sanitizeBackups} from '../notes.js';
const p={size:4,regions:Array(16).fill(0),people:[{},{},{},{}],victim:3,givens:{},clues:[],objects:[{cell:0,type:'chair',occupiable:true},{cell:5,type:'chair',occupiable:true},{cell:10,type:'rug',occupiable:true},{cell:15,type:'books'}]};
test('occupiable furniture accepts a person while legacy and blocked objects do not',()=>{
 assert.equal(canStand(p,0),true);assert.equal(valid(p,{0:0}),true);assert.equal(canStand(p,15),false);
 assert.equal(canStand({...p,objects:[{cell:0,type:'chair'}]},0),false);
});
test('on and only-on furniture clues include all persons, including the victim',()=>{
 const on={type:'onObject',a:0,types:['chair']};assert.equal(matches(p,{0:0},on),true);assert.equal(matches(p,{0:1},on),false);
 const only={type:'onlyOnObject',a:0,types:['chair']};assert.equal(matches(p,{0:0,3:5},only),false);assert.equal(matches(p,{0:0,3:6},only),true);
});
test('exact furniture counts work in partial and complete placements',()=>{
 const c={type:'objectCount',types:['chair'],count:2};assert.equal(matches(p,{0:0},c),true);assert.equal(matches(p,{0:0,3:5,1:10,2:14},c,true),true);
 assert.equal(matches(p,{0:0,3:6,1:10,2:14},c,true),false);
 assert.equal(matches(p,{0:0,3:5},{...c,count:1}),false);
});
test('pencil notes on furniture survive save loading and third-click restoration',()=>{
 const state={positions:{0:5},notes:{},noteBackups:{0:{cell:5,notes:{0:[0],10:[0,1]}}},crosses:[]};
 state.noteBackups=sanitizeBackups(p,state.noteBackups);restorePencilNotes(state,p,0);assert.deepEqual(state.notes,{0:[0],10:[0,1]});
});
const night=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))).filter(p=>p.seriesId==='nacht');
test('each night witness has exactly one clue and nobody refers to the victim',()=>{
 for(const p of night){
  for(let who=0;who<p.people.length;who++)assert.equal(p.clues.filter(c=>c.a===who).length,who===p.victim?0:1,`${p.theme}: ${p.people[who].name}`);
  assert.ok(p.clues.every(c=>c.a!==p.victim&&c.b!==p.victim&&!c.text.includes(p.people[p.victim].name)),p.theme);
 }
});
test('night dossiers use one chair type, name and clue category',()=>{
 for(const p of night){
  assert.ok(p.objects.some(o=>o.type==='chair'));
  assert.ok(p.objects.filter(o=>/stoel/.test(o.name)).every(o=>o.type==='chair'&&o.name==='een stoel'&&o.occupiable===true));
  assert.ok(p.objects.every(o=>o.type!=='seat'));
  assert.ok(p.clues.filter(c=>c.types?.includes('chair')).every(c=>c.types.length===1));
  assert.ok(p.clues.every(c=>!/klapstoel|theaterstoel|bioscoopstoel/.test(c.text)));
 }
});
test('all night dossiers use on-furniture, exclusive-furniture and exact-count deductions',()=>{
 for(const p of night){assert.ok(p.clues.some(c=>c.type==='onObject'));assert.ok(p.clues.some(c=>c.type==='onlyOnObject'));assert.ok(p.clues.some(c=>c.type==='objectCount'));assert.ok(p.clues.every(c=>c.a!==p.victim));const s=solve(p);assert.equal(s.length,1);assert.ok(Object.values(s[0]).some(c=>p.objects.some(o=>o.cell===c&&o.occupiable)));}
 assert.ok(night.some(p=>solve({...p,clues:p.clues.filter(c=>c.type!=='objectCount')}).length>1),'count clues affect the solution');
});
test('the student bedroom has one bed spanning two adjacent playable cells',()=>{
 const p=night.at(-1),bed=p.objects.filter(o=>o.type==='bed');assert.equal(bed.length,2);assert.equal(bed[1].cell,bed[0].cell+1);assert.equal(Math.floor(bed[1].cell/p.size),Math.floor(bed[0].cell/p.size));assert.equal(bed[0].furnitureId,bed[1].furnitureId);assert.equal(furnitureCells(p,['bed']).length,2);
});


test('large items have complete, non-overlapping footprints in one room',()=>{
 for(const p of night){
  assert.equal(new Set(p.objects.map(o=>o.cell)).size,p.objects.length);
  const groups=new Map();for(const o of p.objects.filter(o=>o.tile)){if(!groups.has(o.furnitureId))groups.set(o.furnitureId,[]);groups.get(o.furnitureId).push(o);}
  assert.ok(groups.size>0);
  for(const parts of groups.values()){
   const {width,height}=parts[0].tile;assert.equal(parts.length,width*height);assert.equal(new Set(parts.map(o=>p.regions[o.cell])).size,1);
   const origin=parts.find(o=>o.tile.x===0&&o.tile.y===0).cell;
   for(const o of parts)assert.equal(o.cell,origin+o.tile.y*p.size+o.tile.x);
  }
 }
 assert.ok(night.some(p=>p.objects.some(o=>o.type==='rug'&&o.tile?.width===2&&o.tile?.height===2)));
 assert.ok(night.some(p=>p.objects.some(o=>o.type==='sofa'&&o.tile?.width===2)));
 assert.ok(night.some(p=>p.objects.filter(o=>o.type==='table').length===4));
});

test('being on part of an item is not being beside that same item',()=>{
 const p={size:4,regions:Array(16).fill(0),objects:[{cell:5,type:'sofa',occupiable:true,furnitureId:'sofa1'},{cell:6,type:'sofa',occupiable:true,furnitureId:'sofa1'}]};
 const adjacent=adjacentCells(p,['sofa']);assert.equal(adjacent.includes(5),false);assert.equal(adjacent.includes(6),false);assert.ok([1,2,4,7,9,10].every(c=>adjacent.includes(c)));
});

test('counts count people, not the number of occupied furniture tiles',()=>{
 const p={size:4,regions:Array(16).fill(0),people:[{},{},{},{}],objects:[5,6,9,10].map(cell=>({cell,type:'rug',occupiable:true,furnitureId:'rug1'}))};
 const clue={type:'objectCount',types:['rug'],count:2};assert.equal(matches(p,{0:5,1:10,2:0,3:15},clue,true),true);assert.equal(matches(p,{0:5,1:0,2:3,3:15},clue,true),false);
});
