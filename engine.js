export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFC').replace(/[\s?？!！]/gu, '').toLowerCase();
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
  constructor(chapters, puzzles, snapshot = {}) {
    this.scenes = validateStory(chapters, puzzles);
    this.index = new Map(this.scenes.map(s => [s.id, s]));
    this.puzzles = puzzles;
    this.currentId = this.index.has(snapshot.currentId) ? snapshot.currentId : this.scenes[0].id;
    this.solved = new Set((snapshot.solved ?? []).filter(id => puzzles[id]?.acceptedAnswers?.length));
    this.history = (snapshot.history ?? []).filter(id => this.index.has(id)).slice(-200);
    this.lastResult = null;
  }
  get scene() { return this.index.get(this.currentId); }
  snapshot() { return { currentId: this.currentId, solved: [...this.solved], history: this.history }; }
  advance({ review = false, arrived = false } = {}) {
    const s = this.scene;
    if (s.type === 'puzzle' && !this.solved.has(s.puzzleId) && !review) return {ok:false,reason:'answer-required'};
    if (s.type === 'move' && !arrived && !review) return {ok:false,reason:'arrival-required'};
    if (!s.next) return {ok:false,reason:'end-of-preview'};
    this.history.push(this.currentId); this.currentId=s.next;
    return {ok:true,scene:this.scene};
  }
  submit(value) {
    const s = this.scene;
    if (s.type !== 'puzzle') return {ok:false,reason:'not-a-puzzle'};
    if (!normalizeAnswer(value)) return {ok:false,reason:'empty'};
    const p = this.puzzles[s.puzzleId];
    if (!p.acceptedAnswers?.length) return {ok:false,reason:'not-configured'};
    if (!p.acceptedAnswers.some(a => normalizeAnswer(a) === normalizeAnswer(value))) {
      return {ok:false,reason:'incorrect'};
    }
    this.solved.add(s.puzzleId);
    return {ok:true,reason:'correct'};
  }
  jump(id) {
    if (!this.index.has(id)) return false;
    this.currentId=id; this.history=[]; return true;
  }
  back() {
    if (!this.history.length) return false;
    this.currentId=this.history.pop();return true;
  }
  reset() { this.currentId=this.scenes[0].id;this.solved.clear();this.history=[]; }
}
