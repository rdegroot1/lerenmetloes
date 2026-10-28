import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {solve,valid,region} from '../engine.js';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url))).filter(p=>!p.seriesId||['stad','nacht'].includes(p.seriesId));
for(const p of puzzles){
 test(`${p.id}: exactly one full solution and one murderer`,()=>{
 const solutions=solve(p);assert.equal(solutions.length,1);const [s]=solutions;
 assert.equal(Object.keys(s).length,p.size);assert.ok(valid(p,s,true));
 assert.equal(Object.keys(s).filter(i=>+i!==p.victim&&region(p,s[i])===region(p,s[p.victim])).length,1);
 assert.equal(new Set(Object.values(s).map(c=>c%p.size)).size,p.size);
 assert.equal(new Set(Object.values(s).map(c=>Math.floor(c/p.size))).size,p.size);
 for(const o of p.objects.filter(o=>o.occupiable!==true))assert.ok(!Object.values(s).includes(o.cell));
 for(const [who,cell]of Object.entries(s))assert.equal(solve(p,{[who]:cell}).length,1);
 });
 test(`${p.id}: contradictory moves and blocked cells are rejected`,()=>{
 const s=solve(p)[0];assert.deepEqual(solve(p,{0:p.objects[0].cell}),[]);
 const first=s[0];assert.equal(valid(p,{0:first,1:Math.floor(first/p.size)*p.size+(first+1)%p.size}),false);
 });
}

test('introductory case can be completed with immediate forced moves',()=>{
 const p=puzzles[0];assert.equal(p.size,4);assert.equal(Object.keys(p.givens).length,0);
 const positions={...p.givens};
 while(Object.keys(positions).length<p.people.length){
  const options=p.people.map((_,i)=>positions[i]!=null?[]:Array.from({length:p.size**2},(_,c)=>c).filter(c=>valid(p,{...positions,[i]:c})));
  const who=options.findIndex(cells=>cells.length===1);assert.ok(who>=0,'no guessing needed in first case');positions[who]=options[who][0];
 }
 assert.ok(valid(p,positions,true));
});

test('progression grows from 4x4 to 6x6 without fixed starting places',()=>{
 assert.deepEqual(puzzles.slice(0,6).map(p=>p.size),[4,4,5,5,6,6]);
 assert.ok(puzzles.slice(0,2).every(p=>p.clues.every(c=>['unary','onObject','onlyOnObject'].includes(c.type))));
 assert.ok(puzzles.slice(2).every(p=>p.clues.some(c=>c.type!=='unary')));
 assert.ok(puzzles.every(p=>Object.keys(p.givens).length===0));
});

test('freeform districts are connected and extend beyond rectangles',()=>{
 for(const p of puzzles.slice(1)){
  let nonRectangular=0;
  for(let area=0;area<p.areas.length;area++){
   const cells=p.regions.map((a,c)=>a===area?c:-1).filter(c=>c>=0);
   assert.ok(cells.length>0);
   const seen=new Set([cells[0]]),queue=[cells[0]];
   while(queue.length){const c=queue.pop(),r=Math.floor(c/p.size),col=c%p.size;
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
     const nr=r+dr,nc=col+dc,next=nr*p.size+nc;
     if(nr>=0&&nr<p.size&&nc>=0&&nc<p.size&&p.regions[next]===area&&!seen.has(next)){seen.add(next);queue.push(next);}
    }
   }
   assert.equal(seen.size,cells.length,`${p.id} district ${area} must be connected`);
   const rows=cells.map(c=>Math.floor(c/p.size)),cols=cells.map(c=>c%p.size);
   if((Math.max(...rows)-Math.min(...rows)+1)*(Math.max(...cols)-Math.min(...cols)+1)!==cells.length)nonRectangular++;
  }
  assert.ok(nonRectangular>=2,`${p.id} needs multiple freeform districts`);
 }
});

test('current clues never refer to the victim',()=>{
 for(const p of puzzles)assert.ok(p.clues.every(c=>c.a!==p.victim&&c.b!==p.victim&&!c.text.includes(p.people[p.victim].name)));
});

test('names have distinct initials for concept notes',()=>{
 assert.deepEqual(puzzles[16].people.filter((_,i)=>i!==puzzles[16].victim).map(p=>p.name[0]),['A','B','C','D','E']);assert.equal(puzzles[16].people[puzzles[16].victim].name,'Tammo');
 for(const p of puzzles)assert.equal(new Set(p.people.map(person=>person.name[0])).size,p.people.length);
});


test('victim cards preserve the current and archived rule formats',()=>{
 const archive=JSON.parse(readFileSync(new URL('../puzzles-archive.json',import.meta.url)));
 for(const p of [...puzzles,...archive]){if(p.victimLocationClue===false)assert.ok(p.clues.every(c=>c.a!==p.victim),p.id);else assert.ok(p.clues.some(c=>c.a===p.victim&&c.type==='unary'),p.id);}
});

test('all current witnesses have one clue or a fixed starting place and share the upgraded art',()=>{
 for(const p of puzzles){
  assert.equal(p.portraitStyle,'mugshot');assert.ok(p.victimWeapon);assert.equal(p.victimLocationClue,false);
  for(let who=0;who<p.people.length;who++)assert.equal(p.clues.filter(c=>c.a===who).length,who===p.victim||Object.hasOwn(p.givens,who)?0:1,`${p.id}: ${who}`);
  assert.ok(p.objects.filter(o=>/stoel/.test(o.name)).every(o=>o.type==='chair'&&o.name==='een stoel'&&o.occupiable));
  assert.ok(Number.isInteger(p.difficultyStars)&&p.difficultyStars>=1&&p.difficultyStars<=5);
 }
 assert.deepEqual(puzzles.slice(0,6).map(p=>p.difficultyStars),[1,2,2,3,4,5]);
});

test('new themed cases have distinct settings and varied victim rows',()=>{
 const themed=puzzles.slice(6);assert.equal(themed.length,15);
 for(const theme of ['Hoornseplas','Stadspark','Noorderplantsoen','Uitgaan in Stad'])assert.ok(themed.some(p=>p.theme===theme));
 assert.ok(themed.some(p=>p.areas.includes('De Negende Cirkel')&&p.areas.includes('Het Pakhuis')));
 assert.ok(new Set(themed.map(p=>Math.floor(solve(p)[0][p.victim]/p.size))).size>1);
});


test('all five festival and village themes are present and include indoor spaces',()=>{
 for(const theme of ['Het aardbevingsdorp','Bommen Berend','Eurosonic','Noorderzon','WinterWelVaart'])assert.ok(puzzles.some(p=>p.theme===theme),theme);
 assert.ok(puzzles.slice(12).some(p=>p.areas.length===5));
});


test('new dossier series has mugshots, genuine cut-out outlines and no victim location clues',()=>{
 const series=puzzles.filter(p=>p.seriesId==='nacht');assert.equal(series.length,4);
 assert.deepEqual(series.map(p=>p.theme),['Stadsschouwburg','Suikerunieterrein','Het Forum','Studentenhuis Korreweg']);
 for(const p of series){assert.equal(p.portraitStyle,'mugshot');assert.ok(p.regions.some(a=>a<0));assert.ok(p.clues.every(c=>c.a!==p.victim));const voids=p.regions.map((a,c)=>a<0?c:-1).filter(c=>c>=0);for(const c of voids)assert.equal(valid(p,{0:c}),false);}
});
