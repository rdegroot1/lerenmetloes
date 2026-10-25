import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,valid,region} from '../engine.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
for(const p of puzzles){
 test(`${p.id}: exactly one full solution and one murderer`,()=>{
 const solutions=solve(p);assert.equal(solutions.length,1);const [s]=solutions;
 assert.equal(Object.keys(s).length,p.size);assert.ok(valid(p,s,true));
 assert.equal(Object.keys(s).filter(i=>+i!==p.victim&&region(p,s[i])===region(p,s[p.victim])).length,1);
 assert.equal(new Set(Object.values(s).map(c=>c%p.size)).size,p.size);
 assert.equal(new Set(Object.values(s).map(c=>Math.floor(c/p.size))).size,p.size);
 for(const o of p.objects)assert.ok(!Object.values(s).includes(o.cell));
 for(const [who,cell]of Object.entries(s))assert.equal(solve(p,{[who]:cell}).length,1);
 });
 test(`${p.id}: contradictory moves and blocked cells are rejected`,()=>{
 const s=solve(p)[0];assert.deepEqual(solve(p,{0:p.objects[0].cell}),[]);
 const first=s[0];assert.equal(valid(p,{0:first,1:Math.floor(first/p.size)*p.size+(first+1)%p.size}),false);
 });
}

test('introductory case can be completed with immediate forced moves',()=>{
 const p=puzzles[0];assert.equal(p.size,4);assert.equal(Object.keys(p.givens).length,2);
 const positions={...p.givens};
 while(Object.keys(positions).length<p.people.length){
  const options=p.people.map((_,i)=>positions[i]!=null?[]:Array.from({length:p.size**2},(_,c)=>c).filter(c=>valid(p,{...positions,[i]:c})));
  const who=options.findIndex(cells=>cells.length===1);assert.ok(who>=0,'no guessing needed in first case');positions[who]=options[who][0];
 }
 assert.ok(valid(p,positions,true));
});

test('progression grows from 4x4 to 6x6 and preserves fixed starting places',()=>{
 assert.deepEqual(puzzles.map(p=>p.size),[4,4,5,5,6,6]);
 assert.ok(puzzles.slice(0,2).every(p=>p.clues.every(c=>c.type==='unary')));
 assert.ok(puzzles.slice(2).every(p=>p.clues.some(c=>c.type!=='unary')));
 const p=puzzles[0];const cell=p.givens[0];assert.equal(valid(p,{0:(cell+1)%(p.size*p.size)}),false);
});
