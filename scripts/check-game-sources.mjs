import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),lock=JSON.parse(readFileSync(join(root,'games/upstream-lock.json'),'utf8')),config=JSON.parse(readFileSync(join(root,'scripts/game-sources.json'),'utf8'));
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
for(const [name,s]of Object.entries(lock.sources)){
 let compared=0;for(const file of s.files){if(hash(join(root,'games',name,file.file))!==file.bundledSha256)throw Error('기록 이후 본편 게임 파일 변경: '+name+'/'+file.file+' — 동기화 패치/기록 갱신 필요');const src=join(config[name].source,file.file);if(existsSync(src)){compared++;if(hash(src)!==file.sourceSha256)throw Error('최신 원본과 다름: '+name+'/'+file.file+' — node scripts/sync-games.mjs 실행 후 재검증');}}
 console.log(name+': bundled '+s.files.length+' files verified; local source '+compared+' files compared; '+s.commit.slice(0,7));
}
