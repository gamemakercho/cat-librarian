# 츄르 질주·구출 엔딩 v15

첨부 엔딩 묶음의 실행 사본이다. `SOURCE.json`의 원격 원본은 이번 작업에서 수정하지 않았다. `engine.js`,`renderer.js`,`scene-config.js`,`impact-cutin.js`는 첨부 원본 해시를 유지한다. 그림과 정확한 프레임/이마 좌표는 제공 WebP/JSON을 사용한다.

`churu-finale.js`는 작은 캔버스 츄르 소품과 로비 바닥을 향한 마지막 접근 경로를 재정의한다. `PhasedFinale`가 같은 설정을 사용하므로 정답 뒤에도 정확히 같은 접촉 자세에서 이어진다. 다른 미니게임으로 재작성하거나 원본 캐릭터를 다시 그리지 않았다.

앉은 사서 프레임의 오른쪽 위에 섞인 이웃 달리기 프레임의 신발 조각만 표시 마스크로 제외했다. 본편은 assets.json의 cropClip,영화는 asset-loader.js의 폴리곤을 사용한다. 실제 이미지·기존 crop/anchor/이마 좌표는 수정하지 않았다.

- approach: 실제 forehead-bump 이벤트 첫 접촉 프레임에서 awaiting-answer로 무기한 정지. 충돌 효과/몸 복구 없음. 현재 캔버스 JPEG를 부모의 문제 배경 사진으로 전달.
- restore: 부모가 마지막 정답을 확정한 뒤에만 연다. 화면 밖에서 접촉 지점까지 복원하고,첨부 postcard-impact.webp/꽝!을 약1.05초 표시한 뒤 원래 복구 동작을 이어간다.
- full: 완료 화면의 다시 보기용. 접근/충돌/복구를 연속 재생하며 접기 문제를 다시 요구하지 않는다.

`asset-loader.js`는 approach에서 충돌 그림을 요청하지 않는다. `player.js`는 문서 숨김/페이지 떠남 때 일시정지하고,동작 줄이기에서 영혼 궤적/강한 빛을 쓰지 않는다. 완료 프레임의 고양이는 최종 도착 위치로 유지한다. 영화 중 복귀는 해당 앞/뒤 재생 화면으로 돌아오며 완료로 처리하지 않는다.

엔딩 상태와 문장 판정은 본편 `engine.js`,UI는 `ending-ui.js`,엄격한 origin/source/session/runId/gameId/part/result 검증은 `ending-bridge.js`다. `node --test scripts/*.test.mjs`와 `node scripts/check-assets.mjs`를 본편 최상위에서 실행한다. 브라우저/실제 기기/배포 확인은 별도 검증 보고서를 따른다.
