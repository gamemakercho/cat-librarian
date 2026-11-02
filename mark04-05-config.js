// These small JSON files are the single editable source for this course.
// The Node branch lets the same data drive the existing engine tests.
async function readConfig(name){
  const url=new URL(`./config/${name}.json`,import.meta.url);
  if(typeof window==='undefined')return JSON.parse(await (await import('node:fs/promises')).readFile(url,'utf8'));
  try{
   url.searchParams.set('v','20261102-mark05-location');
   const response=await fetch(url);if(!response.ok)throw Error(`진행 설정을 읽지 못했어요: ${name}`);
   return await response.json();
  }catch(error){
   const loading=document.getElementById('loading');if(loading){loading.hidden=false;loading.textContent='진행 설정을 읽지 못했어요 연결을 확인하고 새로고침해 주세요';}
   throw error;
  }
}
export const [MARK_LOCATIONS,MARK_STORY,MARK_FLOW,ROOM04_INTRO]=await Promise.all(['location','story','flow','intro04-dialogue'].map(readConfig));
export const ROOM04_INTRO_IDS=Object.freeze(['general-order-plan','general-order-paws','room04-kdc-explanation','newbooks-order-game']);
export const markLocation=number=>MARK_LOCATIONS.locations[String(number).padStart(2,'0')];
export const markLines=id=>MARK_STORY.scenes.find(s=>s.id===id);
export const locationHints=number=>{const c=markLocation(number);return [c.detailedHint.trim()||c.fallbackHint||c.instruction];};
// Logical kit IDs map to existing durable scene IDs, not numeric positions.
export const MARK_SCENE_GROUPS=Object.freeze({
 travel04:['travel-to-general'],intro04:['general-room-intro','general-order-bridge','general-order-plan','general-order-paws','room04-kdc-explanation'],
 book_ordering_game:['newbooks-order-game'],general04_book_letters:['newbooks-order-game'],success_popup04:['newbooks-order-game'],
 after_letters04:['newbooks-after-order','general-crash','general-no-rest','general-shelf-direction'],travel05:['general-shelf-arrival'],
 shelf05:['general-book-drop','general-cattower','general-stare','general-my-face','general-cat-meow','general-cart'],
 book_catching_game:['general-book-catch'],after_catch05:['general-return-notice','general-return-help','general-expression-intro','general-expression-help'],
 notice05_expression_puzzle:['general-return-puzzle'],success_popup05:['general-return-puzzle'],
 after_notice05:['general-notice-solved','general-stay-still','general-flee-meow','general-come-down','general-no-chance','general-body-missed','general-lobby-direction'],
 travel_lobby:['travel-to-ending-lobby'],before_runner:['lobby-ending-entry','ending-one-left','ending-found'],runner_game:['ending-rescue'],
 existing_runner_aftermath:['ending-rescue'],existing_final_fold_puzzle:['ending-fold-puzzle'],existing_ending:['ending-impact','ending-returned','ending-thanks','ending-complete']
});
export const NOTICE05=Object.freeze({
 title:'엽서를 활용해서,',question:'화살표가 가리키는 3글자는?',
 support:'엽서의 왼쪽 위·오른쪽 아래 고양이 얼굴을 현장 안내문 위에 대 보세요.',
 steps:Object.freeze([
  {from:'angry',to:'cry',text:'화난 고양이는 울게 만들고'},
  {from:'smile',to:'cry',text:'웃는 고양이도 울게 만들고'},
  {from:'cry',to:'smile',text:'우는 고양이는 웃게 만들면'}
 ].map(Object.freeze)),
 hints:['엽서의 왼쪽 위와 오른쪽 아래에서 고양이 얼굴을 찾아봐. 그 얼굴을 현장 안내문의 고양이 얼굴 위에 대는 거야.','위에서부터 화난→우는, 웃는→우는, 우는→웃는 순서야. 한 번씩 엽서를 대고, 엽서의 분홍 화살표가 가리키는 글자를 읽어 봐.'],
 incorrect:'조금 달라! 표정을 바꾸는 순서와 엽서의 분홍 화살표를 다시 확인해 봐.'
});
