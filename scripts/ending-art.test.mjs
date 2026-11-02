import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime} from '../engine.js';
import {chapters,puzzles} from '../story.js';
import {impactProgress,IMPACT_DURATION_MS,canReuseEndingIllustration} from '../ending-art-state.js';
const scenes=chapters.flatMap(c=>c.scenes),byId=new Map(scenes.map(s=>[s.id,s]));

test('legacy after-catch checkpoints retain return dialogue and the updated postcard introduction',()=>{
 const expected=['휴… 겨우 다 받았다.','다 읽은 책은 북카트에 놓아줘. 제자리 정리는 사서에게 맡겨 주면 돼.','책이 엉뚱한 곳에 꽂히면 다음 사람이 찾기 어렵거든. 서가 위에서 던지는 건 더 곤란하고.','그런데 안내문 속 고양이들 표정 좀 봐. 화내고, 웃고, 울고… 오늘 내 표정이 다 있네.','이 안내문과 네가 가진 고양이 엽서를 함께 써 보자! 실제 안내문의 고양이에 엽서를 겹쳐 대고, 다음 화면의 지시대로 표정을 바꿔 줘.'];
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
 for(const [a,b]of [['ending-returned','ending-cat'],['ending-cat','ending-returned-joke'],['ending-returned-joke','ending-returned-relief'],['ending-returned-relief','ending-meow-question'],['ending-meow-question','ending-meow-embarrassed'],['ending-thanks','ending-promise'],['ending-promise','ending-complete'],['ending-complete','ending-promise']])assert(canReuseEndingIllustration(byId.get(a),byId.get(b)));
 assert(!canReuseEndingIllustration(byId.get('ending-impact'),byId.get('ending-returned')));assert(!canReuseEndingIllustration(byId.get('ending-returned-relief'),byId.get('ending-thanks')));
});

test('three meow lines precede unchanged thanks; an old removed-joke save retains its completion evidence',()=>{
 const ids=['ending-returned-relief','ending-meow-question','ending-meow-embarrassed'],texts=['휴, 드디어 사람으로 돌아왔네. 야옹.','야옹?','…방금 건 못 들은 걸로 해줘.'];
 ids.forEach((id,i)=>{const s=byId.get(id);assert.equal(s.text,texts[i]);assert.equal(s.speaker,i===1?'고양이':'사서');assert.equal(s.next,ids[i+1]||'ending-thanks');assert.equal(s.type,'dialogue');});
 assert(!scenes.some(s=>/고양이가 그랬|오늘.*많이 뛰었다/.test(s.text)));assert.equal(byId.get('ending-thanks').text,'도와줘서 정말 고마워.\n네 덕분에 책도 정리하고, 내 몸도 찾았어.');assert.equal(byId.get('ending-promise').next,'ending-complete');
 const r=new StoryRuntime(chapters,puzzles,{currentId:'ending-loan-joke',history:['ending-thanks','ending-promise'],runId:'kept-ending-save',solved:['postcard-returned-v1'],flags:{endingRescueComplete:true,endingCompleted:true}});assert.equal(r.currentId,'ending-complete');assert.equal(r.runId,'kept-ending-save');assert(r.flags.endingCompleted);assert(r.solved.has('postcard-returned-v1'));assert(r.back());assert.equal(r.currentId,'ending-promise');
});
