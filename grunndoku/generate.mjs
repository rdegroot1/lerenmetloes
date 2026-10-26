import {createMartiniSeries,createTowerSeries} from './martini.mjs';
import {solve} from './engine.js';
import {enrichNight} from './enrich-night.mjs';
import {enrichCity} from './enrich-city.mjs';
import {difficultyFor} from './difficulty.js';
import {writeFileSync} from 'node:fs';
let seed=18742;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const shuffle=a=>a.map(x=>[rand(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const names=['Arend','Bertus','Cora','Tammo','Geeske','Fokko'],roles=['de barista','de fietsenmaker','de student','de marktkoopman','de stadsgids','de muzikant'];
const specs=[
 [4,'Je eerste zaak','Heel makkelijk','Bij d’Olle Grieze','Na de bloemenmarkt wordt Tammo gevonden bij de Martinitoren. Twee getuigen staan al op de kaart. Kun jij de andere twee plaatsen?',2],
 [4,'Zelf op onderzoek','Makkelijk','Een eierbal te veel','Een laatste rondje langs de kraampjes op de Vismarkt. Tammo komt niet thuis. Wie was er nog bij hem?',0],
 [5,'Goed kijken','Rustig puzzelen','Stilte in het plantsoen','Geeske wilde nog even wandelen door het Noorderplantsoen. Bij het bankje wordt haar tas gevonden. De getuigen vertellen waar ze waren.',0],
 [5,'Verbanden leggen','Gemiddeld','Het geheim van ome Loeks','Bij het Peerd van ome Loeks wachtte Geeske op een oude bekende. Het afgesproken gesprek nam een duistere wending.',0],
 [6,'Een stap verder','Pittig','Schaduwen aan de A','De pakhuizen aan de Hoge der A spiegelen in het water. Fokko zou hier optreden, maar wordt vlak voor het concert dood gevonden.',0],
 [6,'Stadse speurneus','Uitdagend','De nacht van de Grunneger vlag','Tijdens een stadsfeest verdwijnt Fokko uit de menigte. Van de Martinitoren tot de kade wijzen de verklaringen alle kanten op.',0],
 [5,'Aan het water','Gemiddeld','Een spoor in het zand','Een zonnige middag bij de Hoornseplas eindigt met een vreemde vondst. Geeske werd voor het laatst gezien bij het water. Wie bleef er achter?',0],
 [5,'Tussen bomen en muziek','Gemiddeld','De stille muziekkoepel','In het Stadspark is het concert afgelopen, maar Geeske heeft haar fiets niet opgehaald. Vijf verhalen vertellen wat er die avond gebeurde.',0],
 [6,'Een ommetje door het groen','Pittig','Onder de oude bomen','Het Noorderplantsoen ligt er rustig bij. Fokko wilde nog een rondje wandelen. Een achtergelaten jas zet de recherche op een spoor.',0],
 [6,'Na sluitingstijd','Pittig','De laatste ronde','Een volledig verzonnen nachtelijk mysterie tussen de Groningse kroegen. Fokko zou bij de anderen aansluiten, maar zijn stoel blijft leeg.',0],
 [6,'Achter de festivallichten','Uitdagend','Toen de lampjes doofden','Het is festivalavond in het plantsoen. Als de laatste lampjes uitgaan, ontbreekt Fokko. De getuigen wijzen naar verschillende plekken op het terrein.',0],
 [6,'Het nachtelijke sluitstuk','Uitdagend','Een alibi aan de bar','Een fictieve kroegentocht door Stad: een vergeten sjaal, een laatste drankje en zes verklaringen. Waar was Fokko toen de groep uit elkaar ging?',0],
 [6,'Een raadsel op de wierde','Pittig','De scheur in het alibi','In een fictief Gronings wierdedorp bekijken de bewoners de versterkte huizen. Fokko blijft na de rondleiding achter. Zijn notitieboek wordt gevonden, maar zijn verhaal mist een bladzijde.',0],
 [6,'Gronings Ontzet','Pittig','Na het laatste kanonschot','Stad viert Bommen Berend. Tussen vlaggen, muziek en de laatste eierballen verdwijnt Fokko uit beeld. Zes verklaringen vertellen wie waar was.',0],
 [6,'Van optreden naar optreden','Uitdagend','Het vergeten toegangsbandje','Het is Eurosonic in Stad. Na een avond vol optredens blijft Fokko’s toegangsbandje achter bij de garderobe. Wie heeft hem na de soundcheck nog gezien?',0],
 [6,'Theater tussen de bomen','Uitdagend','Achter het tentdoek','Noorderzon vult het plantsoen met licht en verhalen. Maar achter het tentdoek klopt één verhaal niet. Fokko was op weg naar de laatste voorstelling.',0],
 [6,'Een winteravond aan de A','Uitdagend','Het licht in de roef','Bij WinterWelVaart glinsteren de lichtjes langs de kade. Op een aangemeerd schip is Fokko’s sjaal blijven liggen. De laatste bezoekers spreken elkaar tegen.',0],
 [6,'Achter het rode doek','Pittig','De laatste buiging','De voorstelling in de Stadsschouwburg is afgelopen. Fokko zou nog een toegift spelen, maar zijn muziek blijft op de lessenaar liggen. Wie bleef er na het applaus achter?',0],
 [6,'Tussen silo en fabriekshal','Uitdagend','Het terrein na middernacht','Op het voormalige Suikerunieterrein dooft de verlichting van een evenement. Fokko’s sleutelbos ligt bij de machinekamer. Zes verklaringen laten een heel ander terrein zien.',0],
 [6,'Van bioscoop tot dakterras','Uitdagend','De verdwenen filmrecensie','Een filmavond in het Forum eindigt met een ongelezen recensie. Fokko wilde nog even naar boven. Welke route volgden de bezoekers tussen bioscoop, bieb en dakterras?',0],
 [6,'Een nacht aan de Korreweg','Uitdagend','De krat die bleef staan','Een fictief studentenhuis aan de Korreweg: een afwasrooster, een kapotte bank en veel te veel bierkratten. Na het huisfeest is Fokko’s gitaar er nog, maar hijzelf niet.',0]
];
const types=[['tower','de Martinitoren'],['eierbal','de eierballenkraam'],['loeks','het Peerd van ome Loeks'],['flag','de Groningse vlag'],['tree','een boom'],['bike','een fietsrek'],['bench','een bankje'],['stall','een viskraam']];
// Connected city districts with lanes, L-shapes and stepped boundaries.
// The first tutorial deliberately retains its simple four districts.
const layouts=[
 ['0011','0011','2233','2233'],
 ['0011','0211','0221','2233'],
 ['00011','00211','02221','33221','33331'],
 ['00111','00021','30221','33221','33321'],
 ['000111','002211','002211','032221','333221','333331'],
 ['001111','000211','302221','332221','333221','333331'],
 ['00011','00211','02221','33221','33331'],
 ['00111','00021','30221','33221','33321'],
 ['000111','002211','002211','032221','333221','333331'],
 ['001111','000211','302221','332221','333221','333331'],
 ['000111','002211','002221','032221','333211','333331'],
 ['001111','000211','302211','332221','333221','333331'],
 ['000111','002211','022211','032221','333221','333331'],
 ['111000','112200','112220','122230','122333','133333'],
 ['001111','000211','302211','332221','333221','443331'],
 ['400111','402211','002221','032221','333211','333331'],
 ['001111','000211','302211','332221','333221','443331'],
 ['.0011.','000111','002211','332244','333244','.3334.'],
 ['..0011','.00011','330211','33222.','33324.','.3344.'],
 ['..011.','.00011','330211','332244','.32244','..224.'],
 ['00011.','000211','332211','332244','.32244','.3334.']
];
const themes=[
 null,null,null,null,null,null,
 {name:'Hoornseplas',areas:['Zandstrand','Zwemsteiger','Rietkraag','Strandpaviljoen'],types:[['parasol','een parasol'],['reeds','een rietpol'],['bench','een bankje'],['bike','een fietsrek'],['flag','de Groningse vlag']]},
 {name:'Stadspark',areas:['Vijver','Kinderboerderij','Drafbaan','Muziekkoepel'],types:[['tree','een boom'],['bench','een bankje'],['stage','het podium'],['bike','een fietsrek'],['lamp','een lantaarn']]},
 {name:'Noorderplantsoen',areas:['Zonneweide','Eendenvijver','Wandelpad','Muziekkoepel'],types:[['tree','een boom'],['reeds','een rietpol'],['bench','een bankje'],['lamp','een lantaarn'],['bike','een fietsrek']]},
 {name:'Uitgaan in Stad',areas:['De Negende Cirkel','Het Pakhuis','De Drie Gezusters','Huize Maas'],types:[['bar','de bar'],['stage','het podium'],['lamp','een lantaarn'],['bike','een fietsrek'],['eierbal','de eierballenkraam']]},
 {name:'Festival in het groen',areas:['Spiegeltent','Festivalweide','Foodtrucks','Waterkant'],types:[['stage','het podium'],['parasol','een parasol'],['lamp','een lantaarn'],['tree','een boom'],['eierbal','de eierballenkraam']]},
 {name:'De kroegentocht',areas:['De Pintelier','Café De Toeter','Het Pakhuis','De Negende Cirkel'],types:[['bar','de bar'],['lamp','een lantaarn'],['bike','een fietsrek'],['stage','het podium'],['eierbal','de eierballenkraam']]},
 {name:'Het aardbevingsdorp',areas:['Dorpsplein','Versterkingskeet','Dorpskerk','Dorpscafé'],types:[['scaffold','de bouwsteiger'],['bench','een bankje'],['flag','de Groningse vlag'],['bike','een fietsrek'],['lamp','een lantaarn']]},
 {name:'Bommen Berend',areas:['Grote Markt','Ossenmarkt','Vismarkt','Noorderhaven'],types:[['cannon','het kanon'],['flag','de Groningse vlag'],['eierbal','de eierballenkraam'],['stage','het podium'],['lamp','een lantaarn']]},
 {name:'Eurosonic',areas:['Vera','Simplon','Concertzaal','Backstage','Garderobe'],types:[['guitar','een gitaar'],['stage','het podium'],['bar','de bar'],['lamp','een lantaarn'],['bike','een fietsrek']]},
 {name:'Noorderzon',areas:['Spiegeltent','Muziektent','Eettentjes','Vijverrand','Backstage'],types:[['tent','de festivaltent'],['stage','het podium'],['tree','een boom'],['lamp','een lantaarn'],['bar','de bar']]},
 {name:'WinterWelVaart',areas:['Hoge der A','Lage der A','Scheepsruim','Winterkade','Roef'],types:[['ship','een schip'],['winterstall','een winterkraam'],['lamp','een lantaarn'],['bar','de bar'],['bench','een bankje']]},
 {name:'Stadsschouwburg',areas:['Foyer','Stalles','Orkestbak','Toneel','Balkon'],types:[['curtain','het toneeldoek'],['seat','een theaterstoel'],['stage','het podium'],['guitar','een gitaar'],['bar','de bar'],['lamp','een lantaarn']],roles:['de toneelmeester','de belichter','de actrice','de kaartcontroleur','de garderobemedewerker','de muzikant']},
 {name:'Suikerunieterrein',areas:['Fabriekshal','Silo’s','Binnenplaats','Festivalterrein','Machinekamer'],types:[['silo','een silo'],['scaffold','de bouwsteiger'],['stage','het podium'],['crate','een opslagkrat'],['bench','een bankje'],['lamp','een lantaarn']],roles:['de terreinbeheerder','de monteur','de fotograaf','de evenementenbouwer','de rondleider','de geluidstechnicus']},
 {name:'Het Forum',areas:['Entree','Bioscoop','Bibliotheek','Expositie','Dakterras'],types:[['books','een boekenkast'],['projector','de filmprojector'],['seat','een bioscoopstoel'],['bench','een bankje'],['bar','de bar'],['lamp','een lantaarn']],roles:['de filmoperateur','de technicus','de bibliothecaris','de bezoeker','de gastvrouw','de recensent']},
 {name:'Studentenhuis Korreweg',areas:['Keuken','Huiskamer','Gang','Studentenkamer','Balkon'],types:[['beercrate','een bierkrat'],['sofa','de bank'],['guitar','een gitaar'],['bike','een fietsrek'],['bar','de keukenbar'],['books','een boekenkast']],roles:['de huisoudste','de eeuwige student','de geneeskundestudent','de feestcommissie','de rechtenstudent','de bandgitarist']}
];
const cases=[];
for(let k=0;k<specs.length;k++){
 const [size,lesson,level,title,story,givenCount]=specs[k],total=size*size;
 const theme=themes[k];
 const areas=theme?.areas||['Grote Markt','Vismarkt','Noorderplantsoen','Hoge der A'];
 const localTypes=theme?.types||types;
 const regions=layouts[k].flatMap(row=>[...row].map(c=>c==='.'?-1:Number(c)));
 let target;do{const columns=shuffle(Array.from({length:size},(_,i)=>i));const people=k<6?Array.from({length:size},(_,i)=>i):shuffle(Array.from({length:size},(_,i)=>i));target=Object.fromEntries(people.map((who,r)=>[who,r*size+columns[r]]));}while(Object.values(target).some(c=>regions[c]<0)||Object.values(target).filter(c=>regions[c]===regions[target[size-1]]).length!==2);
 const objectCells=shuffle(Array.from({length:total},(_,i)=>i).filter(c=>regions[c]>=0&&!Object.values(target).includes(c))).slice(0,([4,4,5,6,8,9][k]||8));
 const objects=objectCells.map((cell,i)=>({cell,type:localTypes[(i+k)%localTypes.length][0],name:localTypes[(i+k)%localTypes.length][1]}));
 const givens=Object.fromEntries(Object.entries(target).slice(0,givenCount));
 const p={id:k===0?'stad-v2-1':k<6?`stad-v3-${k+1}`:`stad-thema-v1-${k+1}`,number:k+1,clueVersion:[1,1,1,2,1,3][k]||1,theme:theme?.name||null,title,story,lesson,level,size,regions,areas,people:names.slice(0,size).map((name,i)=>({name,role:(theme?.roles||roles)[i],color:['#b44d39','#437c78','#89703e','#6b6085','#3e7050','#8f5769'][i]})),objects,victim:size-1,givens,clues:[]};
 if(k>=17){p.seriesId='nacht';p.portraitStyle='mugshot';p.victimLocationClue=false;}
 const cells=Array.from({length:total},(_,i)=>i).filter(c=>regions[c]>=0),pool=[];
 const unary=(a,text,pred)=>{const allowed=cells.filter(pred);if(allowed.includes(target[a])&&allowed.length<total&&allowed.length)pool.push({type:'unary',a,text,cells:allowed});};
 for(let a=0;a<size;a++){
  if(a in givens)continue;
  unary(a,`Bevond zich in het gebied ${areas[regions[target[a]]]}.`,c=>regions[c]===regions[target[a]]);
  unary(a,'Stond in een hoek van de kaart.',c=>[0,size-1].includes(Math.floor(c/size))&&[0,size-1].includes(c%size));
  unary(a,'Stond in de bovenste rij.',c=>c<size);
  unary(a,'Stond in de onderste rij.',c=>c>=total-size);
  unary(a,'Stond in de eerste of laatste kolom.',c=>[0,size-1].includes(c%size));
  for(const [type,name]of localTypes){
   const near=c=>objects.some(o=>o.type===type&&regions[c]===regions[o.cell]&&Math.abs(Math.floor(c/size)-Math.floor(o.cell/size))+Math.abs(c%size-o.cell%size)===1);
   unary(a,`Stond naast ${name}.`,near);
   if(k>=3)unary(a,`Stond niet naast ${name}.`,c=>!near(c));
  }
  if(k>=2)for(let b=a+1;b<size;b++){
   const above=Math.floor(target[a]/size)<Math.floor(target[b]/size);pool.push({type:'above',a:above?a:b,b:above?b:a,text:`Stond hoger op de kaart dan ${names[above?b:a]}.`});
   if(k>=3){const left=target[a]%size<target[b]%size;pool.push({type:'left',a:left?a:b,b:left?b:a,text:`Stond links van ${names[left?b:a]}.`});}
   if(k>=4){const same=regions[target[a]]===regions[target[b]];pool.push({type:same?'same':'different',a,b,text:`Was ${same?'in hetzelfde gebied als':'in een ander gebied dan'} ${names[b]}.`});}
  }
 }
 // Readable row clues are a fallback for the introductory, unary-only puzzles.
 const ordered=shuffle(pool).filter(c=>!(c.type==='same'&&(c.a===p.victim||c.b===p.victim))&&(k<17||c.a!==p.victim));
 if(k===2){const i=ordered.findIndex(c=>c.type==='above');ordered.unshift(...ordered.splice(i,1));}
 for(let a=0;a<size;a++)if(!(a in givens)&&(k<17||a!==p.victim))ordered.push({type:'unary',a,text:`Bevond zich in rij ${Math.floor(target[a]/size)+1}.`,cells:cells.filter(c=>Math.floor(c/size)===Math.floor(target[a]/size))});
 for(let a=0;a<size;a++)if(!(a in givens)&&(k<17||a!==p.victim))ordered.push({type:'unary',a,text:`Bevond zich in kolom ${target[a]%size+1}.`,cells:cells.filter(c=>c%size===target[a]%size)});
 for(const clue of ordered){if(solve(p,givens,2).length===1)break;p.clues.push(clue);}
 for(let i=p.clues.length-1;i>=0;i--){if(k===2&&p.clues[i].type==='above'&&p.clues.filter(c=>c.type==='above').length===1)continue;const [clue]=p.clues.splice(i,1);if(solve(p,givens,2).length!==1)p.clues.splice(i,0,clue);}
 // The victim always gets a real location clue, in addition to the victim rule.
 if(k<17&&!p.clues.some(c=>c.a===p.victim&&c.type==='unary')){
  const victimClue=pool.filter(c=>c.a===p.victim&&c.type==='unary').sort((a,b)=>a.cells.length-b.cells.length)[0];
  if(!victimClue)throw Error('Geen plaatsaanwijzing voor slachtoffer');
  p.clues.push(victimClue);
 }
 if(solve(p,givens,2).length!==1)throw Error('Niet uniek');
 if(k>=17)enrichNight(p,k-17);else enrichCity(p,k);
 p.difficultyStars=difficultyFor(p);
 cases.push(p);console.log(p.number,size,level,p.clues.length,'clues',p.clues.filter(c=>c.type!=='unary').length,'relations');
}
cases.push(...createMartiniSeries(),...createTowerSeries());
writeFileSync(new URL('./puzzles.json',import.meta.url),JSON.stringify(cases,null,2)+'\n');
