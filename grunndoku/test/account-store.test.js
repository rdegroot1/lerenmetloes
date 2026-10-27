import test from 'node:test';import assert from 'node:assert/strict';
import {AccountStore,sameState,toCloudState,withLocalFeedback} from '../account-store.js';
class MemoryStorage{constructor(){this.data=new Map();}get length(){return this.data.size;}key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,v);}removeItem(k){this.data.delete(k);}}
function setup(){const storage=new MemoryStorage(),rows=new Map();const remote={async list(user){return [...rows.entries()].filter(([k])=>k.startsWith(user+':')).map(([,r])=>structuredClone(r));},async get(user,id){return structuredClone(rows.get(user+':'+id)||null);},async save(user,id,state,version){const k=user+':'+id,old=rows.get(k);if((old?.version||0)!==version)return null;const row={puzzle_id:id,state:structuredClone(state),version:version+1};rows.set(k,row);return structuredClone(row);}};const store=new AccountStore({storage,remote});return {store,storage,rows,remote};}
const state=n=>({positions:{0:n},notes:{},checked:[],crosses:[]});
test('guest saves retain old keys and never sync',async()=>{const {store,storage,rows}=setup();store.write('case-1',state(1));assert.equal(JSON.parse(storage.getItem('grunmurdoku:v1:case-1')).positions[0],1);await store.sync();assert.equal(rows.size,0);});
test('accounts remain separate from guests and each other',()=>{const {store}=setup();store.write('a',state(1));store.setUser('alice');assert.equal(store.read('a'),null);store.write('a',state(2));store.setUser('bob');assert.equal(store.read('a'),null);store.setUser('alice');assert.equal(store.read('a').positions[0],2);store.setUser(null);assert.equal(store.read('a').positions[0],1);});
test('first upload and later reset advance versions without resurrecting the old board',async()=>{const {store,rows}=setup();store.setUser('alice');store.write('a',state(2));await store.sync();assert.equal(rows.get('alice:a').version,1);store.write('a',{positions:{},notes:{},crosses:[],checked:[]});await store.sync();assert.equal(rows.get('alice:a').version,2);assert.deepEqual(rows.get('alice:a').state.positions,{});});
test('remote progress downloads and survives constructing a fresh store',async()=>{const {store,storage,rows,remote}=setup();rows.set('alice:a',{puzzle_id:'a',state:state(4),version:3});store.setUser('alice');await store.sync();assert.equal(store.read('a').positions[0],4);const reopened=new AccountStore({storage,remote});reopened.setUser('alice');assert.equal(reopened.read('a').positions[0],4);});
test('concurrent edits preserve both versions until the player chooses',async()=>{const {store,rows}=setup();store.setUser('alice');store.write('a',state(2));await store.sync();store.write('a',state(3));rows.set('alice:a',{puzzle_id:'a',state:state(4),version:2});await store.sync();assert.equal(store.status,'conflict');assert.equal(store.read('a').positions[0],3);assert.equal(store.conflicts()[0].cloud.positions[0],4);assert.equal(rows.get('alice:a').state.positions[0],4);store.resolve('a','local');await store.sync();assert.equal(rows.get('alice:a').state.positions[0],3);assert.equal(rows.get('alice:a').version,3);});
test('choosing the cloud version restores it without an upload',async()=>{const {store,rows}=setup();store.setUser('alice');store.write('a',state(1));rows.set('alice:a',{puzzle_id:'a',state:state(9),version:1});await store.sync();store.resolve('a','cloud');await store.sync();assert.equal(store.read('a').positions[0],9);assert.equal(rows.get('alice:a').version,1);});
test('a write made during an upload stays dirty against the new version',async()=>{const {store,remote}=setup(),save=remote.save;store.setUser('alice');store.write('a',state(1));remote.save=async(...args)=>{store.write('a',state(2));return save(...args);};await store.sync();assert.equal(store.envelope('a').version,1);assert.equal(store.envelope('a').dirty,true);assert.equal(store.read('a').positions[0],2);});
test('network failures retain local notes and recover on a later sync',async()=>{const {store,remote,rows}=setup(),list=remote.list;store.setUser('alice');store.write('a',state(3));remote.list=async()=>{throw Error('offline');};await store.sync();assert.equal(store.status,'offline');assert.equal(store.read('a').positions[0],3);remote.list=list;await store.sync();assert.equal(rows.get('alice:a').state.positions[0],3);});
test('a session switch discards an old in-flight response',async()=>{const {store,remote}=setup();let release;remote.list=()=>new Promise(resolve=>release=resolve);store.setUser('alice');const syncing=store.sync();store.setUser('bob');release([{puzzle_id:'a',state:state(4),version:1}]);await syncing;assert.equal(store.read('a'),null);assert.equal(store.userId,'bob');});
test('guest import is explicit and never removes the guest copy',async()=>{const {store,storage,rows}=setup();store.write('a',state(1));store.setUser('alice');await store.sync();assert.equal(store.read('a'),null);store.importGuest(['a']);await store.sync();assert.equal(rows.get('alice:a').state.positions[0],1);assert.ok(storage.getItem('grunmurdoku:v1:a'));});
test('importing a conflicting guest save asks instead of overwriting',async()=>{const {store,rows}=setup();store.write('a',state(1));store.setUser('alice');rows.set('alice:a',{puzzle_id:'a',state:state(9),version:1});await store.sync();store.importGuest(['a']);assert.equal(store.conflicts().length,1);assert.equal(rows.get('alice:a').state.positions[0],9);});
test('Postgres jsonb key ordering does not cause false conflicts',()=>{assert.equal(sameState({notes:{2:[1]},positions:{0:1}},{positions:{0:1},notes:{2:[1]}}),true);assert.equal(sameState({notes:[1,2]},{notes:[2,1]}),false);});

test('two tabs preserve both local drafts before either has uploaded',async()=>{
 const {store,storage,remote,rows}=setup(),second=new AccountStore({storage,remote});
 store.setUser('alice');store.write('a',state(1));await store.sync();
 second.setUser('alice');store.open('a');second.open('a');
 store.write('a',state(2));second.write('a',state(3));
 assert.equal(second.conflicts()[0].source,'tab');assert.equal(second.conflicts()[0].cloud.positions[0],2);
 // A third server version must not discard the second local draft.
 rows.set('alice:a',{puzzle_id:'a',state:state(4),version:2});await second.sync();
 assert.equal(second.conflicts()[0].cloud.positions[0],2);second.resolve('a','cloud');await second.sync();
 assert.equal(second.read('a').positions[0],2);assert.equal(second.conflicts()[0].cloud.positions[0],4);
 second.resolve('a','local');await second.sync();assert.equal(rows.get('alice:a').state.positions[0],2);
});
test('import reminders return only when the original guest copy changes',()=>{
 const {store}=setup();store.write('a',state(1));store.setUser('alice');assert.equal(store.guestImported('a'),false);store.importGuest(['a']);assert.equal(store.guestImported('a'),true);store.setUser(null);store.write('a',state(2));store.setUser('alice');assert.equal(store.guestImported('a'),false);
});

test('level feedback stays local even when puzzle progress is synchronized',()=>{
 const local={...state(1),difficultyFeedback:{vote:'right'}},cloud=toCloudState(local);
 assert.equal(Object.hasOwn(cloud,'difficultyFeedback'),false);
 assert.deepEqual(withLocalFeedback(cloud,local).difficultyFeedback,{vote:'right'});
 assert.equal(withLocalFeedback(cloud,null).difficultyFeedback,null);
 assert.deepEqual(local.difficultyFeedback,{vote:'right'});
});
