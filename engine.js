export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFC').replace(/[\s?？!！]/gu, '').toLowerCase();
}

export function normalizeArtAnswer(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s/gu, '').toLowerCase();
}

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
    if (scene.type === 'puzzle' && !puzzles[scene.puzzleId]) throw new Error(`없는 문제: ${scene.puzzleId}`);
  }
  return scenes;
}

export class StoryRuntime {
  constructor(chapters, puzzles, snapshot = {}, successDefaults = {}) {
    this.scenes = validateStory(chapters, puzzles);
    this.index = new Map(this.scenes.map(s => [s.id, s]));
    this.puzzles = puzzles;
    this.successDefaults = successDefaults;
    this.currentId = this.index.has(snapshot.currentId) ? snapshot.currentId : this.scenes[0].id;
    this.solved = new Set((snapshot.solved ?? []).filter(id => puzzles[id]?.acceptedAnswers?.length));
    this.history = (snapshot.history ?? []).filter(id => this.index.has(id)).slice(-200);
    this.pendingSuccess = null;
    const pending = snapshot.pendingSuccess;
    if (this.scene.type==='puzzle' && pending?.fromSceneId===this.currentId && pending.puzzleId===this.scene.puzzleId) {
      this.pendingSuccess = {...pending, nextSceneId:this.index.has(pending.nextSceneId)?pending.nextSceneId:this.scene.next};
    } else if (snapshot.pendingSuccessId===this.currentId && this.scene.type==='puzzle' && this.solved.has(this.scene.puzzleId)) {
      // v3/v5 saved a solved record before the popup was confirmed.
      this.pendingSuccess = this.createPendingSuccess();
    }
    if(this.pendingSuccess)this.solved.delete(this.pendingSuccess.puzzleId);
    this.lastResult = null;
  }
  get scene() { return this.index.get(this.currentId); }
  get pendingSuccessId() { return this.pendingSuccess?.fromSceneId ?? null; }
  createPendingSuccess() {
    const s=this.scene;
    return {fromSceneId:s.id,nextSceneId:s.next,puzzleId:s.puzzleId,
      popup:{...this.successDefaults,...this.puzzles[s.puzzleId]?.successPopup,...s.successPopup}};
  }
  snapshot() { return { currentId: this.currentId, solved: [...this.solved], history: this.history, pendingSuccessId:this.pendingSuccessId, pendingSuccess:this.pendingSuccess }; }
  advance({ review = false, arrived = false } = {}) {
    const s = this.scene;
    if(this.pendingSuccessId===s.id&&!review)return {ok:false,reason:'success-confirmation-required'};
    if (s.type === 'puzzle' && !this.solved.has(s.puzzleId) && !review) return {ok:false,reason:'answer-required'};
    if (s.type === 'move' && !arrived && !review) return {ok:false,reason:'arrival-required'};
    if (!s.next) return {ok:false,reason:'end-of-preview'};
    this.pendingSuccess=null;
    this.history.push(this.currentId); this.currentId=s.next;
    return {ok:true,scene:this.scene};
  }
  submit(value) {
    const s = this.scene;
    if (s.type !== 'puzzle') return {ok:false,reason:'not-a-puzzle'};
    const p = this.puzzles[s.puzzleId];
    const normalize=p.answerMode==='english-three'?normalizeArtAnswer:normalizeAnswer;
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
    this.solved.add(pending.puzzleId);
    this.pendingSuccess=null;
    this.history.push(this.currentId);this.currentId=pending.nextSceneId;
    return {ok:true,scene:this.scene};
  }
  jump(id) {
    if (!this.index.has(id)) return false;
    this.currentId=id; this.history=[];this.pendingSuccess=null; return true;
  }
  back() {
    if (!this.history.length) return false;
    this.currentId=this.history.pop();this.pendingSuccess=null;return true;
  }
  reset() { this.currentId=this.scenes[0].id;this.solved.clear();this.history=[];this.pendingSuccess=null; }
}
