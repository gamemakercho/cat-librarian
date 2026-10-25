// 행사에 맞게 이 파일과 layout.json을 수정하세요.
export const CONFIG = {
  gameId: 'library-bookband-reshelve-v2',
  storageKey: 'bookband:library-bookband-reshelve-v2:v1',
  correctOrder: ['000','100','200','300','400','500','600','700','800','900'],
  dragThresholdCss: 7,
  completionDelayMs: 1400,
  nextUrl: '',
  // (detail) => { ... } 또는 window.onGameComplete(detail)로 연결합니다.
  onGameComplete: null,
  text: {
    title: '책을 올바른 순서로 제자리에!',
    subtitle: '실제 서가의 책띠를 살펴보세요',
    sign: '신간도서 코너',
    start: '사서가 어지른 책을 정리해 주세요! 실제 서가의 책띠를 살펴보고, 책 10권을 왼쪽부터 올바른 순서로 꽂아 주세요.',
    footer: '끌어서 꽂기 · 찬 자리에는 밀어 넣기',
    incorrect: '아직 순서가 맞지 않아요',
    complete: '클리어!'
  }
};

if(globalThis.CatStoryBridge?.embedded){const run=globalThis.CatStoryBridge.runId;CONFIG.gameId+=':'+run;CONFIG.storageKey+=':'+run;CONFIG.nextUrl='';CONFIG.text.subtitle='현장의 십진분류표와 책띠를 살펴보세요';CONFIG.text.start='현장의 십진분류표와 책띠 색·분류명을 보고 열 권을 주제 순서대로 정리해 주세요. 책을 끌거나, 책과 자리를 차례로 눌러 꽂아요.';}
