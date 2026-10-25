// Native scene coordinates remain unchanged. Only the main story flow is fitted here.
export const usesStoryFlow=scene=>['dialogue','comic'].includes(scene.type)&&!scene.endingArt;
export function layoutStoryFlow(stage,scene){
 if(!usesStoryFlow(scene))return;
 const width=stage.clientWidth;stage.style.setProperty('--story-native-height',width*1.8+'px');
 const height=stage.clientHeight,scale=width/500,css=getComputedStyle(stage);
 const value=(name,fallback)=>{const number=parseFloat(css.getPropertyValue(name));return Number.isFinite(number)?number:fallback;};
 const shift=value('--story-flow-shift',32),gap=value('--story-flow-gap',14),safe=value('--story-flow-bottom',12);
 const byId=id=>document.getElementById(id),box=byId('dialogue'),button=byId('nextButton'),g=scene.geometry;
 const rect=r=>({x:r[0]*scale,y:r[1]*scale,w:r[2]*scale,h:r[3]*scale});
 const set=(el,r)=>Object.assign(el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});
 const d=rect(g.dialogue),n=rect(g.nextButton);n.h=Math.max(44,n.h);
 // Measure the complete line, never the transient typewriter text or previous scene.
 const probe=box.cloneNode(false);probe.removeAttribute('id');probe.setAttribute('aria-hidden','true');
 const paragraph=document.createElement('p');paragraph.textContent=scene.text||'';probe.append(paragraph);
 Object.assign(probe.style,{visibility:'hidden',pointerEvents:'none',left:'0',top:'0',width:d.w+'px',height:'auto',overflow:'visible'});stage.append(probe);
 const contentHeight=probe.getBoundingClientRect().height;probe.remove();
 d.h=Math.min(Math.max(d.h,contentHeight),height*.46);d.y+=shift;
 let image=stage.querySelector('.comic-panel,.story-scene-art'),imageRect;
 if(image){
  imageRect=rect(scene.storyArt?g.storyArt:g.comic);imageRect.y+=shift;
  const ratio=scene.storyArt?1:3/2;
  imageRect.h=imageRect.w/ratio;
  // Short viewports reduce only the illustration, preserving its aspect ratio.
  const room=height-safe-n.h-gap-d.h-gap-imageRect.y;
  imageRect.h=Math.max(60,Math.min(imageRect.h,room));imageRect.w=Math.min(imageRect.w,imageRect.h*ratio);
  imageRect.x=(width-imageRect.w)/2;set(image,imageRect);
  d.y=Math.max(d.y,imageRect.y+imageRect.h+gap);
 }
 d.y=Math.min(d.y,height-safe-n.h-gap-d.h);
 if(imageRect)d.y=Math.max(d.y,imageRect.y+imageRect.h+gap);
 n.y=Math.max(n.y+shift,d.y+d.h+gap);
 if(n.y+n.h>height-safe)n.y=height-safe-n.h;
 // The button stays outside the scrollable dialogue even for unusually long copy.
 d.h=Math.max(50,Math.min(d.h,n.y-gap-d.y));set(box,d);set(button,n);
 for(const [selector,key]of [['.character.cat','cat'],['.character.staff','staff'],['.ending-actor','actor'],['.shelf-actor','shelfActor']]){
  const el=stage.querySelector(selector);if(!el)continue;const r=rect(g[key]);r.y+=shift;
  if(key==='shelfActor'&&scene.shelfSurface){const s=scene.shelfSurface,bgScale=Math.max(width/s.width,height/s.height),cropY=(height-s.height*bgScale)/2;r.y=cropY+s.y*bgScale-r.h*s.anchorY;}
  else if(r.y+r.h>d.y-gap)r.y=Math.max(0,d.y-gap-r.h);set(el,r);
 }
 stage.dataset.flowShift=String(shift);stage.dataset.flowGap=String(gap);
}
