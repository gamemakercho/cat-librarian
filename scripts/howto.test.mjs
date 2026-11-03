import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {HOWTO,howtoFor} from '../howto-config.js';import {StoryRuntime} from '../engine.js';import {chapters,puzzles} from '../story.js';import {ACTIVITIES} from '../progress.js';
test('four exact provided WebPs belong to existing activities without new activities or PNG fallbacks',()=>{
 const a=JSON.parse(readFileSync(new URL('../assets.json',import.meta.url)));assert.equal(Object.keys(HOWTO).length,4);assert.equal(ACTIVITIES.length,11);let total=0;
 for(const item of Object.values(HOWTO)){const m=a[item.key],b=readFileSync(new URL('../'+m.src,import.meta.url));assert.deepEqual([m.width,m.height],[1080,1920]);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);assert.equal(b.length,m.bytes);assert(!m.fallback);total+=b.length;}assert.equal(total,598402);
 for(const id of ['infant-cleaning-bridge','newbooks-order-game','general-book-catch','ending-rescue'])assert(howtoFor(chapters.flatMap(c=>c.scenes).find(s=>s.id===id)));
});
test('howto restore/cancel and story lobby migration retain existing run, drafts and completion evidence',()=>{
 const old={currentId:'general-book-catch',runId:'keep-howto-run',solved:['postcard-heading'],sceneStates:{'general-book-catch':{howtoOpen:true,answer:'입력 중'}}};const r=new StoryRuntime(chapters,puzzles,old);
 assert.equal(r.sceneState.howtoOpen,true);assert.equal(r.progress.completed,1);r.updateSceneState({howtoOpen:false});assert(!r.sceneState.howtoOpen);assert.equal(r.sceneState.answer,'입력 중');assert.equal(new StoryRuntime(chapters,puzzles,r.snapshot()).runId,old.runId);
 r.jump('ending-rescue');r.updateSceneState({howtoOpen:true});assert.equal(r.progress.completed,1);const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert(restored.sceneState.howtoOpen);restored.reset();assert.equal(restored.progress.completed,0);assert(!restored.sceneState.howtoOpen);
 for(const id of ['travel-to-ending-lobby','general-come-down','general-body-missed','general-return-joke']){const migrated=new StoryRuntime(chapters,puzzles,{...old,currentId:id});assert.equal(migrated.runId,old.runId);assert.equal(migrated.progress.completed,1);assert.notEqual(migrated.currentId,'title');assert.notEqual(migrated.scene.type,'move');}
});
