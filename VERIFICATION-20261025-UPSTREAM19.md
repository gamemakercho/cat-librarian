# 2026-10-25 원본 동기화·05번 서가·전체 화면 달리기 검증

이번 변경은 메인 cat-librarian과 독립 catch-librarian 두 로컬 저장소에 적용했다. 커밋·푸시·공개 배포는 하지 않았다.

## 반영 내용과 파일

- `general-course.js`: 손을 빌린다는 대사를 ‘십진분류표는 책을 주제별로 나누고, 어떤 순서로 꽂는지 알려 주는 표야’로 교체. 반납 안내문 서가 이동은05번 마크와 도착 확인/위치 힌트를 사용한다. 작은 화면에서 안내가 단어 중간에 끊기지 않게 줄바꿈과 크기를 조절했다.
- `general-course.js`, `story-layout.js`: 서가 배경의 실측 y365/1426과 사서 canvas 발 기준560/768을 맞춘다. 화면의 cover 크롭까지 계산하므로360/390px에서 같은 서가 면에 놓인다. 기존5프레임 책 밀기 연출을 유지하며 제목이 머리를 가리지 않게 한다.
- `games/book-order`: GitHub bookband의 최신0~9 자리 번호와 앞발/자산 코드를 사용한다. 본편의 같은 보드 발자국 글자 문제·정리완료 판정·팝업 다음으로·저장·복귀 증거는 유지했다.
- `games/book-catch`: GitHub library-game1의 최신 성공/실패 결과 그림·완벽 성공 연출을 반영했다. 큰 성공 복귀 버튼과 작은 다시하기,20권 성공 기준을 유지했다.
- 독립 `catch-librarian`의 `index.html`, `styles.css`, `app.js`, `renderer.js`, `engine.js` 및 본편 `games/ending-chase`: 여백 없는 뷰포트/HUD/게임/하단 조작 설명, 별도 점프 버튼 제거, 터치와 두 번 터치 조작. 캐릭터·충돌 월드를 같은 비율로 그리며 배경은 균일 배율로 확장한다. 가로 화면도 원본 월드를 자르거나 캐릭터를 늘이지 않는다. 두 번째4권 연속은 low2/high2를 매번 섞되 한 배치에서 선택이 바뀌지 않는다. 기존0.70초 간격·230ms 해제·500ms 회복·30초·체력·충돌·원본 만화/후반 저장을 유지했다.
- `scripts/sync-games.mjs`, `scripts/game-sources.json`, `scripts/game-adaptations/*`, `games/upstream-lock.json`: 실제 원본 폴더에서 런타임 파일을 가져오고 본편 연결 패치를 임시 폴더에서 모두 적용한 후 반영한다. 패치 충돌은 덮어쓰기 전에 중단한다. 자산과 원본/번들 SHA를 기록하며 `check-game-sources.mjs`가 이후 차이를 검출한다. 앞으로 새 파일/자산이 생기면 원본 목록도 검토해야 한다. GitHub 수정이 실시간 자동 배포되는 구조는 아니다.
- `index.html`, `story.js`, `app.js`: 최신 진입/변경 모듈의 버전 쿼리를 갱신했다. 기존 저장 키와 runId, 정답 대기/완료 기록은 초기화하지 않는다.

## 원본 확인

GitHub main을 직접 조회해 아래 HEAD와 일치함을 확인했다. bookband/library-game1에서 사용하는 모든 원본 파일도 해당 HEAD의 Git blob과 비교했다(텍스트 줄바꿈만 정규화): 차이0.

- bookband: a4618a6d7bc0aecb23bc3ef30c86735dc496b845 —15개 런타임 파일
- library-game1: 9d4539d2e2cd5ba9049d5274f3cf933e78faea1b —21개 런타임 파일
- catch-librarian: 672a045e9352485f507e285afa7740a9233aa3d3 기준에 이번 로컬 변경 추가 —35개 런타임 파일

## 실제 실행 결과

- 메인 `node --test scripts/*.test.mjs`:65/65 통과
- 메인 `node scripts/check-assets.mjs`: 이미지/경로/폰트/엔딩/발자국/원본 비교 통과. 원본 대비15+21+35개 파일 검증
- 독립 러너 `node --test tests/*.test.mjs`:102/102 통과. 섞인4권의 구성/순서/해제 횟수·간격/일시정지/실패 취소·세로/가로 균일 렌더 배율 검사 포함
- 독립 러너 `node scripts/check-assets.mjs`:15개 자산 해시·치수·알파·프레임 좌표·모듈/HTML ID 통과
- 독립 러너 `node tests/double-stack-probe.mjs`: 실제 충돌 엔진의7속도 구간 재검증 통과. 기존 타이밍 격자의 안전한 이단 점프684개 유지. 오프라인 HTML도 다시 생성하고 포함 앱 실행 테스트 통과
- 실제 Chrome의 모바일 터치 에뮬레이션360×640/390×844에서 책 정리(틀린 순서 차단/올바른10권), 같은 보드 글자/오답/힌트/IME/정답 대기와 새로고침·팝업 다음으로, 책 받기 실제 엔진 성공/새 결과 그림과 복귀, 반납 안내/로비까지 실행했다. 페이지 JS 오류0
- 같은 두 크기에서05 마크/입력칸 없음/도착 후 사서 장면, 배경 대비 발 위치 오차1px 미만과 제목-머리 겹침 없음, 독립/본편 러너 전체 뷰포트·점프/이단 점프·일시정지를 확인했다. 독립 러너는 실제 앱의 화면 입력을 자동으로 눌러30초를 진행하고 원본 엔딩 만화까지 진입했다(두 크기 모두 체력3 유지). 물리 시간을 임의로 축소하지 않았다.
- 본편 러너의 만화5장 이후 접촉 통지→마지막 엽서 문제/구출 그림 정지화면 연결도 확인했다. 이 연결 경계 검사는 엔진의 beginEnding을 테스트에서 호출해 진입했으며, 본편 전체30초 수동 완주라고 주장하지 않는다.

실행 스크립트: 작업 폴더의 `work/upstream19-route-qa.cjs`, `work/upstream19-mobile-qa.cjs`. 결과 JSON/스크린샷은 `outputs/verification-upstream19-20261025/`에 있다. 브라우저는 실제 Chrome이며 저장소 하위 경로의 로컬 파일을 HTTP 응답으로 제공했다. 공개 사이트를 테스트한 결과는 아니다.

## 확인하지 않은 항목

실제 삼성 인터넷/카카오톡 인앱 브라우저·Android/iOS 실기기, 실제 소프트 키보드, 현장 마크 설치/안내문/엽서, GitHub Pages 새 배포는 이번 실행에서 확인하지 않았다. 브라우저 도구막대 동작은 실기기에서 추가 확인이 필요하다.

GitHub Desktop에서 메인 cat-librarian을 Commit/Push하면 본편 사본도 함께 배포된다. 독립 달리기 사이트까지 갱신하려면 catch-librarian도 별도로 Commit/Push한다. bookband/library-game1 원본에는 이번에 파일을 쓰지 않았다.
