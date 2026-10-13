import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime,normalizeAnswer,validateStory} from '../engine.js';
import {chapters,puzzles} from '../story.js';

test('원본 01~24가 번호순으로 한 번씩 유지된다',()=>{
 const scenes=validateStory(chapters,puzzles);
 assert.deepEqual(scenes.filter(s=>s.sourceNumber).map(s=>s.sourceNumber),Array.from({length:24},(_,i)=>i+1));
});
test('21번의 확정 문장은 공백과 양쪽 물음표·느낌표를 무시한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('lobby-postcard');
 for(const answer of ['고양이와 사서가 뒤바뀌었다','고양이와사서가뒤바뀌었다?',' 고양이와\n사서가 뒤바뀌었다！ '])assert.equal(r.submit(answer).ok,true);
 assert.equal(normalizeAnswer('？ 고양이와 사서가 뒤바뀌었다！'),'고양이와사서가뒤바뀌었다');
 assert.equal(r.submit('사서와 고양이가 뒤바뀌었다').reason,'incorrect');
 assert.equal(r.submit('').reason,'empty');
 assert.equal(r.advance().scene.id,'lobby-escape');
});
test('23번은 답을 추측해 입력해도 통과되지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-marker');
 for(const answer of ['물감','평생학습실','고양이'])assert.equal(r.submit(answer).reason,'not-configured');
 assert.equal(r.advance().reason,'answer-required');
 assert.equal(r.solved.size,0);
});
test('미리보기 우회는 정답 기록을 만들지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-marker');
 assert.equal(r.advance({review:true}).scene.id,'learning-paint');
 assert.equal(r.solved.has('learning-marker'),false);
});
test('검토 경로는 24장 뒤의 정지 화면에서 끝난다',()=>{
 const r=new StoryRuntime(chapters,puzzles);let n=0;
 while(r.scene.next){assert.equal(r.advance({review:true}).ok,true);if(++n>30)throw Error('진행 루프');}
 assert.equal(r.currentId,'opening-continuation');
 assert.equal(r.advance().reason,'end-of-preview');
});
test('새 장면을 추가해도 ID로 진행 위치와 이전 화면을 복구한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('opening-help');r.advance();
 const expanded=structuredClone(chapters);expanded[0].scenes.unshift({id:'extra',type:'dialogue',next:'opening-title'});
 const restored=new StoryRuntime(expanded,puzzles,r.snapshot());
 assert.equal(restored.currentId,'opening-first-time');assert.equal(restored.back(),true);assert.equal(restored.currentId,'opening-help');
});

test('NFD 한글은 NFC로 정규화하며 다른 표현은 인정하지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('lobby-postcard');
 assert.equal(r.submit('고양이와 사서가 뒤바뀌었다'.normalize('NFD')).ok,true);
 assert.equal(r.submit('고양이와 사서가 뒤바꼈다').reason,'incorrect');
 assert.equal(r.submit(' ？ !\n').reason,'empty');
});
test('미정 문제의 오래된 정답 기록을 복원하지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'learning-marker',solved:['learning-marker']});
 assert.equal(r.solved.size,0);assert.equal(r.advance().reason,'answer-required');
});
test('되돌아가기와 초기화는 ID 및 정답 상태를 복원·제거한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.advance();assert.equal(r.back(),true);
 assert.equal(r.currentId,'opening-title');r.jump('lobby-postcard');
 r.submit('고양이와 사서가 뒤바뀌었다');r.advance();r.reset();
 assert.equal(r.currentId,'opening-title');assert.equal(r.solved.size,0);assert.equal(r.history.length,0);
});

test('회상 대사는 고정되고 다음 클릭 한 번에 만화 한 컷씩 진행한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('opening-memory');
 const text=r.scene.text;const group=r.scene.textGroup;
 for(let comic=1;comic<=4;comic++){
  r.advance();assert.equal(r.scene.comic,comic);assert.equal(r.scene.text,text);
  assert.equal(r.scene.textGroup,group);assert.equal(r.scene.textMode,'static');
 }
 r.advance();assert.equal(r.currentId,'opening-swapped');
});
test('사서가 잠든 로비는 배경에 포함하고 깨어난 뒤에는 빈 로비다',()=>{
 const scenes=chapters.flatMap(c=>c.scenes);
 for(const s of scenes.filter(s=>s.sourceNumber>=17&&s.sourceNumber<=21)){
  assert.equal(s.background,'lobby-sleeping');assert(!s.sleeping);
 }
 for(const s of scenes.filter(s=>s.sourceNumber===22||s.sourceNumber===23))assert.equal(s.background,'lobby');
});
