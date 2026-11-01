import {NOTICE05} from './mark04-05-config.js?v=20261101-marks23';
export function createMarkCourseUI({createImage}){
 const $=id=>document.getElementById(id),figure=$('locationGuide'),question=$('notice05Panel');
 function size(){document.documentElement.style.setProperty('--course-available-height',Math.max(160,(visualViewport?.height||innerHeight)-document.querySelector('.player-tools').getBoundingClientRect().height)+'px');}
 addEventListener('resize',size);visualViewport?.addEventListener('resize',size);
 function render(scene){
  const guide=scene.layout==='mark04-guide',notice=scene.layout==='notice05-expression';
  figure.hidden=!guide;figure.replaceChildren();question.hidden=!notice;question.replaceChildren();
  if(guide){
   figure.append(createImage('bg:'+scene.guideBackground,'location-guide-background','자료검색 컴퓨터와 자동대출반납기, 왼쪽 위의 기존 액자'));
   figure.append(createImage('prop:'+scene.guideOverlay,'location-guide-arrow','왼쪽 검색 컴퓨터보다 조금 왼쪽 위의 액자를 가리키는 화살표'));
   const marker=document.querySelector('#effectLayer .location-marker');if(marker)figure.append(marker);
  }
  if(notice){
   $('locationBanner').hidden=true;$('dialogue').hidden=true;
   const title=document.createElement('h2');title.textContent=NOTICE05.title;question.append(title);
   const card=document.createElement('div');card.className='notice05-card';
   const steps=document.createElement('ol');steps.className='notice05-steps';
   const labels={angry:'화난 고양이',cry:'우는 고양이',smile:'웃는 고양이'};
   NOTICE05.steps.forEach((step,i)=>{
    const row=document.createElement('li');row.className='notice05-step';
    const pair=document.createElement('div');pair.className='notice05-pair';
    const arrow=document.createElement('span');arrow.textContent='→';arrow.className='notice05-black-arrow';arrow.setAttribute('aria-hidden','true');
    pair.append(createImage('expression:'+step.from,'notice05-cat from-'+i,labels[step.from]),arrow,createImage('expression:'+step.to,'notice05-cat to-'+i,labels[step.to]));
    const text=document.createElement('p');text.textContent=step.text;row.append(pair,text);steps.append(row);
   });
   const ask=document.createElement('p');ask.className='notice05-question';
   ask.append(createImage('prop:postcard-pink-arrow','notice05-pink-arrow','엽서의 분홍 아래 화살표'),document.createTextNode(NOTICE05.question));
   card.append(steps,ask);const support=document.createElement('p');support.className='notice05-support';support.textContent=NOTICE05.support;
   question.append(card,support);
  }
  size();
 }
 return {render,size};
}
