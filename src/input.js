window.addEventListener('keydown',e=>{
 if(game.bossScene&&e.key==='Enter'&&!e.repeat){e.preventDefault();endBossScene();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(game.mode!=='play'&&e.repeat&&[' ','Enter'].includes(e.key)){e.preventDefault();return;}
 if(e.key==='Escape'&&game.mode==='collection'){e.preventDefault();openStageSelect();return}
 if(game.mode==='roomEquipment'&&game.relicOffers?.length&&['1','2','3','4'].includes(e.key)&&!e.repeat&&!e.target.matches('select,input')){e.preventDefault();chooseRelic(Number(e.key)-1);return}
 if(e.key==='Enter'&&game.mode==='play'&&game.phase==='roomRest'){e.preventDefault();roomEquipment();return}
 if(game.mode==='chest'&&['1','2','3','4'].includes(e.key)&&!e.repeat){e.preventDefault();claimChest(campaign.pending?.id,Number(e.key)-1);return}
 if(game.mode==='fieldGuide'&&e.key==='Escape'){game.mode='play';closeModal();return}
 if(e.key==='Escape'&&game.mode==='route'){e.preventDefault();closeRoute();return}
 if(e.key==='Escape'&&game.mode==='settings'){e.preventDefault();closeSettings();return}
 if(e.key==='?'&&game.mode==='play'){e.preventDefault();openSettings();return}
 if(e.key==='Escape'&&game.mode==='shop'){e.preventDefault();closeShop();return}
 if(e.key==='Escape'&&game.mode==='skills'){e.preventDefault();closeSkillBook();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.target.matches('input,textarea,select')&&!['Tab','Escape'].includes(e.key))return;
 if(game.mode==='replace'&&!e.repeat){const slot=['j','k','l'].indexOf(boundKey(normalizeKey(e.key)));if(slot>=0){e.preventDefault();replaceAcquiredSkill(slot);return}if(['1','2','3'].includes(e.key)){e.preventDefault();replaceAcquiredSkill(Number(e.key)-1);return}if(e.key==='Escape'){e.preventDefault();replaceAcquiredSkill(-1);return}}
 if(game.mode==='draft'&&['1','2','3','4'].includes(e.key)&&!e.repeat){e.preventDefault();chooseOffer(Number(e.key)-1);return}
 const k=boundKey(normalizeKey(e.key));
 if(k==='b'&&!e.repeat&&['play','camp','shop'].includes(game.mode)){e.preventDefault();if(game.mode==='shop')closeShop();else openShop();return}
 if(k==='e'&&!e.repeat&&game.mode==='camp'){e.preventDefault();usePotion();showCamp();return}
 if(k==='e'&&!e.repeat&&game.mode==='shop'){e.preventDefault();if(usePotion())openShop();return}
 if(k==='Tab'&&!$('overlay').hidden){
  const buttons=[...$('modal').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(el=>el.getClientRects().length),first=buttons[0],last=buttons[buttons.length-1];
  if(first&&(!$('modal').contains(document.activeElement)||(!e.shiftKey&&document.activeElement===last)||(e.shiftKey&&document.activeElement===first))){e.preventDefault();(e.shiftKey?last:first).focus()}
  return;
 }
 if(k==='Tab'&&game.mode!=='play')return;
 if(e.target instanceof HTMLButtonElement&&game.mode!=='play'&&(e.key===' '||e.key==='Enter'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','a','s','d','j','k','l','e','Shift','p','Tab','Escape'].includes(k))e.preventDefault();
 if(k==='Escape'&&game.mode==='skills'){closeSkillBook();return}
 if(k==='Tab'&&!e.repeat&&game.mode==='play'){openSkillBook();return}
 if(k==='h'&&!e.repeat&&['play','roomEquipment'].includes(game.mode)){e.preventDefault();useCombatPotion();return}if(k==='p'&&!e.repeat){pause();return}if(game.mode!=='play')return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','Shift'].includes(k))keys.add(k);
 if(!e.repeat){if(k==='j')action('slash');if(k==='k')action('magic');if(k==='l')action('thunder');if(k==='Shift')action('roll');if(k==='q')action('ultimate');if(k==='e')action('heal')}
});
window.addEventListener('keyup',e=>keys.delete(boundKey(normalizeKey(e.key))));window.addEventListener('blur',()=>{resetInput();if(game.mode==='play')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();if(game.mode==='play')pause()}});
document.querySelector('.skill-group').prepend($('combatPotion'));$('combatPotion').onclick=useCombatPotion;
$('roomExit').onclick=()=>{if(game.phase==='exitWalk')game.phase='roomRest';if(game.phase==='roomRest')roomEquipment()};
$('growthButton').onclick=()=>{if(game.mode==='play'&&game.pendingChoices>0){game.draftDeferred=0;openDraft()}};
$('ultimate').onclick=()=>action('ultimate');
$('roll').addEventListener('pointerdown',e=>{if(game.mode!=='play')return;p.rollHeld=true;$('roll').setPointerCapture(e.pointerId);action('roll')});for(const event of ['pointerup','pointercancel','lostpointercapture'])$('roll').addEventListener(event,()=>p.rollHeld=false);
for(const name of ['slash','magic','thunder','roll','heal'])$(name).addEventListener('click',e=>{if(name==='roll'&&e.detail>0)return;action(name)});$('pause').onclick=pause;$('journeyLabel').onclick=openRoute;$('shopButton').onclick=()=>{if(game.mode==='shop')closeShop();else openShop()};$('skillsButton').onclick=()=>{if(game.mode==='skills')closeSkillBook();else openSkillBook()};$('sound').onclick=()=>{sounds=!sounds;$('sound').textContent='音 '+(sounds?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(sounds));tone(660,.12)};
const pad=$('movePad');function setPad(e){const r=pad.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,max=r.width*.34,d=Math.hypot(dx,dy),mag=Math.min(d/max,1),n=norm(dx,dy);joystick=d<7?{x:0,y:0}:{x:n.x*mag,y:n.y*mag};$('stick').style.transform='translate('+joystick.x*max+'px,'+joystick.y*max+'px)'}
pad.addEventListener('pointerdown',e=>{if(game.mode!=='play'||padPointerId!==null)return;padPointerId=e.pointerId;pad.setPointerCapture(e.pointerId);setPad(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padPointerId)setPad(e)});function releasePad(e){if(e.pointerId!==padPointerId)return;padPointerId=null;joystick={x:0,y:0};$('stick').style.transform=''}pad.addEventListener('pointerup',releasePad);pad.addEventListener('pointercancel',releasePad);pad.addEventListener('lostpointercapture',releasePad);
let dragOrigin=null;cv.addEventListener('pointerdown',e=>{if(game.mode!=='play'||pointerId!==null)return;pointerId=e.pointerId;dragOrigin={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId||!dragOrigin)return;const dx=e.clientX-dragOrigin.x,dy=e.clientY-dragOrigin.y,len=Math.hypot(dx,dy),n=norm(dx,dy),mag=Math.min(1,len/45);joystick=len<6?{x:0,y:0}:{x:n.x*mag,y:n.y*mag}});function releaseDrag(e){if(e.pointerId!==pointerId)return;pointerId=null;dragOrigin=null;joystick={x:0,y:0}}cv.addEventListener('pointerup',releaseDrag);cv.addEventListener('pointercancel',releaseDrag);cv.addEventListener('lostpointercapture',releaseDrag);
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);else window.addEventListener('resize',resize);reset();resize();openStageSelect();requestAnimationFrame(frame);
