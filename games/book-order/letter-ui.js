import {LETTER_PUZZLE as C} from './letter-puzzle-config.js?v=20261030-integrated20';
import {restoreLetters,solveLetters,orderSorted,letterProof,validOrderProgress} from './letter-state.js';
import {shelfPlacement} from './geometry.js';
export function createLetterUI({storageKey,getGame,getLayout,onFinish,onProgress}){
 const $=id=>document.getElementById(id);let state=null,shown=false,composing=false,compositionEnd=-Infinity,nextAt=0,returned=false;
 const panel=$('letterPanel'),dialog=$('letterSuccess');
 const load=()=>{try{return JSON.parse(localStorage.getItem(storageKey))}catch{return null}};
 const progress=()=>({kind:'book-order',sortComplete:true,shelf:[...getGame().shelf],cart:[...getGame().cart],letters:{...state}});
 function save(){state.revision++;try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}onProgress(progress());}
 function size(){document.documentElement.style.setProperty('--letter-height',(visualViewport?.height||innerHeight)+'px');
  if(!shown)return;const canvas=$('board'),vp=$('boardViewport');const scale=canvas.clientWidth/941,padding=Math.max(0,(vp.clientHeight-520*scale)/2),offset=padding-440*scale;document.documentElement.style.setProperty('--sorted-canvas-top',offset+'px');
  const l=getLayout(),y=(l.sign_label_center[1]+20+l.shelf.baseline-l.shelf.book_height)/2;
  for(const el of $('bookLetters').children){const i=getGame().shelf.indexOf(el.dataset.bookId),q=shelfPlacement(l,i);el.style.left=(q.center[0]*scale)+'px';el.style.top=(y*scale+offset)+'px';}
 }
 function draw(){if(!shown)return;panel.dataset.phase=state.phase;$('letterIntro').textContent=C.intro[state.introIndex];$('letterIntroNext').hidden=state.introIndex>=2;$('letterAnswer').value=state.answer;
  $('letterHintBody').textContent=C.hints.slice(0,state.hintLevel).join('\n');$('letterHints').hidden=!state.hintLevel;
  $('letterMoreHint').hidden=state.hintLevel>=2;
  const pending=['pending-success','complete'].includes(state.phase);$('letterAnswer').disabled=pending;$('letterCheck').disabled=pending;
  if(pending){$('letterHappy').src='../../assets/cats/happy.webp';if(!dialog.open)dialog.showModal();$('letterSuccessNext').disabled=false;nextAt=performance.now()+300;}
  else if(dialog.open)dialog.close();size();
 }
 function sync(){
  if(!orderSorted(getGame())){shown=false;panel.hidden=true;document.querySelector('.sorted-intro').hidden=true;document.querySelector('.sorted-paws').hidden=true;$('bookLetters').hidden=true;document.documentElement.classList.remove('letter-mode');if(dialog.open)dialog.close();return;}
  if(!shown){shown=true;state=restoreLetters(load());returned=false;document.documentElement.classList.add('letter-mode');panel.hidden=false;document.querySelector('.sorted-intro').hidden=false;document.querySelector('.sorted-paws').hidden=false;
   $('bookLetters').replaceChildren();for(const id of getGame().shelf){const span=document.createElement('span');span.dataset.bookId=id;span.textContent=C.letters[id];span.setAttribute('aria-label',getGame().shelf.indexOf(id)+1+'번 책 위 글자 '+C.letters[id]);$('bookLetters').append(span);}
   $('bookLetters').hidden=false;$('letterPaws').src='paw-strip.png';$('letterInstruction').textContent=C.instruction;nextAt=performance.now()+300;draw();save();
  }
 }
 function submit(){if(!shown||composing||performance.now()-compositionEnd<80||['pending-success','complete'].includes(state.phase))return;
  const result=solveLetters(state,$('letterAnswer').value);state=result;save();
  if(result.phase==='pending-success'){$('letterAnswer').blur();$('letterFeedback').textContent='';draw();}
  else $('letterFeedback').textContent=C.incorrect;
 }
 $('letterForm').addEventListener('submit',e=>{e.preventDefault();submit();});
 $('letterAnswer').addEventListener('input',()=>{if(!shown||['pending-success','complete'].includes(state.phase))return;state.answer=$('letterAnswer').value;save();$('letterFeedback').textContent='';});
 $('letterAnswer').addEventListener('compositionstart',()=>{composing=true;});$('letterAnswer').addEventListener('compositionend',()=>{composing=false;compositionEnd=performance.now();});
 $('letterAnswer').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||composing||e.keyCode===229||performance.now()-compositionEnd<80))e.preventDefault();});
 $('letterIntroNext').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.repeat)e.preventDefault();});
 $('letterIntroNext').onclick=()=>{if(!shown||performance.now()<nextAt)return;nextAt=performance.now()+300;state.introIndex=Math.min(2,state.introIndex+1);if(state.introIndex===2)state.phase='question';save();draw();};
 $('letterHint').onclick=()=>{if(!shown)return;state.hintLevel=Math.max(1,state.hintLevel);save();draw();};
 $('letterMoreHint').onclick=()=>{state.hintLevel=Math.min(2,state.hintLevel+1);save();draw();};
 dialog.addEventListener('cancel',e=>e.preventDefault());dialog.addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault();});
 $('letterSuccessNext').onclick=()=>{if(returned||!shown||performance.now()<nextAt||!['pending-success','complete'].includes(state.phase))return;
  const firstCompletion=state.phase!=='complete';returned=true;state.phase='complete';save();$('letterSuccessNext').disabled=true;
  onFinish({kind:'book-order',cleared:true,complete:true,shelf:[...getGame().shelf],cart:[...getGame().cart],letterPuzzle:letterProof(state)},firstCompletion);
 };
 $('letterAnswer').addEventListener('focus',()=>setTimeout(()=>$('letterAnswer').scrollIntoView({block:'center'}),200));
 addEventListener('resize',size);visualViewport?.addEventListener('resize',size);
 return {sync,progress:()=>shown?progress():null,reset(){state=null;shown=false;returned=false;try{localStorage.removeItem(storageKey)}catch{}$('letterFeedback').textContent='';sync();},
  restore(value){const v=validOrderProgress(value);if(!v)return;const prior=state||restoreLetters(load());if(v.letters.revision<prior.revision)return;
    state=restoreLetters(v.letters);try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}shown=false;sync();}};
}
