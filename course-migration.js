import {orderSorted,restoreLetters} from './games/book-order/letter-state.js';
const gameId='book-order-keyword';
export function migrateCourseSnapshot(value={}){
 const s={...value,minigameResults:{...value.minigameResults},minigameProgress:{...value.minigameProgress}};
 const old=!value.courseRevision||value.courseRevision<18;
 const result=s.minigameResults[gameId],sorted=result?.kind==='book-order'&&result.cleared===true&&orderSorted(result),complete=result?.letterPuzzle?.completed===true;
 if(old&&sorted&&!complete){
  if(['newbooks-order-game','newbooks-after-order','general-breath'].includes(s.currentId)){
   s.currentId='newbooks-order-game';s.minigameProgress[gameId]={kind:'book-order',sortComplete:true,shelf:result.shelf,cart:result.cart,letters:restoreLetters(null)};delete s.minigameResults[gameId];s.solved=(s.solved||[]).filter(id=>id!==gameId);
  }else s.legacyOrderPassed=true;
 }
 const aliases={'general-order-sequence':'newbooks-order-game','general-shelf-guide':'general-order-bridge','general-pc-guide':'general-order-bridge','general-pc-paint':'general-order-bridge','general-classification-clue':'general-order-bridge','general-room-puzzle':'newbooks-order-game','newbooks-intro':'general-book-drop','newbooks-disorder':'general-book-drop','general-faces-joke':'general-book-drop','general-faces-clue':'general-book-drop','newbooks-puzzle':'general-book-drop','general-face-easy':'general-book-drop','general-body-wait':'general-book-drop'};
 if(aliases[s.currentId])s.currentId=aliases[s.currentId];
 if(['general-room-placeholder-v1','newbooks-placeholder-v1'].includes(s.pendingSuccess?.puzzleId)){s.pendingSuccess=null;s.pendingSuccessId=null;}
 return s;
}
