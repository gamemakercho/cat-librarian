// One source for book identity → letter and the accepted postcard answer.
export const LETTER_PUZZLE=Object.freeze({id:'book-order-paws-v1',answer:'정리완료',
 letters:Object.freeze({'000':'책','100':'료','200':'도','300':'완','400':'서','500':'정','600':'관','700':'읽','800':'리','900':'자'}),
 readingBookIds:Object.freeze(['500','800','300','100']),
 intro:['됐다. 책은 전부 제자리!','어? 책 위에 글자가 나타났네.','엽서의 발자국 색이랑 같은 책을 찾아봐. 발자국 순서대로 읽으면 돼.'],
 instruction:'엽서의 발자국을 위에서 아래로 따라가며, 같은 색 책 위의 글자를 읽어 주세요.',
 incorrect:'조금 달라! 발자국 순서와 책띠 색을 다시 확인해 봐.',
 hints:['엽서의 발자국은 위에서 아래로 읽어 봐.','발자국과 같은 색의 책을 찾고, 그 책 위의 글자를 이어 읽어 봐.']});
