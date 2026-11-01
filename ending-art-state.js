export const IMPACT_DURATION_MS=2000;
export function impactProgress(state={}){
 if(state?.impactVersion!==1)return null;
 return {elapsedMs:Number.isFinite(state.impactElapsedMs)?Math.max(0,Math.min(IMPACT_DURATION_MS,state.impactElapsedMs)):0};
}
export function canReuseEndingIllustration(previous,next){
 return Boolean(previous?.endingArt&&previous.endingArt===next?.endingArt&&
  ['dialogue','ending'].includes(previous.type)&&['dialogue','ending'].includes(next.type)&&
  previous.layout==='ending-illustration'&&next.layout==='ending-illustration');
}
