// Fifth realm, equipment and room-entry rules. No remote assets or dependencies.
const WEAPONS=[
 {id:'traveler',name:'旅立ちの剣',price:0,icon:'⚔',color:'#a9e6ff',power:1,speed:1,reach:1,element:'無',extra:'なし',desc:'癖のない標準の剣。'},
 {id:'rapier',name:'風切りの細剣',price:280,icon:'➶',color:'#a5f3cf',power:.85,speed:1.3,reach:.95,element:'風',extra:'なし',desc:'一撃は軽いが、通常攻撃が速い。'},
 {id:'greatsword',name:'巨人の大剣',price:360,icon:'♜',color:'#f4d4a2',power:1.3,speed:.8,reach:1.25,element:'無',extra:'なし',desc:'大きな刃で薙ぎ払う。振りは遅い。'},
 {id:'ember',name:'焔の牙',price:450,icon:'♨',color:'#ffb080',power:1.05,speed:1,reach:1,element:'炎',extra:'3撃ごとに炎上',desc:'通常攻撃の3撃ごとに、命中した敵を燃やす。'},
 {id:'frostblade',name:'氷晶の剣',price:450,icon:'❄',color:'#adf1ff',power:1,speed:1,reach:1.12,element:'氷',extra:'3撃ごとに減速',desc:'広めの刃。3撃ごとに敵の移動を遅くする。'},
 {id:'echo',name:'雷鳴の双剣',price:650,icon:'ϟ',color:'#d7beff',power:.92,speed:1.15,reach:1,element:'雷',extra:'4撃ごとに追撃',desc:'4撃ごとに、近くの別の敵へ雷が跳ぶ。'}
];
function getWeapon(id=game.weapon||'traveler'){return WEAPONS.find(w=>w.id===id)||WEAPONS[0]}
function applyWeapon(){const w=getWeapon();p.power*=w.power;p.autoInterval/=w.speed;p.reach*=w.reach;game.weaponHits=0}
function weaponStrike(targets){
 if(!game.singleStage||!targets.length)return;game.weaponHits=(game.weaponHits||0)+1;const w=getWeapon();
 if(w.id==='ember'&&game.weaponHits%3===0)for(const e of targets){e.burn=3;e.burnTick=0;particle(e.x,e.y-20,w.color,4,70)}
 if(w.id==='frostblade'&&game.weaponHits%3===0)for(const e of targets){e.frost=2.4;particle(e.x,e.y-20,w.color,4,70)}
 if(w.id==='echo'&&game.weaponHits%4===0){const from=targets[0],other=nearest(220,from,new Set(targets.map(e=>e.id)));if(other){effects.push({kind:'beam',x:from.x,y:from.y-20,ex:other.x,ey:other.y-20,color:w.color,life:.25,max:.25});hurtEnemy(other,18*p.power,false,w.color,true,true)}}
}
function darkUnlocked(c=campaign){return [0,1,2,3].every(i=>!!c.clears[i])||!!c.clears[4]}
function openDarkReveal(done){
 game.mode='darkReveal';game.active=false;openModal('<div class="finale-seal">♜</div><h2>幻の第五世界、出現</h2><p>四つの舞台を越えた剣士へ。<br>闇の世界で、復活する魔王が待っている。</p><button class="cta" id="darkContinue">闇の世界を解放</button>');$('modal').classList.add('finale-reveal-modal');$('darkContinue').onclick=()=>{const n=cloneCampaign();n.darkRevealed=true;saveCampaign(n);done()};
}
function prepareExitWalk(){
 if(game.mode!=='roomEquipment'||game.active||game.pendingChoices||game.relicOffers?.length)return false;
 game.mode='play';game.phase='exitWalk';game.campReady=false;closeModal();resetInput();banner('前へ進もう','上の光る門を越えると、次の区画へ。',1.6);updateUI();return true;
}
function walkToNextRoom(dt){
 const input=movement();if(Math.hypot(input.x,input.y)>.1)p.face=norm(input.x,input.y);
 p.swing=Math.max(0,p.swing-dt);p.cd.roll=Math.max(0,p.cd.roll-dt);p.invuln=Math.max(0,p.invuln-dt);p.autoCd-=dt;if((keys.has('Shift')||p.rollHeld)&&p.cd.roll<=0)action('roll');if(p.rollTime>0){p.rollTime=Math.max(0,p.rollTime-dt);moveActor(p,p.rollDir.x*470*dt,p.rollDir.y*470*dt)}else moveActor(p,input.x*225*dt,input.y*225*dt);if(p.autoCd<=0)autoAttack();updateFieldItems(dt);drops=drops.filter(d=>!d.collected);
 if(p.y<STAGES[game.stage].y-228&&Math.abs(p.x-380)<75){game.phase='roomRest';advanceRoom();return}updateUI();
}
function openSupplyBarrel(t){
 if(t.broken)return;t.broken=true;particle(t.x,t.y,'#edce94',10,130);
 drops.push({type:t.content==='potion'?'fieldPotion':'bomb',x:t.x,y:t.y,vx:0,vy:0,age:0,value:1});floating(t.x,t.y-50,t.content==='potion'?'回復薬を発見':'爆薬を発見',t.content==='potion'?'#aff2c5':'#ffc08c',true);
}
function explodeLooseBomb(d){
 if(d.collected)return;d.collected=true;game.barrels++;effects.push({kind:'nova',x:d.x,y:d.y,r:145,color:'#ffba72',life:.4,max:.4});
 for(const e of enemies)if(e.hp>0&&distance(e,d)<145+e.r)hurtEnemy(e,60+game.region*12,true,'#ffd39b',true);
 hostileShots=hostileShots.filter(b=>distance(b,d)>145);particle(d.x,d.y,'#ffc68a',24,220);if(!reduced)shake=Math.max(shake,4);
}
function updateFieldItems(dt){
 for(const d of drops){if(d.collected)continue;if(d.type==='fieldPotion'){d.age+=dt;if(distance(p,d)<45){d.collected=true;game.fieldPotions=Math.min(3,(game.fieldPotions||0)+1);floating(p.x,p.y-100,'回復薬を確保 · 休憩で使える','#baf5ca',true)}}else if(d.type==='bomb'){d.age+=dt;if(d.age>.25&&enemies.some(e=>e.hp>0&&distance(e,d)<80)){d.fuse=(d.fuse??.55)-dt;if(d.fuse<=0)explodeLooseBomb(d)}}}
}
function useFieldPotion(){
 if(game.mode!=='roomEquipment'||game.active||!(game.fieldPotions>0)||p.hp>=p.maxHp&&p.mp>=p.maxMp)return false;
 game.fieldPotions--;p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*.35));p.mp=Math.min(p.maxMp,p.mp+Math.ceil(p.maxMp*.4));roomEquipment();return true;
}
function configureRealmBoss(e,index){
 if(e.kind!=='boss')return;e.form=['beast','monster','dragon','sentinel','demon'][game.region];e.speed=135+game.region*5;e.pattern=4;e.atk=12+game.region*2;e.cooldown=.5+index*.8;
 if(game.region===3){e.name=index?'月影の守護獣':'星核の守護者';e.form=index?'beast':'sentinel';e.hp=e.maxHp=Math.round(REGIONS[3].hp*.58);e.r=36}
 e.awakened=false;e.cycle='assault';e.cycleTime=8;
}
function interceptBossDefeat(e){
 if(!game.singleStage||e.kind!=='boss'||e.form!=='demon'||e.awakened)return false;
 e.awakened=true;e.hp=e.maxHp=Math.round(REGIONS[4].hp*.8);e.r=56;e.bossPhase=2;e.state='revive';e.timer=1.8;e.cycle='assault';e.cycleTime=8;clearHostiles();e.burn=e.bleed=e.frost=0;
 banner('魔王、復活！','巨大化した！ 猛攻を避け、核心露出を狙え。',2);particle(e.x,e.y,'#d597ff',44,220);return true;
}
function updateRealmBoss(e,dt){
 if(e.form!=='demon'||!e.awakened)return false;
 if(e.state==='revive'){e.timer-=dt;if(e.timer<=0){e.state='chase';e.cooldown=.1}return true}
 e.cycleTime-=dt;if(e.cycleTime<=0){clearHostiles();e.leapFrom=e.leapTo=null;e.cycle=e.cycle==='assault'?'exposed':'assault';e.cycleTime=e.cycle==='assault'?8:5;e.state=e.cycle==='exposed'?'recover':'chase';e.timer=e.cycleTime;e.exposed=e.cycle==='exposed'?e.cycleTime:0;e.cooldown=.15;banner(e.cycle==='exposed'?'核心露出！ 今が攻撃のチャンス':'魔王の猛攻！ 回避に集中', '',1)}
 if(e.cycle==='exposed'){e.exposed=e.cycleTime;return true}return false;
}
function realmBossWarning(e,warn,target,dir){
 const count=e.pattern++,phase=e.bossPhase===2,pace=e.form==='demon'&&e.awakened?.9:1,pattern=count%(phase?4:3);
 if(pattern===0||pattern===3){const point=safePoint(clamp(target.x,145,615),clamp(target.y,STAGES[game.stage].y-175,STAGES[game.stage].y+300),e.r);warn('circle',point.x,point.y,e.form==='beast'?90:115,1.05*pace,{attack:'leap'});e.leapFrom={x:e.x,y:e.y};e.leapTo=point;return}
 if(pattern===1){warn('line',e.x,e.y,0,.9*pace,{length:Math.min(470,distance(e,target)+140),width:e.form==='dragon'?140:105,attack:'bossDash'});return}
 if(e.form==='dragon'){warn('fan',e.x,e.y,0,1.05,{length:600,spread:.8,rays:7,attack:'fan'});return}
 if(e.form==='beast'){warn('ring',e.x,e.y,210,.95,{inner:80,attack:'shockwave'});return}
 if(e.form==='monster'){warn('circle',target.x,target.y,115,1.05,{attack:'stomp'});return}
 warn('fan',e.x,e.y,0,.95*pace,{length:620,spread:.75,rays:7,attack:'fan'});
}
function drawCreatureBoss(e,t){
 ctx.save();if(e.awakened)ctx.scale(1.4,1.4);const color=e.flash>0?'#fff4d9':({beast:'#699c86',monster:'#537faa',dragon:'#b95649',demon:'#704b9c'}[e.form]);const edge=e.form==='demon'?'#d5a6ff':'#e8c7a0';
 if(e.form==='dragon'||e.form==='demon'){const flap=Math.sin(t*4+e.phase)*12;for(const s of [-1,1])path([[s*19,-72],[s*72,-138+flap],[s*112,-63],[s*66,-80],[s*44,-30]],e.form==='dragon'?'#762f45':'#36274f',edge)}
 if(e.form==='monster'){for(let i=0;i<6;i++){const x=(i-2.5)*16;ctx.strokeStyle=color;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,-30);ctx.quadraticCurveTo(x+Math.sin(t*3+i)*25,0,x*1.4,8);ctx.stroke()}}
 else for(const s of [-1,1]){rounded(s<0?-37:15,-38,22,44,8,color,edge);path([[s*25,-1],[s*41,8],[s*12,8]],'#e7d4b2')}
 ellipse(0,-49,39,46,color);path([[-30,-66],[-25,-111],[0,-127],[25,-111],[30,-66],[0,-49]],color,edge);
 for(const s of [-1,1]){path([[s*18,-109],[s*40,-143],[s*29,-100]],'#e3c39d',edge);ellipse(s*12,-91,5,3,e.cycle==='exposed'?'#aaffef':'#ffda92');path([[s*23,-59],[s*58,-73],[s*66,-19],[s*49,-12],[s*39,-44]],color,edge)}
 path([[-14,-73],[0,-65],[14,-73],[9,-58],[-9,-58]],'#202134');for(const s of [-1,1])path([[s*9,-70],[s*7,-58],[s*3,-70]],'#fff1cd');
 if(e.form==='beast'){for(const s of [-1,1])path([[s*24,-107],[s*42,-129],[s*44,-157],[s*52,-148],[s*51,-127],[s*68,-137],[s*61,-114]],'#c9cca4',edge)}
 if(e.form==='demon'){const glow=e.awakened&&e.cycle==='exposed'?'#b2ffee':'#d398ff';ctx.shadowBlur=reduced?0:18;ctx.shadowColor=glow;path([[0,-66],[12,-49],[0,-31],[-12,-49]],glow,'#f6e2ff');ctx.shadowBlur=0;if(e.awakened&&e.cycle==='assault'){ctx.strokeStyle='#d69fff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-54,57,85,0,0,Math.PI*2);ctx.stroke()}}
 ctx.restore();
}
function drawRoomGate(t){
 if(!game.singleStage||game.room>=5)return;const y=STAGES[game.stage].y-222,open=game.phase==='exitWalk';ctx.save();ctx.strokeStyle=open?'#b3ffe1':'#587787';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(307,y);ctx.lineTo(307,y-35);ctx.lineTo(453,y-35);ctx.lineTo(453,y);ctx.stroke();
 if(open){ctx.fillStyle='#87ebcd22';ctx.fillRect(309,y-30,142,90);ctx.strokeStyle='#c6ffe4';ctx.lineWidth=4;for(let i=0;i<3;i++){const yy=y+25+i*36+(t*35%36);ctx.beginPath();ctx.moveTo(362,yy+12);ctx.lineTo(380,yy);ctx.lineTo(398,yy+12);ctx.stroke()}ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillStyle='#d8ffef';ctx.fillText('次の区画へ',380,y-50)}ctx.restore();
}
function drawBossBars(){
 const bosses=enemies.filter(e=>e.kind==='boss'&&e.hp>0);bosses.forEach((boss,i)=>{const w=Math.min(view.w-44,540),x=(view.w-w)/2,y=(view.w<600?144:138)+([...AUTO_IDS].some(id=>p.learned[id])?27:0)+i*38;
 const invulnerable=boss.awakened&&(boss.cycle==='assault'||boss.state==='revive'),color=invulnerable?'#c298ef':boss.exposed>0?'#93ffe1':boss.bossPhase===2?'#ffad81':'#c4b5ff';ctx.save();ctx.shadowColor=color;ctx.shadowBlur=reduced?0:10;ctx.fillStyle='#162338db';ctx.fillRect(x,y,w,9);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,boss.hp/boss.maxHp),9);ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff1dc';const phase=boss.awakened?(boss.state==='revive'?'復活・巨大化':invulnerable?'無敵 · 回避に集中 '+Math.ceil(boss.cycleTime)+'秒':'核心露出 · 攻撃！ '+Math.ceil(boss.cycleTime)+'秒'):boss.exposed>0?'反撃の隙！':boss.bossPhase===2?'本性解放':'';ctx.fillText('BOSS · '+boss.name+(phase?' · '+phase:''),view.w/2,y-8);ctx.restore()});
}
function drawDarkFloor(t){
 if(!game.singleStage||game.region!==4)return;const y=STAGES[game.stage].y;ctx.save();ctx.fillStyle='#29193655';ctx.fillRect(65,y-230,630,610);ctx.strokeStyle='#b28bc333';ctx.lineWidth=2;for(const side of [-1,1])for(let i=0;i<4;i++){const x=380+side*(170+i*23),yy=y-130+i*116;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+side*34,yy+28);ctx.lineTo(x+side*14,yy+57);ctx.lineTo(x+side*48,yy+90);ctx.stroke();ellipse(x,yy-10,2,3,'#b89bdc66')}ctx.restore();
}
