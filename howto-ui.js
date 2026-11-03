// The parent owns the only instructions page. No child iframe exists until Start.
export function createHowtoUI({loadImage,createImage,onStart,onDismiss,isCurrent}){
 const $=id=>document.getElementById(id),dialog=$('howtoDialog');let active=null,generation=0,busy=false,shownKey=null,returnFocus=null;
 function close(notify=false){const old=active,wasOpen=dialog.open;generation++;active=null;busy=false;if(dialog.open)dialog.close();if(notify&&old)onDismiss(old);if(wasOpen&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;}
 async function load(){
  if(!active)return;const item=active,token=++generation;$('howtoStart').disabled=true;$('howtoRetry').hidden=true;$('howtoStatus').hidden=false;$('howtoStatus').textContent='플레이 방법을 불러오는 중…';
  try{await loadImage(item.key);}catch{if(token!==generation||!active)return;$('howtoStatus').textContent='그림을 읽지 못했어요 연결을 확인하고 다시 불러와 주세요';$('howtoRetry').hidden=false;return;}
  if(token!==generation||!active||!isCurrent(item))return;
  if(shownKey!==item.key){const im=createImage(item.key,'howto-image',item.alt);im.width=1080;im.height=1920;$('howtoImage').replaceChildren(im);shownKey=item.key;}
  $('howtoImage').dataset.pending='false';$('howtoStatus').hidden=true;$('howtoStart').disabled=false;
 }
 function open(item){
  if(active?.sceneId===item.sceneId&&active?.runId===item.runId&&dialog.open)return;
  close();$('howtoImage').dataset.pending=String(shownKey!==item.key);active=item;returnFocus=document.activeElement;$('howtoTitle').textContent=item.name+' 플레이 방법';busy=false;
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;$('howtoClose').focus({preventScroll:true});load();
 }
 $('howtoStart').onclick=()=>{if(busy||!active||$('howtoStart').disabled||!isCurrent(active))return;busy=true;const item=active;$('howtoStart').disabled=true;close();onStart(item);};
 $('howtoClose').onclick=()=>close(true);dialog.addEventListener('cancel',e=>{e.preventDefault();close(true);});$('howtoRetry').onclick=load;
 return {open,close};
}
