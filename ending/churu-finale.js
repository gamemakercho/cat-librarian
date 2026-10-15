// Story-only overrides; the source engine and measured forehead geometry stay intact.
export const CHURU = Object.freeze({x:260,y:1068,width:112,height:38,rotation:-0.22});
export const CHURU_FINALE = Object.freeze({
  contactSeconds:1.05,
  trackingSeconds:8.4,
  horizontalFeint:-28,
  stairWaypoints:Object.freeze([
    {x:566,y:264},{x:481,y:333},{x:534,y:414},{x:426,y:501},
    {x:483,y:604},{x:354,y:711},{x:510,y:870},{x:430,y:1005}
  ].map(Object.freeze))
});

// A tiny canvas prop, rather than another downloaded illustration or sprite sheet.
export function drawChuru(ctx,state){
  ctx.save();ctx.translate(CHURU.x,CHURU.y);ctx.rotate(CHURU.rotation);
  ctx.fillStyle='rgba(98,68,43,.16)';ctx.beginPath();ctx.ellipse(0,10,65,13,0,0,Math.PI*2);ctx.fill();
  ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#805039';ctx.fillStyle='#ed8065';
  ctx.beginPath();ctx.moveTo(-56,-19);ctx.lineTo(56,-19);ctx.lineTo(52,19);ctx.lineTo(-52,19);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f9d391';ctx.lineWidth=4;
  for(const x of [-47,47]){ctx.beginPath();ctx.moveTo(x,-15);ctx.lineTo(x,15);ctx.stroke();}
  ctx.fillStyle='#fffaf0';ctx.font='26px HaemiJua, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('츄르',0,0);
  ctx.restore();
  if(['idle','countdown'].includes(state.phase)||(state.phase==='tracking'&&state.phaseTime<1.5)){
    ctx.save();ctx.font='34px HaemiJua, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=7;
    ctx.strokeStyle='#fffaf0';ctx.fillStyle='#8b4e39';ctx.strokeText('츄르!',CHURU.x,CHURU.y-54);ctx.fillText('츄르!',CHURU.x,CHURU.y-54);ctx.restore();
  }
}
