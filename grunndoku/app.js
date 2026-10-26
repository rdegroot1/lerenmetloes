import {solve,valid,region,isPlayable,canStand,gridWidth,gridHeight} from './engine.js?v=20261026-martini';
import {boardMarkup,legendMarkup,portraitMarkup,objectLegend,printPuzzles,printPageCount} from './view.js?v=20261026-martini';
import {landmarkArt} from './art.js?v=20261026-martini';
import {explain} from './explain.js?v=20261026-martini';
import {confirmPlacement,restorePencilNotes,sanitizeBackups} from './notes.js?v=20261026-martini';
import {difficultyMarkup,difficultyText} from './difficulty.js?v=20261026-martini';
const $=id=>document.getElementById(id);
const DATA_VERSION='20261026-martini';
let puzzles;
try{const response=await fetch(`./puzzles.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error(response.status);puzzles=await response.json();}catch(e){$('message').textContent='De dossiers konden niet worden geladen. Open de app via een webserver en probeer opnieuw.';throw e;}
const mainCount=puzzles.length;
const seriesCases=()=>puzzles.slice(0,mainCount).filter(q=>(q.seriesId||'stad')===(p.seriesId||'stad'));
const seriesIndices=()=>seriesCases().map(q=>puzzles.indexOf(q));
let index=0,p,state,selected=0,mode='place',history=[],zoom=1;
// Keep the original storage namespace so existing browser progress survives the rename.
const key=p=>'grunmurdoku:v1:'+p.id;
function load(i){
 index=i;p=puzzles[i];history=[];zoom=1;selected=0;mode='place';
 const defaults={positions:{...p.givens},crosses:[],notes:{},noteBackups:{},checked:[],solved:false};state=defaults;
 try{
  const saved=JSON.parse(localStorage.getItem(key(p)));
  if(saved&&typeof saved.positions==='object'&&Array.isArray(saved.crosses)&&Array.isArray(saved.checked)){
   const positions=Object.fromEntries(Object.entries(saved.positions).filter(([who,cell])=>/^\d+$/.test(who)&&+who<p.people.length&&canStand(p,cell)));
   const notes=Object.fromEntries(Object.entries(saved.notes||{}).filter(([c,ids])=>canStand(p,+c)&&Array.isArray(ids)).map(([c,ids])=>[c,[...new Set(ids.filter(who=>Number.isInteger(who)&&who>=0&&who<p.people.length&&!Object.hasOwn(p.givens||{},who)))]]));
   state={...defaults,...saved,positions:{...positions,...p.givens},notes,noteBackups:sanitizeBackups(p,saved.noteBackups),checked:(saved.clueVersion||1)===(p.clueVersion||1)?saved.checked:[]};
   state.solved=Boolean(saved.solved)&&Object.keys(state.positions).length===p.people.length&&valid(p,state.positions,true);
  }
 }catch{}
 selected=p.people.findIndex((_,who)=>!Object.hasOwn(p.givens||{},who));$('caseSelect').value=String(i);render();
 say(Object.keys(p.givens||{}).length?`${Object.keys(p.givens).length} personen staan al vast. Kies de volgende persoon: één klik is concept, nogmaals is definitief.`:'Kies een persoon. Eén klik is een concept in het hoekje; klik nogmaals om definitief te plaatsen, en een derde keer om de eerdere aantekeningen terug te zetten.');
}
function persist(){state.clueVersion=p.clueVersion||1;try{localStorage.setItem(key(p),JSON.stringify(state));}catch{say('Opslaan is niet beschikbaar in deze browser. Je kunt wel verder spelen.');}}
function snapshot(){history.push(JSON.stringify(state));if(history.length>100)history.shift();}
function say(text){$('message').textContent=text;}
function clueLabel(clue,j){
 const label=document.createElement('label');label.className='clue';const input=document.createElement('input');input.type='checkbox';input.checked=state.checked.includes(j);
 input.onchange=()=>{snapshot();state.checked=input.checked?[...state.checked,j]:state.checked.filter(x=>x!==j);persist();};
 const text=document.createElement('span');text.textContent=clue.text;label.append(input,text);return label;
}
function render(){
 const church=p.seriesId==='martini',width=gridWidth(p),height=gridHeight(p);
 document.querySelector('.book').classList.toggle('series-martini',church);
 (church?$('martiniHeader'):document.querySelector('.clue-page')).prepend($('caseHeader'));
 $('martiniHeader').hidden=!church;$('mapNavigation').hidden=!church;
 $('mapNote').hidden=!church;$('mapNote').textContent=p.mapNote||'';
 $('shapeNote').textContent=p.rulesNote||'Iedereen heeft een eigen rij én kolom.';
 for(const id of ['board','miniBoard']){$(id).style.setProperty('--columns',width);$(id).style.setProperty('--rows',height);}
 $('board').style.setProperty('--map-min',`${width*36*zoom}px`);
 $('zoomValue').textContent=`${Math.round(zoom*100)}%`;
 $('quickPerson').innerHTML=p.people.map((person,i)=>`<option value="${i}" ${i===selected?'selected':''} ${Object.hasOwn(p.givens||{},i)?'disabled':''}>${person.name}${state.positions[i]!=null?' ✓':''}</option>`).join('');
 $('caseNo').textContent=`ZAAK ${String(p.number).padStart(2,'0')} / ${p.theme||'STAD'}`;$('caseTitle').textContent=p.title;$('story').textContent=p.story;
 const count=Object.keys(state.positions).length;$('count').textContent=`${count} / ${p.people.length} geplaatst`;$('progress').textContent=state.solved?'Zaak opgelost':`${count} van ${p.people.length} alibi’s op de kaart`;
 $('board').classList.toggle('shaped',p.regions.some(a=>a<0));$('miniBoard').classList.toggle('shaped',p.regions.some(a=>a<0));document.querySelector('.book').classList.toggle('series-mugshot',p.portraitStyle==='mugshot');
 $('board').style.setProperty('--size',p.size);$('board').innerHTML=boardMarkup(p,state.positions,state.crosses,false,state.notes,selected);
 $('board').querySelectorAll('[data-cell]').forEach(cell=>cell.onclick=()=>tap(+cell.dataset.cell));
 $('legend').innerHTML=legendMarkup(p);$('objectLegend').innerHTML=objectLegend(p);
 $('miniBoard').style.setProperty('--size',p.size);$('miniBoard').innerHTML=boardMarkup(p,{},[],true);
 $('level').innerHTML=difficultyMarkup(p)+`<span class="difficulty-size">${width} × ${height}</span>`;
 $('lesson').textContent=church?`${p.people.length} personen · ${p.lesson||'Combineer de aanwijzingen en ontdek de dader.'}`:p.lesson?`${p.number}. ${p.lesson}${p.number===1?' — vul alleen de twee ontbrekende personen in.':p.number===2?' — nu helemaal zonder startposities.':p.number===3?' — let ook op bankjes en de plekken in het groen.':p.number===4?' — combineer gebiedsranden, rijen en kolommen.':' — combineer de gebieden met de andere aanwijzingen.'}`:'Een eerdere zaak uit je archief.';
 $('nextCase').hidden=!state.solved||seriesIndices().at(-1)===index;
 $('printAll').textContent=`Print deze serie (${printPageCount(seriesCases())} A4)`;
 for(const [id,series]of [['classicSeries','stad'],['nightSeries','nacht'],['martiniSeries','martini']])$(id).setAttribute('aria-pressed',String((p.seriesId||'stad')===series));
 $('caseTrail').innerHTML=seriesCases().map(q=>{const i=puzzles.indexOf(q);return `<button class="${index===i?'current':''}" data-case="${i}" aria-label="Zaak ${q.number}: ${difficultyText(q)}" ${index===i?'aria-current="step"':''}><b>${q.number}</b><span>${q.theme||difficultyText(q)}</span></button>`;}).join('');
 $('caseTrail').querySelectorAll('button').forEach(b=>b.onclick=()=>load(+b.dataset.case));
 $('people').replaceChildren();
 p.people.forEach((person,i)=>{
  const card=document.createElement('div');card.className='person-card'+(selected===i?' selected':'')+(i===p.victim?' is-victim':'');const head=document.createElement('button');head.className='person-header';head.setAttribute('aria-pressed',String(selected===i));head.setAttribute('aria-label',`${person.name}, ${person.role}${i===p.victim?', slachtoffer':''}`);
  const pos=state.positions[i];head.innerHTML=`<span class="avatar">${portraitMarkup(i,person.name,p)}</span><div class="portrait-caption">${p.portraitStyle==='mugshot'?'':`<strong>${person.name}</strong>`}${i===p.victim?'<span class="victim-tag">SLACHTOFFER</span>':''}<small>${person.role}</small></div><span class="placed">${pos==null?'○':`R${Math.floor(pos/p.size)+1} · K${pos%p.size+1}`}</span>`;
  head.onclick=()=>{if(Object.hasOwn(p.givens||{},i)){say(`${person.name} is een vaste startpositie.`);return;}selected=i;mode='place';render();say(`${person.name} geselecteerd. Eén klik maakt een concept; nogmaals maakt het definitief, een derde klik zet de eerdere aantekeningen terug.`);};card.append(head);
  if(i===p.victim&&p.clues.some(c=>c.a===i)){const heading=document.createElement('p');heading.className='victim-location-title';heading.textContent='Plaatsaanwijzing';card.append(heading);}
  p.clues.forEach((clue,j)=>{if(clue.a===i)card.append(clueLabel(clue,j));});
  if(Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue given-clue';info.textContent='Staat al op de kaart. Deze plek staat vast.';card.append(info);}
  if(!p.clues.some(c=>c.a===i)&&i!==p.victim&&!Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue';info.textContent='Gebruik de andere aanwijzingen om mijn plek te vinden.';card.append(info);}
  if(i===p.victim){const text=document.createElement('p');text.className='victim-rule';text.textContent=p.victimLocationClue===false?'Was samen met de moordenaar.':'Spelregel: was alleen met de dader in hetzelfde gebied.';card.append(text);}$('people').append(card);
 });
 const extras=$('extraClues');extras.replaceChildren();extras.hidden=!p.clues.some(c=>c.a==null);if(!extras.hidden){const title=document.createElement('h3');title.textContent='Extra aanwijzingen';extras.append(title);p.clues.forEach((clue,j)=>{if(clue.a==null)extras.append(clueLabel(clue,j));});}
 for(const m of ['place','cross','erase']){$(m).classList.toggle('active',mode===m);$(m).setAttribute('aria-pressed',String(mode===m));}$('undo').disabled=!history.length;
}
function tap(c){
 if(!canStand(p,c))return;
 const who=Object.keys(state.positions).find(i=>state.positions[i]===c);
 if(who!=null&&Object.hasOwn(p.givens||{},who)){say('Dit is een vaste startpositie. Deze persoon blijft hier staan.');return;}
 if(mode==='erase'){snapshot();if(who!=null){delete state.positions[who];if(state.noteBackups)delete state.noteBackups[who];}state.crosses=state.crosses.filter(x=>x!==c);delete state.notes[c];state.solved=false;}
 else if(mode==='cross'){if(who!=null){say('Wis eerst de persoon uit dit vakje.');return;}snapshot();state.crosses=state.crosses.includes(c)?state.crosses.filter(x=>x!==c):[...state.crosses,c];delete state.notes[c];}
 else{
  if(who!=null){if(+who===selected){snapshot();restorePencilNotes(state,p,+who);persist();render();say(`${p.people[who].name} is weer concept. De eerdere aantekeningen zijn terug.`);return;}selected=+who;render();say(`${p.people[who].name} geselecteerd. Klik nogmaals om de eerdere conceptaantekeningen terug te zetten, of noteer een andere plek.`);return;}
  if(!(state.notes[c]||[]).includes(selected)){snapshot();state.notes[c]=[...(state.notes[c]||[]),selected];state.crosses=state.crosses.filter(x=>x!==c);persist();render();say(`${p.people[selected].name} staat als concept in het hoekje. Klik met deze persoon geselecteerd nogmaals op dit vakje om definitief te plaatsen.`);return;}
  const clash=Object.entries(state.positions).find(([i,x])=>+i!==selected&&(Math.floor(x/p.size)===Math.floor(c/p.size)||x%p.size===c%p.size));
  if(clash){say(`${p.people[clash[0]].name} staat al in deze rij of kolom. Iedereen krijgt een eigen rij én kolom.`);return;}
  snapshot();confirmPlacement(state,selected,c);
 }
 persist();render();say(mode==='place'?`${p.people[selected].name} definitief geplaatst. Controleer de aanwijzingen of kies de volgende persoon.`:'Notitie bijgewerkt.');
}
$('printAll').textContent=`Print de reeks (${mainCount} A4)`;
$('caseSelect').innerHTML=['stad','nacht','martini'].map(series=>`<optgroup label="${series==='martini'?'Moord in de Martini':series==='nacht'?'Nacht in Stad':'Stadse speurtochten'}">${puzzles.map((q,i)=>(q.seriesId||'stad')===series?`<option value="${i}">${String(q.number).padStart(2,'0')} · ${difficultyText(q)} · ${q.theme||'Stad'} — ${q.title}</option>`:'').join('')}</optgroup>`).join('');$('caseSelect').onchange=e=>load(+e.target.value);
for(const m of ['place','cross','erase'])$(m).onclick=()=>{mode=m;render();say(m==='cross'?'Tik op vakjes die je wilt wegstrepen. Deze notities tellen niet mee als plaatsing.':m==='erase'?'Tik op een concept, persoon of kruisje om te wissen.':'Eén klik noteert een concept in het hoekje, nogmaals op dat vakje plaatst de persoon definitief.');};
$('undo').onclick=()=>{if(history.length){state=JSON.parse(history.pop());persist();render();say('Laatste wijziging teruggedraaid.');}};
$('reset').onclick=()=>{snapshot();state={positions:{...p.givens},crosses:[],notes:{},noteBackups:{},checked:[],solved:false};persist();render();say('Een schone kaart. Je kunt dit nog terugdraaien met Terug.');};
$('check').onclick=()=>{
 const complete=Object.keys(state.positions).length===p.people.length;
 if(!valid(p,state.positions,complete)||!solve(p,state.positions,1).length){say('Er klopt nog iets niet. De geplaatste personen passen niet bij alle aanwijzingen. Met Wissen kun je een plaatsing verwijderen.');return;}
 say(complete?'Alle alibi’s kloppen. Wie deelt het gebied met het slachtoffer? Wijs de dader aan.':'Je plaatsingen passen bij een oplossing. Ga verder met de overige personen.');
};
$('hint').onclick=()=>{
 const solutions=solve(p,state.positions,1);if(!solutions.length){say('Deze plaatsingen kunnen niet samen kloppen. Wis een plaatsing of gebruik Terug en controleer de aanwijzingen.');return;}
 const who=state.positions[selected]==null?selected:p.people.findIndex((_,i)=>state.positions[i]==null);if(who<0){say('De kaart klopt. De dader is de enige andere persoon in het gebied van het slachtoffer.');return;}
 snapshot();confirmPlacement(state,who,solutions[0][who]);selected=who;persist();render();say(`Zetje: ${p.people[who].name} staat in rij ${Math.floor(solutions[0][who]/p.size)+1}, kolom ${solutions[0][who]%p.size+1}. Deze plaatsing kun je terugdraaien.`);
};
$('explanation').onclick=()=>{const explanation=explain(p);$('explanationTitle').textContent=p.title+' — stap voor stap';$('explanationSteps').replaceChildren(...explanation.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));$('explanationDialog').showModal();};
$('landmarks').innerHTML=landmarkArt();
$('printCase').onclick=()=>printPuzzles([p]);
$('printAll').onclick=()=>printPuzzles(seriesCases());
$('quickPerson').onchange=e=>{const who=+e.target.value;if(Object.hasOwn(p.givens||{},who)){say(`${p.people[who].name} is een vaste startpositie.`);return;}selected=who;mode='place';render();say(`${p.people[selected].name} geselecteerd.`);};
$('zoomIn').onclick=()=>{zoom=Math.min(2,zoom+.25);render();};
$('zoomOut').onclick=()=>{zoom=Math.max(.75,zoom-.25);render();};
$('martiniSeries').onclick=()=>load(puzzles.findIndex(q=>q.seriesId==='martini'));
$('classicSeries').onclick=()=>load(0);
$('nightSeries').onclick=()=>load(puzzles.findIndex(q=>q.seriesId==='nacht'));
$('nextCase').onclick=()=>{const cases=seriesIndices(),next=cases[cases.indexOf(index)+1];if(next!=null)load(next);};
$('oldCases').onclick=async()=>{try{if(puzzles.length===mainCount){const response=await fetch(`./puzzles-archive.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error('laden mislukt');const archive=await response.json();puzzles.push(...archive);const group=document.createElement('optgroup');group.label='Eerdere zaken — je oude voortgang';archive.forEach((q,i)=>{const option=document.createElement('option');option.value=String(i+mainCount);option.textContent=q.title;group.append(option);});$('caseSelect').append(group);}load(mainCount);}catch{say('Het archief kon niet worden geladen. Probeer het later nog eens.');}};
for(const id of ['rules','boardRules'])$(id).onclick=()=>$('rulesDialog').showModal();document.querySelectorAll('dialog .close, .close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('accuse').onclick=()=>{
 if(Object.keys(state.positions).length!==p.people.length||!valid(p,state.positions,true)){say('Plaats eerst iedereen op de kaart en zorg dat alle aanwijzingen kloppen.');return;}
 $('verdict').textContent='';$('accusations').replaceChildren();p.people.forEach((person,i)=>{if(i===p.victim)return;const button=document.createElement('button');button.textContent=person.name;button.onclick=()=>{
  const correct=region(p,state.positions[i])===region(p,state.positions[p.victim]);
  if(correct){snapshot();state.solved=true;persist();render();$('verdict').textContent=`Zaak opgelost! ${person.name} was alleen met ${p.people[p.victim].name} op ${p.areas[region(p,state.positions[i])]}. Goed speurwerk, detective.`;say(`Zaak opgelost: ${person.name} is de dader.`);}else $('verdict').textContent=`${person.name} deelt geen gebied met het slachtoffer. Bekijk nog eens wie daar wél stond.`;
 };$('accusations').append(button);});$('accuseDialog').showModal();
};
const requestedSeries=new URLSearchParams(document.location.search).get('serie');
const initialIndex=puzzles.findIndex(q=>(q.seriesId||'stad')===requestedSeries);
load(initialIndex>=0?initialIndex:0);
