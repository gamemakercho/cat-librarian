// Credits are a view over a completed story; this module never writes game state.
export function createCreditsUI({canOpen}){
 const $=id=>document.getElementById(id),dialog=$('creditsDialog'),host=$('creditsHost');
 let generation=0,player=null,controller=null,resources=null,attempt=0,scrollY=0;
 function status(message,retry=false){
  const section=document.createElement('section');section.className='credits-status';
  const text=document.createElement('p');text.setAttribute('role','status');text.textContent=message;
  const closeButton=document.createElement('button');closeButton.type='button';closeButton.textContent='엔딩으로 돌아가기';closeButton.onclick=close;
  section.append(text,closeButton);
  if(retry){const button=document.createElement('button');button.type='button';button.textContent='다시 불러오기';button.onclick=()=>{close();open();};section.append(button);}
  host.replaceChildren(section);closeButton.focus({preventScroll:true});
 }
 function loadResources(){
  if(resources)return resources;
  const tag=document.createElement('link');tag.rel='stylesheet';tag.href='./credits/credits.css?v=20261101-credits-v5';tag.dataset.creditsStyle='true';
  const css=new Promise((resolve,reject)=>{tag.onload=resolve;tag.onerror=()=>{tag.remove();reject(Error('크레딧 스타일 로딩 실패'));};});document.head.append(tag);
  resources=Promise.all([import(`./credits/credits-player.js?v=20261101-credits-v5&attempt=${attempt++}`),css]).then(([module])=>module).catch(error=>{tag.remove();resources=null;throw error;});
  return resources;
 }
 function close(){
  generation++;controller?.abort();controller=null;player?.destroy();player=null;
  dialog.close();host.replaceChildren();document.documentElement.classList.remove('credits-open');
  window.scrollTo({top:scrollY,behavior:'instant'});if(!$('endingCard').hidden)$('endingCredits').focus({preventScroll:true});
 }
 async function open(){
  if(dialog.open||!canOpen())return;
  const token=++generation;scrollY=window.scrollY;controller=new AbortController();const signal=controller.signal;
  dialog.showModal();document.documentElement.classList.add('credits-open');status('크레딧을 준비하고 있어요…');
  try{
   const module=await loadResources();if(token!==generation||signal.aborted)return;
   const api=await module.mountCredits(host,{assetBase:'./credits/',signal,onClose:close,onError:()=>{if(token===generation)host.querySelector('.credits-close')?.focus({preventScroll:true});}});
   if(token!==generation||signal.aborted){api.destroy();return;}
   player=api;host.querySelector('.credits-close')?.focus({preventScroll:true});
  }catch(error){if(token===generation&&!signal.aborted)status('크레딧을 불러오지 못했어요 연결을 확인해 주세요',true);}
 }
 $('endingCredits').addEventListener('click',open);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 return {close(){if(dialog.open||controller||player)close();}};
}
