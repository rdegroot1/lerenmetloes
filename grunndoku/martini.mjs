import {solve,valid,canStand,adjacentCells,gridWidth,rowOf,columnOf,matches} from './engine.js';

export const NAMES=['Arend','Bertus','Cora','Tammo','Geeske','Fokko','Harm','Roelf','Jantje','Wubbo','Neeltje','Lammert','Meint','Sientje','Evert','Dieuwertje'];
const ROLES=['de koster','de organist','de koorzangeres','de sleutelbeheerder','de restaurator','de muziekarchivaris','de suppoost','de orgelstemmer','de concertbezoekster','de decorbouwer','de rondleidster','de boekbinder','de lichttechnicus','de violiste','de historicus','de vrijwilligster'];
export const COLORS=['#a95c42','#497c78','#847341','#79638e','#4f7955','#8c5964','#4c718d','#a37a3e','#ae6d80','#527b66','#77648e','#897455','#4f7e85','#a16b51','#777b49','#866c7b'];
const AREAS=['Torenportaal','Orgelzone','Noordbeuk','Middenschip','Zuidbeuk','Hoogkoor','Noorderkapel','Sacristie','Kooromgang','Zuidportaal','Noordnis','Zijgang'];
const AREA_COLORS=['#c7c8bd','#d4bf9a','#d5d7c4','#e7d8b9','#c8d2cd','#d8bfab','#c8c3d7','#d8cfaf','#e1d5c7','#b8cbc8','#d9c9be','#ccd2b7'];
const SPECS=[
 [8,6,6,4,'De gesloten kapel','Na een rondleiding blijft een muziekmap achter. Vier bezoekers staan al op de kaart. Zoek de laatste getuige en ontdek wie met Fokko achterbleef.'],
 [10,8,8,2,'Een valse noot','De repetitie is voorbij. Een stoel is verschoven en Fokko’s potlood ligt nog bij zijn aantekeningen. De laatste aanwezigen vertellen waar ze stonden.'],
 [12,10,10,0,'De verdwenen sleutel','De sleutelbos is nergens te vinden. Rond de kerkbanken en de preekstoel passen de verhalen niet zomaar in elkaar.'],
 [14,12,12,0,'Schaduw in de kooromgang','Na de avondopenstelling gaan de lichten één voor één uit. Twaalf aanwezigen hebben ieder hun eigen verklaring.'],
 [18,14,14,0,'Het zwijgende orgel','De laatste klank is weggestorven. Van torenportaal tot sacristie moet ieder alibi precies op zijn plaats vallen.'],
 [24,16,16,0,'De laatste orgeltoon','Het grote slotdossier. Zestien fictieve aanwezigen, de hele kerk en één verklaring die alles met elkaar verbindt. Neem de tijd: dit is de Martini-proef.']
];

export function martiniPlan(width,height){
 const inset=height>=16?4:height>=12?3:height===6?1:2;
 const top=inset,bottom=height-inset-1,choir=Math.max(5,Math.floor(width*.72)),organEnd=Math.max(2,Math.floor(width*.2));
 const regions=Array(width*height).fill(-1),set=(r,c,a)=>{if(r>=0&&r<height&&c>=0&&c<width)regions[r*width+c]=a;};
 for(let r=top;r<=bottom;r++)for(let c=2;c<=width-2;c++){
  const area=c<=organEnd?1:c<choir?(r===top?2:r===bottom?4:3):(r===top||r===bottom||c===width-2?8:5);
  set(r,c,area);
 }
 const mid=Math.floor(height/2);
 for(let r=mid-1;r<=mid;r++){for(let c=0;c<2;c++)set(r,c,0);set(r,width-1,8);}
 const chapelStart=Math.max(4,choir-1),sacristyStart=Math.max(chapelStart+1,width-3);
 for(let r=0;r<top;r++)for(let c=chapelStart;c<=width-2;c++)set(r,c,c<sacristyStart?6:7);
 const porchStart=Math.max(2,Math.floor(width*.28)),porchEnd=Math.max(porchStart+1,Math.floor(width*.45));
 for(let r=bottom+1;r<height;r++)for(let c=porchStart;c<=porchEnd;c++)set(r,c,9);
 if(width>=12){for(let c=4;c<=Math.min(6,choir-2);c++)set(top-1,c,10);for(let c=porchEnd+2;c<=Math.min(porchEnd+4,width-3);c++)set(bottom+1,c,11);}
 const used=[...new Set(regions.filter(a=>a>=0))].sort((a,b)=>a-b);
 return {regions:regions.map(a=>a<0?-1:used.indexOf(a)),areas:used.map(a=>AREAS[a]),areaColors:used.map(a=>AREA_COLORS[a]),top,bottom,choir,organEnd};
}

export function furnishMartini(p,plan){
 const width=p.width,{top,bottom,choir,organEnd}=plan,mid=Math.floor(p.height/2),objects=[];
 const area=name=>p.areas.indexOf(name),empty=c=>p.regions[c]>=0&&!objects.some(o=>o.cell===c);
 function place(r,c,w,h,type,name,allowed=false,id=type+'-'+r+'-'+c){
  if(c<0||r<0||c+w>p.width||r+h>p.height)return false;
  const cells=Array.from({length:w*h},(_,i)=>(r+Math.floor(i/w))*width+c+i%w);
  if(!cells.every(cell=>empty(cell)&&p.regions[cell]===p.regions[cells[0]]))return false;
  cells.forEach((cell,part)=>objects.push({cell,type,name,occupiable:allowed,...(cells.length>1?{furnitureId:id,part,tile:{x:part%w,y:Math.floor(part/w),width:w,height:h}}:{})}));return true;
 }
 const organWidth=Math.min(3,organEnd-1),organHeight=Math.min(2,bottom-top+1);
 place(mid-1,2,organWidth,organHeight,'churchOrgan','het orgel');
 // Parallel banks leave an open middle aisle towards the choir.
 const pewRows=new Set([top+1,bottom-1]);if(p.width>=18){pewRows.add(top+2);pewRows.add(bottom-2);}
 for(const r of pewRows)for(let c=organEnd+1;c<choir-1;c+=3)place(r,c,Math.min(2,choir-1-c),1,'churchPew','een kerkbank',true);
 const tableWidth=p.width>=14?2:1,tableHeight=p.width>=14?2:1;
 if(!place(mid-1,choir+1,tableWidth,tableHeight,'churchTable','de avondmaalstafel'))place(mid,choir,1,1,'churchTable','de avondmaalstafel');
 place(Math.min(bottom-1,mid+1),choir-1,1,1,'churchPulpit','de preekstoel',true);
 for(const r of [top,bottom])for(let c=organEnd+2;c<choir;c+=4)place(r,c,1,1,'churchColumn','een zuil');
 place(top,Math.min(width-3,choir+1),1,1,'churchCandle','een kandelaar');
 place(bottom,choir,1,1,'churchLectern','een lessenaar');
 // Loose, movable furniture in side rooms; no historical confessionals.
 for(const name of ['Noorderkapel','Sacristie','Zuidportaal','Noordnis','Zijgang']){
  const id=area(name);if(id<0)continue;
  const cells=p.regions.map((a,c)=>a===id?c:-1).filter(c=>c>=0),first=cells[0],last=cells.at(-1);
  if(cells.length>=4)place(Math.floor(first/width),first%width,1,1,name==='Sacristie'?'books':'churchCandle',name==='Sacristie'?'een boekenkast':'een kandelaar');
  if(name==='Noorderkapel'||name==='Zuidportaal')place(Math.floor(last/width),last%width,1,1,'churchPew','een kerkbank',true);
 }
 // A runner lies along the central aisle, clear of fixed furniture.
 if(width>=12){const r=mid,c=organEnd+3;place(r,c,Math.min(3,choir-c),1,'churchRug','een loper',true);}
 place(top,2,1,1,'chair','een stoel',true);
 p.objects=objects;return p;
}

function random(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);}
const shuffled=(list,rand)=>list.map(x=>[rand(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

export function createMartiniSeries(){
 return SPECS.map(([width,height,count,givenCount,title,story],index)=>{
  const plan=martiniPlan(width,height),p={id:`martini-v1-${index+1}`,number:22+index,seriesId:'martini',seriesNumber:index+1,theme:'Moord in de Martini',title,story,lesson:index===5?'De Martini-proef — een groot slotdossier':'Een nieuw spoor in de Martini',level:index===5?'Extreem':['Heel makkelijk','Makkelijk','Gemiddeld','Pittig','Uitdagend'][index],difficultyStars:index+1,size:width,width,height,regions:plan.regions,areas:plan.areas,areaColors:plan.areaColors,people:NAMES.slice(0,count).map((name,i)=>({name,role:ROLES[i],color:COLORS[i]})),victim:5,victimLocationClue:false,victimWeapon:['dagger','wrench','poison','candlestick','wrench','dagger'][index],portraitStyle:'mugshot',furnitureRulesVersion:2,clueVersion:1,givens:{},clues:[],printLayout:'church',mapNote:'Eigen schematische puzzelkaart, geïnspireerd op de huidige Martinikerk. Dikke lijnen begrenzen puzzelgebieden; ze zijn niet allemaal muren. Geen actuele bezoekplattegrond.',rulesNote:'Iedereen krijgt een eigen rij én kolom. Sommige kolommen blijven leeg.'};
  furnishMartini(p,plan);
  buildMartiniClues(p,givenCount,random(70931+index*1009));
  return p;
 });
}

export function buildMartiniClues(p,givenCount,rand){
 const width=p.width,level=p.difficultyStars,available=Array.from({length:p.width*p.height},(_,c)=>c).filter(c=>canStand(p,c));
 const roomText=area=>(p.roomArticles?.[p.areas[area]]||(['Torenportaal','Middenschip','Hoogkoor','Zuidportaal','Trappenhuis'].includes(p.areas[area])?'het':'de'))+' '+(p.properAreaNames?.includes(p.areas[area])?p.areas[area]:p.areas[area].toLowerCase());
 const location=area=>(p.outdoorAreas?.includes(p.areas[area])?'op ':'in ')+roomText(area);
 const areaCells=p.areas.map((_,a)=>available.filter(c=>p.regions[c]===a));
 const groups=[...new Map(p.objects.map(o=>[o.type,o])).values()];
 const adjacent=new Map(groups.map(o=>[o.type,adjacentCells(p,[o.type])]));
 const offsetCells=(type,area,dr,dc,distance)=>{
  const parts=p.objects.filter(o=>o.type===type&&p.regions[o.cell]===area),result=[];
  for(const o of parts){
   const group=parts.filter(q=>o.furnitureId?q.furnitureId===o.furnitureId:q.cell===o.cell).map(q=>q.cell);
   if(group.includes(o.cell+dr*width+dc))continue;
   const c=o.cell+dr*distance*width+dc*distance;
   if(canStand(p,c)&&p.regions[c]===area&&!group.includes(c)&&rowOf(p,c)===rowOf(p,o.cell)+dr*distance&&columnOf(p,c)===columnOf(p,o.cell)+dc*distance)result.push(c);
  }
  return [...new Set(result)];
 };
 const unaryFacts=[];
 const fact=(text,cells,rank=1)=>{if(cells.length)unaryFacts.push({text,cells,rank});};
 for(let a=0;a<p.areas.length;a++){
  const cells=areaCells[a],where=roomText(a),has=(r,c)=>r>=0&&r<p.height&&c>=0&&c<width&&p.regions[r*width+c]===a;
  fact(`Bevond zich ${location(a)}.`,cells,2);
  for(const [side,dr,dc]of [['noord',-1,0],['zuid',1,0],['west',0,-1],['oost',0,1]])fact(`Stond tegen de ${side}rand van ${where}.`,cells.filter(c=>!has(rowOf(p,c)+dr,columnOf(p,c)+dc)),3);
  for(const [corner,dr,dc]of [['noordwest',-1,-1],['noordoost',-1,1],['zuidwest',1,-1],['zuidoost',1,1]])fact(`Stond in de ${corner}hoek van ${where}.`,cells.filter(c=>!has(rowOf(p,c)+dr,columnOf(p,c))&&!has(rowOf(p,c),columnOf(p,c)+dc)),4);
  for(const o of groups){
   const on=p.objects.filter(q=>q.type===o.type&&q.occupiable).map(q=>q.cell).filter(c=>p.regions[c]===a);
   const verb=p.surfaceVerbs?.[o.type]||(o.type==='churchPew'||o.type==='chair'?'Zat op':'Stond op');
   if(on.length)fact(`${verb} ${o.name} ${location(a)}.`,on,1);
   const near=adjacent.get(o.type).filter(c=>canStand(p,c)&&p.regions[c]===a);
   fact(`Stond naast ${o.name} ${location(a)}.`,near,1);
   for(const [direction,dr,dc]of [['boven',-1,0],['onder',1,0],['links van',0,-1],['rechts van',0,1]]){
    const next=offsetCells(o.type,a,dr,dc,1);
    fact(`Stond direct ${direction} ${o.name} ${location(a)}.`,next,2);
   }
   // Legacy seeded construction only: general-clues.mjs replaces every published
   // counted offset after the room upgrade. The final generator policy rejects
   // any offset left over, including in future series.
   for(const distance of [2,3])for(const [direction,dr,dc]of [['boven',-1,0],['onder',1,0],['links van',0,-1],['rechts van',0,1]]){
    fact(`Stond precies ${distance} vakjes ${direction} ${o.name} ${location(a)}.`,offsetCells(o.type,a,dr,dc,distance),5);
   }
  }
 }
 const factsAt=c=>unaryFacts.filter(f=>f.cells.includes(c));
 const eligible=available.filter(c=>factsAt(c).some(f=>f.cells.length<=4));
 let target,pools;
 for(let attempt=0;attempt<400;attempt++){
  const byRow=Array.from({length:p.height},(_,r)=>shuffled(eligible.filter(c=>rowOf(p,c)===r),rand));
  const chosen={},used=new Set(),rows=shuffled(Array.from({length:p.height},(_,r)=>r),rand).sort((a,b)=>byRow[a].length-byRow[b].length);
  function place(i){if(i===rows.length)return true;const r=rows[i];for(const c of byRow[r])if(!used.has(c%width)){chosen[r]=c;used.add(c%width);if(place(i+1))return true;used.delete(c%width);}return false;}
  if(!place(0))continue;
  const cells=Object.values(chosen),counts=p.areas.map((_,a)=>cells.filter(c=>p.regions[c]===a).length);
  const victims=shuffled(cells.filter(c=>counts[p.regions[c]]===2),rand);
  for(const victimCell of victims){
   const other=shuffled(cells.filter(c=>c!==victimCell),rand),positions={};let at=0;
   for(let who=0;who<p.people.length;who++)positions[who]=who===p.victim?victimCell:other[at++];
   const witnessCells=Object.entries(positions).filter(([i])=>+i!==p.victim).map(([,c])=>c),witnessRows=new Set(witnessCells.map(c=>rowOf(p,c))),witnessCols=new Set(witnessCells.map(c=>c%width));
   const remaining=available.filter(c=>!witnessRows.has(rowOf(p,c))&&!witnessCols.has(c%width)&&witnessCells.filter(d=>p.regions[d]===p.regions[c]).length===1);
   if(remaining.length!==1||remaining[0]!==victimCell)continue;
   const witnesses=p.people.map((_,i)=>i).filter(i=>i!==p.victim),givens=shuffled(witnesses,rand).slice(0,givenCount);
   p.givens=Object.fromEntries(givens.map(i=>[i,positions[i]]));
   const candidates=witnesses.map(a=>{
    const onTypes=[...new Set(p.objects.filter(o=>o.cell===positions[a]&&o.occupiable).map(o=>o.type))],own=factsAt(positions[a]).map(f=>({type:'unary',a,text:f.text,cells:f.cells,rank:f.rank}));
    const occupancy=counts[p.regions[positions[a]]];
    if(occupancy===1)own.push({type:'roomAlone',a,area:p.regions[positions[a]],text:`Was alleen ${location(p.regions[positions[a]])}.`,rank:2});
    if(onTypes.length&&Object.entries(positions).filter(([i,c])=>+i!==a&&p.objects.some(o=>o.cell===c&&onTypes.includes(o.type))).length===0)own.push({type:'onlyOnObject',a,types:onTypes,text:`Was de enige persoon op ${p.objects.find(o=>o.cell===positions[a]).name}.`,rank:2});
    if(level>=3)for(const b of witnesses.filter(i=>i!==a)){
     const r=rowOf(p,positions[a])<rowOf(p,positions[b])?'above':'below',h=positions[a]%width<positions[b]%width?'left':'right';
     const scoped=areaCells[p.regions[positions[a]]];
     own.push({type:r,a,b,cells:scoped,text:`Bevond zich ${location(p.regions[positions[a]])}, ${r==='above'?'hoger':'lager'} op de kaart dan ${p.people[b].name}.`,rank:1});
     own.push({type:h,a,b,cells:scoped,text:`Bevond zich ${location(p.regions[positions[a]])}, ${h==='left'?'links':'rechts'} van ${p.people[b].name}.`,rank:1});
    }
    return own.map(({rank,...clue})=>({clue,rank,domain:available.filter(c=>matches(p,{[a]:c},clue))})).sort((x,y)=>x.domain.length-y.domain.length||x.rank-y.rank);
   });
   p.clues=witnesses.filter(i=>!givens.includes(i)).map(a=>candidates[witnesses.indexOf(a)][0].clue);
   for(const types of p.countGroups||[['churchPew'],['churchRug'],['chair']])if(level>=3&&p.objects.some(o=>types.includes(o.type))){const count=Object.values(positions).filter(c=>p.objects.some(o=>o.cell===c&&types.includes(o.type)&&o.occupiable)).length;const verb=types[0]==='bed'?(count===1?'lag':'lagen'):['churchRug','rug'].includes(types[0])?(count===1?'stond':'stonden'):(count===1?'zat':'zaten');if(count>0)p.clues.push({type:'objectCount',types,count,text:`Precies ${count} ${count===1?'persoon':'personen'} ${verb} op ${p.countLabels?.[types[0]]||(types[0]==='churchPew'?'een kerkbank':types[0]==='churchRug'?'een loper':'een stoel')}.`});}
   let solved;try{solved=solve(p,{},2,{maxNodes:3000});}catch(error){if(error.code==='SEARCH_LIMIT')continue;throw error;}
   if(solved.length!==1)continue;
   target=positions;pools=candidates;break;
  }
  if(target)break;
 }
 if(!target)throw Error(`Could not construct Martini ${level}`);
 // Trade direct landmarks for combined spatial reasoning while retaining a complete uniqueness proof.
 if(level>=2){
  const witnesses=p.people.map((_,i)=>i).filter(i=>i!==p.victim);
  for(const a of shuffled(witnesses.filter(i=>!Object.hasOwn(p.givens,i)),rand)){
   const slot=p.clues.findIndex(c=>c.a===a),old=p.clues[slot];
   const alternatives=shuffled(pools[witnesses.indexOf(a)].filter(x=>x.domain.length>=2&&x.domain.length<=Math.min(10,level+3)),rand).sort((x,y)=>(['above','below','left','right'].includes(y.clue.type)?1:0)-(['above','below','left','right'].includes(x.clue.type)?1:0)).slice(0,level>=5?10:5);
   for(const candidate of alternatives){p.clues[slot]=candidate.clue;let solutions;try{solutions=solve(p,{},2,{maxNodes:1500});}catch(error){if(error.code==='SEARCH_LIMIT'){p.clues[slot]=old;continue;}throw error;}if(solutions.length===1){break;}p.clues[slot]=old;}
  }
 }
 const final=solve(p);if(final.length!==1||!valid(p,target,true)||JSON.stringify(final[0])!==JSON.stringify(target))throw Error('Martini construction lost its unique solution');
 for(const clue of p.clues)if(clue.a===p.victim||clue.b===p.victim||clue.text.includes(p.people[p.victim].name))throw Error('Martini clue refers to victim');
}


// A puzzle cutaway: successive floors are unfolded into one continuous grid.
// This is an original diagram, not a visitor floor plan or a scale drawing.
export function towerPlan(width,height){
 const names=['Uurwerkzolder','Filmzolder','Eerste trans','Trappenhuis','Klokkenzolder','Luidzolder','Torenentree'];
 const regions=Array(width*height).fill(-1),mid=Math.floor(width/2),topLeft=Math.floor(width/3),topRight=width-topLeft;
 for(let row=0;row<height;row++)for(let col=0;col<width;col++){
  let area=-1;
  if(row<2&&col>=topLeft&&col<topRight)area=0;
  else if(row>=2&&row<4)area=col<2?3:col<=mid?1:2;
  else if(row>=4&&row<height-2&&col>=1&&col<width-1)area=col<3?3:4;
  else if(row>=height-2)area=col<3?3:col<=mid?5:6;
  regions[row*width+col]=area;
 }
 return {width,height,regions,areas:names,areaColors:['#c7cec5','#d8ccb4','#bdd2d4','#d2b8a0','#c8ba92','#d8c5b1','#c3cbb0']};
}
export function furnishTower(p){
 const width=p.width,height=p.height,mid=Math.floor(width/2),objects=[];let sequence=0;
 const place=(row,col,w,h,type,name,occupiable=false)=>{
  const cells=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>(row+y)*width+col+x)).flat(),area=p.regions[cells[0]];
  if(row<0||col<0||row+h>height||col+w>width||area<0||cells.some(c=>p.regions[c]!==area||objects.some(o=>o.cell===c)))return false;
  const id=`tower-${type}-${sequence++}`;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)objects.push({cell:(row+y)*width+col+x,type,name,occupiable,...(w*h>1?{furnitureId:id,tile:{x,y,width:w,height:h}}:{})});return true;
 };
 place(0,Math.floor(width/3),2,1,'towerClock','het uurwerk');
 place(2,2,2,1,'towerScreen','het filmscherm');
 place(3,mid,1,1,'chair','een stoel',true);
 place(2,width-2,2,1,'towerRailing','de balustrade');
 place(3,width-1,1,1,'towerFlag','de vlaggenstok');
 place(2,0,1,2,'towerStairs','de wenteltrap',true);
 place(height-3,1,1,2,'towerStairs','de wenteltrap',true);
 place(4,4,2,2,'towerBell','een luidklok');
 if(height>=10)place(6,width-4,2,1,'towerBell','een luidklok');
 place(height-2,3,1,2,'towerRope','het luidtouw');
 place(height-1,mid,1,1,'bench','een bankje',true);
 place(height-1,width-2,2,1,'towerChest','de gereedschapskist');
 p.objects=objects;return p;
}
export function createTowerSeries(){
 const specs=[
  [10,8,8,3,'De laatste slag','Een rondleiding eindigt met één onverwachte klokslag. Acht fictieve bezoekers waren nog in de toren. Wie bleef met Fokko achter?'],
  [12,10,10,4,'Mist rond de trans','Vanaf de eerste trans verdwijnt de stad langzaam in de mist. Binnen liggen een filmkaartje en een vergeten sleutelbos. Tien verhalen moeten op hun plek vallen.'],
  [14,12,12,4,'Stilte boven de Markt','De toren is gesloten, maar boven klinkt nog een voetstap. Van luidzolder tot uurwerkzolder vertellen twaalf aanwezigen waar ze waren.']
 ];
 return specs.map(([width,height,count,stars,title,story],index)=>{
  const p={id:`martinitoren-v1-${index+1}`,number:28+index,seriesId:'martini',seriesNumber:7+index,setting:'tower',theme:'Moord in de Martinitoren',title,story,lesson:'Een extra torenzaak — lees de uitgeklapte kaart als één rooster',level:stars===3?'Gemiddeld':'Pittig',difficultyStars:stars,size:width,width,height,...towerPlan(width,height),people:NAMES.slice(0,count).map((name,i)=>({name,role:['de torenwachter','de klokkenluider','de filmmaakster','de gids','de fotograaf','de archiefbezoeker','de uurwerkmaker','de timmerman','de bezoekster','de restaurator','de vrijwilligster','de sleutelbeheerder'][i],color:COLORS[i]})),victim:5,victimLocationClue:false,victimWeapon:['candlestick','wrench','dagger'][index],portraitStyle:'mugshot',furnitureRulesVersion:2,clueVersion:1,givens:{},clues:[],printLayout:'church',mapNote:'Eigen uitgeklapte doorsnede van de Martinitoren. Verdiepingen en de trans zijn vereenvoudigde puzzelgebieden, geen actuele bezoekplattegrond. De wenteltrap met groen merkje is bezetbaar; klokken en het uurwerk blokkeren hun hele oppervlak.',rulesNote:'Eén doorlopend rooster: iedere persoon heeft een eigen rij én kolom, over alle verdiepingen heen. Hoger/lager verwijst naar rijen op deze kaart.',mapOrientation:'UITGEKLAPTE TOREN · HOGER OP DE KAART ↑',mapCaption:'Schematische, uitgeklapte torenkaart. Rijen en kolommen lopen door over alle verdiepingen.'};
  furnishTower(p);buildMartiniClues(p,0,random(94037+index*2017));return p;
 });
}
