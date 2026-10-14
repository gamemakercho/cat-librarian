# 고양이가 된 사서

스마트폰용 도서관 방탈출 초반부 24장입니다. 저장소 최상위의 `index.html`에서 바로 실행하며 별도 빌드나 서버 설치 없이 GitHub Pages로 게시할 수 있습니다.

## GitHub Desktop에서 올리기

이 폴더가 수정할 원본 저장소입니다. ZIP을 계속 다시 풀지 말고 이 폴더를 유지하세요.

1. GitHub Desktop에서 **File → Add local repository**로 이 폴더를 선택합니다. 이미 연결되어 있으면 이 단계는 생략합니다.
2. 변경 파일을 확인하고 Summary에 설명을 입력한 뒤 **Commit to main**을 누릅니다.
3. 새 저장소라면 **Publish repository**, 이미 연결된 저장소라면 **Push origin**을 누릅니다.
4. GitHub 저장소의 **Settings → Pages**에서 **Deploy from a branch**, **main**, **/(root)**를 선택하고 **Save**를 누릅니다.
5. Pages 설정에 표시되는 게시 주소를 휴대폰에서 엽니다.

GitHub Free 계정에서는 공개 저장소로 Pages를 사용할 수 있습니다. 이 경우 Publish repository 창의 **Keep this code private** 체크를 해제하고 게시합니다. 유료 플랜의 비공개 저장소 지원 범위는 위 GitHub 공식 안내를 참고하세요.

파일을 GitHub 웹에서 직접 올리는 경우에는 이 폴더 **안의 내용**을 올립니다. 저장소 최상위에 `index.html`, `assets/`, `creator-references/`가 있어야 합니다. ZIP 한 개만 업로드하면 게임이 실행되지 않습니다. `.nojekyll`도 포함하세요.

게시 주소는 보통 `https://계정.github.io/저장소이름/`이며, 이 버전은 `/저장소이름/` 아래의 상대 경로로도 자산을 읽습니다. 웹서버가 필요한 실행 코드는 없고 제공된 Node 서버는 로컬 확인용입니다.

공식 안내: [GitHub Desktop에 로컬 저장소 추가](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop?platform=windows), [GitHub Pages 게시 폴더 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 플레이와 제작자 보기

- 플레이: 게시 주소 그대로 엽니다.
- 제작자: 게시 주소 뒤에 `?review=1`을 붙입니다.
- 24번 확인: 게시 주소 뒤에 `?review=1&scene=24`를 붙입니다.

일반 플레이와 제작자 저장은 분리됩니다. 23번은 01번 고양이 마크를 찾는 도착 안내입니다. ‘도착했지!’를 누르면 입력이나 정답 검증 없이 장소 소개 → 기존24번 사건 → ART 문제로 진행합니다. 제작자 모드는 화면 확인 도구이며 비밀번호로 접근을 제한한 기능은 아닙니다.

## 앞으로 수정하는 파일

- `story.js`: 원본 24장 대응, 대사·줄바꿈·제목·정답·힌트·표정·배경·인물·다음 장면 ID·장면별 좌표·색·글자 크기.
- `app.js`: 레이어 렌더링·한글 입력·저장·현재와 다음 한 장면 이미지 로딩.
- `engine.js`: 진행과 정답 판정.
- `style.css`, `index.html`: 레이아웃과 실제 텍스트·폼.
- `assets.json`, `assets/`: 압축 이미지와 로컬 WOFF 폰트.
- `creator-references/`: 비교창을 열었을 때 현재 한 장만 받는 압축 비교본.
- `data/`: 원본 대응 및 후속 코스 참고 자료.

수정 요청을 받으면 이 Git 저장소의 파일을 직접 수정하고 검사합니다. 이후 GitHub Desktop의 Changes에 수정 사항이 나타납니다. 커밋·푸시·외부 게시 여부는 해당 요청의 범위에 따라 처리합니다.

## 로컬 확인

`Start.cmd`를 실행하고 `http://127.0.0.1:8000/`를 엽니다. 또는 Node.js가 있는 환경에서 `node server.mjs`를 실행합니다. 서버 종료는 Ctrl+C입니다. 파일을 직접 더블클릭해 여는 방식은 JavaScript 모듈과 JSON 로딩이 제한될 수 있습니다.

테스트는 `npm test`, 자산 검사는 `npm run check`입니다. 외부 npm 패키지 설치는 필요하지 않습니다.

원본 JPG·감정 시트·미방문 장소 전체를 플레이 중 다운로드하지 않습니다. 제공된 압축 WebP·로컬 WOFF를 사용하며 외부 폰트·CDN·분석 SDK를 호출하지 않습니다. 서체는 제공된 Jua 대체 서체이므로 원본 서체와 일부 차이가 있습니다.

## 2026-10-13 후속 수정

5번에서 회상 대사를 표시한 뒤, 다음을 누를 때마다 6~9번 만화 한 컷씩 바뀝니다. 그동안 대사는 지워지거나 타이핑을 다시 시작하지 않습니다. 모든 말하는 고양이와 직원에 흰 테두리를 넣었습니다.

17~21번은 사서가 포함된 `2-로비2`의 압축 배경을 사용합니다. 사서를 별도 레이어로 중복 표시하지 않습니다. 직원은 추가 첨부한 남자 그림으로 교체하고, 외부 흰 배경은 표시 마스크로 가리되 흰 셔츠를 유지했습니다. 23번 현장 마크는 안경 쓰고 책 읽는 고양이로 교체했습니다.

제작자 모드의 원본 비교본은 최초 첨부한 24장 그대로입니다. 실제 게임은 위 후속 변경 사항을 반영합니다.

진행 테스트 11개와 자산 검사를 통과했습니다. Chrome에서 대사 DOM 유지·클릭별 만화 진행·새 배경/직원/마크·흰 테두리·동작 줄이기와 360/390/430px 터치 화면을 확인했습니다. 실제 스마트폰 키보드와 게시된 GitHub Pages의 최신 반영 상태는 별도 확인 항목입니다.

## 2026-10-14 이동 안내·정답 팝업

현장 마크 번호는 이미지에 합치지 않고 `markerNumber`로 관리합니다. 숫자 1을 넣으면 흰색 `01`이 원 오른쪽 위의 빈 공간에 표시됩니다.

이동 장면은 `type: 'move'`입니다. `destination`, `markerNumber`, `guideText`, `locationHints`(최대 2단계), `next`를 바꾸어 재사용합니다. 이동 장면에는 입력창이 없고, 도착 버튼에서만 `next`로 진행합니다. ‘못 찾겠어…’는 위치 힌트만 표시합니다. 안내와 힌트 안의 `{destination}`, `{markerNumber}`는 장면 데이터로 치환됩니다. 기본 배치는 `movementGeometry`에 모았습니다.

현재 23번의 `next`는 장소 소개 `learning-intro`입니다. 소개 뒤에 기존24번 `learning-paint`, 실제 `learning-room-art` 문제가 이어집니다. 도착 확인은 퍼즐 정답으로 저장하지 않습니다.

실제 퍼즐은 기존 입력을 유지하며, 정답 후 `successPopup`을 띄웁니다. 팝업의 ‘다음으로’ 버튼에서만 풀이를 완료하고 다음 장면으로 이동합니다. 팝업 대기 상태는 `pendingSuccess`(현재/다음ID·퍼즐ID·선택 문구)로 저장합니다. 기존 `pendingSuccessId`도 호환하며 저장 키와 기존 장면 ID를 유지합니다.

기본 팝업 문구는 `uiText.successPopup`, 퍼즐별 문구는 `puzzles[문제ID].successPopup`에서 수정합니다. 필요하면 장면의 `successPopup`으로 덮어쓸 수 있습니다. 지원 값은 `title`, `body`, `buttonLabel`, `cat`, `tone`이며 색감은 `gold`, `rose`, `mint`, `blue` 중에서 고를 수 있습니다.

예시 데이터(실제 후속 문제를 추가할 때 사용):

```js
{
  id:'move-next-room', type:'move', layout:'move',
  background:'lobby', cat:'bewildered', marker:true,
  destination:'다음 목적지', markerNumber:2,
  guideText:'{destination}에서 {markerNumber}번 고양이 마크를 찾아줘!',
  locationHints:['첫 번째 위치 힌트','두 번째 위치 힌트'],
  next:'추가한-실제-문제-ID'
}
```

진행·복원·재사용 테스트 14개 및 자산 검사를 통과했습니다. Chrome에서 이동 입력창 없음, 도착/힌트 동작, 정답 팝업의 진행 차단과 버튼 진행, 새로고침 복원, 이전·초기화, 번호 전체의 원 내부 표시, GitHub 저장소 하위 경로를 확인했습니다. 360/390/430px 폭 × 640/932/380px 높이의 9가지 터치 모사 환경에서 팝업·버튼 잘림과 동작도 확인했습니다. 실기기 키보드와 공개 배포 상태는 미확인입니다.

## 2026-10-14 ART 현장 퍼즐

진행은 23 도착 → 평생학습실(강의실1) 한 문장 소개 → 기존24 물감 사건 → 실제 안내문과 엽서의 ART 문제 → 칭찬 팝업 → 자국 대사 → 유아자료실02 도착 확인 → 준비 중입니다. 초반 대사와 사용자가 수정한 ‘도착했어?’·‘12글자’ 안내를 유지했습니다.

문구와 번호는 `story.js`의 `locations`, 장면, `puzzles['learning-room-art']`에서 바꿉니다. 01/02/03/04 번호 설정을 모았으며 현재 실제 이동 화면은01/02입니다. 번호 위치는 CSS의 `--marker-number-top`, `--marker-number-right`, `--marker-number-size`로 조정할 수 있습니다.

ART 화면은 실제 인쇄물을 보도록 안내합니다. `영어 3자리(소문자)`를 표시하고 `art`, `ART`, `Art`, 공백·전각 영문을 허용합니다. `art!`, `arts`, `물감`은 오답입니다. 한글 문장은 기존처럼 공백·?·!를 무시합니다. 영어 입력 속성으로 시스템 자판의 언어 전환을 보장하지 않으므로 26개 소문자 QWERTY 화면 키패드를 함께 제공합니다.

성공 고양이는 첨부된 같은 삼색 고양이의 웃는 눈 `happy.webp`입니다. 안내·힌트는 기존 `neutral.webp`를 씁니다. 새 이미지13.8KB와 기존 압축 소개 배경31.5KB는 해당 구간에서만 받습니다. 안내문·엽서·도안·정답 완성 참고 원본은 배포 저장소에 포함하지 않았습니다.

진행 테스트19개와 자산 검사를 통과했습니다. 이 작업 환경에는 npm 실행파일이 없어 package.json의 명령인 `node --test scripts/engine.test.mjs`, `node scripts/check-assets.mjs`를 직접 실행했습니다. 별도 빌드는 필요 없습니다. 실제 HTTP Chrome155에서 정답/오답·키패드·저장/복원·IME 이벤트·연타·하위 경로·원본 요청 부재를 확인했습니다. 모바일9조건과 키보드 공간을 모사한 축소 viewport에서도 터치·스크롤 접근을 확인했습니다.

실물 인쇄 정렬, 실제 Android/iOS 자판, 공개 Pages 배포는 미확인입니다. 현재 저장소에는 실제 마지막 퍼즐·미니게임·엔딩이 없으므로 해당 UI의 회귀를 실플레이로 검증할 수 없었습니다. 공통 문장/키워드/팝업 규칙은 별도 테스트 장면으로 확인했습니다. 다른 장소의 미정 문제·정답은 추가하지 않았습니다.

## 폰트 글자 누락 수정 — 2026-10-14

초반 문구에 맞춘 jua-opening-subset.woff에는 ‘강’·‘줄’ 등 새 문구의 글자가 없어 글자별 시스템 폰트 대체가 발생했습니다. 제공된 Jua-Regular.ttf의 지원 글자를 전부 유지한 로컬 jua-complete.woff(712,628B)로 교체했습니다. 원본의2519개 문자 매핑(한글2367개)을 유지하며, 이 서체 자체가 모든 희귀 한글 조합을 지원한다는 뜻은 아닙니다. 기존112,932B보다 최초 폰트 로딩은599,696B 늘지만 새 문구마다 초반 축약본을 다시 만드는 문제를 피합니다.

현재 코드·화면 데이터의 한글290종에 누락이 없고, Chrome의 실제 렌더링 폰트 조회에서 장소 띠와 ‘조금만 도와줄게!’ 전체가 Jua 웹폰트로 표시됨을 확인했습니다. 모바일9조건의 기존 브라우저 검증도 다시 통과했습니다. check-assets가 check-font를 함께 실행하므로 새 문구의 미지원 글자를 검사할 수 있습니다. OFL 라이선스를 유지했습니다. 로컬 수정이며 공개 Pages 반영은 별도 Commit/Push 후 확인합니다.
