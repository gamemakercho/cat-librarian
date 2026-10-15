import {courseSettings,normalizeCourseOptions} from './course-config.js';
import {createEndingScenes} from './ending-course.js';
const dialogue={cat:[38,345,145,154],dialogue:[32,515,436,230],nextButton:[138,790,224,63]};
const movement={dialogue:[32,158,436,250],cat:[43,428,135,152],marker:[205,425,225,225],movementControls:[32,685,436,180]};
const gameGeometry={cat:[38,168,145,170],dialogue:[32,350,436,240],minigameControls:[40,615,420,175]};
const mathGeometry={cat:[38,280,145,160],dialogue:[32,466,436,130],answerForm:[29,640,442,150]};
const numeric=(title)=>({status:'preview',answerMode:'numeric-string',acceptedAnswers:['2'],question:'1 + 1 = ?',
  answerLabel:'숫자 입력',inputMode:'numeric',placeholder:'정답 입력',checkLabel:'정답 확인',hints:[],
  incorrectMessage:'조금만 다시 생각해 볼까?',successPopup:{title,body:'잘했어! 이야기를 이어가 보자!',buttonLabel:'다음으로',cat:'happy',tone:'gold'}});
const gameResult=(kind,clearInstruction)=>({status:'confirmed',completionMode:'result',resultKind:kind,
  acceptedAnswers:[],hints:[],clearInstruction});
export const generalPuzzles={
  'general-room-placeholder-v1':numeric('정답이야!'),
  'newbooks-placeholder-v1':numeric('와! 맞았어!'),
  // Keep the old IDs so previous play saves retain their verified game results.
  'book-catch-keyword':{...gameResult('book-catch','20권 이상 정리하면 이야기를 이어갈 수 있어'),target:20},
  'book-order-keyword':{...gameResult('book-order','열 권을 번호 순서대로 꽂으면 이야기를 이어갈 수 있어'),correctOrder:['000','100','200','300','400','500','600','700','800','900']}
};
export function createGeneralScenes(value){
 const options=normalizeCourseOptions(value),{showDeskInterlude,includeNewBooks}=options;
 const lobbyGuide='처음 만났던 1층 로비로 이동하세요';
 const scenes=[
  {id:'general-shelf-guide',role:'G02',type:'dialogue',background:'general-clean',cat:'neutral',location:'2층 종합자료실',layout:'arrival',fontSize:26,
   text:'왼쪽 아동서가에는 어린이책이 있어\n오른쪽 일반서가에는 어른들이\n주로 읽는 책이 있고!',next:showDeskInterlude?'general-pc-guide':'general-room-puzzle',geometry:dialogue},
  ...(showDeskInterlude?[
   {id:'general-pc-guide',role:'G03',type:'dialogue',background:'general-pc-paint',cat:'neutral',location:'2층 종합자료실',layout:'arrival',fontSize:28,
    text:'책은 저 PC로 찾을 수 있어\n옆 기계에선 직접 빌리고\n반납할 수 있고!',next:'general-pc-paint',geometry:dialogue},
   {id:'general-pc-paint',role:'G04',type:'dialogue',background:'general-pc-paint',cat:'self-mockery',location:'2층 종합자료실',layout:'arrival',fontSize:28,
    text:'움직이는 화살표를 잡으려 했나 봐\n화살표는 못 잡고,\n손도장만 찍었네!',next:'general-room-puzzle',geometry:dialogue}
  ]:[]),
  {id:'general-room-puzzle',role:'G05',type:'puzzle',puzzleId:'general-room-placeholder-v1',background:'general-mess',cat:'worried',location:'2층 종합자료실',layout:'numeric',
   text:generalPuzzles['general-room-placeholder-v1'].question,next:'general-book-catch',geometry:mathGeometry},
  {id:'general-book-catch',role:'G06',type:'minigame',puzzleId:'book-catch-keyword',background:'general-mess',cat:'shocked',location:'2층 종합자료실',layout:'result-game',fontSize:26,
   text:'으악! 서가 위에서 책을\n떨어뜨리고 있잖아!\n저런 고양이 같은… 아참, 고양이지',
   gameUrl:'./games/book-catch/',gameTitle:'책 받기',gameStartLabel:'고양이가 떨어뜨리는 책을 받아라!',next:'general-after-catch',geometry:gameGeometry},
  {id:'general-after-catch',role:'G07',type:'move',background:'general-clean',cat:'happy',location:includeNewBooks?'신간코너':'1층 로비',layout:'move',fontSize:23,
   destination:includeNewBooks?'종합자료실 안 신간코너':'1층 로비',marker:includeNewBooks,markerNumber:includeNewBooks?5:null,
   guideText:includeNewBooks?'휴, 책은 무사해!\n이번엔 신간코너로 갔어!\n\n종합자료실 안 신간코너로 이동하세요\n고양이 마크 {markerNumber}를 찾아줘!':`휴, 책은 무사해!\n저 녀석, 계단으로 내려간다!\n\n${lobbyGuide}`,
   locationHints:[includeNewBooks?(courseSettings.newBooksExactLocation||'종합자료실 안에서 ‘신간’ 표시와 {markerNumber}번 마크를 찾아보세요'):'계단을 내려가 처음 만났던 1층 로비로 이동하세요'],
   next:includeNewBooks?'newbooks-intro':'lobby-ending-entry',geometry:includeNewBooks?movement:{...movement,cat:[180,450,140,150]}},
  ...(includeNewBooks?[
   {id:'newbooks-intro',role:'N01',type:'dialogue',background:'new-books',cat:'neutral',location:'신간코너',layout:'arrival',fontSize:28,
    text:'여기는 새로 들어온 책을\n모아 둔 신간코너야',next:'newbooks-disorder',geometry:dialogue},
   {id:'newbooks-disorder',role:'N02',type:'dialogue',background:'new-books',cat:'worried',location:'신간코너',layout:'arrival',fontSize:28,
    text:'새 책도 다 섞어 놨네!\n책등의 번호를 보고\n순서대로 꽂아야 해',next:'newbooks-puzzle',geometry:dialogue},
   {id:'newbooks-puzzle',role:'N03',type:'puzzle',puzzleId:'newbooks-placeholder-v1',background:'new-books',cat:'neutral',location:'신간코너',layout:'numeric',
    text:generalPuzzles['newbooks-placeholder-v1'].question,next:'newbooks-order-game',geometry:mathGeometry},
   {id:'newbooks-order-game',role:'N04',type:'minigame',puzzleId:'book-order-keyword',background:'new-books',cat:'worried',location:'신간코너',layout:'result-game',fontSize:27,
    text:'아무 데나 꽂으면 책이 길을 잃어\n번호를 보고 한 권씩\n제자리를 찾아 줘!',gameUrl:'./games/book-order/',gameTitle:'책 꽂기',gameStartLabel:'책을 제자리에 꽂아라!',next:'newbooks-after-order',geometry:gameGeometry},
   {id:'newbooks-after-order',role:'N05',type:'move',background:'new-books',cat:'happy',location:'1층 로비',layout:'move',fontSize:23,
    destination:'1층 로비',marker:false,guideText:`책도 제자리!\n이제 내 몸도 제자리로 돌려놓자\n\n${lobbyGuide}`,
    locationHints:['계단을 내려가 처음 만났던 1층 로비로 이동하세요'],next:'lobby-ending-entry',geometry:{...movement,cat:[180,450,140,150]}}
  ]:[]),
  ...createEndingScenes()
 ];
 return scenes.map(s=>({sourceNumber:null,nextLabel:'다음으로',...s}));
}
