export const ENDING_GAME_ID='library-ending-rescue';
export const ENDING_READY='cat-librarian:ending-ready';
export const ENDING_CONTACT='cat-librarian:ending-contact';
export const ENDING_COMPLETE='cat-librarian:ending-complete';
export const ENDING_ERROR='cat-librarian:ending-error';
export const ENDING_PUZZLE_ID='postcard-returned-v1';
export function isEndingResult(result){return Boolean(result&&result.gameId===ENDING_GAME_ID&&result.completed===true);}
export function isEndingContact(result){return Boolean(result&&result.gameId===ENDING_GAME_ID&&result.contactReached===true&&result.completed===false);}
export function isEndingPoster(value){return typeof value==='string'&&value.length<=500000&&/^data:image\/(?:webp|jpeg);base64,[A-Za-z0-9+/=]+$/u.test(value);}
export function migrateEndingSnapshot(value={}){
 const snapshot={...value,flags:{...value.flags}};
 const solved=Array.isArray(value.solved)&&value.solved.includes(ENDING_PUZZLE_ID);
 if(value.pendingSuccess?.puzzleId===ENDING_PUZZLE_ID||value.pendingSuccessId==='ending-fold-puzzle'){
   snapshot.solved=[...new Set([...(value.solved||[]),ENDING_PUZZLE_ID])];snapshot.pendingSuccess=null;snapshot.pendingSuccessId=null;
   snapshot.currentId='ending-impact';snapshot.flags.endingContactReached=true;
 }
 if(value.currentId==='ending-impact'&&solved&&value.flags?.endingIllustrationStarted){snapshot.currentId='ending-returned';snapshot.flags.endingRescueComplete=true;}
 if(solved){snapshot.flags.endingContactReached=true;if(['ending-rescue','ending-not-yet'].includes(value.currentId))snapshot.currentId='ending-impact';}
 if(value.storyVersion?.includes('ending-v13')&&value.currentId==='ending-fold-puzzle'&&!solved&&!value.pendingSuccess)snapshot.currentId='ending-rescue';
 return snapshot;
}
export function isEndingMessage(event,active,frameWindow,type){
  const d=event?.data;
  return Boolean(active&&frameWindow&&event.source===frameWindow&&event.origin===active.origin&&
    d?.type===type&&d.session===active.session&&d.runId===active.runId&&
    d.gameId===ENDING_GAME_ID&&(type!==ENDING_COMPLETE||isEndingResult(d.result))&&
    (type!==ENDING_CONTACT||isEndingContact(d.result))&&['approach','restore','full'].includes(active.part)&&d.part===active.part&&
    (type!==ENDING_CONTACT||active.part==='approach')&&(type!==ENDING_COMPLETE||active.part!=='approach'));
}
