import {canStand} from './engine.js?v=20261026-witness-clues';
import {portrait,mugshot,objectArt,landmarkArt} from './art.js?v=20261026-witness-clues';
// Tuck a compact ribbon into a lower corner of each room. Prefer empty cells;
// use the same stable anchors on screen and paper.
export function areaLabels(p){
 return p.areas.map((name,area)=>{
  const runs=[];
  for(let row=0;row<p.size;row++)for(let col=0;col<p.size;){
   const bottom=c=>p.regions[c]===area&&(row===p.size-1||p.regions[c+p.size]!==area);
   if(!bottom(row*p.size+col)){col++;continue;}
   const start=col;while(col<p.size&&bottom(row*p.size+col))col++;
   const length=Math.min(col-start,Math.ceil(name.length/8));
   const anchor=col-length,cells=Array.from({length},(_,i)=>row*p.size+anchor+i);
   const objects=cells.filter(c=>p.objects.some(o=>o.cell===c)).length;
   const given=cells.filter(c=>Object.values(p.givens||{}).includes(c)).length;
   const corner=col===p.size||p.regions[row*p.size+col]!==area;
   runs.push({name,area,row,col:anchor,length,cells,score:length*30-objects*20-given*100+(corner?10:0)+row});
  }
  return runs.sort((a,b)=>b.score-a.score||a.row-b.row)[0];
 });
}
export function boardMarkup(p,positions={},crosses=[],mini=false,notes={},selected=-1){
 const labels=mini?[]:areaLabels(p);
 const band=new Set(labels.flatMap(label=>label.cells));
 return Array.from({length:p.size*p.size},(_,c)=>{
 const row=Math.floor(c/p.size),col=c%p.size;
 if(p.regions[c]<0)return `<span class="void-cell" aria-hidden="true"></span>`;
 const o=p.objects.find(o=>o.cell===c),who=Object.keys(positions).find(i=>positions[i]===c),area=p.regions[c];
 const shaped=p.regions.some(a=>a<0);
 const walls=(col<p.size-1&&area!==p.regions[c+1]||shaped&&col===p.size-1?' wall-right':'')+(row<p.size-1&&area!==p.regions[c+p.size]||shaped&&row===p.size-1?' wall-bottom':'')+(shaped&&(row===0||p.regions[c-p.size]<0)?' wall-top':'')+(shaped&&(col===0||p.regions[c-1]<0)?' wall-left':'');
 const given=who!=null&&p.givens?.[who]!=null;
 const candidates=notes[c]||[];
 const noteLabel=candidates.length?', concept: '+candidates.map(i=>p.people[i].name).join(', '):'';
 const label=`Rij ${row+1}, kolom ${col+1}, ${p.areas[area]}${o?', '+o.name+(o.occupiable?' (bezetbaar)':' (geblokkeerd)'):''}${who!=null?', '+p.people[who].name:crosses.includes(c)?', weggestreept':', leeg'}${noteLabel}`;
 const furniture=o?`<span class="object">${objectArt(o.type,o.part,o.tile)}</span>`:'';
 const mark=who!=null?`<span class="person-token" style="background:${p.people[who].color}">${p.people[who].name[0]}</span><span class="token-name">${p.people[who].name}${given?' •':''}</span>`:crosses.includes(c)?'<span class="crossed">×</span>':'';
 const content=mini?(o?`<i class="obstacle-dot${o.occupiable?' allowed-dot':''}"></i>`:''):furniture+mark+(o?.occupiable?'<span class="surface-mark" aria-hidden="true"></span>':'');
 return `<button type="button" class="cell area-${area}${walls}${given?' given':''}${band.has(c)?' name-band':''}${o?.occupiable?' surface-cell':''}${who!=null?' has-person':''}${o?.tile?' footprint-cell':''}" data-cell="${c}" aria-label="${label}" ${!canStand(p,c)||mini?'disabled':''}>${mini?'':`<span class="coord">${row+1}·${col+1}</span>`}${content}${!mini&&canStand(p,c)&&who==null&&candidates.length?`<span class="candidate-notes">${candidates.map(i=>`<span class="pencil ${i===selected?'chosen':''}" style="--pencil:${p.people[i].color}">${p.people[i].name[0]}</span>`).join('')}</span>`:''}</button>`;
 }).join('')+labels.map(label=>`<span class="area-name area-name-${label.area}" aria-hidden="true" style="right:calc(${(p.size-label.col-label.length)/p.size*100}% + 4px);top:calc(${(label.row+1)/p.size*100}% - 4px);max-width:calc(${label.length/p.size*100}% - 8px)">${label.name}</span>`).join('');
}
export function legendMarkup(p){return p.areas.map((name,i)=>`<span><i class="area-${i}"></i>${name}</span>`).join('');}
export function portraitMarkup(i,name,p){return p?.portraitStyle==='mugshot'?mugshot(i,name,p.number):portrait(i,name);}
export function objectLegend(p){
 const kinds=[...new Map(p.objects.map(o=>[o.type,o])).values()];
 return [true,false].map(allowed=>{const objects=kinds.filter(o=>(o.occupiable===true)===allowed);return objects.length?`<section class="object-legend-group"><strong>${allowed?'Hier kan iemand staan, zitten of liggen':'Deze voorwerpen blokkeren hun vakje'}</strong><div>${objects.map(o=>`<span>${objectArt(o.type)}<b>${o.name}</b></span>`).join('')}</div></section>`:'';}).join('');
}
export function printSheet(p){
 const given=p.givens||{};
 return `<article class="print-sheet${p.areas.length>4?' many-areas':''}${p.portraitStyle==='mugshot'?' mugshot-sheet':''}"><div class="print-head"><span>GRUNMURDOKU · MOORDZAKEN IN STAD</span><span>ZAAK ${p.number} · ${p.level} · ${p.size} × ${p.size}</span></div><div class="print-spread"><section class="print-clues"><h1>${p.number}. ${p.title}</h1><p class="print-story">${p.story}</p><div class="print-people">${p.people.map((person,i)=>`<div class="print-person">${portraitMarkup(i,person.name,p)}<div class="ribbon">${person.name}</div><div class="print-clue">${Object.hasOwn(given,i)?`Staat al op de kaart: rij ${Math.floor(given[i]/p.size)+1}, kolom ${given[i]%p.size+1}.`:''}${i===p.victim&&p.clues.some(c=>c.a===i)?'<strong class="victim-location-title">Plaatsaanwijzing</strong>':''}${p.clues.filter(c=>c.a===i).map(c=>`<p class="print-hint"><span class="paper-check"></span>${c.text}</p>`).join('')}${i===p.victim?`<strong>Het slachtoffer</strong><p>${p.victimLocationClue===false?'Was samen met de moordenaar.':'Spelregel: was alleen met de dader in hetzelfde gebied.'}</p>`:''}${!Object.hasOwn(given,i)&&!p.clues.some(c=>c.a===i)&&i!==p.victim?'<p>Combineer de andere aanwijzingen om mijn plek te vinden.</p>':''}</div></div>`).join('')}</div>${p.clues.some(c=>c.a==null)?`<div class="print-shared-clues"><strong>Extra aanwijzingen</strong>${p.clues.filter(c=>c.a==null).map(c=>`<p class="print-hint"><span class="paper-check"></span>${c.text}</p>`).join('')}</div>`:''}<div class="print-rules"><strong>De spelregels</strong> · Iedereen in een andere rij én kolom. ${p.furnitureRulesVersion?'Groen gemarkeerde meubels zijn bezetbaar; overige voorwerpen blokkeren hun vakje. Aantallen tellen iedereen mee, ook het slachtoffer.':'Voorwerpen blokkeren hun vakje.'} ‘Naast’ is direct boven, onder, links of rechts, binnen hetzelfde gebied. ‘Hoger’ en ‘links’ vergelijken rijen of kolommen. Het slachtoffer deelt een gebied met precies één persoon: de dader.</div></section><section class="print-map"><div class="map-label"><span>PLAATS DELICT · SCHEMATISCHE KAART</span><span>NOORD ↑</span></div><div class="board${p.regions.some(a=>a<0)?' shaped':''}" style="--size:${p.size}">${boardMarkup(p,given)}</div><div class="legend">${legendMarkup(p)}</div><div class="print-bottom"><div><span class="eyebrow">KLADROOSTER</span><div class="mini-board${p.regions.some(a=>a<0)?' shaped':''}" style="--size:${p.size}">${boardMarkup(p,{},[],true)}</div></div><div class="print-answer">${landmarkArt()}<p>De dader is:</p><div class="answer-line"></div><small>Initialen: ${p.people.map(x=>`${x.name[0]} = ${x.name}`).join(' · ')}</small></div></div></section></div></article>`;
}
export function printPuzzles(puzzles){document.getElementById('printPages').innerHTML=puzzles.map(printSheet).join('');window.print();}
