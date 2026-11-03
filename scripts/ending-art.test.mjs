import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime} from '../engine.js';
import {chapters,puzzles} from '../story.js';
import {impactProgress,IMPACT_DURATION_MS,canReuseEndingIllustration} from '../ending-art-state.js';
const scenes=chapters.flatMap(c=>c.scenes),byId=new Map(scenes.map(s=>[s.id,s]));

test('post-catch copy leads through the real location and two image captions to the unchanged answer',()=>{
 const expected=[['general-after-catch','휴, 책은 다 받았어! 북카트보다 내 심장이 더 덜컹거린다.'],['general-return-notice','이제 긴 테이블 끝의 나무 칸막이 뒤쪽으로 가 보자. 고양이 마크 05가 붙은 안내문을 찾아줘.'],['general-expression-intro','찾았다! 이번엔 이 안내문과 네 고양이 엽서 차례야.'],['general-expression-help','현장의 안내문에 엽서를 대서 고양이 표정을 바꿔 줘. 엽서의 화살표가 가리키는 글자를 순서대로 읽어 보는 거야!']];
 for(const[id,text]of expected){assert.equal(byId.get(id).text,text);assert(!text.includes('책소동'));}assert.equal(byId.get('general-return-notice').next,'general-shelf-arrival');assert.equal(byId.get('general-shelf-arrival').next,'general-expression-intro');assert.equal(byId.get('general-expression-help').next,'general-return-puzzle');assert.deepEqual(puzzles['return-notice-booksodong'].acceptedAnswers,['책소동']);
 const r=new StoryRuntime(chapters,puzzles,{currentId:'general-return-joke',runId:'keep-this-run',solved:['postcard-heading']});assert.equal(r.currentId,'general-expression-intro');assert.equal(r.runId,'keep-this-run');assert(r.solved.has('postcard-heading'));
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
