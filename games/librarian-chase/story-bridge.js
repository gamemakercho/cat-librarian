export function createStoryBridge(browserWindow, pageLocation) {
 const params=new URLSearchParams(pageLocation.search||'');
 const parentOrigin=params.get('parentOrigin'),session=params.get('session'),runId=params.get('runId');
 const embedded=browserWindow.parent!==browserWindow&&params.get('part')==='approach'&&parentOrigin===pageLocation.origin&&/^[a-zA-Z0-9-]{8,80}$/.test(session||'')&&/^[a-zA-Z0-9-]{8,80}$/.test(runId||'');
 let contactSent=false;
 function tell(type,result){if(!embedded)return false;browserWindow.parent.postMessage({type,part:'approach',gameId:'library-ending-rescue',session,runId,...(result?{result}:{})},parentOrigin);return true}
 return {embedded,ready:()=>tell('cat-librarian:ending-ready'),error:()=>tell('cat-librarian:ending-error'),
  contact(){if(contactSent||!embedded)return false;contactSent=true;return tell('cat-librarian:ending-contact',{gameId:'library-ending-rescue',contactReached:true,completed:false})}};
}
