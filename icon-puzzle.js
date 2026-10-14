// 승인된 14아이콘 문제의 순수 규칙. 배치와 선택은 StoryRuntime이 함께 저장한다.
export const PUZZLE_ID = 'infant-room-icons-14';
export const STATE_VERSION = 1;
export const CORRECT_IDS = Object.freeze([
  'rule_food_water', 'rule_book_cart', 'rule_quiet_walk', 'rule_guardian',
]);
export const DISTRACTOR_IDS = Object.freeze([
  'action_baseball', 'action_painting', 'action_watering', 'action_jigsaw',
  'action_origami', 'object_camera', 'object_rocket', 'object_umbrella',
  'object_bicycle', 'object_gift',
]);
const ALL_IDS = new Set([...CORRECT_IDS, ...DISTRACTOR_IDS]);
const CORRECT_SET = new Set(CORRECT_IDS);

export function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const random = rng();
    if (!Number.isFinite(random) || random < 0 || random >= 1) {
      throw new RangeError('rng must return a number in [0, 1)');
    }
    const j = Math.floor(random * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createBoard(rng = Math.random) {
  const sampled = shuffle(DISTRACTOR_IDS, rng).slice(0, 5);
  return shuffle([...CORRECT_IDS, ...sampled], rng);
}

export function isValidBoard(boardIds) {
  return Array.isArray(boardIds)
    && boardIds.length === 9
    && new Set(boardIds).size === 9
    && boardIds.every(id => ALL_IDS.has(id))
    && CORRECT_IDS.every(id => boardIds.includes(id));
}

export function isCorrectSelection(boardIds, selectedIds) {
  return isValidBoard(boardIds)
    && Array.isArray(selectedIds)
    && selectedIds.length === 4
    && new Set(selectedIds).size === 4
    && selectedIds.every(id => CORRECT_SET.has(id));
}

export function initializePuzzle(saved = null, rng = Math.random) {
  const restorable = saved?.puzzleId === PUZZLE_ID
    && saved?.version === STATE_VERSION
    && isValidBoard(saved?.boardIds);
  if (!restorable) {
    return {
      puzzleId: PUZZLE_ID, version: STATE_VERSION,
      boardIds: createBoard(rng), selectedIds: [],
      pendingSuccess: false, completed: false, successText: null, feedback: null,
    };
  }
  const selectedIds = [...new Set(Array.isArray(saved.selectedIds) ? saved.selectedIds : [])]
    .filter(id => saved.boardIds.includes(id)).slice(0, 4);
  const correct = isCorrectSelection(saved.boardIds, selectedIds);
  const completed = correct && Boolean(saved.completed);
  const pendingSuccess = correct && !completed && Boolean(saved.pendingSuccess);
  return {
    puzzleId: PUZZLE_ID, version: STATE_VERSION,
    boardIds: [...saved.boardIds], selectedIds,
    pendingSuccess, completed,
    successText: pendingSuccess ? (saved.successText || '와! 맞았어!') : null,
    feedback: null,
  };
}

export function toggleSelection(state, iconId) {
  if (state.completed || state.pendingSuccess || !state.boardIds.includes(iconId)) return state;
  if (state.selectedIds.includes(iconId)) {
    return { ...state, selectedIds: state.selectedIds.filter(id => id !== iconId), feedback: null };
  }
  if (state.selectedIds.length >= 4) {
    return { ...state, feedback: '네 칸까지 고를 수 있어. 바꾸려면 선택한 그림을 다시 눌러 줘.' };
  }
  return { ...state, selectedIds: [...state.selectedIds, iconId], feedback: null };
}

export function submitAnswer(state) {
  if (state.completed || state.pendingSuccess) return state;
  if (state.selectedIds.length !== 4) {
    return { ...state, feedback: '그림 네 칸을 골라 주세요.' };
  }
  if (!isCorrectSelection(state.boardIds, state.selectedIds)) {
    return { ...state, feedback: '조금만 다시 볼까? 안내문의 네 가지 내용과 맞춰 봐.' };
  }
  return { ...state, pendingSuccess: true, successText: '와! 맞았어!', feedback: null };
}

export function confirmSuccess(state) {
  if (!state.pendingSuccess || !isCorrectSelection(state.boardIds, state.selectedIds)) return state;
  return { ...state, pendingSuccess: false, completed: true, successText: null };
}
