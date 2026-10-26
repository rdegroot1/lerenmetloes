import {solve,matches,region,isPlayable,furnitureCells,cellCount,gridWidth} from './engine.js?v=20261026-winter';

// Constraint propagation only uses the public rules and clues. Exact search is
// reserved for explicitly described elimination of remaining alternatives.
export function explain(p,options={}){
 const result=[],deductions=[],positions={...p.givens,...options.initial},n=p.people.length;
 const width=gridWidth(p),name=i=>p.people[i].name,spot=c=>`rij ${Math.floor(c/width)+1}, kolom ${c%width+1}`;
 const row=c=>Math.floor(c/width),col=c=>c%width;
 const clues=i=>p.clues.filter(c=>c.a===i&&['unary','onObject','onlyOnObject','roomAlone'].includes(c.type));
 for(const [i,c]of Object.entries(p.givens||{}))result.push(`${name(i)} is gegeven: ${spot(c)}. In die rij en kolom kan niemand anders staan.`);
 const blocked=new Set(p.objects.filter(o=>o.occupiable!==true).map(o=>o.cell));
 const domains=p.people.map((_,i)=>Object.hasOwn(positions,i)?[positions[i]]:Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>isPlayable(p,c)&&!blocked.has(c)&&p.clues.every(q=>matches(p,{[i]:c},q))));
 const hallGroups=[];
 function combinations(start,group){if(group.length)hallGroups.push(group);if(group.length>=Math.min(n-1,n>10?4:n-1))return;for(let i=start;i<n;i++)combinations(i+1,[...group,i]);}
 combinations(0,[]);
 const reasons=p.people.map((_,i)=>new Set(clues(i).map(c=>`de aanwijzing “${c.text}”`)));
 const found=Symbol('forced placement');
 const remove=(i,forbidden,why)=>{const next=domains[i].filter(c=>!forbidden(c));if(next.length!==domains[i].length){domains[i]=next;reasons[i].add(why);if(next.length===1&&positions[i]==null)throw found;return true;}return false;};
 const compatible=(i,a,j,b)=>row(a)!==row(b)&&col(a)!==col(b)&&p.clues.filter(c=>c.type!=='unary'&&((c.a===i&&c.b===j)||(c.a===j&&c.b===i))).every(c=>matches(p,{[i]:a,[j]:b},c));
 function propagate(){
  let change=true;
  while(change){change=false;
   for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j){
    const relations=p.clues.filter(c=>c.type!=='unary'&&((c.a===i&&c.b===j)||(c.a===j&&c.b===i)));
    const why=relations.length?relations.map(c=>`${name(c.a)}: “${c.text}”`).join(' en '):domains[j].length===1?`${name(j)} ${positions[j]==null?'kan alleen staan op':'staat op'} ${spot(domains[j][0])}; die rij en kolom vallen af`:`${name(i)} en ${name(j)} moeten verschillende rijen en kolommen hebben`;
    change=remove(i,c=>!domains[j].some(d=>compatible(i,c,j,d)),why)||change;
   }
   // Hall sets: when a group uses exactly as many rows/columns as people,
   // those rows/columns cannot be used by anyone outside that group.
   for(const axis of [row,col])for(const group of hallGroups){
    const values=new Set(group.flatMap(i=>domains[i].map(axis)));
    if(values.size!==group.length)continue;
    for(let i=0;i<n;i++)if(!group.includes(i))change=remove(i,c=>values.has(axis(c)),`de ${values.size===1?(axis===row?'rij':'kolom'):(axis===row?'rijen':'kolommen')} ${[...values].map(v=>v+1).join(', ')} ${values.size===1?'is':'zijn'} nodig voor ${group.map(name).join(', ')}`)||change;
   }
   for(const rule of p.clues.filter(c=>c.type==='objectCount')){
    const cells=new Set(furnitureCells(p,rule.types));
    const certain=domains.map((d,i)=>d.every(c=>cells.has(c))?i:-1).filter(i=>i>=0),possible=domains.map((d,i)=>d.some(c=>cells.has(c))?i:-1).filter(i=>i>=0);
    if(certain.length>rule.count||possible.length<rule.count)throw Error('Contradictory furniture count');
    if(certain.length===rule.count)for(let i=0;i<n;i++)if(!certain.includes(i))change=remove(i,c=>cells.has(c),`“${rule.text}” De ${rule.count} plekken zijn al nodig voor ${certain.map(name).join(', ')}`)||change;
    if(possible.length===rule.count)for(const i of possible)change=remove(i,c=>!cells.has(c),`“${rule.text}” Alleen ${possible.map(name).join(', ')} kunnen nog op deze voorwerpen staan` )||change;
   }
   const v=p.victim;
   change=remove(v,c=>{
    const r=region(p,c),others=domains.map((_,i)=>i).filter(i=>i!==v);
    const sure=others.filter(i=>domains[i].length&&domains[i].every(d=>region(p,d)===r));
    const possible=others.filter(i=>domains[i].some(d=>region(p,d)===r));
    return sure.length>1||possible.length<1;
   },`${name(v)} moet het gebied met precies één andere persoon delen`)||change;
   const victimAreas=new Set(domains[v].map(c=>region(p,c)));
   if(victimAreas.size===1){
    const r=[...victimAreas][0],others=domains.map((_,i)=>i).filter(i=>i!==v);
    const sure=others.filter(i=>domains[i].length&&domains[i].every(d=>region(p,d)===r));
    const possible=others.filter(i=>domains[i].some(d=>region(p,d)===r));
    if(sure.length===1)for(const i of others.filter(i=>i!==sure[0]))change=remove(i,c=>region(p,c)===r,`${name(v)} deelt ${p.areas[r]} al met ${name(sure[0])}; een derde persoon mag daar niet bij`)||change;
    if(possible.length===1)change=remove(possible[0],c=>region(p,c)!==r,`alleen ${name(possible[0])} kan nog bij ${name(v)} in ${p.areas[r]} staan`)||change;
   }
   if(domains.some(d=>!d.length))throw Error('Contradictory puzzle in explanation');
  }
 }
 while(Object.keys(positions).length<n){
  let who=domains.findIndex((d,i)=>positions[i]==null&&d.length===1);
  if(who<0){try{propagate();}catch(error){if(error!==found)throw error;}who=domains.findIndex((d,i)=>positions[i]==null&&d.length===1);}
  let searched=false,alternatives=[];
  if(who<0){
   searched=true;
   who=domains.map((d,i)=>({i,d})).filter(x=>positions[x.i]==null).sort((a,b)=>a.d.length-b.d.length)[0].i;
   alternatives=[...domains[who]];const possible=alternatives.filter(c=>solve(p,{...positions,[who]:c},1).length);
   if(possible.length!==1)throw Error('Puzzle has no unique explanation');
   const rejected=alternatives.filter(c=>c!==possible[0]);
   result.push(`Vergelijk de overgebleven mogelijkheden voor ${name(who)}: ${alternatives.map(spot).join('; ')}. Bij ${rejected.map(spot).join('; ')} bestaat geen volledige plaatsing die aan alle aanwijzingen, de eigen rijen en kolommen én de slachtofferregel voldoet. Na het nalopen van die combinaties blijft alleen ${spot(possible[0])} over.`);
   domains[who]=possible;
  }
  const cell=domains[who][0];positions[who]=cell;
  const why=[...reasons[who]];
  deductions.push({who,cell,reasons:why,searched,alternatives});
  result.push(`${name(who)} staat in ${spot(cell)} (${p.areas[region(p,cell)]}). ${why.length?`Reden: ${why.join('; ')}. Daarmee blijft dit vakje over.`:'Dit is het enige overgebleven vakje na de eerdere uitsluitingen.'}`);
  if(deductions.length>=(options.maxPlacements||Infinity))return {steps:result,positions,deductions};
 }
 const killer=Object.keys(positions).find(i=>+i!==p.victim&&region(p,positions[i])===region(p,positions[p.victim]));
 result.push(`${name(p.victim)} en ${name(killer)} zijn de enige twee personen in ${p.areas[region(p,positions[p.victim])]}. Het slachtoffer was alleen met de dader. Dus ${name(killer)} is de dader.`);
 return {steps:result,positions,killer:+killer,deductions};
}
