import test from 'node:test';import assert from 'node:assert/strict';
import {CREDITS_DATA as D} from '../credits/credits-data.js';
import {GENERAL_BOOKS,GENERAL_SHELF,getGeneralBookStates,getCreditsPose,getActorSample,drawCreditsFrame,loadCreditsImages,LOBBY_CAT_SCALE,TREAT_PICKUP,getTreatState,getPickupFrame,getCurtainCall} from '../credits/credits-player.js';
import {ACTIVITIES} from '../progress.js';

test('v5 retains the first five scene times, extends the lobby to 16s, and keeps thanks with seventeen images',()=>{
 assert.deepEqual(D.scenes.map(s=>s.id),['learning','nursery','sanitizer','general','shelves','lobby']);assert.equal(D.scenes.reduce((sum,s)=>sum+s.duration,0),62);assert.deepEqual(D.scenes.map(s=>s.duration),[8,10,10,8,10,16]);assert.equal(D.scenes[5].title,'도서관 로비');
 assert.equal(new Set(D.images).size,17);assert(!D.images.some(f=>/-32|source-art|preview|\.gif$/.test(f)));
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
 try{const first=await loadCreditsImages('test-credits-assets/'),second=await loadCreditsImages('test-credits-assets/');assert.strictEqual(first,second);assert.equal(loads,17);assert.deepEqual(Object.keys(first),D.images);}finally{globalThis.Image=original;}
});

test('the lobby uses its own four-row cat atlas at one scale, and pocket poses use the 3x2 atlas',()=>{
 for(const [t,row]of [[1,0],[4,1],[5.5,2],[7,3],[9.3,0]]){const p=getCreditsPose(5,t),sample=getActorSample('cat',p.cat,t);assert.equal(p.cat.scale,LOBBY_CAT_SCALE);assert.equal(LOBBY_CAT_SCALE,.84);assert.equal(sample.image,'sprites/cat-lobby-hd.png');assert.equal(sample.row,row);assert.equal(sample.columns,6);}
 for(const [frame,t]of TREAT_PICKUP.frameStarts.entries()){const pose=getCreditsPose(5,t).human,s=getActorSample('human',pose,t);assert.equal(getPickupFrame(t),frame);assert.equal(s.image,'sprites/librarian-pocket-hd.png');assert.equal(s.columns,3);assert.equal(s.row,Math.floor(frame/3));assert.equal(s.column,frame%3);}
 assert.equal(getCreditsPose(1,4).cat.atlas,undefined);assert.equal(getActorSample('cat',getCreditsPose(1,4).cat,4).row,1);
});

test('one treat slides continuously, stays on the floor until contact, then is held and occluded before stored',()=>{
 assert.equal(getTreatState(7.95).state,'floor');assert.equal(getTreatState(7.96).state,'held');assert.equal(getTreatState(8.7).state,'pocketing');assert.equal(getTreatState(9.1).state,'stored');
 let prior=getTreatState(4.79);for(let t=4.8;t<=5.36;t+=.01){const next=getTreatState(t);assert(Math.hypot(next.x-prior.x,next.y-prior.y)<1);assert.equal(next.state,'floor');prior=next;}
 const before=getTreatState(7.959),after=getTreatState(7.96);assert(Math.hypot(before.x-after.x,before.y-after.y)<1);
 for(const t of [0,4.8,5.35,7.95,7.96,8,8.35,8.7,8.9,9.1,12.4,60])assert.equal(getTreatState(t).size,12);
 const a=getTreatState(8.7),b=getTreatState(9.099);assert.equal(a.x,b.x);assert.equal(a.clipY,b.clipY);assert(b.y>a.y);assert(b.progress>.99);assert(TREAT_PICKUP.pocketEnd<9.5);
 for(const t of [9.5,12.3,16,60])assert.equal(getTreatState(t).state,'stored');
});

test('curtain call starts standing from frame2 and waves only the two free hands indefinitely',()=>{
 assert.equal(getCurtainCall(9.49),null);assert.equal(getCurtainCall(9.5).frame,2);assert.equal(getCurtainCall(10.6).phase,'bow');assert.equal(getCurtainCall(11.2).phase,'bow-hold');assert.equal(getCurtainCall(11.8).phase,'rise');
 for(const t of [12.3,16,62,200]){const p=getCurtainCall(t);assert.equal(p.phase,'wave');assert.equal(p.frame,8);assert(Math.abs(p.humanHandAngle)<=.16);assert(Math.abs(p.catHandAngle)<=.20);}
 assert.notEqual(getCurtainCall(16).humanHandAngle,getCurtainCall(16.2).humanHandAngle);
 const images=Object.fromEntries(D.images.map(file=>[file,{file,width:file.includes('pocket')?384:file.includes('run-hd')?512:768}]));
 for(const t of [7.95,7.96,8.35,8.9,9.1,9.5,11,12.4,18]){
  const calls=[],clips=[],ctx={save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},clip(){},rect(...r){clips.push(r)},fillRect(){},drawImage(im,...r){calls.push({file:im.file,r})}};
  drawCreditsFrame(ctx,images,5,t);const packets=calls.filter(c=>c.file==='sprites/props.png'&&c.r[0]===96&&c.r[1]===32);assert.equal(packets.length,t<9.1?1:0);
  if(t===8.9){assert.equal(clips.length,1);assert.equal(clips[0][3],getTreatState(t).clipY);assert.deepEqual(packets[0].r.slice(-4),[-6,-6,12,12]);}
  if(t>=9.5)assert(!calls.some(c=>['sprites/cat-lobby-hd.png','sprites/librarian-hd.png','sprites/librarian-pocket-hd.png'].includes(c.file)));
  if(t>=12.4){assert.equal(calls.filter(c=>c.file==='sprites/curtain-wave-body.png').length,1);assert.equal(calls.filter(c=>c.file==='sprites/curtain-wave-hands.png').length,2);assert(!calls.some(c=>c.file==='sprites/curtain-call-hd.png'));}
 }
});
