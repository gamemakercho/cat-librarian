import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {chapters} from '../story.js';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(resolve(root,'assets.json'),'utf8'));
const used=new Set();
for(const s of chapters.flatMap(c=>c.scenes)){
  for(const [field,prefix] of [['background','bg'],['cat','cat'],['comic','comic'],['illustration','prop']]){
    if(s[field])used.add(prefix+':'+s[field]);
  }
  if(s.staff)used.add('actor:staff');if(s.sleeping)used.add('actor:sleeping');if(s.marker)used.add('prop:marker');
}
for(const key of used){if(!manifest[key])throw Error('없는 자산 '+key);const file=resolve(root,manifest[key].src);
  if(statSync(file).size!==manifest[key].bytes)throw Error('자산 크기 불일치 '+key);
}
const html=readFileSync(resolve(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('중복 HTML id');
const code=readFileSync(resolve(root,'app.js'),'utf8');
for(const m of code.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(m[1]))throw Error('없는 UI '+m[1]);
const sum=[...used].reduce((a,k)=>a+manifest[k].bytes,0);
const allJpg=readFileSync(resolve(root,'reference-metadata.json'),'utf8');
const raw=JSON.parse(allJpg).totalBytes;
console.log(JSON.stringify({usedImageCount:used.size,openingImageBytes:sum,originalScreenBytes:raw,imageBytesReductionPercent:(1-sum/raw)*100,
  checked:'장면 연결·이미지 경로/크기·UI id. 실제 모바일 브라우저 검증은 별도.'},null,2));
