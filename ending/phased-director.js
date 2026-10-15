import {RescueEngine} from './engine.js';
import {directRescue} from './auto-director.js';
import {CHURU_FINALE} from './churu-finale.js';
export class PhasedFinale {
  constructor({part='full',onComplete=()=>{}}={}){
    this.part=['approach','restore','full'].includes(part)?part:'full';
    this.awaitingAnswer=false;
    this.engine=new RescueEngine({config:CHURU_FINALE,onComplete,
      onEvent:event=>{if(event.type==='forehead-bump'&&this.part==='approach'){
        this.awaitingAnswer=true;this.engine.pause('awaiting-answer');
      }}});
  }
  start(){
    this.engine.start();
    if(this.part==='restore'){
      // Reconstruct exactly the same contact pose; do not replay the approach.
      for(let i=0;i<3600&&this.engine.snapshot().phase!=='contact';i++)this.advance(1/120);
      if(this.engine.snapshot().phase!=='contact')throw Error('충돌 장면을 준비하지 못했어요');
    }
  }
  advance(dt){if(this.awaitingAnswer)return this.engine.snapshot();directRescue(this.engine,dt);return this.engine.advance(dt);}
  snapshot(){return this.engine.snapshot();}
}
