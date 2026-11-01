import {IMPACT_DURATION_MS} from './ending-art-state.js';
// CSS effects seek to persisted visible time, including after pause/reload.
export function createIllustrationUI({getScene,canStart,getProgress,onStart,onProgress,onImpactDone,onComplete,isPaused=()=>false}){
 let frame=null,generation=0,last=null,elapsed=0,active=null,saved=0,animations=[];
 const $=id=>document.getElementById(id);
 function flush(){if(active){onProgress({sceneId:active.id,elapsedMs:elapsed});saved=elapsed;}}
 function stop(){flush();generation++;cancelAnimationFrame(frame);frame=null;last=null;active=null;animations=[];}
 document.addEventListener('visibilitychange',()=>{flush();last=null;});
 window.addEventListener('pagehide',flush);
 function sync(){for(const animation of animations)animation.currentTime=elapsed;}
 function render(scene){
   stop();$('endingImpactText').hidden=scene.type!=='impact';
   $('endingSpeaker').hidden=!scene.endingArt||!scene.speaker;
   $('endingSpeaker').textContent=scene.speaker||'';
   const stars=$('endingImpactStars');stars.hidden=true;
   if(scene.type==='ending'){onComplete();return;}
   if(scene.type!=='impact'||!canStart())return;
   elapsed=getProgress()?.elapsedMs||0;saved=elapsed;
   const art=$('endingArtLayer').querySelector('[data-art-role="impact"]');
   art.classList.remove('impact-playing','impact-settled');stars.classList.remove('impact-playing');
   if(elapsed>=IMPACT_DURATION_MS){art.classList.add('impact-settled');$('nextButton').hidden=false;return;}
   active=scene;onStart();stars.hidden=false;art.classList.add('impact-playing');stars.classList.add('impact-playing');
   animations=[...art.getAnimations(),...stars.getAnimations({subtree:true})];sync();
   const token=generation;
   function tick(now){
     if(token!==generation||getScene().id!==scene.id)return;
     if(!document.hidden&&!isPaused()){if(last!==null)elapsed=Math.min(IMPACT_DURATION_MS,elapsed+Math.min(now-last,100));last=now;}
     else last=null;
     sync();if(elapsed-saved>=100)flush();
     if(elapsed>=IMPACT_DURATION_MS){flush();active=null;frame=null;onImpactDone();return;}
     frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
 }
 return {render,stop};
}
