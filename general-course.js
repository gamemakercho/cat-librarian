import {createEndingScenes} from './ending-course.js';
import {LETTER_PUZZLE} from './games/book-order/letter-puzzle-config.js';
const dialogue={cat:[38,310,145,154],dialogue:[32,490,436,235],nextButton:[138,790,224,63]};
const movement={dialogue:[32,158,436,250],cat:[180,450,140,150],movementControls:[32,685,436,180]};
const gameGeometry={cat:[38,168,145,170],dialogue:[32,350,436,240],minigameControls:[40,615,420,175]};
const result=(kind,clearInstruction)=>({status:'confirmed',completionMode:'result',resultKind:kind,acceptedAnswers:[],hints:[],clearInstruction,keyword:null});
export const generalPuzzles={
 'book-catch-keyword':{...result('book-catch','20권 이상 정리하면 이야기를 이어갈 수 있어'),target:20},
 'book-order-keyword':{...result('book-order','열 권을 정리한 뒤 같은 화면의 엽서 문제까지 풀어 줘'),requiresLetterPuzzle:true,letterPuzzleId:LETTER_PUZZLE.id,correctOrder:['000','100','200','300','400','500','600','700','800','900']}
};
export function createGeneralScenes(){
 const scenes=[];
 const talk=(id,text,next,cat='neutral',background='general-mess',extra={})=>scenes.push({id,type:'dialogue',text,next,cat,background,geometry:dialogue,...extra});
 talk('general-order-bridge','저 녀석이 책 순서를 몽땅 바꿔놨어.','general-order-plan','worried');
 talk('general-order-plan','책은 주제별로 모아둬야 찾는 사람이 헤매지 않거든.','general-order-paws');
 talk('general-order-paws','자료실에 있는 십진분류표를 보고, 책띠 색과 분류명을 맞춰서 열 권을 정리해 줘.','newbooks-order-game');
 scenes.push({id:'newbooks-order-game',type:'minigame',puzzleId:'book-order-keyword',background:'general-mess',cat:'self-mockery',layout:'result-game',text:'네 손 좀 빌릴게. 내 건 지금 다른 분이 쓰고 있어서.',gameUrl:'./games/book-order/',gameTitle:'책 정리와 엽서 발자국',gameStartLabel:'책 정리하기',next:'newbooks-after-order',geometry:gameGeometry});
 talk('newbooks-after-order','맞아. 정리 완료!','general-breath','happy','general-clean');
 talk('general-breath','책 열 권은 제자리로 돌아갔네. 이제 나도 좀…','general-crash','neutral','general-clean');
 talk('general-crash','쿠당탕!','general-no-rest','shocked','general-clean',{effect:'bump'});
 talk('general-no-rest','…책만 돌아갔구나.','general-shelf-direction','resigned','general-clean');
 talk('general-shelf-direction','반납 안내문이 있는 서가 쪽이야. 가 보자.','general-shelf-arrival','worried','general-clean');
 scenes.push({id:'general-shelf-arrival',type:'move',background:'general-clean',cat:'worried',layout:'move',location:'2층 종합자료실 서가',destination:'반납 안내문이 있는 서가',marker:false,guideText:'반납 안내문이 있는 서가로 이동하세요.',locationHints:['종합자료실에서 반납 안내문과 북트럭이 있는 서가 쪽을 찾아보세요.'],next:'general-book-drop',geometry:movement});
 const shelf={shelfActor:true,geometry:{...dialogue,shelfActor:[210,-10,245,294]}};
 talk('general-book-drop','찾았다. 너 거기서 뭐 해?','general-cattower','shocked','book-catch-shelf',shelf);
 talk('general-cattower','내 몸이 저기까지 올라갈 수 있었어?','general-stare','bewildered','book-catch-shelf',shelf);
 talk('general-stare','그 책 내려놔.','general-my-face','worried','book-catch-shelf',shelf);
 talk('general-my-face','아래로 말고!','general-cat-meow','shocked','book-catch-shelf',{...shelf,shelfMotion:true});
 talk('general-cat-meow','냐아!','general-cart',null,'book-catch-shelf',{...shelf,speaker:'사서 몸의 고양이',shelfMotion:true});
 talk('general-cart','내 얼굴로 그렇게 뿌듯해하지 마!','general-book-catch','self-mockery','book-catch-shelf',shelf);
 scenes.push({id:'general-book-catch',type:'minigame',puzzleId:'book-catch-keyword',background:'book-catch-shelf',cat:'shocked',layout:'result-game',text:'북카트가 있어. 네가 움직여줘. 나는 밀게!',gameUrl:'./games/book-catch/',gameTitle:'책 받기',gameStartLabel:'책 받기',next:'general-after-catch',geometry:gameGeometry});
 talk('general-after-catch','휴… 이제 좀 조용하네.','general-return-notice','neutral','general-clean');
 talk('general-return-notice','여기 써 있잖아. 다 읽은 책은 북트럭에 놓아 주세요.','general-return-help','neutral','general-clean');
 talk('general-return-help','다른 사람이 책을 쉽게 찾을 수 있게, 제자리 정리는 사서에게 맡겨 줘.','general-return-joke','neutral','general-clean');
 talk('general-return-joke','너한테 하는 말이야. 서가 위에 계신 내 몸!','general-come-down','self-mockery','general-clean');
 talk('general-come-down','아, 이번엔 뛰네.','general-no-chance','shocked','general-clean',{actor:'escaping-librarian',actorMotion:'flee',geometry:{...dialogue,actor:[185,200,170,222]}});
 talk('general-no-chance','도서관에서는 뛰면 안 돼! 부딪히면 위험하잖아!','general-body-missed','worried','general-clean');
 talk('general-body-missed','내 몸으로 시범 보이지 말고!','general-lobby-direction','resigned','general-clean');
 talk('general-lobby-direction','아래층으로 갔어. 로비로 가 보자.','travel-to-ending-lobby','worried','general-clean');
 scenes.push({id:'travel-to-ending-lobby',type:'move',background:'general-clean',cat:'worried',layout:'move',location:'1층 로비',destination:'1층 로비',marker:false,guideText:'천천히 걸어서 1층 로비로 이동하세요.',locationHints:['계단을 내려가 처음 만났던 1층 로비로 이동하세요.'],next:'lobby-ending-entry',geometry:movement});
 for(const id of ['general-after-catch','general-return-notice','general-return-help','general-return-joke'])scenes.find(s=>s.id===id).noticeText='다 읽은 책은 북트럭에 놓아 주세요';
 return [...scenes,...createEndingScenes()].map(s=>({sourceNumber:null,location:'2층 종합자료실',fontSize:27,nextLabel:'다음으로',...s}));
}
