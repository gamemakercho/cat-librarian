// The pursuit starts in the general room; old lobby scene IDs migrate explicitly.
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
 {id:'ending-rescue',type:'cinematic',cinematicPart:'approach',background:'general-clean',cat:'shocked',layout:'ending-cinema',text:'책 더미를 피해 사서를 따라가자!',actionLabel:'사서 따라잡기',next:'ending-fold-puzzle'},
 {id:'ending-fold-puzzle',type:'puzzle',puzzleId:endingPuzzleId,background:null,layout:'final-fold',fontSize:24,text:'엽서! 아직 안 접은 부분 있지?\n마지막으로 한 번만 더 도와줘',instruction:'엽서의 노란 부분 두 곳을 접어, 반대쪽에 완성되는 문장을 입력해 주세요',next:'ending-impact',geometry:{locationBanner:[31,40,438,62],dialogue:[32,325,436,210],answerForm:[29,700,442,185]}},
 {id:'ending-not-yet',type:'dialogue',cat:'bewildered',text:'우리 이야기의 마지막 장면이야!',next:'ending-impact'},
 {id:'ending-impact',type:'impact',endingArt:'ending-03-impact',background:null,layout:'ending-illustration',durationMs:600,text:'쿵!',next:'ending-returned'},
 art('ending-returned','ending-04-returned','앗… 돌아왔다!','ending-cat'),
 art('ending-cat','ending-04-returned','야옹~!','ending-returned-joke','고양이'),
 art('ending-returned-joke','ending-04-returned','머리를 부딪혀서 돌아왔나 봐! :O','ending-returned-relief'),
 art('ending-returned-relief','ending-04-returned','휴. 이제 ‘고양이가 그랬어요’라고 해도 되겠다.','ending-thanks'),
 art('ending-thanks','ending-05-thanks','도와줘서 정말 고마워.\n네 덕분에 책도 정리하고, 내 몸도 찾았어.','ending-promise'),
 art('ending-promise','ending-05-thanks','다음에 오면 내가 재미있는 책 골라줄게.','ending-loan-joke'),
 art('ending-loan-joke','ending-05-thanks','그때는 앉아서 보자. 오늘 너무 많이 뛰었다.','ending-complete'),
 {id:'ending-complete',type:'ending',endingArt:'ending-05-thanks',background:null,layout:'ending-illustration',text:'고양이와 사서가 돌아왔다!',next:null}
 ].map(s=>({sourceNumber:null,location:s.endingArt?null:'2층 종합자료실',nextLabel:'다음으로',...s,geometry:{...talk,...s.geometry}}));
}
