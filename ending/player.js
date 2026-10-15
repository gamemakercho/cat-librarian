import {loadAssets} from './asset-loader.js';
import {renderScene} from './renderer.js';
import {PhasedFinale} from './phased-director.js';
import {drawChuru} from './churu-finale.js';
const $=id=>document.getElementById(id),canvas=$('film'),ctx=canvas.getContext('2d',{alpha:false});
const params=new URLSearchParams(location.search),parentOrigin=params.get('parentOrigin');
const embedded=window.parent!==window&&parentOrigin===location.origin;
const part=['approach','restore','full'].includes(params.get('part'))?params.get('part'):'full';
const session=params.get('session'),runId=params.get('runId'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
canvas.setAttribute('aria-label',part==='approach'?'로비의 츄르를 향해 달리다 넘어진 사서를 고양이가 받으려다가 두 머리가 맞닿는 장면':'두 영혼이 각자의 몸으로 돌아오는 장면');
let assets=null,last=null,started=false,sent=false,contactSent=false;
function tell(type,result){if(embedded)parent.postMessage({type,part,gameId:'library-ending-rescue',session,runId,...(result?{result}:{})},parentOrigin);}
const director=new PhasedFinale({part,onComplete:result=>{
  if(sent)return;sent=true;$('filmPause').disabled=true;tell('cat-librarian:ending-complete',result);
}}),engine=director.engine;
function drawProvidedImpact(s){
  if(!assets.impact)return;
  const [x,y,w,h]=assets.impact.meta.content_rect;
  const scale=Math.min(650/w,520/h),dw=w*scale,dh=h*scale;
  ctx.save();ctx.globalAlpha=reduced?1:Math.min(1,(1.05-s.phaseTime)/.18);
  ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,768,1152);
  ctx.drawImage(assets.impact.image,x,y,w,h,(768-dw)/2,650-dh/2,dw,dh);
  ctx.font='72px HaemiJua, sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=9;
  ctx.strokeStyle='#fff1c4';ctx.fillStyle='#c85a40';ctx.strokeText('꽝!',384,650-dh/2-40);ctx.fillText('꽝!',384,650-dh/2-40);ctx.restore();
}
function paint(){
  if(!assets)return;ctx.setTransform(canvas.width/768,0,0,canvas.height/1152,0,0);
  const s=director.snapshot(),view={...s,phase:s.phase==='countdown'?'establishing':s.phase,showComic:false,flashOpacity:0,showSoulTrails:part!=='approach'&&!reduced&&s.showSoulTrails};
  if(s.completed)view.cat={...s.cat,x:engine.config.catMaxX+90};
  const placements=renderScene(ctx,assets,view,engine.config);
  drawChuru(ctx,s);
  if(part!=='approach'&&s.phase==='contact')drawProvidedImpact(s);
  const captions={countdown:'로비 바닥에 츄르가…!',tracking:'그걸 먹으려고 달려오잖아!',slip:'앗, 넘어진다!',assist:'안 돼!',jump:'안 돼!',contact:part==='approach'?'……!':'',recovery:'…!',complete:'사서도 고양이도, 다시 제자리로!'};
  $('filmCaption').textContent=director.awaitingAnswer?'……!':s.paused?'준비되면 이어서 봐요':captions[s.phase]??'';
  $('filmPause').textContent=s.paused?'이어서 보기':'잠깐 멈추기';$('filmPause').disabled=director.awaitingAnswer||s.completed;
  const speech=$('filmSpeech');speech.hidden=s.paused||!['tracking','slip','jump'].includes(s.phase);
  if(!speech.hidden&&placements){const p=s.phase==='tracking'?placements.humanHead:placements.catHead;speech.textContent=s.phase==='tracking'?'냐아!':'안 돼!';speech.style.left=`${Math.min(85,Math.max(15,p.x/768*100))}%`;speech.style.top=`${Math.max(13,p.y/1152*100-4)}%`;}
}
function resize(){const box=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));paint();}
function start(){if(!assets||started)return;started=true;$('filmBegin').hidden=true;$('filmPause').disabled=false;director.start();last=null;paint();}
function pause(){if(engine.pause('hidden')){last=null;paint();}}
$('filmPause').addEventListener('click',()=>{if(director.awaitingAnswer)return;engine.snapshot().paused?engine.resume():engine.pause('manual');last=null;paint();});
$('filmBegin').addEventListener('click',start);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',pause);window.addEventListener('resize',resize);
function tick(now){
  const dt=last===null?0:Math.min(.1,Math.max(0,(now-last)/1000));last=now;
  if(assets&&started&&!document.hidden&&!engine.snapshot().paused){director.advance(dt);paint();}
  if(director.awaitingAnswer&&!contactSent){
    contactSent=true;paint();let still=null;try{still=canvas.toDataURL('image/jpeg',.72);}catch{}
    tell('cat-librarian:ending-contact',{gameId:'library-ending-rescue',contactReached:true,completed:false,still});
  }
  if(!engine.snapshot().completed&&!contactSent)requestAnimationFrame(tick);
}
try{
  assets=await loadAssets(new AbortController().signal,{part});resize();tell('cat-librarian:ending-ready');
  if(embedded)start();else{$('filmCaption').textContent='준비됐어요';$('filmBegin').hidden=false;}
  requestAnimationFrame(tick);
}catch(error){$('filmCaption').textContent='그림을 불러오지 못했어요 다시 시도해 주세요';tell('cat-librarian:ending-error');console.error(error);}
