// Seventh realm and the victory transaction. Existing stage IDs and saves are retained.
function shadowUnlocked(c=campaign){return !!c.legacyShadowAccess||!!c.clears[7]||!!c.clears[6]}
function visibleRegionCount(){return templeUnlocked()?9:shadowUnlocked()?8:wastelandUnlocked()?7:heavenUnlocked()?6:darkUnlocked()?5:finaleUnlocked()?4:3}
function atlasPositions(){if(visibleRegionCount()>=7)return [[17,84],[50,84],[83,84],[17,52],[50,52],[83,52],[17,20],[50,20],[83,20]];return shadowUnlocked()?[[17,82],[83,82],[83,50],[17,50],[17,18],[83,18],[50,50]]:[[25,82],[75,82],[75,50],[25,50],[25,18],[75,18]]}
function renderVictoryResult(){
 const q=campaign.pending;if(!q)return;const result=q.result;game.mode='stageResult';game.active=false;game.result=result;
 const gold=(result.bankGold??result.gold)+(q.first?150:40)+(q.legacyBonus||0);
 openModal(`<div class="eyebrow">STAGE CLEAR · ${q.first?'初踏破':'再踏破'}</div><h2>${REGIONS[result.stage].name}</h2><div class="score-hero"><div class="rank-badge rank-${result.rank}"><small>RANK</small><b>${result.rank}</b></div><div><small>総合スコア</small><strong>${result.score.toLocaleString('ja-JP')}</strong><span>${formatTime(result.time)} · ${result.kills}体撃破</span></div></div><div class="result-summary"><span>獲得 <b>${gold.toLocaleString('ja-JP')} G</b></span><span>被弾 <b>${result.hits}回</b></span><span>ジャスト回避 <b>${result.perfects}回</b></span></div><p>この戦いで得た力を、次の旅へ。</p><button id="resultStages" class="cta">継承する力を選ぶ →</button>`);
 $('modal').classList.add('result-modal','clear-result');addEternalResult(result,q.first);$('resultStages').onclick=()=>{refreshCampaign();if(!campaign.pending)return;const n=cloneCampaign();n.pending.summarySeen=true;saveCampaign(n);renderInheritance()};
}
function weaponArtwork(w){
 const id=w.id,c=w.color,advanced=['abyss','starfall','dawn','origin','ancient'].includes(id);
 const silhouettes={origin:'M80 6L99 30L91 41L94 52L87 113L80 121L73 113L66 52L69 41L61 30Z',ancient:'M89 5L100 28L96 45L92 68L84 95L74 119H64L74 93L81 64L85 34Z',traveler:'M80 11L92 35L86 116H74L68 35Z',rapier:'M81 7L86 32L83 118H77L76 34Z',greatsword:'M80 8L106 29L99 112L89 121H71L61 112L54 29Z',ember:'M80 9L98 34L88 51L96 55L86 76L92 80L84 118H73L65 34Z',frostblade:'M80 7L100 40L88 57L94 74L84 118H74L67 75L72 56L62 40Z',echo:'M80 11L89 30L84 118H76L71 30Z',abyss:'M69 119L67 42L78 14L98 7L92 27L100 41L91 47L97 64L86 69L91 84L81 119Z',starfall:'M80 5L103 32L95 47L100 63L88 118H72L60 63L65 47L57 32Z',dawn:'M80 8L99 32L93 44L89 113L80 122L71 113L67 44L61 32Z'};
 const fill=id==='abyss'?'#14141e':id==='traveler'?'#bad4e2':c;
 let aura='';if(advanced){for(let i=0;i<3;i++)aura+=`<ellipse cx="80" cy="81" rx="${42+i*10}" ry="${64-i*5}" fill="none" stroke="${c}" stroke-width="${7-i*2}" opacity="${.16-i*.035}" transform="rotate(${i*50} 80 81)"/>`;aura='<g class="weapon-aura">'+aura+'<path d="M25 126Q38 64 52 39L44 81L72 17L69 63L110 18L99 79L135 47Q112 106 139 139" fill="none" stroke="'+c+'" opacity=".35" stroke-width="3"/></g>'}
 const blade=`<g class="blade-figure" transform="rotate(-25 80 85)"><path d="${silhouettes[id]||silhouettes.traveler}" fill="${fill}" stroke="${id==='abyss'?'#cba9f2':'#eaf6f6'}" stroke-width="1.8"/><path d="${id==='abyss'?'M94 14L85 49L86 68L78 112':'M80 24L80 110'}" fill="none" stroke="${id==='abyss'?'#b399ce':'#ffffffb3'}" stroke-width="2"/><path d="M${id==='greatsword'?48:57} 118L64 108L80 113L96 108L${id==='greatsword'?112:103} 118L95 124L80 120L65 124Z" fill="${id==='abyss'?'#39293f':'#b88d49'}" stroke="#e6c78d"/><path d="M75 123H85V146L80 153L75 146Z" fill="#2a3444" stroke="#c5a66b"/><path d="M76 128H84M76 135H84M76 142H84" stroke="#ad8d57"/>${id==='dawn'?'<circle cx="80" cy="116" r="8" fill="#fff4bd"/>':id==='starfall'?'<path d="M80 30L88 48L80 66L72 48Z" fill="#d5e7ff" stroke="#fbfbff"/>':''}</g>`;
 const twin=id==='echo'?'<g transform="translate(35 26) scale(.65)">'+blade+'</g>':'';
 return `<svg viewBox="0 0 160 160" role="presentation"><path d="M0 0H160V160H0Z" fill="#122236"/><g fill="none" stroke="${c}" opacity=".2"><circle cx="80" cy="80" r="61"/><circle cx="80" cy="80" r="49"/><path d="M10 139L137 12M29 155L155 28"/></g>${aura}${twin}${blade}<g fill="${c}"><path d="M27 33l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" opacity=".8"/><circle cx="127" cy="120" r="2"/></g></svg>`;
}
// Magic in the first form, a huge sword and muscular silhouette in the second.
function drawDemonWarrior(e,t){
 if(e.shadowLord){drawShadeRegent(e,t);return}
 ctx.save();drawDemonPresence(e,t);const large=e.awakened,pulse=Math.sin(t*2+e.phase),skin=e.shadowLord?'#49526d':'#85465c',edge=e.shadowLord?'#b7c6ef':'#da9fc2',core=e.cycle==='exposed'?'#baffdf':e.shadowLord?'#88aaff':'#ed9acd';
 ctx.translate(0,large?-15:Math.sin(t*1.8)*3);if(large)ctx.scale(1.45,1.45);
 if(!large){
  const sway=Math.sin(t*1.6)*7;path([[-32,-87],[-52+sway,-3],[-25,6],[-7,-3],[10,6],[46+sway,0],[30,-88]],'#252033',edge);path([[-17,-81],[0,-45],[19,-82],[27,0],[-28,0]],'#50305c');
  for(const side of [-1,1]){const echo=shadowAttackProgress(e),raised=e.demonCast>0&&(!e.shadowLord||echo===null||echo>.5);ctx.strokeStyle='#39273f';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(side*26,-79);ctx.lineTo(side*49,raised?-108:-57);ctx.stroke();ellipse(side*49,raised?-109:-56,7,9,skin)}
  ctx.save();ctx.translate(-61,-70);ctx.rotate(-.12);ctx.strokeStyle='#baa179';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(0,78);ctx.stroke();path([[0,-93],[14,-72],[0,-49],[-14,-72]],'#382449',edge);ellipse(0,-72,6,10,core);ctx.restore();
  if(e.demonCast>0){ctx.strokeStyle=core;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-151,42+pulse*5,13,0,0,Math.PI*2);ctx.stroke()}
 }else{
  for(const side of [-1,1]){rounded(side<0?-38:12,-39,26,43,7,'#2e283a',edge);path([[side*25,-2],[side*46,7],[side*9,7]],'#262330',edge)}
  path([[-43,-100],[-54,-78],[-32,-28],[0,-17],[33,-28],[54,-78],[41,-100]],skin,edge);
  for(const side of [-1,1]){ellipse(side*43,-84,23,22,epicGradient(side*43,-84,26,e.shadowLord?'#7b86a5':'#bd738a',skin));ellipse(side*54,-58,17,23,epicGradient(side*54,-58,25,e.shadowLord?'#6f7997':'#b0687c',skin));ellipse(side*15,-77,21,18,epicGradient(side*15,-77,24,e.shadowLord?'#8e99b8':'#ca8a9b',skin));ctx.strokeStyle='#2c2035';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(side*5,-65);ctx.lineTo(side*30,-64);ctx.moveTo(side*6,-51);ctx.lineTo(side*23,-49);ctx.stroke()}
  path([[-40,-98],[-61,-115],[-63,-88],[-80,-99],[-65,-73],[-35,-84]],'#272238',edge);path([[40,-98],[62,-115],[63,-88],[79,-99],[64,-73],[35,-84]],'#272238',edge);
  const echo=shadowAttackProgress(e),swing=e.shadowLord&&echo!==null?-.48+Math.max(0,(echo-.55)/.45)*1.15:e.demonCast>0?Math.sin(t*8)*.16:e.demonRush?(e.demonRush.dir.x>=0?1.2:-1.2):e.state==='dash'?-.5:.08+pulse*.04;ctx.save();ctx.translate(62,-45);ctx.rotate(swing);
  path([[-7,22],[-14,-124],[-1,-181],[25,-154],[30,-124],[15,-108],[22,-95],[13,-85],[18,-66],[7,22]],'#161520',edge);path([[23,-146],[10,-111],[12,-87],[4,18]],'#5f526e');path([[-27,18],[27,18],[22,28],[-23,28]],'#8e6179',edge);rounded(-4,29,8,23,2,'#33273b',edge);ctx.restore();
  ellipse(0,-57,11,16,core);path([[-6,-57],[0,-67],[6,-57],[0,-43]],'#fff0c9');
 }
 ellipse(0,-113,22,24,skin);path([[-21,-116],[-27,-143],[-13,-132],[0,-145],[13,-132],[27,-143],[21,-116]],'#252235',edge);
 for(const side of [-1,1]){path([[side*17,-128],[side*29,-153],[side*31,-132],[side*22,-116]],'#bfa6b3',edge);ellipse(side*8,-115,4,2,core)}
 path([[-8,-101],[0,-97],[8,-101]],'#160f22');ctx.restore();
}
function drawShadowZombie(e,t){
 ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=.3+.7*shadowLightAt(e.x,e.y);drawCorpseEmergence(e);const gait=Math.sin(t*(e.kind==='bat'?9:4)+e.phase),crawl=e.kind==='slime';ctx.rotate(gait*.06);if(crawl)ctx.scale(1,.7);
 ellipse(0,5,22,8,'#11111166');for(const side of [-1,1]){ctx.strokeStyle='#777';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(side*8,-22);ctx.lineTo(side*(10+gait*2),-4);ctx.lineTo(side*15,1);ctx.stroke();ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(side*11,-43);ctx.lineTo(side*28,-33+gait*3);ctx.lineTo(side*34,-39+gait*3);ctx.stroke()}
 path([[-14,-48],[-19,-20],[-8,-13],[0,-21],[10,-15],[18,-24],[12,-48]],shadowBodyColor(e,e.elite?'#303138':'#4d4f54','#766c83'),shadowBodyColor(e,'#94979c','#b5a5c4'));ellipse(2,-58,14,17,shadowBodyColor(e,'#a6a8ad','#bdacb6'));path([[-11,-65],[-5,-77],[9,-72],[16,-62],[5,-66]],'#333');ellipse(-3,-59,4,3,shadowBodyColor(e,'#17181b','#b59ca8'));ellipse(8,-59,4,3,shadowBodyColor(e,'#17181b','#b59ca8'));ctx.strokeStyle='#3a3a3a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-49);ctx.lineTo(8,-47);ctx.moveTo(-4,-52);ctx.lineTo(-3,-46);ctx.moveTo(3,-51);ctx.lineTo(4,-46);ctx.stroke();
 if(e.kind==='duelist')for(const side of [-1,1])path([[side*20,-16],[side*38,-68],[side*42,-68],[side*27,-12]],'#a3a6ad','#e3e3e8');if(e.kind==='hexer'){ctx.strokeStyle='#b6b8c1';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-46,30+i*5,9,t*.7+i*.4,0,Math.PI*1.7);ctx.stroke()}}if(e.kind==='shield')path([[-30,-54],[-45,-45],[-41,-15],[-26,-6],[-17,-22],[-18,-46]],'#555','#b5b5b5');if(['archer','totem','wraith'].includes(e.kind)){ctx.strokeStyle='#999';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(31,-74);ctx.lineTo(31,3);ctx.stroke();ellipse(31,-76,8,9,'#d0d0d0')}
 if(e.elite||e.kind==='goldSlime')path([[-12,-78],[-16,-89],[-5,-85],[0,-96],[5,-85],[16,-89],[12,-78]],'#d8d8d8','#fff');ctx.restore();
}
function demonMagicWarning(e,target,dir){
 castDemonSorcery(e,target,dir);
}
function bossAttackSpectacle(w,owner){
 if(!owner||owner.kind!=='boss')return;emitBossTheatre(w,owner);if(!w.persona&&w.attack!=='persona')combatSound(({beast:'beast-roar',monster:'tide-crash',dragon:'dragon-breath',sentinel:'stone-break',demon:'demon-blade',god:'god-verdict'})[owner.form]||'stone-break',owner.x);if(w.persona||w.attack==='persona'){emitSovereignImpact(w,owner);return}const flavor=owner.form==='demon'&&owner.awakened?'blade':owner.form,color=({beast:'#b8f4aa',monster:'#9fefff',dragon:'#ffc06a',sentinel:'#c5bbff',blade:'#e9afff',demon:'#df9aff',god:'#fff2b4'})[flavor]||'#d6c8ff';
 const cap=reduced?2:renderLoad.slow?5:8;if(effects.filter(e=>e.kind==='bossRupture').length>=cap)return;
 effects.push({...w,kind:'bossRupture',shape:w.kind,flavor,color,life:reduced?.45:1.35,max:reduced?.45:1.35,r:w.r||100,seed:Math.round(owner.id*1000)%17});particle(w.x,w.y,color,reduced?4:20,240);
 if(!reduced&&preferences.shake)shake=Math.max(shake,w.style==='doom'?8:4);
}
function drawBossRupture(e,a){
 const q=1-a,force=Math.sin(Math.min(1,q*2)*Math.PI),count=reduced?4:renderLoad.slow?10:18;ctx.save();ctx.translate(e.x,e.y);
 if(e.shape==='line'){ctx.rotate(Math.atan2(e.dir?.y??1,e.dir?.x??0));ctx.scale(Math.max(1,(e.length||350)/220),Math.max(.5,(e.width||90)/130));ctx.translate(95,0)}
 const radius=e.shape==='ring'?Math.min(570,(e.inner||100)+190):Math.min(e.r||140,240);
 // Cracks open, slabs rise, then fall and fade. They never create permanent obstacles.
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count+(e.seed||0)*.13,inner=e.shape==='ring'?(e.inner||100)+12:18,outer=inner+(radius-inner)*(.65+(i%3)*.16),x=Math.cos(angle)*outer,y=Math.sin(angle)*outer;
  ctx.strokeStyle='#0b111de0';ctx.lineWidth=2+force*5;ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);ctx.lineTo(x*.65-y*.08,y*.65+x*.08);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle=e.color;ctx.lineWidth=1+force;ctx.stroke();
  if(!reduced){const lift=Math.sin(q*Math.PI)* (14+i%4*9);path([[x-11,y-lift],[x+5,y-lift-6],[x+15,y-lift+4],[x-1,y-lift+10]],'#38404b',e.color);path([[x-11,y-lift],[x-1,y-lift+10],[x-1,y+10],[x-11,y]],'#1b2130')}
  if(e.flavor==='dragon'||e.flavor==='demon'){const h=(35+i%4*13)*Math.sin(q*Math.PI);path([[x-13,y],[x-5,y-h*.65],[x,y-h],[x+6,y-h*.42],[x+13,y]],e.flavor==='dragon'?'#ff8f4bbb':'#be86eeaa');path([[x-5,y],[x,y-h*.7],[x+6,y]],'#fff0b8bb')}
  else if(e.flavor==='monster'){const h=Math.sin(q*Math.PI)*(45+i%3*18);ctx.strokeStyle='#b7f3ffee';ctx.lineWidth=6*a+1;ctx.beginPath();ctx.moveTo(x-12,y);ctx.quadraticCurveTo(x,y-h,x+16,y-h*.3);ctx.stroke();ellipse(x+16,y-h*.3,4*a,7*a,'#d9faffbb')}
  else if(e.flavor==='beast'){path([[x-10,y],[x-5,y-38*force],[x+2,y-50*force],[x+9,y]],'#476d4b',e.color)}
  else if(e.flavor==='sentinel'){path([[x,y-65*force],[x+11,y-40*force],[x,y-9],[x-11,y-40*force]],'#8376b1',e.color)}
  else if(e.flavor==='god'){ctx.strokeStyle='#fff9dd';ctx.lineWidth=3*a;ctx.beginPath();ctx.moveTo(x,y-130*a);ctx.lineTo(x-12,y-85*a);ctx.lineTo(x+8,y-70*a);ctx.lineTo(x,y);ctx.stroke()}
 }
 ctx.globalCompositeOperation='lighter';ctx.strokeStyle=e.color;ctx.lineWidth=8*a+1;ctx.beginPath();ctx.ellipse(0,0,radius*(.6+q*.8),radius*(.4+q*.6),q*.3,0,Math.PI*2);ctx.stroke();
 if(e.flavor==='blade'){for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(0,-15,190+q*170,38+q*50,side*.65,-1.5,1.3);ctx.stroke()}}
 ctx.restore();
}
function drawBossCharging(t){
 if(reduced||!preferences.flashes)return;for(const e of enemies){if(e.kind!=='boss'||e.hp<=0)continue;const w=warnings.find(w=>w.owner===e.id&&w.life>0);if(!w)continue;const q=1-w.life/w.max,r=35+q*35;ctx.save();ctx.translate(e.x,e.y-90);ctx.globalAlpha=.25+q*.55;ctx.strokeStyle=REGIONS[game.region].color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r,r*.45,t,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3-t;ellipse(Math.cos(a)*r,Math.sin(a)*r*.7,3,6,'#fff0cf')}ctx.restore()}
}
function drawFlyingSlash(b){
 ctx.save();ctx.translate(b.x,b.y-15);ctx.rotate(Math.atan2(b.dir.y,b.dir.x));ctx.globalCompositeOperation='lighter';const half=(b.s.width||150)/2;
 for(const [width,color]of [[16,'#38a4ed55'],[7,b.s.color],[2,'#f2ffff']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(-35,-half);ctx.quadraticCurveTo(45,0,-35,half);ctx.stroke()}
 for(let i=0;i<(reduced?2:5);i++){ctx.strokeStyle='#a2eeff55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-50-i*14,-half*.7);ctx.quadraticCurveTo(10-i*14,0,-50-i*14,half*.7);ctx.stroke()}ctx.restore();
}
function drawBossProjectile(b){
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.dir.y,b.dir.x));ctx.globalCompositeOperation='lighter';ctx.strokeStyle=b.form==='dragon'?'#ffb46d':b.form==='god'?'#fff1b5':'#deafff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-19,-25);ctx.quadraticCurveTo(28,0,-19,25);ctx.stroke();ctx.strokeStyle='#fff5d9';ctx.lineWidth=2;ctx.stroke();if(!reduced)for(let i=1;i<4;i++){ctx.globalAlpha=.6-i*.12;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-19-i*7,-25-i*3);ctx.quadraticCurveTo(28-i*6,0,-19-i*7,25+i*3);ctx.stroke()}ctx.restore();
}
function drawUltimateCharge(){
 if(!(p.cutin>0)||reduced||!preferences.flashes)return;const q=1-p.cutin/(p.cutinMax||1.15),x=view.w*.5,y=view.h*.46;ctx.save();ctx.fillStyle='rgba(3,10,24,'+(.18+q*.25)+')';ctx.fillRect(0,0,view.w,view.h);ctx.strokeStyle='#bcefff';ctx.lineWidth=1+q*3;
 for(let i=0;i<12;i++){const a=i*Math.PI/6+q*.2,r=(1-q)*Math.max(view.w,view.h)*.6+15;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.65);ctx.lineTo(x+Math.cos(a)*(r+35),y+Math.sin(a)*(r+35)*.65);ctx.stroke()}ctx.restore();
}
function drawShadowMonument(o){
 const x=o.x,y=o.y;ellipse(x+5,y+8,31,14,'#11111166');prism(x-19,y-4,38,28,45,'#7d8086','#44474e','#2b2d33');path([[x-17,y-54],[x-17,y-73],[x,y-91],[x+17,y-73],[x+17,y-54]],'#777b84','#adb1b8');ctx.strokeStyle='#30333b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-78);ctx.lineTo(x,y-30);ctx.moveTo(x-11,y-64);ctx.lineTo(x+11,y-64);ctx.stroke();
}
function drawShadowMist(t){
 if(reduced)return;const y=STAGES[game.stage].y;ctx.save();for(let i=0;i<(renderLoad.slow?4:6+game.room);i++){const x=70+((i*101+t*7)%650),yy=y-200+i*72;ctx.globalAlpha=.025+realmDepth()*.022+(i%3)*.009;ellipse(x,yy,75,13,'#efefef');ellipse(x+30,yy-6,49,13,'#efefef')}ctx.restore();
}
