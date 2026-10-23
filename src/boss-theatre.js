// Cosmetic choreography only. No combat RNG, hitboxes, timers or save data are changed.
const BOSS_THEMES={
 beast:{color:'#bcf5a2',core:'#f6ffe3',shade:'#244b38',sound:'beast-roar'},
 monster:{color:'#83e9ff',core:'#efffff',shade:'#164d69',sound:'tide-crash'},
 dragon:{color:'#ff9b54',core:'#fff0ab',shade:'#6c263b',sound:'dragon-breath'},
 sentinel:{color:'#bfb1ff',core:'#faf3ff',shade:'#43375e',sound:'stone-break'},
 demon:{color:'#de86ef',core:'#ffdbac',shade:'#28102f',sound:'demon-cataclysm'},
 god:{color:'#ffe29b',core:'#fffde7',shade:'#776546',sound:'god-verdict'},
 shadow:{color:'#bca5ff',core:'#f1e8ff',shade:'#151025',sound:'shadow-rift'},
 ancient:{color:'#e9bd85',core:'#fff1ca',shade:'#4b3834',sound:'stone-break'},
 mine:{color:'#9ee8d4',core:'#f3ffe2',shade:'#243e46',sound:'stone-break'}
};
function bossThemeKey(e){return e.mineBoss?'mine':e.shadowLord?'shadow':e.ancientWarden?'ancient':BOSS_THEMES[e.form]?e.form:'sentinel'}
function bossTheme(e){return BOSS_THEMES[bossThemeKey(e)]}
function theatreEase(x){const q=clamp(x,0,1);return 1-(1-q)**3}
function theatrePhase(q){return {gather:theatreEase(q/.48),release:theatreEase((q-.52)/.16),fade:1-theatreEase((q-.82)/.18)}}
function bossScenePose(s,e,q){
 if(reduced||preferences.shortCinematics)return {y:0,x:1,yScale:1,angle:0,alpha:1};
 const key=bossThemeKey(e),{gather,release}=theatrePhase(q),settle=Math.sin(Math.PI*release)*(1-theatreEase((q-.75)/.2));
 if(s.kind==='defeat')return {y:-Math.max(0,q-.5)*95,x:1+q*.12,yScale:1+q*.12,angle:Math.sin(q*65)*.012*(1-q),alpha:1};
 if(s.kind==='transform'||s.kind==='enrage')return {y:-settle*32,x:1+gather*(1-release)*.1+settle*.07,yScale:1-gather*(1-release)*.15+settle*.11,angle:(1-release)*Math.sin(q*35)*.012,alpha:1};
 if(key==='monster')return {y:(1-theatreEase((q-.12)/.42))*90,x:1+(1-release)*.18,yScale:.45+theatreEase(q/.5)*.55,angle:Math.sin(q*13)*.035*(1-release),alpha:theatreEase(q/.24)};
 if(key==='god')return {y:-140*(1-theatreEase(q/.54))-Math.sin(q*Math.PI)*14,x:1,yScale:1,angle:0,alpha:theatreEase(q/.3)};
 if(key==='shadow')return {y:-20*Math.sin(q*Math.PI),x:.75+theatreEase(q/.6)*.25,yScale:1.15-theatreEase(q/.6)*.15,angle:0,alpha:theatreEase(q/.4)};
 return {y:-(key==='dragon'?230:120)*(1-theatreEase((q-.1)/.42))-settle*8,x:1+settle*.06,yScale:1-settle*.07,angle:(key==='dragon'?-.14:-.055)*(1-release),alpha:theatreEase(q/.2)};
}
function drawTheatreFlame(x,y,height,width,color,core,bend=0){
 ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.strokeStyle=core;ctx.lineWidth=1.2;
 ctx.beginPath();ctx.moveTo(-width,0);ctx.bezierCurveTo(-width*1.5,-height*.25,-width*.25+bend,-height*.5,bend,-height);ctx.bezierCurveTo(width+bend,-height*.7,width*.3,-height*.48,width,-height*.25);ctx.bezierCurveTo(width*1.5,-height*.08,width*.7,3,-width,0);ctx.fill();ctx.stroke();
 ctx.fillStyle=core;ctx.beginPath();ctx.moveTo(-width*.35,0);ctx.bezierCurveTo(-width*.6,-height*.2,bend*.5,-height*.32,bend*.4,-height*.7);ctx.bezierCurveTo(width*.6,-height*.37,width*.75,-height*.14,width*.3,0);ctx.fill();ctx.restore();
}
function drawTheatreCrystal(x,y,height,width,color,core,turn=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(turn);path([[0,0],[-width,-height*.35],[-width*.65,-height*.77],[0,-height],[width,-height*.65],[width*.7,-height*.2]],color,core);path([[0,0],[0,-height],[width,-height*.65]],core);ctx.restore();
}
function drawBossSceneBackdrop(s,e,q){
 const key=bossThemeKey(e),theme=bossTheme(e),{gather,release,fade}=theatrePhase(q),power=s.kind==='transform'?1.25:1;
 ctx.save();ctx.globalAlpha=fade*(reduced?.4:.75);ctx.lineCap='round';
 if(reduced||preferences.shortCinematics){ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,100,35,0,0,Math.PI*2);ctx.stroke();ctx.restore();return}
 const radius=(85+gather*70+release*65)*power;
 // Counter-rotating broken seals gather, pause, and split apart at the reveal.
 for(let j=0;j<3;j++){ctx.strokeStyle=j===1?theme.core:theme.color;ctx.lineWidth=j===0?3:1.4;ctx.beginPath();ctx.ellipse(0,4,radius+j*22,(radius+j*22)*.34,0,-q*(j%2?2:-2),Math.PI*1.65-q*(j%2?2:-2));ctx.stroke()}
 for(let i=0;i<12;i++){const a=i*Math.PI/6+q*.45,r=radius+30,x=Math.cos(a)*r,y=Math.sin(a)*r*.34;ctx.strokeStyle=theme.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x*1.08,y*1.08-12);ctx.lineTo(x*1.03,y*1.03-22);ctx.stroke()}
 if(key==='demon'||key==='shadow'){
  // A vertical tear opens behind the actor; its ribbons peel outwards.
  const open=Math.sin(Math.PI*clamp(q/.92,0,1)),w=(30+gather*95)*open,h=240*open;
  path([[0,-h-50],[-w*.7,-h*.8],[-w,-75],[0,10],[w,-75],[w*.7,-h*.8]],theme.shade,theme.color);
  for(const side of [-1,1])for(let i=0;i<4;i++){const spread=(35+i*24)*(gather+release*.7),yy=-45-i*35;
   ctx.strokeStyle=i%2?theme.core:theme.color;ctx.lineWidth=i===0?4:1.7;ctx.beginPath();ctx.moveTo(side*12,yy);ctx.bezierCurveTo(side*spread*.4,yy-75,side*spread*1.6,yy-75-release*35,side*spread,yy-110);ctx.stroke();
   if(key==='demon')drawTheatreFlame(side*(90+i*20),10,50+gather*(i%2?60:90),14,theme.shade,theme.color,side*15);
  }
 }else if(key==='god'){
  const ornate=e.bossPhase===2||s.kind==='transform',r=(ornate?105:80)+gather*18,spin=q*(ornate?.55:.15);
  ctx.save();ctx.translate(0,-112);ctx.strokeStyle=theme.core;ctx.lineWidth=ornate?3:2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<(ornate?12:6);i++){const a=i*Math.PI*2/(ornate?12:6)+spin;ctx.save();ctx.rotate(a);path([[r-5,0],[r+20+release*60,-5],[r+36+release*70,0],[r+20+release*60,5]],theme.color);ctx.restore()}
  if(ornate)for(const side of [-1,1])for(let i=0;i<6;i++){const xx=side*(50+i*25)*(gather*.7+.3),yy=-15+i*20;ctx.strokeStyle=i%2?theme.color:theme.core;ctx.lineWidth=5-i*.5;ctx.beginPath();ctx.moveTo(side*35,20);ctx.bezierCurveTo(xx,yy-60,xx+side*90,yy-85,xx+side*(65+release*70),yy-150+release*30);ctx.stroke()}
  ctx.restore();
 }else if(key==='monster'){
  for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(60+i*28),h=(35+i%3*28)*gather;ctx.strokeStyle=i%2?theme.color:theme.core;ctx.lineWidth=5-i*.5;ctx.beginPath();ctx.moveTo(x,8);ctx.bezierCurveTo(x-side*15,-h*.5,x+side*20,-h*1.4,x+side*45,-h*.9);ctx.stroke();ellipse(x+side*45,-h*.9,3,6,theme.core)}
 }else if(key==='dragon'){
  for(const side of [-1,1])for(let i=0;i<6;i++)drawTheatreFlame(side*(62+i*24),15,(45+i%3*35)*gather,13,theme.shade,theme.color,side*(10+release*30));
  ctx.strokeStyle=theme.core;ctx.lineWidth=3;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*30,-90);ctx.lineTo(side*(150+gather*70),-230+release*75);ctx.lineTo(side*130,-65);ctx.stroke()}
 }else if(['sentinel','mine','ancient'].includes(key)){
  for(let i=0;i<9;i++){const angle=i*Math.PI*2/9+q*.45,x=Math.cos(angle)*(100+gather*55),y=Math.sin(angle)*35;
   const h=(35+i%3*22)*gather,levitate=Math.sin(q*8+i)*8*(1-release);drawTheatreCrystal(x,y-levitate,h,12,theme.shade,theme.color,Math.cos(angle)*.2)}
 }else{
  // Claw marks unfurl with the beast's roar.
  for(const side of [-1,1])for(let i=0;i<3;i++){ctx.strokeStyle=i===1?theme.core:theme.color;ctx.lineWidth=3+i;ctx.beginPath();ctx.moveTo(side*(45+i*18),-30);ctx.bezierCurveTo(side*(90+i*20),-80,side*(80+i*35),-130,side*(145+i*20)*gather,-190);ctx.stroke()}
 }
 // Defeat fractures the emblem; all fragments remain purely visual.
 if(s.kind==='defeat'){ctx.globalAlpha=fade*.65;for(let i=0;i<18;i++){const a=i*2.399,r=30+q*240;drawTheatreCrystal(Math.cos(a)*r,-70+Math.sin(a)*r*.6,9+i%4*5,3,theme.color,theme.core,a+q*2)}}
 ctx.restore();
}
function drawBossSceneGhosts(s,e,q,t){
 if(reduced||preferences.shortCinematics||bossThemeKey(e)!=='shadow'||s.kind==='defeat')return;
 const {gather,release,fade}=theatrePhase(q);ctx.save();
 for(const side of [-1,1]){ctx.save();ctx.globalAlpha=.2*fade*(1-release);ctx.translate(side*(150*(1-gather)+45),-20);ctx.scale(.88,.88);ctx.translate(-e.x,-e.y);drawEnemyBody(e,t+side*.35);ctx.restore()}
 ctx.restore();
}
function drawBossSceneForeground(s,e,q){
 if(reduced||preferences.shortCinematics)return;const {release,fade}=theatrePhase(q),theme=bossTheme(e),key=bossThemeKey(e);if(!release||!fade)return;
 ctx.save();ctx.globalAlpha=fade*(1-release*.7);ctx.strokeStyle=theme.core;ctx.lineWidth=2;
 for(let j=0;j<3;j++){const r=60+release*(260+j*50);ctx.beginPath();ctx.ellipse(0,-12,r,r*.3,0,0,Math.PI*2);ctx.stroke()}
 if(['demon','shadow','ancient'].includes(key)){ctx.save();ctx.translate(0,-65);ctx.rotate(-.5);ctx.fillStyle=theme.color+'55';ctx.beginPath();const r=100+release*250;ctx.arc(0,0,r,-1.2,1.2);ctx.arc(-12,0,r-28,1.2,-1.2,true);ctx.closePath();ctx.fill();ctx.strokeStyle=theme.core;ctx.lineWidth=2;ctx.stroke();ctx.restore();for(let j=0;j<4;j++){ctx.save();ctx.translate(0,-65);ctx.rotate(-.35+j*.24);drawTaperedCut(0,0,100+release*250,.4+j*.2,j===1?theme.core:theme.color,5-j*.8);ctx.restore()}}
 else for(let i=0;i<20;i++){const a=i*Math.PI/10+release*.2,from=55+release*150,to=from+30+release*80;ctx.beginPath();ctx.moveTo(Math.cos(a)*from,-80+Math.sin(a)*from*.7);ctx.lineTo(Math.cos(a)*to,-80+Math.sin(a)*to*.7);ctx.stroke()}
 ctx.restore();
}
function emitBossSceneBurst(s,e){
 const theme=bossTheme(e);particle(e.x,e.y-45,theme.color,reduced?6:28,260);effects.push({kind:'nova',x:e.x,y:e.y-30,r:s.kind==='defeat'?260:200,color:theme.color,life:reduced?.4:.9,max:reduced?.4:.9});combatSound(theme.sound,e.x);
}
function drawBossEncounterTitle(s,q){
 const e=s.cast[0],theme=bossTheme(e),fade=clamp(q*8,0,1)*clamp((.76-q)*5,0,1),slide=reduced||preferences.shortCinematics?0:(1-theatreEase(q/.18))*view.w*.55;
 const title=s.kind==='arrival'?'BOSS':s.kind==='transform'?'AWAKEN':s.kind==='defeat'?'VICTORY':'UNLEASH';
 ctx.save();ctx.globalAlpha=fade;const y=view.h*(view.w>view.h?.23:.2),w=Math.min(view.w*.82,600);ctx.translate(view.w/2+slide,y);
 path([[-w/2-18,-39],[w/2,-39],[w/2+18,31],[-w/2,31]],'#071326cc');
 ctx.strokeStyle=theme.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-w/2-18,-39);ctx.lineTo(w/2,-39);ctx.moveTo(-w/2,31);ctx.lineTo(w/2+18,31);ctx.stroke();
 ctx.font='900 '+Math.min(title.length>6?42:60,view.w*(title.length>6?.1:.14))+'px Georgia';ctx.textAlign='center';ctx.fillStyle=theme.core;ctx.fillText(title,0,14);
 ctx.restore();
}
function drawBossTheatreHUD(){
 const s=game.bossScene;if(!s||reduced||preferences.shortCinematics)return;const q=clamp(s.time/s.duration,0,1),theme=bossTheme(s.cast[0]);
 ctx.save();
 // Curtains retract once; no repeated full-screen strobing.
 if(q<.2){const width=(1-theatreEase(q/.2))*view.w*.52;ctx.fillStyle='#050c19';path([[0,0],[width+30,0],[width-30,view.h],[0,view.h]],ctx.fillStyle);path([[view.w,0],[view.w-width+30,0],[view.w-width-30,view.h],[view.w,view.h]],ctx.fillStyle)}
 if(preferences.flashes&&q>.52&&q<.68){const a=Math.sin((q-.52)/.16*Math.PI)*.08;ctx.globalAlpha=a;ctx.fillStyle=theme.color;ctx.fillRect(0,0,view.w,view.h)}
 // Edge streaks leave the hero and boss silhouettes unobscured.
 if(q>.5&&q<.82){ctx.globalAlpha=(1-(q-.5)/.32)*.5;ctx.strokeStyle=theme.color;ctx.lineWidth=1.5;for(let i=0;i<14;i++){const a=i*Math.PI/7,dx=Math.cos(a),dy=Math.sin(a),x=view.w/2+dx*view.w*.38,y=view.h*.5+dy*view.h*.42;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx*100,y+dy*90);ctx.stroke()}}
 ctx.restore();
}
// One bounded effect per real attack; its footprint is clipped to the real shape.
function emitBossTheatre(w,owner){
 if(!owner||owner.kind!=='boss'||w.theatreEmitted||reduced||!['circle','ring','line','fan'].includes(w.kind)||!visibleThreat(w))return;
 w.theatreEmitted=true;const cap=renderLoad.slow?3:6;if(effects.filter(e=>e.kind==='bossTheatre').length>=cap)return;
 effects.push({kind:'bossTheatre',theme:bossThemeKey(owner),x:w.x,y:w.y,shape:w.kind,r:w.r||100,inner:w.inner||0,length:w.length||300,width:w.width||100,spread:w.spread??.7,dir:{...(w.dir||{x:1,y:0})},life:1.05,max:1.05,seed:owner.id%97});
}
function drawBossTheatre(e,a){
 const q=1-a,theme=BOSS_THEMES[e.theme]||BOSS_THEMES.sentinel,reach=theatreEase(q/.35),fade=clamp(a*2,0,1),b=renderViewBounds();
 ctx.save();warningShape({...e,kind:e.shape});ctx.clip('evenodd');
 ctx.globalAlpha*=fade*(preferences.flashes?.85:.48);ctx.lineCap='round';
 // Sweep blades / surge crests follow the actual direction, never imply extra reach.
 if(e.shape==='line'||e.shape==='fan'){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(e.dir.y,e.dir.x));
  const length=e.length,edge=length*reach,width=e.shape==='fan'?Math.min(180,length*Math.sin(e.spread)):e.width;
  for(let j=0;j<5;j++){ctx.strokeStyle=j===2?theme.core:theme.color;ctx.lineWidth=j===2?5:2;ctx.beginPath();ctx.moveTo(0,(j-2)*width*.1);ctx.bezierCurveTo(edge*.35,-width*.38,edge*.65,width*.38,edge,(j-2)*width*.1);ctx.stroke()}
  ctx.restore();
 }else{
  ctx.save();ctx.translate(e.x,e.y);const radius=e.shape==='ring'?e.inner+70+(e.r-e.inner)*reach:e.r*reach;
  ctx.strokeStyle=theme.core;ctx.lineWidth=5*a+1;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=theme.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,radius*.88,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 // Stable world-grid fragments are culled before drawing, including arena-wide attacks.
 const step=135,limit=renderLoad.slow?14:28,gx0=Math.floor(b.left/step),gx1=Math.ceil(b.right/step),gy0=Math.floor(b.top/step),gy1=Math.ceil(b.bottom/step),stride=Math.max(1,Math.ceil((gx1-gx0+1)*(gy1-gy0+1)/limit));let count=0;
 for(let gy=Math.floor(b.top/step);gy<=Math.ceil(b.bottom/step)&&count<limit;gy++)for(let gx=Math.floor(b.left/step);gx<=Math.ceil(b.right/step)&&count<limit;gx++){
  if(((gx*31+gy)%stride+stride)%stride)continue;
  const hash=Math.abs(Math.sin(gx*17.13+gy*47.7+e.seed)*437.3)%1,x=gx*step+hash*65,y=gy*step+((hash*7)%1)*55;
  if(!warningContains({...e,kind:e.shape},{x,y},0))continue;count++;
  const wave=Math.sin(Math.PI*clamp((q-hash*.12)/.8,0,1)),h=(36+hash*80)*wave;
  ctx.strokeStyle=theme.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-35,y+12);ctx.lineTo(x-16,y-1);ctx.lineTo(x,y+6);ctx.lineTo(x+25,y-8);ctx.stroke();
  if(e.theme==='dragon'||e.theme==='demon')drawTheatreFlame(x,y,h,12+hash*9,theme.shade,theme.color,Math.sin(q*11+hash*10)*14);
  else if(e.theme==='monster'){ctx.strokeStyle=theme.core;ctx.lineWidth=4*a+1;ctx.beginPath();ctx.moveTo(x-20,y);ctx.bezierCurveTo(x-18,y-h,x+20,y-h,x+35,y-h*.55);ctx.stroke();ellipse(x+35,y-h*.55,3,6,theme.color)}
  else if(e.theme==='god'){ctx.strokeStyle=theme.color;ctx.lineWidth=6*a+1;ctx.beginPath();ctx.moveTo(x,y-h*2.4);ctx.lineTo(x-10,y-h*1.1);ctx.lineTo(x+9,y-h*.7);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle=theme.core;ctx.lineWidth=1.5;ctx.stroke()}
  else if(e.theme==='shadow'){ctx.strokeStyle=theme.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-15,y);ctx.bezierCurveTo(x+25,y-h*.4,x-25,y-h,x+12,y-h*1.6);ctx.stroke();drawTheatreCrystal(x,y-h*.45,18,3,theme.shade,theme.core,q*.7)}
  else if(e.theme==='beast'){ctx.strokeStyle=theme.color;ctx.lineWidth=3;for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(x-15+j*12,y+5);ctx.bezierCurveTo(x+22+j*10,y-h*.35,x-25+j*12,y-h*.65,x+15+j*15,y-h);ctx.stroke()}}
  else drawTheatreCrystal(x,y-h*.3,Math.max(1,h),10+hash*6,theme.shade,theme.color,Math.sin(hash*7)*.25);
 }
 ctx.restore();
}
