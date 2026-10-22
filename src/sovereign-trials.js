// Timers and challenges are transient; saved inventory and cleared ranks stay valid.
const AILMENTS={poison:{name:'毒',icon:'毒',color:'#b2e97a',duration:5},blind:{name:'視界狭窄',icon:'暗',color:'#b9a2ed',duration:4},paralyze:{name:'しびれ',icon:'痺',color:'#ffe28a',duration:.42},weaken:{name:'攻撃力半減',icon:'↓',color:'#eab0d3',duration:4}};
Object.assign(COMBAT_SOUNDS,{'seal-gather':[180,720,1.1,'sine',.45,2400,.06],'seal-tick':[1100,500,.12,'triangle',.2,3600,.045],'seal-break':[2300,400,.65,'sine',.8,6500,.07],'judgment-fall':[70,24,1.3,'sawtooth',1,1800,.085],'poison-hiss':[350,100,.4,'sine',.9,1800,.05],'status-shock':[2000,220,.2,'square',.6,5000,.04]});
function rankAssessment(win,completion){
 const target=[130,160,190,225,280,300,370,490,1150][game.region]||240,damageRatio=game.damageTaken/Math.max(1,p.maxHp),pace=clamp((target*1.6-game.time)/target,0,1);
 const quality=(win?70:completion*35)+18*clamp(1-damageRatio/1.25,0,1)+(win?10*pace:0)+Math.min(2,game.perfects*.25);
 return {rank:win?(quality>=94&&game.hitsTaken<=5&&damageRatio<=.45?'S':quality>=84?'A':quality>=70?'B':'C'):quality>=40?'C':'D',quality:Math.round(quality*10)/10,target};
}
function secondFormHealth(e){if(e.secondFormScaled)return;e.secondFormScaled=true;e.maxHp=Math.round(e.maxHp*(e.shadowLord?1.18:e.form==='god'?1.16:1.18))}
function outgoingStatusMultiplier(){return p.ailments?.weaken>0?.5:1}
function walkingWeight(){return game.singleStage&&getWeapon().id==='greatsword'?.82:1}
function clearPlayerAilments(){p.ailments={};p.ailmentGuard={};p.poisonClock=1}
function applyPlayerAilment(id,duration=AILMENTS[id]?.duration){
 if(!AILMENTS[id]||p.hp<=0||game.mode!=='play'||(p.ailmentGuard?.[id]||0)>0)return false;
 p.ailments??={};p.ailmentGuard??={};p.ailments[id]=Math.min(id==='paralyze'?.42:6,Math.max(p.ailments[id]||0,duration));p.ailmentGuard[id]=id==='paralyze'?1.9:.6;
 if(id==='poison')p.poisonClock=1;floating(p.x,p.y-120,AILMENTS[id].name+'！',AILMENTS[id].color,true);combatSound(id==='poison'?'poison-hiss':'status-shock');
 effects.push({kind:'ailmentPulse',ailment:id,x:p.x,y:p.y,r:90,life:.65,max:.65});return true;
}
function tickPlayerAilments(dt){
 if(!p.ailments)return;for(const id of Object.keys(p.ailmentGuard||{}))p.ailmentGuard[id]=Math.max(0,p.ailmentGuard[id]-dt);
 const poisoned=p.ailments.poison>0;for(const id of Object.keys(p.ailments))p.ailments[id]=Math.max(0,p.ailments[id]-dt);
 if(poisoned&&p.ailments.poison>0){p.poisonClock=(p.poisonClock??1)-dt;if(p.poisonClock<=0){p.poisonClock+=1;const amount=Math.min(p.hp,Math.max(2,Math.round(p.maxHp*.012)));p.hp-=amount;game.damageTaken+=amount;game.damageSources.poison=(game.damageSources.poison||0)+amount;floating(p.x,p.y-90,'毒 −'+amount,AILMENTS.poison.color);effects.push({kind:'ailmentPulse',ailment:'poison',x:p.x,y:p.y,r:45,life:.35,max:.35});p.hurtHud=1;if(p.hp<=0)finish(false)}}
}
function castAilmentWave(e,id){
 const b=battleBounds(),point={x:(b.left+b.right)/2,y:(b.top+b.bottom)/2},r=Math.hypot(b.right-b.left,b.bottom-b.top)*.58;
 const w=personaWarning(e,'circle',point.x,point.y,.64,{r,atk:0,stateOnly:true,ailment:id,move:({blind:'nightVeil',paralyze:'divineBind',weaken:'brokenCrown',poison:'venomVeil'})[id],color:AILMENTS[id].color});
 combatSound('status-shock',e.x);return w;
}
function resolveAilmentWave(w,owner){
 effects.push({kind:'ailmentPulse',ailment:w.ailment,x:w.x,y:w.y,r:w.r||300,life:.6,max:.6});combatSound(w.ailment==='poison'?'poison-hiss':'status-shock',owner.x);
 if(!warningContains(w)||w.perfectUsed)return;
 if(p.rollTime>0||p.invuln>0){if(p.rollTime>0&&p.dodgeAge<=p.justWindow)perfectDodge(w);floating(p.x,p.y-100,'回避！','#cbfff0');return}
 if(p.parry>0){p.parry=0;floating(p.x,p.y-100,'無効！','#e3faff');return}applyPlayerAilment(w.ailment,w.ailmentDuration);
}
function mirrorGuard(e,ritual=false){
 if(game.time-(e.mirrorClock??-9)<.16)return;e.mirrorClock=game.time;
 effects.push({kind:'mirrorGuard',x:e.x,y:e.y-65,r:e.r+35,ritual,life:.45,max:.45,face:norm(p.x-e.x,p.y-e.y)});combatSound('hit-metal',e.x);
 if(game.time-(e.guardNotice??-9)>.45){e.guardNotice=game.time;floating(e.x,e.y-150,ritual?'術式を攻撃！':'無効！',ritual?'#ffd395':'#e8faff',true)}
}
function beginCatastrophe(e){
 if(e.catastrophe||e.hp<=0||game.bossScene||e.bossPhase!==2||e.shadowLord&&!e.awakened||!(e.form==='god'||e.shadowLord))return false;
 warnings=warnings.filter(w=>w.owner!==e.id);hostileShots=hostileShots.filter(w=>w.owner!==e.id);hazards=hazards.filter(w=>w.owner!==e.id);e.attackSequence=null;e.royalTransit=null;e.shadowTransit=null;e.shadowMirage=null;
 if(game.pendingHit?.warning?.owner===e.id)game.pendingHit=null;
 if(distance(e,p)>320){const before={x:e.x,y:e.y},n=norm(e.x-p.x,e.y-p.y);Object.assign(e,safePoint(p.x+n.x*240,p.y+n.y*240,e.r));effects.push({kind:'mirrorGuard',...before,r:85,face:n,life:.7,max:.7})}
 const duration=e.shadowLord?11:10,maxGuard=e.shadowLord?860:830;
 e.catastrophe={kind:e.shadowLord?'oblivion':'genesis',duration,remaining:duration,guard:maxGuard,maxGuard,lastSecond:Math.ceil(duration)};e.state='catastrophe';e.exposed=0;e.ward=e.form==='god'?1:e.ward;e.challengeClock=24;e.challengeSeen=true;
 game.pendingHit=null;game.royalPressure=null;game.epicEvent=null;bannerTTL=0;$('banner').classList.remove('show');combatSound('seal-gather',e.x);return true;
}
function hitCatastropheGuard(e,amount){
 const c=e.catastrophe;if(!c||amount<=0)return 0;const actual=Math.min(c.guard,Math.max(1,Math.round(amount)));c.guard=Math.max(0,c.guard-actual);game.guardDamage=(game.guardDamage||0)+actual;chargeUltimate(actual*.012);mirrorGuard(e,true);
 if(game.time-(e.guardTextClock??-9)>.12){e.guardTextClock=game.time;floating(e.x,e.y-105,'術式 −'+actual,'#ffdd9d')}
 if(c.guard===0)finishCatastrophe(e,true);return actual;
}
function finishCatastrophe(e,broken){
 if(!e.catastrophe)return;const kind=e.catastrophe.kind;e.catastrophe=null;e.challengeClock=broken?24:22;e.catastropheRecovery=broken?3.4:1.4;e.state='recover';e.timer=e.exposed=e.catastropheRecovery;e.ward=0;e.cycle='exposed';e.cycleTime=Math.max(4,e.catastropheRecovery);e.godAttack=1.1;e.shadowBeat=1;
 warnings=warnings.filter(w=>w.owner!==e.id);hostileShots=hostileShots.filter(w=>w.owner!==e.id);hazards=hazards.filter(w=>w.owner!==e.id);game.pendingHit=null;
 effects.push({kind:'catastropheRelease',x:e.x,y:e.y,r:broken?180:750,broken,persona:kind,life:broken?1:1.4,max:broken?1:1.4});combatSound(broken?'seal-break':'judgment-fall',e.x);
 if(broken){floating(e.x,e.y-165,'阻止！ 核心露出','#b8ffe0',true);game.interrupts=(game.interrupts||0)+1;}
 else if(p.hp>0){const lost=Math.max(0,p.hp-1);p.hp=1;p.shield=0;p.ailments??={};p.ailments.poison=0;p.invuln=Math.max(p.invuln,2);p.hurtHud=3;game.damageTaken+=lost;game.hitsTaken++;game.damageSources['終末の一撃']=(game.damageSources['終末の一撃']||0)+lost;floating(p.x,p.y-120,'終焉 · HP 1','#ffb9c6',true);combat.hurt=.5;}
}
function updateSovereignTrial(e,dt){
 if(e.catastrophe){const c=e.catastrophe;c.remaining=Math.max(0,c.remaining-dt);const second=Math.ceil(c.remaining);if(second<c.lastSecond){c.lastSecond=second;combatSound('seal-tick',e.x)}if(c.remaining<=0)finishCatastrophe(e,false);return true}
 if(e.catastropheRecovery>0){e.catastropheRecovery=Math.max(0,e.catastropheRecovery-dt);e.timer=e.exposed=e.catastropheRecovery;e.ward=0;if(e.catastropheRecovery===0){e.state='chase';e.cycle='assault';e.cycleTime=e.shadowLord?7:4;e.shadowBeat=.6;e.godAttack=.7;}return true}
 tickBossSequence(e,dt);
 if(e.bossPhase!==2||e.shadowLord&&!e.awakened||!(e.form==='god'||e.shadowLord)||e.state==='revive')return false;
 e.challengeClock=(e.challengeClock??(e.shadowLord?14:12))-dt;if(e.challengeClock<=0)return bossCommitmentPending(e)?true:beginCatastrophe(e);return false;
}
function tickBossSequence(e,dt){
 const s=e.attackSequence;if(!s)return;s.clock-=dt;if(s.clock>0)return;
 if(s.kind==='thunder'){personaWarning(e,'circle',p.x,p.y,.82,{r:78,atk:46,move:'pursuingThunder',color:'#ffe898'});combatSound('chain',e.x);s.clock=.52;}
 else{const n=norm(p.x-e.x,p.y-e.y),point=safePoint(p.x-n.y*(s.left%2?210:-210),p.y+n.x*(s.left%2?210:-210),e.r);personaWarning(e,'line',e.x,e.y,1.05,{dir:n,width:100,length:Math.max(450,distance(e,p)+110),landing:point,atk:48,move:'eclipseHunt'});e.shadowMirage={life:.9,max:.9};s.clock=.85;}
 if(--s.left<=0){e.attackSequence=null;e.godAttack=1;e.shadowBeat=1;}
}
function godSecondArt(e,pattern){
 if(pattern===4){e.attackSequence={kind:'thunder',left:7,clock:0};e.godAttack=4.6;return true}
 if(pattern===5){for(let i=0;i<6;i++){const a=i*Math.PI/3;personaWarning(e,'line',e.x,e.y,1.3+i*.12,{dir:{x:Math.cos(a),y:Math.sin(a)},length:700,width:65,atk:52,move:'seraphBlades'})}return true}
 if(pattern===6){castAilmentWave(e,'paralyze');return true}return false;
}
function shadowSecondArt(e,pattern){
 if(pattern===4){personaWarning(e,'circle',p.x,p.y,.68,{r:320,atk:0,stateOnly:true,ailment:'poison',color:AILMENTS.poison.color,move:'graveVenom'});return true}
 if(pattern===5){castAilmentWave(e,'blind');return true}
 if(pattern===6){e.attackSequence={kind:'hunt',left:3,clock:0};e.shadowBeat=3.6;return true}return false;
}
function demonSecondArt(e,pattern){
 if(pattern===3){const q={x:p.x,y:p.y},r=arenaCoverRadius(q);for(const [i,a]of [0,Math.PI/2,Math.PI/4].entries()){const n={x:Math.cos(a),y:Math.sin(a)};personaWarning(e,'line',q.x-n.x*r,q.y-n.y*r,1.2+i*.42,{dir:n,length:r*2,width:100,atk:56,move:'royalGuillotine'})}return true}
 if(pattern===4){castAilmentWave(e,'weaken');return true}
 if(pattern===5){for(let i=0;i<5;i++){const q=safePoint(p.x+(i-2)*95,p.y+(i%2?80:-30),20);personaWarning(e,'circle',q.x,q.y,1+i*.28,{r:105,atk:48,ailment:i===2?'poison':null,move:'corruptEruption'})}return true}return false;
}
function updateGodTrial(e,dt){
 e.cycleTime-=dt;e.godAttack=(e.godAttack||0)-dt;
 if(e.cycleTime<=0){e.godCycle++;e.ward=e.ward>0?0:1;e.cycleTime=e.ward>0?(e.bossPhase===2?2.8:4):(e.bossPhase===2?4.5:5.5);if(e.ward)mirrorGuard(e);}
 if(e.state==='recover'){e.timer-=dt;e.exposed=Math.max(0,e.timer);if(e.timer>0)return true;e.state='chase';}
 const angle=game.time*(e.bossPhase===2?1.2:.65),target=safePoint(arenaX(380+Math.sin(angle)*210),arenaY(STAGES[game.stage].y+50+Math.cos(angle)*160),e.r),n=norm(target.x-e.x,target.y-e.y),phase=game.time%2.8,speed=e.bossPhase===2?(phase<.8?65:phase<1.6?425:145):godMotion(e).speed;
 moveActor(e,n.x*speed*dt,n.y*speed*dt);e.motionPhase=e.bossPhase===2?(phase<.8?'still':phase<1.6?'surge':'settle'):godMotion(e).phase;
 if(e.godAttack<=0&&!e.attackSequence){const pattern=(e.godPattern||0)%(e.bossPhase===2?7:4);e.godPattern=(e.godPattern||0)+1;e.godAttack=e.bossPhase===2?1.25:2;godEdict(e,pattern)}return true;
}
function drawPlainGod(e,t){
 ctx.save();ctx.translate(0,-45+Math.sin(t*1.4)*3);ctx.strokeStyle='#aebbbb';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-70,28,9,0,0,Math.PI*2);ctx.stroke();
 path([[-22,-30],[-34,34],[-15,43],[0,36],[16,43],[33,34],[21,-30]],'#929fa4','#d4dfda');path([[-14,-26],[0,-52],[15,-25],[12,5],[-12,5]],'#c3ceca','#e5e7d6');ellipse(0,-21,8,12,e.flash>0?'#fffce5':'#596f7a');ellipse(-3,-22,1.8,2,'#e6d7a5');ellipse(3,-22,1.8,2,'#e6d7a5');for(const side of [-1,1])path([[side*18,-22],[side*40,0],[side*34,8],[side*19,-1]],'#98a8ac','#c4d2cf');ctx.restore();
}
function drawMirrorGuard(e,a){
 const q=1-a;ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=e.ritual?'#ffd49c':'#d3f4ff';ctx.lineWidth=2;ctx.globalAlpha*=a;
 for(let i=0;i<8;i++){const angle=i*Math.PI/4,r=e.r*(.65+q*.6),x=Math.cos(angle)*r,y=Math.sin(angle)*r*.75;ctx.save();ctx.translate(x,y);ctx.rotate(angle+q*.3);path([[-12,0],[0,-22],[12,0],[0,22]],e.ritual?'#efd0a333':'#b3e8f433',e.ritual?'#ffd49c':'#d6f8ff');ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(7,-14);ctx.stroke();ctx.restore()}
 ctx.beginPath();ctx.ellipse(0,0,e.r*(.9+q*.1),e.r*1.2,0,-1.4,1.4);ctx.stroke();ctx.restore();
}
function drawCatastropheGather(e,t){
 const c=e.catastrophe;if(!c)return;const progress=1-c.remaining/c.duration,color=c.kind==='genesis'?'#ffe9a4':'#c2acff';ctx.save();ctx.translate(e.x,e.y-65);ctx.strokeStyle=color;
 for(let i=0;i<(reduced?4:12);i++){const a=i*Math.PI/6+t*(i%2?.5:-.6),r=155-progress*90;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+i%3*15,a,a+.55);ctx.stroke();path([[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a)*r+5,Math.sin(a)*r-15],[Math.cos(a)*r+10,Math.sin(a)*r]],color)}
 const r=22+progress*35;ellipse(0,-100,r,r,c.kind==='genesis'?'#e6bd7488':'#7460aa88');path([[-r*.35,-100],[0,-100-r*1.2],[r*.35,-100],[0,-100+r*1.2]],color,'#fff6e7');ctx.restore();
}
function drawCatastropheRelease(e,a){
 const q=1-a,color=e.broken?'#baffe0':e.persona==='genesis'?'#fff0ab':'#c7b0ff';ctx.save();ctx.translate(e.x,e.y-45);ctx.strokeStyle=color;ctx.lineWidth=3;
 for(let i=0;i<(reduced?6:18);i++){const angle=i*Math.PI/9,r=(e.broken?90:320)*(q+.2);ctx.save();ctx.rotate(angle);if(e.broken)path([[r,-4],[r+18,-20],[r+29,5],[r+8,15]],'#c9fbe655',color);else{ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(r*.4,12);ctx.lineTo(r*.7,-12);ctx.lineTo(r,0);ctx.stroke()}ctx.restore()}ctx.restore();
}
function drawAilmentPulse(e,a){
 const q=1-a,c=AILMENTS[e.ailment];if(!c)return;ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=c.color;ctx.lineWidth=3;
 for(let i=0;i<(reduced?4:10);i++){const angle=i*Math.PI/5,r=e.r*(.3+q*.7),x=Math.cos(angle)*r,y=Math.sin(angle)*r;ctx.save();ctx.translate(x,y);if(e.ailment==='poison'){ellipse(0,-q*25,6*a,9*a,c.color)}else if(e.ailment==='paralyze'){ctx.beginPath();ctx.moveTo(-8,-18);ctx.lineTo(2,-4);ctx.lineTo(-4,3);ctx.lineTo(8,19);ctx.stroke()}else if(e.ailment==='weaken'){ctx.beginPath();ctx.moveTo(-6,-18);ctx.lineTo(-2,-2);ctx.moveTo(2,2);ctx.lineTo(6,18);ctx.stroke()}else{ctx.beginPath();ctx.arc(0,0,12,-1.3,1.3);ctx.stroke()}ctx.restore()}ctx.restore();
}
function drawTrialBossBar(boss,x,y,w){
 const c=boss.catastrophe;if(!c)return;const color=c.kind==='genesis'?'#ffe1a0':'#cbb6ff';ctx.save();rounded(x,y+17,w,55,8,'#111525f5',color);ctx.font='800 12px system-ui';ctx.textAlign='left';ctx.fillStyle='#fff1d2';ctx.fillText((c.kind==='genesis'?'創世終焉':'影葬の終刻')+' · HP無効',x+8,y+32,w-65);ctx.textAlign='right';ctx.fillStyle=c.remaining<3?'#ffab98':color;ctx.fillText(c.remaining.toFixed(1)+'秒',x+w-8,y+32);ctx.textAlign='left';ctx.fillStyle='#fff6e6';ctx.font='800 11px system-ui';ctx.fillText('攻撃で術式を破壊！',x+8,y+47);ctx.textAlign='right';ctx.fillStyle=color;ctx.fillText(Math.ceil(c.guard)+' / '+c.maxGuard,x+w-8,y+47);ctx.fillStyle='#392c43';ctx.fillRect(x+8,y+54,w-16,10);ctx.fillStyle=color;ctx.fillRect(x+8,y+54,(w-16)*c.guard/c.maxGuard,10);ctx.restore();
}
function drawAilmentWorld(t){
 for(const e of enemies)if(e.hp>0)drawCatastropheGather(e,t);
 for(const w of warnings){if(!w.ailment||!showAttackWarning(w))continue;const c=AILMENTS[w.ailment],x=w.kind==='line'?w.x+w.dir.x*w.length*.5:w.x,y=w.kind==='line'?w.y+w.dir.y*w.length*.5:w.y;ctx.save();warningShape(w);ctx.strokeStyle=c.color;ctx.lineWidth=4;ctx.stroke();ctx.translate(x,y);ctx.scale(1,1/CAMERA.depth);ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#141124';ctx.strokeText(c.icon+' · 回避',0,-18);ctx.fillStyle=c.color;ctx.fillText(c.icon+' · 回避',0,-18);ctx.restore()}
 if(p.ailments)for(const [id,time]of Object.entries(p.ailments)){if(time<=0)continue;const c=AILMENTS[id];ctx.save();ctx.translate(p.x,p.y-20);ctx.strokeStyle=c.color;ctx.lineWidth=2;
  if(id==='poison'){for(let i=0;i<4;i++)ellipse(Math.sin(t*2+i*2)*25,-((t*30+i*17)%75),3,5,c.color)}else if(id==='paralyze'){for(let i=0;i<5;i++){const x=(i-2)*10;ctx.beginPath();ctx.moveTo(x,-55);ctx.lineTo(x+8,-35);ctx.lineTo(x-3,-18);ctx.lineTo(x+5,5);ctx.stroke()}}else if(id==='weaken'){path([[0,-75],[12,-59],[5,-59],[5,-42],[-5,-42],[-5,-59],[-12,-59]],'#e9a6cf','#ffdeed')}else{ctx.beginPath();ctx.ellipse(0,-50,31,9,0,t,t+Math.PI*1.6);ctx.stroke()}ctx.restore()}
}
function drawTrialVision(){
 if(!(p.ailments?.blind>0)||game.mode!=='play')return;const scale=view.scale*(reduced?1:combat.zoom),x=view.w/2+(p.x-cam.x)*scale,y=view.h/2+(p.y-cam.y)*scale*CAMERA.depth,gradient=ctx.createRadialGradient(x,y,80*view.scale,x,y,260*view.scale);gradient.addColorStop(0,'#100d1d00');gradient.addColorStop(1,'#0b071ee6');ctx.save();ctx.fillStyle=gradient;ctx.fillRect(0,0,view.w,view.h);ctx.restore();
}
function drawAilmentHUD(){
 if(game.mode!=='play'||!p.ailments)return;const active=Object.entries(p.ailments).filter(([id,n])=>n>0);if(!active.length)return;ctx.save();ctx.font='800 11px system-ui';ctx.textAlign='left';const boss=enemies.find(e=>e.kind==='boss'&&e.hp>0);let x=15,y=view.h<450&&boss?103+([...AUTO_IDS].some(id=>p.learned[id])?27:0)+(boss.catastrophe?81:27):105;
 for(const [id,time]of active){const c=AILMENTS[id],label=c.name+' '+time.toFixed(1)+'秒',width=ctx.measureText(label).width+16;if(x+width>view.w-10){x=15;y+=23}rounded(x,y,width,20,7,'#101724ef',c.color);ctx.fillStyle=c.color;ctx.fillText(label,x+8,y+14);x+=width+5}ctx.restore();
}

// Subtle look-ahead retains the player's anchor; no zoom or gameplay geometry changes.
function battleCameraBias(){
 if(game.mode!=='play'||!bossArenaActive()||game.bossScene||p.cutin>0)return {x:0,y:0};
 const boss=enemies.filter(e=>e.kind==='boss'&&e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(!boss)return {x:0,y:0};const scale=view.scale*(reduced?1:combat.zoom),input=movement();
 return {x:clamp((boss.x-p.x)*.14+input.x*12,-view.w*.075/scale,view.w*.075/scale),y:clamp((boss.y-p.y)*.11+input.y*10,-view.h*.045/(scale*CAMERA.depth),view.h*.045/(scale*CAMERA.depth))};
}
let bossTrackerObstacles=[];
function cacheBossTrackerLayout(){
 const scene=document.querySelector('.scene').getBoundingClientRect();bossTrackerObstacles=Object.keys(TOUCH_TARGETS).map(key=>touchNode(key)).filter(node=>node&&!node.hidden&&node.getClientRects().length).map(node=>{const b=node.getBoundingClientRect();return {left:b.left-scene.left-8,right:b.right-scene.left+8,top:b.top-scene.top-8,bottom:b.bottom-scene.top+8}});
}
function bossTrackerMarker(e,index=0){
 const scale=view.scale*(reduced?1:combat.zoom),x=view.w/2+(e.x-cam.x)*scale,y=view.h/2+(e.y-65-cam.y)*scale*CAMERA.depth;
 const wide=view.h<450,autoOffset=[...AUTO_IDS].some(id=>p.learned[id])?27:0,bossBottom=(wide?103:view.w<600?144:138)+autoOffset+(e.catastrophe?72:9);
 const worldTop=bossBottom+18,worldBottom=view.h-(wide?100:205);
 if(x>28&&x<view.w-28&&y>worldTop&&y<worldBottom)return {visible:true,x,y};
 // In short landscape screens the free top-right rail keeps navigation off the ritual and controls.
 const half=68,h=40,left=wide?190:12,right=view.w-12,top=wide?70:worldTop+15,bottom=wide?70:Math.max(top+38,view.h-225),cx=(left+right)/2,cy=(top+bottom)/2,dx=x-cx,dy=y-cy;
 const ratio=Math.min(Math.max(1,(right-left)/2-half)/Math.max(.001,Math.abs(dx)),Math.max(1,(bottom-top)/2)/Math.max(.001,Math.abs(dy)));
 const ideal={x:clamp(cx+dx*ratio,left+half,right-half),y:clamp(cy+dy*ratio,top,bottom)};
 const fits=q=>!bossTrackerObstacles.some(b=>q.x+half>b.left&&q.x-half<b.right&&q.y+h/2>b.top&&q.y-h/2<b.bottom);
 let point=ideal;if(!fits(point)||index){const candidates=[];for(let yy=top;yy<=bottom;yy+=22)for(const xx of [left+half,right-half])candidates.push({x:xx,y:yy});for(let xx=left+half;xx<=right-half;xx+=30)for(const yy of [top,bottom])candidates.push({x:xx,y:yy});const safe=candidates.filter(fits).sort((a,b)=>Math.hypot(a.x-ideal.x,a.y-ideal.y)-Math.hypot(b.x-ideal.x,b.y-ideal.y));point=safe[Math.min(index,safe.length-1)]||ideal;}
 return {visible:false,...point,angle:Math.atan2(y-point.y,x-point.x),width:half*2,height:h,distance:Math.round(distance(e,p))};
}
function drawBossTracker(){
 if(game.mode!=='play'||!bossArenaActive()||game.bossScene||p.cutin>0)return;
 enemies.filter(e=>e.kind==='boss'&&e.hp>0).forEach((e,i)=>{const m=bossTrackerMarker(e,i),color=e.shadowLord?'#d8c0ff':e.form==='god'?'#ffefb8':'#ffc69b';ctx.save();ctx.translate(m.x,m.y);
 if(m.visible){ctx.strokeStyle='#101421';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,35*view.scale,25*view.scale,9*view.scale,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.stroke();}
 else{rounded(-m.width/2,-20,m.width,40,12,'#0a1225ed',color);ctx.save();ctx.translate(-m.width/2+17,0);ctx.rotate(m.angle);path([[10,0],[-6,-8],[-2,0],[-6,8]],color,'#fff7e5');ctx.restore();ctx.textAlign='left';ctx.fillStyle=color;ctx.font='900 11px system-ui';ctx.fillText('BOSS · 距離 '+m.distance,-m.width/2+33,-5,m.width-39);ctx.fillStyle='#fff7e7';ctx.font='700 10px system-ui';ctx.fillText(e.name+(e.shadowTransit||e.royalTransit?' · 転移':''),-m.width/2+9,11,m.width-18);}
 ctx.restore();});
}
