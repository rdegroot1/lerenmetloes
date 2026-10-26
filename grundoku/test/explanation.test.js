import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {explain} from '../explain.js';
import {valid,solve} from '../engine.js';
const current=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
const archive=JSON.parse(readFileSync(new URL('../puzzles-archive.json',import.meta.url)));
for(const p of [...current,...archive])test(`${p.id}: explanation reaches the unique solution`,()=>{
 const explanation=explain(p);
 assert.ok(valid(p,explanation.positions,true));
 assert.deepEqual(explanation.positions,solve(p)[0]);
 assert.equal(explanation.steps.filter(s=>s.startsWith('Dus ')).length,0);
 assert.ok(explanation.steps.at(-1).endsWith(`Dus ${p.people[explanation.killer].name} is de dader.`));
 assert.ok(explanation.steps.length>=p.people.length+1);
});
