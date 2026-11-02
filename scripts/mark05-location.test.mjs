import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {StoryRuntime} from '../engine.js';import {chapters,puzzles} from '../story.js';import {ACTIVITIES} from '../progress.js';
const clear={kind:'book-catch',cleared:true,score:20,totalBooks:30,missed:10,elapsedMs:30000};
test('catch result leads to one two-view guide; viewing and arrival never award activities',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('general-book-catch');assert(!r.advance().ok);r.completeMinigame(clear);assert(r.advance().ok);assert.equal(r.currentId,'general-shelf-arrival');const count=r.progress.completed;assert.equal(count,1);assert.equal(ACTIVITIES.length,11);
 assert.equal(r.scene.locationGuide.length,2);assert.deepEqual(r.scene.locationGuide.map(s=>s.button),['뒤쪽 모습 보기','도착했지!']);assert.equal(r.scene.marker,undefined);assert.equal(r.scene.background,null);
 assert.equal(r.advance({arrived:true}).reason,'guide-step-required');for(const step of [1,0,1]){r.updateSceneState({locationGuideStep:step,locationHintLevel:1});assert.equal(r.progress.completed,count);}
 const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.sceneState.locationGuideStep,1);assert.equal(restored.sceneState.locationHintLevel,1);assert.equal(restored.progress.completed,count);assert(restored.advance({arrived:true}).ok);assert.equal(restored.currentId,'general-return-notice');assert(restored.flags.mark05Arrived);assert.equal(restored.progress.completed,count);
 while(restored.currentId!=='general-return-puzzle')assert(restored.advance().ok);assert(!restored.submit('오답').ok);assert.equal(restored.progress.completed,count);assert(restored.submit('책소동').ok);assert.equal(restored.progress.completed,count+1);restored.confirmSuccess();assert.equal(restored.currentId,'general-notice-solved');
});
test('old pre-catch guide resumes at the shelf story; passed or new checkpoints are never rewound',()=>{
 const old=new StoryRuntime(chapters,puzzles,{currentId:'general-shelf-arrival',runId:'old-location-save',flags:{mark05Arrived:true},history:['general-shelf-direction']});assert.equal(old.currentId,'general-book-drop');assert.equal(old.runId,'old-location-save');assert(old.flags.mark05Arrived);
 for(const id of ['general-after-catch','general-return-puzzle','general-notice-solved','ending-complete']){const r=new StoryRuntime(chapters,puzzles,{currentId:id,runId:'passed-location-save',minigameResults:{'book-catch-keyword':clear},history:['general-shelf-arrival'],solved:['return-notice-booksodong']});assert.equal(r.currentId,id);assert(!r.history.includes('general-shelf-arrival'));}
 const live=new StoryRuntime(chapters,puzzles,{currentId:'general-shelf-arrival',sceneStates:{'general-shelf-arrival':{locationGuideStep:1}},minigameResults:{'book-catch-keyword':clear}});assert.equal(live.currentId,'general-shelf-arrival');assert.equal(live.sceneState.locationGuideStep,1);
});
test('two runtime WebPs retain provided dimensions, bytes and hashes without PNG fallback',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets.json',import.meta.url),'utf8')),expected=[['mark05-approach',214276,'0f9d47f3c7207ba19a7af5370c6821b21872221692c48eba9dc6e96911c5d9b1'],['mark05-notice',261034,'0223c629ddc6d62cf9049fd42ce9b07ef2119e0d4d4671543cd5903ede97ce37']];
 for(const [id,size,hash]of expected){const a=manifest['hint:'+id],bytes=readFileSync(new URL('../'+a.src,import.meta.url));assert.equal(bytes.length,size);assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);assert.deepEqual([a.width,a.height],[1086,1448]);assert.equal(a.fallback,undefined);}
 assert.equal(expected.reduce((n,x)=>n+x[1],0),475310);
});

test('existing final introduction checkpoint reuses the notice image and adds no activity before the unchanged answer',()=>{
 const old={currentId:'general-expression-help',runId:'existing-intro',solved:['book-catch-keyword'],minigameResults:{'book-catch-keyword':clear}};
 const r=new StoryRuntime(chapters,puzzles,old),count=r.progress.completed;
 assert.equal(r.currentId,old.currentId);assert.equal(r.runId,old.runId);assert.equal(r.scene.locationGuideMode,'puzzle-intro');assert.equal(r.scene.locationGuide.length,1);assert.equal(r.scene.locationGuide[0].image,'hint:mark05-notice');assert.equal(r.scene.locationGuide[0].button,'문제 풀기');assert.equal(r.scene.location,null);assert.equal(r.scene.noticeText,null);
 assert(r.advance().ok);assert.equal(r.currentId,'general-return-puzzle');assert.equal(r.progress.completed,count);r.updateSceneState({answer:'책소'});const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.sceneState.answer,'책소');assert(!restored.submit('책소').ok);assert.equal(restored.progress.completed,count);assert(restored.submit('책소동').ok);assert.equal(restored.progress.completed,count+1);assert.equal(ACTIVITIES.length,11);
});
