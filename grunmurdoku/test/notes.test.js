import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmPlacement,restorePencilNotes,sanitizeBackups} from '../notes.js';
const puzzle={size:4,people:[{},{},{},{}],objects:[],givens:{}};
const fresh=()=>({positions:{},notes:{0:[0,1],5:[0,2],10:[3]},noteBackups:{},crosses:[],checked:[],solved:false});
const sorted=notes=>Object.fromEntries(Object.entries(notes).map(([c,ids])=>[c,[...ids].sort()]));
test('third click restores all suppressed pencil marks, including other possible cells',()=>{
 const state=fresh(),original=structuredClone(state.notes);
 confirmPlacement(state,0,0);
 assert.deepEqual(state.notes,{5:[2],10:[3]});assert.equal(state.positions[0],0);
 restorePencilNotes(state,puzzle,0);
 assert.deepEqual(sorted(state.notes),sorted(original));assert.deepEqual(state.positions,{});
});
test('restoration survives saved state and keeps later unrelated work',()=>{
 let state=fresh();confirmPlacement(state,0,0);
 state=JSON.parse(JSON.stringify(state));state.noteBackups=sanitizeBackups(puzzle,state.noteBackups);
 state.notes[7]=[2,3];state.notes[5].push(1);state.checked.push(2);
 restorePencilNotes(state,puzzle,0);
 assert.deepEqual(sorted(state.notes),{0:[0,1],5:[0,1,2],7:[2,3],10:[3]});assert.deepEqual(state.checked,[2]);
});
test('restoration respects current placements and crossed-out cells',()=>{
 const state=fresh();confirmPlacement(state,0,0);state.positions[1]=15;state.crosses=[5];
 restorePencilNotes(state,puzzle,0);assert.deepEqual(state.notes[0],[0]);assert.deepEqual(state.positions,{1:15});assert.deepEqual(state.notes[5],[2]);
});
test('undo restores both a definitive position and its saved pencil marks',()=>{
 const state=fresh();confirmPlacement(state,0,0);const snapshot=JSON.stringify(state);
 restorePencilNotes(state,puzzle,0);const undone=JSON.parse(snapshot);
 assert.equal(undone.positions[0],0);restorePencilNotes(undone,puzzle,0);assert.deepEqual(sorted(undone.notes),sorted(fresh().notes));
});
test('old saves without a note backup fall back to the person initial',()=>{
 const state={positions:{0:0},notes:{5:[2]},crosses:[],solved:false};restorePencilNotes(state,puzzle,0);assert.deepEqual(state.notes,{0:[0],5:[2]});
});
