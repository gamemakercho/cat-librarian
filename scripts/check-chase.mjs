import {readFileSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..'),base=resolve(root,'games/librarian-chase');
const read=file=>readFileSync(resolve(base,file),'utf8');
const records=JSON.parse(read('SOURCE.json')).verified;
for(const record of records){const bytes=readFileSync(resolve(base,record.file));if(bytes.length!==record.bytes||createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error('추격 원본 자산 변경: '+record.file)}
for(const file of ['config.js','engine.js','renderer.js','story-bridge.js','app.js'])for(const m of read(file).matchAll(/from\s+['"]([^'"]+)['"]/g)){if(!m[1].startsWith('.')||!existsSync(resolve(base,dirname(file),m[1])))throw Error('추격 모듈 경로 오류: '+m[1]);}
const ids=[...read('index.html').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('추격 HTML ID 중복');
for(const m of read('app.js').matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(m[1]))throw Error('추격 HTML ID 누락: '+m[1]);
if(/postcard-back|assets\/reference/.test(read('app.js')+read('index.html')))throw Error('정답 전 참고 원본 노출');
for(const f of ['assets/ending/ending-01-chase.png','assets/ending/ending-02-treat.png','assets/ending/ending-03-sparkle.png','assets/ending/ending-04-trip.png','assets/ending/ending-05-jump.png']){const png=readFileSync(resolve(base,f));if(png.readUInt32BE(16)!==1536||png.readUInt32BE(20)!==1024)throw Error('엔딩 크기 변경')}
console.log(JSON.stringify({chaseOriginalAssets:records.length,chaseOriginalBytes:records.reduce((n,f)=>n+f.bytes,0),endingPanels:5,relativeModules:'검증 통과',privateReferences:'배포 제외',browserQA:'별도 확인 필요'},null,2));
