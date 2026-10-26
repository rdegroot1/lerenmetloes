import {solve,valid,canStand,gridWidth,gridHeight,adjacentCells} from './engine.js';

const MERGES={
 'stad-v3-2':[['Noorderplantsoen','Hoge der A']],
 'stad-thema-v1-15':[['Backstage','Garderobe']],
 'stad-thema-v1-16':[['Spiegeltent','Backstage']],
 'stad-thema-v1-17':[['Winterkade','Roef']],
 'stad-thema-v1-19':[['Festivalterrein','Machinekamer']],
 'martini-v1-1':[['Noorderkapel','Noordbeuk','Sacristie'],['Hoogkoor','Middenschip'],['Zuidportaal','Zuidbeuk']],
 'martini-v1-2':[['Sacristie','Noorderkapel'],['Middenschip','Hoogkoor']],
 'martini-v1-3':[['Noordbeuk','Noordnis'],['Zuidbeuk','Zijgang']],
 'martini-v1-4':[['Noordbeuk','Noordnis'],['Zuidbeuk','Zijgang']],
 'martini-v1-5':[['Noordbeuk','Noordnis'],['Zuidbeuk','Zijgang']],
 'martini-v1-6':[['Noordbeuk','Noordnis'],['Zuidbeuk','Zijgang']],
 'winterwelvaart-v1-2':[['Hoge der A','Loopplank']]
};
const article=name=>['Torenportaal','Middenschip','Hoogkoor','Zuidportaal','Trappenhuis','Festivalterrein'].includes(name)?'het':'de';
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function merge(p,names){
 const keep=p.areas.indexOf(names[0]),removed=names.slice(1).map(n=>p.areas.indexOf(n)).filter(a=>a>=0);if(keep<0||!removed.length)return false;
 for(const name of names.slice(1))for(const c of p.clues){
  c.text=c.text.replace(new RegExp(`\\b(?:de|het) ${escape(name)}\\b`,'gi'),article(names[0])+' '+names[0].toLowerCase());
  c.text=c.text.replace(new RegExp(escape(name),'gi'),m=>m[0]===m[0].toUpperCase()?names[0]:names[0].toLowerCase());
 }
 const retained=p.areas.map((_,a)=>a).filter(a=>!removed.includes(a)),map=a=>a<0?a:retained.indexOf(removed.includes(a)?keep:a);
 p.regions=p.regions.map(map);p.areas=retained.map(a=>p.areas[a]);if(p.areaColors)p.areaColors=retained.map(a=>p.areaColors[a]);
 p.clues.forEach(c=>{if(c.area!=null)c.area=map(c.area);});return true;
}

// Compile these public geometric clues again after a room boundary changes.
// The cell masks must always describe the text on the new map.
export function refreshRoomClues(p){
 const w=gridWidth(p),h=gridHeight(p),all=Array.from({length:w*h},(_,c)=>c).filter(c=>canStand(p,c)),row=c=>Math.floor(c/w),col=c=>c%w;
 for(const clue of p.clues){
  if(!clue.cells)continue;
  const t=clue.text.toLowerCase(),room=p.areas.map((name,a)=>({name:name.toLowerCase(),a})).filter(x=>t.includes(x.name)).sort((a,b)=>b.name.length-a.name.length)[0];
  const area=room?.a,cells=area==null?all:all.filter(c=>p.regions[c]===area),same=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&p.regions[r*w+c]===area;
  let result;
  if(t.startsWith('bevond zich ')&&area!=null)result=cells;
  else if(t.includes('eerste of laatste kolom'))result=all.filter(c=>col(c)===0||col(c)===w-1);
  else if(t.includes('onderste rij'))result=all.filter(c=>row(c)===h-1);
  else if(t.includes('vierde rij'))result=cells.filter(c=>row(c)===3);
  else if(t.includes('rand van ')&&area!=null){const direction=t.match(/(noord|zuid|west|oost)rand/)[1],[dr,dc]=({noord:[-1,0],zuid:[1,0],west:[0,-1],oost:[0,1]})[direction];result=cells.filter(c=>!same(row(c)+dr,col(c)+dc));}
  else if(t.includes('hoek van ')&&area!=null){const corner=t.match(/(noordwest|noordoost|zuidwest|zuidoost)hoek/);result=cells.filter(c=>corner?(!same(row(c)+(corner[1].startsWith('noord')?-1:1),col(c))&&!same(row(c),col(c)+(corner[1].endsWith('west')?-1:1))):(!same(row(c)-1,col(c))||!same(row(c)+1,col(c)))&&(!same(row(c),col(c)-1)||!same(row(c),col(c)+1)));}
  else{
   const types=[...new Set(p.objects.filter(o=>t.includes(o.name.toLowerCase())).map(o=>o.type))];
   if(!types.length)throw Error('Unsupported changed clue: '+clue.text);
   const objects=p.objects.filter(o=>types.includes(o.type)&&(area==null||p.regions[o.cell]===area));
   const half=o=>!t.includes('linkerhelft')&&!t.includes('rechterhelft')||!!o.tile&&(t.includes('linkerhelft')?o.tile.x<o.tile.width/2:o.tile.x>=o.tile.width/2);
   if(t.startsWith('zat op ')||t.startsWith('stond op ')||t.startsWith('lag op '))result=objects.filter(o=>o.occupiable&&half(o)).map(o=>o.cell);
   else if(t.includes('naast '))result=cells.filter(c=>adjacentCells(p,types).includes(c));
   else{
    const direction=t.match(/(?:direct |precies (\d+) vakjes )(boven|onder|links van|rechts van)/);if(!direction)throw Error('Unsupported changed clue: '+clue.text);
    const distance=+(direction[1]||1),[dr,dc]=({boven:[-1,0],onder:[1,0],'links van':[0,-1],'rechts van':[0,1]})[direction[2]],next=[];
    for(const o of objects.filter(half)){const group=objects.filter(q=>o.furnitureId?q.furnitureId===o.furnitureId:q.cell===o.cell).map(q=>q.cell);if(group.includes(o.cell+dr*w+dc))continue;const c=o.cell+dr*distance*w+dc*distance;if(cells.includes(c)&&row(c)===row(o.cell)+dr*distance&&col(c)===col(o.cell)+dc*distance&&!group.includes(c))next.push(c);}
    result=next;
   }
  }
  clue.cells=[...new Set(result)].sort((a,b)=>a-b);
 }
}

export function ensureSpaciousRooms(p){
 const plan=MERGES[p.id];if(!plan)return p;
 const before=JSON.stringify(p.regions),target=solve(p)[0];for(const names of plan)merge(p,names);
 if(JSON.stringify(p.regions)===before)return p;
 refreshRoomClues(p);const solutions=solve(p);
 if(solutions.length!==1||!valid(p,target,true)||JSON.stringify(solutions[0])!==JSON.stringify(target))throw Error(`Room upgrade changed the solution: ${p.id} (${solutions.length} solutions)`);
 if(p.areas.some((_,a)=>p.regions.filter(r=>r===a).length<4))throw Error('Room still too small: '+p.id);
 p.clueVersion=(p.clueVersion||1)+1;return p;
}
