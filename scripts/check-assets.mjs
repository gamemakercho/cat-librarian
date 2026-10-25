import {readFileSync,statSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {chapters,puzzles,uiText} from '../story.js';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(resolve(root,'assets.json'),'utf8'));
const used=new Set();
for(const config of [uiText.successPopup,...Object.values(puzzles).map(p=>p.successPopup)])if(config?.cat)used.add('cat:'+config.cat);
for(const p of Object.values(puzzles))for(const icon of Object.values(p.icons||{}))used.add(icon.assetKey);
used.add('cat:neutral');
for(const s of chapters.flatMap(c=>c.scenes)){
  for(const [field,prefix] of [['background','bg'],['cat','cat'],['comic','comic'],['illustration','prop'],['decoration','prop'],['cipher','prop'],['endingArt','ending'],['storyArt','story']]){
    if(s[field])used.add(prefix+':'+s[field]);
  }
  if(s.shelfActor)used.add('actor:shelf-librarian');if(s.noticeText)used.add('icon:rule_book_cart');
  if(s.actor)used.add('actor:'+s.actor);
  if(s.staff)used.add('actor:staff');if(s.sleeping)used.add('actor:sleeping');if(s.marker)used.add('prop:marker');
}
for(const key of used){if(!manifest[key])throw Error('없는 자산 '+key);const file=resolve(root,manifest[key].src);
  if(statSync(file).size!==manifest[key].bytes)throw Error('자산 크기 불일치 '+key);
  if(manifest[key].fallback)statSync(resolve(root,manifest[key].fallback));
  if(manifest[key].sha256&&createHash('sha256').update(readFileSync(file)).digest('hex')!==manifest[key].sha256)throw Error('제공 그림 원본 변경 '+key);
  if(manifest[key].render?.clip)statSync(resolve(root,manifest[key].render.clip));
}
const html=readFileSync(resolve(root,'index.html'),'utf8');
for(const asset of Object.values(manifest))if(/(?:^|\/)references\//.test(asset.src))throw Error('제작 원본이 runtime manifest에 있음');
for(const file of readdirSync(root,{recursive:true}))if(/(?:01_door_sign|02_postcard|03_alignment_layer|04_solved_alignment|emerald-reading-cat-base|cat-library-notice|all-14-icons-index|objects-grid-original|actions-grid-original|library-notice-A3|physical-nameplate-latest|puzzle-original|MASTER_SCENARIO|general-pc-paint-original|game-code-snapshots)/.test(file))throw Error('배포 폴더에 새 제작 참고 원본이 있음: '+file);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('중복 HTML id');
const code=readFileSync(resolve(root,'app.js'),'utf8');
for(const m of code.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(m[1]))throw Error('없는 UI '+m[1]);
const sum=[...used].reduce((a,k)=>a+manifest[k].bytes,0);
const allJpg=readFileSync(resolve(root,'reference-metadata.json'),'utf8');
const raw=JSON.parse(allJpg).totalBytes;
console.log(JSON.stringify({usedImageCount:used.size,openingImageBytes:sum,originalScreenBytes:raw,imageBytesReductionPercent:(1-sum/raw)*100,
  checked:'장면 연결·이미지 경로/크기·UI id. 실제 모바일 브라우저 검증은 별도.'},null,2));
await import('./check-font.mjs');
const games=JSON.parse(readFileSync(resolve(root,'games/origins.json'),'utf8'));
for(const asset of [...games.assets,...games.unchangedRules]){
 const file=readFileSync(resolve(root,'games',asset.file));
 if(asset.bytes&&file.length!==asset.bytes)throw Error('게임 자산 크기 불일치 '+asset.file);
 if(createHash('sha256').update(file).digest('hex')!==asset.sha256)throw Error('게임 자산/원본 판정 변경 '+asset.file);
}
console.log(JSON.stringify({gameAssets:games.assets.length,gameAssetBytes:games.assets.reduce((sum,a)=>sum+a.bytes,0),unchangedRuleFiles:games.unchangedRules.length}));

await import('./check-ending.mjs');

await import('./check-order-letters.mjs');

await import('./check-game-sources.mjs');
