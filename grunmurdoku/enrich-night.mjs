import {solve,valid,isPlayable,adjacentCells} from './engine.js';

// Enrich the existing night dossiers around their original unique placements.
// No global random state is consumed: the first series and old placements stay stable.
export function enrichNight(p,index){
 const solutions=solve(p);if(solutions.length!==1)throw Error('Base dossier not unique');
 const target=solutions[0];
 p.objects=p.objects.map(o=>({...o,...(['seat','bench','sofa'].includes(o.type)?{occupiable:true}:{}),...(o.type==='seat'?{type:'chair',name:'een stoel'}:{})}));
 const occupied=()=>new Set(p.objects.map(o=>o.cell));
 const free=()=>Array.from({length:p.size**2},(_,c)=>c).filter(c=>isPlayable(p,c)&&!occupied().has(c)&&!Object.values(target).includes(c));
 const add=(cell,type,name,extra={})=>{if(occupied().has(cell))throw Error('Overlapping objects');p.objects.push({cell,type,name,occupiable:true,...extra});};
 const footprint=(cells,width,height,type,name,id,occupiable=true)=>{
  if(cells.length!==width*height||!cells.every(c=>isPlayable(p,c)&&p.regions[c]===p.regions[cells[0]]))throw Error('Invalid footprint');
  cells.forEach((cell,part)=>add(cell,type,name,{occupiable,furnitureId:id,part,tile:{x:part%width,y:Math.floor(part/width),width,height}}));
 };
 let bedPerson;
 if(index===3){
  bedPerson=0;footprint([31,32],2,1,'bed','een bed','student-bed');
  const sofa=p.objects.find(o=>o.type==='sofa');
  if(sofa){const left=sofa.cell-1;if(Math.floor(left/p.size)===Math.floor(sofa.cell/p.size)&&p.regions[left]===p.regions[sofa.cell]&&free().includes(left)){
   sofa.furnitureId='balcony-sofa';sofa.part=1;sofa.tile={x:1,y:0,width:2,height:1};
   add(left,'sofa','de bank',{furnitureId:'balcony-sofa',part:0,tile:{x:0,y:0,width:2,height:1}});
  }}
  footprint([1,2,7,8],2,2,'table','de grote tafel','kitchen-table',false);
 }
 if(index===0)footprint([23,29],1,2,'table','de grote tafel','foyer-table',false);
 if(index===1)footprint([2,3,8,9],2,2,'table','de grote tafel','factory-table',false);
 const chairPeople=index%2===0?[0,p.victim]:index===3?[1,4]:[1,2];
 const rugPerson=index===0?4:index===1?3:2;
 const rugs=[[25,26,31,32],[25,26],[26,27,32,33],[26,27]];
 const rugWidth=[2,2,2,2][index],rugHeight=index%2===0?2:1;
 for(const who of chairPeople)add(target[who],'chair','een stoel');
 footprint(rugs[index],rugWidth,rugHeight,'rug','een vloerkleed',`main-rug-${index}`);
 for(const type of ['chair','rug','chair','rug']){
  const available=free();if(!available.length)break;
  const cell=available[(index*5+p.objects.length*3)%available.length];
  add(cell,type,type==='chair'?'een stoel':'een vloerkleed');
 }
 const required=[
  {type:'onObject',a:chairPeople[0],types:['chair'],text:'Zat op een stoel.'},
  {type:'onlyOnObject',a:rugPerson,types:['rug'],text:'Was de enige persoon op een vloerkleed.'},
  {type:'objectCount',types:['chair'],count:2,text:'Precies twee personen zaten op een stoel.'}
 ];
 if(bedPerson!=null)required.push({type:'onObject',a:bedPerson,types:['bed'],text:'Lag op het bed.'});
 // One standalone clue for every witness. Relations only name witnesses;
 // the victim's location follows from the completed rows and columns.
 const all=Array.from({length:p.size**2},(_,c)=>c).filter(c=>isPlayable(p,c));
 const unary=(a,text,predicate)=>({type:'unary',a,text,cells:all.filter(predicate)});
 const relation=(type,a,b,text)=>({type,a,b,text});
 const besideGuitar=adjacentCells(p,['guitar']);
 const witnessClues=[
  [relation('above',1,0,'Stond hoger op de kaart dan Arend.'),relation('left',2,0,'Stond links van Arend.'),relation('left',3,1,'Stond links van Bertus.')],
  [unary(0,'Stond in de eerste of laatste kolom.',c=>[0,p.size-1].includes(c%p.size)),unary(2,'Stond in de onderste rij.',c=>c>=p.size*(p.size-1)),relation('left',4,1,'Stond links van Bertus.')],
  [relation('same',1,3,'Was in hetzelfde gebied als Tammo.'),relation('above',3,1,'Stond hoger op de kaart dan Bertus.'),unary(4,'Bevond zich in rij 4.',c=>Math.floor(c/p.size)===3)],
  [relation('above',3,4,'Stond hoger op de kaart dan Geeske.'),unary(4,'Stond naast een gitaar.',c=>besideGuitar.includes(c))]
 ][index];
 p.clues=[...required,...witnessClues];
 for(let who=0;who<p.people.length;who++){
  const own=p.clues.filter(c=>c.a===who);
  if(own.length!==(who===p.victim?0:1))throw Error('Every witness needs exactly one clue');
 }
 if(p.clues.some(c=>c.b===p.victim))throw Error('Clues cannot refer to the victim');
 const final=solve(p);if(final.length!==1||!valid(p,target,true)||JSON.stringify(final[0])!==JSON.stringify(target))throw Error('Furniture changed the original solution');
 p.victimWeapon=['dagger','wrench','poison','candlestick'][index];
 p.furnitureRulesVersion=2;p.clueVersion=(p.clueVersion||1)+2;
 return p;
}
