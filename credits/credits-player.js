import { CREDITS_DATA as DATA } from './credits-data.js?v=20261101-credits-v5';

export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,p)=>a+(b-a)*clamp(p,0,1);
const humanRows={run:0,paint:1,hop:2,perch:3,trip:4,bump:5};
const catRows={run:0,mop:1,repair:2,catch:3,rescue:4,bump:5,happy:6,reshelve:7};
const props={paintTeal:0,paintOrange:1,shoeLeft:2,shoeRight:3,bookRed:4,bookTeal:5,bookOpen:6,treat:7,cart:8,star:9,sweat:10,screwdriver:11,potOrange:12,potTeal:13,mopHead:14,toolbox:15};
export const LIBRARIAN_RUN=Object.freeze({image:'sprites/librarian-run-hd.png',columns:4,frames:8,fps:12});
export const GENERAL_SHELF=Object.freeze({top:128,bottomExclusive:144,slotWidth:7});
export const LOBBY_ACTOR_SCALE=Object.freeze({trip:.92,bump:.85});
export const LOBBY_CAT_SCALE=.84;
export const TREAT_PICKUP=Object.freeze({start:7.5,contact:7.96,frameStarts:[7.5,7.7,8,8.35,8.7,9.1],pocketStart:8.7,pocketEnd:9.1,end:9.5,pocketOpening:[62,99],handPoints:[[56,104],[48,119],[50,94],[63,100],[62,95],[51,90]]});
export function getPickupFrame(t){let frame=0;for(let i=0;i<TREAT_PICKUP.frameStarts.length;i++)if(t>=TREAT_PICKUP.frameStarts[i])frame=i;return frame;}
export function getTreatState(t){
 const s=TREAT_PICKUP,g=DATA.groundY;
 if(t<s.contact){const p=clamp((t-4.8)/.55,0,1),e=p*p*(3-2*p);return{state:'floor',x:mix(284,307,e),y:g-3-(p>0&&p<1?2*Math.sin(Math.PI*p):0),size:12,angle:mix(-.2,.2,e)};}
 const frame=getPickupFrame(t),hand=s.handPoints[frame],x=315+(hand[0]-64)/2,y=g+(hand[1]-124)/2;
 if(t<s.pocketStart)return{state:'held',frame,x,y:y+(frame===2?3:frame===3?-1:-.5),size:12,angle:frame>=2?0:.2};
 const pocketX=315+(s.pocketOpening[0]-64)/2,pocketY=g+(s.pocketOpening[1]-124)/2;
 if(t<s.pocketEnd){const p=clamp((t-s.pocketStart)/(s.pocketEnd-s.pocketStart),0,1);return{state:'pocketing',frame:4,x:pocketX,y:pocketY-1+8*p,size:12,angle:0,clipY:pocketY,progress:p};}
 return{state:'stored',frame:5,x:pocketX,y:pocketY,size:12,angle:0};
}
export const CURTAIN_CALL=Object.freeze({start:9.5,standEnd:10.6,bowDeep:11.2,bowHoldEnd:11.8,waveStart:12.3,x:300,handFrequencyHz:.72});
export function getCurtainCall(time){
 const s=CURTAIN_CALL;
 if(time<s.start)return null;
 if(time<s.standEnd)return{phase:'stand',frame:Math.min(3,2+Math.floor((time-s.start)/(s.standEnd-s.start)*2))};
 if(time<s.bowDeep)return{phase:'bow',frame:Math.min(5,4+Math.floor((time-s.standEnd)/(s.bowDeep-s.standEnd)*2))};
 if(time<s.bowHoldEnd)return{phase:'bow-hold',frame:6};
 if(time<s.waveStart)return{phase:'rise',frame:7};
 const a=(time-s.waveStart)*Math.PI*2*s.handFrequencyHz;
 return{phase:'wave',frame:8,humanHandAngle:Math.sin(a)*.16,catHandAngle:-Math.sin(a)*.20};
}
export const getImpactZoom=time=>time>=4.9&&time<5.5?1+.035*Math.sin(Math.PI*(time-4.9)/.6):1;
export const GENERAL_BOOKS=Object.freeze([
 {x:81,slotX:81,dropAt:1.3,pickAt:3,color:'#b94e3d',prop:'bookRed'},
 {x:107,slotX:110,dropAt:1.66,pickAt:4.15,color:'#378d94',prop:'bookTeal'},
 {x:133,slotX:129,dropAt:2.02,pickAt:5.3,color:'#b94e3d',prop:'bookRed'}
]);
export function getGeneralBookStates(t){
 return GENERAL_BOOKS.map((book,index)=>{
  let state='hidden';
  if(t>=book.pickAt+1)state='shelved';
  else if(t>=book.pickAt+.72)state='inserting';
  else if(t>=book.pickAt+.15)state='carried';
  else if(t>=book.dropAt+.36)state='floor';
  else if(t>=book.dropAt)state='falling';
  else if(t>=book.dropAt-.12)state='heldByHuman';
  return{...book,index,state,phase:clamp(t-book.pickAt,0,1)};
 });
}

export function getCreditsPose(index,time){
 const scene=DATA.scenes[clamp(index,0,5)],t=clamp(time,0,scene.duration),g=DATA.groundY;
 let h={x:-25+72*t,y:g,action:'run'},c={x:-100+70*t,y:g,action:'run'},camera=0;
 if(index===0){
  if(t>=2.8&&t<4.1)h={x:177,y:g,action:'paint',frame:Math.min(5,Math.floor((t-2.8)*5))};
  else if(t>=4.1)h.x=177+(t-4.1)*78;
 }
 if(index===1)c.action='mop';
 if(index===2){
  h.x=-20+85*t;
  if(t>=4&&t<4.8)h={x:320,y:g,action:'paint',frame:t<4.55?2:4};
  if(t>=4.8){h.x=320+(t-4.8)*115;h.y=g-clamp(h.x-470,0,160)*.7;h.action='hop';}
  c.x=Math.min(302,-90+70*t);if(c.x>=302)c.action='repair';
 }
 if(index===3){
  if(t<3)c.x=mix(-100,69,t/3);
  else if(t>=6.3)c.x=117+(t-6.3)*100;
  else{
   const active=GENERAL_BOOKS.find(b=>t>=b.pickAt&&t<b.pickAt+1);
   if(active)c={x:active.slotX-12,y:g,action:'reshelve',frame:Math.min(5,Math.floor((t-active.pickAt)*6))};
   else if(t<4.15)c.x=mix(69,98,(t-4)/.15);
   else c.x=mix(98,117,(t-5.15)/.15);
  }
  // Keep the eight-frame run alive while dropping a book. A standing paint
  // pose here would repeatedly interrupt the leg cycle.
  camera=0;
 }
 if(index===4){h={x:405,y:53,action:'perch'};c={x:400+Math.sin(t*2.5)*9,y:g,action:'catch'};camera=188;}
 if(index===5){
  h.x=-20+76*t;c.x=-90+74*t;
  if(t>=3.5&&t<4.8){const p=(t-3.5)/1.3;h={x:mix(246,315,p),y:g,action:'trip',scale:LOBBY_ACTOR_SCALE.trip,frame:Math.min(5,Math.floor(p*6))};c={x:mix(169,287,p),y:g-7*p-10*Math.sin(Math.PI*p),action:'rescue'};}
  if(t>=4.8){const p=(t-4.8)/2;h={x:315,y:g,action:'bump',scale:LOBBY_ACTOR_SCALE.bump,mirror:true,frame:Math.min(5,Math.floor(Math.max(0,p)*6))};c={x:287,y:g-7+7*clamp((t-6.8)/.7,0,1),action:t<6.8?'bump':'happy',frame:t<6.8?Math.min(5,Math.floor(p*6)):0};}
  if(t>=TREAT_PICKUP.start&&t<TREAT_PICKUP.end)h={x:315,y:g,action:'treatPickup',frame:getPickupFrame(t)};
  if(t>=9.1&&t<CURTAIN_CALL.start)c={x:mix(287,292,(t-9.1)/.4),y:g,action:'run'};
  c.atlas='lobby';c.scale=LOBBY_CAT_SCALE;
 }
 if(index!==4&&index!==5)c.x=Math.min(c.x,h.x-38);
 if(index!==3&&index!==4)camera=clamp(h.x-215,0,256);
 return {index,t,animationTime:Math.max(0,time),human:h,cat:c,camera,impact:index===5&&t>=4.9&&t<6.9,curtain:index===5?getCurtainCall(Math.max(0,time)):null};
}

export function getActorSample(which,pose,t){
 if(which==='human'&&pose.action==='treatPickup')return{image:'sprites/librarian-pocket-hd.png',columns:3,row:Math.floor(pose.frame/3),column:pose.frame%3,frame:pose.frame};
 if(which==='human'&&pose.action==='run'){
  const frame=Math.floor(Math.max(0,t)*LIBRARIAN_RUN.fps)%LIBRARIAN_RUN.frames;
  return{image:LIBRARIAN_RUN.image,columns:4,row:Math.floor(frame/4),column:frame%4,frame};
 }
 const frame=pose.frame??Math.floor(t*(pose.action==='rescue'?12:8))%6;
 if(which==='cat'&&pose.atlas==='lobby')return{image:'sprites/cat-lobby-hd.png',columns:6,row:{run:0,rescue:1,bump:2,happy:3}[pose.action],column:frame,frame};
 return{image:which==='human'?'sprites/librarian-hd.png':'sprites/cat-hd.png',columns:6,row:(which==='human'?humanRows:catRows)[pose.action],column:frame,frame};
}
function actor(ctx,images,which,pose,t){
 const sample=getActorSample(which,pose,t),image=images[sample.image];
 const x=Math.round(pose.x),y=Math.round(pose.y);
 ctx.save();ctx.translate(x,y);if(pose.mirror)ctx.scale(-1,1);
 if(pose.scale)ctx.scale(pose.scale,pose.scale);
 const sourceCell=image.width/sample.columns;
 ctx.drawImage(image,sample.column*sourceCell,sample.row*sourceCell,sourceCell,sourceCell,-32,-62,64,64);ctx.restore();
}
function prop(ctx,image,name,x,y,size=24,angle=0){
 const n=props[name];ctx.save();ctx.translate(Math.round(x),Math.round(y));if(angle)ctx.rotate(angle);
 ctx.drawImage(image,(n%4)*32,Math.floor(n/4)*32,32,32,-size/2,-size/2,size,size);ctx.restore();
}
function bookOnly(ctx,images,name,x,y,size=17,angle=0){
 const image=images[name==='bookRed'?'sprites/book-red-only.png':'sprites/book-teal-only.png'];
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);
 ctx.drawImage(image,-size/2,-size/2,size,size);ctx.restore();
}
function generalSlots(ctx,states,camera){
 for(const b of states){
  const slotX=b.slotX-camera,{top,bottomExclusive,slotWidth}=GENERAL_SHELF;
  // Only the interior is masked. Never copy, crop, translate, or paint over
  // the wooden shelf lip at y=144 or any furniture below it.
  ctx.save();ctx.beginPath();ctx.rect(Math.round(slotX-3),top,slotWidth,bottomExclusive-top);ctx.clip();
  ctx.fillStyle='#493220';ctx.fillRect(Math.round(slotX-3),top,slotWidth,bottomExclusive-top);
  if(b.state==='shelved'||b.state==='inserting'){
   const progress=b.state==='shelved'?1:clamp((b.phase-.72)/.28,0,1);
   ctx.fillStyle=b.color;ctx.fillRect(Math.round(slotX-2),top+1,Math.max(1,Math.round(5*progress)),bottomExclusive-top-1);
   if(progress>.6){ctx.fillStyle='#eed9a1';ctx.fillRect(Math.round(slotX-1),139,3,2);}
  }
  ctx.restore();
 }
}
function generalMovingBooks(ctx,images,p){
 const {t,camera}=p,g=DATA.groundY;
 for(const b of getGeneralBookStates(t)){
  const slotX=b.slotX-camera;
  if(b.state==='heldByHuman')bookOnly(ctx,images,b.prop,p.human.x+12-camera,g-25,15,-.2);
  if(b.state==='falling'){const q=clamp((t-b.dropAt)/.36,0,1);bookOnly(ctx,images,b.prop,b.x-camera,141+21*q*q,17,.3+q*.6);}
  if(b.state==='floor')bookOnly(ctx,images,b.prop,b.x-camera,g-3,17,.2);
  if(b.state==='carried'){
   const f=Math.min(5,Math.floor(b.phase*6));
   const handX=[8,8,12,14,14,10][f],handY=[-5,-10,-17,-23,-27,-22][f];
   bookOnly(ctx,images,b.prop,p.cat.x+handX-camera,g+handY,14,-b.phase);
  }
  if(b.state==='inserting'){
   const q=clamp((b.phase-.72)/.28,0,1);
   bookOnly(ctx,images,b.prop,mix(p.cat.x+14-camera,slotX,q),mix(g-27,137,q),14*(1-q),-Math.PI/2);
  }
 }
}
function curtainCall(ctx,images,p){
 const call=p.curtain;
 ctx.save();ctx.translate(Math.round(CURTAIN_CALL.x-p.camera)-48,DATA.groundY-62);
 if(call.phase==='wave'){
  ctx.drawImage(images['sprites/curtain-wave-body.png'],0,0,96,64);
  const hands=images['sprites/curtain-wave-hands.png'];
  for(const hand of[{column:0,pivot:[151,81],angle:call.humanHandAngle},{column:1,pivot:[82,99],angle:call.catHandAngle}]){
   const x=hand.pivot[0]/2,y=hand.pivot[1]/2;
   ctx.save();ctx.translate(x,y);ctx.rotate(hand.angle);ctx.drawImage(hands,hand.column*192,0,192,128,-x,-y,96,64);ctx.restore();
  }
 }else{
  ctx.drawImage(images['sprites/curtain-call-hd.png'],(call.frame%4)*192,Math.floor(call.frame/4)*128,192,128,0,0,96,64);
 }
 ctx.restore();
}
function lobbyTreat(ctx,images,p){
 const s=getTreatState(p.animationTime),pi=images['sprites/props.png'];
 if(s.state==='stored')return;
 ctx.save();
 if(s.state==='pocketing'){
  // The packet moves down behind the pocket lip. Its size never shrinks.
  ctx.beginPath();ctx.rect(s.x-p.camera-12,0,24,s.clipY);ctx.clip();
 }
 prop(ctx,pi,'treat',s.x-p.camera,s.y,s.size,s.angle);ctx.restore();
 if(s.state==='pocketing'){
  // A tiny fixed pixel seam makes the occlusion read as a trouser pocket.
  ctx.fillStyle='#79543a';ctx.fillRect(Math.round(s.x-p.camera-2),Math.round(s.clipY),5,1);
 }
}

export function drawCreditsFrame(ctx,images,index,time,options={}){
 const p=getCreditsPose(index,time),{t,camera}=p,g=DATA.groundY,scene=DATA.scenes[p.index];
 ctx.save();ctx.imageSmoothingEnabled=false;
 const zoom=index===5?getImpactZoom(t):1;
 if(zoom!==1){ctx.translate(200,138);ctx.scale(zoom,zoom);ctx.translate(-200,-138);}
 ctx.drawImage(images[scene.background],-Math.round(camera),0,576,192);
 const pi=images['sprites/props.png'];
 if(index===0){
  prop(ctx,pi,'potTeal',190-camera,154,24);
  if(t>=3.1){prop(ctx,pi,'paintTeal',198-camera,g,27);for(let i=0;i<3;i++)if(t<4.3)prop(ctx,pi,'paintOrange',196-camera+i*8,146-10*Math.sin((t-3.1)*3+i),9);}
 }
 if(index===1){
  for(let x=0,i=0;x<560;x+=24,i++)if(x<p.human.x&&x>p.cat.x+20)prop(ctx,pi,i%2?'shoeRight':'shoeLeft',x-camera,g-2,13,i%2?-.12:.12);
  for(const x of[114,242,366])if(x<p.human.x&&x>p.cat.x+20)prop(ctx,pi,'paintTeal',x-camera,g,27);
 }
 if(index===2&&p.cat.action==='repair'){
  prop(ctx,pi,'toolbox',282-camera,g+1,19);
  ctx.fillStyle=t>8.7?'#76b852':'#a87f43';ctx.fillRect(Math.round(345-camera),60,4,4);
 }
 if(index===3)generalSlots(ctx,getGeneralBookStates(t),camera);
 if(index===4){
  const cartX=p.cat.x+26;prop(ctx,pi,'cart',cartX-camera,g-14,40);
  const drops=Math.max(0,Math.floor((t-1)/1.6));
  for(let j=0;j<Math.min(drops,4);j++)prop(ctx,pi,j%2?'bookRed':'bookTeal',cartX-camera,g-28-j*4,19);
  const phase=(t-1)%1.6;
  if(t>1&&phase<1.15)prop(ctx,pi,drops%2?'bookRed':'bookTeal',428-camera,55+74*(phase/1.15)**2,20,.25+phase*.6);
 }
 if(p.curtain)curtainCall(ctx,images,p);
 else{
  actor(ctx,images,'cat',{...p.cat,x:p.cat.x-camera},t);
  actor(ctx,images,'human',{...p.human,x:p.human.x-camera},t);
 }
 if(index===5)lobbyTreat(ctx,images,p);
 if(index===3)generalMovingBooks(ctx,images,p);
 if(p.impact){
  for(let i=0;i<3;i++){ctx.globalAlpha=.45+.55*Math.abs(Math.sin((t-4.9)*6+i));prop(ctx,pi,'star',299-camera+(i-1)*14,127-(i%2)*12,13+i%2*2,(t-4.9)*.6);}
  ctx.globalAlpha=1;
 }
 ctx.restore();return p;
}

const imageLoads=new Map();
export async function loadCreditsImages(assetBase,override){
 if(override)return override;
 if(imageLoads.has(assetBase))return imageLoads.get(assetBase);
 const loading=(async()=>{
 const pairs=await Promise.all(DATA.images.map(path=>new Promise((resolve,reject)=>{
  const im=new Image();im.onload=async()=>{try{if(im.decode)await im.decode();resolve([path,im]);}catch(e){reject(e);}};
  im.onerror=()=>reject(new Error('크레딧 이미지 로딩 실패: '+path));im.src=assetBase+path;
 })));
 return Object.fromEntries(pairs);
 })();
 imageLoads.set(assetBase,loading);
 try{return await loading;}catch(error){if(imageLoads.get(assetBase)===loading)imageLoads.delete(assetBase);throw error;}
}

export async function mountCredits(root,options={}){
 const doc=root.ownerDocument,view=doc.defaultView;let disposed=false,raf=0,playing=true,sceneIndex=0,elapsed=0,last=0,finished=false,autoHidden=false,endingElapsed=0;
 const abort=new view.AbortController();
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const wrap=el('section','library-credits');wrap.setAttribute('aria-label','고양이가 된 사서 크레딧');
 const head=el('div','credits-head');head.append(el('div','credits-eyebrow','고양이가 된 사서 · 크레딧'));
 const close=el('button','credits-close','닫기');close.type='button';head.append(close);wrap.append(head);
 const title=el('h1','credits-title','함께한 모험');wrap.append(title);
 const frame=el('div','credits-frame');const canvas=el('canvas','credits-canvas');const renderScale=clamp(Number(options.renderScale)||2,1,3);canvas.width=320*renderScale;canvas.height=192*renderScale;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','사서와 고양이가 도서관을 지나가는 도트 애니메이션');frame.append(canvas);wrap.append(frame);
 const card=el('div','credits-lesson');card.setAttribute('aria-live','polite');const label=el('p','credits-lesson-label','오늘 함께 배운 것');const caption=el('p','credits-caption','그림을 준비하고 있어…');card.append(label,caption);wrap.append(card);
 const controls=el('div','credits-controls');const prev=el('button','','이전');const pause=el('button','','일시정지');const next=el('button','','다음');for(const b of[prev,pause,next]){b.type='button';controls.append(b);}wrap.append(controls);
 const endControls=el('div','credits-end-controls');endControls.hidden=true;const replay=el('button','','크레딧 다시 보기');replay.type='button';const back=el('button','','엔딩으로 돌아가기');back.type='button';endControls.append(replay,back);wrap.append(endControls);root.replaceChildren(wrap);
 const listen=(node,event,handler)=>node.addEventListener(event,handler,{signal:abort.signal});
 const destroy=()=>{if(disposed)return;disposed=true;view.cancelAnimationFrame(raf);abort.abort();wrap.remove();};
 if(options.signal?.aborted){destroy();return{destroy};}
 options.signal?.addEventListener('abort',destroy,{once:true,signal:abort.signal});
 const leave=()=>{destroy();options.onClose?.();};listen(close,'click',leave);listen(back,'click',leave);
 let images;
 try{images=await loadCreditsImages(String(options.assetBase||'./runtime/').replace(/\/?$/,'/'),options.images);}catch(e){if(!disposed){caption.textContent='그림을 불러오지 못했어. 잠시 후 다시 열어 줘.';controls.hidden=true;options.onError?.(e);}return{destroy};}
 if(disposed)return{destroy};
 const ctx=canvas.getContext('2d');ctx.setTransform(renderScale,0,0,renderScale,0,0);ctx.imageSmoothingEnabled=false;
 function updateText(){
  title.textContent=finished?'고마웠어, 명예사서님!':DATA.scenes[sceneIndex].title;
  label.textContent=finished?'오늘 함께한 모험을 기억해 줘':'오늘 함께 배운 것';
  caption.replaceChildren();const lines=finished?DATA.closing:[DATA.scenes[sceneIndex].caption];
  for(const [i,line]of lines.entries()){if(i)caption.append(doc.createElement('br'));caption.append(doc.createTextNode(line));}
  controls.hidden=finished;endControls.hidden=!finished;prev.disabled=sceneIndex===0;pause.textContent=playing?'일시정지':'계속 보기';
 }
 function setScene(i){sceneIndex=clamp(i,0,5);elapsed=0;endingElapsed=0;finished=false;last=0;updateText();}
 function finish(){if(finished)return;finished=true;playing=true;elapsed=DATA.scenes[5].duration;endingElapsed=0;updateText();options.onFinish?.();}
 listen(prev,'click',()=>setScene(sceneIndex-1));
 listen(next,'click',()=>sceneIndex===5?finish():setScene(sceneIndex+1));
 listen(pause,'click',()=>{playing=!playing;last=0;updateText();});
 listen(replay,'click',()=>{playing=true;setScene(0);});
 listen(doc,'visibilitychange',()=>{if(doc.hidden){autoHidden=playing;playing=false;}else if(autoHidden){playing=true;autoHidden=false;}last=0;pause.textContent=playing?'일시정지':'계속 보기';});
 function tick(now){
  if(disposed)return;
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(playing){if(finished)endingElapsed+=dt;else{elapsed+=dt;if(elapsed>=DATA.scenes[sceneIndex].duration){if(sceneIndex===5)finish();else setScene(sceneIndex+1);}}}
  drawCreditsFrame(ctx,images,sceneIndex,elapsed+endingElapsed);
  raf=view.requestAnimationFrame(tick);
 }
 updateText();raf=view.requestAnimationFrame(tick);
 return{destroy,pause(){playing=false;last=0;updateText();},resume(){playing=true;last=0;updateText();},getState(){return{sceneIndex,elapsed,endingElapsed,playing,finished};}};
}
