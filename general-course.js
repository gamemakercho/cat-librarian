import {createEndingScenes} from './ending-course.js';
const dialogue={cat:[38,310,145,154],dialogue:[32,490,436,235],nextButton:[138,790,224,63]};
const movement={dialogue:[32,158,436,250],cat:[43,428,135,152],marker:[205,425,225,225],movementControls:[32,685,436,180]};
const gameGeometry={cat:[38,168,145,170],dialogue:[32,350,436,240],minigameControls:[40,615,420,175]};
const puzzleGeometry={cat:[38,225,145,160],dialogue:[32,410,436,225],answerForm:[29,680,442,155]};
// Existing preview answers are retained, not promoted to confirmed field answers.
const field=(title,question)=>({status:'preview',answerMode:'numeric-string',acceptedAnswers:['2'],question,
 answerLabel:'정답 입력',inputMode:'text',placeholder:'현장에서 찾은 정답',checkLabel:'정답 확인',hints:[],
 setupNote:'기존 시안 정답 2 유지 — 실제 현장 정답 확정 필요',incorrectMessage:'엽서와 현장 안내를 다시 살펴볼까?',
 successPopup:{title,body:'잘했어! 이야기를 이어가 보자!',buttonLabel:'다음으로',cat:'happy',tone:'gold'}});
const result=(kind,clearInstruction)=>({status:'confirmed',completionMode:'result',resultKind:kind,acceptedAnswers:[],hints:[],clearInstruction,keyword:null});
export const generalPuzzles={
 'general-room-placeholder-v1':field('정답이야!','엽서 발자국의 색과 글자를\n현장의 십진분류표에 맞춰 살펴봐'),
 'newbooks-placeholder-v1':field('와! 맞았어!','엽서를 안내문의 고양이 얼굴에 맞대어\n우는 얼굴과 웃는 얼굴을 바꿔 봐\n두 화살표가 가리키는 글자나 낱말은?'),
 'book-catch-keyword':{...result('book-catch','20권 이상 정리하면 이야기를 이어갈 수 있어'),target:20},
 'book-order-keyword':{...result('book-order','열 권을 번호 순서대로 꽂으면 이야기를 이어갈 수 있어'),correctOrder:['000','100','200','300','400','500','600','700','800','900']}
};
export function createGeneralScenes(){
 const scenes=[];
 const talk=(id,text,next,cat='neutral',background='general-pc-paint',extra={})=>scenes.push({id,type:'dialogue',text,next,cat,background,geometry:dialogue,...extra});
 talk('general-shelf-guide','저 녀석, 움직이는 화면이 신기했나 봐','general-pc-guide');
 talk('general-pc-guide','책은 안 빌리고 손도장만 찍었네','general-pc-paint','self-mockery');
 talk('general-pc-paint','이건 책을 주제별로 나누는 분류표야','general-classification-clue');
 talk('general-classification-clue','잠깐, 이 색깔… 엽서에서도 보지 않았어?','general-room-puzzle');
 scenes.push({id:'general-room-puzzle',type:'puzzle',puzzleId:'general-room-placeholder-v1',background:'general-pc-paint',cat:'neutral',text:generalPuzzles['general-room-placeholder-v1'].question,next:'general-order-bridge',geometry:puzzleGeometry});
 talk('general-order-bridge','좋아! 이제 저 녀석이 뒤섞은 책부터 제자리에 꽂자','general-order-plan','happy','general-mess');
 talk('general-order-plan','네가 분류표를 보고 순서를 맞춰 줘\n나는 책을 옮길게','general-order-paws','neutral','general-mess');
 talk('general-order-paws','몸은 작아졌는데, 일은 하나도 안 줄었네','newbooks-order-game','self-mockery','general-mess');
 scenes.push({id:'newbooks-order-game',type:'minigame',puzzleId:'book-order-keyword',background:'general-mess',cat:'worried',layout:'result-game',text:'분류표를 보고 책 열 권을\n번호 순서대로 꽂아 줘!',gameUrl:'./games/book-order/',gameTitle:'책 꽂기',gameStartLabel:'책을 제자리에 꽂아라!',next:'newbooks-after-order',geometry:gameGeometry});
 talk('newbooks-after-order','좋아, 책은 제자리!','general-breath','happy','general-clean');
 talk('general-breath','이제 잠깐 숨 좀…','general-crash','neutral','general-clean');
 talk('general-crash','쿠당탕!','general-no-rest','shocked','general-clean',{effect:'bump'});
 talk('general-no-rest','…쉬지 말라는 거네','general-shelf-arrival','resigned','general-clean');
 scenes.push({id:'general-shelf-arrival',type:'move',background:'general-clean',cat:'worried',layout:'move',location:'2층 종합자료실 서가',destination:'종합자료실 서가',marker:false,guideText:'서가 쪽이야 가 보자!\n\n소리가 난 서가 쪽으로 이동하세요',locationHints:['종합자료실의 서가에서 북카트 안내문을 찾아보세요'],next:'newbooks-intro',geometry:{...movement,cat:[180,450,140,150]}});
 talk('newbooks-intro','다 읽은 책은 북카트에\n그래야 다른 사람도 책을 쉽게 찾을 수 있지','newbooks-disorder','neutral','general-clean');
 talk('newbooks-disorder','누구는 웃고, 누구는 울고…','general-faces-joke','worried','general-clean');
 talk('general-faces-joke','딱 우리 상황이네\n신난 건 저 녀석, 울고 싶은 건 나','general-faces-clue','self-mockery','general-clean');
 talk('general-faces-clue','엽서 속 고양이 얼굴이랑 바꿔 보면 어떨까?','newbooks-puzzle','neutral','general-clean');
 scenes.push({id:'newbooks-puzzle',type:'puzzle',puzzleId:'newbooks-placeholder-v1',background:'general-clean',cat:'neutral',text:generalPuzzles['newbooks-placeholder-v1'].question,next:'general-face-easy',geometry:puzzleGeometry});
 talk('general-face-easy','얼굴은 이렇게 쉽게 바뀌는데…','general-body-wait','resigned','general-clean');
 talk('general-body-wait','내 몸은 언제 돌아오려나','general-book-drop','worried','general-clean');
 talk('general-book-drop','툭\n…왜 책이 위에서 내려오지?','general-cattower','shocked','general-mess');
 talk('general-cattower','야! 내 몸으로 캣타워 놀이 하지 마!','general-stare','shocked','general-mess');
 talk('general-stare','지금 나 보면서 민 거지?','general-my-face','bewildered','general-mess');
 talk('general-my-face','모르는 척하지 마 내 얼굴로!','general-cart','self-mockery','general-mess');
 talk('general-cart','북카트가 있어! 저걸로 받자!','general-book-catch','shocked','general-mess');
 scenes.push({id:'general-book-catch',type:'minigame',puzzleId:'book-catch-keyword',background:'general-mess',cat:'shocked',layout:'result-game',text:'잔소리는 나중에 할게\n일단 책부터!',gameUrl:'./games/book-catch/',gameTitle:'책 받기',gameStartLabel:'고양이가 떨어뜨리는 책을 받아라!',next:'general-after-catch',geometry:gameGeometry});
 talk('general-after-catch','휴, 책은 지켰다!','general-come-down','happy','general-clean');
 talk('general-come-down','내려왔다! 이제 얌전히…','general-no-chance','neutral','general-clean');
 talk('general-no-chance','…갈 리가 없지','general-body-missed','resigned','general-clean');
 talk('general-body-missed','책은 다 받았는데, 정작 내 몸은 놓쳤네','travel-to-ending-lobby','self-mockery','general-clean');
 scenes.push({id:'travel-to-ending-lobby',type:'move',background:'general-clean',cat:'worried',layout:'move',location:'1층 로비',destination:'1층 로비',marker:false,guideText:'아래층으로 갔어 로비에서 다시 찾아보자!\n\n처음 만났던 1층 로비로 이동하세요',locationHints:['계단을 내려가 처음 만났던 1층 로비로 이동하세요'],next:'lobby-ending-entry',geometry:{...movement,cat:[180,450,140,150]}});
 return [...scenes,...createEndingScenes()].map(s=>({sourceNumber:null,location:'2층 종합자료실',fontSize:27,nextLabel:'다음으로',...s}));
}
