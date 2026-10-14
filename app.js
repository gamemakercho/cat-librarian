import { chapters, puzzles, STORY_VERSION, palette, uiText } from './story.js';
import { StoryRuntime, formatMarkerNumber, normalizeArtAnswer } from './engine.js';
import {isMinigameReturn} from './minigame-bridge.js';

const params = new URLSearchParams(location.search);
const review = params.get('review') === '1';
const SAVE_KEY = `haemi-cat-opening-${review ? 'review' : 'play'}-reference-v3`;
const $ = id => document.getElementById(id);
let assets;
try{assets=await fetch('./assets.json').then(r=>{if(!r.ok)throw Error('자산 목록 오류');return r.json();});}
catch(e){$('loading').hidden=false;$('loading').textContent='자산 목록을 읽지 못했어요. 새로고침해 주세요.';throw e;}
let snapshot;
try { snapshot=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')||{}; } catch {snapshot={};}
const runtime=new StoryRuntime(chapters,puzzles,snapshot,uiText.successPopup);
const sourceScenes=runtime.scenes.filter(s=>s.sourceNumber);
if(review&&params.has('scene')){
  const requested=sourceScenes.find(s=>s.sourceNumber===Number(params.get('scene')));
  if(requested&&requested.id!==runtime.currentId)runtime.jump(requested.id);
}
let hintLevel=0;
let locationHintLevel=0;
let composing=false;
let compositionEndedAt=-Infinity;
let sceneReady=false;
let textTimer=null;
let textComplete=true;
let activeText='';
let renderSerial=0;
let renderedScene=null;
let keypadInputState=null;
let activeMinigame=null;
const imageCache=new Map();
const elementCache=new Map();
const clipCache=new Map();
const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({...runtime.snapshot(),storyVersion:STORY_VERSION}));}catch{}}
function imageURL(key){if(!assets[key])throw Error(`자산 없음: ${key}`);return assets[key].src;}
function loadImage(key){
  const src=imageURL(key);
  if(!imageCache.has(src)){
    const raster=new Promise((resolve,reject)=>{
      const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('이미지를 읽을 수 없어요.'));im.src=src;
    });
    const clip=assets[key].render?.clip;
    if(clip&&!clipCache.has(clip))clipCache.set(clip,fetch(clip).then(r=>{if(!r.ok)throw Error('직원 마스크 로딩 오류');return r.text();}).then(text=>{
      const doc=new DOMParser().parseFromString(text,'image/svg+xml');
      const d=doc.querySelector('path')?.getAttribute('d');if(!d)throw Error('직원 마스크 오류');return d;
    }));
    imageCache.set(src,clip?Promise.all([raster,clipCache.get(clip)]).then(([im,d])=>{assets[key].render.clipPath=d;return im;}):raster);
  }
  return imageCache.get(src);
}
function createImage(key,className,alt=''){
  const cacheKey=key+'|'+className;
  if(elementCache.has(cacheKey))return elementCache.get(cacheKey);
  const render=assets[key].render;
  if(render){
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',render.viewBox.join(' '));svg.setAttribute('preserveAspectRatio','xMidYMax meet');svg.setAttribute('class',className);svg.setAttribute('aria-hidden','true');
    const defs=document.createElementNS(ns,'defs');const clip=document.createElementNS(ns,'clipPath');clip.id='passing-staff-clip';clip.setAttribute('clipPathUnits','userSpaceOnUse');
    const path=document.createElementNS(ns,'path');path.setAttribute('d',render.clipPath);clip.append(path);defs.append(clip);svg.append(defs);
    const source=document.createElementNS(ns,'image');source.setAttribute('href',imageURL(key));source.setAttribute('width',assets[key].width);source.setAttribute('height',assets[key].height);source.setAttribute('clip-path','url(#passing-staff-clip)');svg.append(source);
    elementCache.set(cacheKey,svg);return svg;
  }
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
  if(s.decoration)keys.push(`prop:${s.decoration}`);
  if(s.marker)keys.push('prop:marker');
  if(puzzles[s.puzzleId]?.answerMode==='icons'){
    const state=runtime.puzzleStates[s.puzzleId];
    for(const id of state?.boardIds||[])keys.push(puzzles[s.puzzleId].icons[id].assetKey);
  }
  return keys;
}
function sceneMessage(s,text=s.guideText??s.text??''){
  return text.replaceAll('{destination}',s.destination||'').replaceAll('{markerNumber}',formatMarkerNumber(s.markerNumber));
}
function createMarker(s){
  const marker=document.createElement('div');marker.className='location-marker';
  const im=createImage('prop:marker','marker-art');marker.append(im);
  const number=formatMarkerNumber(s.markerNumber);
  if(number){const label=document.createElement('span');label.className='marker-number';label.textContent=number;marker.append(label);}
  marker.setAttribute('role','img');marker.setAttribute('aria-label',number?`${number}번 책 읽는 고양이 마크`:'책 읽는 고양이 마크');
  return marker;
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
  clearInterval(textTimer);textTimer=null;activeText=sceneMessage(s);
  const segments=typeof Intl.Segmenter==='function'
    ? [...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(activeText)].map(x=>x.segment)
    : [...activeText];
  if(prefersReducedMotion||s.textMode==='static'||s.type==='puzzle'||s.type==='move'||s.type==='continuation'){textComplete=true;emphasize(activeText,s);return;}
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
  if(puzzles[s.puzzleId]?.answerMode==='icons'){runtime.getIconState();save();}
  closeMinigame();
  const preserveText=Boolean(textComplete&&renderedScene?.textGroup&&renderedScene.textGroup===s.textGroup&&renderedScene.text===s.text);
  sceneReady=false;
  clearInterval(textTimer);textTimer=null;hintLevel=0;locationHintLevel=0;
  $('locationHintDialog').close();$('puzzleHintDialog').close();closeEnglishKeypad();$('successDialog').close();
  const stage=$('stage');stage.dataset.type=s.type;stage.dataset.layout=s.layout||'';stage.dataset.scene=s.id;stage.dataset.background=s.background||'';
  stage.dataset.frame=s.backgroundFrame||'normal';
  stage.style.setProperty('--dim-opacity',s.dimOpacity||0);
  stage.style.setProperty('--dialogue-size',`${(s.fontSize||25)/5}cqw`);
  stage.style.setProperty('--line-height',s.lineHeight||1.8);
  for(const name of ['dialogue','nextButton','locationBanner','answerForm','movementControls','tutorialPanel','iconPuzzle','minigameControls'])applyRect($(name),s.geometry[name]);
  $('loading').hidden=preserveText;
  try{await Promise.all(sceneAssetKeys(s).map(loadImage));}catch(e){
    if(serial!==renderSerial)return;
    $('loading').hidden=false;
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
  if(s.marker){const marker=createMarker(s);applyRect(marker,s.geometry.marker);$('effectLayer').append(marker);}
  $('effectLayer').className='effect-layer';
  if(s.effect&&!prefersReducedMotion){void $('effectLayer').offsetWidth;$('effectLayer').classList.add(s.effect);}
  $('locationBanner').hidden=!s.location;$('locationBanner').textContent=s.location||'';$('locationBanner').style.background=palette[s.layout==='arrival'?'pink':'yellow'];
  $('titleScreen').hidden=s.type!=='title';
  if(s.type==='title'){
    const heading=$('titleScreen').querySelector('h1');heading.replaceChildren();
    for(const line of s.titleLines||[s.title]){const span=document.createElement('span');span.textContent=line;heading.append(span);}
    $('startButton').textContent=s.startLabel||'터치해서 시작';
  }
  $('dialogue').hidden=['title','tutorial'].includes(s.type);$('dialogue').dataset.tone=s.panelTone||'cream';$('dialogue').style.background=palette[s.panelTone||'cream'];
  $('tutorialPanel').hidden=s.type!=='tutorial';
  if(s.type==='tutorial'){
    $('tutorialTitle').textContent=s.title;
    $('tutorialCards').replaceChildren();
    for(const card of s.guideCards||[]){
      const item=document.createElement('li');
      const heading=document.createElement('h3');heading.textContent=card.title;
      const body=document.createElement('p');body.textContent=card.body;
      item.append(heading,body);$('tutorialCards').append(item);
    }
    $('tutorialNote').textContent=s.guideNote||'';
  }
  $('instruction').hidden=!s.instruction||s.layout==='art';$('instruction').textContent=s.instruction||'';
  $('puzzleIllustration').hidden=!s.illustration;
  if(s.illustration)$('puzzleIllustration').src=imageURL(`prop:${s.illustration}`);
  const decoration=$('puzzleDecoration');decoration.hidden=!s.decoration;decoration.replaceChildren();
  if(s.decoration){
    const key=`prop:${s.decoration}`,asset=assets[key];
    const [x,y,w,h]=asset.displayCrop||[0,0,asset.width,asset.height];
    decoration.style.aspectRatio=`${w} / ${h}`;
    const im=createImage(key,'decoration-art');
    Object.assign(im.style,{left:-x/w*100+'%',top:-y/h*100+'%',width:asset.width/w*100+'%',height:asset.height/h*100+'%'});
    decoration.append(im);
  }
  $('nextButton').hidden=!['dialogue','comic','tutorial'].includes(s.type);$('nextButton').textContent=s.nextLabel||'다음';
  const puzzle=puzzles[s.puzzleId],isIcons=puzzle?.answerMode==='icons';
  $('answerForm').hidden=!((s.type==='puzzle'&&!isIcons)||(s.type==='minigame'&&puzzle.acceptedAnswers?.length));
  $('iconPuzzle').hidden=!isIcons;
  if(isIcons)renderIconPuzzle();
  $('minigameControls').hidden=s.type!=='minigame';
  $('startMinigame').textContent=s.gameStartLabel||'게임 시작';
  $('minigameNote').textContent=puzzle?.completionMode==='result'?'B등급 이상으로 청소하면 이야기를 이어갈 수 있어':
    puzzle?.acceptedAnswers?.length?'게임 클리어 키워드를 아래에 입력해 줘':'청소를 마치면 ‘이야기로 돌아가기’를 눌러줘';
  $('movementControls').hidden=s.type!=='move';
  $('arrivalQuestion').textContent=s.arrivalQuestion||uiText.arrivalQuestion;
  $('arrivedButton').textContent=s.arrivedLabel||uiText.arrivedLabel;
  $('notYetButton').textContent=s.lostLabel||uiText.lostLabel;
  $('continuationControls').hidden=s.type!=='continuation';
  $('backButton').disabled=!runtime.history.length;
  composing=false;$('answer').blur();$('answer').value='';$('answerFeedback').textContent='';
  $('hintButton').hidden=s.type!=='puzzle';
  const p=puzzles[s.puzzleId],english=p?.answerMode==='english-three';
  $('answerForm').dataset.english=String(Boolean(english));
  $('englishKeypadButton').hidden=!english;
  $('answerLabel').textContent=p?.answerLabel||'입력';
  $('checkButton').textContent=p?.checkLabel||'확인';
  $('answer').placeholder=p?.placeholder||'';
  $('answer').setAttribute('aria-label',p?.ariaLabel||p?.placeholder||'정답');
  $('answer').lang=english?'en':'ko';
  $('answer').inputMode='text';$('answer').readOnly=false;
  $('answer').setAttribute('autocapitalize','none');$('answer').setAttribute('autocorrect','off');
  $('answer').autocomplete='off';$('answer').spellcheck=false;$('answer').enterKeyHint='done';
  if(english)$('answer').removeAttribute('maxlength');else $('answer').maxLength=80;
  if(!preserveText)typeText(s);
  renderedScene=s;updateReview(s);
  if(runtime.pendingSuccessId===s.id)showSuccess();
  // Preload only the immediate next scene; no full-route or raw-screen preloading.
  // Arrival questions intentionally pause speculative downloads while walking.
  if(s.next && !['puzzle','move','continuation','minigame'].includes(s.type)){
    const next=runtime.index.get(s.next);
    if(next?.type!=='move'&&puzzles[next?.puzzleId]?.answerMode!=='icons')sceneAssetKeys(next).forEach(k=>loadImage(k).catch(()=>{}));
  }
}

function renderIconPuzzle(){
  const state=runtime.getIconState(),p=puzzles[runtime.scene.puzzleId];
  $('iconGrid').replaceChildren();
  for(const id of state.boardIds){
    const icon=p.icons[id],button=document.createElement('button');button.type='button';button.className='icon-tile';
    button.dataset.iconId=id;button.setAttribute('aria-label',icon.label);
    button.append(createImage(icon.assetKey,'icon-art'));
    const badge=document.createElement('span');badge.className='icon-selected-badge';badge.textContent='선택';badge.setAttribute('aria-hidden','true');button.append(badge);
    button.addEventListener('click',()=>{if(!sceneReady)return;if(runtime.toggleIcon(id)){save();updateIconPuzzle();}});
    $('iconGrid').append(button);
  }
  updateIconPuzzle();
}
function updateIconPuzzle(){
  const state=runtime.getIconState();if(!state)return;
  for(const button of $('iconGrid').children){
    const selected=state.selectedIds.includes(button.dataset.iconId);
    button.setAttribute('aria-pressed',String(selected));button.classList.toggle('selected',selected);
    button.disabled=Boolean(state.pendingSuccess||state.completed||runtime.pendingSuccessId);
  }
  $('selectionCount').textContent=`선택 ${state.selectedIds.length}/4`;
  $('checkIcons').textContent=state.completed?'다음으로':'정답 확인';
  $('checkIcons').disabled=Boolean(runtime.pendingSuccessId||(!state.completed&&state.selectedIds.length!==4));
  $('iconFeedback').textContent=state.feedback||'';
}
function closeMinigame(){
  if(!$('minigameOverlay').hidden){
    const scrollY=activeMinigame?.scrollY||0;activeMinigame=null;
    $('minigameOverlay').hidden=true;$('minigameFrame').removeAttribute('src');
    document.body.classList.remove('minigame-active');document.documentElement.classList.remove('minigame-active');
    document.body.style.removeProperty('--story-scroll-top');$('appShell').inert=false;window.scrollTo(0,scrollY);
  }
}
function sizeMinigame(){
  if(!activeMinigame)return;
  const height=window.visualViewport?.height||innerHeight,width=innerWidth;
  // Address/tool bars collapsing must not enlarge or rescale a game under the finger.
  activeMinigame.height=width!==activeMinigame.width?height:Math.min(activeMinigame.height,height);
  activeMinigame.width=width;$('minigameOverlay').style.height=`${activeMinigame.height}px`;
}

function showLocationHints(){
  if(runtime.scene.type!=='move')return;
  const s=runtime.scene,hints=s.locationHints||[];
  if(!hints.length)return;
  locationHintLevel=Math.max(1,locationHintLevel);
  $('locationHintTitle').textContent=s.locationHintTitle||uiText.locationHintTitle;
  const list=$('locationHintList');list.replaceChildren();
  hints.slice(0,Math.min(locationHintLevel,2)).forEach((text,i)=>{
    const card=document.createElement('section');card.className='location-hint-card';
    const title=document.createElement('h3');title.textContent=`힌트 ${i+1}`;
    const body=document.createElement('p');body.textContent=sceneMessage(s,text);card.append(title,body);list.append(card);
  });
  $('moreLocationHint').textContent=s.moreHintLabel||uiText.moreHintLabel;
  $('moreLocationHint').hidden=locationHintLevel>=Math.min(hints.length,2);
  $('closeLocationHint').textContent=s.closeHintLabel||uiText.closeHintLabel;
  if(!$('locationHintDialog').open)$('locationHintDialog').showModal();
  showGuideCat('locationHintIllustration','locationHintDialog');
}
async function showGuideCat(target,dialog){
  try{await loadImage('cat:neutral');if($(dialog).open)$(target).replaceChildren(createImage('cat:neutral',`hint-cat ${target}`));}catch{}
}
function showPuzzleHints(){
  if(runtime.scene.type!=='puzzle')return;
  const hints=puzzles[runtime.scene.puzzleId].hints||[];
  if(!hints.length)return;
  hintLevel=Math.max(1,hintLevel);
  const list=$('puzzleHintList');list.replaceChildren();
  hints.slice(0,Math.min(hintLevel,2)).forEach((text,i)=>{
    const card=document.createElement('section');card.className='location-hint-card';
    const title=document.createElement('h3');title.textContent=`힌트 ${i+1}`;
    const body=document.createElement('p');body.textContent=text;card.append(title,body);list.append(card);
  });
  $('morePuzzleHint').hidden=hintLevel>=Math.min(hints.length,2);
  if(!$('puzzleHintDialog').open)$('puzzleHintDialog').showModal();
  showGuideCat('puzzleHintIllustration','puzzleHintDialog');
}
async function showSuccess(){
  const s=runtime.scene;
  if(runtime.pendingSuccessId!==s.id)return;
  const config=runtime.pendingSuccess.popup;
  closeEnglishKeypad();
  $('answer').blur();
  $('successTitle').textContent=config.title;$('successBody').textContent=config.body;
  $('successNextButton').textContent=config.buttonLabel;$('successNextButton').disabled=false;
  $('successDialog').dataset.tone=config.tone;
  $('successIllustration').replaceChildren();
  if(!$('successDialog').open)$('successDialog').showModal();
  if(config.cat){
    try{await loadImage(`cat:${config.cat}`);if(runtime.currentId===s.id&&$('successDialog').open)$('successIllustration').append(createImage(`cat:${config.cat}`,'success-cat'));}catch{}
  }
}

function updateReview(s){
  if(!review)return;
  $('sceneSelect').value=s.id;
  const position=s.sourceNumber?`${s.sourceNumber} / 24번 시안`:'추가한 진행 화면';
  $('sceneMeta').textContent=`${position}\n장면 ID: ${s.id}\n배경: ${s.background||'흰 회상 화면'}${s.cat?' · 표정: '+s.cat:''}`;
  const notConfigured=['puzzle','minigame'].includes(s.type)&&puzzles[s.puzzleId].answerMode!=='icons'&&puzzles[s.puzzleId].completionMode!=='result'&&!puzzles[s.puzzleId].acceptedAnswers?.length;
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
$('checkIcons').addEventListener('click',()=>{
  if(!sceneReady||runtime.pendingSuccessId)return;
  if(runtime.getIconState()?.completed){advance();return;}
  const result=runtime.submit();save();updateIconPuzzle();if(result.ok)showSuccess();
});
$('startMinigame').addEventListener('click',()=>{
  if(!sceneReady||runtime.scene.type!=='minigame'||runtime.pendingSuccessId)return;
  if(!textComplete)finishText();save();
  const url=new URL(runtime.scene.gameUrl,location.href);
  activeMinigame={session:crypto.randomUUID(),gameId:runtime.scene.puzzleId,origin:url.origin,
    scrollY:window.scrollY,height:window.visualViewport?.height||innerHeight,width:innerWidth};
  url.searchParams.set('storyBridge','1');url.searchParams.set('storyOrigin',location.origin);
  url.searchParams.set('storySession',activeMinigame.session);url.searchParams.set('storyGameId',activeMinigame.gameId);
  document.body.style.setProperty('--story-scroll-top',`${-activeMinigame.scrollY}px`);
  document.documentElement.classList.add('minigame-active');document.body.classList.add('minigame-active');$('appShell').inert=true;
  sizeMinigame();$('minigameOverlay').hidden=false;$('minigameFrame').src=url.href;$('minigameFrame').focus();
});
window.addEventListener('message',event=>{
  const config=puzzles[runtime.scene.puzzleId];
  if(!isMinigameReturn(event,activeMinigame,$('minigameFrame').contentWindow,config))return;
  if(!runtime.completeMinigame(event.data.result).ok)return;
  save();closeMinigame();advance();
});
window.addEventListener('resize',sizeMinigame);
$('notYetButton').addEventListener('click',showLocationHints);
$('moreLocationHint').addEventListener('click',()=>{locationHintLevel+=1;showLocationHints();});
$('closeLocationHint').addEventListener('click',()=>{$('locationHintDialog').close();$('notYetButton').focus();});
$('successDialog').addEventListener('cancel',e=>e.preventDefault());
$('successDialog').addEventListener('keydown',e=>{if(e.key==='Enter')e.preventDefault();});
$('successNextButton').addEventListener('click',()=>{
  if(!sceneReady)return;
  const result=runtime.confirmSuccess();
  if(result.ok){$('successNextButton').disabled=true;$('successDialog').close();save();render();}
});
function submitAnswer(){
  if(!sceneReady||composing||runtime.pendingSuccessId||performance.now()-compositionEndedAt<80)return;
  const result=runtime.submit($('answer').value);
  if(result.ok){save();$('answerFeedback').textContent='';showSuccess();return;}
  const message={empty:'글자를 입력해 주세요.',incorrect:puzzles[runtime.scene.puzzleId]?.incorrectMessage||'조금 달라요. 엽서나 현장 표지를 다시 살펴볼까요?',
    'not-configured':'이 시안은 실제 정답을 설정하기 전이에요. 제작자 보기에서 다음 장면을 확인해 주세요.'}[result.reason]||'다시 확인해 주세요.';
  $('answerFeedback').textContent=message;$('keypadFeedback').textContent=message;
}
$('answerForm').addEventListener('submit',e=>{e.preventDefault();submitAnswer();});
$('answer').addEventListener('compositionstart',()=>{composing=true;});
$('answer').addEventListener('compositionend',()=>{composing=false;compositionEndedAt=performance.now();});
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter'&&(composing||e.isComposing||e.keyCode===229||performance.now()-compositionEndedAt<80))e.preventDefault();});
$('answer').addEventListener('focus',()=>{
  // Mobile browsers normally scroll for the keyboard. This also covers a
  // document with the optional creator panel below the game stage.
  setTimeout(()=>{$('answerForm').scrollIntoView({block:'center',behavior:'instant'});},250);
});
$('hintButton').addEventListener('click',showPuzzleHints);
$('morePuzzleHint').addEventListener('click',()=>{hintLevel+=1;showPuzzleHints();});
$('closePuzzleHint').addEventListener('click',()=>{$('puzzleHintDialog').close();$('hintButton').focus();});

function updateKeypad(){
  $('keypadValue').textContent=$('answer').value||'— — —';
  $('keypadDelete').disabled=!$('answer').value;
  const full=$('answer').value.length>=3;
  $('englishKeys').querySelectorAll('button').forEach(b=>b.disabled=full);
}
function openEnglishKeypad(){
  if(puzzles[runtime.scene.puzzleId]?.answerMode!=='english-three'||runtime.pendingSuccessId)return;
  const input=$('answer');
  keypadInputState={inputMode:input.inputMode,readOnly:input.readOnly};
  input.blur();input.inputMode='none';input.readOnly=true;
  const normalized=normalizeArtAnswer(input.value);
  // Opening the fallback keypad never silently truncates an existing raw answer.
  if(/^[a-z]{0,3}$/.test(normalized))input.value=normalized;
  $('keypadFeedback').textContent='';updateKeypad();$('englishKeypadDialog').showModal();
}
function closeEnglishKeypad(){
  if($('englishKeypadDialog').open)$('englishKeypadDialog').close();
  if(keypadInputState){$('answer').inputMode=keypadInputState.inputMode;$('answer').readOnly=keypadInputState.readOnly;keypadInputState=null;}
}
function keypadLetter(letter){
  if($('answer').value.length>=3)return;
  $('answer').value+=letter;updateKeypad();
}
for(const row of ['qwertyuiop','asdfghjkl','zxcvbnm']){
  const keys=document.createElement('div');keys.className='keypad-row';
  for(const letter of row){const button=document.createElement('button');button.type='button';button.textContent=letter;
    button.setAttribute('aria-label',letter);button.addEventListener('click',()=>keypadLetter(letter));keys.append(button);}
  $('englishKeys').append(keys);
}
$('englishKeypadButton').addEventListener('click',openEnglishKeypad);
$('keypadDelete').addEventListener('click',()=>{$('answer').value=$('answer').value.slice(0,-1);updateKeypad();});
$('keypadClose').addEventListener('click',()=>{closeEnglishKeypad();$('englishKeypadButton').focus();});
$('englishKeypadDialog').addEventListener('cancel',e=>{e.preventDefault();closeEnglishKeypad();$('englishKeypadButton').focus();});
$('englishKeypadDialog').addEventListener('close',()=>{if(keypadInputState)closeEnglishKeypad();});
$('keypadSubmit').addEventListener('click',submitAnswer);
$('englishKeypadDialog').addEventListener('keydown',e=>{
  if(composing||e.isComposing||e.keyCode===229)return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(/^[a-z]$/i.test(e.key)){e.preventDefault();keypadLetter(e.key.toLowerCase());}
  else if(e.key==='Backspace'){e.preventDefault();$('answer').value=$('answer').value.slice(0,-1);updateKeypad();}
  else if(e.key==='Enter'){e.preventDefault();submitAnswer();}
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
  sizeMinigame();
  if(document.activeElement===$('answer'))$('answerForm').scrollIntoView({block:'center',behavior:'instant'});
});
await render();
