// Deterministic Groningen-inspired names. Rename people without moving their
// indices: saved positions, notes, clues, scores and solution proofs stay valid.
const names={
 A:{male:['Aaldert','Aaldrik','Abel','Alje','Alle','Anno','Arend'],female:['Aaltje','Antje','Auktje']},
 B:{male:['Barrelt','Berend','Boarend'],female:['Bauwina','Betje','Bieuwke','Bouktje']},
 C:{male:['Cor'],female:['Cora']},D:{male:['Derk','Douwe'],female:['Derkje','Dieverdina','Diewerke']},
 E:{male:['Edo','Egbert','Eltjo','Eppo'],female:['Ebeltje','Eefke','Engel','Ete']},
 F:{male:['Feiko','Fokko','Freerk'],female:['Fiene','Freerkje']},
 G:{male:['Geert','Geertinus','Gezinus'],female:['Geesje','Geessiena','Gepke','Grietje']},
 H:{male:['Haiko','Harm','Heiko','Hilko','Hinderk','Hindrik','Hommo'],female:['Hinderika','Hinderkien','Hindrikje']},
 I:{male:['Ipe','Ite'],female:['Imke','Ietje']},J:{male:['Jacob','Jakob','Jan','Jannes','Jans','Jurjen'],female:['Jaantje','Jantje']},
 K:{male:['Karsien','Klaas','Knelies','Koert'],female:['Katrientje','Klaassien','Klaziena','Kunna']},
 L:{male:['Lammert','Lippe','Luitje','Luppo','Luurt'],female:['Lammechien','Lammie','Liefke','Lukkien']},
 M:{male:['Meerten','Meindert','Menko','Menne','Menso'],female:['Martje','Meike','Meiske','Mettien']},
 N:{male:['Nanko','Nanno','Niek'],female:['Naantje','Nantje']},
 // The largest current cases have fifteen suspects, so one O name is needed.
 O:{male:['Oebele','Otto'],female:['Oda']}
};
const hash=text=>[...text].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const originalGender=(person,i)=>person.gender||((person.portraitIndex??i)<6?([2,4].includes(person.portraitIndex??i)||((person.portraitIndex??i)===0&&person.name!=='Arend')?'female':'male'):['Jantje','Neeltje','Sientje','Dieuwertje'].includes(person.name)?'female':'male');
export function applyCast(p){
 if(p.castVersion===1)return p;
 const before=p.people.map(person=>person.name),chosen=[],genders=[];let suspect=0;
 for(let i=0;i<p.people.length;i++){
  if(i===p.victim){chosen[i]='Tammo';genders[i]='male';continue;}
  const letter='ABCDEFGHIJKLMNOPQRSUVWXYZ'[suspect++],gender=originalGender(p.people[i],i),pool=names[letter]?.[gender];
  if(!pool?.length)throw Error(`Geen namen voor ${p.id}: ${letter}`);
  chosen[i]=p.id==='stad-v2-1'?['Arend','Bertus','Cora'][i]:pool[hash(p.id+':'+letter)%pool.length];genders[i]=gender;
 }
 if(new Set(before).size!==before.length)throw Error('Dubbele bronnaam in '+p.id);
 const mapping=new Map(before.map((name,i)=>[name,chosen[i]]));
 const pattern=new RegExp('\\b('+before.map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|')+')\\b','g');
 const rename=value=>typeof value==='string'?value.replace(pattern,name=>mapping.get(name)):Array.isArray(value)?value.map(rename):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,v])=>[key,rename(v)])):value;
 Object.assign(p,rename(p));
 p.people.forEach((person,i)=>{person.gender=genders[i];person.portraitIndex=i===p.victim?5:(person.portraitIndex??i);});
 p.castVersion=1;return p;
}
