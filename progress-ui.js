export function createProgressUI({getProgress,onRestart}) {
  const $=id=>document.getElementById(id);
  const dialog=$('progressDialog'),confirm=$('restartConfirmDialog');
  let returnFocus=null,scrollY=0;
  function refresh() {
    const p=getProgress();
    $('progressPercent').textContent=`${p.displayPercent}%`;
    $('progressGauge').setAttribute('aria-valuenow',String(p.percent));
    $('progressGauge').setAttribute('aria-valuetext',`${p.displayPercent}%`);
    $('progressFill').style.width=`${p.percent}%`;
  }
  function open() {
    if(dialog.open)return;
    returnFocus=document.activeElement;scrollY=window.scrollY;
    refresh();dialog.showModal();document.documentElement.classList.add('progress-open');
    $('resumeButton').focus({preventScroll:true});
  }
  function close() {
    confirm.close();dialog.close();
    document.documentElement.classList.remove('progress-open');
    window.scrollTo({top:scrollY,behavior:'instant'});
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  }
  $('menuButton').addEventListener('click',open);
  $('resumeButton').addEventListener('click',close);
  $('helpRestartButton').addEventListener('click',()=>{
    confirm.showModal();$('cancelRestartButton').focus({preventScroll:true});
  });
  $('cancelRestartButton').addEventListener('click',()=>{confirm.close();$('helpRestartButton').focus({preventScroll:true});});
  $('confirmRestartButton').addEventListener('click',()=>{close();onRestart();});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  confirm.addEventListener('cancel',e=>{e.preventDefault();confirm.close();$('helpRestartButton').focus({preventScroll:true});});
  // Modal backdrops consume taps; they never advance the story or submit input.
  for(const modal of [dialog,confirm])modal.addEventListener('click',e=>e.stopPropagation());
  return {open,close,refresh,get isOpen(){return dialog.open||confirm.open;}};
}
