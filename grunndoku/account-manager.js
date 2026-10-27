import {AUTH_CONFIG} from './auth-config.js?v=20261027-accounts';
import {AccountStore,toCloudState,withLocalFeedback} from './account-store.js?v=20261027-accounts';
export const accountPreview=new URLSearchParams(location.search).get('accounts')==='preview';
const $=id=>document.getElementById(id),sessionKey='grunndoku:auth:v1';
const authReturn=new URLSearchParams(location.hash.slice(1)).has('access_token');
let storagePersistent=true;
const dossierStorage=(()=>{try{const storage=localStorage;storage.getItem('grunndoku:storage-probe');return storage;}catch{storagePersistent=false;const values=new Map();return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}})();
let client,initializing,timer,handlers={},currentUser=null,identityInitialized=false,signingOut=false,authEventVersion=0;
export const accountStore=new AccountStore({storage:dossierStorage,remote:null,onChange:ids=>handlers.onRemoteChange?.(ids),onStatus:()=>renderAccount()});
export function saveProgress(id,state){accountStore.write(id,state);scheduleSync();}
export function preferenceKey(name){return accountStore.userId?`grunndoku:account-pref:${accountStore.userId}:${name}`:`grunndoku:${name}:v1`;}
function scheduleSync(){if(!accountStore.userId)return;clearTimeout(timer);timer=setTimeout(sync,1400);}
async function sync(){handlers.beforeSync?.();await accountStore.sync();renderAccount();}
function remoteAdapter(){
 const fields='puzzle_id,state,version,updated_at';
 return {
  async list(user){const {data,error}=await client.from('grunndoku_progress').select(fields).eq('user_id',user);if(error)throw error;return data.map(row=>({...row,state:withLocalFeedback(row.state,accountStore.read(row.puzzle_id))}));},
  async get(user,id){const {data,error}=await client.from('grunndoku_progress').select(fields).eq('user_id',user).eq('puzzle_id',id).maybeSingle();if(error)throw error;return data?{...data,state:withLocalFeedback(data.state,accountStore.read(id))}:null;},
  async save(user,id,state,version){
   state=toCloudState(state);const table=client.from('grunndoku_progress');
   const request=version?table.update({state}).eq('user_id',user).eq('puzzle_id',id).eq('version',version):table.insert({user_id:user,puzzle_id:id,state});
   const {data,error}=await request.select(fields).maybeSingle();if(error?.code==='23505')return null;if(error)throw error;return data;
  }
 };
}
async function switchSession(user){
 if(identityInitialized&&currentUser?.id===user?.id){renderAccount();return;}
 handlers.beforeIdentityChange?.();currentUser=user||null;identityInitialized=true;accountStore.setUser(user?.id);handlers.onIdentityChange?.();renderAccount();
 if(user)await sync();
}
async function ensureClient(){
 if(initializing)return initializing;if(client)return client;
 initializing=(async()=>{
  const {createClient}=await import('./vendor/supabase.js?v=20261027-accounts');
  client=createClient(AUTH_CONFIG.url,AUTH_CONFIG.key,{auth:{storage:accountStore.storage,storageKey:sessionKey,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  accountStore.remote=remoteAdapter();
  client.auth.onAuthStateChange((event,session)=>{const eventVersion=++authEventVersion;if(!signingOut)setTimeout(()=>{if(eventVersion!==authEventVersion)return;if(event==='PASSWORD_RECOVERY'){$('passwordRecovery').hidden=false;$('accountDialog').showModal();}switchSession(session?.user||null);},0);});
  const {data,error}=await client.auth.getSession();if(error)throw error;await switchSession(data.session?.user||null);return client;
 })().catch(error=>{initializing=null;throw error;});return initializing;
}
const statusText={guest:'Gast · bewaard op dit apparaat',local:'Dossier op dit apparaat',pending:'Lokaal bewaard · online opslaan volgt',syncing:'Dossier synchroniseren…',saved:'Dossier online bijgewerkt',offline:'Lokaal bewaard · verbinden om te synchroniseren',conflict:'Twee versies gevonden · kies welke je wilt bewaren'};
function renderAccount(){
 if(!$('accountStatus'))return;
 const signed=Boolean(accountStore.userId),status=!signed&&!storagePersistent?'Gast · alleen bewaard zolang dit venster openblijft':statusText[accountStore.status]||statusText.local;
 $('accountStatus').textContent=status;$('dossierStorage').textContent=signed?status:storagePersistent?'Je speelt als gast. Je voortgang blijft op dit apparaat bewaard.':status;$('footerStorage').textContent=signed?status:storagePersistent?'Je voortgang wordt op dit apparaat bewaard.':status;
 $('accountButton').hidden=!AUTH_CONFIG.publicLogin&&!accountPreview&&!signed;$('accountButton').textContent=signed?'Mijn account':'Aanmelden';
 $('accountSignedIn').hidden=!signed;$('accountSignIn').hidden=signed;$('accountEmailLabel').textContent=currentUser?.email||'Je persoonlijke dossier';
 $('accountTestNotice').hidden=AUTH_CONFIG.publicLogin;
 const ids=signed?(handlers.guestCaseIds?.()||[]).filter(id=>!accountStore.guestImported(id)):[];$('guestImport').hidden=!ids.length;$('guestImportText').textContent=`Er staat gastvoortgang bij ${ids.length} ${ids.length===1?'zaak':'zaken'} op dit apparaat. Wil je die meenemen? Bij verschillende versies kies je zelf.`;
 const conflicts=accountStore.conflicts();$('syncConflicts').hidden=!conflicts.length;$('syncConflictList').replaceChildren();
 for(const conflict of conflicts){
  const row=document.createElement('article'),heading=document.createElement('h4');heading.textContent=handlers.caseTitle?.(conflict.id)||conflict.id;row.append(heading);
  const info=document.createElement('p');info.textContent='Deze zaak is op twee plekken gewijzigd. Beide versies zijn bewaard totdat je kiest.';row.append(info);
  for(const [choice,label,state]of [['local','Deze versie',conflict.local],['cloud',conflict.source==='tab'?'Andere tab':'Online versie',conflict.cloud]]){
   const preview=document.createElement('details'),summary=document.createElement('summary'),description=document.createElement('p');summary.textContent=label+' bekijken';description.className='conflict-preview';description.textContent=handlers.describeState?.(conflict.id,state)||'Geen voortgang';preview.append(summary,description);row.append(preview);
   const button=document.createElement('button');button.className='ui-button quiet';const placed=Object.keys(state?.positions||{}).length;button.textContent=`Bewaar ${label.toLocaleLowerCase('nl')} · ${placed} geplaatst${state?.solved?' · opgelost':''}`;
   button.onclick=()=>{accountStore.resolve(conflict.id,choice);scheduleSync();renderAccount();};row.append(button);
  }$('syncConflictList').append(row);
 }
}
async function action(run){$('accountMessage').textContent='';$('accountDialog').querySelectorAll('form button,form input').forEach(e=>e.disabled=true);try{await run();}catch(error){$('accountMessage').textContent=authError(error);}finally{$('accountDialog').querySelectorAll('form button,form input').forEach(e=>e.disabled=false);}}
function authError(error){
 if(error.code==='email_address_not_authorized'||error.code==='unexpected_failure')return 'De bevestigingsmail kan nog niet worden verstuurd. Probeer later opnieuw; je kunt als gast blijven spelen.';
 if(error.code==='email_not_confirmed')return 'Bevestig eerst je e-mailadres via de ontvangen mail.';
 if(error.code==='invalid_credentials')return 'Dit e-mailadres en wachtwoord vormen geen geldige combinatie. Controleer je gegevens.';
 if(error.status===429||error.code?.includes('rate_limit'))return 'Er zijn te veel verzoeken gedaan. Wacht even voordat je opnieuw probeert.';
 if(!navigator.onLine||error.name==='AuthRetryableFetchError'||error instanceof TypeError)return 'Geen verbinding met de accountdienst. Je lokale voortgang blijft bewaard.';
 return 'Aanmelden is niet gelukt. Controleer je gegevens of probeer het later opnieuw.';
}
export function startAccounts(options){
 handlers=options;renderAccount();
 $('accountButton').onclick=async()=>{$('accountDialog').showModal();try{await ensureClient();}catch(error){$('accountMessage').textContent=authError(error);}};
 $('accountForm').onsubmit=event=>{event.preventDefault();action(async()=>{const c=await ensureClient(),{data,error}=await c.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});if(error)throw error;await switchSession(data.user);$('loginPassword').value='';$('accountMessage').textContent='Moi, je persoonlijke dossier is geopend.';});};
 $('registerAccount').onclick=()=>{if(!$('accountForm').reportValidity())return;action(async()=>{const c=await ensureClient(),{error}=await c.auth.signUp({email:$('loginEmail').value.trim(),password:$('loginPassword').value,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;$('loginPassword').value='';$('accountMessage').textContent='Als dit adres kan worden geregistreerd, ontvang je een bevestigingsmail. Bevestig je adres en meld je daarna aan.';});};
 $('resetPassword').onclick=()=>{if(!$('loginEmail').reportValidity())return;action(async()=>{const c=await ensureClient(),{error}=await c.auth.resetPasswordForEmail($('loginEmail').value.trim(),{redirectTo:location.origin+location.pathname+'?reset-password=1'});if(error)throw error;$('accountMessage').textContent='Als dit adres bij een account hoort, ontvang je een mail om je wachtwoord te wijzigen.';});};
 $('passwordRecovery').onsubmit=event=>{event.preventDefault();action(async()=>{const {error}=await client.auth.updateUser({password:$('newPassword').value});if(error)throw error;$('newPassword').value='';$('passwordRecovery').hidden=true;$('accountMessage').textContent='Je nieuwe wachtwoord is bewaard.';});};
 $('signOutAccount').onclick=async()=>{
  signingOut=true;try{handlers.beforeIdentityChange?.();await sync();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;await switchSession(null);$('accountMessage').textContent='Je speelt nu als gast. Je accountdossier blijft afzonderlijk bewaard.';}catch(error){$('accountMessage').textContent=authError(error);}finally{signingOut=false;}
 };
 $('retrySync').onclick=sync;
 $('importGuest').onclick=()=>{accountStore.importGuest(handlers.guestCaseIds?.()||[]);scheduleSync();renderAccount();};
 $('exportDossier').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({game:'Grunndoku',version:1,cases:accountStore.exportStates()},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='grunndoku-mijn-dossier.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 window.addEventListener('online',()=>{if(accountStore.userId)sync();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&accountStore.userId)sync();});
 setInterval(()=>{if(!document.hidden&&accountStore.userId)sync();},20000);
 window.addEventListener('storage',event=>{if(event.key?.startsWith(accountStore.prefix())&&event.key!==sessionKey){handlers.onRemoteChange?.([event.key.slice(accountStore.prefix().length)]);}});
 let existing;try{existing=localStorage.getItem(sessionKey);}catch{}
 if(existing||authReturn)ensureClient().catch(error=>{$('accountMessage').textContent=authError(error);});
}
