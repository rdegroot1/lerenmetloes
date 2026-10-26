import {personEntries} from './person-order.js?v=20261026-clean-pages';
import {surfaceFor,printFloorPlane} from './surfaces.js?v=20261026-clean-pages';
import {churchPrintSheet,introductionSheets,churchPageCount} from './print-layouts.js?v=20261026-clean-pages';
import {canStand,gridWidth,gridHeight,cellCount} from './engine.js?v=20261026-clean-pages';
import {portrait,mugshot,victimPortrait,objectArt,landmarkArt} from './art.js?v=20261026-clean-pages';
import {difficultyMarkup} from './difficulty.js?v=20261026-clean-pages';
// Tuck a compact ribbon into a lower corner of each room. Prefer empty cells;
// use the same stable anchors on screen and paper.
export function areaLabels(p){
 const width=gridWidth(p),height=gridHeight(p);
 return p.areas.map((name,area)=>{
  const runs=[];
  for(let row=0;row<height;row++)for(let col=0;col<width;){
   const bottom=c=>p.regions[c]===area&&(row===height-1||p.regions[c+width]!==area);
   if(!bottom(row*width+col)){col++;continue;}
   const start=col;while(col<width&&bottom(row*width+col))col++;
   const length=Math.min(col-start,Math.ceil(name.length/(['martini','winter'].includes(p.seriesId)?5:8)));
   const anchor=col-length,cells=Array.from({length},(_,i)=>row*width+anchor+i);
   const objects=cells.filter(c=>p.objects.some(o=>o.cell===c)).length;
   const given=cells.filter(c=>Object.values(p.givens||{}).includes(c)).length;
   const corner=col===width||p.regions[row*width+col]!==area;
   runs.push({name,area,row,col:anchor,length,cells,score:length*30-objects*20-given*100+(corner?10:0)+row});
  }
  return runs.sort((a,b)=>b.score-a.score||a.row-b.row)[0];
 });
}
export function boardMarkup(p,positions={},crosses=[],mini=false,notes={},selected=-1){
 const width=gridWidth(p),height=gridHeight(p);
 const labels=mini?[]:areaLabels(p);
 const band=new Set(labels.flatMap(label=>label.cells));
 return Array.from({length:cellCount(p)},(_,c)=>{
 const row=Math.floor(c/width),col=c%width;
 if(p.regions[c]<0)return `<span class="void-cell${p.mapBackdrop==='water'?' water-void':''}" aria-hidden="true"></span>`;
 const o=p.objects.find(o=>o.cell===c),who=Object.keys(positions).find(i=>positions[i]===c),area=p.regions[c];
 const shaped=p.regions.some(a=>a<0);
 const walls=(col<width-1&&area!==p.regions[c+1]||shaped&&col===width-1?' wall-right':'')+(row<height-1&&area!==p.regions[c+width]||shaped&&row===height-1?' wall-bottom':'')+(shaped&&(row===0||p.regions[c-width]<0)?' wall-top':'')+(shaped&&(col===0||p.regions[c-1]<0)?' wall-left':'');
 const given=who!=null&&p.givens?.[who]!=null;
 const candidates=notes[c]||[];
 const noteLabel=candidates.length?', concept: '+candidates.map(i=>p.people[i].name).join(', '):'';
 const label=`Rij ${row+1}, kolom ${col+1}, ${p.areas[area]}${o?', '+o.name+(o.occupiable?' (bezetbaar)':' (geblokkeerd)'):''}${who!=null?', '+p.people[who].name:crosses.includes(c)?', weggestreept':', leeg'}${noteLabel}`;
 const furniture=o?`<span class="object">${objectArt(o.type,o.part,o.tile)}</span>`:'';
 const mark=who!=null?`<span class="person-token" style="background:${p.people[who].color}">${p.people[who].name[0]}</span><span class="token-name">${p.people[who].name}${given?' •':''}</span>`:crosses.includes(c)?'<span class="crossed">×</span>':'';
 const content=mini?(o?`<i class="obstacle-dot${o.occupiable?' allowed-dot':''}"></i>`:''):furniture+mark+(o?.occupiable?'<span class="surface-mark" aria-hidden="true"></span>':'');
 return `<button type="button" class="cell area-${area}${surfaceFor(p,area)?' floor-'+surfaceFor(p,area):''}${walls}${given?' given':''}${band.has(c)?' name-band':''}${o?.occupiable?' surface-cell':''}${who!=null?' has-person':''}${o?.tile?' footprint-cell':''}"${p.areaColors?` style="--area:${p.areaColors[area]}"`:''} data-cell="${c}" aria-label="${label}" ${!canStand(p,c)||mini?'disabled':''}>${mini?'':`<span class="coord">${row+1}·${col+1}</span>`}${content}${!mini&&canStand(p,c)&&who==null&&candidates.length?`<span class="candidate-notes">${candidates.map(i=>`<span class="pencil ${i===selected?'chosen':''}" style="--pencil:${p.people[i].color}">${p.people[i].name[0]}</span>`).join('')}</span>`:''}</button>`;
 }).join('')+(mini?'':printFloorPlane(p))+labels.map(label=>`<span class="area-name area-name-${label.area}" aria-hidden="true" style="right:calc(${(width-label.col-label.length)/width*100}% + 4px);top:calc(${(label.row+1)/height*100}% - 4px);max-width:calc(${label.length/width*100}% - 8px)">${label.name}</span>`).join('');
}
export function legendMarkup(p){return p.areas.map((name,i)=>`<span><i class="area-${i}"${p.areaColors?` style="--area:${p.areaColors[i]};background-color:var(--area)"`:''}></i>${name}</span>`).join('');}
export function portraitMarkup(i,name,p){const face=p?.people[i]?.portraitIndex??i;return p?.victimWeapon&&i===p.victim?victimPortrait(face,name,p.victimWeapon):p?.portraitStyle==='mugshot'?mugshot(face,name,p.number,p.seriesId==='winter'?'GRUN · WINTERDIENST':p.seriesId==='martini'?'GRUN · MARTINI':'GRUN · NACHTDIENST'):portrait(face,name);}
export function objectLegend(p){
 const kinds=[...new Map(p.objects.map(o=>[o.type,o])).values()];
 return [true,false].map(allowed=>{const objects=kinds.filter(o=>(o.occupiable===true)===allowed);return objects.length?`<section class="object-legend-group"><strong>${allowed?'Hier kan iemand staan, zitten of liggen':'Deze voorwerpen blokkeren hun vakje'}</strong><div>${objects.map(o=>`<span>${objectArt(o.type)}<b>${o.name}</b></span>`).join('')}</div></section>`:'';}).join('');
}
export function printSheet(p){
 if(['church','festival'].includes(p.printLayout))return churchPrintSheet(p,{boardMarkup,legendMarkup,portraitMarkup});
 const given=p.givens||{};
 return `<article class="print-sheet${p.areas.length>4?' many-areas':''}${p.portraitStyle==='mugshot'?' mugshot-sheet':''}"><div class="print-head"><span>GRUNNDOKU · MOORDZAKEN IN STAD</span><span class="print-difficulty"><b>ZAAK ${p.number}</b>${difficultyMarkup(p)}<span>${p.size} × ${p.size}</span></span></div><div class="print-spread"><section class="print-clues"><h1>${p.number}. ${p.title}</h1><p class="print-story">${p.story}</p><div class="print-people">${personEntries(p).map(({person,i})=>`<div class="print-person">${portraitMarkup(i,person.name,p)}${p.portraitStyle==='mugshot'?`<div class="print-role">${person.role}</div>`:`<div class="ribbon">${person.name}</div>`}<div class="print-clue">${Object.hasOwn(given,i)?`Staat al op de kaart: rij ${Math.floor(given[i]/p.size)+1}, kolom ${given[i]%p.size+1}.`:''}${i===p.victim&&p.clues.some(c=>c.a===i)?'<strong class="victim-location-title">Plaatsaanwijzing</strong>':''}${p.clues.filter(c=>c.a===i).map(c=>`<p class="print-hint"><span class="paper-check"></span>${c.text}</p>`).join('')}${i===p.victim?`<strong>Het slachtoffer</strong><p>${p.victimLocationClue===false?'Was samen met de moordenaar.':'Spelregel: was alleen met de dader in hetzelfde gebied.'}</p>`:''}${!Object.hasOwn(given,i)&&!p.clues.some(c=>c.a===i)&&i!==p.victim?'<p>Combineer de andere aanwijzingen om mijn plek te vinden.</p>':''}</div></div>`).join('')}</div>${p.clues.some(c=>c.a==null)?`<div class="print-shared-clues"><strong>Extra aanwijzingen</strong>${p.clues.filter(c=>c.a==null).map(c=>`<p class="print-hint"><span class="paper-check"></span>${c.text}</p>`).join('')}</div>`:''}</section><section class="print-map"><div class="map-label"><span>PLAATS DELICT · SCHEMATISCHE KAART</span><span>NOORD ↑</span></div><div class="board${p.regions.some(a=>a<0)?' shaped':''}" style="--size:${p.size}">${boardMarkup(p,given)}</div><div class="print-bottom"><div><span class="eyebrow">KLADROOSTER</span><div class="mini-board${p.regions.some(a=>a<0)?' shaped':''}" style="--size:${p.size}">${boardMarkup(p,{},[],true)}</div></div><div class="print-answer">${landmarkArt()}<p>De dader is:</p><div class="answer-line"></div><small>Initialen: ${personEntries(p).map(({person:x})=>`${x.name[0]} = ${x.name}`).join(' · ')}</small></div></div></section></div></article>`;
}
export const printPageCount=(puzzles,{intro=puzzles.length>1}={})=>(intro?2:0)+puzzles.reduce((n,p)=>n+(['church','festival'].includes(p.printLayout)?churchPageCount(p):1),0);
export function printPuzzles(puzzles,{intro=puzzles.length>1}={}){document.getElementById('printPages').innerHTML=(intro?introductionSheets({boardMarkup,legendMarkup,portraitMarkup},{church:puzzles.every(p=>p.seriesId==='martini'),tower:puzzles.every(p=>p.setting==='tower'),winter:puzzles.every(p=>p.seriesId==='winter')}):'')+puzzles.map(printSheet).join('');window.print();}
