# 통합 수정과 실행 검증 — 2026-10-30 묶음 integrated20

기존 cat-librarian 저장소에 실제 반영했다. 자동 커밋·푸시·배포는 하지 않았다. ZIP은 작업 폴더 work/flow-ending-kit-20261030 아래에 풀었고 CODEX_PROMPT-ko.md, 설정/순서 JSON, 자산 메타데이터와 그림을 확인했다.

## 적용 기준과 최종 순서

ZIP에 예전 손/북카트/뛰네 대사 및 로비 이동이 남아 있어 사용자에게 확인했다. 사용자의 바로 앞 직접 수정과 ‘네 손좀 빌릴게, 아 이번엔 뛰네 이런 대사 별로임’ 답변을 우선하여 다음처럼 통합했다.

- 종합자료실: 쉬운 십진분류표 설명 → 실제10권 정리 → 같은 게임의 발자국 문제 → 칭찬 팝업 다음으로
- 정리 후 대사 →05번 반납 안내문 서가 도착 확인 → 사서 발견/기존 책 밀기 모션 → ‘안돼! 귀한 책들이 바닥에 다 떨어진다!!’ → 책 받기
- 책 받기 성공 복귀 → 북트럭 이용 안내 → ‘쟤는 또 어딜 가는거야!’ → 뛰지 않기 안내 → ‘저러다 다치겠어. 빨리 따라가자!’ → 종합자료실에서 ‘책 더미를 피해 사서를 따라가자!’/사서 따라잡기
- 실제 로비 이동/도착 및 ‘내 몸으로 시범…’, ‘저기 있다/짧은 다리’ 대사는 제거했다. 저장 ID는 명시적으로 이전한다.
- 달리기 만화5장 이후 정지 → 새 참고 그림이 보이는 마지막 엽서 문제 → 최종 정답 → 기존 충돌 → 복귀4대사 → 감사3대사 → 최종 완료

도입/평생학습실/유아자료실/UV램프 수리와 기존 게임 규칙·그림·청소 성공 기준은 유지했다. 활동은 문제6개와 미니게임4개다.

| ZIP의 논리 활동 | 현재 구현 위치/ID |
|---|---|
| 문제1 opening_postcard | lobby-postcard / postcard-heading |
| 문제2 learning_room_book | learning-room-art / BOOK(영어4글자) |
| 문제3 infant_rule_icons | infant-icon-puzzle / infant-room-icons-14 |
| 미니게임1 paint_cleaning | infant-cleaning-bridge / cleaning-keyword |
| 문제4 sanitizer_color_cipher | sterilizer-color-puzzle / sterilizer-color-command-v1 |
| 미니게임2 book_ordering | newbooks-order-game / games/book-order |
| 문제5 general_book_letters | 같은 iframe의 book-order-paws-v1 / 정리완료 |
| 미니게임3 catch_falling_books | general-book-catch / games/book-catch |
| 미니게임4 catch_librarian_runner | ending-rescue / games/ending-chase |
| 문제6 final_postcard_fold | ending-fold-puzzle / postcard-returned-v1 |

## 변경 파일

- general-course.js, ending-course.js: 위 대사/연결/종합자료실 위치 및 마지막 문제 안내
- course-migration.js: 삭제한 동선의 currentId와 history를 명시적으로 매핑. runId/solved/게임 기록과 이미 지나간 엔딩은 유지
- games/book-order/letter-puzzle-config.js: 요청한 엽서 발자국 안내. 기존 ID별10글자와500→800→300→100 대응 유지
- games/book-order/letter-ui.js, letter.css, index.html: 완성 보드 중앙 정렬, 하단34% 문제 영역,20px 굵은 글자 배지. 안내·발자국 장식은 보드에 배치하고 입력은 별도 하단 패널에서 스크롤 가능
- games/book-order/game.js, config.js: 원본 유한 반짝임 기간 복원, 정답 미노출 정렬 완료 문구. 정렬/입력/팝업/완료 경계는 유지
- fold-reference.js(새 파일), ending-ui.js, app.js, index.html, style.css: 마지막 문제 전용 정적 참고 카드, 미리 읽기/PNG 대체/실패 후에도 안내·입력 유지/재시도, 안내→그림→입력 순서. 옛 정지화면과 중복하지 않음
- assets/ending/postcard-fold-complete.webp(96,782B), PNG(175,206B), JSON: 제공 파일 그대로 복사. 두 형식을 항상 동시에 요청하지 않음. 원본 세로 참고/색 발자국 참고는 배포 폴더에 넣지 않음
- story.js 및 변경 진입 모듈/스타일: integrated20 버전 쿼리. 기존 저장 키/퍼즐ID/runId 유지
- scripts/game-adaptations/book-order.patch, games/upstream-lock.json 등: 원본 동기화 뒤에도 본편 수정이 유지되도록 패치/해시 기록 갱신. 책 정리 원본 state/geometry와 책 받기/달리기 규칙은 변경하지 않음
- scripts/ending.test.mjs, engine.test.mjs, fold-reference.test.mjs, check-ending.mjs: 새 동선/옛 저장/참고 그림의 실패 처리와 첨부 SHA 검사

이번 수정은 cat-librarian 내부와 그 안에서 실제 실행하는 games/book-order 사본에 반영했다. 별도 bookband/library-game1/catch-librarian 원본의 파일을 이번에 수정하거나 업로드하지 않았다. 원본 폴더의 실행 파일과 본편 보존 패치는 확인하고 동기화 검사했다.

## 실제 실행한 검사

- `node --test scripts/*.test.mjs`:69/69 통과
- `node scripts/check-assets.mjs`: 자산·한글 폰트·장면 연결·HTML ID·엔딩·글자 문제·WebP/PNG 첨부 크기/SHA 검사 통과
- `node scripts/sync-games.mjs`: 본편 연결 패치 적용 및 원본/사본 기록 갱신. book-order15개, book-catch21개, ending-chase35개 실행 파일 검증
- `git diff --check`: 통과

실제 Chrome에서 터치 가능한 모바일 크기360×640,390×844로 앱 JS/DOM/canvas를 실행했다. 저장소 하위 경로 /cat-librarian/의 파일을 로컬 HTTP 응답으로 제공했다. GitHub Pages 공개 새 배포의 확인은 아니다.

1. BOOK/book/Book 실제 입력 승인, art/기호/불완전 답 거부 확인
2. 책 정리가 문제보다 먼저 열리고 오정렬 중 글자·문제 숨김. 실제10권 정렬 후에만10글자와 입력 공개. 분류ID별 글자/중심 위치, 표지·책과 겹침 없음, 하단 패널 위치 확인
3. 같은 게임 안 오답/힌트/IME Enter/새로고침·메인 이어하기/팝업 대기를 실행. 팝업 다음으로 이후에만 메인으로 복귀하며 중복 정답 입력 없음
4. 일반 모션 환경에서 canvas 내용을 시간별로 비교해 짧은 반짝임이 실제 재생된 뒤 안정화되는지 확인. 문자 입력용 높이360px 축소와640px 복원 때 입력/배치 유지 확인
5. 05번 마크 이동·위치 힌트·도착 후 서가 대사, 기존 사서의 발-서가 정렬 확인. 실제 책 받기 엔진을 자동 진행해 성공한 뒤 안내문·변경 대사·종합자료실 추격 안내로 연결
6. 본편 달리기 시작/터치·이단 점프/일시정지 실행. 종료 경계 검사는 테스트에서 beginEnding을 호출해 진입한 뒤 원본 만화5장과 실제 부모 메시지로 새 엽서 문제까지 연결 확인. 이번 검사를 달리기30초 수동 완주라고 주장하지 않음
7. 마지막 문제 최초 진입부터 새 그림 표시, 빈 입력칸/대체 문구/contain 비율/안내→그림→입력 배치 확인. 정답 전 실제 충돌/복귀 그림/완료 없음
8. 마지막 문제 입력 저장·새로고침·뒤로 가기·접기 안내/힌트·IME·키보드 공간360px 확인. WebP404→PNG, 두 형식404에서도 안내/입력 유지, 재시도 성공 확인
9. 정답 후 충돌→복귀4대사→감사3대사→완료를 실행하고 중간 새로고침 복구 확인. 최종 완료 이벤트는 새로고침을 포함해1회인지 확인
10. 플레이 중 references/·색 발자국 제작 원본을 요청하지 않음. 기본 성공 경로에서 참고 그림 PNG를 함께 요청하지 않음. 브라우저 페이지 JS 오류0

실행 스크립트는 작업 폴더의 work/integrated20-route-qa.cjs, integrated20-ending-qa.cjs, integrated20-runner-contact-qa.cjs, integrated20-motion-qa.cjs다. JSON 결과와 화면 캡처는 outputs/verification-integrated20-20261030/에 있다.

## 아직 확인하지 않은 항목

실제 삼성 인터넷/카카오톡 인앱 브라우저·Android/iOS 소프트 키보드/기기, 현장 엽서·마크·안내문, 공개 배포는 이번에 확인하지 않았다. 키보드는 브라우저 사용 공간 축소로 모사했다. 도입부터 현장 전체를 한 번에 수동 완주하거나 이번에 청소 게임을 새로 플레이한 것은 아니다. ZIP의 REVIEW-ko.md/VALIDATION.json을 앱 실행 검증으로 대신하지 않았다.

커밋·푸시·배포는 수행하지 않았다.
