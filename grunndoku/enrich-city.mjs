import {solve,valid,matches,isPlayable,canStand,adjacentCells} from './engine.js';

// Upgrade a dossier around its existing solution without consuming generator RNG.
// All clue masks are computed from the public rules; solutions are never stored.
export function enrichCity(p,index,variant=0){
 const base=structuredClone(p);
 const original=solve(p);if(original.length!==1)throw Error('City base must be unique');
 const target=original[0],n=p.people.length,given=new Set(Object.keys(p.givens).map(Number));
 p.objects=p.objects.map(o=>({...o,...(['bench','sofa'].includes(o.type)?{occupiable:true}:{})}));
 const occupied=c=>p.objects.some(o=>o.cell===c);
 const add=(cell,type,name,extra={})=>p.objects.push({cell,type,name,occupiable:true,...extra});
 const free=c=>isPlayable(p,c)&&!occupied(c)&&!Object.values(target).includes(c);
 if(index>=4){
  let cuts=0;
  for(const c of [0,p.size-1,p.size*(p.size-1),p.size**2-1])if(cuts<2&&free(c)){
   const area=p.regions[c],cells=p.regions.map((r,i)=>r===area&&i!==c?i:-1).filter(i=>i>=0);
   if(!cells.length)continue;
   const seen=new Set([cells[0]]),queue=[cells[0]];
   while(queue.length){const at=queue.pop();for(const next of cells)if(!seen.has(next)&&Math.abs(Math.floor(at/p.size)-Math.floor(next/p.size))+Math.abs(at%p.size-next%p.size)===1){seen.add(next);queue.push(next);}}
   if(seen.size===cells.length){p.regions[c]=-1;cuts++;}
  }
 }
 function footprint(cells,width,type,name,id,occupiable=true){
  cells.forEach((cell,part)=>add(cell,type,name,{occupiable,furnitureId:id,part,tile:{x:part%width,y:Math.floor(part/width),width,height:cells.length/width}}));
 }
 function rectangle(width,height,person){
  for(let start=0;start<p.size**2;start++){
   if(start%p.size+width>p.size||Math.floor(start/p.size)+height>p.size)continue;
   const cells=Array.from({length:width*height},(_,i)=>start+Math.floor(i/width)*p.size+i%width);
   if(person!=null&&!cells.includes(target[person]))continue;
   if(cells.every(c=>isPlayable(p,c)&&p.regions[c]===p.regions[start]&&!occupied(c)&&(person!=null&&c===target[person]||!Object.values(target).includes(c))))return cells;
  }
 }
 const witnesses=Array.from({length:n-1},(_,i)=>i),freeWitnesses=witnesses.filter(i=>!given.has(i));
 const chairPerson=freeWitnesses[0];add(target[chairPerson],'chair','een stoel');
 const rugPerson=freeWitnesses.find(i=>i!==chairPerson);
 if(rugPerson!=null){
  const large=index>=4&&variant<3?rectangle(2,2,rugPerson):null,wide=index>=2&&variant<3?rectangle(2,1,rugPerson):null;
  if(large)footprint(large,2,'rug','een kleed',`city-rug-${index}`);
  else if(wide)footprint(wide,2,'rug','een kleed',`city-rug-${index}`);
  else add(target[rugPerson],'rug','een kleed');
 }
 if(index>=4)add(target[p.victim],'chair','een stoel');
 const benchPerson=variant>=2?freeWitnesses.findLast(i=>i!==chairPerson&&i!==rugPerson):null;
 if(benchPerson!=null)add(target[benchPerson],'bench','een bankje');
 if(index>=1&&variant===0)for(const type of ['chair','rug']){
  const options=Array.from({length:p.size**2},(_,c)=>c).filter(free);
  if(options.length)add(options[(index*7+p.objects.length)%options.length],type,type==='chair'?'een stoel':'een kleed');
 }
 if(index>=4){
  const bench=p.objects.find(o=>o.type==='bench');
  if(bench){const next=bench.cell+1;if(next%p.size!==0&&free(next)&&p.regions[next]===p.regions[bench.cell]){
   bench.furnitureId=`city-bench-${index}`;bench.part=0;bench.tile={x:0,y:0,width:2,height:1};
   add(next,'bench','een bankje',{furnitureId:bench.furnitureId,part:1,tile:{x:1,y:0,width:2,height:1}});
  }}
  if(index%3===0){const table=rectangle(2,1);if(table)footprint(table,2,'table','een tafel',`city-table-${index}`,false);}
 }
 const required=[{type:'onObject',a:chairPerson,types:['chair'],text:'Zat op een stoel.'}];
 if(variant===4){required[0].area=p.regions[target[chairPerson]];required[0].text=`Zat op een stoel in ${p.areas[required[0].area]}.`;}
 if(variant>=5){
  const chairs=p.objects.filter(o=>o.type==='chair').map(o=>o.cell),col=target[chairPerson]%p.size;
  const left=col===Math.min(...chairs.map(c=>c%p.size));
  required[0].cells=chairs.filter(c=>c%p.size===(left?Math.min(...chairs.map(c=>c%p.size)):Math.max(...chairs.map(c=>c%p.size))));
  required[0].text=`Zat op de meest ${left?'linkse':'rechtse'} stoel.`;
 }
 if(rugPerson!=null)required.push({type:'onlyOnObject',a:rugPerson,types:['rug'],text:'Was de enige persoon op een kleed.'});
 if(benchPerson!=null)required.push({type:'onlyOnObject',a:benchPerson,types:['bench'],text:'Was de enige persoon op een bankje.'});
 if(index>=4)required.push({type:'objectCount',types:['chair'],count:2,text:'Precies twee personen zaten op een stoel.'});
 p.clues=required;p.victimLocationClue=false;
 const baseline=solve(p,{},100001);if(baseline.length>=100001)throw Error('City candidate set truncated');
 const all=Array.from({length:p.size**2},(_,c)=>c).filter(c=>canStand(p,c));
 const groups=[];
 for(const a of freeWitnesses.filter(i=>!required.some(c=>c.a===i))){
  const pool=[];
  const unary=(text,predicate,cost)=>{const cells=all.filter(predicate);if(cells.includes(target[a])&&cells.length<all.length)pool.push({clue:{type:'unary',a,text,cells},cost});};
  for(const [type,o]of new Map(p.objects.map(o=>[o.type,o]))){
   const near=adjacentCells(p,[type]);
   unary(`Stond naast ${o.name}.`,c=>near.includes(c),1);
   for(const [direction,delta]of [['boven',p.size],['onder',-p.size],['links van',1],['rechts van',-1]]){
    unary(`Stond direct ${direction} ${o.name}.`,c=>p.objects.some(item=>item.type===type&&item.cell===c+delta&&p.regions[c]===p.regions[item.cell]&&(Math.abs(delta)!==1||Math.floor(c/p.size)===Math.floor(item.cell/p.size))&&!p.objects.some(part=>part.cell===c&&part.furnitureId&&part.furnitureId===item.furnitureId)),2);
   }
   if(index>=3)unary(`Stond niet naast ${o.name}.`,c=>!near.includes(c),4);
  }
  unary(`Bevond zich in het gebied ${p.areas[p.regions[target[a]]]}.`,c=>p.regions[c]===p.regions[target[a]],3);
  const area=p.regions[target[a]],same=(r,c)=>r>=0&&r<p.size&&c>=0&&c<p.size&&p.regions[r*p.size+c]===area;
  unary(`Stond in een hoek van ${p.areas[area]}.`,c=>{const r=Math.floor(c/p.size),col=c%p.size;return p.regions[c]===area&&(!same(r-1,col)||!same(r+1,col))&&(!same(r,col-1)||!same(r,col+1));},2);
  unary(`Stond tegen de noordrand van ${p.areas[area]}.`,c=>p.regions[c]===area&&!same(Math.floor(c/p.size)-1,c%p.size),3);
  unary(`Stond tegen de zuidrand van ${p.areas[area]}.`,c=>p.regions[c]===area&&!same(Math.floor(c/p.size)+1,c%p.size),3);
  unary(`Stond tegen de westrand van ${p.areas[area]}.`,c=>p.regions[c]===area&&!same(Math.floor(c/p.size),c%p.size-1),3);
  unary(`Stond tegen de oostrand van ${p.areas[area]}.`,c=>p.regions[c]===area&&!same(Math.floor(c/p.size),c%p.size+1),3);
  unary('Stond in de bovenste rij.',c=>c<p.size,2);
  unary('Stond in de onderste rij.',c=>c>=p.size*(p.size-1),2);
  unary('Stond in de eerste of laatste kolom.',c=>[0,p.size-1].includes(c%p.size),2);
  if(index>=2)for(const b of witnesses.filter(i=>i!==a)){
   const relation=(type,text,cost)=>pool.push({clue:{type,a,b,text},cost});
   if(Math.floor(target[a]/p.size)<Math.floor(target[b]/p.size))relation('above',`Stond hoger op de kaart dan ${p.people[b].name}.`,1);
   else relation('below',`Stond lager op de kaart dan ${p.people[b].name}.`,1);
   if(index>=3&&target[a]%p.size<target[b]%p.size)relation('left',`Stond links van ${p.people[b].name}.`,1);
   if(index>=3&&target[a]%p.size>target[b]%p.size)relation('right',`Stond rechts van ${p.people[b].name}.`,1);
   if(index>=4&&p.regions[target[a]]===p.regions[target[b]])relation('same',`Was in hetzelfde gebied als ${p.people[b].name}.`,2);
   if(index>=5&&p.regions[target[a]]!==p.regions[target[b]])relation('different',`Was in een ander gebied dan ${p.people[b].name}.`,4);
  }
  unary(`Bevond zich in rij ${Math.floor(target[a]/p.size)+1}.`,c=>Math.floor(c/p.size)===Math.floor(target[a]/p.size),6);
  unary(`Bevond zich in kolom ${target[a]%p.size+1}.`,c=>c%p.size===target[a]%p.size,6);
  groups.push(pool.map(candidate=>({...candidate,mask:baseline.reduce((mask,s,i)=>matches(p,s,candidate.clue,true)?mask|(1n<<BigInt(i)):mask,0n)})));
 }
 let best,bestCost=Infinity;
 function search(i,mask,clues,cost){
  if(cost>=bestCost)return;
  if(i===groups.length){
   if(mask===0n||(mask&(mask-1n))!==0n)return;

   best=clues;bestCost=cost;return;
  }
  for(const candidate of groups[i])search(i+1,mask&candidate.mask,[...clues,candidate.clue],cost+candidate.cost);
 }
 search(0,(1n<<BigInt(baseline.length))-1n,[],0);
 if(!best&&variant<5){Object.assign(p,enrichCity(base,index,variant+1));return p;}
 if(!best)throw Error(`No readable one-clue solution for city ${index+1}`);
 p.clues=[...required,...best];
 const final=solve(p);if(final.length!==1||!valid(p,target,true)||JSON.stringify(final[0])!==JSON.stringify(target))throw Error('City upgrade changed its solution');
 p.portraitStyle='mugshot';p.victimWeapon=['dagger','wrench','poison','candlestick'][index%4];p.furnitureRulesVersion=2;p.clueVersion=(p.clueVersion||1)+1;
 return p;
}
