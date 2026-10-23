// Readable combat, paced boss events, and permanent expedition choices.
function rareEncounterChance(){return [.0015,.004,.007][campaign.luckCharm||0]}
function applyCarrySkills(ids){
 const manual=ids.filter(id=>isManualSkill(getSkill(id))),existing=p.loadout.filter(id=>id&&!manual.includes(id));
 p.loadout=[...existing.slice(0,Math.max(0,3-manual.length)),...manual].slice(0,3);while(p.loadout.length<3)p.loadout.push(null);
 for(const id of ids){const s=getSkill(id);if(!s||!RARE_IDS.includes(id)||p.learned[id])continue;p.learned[id]=1;if(s.category==='passive')applyForgedCarryPassive(s);else if(!isManualSkill(s))p.autoSkillTimers[id]=0;}
}
function openPreparation(index){return renderEmbark(index)}
function storeProducts(){return [
 {id:'carryExpansion',icon:'▣',name:'持ち込み枠',level:campaign.carrySlots,max:3,price:campaign.carrySlots===1?1800:3600,desc:'宝箱で解放した技を、出発時にもう1つ持ち込めます。',effect:'持ち込み '+campaign.carrySlots+' → '+Math.min(3,campaign.carrySlots+1)+' 枠',note:'永続強化。戦闘中の手動ボタンは3個のままです。'},
 {id:'luckCharm',icon:'✦',name:'金運のお守り',level:campaign.luckCharm,max:2,price:campaign.luckCharm===0?1600:3200,desc:'金色のスライムに出会う抽選確率を高めます。',effect:campaign.luckCharm===0?'出会いやすさ 約2.7倍':'出会いやすさ 約4.7倍',note:'永続効果。第2区画から抽選、1挑戦で最大1体。必ず出る効果ではありません。'}
,{id:'charmExpansion',icon:'◈',name:'お守り枠',level:campaign.charmSlots,max:3,price:campaign.charmSlots===1?1000:2200,desc:'お守りを同時にもう1つ装備できるようにします。',effect:'お守り '+campaign.charmSlots+' → '+Math.min(3,campaign.charmSlots+1)+' 枠',note:'最大3枠。異なるお守りの効果を組み合わせられます。'},...permanentStatProducts()]}
let storeReturn='stageSelect',storeTab='swords',storeRegion=0;
function openWeaponShop(returnMode='stageSelect',selection,tab='swords'){return openStorefront(tab==='tools'?'expansion':tab,selection,returnMode)}
function threatName(w){if(w.stateOnly)return AILMENTS[w.ailment].name+' · 回避で防ぐ';return w.style==='doom'?'大技 · 安全地帯へ':w.follow?(w.life>w.lockTime?'追尾中 → 動き続ける':'位置確定 → 外へ'):w.kind==='line'?'直線攻撃 → 横へ':w.kind==='ring'?'光の輪の内側へ':w.persist||w.attack==='mine'?'着弾後も危険':'範囲の外へ'}
function drawWarning(w,t){
 if(!showAttackWarning(w))return;
 const progress=warningProgress(w),inside=warningContains(w),urgent=w.life<.45,color=urgent?'#fff0a3':inside?'#ff896b':'#ffc295';ctx.save();warningShape(w);ctx.fillStyle=inside?'#d7373438':'#b4363026';ctx.fill('evenodd');ctx.strokeStyle='#271c2d';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=inside?3.5:2.5;ctx.stroke();
 warningShape(w,progress);ctx.fillStyle='rgba(255,91,49,'+(.08+progress*.19)+')';ctx.fill('evenodd');
 if(w.kind==='circle'){ctx.beginPath();ctx.arc(w.x,w.y,w.r+9,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.stroke()}
 // A moving dashed boundary distinguishes a warning from damage that is already active.
 ctx.setLineDash([9,7]);ctx.lineDashOffset=-t*18;warningShape(w);ctx.strokeStyle='#fff3cd99';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
 ctx.restore();
}
function updateReadableThreats(dt){
 for(const w of warnings){empowerBossThreat(w);if(!w.readable){w.readable=true;const min=w.stateOnly?.5:w.swift?.78:w.style==='doom'?2:w.follow?1.15:w.atk>=35?1.15:.7;if(w.max<min){w.life+=min-w.max;w.max=min;const e=enemies.find(e=>e.id===w.owner);if(e?.state==='windup')e.timer=Math.max(e.timer,w.life)}}if(isMajorWarning(w)&&warningContains(w)&&w.life<.55&&!w.alerted){w.alerted=true;playCue('danger')}}
}
function recordReadableHit(dmg,before){
 game.lastHit={amount:Math.min(dmg,before),source:game.hitSource||'敵の攻撃',life:2.2};playCue(p.hp<=p.maxHp*.3?'critical':'hurt');
 if(game.singleStage&&p.hp<=0&&before>p.maxHp*.35&&!game.lastStandUsed){game.lastStandUsed=true;p.hp=1;p.invuln=1.5;combat.slow=.7;banner('踏みとどまった！','HP 1 · 回避して立て直そう（この挑戦で1回）',2.2)}
 if(p.hp>0&&p.hp<=p.maxHp*.3)announce('HPが少なくなりました。'+(game.fieldPotions?'Hで回復できます':'安全な場所へ回避してください'));
}
function prepareBossScene(){
 captureBossRetry();game.bossPrepared=true;clearHostiles();fields=[];bolts=[];scheduled=[];enemies=[];resetInput();spawnWave();const boss=enemies.find(e=>e.kind==='boss');if(boss)beginBossScene('arrival',boss);updateUI();
}
function beginBossScene(kind,e,before){
 if(!game.singleStage)return;const duration=preferences.shortCinematics||reduced?1:kind==='transform'?3.8:kind==='defeat'?3.2:kind==='arrival'?(game.region>=4?6.2:4.6):2.4;
 const cast=kind==='arrival'?enemies.filter(x=>x.kind==='boss'):[e];game.bossScene={kind,time:0,duration,ids:cast.map(x=>x.id),cast:cast.map(x=>({...x,hp:Math.max(1,x.hp),spawnTime:0,flash:0,facing:{...x.facing}})),before:before?{...before,hp:1,spawnTime:0}:null,burst:false};game.epicEvent=null;document.querySelector('.scene').classList.add('cinematic-playing');resetInput();clearHostiles();fields=[];bolts=[];scheduled=[];inputBuffer=null;bannerTTL=0;$('banner').classList.remove('show');playCue(kind==='defeat'?'victory':kind==='arrival'?'arrival':'transform');if(kind==='arrival'||kind==='transform')combatSound(e.shadowLord?'shadow-rift':({demon:'demon-roar',god:'god-verdict',dragon:'dragon-breath',monster:'tide-crash',beast:'beast-roar',sentinel:'stone-break'})[e.form]||'stone-break',e.x);
 let skip=$('sceneSkip');if(!skip){skip=document.createElement('button');skip.id='sceneSkip';skip.textContent='演出をスキップ ›';skip.onclick=endBossScene;document.querySelector('.scene').append(skip)}skip.hidden=false;updateUI();
}
function updateBossScene(dt){
 const s=game.bossScene;if(!s)return;s.time+=dt;const q=s.time/s.duration;if(!s.burst&&q>.55){s.burst=true;for(const e of s.cast){emitBossSceneBurst(s,e);}playCue(s.kind==='defeat'?'explosion':'impact');if(!reduced&&preferences.shake)shake=6;}if(s.time>=s.duration)endBossScene();
}
function endBossScene(){
 const s=game.bossScene;if(!s)return;if(['arrival','transform'].includes(s.kind))clearPlayerAilments();game.bossScene=null;document.querySelector('.scene').classList.remove('cinematic-playing');if($('sceneSkip'))$('sceneSkip').hidden=true;for(const e of enemies)if(s.ids.includes(e.id)){e.spawnTime=0;e.cooldown=Math.max(e.cooldown,1.2);if(s.kind==='transform'){e.state='chase';e.timer=0;e.cycleTime=8;e.barrageClock=1.2;if(e.form==='god'){e.ward=1;e.cycleTime=2.8;e.godAttack=1.2}}}if(s.phaseGift){acquisitionToast('特別支給！ ポーション +1（所持 '+game.fieldPotions+'）','#baffce');banner('ポーション +1！','所持上限を超えて支給 · 回復ボタンで使える',3.5);playCue('rare')}p.invuln=Math.max(p.invuln,.8);resetInput();if(s.kind==='arrival'){activateRoomCharm();banner('BOSS 戦闘開始','予兆の外へ移動し、攻撃後に反撃',1.2);}updateUI();
}
function drawBossSceneWorld(t){
 const s=game.bossScene;if(!s)return;const q=clamp(s.time/s.duration,0,1);
 for(const e of s.cast)aboveView(()=>{
  ctx.save();ctx.translate(e.x,e.y);drawBossSceneBackdrop(s,e,q);drawBossSceneGhosts(s,e,q,t);
  const pose=bossScenePose(s,e,q);ctx.save();ctx.translate(0,pose.y);ctx.rotate(pose.angle);ctx.scale(pose.x,pose.yScale);ctx.translate(-e.x,-e.y);
  if(s.before&&q<.55){ctx.save();ctx.globalAlpha=(1-theatreEase((q-.18)/.37))*pose.alpha;drawEnemy(s.before,t);ctx.restore()}
  ctx.globalAlpha=pose.alpha*(s.before?theatreEase((q-.46)/.15):1)*(s.kind==='defeat'?1-theatreEase((q-.55)/.35):1);drawEnemy(e,t+s.time);ctx.restore();
  drawBossSceneForeground(s,e,q);ctx.restore();
 },e.x,e.y);
}
function drawBossSceneHUD(){
 const s=game.bossScene;if(!s)return;const q=s.time/s.duration,fade=Math.min(1,q*7,(1-q)*7),h=Math.min(62,view.h*.09);ctx.save();ctx.globalAlpha=Math.max(.3,fade);ctx.fillStyle='#050c19e8';ctx.fillRect(0,0,view.w,h);ctx.fillRect(0,view.h-h-45,view.w,h+45);ctx.textAlign='center';ctx.fillStyle='#ffe5ab';ctx.font='bold 12px system-ui';const title={arrival:'BOSS ENCOUNTER',transform:'封印崩壊 — 真の姿へ',enrage:'本性解放',defeat:'BOSS BREAK'}[s.kind];ctx.fillText(title,view.w/2,view.h-h-19);ctx.font='900 '+Math.min(26,view.w*.055)+'px serif';ctx.fillStyle='#fff5dd';ctx.fillText(s.kind==='defeat'?'勝利 — '+REGIONS[game.region].name:s.kind==='transform'?(s.cast[0].shadowLord?s.cast[0].name:s.cast[0].form==='god'?'創世の神核、覚醒':'冥王、剣を取る'):s.cast[0].name,view.w/2,view.h-h+13);ctx.restore();drawBossEncounterTitle(s,q);
}
function activateUltimate(){
 if(game.mode!=='play'||!combatActionsAvailable()||p.ultimate<100||p.ultimateTime>0||p.cutin>0||p.skillCharge)return false;
 const target=enemies.filter(e=>e.hp>0&&e.spawnTime<=0).sort((a,b)=>b.hp-a.hp)[0];if(!target){banner('標的がいない','敵が現れてから使おう',1);return false}
 if(target.form==='god'&&target.bossPhase===2&&target.ward>0&&!target.catastrophe){banner('今は障壁に守られている','解除を待とう。ゲージは消費しません',1.5);playCue('deny');return false}
 p.ultimateArt=game.ultimateArt||'sorai';p.ultimateTarget=target.id;p.ultimate=0;p.cutin=reduced||preferences.shortCinematics?.25:1.15;p.cutinMax=p.cutin;p.ultimateTime=8+forgedPassiveRank('ultimatePower');inputBuffer=null;p.face=norm(target.x-p.x,target.y-p.y);document.querySelector('.scene').classList.add('ultimate-cutin');playCue('ultimate');updateUI();return true;
}
function releaseAstralSlash(){if(p.ultimateArt==='warped'){releaseWarpedFlash();return}combatSound('ultimate-'+(p.ultimateArt||'sorai'));
 const target=enemies.find(e=>e.id===p.ultimateTarget&&e.hp>0);p.ultimateTarget=null;if(!target)return;const from={x:p.x,y:p.y},to={x:target.x,y:target.y};p.face=norm(to.x-from.x,to.y-from.y);slashEffect(true,p.face,'#bffbff');effects.push({kind:'astralSlash',x:from.x,y:from.y,ex:to.x,ey:to.y,life:.9,max:.9,art:p.ultimateArt,travel:Math.max(distance(from,to)+100,Math.hypot(view.w,view.h/CAMERA.depth)/view.scale*1.35)});const art=getUltimateArt(p.ultimateArt),power=(art.damage+70*forgedPassiveRank('ultimatePower'))*p.power*(1+.08*(game.forgeUltimate||0));
 hurtEnemy(target,power,true,'#c9fbff',true,false,false,'lightning');for(const e of enemies)if(art.id!=='raigai'&&e!==target&&e.hp>0&&(art.id==='raika'?distance(e,to)<210:segmentHits(from,to,e,e.r+45)))hurtEnemy(e,power*(art.id==='raika'?.8:.45),true,'#a9eaff',true,false,false,'lightning');if(art.id==='raika'){effects.push({kind:'nova',x:to.x,y:to.y,r:210,color:'#d2a6ff',life:.8,max:.8});for(let i=0;i<8;i++){const a=i*Math.PI/4;effects.push({kind:'beam',x:to.x,y:to.y,ex:to.x+Math.cos(a)*210,ey:to.y+Math.sin(a)*210,color:'#d6c1ff',life:.45,max:.45})}}if(art.id==='raigai'){effects.push({kind:'thunder',x:to.x,y:to.y,r:100,color:'#ffc890',life:.7,max:.7});floating(to.x,to.y-95,'轟雷貫斬！','#ffddb4',true)}playCue('impact');particle(to.x,to.y-30,'#d0fbff',35,260);p.invuln=Math.max(p.invuln,.8);
}
function drawAstralSlash(e){
 if(e.art==='raika'||e.art==='raigai'){drawUltimateVariant(e);return}
 const q=1-e.life/e.max,n=norm(e.ex-e.x,e.ey-e.y),length=e.travel||Math.hypot(e.ex-e.x,e.ey-e.y)+100,end={x:e.x+n.x*length,y:e.y+n.y*length},width=(1-q)*60+3;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(const [color,w] of [['#167fff77',width*2],['#74e8ffcc',width],['#edffff',width*.25]]){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(e.x,e.y-30);ctx.lineTo(end.x,end.y-30);ctx.stroke()}ctx.translate(e.x+n.x*length*Math.min(1,q*3),e.y+n.y*length*Math.min(1,q*3)-30);ctx.rotate(Math.atan2(n.y,n.x));ctx.strokeStyle='#e6ffff';ctx.lineWidth=8*(1-q)+1;ctx.beginPath();ctx.arc(-40,0,80,-1.1,1.1);ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle='#c7f8ff';ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();for(let i=0;i<=10;i++){const f=i/10,offset=(i%2?1:-1)*side*width*.6,x=e.x+(end.x-e.x)*f-n.y*offset,y=e.y-30+(end.y-e.y)*f+n.x*offset;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}ctx.restore();
}
// Small original synthesized motifs. No audio downloads; user gesture starts Web Audio.
const soundQueue=[];let soundTime=0,lastDangerSound=-10,lastHitSound=-10,musicScene='';
function playCue(name){
 if(!sounds)return;if(name==='danger'&&soundTime-lastDangerSound<.7)return;if(name==='hurt'&&soundTime-lastHitSound<.18)return;if(name==='danger')lastDangerSound=soundTime;if(name==='hurt')lastHitSound=soundTime;
 const cues={select:[[620,.05,'sine',.025]],deny:[[150,.12,'triangle',.035],[115,.16,'triangle',.03]],purchase:[[523,.12],[659,.12],[784,.18],[1047,.3]],level:[[523,.1],[659,.1],[784,.1],[1047,.22]],danger:[[880,.07,'triangle',.035],[660,.09,'triangle',.03]],hurt:[[110,.16,'sawtooth',.025]],critical:[[130,.18,'triangle',.045],[90,.25,'triangle',.04]],arrival:[[73,.5,'sawtooth',.025],[110,.3,'triangle',.04],[147,.5,'triangle',.04]],transform:[[98,.3,'sawtooth',.03],[116,.3,'sawtooth',.025],[139,.5,'triangle',.04],[196,.5,'triangle',.035]],explosion:[[65,.45,'sawtooth',.045],[90,.35,'triangle',.035]],impact:[[80,.25,'sawtooth',.035],[440,.18,'triangle',.03]],victory:[[392,.18],[523,.18],[659,.18],[784,.22],[1047,.45]],ultimate:[[220,.15,'triangle',.04],[440,.15,'triangle',.04],[880,.2,'triangle',.035],[1320,.4,'sine',.035]],heal:[[440,.12],[554,.12],[659,.2],[880,.3]],rare:[[784,.13],[988,.13],[1175,.2],[1568,.3]],dodge:[[330,.08,'triangle',.02],[660,.12,'sine',.025]]};
 let delay=0;for(const [f,d,type='sine',vol=.035]of(cues[name]||cues.select)){if(soundQueue.length<32)soundQueue.push({at:soundTime+delay,f,d,type,vol});delay+=name==='explosion'?.07:.11}
}
function updateSoundCues(dt){soundTime+=dt;for(let i=soundQueue.length-1;i>=0;i--)if(soundQueue[i].at<=soundTime){const n=soundQueue.splice(i,1)[0];if(sounds)tone(n.f,n.d,n.type,n.vol)}}
function scoreNote(f,d,type,volume,delay=0){layeredScoreNote(f,d,type,volume,delay)}
function updateMusic(dt){updateLayeredMusic(dt)}
document.addEventListener('pointerdown',()=>{if(sounds){tone(440,.015,'sine',.0001);audio?.resume()}},{passive:true});
document.addEventListener('click',e=>{if(e.target.closest('button:not(:disabled)')&&!e.target.closest('#movePad'))playCue('select')});
function drawThreatClocks(){
 const visible=warnings.filter(w=>showAttackWarning(w)&&w.kind!=='ring').sort((a,b)=>distance(a,p)-distance(b,p)).slice(0,5);for(const w of visible){const x=w.kind==='line'?w.x+w.dir.x*Math.min(110,w.length*.4):w.x+w.r*.65,y=w.kind==='line'?w.y+w.dir.y*Math.min(110,w.length*.4):w.y-w.r*.65;ctx.save();ctx.translate(x,y);ctx.scale(1,1/CAMERA.depth);rounded(-20,-12,40,24,6,'#271c2df5','#ffe3aa');ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff1c4';ctx.fillText(Math.max(0,w.life).toFixed(1),0,5);ctx.restore()}
}
function ultimateArts(){return [
 {id:'sorai',name:'蒼雷斬',icon:'ϟ',price:0,damage:260,desc:'残りHPが最も多い敵へ、雷をまとう必中の剣閃。',effect:'単体への一撃重視',note:'最初から習得。直線上の敵にも余波。発動後は8秒間覚醒。'},
 {id:'raika',name:'雷華乱舞',icon:'✺',price:2800,damage:210,desc:'必中の斬撃が標的で花開き、周囲を雷刃で薙ぎ払う。',effect:'一撃は控えめ · 周囲へ広く追撃',note:'秘伝書は永久所持。群れに強い必殺技。発動後は8秒間覚醒。'},
 {id:'raigai',name:'轟雷貫斬',icon:'ϟ',price:3600,damage:370,desc:'雷を一点に集め、強敵を貫く。',effect:'単体に大威力',note:'盾は発生しません。購入済みの秘伝書も自動更新。'},
 {id:'warped',name:'いびつな閃光',icon:'✹',price:4200,damage:380,regionUnlock:7,desc:'屈折する三筋の閃光が敵を貫く。',effect:'大きく屈折する広域の閃光',note:'荒野の踏破で購入権。技巧石で＋強化可能。'}
]}
function getUltimateArt(id=game.ultimateArt||campaign.ultimate||'sorai'){return ultimateArts().find(a=>a.id===id)||ultimateArts()[0]}
