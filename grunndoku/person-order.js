// Sort only the presentation: storage, clue references and portraits keep their indices.
export const personEntries=p=>p.people.map((person,i)=>({person,i})).sort((a,b)=>(a.i===p.victim)-(b.i===p.victim));
