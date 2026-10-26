export const gridWidth=p=>p.width||p.size;
export const gridHeight=p=>p.height||p.size;
export const cellCount=p=>gridWidth(p)*gridHeight(p);
export const rowOf=(p,c)=>Math.floor(c/gridWidth(p));
export const columnOf=(p,c)=>c%gridWidth(p);
export const isPlayable=(p,c)=>Number.isInteger(c)&&c>=0&&c<cellCount(p)&&Number.isInteger(p.regions[c])&&p.regions[c]>=0;
export const canStand=(p,c)=>isPlayable(p,c)&&!p.objects.some(o=>o.cell===c&&o.occupiable!==true);
export const furnitureCells=(p,types)=>p.objects.filter(o=>o.occupiable===true&&types.includes(o.type)).map(o=>o.cell);
export function adjacentCells(p,types){
 const groups=new Map();
 for(const o of p.objects.filter(o=>types.includes(o.type))){const id=o.furnitureId||`${o.type}:${o.cell}`;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(o.cell);}
 return Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>isPlayable(p,c)&&[...groups.values()].some(cells=>!cells.includes(c)&&cells.some(d=>p.regions[c]===p.regions[d]&&Math.abs(rowOf(p,c)-rowOf(p,d))+Math.abs(columnOf(p,c)-columnOf(p,d))===1)));
}
export const region = (p, cell) => p.regions[cell];
export function matches(p, positions, clue, complete = false) {
  const a = positions[clue.a], b = positions[clue.b];
  if(a!=null&&clue.cells&&!clue.cells.includes(a))return false;
  if(clue.type==='roomAlone'){
   if(a!=null&&region(p,a)!==clue.area)return false;
   return !Object.entries(positions).some(([i,c])=>+i!==clue.a&&region(p,c)===clue.area);
  }
  if(clue.type==='onObject'||clue.type==='onlyOnObject'){
   const cells=furnitureCells(p,clue.types).filter(c=>(clue.area==null||region(p,c)===clue.area)&&(!clue.cells||clue.cells.includes(c)));
   if(a!=null&&!cells.includes(a))return false;
   return clue.type!=='onlyOnObject'||!Object.entries(positions).some(([i,c])=>+i!==clue.a&&cells.includes(c));
  }
  if(clue.type==='objectCount'){
   const cells=furnitureCells(p,clue.types),count=Object.values(positions).filter(c=>cells.includes(c)).length,unplaced=p.people.length-Object.keys(positions).length;
   return count<=clue.count&&count+unplaced>=clue.count&&(!complete||count===clue.count);
  }
  if (clue.type === 'unary') return a == null || clue.cells.includes(a);
  if (a == null || b == null) return true;
  switch (clue.type) {
    case 'above': return rowOf(p,a) < rowOf(p,b);
    case 'below': return rowOf(p,a) > rowOf(p,b);
    case 'left': return columnOf(p,a) < columnOf(p,b);
    case 'right': return columnOf(p,a) > columnOf(p,b);
    case 'same': return region(p,a) === region(p,b);
    case 'different': return region(p,a) !== region(p,b);
  }
  return true;
}
export function valid(p, positions, complete = false) {
 if (Object.entries(p.givens || {}).some(([i,c]) => positions[i] != null && positions[i] !== c)) return false;
 const values = Object.values(positions);
 if (values.some(x => !canStand(p,x))) return false;
 if(new Set(values.map(x=>rowOf(p,x))).size!==values.length || new Set(values.map(x=>columnOf(p,x))).size!==values.length) return false;
 if(!p.clues.every(c=>matches(p,positions,c,complete))) return false;
 const victim=positions[p.victim];
 if(victim!=null){const count=values.filter(c=>region(p,c)===region(p,victim)).length;if(count>2 || complete&&count!==2)return false;}
 return true;
}
export function solve(p, initial={}, limit=2, options={}) {
 if(!valid(p,initial))return [];
 const results=[], positions={...p.givens,...initial};
 const available=Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>canStand(p,c));
 const domains=p.people.map((_,i)=>available.filter(c=>p.clues.every(q=>matches(p,{[i]:c},q))));
 let nodes=0;
 function visit(){
  if(++nodes>(options.maxNodes||Infinity)){const error=new Error('Search limit reached');error.code='SEARCH_LIMIT';throw error;}
  if(results.length>=limit)return;
  if(Object.keys(positions).length===p.people.length){if(valid(p,positions,true))results.push({...positions});return;}
  let who,choices;
  for(let i=0;i<p.people.length;i++)if(positions[i]==null){const options=domains[i].filter(c=>{positions[i]=c;const ok=valid(p,positions);delete positions[i];return ok;});if(!options.length)return;if(!choices||options.length<choices.length){who=i;choices=options;}}
  for(const c of choices){positions[who]=c;visit();delete positions[who];if(results.length>=limit)return;}
 }
 visit();return results;
}
