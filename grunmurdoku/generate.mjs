import {solve} from './engine.js';
import {writeFileSync} from 'node:fs';
let state=76123;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/2**32);
const shuffle=a=>a.map(x=>[rand(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const names=['Lieke','Bram','Fenna','Jurre','Sanne','Mees'];
const roles=['de barista','de fietsenmaker','de student','de marktkoopman','de stadsgids','de muzikant'];
const stories=[['De laatste ronde','Na het sluiten van de terrassen wordt een muzikant dood aangetroffen. Zes getuigen, vier plekken en één verhaal dat niet klopt.'],['Mist boven de markt','Een ochtend vol marktkramen en koffie. Maar tussen de leveringen door is iemand verdwenen.'],['Een stille zondag','De stad komt langzaam op gang. In het plantsoen blijkt de rust bedrieglijk.'],['Het verdwenen optreden','De soundcheck is klaar, de artiest komt nooit opdagen. Wat gebeurde er op weg naar het podium?'],['Nacht in Stad','De laatste fietsers rijden naar huis. Eén van de zes heeft meer te verbergen dan een gestolen fiets.']];
const cases=[];
for(let k=0;k<stories.length;k++){
 const size=6, regions=Array.from({length:36},(_,c)=>Math.floor(c/6)<3?(c%6<3?0:1):(c%6<3?2:3));
 let target;
 do{target=Object.fromEntries(shuffle([0,1,2,3,4,5]).map((c,r)=>[r,r*6+c]));}while(Object.values(target).filter(c=>regions[c]===regions[target[5]]).length!==2);
 const occupied=Object.values(target);
 const objectCells=shuffle(Array.from({length:36},(_,i)=>i).filter(c=>!occupied.includes(c))).slice(0,8);
 const types=[['tree','boom','🌳'],['stall','marktkraam','🍎'],['bike','fietsrek','🚲'],['bench','bankje','🪑']];
 const objects=objectCells.map((cell,i)=>({cell,type:types[i%4][0],name:types[i%4][1],icon:types[i%4][2]}));
 const p={id:`zaak-${k+1}`,number:k+1,title:stories[k][0],story:stories[k][1],size,regions,areas:['Grote Markt','Vismarkt','Noorderplantsoen','Hoge der A'],people:names.map((name,i)=>({name,role:roles[i],color:['#b44d39','#437c78','#89703e','#6b6085','#3e7050','#8f5769'][i]})),objects,victim:5,clues:[]};
 const cells=Array.from({length:36},(_,i)=>i),pool=[];
 const unary=(a,text,pred)=>{const allowed=cells.filter(pred);if(allowed.includes(target[a])&&allowed.length<30&&allowed.length>0)pool.push({type:'unary',a,text,cells:allowed});};
 for(let a=0;a<6;a++){
  unary(a,`Bevond zich op ${p.areas[regions[target[a]]]}.`,c=>regions[c]===regions[target[a]]);
  unary(a,'Stond aan de buitenrand van de kaart.',c=>Math.floor(c/6)===0||Math.floor(c/6)===5||c%6===0||c%6===5);
  unary(a,'Stond niet aan de buitenrand van de kaart.',c=>Math.floor(c/6)>0&&Math.floor(c/6)<5&&c%6>0&&c%6<5);
  unary(a,'Bevond zich in de bovenste helft van de kaart.',c=>c<18);
  unary(a,'Bevond zich in de onderste helft van de kaart.',c=>c>=18);
  unary(a,'Bevond zich in de linkerhelft van de kaart.',c=>c%6<3);
  unary(a,'Bevond zich in de rechterhelft van de kaart.',c=>c%6>=3);
  for(const [type,name]of types){
   const near=c=>objects.some(o=>o.type===type&&regions[c]===regions[o.cell]&&Math.abs(Math.floor(c/6)-Math.floor(o.cell/6))+Math.abs(c%6-o.cell%6)===1);
   unary(a,`Stond naast een ${name}.`,near);
   unary(a,`Stond niet naast een ${name}.`,c=>!near(c));
  }
  for(let b=a+1;b<6;b++){
   const above=Math.floor(target[a]/6)<Math.floor(target[b]/6);pool.push({type:'above',a:above?a:b,b:above?b:a,text:`Stond hoger op de kaart dan ${names[above?b:a]}.`});
   const left=target[a]%6<target[b]%6;pool.push({type:'left',a:left?a:b,b:left?b:a,text:`Stond links van ${names[left?b:a]}.`});
   const same=regions[target[a]]===regions[target[b]];pool.push({type:same?'same':'different',a,b,text:`Bevond zich ${same?'in hetzelfde gebied als':'in een ander gebied dan'} ${names[b]}.`});
  }
 }
 for(const clue of shuffle(pool)){if(solve(p,{},2).length===1)break;p.clues.push(clue);}
 if(solve(p,{},2).length!==1)throw Error('Geen unieke puzzel');
 // Remove redundant statements while preserving the single solution.
 for(let i=p.clues.length-1;i>=0;i--){const [clue]=p.clues.splice(i,1);if(solve(p,{},2).length!==1)p.clues.splice(i,0,clue);}
 cases.push(p);console.log(p.id,p.clues.length,'aanwijzingen');
}
writeFileSync(new URL('./puzzles.json',import.meta.url),JSON.stringify(cases,null,2)+'\n');
