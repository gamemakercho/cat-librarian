import {ENDING_READY,ENDING_CONTACT,ENDING_COMPLETE,ENDING_ERROR,isEndingMessage} from './ending-bridge.js';
export function createEndingUI({getScene,getRunId,getPoster,canRestore,onContact,onComplete,onReplay,onRestart,isCompleted}){
 const $=id=>document.getElementById(id);let active=null,timer=null,step=0,finished=false;
 const instructions=[['노란 부분을 찾아요','오른쪽 위와 왼쪽 아래예요'],['뒤쪽으로 접어요','노란 부분을 뒤로 접고, 엽서를 뒤집어 봐요']];
 function showStep(){
  $('foldStepTitle').textContent=`${step+1}. ${instructions[step][0]}`;$('foldStepBody').textContent=instructions[step][1];
  $('foldStepImage').src=`./assets/ending/fold-step-${step+1}.svg`;$('foldStepImage').alt=instructions[step].join(' ');
  $('foldStepPrevious').disabled=step===0;$('foldStepNext').textContent=step===1?'살펴볼게!':'다음 그림';$('foldStepCount').textContent=`${step+1} / 2`;
 }
 function showGuide(){step=0;showStep();$('foldGuideDialog').showModal();}
 function closeGuide(){$('foldGuideDialog').close();(getScene().type==='ending'?$('endingFoldAgain'):$('openFoldGuide')).focus();}
 $('openFoldGuide').addEventListener('click',showGuide);$('endingFoldAgain').addEventListener('click',showGuide);$('foldGuideClose').addEventListener('click',closeGuide);
 $('foldGuideDialog').addEventListener('cancel',e=>{e.preventDefault();closeGuide();});
 $('foldStepPrevious').addEventListener('click',()=>{step=0;showStep();});$('foldStepNext').addEventListener('click',()=>{if(step===1)closeGuide();else{step=1;showStep();}});
 function stop(){
  clearTimeout(timer);timer=null;active=null;finished=false;$('endingCinemaOverlay').hidden=true;$('endingFrame').removeAttribute('src');
  document.body.classList.remove('ending-active');document.documentElement.classList.remove('ending-active');$('appShell').inert=false;
 }
 function showError(){if(!active)return;$('endingLoading').hidden=true;$('endingError').hidden=false;$('endingRetry').focus();}
 function play(replay=false){
  const part=replay?'full':getScene().cinematicPart||'approach';if(part!=='approach'&&!canRestore())return;
  stop();const url=new URL(part==='approach'?'./games/ending-chase/':'./ending/',location.href);
  active={session:crypto.randomUUID(),runId:getRunId(),origin:url.origin,from:getScene().id,replay,part};
  $('endingCinemaOverlay').classList.toggle('is-runner',part==='approach');
  $('endingCinemaLabel').textContent=part==='approach'?'아직 끝나지 않은 이야기':'다시, 제자리로';
  $('endingFrame').title=part==='approach'?'츄르를 먹으려다 벌어진 로비의 마지막 사고':'원래 모습으로 돌아오는 마지막 장면';
  for(const [key,value]of Object.entries({parentOrigin:location.origin,session:active.session,runId:active.runId,part}))url.searchParams.set(key,value);
  $('endingLoading').hidden=false;$('endingError').hidden=true;$('appShell').inert=true;
  document.body.classList.add('ending-active');document.documentElement.classList.add('ending-active');$('endingCinemaOverlay').hidden=false;
  $('endingFrame').src=url.href;$('endingClose').focus();timer=setTimeout(showError,25000);
 }
 $('endingPlay').addEventListener('click',()=>{if(isCompleted())onReplay();else play();});
 $('endingReplay').addEventListener('click',onReplay);$('endingRestart').addEventListener('click',onRestart);$('endingRetry').addEventListener('click',()=>play(Boolean(active?.replay)));
 $('endingClose').addEventListener('click',()=>{stop();(getScene().type==='ending'?$('endingReplay'):$('endingPlay')).focus();});
 window.addEventListener('message',async event=>{
  const frame=$('endingFrame').contentWindow;
  if(isEndingMessage(event,active,frame,ENDING_READY)){clearTimeout(timer);$('endingLoading').hidden=true;$('endingError').hidden=true;return;}
  if(isEndingMessage(event,active,frame,ENDING_ERROR)){clearTimeout(timer);showError();return;}
  const contact=active?.part==='approach'&&isEndingMessage(event,active,frame,ENDING_CONTACT);
  const complete=active?.part!=='approach'&&isEndingMessage(event,active,frame,ENDING_COMPLETE);
  if(finished||(!contact&&!complete))return;finished=true;
  const session=active.session,replay=active.replay,fade=$('endingCinemaOverlay').animate([{opacity:1},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:contact?180:400});
  try{await fade.finished;}catch{}fade.cancel();if(active?.session!==session)return;stop();
  if(replay){$('endingReplay').focus();return;}if(contact)onContact(event.data.result);else onComplete(event.data.result);
 });
 function render(scene){
  stop();$('foldGuideDialog').close();const fold=scene.id==='ending-fold-puzzle';
  $('endingFoldActions').hidden=!fold;$('endingContactStill').hidden=!fold||!getPoster();
  if(fold){$('foldHintImage').src='./assets/ending/fold-hint.svg';if(getPoster())$('endingContactStill').src=getPoster();}
  else{$('endingContactStill').removeAttribute('src');$('foldHintImage').removeAttribute('src');}
  $('endingCinemaActions').hidden=scene.type!=='cinematic';$('endingPlay').disabled=scene.cinematicPart==='restore'&&!canRestore();$('endingPlay').textContent=isCompleted()?'이어서 보기':scene.actionLabel||'마지막 장면 보기';
  $('endingCard').hidden=scene.type!=='ending';$('endingCard').classList.remove('is-visible');
  if(scene.type==='ending'){requestAnimationFrame(()=>$('endingCard').classList.add('is-visible'));$('endingReplay').focus({preventScroll:true});}
  if(scene.autoPlay&&canRestore()&&!isCompleted())queueMicrotask(()=>{if(getScene().id===scene.id&&!active)play();});
 }
 return {render,stop,play};
}
