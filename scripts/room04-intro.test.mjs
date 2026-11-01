import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {StoryRuntime} from '../engine.js';import {chapters,puzzles} from '../story.js';import {ROOM04_INTRO,ROOM04_INTRO_IDS} from '../mark04-05-config.js';import {ACTIVITIES} from '../progress.js';
const scenes=chapters.flatMap(c=>c.scenes),byId=new Map(scenes.map(s=>[s.id,s]));
test('04 four exact dialogues are unique and retain one background, speaker and explicit game button',()=>{
 assert.equal(ROOM04_INTRO.dialogues.length,4);
 ROOM04_INTRO_IDS.forEach((id,i)=>{
  const s=byId.get(id),d=ROOM04_INTRO.dialogues[i];assert.equal(s.text,d.text);assert.equal(scenes.filter(x=>x.text===d.text).length,1);assert.equal(s.background,'room04');assert.equal(s.cat,'neutral');assert.equal(s.layout,'room04-intro');assert(!s.guideOverlay);
  if(i<3){assert.equal(s.type,'dialogue');assert.equal(s.next,ROOM04_INTRO_IDS[i+1]);assert.equal(s.nextLabel,'다음으로');}
  else{assert.equal(s.type,'minigame');assert.equal(s.gameStartLabel,'책 정리하기');assert(s.waitForTextBeforeGame);assert.equal(s.gameUrl,'./games/book-order/');assert.equal(s.puzzleId,'book-order-keyword');assert.equal(s.next,'newbooks-after-order');}
 });
 assert(!scenes.some(s=>/네 손 좀 빌릴게|내 손은 지금 다른 분/.test(s.text||'')));
 assert.match(byId.get('room04-kdc-explanation').text,/약속을 ‘한국십진분류법’/);
 assert(!byId.get('general-order-bridge').text.includes('이 분류표는 책을 주제별로'));
});
test('04 dialogue/arrival do not add activities; each saved step/history and existing run survive reload',()=>{
 const old={runId:'room04-existing-run',currentId:'general-order-plan',solved:['postcard-heading','learning-room-art'],history:['general-room-intro','general-order-bridge'],sceneStates:{'general-order-plan':{hintLevel:1}}};
 let r=new StoryRuntime(chapters,puzzles,old);assert.equal(r.currentId,old.currentId);assert.equal(r.progress.completed,2);
 for(const id of ROOM04_INTRO_IDS){assert.equal(r.currentId,id);const restored=new StoryRuntime(chapters,puzzles,r.snapshot());assert.equal(restored.currentId,id);assert.equal(restored.runId,old.runId);assert.equal(restored.progress.completed,2);if(id!==ROOM04_INTRO_IDS.at(-1)){assert(r.advance().ok);}else assert.equal(r.advance().reason,'game-clear-required');}
 assert.equal(ACTIVITIES.length,11);assert.equal(r.back(),true);assert.equal(r.currentId,'room04-kdc-explanation');assert.equal(r.progress.completed,2);
});
test('04 neutral image and its PNG fallback preserve exact manifest hashes and native dimensions',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets.json',import.meta.url),'utf8')),a=manifest['bg:room04'];
 assert.match(a.src,/room04-kdc-neutral.webp$/);assert.match(a.fallback,/room04-kdc-neutral.png$/);assert(a.arrowBakedIntoImage);
 for(const [src,hash]of [[a.src,a.sha256],[a.fallback,a.fallbackSha256]])assert.equal(createHash('sha256').update(readFileSync(new URL('../'+src,import.meta.url))).digest('hex'),hash);
 const png=readFileSync(new URL('../'+a.fallback,import.meta.url));assert.equal(png.readUInt32BE(16),941);assert.equal(png.readUInt32BE(20),1672);
 for(const s of scenes.filter(s=>s.background==='room04'))assert.equal(s.guideOverlay,undefined);
});
