import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inflateSync} from 'node:zlib';
import {chapters,puzzles,uiText} from '../story.js';

const root=resolve(import.meta.dirname,'..');
const css=readFileSync(resolve(root,'style.css'),'utf8');
const fontPath=css.match(/@font-face\{font-family:HaemiJua;src:url\('([^']+)'\)/)?.[1];
if(!fontPath)throw Error('게임 폰트 경로 없음');
const font=readFileSync(resolve(root,fontPath));
if(font.toString('ascii',0,4)!=='wOFF')throw Error('WOFF 파일 아님');
if(font.readUInt32BE(8)!==font.length)throw Error('WOFF 길이 불일치');
let cmap;
for(let i=0;i<font.readUInt16BE(12);i++){
  const entry=44+i*20;
  const offset=font.readUInt32BE(entry+4),packed=font.readUInt32BE(entry+8),length=font.readUInt32BE(entry+12);
  const data=font.subarray(offset,offset+packed);
  const table=packed<length?inflateSync(data):data;
  if(table.length!==length)throw Error('WOFF 테이블 길이 불일치');
  if(font.toString('ascii',entry,entry+4)==='cmap')cmap=table;
}
if(!cmap)throw Error('폰트 문자표 없음');
const codepoints=new Set();
for(let i=0;i<cmap.readUInt16BE(2);i++){
  const record=4+i*8,platform=cmap.readUInt16BE(record),encoding=cmap.readUInt16BE(record+2),offset=cmap.readUInt32BE(record+4);
  if(platform!==0&&!(platform===3&&[1,10].includes(encoding)))continue;
  const format=cmap.readUInt16BE(offset);
  if(format===4){
    const count=cmap.readUInt16BE(offset+6)/2;
    const ends=offset+14,starts=ends+2*count+2,deltas=starts+2*count,ranges=deltas+2*count;
    for(let segment=0;segment<count;segment++){
      const start=cmap.readUInt16BE(starts+segment*2),end=cmap.readUInt16BE(ends+segment*2);
      const delta=cmap.readInt16BE(deltas+segment*2),range=cmap.readUInt16BE(ranges+segment*2);
      for(let cp=start;cp<=end;cp++){
        let glyph=range?cmap.readUInt16BE(ranges+segment*2+range+(cp-start)*2):(cp+delta)&0xffff;
        if(range&&glyph)glyph=(glyph+delta)&0xffff;
        if(glyph)codepoints.add(cp);
      }
    }
  }else if(format===12){
    for(let group=0;group<cmap.readUInt32BE(offset+12);group++){
      const entry=offset+16+group*12,start=cmap.readUInt32BE(entry),end=cmap.readUInt32BE(entry+4),glyph=cmap.readUInt32BE(entry+8);
      for(let cp=start+(glyph===0?1:0);cp<=end;cp++)codepoints.add(cp);
    }
  }
}
const content=JSON.stringify({chapters,puzzles,uiText})+readFileSync(resolve(root,'app.js'),'utf8')+readFileSync(resolve(root,'index.html'),'utf8');
const korean=new Set(content.match(/[\uAC00-\uD7A3]/gu)||[]);
const missing=[...korean].filter(char=>!codepoints.has(char.codePointAt(0)));
if(missing.length)throw Error('게임 폰트에 없는 한글: '+missing.join(' '));
console.log(JSON.stringify({checkedFont:fontPath,fontBytes:font.length,checkedKoreanCharacters:korean.size,missingKoreanCharacters:missing},null,2));
