import {AUTH_CONFIG} from './auth-config.js?v=20261027-accounts';
import {accountStore,getAccountClient,openAccount,accountPreview} from './account-manager.js?v=20261027-bundles';
const $=id=>document.getElementById(id);
let catalog=[],owned=new Set(),generation=0,expected=null,openBundle,pendingLink=null;
const endpoint=AUTH_CONFIG.url+'/rest/v1/grunndoku_bundles?select=id,title,description,case_count&enabled=eq.true&order=title';
function text(tag,value){const node=document.createElement(tag);node.textContent=value;return node;}
function render(){
 $('openBundles').hidden=!AUTH_CONFIG.publicLogin&&!accountPreview&&!accountStore.userId;
 $('extraBundles').hidden=!catalog.length;$('bundleCards').replaceChildren();
 $('accountBundles').textContent=accountStore.userId?(owned.size?`${owned.size} extra ${owned.size===1?'thema':'thema’s'} in jouw account.`:'Je hebt nog geen extra thema’s geactiveerd.'):'Meld je eerst aan om een thema aan je account toe te voegen.';
 for(const bundle of catalog){
  const card=document.createElement('article');card.className='bundle-card';
  card.append(text('span',owned.has(bundle.id)?'IN JOUW DOSSIER':'EXTRA THEMA · VERGRENDELD'),text('h3',bundle.title),text('p',bundle.description),text('small',`${bundle.case_count} zaken`));
  const button=document.createElement('button');button.className='ui-button '+(owned.has(bundle.id)?'primary':'quiet');button.textContent=owned.has(bundle.id)?'Open dit thema →':'Toegangscode invoeren';
  button.onclick=()=>owned.has(bundle.id)?open(bundle):showActivation(bundle.id);card.append(button);$('bundleCards').append(card);
 }
}
async function refresh(){
 const version=++generation,user=accountStore.userId;owned=new Set();render();
 try{
  const response=await fetch(endpoint,{headers:{apikey:AUTH_CONFIG.key},cache:'no-store'});if(!response.ok)throw Error('catalog');const list=await response.json();
  if(version!==generation)return;catalog=Array.isArray(list)?list:[];
  if(user){const client=await getAccountClient(),{data,error}=await client.from('grunndoku_bundle_access').select('bundle_id').eq('user_id',user);if(error)throw error;if(version!==generation||accountStore.userId!==user)return;owned=new Set(data.map(row=>row.bundle_id));}
  render();followLink();
 }catch{if(version===generation){$('bundleStatus').textContent='Je extra thema’s kunnen nu niet worden opgehaald. Probeer het straks opnieuw.';render();}}
}
function showActivation(id=null){
 expected=id;const bundle=catalog.find(b=>b.id===id);$('bundleDialogTitle').textContent=bundle?bundle.title+' activeren':'Extra thema activeren';$('bundleStatus').textContent='';$('bundleCode').value='';$('bundleDialog').showModal();$('bundleCode').focus();
}
async function open(bundle,caseId=null){
 const user=accountStore.userId;if(!user){showActivation(bundle.id);return;}
 try{
  const client=await getAccountClient(),{data,error}=await client.from('grunndoku_bundle_puzzles').select('data').eq('bundle_id',bundle.id).order('sort_order');
  if(error)throw error;if(user!==accountStore.userId)return;
  if(!data.length){showActivation(bundle.id);$('bundleStatus').textContent='Dit thema staat in je account. De zaken zijn nog niet gepubliceerd.';return;}
  await openBundle(bundle,data.map(row=>row.data),caseId);
 }catch{showActivation(bundle.id);$('bundleStatus').textContent='De zaken konden niet worden opgehaald. Controleer je verbinding en probeer opnieuw.';}
}
function followLink(){
 if(!pendingLink)return;const bundle=catalog.find(b=>b.id===pendingLink.bundle);if(!bundle)return;
 if(owned.has(bundle.id)){const caseId=pendingLink.caseId;pendingLink=null;$('bundleDialog').close();open(bundle,caseId);}else if(!$('bundleDialog').open)showActivation(bundle.id);
}
export function startBundles(options){
 openBundle=options.openBundle;const query=new URLSearchParams(location.search);if(query.get('bundel'))pendingLink={bundle:query.get('bundel'),caseId:query.get('zaak')};
 $('openBundles').onclick=()=>showActivation();$('accountBundleForm').onsubmit=event=>{event.preventDefault();redeem('accountBundleCode','accountBundleStatus');};
 $('bundleForm').onsubmit=event=>{event.preventDefault();redeem('bundleCode','bundleStatus',expected);};
 $('bundleSignIn').onclick=()=>{$('bundleDialog').close();openAccount();};
 window.addEventListener('grunndoku:identitychange',()=>{expected=null;$('bundleCode').value='';$('accountBundleCode').value='';$('accountBundleStatus').textContent='';refresh();});
 refresh();
}
async function redeem(inputId,statusId,bundleId=null){
 const status=$(statusId),input=$(inputId),form=input.closest('form');
 if(!accountStore.userId){status.textContent='Meld je eerst aan. Daarna kun je de code uit je toegangsblaadje invoeren.';if(statusId==='accountBundleStatus')$('loginEmail').focus();return;}
 const code=input.value.trim();if(code.length<12){status.textContent='Vul de volledige toegangscode uit je PDF in.';return;}
 const user=accountStore.userId;form.querySelector('button').disabled=true;status.textContent='Themacode controleren…';
 try{
  const client=await getAccountClient(),{data,error}=await client.rpc('activate_grunndoku_bundle',{access_code:code,expected_bundle:bundleId});
  if(user!==accountStore.userId)return;if(error)throw error;
  if(!data?.ok){status.textContent=data?.reason==='rate'?'Even rust: probeer het over een kwartier opnieuw.':data?.reason==='signin'?'Meld je opnieuw aan om je thema te activeren.':'Deze code past niet bij dit thema of is niet geldig. Controleer de code op je toegangsblaadje.';return;}
  input.value='';await refresh();if(user!==accountStore.userId)return;const bundle=catalog.find(b=>b.id===data.bundle_id);status.textContent=`Moi! ${bundle?.title||'Het thema'} staat nu in jouw account. Je vindt het bij de extra thema’s op de startpagina.`;
 }catch{if(user===accountStore.userId)status.textContent='Activeren lukt nu niet. Controleer je verbinding en probeer opnieuw.';}
 finally{form.querySelector('button').disabled=false;}
}
