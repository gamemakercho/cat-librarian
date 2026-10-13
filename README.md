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

일반 플레이와 제작자 저장은 분리됩니다. 23번 현장 마크 정답은 미정이므로 일반 플레이는 이곳에서 멈춥니다. 제작자 모드에서는 정답 기록 없이 24번까지 확인할 수 있습니다. 제작자 모드는 화면 확인 도구이며 비밀번호로 접근을 제한한 기능은 아닙니다.

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
