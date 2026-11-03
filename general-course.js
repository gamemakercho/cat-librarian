import {createEndingScenes} from './ending-course.js?v=20261102-ending-invite';
import {LETTER_PUZZLE} from './games/book-order/letter-puzzle-config.js';
import {markLines,markLocation,locationHints,NOTICE05,MARK_LOCATIONS,ROOM04_INTRO,ROOM04_INTRO_IDS} from './mark04-05-config.js?v=20261102-howto30';
const dialogue={cat:[38,310,145,154],dialogue:[32,490,436,235],nextButton:[138,790,224,63]};
const movement={dialogue:[32,158,436,250],cat:[180,450,140,150],movementControls:[32,685,436,180]};
const gameGeometry={cat:[38,168,145,170],dialogue:[32,350,436,240],minigameControls:[40,615,420,175]};
const result=(kind,clearInstruction)=>({status:'confirmed',completionMode:'result',resultKind:kind,acceptedAnswers:[],hints:[],clearInstruction,keyword:null});
export const generalPuzzles={
 'return-notice-booksodong':{status:'confirmed',acceptedAnswers:['책소동'],requiredGameId:'book-catch-keyword',placeholder:'정답 입력',answerLabel:'한글 3글자 · 띄어쓰기 상관없음',checkLabel:'정답 확인',hintLabel:'힌트',hints:NOTICE05.hints,incorrectMessage:NOTICE05.incorrect,successPopup:{title:'정답이야!',body:'잘했어! 이야기를 이어가 보자!',buttonLabel:'다음으로',cat:'happy',tone:'gold'}},
 'book-catch-keyword':{...result('book-catch','20권 이상 정리하면 이야기를 이어갈 수 있어'),target:20},
 'book-order-keyword':{...result('book-order','열 권을 정리한 뒤 같은 화면의 엽서 문제까지 풀어 줘'),requiresLetterPuzzle:true,letterPuzzleId:LETTER_PUZZLE.id,correctOrder:['000','100','200','300','400','500','600','700','800','900']}
};
export function createGeneralScenes(){
 const scenes=[];
 const talk=(id,text,next,cat='neutral',background='general-mess',extra={})=>scenes.push({id,type:'dialogue',text,next,cat,background,geometry:dialogue,...extra});
 const intro=markLines('intro04').lines,room04={layout:'room04-intro',geometry:dialogue};
 talk('general-order-bridge',intro[1],ROOM04_INTRO_IDS[0],'neutral','room04',room04);
 ROOM04_INTRO.dialogues.slice(0,3).forEach((line,i)=>talk(ROOM04_INTRO_IDS[i],line.text,ROOM04_INTRO_IDS[i+1],'neutral','room04',{...room04,nextLabel:line.button}));
 const instruction=ROOM04_INTRO.dialogues[3];
 scenes.push({id:'newbooks-order-game',type:'minigame',puzzleId:'book-order-keyword',background:'room04',cat:'neutral',layout:'room04-intro',text:instruction.text,waitForTextBeforeGame:true,gameUrl:'./games/book-order/',gameTitle:'책 정리와 엽서 발자국',gameStartLabel:instruction.button,next:'newbooks-after-order',geometry:{...dialogue,minigameControls:gameGeometry.minigameControls}});
 const after=markLines('after_letters04');
 talk('newbooks-after-order',after.lines[0],'general-crash','happy','general-clean');
 talk('general-crash','쿠당탕!','general-no-rest','shocked','general-clean',{effect:'bump'});
 talk('general-no-rest',after.afterCue[0],'general-shelf-direction','resigned','general-clean');
 talk('general-shelf-direction',after.afterCue[1],'general-book-drop','worried','general-clean');
 const loc05=markLocation(5);
 const noticeGuide={id:'general-shelf-arrival',type:'move',background:null,cat:null,layout:'mark05-location',location:null,locationGuide:loc05.guideSteps,markerNumber:5,destination:loc05.title,guideText:loc05.instruction,locationHints:locationHints(5),onArrival:{mark05Arrived:true},next:'general-expression-intro',geometry:movement};
 const shelf={shelfActor:true,shelfSurface:{width:1103,height:1426,y:365,anchorY:560/768},geometry:{...dialogue,locationBanner:[31,20,438,60],shelfActor:[210,-10,245,294]}};
 talk('general-book-drop','찾았다. 너 거기서 뭐 해?','general-cattower','shocked','book-catch-shelf',shelf);
 talk('general-cattower','내 몸이 저기까지 올라갈 수 있었어?','general-stare','bewildered','book-catch-shelf',shelf);
 talk('general-stare','그 책 내려놔.','general-my-face','worried','book-catch-shelf',shelf);
 talk('general-my-face','아래로 말고!','general-cat-meow','shocked','book-catch-shelf',{...shelf,shelfMotion:true});
 talk('general-cat-meow','냐아!','general-cart',null,'book-catch-shelf',{...shelf,speaker:'사서 몸의 고양이',shelfMotion:true});
 talk('general-cart','내 얼굴로 그렇게 뿌듯해하지 마!','general-book-catch','self-mockery','book-catch-shelf',shelf);
 scenes.push({id:'general-book-catch',type:'minigame',puzzleId:'book-catch-keyword',background:'book-catch-shelf',cat:'shocked',layout:'result-game',text:markLines('shelf05').afterSound[1],gameUrl:'./games/book-catch/',gameTitle:'책 받기',gameStartLabel:'책 받기',next:'general-after-catch',geometry:gameGeometry});
 const catchLines=markLines('after_catch05').lines;
 talk('general-after-catch',catchLines[0],'general-return-notice','happy','book-catch-shelf');
 talk('general-return-notice',catchLines[1],'general-shelf-arrival','neutral','general-clean');
 scenes.push(noticeGuide);
 const prepare={layout:'mark05-location',background:null,cat:null,location:null,textMode:'static',locationGuideMode:'puzzle-intro',locationHints:locationHints(5)};
 talk('general-expression-intro',loc05.puzzleIntroFirst.text,'general-expression-help','neutral',null,{...prepare,locationGuide:[loc05.puzzleIntroFirst]});
 talk('general-expression-help',loc05.puzzleIntro.text,'general-return-puzzle','neutral',null,{...prepare,locationGuide:[loc05.puzzleIntro]});
 scenes.push({id:'general-return-puzzle',type:'puzzle',puzzleId:'return-notice-booksodong',background:null,layout:'notice05-expression',fontSize:25,text:NOTICE05.title,next:'general-notice-solved',geometry:{dialogue:[0,0,500,100],answerForm:[29,625,442,155]}});
 const solved=markLines('after_notice05'),realLocationNote=markLines('travel_lobby').text,lobby={location:'1층 로비',realLocationNote};
 talk('general-notice-solved',solved.lines[0],'general-lobby-direction','happy','general-clean');
 talk('general-lobby-direction',solved.lines[1],'lobby-ending-entry','shocked','general-clean');
 const runner=markLines('before_runner');
 talk('lobby-ending-entry',runner.lines[0],'general-no-chance','shocked','lobby',lobby);
 talk('general-no-chance',solved.afterCue[0],'ending-one-left','worried','lobby',lobby);
 talk('ending-one-left',runner.lines[1],'ending-found','bewildered','lobby',lobby);
 talk('ending-found',runner.afterCue[0],'ending-rescue','self-mockery','lobby',lobby);
 const ending=createEndingScenes().map(s=>s.id==='ending-rescue'?{...s,background:'lobby',location:'1층 로비',realLocationNote,text:runner.afterCue[1]}:s);
 return [...scenes,...ending].map(s=>({sourceNumber:null,location:'2층 종합자료실',fontSize:27,nextLabel:'다음으로',...s}));
}
