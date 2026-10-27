// Local guest saves retain their original keys. Accounts use separate caches.
const clone=x=>JSON.parse(JSON.stringify(x));
export function sameState(a,b){
 if(a===b)return true;if(a==null||b==null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&sameState(a[k],b[k]));
}
export function toCloudState(state){const {difficultyFeedback,...cloud}=state;return cloud;}
export function withLocalFeedback(state,local){return {...state,difficultyFeedback:local?.difficultyFeedback||null};}
const validId=id=>/^[a-zA-Z0-9_-]{1,120}$/.test(id);
export class AccountStore {
 constructor({storage,remote,onChange=()=>{},onStatus=()=>{}}){Object.assign(this,{storage,remote,onChange,onStatus});this.userId=null;this.generation=0;this.running=false;this.status='guest';this.observed=new Map();}
 prefix(user=this.userId){return user?`grunndoku:account:v1:${user}:`:'grunmurdoku:v1:';}
 envelope(id){try{return JSON.parse(this.storage.getItem(this.prefix()+id));}catch{return null;}}
 open(id){const state=this.read(id);this.observed.set(id,clone(state));return state;}
 read(id){const saved=this.envelope(id);return this.userId?saved?.state||null:saved;}
 entries(){const prefix=this.prefix(),entries=[];for(let i=0;i<this.storage.length;i++){const k=this.storage.key(i);if(k?.startsWith(prefix)){const id=k.slice(prefix.length);if(validId(id))entries.push([id,this.envelope(id)]);}}return entries.filter(([,e])=>e);}
 setUser(id){this.userId=id||null;this.observed.clear();this.generation++;this.setStatus(id?'local':'guest');}
 setStatus(status){this.status=status;this.onStatus(status);}
 write(id,state){
  if(!validId(id))throw Error('Ongeldig zaaknummer');
  const previous=this.envelope(id),value=clone(state);
  if(!this.userId){this.storage.setItem(this.prefix()+id,JSON.stringify(value));return;}
  if(sameState(previous?.state,value)){this.observed.set(id,value);return;}
  const changedElsewhere=this.observed.has(id)&&!sameState(this.observed.get(id),previous?.state||null);
  const conflict=changedElsewhere&&previous?{state:previous.state,version:previous.version,source:previous.dirty?'tab':'cloud'}:previous?.conflict;
  this.observed.set(id,value);
  this.storage.setItem(this.prefix()+id,JSON.stringify({...previous,state:value,version:previous?.version||0,dirty:true,...(conflict?{conflict}:{})}));this.setStatus(conflict?'conflict':'pending');
 }
 conflicts(){return this.userId?this.entries().filter(([,e])=>e.conflict).map(([id,e])=>({id,local:e.state,cloud:e.conflict.state,source:e.conflict.source})):[];}
 async sync(){
  if(!this.userId||this.running)return;
  this.running=true;const user=this.userId,generation=this.generation,prefix=this.prefix(),changed=new Set();const current=()=>this.generation===generation;
  this.setStatus('syncing');
  try{
   const rows=await this.remote.list(user);if(!current())return;
   const cloud=new Map(rows.map(row=>[row.puzzle_id,row]));
   for(const id of new Set([...cloud.keys(),...this.entries().map(([id])=>id)])){
    const remote=cloud.get(id),local=this.envelope(id);
    if(local?.conflict?.source==='tab')continue;
    if(!local?.dirty){
     if(remote){if(!sameState(local?.state,remote.state))changed.add(id);this.storage.setItem(prefix+id,JSON.stringify({state:remote.state,version:remote.version,dirty:false}));}
     else if(local){this.storage.removeItem(prefix+id);changed.add(id);}
    }else if(remote&&sameState(local.state,remote.state))this.storage.setItem(prefix+id,JSON.stringify({state:local.state,version:remote.version,dirty:false}));
    else if((remote?.version||0)!==local.version){
     this.storage.setItem(prefix+id,JSON.stringify({...local,conflict:{state:remote?.state||null,version:remote?.version||0}}));
    }
   }
   for(const [id,entry]of this.entries()){
    if(!current())return;if(!entry.dirty||entry.conflict)continue;
    const written=await this.remote.save(user,id,entry.state,entry.version);if(!current())return;
    const latest=this.envelope(id);
    if(written){
     // Edits made during a request stay pending against the newly saved version.
     if(latest)this.storage.setItem(prefix+id,JSON.stringify({...latest,version:written.version,dirty:!sameState(latest.state,entry.state)}));
    }else{
     const row=await this.remote.get(user,id);if(!current())return;
     if(latest)this.storage.setItem(prefix+id,JSON.stringify({...latest,conflict:{state:row?.state||null,version:row?.version||0}}));
    }
   }
   if(current())this.setStatus(this.conflicts().length?'conflict':this.entries().some(([,e])=>e.dirty)?'pending':'saved');
  }catch(error){if(current()){this.lastError=error;this.setStatus('offline');}}
  finally{this.running=false;if(current()&&changed.size)this.onChange([...changed]);}
 }
 resolve(id,choice){
  const local=this.envelope(id);if(!this.userId||!local?.conflict)return;
  const remote=local.conflict;
  if(choice==='cloud'){
   if(remote.state)this.storage.setItem(this.prefix()+id,JSON.stringify({state:remote.state,version:remote.version,dirty:remote.source==='tab'}));else this.storage.removeItem(this.prefix()+id);
  }else if(choice==='local')this.storage.setItem(this.prefix()+id,JSON.stringify({state:local.state,version:remote.version,dirty:true}));else throw Error('Ongeldige keuze');
  this.onChange([id]);this.setStatus(this.conflicts().length?'conflict':'pending');
 }
 guestImported(id){try{return sameState(JSON.parse(this.storage.getItem(`grunndoku:guest-import:v1:${this.userId}:${id}`)),JSON.parse(this.storage.getItem('grunmurdoku:v1:'+id)));}catch{return false;}}
 importGuest(ids){
  if(!this.userId)throw Error('Meld je eerst aan');
  for(const id of ids){let guest;try{guest=JSON.parse(this.storage.getItem('grunmurdoku:v1:'+id));}catch{continue;}
   if(!guest||!validId(id))continue;this.storage.setItem(`grunndoku:guest-import:v1:${this.userId}:${id}`,JSON.stringify(guest));const local=this.envelope(id);
   if(local&&sameState(guest,local.state))continue;
   this.storage.setItem(this.prefix()+id,JSON.stringify({state:guest,version:local?.version||0,dirty:true,...(local?{conflict:{state:local.state,version:local.version||0}}:{})}));
  }
  this.onChange(ids);this.setStatus(this.conflicts().length?'conflict':'pending');
 }
 exportStates(){return Object.fromEntries(this.entries().map(([id,e])=>[id,this.userId?e.state:e]));}
}
