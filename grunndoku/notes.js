import {isPlayable,canStand} from './engine.js?v=20261027-accounts';
// Save only the pencil marks removed by a placement, so restoring them never
// rewinds other people's moves or notes made since that placement.
const merge=(a={},b={})=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(c=>[c,[...new Set([...(a[c]||[]),...(b[c]||[])])]]));
export function sanitizeBackups(p,backups){
 const result={};
 for(const [id,backup]of Object.entries(backups||{})){
  if(!/^\d+$/.test(id)||+id>=p.people.length||Object.hasOwn(p.givens||{},id)||!backup||!canStand(p,backup.cell))continue;
  const notes={};
  for(const [cell,ids]of Object.entries(backup.notes||{})){
   if(!/^\d+$/.test(cell)||!canStand(p,+cell)||!Array.isArray(ids))continue;
   const valid=[...new Set(ids.filter(i=>Number.isInteger(i)&&i>=0&&i<p.people.length&&!Object.hasOwn(p.givens||{},i)))];
   if(valid.length)notes[cell]=valid;
  }
  result[id]={cell:backup.cell,notes};
 }
 return result;
}
export function confirmPlacement(state,who,cell){
 const removed={};
 for(const [c,ids]of Object.entries(state.notes)){
  const hidden=+c===cell?ids:ids.filter(i=>i===who);
  if(hidden.length)removed[c]=hidden;
  const remaining=+c===cell?[]:ids.filter(i=>i!==who);
  if(remaining.length)state.notes[c]=remaining;else delete state.notes[c];
 }
 removed[cell]=[...new Set([...(removed[cell]||[]),who])];
 state.noteBackups||={};
 state.noteBackups[who]={cell,notes:merge(state.noteBackups[who]?.notes,removed)};
 state.positions[who]=cell;
 state.crosses=state.crosses.filter(c=>c!==cell);
 state.solved=false;
}
export function restorePencilNotes(state,p,who){
 const cell=state.positions[who];
 if(cell==null||Object.hasOwn(p.givens||{},who))return;
 const backup=state.noteBackups?.[who];
 delete state.positions[who];
 if(state.noteBackups)delete state.noteBackups[who];
 const notes=backup?.notes||{[cell]:[who]};
 for(const [c,ids]of Object.entries(notes)){
  if(!canStand(p,+c)||Object.values(state.positions).includes(+c)||state.crosses.includes(+c))continue;
  const possible=ids.filter(i=>state.positions[i]==null&&!Object.hasOwn(p.givens||{},i));
  if(possible.length)state.notes[c]=[...new Set([...(state.notes[c]||[]),...possible])];
 }
 state.solved=false;
}
