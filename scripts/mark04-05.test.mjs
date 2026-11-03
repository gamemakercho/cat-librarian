import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {StoryRuntime} from '../engine.js';import {chapters,puzzles} from '../story.js';
import {MARK_FLOW,MARK_SCENE_GROUPS,MARK_STORY,NOTICE05,markLocation,locationHints} from '../mark04-05-config.js';
import {ACTIVITIES} from '../progress.js';import {LETTER_PUZZLE} from '../games/book-order/letter-puzzle-config.js';
const scenes=chapters.flatMap(c=>c.scenes),byId=new Map(scenes.map(s=>[s.id,s]));
const clear={kind:'book-catch',cleared:true,score:20,totalBooks:30,missed:10,elapsedMs:30000};
test('all logical flow nodes map to live durable scenes, with one 04/05 and one expression puzzle',()=>{
 for(const node of MARK_FLOW.nodes){assert(MARK_SCENE_GROUPS[node.id],node.id);for(const id of MARK_SCENE_GROUPS[node.id])assert(byId.has(id),id);}
 const path=[],r=new StoryRuntime(chapters,puzzles);while(r.scene.next){path.push(r.currentId);assert(r.advance({review:true}).ok);assert(path.length<r.scenes.length);}
 const ordered=['sterilizer-repaired','after-repair-general','after-repair-classification','travel-to-general','general-room-intro','newbooks-order-game','newbooks-after-order','general-crash','general-book-drop','general-book-catch','general-after-catch','general-return-notice','general-shelf-arrival','general-return-puzzle','general-notice-solved','general-lobby-direction','lobby-ending-entry','ending-rescue','ending-fold-puzzle','ending-impact','ending-thanks'];
 for(let i=1;i<ordered.length;i++)assert(path.indexOf(ordered[i-1])<path.indexOf(ordered[i]),ordered[i]);
 assert.equal(scenes.filter(s=>s.puzzleId==='return-notice-booksodong').length,1);assert.equal(ACTIVITIES.length,11);assert.equal(ACTIVITIES.filter(a=>a.puzzleId==='return-notice-booksodong').length,1);
 assert(!scenes.some(s=>s.markerNumber===6));
});
test('latest script lines appear once in their proper groups and human cat only meows',()=>{
 for(const key of ['after_catch05','intro04'])for(const text of MARK_STORY.scenes.find(s=>s.id===key).lines)assert.equal(scenes.filter(s=>s.text===text).length,1,text);
 assert.equal(byId.get('general-cat-meow').speaker,'사서 몸의 고양이');assert.equal(byId.get('general-cat-meow').text,'냐아!');
 for(const s of scenes.filter(s=>s.speaker==='사서 몸의 고양이'))assert.equal(s.text,'냐아!');
});
test('04 uses the new baked-arrow background without an overlay; 05 has the provided concrete hint',()=>{
 assert.equal(byId.get('travel-to-general').background,'room04');assert.equal(byId.get('travel-to-general').guideOverlay,undefined);
 assert(!byId.get('newbooks-order-game').guideOverlay);assert.match(markLocation(5).detailedHint,/긴 테이블 끝.*노란 벤치/);
 assert.deepEqual(locationHints(5),[markLocation(5).detailedHint]);assert.equal(byId.get('general-shelf-arrival').destination,'노란 벤치 옆 안내문');
 const r=new StoryRuntime(chapters,puzzles);r.jump('travel-to-general');assert.equal(r.advance().reason,'arrival-required');r.advance({arrived:true});assert(r.flags.mark04Arrived);assert.equal(r.progress.completed,0);
 r.jump('general-shelf-arrival');assert.equal(r.advance().reason,'arrival-required');assert.equal(r.advance({arrived:true}).reason,'guide-step-required');r.updateSceneState({locationGuideStep:1});r.advance({arrived:true});assert(r.flags.mark05Arrived);assert.equal(r.progress.completed,0);
 assert(r.sceneStates['travel-to-general'].arrived);assert(r.sceneStates['general-shelf-arrival'].arrived);
});
test('all expressions and physical instructions are fixed; no answer fragments in the view config',()=>{
 assert.deepEqual(NOTICE05.steps.map(s=>[s.from,s.to]),[['angry','cry'],['smile','cry'],['cry','smile']]);
 assert(!JSON.stringify(NOTICE05).includes('책소동'));assert(!JSON.stringify(NOTICE05).includes('operatorOnlyLetter'));
 assert.equal(LETTER_PUZZLE.readingBookIds.map(id=>LETTER_PUZZLE.letters[id]).join(''),'정리완료');assert.equal(Object.keys(LETTER_PUZZLE.letters).length,10);
 assert.match(LETTER_PUZZLE.instruction,/현장의 십진분류표/);
});
test('catch success is required; exact normalized expression answers wait for common popup Next',()=>{
 const blocked=new StoryRuntime(chapters,puzzles);blocked.jump('general-return-puzzle');assert.equal(blocked.submit('책소동').reason,'game-clear-required');assert.equal(blocked.progress.completed,0);
 for(const answer of ['책소동','책 소동','책소동!',' 책 소 동？！ ','책소동'.normalize('NFD')]){
  const r=new StoryRuntime(chapters,puzzles,{currentId:'general-return-puzzle',minigameResults:{'book-catch-keyword':clear}});
  r.updateSceneState({answer,hintLevel:2});assert(r.submit(answer).ok);assert.equal(r.currentId,'general-return-puzzle');assert.equal(r.progress.completed,2);assert.equal(r.advance().reason,'success-confirmation-required');
  const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.sceneState.answer,answer);assert.equal(restored.sceneState.hintLevel,2);assert.equal(restored.pendingSuccessId,'general-return-puzzle');assert.equal(restored.confirmSuccess().scene.id,'general-notice-solved');assert.equal(restored.confirmSuccess().ok,false);
 }
 for(const answer of ['2','책동소','책소동.','책소동추가','']){const r=new StoryRuntime(chapters,puzzles,{currentId:'general-return-puzzle',minigameResults:{'book-catch-keyword':clear}});assert(!r.submit(answer).ok);assert.equal(r.progress.completed,1);}
});
test('removed physical lobby arrival resumes in the story lobby without adding activity or clearing saves',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'travel-to-ending-lobby',runId:'kept-lobby-run',solved:['postcard-heading'],history:['general-lobby-direction']});assert.equal(r.currentId,'lobby-ending-entry');assert.equal(r.scene.type,'dialogue');assert.equal(r.scene.location,'1층 로비');assert.match(r.scene.realLocationNote,/실제로는 2층/);assert.equal(r.scene.markerNumber,undefined);assert.equal(r.progress.completed,1);assert(r.advance().ok);assert.equal(r.currentId,'general-no-chance');assert.equal(r.flags.lobbyArrived,undefined);assert.equal(new StoryRuntime(chapters,puzzles,r.snapshot()).runId,'kept-lobby-run');
});test('old pending notice popup continues into new script; completed ending saves are not rewound',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'general-return-puzzle',pendingSuccess:{fromSceneId:'general-return-puzzle',puzzleId:'return-notice-booksodong',nextSceneId:'general-come-down',popup:{title:'정답이야!'}},minigameResults:{'book-catch-keyword':clear}});
 assert.equal(r.pendingSuccess.nextSceneId,'general-notice-solved');assert.equal(r.confirmSuccess().scene.id,'general-notice-solved');
 const done=new StoryRuntime(chapters,puzzles,{currentId:'ending-complete',solved:['postcard-returned-v1'],flags:{endingCompleted:true,endingContactReached:true}});
 assert.equal(done.currentId,'ending-complete');assert(done.flags.endingCompleted);
});
test('optimized background and original cats match recorded hashes; fallback remains separate',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets.json',import.meta.url),'utf8'));
 for(const key of ['bg:room04','prop:marker04','prop:marker05','prop:room04-arrow','prop:postcard-pink-arrow','expression:angry','expression:smile','expression:cry']){
  const a=manifest[key],data=readFileSync(new URL('../'+a.src,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256);assert.equal(data.length,a.bytes);
 }
 const svg=readFileSync(new URL('../'+manifest['prop:room04-arrow'].src,import.meta.url),'utf8');assert.match(svg,/viewBox="0 0 941 1672"/);assert.match(svg,/367 246/);
 const bg=readFileSync(new URL('../'+manifest['bg:room04'].fallback,import.meta.url));assert.equal(bg.readUInt32BE(16),941);assert.equal(bg.readUInt32BE(20),1672);
});
