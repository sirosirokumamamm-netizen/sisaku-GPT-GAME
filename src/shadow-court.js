// Royal doubles are real, destructible attackers. Their number and lifetime are bounded.
function summonShadowCourt(e,replicas=false){
 const active=enemies.filter(a=>a.hp>0&&a.shadowMaster===e.id&&!!a.shadowReplica===replicas),limit=replicas?3:4,count=Math.min(limit-active.length,e.awakened?3:2);let spawned=0;
 for(let i=0;i<count;i++){
  const angle=(i/Math.max(1,count))*Math.PI*2+game.time*.3,point=safePoint(p.x+Math.cos(angle)*245,p.y+Math.sin(angle)*245,23),kind=replicas?'wraith':['duelist','hexer','shield'][i%3],a=spawnEnemy(kind,point.x,point.y);
  Object.assign(a,{shadowMaster:e.id,shadowReplica:replicas,shadowLifetime:45,shadowLord:replicas,awakened:e.awakened,bossPhase:e.bossPhase,name:replicas?'影王の分身':'影王の近衛',hp:replicas?(e.awakened?2000:1400):(e.awakened?1500:950),atk:e.awakened?48:38,speed:replicas?260:235,r:replicas?24:21,spawnTime:1.05,cooldown:.35});a.maxHp=a.hp;if(!replicas)configureDistinctMob(a);enemies.push(a);spawned++;
  effects.push({kind:'nova',x:a.x,y:a.y,r:65,color:'#b4a0e9',life:.85,max:.85});particle(a.x,a.y,'#bba7df',12,95);
 }
 if(spawned){e.shadowMirage={life:1.8,max:1.8};banner(replicas?'王影分裂 · 実体ある分身':'死者の近衛、召喚',replicas?'分身も攻撃する。範囲技で巻き込める':'近衛を倒すか、包囲を回避して本体へ',1.5);combatSound('shadow-rift',e.x)}return spawned;
}
function tickShadowRetainer(e,dt){
 e.shadowLifetime-=dt;if(e.shadowLifetime<=0||!enemies.some(b=>b.id===e.shadowMaster&&b.hp>0)){e.hp=0;particle(e.x,e.y,'#a496bc',6,65);return true}return false;
}
function shadowRetainerWarning(e){
 const input=movement(),target={x:p.x+input.x*45,y:p.y+input.y*45},dir=norm(target.x-e.x,target.y-e.y),time=e.awakened?.72:.9;
 personaWarning(e,'fan',e.x,e.y,time,{dir,length:360,spread:.52,atk:e.atk,move:'royalDoubleSlash',shadowRoyal:true});e.state='windup';e.timer=time;e.cooldown=e.awakened?.7:1;return true;
}
function shadowCourtArt(e,pattern){
 if(pattern===(e.awakened?7:4)){if(!summonShadowCourt(e,true))shadowSovereignAttack(e);return true}
 if(pattern===(e.awakened?8:5)){if(!summonShadowCourt(e,false))shadowSovereignAttack(e);return true}
 if(e.awakened&&pattern===9){
  const dir=norm(e.x-p.x,e.y-p.y),refuge=safePoint(p.x+dir.x*175,p.y+dir.y*175,30);
  personaWarning(e,'circle',p.x,p.y,.95,{r:110,atk:62,move:'pursuingGrave',follow:true,lockTime:.35});
  personaWarning(e,'ring',refuge.x,refuge.y,1.5,{r:arenaCoverRadius(refuge),inner:125,atk:88,move:'eclipsePrison',persist:.45});
  banner('葬月の檻','追跡する墓印を離れ、聖域へ。回避で刃を抜けろ',1.4);return true;
 }return false;
}
function drawShadowReplica(e,t){
 ctx.save();ctx.translate(e.x,e.y);ellipse(0,5,29,12,'#0b071e99');ctx.globalAlpha*=e.spawnTime>0?.4:.8;ctx.scale(.55,.55);drawShadeRegentBody(e,t);ctx.scale(1/.55,1/.55);rounded(-22,-84,44,4,2,'#182431');rounded(-22,-84,44*clamp(e.hp/e.maxHp,0,1),4,2,'#bdade9');ctx.font='800 10px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#101326';ctx.strokeText('分身',0,-92);ctx.fillStyle='#d5c1ff';ctx.fillText('分身',0,-92);ctx.restore();
}
function dawnContactMultiplier(distance,rank=p.learned.dawn||1){const reference=campaign.dawnUpgrade?620:dawnRadius(rank);return 1.2-.4*clamp(distance/Math.max(1,reference),0,1)}
SKILL_SUMMARIES.dawn='光を溜めて回転斬り。根元ほど強い';
getSkill('dawn').desc+=' 根元120%・中央100%・先端80%の威力。';
