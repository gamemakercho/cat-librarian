import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime} from '../engine.js';
import {chapters,puzzles} from '../story.js';
import {impactProgress,IMPACT_DURATION_MS,canReuseEndingIllustration} from '../ending-art-state.js';
const scenes=chapters.flatMap(c=>c.scenes),byId=new Map(scenes.map(s=>[s.id,s]));

test('book-catching leads through five natural lines to the unchanged expression puzzle',()=>{
 const expected=['휴… 겨우 다 받았다.','다 읽은 책은 북카트에 놓아줘. 제자리 정리는 사서에게 맡겨 주면 돼.','책이 엉뚱한 곳에 꽂히면 다음 사람이 찾기 어렵거든. 서가 위에서 던지는 건 더 곤란하고.','그런데 안내문 속 고양이들 표정 좀 봐. 화내고, 웃고, 울고… 오늘 내 표정이 다 있네.','엽서에도 고양이 얼굴이 있지? 안내문 위에 대서 표정을 바꿔 보자.'];
 let s=byId.get('general-after-catch');for(const text of expected){assert.equal(s.text,text);assert(!s.text.includes('책소동'));s=byId.get(s.next);}
 assert.equal(s.id,'general-return-puzzle');assert.deepEqual(puzzles[s.puzzleId].acceptedAnswers,['책소동']);
 for(const scene of scenes.filter(s=>s.type==='dialogue'))assert(!/(?:\d+|몇)\s*번(?:째)?\s*(?:문제|미니게임|안내문|고양이 마크)/u.test(scene.text),scene.id);
 assert.equal(byId.get('travel-to-general').markerNumber,4);assert.equal(byId.get('general-shelf-arrival').markerNumber,5);
 assert.match(byId.get('newbooks-order-game').text,/번호가 작은/);
 const r=new StoryRuntime(chapters,puzzles,{currentId:'general-return-joke',runId:'keep-this-run',solved:['postcard-heading']});assert.equal(r.currentId,'general-return-help');assert.equal(r.runId,'keep-this-run');assert(r.solved.has('postcard-heading'));
});

test('a partial two-second impact survives normalization/reload; legacy saves retain compatibility',()=>{
 assert.equal(IMPACT_DURATION_MS,2000);assert.equal(impactProgress({}),null);
 const save={currentId:'ending-impact',solved:['postcard-returned-v1'],flags:{endingIllustrationStarted:true},sceneStates:{'ending-impact':{impactVersion:1,impactElapsedMs:850}}};
 const r=new StoryRuntime(chapters,puzzles,save);assert.equal(r.currentId,'ending-impact');assert.equal(impactProgress(r.sceneState).elapsedMs,850);assert(!r.advance().ok);
 assert.equal(impactProgress(new StoryRuntime(chapters,puzzles,r.snapshot()).sceneState).elapsedMs,850);
 const done=new StoryRuntime(chapters,puzzles,{...save,sceneStates:{'ending-impact':{impactVersion:1,impactElapsedMs:2000}}});assert.equal(done.currentId,'ending-returned');
 assert.equal(new StoryRuntime(chapters,puzzles,{...save,sceneStates:{}}).currentId,'ending-returned');
 assert.equal(impactProgress(r.normalizeSceneState({impactVersion:1,impactElapsedMs:99999})).elapsedMs,2000);r.reset();assert.equal(impactProgress(r.sceneState),null);
});

test('art identity retains returned captions and thanks/end card, but not contact or another image',()=>{
 for(const [a,b]of [['ending-returned','ending-cat'],['ending-cat','ending-returned-joke'],['ending-returned-joke','ending-returned-relief'],['ending-thanks','ending-promise'],['ending-loan-joke','ending-complete'],['ending-complete','ending-loan-joke']])assert(canReuseEndingIllustration(byId.get(a),byId.get(b)));
 assert(!canReuseEndingIllustration(byId.get('ending-impact'),byId.get('ending-returned')));assert(!canReuseEndingIllustration(byId.get('ending-returned-relief'),byId.get('ending-thanks')));
});
