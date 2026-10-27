import {valid,canStand} from './engine.js?v=20261027-accounts';
// Derive the dossier from existing saves, keeping stable puzzle/storage IDs.
export function caseProgress(p,saved){
 if(!saved||!saved.positions||typeof saved.positions!=='object')return {started:false,solved:false,placed:0,updatedAt:0};
 const positions=Object.fromEntries(Object.entries(saved.positions).filter(([who,cell])=>/^\d+$/.test(who)&&+who<p.people.length&&canStand(p,cell)));
 const placed=Object.keys(positions).length;
 const solved=Boolean(saved.solved)&&placed===p.people.length&&valid(p,positions,true);
 const started=solved||placed>Object.keys(p.givens||{}).length||Object.values(saved.notes||{}).some(ids=>Array.isArray(ids)&&ids.length)||Boolean(saved.crosses?.length)||Boolean(saved.checked?.length);
 return {started:Boolean(started),solved,placed,updatedAt:Number.isFinite(saved.updatedAt)?saved.updatedAt:0};
}
export function progressSummary(puzzles,readSave){
 const cases=puzzles.map((p,index)=>({id:p.id,index,series:p.seriesId||'stad',...caseProgress(p,readSave(p))}));
 return {cases,solved:cases.filter(c=>c.solved).length,total:cases.length};
}
export function resumeCase(summary,lastId){
 const unfinished=summary.cases.filter(c=>c.started&&!c.solved);
 return unfinished.find(c=>c.id===lastId)||unfinished.sort((a,b)=>b.updatedAt-a.updatedAt)[0]||null;
}
export function milestoneText(summary,series){
 const cases=summary.cases.filter(c=>c.series===series),done=cases.filter(c=>c.solved).length;
 if(done===cases.length&&done)return 'Thema afgerond! Alle zaken in dit dossier zijn opgelost.';
 if(summary.solved===1)return 'Je eerste zaak is rond. Een mooi begin van je speurdersdossier!';
 if([5,10,20,30,40].includes(summary.solved))return `Al ${summary.solved} zaken opgelost. Je dossier groeit mooi door!`;
 return `${done} van ${cases.length} zaken in dit thema opgelost. Elke zaak telt.`;
}
