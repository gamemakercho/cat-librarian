// 화면 문구/표정/순서는 여기서 수정합니다. 렌더러는 바꾸지 않아도 됩니다.
// sourceNumber: 사용자가 제공한 1~24번 시안과 연결하는 번호.
export const STORY_VERSION = 'opening-source-24-art-guide-v7-20261014';
export const locations = {
  learning:{name:'평생학습실(강의실1)',markerNumber:1},
  infant:{name:'유아자료실',markerNumber:2},
  sterilizer:{name:'책소독기',markerNumber:3},
  general:{name:'종합자료실',markerNumber:4}
};
export const uiText = {
  arrivalQuestion:'도착했어?', arrivedLabel:'도착했지!', lostLabel:'못 찾겠어…',
  locationHintTitle:'아직 못 찾았구나?', moreHintLabel:'힌트 하나 더', closeHintLabel:'다시 찾아볼게!',
  successPopup:{title:'정답이야!', body:'잘했어!\n다음 장소로 가보자!', buttonLabel:'다음으로', cat:'happy', tone:'gold'}
};
export const chapters = [{ id: 'opening', title: '고양이가 된 사서', scenes: [
  { id: 'opening-title', sourceNumber: 1, type: 'title', background: 'meeting', cat: 'neutral',
    title: '고양이가 된 사서', titleLines:['고양이가 된','사서'], startLabel:'터치해서 시작', next: 'guide-structure' },
  { id:'guide-structure',sourceNumber:null,type:'tutorial',background:'meeting',cat:'neutral',
    location:'게임 안내 1 / 2',title:'어떤 게임일까?',textMode:'static',
    guideCards:[
      {title:'이야기를 따라가요',body:'고양이 사서의 이야기를 읽고,\n안내하는 장소를 찾아가는 게임이에요.'},
      {title:'도서관에서 단서를 찾아요',body:'번호가 있는 고양이 마크를 찾고,\n실제 엽서와 안내문을 살펴봐요.'},
      {title:'문제를 풀면 이야기가 이어져요',body:'현장에서 찾은 단서로 답을 맞히면\n다음 이야기와 장소로 이어져요.'}
    ],
    guideNote:'이동할 때는 휴대폰을 잠시 내려놓아요.',next:'guide-play',
    geometry:{cat:[195,153,110,110],tutorialPanel:[32,280,436,493],nextButton:[155,799,194,63]} },
  { id:'guide-play',sourceNumber:null,type:'tutorial',background:'meeting',cat:'neutral',
    location:'게임 안내 2 / 2',title:'이렇게 플레이해요',textMode:'static',
    guideCards:[
      {title:'대사와 이동',body:'대사는 ‘다음’으로 넘겨요.\n장소에 도착하면 ‘도착했지!’를 눌러요.'},
      {title:'정답 입력',body:'답을 입력하고 확인 버튼을 눌러요.\n정답 팝업에서 ‘다음으로’를 눌러요.'},
      {title:'막히면 힌트를 봐요',body:'장소를 못 찾으면 ‘못 찾겠어…’,\n문제가 어려우면 ‘힌트 보기’를 눌러요.'}
    ],
    guideNote:'같은 기기·브라우저에서 이어서 할 수 있어요.',nextLabel:'이야기 시작!',next:'opening-busy',
    geometry:{cat:[195,153,110,110],tutorialPanel:[32,280,436,493],nextButton:[130,799,244,63]} },
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
    text: '나도 오늘 처음 고양이가 됐거든', next: 'lobby-transition' },
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
    text: '내 사회생활이 실시간으로 끝나\n가고 있어', next: 'lobby-wake-plan' },
  { id: 'lobby-wake-plan', sourceNumber: 20, type: 'dialogue', background: 'lobby-sleeping', location: '도서관 로비',
    cat: 'resigned', layout: 'side', dim: true,
    text: '일단 자고 있는 녀석을 깨워야 할\n것 같아. 책으로 톡톡 쳐볼까?', next: 'lobby-postcard' },
  { id: 'lobby-postcard', sourceNumber: 21, type: 'puzzle', background: 'lobby-sleeping', location: '도서관 로비',
    puzzleId: 'postcard-heading', illustration: 'postcard',
    text: '가지고 있는 엽서를 활용해서\n자고 있는 고양이(?)를 깨우자',
    instruction: '엽서 상단에 있는 글을 그대로 입력해주세요\n(12글자, 물음표 제외, 띄어쓰기 상관 없음)', next: 'lobby-escape' },
  { id: 'lobby-escape', sourceNumber: 22, type: 'dialogue', background: 'lobby', location: locations.learning.name,
    cat: 'bewildered', layout: 'side',
    text: '다행히 데스크에서 깨우는데\n성공했는데, 갑자기 평생학습실\n쪽으로 뛰어가버렸네',
    emphasis: ['평생학습실'], next: 'learning-marker' },
  { id: 'learning-marker', sourceNumber: 23, type: 'move', background: 'lobby', location: locations.learning.name,
    cat: 'neutral', layout: 'move', marker: true, markerNumber:locations.learning.markerNumber,
    destination:locations.learning.name,
    guideText:'{destination} 앞으로 가 보자!\n문 앞의 고양이 마크 {markerNumber}을 찾아주세요.',
    locationHints:[
      '1층에서 ‘{destination}’이라고 적힌 문을 찾아보세요. 문 앞의 고양이 마크 {markerNumber}이 도착 표시예요.'
    ],
    emphasis:[locations.learning.name,'01'], next: 'learning-intro' },
  { id:'learning-intro', sourceNumber:null, type:'dialogue', background:'learning-clean', location:locations.learning.name,
    cat:'neutral', layout:'arrival', text:'여기는 어린이부터 어른까지\n새로운 걸 배우는 곳이야.', next:'learning-paint',
    geometry:{cat:[38,391,145,154],dialogue:[32,548,436,210]} },
  { id: 'learning-paint', sourceNumber: 24, type: 'dialogue', background: 'learning-paint', location: locations.learning.name,
    cat: 'bewildered', layout: 'arrival',
    text: '평생학습실 바닥이 물감자국..\n저거 내 몸으로 한 거야', next: 'learning-room-art' },
  { id:'learning-room-art', sourceNumber:null, type:'puzzle', puzzleId:'learning-room-art', background:'learning-paint',
    location:locations.learning.name, cat:'neutral', layout:'art',
    decoration:'paint-marks',
    text:'엽서를 활용해 물감 자국을 완성하면\n무슨 글자가 보이는 것 같아.',
    instruction:'영어 3자리(소문자)',next:'learning-room-trail',
    geometry:{cat:[40,175,140,154],dialogue:[32,340,436,235],answerForm:[29,595,442,230]} },
  { id:'learning-room-trail',sourceNumber:null,type:'dialogue',background:'learning-paint',location:locations.learning.name,
    cat:'bewildered',layout:'arrival',text:'주황색이랑 초록색 자국이\n유아자료실로 이어져!',next:'infant-marker',
    geometry:{cat:[38,391,145,154],dialogue:[32,548,436,210]} },
  { id:'infant-marker',sourceNumber:null,type:'move',background:'learning-paint',location:locations.infant.name,
    cat:'neutral',layout:'move',marker:true,markerNumber:locations.infant.markerNumber,destination:locations.infant.name,
    guideText:'{destination}로 이동해 주세요.\n고양이 마크 {markerNumber}를 찾아주세요.',
    locationHints:['‘{destination}’이라고 적힌 안내와 고양이 마크 {markerNumber}를 찾아보세요.'],next:'opening-continuation' },
  { id: 'opening-continuation', sourceNumber: null, type: 'continuation', background: 'learning-paint',
    cat: 'neutral', location: locations.infant.name, layout: 'arrival',
    text: '초반부는 여기까지입니다.\n후속 장면은 준비 중입니다.', next: null }
]}];

// 첫 엽서 답은 확정값입니다. 23번은 현장 마크를 찾는 이동/도착 확인으로 변경했습니다.
// 도착 확인과 제작자 장면 이동은 퍼즐 정답 성공 기록을 만들지 않습니다.
export const puzzles = {
  'postcard-heading': {
    status: 'confirmed', acceptedAnswers: ['고양이와 사서가 뒤바뀌었다'],
    placeholder: '엽서 상단 문구',
    hints: ['화면 속 그림이 아니라, 가지고 있는 실제 엽서를 살펴보세요.',
      '엽서 가장 위에 적힌 문장을 입력해요. 물음표·느낌표와 띄어쓰기는 빼도 돼요.'],
    missing: '',
    successPopup:{title:'정답이야!', body:'잘했어!\n다음 이야기를 이어가 보자!', buttonLabel:'다음으로', cat:'happy', tone:'gold'}
  },
  'learning-room-art':{
    status:'confirmed',answerMode:'english-three',acceptedAnswers:['art'],placeholder:'소문자 3자리',
    answerLabel:'영어 3자리(소문자)',ariaLabel:'정답: 영어 3자리, 소문자',checkLabel:'정답 확인',
    hints:['네 컷 만화가 있는 면에서 네 귀퉁이의 물감 모양을 찾아보세요.',
      '같은 색과 모양끼리 맞대세요. 엽서 아래쪽의 글자 조각이 이어져요.'],
    incorrectMessage:'조금만 다시 볼까? 아래쪽에 이어진 영어를 확인해 봐.',missing:'',
    successPopup:{title:'찾아냈다!',body:'엽서와 안내문이 딱 맞았네!',buttonLabel:'다음으로',cat:'happy',tone:'mint'}
  }
};

export const sourceScenes = chapters.flatMap(c => c.scenes).filter(s => s.sourceNumber);

// 원본 500×900 좌표. 장면별 배치·색·서체도 이 파일에서 수정합니다.
export const palette = { cream:'#fff8df', blue:'#d1eff0', yellow:'#f3df68', pink:'#fac3c3' };
export const baseGeometry = {
  dialogue:[32,436,436,210], nextButton:[155,684,194,63],
  locationBanner:[31,64,438,81], answerForm:[29,672,442,100],
  cat:[173,225,162,194], sleeping:[154,226,198,148], staff:[315,217,150,221],
  comic:[10,98,480,320], marker:[193,251,227,244], movementControls:[32,625,436,190],
  tutorialPanel:[32,280,436,493]
};
export const movementGeometry = {
  cat:[43,377,135,152], dialogue:[32,167,436,195], marker:[205,370,225,225], movementControls:[32,625,436,190]
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
  22:{cat:[40,284,140,148]},
  24:{cat:[38,391,145,154], dialogue:[32,548,436,210]}
};
for (const scene of chapters.flatMap(c=>c.scenes)) {
  scene.geometry={...baseGeometry,...(scene.type==='move'?movementGeometry:{}),...overrides[scene.sourceNumber],...scene.geometry};
  scene.fontSize=scene.layout==='art'?26:30;
  scene.lineHeight=1.48;
  // These source sprites face left. Speakers in the left slot face inward.
  scene.flipCat=scene.geometry.cat[0]<125;
  scene.backgroundFrame=scene.background==='lobby-sleeping'?'sleeping':scene.background==='lobby'?'empty':'normal';
  scene.dimOpacity=scene.dim ? 0.24 : 0;
  scene.backgroundOpacity=scene.background==='meeting'?0.78:(scene.dim?0.74:0.93);
  scene.nextLabel??='다음';
  if(scene.sourceNumber===21){scene.fontSize=33;scene.lineHeight=1.35;}
  if(scene.type==='move'){scene.fontSize=24;scene.lineHeight=1.5;scene.textMode='static';}
}
