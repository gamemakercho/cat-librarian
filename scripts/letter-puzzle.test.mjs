import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {LETTER_PUZZLE as C} from '../games/book-order/letter-puzzle-config.js';
import {ORDER_IDS,orderSorted,restoreLetters,solveLetters,letterProof,validOrderProgress} from '../games/book-order/letter-state.js';
import {isMinigameClear} from '../minigame-bridge.js';
test('책 ID와 원본 띠 색 대응이 고정되고 500→800→300→100에서 정리완료가 된다',()=>{
 const frames=JSON.parse(readFileSync(new URL('../games/book-order/assets/books-atlas-crisp-v2.json',import.meta.url))).frames;
 assert.deepEqual(ORDER_IDS,['000','100','200','300','400','500','600','700','800','900']);assert.equal(C.readingBookIds.map(id=>C.letters[id]).join(''),C.answer);
 assert.deepEqual(C.readingBookIds.map(id=>frames.find(f=>f.id===id).band_color_ko),['하늘색','진한 파랑','주황','빨강']);assert.equal(new Set(Object.values(C.letters)).size,10);
});
test('글자 문제는 NFC·공백·물음표/느낌표만 허용하고 정렬이나 일부 답으로 풀리지 않는다',()=>{
 const fresh=restoreLetters(null);for(const value of ['정리완료','정리 완료','정리완료!',' 정리 완료？！ ','정리완료'.normalize('NFD')])assert.equal(solveLetters(fresh,value).phase,'pending-success');
 for(const value of ['정리','완료','2','정리완료.','정리완료추가'])assert.equal(solveLetters(fresh,value).phase,'question');assert.equal(letterProof(fresh),null);assert.equal(letterProof(solveLetters(fresh,'정리완료')),null);
 assert(letterProof({...solveLetters(fresh,'정리 완료!'),phase:'complete'}));
});
test('팝업/글자/힌트 저장을 복원하고 깨진 성공 상태나 틀린 배열은 통과시키지 않는다',()=>{
 const state=solveLetters({...restoreLetters(null),introIndex:2,hintLevel:2},'정리 완료!');assert.deepEqual(restoreLetters(state),state);assert.equal(restoreLetters({...state,answer:'오답'}).phase,'question');
 const result={kind:'book-order',complete:true,cleared:true,shelf:[...ORDER_IDS],cart:Array(10).fill(null),sortComplete:true,letters:state};assert(orderSorted(result));assert(validOrderProgress(result));assert(!validOrderProgress({...result,sortComplete:false}));assert(!validOrderProgress({...result,shelf:[...ORDER_IDS].reverse()}));
 const config={resultKind:'book-order',correctOrder:ORDER_IDS,requiresLetterPuzzle:true};assert(!isMinigameClear(result,config));assert(isMinigameClear({...result,letterPuzzle:letterProof({...state,phase:'complete'})},config));assert(!isMinigameClear({...result,letterPuzzle:{id:C.id,completed:true,stage:'pending-success'}},config));
});
