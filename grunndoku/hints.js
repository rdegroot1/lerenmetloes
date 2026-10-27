import {solve,gridWidth} from './engine.js?v=20261027-dossier';
import {explain} from './explain.js?v=20261027-dossier';
// Hint text is derived from public constraint propagation. It never writes to
// player state, trusts pencil marks or silently places a solution on the board.
export function reasoningHint(p,initial={}){
 const positions={...p.givens,...initial},width=gridWidth(p);
 if(!solve(p,positions,1).length)return {kind:'conflict',steps:['Deze definitieve plaatsingen passen niet allemaal bij elkaar. Controleer eerst de laatst geplaatste persoon en diens aanwijzing. Je kunt met Terug één wijziging terugdraaien.']};
 if(Object.keys(positions).length===p.people.length)return {kind:'complete',steps:['Iedereen staat goed. Bekijk nu het gebied van het slachtoffer: daar staat precies één andere persoon. Wijs zelf de dader aan.']};
 const d=explain(p,{initial:positions,maxPlacements:1}).deductions[0],person=p.people[d.who],own=p.clues.find(c=>c.a===d.who);
 const reason=d.reasons.filter(s=>!s.startsWith('de aanwijzing')).slice(-2).join('; ');
 const first=own?`Begin bij ${person.name}: “${own.text}” Bekijk eerst welke vakjes bij deze aanwijzing passen.`:d.who===p.victim?'Het slachtoffer heeft geen eigen plaatsaanwijzing. Gebruik de bezette rijen en kolommen en de regel dat er precies één andere persoon in diens gebied staat.':`Begin bij ${person.name}. Kijk welke aanwijzingen van de andere personen diens mogelijkheden beperken.`;
 const second=d.searched?`Voor ${person.name} blijven meerdere mogelijkheden over. Vergelijk deze met de andere aanwijzingen; voor deze stap moeten resterende combinaties worden nagelopen. Alleen één van die combinaties kan de hele kaart kloppend maken.`:reason?`Kijk nu naar deze uitsluiting: ${reason}. Streep de vakjes weg die daardoor afvallen.`:`Combineer ${person.name}’s aanwijzing met de bezette rijen en kolommen en de geblokkeerde voorwerpen. Er blijft maar één passend vakje over.`;
 return {kind:'placement',who:d.who,cell:d.cell,searched:d.searched,steps:[first,second,`Voor ${person.name} blijft rij ${Math.floor(d.cell/width)+1}, kolom ${d.cell%width+1} over (${p.areas[p.regions[d.cell]]}). Zet deze plek zelf definitief op de kaart. Daarna kun je een volgende denkstap vragen.`]};
}
