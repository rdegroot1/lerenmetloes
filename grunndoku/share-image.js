import {gridWidth,gridHeight} from './engine.js?v=20261027-accounts';
import {objectArt} from './art.js?v=20261027-accounts';
import {areaLabels} from './view.js?v=20261027-accounts';
import {printFloorPlane} from './surfaces.js?v=20261027-accounts';
import {festivalDecoration} from './festival-art.js?v=20261027-accounts';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const nested=(svg,x,y,width,height)=>svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${width}" height="${height}" `);
// Render only public map data. Never accept positions, notes, a save or a DOM
// screenshot: the completed board must not accidentally appear in the image.
export function emptyMapSvg(p){
 const w=gridWidth(p),h=gridHeight(p),scale=Math.min(1100/(w*100),1650/(h*100)),height=Math.ceil(h*100*scale+265),left=(1200-w*100*scale)/2;
 const colors=['#dddcb7','#edd7b5','#d6dfcb','#c9d8d6','#e2cbbc','#d7d0dd'];
 const tiles=p.regions.map((area,c)=>area<0?'':`<rect x="${c%w*100}" y="${Math.floor(c/w)*100}" width="100" height="100" fill="${escape(p.areaColors?.[area]||colors[area%colors.length])}"/>`).join('');
 const grid=p.regions.map((area,c)=>{
  if(area<0)return '';const x=c%w*100,y=Math.floor(c/w)*100;
  let lines=`<rect x="${x}" y="${y}" width="100" height="100" fill="none" stroke="#777965" stroke-opacity=".45" stroke-width="1.4"/>`;
  for(const [edge,neighbor,d] of [['top',c-w,`M${x} ${y}h100`],['left',c-1,`M${x} ${y}v100`],['right',c+1,`M${x+100} ${y}v100`],['bottom',c+w,`M${x} ${y+100}h100`]]){
   const outside=edge==='left'&&c%w===0||edge==='right'&&c%w===w-1||neighbor<0||neighbor>=p.regions.length;
   if(outside||p.regions[neighbor]!==area)lines+=`<path d="${d}" fill="none" stroke="#344c3b" stroke-width="5"/>`;
  }
  return lines;
 }).join('');
 const objects=p.objects.map(o=>nested(objectArt(o.type,o.part,o.tile),o.cell%w*100,Math.floor(o.cell/w)*100,100,100)+(o.occupiable?`<circle cx="${o.cell%w*100+88}" cy="${Math.floor(o.cell/w)*100+12}" r="6" fill="#48704c" stroke="#fff7e4" stroke-width="2"/>`:'')).join('');
 const labels=areaLabels(p).map(label=>{
  const width=label.length*100-12,font=Math.min(34,(width-18)/(label.name.length*.58));
  const transform=label.vertical?`translate(${label.col*100+44} ${(label.row+label.length)*100-6}) rotate(-90)`:`translate(${label.col*100+6} ${(label.row+1)*100-44})`;
  return `<g transform="${transform}"><rect width="${width}" height="38" rx="7" fill="#344f3e" stroke="#f6efdc" stroke-width="1.5"/><text x="${width/2}" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="${font}" fill="#fff9e7">${escape(label.name)}</text></g>`;
 }).join('');
 const titleSize=Math.min(43,1050/(p.title.length*.58));
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}"><rect width="1200" height="${height}" rx="24" fill="#f4f1e7"/><text x="50" y="56" font-family="Georgia,serif" font-size="32" font-weight="bold" fill="#3e614b">grunndoku</text><text x="50" y="110" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="#263e31">${escape(p.title)}</text><text x="50" y="144" font-family="Arial,sans-serif" font-size="21" fill="#637064">Durf jij deze zaak aan? · ${p.difficultyStars||3} ${(p.difficultyStars||3)===1?'ster':'sterren'} · ${p.people.length} personen</text><g transform="translate(${left} 175) scale(${scale})">${tiles}${nested(printFloorPlane(p),0,0,w*100,h*100)}${grid}${objects}${nested(festivalDecoration(p),0,0,w*100,h*100)}${labels}</g><text x="50" y="${height-43}" font-family="Arial,sans-serif" font-size="21" fill="#3e614b">Speel mee via de puzzellink in het bericht · lege kaart, zonder spoilers</text></svg>`;
 return {svg,width:1200,height};
}
export async function createShareImage(p){
 const {svg,width,height}=emptyMapSvg(p),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG unavailable')),'image/png'));
  return new File([blob],`grunndoku-${p.id}-lege-kaart.png`,{type:'image/png'});
 }finally{URL.revokeObjectURL(url);}
}
