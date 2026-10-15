// Embedded edition: original game rules/graphics stay in their own modules.
(function(){
 const q=new URLSearchParams(location.search);let host=null;
 try{const origin=new URL(q.get('storyOrigin')).origin;
  if(parent!==window&&q.get('storyBridge')==='1'&&origin===q.get('storyOrigin')&&/^https?:/.test(origin)&&q.get('storySession')&&q.get('storyGameId'))
   host={origin,session:q.get('storySession'),gameId:q.get('storyGameId')};
 }catch{}
 const runId=/^[a-zA-Z0-9-]{8,80}$/.test(q.get('storyRunId')||'')?q.get('storyRunId'):'standalone';
 let lastClear='',height=visualViewport?.height||innerHeight,width=innerWidth,touchY=0;
 const send=(type,extra={})=>{if(host)parent.postMessage({type:'cat-librarian:'+type,version:1,...host,...extra},host.origin);};
 function resize(){if(!host)return;const h=visualViewport?.height||innerHeight; height=innerWidth!==width?h:Math.min(height,h);width=innerWidth;document.documentElement.style.setProperty('--game-height',height+'px');}
 function keywordBlock(){const block=document.createElement('div');block.className='story-keyword';
  const label=document.createElement('span');label.textContent='클리어 키워드';
  const word=document.createElement('strong');word.textContent=q.get('storyKeyword')||'';
  const note=document.createElement('p');note.textContent='이야기로 돌아가서 이 낱말을 입력해 줘!';block.append(label,word,note);return block;
 }
 const api={embedded:!!host,runId,
  ready(){send('minigame-ready');},error(error){console.error(error);send('minigame-error');},
  clear(result){if(!host||!result?.cleared)return;const signature=JSON.stringify(result);if(signature!==lastClear){lastClear=signature;send('minigame-clear',{result});}},
  reset(){lastClear='';},
  returnToStory(result){if(host&&result?.cleared)send('minigame-return',{result});},
  addCatchResult(result,restart){if(!host||!result.cleared)return;api.clear(result);
   document.querySelector('#instructions').append(keywordBlock());
   const primary=document.querySelector('#primary');primary.textContent='이야기로 돌아가기';
   document.querySelector('#storyRetry')?.remove();const retry=document.createElement('button');retry.id='storyRetry';retry.type='button';retry.className='story-retry';retry.textContent='다시하기';retry.onclick=restart;primary.after(retry);
  },
  syncOrderResult(root,result,restart){if(!host)return;let panel=document.querySelector('#storyResult');
   if(!result?.cleared){if(panel)panel.hidden=true;return;}api.clear(result);
   if(!panel){panel=document.createElement('section');panel.id='storyResult';panel.className='story-result';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','책 정리 성공');
    const card=document.createElement('div');card.className='story-result-card';const title=document.createElement('h2');title.textContent='책도 제자리!';
    const back=document.createElement('button');back.className='story-return';back.textContent='이야기로 돌아가기';back.onclick=()=>api.returnToStory(result);
    const retry=document.createElement('button');retry.className='story-retry';retry.textContent='다시하기';retry.onclick=()=>{panel.hidden=true;restart();};
    card.append(title,keywordBlock(),back,retry);panel.append(card);root.append(panel);
   }else panel.hidden=false;
  }
 };
 window.CatStoryBridge=Object.freeze(api);
 if(host){document.documentElement.classList.add('story-embedded');resize();addEventListener('resize',resize);visualViewport?.addEventListener('resize',resize);
  document.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY||0;},{passive:true});
  document.addEventListener('touchmove',e=>{const y=e.touches[0]?.clientY||touchY,dy=y-touchY;touchY=y;
   const box=e.target.closest?.('.story-result-card,.card,#overlay article');
   const scrollable=box&&box.scrollHeight>box.clientHeight+1&&(dy>0?box.scrollTop>0:dy<0?box.scrollTop+box.clientHeight<box.scrollHeight-1:false);
   if(!scrollable&&e.cancelable)e.preventDefault();
  },{passive:false});
 }
})();
