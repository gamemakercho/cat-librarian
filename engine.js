import {initializePuzzle,toggleSelection,submitAnswer as submitIcons,confirmSuccess as confirmIcons,isCorrectSelection} from './icon-puzzle.js';
import {isMinigameClear} from './minigame-bridge.js';

export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFC').replace(/[\s?？!！]/gu, '').toLowerCase();
}

export function normalizeArtAnswer(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s/gu, '').toLowerCase();
}
export function normalizeNumericAnswer(value) {
 return typeof value==='string'?value.normalize('NFKC').replace(/\s/gu,''):'';
}
function newRunId(){return globalThis.crypto?.randomUUID?.()||`run-${Date.now()}-${Math.random().toString(36).slice(2)}`;}

export function formatMarkerNumber(value) {
  const number=String(value??'').trim();
  return /^\d+$/.test(number)?number.padStart(2,'0'):number;
}

export function validateStory(chapters, puzzles) {
  const scenes = chapters.flatMap(c => c.scenes);
  const ids = new Set();
  for (const scene of scenes) {
    if (!scene.id || ids.has(scene.id)) throw new Error(`중복/빈 장면 ID: ${scene.id}`);
    ids.add(scene.id);
  }
  for (const scene of scenes) {
    if (scene.next && !ids.has(scene.next)) throw new Error(`없는 다음 장면: ${scene.next}`);
    if (['puzzle','minigame'].includes(scene.type) && !puzzles[scene.puzzleId]) throw new Error(`없는 문제: ${scene.puzzleId}`);
  }
  return scenes;
}

export class StoryRuntime {
  constructor(chapters, puzzles, snapshot = {}, successDefaults = {}, rng = Math.random, courseOptions = {}) {
    this.scenes = validateStory(chapters, puzzles);
    this.index = new Map(this.scenes.map(s => [s.id, s]));
    this.puzzles = puzzles;
    this.successDefaults = successDefaults;
    this.rng=rng;
    this.runId=typeof snapshot.runId==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(snapshot.runId)?snapshot.runId:newRunId();
    this.courseOptions={...(Object.keys(courseOptions).length?courseOptions:snapshot.courseOptions||{})};
    this.puzzleStates={...snapshot.puzzleStates};
    for(const [id,saved] of Object.entries(this.puzzleStates)){
      if(puzzles[id]?.answerMode==='icons')this.puzzleStates[id]=initializePuzzle(saved,rng);
    }
    this.currentId = this.index.has(snapshot.currentId) ? snapshot.currentId : this.scenes[0].id;
    this.minigameResults={};
    for(const [id,result] of Object.entries(snapshot.minigameResults||{})){
      if((puzzles[id]?.completionMode==='result'||puzzles[id]?.requiresGameClear)&&isMinigameClear(result,puzzles[id]))this.minigameResults[id]={...result};
    }
    this.solved = new Set((snapshot.solved ?? []).filter(id => puzzles[id]?.answerMode==='icons'?this.puzzleStates[id]?.completed:
      puzzles[id]?.completionMode==='result'||puzzles[id]?.requiresGameClear?Boolean(this.minigameResults[id]):puzzles[id]?.acceptedAnswers?.length));
    this.flags={...snapshot.flags};
    this.sceneStates={};
    for(const [id,state] of Object.entries(snapshot.sceneStates||{})){
      if(!this.index.has(id)||!state||typeof state!=='object')continue;
      this.sceneStates[id]=this.normalizeSceneState(state);
    }
    this.history = (snapshot.history ?? []).filter(id => this.index.has(id)).slice(-200);
    this.pendingSuccess = null;
    const pending = snapshot.pendingSuccess;
    // These two games used to wait for a keyword popup. Keep their clear proof,
    // but discard that obsolete popup without affecting legacy cleaning saves.
    const resultGame=this.scene.type==='minigame'&&puzzles[this.scene.puzzleId]?.completionMode==='result'&&Boolean(puzzles[this.scene.puzzleId]?.resultKind);
    if (!resultGame && ['puzzle','minigame'].includes(this.scene.type) && pending?.fromSceneId===this.currentId && pending.puzzleId===this.scene.puzzleId) {
      this.pendingSuccess = {...pending, nextSceneId:this.index.has(pending.nextSceneId)?pending.nextSceneId:this.scene.next};
    } else if (!resultGame && snapshot.pendingSuccessId===this.currentId && ['puzzle','minigame'].includes(this.scene.type) && this.solved.has(this.scene.puzzleId)) {
      // v3/v5 saved a solved record before the popup was confirmed.
      this.pendingSuccess = this.createPendingSuccess();
    }
    if(this.puzzles[this.scene.puzzleId]?.answerMode==='icons'){
      const state=this.getIconState();
      if(!state.pendingSuccess||!isCorrectSelection(state.boardIds,state.selectedIds))this.pendingSuccess=null;
      else if(!this.pendingSuccess)this.pendingSuccess=this.createPendingSuccess();
    }
    if(this.pendingSuccess)this.solved.delete(this.pendingSuccess.puzzleId);
    for(const [id,puzzle] of Object.entries(puzzles))if(puzzle.repairFlag)this.flags[puzzle.repairFlag]=this.solved.has(id);
    this.lastResult = null;
  }
  get scene() { return this.index.get(this.currentId); }
  get pendingSuccessId() { return this.pendingSuccess?.fromSceneId ?? null; }
  get sceneState() { return this.sceneStates[this.currentId]||{}; }
  normalizeSceneState(state) {
    return {answer:typeof state.answer==='string'?state.answer.slice(0,80):'',
      hintLevel:Number.isInteger(state.hintLevel)?Math.max(0,Math.min(2,state.hintLevel)):0,
      locationHintLevel:Number.isInteger(state.locationHintLevel)?Math.max(0,Math.min(2,state.locationHintLevel)):0,
      arrived:state.arrived===true,gameEntered:state.gameEntered===true,gameReturned:state.gameReturned===true};
  }
  updateSceneState(patch) { this.sceneStates[this.currentId]=this.normalizeSceneState({...this.sceneState,...patch}); }
  clearPending() {
    const state=this.puzzleStates[this.pendingSuccess?.puzzleId];
    if(state?.pendingSuccess)this.puzzleStates[this.pendingSuccess.puzzleId]={...state,pendingSuccess:false,successText:null};
    this.pendingSuccess=null;
  }
  getIconState() {
    const id=this.scene.puzzleId;
    if(this.puzzles[id]?.answerMode!=='icons')return null;
    return this.puzzleStates[id]??=initializePuzzle(null,this.rng);
  }
  toggleIcon(id) {
    const state=this.getIconState();
    if(!state||this.pendingSuccessId)return false;
    this.puzzleStates[this.scene.puzzleId]=toggleSelection(state,id);return true;
  }
  createPendingSuccess() {
    const s=this.scene;
    return {fromSceneId:s.id,nextSceneId:s.next,puzzleId:s.puzzleId,
      popup:{...this.successDefaults,...this.puzzles[s.puzzleId]?.successPopup,...s.successPopup}};
  }
  snapshot() { return { currentId: this.currentId, solved: [...this.solved], history: this.history, pendingSuccessId:this.pendingSuccessId, pendingSuccess:this.pendingSuccess, puzzleStates:this.puzzleStates, minigameResults:this.minigameResults, flags:this.flags,sceneStates:this.sceneStates,runId:this.runId,courseOptions:this.courseOptions }; }
  completeMinigame(result,{recordOnly=false}={}) {
    const s=this.scene,p=this.puzzles[s.puzzleId];
    if(s.type!=='minigame'||!(p?.completionMode==='result'||p?.requiresGameClear)||!isMinigameClear(result,p))return {ok:false,reason:'game-clear-required'};
    this.minigameResults[s.puzzleId]={...result};if(p.completionMode==='result'&&!recordOnly)this.solved.add(s.puzzleId);
    return {ok:true};
  }
  advance({ review = false, arrived = false, minigameReturned = false } = {}) {
    const s = this.scene;
    if(this.pendingSuccessId===s.id&&!review)return {ok:false,reason:'success-confirmation-required'};
    if (s.type === 'puzzle' && !this.solved.has(s.puzzleId) && !review) return {ok:false,reason:'answer-required'};
    if (s.type === 'move' && !arrived && !review) return {ok:false,reason:'arrival-required'};
    if(s.type==='minigame'&&!review&&!this.solved.has(s.puzzleId)){
      if(this.puzzles[s.puzzleId].completionMode==='result')return {ok:false,reason:'game-clear-required'};
      if(this.puzzles[s.puzzleId].acceptedAnswers?.length)return {ok:false,reason:'answer-required'};
      if(!minigameReturned)return {ok:false,reason:'game-button-required'};
    }
    if (!s.next) return {ok:false,reason:'end-of-preview'};
    if(s.type==='move'&&arrived&&!review)this.updateSceneState({arrived:true});
    this.clearPending();
    this.history.push(this.currentId); this.currentId=s.next;
    return {ok:true,scene:this.scene};
  }
  submit(value) {
    const s = this.scene;
    if (!['puzzle','minigame'].includes(s.type)) return {ok:false,reason:'not-a-puzzle'};
    const p = this.puzzles[s.puzzleId];
    if(s.type==='minigame'&&p.completionMode==='result')return {ok:false,reason:'game-clear-required'};
    if(p.requiresGameClear&&!isMinigameClear(this.minigameResults[s.puzzleId],p))return {ok:false,reason:'game-clear-required'};
    if(p.repairFlag&&this.flags[p.repairFlag])return {ok:false,reason:'already-repaired'};
    if(p.repairFlag&&typeof value!=='string')return {ok:false,reason:'incorrect'};
    if(p.answerMode==='icons'){
      const state=this.getIconState();
      if(state.completed)return {ok:false,reason:'already-completed'};
      const result=submitIcons(state);this.puzzleStates[s.puzzleId]=result;
      if(!result.pendingSuccess)return {ok:false,reason:result.selectedIds.length===4?'incorrect':'count-required'};
      if(!this.pendingSuccess)this.pendingSuccess=this.createPendingSuccess();
      return {ok:true,reason:'correct'};
    }
    const normalize=p.answerMode==='english-three'?normalizeArtAnswer:p.answerMode==='numeric-string'?normalizeNumericAnswer:normalizeAnswer;
    const answer=normalize(value);
    if (!answer) return {ok:false,reason:'empty'};
    if (!p.acceptedAnswers?.length) return {ok:false,reason:'not-configured'};
    if ((p.answerMode==='english-three'&&!/^[a-z]{3}$/u.test(answer)) || !p.acceptedAnswers.some(a => normalize(a) === answer)) {
      return {ok:false,reason:'incorrect'};
    }
    if(this.pendingSuccessId!==s.id)this.pendingSuccess=this.createPendingSuccess();
    return {ok:true,reason:'correct'};
  }
  confirmSuccess() {
    if(this.pendingSuccessId!==this.currentId)return {ok:false,reason:'no-pending-success'};
    const pending=this.pendingSuccess;
    if(!pending.nextSceneId)return {ok:false,reason:'end-of-preview'};
    if(this.puzzles[pending.puzzleId]?.answerMode==='icons'){
      const state=this.getIconState();
      if(!isCorrectSelection(state.boardIds,state.selectedIds))return {ok:false,reason:'incorrect'};
      this.puzzleStates[pending.puzzleId]=confirmIcons(state);
    }
    this.solved.add(pending.puzzleId);
    Object.assign(this.flags,this.scene.onSuccess||{});
    this.pendingSuccess=null;
    this.history.push(this.currentId);this.currentId=pending.nextSceneId;
    return {ok:true,scene:this.scene};
  }
  jump(id) {
    if (!this.index.has(id)) return false;
    this.clearPending();this.currentId=id; this.history=[]; return true;
  }
  back() {
    if (!this.history.length) return false;
    this.clearPending();this.currentId=this.history.pop();return true;
  }
  reset() { this.currentId=this.scenes[0].id;this.solved.clear();this.history=[];this.pendingSuccess=null;this.puzzleStates={};this.minigameResults={};this.flags={};this.sceneStates={};this.runId=newRunId(); }
}
