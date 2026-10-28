import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GENERAL_CLUES,applyGeneralClues,assertGeneralCluePolicy,generalClueText} from '../general-clues.mjs';
import {canStand,cellCount,rowOf,columnOf,matches,solve} from '../engine.js';
import {explain} from '../explain.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));

test('publication guard rejects offsets and exact coordinates while allowing a single axis',()=>{
 for(const text of ['Stond precies 3 vakjes links van de preekstoel.','Stond 3 plaatsen naast een tafel.','Bevond zich in rij 4, kolom 3.'])assert.throws(()=>assertGeneralCluePolicy({id:'test',clues:[{text}]}),/Exact location clue/);
 for(const text of ['Bevond zich in rij 4.','Stond in kolom 3, hoger op de kaart dan Arend.','Was in een ander gebied dan Greta.'])assert.doesNotThrow(()=>assertGeneralCluePolicy({id:'test',clues:[{text}]}));
});

test('current clues have no counted offsets or explicit row-and-column coordinates',()=>{
 for(const p of puzzles)for(const c of p.clues){
  assert.doesNotMatch(c.text,/\b\d+\s+(?:vakjes|vakken|plaatsen)\s+(?:boven|onder|naast|links|rechts)/i,p.id);
  assert.ok(!(/\brij\s+\d+/i.test(c.text)&&/\bkolom\s+\d+/i.test(c.text)),p.id);
 }
});

test('all 34 replacements express one axis, leave multiple places and match the public map',()=>{
 let count=0;
 for(const p of puzzles)for(const spec of GENERAL_CLUES[p.id]||[]){
  count++;
  const clue=p.clues.find(c=>c.a===spec.a);
  assert.equal(clue.text,generalClueText(p,spec));if(spec.b!=null)assert.ok(clue.text.endsWith(p.people[spec.b].name+'.'));assert.notEqual(clue.a,p.victim);assert.notEqual(clue.b,p.victim);
  const mask=Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>canStand(p,c)&&(spec.axis==='row'?rowOf(p,c):columnOf(p,c))===spec.number-1&&(spec.area==null||p.areas[p.regions[c]]===spec.area)&&(!spec.floor||!p.objects.some(o=>o.cell===c)));
  assert.deepEqual(clue.cells,mask);assert.ok(mask.length>1,p.id+': '+clue.text);
  if(clue.b!=null){
   const s=solve(p)[0];assert.ok(matches(p,s,clue,true));
   const a=s[clue.a],b=s[clue.b];assert.equal(matches(p,{[clue.a]:a,[clue.b]:a},clue),false,'direction still restricts the row/column after the mask');
   assert.ok(b!=null);
  }
 }
 assert.equal(count,34);
});

for(const p of puzzles.filter(p=>GENERAL_CLUES[p.id]))test(`${p.id}: broader clues are deductive and do not change on a second upgrade`,()=>{
 const copy=structuredClone(p);applyGeneralClues(copy);assert.deepEqual(copy,p);
 const e=explain(p);assert.deepEqual(e.positions,solve(p)[0]);
 assert.ok(e.deductions.every(d=>!d.searched),'a full chain of deductions without trial combinations');
});
