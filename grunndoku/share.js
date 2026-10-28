import {scoreFor} from './scoring.js?v=20261028-score';
// Construct a clean public theme link. Never share Auth fragments, preview
// flags, email addresses, positions, the culprit or the private save itself.
export function completionShare(p,base,state){
 const url=new URL(base);url.search='';url.hash='';url.searchParams.set('serie',p.seriesId||'stad');if(p.bundleId)url.searchParams.set('bundel',p.bundleId);if(p.id)url.searchParams.set('zaak',p.id);
 const score=scoreFor(p,state);
 return {title:'Zaak geklaard! · Grunndoku',text:`Ik heb “${p.title}” opgelost in Grunndoku en ${score.total}${score.legacy?'':' / 1.000'} speurpunten${score.levelBonus?` + ${score.levelBonus} niveaupunten`:''} verdiend. Kon minder! 🔎 Speur je ook mee?`,url:url.href};
}
