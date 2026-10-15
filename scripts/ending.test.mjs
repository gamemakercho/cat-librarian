import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime,normalizeAnswer} from '../engine.js';
import {chapters,puzzles,createChapters} from '../story.js';
import {endingPuzzleId,createEndingScenes} from '../ending-course.js';
import {isEndingMessage,ENDING_COMPLETE,ENDING_READY,ENDING_CONTACT,isEndingPoster} from '../ending-bridge.js';
import {PhasedFinale} from '../ending/phased-director.js';
import {CHURU} from '../ending/churu-finale.js';
import {RescueEngine} from '../ending/engine.js';
import {directRescue} from '../ending/auto-director.js';
import {ImpactCutin,advanceImpactTimeline} from '../ending/impact-cutin.js';
import {readFileSync} from 'node:fs';

test('처음12글자·마지막11글자는 정확한 문장이고 같은 규칙으로 정규화한다',()=>{
 assert.equal([...normalizeAnswer(puzzles['postcard-heading'].acceptedAnswers[0])].length,12);
 assert.equal([...normalizeAnswer(puzzles[endingPuzzleId].acceptedAnswers[0])].length,11);
 for(const answer of ['고양이와 사서가 돌아왔다','고양이와사서가돌아왔다!',' 고양이와\n사서가 돌아왔다！ ','고양이와 사서가 돌아왔다'.normalize('NFD')]){
  const r=new StoryRuntime(chapters,puzzles);r.jump('ending-fold-puzzle');assert(r.submit(answer).ok);
  assert.equal(r.currentId,'ending-fold-puzzle');assert(!r.solved.has(endingPuzzleId));
  const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.pendingSuccessId,'ending-fold-puzzle');
  assert.equal(restored.advance().reason,'success-confirmation-required');assert.equal(restored.confirmSuccess().scene.id,'ending-impact');
 }
 for(const answer of ['사서와 고양이가 돌아왔다','고양이와 사서가 뒤바뀌었다','돌아왔다','고양이와 사서가 돌아왔다.']){
  const r=new StoryRuntime(chapters,puzzles);r.jump('ending-fold-puzzle');assert(!r.submit(answer).ok);
 }
});
test('기존 로비 저장은 제목으로 돌아가지 않고 후속 엔딩 첫 대사로 복원된다',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'lobby-ending-entry',solved:['postcard-heading'],history:['newbooks-after-order']});
 assert.equal(r.scene.type,'dialogue');assert(r.scene.next);assert(r.solved.has('postcard-heading'));assert.equal(r.back(),true);
 assert.equal(r.currentId,'newbooks-after-order');
});
test('정답·시간 경과·복귀 버튼만으로 연출이 완료되지 않으며 결과 뒤에만 이동한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('ending-rescue');assert.equal(r.advance().reason,'ending-required');
 assert(!r.completeCinematic({gameId:'another-game',completed:true}).ok);assert(!r.completeCinematic({gameId:'library-ending-rescue',completed:false}).ok);
 assert.equal(r.flags.endingRescueComplete,undefined);
 assert(r.completeEndingApproach({gameId:'library-ending-rescue',contactReached:true,completed:false}).ok);
 assert.equal(r.advance().scene.id,'ending-fold-puzzle');assert.equal(r.flags.endingRescueComplete,undefined);
 r.submit('고양이와 사서가 돌아왔다!');assert.equal(r.confirmSuccess().scene.id,'ending-impact');
 assert(r.completeCinematic({gameId:'library-ending-rescue',completed:true}).ok);
 const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert(restored.flags.endingRescueComplete);
 assert.equal(restored.advance().scene.id,'ending-returned');
 r.reset();assert(!r.flags.endingRescueComplete);
});
test('iframe 결과는 출처·창·세션·플레이ID·게임ID·완료 결과를 모두 확인한다',()=>{
 const frame={},active={origin:'https://gamemakercho.github.io',session:'session-1',runId:'run-12345678',part:'restore'};
 const valid={source:frame,origin:active.origin,data:{type:ENDING_COMPLETE,part:'restore',session:active.session,runId:active.runId,gameId:'library-ending-rescue',result:{gameId:'library-ending-rescue',completed:true}}};
 assert(isEndingMessage(valid,active,frame,ENDING_COMPLETE));
 for(const bad of [{...valid,origin:'https://evil.invalid'},{...valid,source:{}},{...valid,data:{...valid.data,session:'stale'}},{...valid,data:{...valid.data,runId:'old'}},{...valid,data:{...valid.data,part:'approach'}},{...valid,data:{...valid.data,part:undefined}},{...valid,data:{...valid.data,result:{completed:true}}}])assert(!isEndingMessage(bad,active,frame,ENDING_COMPLETE));
 assert(!isEndingMessage(valid,null,frame,ENDING_COMPLETE));assert(!isEndingMessage(valid,active,frame,ENDING_READY));
});
test('네 가지 PC/신간 분기 모두 같은 접기 문제와 엔딩으로 연결된다',()=>{
 for(const showDeskInterlude of [false,true])for(const includeNewBooks of [false,true]){
  const r=new StoryRuntime(createChapters({showDeskInterlude,includeNewBooks}),puzzles),seen=[];r.jump('general-room-intro');
  while(r.scene.next){seen.push(r.currentId);r.advance({review:true});assert(seen.length<50);}
  assert.equal(r.currentId,'ending-complete');assert.equal(seen.filter(id=>id==='lobby-ending-entry').length,1);assert.equal(seen.filter(id=>id==='ending-fold-puzzle').length,1);
 }
});
test('자동 감독은 조작 없이 원본 엔진의 구출→접촉→복구를 한 번 완료한다',()=>{
 for(const dt of [1/120,1/60,.1]){
  let completed=0;const events=[];
  const engine=new RescueEngine({onComplete(){completed++;},onEvent(e){events.push(e.type);}});engine.start();
  for(let t=0;t<30&&!engine.snapshot().completed;t+=dt){directRescue(engine,dt);engine.advance(dt);}
  assert(engine.snapshot().completed);assert.equal(completed,1);assert.equal(events.filter(x=>x==='forehead-bump').length,1);
  engine.advance(10);assert.equal(completed,1);
 }
});
test('충돌 컷인 포함 자동 연출은 작은/큰 프레임 간격과 동작 줄이기에서 종료된다',()=>{
 const meta=JSON.parse(readFileSync(new URL('../ending/assets/forehead-bump-cutin.json',import.meta.url),'utf8'));
 for(const reducedMotion of [false,true])for(const dt of [1/60,.1]){
  let result=null;const impact=new ImpactCutin(meta,{reducedMotion}),engine=new RescueEngine({onComplete:r=>result=r,onEvent:e=>{if(e.type==='forehead-bump')impact.trigger({x:384,y:700});}});engine.start();
  let elapsed=0;for(;elapsed<30&&!result;elapsed+=dt){directRescue(engine,dt);advanceImpactTimeline(engine,impact,dt);}
  assert(result?.completed);assert(elapsed>15&&elapsed<23);assert(impact.played);
 }
});
test('일시정지는 영화 시간과 자동 이동을 함께 멈춘다',()=>{
 const e=new RescueEngine();e.start();e.advance(3);e.pause();const before=e.snapshot();directRescue(e,5);e.advance(5);assert.deepEqual(e.snapshot(),before);e.resume();directRescue(e,.1);e.advance(.1);assert(e.snapshot().totalTime>before.totalTime);
});
test('복구 후에는 말하는 고양이 사서 대신 사람 사서와 원래 고양이 그림을 쓴다',()=>{
 const ending=createEndingScenes(),idx=ending.findIndex(s=>s.id==='ending-returned');
 for(const s of ending.slice(idx)){assert(!s.cat);if(s.type==='dialogue')assert(s.actor?.startsWith('returned-'));}
});
test('앞부분은 접촉 순간에 멈추며 기다려도 복구/완료되지 않는다',()=>{
 for(const dt of [1/120,1/60,.1]){
  let completed=false;const d=new PhasedFinale({part:'approach',onComplete:()=>completed=true});d.start();
  for(let i=0;i<3600&&!d.awaitingAnswer;i++)d.advance(dt);
  assert(d.awaitingAnswer);const before=d.snapshot();assert.equal(before.phase,'contact');assert(before.paused);assert.equal(before.phaseTime,0);
  d.advance(60);assert.deepEqual(d.snapshot(),before);assert.equal(completed,false);
 }
});
test('정답 뒤 장면은 달리기를 반복하지 않고 접촉→꽝 구간→복구로 시작한다',()=>{
 let completed=0;const d=new PhasedFinale({part:'restore',onComplete:()=>completed++});d.start();
 assert.equal(d.snapshot().phase,'contact');assert.equal(d.snapshot().phaseTime,0);
 d.advance(.8);assert.equal(d.snapshot().phase,'contact');
 for(let i=0;i<400&&!d.snapshot().completed;i++)d.advance(1/60);
 assert(d.snapshot().completed);assert.equal(completed,1);
});
test('츄르를 향한 마지막 질주는 로비 바닥에 이르러 간식에 닿기 전에 넘어진다',()=>{
 const d=new PhasedFinale({part:'approach'});d.start();
 const floorRun=[];
 while(!d.awaitingAnswer){const s=d.advance(1/120);if(s.phase==='tracking'&&s.human.y>=870)floorRun.push(s.human);}
 assert(floorRun.length>50);
 const start=floorRun[0],end=floorRun.at(-1),distance=p=>Math.hypot(p.x-CHURU.x,p.y-CHURU.y);
 assert(distance(end)<distance(start));assert(end.x>CHURU.x+CHURU.width/2);
 assert(end.y>=1000);assert(d.snapshot().rescueStarted);
 assert(d.snapshot().landingX>CHURU.x+CHURU.width/2);
});
test('정답 뒤에는 츄르 질주에서 멈춘 실제 구출 자세와 같은 접촉에서 이어진다',()=>{
 const before=new PhasedFinale({part:'approach'});before.start();
 while(!before.awaitingAnswer)before.advance(1/120);
 const after=new PhasedFinale({part:'restore'});after.start();
 for(const key of ['human','cat','landingX','jumpStartX','rescueHumanStart','phaseTime'])assert.deepEqual(after.snapshot()[key],before.snapshot()[key]);
 assert.equal(after.snapshot().paused,false);
});
test('미답 상태에서는 복구 장면의 완료 결과도 다음 이야기로 넘기지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('ending-impact');
 assert.equal(r.completeCinematic({gameId:'library-ending-rescue',completed:true}).reason,'answer-required');assert.equal(r.advance().reason,'ending-required');
});
test('충돌 대기 사진은 허용한 그림 데이터만 보존하고 전체 시작에서 지운다',()=>{
 const still='data:image/webp;base64,UklGRg==',r=new StoryRuntime(chapters,puzzles);r.jump('ending-rescue');
 assert(isEndingPoster(still));assert(!isEndingPoster('https://another.invalid/private.png'));assert(!isEndingPoster('data:image/svg+xml,<svg/>'));
 assert(isEndingPoster('data:image/jpeg;base64,/9j/'));
 r.completeEndingApproach({gameId:'library-ending-rescue',contactReached:true,completed:false,still});r.advance();
 const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.endingContactPoster,still);assert(restored.flags.endingContactReached);restored.reset();assert.equal(restored.endingContactPoster,null);
});
test('정답 전 접촉과 정답 후 완료 메시지는 서로 다른 경계로 검증된다',()=>{
 const frame={},active={origin:'https://gamemakercho.github.io',session:'one',runId:'run-one',part:'approach'};
 const event={source:frame,origin:active.origin,data:{type:ENDING_CONTACT,part:'approach',session:active.session,runId:active.runId,gameId:'library-ending-rescue',result:{gameId:'library-ending-rescue',contactReached:true,completed:false}}};
 assert(isEndingMessage(event,active,frame,ENDING_CONTACT));assert(!isEndingMessage({...event,data:{...event.data,part:'restore'}},active,frame,ENDING_CONTACT));assert(!isEndingMessage({...event,data:{...event.data,result:{gameId:'library-ending-rescue',completed:true}}},active,frame,ENDING_CONTACT));
});
test('이전 버전의 정답 팝업과 이미 확인한 정답을 새 복구 장면으로 이어 준다',()=>{
 const previous={currentId:'ending-fold-puzzle',pendingSuccess:{fromSceneId:'ending-fold-puzzle',puzzleId:endingPuzzleId,nextSceneId:'ending-not-yet',popup:{title:'찾아냈다!'}}};
 const r=new StoryRuntime(chapters,puzzles,previous);assert.equal(r.confirmSuccess().scene.id,'ending-impact');
 const old=new StoryRuntime(chapters,puzzles,{currentId:'ending-rescue',solved:[endingPuzzleId]});assert.equal(old.currentId,'ending-impact');assert(old.flags.endingContactReached);
 const unanswered=new StoryRuntime(chapters,puzzles,{currentId:'ending-fold-puzzle',storyVersion:'opening-source-24-ending-v13-20261015'});assert.equal(unanswered.currentId,'ending-rescue');
});
test('실제 자산 로더는 정답 전에는 새 충돌 그림을 요청하지 않는다',async()=>{
 const {loadAssets}=await import('../ending/asset-loader.js');
 const oldImage=globalThis.Image,oldFetch=globalThis.fetch,requested=[];
 class FakeImage{set src(value){if(!value)return;const url=new URL(value);requested.push(url.pathname);const meta=new URL(value);meta.pathname=meta.pathname.replace(/\.webp$/u,'.json');let dims=[768,1152];try{dims=JSON.parse(readFileSync(meta,'utf8')).canvas_size;}catch{}[this.naturalWidth,this.naturalHeight]=dims;queueMicrotask(()=>this.onload?.());}}
 globalThis.Image=FakeImage;globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(readFileSync(url,'utf8'))});
 try{
  const approach=await loadAssets(new AbortController().signal,{part:'approach'});assert.equal(approach.impact,null);assert(!requested.some(x=>x.endsWith('postcard-impact.webp')));
  const restore=await loadAssets(new AbortController().signal,{part:'restore'});assert(restore.impact);assert(requested.some(x=>x.endsWith('postcard-impact.webp')));
 }finally{globalThis.Image=oldImage;globalThis.fetch=oldFetch;}
});
