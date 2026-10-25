import {LETTER_PUZZLE as C} from './letter-puzzle-config.js';
import {normalizeKoreanAnswer} from '../../answer-rules.js';
export const ORDER_IDS=Object.freeze(Object.keys(C.letters).sort());
export const orderSorted=state=>Boolean(state?.complete===true&&Array.isArray(state.shelf)&&state.shelf.length===10&&state.shelf.every((id,i)=>id===ORDER_IDS[i])&&Array.isArray(state.cart)&&state.cart.length===10&&state.cart.every(id=>id===null));
export function restoreLetters(value){
 const x=value?.version===1&&value.puzzleId===C.id?value:{};
 const answer=typeof x.answer==='string'?x.answer.slice(0,80):'';
 let phase=['reveal','question','pending-success','complete'].includes(x.phase)?x.phase:'reveal';
 if(['pending-success','complete'].includes(phase)&&normalizeKoreanAnswer(answer)!==normalizeKoreanAnswer(C.answer))phase='question';
 return {version:1,puzzleId:C.id,revision:Number.isSafeInteger(x.revision)?Math.max(0,x.revision):0,phase,introIndex:Number.isInteger(x.introIndex)?Math.max(0,Math.min(2,x.introIndex)):0,answer,hintLevel:Number.isInteger(x.hintLevel)?Math.max(0,Math.min(2,x.hintLevel)):0};
}
export const solveLetters=(state,answer)=>{const next=restoreLetters({...restoreLetters(state),answer});return normalizeKoreanAnswer(answer)===normalizeKoreanAnswer(C.answer)?{...next,phase:'pending-success'}:{...next,phase:'question'};};
export const letterProof=state=>state?.phase==='complete'&&normalizeKoreanAnswer(state.answer)===normalizeKoreanAnswer(C.answer)?{id:C.id,completed:true,stage:'complete'}:null;
export function validOrderProgress(value){
 if(!value||value.kind!=='book-order'||value.sortComplete!==true||!orderSorted({...value,complete:true}))return null;
 return {kind:'book-order',sortComplete:true,shelf:[...value.shelf],cart:[...value.cart],letters:restoreLetters(value.letters)};
}
