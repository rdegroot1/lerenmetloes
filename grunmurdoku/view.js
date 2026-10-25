import {portrait,objectArt,landmarkArt} from './art.js?v=20261026-festivals-notes';
// Place each name in a long contiguous strip of its own district. Keep object
// and given cells free where possible; identical anchors are used on paper.
export function areaLabels(p){
 return p.areas.map((name,area)=>{
  const runs=[];
  for(let row=0;row<p.size;row++)for(let col=0;col<p.size;){
   if(p.regions[row*p.size+col]!==area){col++;continue;}
   const start=col;while(col<p.size&&p.regions[row*p.size+col]===area)col++;
   const cells=Array.from({length:col-start},(_,i)=>row*p.size+start+i);
   const blocked=cells.filter(c=>p.objects.some(o=>o.cell===c)||Object.values(p.givens||{}).includes(c)).length;
   const boundary=cells.every(c=>row===p.size-1||p.regions[c+p.size]!==area);
   runs.push({name,area,row,col:start,length:cells.length,cells,score:cells.length*12-blocked*7+(boundary?4:0)});
  }
  return runs.sort((a,b)=>b.score-a.score||a.row-b.row)[0];
 });
}
export function boardMarkup(p,positions={},crosses=[],mini=false,notes={},selected=-1){
 const labels=mini?[]:areaLabels(p);
 const band=new Set(labels.flatMap(label=>label.cells));
 return Array.from({length:p.size*p.size},(_,c)=>{
 const row=Math.floor(c/p.size),col=c%p.size,o=p.objects.find(o=>o.cell===c),who=Object.keys(positions).find(i=>positions[i]===c),area=p.regions[c];
 const walls=(col<p.size-1&&area!==p.regions[c+1]?' wall-right':'')+(row<p.size-1&&area!==p.regions[c+p.size]?' wall-bottom':'');
 const given=who!=null&&p.givens?.[who]!=null;
 const candidates=notes[c]||[];
 const noteLabel=candidates.length?', concept: '+candidates.map(i=>p.people[i].name).join(', '):'';
 const label=`Rij ${row+1}, kolom ${col+1}, ${p.areas[area]}${o?', '+o.name:who!=null?', '+p.people[who].name:crosses.includes(c)?', weggestreept':', leeg'}${noteLabel}`;
 const content=mini?(o?'<i class="obstacle-dot"></i>':''):(o?`<span class="object">${objectArt(o.type)}</span>`:who!=null?`<span class="person-token" style="background:${p.people[who].color}">${p.people[who].name[0]}</span><span class="token-name">${p.people[who].name}${given?' •':''}</span>`:crosses.includes(c)?'<span class="crossed">×</span>':'');
 return `<button type="button" class="cell area-${area}${walls}${given?' given':''}${band.has(c)?' name-band':''}" data-cell="${c}" aria-label="${label}" ${o||mini?'disabled':''}>${mini?'':`<span class="coord">${row+1}·${col+1}</span>`}${content}${!mini&&!o&&who==null&&candidates.length?`<span class="candidate-notes">${candidates.map(i=>`<span class="pencil ${i===selected?'chosen':''}" style="--pencil:${p.people[i].color}">${p.people[i].name[0]}</span>`).join('')}</span>`:''}</button>`;
 }).join('')+labels.map(label=>`<span class="area-name area-name-${label.area}" aria-hidden="true" style="left:${label.col/p.size*100}%;top:${(label.row+1)/p.size*100}%;width:${label.length/p.size*100}%">${label.name}</span>`).join('');
}
export function legendMarkup(p){return p.areas.map((name,i)=>`<span><i class="area-${i}"></i>${name}</span>`).join('');}
export function portraitMarkup(i){return portrait(i);}
export function objectLegend(p){return [...new Map(p.objects.map(o=>[o.type,o])).values()].map(o=>`<span>${objectArt(o.type)}<b>${o.name}</b></span>`).join('');}
export function printSheet(p){
 const given=p.givens||{};
 return `<article class="print-sheet${p.areas.length>4?' many-areas':''}"><div class="print-head"><span>GRUNMURDOKU · MOORDZAKEN IN STAD</span><span>ZAAK ${p.number} · ${p.level} · ${p.size} × ${p.size}</span></div><div class="print-spread"><section class="print-clues"><h1>${p.number}. ${p.title}</h1><p class="print-story">${p.story}</p><div class="print-people">${p.people.map((person,i)=>`<div class="print-person">${portrait(i)}<div class="ribbon">${person.name}</div><div class="print-clue">${Object.hasOwn(given,i)?`Staat al op de kaart: rij ${Math.floor(given[i]/p.size)+1}, kolom ${given[i]%p.size+1}.`:''}${i===p.victim?'<strong class="victim-location-title">Plaatsaanwijzing</strong>':''}${p.clues.filter(c=>c.a===i).map(c=>`<p>${c.text}</p>`).join('')}${i===p.victim?'<strong>Het slachtoffer</strong><p>Spelregel: was alleen met de dader in hetzelfde gebied.</p>':''}${!Object.hasOwn(given,i)&&!p.clues.some(c=>c.a===i)&&i!==p.victim?'<p>Combineer de andere aanwijzingen om mijn plek te vinden.</p>':''}</div></div>`).join('')}</div><div class="print-rules"><strong>De spelregels</strong> · Iedereen in een andere rij én kolom. Voorwerpen blokkeren hun vakje. ‘Naast’ is direct boven, onder, links of rechts, binnen hetzelfde gebied. ‘Hoger’ en ‘links’ vergelijken rijen of kolommen. Het slachtoffer deelt een gebied met precies één persoon: de dader.</div></section><section class="print-map"><div class="map-label"><span>PLAATS DELICT · SCHEMATISCHE KAART</span><span>NOORD ↑</span></div><div class="board" style="--size:${p.size}">${boardMarkup(p,given)}</div><div class="legend">${legendMarkup(p)}</div><div class="print-bottom"><div><span class="eyebrow">KLADROOSTER</span><div class="mini-board" style="--size:${p.size}">${boardMarkup(p,{},[],true)}</div></div><div class="print-answer">${landmarkArt()}<p>De dader is:</p><div class="answer-line"></div><small>Initialen: ${p.people.map(x=>`${x.name[0]} = ${x.name}`).join(' · ')}</small></div></div></section></div></article>`;
}
export function printPuzzles(puzzles){document.getElementById('printPages').innerHTML=puzzles.map(printSheet).join('');window.print();}
