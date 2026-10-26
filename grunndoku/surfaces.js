import {gridWidth,gridHeight} from './engine.js?v=20261026-themes';
// Original, schematic floor finishes. They add atmosphere while room colours
// and thick boundaries continue to carry the puzzle information.
export function surfaceFor(p,area){
 const name=p.areas[area];
 if(p.setting==='winter'){
  if(/voordek|achterdek|scheepsruim|roef|stuurhut/i.test(name))return 'ship-wood';
  if(/pakhuis/i.test(name))return 'warehouse-tile';
  if(name==='Pomphuis')return 'cafe-tile';
  if(name==='A-brug')return 'bridge-stone';
  return 'quay-brick';
 }
 if(p.seriesId==='martini'){
  if(p.setting==='tower')return name==='Trappenhuis'?'tower-brick':/trans|entree/i.test(name)?'church-stone':'tower-wood';
  return /orgelzone|sacristie/i.test(name)?'church-wood':'church-stone';
 }
 return '';
}

// One vector pattern per finish keeps printed PDFs small.
const PATTERNS={"wood":["80 80","<path d=\"M0 0H80V27H0Z\" fill=\"#b6864c\" opacity=\".17\"/><path d=\"M0 53H80V80H0Z\" fill=\"#78522e\" opacity=\".1\"/><g fill=\"none\" stroke=\"#6f5132\" stroke-width=\"1.1\" opacity=\".35\"><path d=\"M0 1H80M0 27H80M0 53H80M0 79H80M22 1V27M61 27V53M39 53V79\"/></g><g fill=\"none\" stroke=\"#795838\" stroke-width=\".8\" opacity=\".23\"><path d=\"M0 9Q13 4 28 9T61 9T90 9M0 17Q21 22 44 16T84 17M0 36Q20 30 39 36T82 36M0 44Q24 51 46 44T85 44M0 62Q18 56 37 62T81 62M0 72Q19 77 39 71T83 73\"/><ellipse cx=\"43\" cy=\"14\" rx=\"8\" ry=\"3\"/><ellipse cx=\"18\" cy=\"67\" rx=\"6\" ry=\"2\"/></g><g fill=\"#694d31\" opacity=\".35\"><circle cx=\"18\" cy=\"5\" r=\".8\"/><circle cx=\"26\" cy=\"23\" r=\".8\"/><circle cx=\"57\" cy=\"31\" r=\".8\"/><circle cx=\"65\" cy=\"49\" r=\".8\"/></g>"],"water":["80 48","<path d=\"M0 0H80V48H0Z\" fill=\"#b8d4de\"/><g fill=\"none\" stroke=\"#628fa3\" stroke-width=\"1.3\" opacity=\".55\"><path d=\"M-20 10Q-10 4 0 10T20 10T40 10T60 10T80 10T100 10M-10 32Q0 26 10 32T30 32T50 32T70 32T90 32\"/></g><g fill=\"none\" stroke=\"#edf5ef\" stroke-width=\"1.4\" opacity=\".8\"><path d=\"M-10 17Q0 11 10 17T30 17T50 17T70 17T90 17M-20 41Q-10 35 0 41T20 41T40 41T60 41T80 41T100 41\"/></g>"],"tile":["64 64","<path d=\"M1 1H31V31H1ZM33 33H63V63H33Z\" fill=\"#56645d\" opacity=\".12\"/><path d=\"M33 1H63V31H33ZM1 33H31V63H1Z\" fill=\"#f5e8c9\" opacity=\".3\"/><path d=\"M0 0H64M0 32H64M0 64H64M0 0V64M32 0V64M64 0V64\" stroke=\"#6d7166\" stroke-width=\"1.5\" opacity=\".4\"/><path d=\"M3 4H27M36 36H59M5 26H12M45 58H55\" stroke=\"#f5f0dd\" opacity=\".4\"/>"],"stone":["96 80","<path d=\"M1 1H47V39H1ZM49 41H95V79H49Z\" fill=\"#647067\" opacity=\".1\"/><path d=\"M49 1H95V39H49ZM1 41H47V79H1Z\" fill=\"#fff2cc\" opacity=\".25\"/><g fill=\"none\" stroke=\"#6e7165\" stroke-width=\"1.4\" opacity=\".35\"><path d=\"M0 0H96M0 40H96M0 80H96M0 0V80M48 0V80M96 0V80\"/></g><g fill=\"none\" stroke=\"#7a796b\" opacity=\".16\" stroke-width=\".8\"><path d=\"M5 10L18 6L27 9M63 16L71 12L85 17M14 63L23 58L36 61M57 73L75 67L90 69M35 23L40 27L37 34\"/></g><g fill=\"#777767\" opacity=\".13\"><circle cx=\"11\" cy=\"26\" r=\"1\"/><circle cx=\"66\" cy=\"29\" r=\"1.3\"/><circle cx=\"32\" cy=\"54\" r=\"1\"/><circle cx=\"79\" cy=\"53\" r=\"1.1\"/></g>"],"brick":["64 48","<path d=\"M0 0H32V16H0ZM32 16H64V32H32ZM0 32H32V48H0Z\" fill=\"#9d6c46\" opacity=\".15\"/><g fill=\"none\" stroke=\"#735f48\" stroke-width=\"1.2\" opacity=\".36\"><path d=\"M0 0H64M0 16H64M0 32H64M0 48H64M0 0V16M32 0V16M64 0V16M16 16V32M48 16V32M0 32V48M32 32V48M64 32V48\"/></g><path d=\"M4 4H26M36 20H58M4 36H26\" stroke=\"#f6dfb7\" stroke-width=\"1\" opacity=\".3\"/>"],"cafe":["64 64","<path d=\"M0 0H64V64H0Z\" fill=\"#f1dfb8\" opacity=\".14\"/><path d=\"M0 0H32V32H0ZM32 32H64V64H32Z\" fill=\"#66756c\" opacity=\".14\"/><path d=\"M32 9L55 32L32 55L9 32Z\" fill=\"none\" stroke=\"#86734e\" stroke-width=\"1.3\" opacity=\".35\"/><path d=\"M0 0H64V64H0ZM32 0V64M0 32H64\" fill=\"none\" stroke=\"#777566\" opacity=\".28\"/>"]};
const FINISHES={'ship-wood':'wood','church-wood':'wood','tower-wood':'wood','warehouse-tile':'tile','church-stone':'stone','bridge-stone':'stone','quay-brick':'brick','tower-brick':'brick','cafe-tile':'cafe'};
let planeSequence=0;
export function printFloorPlane(p){
 const finishes=p.areas.map((_,a)=>FINISHES[surfaceFor(p,a)]),used=new Set(finishes.filter(Boolean));
 if(p.mapBackdrop==='water')used.add('water');if(!used.size)return '';
 const id=`floor-${++planeSequence}`,width=gridWidth(p),height=gridHeight(p);
 const defs=[...used].map(key=>{const [view,body]=PATTERNS[key],[w,h]=view.split(' ');return `<pattern id="${id}-${key}" patternUnits="userSpaceOnUse" width="${w}" height="${h}" patternTransform="scale(2)">${body}</pattern>`;}).join('');
 const tiles=p.regions.map((area,c)=>{
  const finish=area<0?(p.mapBackdrop==='water'?'water':null):finishes[area];if(!finish)return '';
  const xy=`x="${c%width*100}" y="${Math.floor(c/width)*100}" width="100" height="100"`;
  return `${area>=0?`<rect ${xy} fill="${p.areaColors?.[area]||'#ded2b5'}"/>`:''}<rect ${xy} fill="url(#${id}-${finish})"/>`;
 }).join('');
 return `<svg class="floor-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width*100} ${height*100}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${defs}</defs>${tiles}</svg>`;
}
