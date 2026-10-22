// Contact feedback and readability share the existing simulation and cosmetic budgets.
// Timers are transient: old campaign/rest saves need no schema migration.
function recordBladeImpact(e,hit){combatImpactAccent(e,hit);
 const direct=!hit.proc&&(hit.bladeContact||hit.manual&&!hit.automatic);
 if(!direct)return;
 const heavy=hit.heavy||hit.bladeContact&&game.singleStage&&getWeapon().speed<.6;
 e.impactPose=.16;e.impactWeight=heavy?1:.55;
 // A front-facing shield and rare fleeing enemies retain their original counterplay.
 if(!hit.guarded&&e.kind!=='boss'&&e.kind!=='goldSlime'&&!(e.staggerGuard>0)){
  e.hitStagger=heavy?.18:.09;e.staggerGuard=.65;
  if(hit.manual)e.hitPause=.045;
 }
 // Multihit/persistent manual skills cannot extend a stun, or produce unlimited scars.
 if((e.scarClock||0)>0||effects.length>=effectBudget()-2)return;
 e.scarClock=.075;const finishing=e.hp<=0,life=reduced?.12:finishing?.32:.2;
 const dir=norm(e.x-p.x,e.y-p.y),angle=Math.atan2(dir.y,dir.x)+(p.swingSide||1)*.72;
 if(effects.filter(f=>f.kind==='bladeScar').length<(reduced?6:renderLoad.slow?12:24))effects.push({kind:'bladeScar',x:e.x,y:e.y-25,angle,r:Math.min(e.kind==='boss'?82:56,(e.r+12)*(finishing?2:heavy?1.7:1.2)),color:hit.guarded?'#d6e3eb':hit.color,finishing,guarded:hit.guarded,life,max:life});
}
function tickImpactReaction(e,dt){
 for(const k of ['hitStagger','staggerGuard','impactPose','scarClock'])e[k]=Math.max(0,(e[k]||0)-dt);
}
function drawEnemy(e,t){
 ctx.save();if(e.demonRush&&!reduced){ctx.translate(e.x,e.y);ctx.rotate(e.demonRush.dir.x*.13);ctx.scale(1.1,.9);ctx.translate(-e.x,-e.y);}if(e.royalTransit){const q=e.royalTransit.time/e.royalTransit.duration;ctx.globalAlpha*=Math.max(.12,1-q);ctx.translate(e.x,e.y);ctx.scale(1-q*.45,1+q*.25);ctx.translate(-e.x,-e.y);}
 if(!reduced&&e.impactPose>0){const q=Math.sin(e.impactPose/.16*Math.PI)*(e.impactWeight||.5),boss=e.kind==='boss';ctx.translate(e.x,e.y);ctx.rotate(q*(boss?.018:.075)*(e.knock.x<0?-1:1));ctx.scale(1+q*(boss?.006:.065),1-q*(boss?.008:.07));ctx.translate(-e.x,-e.y)}
 drawEnemyBody(e,t);ctx.restore();
}
function drawBladeScar(e,a){
 const q=1-a,length=e.r*(reduced?1:.65+Math.min(1,q*5)*.8);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.lineCap='round';
 drawTaperedCut(0,0,length,e.guarded?.4:.65,e.color,e.finishing?7:4);
 for(let i=0;i<(reduced?1:e.finishing?5:3);i++){const yy=(i-1)*5;ctx.globalAlpha=a*(.7-i*.1);ctx.strokeStyle=i===0?'#fff8e5':e.color;ctx.lineWidth=i===0?1.8:1;ctx.beginPath();ctx.moveTo(-length*.85,yy-length*.15);ctx.bezierCurveTo(-length*.3,yy+length*.12,length*.4,yy+length*.18,length*(e.finishing?1.4:1),yy-length*.14);ctx.stroke()}
 ctx.restore();
}

let bladeNoise=null,bladeVoices=0;
function playBladeContact(e,hit){
 if(!hit.contact||!sounds||preferences.effects<=0||!audio||audio.state!=='running'||bladeVoices>=6)return;
 try{
  if(!bladeNoise){bladeNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.09),audio.sampleRate);const samples=bladeNoise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length)}
  const weight=hit.heavy||game.singleStage&&getWeapon().speed<.6,finishing=e.hp<=0;
  const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain(),pan=audio.createStereoPanner?.(),now=audio.currentTime,duration=finishing?.085:weight?.07:.045;
  source.buffer=bladeNoise;filter.type='bandpass';filter.frequency.value=hit.guarded?4200:hit.weak?3200:finishing?900:weight?1300:2400;filter.Q.value=hit.guarded?3:.65;
  gain.gain.setValueAtTime((weight||finishing?.085:.055)*preferences.effects,now);gain.gain.exponentialRampToValueAtTime(.00001,now+duration);source.connect(filter);filter.connect(gain);
  if(pan){pan.pan.value=clamp((e.x-p.x)/300,-.8,.8);gain.connect(pan);pan.connect(audioBus||audio.destination)}else gain.connect(audioBus||audio.destination);
  bladeVoices++;source.onended=()=>{bladeVoices--;source.disconnect();filter.disconnect();gain.disconnect();pan?.disconnect()};source.start(now);source.stop(now+duration);
 }catch{/* Audio support never gates combat. */}
}
// Small, explicit bonuses reward rhythm and weapon choices rather than changing stats.
function prepareStyleStrike(){
 return game.singleStage&&game.style==='ward'&&game.time-(p.styleLastStrike??-1)>=.7?1.12:1;
}
function completeStyleStrike(){
 if(!game.singleStage)return;p.styleLastStrike=game.time;p.styleBladeHits=(p.styleBladeHits||0)+1;
 if(game.style==='azure'&&p.styleBladeHits%3===0)p.styleEdge=true;
 if(game.style==='storm'&&p.styleBladeHits%3===0&&game.time-(p.styleManaAt??-1)>=.8){p.mp=Math.min(p.maxMp,p.mp+1);p.styleManaAt=game.time;}
}
function consumeStyleSkill(s){
 if(game.singleStage&&game.style==='azure'&&p.styleEdge&&s.category==='sword'){p.styleEdge=false;return 1.12}return 1;
}
function shadowAttackProgress(e){
 if(!e.shadowLord)return null;const w=warnings.find(w=>w.owner===e.id&&w.life>0);return w?warningProgress(w):null;
}
function drawCorpseEmergence(e){
 if(!(e.spawnTime>0))return;const q=clamp(1-e.spawnTime/1.05,0,1);
 // This uses the original 1.05 s spawn protection; no new enemy or collision object.
 rounded(-14,-27,28,32,4,'#393939','#9a9a9a');ctx.strokeStyle='#ccc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,-7);ctx.moveTo(-5,-17);ctx.lineTo(5,-17);ctx.stroke();
 ctx.strokeStyle='#222';ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*9,4);ctx.lineTo(side*(17+q*11),8);ctx.lineTo(side*(21+q*16),4);ctx.stroke()}
 ctx.beginPath();ctx.rect(-65,-112,130,122);ctx.clip();if(!reduced){ctx.translate(0,(1-q)*80);ctx.rotate((1-q)*-.3)}ctx.globalAlpha*=.35+q*.65;
}
function drawShadowAttackEchoes(t){
 if(!game.singleStage||game.region!==6||game.bossScene)return;
 for(const e of enemies){const q=shadowAttackProgress(e);if(q===null||e.hp<=0)continue;const w=warnings.find(w=>w.owner===e.id&&w.life>0),goal=w.kind==='line'||w.kind==='fan'?{x:w.x+w.dir.x*Math.min(w.length*.55,180),y:w.y+w.dir.y*Math.min(w.length*.55,180)}:w;
  const advance=reduced?.6:Math.min(1,q/.45),x=e.x+(goal.x-e.x)*advance*.55,y=e.y+(goal.y-e.y)*advance*.55;
  ctx.save();ctx.globalAlpha=.25+(1-q)*.3;ctx.translate(x,y);ctx.rotate(Math.atan2(goal.y-e.y,goal.x-e.x)+Math.PI/2);ctx.scale(e.awakened?1.3:1, .55);
  path([[-23,5],[-47,-52],[-32,-92],[-18,-82],[-18,-118],[0,-139],[18,-118],[18,-82],[32,-92],[47,-52],[23,5],[0,-11]],'#080808','#b5b5b5');
  const a=reduced?-.6:-1.2+advance*1.6;ctx.save();ctx.translate(37,-52);ctx.rotate(a);path([[-5,23],[-8,-94],[0,-138],[13,-103],[6,23]],'#151515','#ddd');ctx.restore();ctx.restore();
 }
}
function refugeObstructed(w){
 return warnings.some(other=>other!==w&&other.life>0&&warningContains(other,w,p.r))||hazards.some(z=>z.life>0&&(z.kind?warningContains(z,w,p.r):distance(z,w)<z.r+p.r));
}
// Final world pass: gameplay information survives particles, terrain fragments,
// the screen flash and the Shadow Realm grade. No warning is added for mob attacks.
function drawCombatPriorities(t,sx=0,sy=0){
 if(game.mode!=='play'||game.bossScene||game.phase==='bossIntro'||p.cutin>0)return;
 ctx.save();ctx.translate(view.w/2+sx,view.h/2+sy);const zoom=reduced?1:combat.zoom;ctx.scale(view.scale*zoom,view.scale*zoom*CAMERA.depth);ctx.translate(-cam.x,-cam.y);
 drawPlayerArtPriority();drawSurvivalActor(t);const strong=warnings.filter(w=>w.life>0&&showAttackWarning(w));
 for(const w of strong){
  ctx.save();warningShape(w);ctx.strokeStyle='#10141c';ctx.lineWidth=6/view.scale;ctx.stroke();ctx.strokeStyle=w.life<=p.justWindow?'#fff3b3':'#ffbd89';ctx.lineWidth=2.3/view.scale;ctx.stroke();
  // Inner rings are informational only; overlap with another attack stays visibly unsafe.
  if(w.kind==='ring'&&w.inner>0){const blocked=refugeObstructed(w),r=Math.max(1,w.inner-p.r*.5-3);ctx.beginPath();ctx.arc(w.x,w.y,r,0,Math.PI*2);ctx.fillStyle='#baffdc15';ctx.fill();ctx.strokeStyle='#091b22';ctx.lineWidth=7/view.scale;ctx.stroke();ctx.strokeStyle='#baffdf';ctx.lineWidth=3/view.scale;ctx.setLineDash([9,5]);ctx.stroke();ctx.setLineDash([]);
   ctx.save();ctx.translate(w.x,w.y);ctx.scale(1,1/CAMERA.depth);ctx.font='800 13px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#10232b';ctx.strokeText(blocked?'重なる攻撃に注意':'安全地帯',0,5);ctx.fillStyle=blocked?'#ffe4b5':'#f0fff7';ctx.fillText(blocked?'重なる攻撃に注意':'安全地帯',0,5);ctx.restore();}
  ctx.restore();
 }
 // Active ring hazards keep their refuge visible for the entire damaging lifetime.
 for(const z of hazards)if(z.life>0&&z.kind==='ring'&&z.inner>0&&showAttackWarning(z)){ctx.save();ctx.beginPath();ctx.arc(z.x,z.y,Math.max(1,z.inner-p.r*.5-3),0,Math.PI*2);ctx.strokeStyle='#10141c';ctx.lineWidth=7/view.scale;ctx.stroke();ctx.strokeStyle='#c8ffe0';ctx.lineWidth=3/view.scale;ctx.setLineDash([9,5]);ctx.stroke();ctx.restore()}
 // A compact contour and foot mark remain visible without repainting the actor over scenery.
 aboveView(()=>{ctx.save();ctx.translate(p.x,p.y);const busy=effects.length>30||strong.length>0;ctx.globalAlpha=busy?1:.6;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(-13,4);ctx.lineTo(-22,3);ctx.lineTo(-19,-23);ctx.lineTo(-21,-39);ctx.lineTo(-13,-43);ctx.lineTo(-16,-57);ctx.lineTo(-10,-65);ctx.lineTo(-2,-66);ctx.lineTo(4,-71);ctx.lineTo(18,-62);ctx.lineTo(13,-46);ctx.lineTo(21,-39);ctx.lineTo(20,-19);ctx.lineTo(21,4);ctx.lineTo(8,5);
  ctx.strokeStyle='#071322';ctx.lineWidth=4/view.scale;ctx.stroke();ctx.strokeStyle=p.hurtRecovery>0?'#ffe5d5':'#d6f8ff';ctx.lineWidth=1.3/view.scale;ctx.stroke();ctx.restore()},p.x,p.y);
 ctx.save();ctx.beginPath();ctx.ellipse(p.x,p.y+6,22,9,0,0,Math.PI*2);ctx.strokeStyle='#071322';ctx.lineWidth=5/view.scale;ctx.stroke();ctx.strokeStyle=p.styleEdge?'#ffe2a6':'#d1f6ff';ctx.lineWidth=1.6/view.scale;ctx.stroke();ctx.restore();ctx.restore();
}
