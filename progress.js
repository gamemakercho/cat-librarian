import {isMinigameClear} from './minigame-bridge.js';
import {validOrderProgress} from './games/book-order/letter-state.js';

// One ordered list owns both the denominator and the stable saved activity IDs.
// Location markers and dialogue scenes are deliberately absent.
export const ACTIVITIES = Object.freeze([
  {id:'puzzle-opening-postcard', puzzleId:'postcard-heading'},
  {id:'puzzle-learning-book', puzzleId:'learning-room-art'},
  {id:'puzzle-infant-notice', puzzleId:'infant-room-icons-14'},
  {id:'game-paint-cleaning', gameId:'cleaning-keyword'},
  {id:'puzzle-sterilizer-repair', puzzleId:'sterilizer-color-command-v1'},
  {id:'game-ten-book-order', gameId:'book-order-keyword'},
  {id:'puzzle-book-paws', letterPuzzleId:'book-order-paws-v1'},
  {id:'game-falling-books', gameId:'book-catch-keyword'},
  {id:'puzzle-return-notice', puzzleId:'return-notice-booksodong'},
  {id:'game-librarian-chase', endingApproach:true},
  {id:'puzzle-final-postcard', puzzleId:'postcard-returned-v1'},
].map(Object.freeze));

const knownIds = new Set(ACTIVITIES.map(a=>a.id));
export function activityForPuzzle(puzzleId) {
  return ACTIVITIES.find(a=>a.puzzleId===puzzleId)?.id;
}
export function progressSummary(completedIds=[]) {
  const completed=new Set([...completedIds].filter(id=>knownIds.has(id))).size;
  const total=ACTIVITIES.length;
  const percent=total?completed/total*100:0;
  return {completed,total,percent,displayPercent:Math.round(percent)};
}

// The caller supplies validated runtime records. Never infer a clear from the
// current scene, visited scenes, arrival flags, or elapsed time.
export function restoreCompletedActivities(savedIds, evidence, puzzles) {
  const completed=new Set(Array.isArray(savedIds)?savedIds.filter(id=>knownIds.has(id)):[]);
  const add=id=>{if(id)completed.add(id);};
  for(const activity of ACTIVITIES) {
    if(activity.puzzleId && evidence.solved?.has(activity.puzzleId))add(activity.id);
    if(puzzles[activity.puzzleId]?.answerMode==='icons' && evidence.puzzleStates?.[activity.puzzleId]?.completed===true)add(activity.id);
    if(activity.puzzleId && evidence.pendingSuccess?.puzzleId===activity.puzzleId)add(activity.id);
    if(activity.gameId) {
      const config=puzzles[activity.gameId];
      // Old saves can have a proven sort without the later letter puzzle.
      if(config && isMinigameClear(evidence.minigameResults?.[activity.gameId],
        {...config,requiresLetterPuzzle:false}))add(activity.id);
    }
  }
  const order=evidence.minigameResults?.['book-order-keyword'];
  const config=puzzles['book-order-keyword'];
  if(config && isMinigameClear(order,config))add('puzzle-book-paws');
  const progress=validOrderProgress(evidence.minigameProgress?.['book-order-keyword']);
  if(progress) {
    add('game-ten-book-order');
    if(['pending-success','complete'].includes(progress.letters.phase))add('puzzle-book-paws');
  }
  if(evidence.flags?.endingContactReached===true)add('game-librarian-chase');
  return completed;
}
