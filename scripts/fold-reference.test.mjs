import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFoldReference,FOLD_REFERENCE} from '../fold-reference.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {StoryRuntime} from '../engine.js';
import {chapters,puzzles} from '../story.js';
test('reference requests only WebP on success, falls back to PNG after failure, and reports both failures without a false success',async()=>{
 let calls=[];assert.equal(await loadFoldReference(async src=>{calls.push(src);return 'decoded'}),'decoded');assert.deepEqual(calls,[FOLD_REFERENCE.src]);
 calls=[];assert.equal(await loadFoldReference(async src=>{calls.push(src);if(src.endsWith('.webp'))throw Error('webp');return 'png';}),'png');assert.deepEqual(calls,[FOLD_REFERENCE.src,FOLD_REFERENCE.fallback]);
 await assert.rejects(loadFoldReference(async()=>{throw Error('offline')}),/offline/);
});
test('packaged reference images retain the provided bytes and dimensions metadata',()=>{
 const m=JSON.parse(readFileSync(new URL('../assets/ending/postcard-fold-complete.json',import.meta.url),'utf8'));for(const f of m.files.filter(f=>f.runtime)){const name=f.path.split('/').at(-1),bytes=readFileSync(new URL('../assets/ending/'+name,import.meta.url));assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(f.width,587);assert.equal(f.height,312);}
});
test('deleted transition saves keep run, solved, mini-game proof and history while resuming at the new boundary',()=>{
 for(const id of ['travel-to-ending-lobby','lobby-ending-entry','ending-one-left','ending-found','ending-postcard-clue']){const r=new StoryRuntime(chapters,puzzles,{currentId:id,runId:'saved-current-game',solved:['postcard-heading','learning-room-art'],history:['general-after-catch','travel-to-ending-lobby',id],sceneStates:{'ending-fold-puzzle':{answer:'고양이와'}}});assert.equal(r.currentId,'ending-rescue');assert.equal(r.runId,'saved-current-game');assert(r.solved.has('learning-room-art'));assert(!r.history.includes('travel-to-ending-lobby'));assert(!r.flags.endingCompleted);const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.currentId,'ending-rescue');assert(restored.back());assert.equal(restored.currentId,'general-after-catch');}
 const done=new StoryRuntime(chapters,puzzles,{currentId:'ending-thanks',flags:{endingContactReached:true},runId:'saved-done-game'});assert.equal(done.currentId,'ending-thanks');
});

test('active route still contains six puzzles including the internal letter puzzle and four minigames',()=>{const scenes=chapters.flatMap(c=>c.scenes);assert.equal(scenes.filter(s=>s.type==='puzzle').length+1,6);assert.equal(scenes.filter(s=>s.type==='minigame'||s.cinematicPart==='approach').length,4);});
