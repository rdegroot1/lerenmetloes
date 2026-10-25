import {solve,valid,region} from './engine.js';
const $=id=>document.getElementById(id);
let puzzles;
try{const response=await fetch('./puzzles.json');if(!response.ok)throw Error(response.status);puzzles=await response.json();}catch(e){$('message').textContent='De dossiers konden niet worden geladen. Open de app via een webserver en probeer opnieuw.';throw e;}
let index=0,p,state,selected=0,mode='place',history=[];
const key=p=>'grunmurdoku:v1:'+p.id;
function load(i){index=i;p=puzzles[i];history=[];selected=0;mode='place';state={positions:{},crosses:[],checked:[],solved:false};try{const saved=JSON.parse(localStorage.getItem(key(p)));if(saved&&typeof saved.positions==='object'&&Array.isArray(saved.crosses)&&Array.isArray(saved.checked)){const entries=Object.entries(saved.positions);if(entries.every(([who,cell])=>/^\d+$/.test(who)&&+who<p.people.length&&Number.isInteger(cell)&&cell>=0&&cell<p.size*p.size&&!p.objects.some(o=>o.cell===cell))){state={...state,...saved};}}}catch{}$('caseSelect').value=String(i);render();say('Kies een persoon en tik op een leeg vakje om te plaatsen.');}
function persist(){try{localStorage.setItem(key(p),JSON.stringify(state));}catch{say('Opslaan is niet beschikbaar in deze browser. Je kunt wel verder spelen.');}}
function snapshot(){history.push(JSON.stringify(state));if(history.length>100)history.shift();}
function say(text){$('message').textContent=text;}
function render(){
 $('caseNo').textContent=`ZAAK ${String(p.number).padStart(2,'0')} / STAD`;$('caseTitle').textContent=p.title;$('story').textContent=p.story;
 const count=Object.keys(state.positions).length;$('count').textContent=`${count} / ${p.people.length} geplaatst`;$('progress').textContent=state.solved?'Zaak opgelost':`${count} van ${p.people.length} alibi’s op de kaart`;
 $('board').replaceChildren();
 for(let c=0;c<p.size*p.size;c++){
  const row=Math.floor(c/p.size),col=c%p.size,o=p.objects.find(o=>o.cell===c),who=Object.keys(state.positions).find(i=>state.positions[i]===c);
  const cell=document.createElement('button');cell.className=`cell area-${p.regions[c]}`;
  if(col<p.size-1&&p.regions[c]!==p.regions[c+1])cell.classList.add('wall-right');
  if(row<p.size-1&&p.regions[c]!==p.regions[c+p.size])cell.classList.add('wall-bottom');
  cell.setAttribute('aria-label',`Rij ${row+1}, kolom ${col+1}, ${p.areas[p.regions[c]]}${o?', '+o.name:who!=null?', '+p.people[who].name:state.crosses.includes(c)?', weggestreept':', leeg'}`);
  const coord=document.createElement('span');coord.className='coord';coord.textContent=`${row+1}·${col+1}`;cell.append(coord);
  if(o){cell.disabled=true;const icon=document.createElement('span');icon.className='object';icon.textContent=o.icon;cell.append(icon);}
  else if(who!=null){const token=document.createElement('span');token.className='person-token';token.style.background=p.people[who].color;token.textContent=p.people[who].name[0];const name=document.createElement('span');name.className='token-name';name.textContent=p.people[who].name;cell.append(token,name);}
  else if(state.crosses.includes(c)){const mark=document.createElement('span');mark.className='crossed';mark.textContent='×';cell.append(mark);}
  cell.addEventListener('click',()=>tap(c));$('board').append(cell);
 }
 $('legend').innerHTML=p.areas.map((name,i)=>`<span><i class="area-${i}"></i>${name}</span>`).join('');
 $('people').replaceChildren();
 p.people.forEach((person,i)=>{
  const card=document.createElement('div');card.className='person-card'+(selected===i?' selected':'');const head=document.createElement('button');head.className='person-header';head.setAttribute('aria-pressed',String(selected===i));
  const pos=state.positions[i];head.innerHTML=`<span class="avatar" style="background:${person.color}">${person.name[0]}</span><span><strong>${person.name}</strong>${i===p.victim?'<span class="victim-tag">SLACHTOFFER</span>':''}<small>${person.role}</small></span><span class="placed">${pos==null?'○':`R${Math.floor(pos/p.size)+1} · K${pos%p.size+1}`}</span>`;
  head.onclick=()=>{selected=i;mode='place';render();say(`${person.name} geselecteerd. Kies een vrij vakje.`);};card.append(head);
  p.clues.forEach((clue,j)=>{if(clue.a!==i)return;const label=document.createElement('label');label.className='clue';const input=document.createElement('input');input.type='checkbox';input.checked=state.checked.includes(j);input.onchange=()=>{snapshot();state.checked=input.checked?[...state.checked,j]:state.checked.filter(x=>x!==j);persist();};const text=document.createElement('span');text.textContent=clue.text;label.append(input,text);card.append(label);});
  if(i===p.victim){const text=document.createElement('p');text.className='clue';text.textContent='Was alleen met de dader in hetzelfde gebied.';card.append(text);}$('people').append(card);
 });
 for(const m of ['place','cross','erase']){$(m).classList.toggle('active',mode===m);$(m).setAttribute('aria-pressed',String(mode===m));}$('undo').disabled=!history.length;
}
function tap(c){
 const who=Object.keys(state.positions).find(i=>state.positions[i]===c);
 if(mode==='erase'){snapshot();if(who!=null)delete state.positions[who];state.crosses=state.crosses.filter(x=>x!==c);state.solved=false;}
 else if(mode==='cross'){if(who!=null){say('Wis eerst de persoon uit dit vakje.');return;}snapshot();state.crosses=state.crosses.includes(c)?state.crosses.filter(x=>x!==c):[...state.crosses,c];}
 else{
  if(who!=null){selected=+who;render();say(`${p.people[who].name} geselecteerd. Tik op een ander vakje om te verplaatsen.`);return;}
  const clash=Object.entries(state.positions).find(([i,x])=>+i!==selected&&(Math.floor(x/p.size)===Math.floor(c/p.size)||x%p.size===c%p.size));
  if(clash){say(`${p.people[clash[0]].name} staat al in deze rij of kolom. Iedereen krijgt een eigen rij én kolom.`);return;}
  snapshot();state.positions[selected]=c;state.crosses=state.crosses.filter(x=>x!==c);state.solved=false;
 }
 persist();render();say(mode==='place'?`${p.people[selected].name} geplaatst. Controleer de aanwijzingen of kies de volgende persoon.`:'Notitie bijgewerkt.');
}
$('caseSelect').innerHTML=puzzles.map((p,i)=>`<option value="${i}">${String(p.number).padStart(2,'0')} — ${p.title}</option>`).join('');$('caseSelect').onchange=e=>load(+e.target.value);
for(const m of ['place','cross','erase'])$(m).onclick=()=>{mode=m;render();say(m==='cross'?'Tik op vakjes die je wilt wegstrepen. Deze notities tellen niet mee als plaatsing.':m==='erase'?'Tik op een persoon of een kruisje om te wissen.':'Kies een persoon en plaats die op de kaart.');};
$('undo').onclick=()=>{if(history.length){state=JSON.parse(history.pop());persist();render();say('Laatste wijziging teruggedraaid.');}};
$('reset').onclick=()=>{snapshot();state={positions:{},crosses:[],checked:[],solved:false};persist();render();say('Een schone kaart. Je kunt dit nog terugdraaien met Terug.');};
$('check').onclick=()=>{
 const complete=Object.keys(state.positions).length===p.people.length;
 if(!valid(p,state.positions,complete)||!solve(p,state.positions,1).length){say('Er klopt nog iets niet. De geplaatste personen passen niet bij alle aanwijzingen. Met Wissen kun je een plaatsing verwijderen.');return;}
 say(complete?'Alle alibi’s kloppen. Wie deelt het gebied met het slachtoffer? Wijs de dader aan.':'Je plaatsingen passen bij een oplossing. Ga verder met de overige personen.');
};
$('hint').onclick=()=>{
 const solutions=solve(p,state.positions,1);if(!solutions.length){say('Deze plaatsingen kunnen niet samen kloppen. Wis een plaatsing of gebruik Terug en controleer de aanwijzingen.');return;}
 const who=p.people.findIndex((_,i)=>state.positions[i]==null);if(who<0){say('De kaart klopt. De dader is de enige andere persoon in het gebied van het slachtoffer.');return;}
 snapshot();state.positions[who]=solutions[0][who];state.crosses=state.crosses.filter(x=>x!==solutions[0][who]);selected=who;persist();render();say(`Zetje: ${p.people[who].name} staat in rij ${Math.floor(solutions[0][who]/p.size)+1}, kolom ${solutions[0][who]%p.size+1}. Deze plaatsing kun je terugdraaien.`);
};
$('rules').onclick=()=>$('rulesDialog').showModal();document.querySelectorAll('dialog .close, .close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('accuse').onclick=()=>{
 if(Object.keys(state.positions).length!==p.people.length||!valid(p,state.positions,true)){say('Plaats eerst iedereen op de kaart en zorg dat alle aanwijzingen kloppen.');return;}
 $('verdict').textContent='';$('accusations').replaceChildren();p.people.forEach((person,i)=>{if(i===p.victim)return;const button=document.createElement('button');button.textContent=person.name;button.onclick=()=>{
  const correct=region(p,state.positions[i])===region(p,state.positions[p.victim]);
  if(correct){snapshot();state.solved=true;persist();render();$('verdict').textContent=`Zaak opgelost! ${person.name} was alleen met ${p.people[p.victim].name} op ${p.areas[region(p,state.positions[i])]}. Goed speurwerk, detective.`;say(`Zaak opgelost: ${person.name} is de dader.`);}else $('verdict').textContent=`${person.name} deelt geen gebied met het slachtoffer. Bekijk nog eens wie daar wél stond.`;
 };$('accusations').append(button);});$('accuseDialog').showModal();
};
load(0);
