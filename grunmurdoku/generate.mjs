import {solve} from './engine.js';
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
 [6,'Stadse speurneus','Uitdagend','De nacht van de Grunneger vlag','Tijdens een stadsfeest verdwijnt Fokko uit de menigte. Van de Martinitoren tot de kade wijzen de verklaringen alle kanten op.',0]
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
 ['001111','000211','302221','332221','333221','333331']
];
const cases=[];
for(let k=0;k<specs.length;k++){
 const [size,lesson,level,title,story,givenCount]=specs[k],total=size*size;
 const areas=['Grote Markt','Vismarkt','Noorderplantsoen','Hoge der A'];
 const regions=layouts[k].flatMap(row=>[...row].map(Number));
 let target;do{target=Object.fromEntries(shuffle(Array.from({length:size},(_,i)=>i)).map((c,r)=>[r,r*size+c]));}while(Object.values(target).filter(c=>regions[c]===regions[target[size-1]]).length!==2);
 const objectCells=shuffle(Array.from({length:total},(_,i)=>i).filter(c=>!Object.values(target).includes(c))).slice(0,[4,4,5,6,8,9][k]);
 const objects=objectCells.map((cell,i)=>({cell,type:types[(i+k)%types.length][0],name:types[(i+k)%types.length][1]}));
 const givens=Object.fromEntries(Object.entries(target).slice(0,givenCount));
 const p={id:k===0?'stad-v2-1':`stad-v3-${k+1}`,number:k+1,clueVersion:k===5?2:1,title,story,lesson,level,size,regions,areas,people:names.slice(0,size).map((name,i)=>({name,role:roles[i],color:['#b44d39','#437c78','#89703e','#6b6085','#3e7050','#8f5769'][i]})),objects,victim:size-1,givens,clues:[]};
 const cells=Array.from({length:total},(_,i)=>i),pool=[];
 const unary=(a,text,pred)=>{const allowed=cells.filter(pred);if(allowed.includes(target[a])&&allowed.length<total&&allowed.length)pool.push({type:'unary',a,text,cells:allowed});};
 for(let a=0;a<size;a++){
  if(a in givens)continue;
  unary(a,`Bevond zich in het gebied ${areas[regions[target[a]]]}.`,c=>regions[c]===regions[target[a]]);
  unary(a,'Stond in een hoek van de kaart.',c=>[0,size-1].includes(Math.floor(c/size))&&[0,size-1].includes(c%size));
  unary(a,'Stond in de bovenste rij.',c=>c<size);
  unary(a,'Stond in de onderste rij.',c=>c>=total-size);
  unary(a,'Stond in de eerste of laatste kolom.',c=>[0,size-1].includes(c%size));
  for(const [type,name]of types){
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
 const ordered=shuffle(pool).filter(c=>!(c.type==='same'&&(c.a===p.victim||c.b===p.victim)));
 if(k===2){const i=ordered.findIndex(c=>c.type==='above');ordered.unshift(...ordered.splice(i,1));}
 for(let a=0;a<size;a++)if(!(a in givens))ordered.push({type:'unary',a,text:`Bevond zich in rij ${Math.floor(target[a]/size)+1}.`,cells:cells.filter(c=>Math.floor(c/size)===Math.floor(target[a]/size))});
 for(let a=0;a<size;a++)if(!(a in givens))ordered.push({type:'unary',a,text:`Bevond zich in kolom ${target[a]%size+1}.`,cells:cells.filter(c=>c%size===target[a]%size)});
 for(const clue of ordered){if(solve(p,givens,2).length===1)break;p.clues.push(clue);}
 for(let i=p.clues.length-1;i>=0;i--){if(k===2&&p.clues[i].type==='above'&&p.clues.filter(c=>c.type==='above').length===1)continue;const [clue]=p.clues.splice(i,1);if(solve(p,givens,2).length!==1)p.clues.splice(i,0,clue);}
 if(solve(p,givens,2).length!==1)throw Error('Niet uniek');
 cases.push(p);console.log(p.number,size,level,p.clues.length,'clues',p.clues.filter(c=>c.type!=='unary').length,'relations');
}
writeFileSync(new URL('./puzzles.json',import.meta.url),JSON.stringify(cases,null,2)+'\n');
