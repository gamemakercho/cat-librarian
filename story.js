// 화면 문구/표정/순서는 여기서 수정합니다. 렌더러는 바꾸지 않아도 됩니다.
// sourceNumber: 사용자가 제공한 1~24번 시안과 연결하는 번호.
export const STORY_VERSION = 'opening-source-24-v4-20261013';
export const chapters = [{ id: 'opening', title: '고양이가 된 사서', scenes: [
  { id: 'opening-title', sourceNumber: 1, type: 'title', background: 'meeting', cat: 'neutral',
    title: '고양이가 된 사서', titleLines:['고양이가 된','사서'], startLabel:'터치해서 시작', next: 'opening-busy' },
  { id: 'opening-busy', sourceNumber: 2, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    layout: 'meet', text: '혹시 오늘 바빠?', next: 'opening-speaking-cat' },
  { id: 'opening-speaking-cat', sourceNumber: 3, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    layout: 'meet', text: '말하는 고양이는 처음 보지?', next: 'opening-librarian' },
  { id: 'opening-librarian', sourceNumber: 4, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    layout: 'meet', text: '나는 사실 이 도서관 사서야', next: 'opening-memory' },
  { id: 'opening-memory', sourceNumber: 5, type: 'dialogue', background: null, textGroup:'morning-memory',
    text: '오늘 아침에도 평소처럼 도서관\n에 출근 중이었어', next: 'opening-comic-1' },
  ...[6,7,8,9].map((number, i) => ({
    id: `opening-comic-${i+1}`, sourceNumber: number, type: 'comic', background: null,
    comic: i+1, textGroup:'morning-memory', textMode:'static', text: '오늘 아침에도 평소처럼 도서관\n에 출근 중이었어',
    effect: number === 9 ? 'collision' : null,
    next: number === 9 ? 'opening-swapped' : `opening-comic-${i+2}`
  })),
  { id: 'opening-swapped', sourceNumber: 10, type: 'dialogue', background: 'meeting', cat: 'bewildered',
    text: '그 후 눈을 떴더니, 내가 고양이\n몸 속에 들어와 있지 뭐야!\n그리고 고양이가 내 몸 속에 들어\n간 것 같아', next: 'opening-paws' },
  { id: 'opening-paws', sourceNumber: 11, type: 'dialogue', background: 'meeting', cat: 'bewildered',
    text: '내 몸에 들어간 녀석은 계속 사고\n를 치고 다니는데, 이 고양이 손으\n로는 책도 꽂을 수가 없어', next: 'opening-help' },
  { id: 'opening-help', sourceNumber: 12, type: 'dialogue', background: 'meeting', cat: 'excited',
    text: '그래서 말인데...\n네가 날 좀 도와주지 않을래?', next: 'opening-first-time' },
  { id: 'opening-first-time', sourceNumber: 13, type: 'dialogue', background: 'meeting', cat: 'shocked',
    text: '뭐? 도서관 일은 처음이라고?', next: 'opening-perfect' },
  { id: 'opening-perfect', sourceNumber: 14, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    text: '완벽하네', next: 'opening-first-cat' },
  { id: 'opening-first-cat', sourceNumber: 15, type: 'dialogue', background: 'meeting', cat: 'resigned',
    text: '완벽하네\n나도 오늘 처음 고양이가 됐거든', next: 'lobby-transition' },
  { id: 'lobby-transition', sourceNumber: 16, type: 'dialogue', background: null, location: '도서관 로비',
    text: '내 몸을 가진 저 고양이가 도서관\n을 다 망쳐버리기 전에 잡아야 해', next: 'lobby-staff' },
  { id: 'lobby-staff', sourceNumber: 17, type: 'dialogue', background: 'lobby-sleeping', location: '도서관 로비',
    staff: true, speaker: '직원', panelTone: 'blue',
    text: '선생님... 왜 데스크 위에 올라가\n계세요?', next: 'lobby-see' },
  { id: 'lobby-see', sourceNumber: 18, type: 'dialogue', background: 'lobby-sleeping', location: '도서관 로비',
    cat: 'resigned', layout: 'side', dim: true,
    text: '봤지?', next: 'lobby-social-life' },
  { id: 'lobby-social-life', sourceNumber: 19, type: 'dialogue', background: 'lobby-sleeping', location: '도서관 로비',
    cat: 'resigned', layout: 'side', dim: true,
    text: '내 사회생활이 실시간으로 끝나\n고 있어', next: 'lobby-wake-plan' },
  { id: 'lobby-wake-plan', sourceNumber: 20, type: 'dialogue', background: 'lobby-sleeping', location: '도서관 로비',
    cat: 'resigned', layout: 'side', dim: true,
    text: '일단 자고 있는 녀석을 깨워야 할\n것 같아. 책으로 톡톡 쳐볼까?', next: 'lobby-postcard' },
  { id: 'lobby-postcard', sourceNumber: 21, type: 'puzzle', background: 'lobby-sleeping', location: '도서관 로비',
    puzzleId: 'postcard-heading', illustration: 'postcard',
    text: '가지고 있는 엽서를 활용해서\n자고 있는 고양이(?)를 깨우자',
    instruction: '엽서 상단에 있는 글을 그대로 입력해주세요\n(물음표제외, 띄어쓰기 상관 없음)', next: 'lobby-escape' },
  { id: 'lobby-escape', sourceNumber: 22, type: 'dialogue', background: 'lobby', location: '도서관 로비',
    cat: 'bewildered', layout: 'side',
    text: '다행히 데스크에서 깨우는데\n성공했는데, 갑자기 평생학습실\n쪽으로 뛰어가버렸네',
    emphasis: ['평생학습실'], next: 'learning-marker' },
  { id: 'learning-marker', sourceNumber: 23, type: 'puzzle', background: 'lobby', location: '도서관 로비',
    cat: 'bewildered', layout: 'side', puzzleId: 'learning-marker', marker: true,
    text: '따라가보자!\n평생학습실 앞에 도착했다면\n문 앞에 있는 고양이 마크 옆에\n쓰여있는 글자를 적어줘',
    emphasis: ['평생학습실','고양이 마크'], next: 'learning-paint' },
  { id: 'learning-paint', sourceNumber: 24, type: 'dialogue', background: 'learning-paint', location: '평생학습실',
    cat: 'bewildered', layout: 'arrival',
    text: '평생학습실 바닥이 물감자국..\n저거 내 몸으로 한 거야', next: 'opening-continuation' },
  { id: 'opening-continuation', sourceNumber: null, type: 'continuation', background: 'learning-paint',
    cat: 'bewildered', location: '평생학습실', layout: 'arrival',
    text: '초반부는 여기까지입니다.\n후속 장면은 준비 중입니다.', next: null }
]}];

// 원본 24장의 시나리오를 우선합니다. 첫 엽서 답은 확정값으로 설정했습니다. 23번 현장 마크 답만 비워 두었습니다.
// 제작자 보기에서 장면 이동으로 우회하는 것은 정답 성공 처리와 다릅니다.
export const puzzles = {
  'postcard-heading': {
    status: 'confirmed', acceptedAnswers: ['고양이와 사서가 뒤바뀌었다'],
    placeholder: '엽서 상단 문구',
    hints: ['화면 속 그림이 아니라, 가지고 있는 실제 엽서를 살펴보세요.',
      '엽서 가장 위에 적힌 문장을 입력해요. 물음표·느낌표와 띄어쓰기는 빼도 돼요.'],
    missing: ''
  },
  'learning-marker': {
    status: 'needs-confirmation', acceptedAnswers: [],
    placeholder: '고양이 마크 옆 글자',
    hints: ['실제 평생학습실 문 앞에서 고양이 마크를 찾아보세요.',
      '그 마크 옆에 적힌 글자를 입력해요. 화면에 보이는 장소 이름을 입력하는 문제가 아니에요.'],
    missing: '현장에 설치할 고양이 마크 옆의 실제 글자를 확정해야 합니다.'
  }
};

export const sourceScenes = chapters.flatMap(c => c.scenes).filter(s => s.sourceNumber);

// 원본 500×900 좌표. 장면별 배치·색·서체도 이 파일에서 수정합니다.
export const palette = { cream:'#fff8df', blue:'#d1eff0', yellow:'#f3df68', pink:'#fac3c3' };
export const baseGeometry = {
  dialogue:[32,436,436,210], nextButton:[155,684,194,63],
  locationBanner:[31,64,438,81], answerForm:[29,672,442,100],
  cat:[173,225,162,194], sleeping:[154,226,198,148], staff:[315,217,150,221],
  comic:[10,98,480,320], marker:[193,251,227,244]
};
const overrides = {
  1:{cat:[181,500,140,136]},
  2:{cat:[185,284,130,140], nextButton:[155,779,194,63]},
  3:{cat:[185,284,130,140], nextButton:[155,779,194,63]},
  4:{cat:[185,284,130,140], nextButton:[155,779,194,63]},
  12:{cat:[174,250,145,172]}, 13:{cat:[185,244,145,180]},
  14:{cat:[185,284,130,140]}, 15:{cat:[180,280,137,145]},
  18:{cat:[40,284,140,148]}, 19:{cat:[40,284,140,148]}, 20:{cat:[40,284,140,148]},
  21:{dialogue:[32,167,436,479]},
  22:{cat:[40,284,140,148]}, 23:{cat:[40,284,140,148]},
  24:{cat:[38,391,145,154], dialogue:[32,548,436,210]}
};
for (const scene of chapters.flatMap(c=>c.scenes)) {
  scene.geometry={...baseGeometry,...overrides[scene.sourceNumber]};
  scene.fontSize=30;
  scene.lineHeight=1.48;
  scene.flipCat=[18,19,20].includes(scene.sourceNumber);
  scene.backgroundFrame=scene.background==='lobby-sleeping'?'sleeping':scene.background==='lobby'?'empty':'normal';
  scene.dimOpacity=scene.dim ? 0.24 : 0;
  scene.backgroundOpacity=scene.background==='meeting'?0.78:(scene.dim?0.74:0.93);
  scene.nextLabel='다음';
  if(scene.sourceNumber===21){scene.fontSize=33;scene.lineHeight=1.35;}
}
