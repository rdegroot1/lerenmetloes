import {solve,valid,region} from './engine.js';
import {boardMarkup,legendMarkup,portraitMarkup,objectLegend,printPuzzles} from './view.js?v=20261026-arend';
import {landmarkArt} from './art.js?v=20261026-arend';
import {explain} from './explain.js';
import {confirmPlacement,restorePencilNotes,sanitizeBackups} from './notes.js';
const $=id=>document.getElementById(id);
const DATA_VERSION='20261026-festivals-notes';
let puzzles;
try{const response=await fetch(`./puzzles.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error(response.status);puzzles=await response.json();}catch(e){$('message').textContent='De dossiers konden niet worden geladen. Open de app via een webserver en probeer opnieuw.';throw e;}
const mainCount=puzzles.length;
let index=0,p,state,selected=0,mode='place',history=[];
const key=p=>'grunmurdoku:v1:'+p.id;
function load(i){index=i;p=puzzles[i];history=[];selected=0;mode='place';state={positions:{...p.givens},crosses:[],notes:{},noteBackups:{},checked:[],solved:false};try{const saved=JSON.parse(localStorage.getItem(key(p)));if(saved&&typeof saved.positions==='object'&&Array.isArray(saved.crosses)&&Array.isArray(saved.checked)){const entries=Object.entries(saved.positions);if(entries.every(([who,cell])=>/^\d+$/.test(who)&&+who<p.people.length&&Number.isInteger(cell)&&cell>=0&&cell<p.size*p.size&&!p.objects.some(o=>o.cell===cell))){state={...state,...saved,noteBackups:sanitizeBackups(p,saved.noteBackups),checked:(saved.clueVersion||1)===(p.clueVersion||1)?saved.checked:[],positions:{...saved.positions,...p.givens},notes:Object.fromEntries(Object.entries(saved.notes||{}).filter(([c,ids])=>Number.isInteger(+c)&&+c>=0&&+c<p.size*p.size&&!p.objects.some(o=>o.cell===+c)&&Array.isArray(ids)).map(([c,ids])=>[c,[...new Set(ids.filter(i=>Number.isInteger(i)&&i>=0&&i<p.people.length&&!Object.hasOwn(p.givens||{},i)))]]))};}}}catch{}selected=p.people.findIndex((_,who)=>!Object.hasOwn(p.givens||{},who));$('caseSelect').value=String(i);render();say(Object.keys(p.givens||{}).length?'Twee personen staan al vast. Kies de volgende persoon: één klik is concept, nogmaals is definitief.':'Kies een persoon. Eén klik is een concept in het hoekje; klik nogmaals om definitief te plaatsen, en een derde keer om de eerdere aantekeningen terug te zetten.');}
function persist(){state.clueVersion=p.clueVersion||1;try{localStorage.setItem(key(p),JSON.stringify(state));}catch{say('Opslaan is niet beschikbaar in deze browser. Je kunt wel verder spelen.');}}
function snapshot(){history.push(JSON.stringify(state));if(history.length>100)history.shift();}
function say(text){$('message').textContent=text;}
function render(){
 $('caseNo').textContent=`ZAAK ${String(p.number).padStart(2,'0')} / ${p.theme||'STAD'}`;$('caseTitle').textContent=p.title;$('story').textContent=p.story;
 const count=Object.keys(state.positions).length;$('count').textContent=`${count} / ${p.people.length} geplaatst`;$('progress').textContent=state.solved?'Zaak opgelost':`${count} van ${p.people.length} alibi’s op de kaart`;
 $('board').style.setProperty('--size',p.size);$('board').innerHTML=boardMarkup(p,state.positions,state.crosses,false,state.notes,selected);
 $('board').querySelectorAll('[data-cell]').forEach(cell=>cell.onclick=()=>tap(+cell.dataset.cell));
 $('legend').innerHTML=legendMarkup(p);$('objectLegend').innerHTML=objectLegend(p);
 $('miniBoard').style.setProperty('--size',p.size);$('miniBoard').innerHTML=boardMarkup(p,{},[],true);
 $('level').textContent=`${p.level||'Bonus'} · ${p.size} × ${p.size}`;
 $('lesson').textContent=p.lesson?`${p.number}. ${p.lesson}${p.number===1?' — vul alleen de twee ontbrekende personen in.':p.number===2?' — nu helemaal zonder startposities.':p.number===3?' — vergelijk voor het eerst de rijen van personen.':p.number===4?' — combineer links, hoger en de plekken op de kaart.':' — combineer de gebieden met de andere aanwijzingen.'}`:'Een eerdere zaak uit je archief.';
 $('nextCase').hidden=!state.solved||index>=mainCount-1;
 $('caseTrail').innerHTML=puzzles.slice(0,mainCount).map((q,i)=>`<button class="${index===i?'current':''}" data-case="${i}" aria-label="Zaak ${i+1}: ${q.level}" ${index===i?'aria-current="step"':''}><b>${i+1}</b><span>${q.theme||q.level}</span></button>`).join('');
 $('caseTrail').querySelectorAll('button').forEach(b=>b.onclick=()=>load(+b.dataset.case));
 $('people').replaceChildren();
 p.people.forEach((person,i)=>{
  const card=document.createElement('div');card.className='person-card'+(selected===i?' selected':'');const head=document.createElement('button');head.className='person-header';head.setAttribute('aria-pressed',String(selected===i));
  const pos=state.positions[i];head.innerHTML=`<span class="avatar">${portraitMarkup(i,person.name)}</span><span><strong>${person.name}</strong>${i===p.victim?'<span class="victim-tag">SLACHTOFFER</span>':''}<small>${person.role}</small></span><span class="placed">${pos==null?'○':`R${Math.floor(pos/p.size)+1} · K${pos%p.size+1}`}</span>`;
  head.onclick=()=>{if(Object.hasOwn(p.givens||{},i)){say(`${person.name} is een vaste startpositie.`);return;}selected=i;mode='place';render();say(`${person.name} geselecteerd. Eén klik maakt een concept; nogmaals maakt het definitief, een derde klik zet de eerdere aantekeningen terug.`);};card.append(head);
  if(i===p.victim){const heading=document.createElement('p');heading.className='victim-location-title';heading.textContent='Plaatsaanwijzing';card.append(heading);}
  p.clues.forEach((clue,j)=>{if(clue.a!==i)return;const label=document.createElement('label');label.className='clue';const input=document.createElement('input');input.type='checkbox';input.checked=state.checked.includes(j);input.onchange=()=>{snapshot();state.checked=input.checked?[...state.checked,j]:state.checked.filter(x=>x!==j);persist();};const text=document.createElement('span');text.textContent=clue.text;label.append(input,text);card.append(label);});
  if(Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue given-clue';info.textContent='Staat al op de kaart. Deze plek staat vast.';card.append(info);}
  if(!p.clues.some(c=>c.a===i)&&i!==p.victim&&!Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue';info.textContent='Gebruik de andere aanwijzingen om mijn plek te vinden.';card.append(info);}
  if(i===p.victim){const text=document.createElement('p');text.className='victim-rule';text.textContent='Spelregel: was alleen met de dader in hetzelfde gebied.';card.append(text);}$('people').append(card);
 });
 for(const m of ['place','cross','erase']){$(m).classList.toggle('active',mode===m);$(m).setAttribute('aria-pressed',String(mode===m));}$('undo').disabled=!history.length;
}
function tap(c){
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
$('caseSelect').innerHTML=puzzles.map((p,i)=>`<option value="${i}">${String(p.number).padStart(2,'0')} · ${p.theme||p.level} — ${p.title}</option>`).join('');$('caseSelect').onchange=e=>load(+e.target.value);
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
$('printAll').onclick=()=>printPuzzles(puzzles.slice(0,mainCount));
$('nextCase').onclick=()=>{if(index<mainCount-1)load(index+1);};
$('oldCases').onclick=async()=>{try{if(puzzles.length===mainCount){const response=await fetch(`./puzzles-archive.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error('laden mislukt');const archive=await response.json();puzzles.push(...archive);const group=document.createElement('optgroup');group.label='Eerdere zaken — je oude voortgang';archive.forEach((q,i)=>{const option=document.createElement('option');option.value=String(i+mainCount);option.textContent=q.title;group.append(option);});$('caseSelect').append(group);}load(mainCount);}catch{say('Het archief kon niet worden geladen. Probeer het later nog eens.');}};
for(const id of ['rules','boardRules'])$(id).onclick=()=>$('rulesDialog').showModal();document.querySelectorAll('dialog .close, .close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('accuse').onclick=()=>{
 if(Object.keys(state.positions).length!==p.people.length||!valid(p,state.positions,true)){say('Plaats eerst iedereen op de kaart en zorg dat alle aanwijzingen kloppen.');return;}
 $('verdict').textContent='';$('accusations').replaceChildren();p.people.forEach((person,i)=>{if(i===p.victim)return;const button=document.createElement('button');button.textContent=person.name;button.onclick=()=>{
  const correct=region(p,state.positions[i])===region(p,state.positions[p.victim]);
  if(correct){snapshot();state.solved=true;persist();render();$('verdict').textContent=`Zaak opgelost! ${person.name} was alleen met ${p.people[p.victim].name} op ${p.areas[region(p,state.positions[i])]}. Goed speurwerk, detective.`;say(`Zaak opgelost: ${person.name} is de dader.`);}else $('verdict').textContent=`${person.name} deelt geen gebied met het slachtoffer. Bekijk nog eens wie daar wél stond.`;
 };$('accusations').append(button);});$('accuseDialog').showModal();
};
load(0);
