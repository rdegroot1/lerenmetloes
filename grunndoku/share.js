import {caseScore} from './coaching.js?v=20261027-coaching';
// Construct a clean public theme link. Never share Auth fragments, preview
// flags, email addresses, positions, the culprit or the private save itself.
export function completionShare(p,base){
 const url=new URL(base);url.search='';url.hash='';url.searchParams.set('serie',p.seriesId||'stad');if(p.bundleId)url.searchParams.set('bundel',p.bundleId);if(p.id)url.searchParams.set('zaak',p.id);
 return {title:'Zaak geklaard! · Grunndoku',text:`Ik heb “${p.title}” opgelost in Grunndoku en ${caseScore(p).total} speurpunten verdiend. Kon minder! 🔎 Speur je ook mee?`,url:url.href};
}
