import {readFileSync,existsSync,readdirSync} from 'node:fs';import {resolve} from 'node:path';import {createHash} from 'node:crypto';
import {CREDITS_DATA as D} from '../credits/credits-data.js';
const root=resolve(import.meta.dirname,'..'),records=JSON.parse(readFileSync(resolve(root,'credits/SOURCE.json'),'utf8'));
for(const r of records.files){const file=resolve(root,'credits',r.file);if(!existsSync(file))throw Error('없는 크레딧 파일 '+r.file);const bytes=readFileSync(file),hash=createHash('sha256').update(bytes).digest('hex');if(r.file==='credits-player.js'){if(hash!==r.bundledSha256)throw Error('기록 이후 크레딧 재생기 변경');continue;}if(bytes.length!==r.bytes||hash!==r.sha256)throw Error('제공 크레딧 자산 변경 '+r.file);}
if(D.images.length!==12||records.images!==12||D.scenes.reduce((sum,s)=>sum+s.duration,0)!==57)throw Error('크레딧 이미지/시간 변경');
for(const file of readdirSync(resolve(root,'credits'),{recursive:true}))if(/source-art|preview|\.gif$|(?:cat|librarian)(?:-32)?\.(?:png|json)$/.test(file))throw Error('크레딧 배포에 불필요한 대안/원본 '+file);
const run=JSON.parse(readFileSync(resolve(root,'credits/sprites/librarian-run-hd.json'),'utf8'));
if(run.frames!==8||run.columns!==4||run.rows!==2||run.fps!==12||JSON.stringify(run.pivot)!=='[64,124]')throw Error('달리기 전용8프레임 메타데이터 불일치');
console.log(JSON.stringify({creditsImages:D.images.length,creditsImageBytes:D.images.reduce((sum,file)=>sum+readFileSync(resolve(root,'credits',file)).length,0),durationSeconds:57,runFrames:8,sourceRevision:records.revision}));
