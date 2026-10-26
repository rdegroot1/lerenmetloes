import {buildMartiniClues,NAMES,COLORS} from './martini.mjs';
const palette=['#d7c9ac','#b5cad1','#ddd4bb','#c4ccaf','#c8b8a1','#c4c4d4','#d9c8b5','#b4c7c0','#d6bf9b','#c6c9b1','#b9c8ce','#cec0b2','#d8d0b7','#c8bcbf'];
const specs=[
 [8,6,6,4,'Het laatste lied in de roef','Aan boord van een fictieve winterklipper is het laatste lied gezongen. Vier aanwezigen staan al vast. Zoek de twee ontbrekende personen en ontdek wie met Fokko achterbleef.'],
 [10,8,8,2,'Een koude beker glühwein','Op de Hoge der A staan bekers bij de glühweinkraam. De vuurton gloeit nog en aan boord is het stil. Acht fictieve bezoekers vertellen waar ze stonden.'],
 [12,10,10,0,'De vonk bij het Pomphuis','Langs de Kleine der A is het nog gezellig bij de vuurtonnen. Maar één van de tien aanwezigen vertelt een verhaal dat niet bij de anderen past.'],
 [14,12,12,0,'Het verdwenen winterdoek','De kunstroute loopt langs pakhuizen en verlichte schepen. Na het laatste optreden ontbreekt een winterdoek — en Fokko. Leg twaalf verklaringen naast elkaar.'],
 [18,14,14,0,'De val aan de A','Fokko is in het water gevallen. Wat eerst een ongeluk lijkt, blijkt opzet. Reconstrueer waar iedereen vlak vóór de val stond; het slachtoffer was toen samen met precies één andere persoon.'],
 [24,16,16,0,'De nacht van het laatste licht','Het XXL-slotdossier: langs Hoge, Lage en Kleine der A en de Pottebakkersrijge doven de lichtjes. Zestien fictieve aanwezigen, schepen, kramen en één sluitende reconstructie.']
];
const roles=['de schipper','de scheepstimmerman','de verhalenvertelster','de kraamhouder','de zangeres','de scheepsfotograaf','de havenwacht','de lichttechnicus','de bezoekster','de glühweinschenker','de kunstenares','de accordeonist','de kok','de violiste','de buurtbewoner','de vrijwilligster'];
function seeded(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);}
export function winterPlan(width,height,level){
 const areas=[],regions=Array(width*height).fill(-1),area=name=>{if(!areas.includes(name))areas.push(name);return areas.indexOf(name);},set=(r,c,name)=>{if(r>=0&&r<height&&c>=0&&c<width)regions[r*width+c]=area(name);};
 if(level===1){
  for(let row=0;row<height;row++){const inset=row===0||row===height-1?2:row===1||row===height-2?1:0;for(let col=inset;col<width-inset;col++)set(row,col,col<2?'Voordek':col<width-3?(row<height/2?'Scheepsruim':'Roef'):row<height/2?'Stuurhut':'Achterdek');}
 }else if(level===2){
  for(let row=0;row<height;row++){
   for(let col=4;col<width;col++)set(row,col,col<6?'Hoge der A':row<3?'Glühweinterras':row<6?'Vuurtonplein':'Muziekpakhuis');
   if(row>0&&row<height-1)for(let col=0;col<3;col++)set(row,col,row<4?'Voordek':'Roef');
  }
  set(4,3,'Loopplank');
 }else{
  const left=Math.max(3,Math.floor(width*.27)),right=Math.floor(width*.6),cut=Math.floor(height*.55),bridge=level===3?2:Math.floor(height*.43);
  for(let row=0;row<height;row++){
   for(let col=0;col<left;col++)set(row,col,level===3?'Pottebakkersrijge':row<cut?'Lage der A':'Pottebakkersrijge');
   for(let col=right;col<width;col++){
    let name;
    if(col<right+2)name=level===3?'Kleine der A':row<cut?'Hoge der A':'Kleine der A';
    else if(level===3)name=row<height/2?'Vuurtonplein':'Pomphuis';
    else if(level===4)name=row<height/3?'Kunstpakhuis':row<height*2/3?'Glühweinterras':'Vuurtonplein';
    else name=row<height/4?'Glühweinterras':row<height/2?'Kunstpakhuis':row<height*3/4?'Vuurtonplein':'Pomphuis';
    set(row,col,name);
   }
  }
  for(let row=bridge;row<=bridge+1;row++)for(let col=left;col<right;col++)set(row,col,'A-brug');
  const fillShip=(start,end,first,second)=>{
   for(let row=start;row<=end;row++)for(let col=left+1;col<right;col++){
    if((row===start||row===end)&&right-left>4&&col===left+1)continue;
    set(row,col,row<=(start+end)/2?first:second);
   }
  };
  if(bridge>=4)fillShip(0,bridge-1,'Voordek','Scheepsruim');
  if(bridge+2<height)fillShip(bridge+2,height-1,bridge>=4?'Achterdek':'Voordek','Roef');
 }
 // Keep every room connected; two sections with the same street name are one
 // walkable stretch. Per-level diagrams deliberately show different excerpts.
 const used=[...new Set(regions.filter(a=>a>=0))];
 return {regions:regions.map(a=>a<0?-1:used.indexOf(a)),areas:used.map(a=>areas[a]),areaColors:used.map((_,i)=>palette[i%palette.length])};
}
export function furnishWinter(p){
 const width=p.width,objects=[];let sequence=0;
 const place=(area,w,h,type,name,occupiable=false,preferEnd=false)=>{
  const candidates=p.regions.flatMap((a,c)=>a===area?[c]:[]);if(preferEnd)candidates.reverse();
  for(const cell of candidates){const row=Math.floor(cell/width),col=cell%width;if(col+w>width||row+h>p.height)continue;
   const cells=Array.from({length:w*h},(_,i)=>cell+Math.floor(i/w)*width+i%w);if(cells.some(c=>p.regions[c]!==area||objects.some(o=>o.cell===c)))continue;
   const id=`winter-${type}-${sequence++}`;cells.forEach((c,i)=>objects.push({cell:c,type,name,occupiable,...(w*h>1?{furnitureId:id,tile:{x:i%w,y:Math.floor(i/w),width:w,height:h}}:{})}));return true;
  }return false;
 };
 for(let area=0;area<p.areas.length;area++){
  const name=p.areas[area],cells=p.regions.filter(a=>a===area).length;
  if(name==='Loopplank'){place(area,1,1,'winterGangplank','de loopplank',true);continue;}
  if(name==='Glühweinterras'){place(area,2,1,'winterGluhwein','de glühweinkraam');place(area,1,1,'chair','een stoel',true,true);place(area,2,1,'bench','een bankje',true,true);}
  else if(name==='Vuurtonplein'){place(area,1,1,'winterFire','de vuurton');place(area,2,1,'bench','een bankje',true,true);if(cells>15)place(area,1,1,'winterFire','de vuurton',false,true);}
  else if(name==='Kunstpakhuis'||name==='Muziekpakhuis'){place(area,2,1,'winterArt','het kunstpaneel');place(area,1,1,'guitar','een gitaar');place(area,2,1,'rug','een vloerkleed',true,true);}
  else if(name==='Pomphuis'){place(area,2,1,'bar','de bar');place(area,1,1,'chair','een stoel',true,true);place(area,2,1,'rug','een vloerkleed',true);}
  else if(['Voordek','Achterdek','Scheepsruim','Roef','Stuurhut'].includes(name)){
   if(name==='Stuurhut')place(area,1,1,'winterWheel','het stuurwiel');
   else if(name==='Roef'){place(area,2,1,'bed','een bed',true);place(area,1,1,'table','de tafel');}
   else if(name==='Scheepsruim'){place(area,2,1,'winterCrate','de scheepskist');place(area,2,2,'rug','een vloerkleed',true,true);}
   else {place(area,1,1,'winterMast','de mast');place(area,2,1,'bench','een bankje',true,true);}
  }else if(name==='A-brug'){place(area,2,1,'winterRail','de brugleuning');}
  else {place(area,1,1,'winterBollard','een meerpaal');place(area,1,1,'lamp','een lantaarn',false,true);place(area,2,1,'bench','een bankje',true);if(cells>=25)place(area,1,1,'winterFire','de vuurton',false,true);}
 }
 p.objects=objects;return p;
}
export function createWinterSeries(){
 return specs.map(([width,height,count,givenCount,title,story],index)=>{
  const p={id:`winterwelvaart-v1-${index+1}`,number:31+index,seriesId:'winter',seriesNumber:index+1,setting:'winter',theme:'WinterWelVaart',title,story,lesson:index===5?'XXL — de hele winterroute aan de A':'Een nieuw winters dossier',level:['Heel makkelijk','Makkelijk','Gemiddeld','Pittig','Uitdagend','Extreem'][index],difficultyStars:index+1,...(index===5?{difficultyLabel:'XXL · de winterproef'}:{}),size:width,width,height,...winterPlan(width,height,index+1),people:NAMES.slice(0,count).map((name,i)=>({name,role:roles[i],color:COLORS[i]})),victim:5,victimLocationClue:false,victimWeapon:['dagger','poison','candlestick','wrench','rope','dagger'][index],portraitStyle:'mugshot',furnitureRulesVersion:2,clueVersion:1,givens:{},clues:[],printLayout:'festival',printLabel:'WINTERWELVAART · EEN FICTIEF WINTERDOSSIER',mapNoun:'festivalkaart',mapBackdrop:'water',mapOrientation:'SCHEMATISCHE KAART · NOORD ↑',mapCaption:index===4?'Reconstrueer de posities vlak vóór de val. Blauw water hoort niet bij het speelrooster.':'Eigen schematische uitsnede van het A-kwartier. Blauwe waterdelen horen niet bij het speelrooster.',mapNote:'Fictieve zaak, eigen schematische puzzelkaart. Geïnspireerd op de kades en activiteiten van WinterWelVaart; geen actuele routekaart of officiële samenwerking. Schepen en interieurindelingen zijn verzonnen.',rulesNote:'Iedereen krijgt een eigen rij én kolom. Blauwe waterdelen zijn buiten het speelrooster; groen gemarkeerde meubels zijn bezetbaar.',surfaceVerbs:{bench:'Zat op',bed:'Lag op'},countGroups:[['bench'],['rug'],['bed'],['chair']],countLabels:{bench:'een bankje',rug:'een vloerkleed',bed:'een bed',chair:'een stoel'},properAreaNames:['Hoge der A','Lage der A','Kleine der A','Pottebakkersrijge','A-brug','Pomphuis'],roomArticles:{Voordek:'het',Achterdek:'het',Scheepsruim:'het',Vuurtonplein:'het',Glühweinterras:'het',Kunstpakhuis:'het',Muziekpakhuis:'het',Pomphuis:'het'},outdoorAreas:['Voordek','Achterdek','Hoge der A','Lage der A','Kleine der A','Pottebakkersrijge','Glühweinterras','Vuurtonplein','A-brug','Loopplank']};
  furnishWinter(p);buildMartiniClues(p,givenCount,seeded(81577+index*1511));return p;
 });
}
