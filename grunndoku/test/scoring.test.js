import test from 'node:test';import assert from 'node:assert/strict';
import {scoreFor,earnedScore} from '../scoring.js';import {recordHint,coachingState} from '../coaching.js';
const p={difficultyStars:3,people:Array(4)},fresh=()=>({scoreVersion:2,coaching:coachingState()});
test('solving earns a guaranteed 600, full independent bonus and separate level points',()=>{
 const s=scoreFor(p,fresh());assert.equal(s.base,600);assert.equal(s.bonus,400);assert.equal(s.total,1000);assert.equal(s.levelBonus,100);assert.equal(s.dossierTotal,1100);
});
test('progressive hints affect only the equal share for the helped person',()=>{
 const state=fresh();state.coaching=recordHint(state.coaching,'board',0,0);assert.equal(scoreFor(p,state).total,1000);
 state.coaching=recordHint(state.coaching,'board',1,0);assert.equal(scoreFor(p,state).total,985);
 state.coaching=recordHint(state.coaching,'board',2,0);assert.equal(scoreFor(p,state).total,955);
 state.coaching=recordHint(state.coaching,'board',3,0);assert.equal(scoreFor(p,state).total,900);
 // Same person on another board or reopened after reload must not count twice.
 state.coaching=recordHint(coachingState(JSON.parse(JSON.stringify(state.coaching))),'other board',3,0);assert.equal(scoreFor(p,state).total,900);
 for(let who=1;who<4;who++)state.coaching=recordHint(state.coaching,'board '+who,3,who);
 assert.equal(scoreFor(p,state).total,600);
});
test('time, errors, conflict tips and repeated general tips do not reduce the bonus',()=>{
 const state={...fresh(),playTimeMs:99999999,errors:999};state.coaching=recordHint(state.coaching,'conflict',0);
 assert.equal(scoreFor(p,state).total,1000);
});
test('old completions keep legacy points without inventing a hint history',()=>{
 assert.equal(scoreFor(p,{solved:true,hintsUsed:20}).total,140);
 assert.equal(earnedScore(p,{achievement:{positions:{}}}),140);
 const score=scoreFor(p,fresh());assert.equal(earnedScore(p,{achievement:{score}}),1100);
});
