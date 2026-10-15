// Keep the source engine/renderer unchanged. Move the cat for the movie version;
// the original interactive game remains at the user's existing /library/ URL.
export function directRescue(engine,dt){
  const s=engine.snapshot();if(s.paused||!s.inputEnabled)return;
  const target=['slip','assist'].includes(s.phase)?s.landingX:s.human.x;
  const rate=['slip','assist'].includes(s.phase)?620:250;
  const distance=target-s.catX;
  engine.moveCat(s.catX+Math.sign(distance)*Math.min(Math.abs(distance),Math.max(0,dt)*rate));
}
