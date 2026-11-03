export const HOWTO=Object.freeze({
 'cleaning-keyword':{key:'howto:cleaning',name:'물감 청소',alt:'물감 청소 플레이 방법. 누른 지점을 기준으로 손가락을 드래그해 이동하고, 손을 떼면 멈춰요. 게이지가 차면 와다다 청소를 눌러요. 청소율 70% 이상이면 클리어.'},
 'book-order-keyword':{key:'howto:book-arrange',name:'책 정리',alt:'책 정리 플레이 방법. 현장의 한국십진분류표와 책띠 색을 비교하고, 북카트의 책 10권을 번호가 작은 주제부터 서가에 정리해요. 책과 빈자리를 차례로 누르거나 드래그할 수 있어요.'},
 'book-catch-keyword':{key:'howto:book-catching',name:'책 받기',alt:'책 받기 플레이 방법. 1~4열로 북카트를 움직여 책을 받아요. 카트가 차면 책 꽂기 버튼으로 비워 주세요. 20권 이상 정리하면 클리어.'},
 'ending-rescue':{key:'howto:running',name:'사서 따라잡기',alt:'달리기 플레이 방법. 점프 / 이단 점프 버튼을 한 번 누르면 점프, 공중에서 한 번 더 누르면 이단 점프. 체력을 지키며 사서를 끝까지 따라가 주세요.'}
});
export const howtoFor=scene=>HOWTO[scene.type==='cinematic'&&scene.cinematicPart==='approach'?scene.id:scene.puzzleId];
