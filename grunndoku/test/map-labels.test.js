import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {areaLabels,boardMarkup,printSheet} from '../view.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
test('district nameplates stay inside their own connected district on screen and paper',()=>{
 for(const p of puzzles){
  const labels=areaLabels(p);assert.equal(labels.length,p.areas.length);
  for(const l of labels){assert.ok(l.length>0);assert.ok(l.cells.every(c=>p.regions[c]===l.area));
   if(l.vertical){assert.ok(l.row+l.length<=(p.height||p.size));assert.ok(l.cells.every(c=>c%p.size===l.col&&(l.col===0||p.regions[c-1]!==l.area)));}
   else{assert.ok(l.col+l.length<=p.size);assert.ok(l.length<=Math.ceil(l.name.length/(['martini','winter'].includes(p.seriesId)?5:8)));assert.ok(l.cells.every(c=>l.row===(p.height||p.size)-1||p.regions[c+p.size]!==l.area));}
  }
  assert.equal((boardMarkup(p).match(/class="area-name /g)||[]).length,p.areas.length);
  assert.equal((printSheet(p).match(/class="area-name /g)||[]).length,p.areas.length);
  assert.equal((boardMarkup(p,{},[],true).match(/class="area-name /g)||[]).length,0);
 }
});
