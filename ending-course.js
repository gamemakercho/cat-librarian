// Final physical postcard puzzle and the story-only rescue. Existing arrival ID
// is retained so the already deployed one-floor return continues here.
import {ENDING_PUZZLE_ID} from './ending-bridge.js';
export const endingPuzzleId=ENDING_PUZZLE_ID;
export const endingPuzzle={status:'confirmed',answerMode:'postcard-final',acceptedAnswers:['고양이와 사서가 돌아왔다'],
  answerLabel:'한글 11글자',placeholder:'완성된 문장',ariaLabel:'엽서를 접어 완성한 문장, 한글 11글자',
  checkLabel:'정답 확인',hints:[
    '제목과 QR코드가 있는 앞면을 위로 놓아 봐 노란 부분은 오른쪽 위와 왼쪽 아래야',
    '접은 엽서를 뒤집어 봐 처음 문제처럼 한 문장을 읽으면 돼'
  ],incorrectMessage:'접은 엽서를 뒤집고, 완성된 문장을 다시 읽어 봐',
  successPopup:{title:'찾아냈다!',body:'우리 이야기의 마지막 한 줄이네!',buttonLabel:'다음으로',cat:'happy',tone:'mint'}};
const talk={cat:[38,345,145,154],actor:[156,230,235,245],dialogue:[32,515,436,230],nextButton:[138,790,224,63]};
export function createEndingScenes(){return [
  {id:'lobby-ending-entry',type:'dialogue',cat:'neutral',text:'돌고 돌아, 처음 만난 로비네\n오늘 도서관이 아주 바빴어',next:'ending-one-left'},
  {id:'ending-one-left',type:'dialogue',cat:'resigned',text:'책도 바닥도 제자리!\n…내 몸만 빼고',next:'ending-rescue'},
  // Retain old IDs for saved games; these are not extra screens on the new route.
 {id:'ending-postcard-clue',type:'dialogue',cat:'bewildered',text:'잠깐… 로비에 츄르가 있잖아!',next:'ending-rescue'},
  {id:'ending-fold-puzzle',type:'puzzle',puzzleId:endingPuzzleId,background:null,layout:'final-fold',fontSize:24,
   text:'엽서의 노란 모서리를 접어 두 친구의 마지막 장면을 완성해 줘!\n완성된 문장을 입력해 봐',
   instruction:'한글 11글자 · 느낌표 제외\n띄어쓰기는 해도 되고 안 해도 돼',
   next:'ending-impact',geometry:{locationBanner:[31,40,438,62],dialogue:[32,325,436,210],answerForm:[29,700,442,185]}},
  {id:'ending-not-yet',type:'dialogue',cat:'bewildered',text:'우리 이야기의 마지막 장면이야!',next:'ending-impact'},
  {id:'ending-rescue',type:'cinematic',cinematicPart:'approach',cat:'shocked',layout:'ending-cinema',fontSize:28,
  text:'사서가 달아나고 있어!\n책 더미를 피해서 따라가자!',actionLabel:'사서를 잡아라! 시작',next:'ending-fold-puzzle'},
  {id:'ending-impact',type:'cinematic',cinematicPart:'restore',background:null,layout:'ending-cinema',fontSize:28,
   text:'이제, 마지막 한 줄을 완성하자!',actionLabel:'마지막 장면 이어 보기',autoPlay:true,next:'ending-returned'},
  {id:'ending-returned',type:'dialogue',actor:'returned-librarian',speaker:'사서',
   text:'손이다… 내 손!\n돌아왔다!',next:'ending-thanks'},
  {id:'ending-thanks',type:'dialogue',actor:'returned-librarian',speaker:'사서',
   text:'책도 바닥도, 나까지 구해 줬네\n정말 고마워!',next:'ending-cat'},
  {id:'ending-cat',type:'dialogue',actor:'returned-cat',speaker:'고양이',text:'냐옹',next:'ending-promise',geometry:{actor:[140,285,240,178]}},
  {id:'ending-promise',type:'dialogue',actor:'returned-librarian',speaker:'사서',
   text:'너도 오늘 수고했다\n내일은… 얌전히 책만 보자',next:'ending-complete'},
  {id:'ending-complete',type:'ending',background:null,layout:'ending-card',text:'고양이와 사서가 돌아왔다!',next:null}
].map(scene=>({sourceNumber:null,location:'1층 로비',background:'lobby',nextLabel:'다음으로',...scene,geometry:{...talk,...scene.geometry}}));}
