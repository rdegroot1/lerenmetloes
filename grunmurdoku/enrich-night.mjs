import {solve,valid,isPlayable,furnitureCells,adjacentCells} from './engine.js';

// Enrich the existing night dossiers around their original unique placements.
// No global random state is consumed: the first series and old placements stay stable.
export function enrichNight(p,index){
 const solutions=solve(p);if(solutions.length!==1)throw Error('Base dossier not unique');
 const target=solutions[0],originalClues=p.clues,originalObjects=structuredClone(p.objects);
 p.objects=p.objects.map(o=>({...o,...(['seat','bench','sofa'].includes(o.type)?{occupiable:true}:{})}));
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
 for(const who of chairPeople)add(target[who],'chair','een klapstoel');
 footprint(rugs[index],rugWidth,rugHeight,'rug','een vloerkleed',`main-rug-${index}`);
 for(const type of ['chair','rug','chair','rug']){
  const available=free();if(!available.length)break;
  const cell=available[(index*5+p.objects.length*3)%available.length];
  add(cell,type,type==='chair'?'een klapstoel':'een vloerkleed');
 }
 // Re-evaluate adjacency to expanded furniture. Being on one half of a sofa
 // is not the same thing as standing beside that sofa.
 for(const clue of originalClues.filter(c=>c.type==='unary')){
  const parsed=clue.text.match(/^Stond (niet )?naast (.+)\.$/);if(!parsed)continue;
  const types=[...new Set(originalObjects.filter(o=>o.name===parsed[2]).map(o=>o.type))];if(!types.length)continue;
  const beside=adjacentCells(p,types);clue.cells=Array.from({length:p.size**2},(_,c)=>c).filter(c=>isPlayable(p,c)&&(parsed[1]?!beside.includes(c):beside.includes(c)));
 }
 const required=[
  {type:'onObject',a:chairPeople[0],types:['seat','chair'],text:'Zat op een stoel.'},
  {type:'onlyOnObject',a:rugPerson,types:['rug'],text:'Was de enige persoon op een vloerkleed.'},
  {type:'objectCount',types:['seat','chair'],count:2,text:'Precies twee personen zaten op een stoel.'}
 ];
 if(bedPerson!=null)required.push({type:'onObject',a:bedPerson,types:['bed'],text:'Lag op het bed.'});
 p.clues=[...required,...originalClues];
 const all=Array.from({length:p.size**2},(_,c)=>c).filter(c=>isPlayable(p,c));
 const pool=[];
 for(let a=0;a<p.people.length;a++)if(a!==p.victim){
  for(const types of [['seat','chair'],['rug'],['bed']]){
   if(!furnitureCells(p,types).length)continue;
   const on=furnitureCells(p,types).includes(target[a]);
   if(!on)pool.push({type:'unary',a,text:types.includes('rug')?'Stond niet op een vloerkleed.':types.includes('bed')?'Lag niet op een bed.':'Zat niet op een stoel.',cells:all.filter(c=>!furnitureCells(p,types).includes(c))});
  }
  for(let b=a+1;b<p.people.length;b++){
   const above=Math.floor(target[a]/p.size)<Math.floor(target[b]/p.size);
   if(above)pool.push({type:'above',a,b,text:`Stond hoger op de kaart dan ${p.people[b].name}.`});
   const left=target[a]%p.size<target[b]%p.size;
   if(left)pool.push({type:'left',a,b,text:`Stond links van ${p.people[b].name}.`});
  }
  pool.push({type:'unary',a,text:`Bevond zich in het gebied ${p.areas[p.regions[target[a]]]}.`,cells:all.filter(c=>p.regions[c]===p.regions[target[a]])});
 }
 for(let a=0;a<p.people.length;a++)if(a!==p.victim){
  pool.push({type:'unary',a,text:`Bevond zich in rij ${Math.floor(target[a]/p.size)+1}.`,cells:all.filter(c=>Math.floor(c/p.size)===Math.floor(target[a]/p.size))});
  pool.push({type:'unary',a,text:`Bevond zich in kolom ${target[a]%p.size+1}.`,cells:all.filter(c=>c%p.size===target[a]%p.size)});
 }
 for(const clue of pool){if(solve(p).length===1)break;p.clues.push(clue);}
 for(let i=p.clues.length-1;i>=required.length;i--){const [clue]=p.clues.splice(i,1);if(solve(p).length!==1)p.clues.splice(i,0,clue);}
 const final=solve(p);if(final.length!==1||!valid(p,target,true)||JSON.stringify(final[0])!==JSON.stringify(target))throw Error('Furniture changed the original solution');
 p.furnitureRulesVersion=2;p.clueVersion=(p.clueVersion||1)+1;
 return p;
}
