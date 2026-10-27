import test from 'node:test';
import assert from 'node:assert/strict';
import {victimHint,completionMessage,elapsedTime,CELEBRATIONS,celebrationMessage,nextCelebration} from '../detective-voice.js';

test('Fokko introduces public reasoning without changing or supplementing the deduction',()=>{
 const p={people:[{name:'Arend'},{name:'Fokko'}],victim:1};
 const deduction='Arend kan alleen in de vierde rij staan.';
 for(let step=0;step<3;step++)assert.ok(victimHint(p,deduction,step).endsWith(deduction));
 assert.match(victimHint(p,deduction),/Fokko hier/);
});
test('completion time reads naturally at second and minute boundaries',()=>{
 assert.match(completionMessage(180000,true),/Gemeten speeltijd sinds de update: 3 minuten/);
 assert.match(completionMessage(1000),/Jouw speeltijd: 1 seconde/);
 assert.match(completionMessage(60000),/Jouw speeltijd: 1 minuut/);
 assert.match(completionMessage(180000),/Jouw speeltijd: 3 minuten\./);
 assert.match(completionMessage(121000),/2 minuten en 1 seconde/);
});
test('active time survives old saves and ignores invalid deltas',()=>{
 assert.equal(elapsedTime(undefined,1200),1200);
 assert.equal(elapsedTime(5000,1200),6200);
 assert.equal(elapsedTime(5000,-20),5000);
 assert.equal(elapsedTime(NaN,Infinity),0);
});

test('celebrations are varied and never judge speed or hint use',()=>{
 assert.ok(CELEBRATIONS.length>=20);
 assert.equal(new Set(CELEBRATIONS).size,CELEBRATIONS.length);
 for(let previous=0;previous<CELEBRATIONS.length;previous++)for(const random of [0,.2,.5,.9,.999999,1]){
  const next=nextCelebration(previous,random);
  assert.notEqual(next,previous);assert.ok(next>=0&&next<CELEBRATIONS.length);
  assert.equal(celebrationMessage(next),CELEBRATIONS[next]);
 }
 for(const text of CELEBRATIONS)assert.doesNotMatch(text,/te langzaam|zonder hints|sneller dan|beter dan|helaas|tijdslimiet/i);
});
