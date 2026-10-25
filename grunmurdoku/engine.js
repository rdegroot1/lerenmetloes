export const region = (p, cell) => p.regions[cell];
export function matches(p, positions, clue, complete = false) {
  const a = positions[clue.a], b = positions[clue.b];
  if (clue.type === 'unary') return a == null || clue.cells.includes(a);
  if (a == null || b == null) return true;
  switch (clue.type) {
    case 'above': return Math.floor(a / p.size) < Math.floor(b / p.size);
    case 'left': return a % p.size < b % p.size;
    case 'same': return region(p,a) === region(p,b);
    case 'different': return region(p,a) !== region(p,b);
  }
  return true;
}
export function valid(p, positions, complete = false) {
 const values = Object.values(positions);
 if (values.some(x => !Number.isInteger(x) || x < 0 || x >= p.size*p.size || p.objects.some(o=>o.cell===x))) return false;
 if(new Set(values.map(x=>Math.floor(x/p.size))).size!==values.length || new Set(values.map(x=>x%p.size)).size!==values.length) return false;
 if(!p.clues.every(c=>matches(p,positions,c,complete))) return false;
 const victim=positions[p.victim];
 if(victim!=null){const count=values.filter(c=>region(p,c)===region(p,victim)).length;if(count>2 || complete&&count!==2)return false;}
 return true;
}
export function solve(p, initial={}, limit=2) {
 if(!valid(p,initial))return [];
 const results=[], positions={...initial};
 const domains=p.people.map((_,i)=>Array.from({length:p.size*p.size},(_,c)=>c).filter(c=>!p.objects.some(o=>o.cell===c)&&p.clues.filter(q=>q.type==='unary'&&q.a===i).every(q=>q.cells.includes(c))));
 function visit(){
  if(results.length>=limit)return;
  if(Object.keys(positions).length===p.people.length){if(valid(p,positions,true))results.push({...positions});return;}
  let who,choices;
  for(let i=0;i<p.people.length;i++)if(positions[i]==null){const options=domains[i].filter(c=>{positions[i]=c;const ok=valid(p,positions);delete positions[i];return ok;});if(!options.length)return;if(!choices||options.length<choices.length){who=i;choices=options;}}
  for(const c of choices){positions[who]=c;visit();delete positions[who];if(results.length>=limit)return;}
 }
 visit();return results;
}
