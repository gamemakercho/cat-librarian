import test from 'node:test';import assert from 'node:assert/strict';
import {CREDITS_DATA as D} from '../credits/credits-data.js';
import {GENERAL_BOOKS,GENERAL_SHELF,getGeneralBookStates,getCreditsPose,getActorSample,drawCreditsFrame,loadCreditsImages} from '../credits/credits-player.js';
import {ACTIVITIES} from '../progress.js';

test('credits retain six scenes, 57 seconds, twelve images and permanent play-thanks closing',()=>{
 assert.deepEqual(D.scenes.map(s=>s.id),['learning','nursery','sanitizer','general','shelves','lobby']);assert.equal(D.scenes.reduce((sum,s)=>sum+s.duration,0),57);assert.equal(D.scenes[3].duration,8);
 assert.equal(new Set(D.images).size,12);assert(!D.images.some(f=>/-32|source-art|preview|\.gif$/.test(f)));
 assert.deepEqual(D.closing,['오늘 우리가 함께한 것들,','꼭 알고 기억해 줄 거라고 믿어.','끝까지 플레이해 줘서 정말 고마워.','명예사서님!']);
 assert.equal(ACTIVITIES.length,11);assert(!ACTIVITIES.some(a=>a.id.includes('credit')));
});
test('three unique books fall once, are picked in sequence, and stay shelved without floor books',()=>{
 assert.equal(GENERAL_BOOKS.length,3);assert.equal(new Set(GENERAL_BOOKS.map(b=>b.slotX)).size,3);
 assert(getGeneralBookStates(0).every(b=>b.state==='hidden'));assert(getGeneralBookStates(2.5).every(b=>b.state==='floor'));
 for(let i=0;i<3;i++){const b=GENERAL_BOOKS[i];assert.equal(getGeneralBookStates(b.pickAt+.3)[i].state,'carried');assert.equal(getGeneralBookStates(b.pickAt+1.01)[i].state,'shelved');}
 for(const t of [6.31,7,7.99])assert(getGeneralBookStates(t).every(b=>b.state==='shelved'));
 for(let t=0;t<8;t+=.05){const p=getCreditsPose(3,t);assert.equal(p.camera,0);assert.equal(p.human.action,'run');assert(p.cat.x<p.human.x);}
 for(const b of GENERAL_BOOKS)assert.equal(getCreditsPose(3,b.pickAt+.3).cat.action,'reshelve');
 assert.equal(getCreditsPose(3,7).cat.action,'run');assert(getCreditsPose(3,7.5).cat.x>getCreditsPose(3,7).cat.x);
});
test('human run samples all eight 4x2 frames at 12fps, while other motions retain six-column sheets',()=>{
 for(let i=0;i<8;i++){const s=getActorSample('human',{action:'run'},(i+.01)/12);assert.equal(s.image,'sprites/librarian-run-hd.png');assert.equal(s.frame,i);assert.equal(s.column,i%4);assert.equal(s.row,Math.floor(i/4));assert.equal(s.columns,4);}
 assert.equal(getActorSample('human',{action:'run'},8/12).frame,0);
 for(const t of GENERAL_BOOKS.map(b=>b.dropAt))assert.equal(getActorSample('human',getCreditsPose(3,t).human,t).image,'sprites/librarian-run-hd.png');
 assert.equal(getActorSample('human',{action:'hop'},0).image,'sprites/librarian-hd.png');const cat=getActorSample('cat',{action:'reshelve'},0);assert.equal(cat.row,7);assert.equal(cat.columns,6);
 assert.deepEqual(D.pivot,[32,62]);assert.equal(D.frameSize,64);
});
test('draw calls mask only slot interiors above y144 and move only transparent book-only images',()=>{
 const images=Object.fromEntries(D.images.map(file=>[file,{file,width:file.includes('librarian-run')?512:file.includes('-hd')?768:128}]));
 for(const t of [0,1.4,2.5,3.5,4.9,5.8,7.9]){
  const calls=[],ctx={save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},clip(){},rect(...r){calls.push({type:'clip',r})},fillRect(...r){calls.push({type:'fill',r})},drawImage(im,...r){calls.push({type:'image',file:im.file,r})}};
  drawCreditsFrame(ctx,images,3,t);const clips=calls.filter(c=>c.type==='clip');assert.equal(clips.length,3);assert.deepEqual(clips.map(c=>c.r[0]),GENERAL_BOOKS.map(b=>b.slotX-3));
  for(const c of calls.filter(c=>['clip','fill'].includes(c.type))){assert(c.r[1]>=GENERAL_SHELF.top);assert(c.r[1]+c.r[3]<=144);}
  const backgrounds=calls.filter(c=>c.file?.startsWith('backgrounds/'));assert.equal(backgrounds.length,1);assert.deepEqual(backgrounds[0].r.map(n=>n||0),[0,0,576,192]);
  assert(!calls.some(c=>c.type==='image'&&c.file==='sprites/props.png'));
  const moving=calls.filter(c=>c.type==='image'&&/book-.*-only/.test(c.file));if(t===2.5)assert.equal(moving.length,3);if(t===7.9)assert.equal(moving.length,0);
  for(const actor of calls.filter(c=>c.type==='image'&&c.file.includes('-hd.png'))){assert.deepEqual(actor.r.slice(-4),[-32,-62,64,64]);assert.equal(actor.r[2],128);assert.equal(actor.r[3],128);}
 }
});
test('mopping removes shoe traces, repair holds the cat, and lobby contact remains readable for two seconds',()=>{
 const repair=getCreditsPose(2,8.8);assert.equal(repair.cat.action,'repair');assert.equal(repair.cat.x,302);assert(repair.human.x>repair.cat.x);assert.equal(repair.human.action,'hop');
 assert.equal(getCreditsPose(1,4).cat.action,'mop');
 for(const t of [4.91,5.5,6.89])assert(getCreditsPose(5,t).impact);assert(!getCreditsPose(5,7).impact);
 assert(getCreditsPose(5,5.5).human.mirror);assert.equal(getCreditsPose(5,10.6).cat.action,'happy');
});
test('image objects are loaded once and reused across credits re-entry',async()=>{
 const original=globalThis.Image;let loads=0;
 globalThis.Image=class{set src(value){loads++;queueMicrotask(()=>this.onload());}async decode(){}};
 try{const first=await loadCreditsImages('test-credits-assets/'),second=await loadCreditsImages('test-credits-assets/');assert.strictEqual(first,second);assert.equal(loads,12);assert.deepEqual(Object.keys(first),D.images);}finally{globalThis.Image=original;}
});
