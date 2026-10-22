// Anticipation belongs to the actor, never to the disposable particle pool.
const SIGNATURE_CHARGES={laststand:.28,bloodpact:.3,nova:.55,dawn:.62,meteor:.48,quake:.42,execute:.36,whirl:.16,pierce:.12,flurry:.12,dash:.12,cross:.16,wave:.18,blood:.18,flame:.2,frost:.2,thunder:.3,chain:.18,tornado:.28,rain:.3,blink:.14};
function beginSkillCharge(s,free){
 if(s.id==='bloodpact'&&p.hp<=bloodPactCost()){banner('HPが足りない','血契斬はHPを残して使う技です',1);return true}const duration=SIGNATURE_CHARGES[s.id];if(!duration)return false;
 const target=nearest(skillReach(s.range||s.r||500));if(target)p.face=norm(target.x-p.x,target.y-p.y);
 if(!free)p.mp-=s.mp;p.skillCharge={id:s.id,remaining:duration,duration,face:{...p.face},paid:free?0:s.mp,free};p.castLock=duration+.01;inputBuffer=null;
 combatSound(s.id==='nova'?'charge-dark':s.id==='dawn'?'charge-light':'charge-element');updateUI();return true;
}
function cancelSkillCharge(penalize=false){
 const q=p?.skillCharge;if(!q)return;p.mp=Math.min(p.maxMp,p.mp+q.paid);p.skillCharge=null;p.castLock=0;inputBuffer=null;
 if(penalize)p.skillCooldowns[q.id]=Math.max(p.skillCooldowns[q.id]||0,.45);
}
function updateSkillCharge(dt){
 if(!p.skillCharge)return;const q=p.skillCharge;q.remaining-=dt;p.face={...q.face};
 if(q.remaining>0)return;p.skillCharge=null;
 releaseManualSkill(getSkill(q.id),q.free);
}
function releaseManualSkill(s,free=false){
 p.castLock=skillRecovery(s);const boost=(free?(p.counter>0?consumeCounter():2):consumeCounter())*consumeStyleSkill(s),killsBefore=game.kills;
 if(s.id==='bloodpact'){const cost=bloodPactCost();if(p.hp<=cost){p.mp=Math.min(p.maxMp,p.mp+s.mp);p.castLock=0;return}p.hp-=cost;p.hurtHud=1;floating(p.x,p.y-105,'血契 −'+cost,'#f3a6ad');effects.push({kind:'ailmentPulse',ailment:'weaken',x:p.x,y:p.y,r:55,life:.4,max:.4})}game.skillUses++;p.skillCooldowns[s.id]=skillCooldown(s);p.skillPose={id:s.id,life:.48,max:.48};castSkill(s,boost);
 const multi=game.kills-killsBefore;game.stageMulti=Math.max(game.stageMulti,multi);if(multi>=3)floating(p.x,p.y-145,multi+' K.O.!','#fff0a8',true);
 tone(s.category==='element'?800:220,.2,s.category==='element'?'sine':'triangle',.04);updateUI();flushLevelChoices();
}
function signatureRelease(id,x=p.x,y=p.y,extra={}){
 effects.push({kind:'signatureRelease',id,x,y,face:{...p.face},color:getSkill(id)?.color||'#e3deaf',life:id==='dawn'?.82:.65,max:id==='dawn'?.82:.65,...extra});
 if(!reduced&&preferences.shake)shake=Math.max(shake,id==='nova'?7:5);
}
function chargePose(){const q=p.skillCharge;return q?{id:q.id,q:1-q.remaining/q.duration}:null}
function drawSkillAnticipation(t){
 const q=chargePose();if(!q)return;const {id}=q,progress=q.q,x=p.x,y=p.y-22,color=id==='nova'?'#9f55e5':id==='dawn'?'#ffdc85':id==='meteor'?'#ff9b58':id==='quake'?'#d5b87d':'#f0a0c4';
 ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=2;
 // A quiet ring contracts as the energy gathers. Its center stays transparent.
 ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(0,22,60-progress*18,34-progress*10,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
 if(id==='nova'){
  for(let i=0;i<12;i++){const a=i*Math.PI/6+t*1.8,r=34+Math.sin(t*13+i)*7,h=35+progress*60;ctx.fillStyle=i%2?'#0c071de6':'#331147c9';ctx.strokeStyle='#9957d4aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,20+Math.sin(a)*r*.45);ctx.bezierCurveTo(Math.cos(a+.8)*(r+25),-h*.35,Math.cos(a-.5)*r,-h,Math.cos(a+.2)*(r*.35),-h-30);ctx.quadraticCurveTo(Math.cos(a)*r*.4,-h*.25,Math.cos(a)*r,20+Math.sin(a)*r*.45);ctx.fill();ctx.stroke()}
  ctx.save();ctx.rotate(Math.atan2(p.face.y,p.face.x));drawTaperedCut(28,-5,55+progress*35,.45,'#bb6dff',5);ctx.restore();
 }else if(id==='dawn'){
  const g=ctx.createRadialGradient(0,-36,1,0,-36,85);g.addColorStop(0,'#fff8c8aa');g.addColorStop(.5,'#ffd56a22');g.addColorStop(1,'#ffc45b00');ctx.fillStyle=g;ctx.fillRect(-85,-125,170,170);
  for(let j=0;j<3;j++){ctx.strokeStyle=j===0?'#fff4bf':'#d6a650';ctx.lineWidth=j===0?3:1;ctx.beginPath();ctx.ellipse(0,5,44+j*13,24+j*8,t*(j%2?-.8:.6),-Math.PI+progress,Math.PI+progress);ctx.stroke()}
  for(let i=0;i<16;i++){const a=i*2.399+t*.7,r=100*(1-progress)+12+(i%3)*9;ellipse(Math.cos(a)*r,-30+Math.sin(a)*r*.7,2+(i%2),3,'#ffeab4')}
  path([[-5,-40],[-8,-87-progress*30],[0,-110-progress*30],[8,-87-progress*30],[5,-40]],'#fff1b4','#be8b42');
 }else if(id==='meteor'){
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9+t,rr=60-progress*24;ctx.strokeStyle=i%2?'#ffc36a':'#b94e38';ctx.beginPath();ctx.arc(0,-40,rr,a,a+.35+progress*.3);ctx.stroke();ellipse(Math.cos(a)*rr,-40+Math.sin(a)*rr,3,5,'#ffbf6d')}
 }else if(id==='quake'){
  for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=33+i%3*9;ctx.save();ctx.translate(Math.cos(a)*rr,20+Math.sin(a)*rr*.5-progress*(10+i%3*7));ctx.rotate(a+t*.3);path([[-8,0],[-3,-8],[7,-6],[9,3],[0,7]],'#8a7568','#e4cf9a');ctx.restore()}
 }else if(id!=='execute'){drawArtGather(id,progress,t)}else{
  ctx.strokeStyle='#bf638e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-30-progress*10,-80);ctx.lineTo(30+progress*10,20);ctx.moveTo(30+progress*10,-80);ctx.lineTo(-30-progress*10,20);ctx.stroke();ctx.fillStyle='#ffe1ef';ellipse(0,-30,3,20+progress*25,'#ffe1ef');
 }
 ctx.save();ctx.translate(0,-140);ctx.scale(1,1/CAMERA.depth);ctx.font='800 13px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#0b1224';const title=skillDisplayName(getSkill(id))+' · 溜め';ctx.strokeText(title,0,0);ctx.fillStyle=color;ctx.fillText(title,0,0);ctx.restore();
 ctx.restore();
}
function drawSignatureRelease(e,a){
 const q=1-a;ctx.save();ctx.translate(e.x,e.y);ctx.lineCap='round';
 if(e.id==='nova'){
  ctx.rotate(Math.atan2(e.face.y,e.face.x));const length=e.length||320,reach=Math.min(1,q*5)*length;
  const g=ctx.createLinearGradient(0,0,length,0);g.addColorStop(0,'#10081ddd');g.addColorStop(.55,'#431863dd');g.addColorStop(1,'#230e4100');
  path([[0,-18],[reach*.55,-84*a],[reach+45,0],[reach*.55,84*a],[0,18]],g,'#bf7ae2aa');
  for(let i=0;i<8;i++){ctx.globalAlpha=a*(1-i*.075);drawTaperedCut(reach*.5,-35+i*10,reach*.55,.3,'#b071eb',i===3?12:2)}
  ctx.globalAlpha=a;ctx.strokeStyle='#e8b4ff';ctx.lineWidth=2;for(let i=1;i<8;i++){const xx=length*i/8;ctx.beginPath();ctx.moveTo(xx,0);ctx.lineTo(xx-18,23+(i%3)*14);ctx.lineTo(xx+10,49+(i%2)*20);ctx.moveTo(xx,0);ctx.lineTo(xx+8,-31-(i%2)*18);ctx.stroke()}
 }else if(e.id==='dawn'){
  const radius=e.r||350,turn=Math.min(1,q*2.7)*Math.PI*2,angle=Math.atan2(e.face.y,e.face.x)+turn;ctx.globalCompositeOperation='lighter';
  for(let j=0;j<7;j++){ctx.strokeStyle=j===0?'#fff9dc':j<3?'#ffdf8dcc':'#c9873a66';ctx.lineWidth=j===0?4:j===1?19:2;ctx.beginPath();ctx.arc(0,-18,radius*(.94-j*.014),angle-Math.min(turn,1.55)+j*.04,angle);ctx.stroke()}
  ctx.save();ctx.translate(0,-18);ctx.rotate(angle);path([[20,-9],[radius-40,-22],[radius+20,0],[radius-40,14],[20,8]],'#fff3bf','#ffe2a0');ctx.restore();
  ctx.globalAlpha=a*.55;ctx.strokeStyle='#ffe0a1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,radius*(.35+q*.8),0,Math.PI*2);ctx.stroke();for(let i=0;i<24;i++){const b=i*Math.PI/12+q*.3,rr=radius*(.25+q*.8);ellipse(Math.cos(b)*rr,Math.sin(b)*rr-18,2,5,'#fff0b0')}
 }else if(e.id==='meteor'){
  ctx.translate(0,-50);for(let i=0;i<10;i++){const b=i*Math.PI/5,rr=20+q*100;ctx.strokeStyle='#ffca75';ctx.lineWidth=3*a;ctx.beginPath();ctx.moveTo(Math.cos(b)*rr*.4,Math.sin(b)*rr*.4);ctx.lineTo(Math.cos(b)*rr,Math.sin(b)*rr);ctx.stroke()}
 }else if(e.id==='quake'){
  ctx.strokeStyle='#e5cb9a';for(let i=0;i<12;i++){const b=i*Math.PI/6,r=45+q*220;ctx.lineWidth=3*a;ctx.beginPath();ctx.moveTo(Math.cos(b)*20,Math.sin(b)*20);for(let j=1;j<5;j++)ctx.lineTo(Math.cos(b)*r*j/4+(j%2?12:-12),Math.sin(b)*r*j/4);ctx.stroke();ctx.save();ctx.translate(Math.cos(b)*r,Math.sin(b)*r-Math.sin(q*Math.PI)*(20+i%3*12));ctx.rotate(b+q);path([[-12,0],[-7,-18],[13,-14],[18,8]],'#756778','#dbccae');ctx.restore()}
 }else{
  ctx.rotate(Math.atan2(e.face.y,e.face.x));for(const side of [-1,1]){ctx.strokeStyle=side===1?'#ffe5ef':'#d56a9c';ctx.lineWidth=4+6*a;ctx.beginPath();ctx.moveTo(-35,side*(80+q*30));ctx.lineTo(130,-side*(80+q*30));ctx.stroke()}
 }
 ctx.restore();
}
function drawUltimateVariant(e){
 const a=e.life/e.max,q=1-a;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 if(e.art==='raika'){
  ctx.translate(e.ex,e.ey-25);for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4+q*.8);ctx.strokeStyle=i%2?'#cfacff':'#b9efff';ctx.lineWidth=3+5*a;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(30,-90,170,-95,210*(.3+q),0);ctx.bezierCurveTo(120,45,35,30,0,0);ctx.stroke();ctx.restore()}ellipse(0,0,14*a,14*a,'#fffae4');
 }else{
  const n=norm(e.ex-e.x,e.ey-e.y),length=e.travel,angle=Math.atan2(n.y,n.x);ctx.translate(e.x,e.y-30);ctx.rotate(angle);
  for(const [width,color]of [[55*a,'#7949dbaa'],[27*a,'#ffd880'],[5+5*a,'#fffaee']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(-25,0);for(let i=1;i<=12;i++)ctx.lineTo(length*i/12,(i%2?1:-1)*9*a);ctx.stroke()}
  path([[0,-18],[length-90,-7],[length+45,0],[length-90,7],[0,18]],'#fff4d9');
 }
 ctx.restore();
}
// Fast repositioning is harmless on its own: strong damage keeps its full tell.
function bossBattleMotion(e,dt){
 if(e.state!=='chase'||warnings.some(w=>w.owner===e.id)||e.exposed>0)return;
 e.strideClock=(e.strideClock??.5)-dt;
 if(e.strideClock<=0){const n=norm(p.x-e.x,p.y-e.y),side=(e.pattern||0)%2?1:-1;e.strideDir=e.form==='demon'?norm(380-e.x,STAGES[game.stage].y+40-e.y):norm(n.x*.35-n.y*side,n.y*.35+n.x*side);e.strideTime=.32;e.strideClock=e.form==='dragon'?1.6:1.25;e.strideEcho=0}
 if(!(e.strideTime>0))return;e.strideTime-=dt;const n=e.strideDir;moveActor(e,n.x*(e.form==='sentinel'?180:e.form==='monster'?260:e.bossPhase===2?455:330)*dt,n.y*(e.form==='sentinel'?180:e.form==='monster'?260:e.bossPhase===2?455:330)*dt);e.strideEcho-=dt;
 if(e.strideEcho<=0){e.strideEcho=.09;effects.push({kind:'bossStride',x:e.x,y:e.y,color:({beast:'#90db9d',monster:'#89dcf3',dragon:'#ffb26d',sentinel:'#baaaff',demon:'#bd81e9'})[e.form]||'#d9e6dd',r:e.r,life:.28,max:.28})}
}
function drawBossStride(e,a){ctx.save();ctx.globalAlpha=a*.65;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,e.r*(1.7-a*.6),e.r*.5,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(e.x-e.r+i*e.r*.5,e.y);ctx.lineTo(e.x-e.r+i*e.r*.5,e.y-55*a);ctx.stroke()}ctx.restore()}
