export const THEMES={
 stad:{title:'Stadse speurtochten',eyebrow:'STAD EN OMMELAND',description:'Van de Grote Markt tot het plantsoen. Begin klein en speur steeds verder.',detail:'17 zaken · van makkelijk naar uitdagend',pdf:'grunndoku-stadse-speurtochten.pdf',button:'classicSeries',art:['tower','tree']},
 nacht:{title:'Nacht in Stad',eyebrow:'NA HET LAATSTE LICHT',description:'Ontrafel geheimen in de schouwburg, op het Suikerunieterrein, in het Forum en aan de Korreweg.',detail:'4 locaties · nachtelijke dossiers',pdf:'grunndoku-nacht-in-stad.pdf',button:'nightSeries',art:['lamp','books']},
 martini:{title:'Moord in de Martini',eyebrow:'KERK, TOREN EN OMGEVING',description:'Speur door kerk en toren en volg de sporen naar De Kostery, de Prinsentuin en Prinsenhof.',detail:'12 zaken · kerk, toren en drie zaken rond de Martini',pdf:'grunndoku-moord-in-de-martini.pdf',button:'martiniSeries',art:['churchOrgan','towerBell']},
 noorderzon:{title:'Noorderzon',eyebrow:'NA DE LAATSTE VOORSTELLING',description:'Acht zaken tussen tentdoeken, foodtrucks, bomen en vijverlichtjes. Van een kleine eerste zaak tot compacte denkpuzzels.',detail:'8 zaken · vijf niveaus · allemaal op één A4',pdf:'grunndoku-noorderzon.pdf',button:'noorderzonSeries',art:['festivalFoodtruck','festivalGate']},
 winter:{title:'WinterWelVaart',eyebrow:'SCHEPEN EN WINTERSE KADES',description:'Aan boord, bij de glühwein en langs de A. Een winterse reeks die uitgroeit tot een XXL-zaak.',detail:'6 niveaus · van de roef tot de hele A',pdf:'grunndoku-winterwelvaart.pdf',button:'winterSeries',art:['winterWheel','winterFire']}
};
export const TUTORIAL={
 id:'tutorial',number:0,size:4,seriesId:'martini',portraitStyle:'mugshot',difficultyStars:1,
 regions:[0,0,1,1,0,0,1,1,2,2,1,1,2,2,1,1],areas:['Westzaal','Koor','Zijruimte'],
 areaColors:['#ddd0b1','#c8d3cf','#d8c9ba'],
 people:[{name:'Arend',role:'de koster',color:'#a95c42'},{name:'Bertus',role:'de organist',color:'#497c78'},{name:'Cora',role:'de bezoekster',color:'#847341'},{name:'Fokko',role:'het slachtoffer',color:'#8c5964',portraitIndex:5}],
 victim:3,victimLocationClue:false,victimWeapon:'wrench',givens:{0:0,1:6},
 objects:[{cell:3,type:'churchOrgan',name:'het orgel',occupiable:false,furnitureId:'tutorial-organ',tile:{x:0,y:0,width:1,height:2}},{cell:7,type:'churchOrgan',name:'het orgel',occupiable:false,furnitureId:'tutorial-organ',tile:{x:0,y:1,width:1,height:2}},{cell:5,type:'churchColumn',name:'een zuil',occupiable:false},{cell:9,type:'churchPew',name:'een kerkbank',occupiable:true},{cell:12,type:'churchLectern',name:'een lessenaar',occupiable:false}],
 clues:[{type:'onObject',a:2,types:['churchPew'],text:'Zat op een kerkbank.'}]
};

export function tutorialFor({series='stad',church=false,tower=false,winter=false}={}){
 const theme=tower?'tower':winter?'winter':church?'martini':series;
 const p=structuredClone(TUTORIAL);p.id='tutorial-'+theme;
 if(theme==='martini')return p;
 const sets={
  stad:{areas:['Grote Markt','Vismarkt','Noorderplantsoen'],prop:['eierbal','de eierballenkraam'],other:['flag','de vlag'],end:['tree','een boom'],seat:['chair','een stoel','Zat op een stoel.']},
  nacht:{areas:['Foyer','Bioszaal','Leeshoek'],prop:['books','de boekenkast'],other:['table','de tafel'],end:['lamp','een lamp'],seat:['chair','een stoel','Zat op een stoel.']},
  winter:{areas:['Voordek','Roef','Achterdek'],prop:['winterCrate','de scheepskist'],other:['winterMast','de mast'],end:['lamp','een lantaarn'],seat:['bench','een bankje','Zat op een bankje.']},
  noorderzon:{areas:['Tententree','Podium','Festivalweide'],prop:['festivalSpeaker','de luidspreker'],other:['festivalLights','de lichtmast'],end:['tree','een boom'],seat:['bench','een bankje','Zat op een bankje.']},
  tower:{areas:['Filmzolder','Klokkenzolder','Torenentree'],prop:['towerBell','de luidklok'],other:['towerClock','het uurwerk'],end:['towerChest','de gereedschapskist'],seat:['towerStairs','de wenteltrap','Stond op de wenteltrap.']}
 };
 const spec=sets[theme]||sets.stad;p.areas=spec.areas;p.seriesId=theme==='tower'?'martini':theme;
 if(theme==='winter')p.setting='winter';if(theme==='tower')p.setting='tower';
 p.objects=p.objects.map(o=>{const [type,name]=o.cell===3||o.cell===7?spec.prop:o.cell===5?spec.other:o.cell===12?spec.end:spec.seat;return {...o,type,name};});
 p.clues=[{type:'onObject',a:2,types:[spec.seat[0]],text:spec.seat[2]}];return p;
}
