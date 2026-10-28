// Replace beginner givens with one readable clue per witness. Person indices
// and the original solutions stay stable, including existing browser progress.
const STARTER_CLUES={"stad-v2-1":[[0,"Stond in de noordoosthoek van de Vismarkt.",[3]],[1,"Stond direct links van de Martinitoren.",[6]]],"martini-v1-1":[[0,"Zat op een kerkbank in de noorderkapel.",[4]],[2,"Stond in de vierde rij, in de kooromgang.",[30,31]],[3,"Zat op een kerkbank in het zuidportaal.",[43]],[4,"Zat op een stoel.",[10]]],"martini-v1-2":[[3,"Stond direct rechts van een zuil in de zuidbeuk.",[55]],[4,"Stond direct boven de avondmaalstafel in de kooromgang.",[28]]],"winterwelvaart-v1-1":[[0,"Stond op een vloerkleed in het scheepsruim.",[11,12,19,20]],[1,"Zat op de rechterhelft van een bankje op het achterdek.",[38]],[2,"Zat op de rechterhelft van een bankje op het voordek.",[25]],[4,"Stond in de zuidwesthoek van de roef.",[42]]],"winterwelvaart-v1-2":[[0,"Stond direct onder de tafel in de roef.",[52]],[1,"Stond direct boven de linkerhelft van een bankje op het vuurtonplein.",[48]]]};
export function finishDossier(p){
 if(Object.keys(p.givens||{}).length&&STARTER_CLUES[p.id]){
  p.clues.push(...STARTER_CLUES[p.id].map(([a,text,cells])=>({type:'unary',a,text,cells})));
  p.givens={};p.clueVersion=(p.clueVersion||1)+1;
 }
 const previous=p.people[p.victim].name;
 if(previous!=='Fokko'){p.people[p.victim].name='Fokko';p.story=p.story.replaceAll(previous,'Fokko').replaceAll('haar tas','zijn tas').replaceAll('haar fiets','zijn fiets');p.people[p.victim].portraitIndex=5;}
 if(p.id==='stad-v2-1'){p.people[p.victim].name='Tammo';p.people[p.victim].portraitIndex=5;p.story='Na de bloemenmarkt wordt Tammo gevonden bij de Martinitoren. Drie getuigen vertellen waar ze waren. Plaats iedereen en ontdek wie bij Tammo was.';p.lesson='Lees de drie aanwijzingen en begin bij het enige passende vak';}
 if(p.id==='martini-v1-1')p.story='Na een rondleiding blijft een muziekmap achter. Vijf bezoekers vertellen waar ze stonden. Volg hun aanwijzingen en ontdek wie met Fokko achterbleef.';
 if(p.id==='winterwelvaart-v1-1')p.story='Aan boord van een fictieve winterklipper is het laatste lied gezongen. Vijf aanwezigen vertellen waar ze waren. Zoek hun plekken en ontdek wie met Fokko achterbleef.';
 return p;
}
