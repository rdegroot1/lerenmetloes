import test from 'node:test';import assert from 'node:assert/strict';import {THEMES,tutorialFor} from '../themes.js';import {solve,valid} from '../engine.js';
for(const series of [...Object.keys(THEMES),'tower'])test(`${series}: separate demonstration has one solution and never affects a real case`,()=>{
 const p=tutorialFor({series:series==='tower'?'martini':series,tower:series==='tower'});assert.equal(solve(p).length,1);assert.deepEqual(solve(p)[0],{0:0,1:6,2:9,3:15});assert.ok(valid(p,{...p.givens,2:9}));assert.equal(p.clues.length,1);assert.equal(p.clues[0].a,2);assert.ok(p.objects.some(o=>o.cell===9&&o.occupiable));assert.ok(p.clues.every(c=>c.a!==p.victim));assert.deepEqual(tutorialFor({series}).givens,{0:0,1:6});
});
