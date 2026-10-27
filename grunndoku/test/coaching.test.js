import test from 'node:test';
import assert from 'node:assert/strict';
import {boardKey,coachingState,recordHint,markProgress,offerHelp,postponeHelp,caseScore,recommendCase,helpSummary} from '../coaching.js';
test('hint depth persists without double counting reopened or less specific steps',()=>{
 const key=boardKey({2:40,0:3});assert.equal(key,boardKey({0:3,2:40}));
 let s=recordHint(null,key,0);s=recordHint(s,key,2);s=recordHint(s,key,0);
 assert.deepEqual(s.hintViews,[1,1,1]);assert.equal(s.boards[0].level,2);
 s=recordHint(s,'changed board',0);assert.deepEqual(s.hintViews,[2,1,1]);
 assert.deepEqual(coachingState({hintViews:'bad',boards:null}).hintViews,[]);
});
test('help is offered after active time with no placement, dismissible, not when solved',()=>{
 let s=markProgress({},10000);assert.equal(offerHelp(s,189999),false);assert.equal(offerHelp(s,190000),true);
 s=postponeHelp(s,190000);assert.equal(offerHelp(s,489999),false);assert.equal(offerHelp(s,490000),true);assert.equal(offerHelp(s,490000,true),false);
 s=markProgress(s,480000);assert.equal(offerHelp(s,659999),false);
});
test('celebration points depend only on case difficulty, not time or hints',()=>{
 assert.deepEqual(caseScore({difficultyStars:1}),{base:100,bonus:0,total:100});
 for(let stars=1;stars<=6;stars++)assert.equal(caseScore({difficultyStars:stars,playTimeMs:9999999,hintsUsed:99}).total,100+20*(stars-1));
 assert.match(helpSummary({coaching:{hintViews:[2,1,1,1]}}),/2 stappen/);
 assert.match(helpSummary({hintsUsed:3}),/hulp gebruikt/);
});
test('recommendations wait for evidence and remain optional within the current theme',()=>{
 const cases=Array.from({length:8},(_,i)=>({id:String(i),seriesId:'x',difficultyStars:i<6?3:i===6?4:6,people:Array(8)}));
 const saves=new Map(cases.slice(0,3).map((p,i)=>[p.id,{solved:true,solvedAt:i+1,playTimeMs:80000,coaching:{version:1,observed:true,hintViews:[0]}}]));
 const read=p=>saves.get(p.id),solved=(p,s)=>!!s?.solved;
 assert.equal(recommendCase(cases,cases[0],()=>null,solved),null);
 assert.equal(recommendCase(cases,cases[2],read,solved).puzzle.id,'6');
 for(const s of saves.values())s.coaching.hintViews=[8,8,8,8];
 assert.equal(recommendCase(cases,cases[2],read,solved).puzzle.difficultyStars,3);
 // Time cannot affect a suggestion with only three measurements.
 for(const s of saves.values()){s.coaching.hintViews=[0];s.playTimeMs=9999999;}
 assert.equal(recommendCase(cases,cases[2],read,solved).puzzle.difficultyStars,4);
 // With six comparable measurements, a slower recent pace suggests familiar difficulty.
 for(let i=0;i<6;i++)saves.set(String(i),{solved:true,solvedAt:i+1,playTimeMs:i<3?80000:240000,coaching:{version:1,observed:true,hintViews:[]}});
 const more=[...cases,{id:'8',seriesId:'x',difficultyStars:3,people:Array(8)}];
 assert.equal(recommendCase(more,cases[5],read,solved).puzzle.id,'8');
 for(const s of saves.values())s.playTimePartial=true;
 assert.equal(recommendCase(more,cases[5],read,solved).puzzle.id,'6');
});
