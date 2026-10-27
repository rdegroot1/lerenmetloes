import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {reasoningHint} from '../hints.js';import {solve,valid} from '../engine.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
for(const p of puzzles)test(`${p.id}: hints reason from the current board, never place or accuse`,()=>{
 const solution=solve(p)[0],positions={...p.givens},beforePuzzle=JSON.stringify(p);
 while(Object.keys(positions).length<p.people.length){const before=JSON.stringify(positions),h=reasoningHint(p,positions);assert.equal(h.kind,'placement');assert.equal(h.steps.length,4);assert.equal(positions[h.who],undefined);assert.equal(h.cell,solution[h.who]);assert.equal(JSON.stringify(positions),before);assert.ok(h.steps.every(t=>!t.includes('is de dader')));positions[h.who]=h.cell;assert.ok(valid(p,positions));}
 assert.equal(reasoningHint(p,positions).kind,'complete');assert.equal(JSON.stringify(p),beforePuzzle);
});
test('a conflicting board gets an explanation request rather than a proposed placement',()=>{const p=puzzles[0],cell=solve(p)[0][1],h=reasoningHint(p,{0:cell,1:cell});assert.equal(h.kind,'conflict');assert.equal(h.who,undefined);assert.equal(h.steps.length,1);});
