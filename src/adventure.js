// Fifth realm, equipment and room-entry rules. No remote assets or dependencies.
const WEAPONS=[
 {id:'traveler',name:'旅立ちの剣',price:0,icon:'⚔',color:'#a9e6ff',attack:165,speed:1,reach:1,element:'無',extra:'なし',desc:'癖のない標準の剣。'},
 {id:'rapier',name:'風切りの刃',price:1200,icon:'➶',color:'#a5f3cf',attack:41,speed:3,reach:.75,element:'風',extra:'なし',desc:'一撃は軽く、刃は短い。圧倒的な手数で刻む。'},
 {id:'greatsword',name:'巨人の大剣',price:1200,icon:'♜',color:'#f4d4a2',attack:430,speed:.32,reach:2.8,element:'無',extra:'移動速度 −18%（回避は通常）',desc:'歩みも振りも重い。圧倒的な間合いで、遠くの敵まで薙ぎ払う。'},
 {id:'ember',name:'焔の牙',price:1800,icon:'♨',color:'#ffb080',attack:195,speed:1.05,reach:1,element:'炎',extra:'3撃ごとに炎上',desc:'通常攻撃の3撃ごとに、命中した敵を燃やす。'},
 {id:'frostblade',name:'氷晶の剣',price:1800,icon:'❄',color:'#adf1ff',attack:185,speed:1.05,reach:1.12,element:'氷',extra:'3撃ごとに減速',desc:'広めの刃。3撃ごとに敵の移動を遅くする。'},
 {id:'echo',name:'雷鳴の双剣',price:1800,icon:'ϟ',color:'#d7beff',attack:182,speed:1.2,reach:1,element:'雷',extra:'4撃ごとに追撃',desc:'4撃ごとに、近くの別の敵へ雷が跳ぶ。'},
 {id:'abyss',name:'冥王の黒刃',price:3600,icon:'☾',color:'#d99aff',attack:255,speed:1.05,reach:1.2,element:'闇',extra:'3撃ごとに闇の衝撃波',postDemon:true,desc:'魔王の残滓を鍛えた大剣。重い一撃と衝撃波で敵を砕く。'},
 {id:'starfall',name:'天穿つ大剣',price:3600,icon:'✧',color:'#c1f1ff',attack:231,speed:1.15,reach:1.5,element:'無',hiddenElement:'light',extra:'ボスへの与ダメージ＋20%',postDemon:true,desc:'神を穿つ長大な刃。広い間合いから強敵の核心を狙う。'},
 {id:'dawn',name:'黎明の聖剣',price:3600,icon:'☀',color:'#fff0b1',attack:215,speed:1.35,reach:1.2,element:'光',extra:'4撃ごとにMPと必殺ゲージ回復',postDemon:true,desc:'連撃で光を蓄える聖剣。剣技と覚醒をつなげる。'}
];
function getWeapon(id=game.weapon||'traveler'){return WEAPONS.find(w=>w.id===id)||WEAPONS[0]}
function applyWeapon(){const w=getWeapon();p.power*=w.attack/WEAPONS[0].attack*(1+.06*forgeLevel('weapon',w.id));p.autoInterval/=w.speed;p.reach*=w.reach;game.weaponHits=0}
function weaponStrike(targets){
 if(!game.singleStage||!targets.length)return;game.weaponHits=(game.weaponHits||0)+1;const w=getWeapon();
 if(w.id==='ember'&&game.weaponHits%3===0)for(const e of targets){e.burn=3;e.burnTick=0;particle(e.x,e.y-20,w.color,4,70)}
 if(w.id==='frostblade'&&game.weaponHits%3===0)for(const e of targets){e.frost=2.4;particle(e.x,e.y-20,w.color,4,70)}
 if(w.id==='abyss'&&game.weaponHits%3===0){const from=targets[0];effects.push({kind:'nova',x:from.x,y:from.y,r:150,color:w.color,life:.5,max:.5});for(const enemy of enemies)if(enemy.hp>0&&distance(enemy,from)<150)hurtEnemy(enemy,22*p.power,true,w.color,true,true,false,weaponElement())}if(w.id==='dawn'&&game.weaponHits%4===0){p.mp=Math.min(p.maxMp,p.mp+2);chargeUltimate(5);particle(p.x,p.y,w.color,7,80)}
 if(w.id==='origin'&&game.weaponHits%6===0)p.mp=Math.min(p.maxMp,p.mp+2);if(w.id==='echo'&&game.weaponHits%4===0){const from=targets[0],other=nearest(220,from,new Set(targets.map(e=>e.id)));if(other){effects.push({kind:'beam',x:from.x,y:from.y-20,ex:other.x,ey:other.y-20,color:w.color,life:.25,max:.25});hurtEnemy(other,18*p.power,false,w.color,true,true,false,weaponElement())}}
}
function darkUnlocked(c=campaign){return [0,1,2,3].every(i=>!!c.clears[i])||!!c.clears[4]}
function openDarkReveal(done){
 game.mode='darkReveal';game.active=false;openModal('<div class="finale-seal">♜</div><h2>幻の第五世界、出現</h2><p>四つの舞台を越えた剣士へ。<br>闇の世界で、復活する魔王が待っている。</p><button class="cta" id="darkContinue">闇の世界を解放</button>');$('modal').classList.add('finale-reveal-modal');$('darkContinue').onclick=()=>{const n=cloneCampaign();n.darkRevealed=true;saveCampaign(n);done()};
}
function prepareExitWalk(){
 if(game.mode!=='roomEquipment'||game.active)return false;if(game.pendingChoices>0){game.choiceDelay=0;openDraft();return false}
 game.mode='play';game.phase='exitWalk';game.campReady=false;p.rollTime=0;p.swing=0;inputBuffer=null;closeModal();resetInput();updateUI();return true;
}
function walkToNextRoom(dt){
 if(game.pendingChoices>0){game.choiceDelay=0;flushLevelChoices();return}
 const input=movement();if(Math.hypot(input.x,input.y)>.1)p.face=norm(input.x,input.y);
 moveActor(p,input.x*225*dt,input.y*225*dt);p.autoCd-=dt;if(p.autoCd<=0)autoAttack();updateFieldItems(dt);drops=drops.filter(d=>!d.collected);
 if(p.y<=STAGES[game.stage].y-195&&Math.abs(p.x-380)<=60){game.phase='roomRest';advanceRoom();return}updateUI();
}
function openSupplyBarrel(t){
 if(t.broken)return;t.broken=true;particle(t.x,t.y,'#edce94',10,130);
 drops.push({type:t.content==='potion'?'fieldPotion':'bomb',x:t.x,y:t.y,vx:0,vy:0,age:0,value:1,...(t.content==='bomb'?{fuse:.25}:{})});floating(t.x,t.y-50,t.content==='potion'?'回復薬を発見':'爆薬を発見',t.content==='potion'?'#aff2c5':'#ffc08c',true);
}
function explodeLooseBomb(d){
 if(d.collected)return;d.collected=true;game.barrels++;effects.push({kind:'nova',x:d.x,y:d.y,r:145,color:'#ffba72',life:.4,max:.4});
 for(const e of enemies)if(e.hp>0&&distance(e,d)<145+e.r)hurtEnemy(e,60+game.region*12,true,'#ffd39b',true);
 hitExplosives(q=>distance(q,d)<145,10);hostileShots=hostileShots.filter(b=>distance(b,d)>145);particle(d.x,d.y,'#ffc68a',24,220);if(!reduced)shake=Math.max(shake,4);
}
function updateFieldItems(dt){
 for(const d of drops){if(d.collected)continue;if(d.type==='fieldPotion'){d.age+=dt;if(distance(p,d)<45&&(game.fieldPotions||0)>=3&&!d.fullNotified){d.fullNotified=true;banner('これ以上ポーションは持てない','通常は3個まで · 回復ボタンで使えます',2);floating(p.x,p.y-95,'ポーション ×'+game.fieldPotions,'#ffe0a1',true)}if(distance(p,d)>70)d.fullNotified=false;if(distance(p,d)<45&&(game.fieldPotions||0)<3){d.collected=true;game.roomPotionCollected=true;game.fieldPotions=Math.min(3,(game.fieldPotions||0)+1);acquisitionToast('ポーション獲得！ ×'+game.fieldPotions,'#afffe0')}}else if(d.type==='bomb'){d.age+=dt;if(Number.isFinite(d.fuse)){d.fuse-=dt;if(d.fuse<=0)explodeLooseBomb(d)}}}
}
function useFieldPotion(){return useCombatPotion()}

function configureRealmBoss(e,index){
 if(e.kind!=='boss')return;if(isMine()){configureMineBoss(e);return}e.form=['beast','monster','dragon','sentinel','demon','god','demon'][game.region];e.speed=165+game.region*5;e.pattern=4;e.atk=22+game.region*5;e.cooldown=.5+index*.8;
 if(game.region===3){e.name=index?'月影の守護獣':'星核の守護者';e.form=index?'beast':'sentinel';e.hp=e.maxHp=Math.round(REGIONS[3].hp*.58);e.r=36}
 if(game.region===4)e.atk=56;if(game.region===6){e.shadowLord=true;e.name='影の大魔王';e.atk=48}e.awakened=false;e.cycle='assault';e.cycleTime=8;if(e.form==='dragon'){e.r=60;Object.assign(e,safePoint(e.x,e.y,e.r))}if(e.form==='god'){e.r=56;e.ward=1;e.godCycle=0;e.cycleTime=3.3;e.atk=54;Object.assign(e,safePoint(e.x,e.y,e.r))}configureEndgameBoss(e,index);
}
function interceptBossDefeat(e){
 if(!game.singleStage||e.kind!=='boss'||e.form!=='demon'||e.awakened)return false;
 const before={...e,facing:{...e.facing}};secondFormHealth(e);e.awakened=true;if(e.shadowLord)e.name='影葬王ノクスヴェイル';e.hp=Math.round(e.maxHp*.75);e.r=72;Object.assign(e,safePoint(e.x,e.y,e.r));e.bossPhase=2;e.state='revive';e.timer=2.8;startEpicEvent('変貌','深淵の王、顕現','#d69aff',2.8);e.cycle='assault';e.cycleTime=8;clearHostiles();e.burn=e.bleed=e.frost=0;
 beginBossScene('transform',e,before);grantPhasePotion(e);banner('魔王、復活！','巨大化した！ 猛攻を避け、核心露出を狙え。',2);particle(e.x,e.y,'#d597ff',44,220);return true;
}
function updateRealmBoss(e,dt){
 if(e.mineBoss)return updateMineBoss(e,dt);
 if(updateSovereignTrial(e,dt/(e.bossPhase===2?1.18:1)))return true;if(updateBonusBossArt(e,dt)||updateAncientWarden(e,dt))return true;e.demonCast=Math.max(0,(e.demonCast||0)-dt);if(e.shadowLord)return updateShadowSovereign(e,dt);if(e.form==='demon')return demonDuel(e,dt);if(updateRoyalTransit(e,dt))return true;if(e.form==='god')return updateGod(e,dt);
 if(e.form!=='demon'||!e.awakened){if(repositionBoss(e,dt))return true;bossBattleMotion(e,dt);return false}
 if(e.state==='revive'){e.timer-=dt;if(e.timer<=0){e.state='chase';e.cooldown=.1}return true}
 e.cycleTime-=dt;if(e.cycleTime<=0){clearHostiles();e.barrageClock=.5;e.leapFrom=e.leapTo=null;e.cycle=e.cycle==='assault'?'exposed':'assault';e.cycleTime=e.cycle==='assault'?8:5;e.state=e.cycle==='exposed'?'recover':'chase';e.timer=e.cycleTime;e.exposed=e.cycle==='exposed'?e.cycleTime:0;e.cooldown=.15;banner(e.cycle==='exposed'?'核心露出！ 今が攻撃のチャンス':'魔王の猛攻！ 回避に集中', '',1)}
 if(e.cycle==='exposed'){e.exposed=e.cycleTime;return true}demonBarrage(e,dt);e.state='chase';if(!warnings.some(w=>w.owner===e.id&&w.attack==='persona'&&w.life>.15))roamMythicBoss(e,dt,310);return true;
}
function realmBossWarning(e,warn,target,dir){if(creatureSignature(e,warn,target,dir))return;
 if(e.form==='demon'&&!e.awakened){demonMagicWarning(e,target,dir);return}const count=e.pattern++,phase=e.bossPhase===2,pace=e.form==='demon'&&e.awakened?.9:1,pattern=count%(phase?4:3);
 if(pattern===0||pattern===3){const point=safePoint(target.x,clamp(target.y,battleBounds().top+e.r,battleBounds().bottom-e.r),e.r);warn('circle',point.x,point.y,e.form==='beast'?105:120,1.05*pace,{attack:'leap'});e.leapFrom={x:e.x,y:e.y};e.leapTo=point;return}
 if(pattern===1){warn('line',e.x,e.y,0,.9*pace,{length:Math.min(470,Math.max(330,distance(e,target)+140)),width:e.form==='dragon'?140:105,attack:'bossDash'});return}
 if(e.form==='dragon'){epicWarning(e,'line',e.x,e.y,0,1.45,{dir,length:620,width:115,style:'flame',atk:48,persist:3.4});banner('灼熱の竜息','進路の横へ！ 炎はしばらく残る',1.2);return}
 if(e.form==='beast'){warn('ring',e.x,e.y,210,.95,{inner:80,attack:'shockwave'});return}
 if(e.form==='monster'){warn('circle',target.x,target.y,115,1.05,{attack:'stomp'});return}
 warn('fan',e.x,e.y,0,.95*pace,{length:620,spread:.75,rays:7,attack:'fan'});
}
function drawCreatureBoss(e,t){
 if(e.ancientWarden){drawEternalWarden(e,t);return}if(drawEpicCreature(e,t))return;
 ctx.save();if(e.awakened)ctx.scale(1.65,1.65);const color=e.flash>0?'#fff4d9':({beast:'#699c86',monster:'#537faa',dragon:'#b95649',demon:'#704b9c'}[e.form]);const edge=e.form==='demon'?'#d5a6ff':'#e8c7a0';
 if(e.form==='dragon'||e.form==='demon'){const flap=Math.sin(t*4+e.phase)*12;for(const s of [-1,1])path([[s*19,-72],[s*72,-138+flap],[s*112,-63],[s*66,-80],[s*44,-30]],e.form==='dragon'?'#762f45':'#36274f',edge)}
 if(e.form==='monster'){for(let i=0;i<6;i++){const x=(i-2.5)*16;ctx.strokeStyle=color;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,-30);ctx.quadraticCurveTo(x+Math.sin(t*3+i)*25,0,x*1.4,8);ctx.stroke()}}
 else for(const s of [-1,1]){rounded(s<0?-37:15,-38,22,44,8,color,edge);path([[s*25,-1],[s*41,8],[s*12,8]],'#e7d4b2')}
 ellipse(0,-49,39,46,color);path([[-30,-66],[-25,-111],[0,-127],[25,-111],[30,-66],[0,-49]],color,edge);
 for(const s of [-1,1]){path([[s*18,-109],[s*40,-143],[s*29,-100]],'#e3c39d',edge);ellipse(s*12,-91,5,3,e.cycle==='exposed'?'#aaffef':'#ffda92');path([[s*23,-59],[s*58,-73],[s*66,-19],[s*49,-12],[s*39,-44]],color,edge)}
 path([[-14,-73],[0,-65],[14,-73],[9,-58],[-9,-58]],'#202134');for(const s of [-1,1])path([[s*9,-70],[s*7,-58],[s*3,-70]],'#fff1cd');
 if(e.form==='beast'){for(const s of [-1,1])path([[s*24,-107],[s*42,-129],[s*44,-157],[s*52,-148],[s*51,-127],[s*68,-137],[s*61,-114]],'#c9cca4',edge)}
 if(e.form==='demon'&&e.demonCast>0){for(const side of [-1,1]){ctx.strokeStyle=color;ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(side*28,-65);ctx.lineTo(side*52,-111);ctx.stroke();ellipse(side*52,-118,12,15,'#e3acff')}ellipse(0,-75,12+Math.sin(t*18)*3,10,'#ffe3b9')}
 if(e.form==='demon'){const glow=e.awakened&&e.cycle==='exposed'?'#b2ffee':'#d398ff';ctx.shadowBlur=reduced?0:18;ctx.shadowColor=glow;path([[0,-66],[12,-49],[0,-31],[-12,-49]],glow,'#f6e2ff');ctx.shadowBlur=0;if(e.awakened&&e.cycle==='assault'){ctx.strokeStyle='#d69fff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-54,57,85,0,0,Math.PI*2);ctx.stroke()}}
 ctx.restore();
}
function drawRoomGate(t){
 if(!game.singleStage||isFinalRoom())return;const y=STAGES[game.stage].y-222,open=game.phase==='exitWalk';ctx.save();ctx.strokeStyle=open?'#b3ffe1':'#587787';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(307,y);ctx.lineTo(307,y-35);ctx.lineTo(453,y-35);ctx.lineTo(453,y);ctx.stroke();
 if(open){ctx.fillStyle='#87ebcd22';ctx.fillRect(309,y-30,142,90);ctx.strokeStyle='#c6ffe4';ctx.lineWidth=4;for(let i=0;i<3;i++){const yy=y+25+i*36+(t*35%36);ctx.beginPath();ctx.moveTo(362,yy+12);ctx.lineTo(380,yy);ctx.lineTo(398,yy+12);ctx.stroke()}ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillStyle='#d8ffef';ctx.fillText('次の区画へ',380,y-50)}ctx.restore();
}
function drawBossBars(){
 const bosses=enemies.filter(e=>e.kind==='boss'&&e.hp>0);bosses.forEach((boss,i)=>{const w=Math.min(view.w-44,540),x=(view.w-w)/2,y=(view.h<450?103:view.w<600?144:138)+([...AUTO_IDS].some(id=>p.learned[id])?27:0)+i*38;
 const invulnerable=!!boss.catastrophe||boss.form==='god'&&boss.bossPhase===2&&boss.ward>0||boss.state==='revive',color=invulnerable?'#c298ef':boss.exposed>0?'#93ffe1':boss.bossPhase===2?'#ffad81':'#c4b5ff';ctx.save();ctx.shadowColor=color;ctx.shadowBlur=reduced?0:10;ctx.fillStyle='#162338db';ctx.fillRect(x,y,w,9);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,boss.hp/boss.maxHp),9);ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff1dc';const phase=boss.catastrophe?'大技詠唱中 · 術式を破壊せよ':boss.form==='god'?(boss.ward>0?(boss.bossPhase===2?'無効！ · 障壁 ':'障壁 · 被ダメージ1 · ')+Math.ceil(boss.cycleTime)+'秒':'障壁解除 · 攻撃の好機！ '+Math.ceil(boss.cycleTime)+'秒'):boss.awakened?(boss.state==='revive'?'復活・巨大化':boss.cycle==='assault'?'猛攻 · 強靭 '+Math.ceil(boss.cycleTime)+'秒':'核心露出 · 攻撃！ '+Math.ceil(boss.cycleTime)+'秒'):boss.exposed>0?'反撃の隙！':boss.bossPhase===2?'本性解放':'';const label='BOSS · '+boss.name+(phase?' · '+phase:'');ctx.shadowBlur=0;ctx.strokeStyle='#17324b';ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeText(label,view.w/2,y-8,w);ctx.fillText(label,view.w/2,y-8,w);ctx.restore();drawTrialBossBar(boss,x,y,w)});
}
function drawDarkFloor(t){
 if(!game.singleStage||game.region!==4)return;const y=STAGES[game.stage].y;ctx.save();ctx.fillStyle='#29193655';ctx.fillRect(65,y-230,630,610);ctx.strokeStyle='#b28bc333';ctx.lineWidth=2;for(const side of [-1,1])for(let i=0;i<4;i++){const x=380+side*(170+i*23),yy=y-130+i*116;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+side*34,yy+28);ctx.lineTo(x+side*14,yy+57);ctx.lineTo(x+side*48,yy+90);ctx.stroke();ellipse(x,yy-10,2,3,'#b89bdc66')}ctx.restore();
}
function scatterSupplies(){
 terrain=terrain.filter(t=>t.kind!=='barrel');const y=STAGES[game.stage].y,slots=shuffle([[-1,-1],[1,-1],[-1,1],[1,1]]),placed=[];
 for(let i=0;i<4;i++){let q;for(let attempt=0;attempt<100;attempt++){const [sx,sy]=slots[i],candidate={x:380+sx*runRange(115,235),y:y+(sy<0?runRange(-140,0):runRange(130,290))};if(canStand(candidate.x,candidate.y,22)&&placed.every(a=>distance(a,candidate)>105)){q=candidate;break}}q??=safePoint(380+slots[i][0]*190,y+(slots[i][1]<0?-65:210),22);placed.push(q);terrain.push({kind:'barrel',...q,r:16,solid:false,broken:i===0&&!!game.roomPotionCollected,content:i===0?'potion':'bomb'})}
}
function hitExplosives(contains,damage=1){
 if(!game.singleStage||damage<1)return;for(const t of terrain)if(t.kind==='barrel'&&t.content==='bomb'&&!t.broken&&contains(t))openSupplyBarrel(t);
 for(const d of drops)if(d.type==='bomb'&&!d.collected&&contains(d))d.fuse=Math.min(d.fuse??Infinity,.22);
}
function segmentHits(a,b,q,r){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,u=l?clamp(((q.x-a.x)*dx+(q.y-a.y)*dy)/l,0,1):0;return Math.hypot(q.x-a.x-dx*u,q.y-a.y-dy*u)<r}
function repositionBoss(e,dt){
 if(e.state==='recover'&&e.timer<=.16){const y=STAGES[game.stage].y,points=[[185,-70],[565,60],[215,255],[535,250],[380,-95]].map(([x,dy])=>safePoint(arenaX(x),arenaY(y+dy),e.r));e.roamIndex=((e.roamIndex||0)+2)%points.length;e.roamTarget=points[e.roamIndex];if(distance(e,e.roamTarget)<200)e.roamTarget=points[(e.roamIndex+2)%points.length];e.state='reposition';e.roamTime=1.8;e.exposed=0;}
 if(e.state!=='reposition')return false;e.roamTime-=dt;const n=routeClear(e,e.roamTarget,e.r)?norm(e.roamTarget.x-e.x,e.roamTarget.y-e.y):routeDirection(e,e.roamTarget);const stride=({monster:260,sentinel:190,dragon:420,beast:365})[e.form]||365;moveActor(e,n.x*stride*dt,n.y*stride*dt);e.facing=n;
 if(distance(e,e.roamTarget)<25||e.roamTime<=0){e.state='chase';e.cooldown=.12}return true;
}
