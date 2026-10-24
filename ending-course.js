// Final physical postcard puzzle and the story-only rescue. Existing arrival ID
// is retained so the already deployed one-floor return continues here.
import {ENDING_PUZZLE_ID} from './ending-bridge.js';
export const endingPuzzleId=ENDING_PUZZLE_ID;
export const endingPuzzle={status:'confirmed',acceptedAnswers:['고양이와 사서가 돌아왔다'],
  successMode:'immediate',answerLabel:'한글 11글자',placeholder:'완성된 문장',ariaLabel:'엽서를 접어 완성한 문장, 한글 11글자',
  checkLabel:'정답 확인',hints:[
    '제목과 QR코드가 있는 앞면을 위로 놓아 봐 노란 부분은 오른쪽 위와 왼쪽 아래야',
    '접은 엽서를 뒤집어 봐 처음 문제처럼 한 문장을 읽으면 돼'
  ],incorrectMessage:'접은 엽서를 뒤집고, 완성된 문장을 다시 읽어 봐',
  successPopup:{title:'찾아냈다!',body:'우리 이야기의 마지막 한 줄이네!',buttonLabel:'다음으로',cat:'happy',tone:'mint'}};
const talk={cat:[38,345,145,154],dialogue:[32,515,436,230],nextButton:[138,790,224,63]};
export const endingArtIds=['ending-03-impact','ending-04-returned','ending-05-thanks'];
export function createEndingScenes(){
 const art=(id,asset,text,next,speaker='사서')=>({id,type:'dialogue',endingArt:asset,layout:'ending-illustration',background:null,textMode:'static',speaker,text,next,geometry:{dialogue:[25,500,450,225],nextButton:[110,790,280,63]}});
 return [
 {id:'lobby-ending-entry',type:'dialogue',cat:'neutral',text:'돌고 돌아, 처음 만났던 로비네',next:'ending-one-left'},
 {id:'ending-one-left',type:'dialogue',cat:'resigned',text:'책도 바닥도 제자리인데…\n내 몸만 아직 돌아다니고 있어',next:'ending-found'},
 {id:'ending-found',type:'dialogue',cat:'shocked',text:'저기 있다!',next:'ending-postcard-clue'},
 {id:'ending-postcard-clue',type:'dialogue',cat:'worried',text:'이번엔 꼭 붙잡자\n나도 두 발로 퇴근하고 싶어!',next:'ending-rescue'},
 {id:'ending-rescue',type:'cinematic',cinematicPart:'approach',cat:'shocked',layout:'ending-cinema',text:'책 더미를 피해 사서를 따라가자!',actionLabel:'마지막 추격 시작',next:'ending-fold-puzzle'},
 {id:'ending-fold-puzzle',type:'puzzle',puzzleId:endingPuzzleId,background:null,layout:'final-fold',fontSize:24,text:'잠깐! 고양이로 끝낼 순 없지!\n엽서 속 마지막 한 줄을 찾아줘!',instruction:'한글 11글자 · 느낌표 제외\n띄어쓰기는 해도 되고 안 해도 돼',next:'ending-impact',geometry:{locationBanner:[31,40,438,62],dialogue:[32,325,436,210],answerForm:[29,700,442,185]}},
 {id:'ending-not-yet',type:'dialogue',cat:'bewildered',text:'우리 이야기의 마지막 장면이야!',next:'ending-impact'},
 {id:'ending-impact',type:'impact',endingArt:'ending-03-impact',background:null,layout:'ending-illustration',durationMs:600,text:'쿵!',next:'ending-returned'},
 art('ending-returned','ending-04-returned','앗… 돌아왔다!','ending-cat'),
 art('ending-cat','ending-04-returned','야옹~!','ending-returned-joke','고양이'),
 art('ending-returned-joke','ending-04-returned','너는 야옹 한마디면 끝이지?','ending-thanks'),
 art('ending-thanks','ending-05-thanks','고마워. 책도 바닥도,\n나까지 제자리로 돌려놔 줬네.','ending-promise'),
 art('ending-promise','ending-05-thanks','다음에도 도서관에 놀러 와.\n그땐 책만 빌려줄게.','ending-loan-joke'),
 art('ending-loan-joke','ending-05-thanks','오늘은 내 몸까지 대출 중이었거든.','ending-complete'),
 {id:'ending-complete',type:'ending',endingArt:'ending-05-thanks',background:null,layout:'ending-illustration',text:'고양이와 사서가 돌아왔다!',next:null}
 ].map(s=>({sourceNumber:null,location:s.endingArt?null:'1층 로비',nextLabel:'다음으로',...s,geometry:{...talk,...s.geometry}}));
}
