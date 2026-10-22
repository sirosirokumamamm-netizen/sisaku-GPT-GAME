// Each late realm has a visual descent and its own boss vocabulary. Stable save IDs.
function roomWaveCount(region=game.region,room=game.room){return region===TEMPLE||room===stageRoomCount(region)?1:region===6?(room>=4?4:3):region===7?3:region===5?(room===1||room===3?2:3):2}
function realmDepth(room=game.room){return clamp((room-1)/(stageRoomCount()-1),0,1)}
function realmChapter(region=game.region,room=game.room){if(region===TEMPLE)return '第'+room+'刻・'+REGIONS[endgameBossRegion()].name;if(region===WASTELAND)return ['風化した街道','剣塚の丘','忘却の集落','始原の参道','王骸の封印','王骸の玉座'][room-1]||'';return ({4:['魔城の外縁','黒炎の回廊','禁術の広間','王の近衛域','冥王の玉座'],5:['雲海の入口','天への階段','星詠みの聖堂','裁きの門','神託の回廊','創世の神座'],6:['灰の墓地','屍の参道','忘却の霊廟','黒月の王域','終影の回廊','影葬の玉座']})[region]?.[clamp(room,1,stageRoomCount())-1]||''}
function shadowLightAt(x,y){const d=Math.hypot(x-p.x,(y-p.y)*CAMERA.depth),depth=realmDepth();return clamp(1-(d-95)/(330-depth*65),.2,1)}
function shadowBodyColor(e,base,hit){return e.flash>0?hit:base}
function drawWorldScene(t,sx,sy){
 const shadow=game.singleStage&&game.region===6,b=worldBounds();
 drawGround(t);if(bossArenaActive()){drawOpenBossArena(t);drawArenaIdentity(t)}else{drawDarkFloor(t);drawHeavenFloor(t);drawCinematicScenery(t);drawOvergrownRuins(t);drawExpeditionFloor(t);drawRealmDescent(t)}drawEternalScenery(t);drawTerrainGround(t);drawRealmAmbience(t);
 if(!shadow){drawRoomGate(t);drawCombatObjects(t);for(const w of warnings)drawWarning(w,t)}
 const scene=decor.filter(d=>!bossArenaActive()&&visibleWorldCircle(d.x,d.y,140)).map(d=>({y:d.y,draw:()=>aboveView(()=>drawDecor(d,t),d.x,d.y)}));
 for(const o of terrain)if(visibleWorldBox(o.x-(o.r||0)-70,o.y-160,o.x+(o.w||o.r||0)+70,o.y+(o.h||o.r||0)+70)&&['rock','ruin','barrel','crystal','furnace'].includes(o.kind))scene.push({y:o.y+(o.h||0),draw:()=>drawTerrainProp(o,t)});
 if(!shadow)scene.push(...worldActors(t));scene.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
 if(shadow){ctx.save();const d=cv.width/view.w;ctx.setTransform(d,0,0,d,0,0);drawShadowGrade(t,sx,sy);ctx.restore()}
}
function worldActors(t){
 const actors=drops.filter(d=>visibleWorldCircle(d.x,d.y,90)).map(d=>({x:d.x,y:d.y,draw:()=>aboveView(()=>drawDrop(d,t),d.x,d.y)}));
 for(const e of enemies)if(e.hp>0&&visibleWorldBox(e.x-330,e.y-400,e.x+330,e.y+180)&&(!game.bossScene||!game.bossScene.ids.includes(e.id)))actors.push({x:e.x,y:e.y,draw:()=>aboveView(()=>{ctx.save();const w=e.leapTo&&warnings.find(w=>w.owner===e.id&&w.attack==='leap');if(w)ctx.translate(0,-Math.sin(warningProgress(w)*Math.PI)*110);drawEnemy(e,elapsed);ctx.restore()},e.x,e.y)});
 actors.push({x:p.x,y:p.y,draw:()=>aboveView(()=>drawPlayer(t),p.x,p.y)});return actors;
}
// Only scenery is graded. Projectiles, effects, warning shapes and UI never pass
// through desaturation. The small remaining chroma gives stone a cold undertone.
function drawShadowGrade(t,sx=0,sy=0){
 if(!game.singleStage||game.region!==6)return;
 ctx.save();ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.94;ctx.fillStyle='#808080';ctx.fillRect(0,0,view.w,view.h);ctx.restore();
 drawShadowDistance(sx,sy);
 ctx.save();ctx.translate(view.w/2+sx,view.h/2+sy);const zoom=reduced?1:combat.zoom;ctx.scale(view.scale*zoom,view.scale*zoom*CAMERA.depth);ctx.translate(-cam.x,-cam.y);
 drawShadowAttackEchoes(t);drawRoomGate(t);drawCombatObjects(t);for(const w of warnings)drawWarning(w,t);
 const actors=worldActors(t),near=(x,y)=>actors.some(a=>y>a.y&&y-a.y<180&&Math.abs(x-a.x)<110),foreground=[];
 for(const o of terrain)if(['rock','ruin','barrel','crystal','furnace'].includes(o.kind)&&near(o.x,o.y+(o.h||0)))foreground.push({y:o.y+(o.h||0),draw:()=>{ctx.save();ctx.globalAlpha=.45+.55*shadowLightAt(o.x,o.y);drawCachedShadowProp(o,t,false);ctx.restore()}});
 for(const d of decor)if(d.kind!=='grass'&&near(d.x,d.y))foreground.push({y:d.y,draw:()=>{ctx.save();ctx.globalAlpha=.45+.55*shadowLightAt(d.x,d.y);drawCachedShadowProp(d,t,true);ctx.restore()}});
 [...actors,...foreground].sort((a,b)=>a.y-b.y).forEach(a=>a.draw());ctx.restore();
}
function drawShadowDistance(sx=0,sy=0){
 const zoom=reduced?1:combat.zoom,x=view.w/2+sx+(p.x-cam.x)*view.scale*zoom,y=view.h/2+sy+(p.y-cam.y)*view.scale*zoom*CAMERA.depth;
 const clear=125*view.scale,far=Math.max(clear+90,(440-realmDepth()*85)*view.scale),g=ctx.createRadialGradient(x,y,clear,x,y,far);
 g.addColorStop(0,'#080b1100');g.addColorStop(.6,'#080b1180');g.addColorStop(1,'#05070eea');ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h);ctx.restore();
}
function drawRealmDescent(t){
 if(!game.singleStage||game.region<4)return;const d=realmDepth(),room=game.room,y=STAGES[game.stage].y;ctx.save();
 if(game.region===4){
  ctx.fillStyle='rgba(27,8,32,'+(.06+d*.14)+')';ctx.fillRect(65,y-280,630,660);
  for(const side of [-1,1])for(let i=0;i<room;i++){const x=380+side*(235+(i%2)*24),yy=y-180+i*105;prism(x-12,yy,24,24,40+room*11,'#63505a','#312035','#1c1728');path([[x-21,yy-50-room*10],[x,yy-75-room*10],[x+21,yy-50-room*10]],'#3c253b','#8d647b');if(room>=2){const h=20+Math.sin(t*5+i)*5;path([[x-9,yy-62],[x,yy-84-h],[x+10,yy-62]],'#d96a4eaa','#ffc285')}}
  if(room>=3){ctx.strokeStyle='#ae637d66';ctx.lineWidth=2;for(const r of [90,120+room*7]){ctx.beginPath();ctx.ellipse(380,y+40,r,r*.7,t*.04,0,Math.PI*2);ctx.stroke()}}
  if(room===stageRoomCount()){path([[320,y-150],[320,y-245],[340,y-231],[350,y-278],[380,y-249],[410,y-278],[420,y-231],[440,y-245],[440,y-150]],'#221625','#ac8193');rounded(335,y-205,90,72,5,'#472337','#966878');prism(310,y-110,140,24,18,'#77505a','#3b2333','#251929')}
 }else if(game.region===5){
  ctx.fillStyle='rgba(255,233,171,'+(.025+d*.09)+')';ctx.fillRect(65,y-280,630,660);
  for(const side of [-1,1])for(let i=0;i<room;i++){const x=380+side*(220+(i%2)*28),yy=y-190+i*110;prism(x-12,yy,24,28,45+room*13,'#eee7cf','#a6b5bd','#6e8c9e');rounded(x-18,yy-51-room*13,36,8,2,'#ffedba','#c1a364');if(room>=3){ctx.strokeStyle='#fff4c299';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,yy-70-room*13,21,-Math.PI,0);ctx.stroke()}}
  if(room>=2){for(let i=0;i<room+1;i++){ctx.strokeStyle='#fff1c270';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(255-i*6,y-205+i*12);ctx.lineTo(505+i*6,y-205+i*12);ctx.stroke()}}
  if(room>=4){ctx.strokeStyle='#ffeab0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(380,y-185,70+room*7,Math.PI,Math.PI*2);ctx.stroke();for(const side of [-1,1])prism(380+side*100-11,y-160,22,20,110,'#f8efd4','#bbc6c5','#73909e')}
  if(room===stageRoomCount()){for(const r of [42,62,84]){ctx.strokeStyle='#fff1ab';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(380,y-180,r,r*.5,t*.08,0,Math.PI*2);ctx.stroke()}}
 }else{
  for(const side of [-1,1])for(let i=0;i<room+1;i++){const x=380+side*(200+(i%3)*27),yy=y-200+i*90;drawShadowMonument({x,y:yy});if(room>=3){ctx.strokeStyle='#4d505a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-25,yy+20);ctx.lineTo(x+12,yy+28);ctx.lineTo(x-10,yy+45);ctx.stroke()}}
  if(room>=3){ctx.globalAlpha=.25+d*.15;ellipse(380,y-240,36+room*9,36+room*9,'#090a0f');ctx.strokeStyle='#9a9ca8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(380,y-240,40+room*9,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(room===stageRoomCount())path([[302,y-145],[327,y-238],[343,y-214],[380,y-281],[417,y-214],[433,y-238],[458,y-145]],'#18191f','#737581');
 }
 ctx.restore();
}
const PERSONA_COLORS={demon:'#ff9066',god:'#fff0a6',shadow:'#aaa4ff'};
function personaWarning(e,kind,x,y,seconds,extra={}){
 const persona=e.shadowLord?'shadow':e.form==='god'?'god':'demon',w={owner:e.id,kind,x,y,r:0,dir:{x:0,y:1},life:seconds,max:seconds,atk:e.atk,perfectUsed:false,attack:'persona',persona,color:PERSONA_COLORS[persona],sourceX:e.x,sourceY:e.y-85,...extra};
 if(kind==='line'||kind==='fan'){const d=w.dir;w.dir=Math.hypot(d?.x||0,d?.y||0)>.001?norm(d.x,d.y):norm(e.facing?.x||0,e.facing?.y||1)}
 warnings.push(w);e.demonCast=Math.max(e.demonCast||0,seconds);return w;
}
function demonRoyalSignature(e,dt){
 if(e.shadowLord)return false;e.doomClock=(e.doomClock??6)-dt;if(e.doomClock>0)return false;castDemonCataclysm(e);return true;
}
function demonSwordAssault(e,dt){
 if(e.shadowLord)return;e.barrageClock=(e.barrageClock||0)-dt;if(e.barrageClock<=0)castDemonSword(e);
}
function glideJudgingGod(e,dt){
 const center=STAGES[game.stage].y,n=norm(arenaX(380+Math.sin(game.time*.25)*160)-e.x,arenaY(center-80+Math.cos(game.time*.25)*55)-e.y);moveActor(e,n.x*245*dt,n.y*245*dt);
}
function godEdict(e,pattern){
 if(e.bossPhase===2&&godSecondArt(e,pattern))return;
 const y=STAGES[game.stage].y;
 if(pattern===0){for(const [i,x]of [170,310,450,590].entries())personaWarning(e,'circle',i<2?clamp(p.x+(i?115:-65),battleBounds().left+90,battleBounds().right-90):arenaX(x),i<2?p.y+(i?95:-30):arenaY(y-40+(i%2)*150),1.15+i*.18,{r:82,atk:50,move:'holyPillar'});banner('四柱の宣告','光の柱が順番に降りる',1)}
 else if(pattern===1){const center={x:clamp(p.x,battleBounds().left+100,battleBounds().right-100),y:clamp(p.y,battleBounds().top+100,battleBounds().bottom-100)};for(const [i,dir]of [{x:.707,y:.707},{x:-.707,y:.707}].entries())personaWarning(e,'line',center.x-dir.x*370,center.y-dir.y*370,1.65+i*.4,{dir,length:740,width:88,atk:52,move:'heavenScales'});banner('天秤の光剣','交差する光を見切れ',1.2)}
 else if(pattern===2){const refuge=randomRefuge();epicWarning(e,'ring',refuge.x,refuge.y,arenaCoverRadius(refuge),2.8,{inner:105,atk:100,persist:1,style:'doom',persona:'god'});e.godAttack=3.2;startEpicEvent('創世神の審判','唯一の聖域へ','#fff0a6',1.15);banner('創世の審判','光る聖域へ！',2.2)}
 else{const q={x:clamp(p.x,battleBounds().left+100,battleBounds().right-100),y:clamp(p.y,battleBounds().top+100,battleBounds().bottom-100)};for(const side of [-1,1])personaWarning(e,'line',q.x+side*100,q.y-210,1.55,{dir:{x:0,y:1},length:430,width:65,atk:50,move:'constellation'});personaWarning(e,'line',q.x-205,q.y-105,1.95,{dir:{x:1,y:0},length:410,width:65,atk:50,move:'constellation'});banner('星座の檻','幾何学の光のすき間へ',1.2)}
}
function updateShadowSovereign(e,dt){if(e.shadowMirage){e.shadowMirage.life=Math.max(0,e.shadowMirage.life-dt);if(!e.shadowMirage.life)e.shadowMirage=null;}
 if(e.state==='revive'){e.timer-=dt;if(e.timer<=0){e.state='chase';e.cooldown=.5}return true}
 e.shadowTrailClock=(e.shadowTrailClock||0)-dt;if(e.shadowTrailClock<=0){e.shadowTrailClock=.45;e.shadowTrail=[...(e.shadowTrail||[]),{x:p.x,y:p.y}].slice(-4)}
 if(e.awakened){e.cycleTime-=dt;if(e.cycleTime<=0&&bossCommitmentPending(e))return true;if(e.cycleTime<=0){clearHostiles();e.cycle=e.cycle==='assault'?'exposed':'assault';e.cycleTime=e.cycle==='assault'?8:4;e.state=e.cycle==='exposed'?'recover':'chase';e.exposed=e.cycle==='exposed'?4:0;e.shadowBeat=.5;banner(e.cycle==='exposed'?'影がほどけた！':'影葬王、残影を展開',e.cycle==='exposed'?'本体へ反撃！':'過去の足跡から離れよう',1.2)}if(e.cycle==='exposed'){e.exposed=e.cycleTime;return true}}
 if(!e.awakened&&e.state==='recover'){e.timer-=dt;e.exposed=e.timer;if(e.timer>0)return true;e.state='chase'}
 // Discrete shadow passages replace continuous walking. Movement cues cause no damage.
 if(updateShadowTransit(e,dt))return true;
 e.shadowBeat=(e.shadowBeat??1.3)-dt;if(e.shadowBeat<=0&&!e.attackSequence&&!warnings.some(w=>w.owner===e.id&&w.life>.6)){e.shadowBeat=e.awakened?2.05:2.45;shadowSovereignAttack(e)}return true;
}
function shadowSovereignAttack(e){
 const pattern=(e.shadowPattern||0)%(e.awakened?7:4);e.shadowPattern=(e.shadowPattern||0)+1;if(e.awakened&&shadowSecondArt(e,pattern))return;const y=STAGES[game.stage].y;
 if(pattern===0){const marks=(e.shadowTrail?.length?e.shadowTrail:[{x:p.x,y:p.y}]).filter((q,i,a)=>!i||distance(q,a[i-1])>42).slice(-3);for(const [i,q]of marks.entries())personaWarning(e,'circle',q.x,q.y,1.45+i*.32,{r:e.awakened?88:74,atk:e.awakened?46:34,move:'memoryReap'});banner('残影葬','過去の足跡を刈り取る',1)}
 else if(pattern===1){const n=norm(p.x-e.x,p.y-e.y),angle=Math.atan2(n.y,n.x);e.shadowMirage={life:1.85,max:1.85};for(const [i,a]of [-.6,.6].entries())personaWarning(e,'fan',e.x,e.y,1.4+i*.45,{dir:{x:Math.cos(angle+a),y:Math.sin(angle+a)},length:280,spread:.75,atk:44,move:'shadeWaltz'});banner('影刃の輪舞','回る分身と二段の刃を見切れ',1)}
 else if(pattern===2){const q={x:p.x,y:p.y};for(const [i,dir]of [{x:.8,y:.6},{x:-.8,y:.6}].entries())personaWarning(e,'line',q.x-dir.x*235,q.y-dir.y*235,1.45+i*.5,{dir,length:470,width:75,atk:42,move:'shadowScissor'});banner('黒月の鋏','二つの影刃が遅れて交差',1.1)}
 else{const side=p.x>arenaX(380)?1:-1,dir={x:-side,y:0};for(let i=0;i<(e.awakened?3:2);i++)personaWarning(e,'line',arenaX(380+side*290),arenaY(y-100+i*155),1.5+i*.4,{dir,length:1000,width:78,atk:40,move:'graveMarch'});startEpicEvent('影葬王の残像','亡き王たちの葬列','#aaa4ff',.85)}
}
function resolvePersonaStrike(w,owner){if(w.stateOnly){resolveAilmentWave(w,owner);return}empowerBossThreat(w,owner);if(w.rush){startDemonRush(owner,w);return}
 if(warningContains(w)&&!w.perfectUsed&&p.rollTime>0&&p.dodgeAge<.2)perfectDodge(w);
 if(warningContains(w)&&!w.perfectUsed){game.hitSource=w.persona==='god'?'雷撃':w.move==='royalLunge'?'突進':'範囲攻撃';takeHit(w.atk,w.x,w.y)}hitExplosives(q=>warningContains(w,q,16),w.atk);
 if(w.landing){const before={x:owner.x,y:owner.y};Object.assign(owner,safePoint(w.landing.x,w.landing.y,owner.r));if(effects.length<effectBudget()-2)effects.push({kind:'sovereignImpact',persona:w.persona,move:'departure',x:before.x,y:before.y,shape:'circle',r:60,color:w.color,life:.45,max:.45})}
 bossAttackSpectacle(w,owner);if(w.dominion){effects.push({kind:'cataclysm',x:w.x,y:w.y,inner:w.inner,bounds:{...battleBounds()},life:1.65,max:1.65});combatSound('demon-cataclysm',owner.x);if(!reduced&&preferences.shake)shake=Math.max(shake,11);owner.state=owner.awakened?'chase':'recover';owner.timer=1.2;owner.exposed=owner.awakened?0:1.2;}else combatSound(w.persona==='demon'?'demon-blade':w.persona==='god'?'god-verdict':'shadow-rift',owner.x);
 if(w.persist&&hazards.length<9)hazards.push({...w,life:w.persist,tick:.7,atk:Math.round(w.atk*.45),protected:!!w.perfectUsed});
 if(!owner.awakened&&owner.form!=='god'&&!warnings.some(other=>other!==w&&other.owner===owner.id&&other.life>0)){owner.state='recover';owner.timer=.85;owner.exposed=.85}
}
function emitSovereignImpact(w,owner){
 if(effects.filter(f=>f.kind==='sovereignImpact').length>=(reduced?3:renderLoad.slow?6:10))return;
 const persona=w.persona|| (owner.shadowLord?'shadow':owner.form==='god'?'god':'demon');effects.push({...w,kind:'sovereignImpact',shape:w.kind,persona,color:PERSONA_COLORS[persona],life:reduced?.3:.85,max:reduced?.3:.85});
 particle(w.x,w.y,PERSONA_COLORS[persona],reduced?3:10,180);if(!reduced&&preferences.shake)shake=Math.max(shake,persona==='demon'?4:2);
}
function drawSovereignImpact(e,a){
 const q=1-a;ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.lineCap='round';
 if(e.persona==='god'){
  if(e.move==='pursuingThunder'){for(const [width,color]of [[17,'#d79c36aa'],[7,'#ffe988'],[2,'#ffffff']]){ctx.strokeStyle=color;ctx.lineWidth=width*a;ctx.beginPath();ctx.moveTo(0,-380);for(let i=1;i<9;i++)ctx.lineTo(i===8?0:(i%2?24:-18),-380+i*47.5);ctx.stroke()}ctx.strokeStyle='#fff0aa';ctx.lineWidth=3*a;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(0,-280+i*65);ctx.lineTo((i%2?1:-1)*(65+q*35),-240+i*65);ctx.stroke()}ellipse(0,0,65*q,22*q,'#ffe68b66');}
  if(e.shape==='ring'){const inner=e.inner||105,r=inner+110+q*55;for(let i=0;i<(reduced?4:8);i++){const angle=i*Math.PI/4,x=Math.cos(angle)*r,y=Math.sin(angle)*r;path([[x-8,y],[x-4,y-110*a],[x,y-180*a],[x+6,y-100*a],[x+9,y]],'#fff2babb','#edc974')}ctx.strokeStyle='#ffeeb5';ctx.lineWidth=5*a+1;ctx.beginPath();ctx.arc(0,0,inner+65+q*100,0,Math.PI*2);ctx.stroke()}
  else if(e.shape==='line'){ctx.rotate(Math.atan2(e.dir.y,e.dir.x));for(const side of [-1,1]){ctx.strokeStyle=side<0?'#ffd574':'#fff8dd';ctx.lineWidth=side<0?14*a:3;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(e.length+30,0);ctx.stroke()}for(let i=0;i<(reduced?3:7);i++){const x=i*e.length/6;path([[x,-13*a],[x+8,0],[x,13*a],[x-8,0]],'#fff4be')}}
  else{const r=e.r||90;ctx.fillStyle='#fff0b422';ctx.fillRect(-r*.35,-240*a,r*.7,240*a);for(let i=0;i<3;i++){ctx.strokeStyle=i%2?'#fff9db':'#eac575';ctx.lineWidth=2+i;ctx.beginPath();ctx.ellipse(0,-i*45*a,r*(.6+q*.4),r*.35,0,0,Math.PI*2);ctx.stroke()}path([[0,-270*a],[16,-70*a],[7,0],[-7,0],[-16,-70*a]],'#fff5c8','#e4c16e')}
 }else if(e.persona==='demon'){
  if(e.shape==='line'){ctx.rotate(Math.atan2(e.dir?.y??1,e.dir?.x??0));const length=e.length||420;for(let i=0;i<(reduced?3:8);i++){const x=i*length/7,h=Math.sin(q*Math.PI)*(55+i%3*25);path([[x-14,18],[x-7,-h*.5],[x,-h],[x+15,18]],i%2?'#ffbc67dd':'#da4f57dd','#ffdc9c')}ctx.strokeStyle='#fff2ca';ctx.lineWidth=7*a;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(length,0);ctx.stroke()}
  else{ctx.rotate(Math.atan2(e.dir?.y??0,e.dir?.x??1));drawTaperedCut(0,0,(e.length||190)*(1+q*.4),.8+q*.6,e.color,9*a+1)}
 }else{
  const r=e.r||95;if(e.shape==='line'){ctx.rotate(Math.atan2(e.dir?.y??0,e.dir?.x??1));const length=e.length||400;for(let i=0;i<(reduced?2:5);i++){ctx.save();ctx.translate(i*length/4,0);drawShadowReaper(q,i);ctx.restore()}ctx.strokeStyle='#d0c9ff';ctx.lineWidth=3*a;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(length*.2,-35*a,length*.7,35*a,length,0);ctx.stroke()}
  else{drawShadowReaper(q,0);for(const side of [-1,1]){ctx.save();ctx.rotate(side*.55);drawTaperedCut(0,-15,r*(.7+q),side,e.color,5*a+1);ctx.restore()}}
 }
 ctx.restore();
}
function drawShadowReaper(q,i){
 ctx.save();ctx.globalAlpha*=1-q;ctx.translate(0,-Math.sin(q*Math.PI)*24);path([[-25,0],[-18,-50],[0,-79],[18,-50],[25,0],[0,-12]],'#161423','#aea4eb');ellipse(0,-60,9,11,'#363144');ctx.strokeStyle='#d4cbff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,3);ctx.lineTo(31,-87);ctx.quadraticCurveTo(75,-97,60,-49);ctx.stroke();ctx.restore();
}
// Tapered ribbons and several offset trajectories read as a swept blade, not a ray.
function drawTaperedCut(x,y,r,bend,color,width){
 ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(-r*.65,-r*.3*bend);ctx.bezierCurveTo(-r*.14,r*.46*bend,r*.56,r*.25*bend,r, -r*.18*bend);ctx.bezierCurveTo(r*.35,r*.32*bend,-r*.13,r*.3*bend,-r*.65,-r*.3*bend);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff4df';ctx.lineWidth=Math.max(.6,width*.22);ctx.stroke();ctx.restore();
}
function drawSwordSweep(e,a){
 ctx.save();ctx.translate(e.x,e.y-18);ctx.rotate(e.angle);const r=(e.heavy?176:game.singleStage&&getWeapon().id==='greatsword'?125:100)*p.reach,q=1-a,count=reduced?2:renderLoad.slow?4:6;
 ctx.globalCompositeOperation='lighter';for(let i=0;i<count;i++){const rr=r+i*4,lo=-1.16+q*.75+i*.04,hi=1.06+q*.75-i*.06;ctx.strokeStyle=i===0?'#efffff':e.color||'#bdefff';ctx.globalAlpha=a*(i===0?.95:.5-i*.06);ctx.lineWidth=i===0?(e.heavy?9:4)*a+1:1.2;ctx.beginPath();ctx.arc(0,0,rr,lo,hi);ctx.stroke()}
 ctx.globalAlpha=a*.75;ctx.rotate(.35+q*.25);drawTaperedCut(r*.55,0,r*.6,1,e.color||'#bdefff',4*a);ctx.restore();
}
function drawShadeRegentBody(e,t){
 const large=e.awakened,q=shadowAttackProgress(e)??0,lift=reduced?0:Math.sin(t*1.6)*5,edge=large?'#b5a6ef':'#89839f';ctx.save();ctx.translate(0,-9+lift);if(large)ctx.scale(1.35,1.35);
 // Empty royal robes and suspended blades contrast with the demon's muscular body.
 for(const side of [-1,1]){path([[side*18,-105],[side*58,-83],[side*(72+Math.sin(t+side)*4),26],[side*37,9],[side*22,29],[side*6,-18]],'#181726',edge);path([[side*24,-91],[side*46,-63],[side*39,-11],[side*54,5]],'#302b41','#655774')}
 path([[-27,-112],[-32,-27],[-20,15],[0,-8],[20,15],[32,-27],[27,-112],[0,-125]],'#272137',edge);
 for(const side of [-1,1]){ctx.strokeStyle='#5e506f';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(side*27,-93);ctx.lineTo(side*51,-65-q*15);ctx.lineTo(side*63,-90+q*20);ctx.stroke();path([[side*56,-87+q*20],[side*66,-99+q*20],[side*69,-77+q*20]],'#c3b8ca')}
 ellipse(0,-132,19,26,'#10121d');path([[-15,-145],[-20,-171],[-8,-162],[0,-188],[8,-162],[20,-171],[15,-145]],'#2b253d',edge);path([[-13,-141],[0,-149],[13,-141],[8,-119],[0,-112],[-8,-119]],'#595064',edge);
 ctx.strokeStyle=large?'#c3b0ff':'#9c8bbd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-135);ctx.lineTo(-3,-133);ctx.moveTo(3,-133);ctx.lineTo(10,-135);ctx.stroke();
 if(large){for(const side of [-1,1])for(let i=0;i<3;i++){ctx.save();ctx.translate(side*(70+i*18),-122+i*34);ctx.rotate(side*(.5+q*.6+i*.14));path([[-4,22],[-7,-40],[0,-67],[9,-39],[4,22]],'#191827',edge);rounded(-12,16,24,4,1,'#8e799f');ctx.restore()}}
 else{ctx.save();ctx.translate(66,-69);ctx.rotate(-.18+Math.max(0,q-.5)*.8);ctx.strokeStyle='#8e7a9c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,61);ctx.lineTo(0,-83);ctx.stroke();path([[-2,-83],[19,-106],[61,-102],[78,-70],[45,-85],[11,-66]],'#201c30','#a99ac9');ctx.restore()}
 const core=e.cycle==='exposed'?'#c4fff0':'#9d85cc';path([[0,-104],[10,-84],[0,-66],[-10,-84]],core,'#dcd2eb');ctx.restore();
}
function drawPersonaAnticipation(t){drawShadowTransitCues(t);
 for(const w of warnings){if(w.attack!=='persona'||!showAttackWarning(w))continue;const q=warningProgress(w);ctx.save();
  if(w.persona==='shadow'){ctx.translate(w.kind==='line'?w.x+w.dir.x*Math.min(w.length*.3,150):w.x,w.kind==='line'?w.y+w.dir.y*Math.min(w.length*.3,150):w.y);ctx.globalAlpha=.2+q*.45;drawShadowReaper(reduced?.3:1-Math.min(1,q*1.8),0)}
  else if(w.persona==='god'){ctx.strokeStyle='#fff1ba';ctx.lineWidth=1.5;ctx.globalAlpha=.35+q*.4;const x=w.kind==='line'?w.x+w.dir.x*w.length*.5:w.x,y=w.kind==='line'?w.y+w.dir.y*w.length*.5:w.y;ctx.translate(x,y-120);ctx.rotate(reduced?0:t*.2);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);path([[-8,-24],[0,-45],[8,-24],[0,-12]],'#ddbd6d88','#fff0af')}}
  else{ctx.strokeStyle='#ffbe7e';ctx.lineWidth=2;ctx.globalAlpha=.3+q*.4;const x=w.x+(w.dir?.x||0)*Math.min(w.length||0,120),y=w.y+(w.dir?.y||0)*Math.min(w.length||0,120);ctx.beginPath();ctx.ellipse(x,y-38,20+q*15,8+q*5,0,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
 }
}

// Rasterize only foreground scenery once per object/state. Repeated canvas filters
// on many props caused GPU stalls despite modest JavaScript frame costs.
const shadowPropCache=new WeakMap();
function propBehindPlayer(o){const h=o.kind==='rock'?44:o.kind==='crystal'?76:36;return p.y<o.y+(o.h||o.r||0)&&p.y>o.y-h/CAMERA.depth-60&&Math.abs(p.x-(o.x+(o.w||0)/2))<(o.w||o.r*2||40)/2+25}
function shadowPropSprite(o,t,isDecor){
 const key=[game.region,o.kind,o.seed,o.size,!!o.broken,o.content,!!(!isDecor&&propBehindPlayer(o))].join(':'),old=shadowPropCache.get(o);if(old?.key===key)return old;
 const width=220,height=280,padX=100,padY=220,sprite=document.createElement('canvas');sprite.width=width;sprite.height=height;const target=sprite.getContext('2d'),worldContext=ctx;
 target.translate(padX-o.x,padY-o.y);
 try{ctx=target;if(isDecor)aboveView(()=>drawDecor(o,t),o.x,o.y);else drawTerrainProp(o,t)}finally{ctx=worldContext}
 const pixels=target.getImageData(0,0,width,height),data=pixels.data;for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const gray=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;for(let c=0;c<3;c++)data[i+c]=Math.round(gray+(data[i+c]-gray)*.06)}target.putImageData(pixels,0,0);
 const cached={key,sprite,width,height,padX,padY};shadowPropCache.set(o,cached);return cached;
}
function drawCachedShadowProp(o,t,isDecor){const s=shadowPropSprite(o,t,isDecor);ctx.drawImage(s.sprite,o.x-s.padX,o.y-s.padY,s.width,s.height)}
