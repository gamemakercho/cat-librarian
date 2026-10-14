// Shared contract for games: send this message only from the successful result's return button.
export const MINIGAME_RETURN = 'cat-librarian:minigame-return';
export function isMinigameClear(result, config = {}) {
  if(!result || result.cleared !== true || !(config.allowedGrades || ['A','B']).includes(result.grade))return false;
  const {generated,cleaned,remaining,ratio}=result;
  return [generated,cleaned,remaining].every(Number.isSafeInteger) && generated>0 && cleaned>=0 && remaining>=0 &&
    cleaned+remaining===generated && Number.isFinite(ratio) && ratio<=1 &&
    Math.abs(ratio-cleaned/generated)<1e-9 && ratio>=(config.minimumRatio ?? .7);
}
export function isMinigameReturn(event, active, frameWindow, config) {
  const data=event.data;
  return Boolean(active && event.source===frameWindow && event.origin===active.origin &&
    data?.type===MINIGAME_RETURN && data.version===1 && data.session===active.session &&
    data.gameId===active.gameId && isMinigameClear(data.result,config));
}
