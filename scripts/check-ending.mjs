import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
for(const [html,scripts] of [['index.html',['app.js','ending-ui.js','fold-reference.js']],['ending/index.html',['ending/player.js']]]){
 const ids=[...read(html).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)throw Error('중복 엔딩 UI ID '+html);
 for(const file of scripts)for(const match of read(file).matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(match[1]))throw Error('없는 엔딩 UI '+file+':'+match[1]);
}
if(/<iframe[^>]*id="endingFrame"[^>]*\bsrc=/u.test(read('index.html')))throw Error('엔딩을 버튼 전에 내려받고 있음');
const modules=['ending/player.js','ending/auto-director.js','ending/phased-director.js','ending/churu-finale.js','ending/engine.js','ending/renderer.js','ending/impact-cutin.js','ending/scene-config.js','ending/asset-loader.js','ending-course.js','ending-ui.js','ending-bridge.js'];
for(const file of modules)for(const match of read(file).matchAll(/from\s+['"]([^'"]+)['"]/g)){
 if(match[1].startsWith('.')&&!existsSync(resolve(root,dirname(file),match[1])))throw Error('없는 엔딩 모듈 '+match[1]);
}
const records=JSON.parse(read('ending/SOURCE.json'));
const impact=readFileSync(resolve(root,'ending/assets/postcard-impact.webp'));
if(createHash('sha256').update(impact).digest('hex')!==records.userSuppliedImpact.runtimeSha256)throw Error('첨부 충돌 그림의 픽셀이 변경됨');
if(JSON.stringify(JSON.parse(read('ending/assets/postcard-impact.json')).content_rect)!==JSON.stringify([122,328,536,323]))throw Error('첨부 충돌 그림 표시 좌표 변경');
for(const file of records.files.filter(f=>f.sha256&&!f.source.endsWith('/asset-loader.js'))){
 const name=new URL(file.source).pathname.split('/').at(-1),bytes=readFileSync(resolve(root,'ending',name));
 if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('원본 구출/충돌 좌표 변경 '+name);
}
const files=['staircase-background.webp','librarian-actions.webp','cat-actions.webp','librarian-run-8frames.webp','postcard-impact.webp','librarian-actions.json','cat-actions.json','librarian-run-8frames.json','postcard-impact.json'];
for(const file of files)statSync(resolve(root,'ending/assets',file));
const cinemaBytes=files.reduce((sum,f)=>sum+statSync(resolve(root,'ending/assets',f)).size,0);
if(cinemaBytes>1500000)throw Error('엔딩 이미지 예산 초과');
for(const name of ['fold-hint.svg','fold-step-1.svg','fold-step-2.svg','postcard-fold-guide.svg']){
 const content=read(`assets/ending/${name}`);
 if(!content.includes('http://www.w3.org/2000/svg'))throw Error('접기 SVG 오류');
 if(content.includes('돌아왔다')||content.includes('뒤바뀌었다'))throw Error('접기 안내에 정답이 노출됨');
 if(/<image|data:image|머리|고양이|사서/u.test(content))throw Error('접기 안내에 캐릭터/완성 힌트가 있음');
}
if(existsSync(resolve(root,'assets/ending/fold-step-3.svg')))throw Error('예전 완성 접기 그림이 남아 있음');
console.log(JSON.stringify({endingImagesAndMetadataBytes:cinemaBytes,foldGuideBytes:['fold-step-1.svg','fold-step-2.svg','fold-hint.svg','postcard-fold-guide.svg'].reduce((n,s)=>n+statSync(resolve(root,'assets/ending',s)).size,0),endingUI:'HTML ID·두 단계·접촉/복구 경계·지연 iframe·상대 모듈 경로 확인',sourceEngineAndGeometry:'원본 해시 확인',browserQA:'이 명령은 정적 검사만 실행 — 브라우저·실기기 결과는 검증 보고서 참조'},null,2));

for(const id of ['ending-03-impact','ending-04-returned','ending-05-thanks'])for(const ext of ['webp','png'])statSync(resolve(root,'assets/ending',id+'.'+ext));
const runner=JSON.parse(read('games/ending-chase/SOURCE.json'));
for(const file of runner.unchanged){if(createHash('sha256').update(readFileSync(resolve(root,'games/ending-chase',file.file))).digest('hex')!==file.sha256)throw Error('달리기 원본 규칙 변경 '+file.file);}
console.log('새 엔딩3장 WebP/PNG 및 기존 달리기 판정/물리 원본 해시 확인');

const foldReferenceManifest=JSON.parse(read('assets/ending/postcard-fold-complete.json'));
for(const item of foldReferenceManifest.files.filter(f=>f.runtime)){const file='assets/ending/'+item.path.split('/').at(-1),bytes=readFileSync(resolve(root,file));if(bytes.length!==item.bytes||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('첨부 접기 그림 바이트 불일치 '+file);}
console.log('마지막 문제 참고 그림 WebP/PNG의 첨부 크기·SHA-256 및 UI ID 확인');
