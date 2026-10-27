import {buildMartiniClues,NAMES,COLORS} from './martini.mjs';
import {solve,valid} from './engine.js';
import {explain} from './explain.js';
import {assertGeneralCluePolicy} from './general-clues.mjs';
const palette=['#d9c9a8','#c8c6b2','#d7bea5','#c1cbaa','#d4ccad','#bbcbb4','#c4d1b8','#dcc9b6','#bdc9a7','#d3c4a8'];
const specs=[
 {title:'De laatste koffie',location:'De Kostery',stars:3,rows:['..0000..','11000022','11003322','44443322','44443355','44446655','.777665.','..7766..'],areas:['Entree','Barzaal','Bovenzaal','Trappenhuis','Marktterras','Serveerhoek','Torenterras','Garderobe'],finishes:['brick','tile','wood','wood','brick','tile','brick','wood'],props:['historicDoor','coffeeMachine','books','mantelClock','table','servingTray','gardenPlanter','festivalCoatrack'],indoorsRug:2,chair:1,story:'De laatste kop koffie staat nog bij de bar. Boven, in zaal Marktzicht, is het stil. Acht fictieve aanwezigen vertellen waar ze waren in en rond De Kostery.',caption:'Bar, bovenverdieping en terrassen zijn samen uitgeklapt tot één puzzelrooster.'},
 {title:'Schaduw bij de zonnewijzer',location:'Prinsentuin',stars:4,rows:['..000000..','1100000022','1133333322','1133444422','5555444466','5555444466','5555777766','.88877776.','..887777..'],areas:['Zonnewijzerpoort','Rozentuin','Kruidentuin','Loofgang','Theeterras','Theeschenkerij','Tuinpad','Gazon','Rusthoek'],finishes:['brick','grass','grass','gravel','brick','tile','gravel','grass','gravel'],props:['sundialGate','roseBed','herbBed','gardenArch','table','coffeeMachine','gardenPlanter','tree','gardenUrn'],indoorsRug:5,chair:4,story:'De schaduw van de zonnewijzer schuift over de tuinmuur. Bij de theeschenkerij is de tafel nog gedekt. Tussen rozen, kruiden en loofgangen passen negen verklaringen in één rooster.',caption:'Eigen schematische tuinindeling. Plantvakken zijn geblokkeerd; bankjes zijn bezetbaar.'},
 {title:'Een besloten ontvangst',location:'Prinsenhof',stars:5,rows:['..000000..','1100000022','1100333322','4444333322','4444333355','6666777755','6666777755','6666888855','.99988885.','..998888..'],areas:['Poortentree','Garderobe','Brasserie','Binnenplaats','Ontvangstzaal','Galerij','Tuinterras','Salon','Tuinrand','Serveerhoek'],finishes:['brick','wood','tile','brick','wood','wood','brick','wood','grass','tile'],props:['historicDoor','festivalCoatrack','coffeeMachine','gardenPlanter','books','winterArt','table','mantelClock','roseBed','servingTray'],indoorsRug:7,chair:2,story:'Na een besloten ontvangst bij Prinsenhof blijft een dienblad achter. De gasten verspreidden zich over de zalen, binnenplaats en tuinrand. Tien fictieve aanwezigen hebben ieder hun eigen verklaring.',caption:'Eigen schematische kaart van ontvangstruimtes, binnenplaats en tuinrand.'}
];
const names={historicDoor:'de toegangspoort',coffeeMachine:'het espressoapparaat',books:'een boekenkast',mantelClock:'de klok',table:'een tafel',servingTray:'het dienblad',gardenPlanter:'een plantenbak',festivalCoatrack:'de kapstok',sundialGate:'de zonnewijzerpoort',roseBed:'een rozenperk',herbBed:'een kruidenbed',gardenArch:'de loofboog',tree:'een boom',gardenUrn:'de tuinvaas',winterArt:'het schilderij'};
const roles=['de stadsgids','de barista','de bloemiste','de kelner','de tuinliefhebber','de bezoeker','de gastheer','de restaurator','de schrijfster','de conciërge'];
function seeded(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);}
function furnish(p,s){
 let sequence=0;p.objects=[];
 const place=(area,w,h,type,name,occupiable=false,end=false)=>{
  const anchors=p.regions.flatMap((a,c)=>a===area?[c]:[]);if(end)anchors.reverse();
  for(const c of anchors){const r=Math.floor(c/p.width),col=c%p.width;if(col+w>p.width||r+h>p.height)continue;
   const cells=Array.from({length:w*h},(_,i)=>c+Math.floor(i/w)*p.width+i%w);if(cells.some(d=>p.regions[d]!==area||p.objects.some(o=>o.cell===d)))continue;
   const id=`martini-around-${type}-${sequence++}`;cells.forEach((cell,i)=>p.objects.push({cell,type,name,occupiable,...(cells.length>1?{furnitureId:id,tile:{x:i%w,y:Math.floor(i/w),width:w,height:h}}:{})}));return true;
  }return false;
 };
 s.props.forEach((type,area)=>{
  const square=['roseBed','herbBed'].includes(type),wide=['coffeeMachine','sundialGate','gardenArch','table','festivalCoatrack'].includes(type);
  if(!place(area,square||wide?2:1,square?2:1,type,names[type]))place(area,1,1,type,names[type]);
  if(p.regions.filter(a=>a===area).length>=8)place(area,2,1,'bench','een bankje',true,true);
 });
 place(s.indoorsRug,2,2,'rug','een vloerkleed',true,true);place(s.chair,1,1,'chair','een stoel',true,true);
}
export function createMartiniSurroundings(){
 return specs.map((s,index)=>{
  const width=s.rows[0].length,height=s.rows.length;
  if(s.rows.some(row=>row.length!==width))throw Error('Invalid Martini surroundings rows');
  const base={id:`martini-around-v1-${index+1}`,number:45+index,seriesId:'martini',seriesNumber:10+index,setting:'martini-surroundings',theme:s.location,title:s.title,story:s.story,lesson:'Rond de Martini — combineer ruimtes, personen en bezetbare meubels.',level:['','','','Gemiddeld','Pittig','Uitdagend'][s.stars],difficultyStars:s.stars,size:width,width,height,regions:s.rows.join('').split('').map(c=>c==='.'?-1:+c),areas:s.areas,areaColors:palette.slice(0,s.areas.length),areaSurfaces:s.finishes.map(f=>'garden-'+f),people:NAMES.slice(0,height).map((name,i)=>({name,role:roles[i],color:COLORS[i]})),victim:5,victimLocationClue:false,victimWeapon:['poison','candlestick','wrench'][index],portraitStyle:'mugshot',furnitureRulesVersion:2,clueVersion:1,givens:{},clues:[],printLayout:'church',printLabel:'ROND DE MARTINI',mapNoun:'omgevingskaart',mapCaption:s.caption,mapNote:'Eigen fictieve puzzelindeling, geïnspireerd op de omgeving van de Martini. Geen actuele bezoekersplattegrond of officiële samenwerking. De locaties hebben elk hun eigen kaart.',rulesNote:index===0?'Verdiepingen en terrassen vormen één uitgeklapt rooster. Iedereen krijgt een eigen rij én kolom.':'Iedereen krijgt een eigen rij én kolom; groene meubels zijn bezetbaar.',surfaceVerbs:{bench:'Zat op',rug:'Stond op'},countGroups:[['bench'],['rug'],['chair']],countLabels:{bench:'een bankje',rug:'een vloerkleed',chair:'een stoel'},generalCluesOnly:true};
  base.roomArticles=Object.fromEntries(base.areas.map(name=>[name,/terras$|^Trappenhuis$|^Gazon$/i.test(name)?'het':'de']));base.outdoorAreas=base.areas.filter(name=>/terras$|^Tuinpad$|^Gazon$|^Binnenplaats$/i.test(name));
  furnish(base,s);
  for(let attempt=0;attempt<40;attempt++){
   const p=structuredClone(base);
   try{
    buildMartiniClues(p,0,seeded(182491+index*809+attempt*1213));
    if(index>0){const target=solve(p)[0],count=p.areas.length-new Set(Object.values(target).map(c=>p.regions[c])).size;if(count)p.clues.push({type:'emptyRooms',count,text:count===1?'Precies één gebied was leeg.':`Precies ${['nul','één','twee','drie','vier'][count]||count} gebieden waren leeg.`});}
    assertGeneralCluePolicy(p);const e=explain(p);if(e.deductions.some(d=>d.searched))continue;
    if(p.clues.filter(c=>c.b!=null).length<index+2)continue;
    if(solve(p).length!==1||!valid(p,e.positions,true))throw Error('Invalid Martini surroundings solution');
    console.log(p.id,'seed',attempt,'relations',p.clues.filter(c=>c.b!=null).length);return p;
   }catch(error){if(!/Could not construct/.test(error.message)&&error.code!=='SEARCH_LIMIT')throw error;}
  }
  throw Error('Could not create Martini surroundings '+(index+1));
 });
}
