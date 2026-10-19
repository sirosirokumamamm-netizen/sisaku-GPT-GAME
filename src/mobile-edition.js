// Touch-first flows. Real-time feedback is bounded; no additional assets or timers.
let bossRetrySnapshot=null,lootNotices=[],lootClock=0;
function acquisitionToast(message,color='#baffdf'){
 const text=String(message).slice(0,48);lootNotices.push({text,color,life:3.2});lootNotices=lootNotices.slice(-3);lootClock=3.2;
 let toast=$('lootToast');if(!toast){toast=document.createElement('div');toast.id='lootToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast)}toast.textContent=text;toast.hidden=false;toast.style.borderColor=color;announce(text);
}
function tickMobile(dt){
 lootClock=Math.max(0,lootClock-dt);for(const n of lootNotices)n.life-=dt;lootNotices=lootNotices.filter(n=>n.life>0);if($('lootToast'))$('lootToast').hidden=lootClock<=0||game.mode==='play';game.dashFlash=Math.max(0,(game.dashFlash||0)-dt);
}
function drawAcquisitionLog(){if(game.mode!=='play'||game.bossScene)return;ctx.save();ctx.textAlign='left';ctx.font='bold 13px system-ui';let y=view.h*.32;for(const n of lootNotices){ctx.globalAlpha=Math.min(1,n.life*2);ctx.lineWidth=4;ctx.strokeStyle='#193c50';ctx.strokeText('＋ '+n.text,18,y);ctx.fillStyle=n.color;ctx.fillText('＋ '+n.text,18,y);y+=23}ctx.restore()}
function drawThreatHUD(){
 if(game.mode!=='play'||game.bossScene||p.cutin>0)return;
 const warning=warnings.some(w=>!w.perfectUsed&&warningContains(w)),burning=hazards.some(z=>z.kind?warningContains(z):distance(z,p)<z.r+p.r*.4),pending=!!game.pendingHit;
 ctx.save();ctx.textAlign='center';if(warning||burning||pending){const y=view.h*.36,x=view.w/2,scale=view.w<450?.8:1;ctx.translate(x,y);ctx.scale(scale,scale);path([[-112,-20],[-132,16],[-92,16]],'#fff3c1','#843c20');ctx.font='900 27px system-ui';ctx.fillStyle='#903519';ctx.fillText('!',-112,11);ctx.font='900 30px system-ui';ctx.lineWidth=6;ctx.strokeStyle='#5b2f31';ctx.strokeText('注意！！',20,12);ctx.fillStyle='#fff0ba';ctx.fillText('注意！！',20,12);ctx.font='bold 13px system-ui';ctx.fillStyle='#fff';ctx.lineWidth=3;const hint=burning?'攻撃中！ 外へ':warnings.some(w=>w.follow&&w.life>w.lockTime&&warningContains(w))?'追尾中！ 動き続けよう':'範囲の外へ回避！';ctx.strokeText(hint,0,38);ctx.fillText(hint,0,38);}
 ctx.restore();if(game.lastHit?.life>0){ctx.save();ctx.textAlign='center';ctx.font='bold 14px system-ui';ctx.strokeStyle='#442c37';ctx.lineWidth=4;const text=game.lastHit.source+' −'+game.lastHit.amount+' HP';ctx.strokeText(text,view.w/2,view.h*.48);ctx.fillStyle='#fff0df';ctx.fillText(text,view.w/2,view.h*.48);ctx.restore()}
}
function queueCoyoteHit(amount,x,y){
 if(game.applyingCoyote||!game.damageThreat||!game.singleStage)return false;
 if(!game.pendingHit)game.pendingHit={amount,x,y,left:.12,warning:{...game.damageThreat}};return true;
}
function tickCoyote(dt){if(!game.pendingHit||game.bossScene||p.cutin>0)return;game.pendingHit.left-=dt;if(game.pendingHit.left>0)return;const hit=game.pendingHit;game.pendingHit=null;game.applyingCoyote=true;try{takeHit(hit.amount,hit.x,hit.y)}finally{game.applyingCoyote=false}}
function resolveCoyoteDodge(){if(!game.pendingHit)return;const hit=game.pendingHit;game.pendingHit=null;perfectDodge(hit.warning);acquisitionToast('間一髪！','#b8f5ff')}
function drawSpeedFlash(){
 if(reduced||!preferences.flashes||!(game.dashFlash>0))return;ctx.save();ctx.globalAlpha=game.dashFlash/.2*.5;ctx.strokeStyle='#a9f2ff';ctx.lineWidth=2;const dir=p.rollDir||p.face;for(let i=0;i<10;i++){const x=(i%2?view.w-20:20),y=70+i*(view.h-140)/10;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-dir.x*35,y-dir.y*55);ctx.stroke()}ctx.restore();
}
function captureBossRetry(){
 if(!game.singleStage||game.room!==5)return;
 const run=JSON.parse(JSON.stringify(game));delete run.bossScene;delete run.pendingHit;delete run.damageThreat;
 bossRetrySnapshot={player:JSON.parse(JSON.stringify(p)),run};
}
function appendBossRetry(result){
 if(result.win||!bossRetrySnapshot||game.room!==5)return;const b=document.createElement('button');b.id='retryBoss';b.className='cta';b.textContent='ボス戦だけやり直す';b.onclick=retryBoss;$('resultStages').before(b);$('resultStages').textContent='ステージ選択へ';
}
function retryBoss(){
 if(game.mode!=='stageResult'||!bossRetrySnapshot)return false;
 const checkpoint=bossRetrySnapshot,banked=game.bankedGold||0;
 p=JSON.parse(JSON.stringify(checkpoint.player));game=JSON.parse(JSON.stringify(checkpoint.run));Object.assign(game,{mode:'play',active:true,settled:false,bossPrepared:false,bossFallen:false,phase:'combat',bankedGold:banked,pendingHit:null,bossScene:null});p.hp=p.maxHp;p.mp=p.maxMp;p.invuln=1;p.rollTime=0;p.cutin=0;p.ultimateTime=0;p.skillCooldowns={};p.cd.roll=0;
 enemies=[];warnings=[];hostileShots=[];hazards=[];effects=[];texts=[];drops=[];fields=[];bolts=[];scheduled=[];closeModal();resetInput();buildTerrain();makeDecor();prepareBossScene();bossRetrySnapshot=checkpoint;updateUI();return true;
}
function roomEquipment(focusSlot=null){
 if(game.active||!['roomRest','exitWalk'].includes(game.phase))return;game.phase='roomRest';game.mode='roomEquipment';game.campReady=true;
 const learned=SKILLS.filter(s=>p.learned[s.id]&&isManualSkill(s));
 openModal('<div class="menu-topline">区画 '+game.room+' / 5 · 休憩</div><h2>冒険の支度</h2><div class="rest-vitals"><span>HP '+Math.ceil(p.hp)+' / '+p.maxHp+'</span><span>MP '+Math.floor(p.mp)+' / '+p.maxMp+'</span></div>'+(game.pendingChoices?'<button id="restGrowth" class="cta">成長を選ぶ · '+game.pendingChoices+'</button>':'')+relicChoiceHTML()+(!game.relicOffers?.length?'<div class="equipment-list">'+p.loadout.map((id,i)=>'<label><span>技 '+(i+1)+'</span><select data-room-slot="'+i+'" aria-label="技 '+(i+1)+'"><option value="">外す</option>'+learned.map(s=>'<option value="'+s.id+'" '+(id===s.id?'selected':'')+'>'+skillDisplayName(s)+' Lv.'+p.learned[s.id]+'</option>').join('')+'</select></label>').join('')+'</div>':'')+(p.learned.heal?'<button id="roomHeal" '+(p.mp<6||p.hp>=p.maxHp?'disabled':'')+'>癒しの光 · MP 6</button>':'')+'<div class="rest-actions"><button id="restUsePotion" '+(!game.fieldPotions||p.hp>=p.maxHp&&p.mp>=p.maxMp?'disabled':'')+'>回復薬 ×'+(game.fieldPotions||0)+'</button><button id="suspendExpedition">中断・保存</button></div><button id="roomEquipmentDone" class="cta">冒険に戻る</button>');
 $('modal').classList.add('rest-modal','mobile-rest');if($('roomHeal'))$('roomHeal').onclick=()=>{if(p.mp<6||p.hp>=p.maxHp)return;p.mp-=6;castSkill(getSkill('heal'),1);roomEquipment()};$('roomEquipmentDone').onclick=prepareExitWalk;$('restUsePotion').onclick=useCombatPotion;$('suspendExpedition').disabled=!!(game.pendingChoices||game.relicOffers?.length);$('suspendExpedition').textContent=$('suspendExpedition').disabled?'報酬選択後に保存':'中断・保存';$('suspendExpedition').onclick=suspendExpedition;if($('restGrowth'))$('restGrowth').onclick=()=>{game.draftDeferred=0;openDraft()};menuNodes('[data-room-slot]').forEach(b=>b.onchange=()=>{equipSkill(b.value,+b.dataset.roomSlot);acquisitionToast('技を装備！');roomEquipment()});menuNodes('[data-relic]').forEach(b=>b.onclick=()=>chooseRelic(+b.dataset.relic));
}
function tickGoldenDash(e,dt){
 if(!e.announced){e.announced=true;playCue('rare');banner('金色スライム！','逃げる前に倒そう',1.5)}e.escapeTime=(e.escapeTime??14)-dt;if(e.escapeTime<=0){e.hp=0;acquisitionToast('スライムが逃げた');return true}
 e.runClock=(e.runClock||0)-dt;
 if(e.runClock<=0||!e.dashVector){const options=[];for(let i=0;i<12;i++){const a=(i+Math.floor(game.time*3))*Math.PI/6,n={x:Math.cos(a),y:Math.sin(a)},q={x:e.x+n.x*115,y:e.y+n.y*115};if(q.y>=STAGES[game.stage].y-170&&q.y<=STAGES[game.stage].y+300&&canStand(q.x,q.y,e.r)&&routeClear(e,q,e.r))options.push(n)}e.dashVector=options[Math.floor(runRandom()*options.length)]||norm(380-e.x,STAGES[game.stage].y+70-e.y);e.runClock=.3+runRandom()*.4;particle(e.x,e.y,'#ffe99a',4,90)}
 const old={x:e.x,y:e.y};moveActor(e,e.dashVector.x*375*dt,e.dashVector.y*375*dt);if(distance(old,e)<375*dt*.4)e.runClock=0;e.sparkClock=(e.sparkClock||0)-dt;if(e.sparkClock<=0){e.sparkClock=.08;effects.push({kind:'afterimage',x:e.x,y:e.y,color:'#ffe278',life:.2,max:.2});particle(e.x,e.y,'#ffe69a',2,45)}return true;
}
function skillDisplayName(s,rank){if(!s)return '';const level=rank??p?.learned?.[s.id]??0;return(level>=3?'真・':'')+s.name}
function dawnSkillUnlocked(){return !!campaign&&(campaign.rares.includes('nova')||!!campaign.clears[4])}
function dawnDamage(rank=p.learned.nova||1){return (rank>=3?(campaign.dawnUpgrade?460:300):rank===2?240:190)*p.power}
function castDawnBlade(boost){
 const rank=p.learned.nova||1,target=nearest(rank>=3&&campaign.dawnUpgrade?480:260);if(!target){acquisitionToast('敵に近づこう');return}const color=rank>=3?'#e8b6ff':'#a880de';p.face=norm(target.x-p.x,target.y-p.y);slashEffect(true,p.face,color);hurtEnemy(target,dawnDamage(rank)*boost,true,color);effects.push({kind:'astralSlash',x:p.x,y:p.y,ex:target.x,ey:target.y,life:rank>=3?.8:.45,max:rank>=3?.8:.45});if(rank>=3)trueSkillEffect(getSkill('nova'));playCue('impact');
}
function trueSkillEffect(s){
 if(effects.length>260)return;const color=s.color||'#d7f8ff';effects.push({kind:'sigil',x:p.x,y:p.y,r:65,color,life:.65,max:.65},{kind:'burst',x:p.x,y:p.y,r:115,color,life:.45,max:.45});particle(p.x,p.y-20,color,10,150);
}
// A compact, named catalogue page keeps touch targets large without wheel scrolling.
function paginateTouchChoices(){
 if(innerWidth>600)return;const grid=$('modal').querySelector('.carry-grid');if(!grid||grid.children.length<=12)return;const items=[...grid.children];let page=0;const nav=document.createElement('div');nav.className='touch-pages';nav.innerHTML='<button aria-label="前の技">‹ 前</button><span></span><button aria-label="次の技">次 ›</button>';grid.after(nav);
 const show=()=>{items.forEach((b,i)=>b.hidden=Math.floor(i/12)!==page);nav.children[0].disabled=page===0;nav.children[1].textContent=(page+1)+' / '+Math.ceil(items.length/12);nav.children[2].disabled=page===Math.ceil(items.length/12)-1};nav.children[0].onclick=()=>{page--;show()};nav.children[2].onclick=()=>{page++;show()};show();
}

// Phase rewards are per enemy; skipping the scene never grants twice.
function grantPhasePotion(e){
 if(e.phasePotionGiven)return;e.phasePotionGiven=true;game.fieldPotions=(game.fieldPotions||0)+1;
 if(game.bossScene)game.bossScene.phaseGift=true;updatePotionUI();
}
function transformGod(e){
 const before={...e,facing:{...e.facing}};clearHostiles();e.bossPhase=2;e.hp=Math.round(e.maxHp*.75);e.r=70;Object.assign(e,safePoint(e.x,e.y,e.r));e.ward=1;e.cycleTime=8;e.godAttack=1.2;e.state='chase';e.leapFrom=e.leapTo=null;e.burn=e.bleed=e.frost=0;e.roamClock=0;
 beginBossScene('transform',e,before);grantPhasePotion(e);
}
function randomRefuge(){
 const y=STAGES[game.stage].y,candidates=[];
 for(let i=0;i<48;i++){const q={x:170+runRandom()*420,y:y-90+runRandom()*320};if(distance(p,q)>370||!canStand(q.x,q.y,p.r)||!routeClear(p,q,p.r))continue;let clear=true;for(let j=0;j<8;j++){const a=j*Math.PI/4;if(!canStand(q.x+Math.cos(a)*75,q.y+Math.sin(a)*75,p.r)){clear=false;break}}if(clear)candidates.push(q)}
 // The player's current walkable tile is always reachable when terrain is tight.
 return candidates.length?candidates[Math.floor(runRandom()*candidates.length)]:{x:p.x,y:p.y};
}
function roamMythicBoss(e,dt,speed){
 e.roamClock=(e.roamClock||0)-dt;if(!e.roamTarget||e.roamClock<=0||distance(e,e.roamTarget)<35){e.roamClock=1.4+runRandom()*.6;let best=null;for(let i=0;i<12;i++){const q=safePoint(155+runRandom()*450,STAGES[game.stage].y-110+runRandom()*390,e.r);if(!best||distance(e,q)>distance(e,best))best=q}e.roamTarget=best}
 const d=routeClear(e,e.roamTarget,e.r)?norm(e.roamTarget.x-e.x,e.roamTarget.y-e.y):routeDirection(e,e.roamTarget);const before={x:e.x,y:e.y};moveActor(e,d.x*speed*dt,d.y*speed*dt);if(distance(before,e)<speed*dt*.3)e.roamClock=0;
}

function drawMythicCrown(e,t){
 const god=e.form==='god',color=god?'#ffe3a0':'#e4a0ff';ctx.save();ctx.rotate(t*(god?.22:-.15));
 for(let i=0;i<8;i++){const a=i*Math.PI/4,r=130+Math.sin(t*2+i)*12,x=Math.cos(a)*r,y=Math.sin(a)*r*.8;ctx.save();ctx.translate(x,y);ctx.rotate(a);path([[-14,0],[0,-12],[22,0],[0,12]],god?'#fff7dd':'#421b54',color);ellipse(2,0,5,8,god?'#bf7739':'#ffbda5');ellipse(3,0,2,6,'#251d3e');ctx.restore();ctx.strokeStyle=color+'77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.cos(a)*88,Math.sin(a)*70);ctx.lineTo(x,y);ctx.stroke()}
 ctx.restore();if(god){path([[0,-115],[18,-66],[0,-36],[-18,-66]],'#183d66','#fff2ab');ellipse(0,-66,7,12,'#a9edff')}
}
function bossStrikeFlare(w,owner){
 if(owner.kind!=='boss'||effects.length>220)return;const color=owner.form==='god'?'#fff0ac':'#db9bff';
 effects.push({kind:'nova',x:owner.x,y:owner.y-75,r:120,color,life:.5,max:.5},{kind:'beam',x:owner.x,y:owner.y-75,ex:w.x,ey:w.y,color,life:.3,max:.3});
 const count=reduced?4:10;for(let i=0;i<count;i++){const a=i*Math.PI*2/count,r=w.kind==='ring'?w.inner+35:35;const x=w.x+Math.cos(a)*r,y=w.y+Math.sin(a)*r;effects.push({kind:'beam',x,y,ex:x+Math.cos(a)*90,ey:y+Math.sin(a)*90-80,color,life:.45,max:.45})}
 playCue(w.style==='doom'?'explosion':'impact');
}
