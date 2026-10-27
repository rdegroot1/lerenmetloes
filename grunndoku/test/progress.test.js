import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve} from '../engine.js';
import {caseProgress,progressSummary,resumeCase,milestoneText} from '../progress.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))),p=puzzles[0],solution=solve(p)[0];
test('old saves contribute progress without a new namespace or timer fields',()=>{
 assert.deepEqual(caseProgress(p,null),{started:false,solved:false,placed:0,updatedAt:0});
 assert.equal(caseProgress(p,{positions:solution,solved:true}).solved,true);
 assert.equal(caseProgress(p,{positions:{},notes:{2:[0]}}).started,true);
 assert.equal(caseProgress(p,{positions:{},notes:{2:[]}}).started,false);
 assert.equal(caseProgress(p,{positions:{...p.givens}}).started,false);
});
test('a forged solved flag or conflicting board never counts as completion',()=>{
 assert.equal(caseProgress(p,{positions:{},solved:true}).solved,false);
 const invalid={...solution,0:solution[1]};
 assert.equal(caseProgress(p,{positions:invalid,solved:true}).solved,false);
});
test('resume preserves the chosen unfinished case, otherwise chooses the most recent',()=>{
 const summary={cases:[{id:'a',index:0,started:true,solved:false,updatedAt:1},{id:'b',index:1,started:true,solved:false,updatedAt:2},{id:'c',index:2,started:true,solved:true,updatedAt:3}]};
 assert.equal(resumeCase(summary,'a').id,'a');
 assert.equal(resumeCase(summary,'c').id,'b');
 assert.equal(resumeCase({cases:summary.cases.filter(c=>c.solved)},'c'),null);
 assert.deepEqual(summary.cases.map(c=>c.id),['a','b','c']);
});
test('dossier counts each case once and recognises a finished theme',()=>{
 const summary=progressSummary(puzzles,q=>q.id===p.id?{positions:solution,solved:true}:null);
 assert.equal(summary.solved,1);assert.equal(summary.total,puzzles.length);
 assert.match(milestoneText(summary,p.seriesId||'stad'),/eerste zaak/);
 const complete={solved:2,cases:[{series:'x',solved:true},{series:'x',solved:true}]};
 assert.match(milestoneText(complete,'x'),/Thema afgerond/);
});
