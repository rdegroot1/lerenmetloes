// A solved case always earns 600. Only optional help changes the 400 bonus.
// Highest depth per person, not clicks or board snapshots, prevents double fees.
const depthWeight=[0,.15,.45,1];
export function scoreFor(p,state){
 const stars=Math.min(6,Math.max(1,Number(p.difficultyStars)||3));
 if(state?.scoreVersion!==2){const total=100+(stars-1)*20;return {version:1,legacy:true,base:100,bonus:total-100,total,max:total,levelBonus:0,dossierTotal:total};}
 const depths=state.coaching?.scoreDepths||{};
 const used=Array.from({length:p.people.length},(_,who)=>depthWeight[depths[who]]||0).reduce((sum,weight)=>sum+weight,0);
 const bonus=Math.round(400*(1-used/Math.max(1,p.people.length))),total=600+bonus,levelBonus=(stars-1)*50;
 return {version:2,legacy:false,base:600,bonus,total,max:1000,levelBonus,dossierTotal:total+levelBonus};
}
export function earnedScore(p,saved){
 // Only use this after validating the current or archived completed board.
 const stored=saved?.achievement?.score;
 if(stored?.version===2&&Number.isInteger(stored.total)&&stored.total>=600&&stored.total<=1000&&Number.isInteger(stored.levelBonus)&&stored.levelBonus>=0&&stored.levelBonus<=250)return stored.total+stored.levelBonus;
 return scoreFor(p,saved?.solved?saved:null).dossierTotal;
}
