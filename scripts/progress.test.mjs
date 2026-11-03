import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime} from '../engine.js';
import {chapters,puzzles} from '../story.js';
import {ACTIVITIES,progressSummary} from '../progress.js';
import {ORDER_IDS,restoreLetters,solveLetters} from '../games/book-order/letter-state.js';
import {CORRECT_IDS} from '../icon-puzzle.js';
const runtime=s=>new StoryRuntime(chapters,puzzles,s);
const sorted=letters=>({kind:'book-order',sortComplete:true,shelf:[...ORDER_IDS],cart:Array(10).fill(null),letters});
const cleaning={cleared:true,grade:'B',generated:100,cleaned:70,remaining:30,ratio:.7};
const catchResult={kind:'book-catch',cleared:true,score:20,elapsedMs:30000,totalBooks:30,missed:10};

test('11 equal activities: 0, first 9, full 100; gauge uses the unrounded ratio',()=>{
  assert.equal(ACTIVITIES.length,11);assert.equal(new Set(ACTIVITIES.map(a=>a.id)).size,11);
  assert.equal(runtime().progress.displayPercent,0);
  const r=runtime();r.jump('lobby-postcard');r.submit('고양이와 사서가 뒤바뀌었다');
  assert.equal(r.progress.completed,1);assert.equal(r.progress.displayPercent,9);
  assert.equal(r.progress.percent,1/11*100);assert.equal(r.currentId,'lobby-postcard');
  assert.equal(r.pendingSuccessId,'lobby-postcard');
  assert.equal(progressSummary(ACTIVITIES.map(a=>a.id)).percent,100);
  assert.equal(progressSummary([ACTIVITIES[0].id,ACTIVITIES[0].id,'invalid']).completed,1);
});
test('wrong answers, visits, arrival, bypass, and failed minigames do not count',()=>{
  const r=runtime();r.jump('lobby-postcard');r.submit('오답');r.advance({review:true});
  r.jump('general-shelf-arrival');r.advance({arrived:true});
  r.jump('infant-cleaning-bridge');assert(!r.completeMinigame({...cleaning,cleaned:69,remaining:31,ratio:.69}).ok);
  assert.equal(r.progress.completed,0);
  const atEnd=runtime({currentId:'ending-complete',history:['ending-rescue','lobby-postcard']});
  assert.equal(atEnd.progress.completed,0);
});
test('correct answer counts before popup Next; back, duplicate solve, and reload retain it',()=>{
  const r=runtime();r.jump('lobby-postcard');r.submit('고양이와 사서가 뒤바뀌었다');
  let restored=runtime(r.snapshot());assert.equal(restored.progress.completed,1);
  restored.confirmSuccess();restored.back();restored.submit('고양이와 사서가 뒤바뀌었다');
  assert.equal(restored.progress.completed,1);restored.back();
  restored=runtime(restored.snapshot());assert.equal(restored.progress.completed,1);
});
test('sort and letter answer count separately, validate arrays and answer, persist after retry',()=>{
  const r=runtime();r.jump('newbooks-order-game');
  assert(!r.recordMinigameProgress({...sorted(restoreLetters(null)),shelf:[...ORDER_IDS].reverse()}));
  assert.equal(r.progress.completed,0);
  assert(r.recordMinigameProgress(sorted(restoreLetters(null))));assert.equal(r.progress.completed,1);
  r.recordMinigameProgress(sorted(solveLetters(restoreLetters(null),'오답')));assert.equal(r.progress.completed,1);
  const correct=solveLetters({...restoreLetters(null),revision:3},'도서 정리!');
  r.recordMinigameProgress(sorted(correct));assert.equal(r.progress.completed,2);
  assert.equal(runtime(r.snapshot()).progress.completed,2);
  assert(!r.recordMinigameProgress(sorted({...restoreLetters(null),revision:1})));
  const result={...sorted(correct),cleared:true,complete:true,letterPuzzle:{id:'book-order-paws-v1',completed:true,stage:'complete'}};
  assert(r.completeMinigame(result,{recordOnly:true}).ok);assert.equal(r.currentId,'newbooks-order-game');
  assert.equal(r.progress.completed,2);r.completeMinigame(result);r.advance();r.back();
  assert.equal(r.progress.completed,2);
});
test('real clear records count before result return, failures/retry/duplicates never subtract or add',()=>{
  const r=runtime();r.jump('infant-cleaning-bridge');r.completeMinigame(cleaning,{recordOnly:true});
  assert.equal(r.progress.completed,1);assert(!r.solved.has('cleaning-keyword'));
  r.completeMinigame({...cleaning,cleared:false});r.completeMinigame(cleaning);assert.equal(r.progress.completed,1);
  r.jump('general-book-catch');r.completeMinigame(catchResult,{recordOnly:true});assert.equal(r.progress.completed,2);
  assert.equal(runtime(r.snapshot()).progress.completed,2);
});
test('legacy completion evidence migrates without inferring from scene position',()=>{
  const s={currentId:'general-shelf-arrival',courseRevision:18,runId:'legacy-progress-123',
    solved:['postcard-heading','learning-room-art','sterilizer-color-command-v1'],
    minigameResults:{'cleaning-keyword':cleaning,'book-catch-keyword':catchResult},
    minigameProgress:{'book-order-keyword':sorted(solveLetters(restoreLetters(null),'도서정리'))},
    flags:{endingContactReached:true}};
  const r=runtime(s);assert.equal(r.currentId,s.currentId);assert.equal(r.runId,s.runId);
  assert.equal(r.progress.completed,8);assert.equal(runtime(r.snapshot()).progress.completed,8);
  const invalid=runtime({currentId:'ending-fold-puzzle',minigameResults:{'cleaning-keyword':{cleared:true},'book-catch-keyword':{...catchResult,score:19}}});
  assert.equal(invalid.progress.completed,0);
  const wrongState=runtime({puzzleStates:{'postcard-heading':{completed:true}},completedActivityIds:['unknown','unknown']});
  assert.equal(wrongState.progress.completed,0);
});
test('valid pending icon answer counts before confirmation but arbitrary selected icons do not',()=>{
  const r=runtime();r.jump('infant-icon-puzzle');
  const state=r.getIconState();
  for(const id of state.boardIds.filter(id=>!CORRECT_IDS.includes(id)).slice(0,4))r.toggleIcon(id);
  assert(!r.submit().ok);
  assert.equal(r.progress.completed,0);
  for(const id of [...r.getIconState().selectedIds])r.toggleIcon(id);
  for(const id of CORRECT_IDS)r.toggleIcon(id);
  assert(r.submit().ok);assert.equal(r.progress.completed,1);
  const restored=runtime(r.snapshot());assert.equal(restored.progress.completed,1);
  restored.confirmSuccess();assert.equal(restored.progress.completed,1);
});
test('all registered activity IDs restore once; final correct is immediate and reset clears only runtime',()=>{
  const all=ACTIVITIES.map(a=>a.id),r=runtime({currentId:'ending-fold-puzzle',completedActivityIds:all.slice(0,-1),flags:{endingContactReached:true}});
  assert.equal(r.progress.completed,10);
  const result=r.submit('고양이와 사서가 돌아왔다!');assert(result.immediate);
  assert.equal(r.progress.percent,100);assert.equal(r.currentId,'ending-impact');
  assert(!r.flags.endingCompleted);const runId=r.runId;r.reset();
  assert.equal(r.progress.percent,0);assert.equal(r.currentId,'opening-title');assert.notEqual(r.runId,runId);
  assert.deepEqual(r.snapshot().completedActivityIds,[]);
});
test('new 05 notice question follows return dialogue, accepts 책소동 and waits for Next',()=>{
  const blocked=runtime();blocked.jump('general-return-puzzle');assert.equal(blocked.submit('책소동').reason,'game-clear-required');
  const r=runtime({minigameResults:{'book-catch-keyword':catchResult}});r.jump('general-expression-help');r.advance();assert.equal(r.currentId,'general-return-puzzle');
  for(const wrong of ['2','반납','책소동.',''])assert(!r.submit(wrong).ok);
  assert.equal(r.progress.completed,1);assert.equal(r.advance().reason,'answer-required');
  assert(r.submit(' 책 소 동？！ ').ok);assert.equal(r.progress.completed,2);
  assert.equal(r.currentId,'general-return-puzzle');assert.equal(r.advance().reason,'success-confirmation-required');
  const restored=runtime(r.snapshot());assert.equal(restored.progress.completed,2);
  assert.equal(restored.confirmSuccess().scene.id,'general-notice-solved');assert.equal(restored.progress.completed,2);
  const oldLate=runtime({currentId:'general-come-down',history:['general-return-joke']});
  assert.equal(oldLate.currentId,'general-lobby-direction');assert.equal(oldLate.progress.completed,0);
});
