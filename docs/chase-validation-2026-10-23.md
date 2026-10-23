# 2026-10-23 추격 게임 연결 검증

대상: GitHub Desktop의 gamemakercho/cat-librarian, main.

구현: 기존 ending-rescue → games/librarian-chase의 30초 추격 → 원본 만화 5장 → 본편 엽서 문제 → 기존 정답 팝업/복구/최종 완료.

검증 결과:
- 루트 test 스크립트와 같은 `node --test scripts/*.test.mjs`: 71개 통과.
- 루트 check 스크립트와 같은 `node scripts/check-assets.mjs`: 경로·HTML ID·서체·기존 원본 엔진·기존 게임 자산·추격 원본 자산 해시 통과.
- 새 iframe 계약의 정확한 origin/frame/session/runId/gameId/part와 중복 완료 차단을 검증.
- 30초 완주 시뮬레이션, 실패/재도전, 점프 입력, 5장 완료 전 복귀 방지, 본편 iframe에서 독립 완료 기록 무시 검증.
- 마지막 엽서 정답만 마침표를 무시하며 기존 앞선 퍼즐 판정은 그대로 유지.
- 기존 장면 ID와 저장 키, 정답 뒤 원본 복구 엔진 및 그림은 유지.

브라우저 확인 제한:
- 로컬 HTTP 서버는 준비했으나 내장 브라우저가 루프백 주소 연결 시간 초과로 페이지를 열지 못했습니다.
- 따라서 이번 버전의 실제 모바일 화면 배치·터치·IME·전체 본편 연결은 실제 브라우저에서 확인하지 못했습니다.
- 화면 상태 검증은 실제 앱 코드를 실행하는 Node VM의 DOM/Canvas 대역 테스트이며 실제 렌더링 검증과 구분됩니다.
- 별도 설치된 npm 명령이 PATH에 없어 package.json의 동일 Node 명령으로 실행했습니다.

본편 검토 진입: /?review=1&sceneId=ending-rescue
독립 게임 진입: /games/librarian-chase/
설정: games/librarian-chase/config.js
