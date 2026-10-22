// Attack is a weapon index: 165 is the starting blade, 255 the Black Blade.
// Saved run power remains a multiplier, so existing suspended expeditions survive.
function stageExperienceThreshold(level){const n=Math.max(0,level-1);return Math.round(42+8*n+.8*n*n)}
function dawnOfferWeight(){return campaign.clears[4]?1.05:DAWN_OFFER_WEIGHT}
function weaponReach(){return 125*p.reach}
function skillReach(value){return Number.isFinite(value)?(value+weaponReach())/2:value}
function resolvedSkill(s){if(s.reachResolved)return s;return {...s,reachResolved:true,...(s.range?{range:skillReach(s.range)}:{}),...(s.r?{r:skillReach(s.r)}:{})}}
function growthPresentationBusy(){
 return !!(p.skillCharge||p.skillPose?.life>0||p.cutin>0||
  effects.some(e=>e.life>0&&(['defeat','signatureRelease','astralSlash'].includes(e.kind)||e.kind==='artMotion'&&e.manual))||
  scheduled.some(e=>e.time>0&&e.spec.s.manual)||bolts.some(b=>b.life>0&&b.s.manual)||fields.some(f=>f.life>0&&f.s.manual));
}
function bossArenaActive(){return !!(game?.singleStage&&isBossStage())}
function battleBounds(){const y=STAGES[game?.stage||0].y;return bossArenaActive()?{left:50,right:1310,top:Math.max(WORLD.end,y-440),bottom:Math.min(WORLD.start+75,y+620)}:{left:game?.singleStage?65:100,right:game?.singleStage?695:660,top:game?.singleStage?y-245:WORLD.end,bottom:game?.singleStage?y+365:WORLD.start+75}}
function arenaX(x){return bossArenaActive()?680+(x-380)*1.65:x}
function arenaY(y){const center=STAGES[game.stage].y;return bossArenaActive()?center+(y-center)*1.45:y}
function buildOpenBossArena(){
 WORLD.w=1360;p.x=680;p.y=Math.min(STAGES[game.stage].y+400,battleBounds().bottom-p.r-20);const b=battleBounds();terrain=[];game.roomLayout=[];
 // Pillars are scenery at the perimeter. There are no solid bottlenecks.
 for(const side of [b.left,b.right])for(let y=b.top+70;y<b.bottom;y+=180)terrain.push({kind:'ruin',x:side+(side===b.left?-52:20),y,w:28,h:28,solid:false});
 groundChunks.clear();flowCache=null;flowCaches.clear();walkabilityMasks.clear();decals=[];stepClock=0;
}
function drawOpenBossArena(t){
 if(!bossArenaActive())return;const b=battleBounds(),y=STAGES[game.stage].y,c=REGIONS[game.region].color;
 ctx.save();ctx.fillStyle=['#4b6658','#3c6268','#59413e','#625d45','#292336','#d2d6c5','#25272f','#73634e','#354850'][game.region];ctx.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);
 ctx.strokeStyle=c+'28';ctx.lineWidth=1;
 for(let x=b.left+30;x<b.right;x+=90){ctx.beginPath();ctx.moveTo(x,b.top);ctx.lineTo(x,b.bottom);ctx.stroke()}
 for(let yy=b.top+30;yy<b.bottom;yy+=90){ctx.beginPath();ctx.moveTo(b.left,yy);ctx.lineTo(b.right,yy);ctx.stroke()}
 for(const r of [220,360,480]){ctx.beginPath();ctx.ellipse(680,y+70,r,r*.8,0,0,Math.PI*2);ctx.stroke()}
 ctx.strokeStyle=c+'99';ctx.lineWidth=5;ctx.strokeRect(b.left+2,b.top+2,b.right-b.left-4,b.bottom-b.top-4);ctx.restore();
}
// Teleport locations are a movement cue, never an attack hitbox. A counter window
// and an already-committed attack always finish before another jump can start.
function updateRoyalTransit(e,dt){
 if(!bossArenaActive()||game.region<4||e.shadowLord||e.form==='demon')return false;
 if(e.royalTransit){const s=e.royalTransit;s.time+=dt;if(s.time>=s.duration){Object.assign(e,s.to);e.royalTransit=null;e.royalChain=Math.max(0,(e.royalChain||0)-1);e.royalMoveClock=e.royalChain?.24:e.bossPhase===2?1.9:3;e.cooldown=Math.max(e.cooldown,.35);}return true}
 if(e.state==='revive'||e.exposed>0||e.state==='recover'||e.cycle==='exposed'||e.form==='god'&&!e.ward)return false;
 e.royalMoveClock=(e.royalMoveClock??1.4)-dt;
 if(e.royalMoveClock>0||warnings.some(w=>w.owner===e.id)||e.state==='dash')return false;
 const b=battleBounds(),candidates=Array.from({length:10},()=>safePoint(b.left+120+runRandom()*(b.right-b.left-240),b.top+120+runRandom()*(b.bottom-b.top-240),e.r)).filter(q=>distance(q,p)>155&&distance(q,e)>300);
 if(!candidates.length){e.royalMoveClock=.4;return false}
 if(!e.royalChain)e.royalChain=e.bossPhase===2&&e.form==='god'?3:e.bossPhase===2?2:1;
 e.royalTransit={from:{x:e.x,y:e.y},to:candidates[0],time:0,duration:e.bossPhase===2?.42:.6};return true;
}
function drawRoyalTransitCues(t){
 if(game.bossScene)return;
 for(const e of enemies){const s=e.royalTransit;if(!s||e.hp<=0)continue;const q=clamp(s.time/s.duration,0,1),color=e.form==='god'?'#e4e3bd':'#c5a1dd';
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([3,8]);for(const v of [s.from,s.to]){ctx.beginPath();ctx.ellipse(v.x,v.y,60+q*30,30+q*15,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=t*2+i*Math.PI/3;ctx.beginPath();ctx.moveTo(v.x+Math.cos(a)*55,v.y+Math.sin(a)*28);ctx.lineTo(v.x+Math.cos(a)*20,v.y-100*q);ctx.stroke()}}ctx.setLineDash([]);ctx.font='700 13px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#101320';ctx.strokeText(e.form==='god'?'星門 · 転移':'冥門 · 転移',s.to.x,s.to.y+45);ctx.fillStyle=color;ctx.fillText(e.form==='god'?'星門 · 転移':'冥門 · 転移',s.to.x,s.to.y+45);ctx.restore();
 }
}
function drawArrivalRitual(e,q){
 const color=REGIONS[game.region].color,reveal=clamp((q-.18)/.5,0,1);
 ctx.save();ctx.globalAlpha=Math.sin(Math.PI*q)*.8;ctx.strokeStyle=color;ctx.lineWidth=3;
 for(let i=0;i<3;i++){const radius=90+i*34;ctx.beginPath();ctx.ellipse(0,0,radius,radius*.48,q*(i%2?-1:1),0,Math.PI*2);ctx.stroke()}
 for(let i=0;i<12;i++){const a=i*Math.PI/6+q*.6,x=Math.cos(a)*150,yy=Math.sin(a)*65;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x,yy-80*reveal);ctx.stroke();path([[x-4,yy-80*reveal],[x,yy-90*reveal],[x+4,yy-80*reveal],[x,yy-72*reveal]],color)}
 if(e.form==='dragon'){for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*40,0);ctx.bezierCurveTo(side*200,-50,side*100,-160,side*160,-240*reveal);ctx.stroke()}}
 ctx.restore();
}
function drawArenaIdentity(t){
 const y=STAGES[game.stage].y,c=REGIONS[game.region].color;ctx.save();ctx.strokeStyle=c+'77';ctx.lineWidth=2;
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=680+Math.cos(a)*440,yy=y+70+Math.sin(a)*340;ctx.save();ctx.translate(x,yy);ctx.rotate(a);path([[-9,0],[0,-18],[9,0],[0,18]],c+'28',c+'66');ctx.restore()}
 if(game.region>=4){const x=680,yy=y-340;if(game.region===5){for(const r of [50,76,100]){ctx.beginPath();ctx.ellipse(x,yy,r,r*.6,t*.06,0,Math.PI*2);ctx.stroke()}}else{path([[x-90,yy+45],[x-70,yy-40],[x-40,yy-25],[x,yy-95],[x+40,yy-25],[x+70,yy-40],[x+90,yy+45]],game.region===6?'#191b23':'#352239',c+'88')}}
 ctx.restore();
}
function drawDistantBosses(){drawBossTracker()}
function drawPersistentArt(f,t){
 const s=f.s;ctx.save();ctx.translate(f.x,f.y);
 if(s.id==='tornado'){ctx.strokeStyle=s.color;ctx.lineWidth=3;for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(0,-i*17,s.r*(.25+i*.1),9+i*3,t*3+i*.6,0,Math.PI*1.65);ctx.stroke()}}
 else{for(let i=0;i<9;i++){const x=Math.sin(i*2.399)*s.r*.78,y=Math.cos(i*2.399)*s.r*.65,fall=(t*1.8+i*.137)%1;ctx.save();ctx.translate(x,y-120*(1-fall));path([[-3,-35],[0,-48],[3,-35],[2,-2],[0,5],[-2,-2]],'#bde9ff','#f2ffff');ctx.strokeStyle=s.color;ctx.beginPath();ctx.moveTo(-8,-10);ctx.lineTo(8,-10);ctx.stroke();ctx.restore()}}
 ctx.restore();
}
// Every attack has a recognisable silhouette and motion, not a generic wave.
const ART_MOTIONS={crescent:'blue-crescent',whirl:'full-turn',pierce:'thrust',flurry:'three-cuts',dash:'draw-cut',cross:'cross-cut',wave:'flying-blade',blood:'crimson-hook',flame:'fire-fang',frost:'ice-flower',thunder:'falling-sword',meteor:'falling-star',chain:'chain-lightning',tornado:'wind-coil',rain:'sword-rain',quake:'ground-break',execute:'judgment',blink:'shadow-cut',parry:'mirror',orbit:'twin-orbit',wisp:'star-companion',guard:'hex-guard',focus:'sword-spirit',heal:'healing-light'};
function emitArtMotion(s){
 if(s.category==='passive'||['nova','dawn'].includes(s.id))return;
 if(s.category==='sword'&&isManualSkill(s)){p.swing=.3;p.swingHeavy=true;p.swingSide*=-1;p.swingFace={...p.face};}const target=skillAimTarget(s,s.range||500,!['target','meteor','field','execute'].includes(s.kind)),aim=['target','meteor','field','execute'].includes(s.kind)&&target?target:p;
 const life=s.id==='meteor'?1.15:s.id==='flurry'?.58:.65;
 effects.push({kind:'artMotion',id:s.id,motion:ART_MOTIONS[s.id],manual:!!s.manual,x:aim.x,y:aim.y,r:s.r||s.range||110,face:{...p.face},color:s.id==='crescent'?'#419dff':s.color,life,max:life});
}
function drawArtGather(id,q,t){
 const s=getSkill(id),r=22+q*20;ctx.strokeStyle=s.color;ctx.lineWidth=2;
 if(s.category==='sword'){ctx.save();ctx.rotate(Math.atan2(p.face.y,p.face.x));path([[-20,-12],[-10,-48-q*30],[-3,-60-q*30],[2,-44-q*30],[-7,-8]],s.color,'#fff3d0');ctx.restore()}
 else{for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*.8;path([[Math.cos(a)*r,-30+Math.sin(a)*r],[Math.cos(a)*r-3,-40+Math.sin(a)*r],[Math.cos(a)*r+3,-40+Math.sin(a)*r]],s.color)}}
}
function drawArtMotion(e,a){
 const q=1-a,r=e.r,color=e.color;ctx.save();ctx.translate(e.x,e.y-22);ctx.rotate(Math.atan2(e.face.y,e.face.x));ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=3;
 const cut=(angle,radius,spread=.9)=>{ctx.save();ctx.rotate(angle);for(const [w,c]of [[13*a,color],[4*a,'#dff6ff'],[1.3,'#ffffff']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.arc(0,0,radius,-spread+q*.3,spread+q*.3);ctx.stroke()}for(let i=0;i<5;i++){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,radius-8-i*6,-spread+.12*i,spread-.2);ctx.stroke()}ctx.restore()};
 if(['crescent','blood','flame','whirl','flurry','cross','dash','blink','laststand','bloodpact'].includes(e.id)){
  if(e.id==='whirl')cut(q*Math.PI*2,r*.85,1.8);
  else if(e.id==='flurry'){for(let i=0;i<3;i++)if(q>i*.16)cut((i-1)*.45,r*(.7+i*.1),.65)}
  else if(e.id==='cross'){drawTaperedCut(0,0,r*.6,.2,color,7*a);ctx.rotate(Math.PI/2);drawTaperedCut(0,0,r*.6,.2,color,7*a)}
  else{if(e.id==='laststand'||e.id==='bloodpact'){const intensity=e.id==='laststand'?1-clamp(p.hp/p.maxHp,0,1):.6;for(let i=0;i<5;i++){ctx.strokeStyle=color;ctx.globalAlpha=a*(.2+intensity*.3);ctx.beginPath();ctx.arc(0,0,35+i*13,-1.2+q*2,1.2+q*2);ctx.stroke()}ctx.globalAlpha=1;cut(-.1,r*.7,.75)}cut(e.id==='blood'?.2:e.id==='blink'?-.5:0,r*.88,e.id==='crescent'?1.15:.85);if(e.id==='flame')for(let i=0;i<9;i++){const angle=-.8+i*.2,rr=r*(.5+q*.5),x=Math.cos(angle)*rr,y=Math.sin(angle)*rr;path([[x-7,y+16*a],[x,y-32*a],[x+9,y+10*a],[x,y]],i%2?'#ffb34f':'#f46a38','#ffe49a')}}
 }else if(e.id==='pierce'||e.id==='wave'){const end=r*Math.min(1,q*5);drawTaperedCut(15,0,end,.2,color,8*a);if(e.id==='wave')cut(0,45+q*25,.85)}
 else if(e.id==='frost'){for(let i=0;i<8;i++){const angle=i*Math.PI/4,rr=r*Math.min(1,q*4);ctx.save();ctx.rotate(angle);path([[rr*.3,0],[rr*.8,-9*a],[rr,-2],[rr*.75,9*a]],'#a1ddf2','#f0ffff');ctx.restore()}}
 else if(e.id==='thunder'||e.id==='rain'){ctx.rotate(-Math.atan2(e.face.y,e.face.x));for(let i=0;i<(e.id==='rain'?7:1);i++){const x=e.id==='rain'?Math.sin(i*3)*r*.7:0,fall=(q*3+i*.17)%1;ctx.save();ctx.translate(x,-150*(1-fall));path([[-6,-75],[0,-105],[6,-75],[3,0],[0,12],[-3,0]],color,'#f8ffff');ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-15,-18);ctx.lineTo(15,-18);ctx.stroke();ctx.restore()}}
 else if(e.id==='meteor'){ctx.rotate(-Math.atan2(e.face.y,e.face.x));const fall=clamp(q/.7,0,1);ellipse(0,-240*(1-fall),18+fall*22,26+fall*25,'#ff9e53');for(let i=0;i<6;i++){ctx.strokeStyle=i%2?'#ffd17b':'#d46d42';ctx.beginPath();ctx.moveTo(-20+i*8,-240*(1-fall)-15);ctx.lineTo(-45+i*14,-240*(1-fall)-120*a);ctx.stroke()}}
 else if(e.id==='chain'){for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(i*12,Math.sin(i*5)*20*a);ctx.lineTo(i*12+12,Math.sin((i+1)*5)*20*a);ctx.stroke()}}
 else if(e.id==='tornado'){for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(0,-i*16,r*(.3+i*.09),10+i*3,q*4+i,0,Math.PI*1.6);ctx.stroke()}}
 else if(e.id==='execute'){drawTaperedCut(-50,0,100+q*40,.35,'#ffe9aa',12*a);ctx.rotate(Math.PI/2);drawTaperedCut(-30,0,75,.2,'#ffb0c5',6*a)}
 else if(e.id==='quake'){for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(r*.4,8);ctx.lineTo(r*.65,-12);ctx.lineTo(r*Math.min(1,q*4),0);ctx.stroke();ctx.restore()}}
 else{ctx.rotate(-Math.atan2(e.face.y,e.face.x));const sides=e.id==='guard'?6:e.id==='parry'?4:5;ctx.beginPath();for(let i=0;i<=sides;i++){const angle=i*Math.PI*2/sides-Math.PI/2,x=Math.cos(angle)*(35+q*15),y=-25+Math.sin(angle)*(35+q*15);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();if(e.id==='wisp')ellipse(0,-70,8,12,'#fff1b4');if(e.id==='heal'){ctx.beginPath();ctx.moveTo(-18,-25);ctx.lineTo(18,-25);ctx.moveTo(0,-43);ctx.lineTo(0,-7);ctx.stroke()}}
 ctx.restore();
}
function configureDistinctMob(e){
 if(e.kind==='duelist'){e.name=game.region===6?'刃を引く影屍':'双刃の遊撃兵';e.speed*=1.18;e.hp=e.maxHp=Math.round(e.hp*1.15)}
 if(e.kind==='hexer'){e.name=game.region===6?'呪いを編む影屍':'呪糸の術師';e.speed*=.8;e.hp=e.maxHp=Math.round(e.hp*1.1)}
}
function distinctMobTick(e,dt){
 if(e.state!=='chase'||e.stun>0)return false;
 const n=norm(p.x-e.x,p.y-e.y),d=distance(e,p);
 if(e.kind==='duelist'&&d<220&&d>95&&e.cooldown>.35){const side=Math.sin(e.phase)>0?1:-1;moveActor(e,-n.y*side*e.speed*dt,n.x*side*e.speed*dt);e.facing=n;e.cooldown-=dt;return true}
 if(e.kind==='bat'&&d>120&&e.cooldown>.4){e.phase+=dt*2}
 if(e.kind==='slime'&&e.state==='chase'){e.speedPulse=.8+Math.max(0,Math.sin(game.time*3+e.phase))*.4}
 return false;
}
function distinctMobWarning(e,warn,target,dir){
 if(e.kind==='duelist'){warn('line',e.x,e.y,0,.7,{length:230,width:45,attack:'dash'});return true}
 if(e.kind==='hexer'){warn('circle',target.x,target.y,65,1.1,{attack:'pulse'});return true}return false;
}
function drawDistinctMob(e,t){
 const duelist=e.kind==='duelist',bob=Math.sin(t*5+e.phase)*2,color=e.flash>0?'#fff0db':duelist?'#7e9d96':'#8b6e9d';
 path([[-17,0],[-14,-42+bob],[0,-58+bob],[14,-42+bob],[17,0],[0,-7]],color,'#d4d5bf');ellipse(0,-43+bob,10,12,'#24283b');ellipse(-4,-44+bob,2,2,'#f1cb83');ellipse(4,-44+bob,2,2,'#f1cb83');
 if(duelist){for(const side of [-1,1])path([[side*14,-22],[side*33,-62],[side*36,-61],[side*20,-17]],'#d5e6df','#fff1ba')}
 else{ctx.strokeStyle='#b9a2c6';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-24,-30);ctx.quadraticCurveTo(0,-65+i*7,25,-28);ctx.stroke()}path([[-10,-60],[0,-78],[10,-60]],'#b898bd','#f0e4cc')}
}
