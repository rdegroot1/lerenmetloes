import {scoreFor,earnedScore} from './scoring.js?v=20261028-score';
import {startBundles} from './bundle-manager.js?v=20261027-bundles';
import {completionShare} from './share.js?v=20261028-score';
import {createShareImage} from './share-image.js?v=20261027-share-map';
import {HINT_LEVELS,boardKey,coachingState,recordHint,markProgress,offerHelp,postponeHelp,helpSummary,recommendCase} from './coaching.js?v=20261028-score';
import {accountStore,saveProgress,startAccounts,preferenceKey,accountPreview} from './account-manager.js?v=20261027-bundles';
import {progressSummary,resumeCase,milestoneText,caseProgress} from './progress.js?v=20261027-accounts';
import {victimHint,completionMessage,elapsedTime,celebrationMessage,nextCelebration} from './detective-voice.js?v=20261027-accounts';
import {THEMES,tutorialFor} from './themes.js?v=20261027-accounts';
import {personEntries} from './person-order.js?v=20261027-accounts';
import {updateBoard} from './board-dom.js?v=20261027-accounts';
import {reasoningHint} from './hints.js?v=20261027-coaching';
import {solve,valid,region,isPlayable,canStand,gridWidth,gridHeight} from './engine.js?v=20261027-accounts';
import {boardMarkup,portraitMarkup,objectLegend,printPuzzles,printPageCount} from './view.js?v=20261027-accounts';
import {landmarkArt,objectArt} from './art.js?v=20261027-accounts';
import {explain} from './explain.js?v=20261027-accounts';
import {confirmPlacement,restorePencilNotes,sanitizeBackups} from './notes.js?v=20261027-accounts';
import {difficultyMarkup,difficultyText} from './difficulty.js?v=20261027-accounts';
const $=id=>document.getElementById(id);
const DATA_VERSION='20261028-score';
let puzzles;
try{const response=await fetch(`./puzzles.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error(response.status);puzzles=await response.json();}catch(e){$('message').textContent='De dossiers konden niet worden geladen. Open de app via een webserver en probeer opnieuw.';throw e;}
const freeCaseIds=new Set(puzzles.map(q=>q.id));let mainCount=puzzles.length;
const seriesCases=()=>puzzles.slice(0,mainCount).filter(q=>(q.seriesId||'stad')===(p.seriesId||'stad'));
const seriesIndices=()=>seriesCases().map(q=>puzzles.indexOf(q));
const choiceCases=()=>index>=mainCount?puzzles.slice(mainCount):seriesCases();
const caseOptions=()=>choiceCases().map(q=>`<option value="${puzzles.indexOf(q)}">${caseProgressFor(q).solved?'✓ ':''}Zaak ${q.number} · ${q.title}</option>`).join('');
let index=0,p,state,selected=0,mode='place',history=[],zoom=1,peopleZoom=1,hintSession=null,mapBase=0;
let experienced=false,guidanceRequested=false;
try{const preferences=JSON.parse(localStorage.getItem('grunndoku:view:v1'));if(preferences){if(Number.isFinite(preferences.map))zoom=Math.min(3,Math.max(.5,preferences.map));if(Number.isFinite(preferences.people))peopleZoom=Math.min(1.5,Math.max(.7,preferences.people));}}catch{}
const compactCase=q=>q.people.length<=10&&gridWidth(q)<=12&&gridHeight(q)<=10;
const largeCase=q=>(['martini','winter','noorderzon'].includes(q.seriesId)||q.bundleId)&&!compactCase(q);
function saveView(){try{localStorage.setItem('grunndoku:view:v1',JSON.stringify({map:zoom,people:peopleZoom}));}catch{}}
// Keep the original storage namespace so existing browser progress survives the rename.
// Guest keys are preserved by account-store.js; account caches stay separate.
function load(i){
 if(state){settlePlayTime();persist();}
 lastPlayTick=performance.now();index=i;p=puzzles[i];document.querySelector('.clue-page').scrollTop=0;mapBase=0;hintSession=null;$('hintPanel').hidden=true;history=[];selected=0;mode='place';
 const defaults={positions:{...p.givens},crosses:[],notes:{},noteBackups:{},checked:[],solved:false,playTimeMs:0,playTimePartial:false,hintsUsed:0,scoreVersion:2,achievement:null,coaching:coachingState(),difficultyFeedback:null};state=defaults;
 try{
  const saved=accountStore.open(p.id);
  if(saved&&typeof saved.positions==='object'&&Array.isArray(saved.crosses)&&Array.isArray(saved.checked)){
   const positions=Object.fromEntries(Object.entries(saved.positions).filter(([who,cell])=>/^\d+$/.test(who)&&+who<p.people.length&&canStand(p,cell)));
   const notes=Object.fromEntries(Object.entries(saved.notes||{}).filter(([c,ids])=>canStand(p,+c)&&Array.isArray(ids)).map(([c,ids])=>[c,[...new Set(ids.filter(who=>Number.isInteger(who)&&who>=0&&who<p.people.length&&!Object.hasOwn(p.givens||{},who)))]]));
   state={...defaults,...saved,positions:{...positions,...p.givens},notes,noteBackups:sanitizeBackups(p,saved.noteBackups),checked:(saved.clueVersion||1)===(p.clueVersion||1)?saved.checked:[]};
   state.playTimeMs=elapsedTime(saved.playTimeMs,0);
   state.playTimePartial=Boolean(saved.playTimePartial)||(!Object.hasOwn(saved,'playTimeMs')&&(Object.keys(positions).length>Object.keys(p.givens||{}).length||Object.keys(notes).length>0||saved.crosses.length>0||saved.checked.length>0));
   state.solved=Boolean(saved.solved)&&Object.keys(state.positions).length===p.people.length&&valid(p,state.positions,true);
   state.scoreVersion=saved.scoreVersion===2?2:state.solved?1:2;
  }
 }catch{}
 if(state.solved&&!state.achievement)state.achievement={positions:{...state.positions},solvedAt:state.solvedAt||0};
 state.coaching=coachingState(state.coaching);$('helpOffer').hidden=true;
 $('mapGuide').open=false;$('mapContext').open=false;selected=p.people.findIndex((_,who)=>!Object.hasOwn(p.givens||{},who));render();
 say(experienced&&!guidanceRequested?'Kies een persoon en ga verder met je onderzoek.':Object.keys(p.givens||{}).length?`${Object.keys(p.givens).length} personen staan al vast. Kies de volgende persoon: één klik is concept, nogmaals is definitief.`:'Kies een persoon. Eén klik is een concept in het hoekje; klik nogmaals om definitief te plaatsen, en een derde keer om de eerdere aantekeningen terug te zetten.');
}
let currentScreen='home',introIndex=0,example=0;
let lastPlayTick=performance.now();
function settlePlayTime(){
 const now=performance.now(),delta=now-lastPlayTick;lastPlayTick=now;
 if(state&&currentScreen==='puzzle'&&!state.solved&&!document.hidden)state.playTimeMs=elapsedTime(state.playTimeMs,delta);
}
// No visible clock. Save active, foreground play; preserve it across reloads.
setInterval(()=>{settlePlayTime();if(currentScreen==='puzzle'){persist();$('helpOffer').hidden=Boolean(document.querySelector('dialog[open]'))||!$('hintPanel').hidden||!offerHelp(state.coaching,state.playTimeMs,state.solved);}},5000);
document.addEventListener('visibilitychange',()=>{
 // visibilitychange fires after the visibility flag changes: account for the final interval on hiding.
 if(document.hidden&&currentScreen==='puzzle'&&!state.solved){state.playTimeMs=elapsedTime(state.playTimeMs,performance.now()-lastPlayTick);lastPlayTick=performance.now();}
 else lastPlayTick=performance.now();
 if(state)persist();
});
window.addEventListener('pagehide',()=>{settlePlayTime();if(state)persist();});
function showScreen(name){
 settlePlayTime();if(state)persist();currentScreen=name;for(const [id,value]of [['homeScreen','home'],['themeStartScreen','theme'],['puzzleScreen','puzzle']])$(id).hidden=name!==value;
 $('backHome').hidden=name==='home';$('backTheme').hidden=name!=='puzzle';$('caseMenu').hidden=name!=='puzzle';closeMenus();
}
function closeMenus(){for(const id of ['caseMenu','caseOverview'])$(id).open=false;}
function route(screen,i,replace=false){
 const series=screen==='home'?null:(puzzles[i].seriesId||'stad'),query=new URLSearchParams();
 if(series)query.set('serie',series);if(puzzles[i]?.bundleId&&screen!=='home')query.set('bundel',puzzles[i].bundleId);if(screen==='puzzle'&&puzzles[i].id)query.set('zaak',puzzles[i].id);if(accountPreview)query.set('accounts','preview');
 // Supabase consumes and removes its confirmation/recovery fragment on startup.
 window.history[replace?'replaceState':'pushState']({screen,index:i},'',location.pathname+(query.size?'?'+query:'')+location.hash);
}
function showHome(record=true){renderDossier();showScreen('home');if(record)route('home',0);window.scrollTo({top:0});}
function showTheme(series,i=puzzles.findIndex(q=>(q.seriesId||'stad')===series),record=true){
 introIndex=i;load(i);const meta=THEMES[series];$('themeStartTitle').textContent=meta.title;$('themeStartDescription').textContent=meta.description;$('themeStartPdf').hidden=!meta.pdf;if(meta.pdf)$('themeStartPdf').href=meta.pdf+'?v='+DATA_VERSION;$('themeStartScreen').dataset.theme=series;$('towerPdf').hidden=series!=='martini';$('beginTheme').textContent='Open deze zaak →';example=0;renderExample();showScreen('theme');if(record)route('theme',i);window.scrollTo({top:0});
}
function renderExample(){
 const sample=tutorialFor({series:p.seriesId||'stad',tower:p.setting==='tower'}),positions={...sample.givens,...(example>=1?{2:9}:{}),...(example>=2?{3:15}:{})};
 $('exampleClue').textContent=`Arend en Bertus staan al op de kaart. Cora: ${sample.clues[0].text} Fokko was samen met de moordenaar.`;
 $('exampleBoard').innerHTML=boardMarkup(sample,positions);
 $('exampleReason').textContent=example===0?'Begin bij Cora’s aanwijzing. Zoek het meubel met het groene merkje.':example===1?'Voor Cora past één plek: rij 3, kolom 2. Haar rij en kolom vallen nu af voor de anderen.':`Voor Fokko blijft rij 4, kolom 4 over. Alleen Bertus deelt het gebied ${sample.areas[1]} met hem: in dit voorbeeld is Bertus de dader.`;
 $('exampleStep').textContent=example===2?'Begin het voorbeeld opnieuw ↺':example===0?'Toon de eerste denkstap →':'Toon de tweede denkstap →';
}
function openCase(i,record=true){try{localStorage.setItem(preferenceKey('last-case'),puzzles[i].id);}catch{}const replace=currentScreen==='puzzle';showScreen('puzzle');load(i);if(record)route('puzzle',i,replace);document.querySelector('.book').scrollIntoView({block:'start'});}
$('backHome').onclick=()=>showHome();$('backTheme').onclick=()=>showTheme(p.seriesId||'stad',index);$('beginTheme').onclick=()=>openCase(introIndex);$('themeCaseSelect').onchange=e=>{introIndex=+e.target.value;route('theme',introIndex,true);};$('exampleStep').onclick=()=>{example=(example+1)%3;renderExample();};
window.addEventListener('popstate',event=>{const state=event.state;if(state?.screen==='puzzle')openCase(state.index,false);else if(state?.screen==='theme')showTheme(puzzles[state.index].seriesId||'stad',state.index,false);else showHome(false);});

function persist(){if(accountStore.userId&&!accountStore.read(p.id)&&!caseProgress(p,state).started)return;if(currentScreen==='puzzle'&&!state.solved)state.updatedAt=Date.now();state.clueVersion=p.clueVersion||1;try{saveProgress(p.id,state);}catch{say('Opslaan is niet beschikbaar in deze browser. Je kunt wel verder spelen.');}}
function snapshot(){history.push(JSON.stringify(state));if(history.length>100)history.shift();}
function say(text){$('message').textContent=text;}
function clueLabel(clue,j){
 const label=document.createElement('label');label.className='clue';const input=document.createElement('input');input.type='checkbox';input.checked=state.checked.includes(j);
 input.onchange=()=>{snapshot();state.checked=input.checked?[...state.checked,j]:state.checked.filter(x=>x!==j);persist();};
 const text=document.createElement('span');text.textContent=clue.text;label.append(input,text);return label;
}
function readSave(q){return accountStore.read(q.id);}
function dossier(){return progressSummary(puzzles.slice(0,mainCount),q=>q.id===p?.id?state:readSave(q));}
let progressSnapshot;
function caseProgressFor(q){return (progressSnapshot||dossier()).cases.find(c=>c.id===q.id)||{started:false,solved:false};}
function renderDossier(){
 const summary=dossier();progressSnapshot=summary;let last;try{last=localStorage.getItem(preferenceKey('last-case'));}catch{}
 const resume=resumeCase(summary,last);$('resumeCase').hidden=!resume;
 if(resume){$('resumeCase').textContent=`Verder met ${puzzles[resume.index].title} →`;$('resumeCase').onclick=()=>openCase(resume.index);}
 $('dossierCount').textContent=`${summary.solved} van ${summary.total} zaken opgelost`;
 let earnedCases=0;
 const points=puzzles.slice(0,mainCount).reduce((sum,q)=>{const saved=q.id===p.id?state:readSave(q),earned=caseProgress(q,saved).solved||caseProgress(q,{positions:saved?.achievement?.positions,solved:true}).solved;if(earned)earnedCases++;return sum+(earned?earnedScore(q,saved):0);},0);$('dossierScore').textContent=points?`${points} speurpunten verzameld · iedere opgeloste zaak telt één keer`:'';
 experienced=earnedCases>=30;renderGuidance();
 for(const card of document.querySelectorAll('.theme-card')){
  const series=card.querySelector('[data-theme-art]').dataset.themeArt,cases=summary.cases.filter(c=>c.series===series),done=cases.filter(c=>c.solved).length;
  card.querySelector('.theme-progress-label').textContent=`${done} van ${cases.length} zaken opgelost`;
  const meter=card.querySelector('progress');meter.max=cases.length;meter.value=done;meter.setAttribute('aria-label',`${THEMES[series].title}: ${done} van ${cases.length} zaken opgelost`);
 }
 const cases=summary.cases.filter(c=>c.series===(p.seriesId||'stad'));
 $('themeProgress').textContent=`${cases.filter(c=>c.solved).length} van ${cases.length} zaken opgelost · je kiest zelf je volgende zaak`;
}
function renderGuidance(){
 const compact=experienced&&!guidanceRequested;
 $('generalStart').hidden=compact;$('themeTutorial').hidden=compact;
 $('themeHelp').hidden=!experienced;$('themeHelp').textContent=compact?'Voorbeeld en voorwerpen bekijken':'Uitleg verbergen';
 $('themeHelp').setAttribute('aria-expanded',String(!compact));
 $('howToPlay').textContent=experienced?(compact?'Uitleg bekijken':'Uitleg verbergen'):'Zo werkt het';
 $('howToPlay').setAttribute('aria-expanded',String(!compact));
 $('lesson').hidden=compact;document.querySelector('.keyboard-tip').hidden=compact;
 // Setting-specific rules remain visible; only the repeated universal rule goes.
 $('shapeNote').hidden=compact&&!p.rulesNote;
}
$('howToPlay').onclick=()=>{
 if(experienced){guidanceRequested=!guidanceRequested;renderGuidance();}
 if(!$('generalStart').hidden){$('generalStart').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});$('generalStartTitle').focus({preventScroll:true});}
};
$('themeHelp').onclick=()=>{guidanceRequested=!guidanceRequested;renderGuidance();};
function render(){
 renderDossier();
 const clueScroll=document.querySelector('.clue-page').scrollTop;
 const options=caseOptions();for(const id of ['caseSelect','themeCaseSelect']){$(id).innerHTML=options;$(id).value=String(index);}
 const church=Boolean(p.bundleId)||['martini','winter','noorderzon'].includes(p.seriesId),width=gridWidth(p),height=gridHeight(p);
 document.querySelector('.book').classList.toggle('series-martini',church);
 document.querySelector('.book').classList.toggle('series-winter',p.seriesId==='winter');
 document.querySelector('.book').classList.toggle('series-noorderzon',p.seriesId==='noorderzon');
 document.querySelector('.book').classList.toggle('series-surroundings',p.setting==='martini-surroundings');
 document.querySelector('.book').classList.toggle('compact-case',compactCase(p));document.querySelector('.book').classList.toggle('large-case',largeCase(p));
 document.querySelector('.clue-page').style.setProperty('--people-scale',peopleZoom);
 const headerParent=church?$('martiniHeader'):document.querySelector('.clue-page');
 if($('caseHeader').parentElement!==headerParent)headerParent.prepend($('caseHeader'));
 $('martiniHeader').hidden=!church;$('mapNavigation').hidden=false;
 $('mapGuide').hidden=!church;$('mapContext').hidden=!church;$('mapNote').hidden=!church;$('mapNote').textContent=p.mapNote||'';
 $('activeClue').hidden=!church;
 $('returnToMap').hidden=!church;
 const own=p.clues.find(c=>c.a===selected),given=p.givens?.[selected];
 $('activeClue').textContent=`${p.people[selected]?.name||'Kies een persoon'} · ${selected===p.victim?'Was samen met de moordenaar.':given!=null?`Vaste startpositie: rij ${Math.floor(given/width)+1}, kolom ${given%width+1}.`:own?.text||'Kies een persoon bij de kaart.'}`;
 $('shapeNote').textContent=p.rulesNote||'Iedereen heeft een eigen rij én kolom.';
 for(const id of ['board']){$(id).style.setProperty('--columns',width);$(id).style.setProperty('--rows',height);}
 $('board').style.setProperty('--map-min',`${width*(compactCase(p)?30:36)*zoom}px`);
 $('board').style.setProperty('--map-scale',zoom);$('board').style.width=mapBase?`${mapBase*zoom}px`:'100%';
 $('zoomValue').textContent=`${Math.round(zoom*100)}%`;
 $('zoomOut').disabled=zoom<=.5;$('zoomIn').disabled=zoom>=3;
 $('peopleZoomValue').textContent=`${Math.round(peopleZoom*100)}%`;$('peopleZoomOut').disabled=peopleZoom<=.7;$('peopleZoomIn').disabled=peopleZoom>=1.5;
 $('quickPerson').innerHTML=personEntries(p).map(({person,i})=>`<option value="${i}" ${i===selected?'selected':''} ${Object.hasOwn(p.givens||{},i)?'disabled':''}>${person.name}${state.positions[i]!=null?' ✓':''}</option>`).join('');
 $('activeSeriesName').textContent=THEMES[p.seriesId||'stad']?.title||'Extra thema';
 $('caseNo').textContent=`ZAAK ${String(p.number).padStart(2,'0')} / ${p.theme||'STAD'}`;$('caseTitle').textContent=p.title;$('story').textContent=p.story;
 const count=Object.keys(state.positions).length;$('count').textContent=`${count} / ${p.people.length} geplaatst`;$('progress').textContent=state.solved?'Zaak opgelost':`${count} van ${p.people.length} alibi’s op de kaart`;
 $('board').classList.toggle('shaped',p.regions.some(a=>a<0));document.querySelector('.book').classList.toggle('series-mugshot',p.portraitStyle==='mugshot');
 $('board').style.setProperty('--size',p.size);updateBoard($('board'),boardMarkup(p,state.positions,state.crosses,false,state.notes,selected),p.id);

 if(hintSession&&hintSession.key!==hintKey()){$('hintPanel').hidden=true;hintSession=null;}
 $('themeObjectLegend').innerHTML=objectLegend({objects:(index>=mainCount?[p]:seriesCases()).flatMap(q=>q.objects)});$('rulesObjectLegend').innerHTML=$('themeObjectLegend').innerHTML;
 $('level').innerHTML=difficultyMarkup(p)+`<span class="difficulty-size">${width} × ${height}</span>`;
 $('lesson').textContent=church?`${p.people.length} personen · ${p.lesson||'Combineer de aanwijzingen en ontdek de dader.'}`:p.lesson?`${p.number}. ${p.lesson}${p.number===1?' — iedereen begint nog buiten de kaart.':p.number===2?' — volg de aanwijzingen stap voor stap.':p.number===3?' — let ook op bankjes en de plekken in het groen.':p.number===4?' — combineer gebiedsranden, rijen en kolommen.':' — combineer de gebieden met de andere aanwijzingen.'}`:'Een eerdere zaak uit je archief.';
 $('accuse').textContent=state.solved?'Bekijk afronding':'Dader aanwijzen';
 $('nextCase').hidden=!state.solved||seriesIndices().at(-1)===index;
 $('printAll').textContent=`Print dit thema (${printPageCount(seriesCases())} A4)`;$('printAll').hidden=index>=mainCount;
 const themeMeta=THEMES[p.seriesId||'stad'];$('headerThemePdf').hidden=index>=mainCount||!themeMeta?.pdf;if(themeMeta?.pdf)$('headerThemePdf').href=themeMeta.pdf+'?v='+DATA_VERSION;
 for(const [id,series]of [['classicSeries','stad'],['nightSeries','nacht'],['martiniSeries','martini'],['winterSeries','winter'],['noorderzonSeries','noorderzon']])$(id).setAttribute('aria-pressed',String((p.seriesId||'stad')===series));
 $('caseTrail').innerHTML=choiceCases().map(q=>{const i=puzzles.indexOf(q);return `<button class="${index===i?'current':''}" data-case="${i}" title="${q.title}" aria-label="Zaak ${q.number}: ${q.title}" ${index===i?'aria-current="step"':''}><b>${caseProgressFor(q).solved?'✓':q.number}</b><span>${['martini','winter','noorderzon'].includes(q.seriesId)?q.title:q.theme||q.title}</span></button>`;}).join('');
 $('caseTrail').querySelectorAll('button').forEach(b=>b.onclick=()=>{closeMenus();openCase(+b.dataset.case);});
 $('people').replaceChildren();
 personEntries(p).forEach(({person,i})=>{
  const card=document.createElement('div');card.className='person-card'+(selected===i?' selected':'')+(i===p.victim?' is-victim':'');const head=document.createElement('button');head.className='person-header';head.setAttribute('aria-pressed',String(selected===i));head.setAttribute('aria-keyshortcuts',person.name[0].toLowerCase());head.title=`${person.name} selecteren (${person.name[0]})`;head.setAttribute('aria-label',`${person.name}, ${person.role}${i===p.victim?', slachtoffer':''}`);
  const pos=state.positions[i];head.innerHTML=`<span class="avatar">${portraitMarkup(i,person.name,p)}</span><div class="portrait-caption">${p.portraitStyle==='mugshot'?'':`<strong>${person.name}</strong>`}${i===p.victim?'<span class="victim-tag">SLACHTOFFER</span>':''}<small>${person.role}</small></div><span class="placed">${pos==null?'○':`R${Math.floor(pos/p.size)+1} · K${pos%p.size+1}`}</span>`;
  head.onclick=()=>{if(Object.hasOwn(p.givens||{},i)){say(`${person.name} is een vaste startpositie.`);return;}selected=i;mode='place';render();say(`${person.name} geselecteerd. Eén klik maakt een concept; nogmaals maakt het definitief, een derde klik zet de eerdere aantekeningen terug.`);};card.append(head);
  if(i===p.victim&&p.clues.some(c=>c.a===i)){const heading=document.createElement('p');heading.className='victim-location-title';heading.textContent='Plaatsaanwijzing';card.append(heading);}
  p.clues.forEach((clue,j)=>{if(clue.a===i)card.append(clueLabel(clue,j));});
  if(Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue given-clue';info.textContent='Staat al op de kaart. Deze plek staat vast.';card.append(info);}
  if(!p.clues.some(c=>c.a===i)&&i!==p.victim&&!Object.hasOwn(p.givens||{},i)){const info=document.createElement('p');info.className='clue';info.textContent='Gebruik de andere aanwijzingen om mijn plek te vinden.';card.append(info);}
  if(i===p.victim){const text=document.createElement('p');text.className='victim-rule';text.textContent=p.victimLocationClue===false?'Was samen met de moordenaar.':'Spelregel: was alleen met de dader in hetzelfde gebied.';card.append(text);}$('people').append(card);
 });
 const extras=$('extraClues');extras.replaceChildren();extras.hidden=!p.clues.some(c=>c.a==null);if(!extras.hidden){const title=document.createElement('h3');title.textContent='Extra aanwijzingen';extras.append(title);p.clues.forEach((clue,j)=>{if(clue.a==null)extras.append(clueLabel(clue,j));});}
 sizeMap();document.querySelector('.clue-page').scrollTop=clueScroll;
 for(const m of ['place','cross','erase']){$(m).classList.toggle('active',mode===m);$(m).setAttribute('aria-pressed',String(mode===m));}$('undo').disabled=!history.length;
}
function sizeMap(){
 const board=$('board'),viewport=board.parentElement,book=document.querySelector('.book');
 if(!viewport.clientWidth||matchMedia('print').matches)return;
 const topbar=document.querySelector('.app-header').getBoundingClientRect().height;document.documentElement.style.setProperty('--app-header-height',`${topbar}px`);
 const split=largeCase(p)&&matchMedia('(min-width:1000px)').matches;
 let available;
 if(split){
  const header=$('martiniHeader').getBoundingClientRect().height,workspace=Math.max(450,innerHeight-topbar-header-24);
  book.style.setProperty('--workspace-height',`${workspace}px`);
  const panel=document.querySelector('.map-panel'),overhead=panel.getBoundingClientRect().height-viewport.getBoundingClientRect().height;
  available=Math.max(180,workspace-overhead-12);book.style.setProperty('--map-view-height',`${Math.floor(available)}px`);
 }
 if(!mapBase){
  mapBase=Math.max(180,viewport.clientWidth-6);
  if(split)mapBase=Math.min(mapBase,available*gridWidth(p)/gridHeight(p));
  else if(compactCase(p)&&matchMedia('(min-width:760px)').matches){
   const panel=document.querySelector('.map-panel'),header=$('martiniHeader').hidden?0:$('martiniHeader').getBoundingClientRect().height;
   const overhead=panel.scrollHeight-board.getBoundingClientRect().height;
   const space=Math.max(180,innerHeight-topbar-header-overhead-24);mapBase=Math.min(mapBase,space*gridWidth(p)/gridHeight(p));
  }
 }
 board.style.width=`${Math.round(mapBase*zoom)}px`;
}
window.addEventListener('afterprint',()=>{sizeMap();});
let resizeFrame;window.addEventListener('resize',()=>{if(matchMedia('print').matches)return;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{mapBase=0;sizeMap();});});
$('board').addEventListener('click',event=>{const cell=event.target.closest('[data-cell]');if(cell&&!cell.disabled)tap(+cell.dataset.cell);});
$('board').addEventListener('contextmenu',event=>{const cell=event.target.closest('[data-cell]');if(cell){event.preventDefault();if(!cell.disabled)tap(+cell.dataset.cell,'cross');}});
function tap(c,tool=mode){
 if(!canStand(p,c))return;
 const who=Object.keys(state.positions).find(i=>state.positions[i]===c);
 if(who!=null&&Object.hasOwn(p.givens||{},who)){say('Dit is een vaste startpositie. Deze persoon blijft hier staan.');return;}
 if(tool==='erase'){snapshot();if(who!=null){delete state.positions[who];if(state.noteBackups)delete state.noteBackups[who];}state.crosses=state.crosses.filter(x=>x!==c);delete state.notes[c];state.solved=false;}
 else if(tool==='cross'){if(who!=null){say('Wis eerst de persoon uit dit vakje.');return;}snapshot();state.crosses=state.crosses.includes(c)?state.crosses.filter(x=>x!==c):[...state.crosses,c];delete state.notes[c];}
 else{
  if(who!=null){if(+who===selected){snapshot();restorePencilNotes(state,p,+who);persist();render();say(`${p.people[who].name} is weer concept. De eerdere aantekeningen zijn terug.`);return;}selected=+who;render();say(`${p.people[who].name} geselecteerd. Klik nogmaals om de eerdere conceptaantekeningen terug te zetten, of noteer een andere plek.`);return;}
  if(!(state.notes[c]||[]).includes(selected)){snapshot();state.notes[c]=[...(state.notes[c]||[]),selected];state.crosses=state.crosses.filter(x=>x!==c);persist();render();say(`${p.people[selected].name} staat als concept. Klik nogmaals op dit vak voor definitief.`);return;}
  const clash=Object.entries(state.positions).find(([i,x])=>+i!==selected&&(Math.floor(x/p.size)===Math.floor(c/p.size)||x%p.size===c%p.size));
  if(clash){say(`${p.people[clash[0]].name} staat al in deze rij of kolom. Kies een ander vak of wis die plaatsing.`);return;}
  snapshot();confirmPlacement(state,selected,c);settlePlayTime();state.coaching=markProgress(state.coaching,state.playTimeMs);$('helpOffer').hidden=true;
 }
 persist();render();say(tool==='place'?`${p.people[selected].name} definitief geplaatst. Een derde klik herstelt je eerdere concepten.`:'Notitie bijgewerkt.');
}
$('printAll').textContent=`Print de reeks (${mainCount} A4)`;
$('caseSelect').onchange=e=>openCase(+e.target.value);
for(const m of ['place','cross','erase'])$(m).onclick=()=>{mode=m;render();say(m==='cross'?'Tik op vakjes die je wilt wegstrepen. Deze notities tellen niet mee als plaatsing.':m==='erase'?'Tik op een concept, persoon of kruisje om te wissen.':'Eén klik noteert een concept in het hoekje, nogmaals op dat vakje plaatst de persoon definitief.');};
$('undo').onclick=()=>{if(history.length){settlePlayTime();const spent=state.playTimeMs,coaching=state.coaching,hintsUsed=state.hintsUsed,achievement=state.achievement;state=JSON.parse(history.pop());state.playTimeMs=spent;state.coaching=coaching;state.hintsUsed=hintsUsed;state.achievement=achievement||state.achievement;persist();render();say('Laatste wijziging teruggedraaid.');}};
$('reset').onclick=()=>{closeMenus();$('caseMenu').querySelector('summary').focus();$('hintPanel').hidden=true;hintSession=null;settlePlayTime();snapshot();lastPlayTick=performance.now();state={positions:{...p.givens},crosses:[],notes:{},noteBackups:{},checked:[],solved:false,playTimeMs:0,playTimePartial:false,hintsUsed:0,scoreVersion:2,achievement:state.achievement,coaching:coachingState(),difficultyFeedback:state.difficultyFeedback||null};persist();render();say('Een schone kaart. Je kunt dit nog terugdraaien met Terug.');};
$('check').onclick=()=>{
 const complete=Object.keys(state.positions).length===p.people.length;
 if(!valid(p,state.positions,complete)||!solve(p,state.positions,1).length){say('Er klopt nog iets niet. De geplaatste personen passen niet bij alle aanwijzingen. Met Wissen kun je een plaatsing verwijderen.');return;}
 say(complete?'Alle alibi’s kloppen. Wie deelt het gebied met het slachtoffer? Wijs de dader aan.':'Je plaatsingen passen bij een oplossing. Ga verder met de overige personen.');
};
function hintKey(){return p.id+':'+boardKey(state.positions);}
function showReasoningHint(advance=false){
 const key=hintKey();settlePlayTime();
 if(!hintSession||hintSession.key!==key){
  const hint=reasoningHint(p,state.positions),saved=state.coaching.boards.find(b=>b.key===key);
  hintSession={key,index:Math.min(saved?.level??0,hint.steps.length-1),...hint};
  if(!saved){state.hintsUsed=(state.hintsUsed||0)+1;}
 }else if(advance)hintSession.index=Math.min(hintSession.index+1,hintSession.steps.length-1);
 state.coaching=recordHint(state.coaching,key,hintSession.index,hintSession.kind==='placement'?hintSession.who:undefined);state.coaching=postponeHelp(state.coaching,state.playTimeMs);persist();
 $('helpOffer').hidden=true;$('hintPanel').hidden=false;
 const label=hintSession.kind==='placement'?HINT_LEVELS[hintSession.index]:'Even controleren';
 $('hintStep').textContent=`${p.people[p.victim].name} helpt · ${label} · ${hintSession.index+1}/${hintSession.steps.length}`;
 $('hintText').textContent=victimHint(p,hintSession.steps[hintSession.index],hintSession.index);$('hintNext').hidden=hintSession.index===hintSession.steps.length-1;
 $('hintNext').textContent=hintSession.index===2?'Laat de uitgewerkte stap zien':'Iets gerichter →';
 sizeMap();say(`${p.people[p.victim].name} denkt met je mee. Een algemeen zetje is gratis. Gerichtere hulp telt mee voor je zelfstandigheidsbonus.`);
}
$('hint').onclick=()=>showReasoningHint();
$('hintNext').onclick=()=>showReasoningHint(true);
$('hintClose').onclick=()=>{$('hintPanel').hidden=true;sizeMap();};
$('helpOfferAccept').onclick=()=>showReasoningHint();
$('helpOfferDismiss').onclick=()=>{state.coaching=postponeHelp(state.coaching,state.playTimeMs);$('helpOffer').hidden=true;persist();};
document.addEventListener('keydown',event=>{
 if($('caseMenu').open||$('caseOverview').open||currentScreen!=='puzzle'||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||event.repeat||event.isComposing||document.querySelector('dialog[open]')||event.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
 if(event.key.length!==1)return;const who=p.people.findIndex(person=>person.name[0].toLocaleLowerCase('nl')===event.key.toLocaleLowerCase('nl'));if(who<0)return;
 event.preventDefault();if(Object.hasOwn(p.givens||{},who)){say(`${p.people[who].name} is een vaste startpositie.`);return;}
 selected=who;mode='place';render();say(`${p.people[who].name} geselecteerd met ${p.people[who].name[0]}.`);
});
$('explanation').onclick=()=>{closeMenus();$('caseMenu').querySelector('summary').focus();const explanation=explain(p);$('explanationTitle').textContent=p.title+' — stap voor stap';$('explanationSteps').replaceChildren(...explanation.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));$('explanationDialog').showModal();};
$('landmarks').innerHTML=landmarkArt();
$('printCase').onclick=()=>{closeMenus();printPuzzles([p]);};
$('printAll').onclick=()=>{closeMenus();printPuzzles(seriesCases());};
$('returnToMap').onclick=()=>document.querySelector('.map-panel').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
$('quickPerson').onchange=e=>{const who=+e.target.value;if(Object.hasOwn(p.givens||{},who)){say(`${p.people[who].name} is een vaste startpositie.`);return;}selected=who;mode='place';render();say(`${p.people[selected].name} geselecteerd.`);};
$('zoomIn').onclick=()=>{zoom=Math.min(3,Math.round((zoom+.1)*10)/10);saveView();render();};
$('zoomOut').onclick=()=>{zoom=Math.max(.5,Math.round((zoom-.1)*10)/10);saveView();render();};
$('zoomValue').onclick=()=>{zoom=1;saveView();render();};
$('peopleZoomIn').onclick=()=>{peopleZoom=Math.min(1.5,Math.round((peopleZoom+.1)*10)/10);saveView();render();};
$('peopleZoomOut').onclick=()=>{peopleZoom=Math.max(.7,Math.round((peopleZoom-.1)*10)/10);saveView();render();};
$('peopleZoomValue').onclick=()=>{peopleZoom=1;saveView();render();};
$('noorderzonSeries').onclick=()=>showTheme('noorderzon');
$('winterSeries').onclick=()=>showTheme('winter');
$('martiniSeries').onclick=()=>showTheme('martini');
$('classicSeries').onclick=()=>showTheme('stad');
$('nightSeries').onclick=()=>showTheme('nacht');
$('nextCase').onclick=()=>{const cases=seriesIndices(),next=cases[cases.indexOf(index)+1];if(next!=null)openCase(next);};
$('oldCases').onclick=async()=>{closeMenus();try{if(puzzles.length===mainCount){const response=await fetch(`./puzzles-archive.json?v=${DATA_VERSION}`,{cache:'no-store'});if(!response.ok)throw Error('laden mislukt');const archive=await response.json();puzzles.push(...archive);}openCase(mainCount);}catch{say('Het archief kon niet worden geladen. Probeer het later nog eens.');}};
$('rules').onclick=()=>{closeMenus();$('rulesDialog').showModal();};document.querySelectorAll('dialog .close, .close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
function renderDifficultyFeedback(){
 $('difficultyFeedback').hidden=!state.solved;
 const saved=state.difficultyFeedback;
 document.querySelectorAll('[data-difficulty-vote]').forEach(button=>button.setAttribute('aria-pressed',String(saved?.vote===button.dataset.difficultyVote)));
 $('feedbackStatus').textContent=saved?'Bedankt! Je beoordeling is op dit apparaat bewaard.':'';
}
document.querySelectorAll('[data-difficulty-vote]').forEach(button=>button.onclick=()=>{
 state.difficultyFeedback={vote:button.dataset.difficultyVote,stars:p.difficultyStars||3,clueVersion:p.clueVersion||1,hintsUsed:state.hintsUsed||0,date:new Date().toISOString()};persist();renderDifficultyFeedback();
});
$('downloadRatings').onclick=()=>{
 const ratings=puzzles.flatMap(q=>{try{const saved=readSave(q);return saved?.difficultyFeedback?[{id:q.id,title:q.title,...saved.difficultyFeedback}]:[];}catch{return [];}});
 const url=URL.createObjectURL(new Blob([JSON.stringify({game:'Grunndoku',version:1,ratings},null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='grunndoku-proefspeelnotities.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
let shareImageTask=null,shareImageFile=null,shareImageUrl=null,shareImageCase=null;
function showCompletion(){
 prepareShareImage();
 $('shareStatus').textContent='';$('shareFallback').hidden=true;
 const culprit=p.people.findIndex((_,i)=>i!==p.victim&&region(p,state.positions[i])===region(p,state.positions[p.victim]));
 $('accuseTitle').textContent='Zaak opgelost!';$('accuseIntro').hidden=true;$('accusations').hidden=true;$('completionPanel').hidden=false;
 $('verdict').textContent=`${p.people[culprit].name} was alleen met ${p.people[p.victim].name} in het gebied ${p.areas[region(p,state.positions[culprit])]}.`;
 $('celebrationText').textContent=celebrationMessage(state.celebrationIndex);
 $('completionSpeaker').textContent=`${p.people[p.victim].name} zegt`;
 $('completionPortrait').innerHTML=portraitMarkup(p.victim,p.people[p.victim].name,p);
 $('completionTime').textContent=state.playTimeMs>0?completionMessage(state.playTimeMs,state.playTimePartial):'';
 const score=scoreFor(p,state);animateScore(score);
 $('scoreExplanation').textContent=score.legacy?'Eerdere afronding: je verdiende punten blijven behouden. De nieuwe speurscore geldt wanneer je een zaak opnieuw speelt.':`600 voor het oplossen + ${score.bonus} zelfstandigheidsbonus. Tijd kost geen punten. Algemene zetjes zijn gratis; per persoon telt alleen de meest gerichte hulp.`;
 $('scoreLevelBonus').textContent=score.levelBonus?`+ ${score.levelBonus} niveaupunten voor je dossier` : '';

 $('completionHelp').textContent=helpSummary(state);
 const recommendation=recommendCase(puzzles.slice(0,mainCount),p,q=>q.id===p.id?state:readSave(q),(q,s)=>caseProgress(q,s).solved);
 $('recommendation').hidden=!recommendation;
 if(recommendation){$('recommendationText').textContent=recommendation.text;$('recommendedCase').textContent=recommendation.puzzle.title+' →';$('recommendedCase').onclick=()=>{$('accuseDialog').close();openCase(puzzles.indexOf(recommendation.puzzle));};}
 $('completionMilestone').textContent=milestoneText(dossier(),p.seriesId||'stad');
 const cases=seriesIndices(),next=cases[cases.indexOf(index)+1];
 $('resultNext').textContent=next==null?'Terug naar dit thema':'Een volgende zaak →';
 $('resultNext').onclick=()=>{$('accuseDialog').close();if(next==null)showTheme(p.seriesId||'stad',index);else openCase(next);};
 renderDifficultyFeedback();
}
let scoreFrame;
function animateScore(score){
 cancelAnimationFrame(scoreFrame);const bar=$('scoreMeter'),fill=$('scoreFill');
 bar.setAttribute('aria-valuemax',score.max);bar.setAttribute('aria-valuenow',score.total);bar.setAttribute('aria-valuetext',`${score.total} van ${score.max} punten`);
 $('completionScore').textContent=score.legacy?`${score.total} speurpunten · eerdere afronding`:`${score.total} / 1.000 · mooi speurwerk!`;
 $('scoreBreakdown').textContent=score.legacy?'Eerdere score behouden':`${score.base} zaak opgelost · ${score.bonus} zelfstandigheidsbonus`;
 const paint=value=>{fill.style.transform=`scaleX(${value/score.max})`;$('scoreCounter').textContent=String(Math.round(value));};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){paint(score.total);return;}
 paint(0);const start=performance.now();
 const tick=now=>{const t=Math.min(1,(now-start)/1600),first=Math.min(1,t/.55),second=Math.max(0,(t-.55)/.45);paint(t<.55?score.base*(1-Math.pow(1-first,3)):score.base+score.bonus*(1-Math.pow(1-second,3)));if(t<1&&$('accuseDialog').open)scoreFrame=requestAnimationFrame(tick);else paint(score.total);};
 scoreFrame=requestAnimationFrame(tick);
}
function prepareShareImage(){
 if(shareImageCase===p.id&&shareImageTask)return;
 if(shareImageUrl)URL.revokeObjectURL(shareImageUrl);
 shareImageCase=p.id;shareImageFile=null;shareImageUrl=null;
 $('shareMapPreview').hidden=true;$('downloadShareMap').hidden=true;
 const current=p.id;
 shareImageTask=createShareImage(p).then(file=>{
  if(shareImageCase!==current)return null;
  shareImageFile=file;shareImageUrl=URL.createObjectURL(file);
  $('shareMapPreview').src=shareImageUrl;$('shareMapPreview').hidden=false;
  $('downloadShareMap').href=shareImageUrl;$('downloadShareMap').download=file.name;$('downloadShareMap').hidden=false;
  return file;
 }).catch(()=>null);
}
$('shareResult').onclick=async()=>{
 const share=completionShare(p,location.href,state),text=share.text+'\n'+share.url;
 $('shareStatus').textContent='';$('shareFallback').hidden=true;
 if(!shareImageFile&&shareImageTask){
  await shareImageTask;
  // Keep the native share call in a fresh user gesture after rendering.
  $('shareStatus').textContent=shareImageFile?'De lege kaart staat klaar. Klik nogmaals op delen.':'De kaart kon niet worden gemaakt. Klik nogmaals om de link te delen.';
  shareImageTask=null;return;
 }
 if(navigator.share){
  const data=shareImageFile&&navigator.canShare?.({files:[shareImageFile]})?{...share,files:[shareImageFile]}:share;
  try{await navigator.share(data);if(!data.files&&shareImageFile)$('shareStatus').textContent='De link is gedeeld. Je kunt de lege kaart hieronder apart downloaden.';return;}catch(error){if(error.name==='AbortError')return;}
 }
 try{await navigator.clipboard.writeText(text);$('shareStatus').textContent=shareImageFile?'Tekst en puzzellink gekopieerd! Download de lege kaart hieronder om die mee te sturen.':'Tekst en puzzellink gekopieerd! De kaartafbeelding is nu niet beschikbaar.';}
 catch{$('shareFallback').hidden=false;$('shareText').value=text;$('shareText').focus();$('shareText').select();$('shareStatus').textContent=shareImageFile?'Kopieer de geselecteerde tekst en download de lege kaart om mee te sturen.':'Kopieer de geselecteerde tekst om de puzzellink te delen.';}
};
$('resultMap').onclick=()=>{$('accuseDialog').close();document.querySelector('.map-panel').scrollIntoView({block:'start'});$('accuse').focus({preventScroll:true});};
$('accuse').onclick=()=>{
 if(Object.keys(state.positions).length!==p.people.length||!valid(p,state.positions,true)){say('Plaats eerst iedereen op de kaart en zorg dat alle aanwijzingen kloppen.');return;}
 if(state.solved){showCompletion();$('accuseDialog').showModal();return;}
 $('accuseTitle').textContent='Wie heeft het gedaan?';$('accuseIntro').hidden=false;$('accusations').hidden=false;$('completionPanel').hidden=true;
 renderDifficultyFeedback();$('verdict').textContent='';$('accusations').replaceChildren();personEntries(p).forEach(({person,i})=>{if(i===p.victim)return;const button=document.createElement('button');button.textContent=person.name;button.onclick=()=>{
  const correct=region(p,state.positions[i])===region(p,state.positions[p.victim]);
  if(correct){
   settlePlayTime();snapshot();state.solved=true;state.solvedAt=Date.now();const completedScore=scoreFor(p,state);if(!state.achievement||completedScore.dossierTotal>earnedScore(p,{achievement:state.achievement}))state.achievement={positions:{...state.positions},solvedAt:state.solvedAt,score:completedScore};let previous=-1;
   try{previous=JSON.parse(localStorage.getItem('grunndoku:last-celebration:v1'))??-1;}catch{}
   state.celebrationIndex=nextCelebration(previous);try{localStorage.setItem('grunndoku:last-celebration:v1',JSON.stringify(state.celebrationIndex));}catch{}
   persist();render();showCompletion();say('Zaak opgelost. Mooi speurwerk!');$('accuseTitle').focus();
  }else $('verdict').textContent='Deze conclusie past nog niet bij de kaart. Kijk rustig wie het gebied met het slachtoffer deelt. Je kunt het opnieuw proberen.';
 };$('accusations').append(button);});$('accuseDialog').showModal();
};
const requestedParams=new URLSearchParams(document.location.search),requestedSeries=requestedParams.get('serie');
const requestedCase=puzzles.findIndex(q=>q.id===requestedParams.get('zaak'));
const initialIndex=requestedCase>=0?requestedCase:puzzles.findIndex(q=>(q.seriesId||'stad')===requestedSeries);
load(initialIndex>=0?initialIndex:0);
const generalObjects=[['chair','een stoel',true],['bench','een bankje',true],['bed','een bed',true],['rug','een kleed',true],['table','een tafel',false],['tree','een boom',false],['books','een boekenkast',false]].map(([type,name,occupiable])=>({type,name,occupiable}));
$('startObjectLegend').innerHTML=objectLegend({objects:generalObjects});
document.querySelectorAll('[data-theme-art]').forEach(el=>{const meta=THEMES[el.dataset.themeArt];el.innerHTML=meta.art.map(type=>`<span>${objectArt(type)}</span>`).join('');});
if(requestedCase>=0){openCase(requestedCase,false);route('puzzle',requestedCase,true);}else if(initialIndex>=0){showTheme(requestedSeries,initialIndex,false);route('theme',initialIndex,true);}else{showHome(false);if(!requestedParams.has('bundel'))route('home',0,true);}

// Shared action styling; board cells and portrait buttons keep their own hit areas.
document.querySelectorAll('.primary,.quiet,.rules-button,.accuse,.reset,.series-pdf,.section-zoom button,.map-navigation button,.tools button,.header-menu>summary,.case-overview>summary').forEach(el=>el.classList.add('ui-button'));
$('reset').classList.add('is-danger');
document.addEventListener('pointerdown',event=>{for(const id of ['caseMenu','caseOverview'])if(!$(id).contains(event.target))$(id).open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&($('caseMenu').open||$('caseOverview').open)){closeMenus();event.preventDefault();}});
$('caseMenu').addEventListener('click',event=>{if(event.target.closest('a'))closeMenus();});

function reloadAccountDossier(ids=null){
 if(!ids||ids.includes(p.id)){
  const chosen=selected,scroll=document.querySelector('.clue-page').scrollTop;
  state=undefined;load(index);selected=chosen;render();document.querySelector('.clue-page').scrollTop=scroll;
 }else render();
}
startAccounts({
 beforeIdentityChange:()=>{if(state){settlePlayTime();persist();}},
 beforeSync:()=>{if(state){settlePlayTime();persist();}},
 onIdentityChange:()=>{guidanceRequested=false;const previousId=p?.id,paid=p?.bundleId;puzzles=puzzles.filter(q=>!q.bundleId);mainCount=freeCaseIds.size;index=Math.max(0,puzzles.findIndex(q=>q.id===previousId));if(paid){if(shareImageUrl)URL.revokeObjectURL(shareImageUrl);shareImageCase=null;shareImageFile=null;shareImageTask=null;shareImageUrl=null;$('shareMapPreview').removeAttribute('src');$('shareMapPreview').hidden=true;$('downloadShareMap').hidden=true;$('printPages').replaceChildren();$('accuseDialog').close();state=undefined;index=0;load(0);showHome();}else reloadAccountDossier();},
 onRemoteChange:ids=>reloadAccountDossier(ids),
 guestCaseIds:()=>puzzles.filter(q=>{try{return caseProgress(q,JSON.parse(localStorage.getItem('grunmurdoku:v1:'+q.id))).started;}catch{return false;}}).map(q=>q.id),
 caseTitle:id=>puzzles.find(q=>q.id===id)?.title||id,
 describeState:(id,saved)=>{const q=puzzles.find(q=>q.id===id);if(!saved||!q)return 'Nog geen voortgang.';return Object.entries(saved.positions||{}).map(([who,cell])=>`${q.people[who]?.name||'Persoon'}: rij ${Math.floor(cell/gridWidth(q))+1}, kolom ${cell%gridWidth(q)+1}`).join('\n')+`\n${Object.keys(saved.notes||{}).length} vakken met concepten · ${saved.checked?.length||0} afgevinkte aanwijzingen${saved.solved?' · opgelost':''}`;}

});

startBundles({openBundle:async(bundle,cases,caseId)=>{
 if(!cases.every(q=>q.bundleId===bundle.id&&q.seriesId===bundle.id&&q.id?.startsWith('bundle-')&&Array.isArray(q.people)&&Array.isArray(q.regions)))throw Error('Ongeldige bundel');
 const previous=p?.id,previousIntro=puzzles[introIndex]?.id;
 const incoming=cases.filter(q=>!puzzles.some(existing=>existing.id===q.id));puzzles.splice(mainCount,0,...incoming);mainCount+=incoming.length;
 if(previous)index=puzzles.findIndex(q=>q.id===previous);if(previousIntro)introIndex=puzzles.findIndex(q=>q.id===previousIntro);
 THEMES[bundle.id]={title:bundle.title,description:bundle.description,pdf:null,art:['tower','books']};
 const target=caseId?puzzles.findIndex(q=>q.id===caseId&&q.bundleId===bundle.id):-1;
 if(target>=0)openCase(target);else showTheme(bundle.id,puzzles.findIndex(q=>q.bundleId===bundle.id));
}});
