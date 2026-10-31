// A static postcard reference. Its loading never blocks the puzzle or records success.
export const FOLD_REFERENCE=Object.freeze({src:'./assets/ending/postcard-fold-complete.webp',fallback:'./assets/ending/postcard-fold-complete.png'});
export async function loadFoldReference(load){try{return await load(FOLD_REFERENCE.src);}catch{return load(FOLD_REFERENCE.fallback);}}
export function createFoldReference({getScene}){
 const $=id=>document.getElementById(id);let job=null,token=0;
 const request=src=>new Promise((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=async()=>{try{if(image.decode)await image.decode();resolve(image);}catch(error){reject(error);}};image.onerror=reject;image.src=src;});
 function preload(){if(!job)job=loadFoldReference(request).catch(error=>{job=null;throw error;});return job;}
 function stop(){token++;$('foldReferenceCard').hidden=true;}
 function size(){const tools=document.querySelector('.player-tools'),available=(visualViewport?.height||innerHeight)-(tools?.getBoundingClientRect().height||60);document.getElementById('stage').style.setProperty('--fold-available-height',Math.max(180,available)+'px');}
 async function show(){const serial=++token;$('foldReferenceCard').hidden=false;$('foldReferenceImage').hidden=true;$('foldReferenceStatus').hidden=false;$('foldReferenceStatus').textContent='엽서 그림을 불러오는 중…';$('foldReferenceRetry').hidden=true;size();
  try{const image=await preload();if(serial!==token||getScene().id!=='ending-fold-puzzle')return;$('foldReferenceImage').src=image.src;$('foldReferenceImage').hidden=false;$('foldReferenceStatus').hidden=true;}
  catch{if(serial!==token||getScene().id!=='ending-fold-puzzle')return;$('foldReferenceStatus').textContent='그림을 읽지 못했어요 접기 안내를 보며 문제를 계속 풀 수 있어요';$('foldReferenceRetry').hidden=false;}
 }
 $('foldReferenceRetry').onclick=()=>{job=null;show();};addEventListener('resize',size);visualViewport?.addEventListener('resize',size);
 return {stop,render(scene){stop();if(scene.id==='ending-rescue')preload().catch(()=>{});if(scene.id==='ending-fold-puzzle')show();}};
}
