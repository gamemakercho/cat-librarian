import test from 'node:test';
import assert from 'node:assert/strict';
import {createStoryBridge} from '../games/librarian-chase/story-bridge.js';
import {isEndingMessage,ENDING_READY,ENDING_CONTACT} from '../ending-bridge.js';
test('추격 게임 iframe은 본편의 출처·세션·플레이ID 계약을 그대로 사용한다',()=>{
 const messages=[],frame={parent:{postMessage:(data,origin)=>messages.push({data,origin})}};
 const location={origin:'https://gamemakercho.github.io',search:'?part=approach&parentOrigin=https%3A%2F%2Fgamemakercho.github.io&session=session-123&runId=run-12345678'};
 const bridge=createStoryBridge(frame,location),active={origin:location.origin,part:'approach',session:'session-123',runId:'run-12345678'};
 assert(bridge.embedded);bridge.ready();bridge.contact();assert.equal(bridge.contact(),false);
 for(const [i,type]of [ENDING_READY,ENDING_CONTACT].entries())assert(isEndingMessage({source:frame,origin:location.origin,data:messages[i].data},active,frame,type));
 assert(messages.every(m=>m.origin===location.origin));assert.equal(messages[1].data.result.completed,false);
 for(const query of ['?part=restore','?part=approach&parentOrigin=https://evil.invalid','?part=approach&parentOrigin=https://gamemakercho.github.io&session=short&runId=run-12345678']){const bad=createStoryBridge(frame,{...location,search:query});assert.equal(bad.embedded,false);assert.equal(bad.contact(),false)}
 const standalone={};standalone.parent=standalone;assert.equal(createStoryBridge(standalone,location).embedded,false);
});
