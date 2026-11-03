// A two-view location guide, independent of activity completion and puzzle state.
export function createMark05LocationUI({getScene,getState,onStep,onArrive,loadImage,createImage}){
 const $=id=>document.getElementById(id),root=$('mark05Location'),zoom=$('locationImageDialog');
 let generation=0,busy=false,shownKey=null,zoomFocus=null,hintGeneration=0;
 const current=()=>getScene().layout==='mark05-location';
 const viewerAllowed=()=>current()||getScene().layout==='notice05-expression';
 function guideImage(key,className,alt){const im=createImage(key,className,alt);if(!im.hasAttribute('width')){im.width=1086;im.height=1448;}return im;}
 function closeZoom(){zoom.close();$('locationZoomViewport').classList.remove('is-zoomed');if(zoomFocus?.isConnected)zoomFocus.focus({preventScroll:true});}
 function stop(){generation++;hintGeneration++;busy=false;if(zoom.open)closeZoom();}
 async function openZoom(key,alt,focus){
  if(!viewerAllowed())return;const token=generation;try{await loadImage(key);}catch{return;}if(token!==generation||!viewerAllowed())return;
  zoomFocus=focus;$('locationZoomViewport').replaceChildren(guideImage(key,'location-zoom-image',alt));$('locationZoomViewport').classList.remove('is-zoomed');
  $('locationZoomToggle').textContent='원본 크기로 보기';zoom.showModal();$('locationZoomClose').focus({preventScroll:true});
 }
 async function showStep(index){
  if(!current())return;const scene=getScene(),steps=scene.locationGuide,step=steps[index];if(!step)return;
  const token=++generation;busy=true;$('mark05Primary').disabled=true;$('mark05Retry').hidden=true;
  $('mark05ImageStatus').textContent='그림을 불러오는 중…';$('mark05ImageStatus').hidden=false;
  try{await loadImage(step.image);}catch{
   if(token!==generation||!current())return;busy=false;$('mark05ImageStatus').textContent='그림을 읽지 못했어요 연결을 확인하고 다시 시도해 주세요';$('mark05Retry').hidden=false;$('mark05Retry').onclick=()=>showStep(index);return;
  }
  if(token!==generation||getScene().id!==scene.id)return;
  if(shownKey!==step.image||!$('mark05Image').firstElementChild){$('mark05Image').replaceChildren(guideImage(step.image,'mark05-guide-image',step.alt));shownKey=step.image;}
  $('mark05Title').textContent=step.title;$('mark05Text').textContent=step.text;$('mark05Caption').textContent=step.caption;
  $('mark05Primary').textContent=step.button;$('mark05Image').setAttribute('aria-label',step.alt+' 눌러 확대 보기');
  $('mark05ImageStatus').hidden=true;$('mark05Retry').hidden=true;busy=false;$('mark05Primary').disabled=false;
  const changed=(getState().locationGuideStep||0)!==index;
  onStep(index);if(changed)$('stage').scrollTo({top:0,behavior:'instant'});$('mark05Image').onclick=()=>openZoom(step.image,step.alt,$('mark05Image'));
  // Only the next image of this reached location is prepared, never the route.
  if(index===0&&steps[1])loadImage(steps[1].image).catch(()=>{});
 }
 function render(scene){
  root.hidden=scene.layout!=='mark05-location';if(root.hidden)return;
  if(!shownKey){const step=scene.locationGuide[getState().locationGuideStep||0];$('mark05Title').textContent=step.title;$('mark05Text').textContent=step.text;$('mark05Caption').textContent=step.caption;}
  $('mark05Avatar').replaceChildren(createImage('cat:neutral','mark05-avatar','고양이 몸의 사서'));
  showStep(getState().locationGuideStep||0);
 }
 $('mark05Primary').onclick=()=>{if(busy||!current())return;if(getScene().locationGuideMode!=='puzzle-intro'&&(getState().locationGuideStep||0)===0)showStep(1);else{busy=true;$('mark05Primary').disabled=true;onArrive();}};
 $('locationZoomClose').onclick=closeZoom;zoom.addEventListener('cancel',e=>{e.preventDefault();closeZoom();});
 $('locationZoomToggle').onclick=()=>{const enlarged=$('locationZoomViewport').classList.toggle('is-zoomed');$('locationZoomToggle').textContent=enlarged?'전체 그림 보기':'원본 크기로 보기';$('locationZoomViewport').scrollTo(0,0);};
 async function showHints(){
  if(!current())return;const token=++hintGeneration,steps=getScene().locationGuide;
  const wrapper=document.createElement('section');wrapper.className='mark05-hint-viewer';const slot=document.createElement('button');slot.type='button';slot.className='mark05-image-button';
  const status=document.createElement('p');status.setAttribute('role','status');const controls=document.createElement('div');controls.className='mark05-hint-actions';
  const prev=document.createElement('button'),next=document.createElement('button');prev.type=next.type='button';prev.textContent='이전 그림';next.textContent='다음 그림';controls.append(prev,next);wrapper.append(slot,status,controls);$('locationHintList').append(wrapper);
  let index=getState().locationGuideStep||0,request=0;
  async function display(i){
   const serial=++request;prev.disabled=next.disabled=true;status.textContent='그림을 불러오는 중…';
   try{await loadImage(steps[i].image);}catch{if(serial===request&&token===hintGeneration){status.textContent='그림을 읽지 못했어요 다시 눌러 주세요';prev.disabled=false;next.disabled=false;}return;}
   if(token!==hintGeneration||serial!==request||!wrapper.isConnected)return;index=i;
   slot.replaceChildren(guideImage(steps[i].image,'mark05-hint-image',steps[i].alt));slot.setAttribute('aria-label',steps[i].alt+' 눌러 확대 보기');slot.onclick=()=>openZoom(steps[index].image,steps[index].alt,slot);
   status.textContent=(i+1)+' / '+steps.length;prev.disabled=i===0;next.disabled=i===steps.length-1;
  }
  prev.onclick=()=>display(Math.max(0,index-1));next.onclick=()=>display(Math.min(steps.length-1,index+1));display(index);
 }
 return {render,stop,showHints,showNoticeReference(focus){openZoom('hint:mark05-notice','노란 벤치 옆 고양이 마크 05 안내문 위치 그림',focus);},previous(){if(!current()||getScene().locationGuideMode==='puzzle-intro'||(getState().locationGuideStep||0)===0)return false;showStep(0);return true;}};
}
