import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {applyCast} from '../cast.mjs';import {personEntries} from '../person-order.js';import {portraitMarkup} from '../view.js';
const puzzles=['puzzles.json','puzzles-archive.json'].flatMap(f=>JSON.parse(readFileSync(new URL('../'+f,import.meta.url))));
test('all dossiers have consecutive initials, one Tammo last and stable presentation indices',()=>{
 const aNames=new Set();
 for(const p of puzzles){const entries=personEntries(p),suspects=entries.slice(0,-1);assert.equal(entries.at(-1).i,p.victim);assert.equal(entries.at(-1).person.name,'Tammo');assert.deepEqual(suspects.map(e=>e.person.name[0]),'ABCDEFGHIJKLMNO'.slice(0,suspects.length).split(''));assert.equal(new Set(entries.map(e=>e.person.name[0])).size,p.people.length);assert.ok(p.people.every(person=>['male','female'].includes(person.gender)));aNames.add(entries[0].person.name);const before=JSON.stringify(p);applyCast(p);assert.equal(JSON.stringify(p),before);}
 assert.ok(aNames.size>=5);assert.deepEqual(personEntries(puzzles[0]).map(e=>e.person.name),['Arend','Bertus','Cora','Tammo']);
});
test('renaming swapped witness Tammo and victim Fokko is simultaneous, with index and clue identity intact',()=>{
 const p={id:'fixture',people:['Arend','Bertus','Cora','Tammo','Geeske','Fokko','Harm'].map(name=>({name})),victim:5,story:'Fokko kwam Tammo tegen. Harm was er ook.',clues:[{a:0,b:3,text:'Was niet bij Tammo.'},{a:6,b:5,text:'Stond boven Fokko.'}],givens:{0:12}};
 applyCast(p);assert.equal(p.people[5].name,'Tammo');assert.equal(p.clues[0].b,3);assert.equal(p.clues[0].text,`Was niet bij ${p.people[3].name}.`);assert.equal(p.clues[1].text,'Stond boven Tammo.');assert.deepEqual(p.givens,{0:12});assert.ok(p.story.startsWith('Tammo kwam '+p.people[3].name));
});
test('mugshot display numbers follow alphabetical cards without moving the saved person index',()=>{
 const p=puzzles.find(p=>p.people.length===16),e=personEntries(p)[5];assert.equal(e.person.name[0],'F');assert.notEqual(e.i,5);assert.match(portraitMarkup(e.i,e.person.name,p),/DOSSIER .* \/ 6<\/text>/);assert.equal(p.people[p.victim].gender,'male');
});
