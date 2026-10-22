// Layered, original synthesis. Profiles are timbres, not copies of BGM notes.
const COMBAT_SOUNDS={
 crescent:[920,240,.22,'triangle',.4,4200,.075],whirl:[480,170,.4,'sawtooth',.55,2800,.06],pierce:[1900,420,.18,'triangle',.25,6500,.065],flurry:[1300,360,.28,'square',.35,4500,.045],dash:[700,140,.25,'sawtooth',.65,3200,.06],cross:[1100,260,.32,'triangle',.5,3600,.065],wave:[850,120,.46,'sine',.6,2400,.065],blood:[360,80,.38,'sawtooth',.55,1400,.065],execute:[1450,65,.55,'triangle',.7,2200,.075],
 flame:[160,55,.55,'sawtooth',.9,1000,.075],frost:[2400,900,.55,'sine',.45,7200,.065],thunder:[120,45,.7,'sawtooth',1,3600,.08],meteor:[90,32,.85,'sawtooth',1,900,.085],chain:[1800,110,.38,'square',.85,5600,.05],tornado:[320,90,.65,'sine',.85,1800,.06],rain:[2100,450,.55,'triangle',.6,5400,.055],quake:[95,28,.75,'triangle',1,650,.085],nova:[78,31,.85,'sawtooth',.85,650,.085],dawn:[660,1320,.9,'sine',.4,4800,.075],
 orbit:[1046,523,.45,'triangle',.2,5000,.045],guard:[330,880,.5,'sine',.18,2200,.055],parry:[2800,1300,.26,'sine',.5,7600,.055],heal:[440,880,.65,'sine',.12,2400,.05],blink:[220,60,.32,'sine',.75,2000,.065],wisp:[1568,784,.5,'sine',.15,6200,.04],focus:[180,720,.5,'triangle',.2,1800,.06],
 'charge-dark':[62,105,.5,'sawtooth',.25,500,.05],'charge-light':[330,990,.58,'sine',.15,2400,.05],'charge-element':[220,660,.3,'triangle',.3,3200,.045],
 'hit-metal':[2200,800,.16,'triangle',.8,6000,.045],'hit-flesh':[140,55,.14,'sine',.75,900,.06],'hit-weak':[1800,500,.25,'sine',.6,4200,.05],'kill-split':[460,65,.3,'sawtooth',.9,1900,.06],
 'demon-roar':[65,36,1.15,'sawtooth',.8,700,.08],'demon-rush':[180,48,.5,'sawtooth',1,1300,.075],'demon-blade':[260,45,.65,'sawtooth',.95,2100,.08],'demon-gather':[52,95,1.2,'sawtooth',.35,500,.055],'demon-cataclysm':[54,24,1.45,'triangle',1,1000,.095],
 'god-verdict':[880,1760,1,'sine',.35,5200,.07],'shadow-rift':[160,40,.7,'sine',.85,1500,.065],'beast-roar':[100,45,.7,'sawtooth',.8,750,.065],'tide-crash':[140,45,.7,'sine',1,1600,.07],'dragon-breath':[95,32,.95,'sawtooth',1,1200,.075],'stone-break':[85,28,.65,'triangle',1,800,.075],
 'ultimate-sorai':[740,70,1,'triangle',.9,4000,.085],'ultimate-raika':[1568,392,1,'sine',.7,5400,.08],'ultimate-raigai':[170,35,1.1,'sawtooth',1,2200,.085]
};
const combatNoiseBuffers=new WeakMap(),combatSoundTimes=new Map();let combatVoices=0;
function combatNoise(context){
 if(combatNoiseBuffers.has(context))return combatNoiseBuffers.get(context);
 const b=context.createBuffer(1,Math.ceil(context.sampleRate*2),context.sampleRate),data=b.getChannelData(0);let seed=0x51ae;
 for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1}combatNoiseBuffers.set(context,b);return b;
}
function scheduleCombatProfile(context,profile,start,pan=0,output=context.destination,volume=1){
 const [hz,end,duration,type,noise,filterHz,gain]=profile,nodes=[],finish=[];
 const bus=context.createGain(),filter=context.createBiquadFilter(),stereo=context.createStereoPanner?.();nodes.push(bus,filter);filter.type='lowpass';filter.frequency.setValueAtTime(filterHz,start);filter.frequency.exponentialRampToValueAtTime(Math.max(140,filterHz*.25),start+duration);
 bus.gain.setValueAtTime(.00001,start);bus.gain.exponentialRampToValueAtTime(Math.max(.00001,gain*volume),start+.008);bus.gain.exponentialRampToValueAtTime(.00001,start+duration);bus.connect(filter);
 if(stereo){stereo.pan.value=clamp(pan,-.8,.8);filter.connect(stereo);stereo.connect(output);nodes.push(stereo)}else filter.connect(output);
 for(let i=0;i<2;i++){const o=context.createOscillator(),g=context.createGain();o.type=i?'sine':type;o.frequency.setValueAtTime(hz*(i?.501:1),start);o.frequency.exponentialRampToValueAtTime(Math.max(22,end*(i?.5:1)),start+duration);g.gain.value=i?.38:.55;o.connect(g);g.connect(bus);nodes.push(o,g);finish.push(o);o.start(start);o.stop(start+duration+.01)}
 const source=context.createBufferSource(),g=context.createGain();source.buffer=combatNoise(context);g.gain.value=noise*.6;source.connect(g);g.connect(bus);nodes.push(source,g);finish.push(source);source.start(start);source.stop(start+duration+.02);
 let active=finish.length;for(const source of finish)source.onended=()=>{combatVoices=Math.max(0,combatVoices-1);if(!--active)for(const node of nodes)node.disconnect()};combatVoices+=finish.length;return {duration,voices:finish.length};
}
function combatSound(id,x=p?.x||380){
 const profile=COMBAT_SOUNDS[id];if(!profile||!sounds||preferences.effects<=0||!audio||audio.state!=='running'||combatVoices>=(id.startsWith('demon-')||id==='god-verdict'||id==='shadow-rift'?36:30))return false;
 const now=audio.currentTime;if(now-(combatSoundTimes.get(id)??-99)<(id.startsWith('hit-')?.07:.045))return false;combatSoundTimes.set(id,now);
 try{if(!audioBus){audioBus=audio.createDynamicsCompressor();audioBus.threshold.value=-15;audioBus.ratio.value=5;audioBus.connect(audio.destination)}scheduleCombatProfile(audio,profile,now,clamp((x-p.x)/500,-.8,.8),audioBus,preferences.effects*.8);return true}catch{return false}
}
function arenaCoverRadius(point){const b=battleBounds();return Math.max(...[b.left,b.right].flatMap(x=>[b.top,b.bottom].map(y=>Math.hypot(x-point.x,y-point.y))))+40}
function creatureSignature(e,warn,target,dir){
 if(e.form!=='monster'&&e.form!=='sentinel')return false;const pattern=(e.pattern++)%3;
 if(e.form==='monster'){
  if(pattern===0)warn('circle',target.x,target.y,125,1.2,{attack:'stomp'});
  else if(pattern===1){const b=battleBounds(),n=norm(p.x-e.x,p.y-e.y);epicWarning(e,'line',e.x,e.y,0,1.5,{dir:n,length:arenaCoverRadius(e),width:125,style:'tide',atk:e.atk});banner('蒼潮の奔流','横へ泳ぐように抜けろ',1)}
  else warn('ring',e.x,e.y,300,1.4,{inner:115,attack:'shockwave'});
 }else{
  if(pattern===0){warn('line',e.x,e.y,0,1.45,{dir,length:arenaCoverRadius(e),width:74,attack:'beam'});warn('line',e.x,e.y,0,1.75,{dir:{x:-dir.y,y:dir.x},length:arenaCoverRadius(e),width:74,attack:'beam'});banner('星核の照射','二軸の光線を見切れ',1)}
  else if(pattern===1)warn('circle',target.x,target.y,115,1.35,{attack:'stomp'});
  else warn('ring',e.x,e.y,330,1.6,{inner:100,attack:'shockwave'});
 }return true;
}
function arenaRefuge(){
 const b=battleBounds(),candidates=[];
 for(let i=0;i<48;i++){const angle=runRandom()*Math.PI*2,d=160+runRandom()*130,q={x:p.x+Math.cos(angle)*d,y:p.y+Math.sin(angle)*d};
  if(q.x<b.left+125||q.x>b.right-125||q.y<b.top+125||q.y>b.bottom-125||!canStand(q.x,q.y,p.r)||!routeClear(p,q,p.r))continue;
  if(warnings.some(w=>warningContains(w,q,120))||hazards.some(z=>z.kind?warningContains(z,q,120):distance(z,q)<z.r+120))continue;candidates.push(q);
 }return candidates.length?candidates[Math.floor(runRandom()*candidates.length)]:{x:p.x,y:p.y};
}
function demonDuel(e,dt){
 if(updateDemonRush(e,dt))return true;
 if(e.awakened){
  e.cycleTime-=dt;if(e.cycleTime<=0){clearHostiles();e.cycle=e.cycle==='assault'?'exposed':'assault';e.cycleTime=e.cycle==='assault'?10:3.8;e.state=e.cycle==='exposed'?'recover':'chase';e.exposed=e.cycle==='exposed'?e.cycleTime:0;e.timer=e.exposed;e.barrageClock=.65;e.royalFootClock=.8;banner(e.cycle==='exposed'?'黒炎が消えた · 核心露出！':'冥王、猛攻再開',e.cycle==='exposed'?'今こそ大剣を叩き込め':'突進の軌道から横へ',1.1)}
  if(e.cycle==='exposed'){e.exposed=e.cycleTime;return true}
 }else if(e.state==='recover'){e.timer-=dt;e.exposed=Math.max(0,e.timer);if(e.timer>0)return true;e.state='chase';e.magicClock=.4;}
 if(e.state==='revive'){e.timer-=dt;if(e.timer<=0)e.state='chase';return true}
 const active=warnings.some(w=>w.owner===e.id&&w.life>0);
 if(e.nextRush&&!active){e.nextRush=false;warnDemonCharge(e,true);return true}
 if(active)return true;
 e.doomClock=(e.doomClock??6)-dt;if(e.doomClock<=0){demonRoyalSignature(e,0);return true}
 if(e.awakened){e.barrageClock=(e.barrageClock||0)-dt;if(e.barrageClock<=0){demonSwordAssault(e,0);return true}}
 else{e.magicClock=(e.magicClock??.8)-dt;if(e.magicClock<=0){e.magicClock=e.bossPhase===2?1.25:1.65;demonMagicWarning(e,p,norm(p.x-e.x,p.y-e.y));return true}}
 e.royalFootClock=(e.royalFootClock??.6)-dt;if(e.royalFootClock<=0){const b=battleBounds(),side=(e.pattern||0)%2?1:-1,n=norm(p.x-e.x,p.y-e.y),to=safePoint(p.x-n.y*side*220,p.y+n.x*side*220,e.r);if(distance(e,to)>130){startDemonRush(e,{x:e.x,y:e.y,landing:to,atk:0,width:110,harmless:true});e.royalFootClock=e.awakened?1.6:2.2}else e.royalFootClock=.6}
 return true;
}
function warnDemonCharge(e,follow=false){
 const n=norm(p.x-e.x,p.y-e.y),b=battleBounds(),length=Math.min(1000,Math.max(460,distance(e,p)+180)),to=safePoint(e.x+n.x*length,e.y+n.y*length,e.r),dir=norm(to.x-e.x,to.y-e.y);
 const w=personaWarning(e,'line',e.x,e.y,follow?1:1.3,{dir,width:e.awakened?160:130,length:distance(e,to),landing:to,atk:follow?60:64,move:'royalLunge',rush:true,chain:e.awakened&&!follow&&(e.barrageIndex||0)%3===1});
 e.state='windup';e.timer=w.life;e.facing=dir;combatSound('demon-gather',e.x);banner(follow?'追撃・王断疾走':'王断疾走',follow?'もう一度、横へ抜けろ':'剣を引いた · 直線の軌道から離れろ',1);return w;
}
function startDemonRush(e,w){
 const to=safePoint(w.landing.x,w.landing.y,e.r),from={x:e.x,y:e.y},duration=Math.max(.26,distance(from,to)/(w.harmless?1350:1700));
 e.demonRush={from,to,time:0,duration,atk:w.atk||0,width:w.width||150,harmless:!!w.harmless,perfectUsed:!!w.perfectUsed,owner:e.id,kind:'line',x:from.x,y:from.y,dir:norm(to.x-from.x,to.y-from.y),length:distance(from,to),hit:false,chain:!!w.chain,echo:0};e.state='royalRush';e.facing={...e.demonRush.dir};combatSound('demon-rush',e.x);
}
function updateDemonRush(e,dt){
 const rush=e.demonRush;if(!rush)return false;const before={x:e.x,y:e.y};rush.time=Math.min(rush.duration,rush.time+dt);const q=rush.time/rush.duration;
 e.x=rush.from.x+(rush.to.x-rush.from.x)*q;e.y=rush.from.y+(rush.to.y-rush.from.y)*q;rush.echo-=dt;
 if(rush.echo<=0){rush.echo=.035;effects.push({kind:'demonWake',x:before.x,y:before.y,ex:e.x,ey:e.y,dir:rush.dir,harmless:rush.harmless,r:e.r,life:.42,max:.42})}
 if(!rush.harmless&&!rush.hit&&!rush.perfectUsed&&segmentHits(before,e,p,rush.width/2+p.r*.5)){
  if(p.rollTime>0&&p.dodgeAge<.2)perfectDodge(rush);
  if(!rush.perfectUsed){game.damageThreat=rush;game.hitSource='突進';takeHit(rush.atk,e.x,e.y);game.damageThreat=null;}rush.hit=true;
 }
 if(rush.time>=rush.duration){e.demonRush=null;e.state=e.awakened?'chase':'recover';e.timer=rush.harmless?.18:.95;e.exposed=!e.awakened&&!rush.harmless?.95:0;e.nextRush=rush.chain;e.barrageClock=e.nextRush?.3:.9;effects.push({kind:'combatBloom',flavor:'earth',x:e.x,y:e.y,r:rush.harmless?65:145,color:rush.harmless?'#a8a7b8':'#ff9d6b',face:rush.dir,life:.65,max:.65});if(!rush.harmless)combatSound('demon-blade',e.x)}
 return true;
}
function castDemonCataclysm(e){
 warnings=warnings.filter(w=>w.owner!==e.id);hostileShots=hostileShots.filter(w=>w.owner!==e.id);hazards=hazards.filter(w=>w.owner!==e.id);if(game.pendingHit?.warning.owner===e.id)game.pendingHit=null;e.nextRush=false;const refuge=randomRefuge(),r=arenaCoverRadius(refuge),time=3.15;
 const w=personaWarning(e,'ring',refuge.x,refuge.y,time,{r,inner:120,atk:92,move:'infernalDominion',style:'doom',dominion:true});e.cycleTime=Math.max(e.cycleTime||0,time+1.4);e.state='windup';e.timer=time;e.doomClock=e.awakened?9.5:13;e.barrageClock=1.2;
 combatSound('demon-gather',e.x);game.royalPressure={owner:e.id,life:time,max:time,color:'#ef7856'};bannerTTL=0;$('banner').classList.remove('show');game.epicEvent=null;return w;
}
function castDemonSorcery(e,target,dir){
 const pattern=(e.pattern++)%3;e.state='windup';e.timer=1.6;
 if(pattern===0){const b=battleBounds();for(let i=0;i<3;i++){const x=clamp(target.x+(i-1)*150,b.left+140,b.right-140),y=clamp(target.y+(i%2?130:-50),b.top+140,b.bottom-140);personaWarning(e,'circle',x,y,1.65+i*.3,{r:115,atk:52,move:'blackStarfall'})}combatSound('demon-gather',e.x);banner('黒星墜','三つの黒炎が落ちる',1)}
 else if(pattern===1){const b=battleBounds(),x=clamp(target.x,b.left+100,b.right-100);for(const side of [-1,1])personaWarning(e,'line',x+side*110,b.top,1.85,{dir:{x:0,y:1},width:125,length:b.bottom-b.top,atk:56,persist:1.1,move:'hellPillars'});combatSound('demon-gather',e.x);banner('冥門の双炎','区画を貫く黒炎 · 間を抜けろ',1.3)}
 else{personaWarning(e,'fan',e.x,e.y,1.5,{dir,length:850,spread:.85,atk:54,move:'abyssReap'});combatSound('demon-blade',e.x);banner('闇刃の扇','大きく横へ',1)}
}
function castDemonSword(e){
 if(warnings.some(w=>w.owner===e.id&&w.life>.15))return;e.barrageClock=1.45;const pattern=(e.barrageIndex||0)%6;e.barrageIndex=(e.barrageIndex||0)+1;if(demonSecondArt(e,pattern))return;
 if(pattern===0)return warnDemonCharge(e);
 const n=norm(p.x-e.x,p.y-e.y);
 if(pattern===1){for(const [i,a]of [-.36,.36].entries()){const angle=Math.atan2(n.y,n.x)+a;personaWarning(e,'fan',e.x,e.y,1.35+i*.5,{dir:{x:Math.cos(angle),y:Math.sin(angle)},length:410,spread:1.05,atk:58,move:'royalReap'})}combatSound('demon-blade',e.x);banner('獄王の二連薙ぎ','振り終わるまで正面に入るな',1)}
 else{const length=arenaCoverRadius(e);personaWarning(e,'line',e.x,e.y,1.65,{dir:n,width:175,length,atk:62,persist:1.25,move:'hellbrand'});combatSound('demon-gather',e.x);banner('黒炎・地断ち','区画の果てまで剣が走る',1.25)}
}
function playerArtSound(s){combatSound(s.id);if(isManualSkill(s))game.artCaption={id:s.id,life:.8,max:.8};}
function combatImpactAccent(e,hit){
 if(hit.proc||hit.automatic&&!hit.bladeContact)return;
 combatSound(hit.guarded?'hit-metal':hit.weak?'hit-weak':e.hp<=0?'kill-split':'hit-flesh',e.x);
 if(hit.manual&&game.time-(game.artImpactAt??-1)>.06){game.artImpactAt=game.time;const s=getSkill(p.skillPose?.id);if(s)emitCombatBloom(s,e,true)}
}
function emitCombatBloom(s,point=p,impact=false){
 if(!s||s.category==='passive')return;const flavor=({fire:'fire',ice:'ice',lightning:'lightning',wind:'wind',earth:'earth',dark:'dark',light:'light'})[skillElement(s)]||(s.id==='blood'?'blood':'blade');
 effects.push({kind:'combatBloom',flavor,x:point.x,y:point.y,r:impact?48:Math.min(210,s.reachResolved?(s.r||s.range||100):skillReach(s.r||s.range||100)),face:{...p.face},color:s.color||'#a9e8ff',life:impact?.32:.7,max:impact?.32:.7});
}
function drawCombatBloom(e,a){
 const q=1-a,count=reduced?4:12,r=e.r*(.3+q*.8);ctx.save();ctx.translate(e.x,e.y-22);ctx.strokeStyle=e.color;ctx.lineWidth=2;
 for(let i=0;i<count;i++){const angle=i*Math.PI*2/count+q*.4,x=Math.cos(angle)*r,y=Math.sin(angle)*r*.7;ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  if(e.flavor==='fire'){drawHellFlame(0,12*a,12,60*a,q,i)}
  else if(e.flavor==='ice'){path([[-6,8],[0,-38*a],[8,8],[0,17]],'#58aec9','#d9ffff')}
  else if(e.flavor==='lightning'){ctx.beginPath();ctx.moveTo(-20,-20*a);ctx.lineTo(-5,6);ctx.lineTo(6,-7);ctx.lineTo(24,26*a);ctx.stroke()}
  else if(e.flavor==='earth'){ctx.translate(0,-Math.sin(q*Math.PI)*(15+i%3*10));path([[-12,5],[-7,-13],[8,-8],[14,6],[0,11]],'#584b59','#d8bd9c')}
  else if(e.flavor==='dark'){path([[-6,12],[0,-35*a],[4,10],[0,22]],'#130b20','#d394ff');ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(13,22);ctx.lineTo(2,34);ctx.stroke()}
  else if(e.flavor==='light'){path([[-3,12],[0,-35*a],[4,12],[0,18]],'#fff4bf','#fffdf0')}
  else if(e.flavor==='wind'){ctx.beginPath();ctx.arc(-r*.2,0,30+q*20,-.7,.7);ctx.stroke()}
  else if(e.flavor==='blood'){path([[0,-12*a],[7,0],[0,12*a],[-7,0]],'#fb83b1','#ffd7e7')}
  else{ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(18*a,0);ctx.stroke()}
  ctx.restore();
 }ctx.restore();
}
function drawDemonWake(e,a){
 ctx.save();ctx.translate(e.x,e.y-20);ctx.rotate(Math.atan2(e.dir.y,e.dir.x));const length=Math.hypot(e.ex-e.x,e.ey-e.y)+100;ctx.fillStyle=e.harmless?'#9f9baf22':'#3f112d66';path([[-length,-e.r*.5],[25,-e.r*.2],[45,0],[25,e.r*.2],[-length,e.r*.5]],ctx.fillStyle);for(let i=0;i<7;i++){ctx.strokeStyle=e.harmless?'#bbb5c5':'#ffc48a';ctx.globalAlpha=a*(.7-i*.07);ctx.lineWidth=i===3?5:1.5;ctx.beginPath();ctx.moveTo(-length,(-3+i)*12);ctx.lineTo(30,(-3+i)*5);ctx.stroke()}ctx.restore();
}
function drawHellFlame(x,y,width,height,q,seed){
 if(height<1)return;ctx.save();ctx.translate(x,y);const lean=Math.sin(q*9+seed)*width*.5;
 const g=ctx.createLinearGradient(0,0,0,-height);g.addColorStop(0,'#170b25cc');g.addColorStop(.4,'#92283ee6');g.addColorStop(.8,'#f27845e0');g.addColorStop(1,'#ffe2a5bb');ctx.fillStyle=g;ctx.strokeStyle='#ffcb86aa';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.moveTo(-width,5);ctx.bezierCurveTo(-width*1.4,-height*.25,width*.2,-height*.33,-width*.5,-height*.62);ctx.bezierCurveTo(width*.2,-height*.55,lean+width*.4,-height*.75,lean,-height);ctx.bezierCurveTo(lean+width*1.7,-height*.65,width*.3,-height*.45,width*.9,-height*.3);ctx.bezierCurveTo(width*1.3,-height*.12,width*.8,0,-width,5);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffd59aa0';ctx.beginPath();ctx.moveTo(-width*.4,0);ctx.bezierCurveTo(-width*.7,-height*.2,width*.5,-height*.3,lean*.5,-height*.62);ctx.bezierCurveTo(width*.8,-height*.26,width*.6,-height*.1,width*.25,0);ctx.fill();
 for(let i=0;i<3;i++){const phase=(q*1.7+i*.33+seed*.11)%1;ellipse(Math.sin(seed+i*3+q*5)*width*1.3,-height*phase,1.2,3,'#ffdda6')}
 ctx.restore();
}
function drawDemonPresence(e,t){
 const exposed=e.cycle==='exposed',large=e.awakened,charge=e.demonCast>0||!!e.demonRush;ctx.save();ctx.globalAlpha=exposed?.2:charge?.65:.35;
 const color=exposed?'#a6f8d2':large?'#ff8e66':'#bf7ae8';ctx.strokeStyle=color;ctx.lineWidth=2;
 for(let i=0;i<(reduced?3:8);i++){const a=i*Math.PI/4+t*.18,x=Math.cos(a)*(large?82:58),y=Math.sin(a)*25,h=(charge?100:55)+(large?30:0)+Math.sin(t*4+i)*12;ctx.fillStyle=i%2?'#250b25b0':'#3b102c88';ctx.beginPath();ctx.moveTo(x-10,y);ctx.bezierCurveTo(x-25,y-h*.4,x+15,y-h*.7,x+Math.sin(t+i)*12,y-h);ctx.bezierCurveTo(x+35,y-h*.5,x+8,y-20,x+10,y);ctx.fill();ctx.stroke()}
 ctx.beginPath();ctx.ellipse(0,6,large?104:70,large?36:25,0,t*.2,t*.2+Math.PI*1.7);ctx.stroke();ctx.restore();
}
function drawCataclysm(e,a){
 const b=e.bounds||battleBounds(),q=1-a;ctx.save();ctx.fillStyle='#280d1c33';ctx.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);
 const visible=worldBounds(),count=reduced?10:42;for(let i=0;i<count;i++){const x=b.left+((i*197)%Math.floor(b.right-b.left)),y=b.top+((i*293)%Math.floor(b.bottom-b.top));if(x<visible.left-70||x>visible.right+70||y<visible.top-60||y>visible.bottom+260||Math.hypot(x-e.x,y-e.y)<(e.inner||120)+35)continue;const height=Math.sin(Math.min(1,q*2)*Math.PI)*(100+i%5*35);ctx.strokeStyle='#ffb570';ctx.lineWidth=2*a;ctx.beginPath();ctx.moveTo(x-35,y+12);ctx.lineTo(x-13,y-8);ctx.lineTo(x+4,y+10);ctx.lineTo(x+30,y-12);ctx.stroke();drawHellFlame(x,y,28,height,q,i);ctx.save();ctx.translate(x,y-Math.sin(q*Math.PI)*(25+i%3*18));ctx.rotate(q+i);path([[-15,0],[-9,-23],[17,-16],[23,12]],'#3a2837','#d59373');ctx.restore()}
 ctx.restore();
}
function drawPlayerArtPriority(){
 const primary=effects.filter(e=>e.life>0&&((e.kind==='artMotion'&&e.manual)||e.kind==='signatureRelease')).slice(-3);
 for(const e of primary){const a=e.life/e.max,q=1-a,r=e.r||Math.min(e.length||220,320),face=e.face||p.face;ctx.save();ctx.translate(e.x,e.y-22);ctx.rotate(Math.atan2(face.y,face.x));ctx.lineCap='round';
  const line=()=>{ctx.beginPath();if(e.id==='pierce'||e.id==='nova'){ctx.moveTo(12,0);ctx.lineTo(e.length||r,0)}else if(e.id==='cross'){ctx.moveTo(-r*.45,0);ctx.lineTo(r*.45,0);ctx.moveTo(0,-r*.45);ctx.lineTo(0,r*.45)}else if(e.id==='dawn'||e.id==='whirl'){const angle=q*Math.PI*2;ctx.arc(0,0,r*.9,angle-1.5,angle)}else if(['crescent','flurry','blood','flame','dash','blink'].includes(e.id))ctx.arc(0,0,r*.87,-1+q*.3,1+q*.3);else{ctx.arc(0,0,Math.min(r,90)*(.8+q*.2),-.9,.9)}};
  ctx.globalAlpha=Math.min(1,a*3)*.95;for(const [width,color]of [[9,'#081322'],[5,e.id==='nova'?'#d693ff':e.id==='crescent'?'#4caaff':e.color||'#fff1bc'],[1.4,'#f1ffff']]){ctx.strokeStyle=color;ctx.lineWidth=width/view.scale;line();ctx.stroke()}ctx.restore();
 }
 const c=game.artCaption;if(c?.life>0){ctx.save();ctx.translate(p.x,p.y-112);ctx.scale(1,1/CAMERA.depth);ctx.globalAlpha=Math.min(1,c.life*4);ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#071220';const title=skillDisplayName(getSkill(c.id));ctx.strokeText(title,0,0);ctx.fillStyle=getSkill(c.id).color;ctx.fillText(title,0,0);ctx.restore()}
}
function updateMajestyPresentation(dt){if(game.artCaption)game.artCaption.life=Math.max(0,game.artCaption.life-dt);if(game.royalPressure)game.royalPressure.life=Math.max(0,game.royalPressure.life-dt)}
function drawMajestyPressure(){
 if(game.bossScene||p.cutin>0||!game.royalPressure?.life)return;const e=game.royalPressure,q=1-e.life/e.max;ctx.save();
 if(preferences.flashes){ctx.globalAlpha=reduced?.13:.2+q*.1;const g=ctx.createRadialGradient(view.w/2,view.h/2,view.h*.25,view.w/2,view.h/2,view.h*.85);g.addColorStop(0,'#25091d00');g.addColorStop(1,e.color);ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h)}
 ctx.restore();
}
function drawMajestyCaption(){
 if(game.bossScene||p.cutin>0||!game.royalPressure?.life)return;ctx.save();const y=view.h<450?82:172,w=Math.min(286,view.w-90);rounded((view.w-w)/2,y-22,w,49,12,'#111527eb','#ca8566');ctx.textAlign='center';ctx.font='900 19px serif';ctx.fillStyle='#ffe2a4';ctx.fillText('冥府崩界',view.w/2,y);ctx.font='700 12px system-ui';ctx.fillStyle='#d5ffe9';ctx.fillText('全域崩壊 · 蒼緑の避難域へ',view.w/2,y+18);ctx.restore();
}
