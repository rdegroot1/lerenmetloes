// Personal puzzle coaching, stored with the dossier. No analytics endpoint.
const count=value=>Number.isFinite(value)&&value>=0?Math.floor(value):0;
export const HINT_LEVELS=['Een zetje','Kijkrichting','Redeneerstap','Uitgewerkte stap'];
export function boardKey(positions){return JSON.stringify(Object.entries(positions).sort(([a],[b])=>Number(a)-Number(b)));}
export function coachingState(saved={}){
 saved=saved&&typeof saved==='object'?saved:{};
 const scoreDepths=Object.fromEntries(Object.entries(saved.scoreDepths||{}).filter(([who,depth])=>/^\d+$/.test(who)&&Number(who)<100&&Number.isInteger(depth)&&depth>=0&&depth<=3));
 return {version:1,scoreDepths,observed:saved.observed===true,hintViews:(Array.isArray(saved.hintViews)?saved.hintViews:[]).slice(0,4).map(count),boards:Array.isArray(saved.boards)?saved.boards.filter(b=>typeof b?.key==='string'&&Number.isInteger(b.level)&&b.level>=0&&b.level<4).slice(-32):[],lastProgressMs:count(saved.lastProgressMs),nextOfferMs:count(saved.nextOfferMs)};
}
export function recordHint(saved,key,level,who){
 const result=coachingState(saved),previous=result.boards.find(b=>b.key===key);
 if(Number.isInteger(who)&&who>=0&&who<100)result.scoreDepths[who]=Math.max(result.scoreDepths[who]||0,level);
 result.observed=true;const oldLevel=previous?.level??-1;
 if(level>oldLevel)for(let i=oldLevel+1;i<=level;i++)result.hintViews[i]=(result.hintViews[i]||0)+1;
 result.boards=[...result.boards.filter(b=>b.key!==key),{key,level:Math.max(level,oldLevel)}].slice(-32);
 return result;
}
export function markProgress(saved,time){const result=coachingState(saved);result.observed=true;result.lastProgressMs=count(time);result.nextOfferMs=count(time)+180000;return result;}
export function offerHelp(saved,time,solved=false){const s=coachingState(saved);return !solved&&count(time)>=Math.max(s.lastProgressMs+180000,s.nextOfferMs);}
export function postponeHelp(saved,time){const result=coachingState(saved);result.nextOfferMs=count(time)+300000;return result;}
// Legacy formula retained for older callers. New runs use scoring.js;
// old completed dossiers keep these previously earned points.
export function caseScore(p){const stars=Math.min(6,Math.max(1,count(p.difficultyStars)||3));return {base:100,bonus:(stars-1)*20,total:100+(stars-1)*20};}
export function helpSummary(state,name='Fokko'){const views=coachingState(state.coaching).hintViews;const general=views[0]||0,detailed=views[3]||0;
 if(!general)return state.hintsUsed?'Je hebt hulp gebruikt. Samen kom je verder!':`Deze zaak heb je zonder ${name}’s tips opgelost. Mooi uitgezocht!`;
 return `${name} dacht bij ${general} ${general===1?'stap':'stappen'} mee${detailed?`, waarvan ${detailed} helemaal uitgewerkt`:''}. Jij hebt de zaak afgerond!`;
}
export function recommendCase(puzzles,current,readSave,isSolved){
 const theme=current.seriesId||'stad',cases=puzzles.filter(p=>(p.seriesId||'stad')===theme);
 const recent=cases.map(p=>({p,s:readSave(p)})).filter(({p,s})=>s?.coaching?.version===1&&s.coaching.observed===true&&isSolved(p,s)).sort((a,b)=>(b.s.solvedAt||0)-(a.s.solvedAt||0)).slice(0,6);
 if(recent.length<3)return null;
 const latest=recent.slice(0,3),level=current.difficultyStars||3;
 const detailed=latest.reduce((sum,{p,s})=>sum+(coachingState(s.coaching).hintViews[3]||0)/p.people.length,0)/3;
 const pace=items=>items.reduce((sum,{p,s})=>sum+(s.playTimeMs||0)/p.people.length,0)/items.length;
 const comparable=recent.slice(3).filter(({p,s})=>p.difficultyStars===level&&!s.playTimePartial&&s.playTimeMs>0);
 const measured=latest.filter(({s})=>!s.playTimePartial&&s.playTimeMs>0);
 const takingTime=comparable.length>=3&&measured.length===3&&pace(measured)>pace(comparable)*1.5;
 const target=detailed>=.3||takingTime?level:Math.min(5,level+1);
 const candidate=cases.filter(p=>!isSolved(p,readSave(p))&&p.id!==current.id&&p.difficultyStars<=5).sort((a,b)=>Math.abs((a.difficultyStars||3)-target)-Math.abs((b.difficultyStars||3)-target))[0];
 return candidate?{puzzle:candidate,text:target===level?'Nog een zaak op een vertrouwd niveau? Fokko denkt graag weer mee.':'Zin in een volgende uitdaging? Deze zaak past misschien mooi bij je speurwerk.'}:null;
}
