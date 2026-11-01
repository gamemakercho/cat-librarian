// A scene ID changes dialogue; only an artwork ID changes this retained layer.
export function createEndingArtView({layer,createImage,reducedMotion=false}){
 let current=null,fade=null,generation=0;
 function show(scene){
  if(!scene.endingArt){generation++;fade?.cancel();fade=null;current=null;layer.replaceChildren();return;}
  if(current?.key===scene.endingArt&&current.node.parentElement===layer)return current.node;
  const token=++generation;fade?.cancel();fade=null;
  const prior=current?.node,alt=scene.type==='impact'?'사서와 고양이의 이마가 부딪히는 순간':scene.endingArt==='ending-04-returned'?'바닥에 앉아 돌아온 걸 깨달은 사서와 놀라 물러나는 고양이':'작은 고양이를 안고 웃는 사서';
  const node=createImage('ending:'+scene.endingArt,'ending-art',alt);
  node.dataset.endingArt=scene.endingArt;node.dataset.artRole=scene.type==='impact'?'impact':'still';node.removeAttribute('aria-hidden');
  current={key:scene.endingArt,node};
  if(prior&&prior!==node&&prior.parentElement===layer&&!reducedMotion&&scene.type!=='impact'){
   // Keep the decoded previous artwork below the fade, including while loading.
   for(const child of [...layer.children])if(child!==prior&&child!==node)child.remove();
   prior.setAttribute('aria-hidden','true');layer.append(node);
   const animation=node.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});fade=animation;
   animation.finished.then(()=>{if(token===generation){prior.remove();animation.cancel();fade=null;}}).catch(()=>{});
  }else layer.replaceChildren(node);
  return node;
 }
 return {show,matches:key=>current?.key===key&&current.node.parentElement===layer,hasCurrent:()=>Boolean(current?.node.parentElement===layer)};
}
