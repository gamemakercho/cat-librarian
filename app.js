import { chapters, puzzles, STORY_VERSION, palette } from './story.js';
import { StoryRuntime } from './engine.js';

const params = new URLSearchParams(location.search);
const review = params.get('review') === '1';
const SAVE_KEY = `haemi-cat-opening-${review ? 'review' : 'play'}-reference-v3`;
const $ = id => document.getElementById(id);
let assets;
try{assets=await fetch('./assets.json').then(r=>{if(!r.ok)throw Error('자산 목록 오류');return r.json();});}
catch(e){$('loading').hidden=false;$('loading').textContent='자산 목록을 읽지 못했어요. 새로고침해 주세요.';throw e;}
let snapshot;
try { snapshot=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')||{}; } catch {snapshot={};}
const runtime=new StoryRuntime(chapters,puzzles,snapshot);
const sourceScenes=runtime.scenes.filter(s=>s.sourceNumber);
if(review&&params.has('scene')){
  const requested=sourceScenes.find(s=>s.sourceNumber===Number(params.get('scene')));
  if(requested)runtime.jump(requested.id);
}
let hintLevel=0;
let composing=false;
let compositionEndedAt=-Infinity;
let sceneReady=false;
let textTimer=null;
let textComplete=true;
let activeText='';
let renderSerial=0;
const imageCache=new Map();
const elementCache=new Map();
const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({...runtime.snapshot(),storyVersion:STORY_VERSION}));}catch{}}
function imageURL(key){if(!assets[key])throw Error(`자산 없음: ${key}`);return assets[key].src;}
function loadImage(key){
  const src=imageURL(key);
  if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{
    const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('이미지를 읽을 수 없어요.'));im.src=src;
  }));
  return imageCache.get(src);
}
function createImage(key,className,alt=''){
  const cacheKey=key+'|'+className;
  if(elementCache.has(cacheKey))return elementCache.get(cacheKey);
  const im=document.createElement('img');im.src=imageURL(key);im.alt=alt;im.className=className;im.draggable=false;
  elementCache.set(cacheKey,im);return im;
}
function sceneAssetKeys(s){
  const keys=[];
  if(s.background)keys.push(`bg:${s.background}`);
  if(s.cat)keys.push(`cat:${s.cat}`);
  if(s.staff)keys.push('actor:staff');
  if(s.sleeping)keys.push('actor:sleeping');
  if(s.comic)keys.push(`comic:${s.comic}`);
  if(s.illustration)keys.push(`prop:${s.illustration}`);
  if(s.marker)keys.push('prop:marker');
  return keys;
}
function emphasize(text,s){
  const el=$('dialogueText');el.replaceChildren();
  const terms=s.emphasis||[];
  if(!terms.length){el.textContent=text;return;}
  const escaped=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const split=new RegExp(`(${escaped.join('|')})`,'g');
  for(const part of text.split(split)){
    if(terms.includes(part)){const em=document.createElement('em');em.textContent=part;el.append(em);}
    else el.append(document.createTextNode(part));
  }
}
function finishText(){
  if(textTimer)clearInterval(textTimer);textTimer=null;textComplete=true;
  emphasize(activeText,runtime.scene);$('nextButton').textContent=runtime.scene.nextLabel||'다음';
}
function typeText(s){
  clearInterval(textTimer);textTimer=null;activeText=s.text||'';
  const segments=typeof Intl.Segmenter==='function'
    ? [...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(activeText)].map(x=>x.segment)
    : [...activeText];
  if(prefersReducedMotion||s.type==='puzzle'||s.type==='move'||s.type==='continuation'){textComplete=true;emphasize(activeText,s);return;}
  textComplete=false;let index=0;$('dialogueText').textContent='';
  textTimer=setInterval(()=>{
    index+=1;emphasize(segments.slice(0,index).join(''),s);
    if(index>=segments.length)finishText();
  },24);
}
function advance(opts={}){
  if(!sceneReady)return {ok:false,reason:'loading'};
  const result=runtime.advance(opts);if(result.ok){save();render();}return result;
}

async function render(){
  const serial=++renderSerial;const s=runtime.scene;
  sceneReady=false;
  clearInterval(textTimer);textTimer=null;hintLevel=0;
  const stage=$('stage');stage.dataset.type=s.type;stage.dataset.layout=s.layout||'';stage.dataset.scene=s.id;stage.dataset.background=s.background||'';
  stage.dataset.frame=s.backgroundFrame||'normal';
  stage.style.setProperty('--dim-opacity',s.dimOpacity||0);
  stage.style.setProperty('--dialogue-size',`${(s.fontSize||25)/5}cqw`);
  stage.style.setProperty('--line-height',s.lineHeight||1.8);
  for(const name of ['dialogue','nextButton','locationBanner','answerForm'])applyRect($(name),s.geometry[name]);
  $('loading').hidden=false;
  try{await Promise.all(sceneAssetKeys(s).map(loadImage));}catch(e){
    if(serial!==renderSerial)return;
    $('loading').textContent='이미지를 읽지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.';
    return;
  }
  if(serial!==renderSerial)return;
  $('loading').hidden=true;sceneReady=true;
  const bg=$('sceneLayer');bg.replaceChildren();
  bg.style.backgroundImage=s.background?`url("${imageURL(`bg:${s.background}`)}")`:'none';
  bg.style.opacity=s.backgroundOpacity||1;
  if(s.background)bg.append(createImage(`bg:${s.background}`,'background'));
  $('dimLayer').style.opacity='0';
  const cl=$('characterLayer');cl.replaceChildren();
  $('effectLayer').replaceChildren();
  if(s.sleeping){const im=createImage('actor:sleeping','character sleeping');applyRect(im,s.geometry.sleeping);cl.append(im);}
  if(s.staff){const im=createImage('actor:staff','character staff');applyRect(im,s.geometry.staff);cl.append(im);}
  if(s.cat){const im=createImage(`cat:${s.cat}`,'character cat');applyRect(im,s.geometry.cat);im.style.transform=s.flipCat?'scaleX(-1)':'';cl.append(im);}
  if(s.comic){const im=createImage(`comic:${s.comic}`,'comic-panel'+(s.effect?' bump':''));applyRect(im,s.geometry.comic);cl.append(im);}
  if(s.marker){const im=createImage('prop:marker','location-marker');applyRect(im,s.geometry.marker);$('effectLayer').append(im);}
  $('effectLayer').className='effect-layer';
  if(s.effect&&!prefersReducedMotion){void $('effectLayer').offsetWidth;$('effectLayer').classList.add(s.effect);}
  $('locationBanner').hidden=!s.location;$('locationBanner').textContent=s.location||'';$('locationBanner').style.background=palette[s.layout==='arrival'?'pink':'yellow'];
  $('titleScreen').hidden=s.type!=='title';
  if(s.type==='title'){
    const heading=$('titleScreen').querySelector('h1');heading.replaceChildren();
    for(const line of s.titleLines||[s.title]){const span=document.createElement('span');span.textContent=line;heading.append(span);}
    $('startButton').textContent=s.startLabel||'터치해서 시작';
  }
  $('dialogue').hidden=s.type==='title';$('dialogue').dataset.tone=s.panelTone||'cream';$('dialogue').style.background=palette[s.panelTone||'cream'];
  $('instruction').hidden=!s.instruction;$('instruction').textContent=s.instruction||'';
  $('puzzleIllustration').hidden=!s.illustration;
  if(s.illustration)$('puzzleIllustration').src=imageURL(`prop:${s.illustration}`);
  $('nextButton').hidden=!['dialogue','comic'].includes(s.type);$('nextButton').textContent=s.nextLabel||'다음';
  $('answerForm').hidden=s.type!=='puzzle';
  $('movementControls').hidden=s.type!=='move';$('movementFeedback').textContent='';
  $('continuationControls').hidden=s.type!=='continuation';
  $('backButton').disabled=!runtime.history.length;
  composing=false;$('answer').blur();$('answer').value='';$('answerFeedback').textContent='';
  $('hintButton').hidden=s.type!=='puzzle';
  $('answer').placeholder='';
  if(s.type==='puzzle')$('answer').setAttribute('aria-label',puzzles[s.puzzleId].placeholder);
  typeText(s);updateReview(s);
  // Preload only the immediate next scene; no full-route or raw-screen preloading.
  // Arrival questions intentionally pause speculative downloads while walking.
  if(s.next && !['puzzle','move','continuation'].includes(s.type)){
    const next=runtime.index.get(s.next);
    if(next?.type!=='move')sceneAssetKeys(next).forEach(k=>loadImage(k).catch(()=>{}));
  }
}

function updateReview(s){
  if(!review)return;
  $('sceneSelect').value=s.id;
  const position=s.sourceNumber?`${s.sourceNumber} / 24번 시안`:'추가한 진행 화면';
  $('sceneMeta').textContent=`${position}\n장면 ID: ${s.id}\n배경: ${s.background||'흰 회상 화면'}${s.cat?' · 표정: '+s.cat:''}`;
  const notConfigured=s.type==='puzzle'&&!puzzles[s.puzzleId].acceptedAnswers.length;
  $('reviewWarning').hidden=!notConfigured;
  $('reviewWarning').textContent=notConfigured?puzzles[s.puzzleId].missing+' 실제 정답을 입력해도 지금은 성공 처리하지 않습니다.':'';
  $('bypassButton').hidden=!notConfigured;
  $('referenceImage').hidden=!s.sourceNumber;$('noReference').hidden=Boolean(s.sourceNumber);
  $('referencePanel').hidden=!document.querySelector('.reference-details').open;
  $('referenceCaption').textContent=s.sourceNumber?`원본 ${String(s.sourceNumber).padStart(2,'0')} · 압축 비교본`:'정지 지점';
  const details=document.querySelector('.reference-details');
  if(details.open&&s.sourceNumber)$('referenceImage').src=imageURL(`reference:${s.sourceNumber}`);
  $('reviewBack').disabled=s.id===runtime.scenes[0].id;
  $('reviewNext').disabled=!s.next;
}

$('startButton').addEventListener('click',()=>advance());
$('nextButton').addEventListener('click',()=>textComplete?advance():finishText());
$('dialogue').addEventListener('click',()=>{if(!textComplete)finishText();});
$('backButton').addEventListener('click',()=>{if(runtime.back()){save();render();}});
$('arrivedButton').addEventListener('click',()=>advance({arrived:true}));
$('notYetButton').addEventListener('click',()=>{$('movementFeedback').textContent='천천히 이동해 주세요. 도착한 뒤 눌러 주세요.';});
$('answerForm').addEventListener('submit',e=>{
  e.preventDefault();if(!sceneReady||composing||performance.now()-compositionEndedAt<80)return;
  const result=runtime.submit($('answer').value);
  if(result.ok){save();$('answerFeedback').textContent='맞았어요! 다음 장면으로 갈게요.';advance();return;}
  $('answerFeedback').textContent={empty:'글자를 입력해 주세요.',incorrect:'조금 달라요. 엽서나 현장 표지를 다시 살펴볼까요?',
    'not-configured':'이 시안은 실제 정답을 설정하기 전이에요. 제작자 보기에서 다음 장면을 확인해 주세요.'}[result.reason]||'다시 확인해 주세요.';
});
$('answer').addEventListener('compositionstart',()=>{composing=true;});
$('answer').addEventListener('compositionend',()=>{composing=false;compositionEndedAt=performance.now();});
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter'&&(composing||e.isComposing||e.keyCode===229||performance.now()-compositionEndedAt<80))e.preventDefault();});
$('answer').addEventListener('focus',()=>{
  // Mobile browsers normally scroll for the keyboard. This also covers a
  // document with the optional creator panel below the game stage.
  setTimeout(()=>{$('answerForm').scrollIntoView({block:'center',behavior:'instant'});},250);
});
$('hintButton').addEventListener('click',()=>{
  const p=puzzles[runtime.scene.puzzleId];
  $('answerFeedback').textContent=p.hints[Math.min(hintLevel++,p.hints.length-1)];
});
$('menuButton').addEventListener('click',()=>{$('helpDialog').showModal();});
$('resumeButton').addEventListener('click',()=>{$('helpDialog').close();});
function restart(){runtime.reset();save();render();}
$('restartButton').addEventListener('click',restart);
$('helpRestartButton').addEventListener('click',()=>{$('helpDialog').close();restart();});
$('helpPreviewNote').hidden=!review;
if(review){
  $('reviewPanel').hidden=false;
  for(const s of runtime.scenes){
    const option=document.createElement('option');option.value=s.id;
    option.textContent=(s.sourceNumber?`${String(s.sourceNumber).padStart(2,'0')}. `:'＋ ')+(s.title||s.destination||s.text||'').replaceAll('\n',' ').slice(0,34);
    $('sceneSelect').append(option);
  }
  $('sceneSelect').addEventListener('change',e=>{runtime.jump(e.target.value);save();render();});
  $('reviewNext').addEventListener('click',()=>advance({review:true}));
  $('bypassButton').addEventListener('click',()=>advance({review:true}));
  $('reviewBack').addEventListener('click',()=>{
    const i=runtime.scenes.findIndex(s=>s.id===runtime.currentId);if(i>0){runtime.jump(runtime.scenes[i-1].id);save();render();}
  });
  document.querySelector('.reference-details').addEventListener('toggle',e=>{
    $('referencePanel').hidden=!e.target.open;
    if(e.target.open&&runtime.scene.sourceNumber)$('referenceImage').src=imageURL(`reference:${runtime.scene.sourceNumber}`);
  });
  const allKeys=new Set(sourceScenes.flatMap(sceneAssetKeys));
  const initialKeys=new Set(sceneAssetKeys(runtime.scenes[0]));
  const bytes=keys=>[...keys].reduce((a,k)=>a+assets[k].bytes,0);
  $('assetStats').textContent=`이미지 자산: 시작 장면 ${(bytes(initialKeys)/1000).toFixed(0)} KB (1KB=1,000B) · 24장 전체에서 재사용하는 그림 ${(bytes(allKeys)/1000).toFixed(0)} KB. 원본 비교 썸네일과 코드, 호스팅 로그인 데이터는 별도입니다.`;
}
function applyRect(el,rect){
  const [x,y,w,h]=rect;Object.assign(el.style,{left:x/5+'%',top:y/9+'%',width:w/5+'%',height:h/9+'%'});
}
window.visualViewport?.addEventListener('resize',()=>{
  if(document.activeElement===$('answer'))$('answerForm').scrollIntoView({block:'center',behavior:'instant'});
});
await render();
