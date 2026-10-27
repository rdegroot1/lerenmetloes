import {buildMartiniClues,NAMES,COLORS} from './martini.mjs';
import {solve,valid} from './engine.js';
import {explain} from './explain.js';
import {assertGeneralCluePolicy} from './general-clues.mjs';
const palette=['#d9bd94','#dbcba8','#b8c9a8','#d3b7a3','#a8c0ac','#d5c69d','#b7cac2','#d5b4ad','#c5cf9e'];
const specs=[
 {title:'Achter het rode doek',location:'Spiegeltent',stars:1,rows:['..0000..','11000022','11333322','44333355','44333355','..3333..'],areas:['Entree','Garderobe','Backstage','Publiekszaal','Podium','Tentbar'],finishes:['path','wood','wood','wood','wood','tile'],props:['festivalGate','festivalCoatrack','guitar','festivalMirror','festivalSpeaker','bar'],story:'De laatste voorstelling in de spiegeltent is afgelopen. Het rode doek hangt stil en de lampjes branden nog. Vijf getuigen vertellen waar ze waren.'},
 {title:'Pizza na sluitingstijd',location:'Foodtruckveld',stars:2,rows:['000011','000011','223311','223344','553344','555544'],areas:['Foodtruckveld','Pizzaweide','Zandspeeltuin','Picknickveld','Klein podium','Festivalpad'],finishes:['grass','grass','sand','grass','wood','path'],props:['festivalFoodtruck','festivalOven','festivalBucket','table','guitar','festivalLights'],story:'Bij de foodtrucks is de laatste pizza gebakken. Naast de zandspeeltuin staan nog bekers op de picknicktafels. Maar Fokko keert niet terug.'},
 {title:'Lichtjes boven het water',location:'Vijver en vlonder',stars:2,rows:['0000001111','222~~31111','222~~33333','222~~33333','444~~55555','444~~55555','4446666555'],areas:['Vijverkop','Vijverbar','Grasveld','Vlonder','Bosrand','Avondterras','Oeverpad'],finishes:['path','tile','grass','wood','grass','grass','path'],props:['festivalGate','bar','table','guitar','tree','festivalLights','festivalSculpture'],pond:[3,1,2,5],story:'Lichtslingers weerspiegelen in de rechte vijver. Op de vlonder klinkt nog een laatste lied, terwijl de fontein midden in het water ruist.'},
 {title:'Stilte bij de fontein',location:'Fonteinplein',stars:3,rows:['.00000111.','000~~11111','222~~33333','222~~33333','222~~33333','4444455555','4444455555','.44445555.'],areas:['Festivalwinkel','Foodtruckplein','Fonteinterras','Kunstgalerie','Toiletten','Bomenweide'],finishes:['wood','grass','path','tile','path','grass'],props:['books','festivalFoodtruck','table','festivalSculpture','festivalToilet','tree'],pond:[3,1,2,4],story:'De festivalwinkel sluit de luiken. Tussen de kunstgalerie, de foodtrucks en het fonteinterras moet ieder verhaal op zijn plaats vallen.'},
 {title:'De verdwenen fietssleutel',location:'Fietsen en kunst',stars:3,rows:['..000000..','1100000022','1100333322','1100333322','4444333322','4444555522','.44455552.','..445555..'],areas:['Fietsenstalling','Parkentree','Bosrand','Kunstveld','Slingerpad','Open plek'],finishes:['path','path','grass','grass','path','grass'],props:['festivalBikes','festivalGate','tree','festivalSculpture','festivalLights','table'],story:'Buiten het drukke terrein hangt een fietslichtje te knipperen. Een sleutelbos ligt bij het kunstwerk. Wie was nog tussen de fietsen en de bomen?'},
 {title:'De laatste soundcheck',location:'Muziekpodium',stars:4,rows:['...0000...','1100000022','1100333322','4444333322','4444333355','4444666655','7777666655','.77766665.','..776666..'],areas:['Artiestenentree','Laadplek','Backstage','Muziekpodium','Publieksveld','Buitenbar','Zitterras','Mengtafelhoek'],finishes:['path','path','wood','wood','grass','tile','grass','wood'],props:['festivalGate','crate','guitar','festivalSpeaker','festivalLights','bar','table','festivalMixer'],story:'De versterkers zijn uit, maar bij de mengtafel brandt nog licht. Na de soundcheck spreken de verklaringen elkaar tegen. Combineer wat iedereen wél en niet vertelt.'},
 {title:'Schaduwen tussen de bomen',location:'Bostheaterroute',stars:5,rows:['.00000011.','0000001111','2200331111','2222334444','2222334444','5555334444','5555666677','5555666677','.88866677.','..888887..'],areas:['Bosentree','Lichtweide','Theaterveld','Loofpad','Kleine speelplek','Rustweide','Kioskveld','Bosrand','Kunstplein'],finishes:['path','grass','grass','path','wood','grass','grass','grass','path'],props:['festivalGate','festivalSculpture','guitar','festivalLights','festivalSpeaker','tree','festivalFoodtruck','tree','festivalMirror'],story:'Langs de verlichte bosroute eindigt een kleine voorstelling. Achter iedere boom lijkt een ander verhaal te schuilen. De losse verklaringen worden pas samen een sluitend spoor.'},
 {title:'Na het laatste applaus',location:'Avondterras',stars:5,rows:['..000000..','1100000022','1100333322','4444333322','4444333355','4444666655','7777666655','7777888855','.77788885.','..778888..'],areas:['Tententree','Garderobe','Artiestenuitgang','Festivaltent','Picknickweide','Avondbar','Klinkerterras','Parkpad','Bomenveld'],finishes:['path','wood','path','wood','grass','tile','path','path','grass'],props:['festivalGate','festivalCoatrack','guitar','festivalMirror','table','bar','festivalLights','festivalSculpture','tree'],story:'Het applaus is verstomd. Op het terras schuiven vrijwilligers de laatste stoelen aan. Tien aanwezigen, een gewone festivalkaart en een ingewikkeld web van alibi’s.'}
];
const roles=['de festivalvrijwilliger','de lichttechnicus','de theatermaakster','de pizzabakker','de programmeur','de festivalbezoeker','de podiumbouwer','de geluidstechnicus','de illustratrice','de terrasbeheerder'];
const names={festivalGate:'de festivalpoort',festivalCoatrack:'de kapstok',guitar:'een gitaar',festivalMirror:'een spiegelwand',festivalSpeaker:'een luidspreker',bar:'de bar',festivalFoodtruck:'de foodtruck',festivalOven:'de pizzaoven',festivalBucket:'de zandemmer',table:'een tafel',festivalLights:'de lichtmast',festivalSculpture:'het kunstwerk',tree:'een boom',books:'de winkelkast',festivalToilet:'de toiletunit',festivalBikes:'het fietsenrek',crate:'een krat',festivalMixer:'de mengtafel'};
export function noorderzonPlan(index){
 const s=specs[index],width=s.rows[0].length,height=s.rows.length;
 if(s.rows.some(r=>r.length!==width))throw Error('Invalid festival rows');
 return {width,height,size:width,regions:s.rows.join('').split('').map(c=>/[0-9]/.test(c)?+c:-1),areas:s.areas,areaColors:palette.slice(0,s.areas.length),areaSurfaces:s.finishes.map(s=>'festival-'+s),waterCells:s.rows.join('').split('').flatMap((c,i)=>c==='~'?[i]:[]),...(s.pond?{pondRect:s.pond}:{}),mapDecorations:true};
}
export function furnishNoorderzon(p,index){
 const objects=[];let sequence=0;
 const place=(area,w,h,type,name,allowed=false,end=false)=>{
  const available=p.regions.flatMap((a,c)=>a===area?[c]:[]);if(end)available.reverse();
  for(const c of available){const r=Math.floor(c/p.width),col=c%p.width;if(r+h>p.height||col+w>p.width)continue;const cells=Array.from({length:w*h},(_,i)=>c+Math.floor(i/w)*p.width+i%w);if(cells.some(d=>p.regions[d]!==area||objects.some(o=>o.cell===d)))continue;
   const id=`noorderzon-${type}-${sequence++}`;cells.forEach((cell,i)=>objects.push({cell,type,name,occupiable:allowed,...(cells.length>1?{furnitureId:id,tile:{x:i%w,y:Math.floor(i/w),width:w,height:h}}:{})}));return true;
  }return false;
 };
 specs[index].props.forEach((type,area)=>{
  const wide=['festivalFoodtruck','festivalCoatrack','festivalBikes','table','bar','festivalMixer'].includes(type),square=['festivalOven','festivalSculpture'].includes(type);
  if(!place(area,wide||square?2:1,square?2:1,type,names[type]))place(area,1,1,type,names[type]);
  if(p.regions.filter(a=>a===area).length>=8)place(area,2,1,'bench','een bankje',true,true);
 });
 // A single chair kind, plus a continuous four-cell picnic blanket.
 place(3,1,1,'chair','een stoel',true);
 const grass=p.areas.findIndex((_,a)=>p.areaSurfaces[a]==='festival-grass');
 if(grass>=0)place(grass,2,2,'rug','een vloerkleed',true,true);
 p.objects=objects;return p;
}
function random(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);}
export function createNoorderzonSeries(){
 return specs.map((s,index)=>{
  const base={id:`noorderzon-v1-${index+1}`,number:37+index,seriesId:'noorderzon',seriesNumber:index+1,setting:'noorderzon',theme:s.location,title:s.title,story:s.story,difficultyStars:s.stars,level:['','Heel makkelijk','Makkelijk','Gemiddeld','Pittig','Uitdagend'][s.stars],lesson:index>=5?'Leg de verbanden tussen de verklaringen.':'Combineer de aanwijzingen met de festivalkaart.',...noorderzonPlan(index),victim:5,victimLocationClue:false,victimWeapon:['candlestick','poison','rope','wrench','dagger','candlestick','rope','poison'][index],portraitStyle:'mugshot',furnitureRulesVersion:2,clueVersion:1,givens:{},clues:[],printLayout:'festival',printLabel:'NOORDERZON · NA DE LAATSTE VOORSTELLING',mapNoun:'festivalkaart',mapCaption:s.pond?'Water is geen speelvak; op de vlonder kun je wel staan.':'Iedereen krijgt een eigen rij én kolom.',mapNote:'Eigen fictieve festivalindeling, geïnspireerd op Noorderzon in het Noorderplantsoen. Geen bezoekersplattegrond of officiële samenwerking.',rulesNote:s.pond?'Iedereen krijgt een eigen rij én kolom. Water is geen speelvak.':'Iedereen krijgt een eigen rij én kolom.',surfaceVerbs:{bench:'Zat op',rug:'Stond op'},countGroups:[['bench'],['rug'],['chair']],countLabels:{bench:'een bankje',rug:'een vloerkleed',chair:'een stoel'},generalCluesOnly:true};
  base.roomArticles=Object.fromEntries(base.areas.map(name=>[name,/(veld|pad|plein|terras|podium)$/i.test(name)?'het':'de']));
  base.outdoorAreas=base.areas.filter(name=>/(veld|weide|plein|terras|pad|vlonder|podium|bosrand|laadplek)$/i.test(name));
  base.people=NAMES.slice(0,base.height).map((name,i)=>({name,role:roles[i],color:COLORS[i]}));furnishNoorderzon(base,index);
  for(let attempt=0;attempt<30;attempt++){
   const p=structuredClone(base);
   try{
    buildMartiniClues(p,0,random(96371+index*701+attempt*1009));
    if(index>=5){const positions=solve(p)[0],count=p.areas.length-new Set(Object.values(positions).map(c=>p.regions[c])).size;p.clues.push({type:'emptyRooms',count,text:count===1?'Precies één gebied was leeg.':`Precies ${['nul','één','twee','drie','vier'][count]||count} gebieden waren leeg.`});}
    assertGeneralCluePolicy(p);
    const e=explain(p);if(e.deductions.some(d=>d.searched))continue;
    if(index>=5&&p.clues.filter(c=>c.b!=null).length<3)continue;
    if(solve(p).length!==1||!valid(p,e.positions,true))throw Error('Invalid festival solution');
    console.log(p.id,'seed',attempt,'relations',p.clues.filter(c=>c.b!=null).length);return p;
   }catch(error){if(!/Could not construct|SEARCH_LIMIT/.test(error.message)&&error.code!=='SEARCH_LIMIT')throw error;}
  }
  throw Error('Could not build deductive festival case '+(index+1));
 });
}
