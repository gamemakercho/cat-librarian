// 화면 문구/표정/순서는 여기서 수정합니다. 렌더러는 바꾸지 않아도 됩니다.
// sourceNumber: 사용자가 제공한 1~24번 시안과 연결하는 번호.
import {iconCatalog} from './icon-catalog.js';
import {createGeneralScenes,generalPuzzles} from './general-course.js';
import {normalizeCourseOptions} from './course-config.js';
export const STORY_VERSION = 'opening-source-24-result-games-v13-20261015';
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
const followDialogueGeometry={cat:[38,345,145,154],dialogue:[32,515,436,230],nextButton:[138,790,224,63]};
const followMovementGeometry={dialogue:[32,158,436,250],cat:[43,428,135,152],marker:[205,425,225,225],movementControls:[32,685,436,180]};
const openingChapters = [{ id: 'opening', title: '고양이가 된 사서', scenes: [
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
    layout: 'meet', text: '안녕?', next: 'opening-speaking-cat' },
  { id: 'opening-speaking-cat', sourceNumber: 3, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    layout: 'meet', text: '말하는 고양이는 처음 보지?', next: 'opening-librarian' },
  { id: 'opening-librarian', sourceNumber: 4, type: 'dialogue', background: 'meeting', cat: 'disappointed',
    layout: 'meet', text: '나는 사실 이 도서관 사서야', next: 'opening-memory' },
  { id: 'opening-memory', sourceNumber: 5, type: 'dialogue', background: null, textGroup:'morning-memory',
    text: '오늘 아침에도 평소처럼 도서관에\n출근 중이었어', next: 'opening-comic-1' },
  ...[6,7,8,9].map((number, i) => ({
    id: `opening-comic-${i+1}`, sourceNumber: number, type: 'comic', background: null,
    comic: i+1, textGroup:'morning-memory', textMode:'static', text: '오늘 아침에도 평소처럼 도서관에\n출근 중이었어',
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
    text: '일단 자고 있는 녀석을 깨워야 할\n것 같아 책으로 톡톡 쳐볼까?', next: 'lobby-postcard' },
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
    guideText:'{destination} 앞으로 가 보자!\n문 앞의 고양이 마크 {markerNumber}을 찾아주세요',
    locationHints:[
      '1층에서 ‘{destination}’이라고 적힌 문을 찾아보세요. 문 앞의 고양이 마크 {markerNumber}이 도착 표시예요.'
    ],
    emphasis:[locations.learning.name,'01'], next: 'learning-intro' },
  { id:'learning-intro', sourceNumber:null, type:'dialogue', background:'learning-clean', location:locations.learning.name,
    cat:'neutral', layout:'arrival',fontSize:30,
    text:'여기는 어린이부터 어른까지\n즐길 수 있는 유익하고 재미있는\n프로그램을 운영하는 장소야',next:'learning-paint',
    geometry:{cat:[38,345,145,154],dialogue:[32,515,436,240],nextButton:[155,790,194,63]} },
  { id: 'learning-paint', sourceNumber: 24, type: 'dialogue', background: 'learning-paint', location: locations.learning.name,
    cat: 'bewildered', layout: 'arrival',
    text: '평생학습실 바닥의 물감자국..?', next: 'learning-room-art' },
  { id:'learning-room-art', sourceNumber:null, type:'puzzle', puzzleId:'learning-room-art', background:'learning-paint',
    location:locations.learning.name, cat:'neutral', layout:'art',
    decoration:'paint-marks',
    text:'엽서를 활용해 물감 자국을 완성하면\n무슨 글자가 보이는 것 같아',
    instruction:'영어 3자리(소문자)',next:'learning-room-trail',
    geometry:{cat:[40,175,140,154],dialogue:[32,340,436,235],answerForm:[29,595,442,230]} },
  { id:'learning-room-trail',sourceNumber:null,type:'dialogue',background:'learning-paint',location:locations.learning.name,
    cat:'bewildered',layout:'arrival',fontSize:28,
    text:'아무래도 이 사고뭉치가\n평생학습실에 있던 물감을\n터뜨리고 밟고 돌아다니는 것 같아',next:'learning-infant-trail',
    geometry:{cat:[38,345,145,154],dialogue:[32,515,436,240],nextButton:[155,790,194,63]} },
  { id:'learning-infant-trail',sourceNumber:null,type:'dialogue',background:'learning-paint',location:locations.learning.name,
    cat:'bewildered',layout:'arrival',text:'주황색이랑 초록색 물감 자국이\n유아자료실로 이어져!',next:'infant-marker',
    geometry:{cat:[38,391,145,154],dialogue:[32,548,436,210]} },
  { id:'infant-marker',sourceNumber:null,type:'move',background:'learning-paint',location:locations.infant.name,
    cat:'neutral',layout:'move',fontSize:22,marker:true,markerNumber:locations.infant.markerNumber,destination:locations.infant.name,
    guideText:'{destination}로 이동해 주세요\n고양이 마크 {markerNumber}를 찾아주세요\n\n마크는 유아자료실에 들어가자마자\n오른쪽 안내문에 있습니다',
    locationHints:['유아자료실에 들어가자마자 오른쪽 안내문에서 고양이 마크 {markerNumber}를 찾아보세요'],next:'infant-intro',
    geometry:{dialogue:[32,167,436,245],cat:[43,431,135,152],marker:[205,424,225,225],movementControls:[32,685,436,180]} },
  { id:'infant-intro',sourceNumber:null,type:'dialogue',background:'infant-clean',location:locations.infant.name,
    cat:'neutral',layout:'arrival',text:'여기는 어린 친구들이\n그림책을 읽는 곳이야',next:'infant-paint-accident',
    geometry:{cat:[38,345,145,154],dialogue:[32,515,436,230],nextButton:[155,790,194,63]} },
  { id:'infant-paint-accident',sourceNumber:null,type:'dialogue',background:'infant-mess',location:locations.infant.name,
    cat:'shocked',layout:'arrival',fontSize:27,
    text:'잠깐, 내 발로 물감 도장을 찍었네?!\n그 몸으로 그림까지 그리지 마!',next:'infant-icon-puzzle',
    geometry:{cat:[38,330,145,180],dialogue:[32,532,436,225],nextButton:[155,790,194,63]} },
  { id:'infant-icon-puzzle',sourceNumber:null,type:'puzzle',puzzleId:'infant-room-icons-14',background:'infant-mess',
    location:locations.infant.name,layout:'icon-selection',fontSize:24,
    text:'벽에 있는 고양이 안내문을 보고,\n설명에 맞는 그림 네 칸을\n선택해 주세요',next:'infant-cleaning-bridge',
    geometry:{locationBanner:[31,50,438,66],dialogue:[26,132,448,136],iconPuzzle:[26,284,448,590]} },
  { id:'infant-cleaning-bridge',sourceNumber:null,type:'minigame',puzzleId:'cleaning-keyword',background:'infant-mess',
    location:locations.infant.name,cat:'shocked',layout:'minigame',fontSize:27,
    text:'잠깐, 저 녀석 물감 묻은 발로\n돌아다니잖아!\n책까지 물감이 묻기 전에,\n얼른 바닥부터 닦자!',
    gameUrl:'https://gamemakercho.github.io/cleaning-game/',gameStartLabel:'물감 청소하기',minigameClearKeyword:null,
    next:'opening-continuation',
    geometry:{cat:[38,168,145,170],dialogue:[32,350,436,240],minigameControls:[40,615,420,100],answerForm:[29,730,442,100]} },
  // Keep the previous post-cleaning holding ID so existing saves resume here.
  { id:'opening-continuation',sourceNumber:null,role:'C05',type:'dialogue',background:'infant-clean',
    cat:'happy',location:locations.infant.name,layout:'arrival',
    text:'휴, 바닥에 물감이 거의 안 남았네!',nextLabel:'다음으로',next:'travel-to-sterilizer',geometry:followDialogueGeometry },
  { id:'travel-to-sterilizer',sourceNumber:null,role:'C06',type:'move',background:'infant-clean',
    cat:'neutral',location:'1.5층 책소독기',layout:'move',fontSize:23,marker:true,markerNumber:locations.sterilizer.markerNumber,
    destination:'1.5층 책소독기',
    guideText:'그런데 물감 자국이 계단으로 이어져\n저 녀석을 따라가자 서둘러!\n\n물감 자국을 따라 {destination}로 이동하세요\n고양이 마크 {markerNumber}을 찾아줘!',
    locationHints:['1층에서 2층으로 올라가는 계단 중간에 있는 책소독기를 찾아보세요'],
    next:'sterilizer-intro',geometry:followMovementGeometry },
  { id:'sterilizer-intro',sourceNumber:null,role:'S01',type:'dialogue',background:'sterilizer-mess',
    cat:'neutral',location:'1.5층 책소독기',layout:'arrival',
    text:'이 기계는 책을 소독해서\n깨끗하게 관리해 줘',nextLabel:'다음으로',next:'sterilizer-box-attempt',geometry:followDialogueGeometry },
  { id:'sterilizer-box-attempt',sourceNumber:null,role:'S02',type:'dialogue',background:'sterilizer-mess',
    cat:'shocked',location:'1.5층 책소독기',layout:'arrival',
    text:'야! 거긴 상자가 아니야!\n내 몸으로 들어가지 마!',nextLabel:'다음으로',next:'sterilizer-escape',geometry:followDialogueGeometry },
  { id:'sterilizer-escape',sourceNumber:null,role:'S03',type:'dialogue',background:'sterilizer-clean',
    cat:'bewildered',location:'1.5층 책소독기',layout:'arrival',
    text:'상자만 보면 들어가고 싶나 봐\n앗, 2층으로 도망갔어!',nextLabel:'다음으로',next:'sterilizer-failure',geometry:followDialogueGeometry },
  { id:'sterilizer-failure',sourceNumber:null,role:'S04',type:'dialogue',background:'sterilizer-clean',
    cat:'worried',location:'1.5층 책소독기',layout:'arrival',machineState:'stopped',
    text:'잠깐, 소독기가 멈췄어\n저 녀석이 고장 낸 것 같아!',nextLabel:'다음으로',next:'sterilizer-color-puzzle',geometry:followDialogueGeometry },
  { id:'sterilizer-color-puzzle',sourceNumber:null,role:'S05',type:'puzzle',puzzleId:'sterilizer-color-command-v1',
    background:'sterilizer-clean',cat:'worried',location:'1.5층 책소독기',layout:'sterilizer',fontSize:25,machineState:'stopped',
    cipher:'sterilizer-command',cipherAlt:'첫 묶음은 위 초록, 아래 하늘색. 둘째 묶음은 왼쪽 빨강, 오른쪽 보라. 셋째 묶음은 왼쪽 초록, 오른쪽 보라',
    text:'색깔 신호가 떴어\n이름표가 단서인가 봐!',
    puzzleGuide:'책소독기 이름표의 색을 보고,\n색깔 신호를 글자로 바꿔 줘!',
    onSuccess:{sterilizerRepaired:true},next:'sterilizer-repaired',
    geometry:{locationBanner:[31,50,438,66],cat:[38,145,140,130],dialogue:[32,284,436,119],cipherPanel:[32,419,436,213],answerForm:[29,650,442,175]} },
  { id:'sterilizer-repaired',sourceNumber:null,role:'S06',type:'dialogue',background:'sterilizer-clean',
    cat:'happy',location:'1.5층 책소독기',layout:'arrival',machineState:'repaired',
    text:'고쳤다! 이제 다시 쓸 수 있겠어',nextLabel:'다음으로',next:'travel-to-general',geometry:followDialogueGeometry },
  { id:'travel-to-general',sourceNumber:null,role:'S07',type:'move',background:'sterilizer-clean',
    cat:'neutral',location:'2층 종합자료실',layout:'move',fontSize:23,marker:true,markerNumber:locations.general.markerNumber,
    destination:'2층 종합자료실',
    guideText:'이번엔 {destination}이야\n또 사고 치기 전에 따라가자!\n\n계단을 올라 {destination}로 이동하세요\n고양이 마크 {markerNumber}를 찾아줘!',
    locationHints:['계단을 마저 올라가면 2층이에요 종합자료실의 {markerNumber}번 마크를 찾아보세요'],
    next:'general-room-intro',geometry:followMovementGeometry },
  { id:'general-room-intro',sourceNumber:null,role:'G01',type:'dialogue',background:'general-clean',
    cat:'neutral',location:'2층 종합자료실',layout:'arrival',
    text:'여기는 여러 분야의 책을\n찾아 읽고 빌리는 곳이야',next:null,geometry:followDialogueGeometry }
]}];

// 첫 엽서 답은 확정값입니다. 23번은 현장 마크를 찾는 이동/도착 확인으로 변경했습니다.
// 도착 확인과 제작자 장면 이동은 퍼즐 정답 성공 기록을 만들지 않습니다.
export const puzzles = {
  ...generalPuzzles,
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
  },
  'infant-room-icons-14':{
    status:'confirmed',answerMode:'icons',icons:iconCatalog,
    hints:['벽의 고양이 안내문에 있는 네 가지 설명을 읽어 보세요',
      '고양이 그림 옆 문장도 함께 읽고, 같은 내용을 나타내는 그림을 찾아보세요'],
    successPopup:{title:'와! 맞았어!',body:'잘했어!\n안내문을 잘 살펴봤구나!',buttonLabel:'다음으로',cat:'happy',tone:'gold'}
  },
  'cleaning-keyword':{
    status:'confirmed',acceptedAnswers:[],minigameClearKeyword:null,
    completionMode:'result',minimumRatio:.7,allowedGrades:['A','B'],
    placeholder:'클리어 키워드',hints:[],missing:'청소 게임의 클리어 키워드는 아직 미정입니다',
    successPopup:{title:'훌륭해!',body:'잘했어!',buttonLabel:'다음으로',cat:'happy',tone:'mint'}
  },
  'sterilizer-color-command-v1':{
    status:'confirmed',acceptedAnswers:['고치기'],repairFlag:'sterilizerRepaired',
    answerLabel:'한글 3글자',placeholder:'정답 입력',ariaLabel:'정답: 한글 3글자',checkLabel:'정답 확인',hintLabel:'힌트',
    incorrectMessage:'조금 달라! 이름표의 색을 다시 확인해 봐',
    hints:['책소독기에 붙은 이름표에서 같은 색의 자모를 찾아봐',
      '첫 칸은 위에서 아래로, 둘째와 셋째 칸은 왼쪽에서 오른쪽으로 읽어봐'],
    successPopup:{title:'찾아냈다!',body:'잘했어! 이제 소독기를 고쳐 보자!',buttonLabel:'다음으로',cat:'happy',tone:'mint'}
  }
};

// 원본 500×900 좌표. 장면별 배치·색·서체도 이 파일에서 수정합니다.
export const palette = { cream:'#fff8df', blue:'#d1eff0', yellow:'#f3df68', pink:'#fac3c3' };
export const baseGeometry = {
  dialogue:[32,436,436,210], nextButton:[155,684,194,63],
  locationBanner:[31,64,438,81], answerForm:[29,672,442,100],
  cat:[173,225,162,194], sleeping:[154,226,198,148], staff:[315,217,150,221],
  comic:[10,98,480,320], marker:[193,251,227,244], movementControls:[32,625,436,190],
  tutorialPanel:[32,280,436,493],
  iconPuzzle:[26,284,448,590],minigameControls:[40,715,420,120],
  machineStatus:[300,158,168,48],cipherPanel:[32,419,436,213]
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
export function createChapters(value) {
 const options=normalizeCourseOptions(value),chapters=structuredClone(openingChapters);
 const intro=chapters[0].scenes.find(s=>s.id==='general-room-intro');
 intro.text='여기는 책을 골라 읽고 빌리는\n종합자료실이야';intro.next='general-shelf-guide';intro.nextLabel='다음으로';
 chapters[0].scenes.push(...createGeneralScenes(options));
 for (const scene of chapters.flatMap(c=>c.scenes)) {
  scene.geometry={...baseGeometry,...(scene.type==='move'?movementGeometry:{}),...overrides[scene.sourceNumber],...scene.geometry};
  scene.fontSize??=scene.type==='move'?24:scene.layout==='art'?26:scene.layout==='numeric'?62:30;
  scene.lineHeight=scene.layout==='numeric'?1.2:1.48;
  // These source sprites face left. Speakers in the left slot face inward.
  scene.flipCat=scene.geometry.cat[0]<125;
  scene.backgroundFrame=scene.background==='lobby-sleeping'?'sleeping':scene.background==='lobby'?'empty':'normal';
  scene.dimOpacity=scene.dim ? 0.24 : 0;
  scene.backgroundOpacity=scene.background==='meeting'?0.78:(scene.dim?0.74:0.93);
  scene.nextLabel??='다음';
  if(scene.sourceNumber===21){scene.fontSize=33;scene.lineHeight=1.35;}
  if(scene.type==='move'){scene.lineHeight=1.5;scene.textMode='static';}
 }
 return chapters;
}
export const chapters=createChapters();
export const sourceScenes = chapters.flatMap(c => c.scenes).filter(s => s.sourceNumber);
