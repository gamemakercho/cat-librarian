// Shared contract for games: send this message only from the successful result's return button.
export const MINIGAME_RETURN = 'cat-librarian:minigame-return';
export const MINIGAME_CLEAR = 'cat-librarian:minigame-clear';
export function isMinigameClear(result, config = {}) {
  if(config.resultKind==='book-catch')return Boolean(result?.kind==='book-catch'&&result.cleared===true&&
    Number.isSafeInteger(result.score)&&result.score>=(config.target||20)&&Number.isFinite(result.elapsedMs)&&result.elapsedMs>=0&&
    Number.isSafeInteger(result.totalBooks)&&result.totalBooks>=result.score&&Number.isSafeInteger(result.missed)&&result.missed>=0);
  if(config.resultKind==='book-order')return Boolean(result?.kind==='book-order'&&result.cleared===true&&result.complete===true&&
    config.correctOrder?.length===10&&Array.isArray(result.shelf)&&result.shelf.length===10&&result.shelf.every((id,i)=>id===config.correctOrder[i])&&
    Array.isArray(result.cart)&&result.cart.length===10&&result.cart.every(id=>id===null));
  if(!result || result.cleared !== true || !(config.allowedGrades || ['A','B']).includes(result.grade))return false;
  const {generated,cleaned,remaining,ratio}=result;
  return [generated,cleaned,remaining].every(Number.isSafeInteger) && generated>0 && cleaned>=0 && remaining>=0 &&
    cleaned+remaining===generated && Number.isFinite(ratio) && ratio<=1 &&
    Math.abs(ratio-cleaned/generated)<1e-9 && ratio>=(config.minimumRatio ?? .7);
}
export function isMinigameMessage(event, active, frameWindow, type) {
 const data=event.data;
 return Boolean(active&&event.source===frameWindow&&event.origin===active.origin&&data?.type===type&&
  data.version===1&&data.session===active.session&&data.gameId===active.gameId);
}
export function isMinigameReturn(event, active, frameWindow, config) {
  return isMinigameMessage(event,active,frameWindow,MINIGAME_RETURN)&&isMinigameClear(event.data.result,config);
}
