// The timer counts visible, decoded-image time only; stop invalidates every queued frame.
export function createIllustrationUI({getScene,canStart,onStart,onImpactDone,onComplete}){
 let frame=null,generation=0,last=null,elapsed=0;
 const $=id=>document.getElementById(id);
 function stop(){generation++;cancelAnimationFrame(frame);frame=null;last=null;elapsed=0;}
 document.addEventListener('visibilitychange',()=>{last=null;document.documentElement.classList.toggle('ending-tab-hidden',document.hidden);});
 function render(scene){
   stop();$('endingImpactText').hidden=scene.type!=='impact';
   $('endingSpeaker').hidden=!scene.endingArt||!scene.speaker;
   $('endingSpeaker').textContent=scene.speaker||'';
   if(scene.type==='ending'){onComplete();return;}
   if(scene.type!=='impact'||!canStart())return;
   onStart();const token=generation;
   function tick(now){
     if(token!==generation||getScene().id!==scene.id)return;
     if(!document.hidden){if(last!==null)elapsed+=Math.min(now-last,100);last=now;}
     else last=null;
     if(elapsed>=scene.durationMs){frame=null;onImpactDone();return;}
     frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
 }
 return {render,stop};
}
