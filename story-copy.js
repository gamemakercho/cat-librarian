// Approved dialogue from main-game-adjustment-kit/data/scene-copy-ko.json.
export const sceneCopy = {
  "format_version": 1,
  "game": "고양이가 된 사서",
  "note": "semantic_key는 이 첨부물의 의미상 키이며 기존 코드의 실제 장면 ID를 뜻하지 않습니다. 현재 장면 구조에 매핑해서 사용하세요.",
  "intro": {
    "lead_in": "오늘 아침에도 평소처럼 도서관에 출근 중이었어.",
    "panels": [
      {
        "semantic_key": "intro_cat_greeting",
        "visual": "도서관 문 앞 고양이를 발견. 만화 속 ‘어, 오늘도 왔네!’",
        "narration": "도서관에 들어가기 전, 문 앞에서 늘 마주치던 고양이를 발견했지."
      },
      {
        "semantic_key": "intro_treat_from_bag",
        "visual": "가방에서 츄르를 꺼냄. ‘츄르 줄게~ 조금만 기다려! 천천히 와!’",
        "narration": "나는 고양이에게 주려고 가방에서 츄르를 꺼냈어."
      },
      {
        "semantic_key": "intro_cat_rush",
        "visual": "고양이가 빠르게 달려옴",
        "narration": "그걸 보더니 고양이가 엄청난 기세로 나한테 달려왔는데…"
      },
      {
        "semantic_key": "intro_head_bump",
        "visual": "사서와 고양이의 머리가 부딪힘",
        "narration": "쾅! 그대로 고양이랑 머리를 부딪혔어."
      }
    ]
  },
  "sanitizer": {
    "existing_answer": "고치기",
    "before": [
      "저 안에 들어가려다 UV 램프를 망가뜨렸나 봐.",
      "몸은 커졌는데, 들어갈 곳 고르는 버릇은 그대로네.",
      "새 램프로 바꿔야겠어."
    ],
    "result": {
      "image_webp": "assets/book-sanitizer-repaired.webp",
      "image_png": "assets/book-sanitizer-repaired.png",
      "aspect_ratio": "1 / 1",
      "dialogue": [
        "램프 교체 끝. 다시 켜진다!",
        "휴… 기계는 돌아왔네. 이제 나만 돌아오면 되겠다."
      ],
      "next": "기존 2층 이동 안내에 연결"
    }
  },
  "classification": {
    "scope": "2층 십진분류표를 참고해 10권을 순서대로 정리하는 기존 게임",
    "launch_label": "책 정리하기",
    "before": [
      "저 녀석이 책 순서를 몽땅 뒤섞어놨어.",
      "도서관 책은 주제별로 모아둬. 그래야 찾는 사람이 헤매지 않거든.",
      "현장의 십진분류표를 보고, 책등 아래쪽 띠 색깔과 분류명을 맞춰 봐.",
      "표에 나온 순서대로 열 권을 정리해 주면 돼.",
      "네 손 좀 빌릴게. 내 건 다른 분이 사용 중이라."
    ],
    "wrong_order_message": "아직 순서가 맞지 않아요",
    "after": [
      {
        "type": "dialogue",
        "text": "좋아. 이제 책 찾으러 온 사람이 헤매진 않겠다."
      },
      {
        "type": "dialogue",
        "text": "너랑 하니까 금방이네. 이제 좀 앉아…"
      },
      {
        "type": "effect",
        "text": "쿠당탕!",
        "direction": "서가 쪽"
      },
      {
        "type": "dialogue",
        "text": "…아직 안 앉았어. 생각만 했어!"
      },
      {
        "type": "dialogue",
        "text": "서가 쪽이야. 가자."
      }
    ],
    "do_not_add": "별도 3색 반납 분류 게임, 화면에 공개하는 정답 배열, 새 타이머나 성공 조건"
  }
};
