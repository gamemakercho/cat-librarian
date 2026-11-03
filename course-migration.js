import {orderSorted,restoreLetters} from './games/book-order/letter-state.js';
import {isMinigameClear} from './minigame-bridge.js';
const gameId='book-order-keyword';
export function migrateCourseSnapshot(value={}){
 const s={...value,minigameResults:{...value.minigameResults},minigameProgress:{...value.minigameProgress}};
 // Before this guide moved after the catch, its checkpoint led to the shelf story.
 const hasNewGuideState=Number.isInteger(value.sceneStates?.['general-shelf-arrival']?.locationGuideStep);
 if(!hasNewGuideState){
  if(s.currentId==='general-shelf-arrival'&&!isMinigameClear(s.minigameResults['book-catch-keyword'],{resultKind:'book-catch',target:20}))s.currentId='general-book-drop';
  if(Array.isArray(s.history))s.history=s.history.filter(id=>id!=='general-shelf-arrival');
 }
 const old=!value.courseRevision||value.courseRevision<18;
 const result=s.minigameResults[gameId],sorted=result?.kind==='book-order'&&result.cleared===true&&orderSorted(result),complete=result?.letterPuzzle?.completed===true;
 if(old&&sorted&&!complete){
  if(['newbooks-order-game','newbooks-after-order','general-breath'].includes(s.currentId)){
   s.currentId='newbooks-order-game';s.minigameProgress[gameId]={kind:'book-order',sortComplete:true,shelf:result.shelf,cart:result.cart,letters:restoreLetters(null)};delete s.minigameResults[gameId];s.solved=(s.solved||[]).filter(id=>id!==gameId);
  }else s.legacyOrderPassed=true;
 }
 const aliases={'general-breath':'newbooks-after-order','ending-postcard-clue':'ending-rescue','general-order-sequence':'newbooks-order-game','general-shelf-guide':'general-order-bridge','general-pc-guide':'general-order-bridge','general-pc-paint':'general-order-bridge','general-classification-clue':'general-order-bridge','general-room-puzzle':'newbooks-order-game','newbooks-intro':'general-book-drop','newbooks-disorder':'general-book-drop','general-faces-joke':'general-book-drop','general-faces-clue':'general-book-drop','newbooks-puzzle':'general-book-drop','general-face-easy':'general-book-drop','general-body-wait':'general-book-drop'};
 Object.assign(aliases,{'general-return-joke':'general-expression-intro','general-return-help':'general-expression-intro','general-stay-still':'general-notice-solved','general-flee-meow':'general-lobby-direction','general-come-down':'general-lobby-direction','general-body-missed':'general-lobby-direction','travel-to-ending-lobby':'lobby-ending-entry'});
 if(s.currentId==='general-return-notice'&&value.sceneStates?.['general-shelf-arrival']?.arrived===true)s.currentId='general-expression-intro';
 aliases['ending-loan-joke']='ending-complete';
 if(aliases[s.currentId])s.currentId=aliases[s.currentId];
 if(Array.isArray(s.history)){s.history=s.history.map(id=>aliases[id]||id).filter((id,i,all)=>id!==s.currentId&&id!==all[i-1]);}
 if(['general-room-placeholder-v1','newbooks-placeholder-v1'].includes(s.pendingSuccess?.puzzleId)){s.pendingSuccess=null;s.pendingSuccessId=null;}
 if(s.currentId==='general-return-puzzle'&&s.pendingSuccess?.puzzleId==='return-notice-booksodong')s.pendingSuccess={...s.pendingSuccess,nextSceneId:'general-notice-solved'};
 return s;
}
