import test from 'node:test';
import assert from 'node:assert/strict';
import {StoryRuntime,normalizeAnswer,normalizeArtAnswer,normalizeNumericAnswer,validateStory,formatMarkerNumber} from '../engine.js';
import {chapters,puzzles,createChapters} from '../story.js';
import {normalizeCourseOptions} from '../course-config.js';
import {isMinigameReturn,MINIGAME_RETURN} from '../minigame-bridge.js';
import {readFileSync} from 'node:fs';

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
 assert.equal(r.advance().reason,'success-confirmation-required');
 assert.equal(r.confirmSuccess().scene.id,'lobby-escape');
});
test('23번 이동은 입력을 받지 않고 도착 확인으로만 진행한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-marker');
 for(const answer of ['물감','평생학습실','고양이'])assert.equal(r.submit(answer).reason,'not-a-puzzle');
 assert.equal(r.advance().reason,'arrival-required');
 assert.equal(r.advance({arrived:true}).scene.id,'learning-intro');
 assert.equal(r.solved.size,0);
});
test('미리보기 우회는 정답 기록을 만들지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-marker');
 assert.equal(r.advance({review:true}).scene.id,'learning-intro');
 assert.equal(r.solved.has('learning-marker'),false);
});
test('검토 경로는 로비 후속 연결점까지 연결되고 엔딩/처음부터 처리가 없다',()=>{
 const r=new StoryRuntime(chapters,puzzles);let n=0;
 while(r.scene.next){assert.equal(r.advance({review:true}).ok,true);if(++n>=r.scenes.length)throw Error('진행 루프');}
 assert.equal(r.currentId,'lobby-ending-entry');assert.equal(r.scene.type,'handoff');
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
test('옛 23번 문제 기록은 도착 확인 장면으로 안전하게 복원된다',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'learning-marker',solved:['learning-marker']});
 assert.equal(r.solved.size,0);assert.equal(r.scene.type,'move');assert.equal(r.advance().reason,'arrival-required');
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

test('정답 팝업 대기 상태는 새로고침 후 복원되고 확인 후 한 번만 진행한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('lobby-postcard');r.submit('고양이와 사서가 뒤바뀌었다');
 assert.equal(r.currentId,'lobby-postcard');assert.equal(r.pendingSuccessId,'lobby-postcard');
 const restored=new StoryRuntime(chapters,puzzles,r.snapshot());
 assert.equal(restored.pendingSuccessId,'lobby-postcard');assert.equal(restored.advance().reason,'success-confirmation-required');
 assert.equal(restored.confirmSuccess().scene.id,'lobby-escape');assert.equal(restored.pendingSuccessId,null);
 assert.equal(restored.confirmSuccess().reason,'no-pending-success');assert.equal(restored.currentId,'lobby-escape');
});
test('마크 번호는 데이터의 숫자를 두 자리로 표시한다',()=>{
 for(const [input,output] of [[1,'01'],['2','02'],['03','03'],[10,'10'],[null,'']])assert.equal(formatMarkerNumber(input),output);
});
test('같은 시스템으로 다른 목적지·번호·도착 후 문제를 연결할 수 있다',()=>{
 const custom=[{id:'test',scenes:[{id:'arrive',type:'move',destination:'유아자료실',markerNumber:2,locationHints:['첫 힌트','두 번째 힌트'],next:'puzzle'},{id:'puzzle',type:'puzzle',puzzleId:'configured',next:'end'},{id:'end',type:'continuation',next:null}]}];
 const r=new StoryRuntime(custom,{configured:{acceptedAnswers:['확정답']}});
 assert.equal(r.advance().reason,'arrival-required');assert.equal(r.advance({arrived:true}).scene.id,'puzzle');assert.equal(r.solved.size,0);
 r.submit('확정답');assert.equal(r.advance().reason,'success-confirmation-required');assert.equal(r.confirmSuccess().scene.id,'end');
});

test('ART 정답은 NFKC·공백·대소문자만 정규화하며 다른 3글자와 기호를 거부한다',()=>{
 for(const value of ['art','ART','Art',' art ','a r t','ａｒｔ','\tArT\n']){
  const r=new StoryRuntime(chapters,puzzles);r.jump('learning-room-art');
  assert.equal(r.submit(value).ok,true,value);assert.equal(r.currentId,'learning-room-art');
  assert.equal(r.solved.has('learning-room-art'),false);
 }
 for(const value of ['물감','미술','아트','ar','arts','art!','a-r-t','cat','']){
  const r=new StoryRuntime(chapters,puzzles);r.jump('learning-room-art');
  assert.equal(r.submit(value).ok,false,value);assert.equal(r.pendingSuccess,null);assert.equal(r.solved.size,0);
 }
 assert.equal(normalizeArtAnswer(' ａｒｔ\n'),'art');
});
test('도착 → 소개 → 원본24 → ART → 팝업 확인 → 자국 → 02 도착 경로',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-marker');
 assert.equal(r.advance({arrived:true}).scene.id,'learning-intro');
 assert.equal(r.advance().scene.id,'learning-paint');assert.equal(r.scene.sourceNumber,24);
 assert.equal(r.advance().scene.id,'learning-room-art');assert.equal(r.advance().reason,'answer-required');
 r.submit('ART');assert.equal(r.pendingSuccess.popup.title,'찾아냈다!');
 assert.equal(r.pendingSuccess.nextSceneId,'learning-room-trail');assert.equal(r.advance().reason,'success-confirmation-required');
 assert.equal(r.confirmSuccess().scene.id,'learning-room-trail');assert.equal(r.solved.has('learning-room-art'),true);
 assert.equal(r.confirmSuccess().reason,'no-pending-success');
 assert.equal(r.advance().scene.id,'learning-infant-trail');
 assert.equal(r.advance().scene.id,'infant-marker');assert.equal(r.scene.markerNumber,2);
 assert.equal(r.advance({arrived:true}).scene.id,'infant-intro');
 assert.equal(r.solved.size,1);
});
test('팝업의 다음ID·문구·퍼즐ID를 저장하고 재제출·재설정에도 열린 문구를 유지한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('learning-room-art');r.submit('art');
 const pending=structuredClone(r.pendingSuccess);r.submit('ART');assert.deepEqual(r.pendingSuccess,pending);
 const changed=structuredClone(puzzles);changed['learning-room-art'].successPopup.title='설정 변경';
 const restored=new StoryRuntime(chapters,changed,JSON.parse(JSON.stringify(r.snapshot())));
 assert.deepEqual(restored.pendingSuccess,pending);assert.equal(restored.solved.has('learning-room-art'),false);
 restored.confirmSuccess();assert.equal(restored.currentId,'learning-room-trail');assert.equal(restored.solved.size,1);
});
test('옛 저장의 대기 팝업만 변환하고 이미 뒤쪽에 도달한 저장은 되돌리지 않는다',()=>{
 const pending=new StoryRuntime(chapters,puzzles,{currentId:'lobby-postcard',pendingSuccessId:'lobby-postcard',solved:['postcard-heading']});
 assert.equal(pending.pendingSuccessId,'lobby-postcard');assert.equal(pending.pendingSuccess.puzzleId,'postcard-heading');
 assert.equal(pending.solved.size,0);pending.confirmSuccess();assert.equal(pending.solved.size,1);
 for(const id of ['learning-paint','opening-continuation']){
  const old=new StoryRuntime(chapters,puzzles,{currentId:id,solved:['postcard-heading'],history:['lobby-escape']});
  assert.equal(old.currentId,id);assert.equal(old.solved.has('postcard-heading'),true);
 }
});
test('공통 팝업은 기존 한글 문장·미니게임 키워드·마지막 문장 입력에서도 사용 가능하다',()=>{
 const fixtures=[{id:'fixture',scenes:[
  {id:'keyword',type:'puzzle',puzzleId:'keyword',next:'final'},
  {id:'final',type:'puzzle',puzzleId:'final',next:'ending'},
  {id:'ending',type:'continuation',next:null}]}];
 const r=new StoryRuntime(fixtures,{keyword:{acceptedAnswers:['테스트키']},final:{acceptedAnswers:['고양이와 사서가 돌아왔다']}},{},{title:'훌륭해!',cat:'happy'});
 r.submit('테스트 키!');assert.equal(r.pendingSuccess.popup.title,'훌륭해!');assert.equal(r.currentId,'keyword');r.confirmSuccess();
 r.submit(' 고양이와 사서가 돌아왔다？！ ');assert.equal(r.currentId,'final');r.confirmSuccess();assert.equal(r.currentId,'ending');
 assert.equal(r.solved.size,2);
});

test('아이콘 문제는 첫 입장에서만 배치를 만들고 현재9개를 저장한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);assert.equal(r.puzzleStates['infant-room-icons-14'],undefined);
 r.jump('infant-icon-puzzle');const state=r.getIconState();assert.equal(state.boardIds.length,9);assert.equal(new Set(state.boardIds).size,9);
 assert.equal(state.boardIds.filter(id=>id.startsWith('rule_')).length,4);
 assert.strictEqual(r.getIconState(),state);assert.deepEqual(r.snapshot().puzzleStates['infant-room-icons-14'].boardIds,state.boardIds);
});
test('실제 엔진의 아이콘 정답은 순서 독립 집합으로 팝업 다음에만 완료·C04 진입',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('infant-icon-puzzle');
 for(const id of ['rule_guardian','rule_quiet_walk','rule_book_cart','rule_food_water'])r.toggleIcon(id);
 assert.equal(r.pendingSuccess,null);assert.equal(r.submit().ok,true);assert.equal(r.pendingSuccess.popup.title,'와! 맞았어!');
 assert.equal(r.currentId,'infant-icon-puzzle');assert.equal(r.solved.size,0);
 assert.equal(r.advance().reason,'success-confirmation-required');assert.equal(r.toggleIcon('rule_guardian'),false);
 assert.equal(r.confirmSuccess().scene.id,'infant-cleaning-bridge');assert.equal(r.confirmSuccess().reason,'no-pending-success');
 assert.equal(r.solved.has('infant-room-icons-14'),true);assert.equal(r.puzzleStates['infant-room-icons-14'].completed,true);
 assert.equal(r.advance().reason,'game-clear-required');assert.equal(r.solved.has('cleaning-keyword'),false);
});
test('아이콘 오답·최대4·선택 해제는 배치를 유지한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('infant-icon-puzzle');const board=[...r.getIconState().boardIds];
 const wrong=board.filter(id=>!id.startsWith('rule_'));for(const id of wrong.slice(0,4))r.toggleIcon(id);
 r.toggleIcon(wrong[4]);assert.equal(r.getIconState().selectedIds.length,4);assert.match(r.getIconState().feedback,/다시 눌러/);
 assert.equal(r.submit().reason,'incorrect');assert.deepEqual(r.getIconState().boardIds,board);assert.equal(r.pendingSuccess,null);
 r.toggleIcon(wrong[0]);assert.equal(r.getIconState().selectedIds.length,3);
});
test('아이콘 선택/팝업 저장 복원은 RNG 없이 유지하고 재방문도 같은 배치다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('infant-icon-puzzle');r.toggleIcon('rule_book_cart');
 let restored=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())),{},()=>{throw Error('RNG 재호출');});
 assert.deepEqual(restored.getIconState().selectedIds,['rule_book_cart']);
 for(const id of ['rule_guardian','rule_quiet_walk','rule_food_water'])restored.toggleIcon(id);restored.submit();
 restored=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(restored.snapshot())),{},()=>{throw Error('팝업 재추첨');});
 assert.equal(restored.pendingSuccess.popup.title,'와! 맞았어!');const board=[...restored.getIconState().boardIds];restored.confirmSuccess();
 restored.back();assert.deepEqual(restored.getIconState().boardIds,board);assert.equal(restored.getIconState().completed,true);assert.equal(restored.submit().reason,'already-completed');
});
test('깨진 아이콘 상태만 복구하고 다른 풀이·저장 위치는 유지한다',()=>{
 const snapshot={currentId:'infant-icon-puzzle',solved:['postcard-heading','learning-room-art','infant-room-icons-14'],puzzleStates:{'infant-room-icons-14':{boardIds:Array(9).fill('unknown'),pendingSuccess:true},other:{value:'유지'}},pendingSuccess:{fromSceneId:'infant-icon-puzzle',puzzleId:'infant-room-icons-14',nextSceneId:'infant-cleaning-bridge'}};
 const r=new StoryRuntime(chapters,puzzles,snapshot);assert.equal(r.currentId,'infant-icon-puzzle');assert.equal(new Set(r.getIconState().boardIds).size,9);
 assert.equal(r.pendingSuccess,null);assert.equal(r.solved.has('postcard-heading'),true);assert.equal(r.solved.has('learning-room-art'),true);assert.equal(r.solved.has('infant-room-icons-14'),false);assert.deepEqual(r.puzzleStates.other,{value:'유지'});
});
test('청소 키워드는 null이고 B 이상 실제 결과 없이 복귀로 우회하지 못한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('infant-cleaning-bridge');
 for(const keyword of ['뿌듯','반짝','깨끗이'])assert.equal(r.submit(keyword).reason,'not-configured');
 assert.equal(r.advance().reason,'game-clear-required');assert.equal(r.advance({minigameReturned:true}).reason,'game-clear-required');assert.equal(r.solved.size,0);
 for(const result of [{grade:'C',cleared:false,generated:100,cleaned:69,remaining:31,ratio:.69},
   {grade:'B',cleared:true,generated:100,cleaned:69,remaining:31,ratio:.69},
   {grade:'B',cleared:true,generated:100,cleaned:70,remaining:30,ratio:1},
   {grade:'A',cleared:true,generated:0,cleaned:0,remaining:0,ratio:1}])assert.equal(r.completeMinigame(result).ok,false);
 assert.equal(r.currentId,'infant-cleaning-bridge');assert.equal(r.solved.size,0);
 const result={grade:'B',cleared:true,generated:100,cleaned:70,remaining:30,ratio:.7};
 assert.equal(r.completeMinigame(result).ok,true);assert.equal(r.currentId,'infant-cleaning-bridge');
 const restored=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));
 assert.equal(restored.solved.has('cleaning-keyword'),true);assert.deepEqual(restored.minigameResults['cleaning-keyword'],result);
 assert.equal(restored.advance().scene.id,'opening-continuation');restored.reset();assert.deepEqual(restored.minigameResults,{});
});
test('나중에 확정한 미니게임 키워드도 공통 팝업과 다음 버튼을 사용한다',()=>{
 const p=structuredClone(puzzles);p['cleaning-keyword'].completionMode='keyword';p['cleaning-keyword'].acceptedAnswers=['테스트용키워드'];
 const r=new StoryRuntime(chapters,p);r.jump('infant-cleaning-bridge');assert.equal(r.advance({minigameReturned:true}).reason,'answer-required');
 r.submit('테스트용 키워드!');assert.equal(r.currentId,'infant-cleaning-bridge');assert.equal(r.pendingSuccess.popup.title,'훌륭해!');
 const restored=new StoryRuntime(chapters,p,r.snapshot());assert.equal(restored.confirmSuccess().scene.id,'opening-continuation');assert.equal(restored.solved.has('cleaning-keyword'),true);
});
test('미니게임 복귀 메시지는 활성 iframe·origin·세션·게임ID·클리어 결과가 모두 맞아야 한다',()=>{
 const frameWindow={},active={origin:'https://gamemakercho.github.io',session:'one-run',gameId:'cleaning-keyword'};
 const event={origin:active.origin,source:frameWindow,data:{type:MINIGAME_RETURN,version:1,session:active.session,gameId:active.gameId,
   result:{grade:'A',cleared:true,generated:10,cleaned:9,remaining:1,ratio:.9}}};
 assert.equal(isMinigameReturn(event,active,frameWindow,puzzles['cleaning-keyword']),true);
 for(const change of [{source:{}},{origin:'https://other.example'},{data:{...event.data,session:'old-run'}},
   {data:{...event.data,gameId:'other-game'}},{data:{...event.data,version:2}},
   {data:{...event.data,result:{...event.data.result,grade:'C',cleared:false}}}])
   assert.equal(isMinigameReturn({...event,...change},active,frameWindow,puzzles['cleaning-keyword']),false);
 assert.equal(isMinigameReturn(event,null,frameWindow,puzzles['cleaning-keyword']),false);
});
test('기존 저장 위치와 다른 풀이를 유지하고 손상된 청소 완료 기록만 버린다',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'infant-cleaning-bridge',solved:['learning-room-art','cleaning-keyword'],
   minigameResults:{'cleaning-keyword':{grade:'B',cleared:true,generated:100,cleaned:20,remaining:80,ratio:.2}}});
 assert.equal(r.currentId,'infant-cleaning-bridge');assert.equal(r.solved.has('learning-room-art'),true);
 assert.equal(r.solved.has('cleaning-keyword'),false);assert.deepEqual(r.minigameResults,{});
});
test('명시적 새 플레이는 아이콘 배치를 버리고 다음 입장에만 새 추첨을 한다',()=>{
 let calls=0;const rng=()=>{calls++;return .5;};const r=new StoryRuntime(chapters,puzzles,{}, {},rng);
 r.jump('infant-icon-puzzle');r.getIconState();const before=calls;r.reset();assert.equal(calls,before);assert.deepEqual(r.puzzleStates,{});
 r.jump('infant-icon-puzzle');r.getIconState();assert(calls>before);
});

test('청소 뒤 기존 저장 ID에서 C05·03 도착·사고·퍼즐까지 실제 순서로 이어진다',()=>{
 const r=new StoryRuntime(chapters,puzzles,{currentId:'opening-continuation',solved:['learning-room-art']});
 assert.equal(r.scene.role,'C05');assert.equal(r.scene.background,'infant-clean');
 assert.equal(r.solved.has('learning-room-art'),true);r.advance();assert.equal(r.scene.role,'C06');
 assert.equal(r.advance().reason,'arrival-required');assert.equal(r.submit('고치기').reason,'not-a-puzzle');
 r.updateSceneState({locationHintLevel:1});assert.equal(r.currentId,'travel-to-sterilizer');
 r.advance({arrived:true});assert.equal(r.scene.role,'S01');assert.equal(r.sceneStates['travel-to-sterilizer'].arrived,true);
 assert.equal(r.scene.background,'sterilizer-mess');r.advance();assert.equal(r.scene.role,'S02');assert.equal(r.scene.staff,undefined);
 r.advance();assert.equal(r.scene.role,'S03');assert.equal(r.scene.background,'sterilizer-clean');
 r.advance();assert.equal(r.scene.role,'S04');r.advance();assert.equal(r.scene.role,'S05');
});
test('고치기만 허용하고 NFC·공백·물음표/느낌표 처리와 기존 ART 규칙을 분리한다',()=>{
 for(const value of ['고치기',' 고 치 기 ','고치기!','고치기？！','고치기'.normalize('NFD')]){
  const r=new StoryRuntime(chapters,puzzles);r.jump('sterilizer-color-puzzle');assert.equal(r.submit(value).ok,true);
 }
 const r=new StoryRuntime(chapters,puzzles);r.jump('sterilizer-color-puzzle');
 for(const value of ['고기','수리','소독','대기','고치기는','고치기.','고치기123','ㄱㅗㅊㅣㄱㅣ',['고치기'],42])assert.equal(r.submit(value).ok,false);
 assert.equal(r.currentId,'sterilizer-color-puzzle');assert.equal(r.flags.sterilizerRepaired,false);
 r.jump('learning-room-art');assert.equal(r.submit('ART').ok,true);assert.equal(r.submit('art!').ok,false);
});
test('수리는 팝업 다음에서만 완료하며 새로고침·연타·재입장에서 완료를 유지한다',()=>{
 let r=new StoryRuntime(chapters,puzzles);r.jump('sterilizer-color-puzzle');
 r.submit('고치기');assert.equal(r.pendingSuccess.popup.title,'찾아냈다!');assert.equal(r.flags.sterilizerRepaired,false);
 assert.equal(r.advance().reason,'success-confirmation-required');assert.equal(r.solved.has('sterilizer-color-command-v1'),false);
 r=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));
 assert.equal(r.scene.role,'S05');assert.equal(r.flags.sterilizerRepaired,false);r.submit('고치기');
 assert.equal(r.confirmSuccess().scene.role,'S06');assert.equal(r.flags.sterilizerRepaired,true);
 assert.equal(r.confirmSuccess().reason,'no-pending-success');
 r=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));assert.equal(r.scene.role,'S06');assert.equal(r.scene.machineState,'repaired');
 r.back();assert.equal(r.submit('고치기').reason,'already-repaired');assert.equal(r.pendingSuccess,null);r.advance();assert.equal(r.scene.role,'S06');
 r.reset();assert.deepEqual(r.flags,{});
});
test('수리 이후 04 도착 확인에서만 종합자료실 소개가 나오고 도착/힌트/입력을 복원한다',()=>{
 let r=new StoryRuntime(chapters,puzzles);r.jump('sterilizer-color-puzzle');r.updateSceneState({answer:'고 치 기',hintLevel:2});
 r=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));assert.equal(r.sceneState.answer,'고 치 기');assert.equal(r.sceneState.hintLevel,2);
 r.submit(r.sceneState.answer);r.confirmSuccess();r.advance();assert.equal(r.scene.role,'S07');
 r.updateSceneState({locationHintLevel:1});assert.equal(r.advance().reason,'arrival-required');
 r=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));assert.equal(r.scene.role,'S07');assert.equal(r.sceneState.locationHintLevel,1);
 assert.equal(r.advance({arrived:true}).scene.role,'G01');assert.equal(r.sceneStates['travel-to-general'].arrived,true);
 r=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));assert.equal(r.scene.role,'G01');assert.equal(r.flags.sterilizerRepaired,true);
 assert.equal(r.scene.type,'dialogue');assert.equal(r.advance().scene.id,'general-shelf-guide');
});
test('기존 대기 팝업·앞선 정답·아이콘 배치·청소 결과는 새 구간 추가 뒤에도 보존한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('infant-icon-puzzle');const board=r.getIconState();
 const s=r.snapshot();s.currentId='infant-cleaning-bridge';s.solved=['learning-room-art','cleaning-keyword'];
 s.minigameResults={'cleaning-keyword':{grade:'B',cleared:true,generated:10,cleaned:7,remaining:3,ratio:.7}};
 s.pendingSuccess={fromSceneId:'infant-cleaning-bridge',nextSceneId:'opening-continuation',puzzleId:'cleaning-keyword',popup:{title:'저장된 칭찬'}};
 const restored=new StoryRuntime(chapters,puzzles,s);assert.deepEqual(restored.puzzleStates['infant-room-icons-14'],board);
 assert.equal(restored.solved.has('learning-room-art'),true);assert.deepEqual(restored.minigameResults,s.minigameResults);
 assert.equal(restored.confirmSuccess().scene.role,'C05');assert.equal(restored.solved.has('cleaning-keyword'),true);
});
test('색 암호 SVG는 원본의 동일 크기6칸·세로/가로 좌표·최신 색·대체 텍스트만 포함한다',()=>{
 const svg=readFileSync(new URL('../assets/puzzles/sterilizer-color-command.svg',import.meta.url),'utf8');
 const blocks=[...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9A-F]+)"/g)].map(m=>m.slice(1));
 assert.deepEqual(blocks,[['33','26','80','80','#4AA470'],['33','106','80','80','#49A8DA'],
  ['209','60','80','80','#EA524A'],['289','60','80','80','#A165AF'],['438','60','80','80','#4AA470'],['518','60','80','80','#A165AF']]);
 assert.match(svg,/viewBox="0 0 634 219"/);assert.doesNotMatch(svg,/고치기|ㄱ|ㅗ|ㅊ|ㅣ/);
});
test('PC/신간 네 조합은 중복04 없이 실제 동선으로 로비에 도착한다',()=>{
 for(const showDeskInterlude of [false,true])for(const includeNewBooks of [false,true]){
  const options={showDeskInterlude,includeNewBooks},r=new StoryRuntime(createChapters(options),puzzles,{}, {},Math.random,options),visited=[];
  r.jump('general-room-intro');while(r.scene.next){visited.push(r.currentId);assert(r.advance({review:true}).ok);assert(visited.length<20);}
  assert.equal(r.currentId,'lobby-ending-entry');assert.equal(visited.filter(id=>id==='general-room-intro').length,1);
  assert.equal(visited.includes('general-pc-guide'),showDeskInterlude);assert.equal(visited.includes('general-pc-paint'),showDeskInterlude);
  assert.equal(visited.includes('newbooks-intro'),includeNewBooks);assert.equal(visited.length,5+(showDeskInterlude?2:0)+(includeNewBooks?5:0));
  if(!includeNewBooks)assert(!r.scenes.some(s=>s.background==='new-books'||s.markerNumber===5||s.gameUrl?.includes('book-order')));
 }
});
test('숫자 문제만 NFKC/공백 규칙을 쓰고 두 문제의 풀이/입력/팝업은 독립이다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('general-room-puzzle');r.updateSceneState({answer:'２'});
 for(const input of ['22','2.0','+2','둘','2!','2?'])assert.equal(r.submit(input).ok,false);
 for(const input of ['2',' ２ ','２\n'])assert.equal(normalizeNumericAnswer(input),'2');
 assert(r.submit('２').ok);assert.equal(r.pendingSuccess.popup.title,'정답이야!');assert.equal(r.currentId,'general-room-puzzle');
 r.confirmSuccess();assert.equal(r.currentId,'general-book-catch');r.jump('newbooks-puzzle');
 assert.equal(r.sceneState.answer,undefined);assert(!r.solved.has('newbooks-placeholder-v1'));assert.equal(r.advance().reason,'answer-required');
 r.submit('2');assert.equal(r.pendingSuccess.popup.title,'와! 맞았어!');assert.equal(r.solved.has('newbooks-placeholder-v1'),false);
 r.confirmSuccess();assert(r.solved.has('general-room-placeholder-v1'));assert(r.solved.has('newbooks-placeholder-v1'));
 r.jump('learning-room-art');assert.equal(r.submit('2').ok,false);r.jump('sterilizer-color-puzzle');assert.equal(r.submit('2').ok,false);
});
test('미니게임 성공은 기록만 남기고 키워드와 팝업 다음에서만 진행한다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('general-book-catch');
 assert.equal(r.submit('뿌듯').reason,'game-clear-required');assert.equal(r.advance().reason,'answer-required');
 assert.equal(r.completeMinigame({kind:'book-catch',cleared:false,score:19,elapsedMs:30000,totalBooks:30,missed:2}).ok,false);
 const clear={kind:'book-catch',cleared:true,score:20,elapsedMs:32000,totalBooks:30,missed:2};
 assert(r.completeMinigame(clear).ok);assert(!r.solved.has('book-catch-keyword'));assert.equal(r.currentId,'general-book-catch');
 assert.equal(r.submit('제자리').reason,'incorrect');assert(r.submit('뿌 듯！').ok);assert.equal(r.pendingSuccess.popup.title,'훌륭해!');
 const restored=new StoryRuntime(chapters,puzzles,JSON.parse(JSON.stringify(r.snapshot())));assert.equal(restored.currentId,'general-book-catch');
 assert.equal(restored.advance().reason,'success-confirmation-required');assert.equal(restored.confirmSuccess().scene.id,'general-after-catch');assert(restored.solved.has('book-catch-keyword'));
 assert.equal(restored.confirmSuccess().reason,'no-pending-success');
});
test('책 꽂기는 실제10권 완료 배열만 인정하고 다른 게임 결과/키워드를 받지 않는다',()=>{
 const r=new StoryRuntime(chapters,puzzles);r.jump('newbooks-order-game');const shelf=puzzles['book-order-keyword'].correctOrder;
 assert.equal(r.completeMinigame({kind:'book-catch',cleared:true,score:100,elapsedMs:30000,totalBooks:100,missed:0}).ok,false);
 assert.equal(r.completeMinigame({kind:'book-order',cleared:true,complete:true,shelf:[...shelf].reverse(),cart:Array(10).fill(null)}).ok,false);
 assert(r.completeMinigame({kind:'book-order',cleared:true,complete:true,shelf:[...shelf],cart:Array(10).fill(null)}).ok);
 assert.equal(r.submit('뿌듯').reason,'incorrect');assert(r.submit('제 자 리？！').ok);assert.equal(r.currentId,'newbooks-order-game');
 assert.equal(r.confirmSuccess().scene.id,'newbooks-after-order');assert.equal(r.advance().reason,'arrival-required');assert.equal(r.advance({arrived:true}).scene.id,'lobby-ending-entry');
});
test('한 플레이의 설정/runId를 복구하고 새 전체 플레이는 새 미니게임 저장공간을 쓴다',()=>{
 const options=normalizeCourseOptions({showDeskInterlude:false,includeNewBooks:false});
 const r=new StoryRuntime(createChapters(options),puzzles,{}, {},Math.random,options);r.jump('general-book-catch');
 r.updateSceneState({gameEntered:true,gameReturned:true});const s=JSON.parse(JSON.stringify(r.snapshot()));
 const restored=new StoryRuntime(createChapters(normalizeCourseOptions(s.courseOptions)),puzzles,s);
 assert.deepEqual(restored.courseOptions,options);assert.equal(restored.runId,r.runId);assert(restored.sceneState.gameEntered);assert(restored.sceneState.gameReturned);
 const before=restored.runId;restored.reset();assert.notEqual(restored.runId,before);assert.deepEqual(restored.minigameResults,{});
});
