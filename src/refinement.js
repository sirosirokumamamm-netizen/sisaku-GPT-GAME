// Combat supplies, readable controls and late-game survival encounters.
function useCombatPotion(){
 if(game.bossScene||!game.singleStage||!['play','roomEquipment'].includes(game.mode)||game.phase==='bossIntro'||p.cutin>0||!(game.fieldPotions>0)||(game.potionLock||0)>0||p.hp<=0||p.hp>=p.maxHp&&p.mp>=p.maxMp)return false;
 const hp=Math.min(p.maxHp-p.hp,Math.ceil(p.maxHp*.35)),mp=Math.min(p.maxMp-p.mp,Math.ceil(p.maxMp*.4));game.fieldPotions--;playCue('heal');game.potionLock=.65;p.hp+=hp;p.mp+=mp;
 for(const [kind,r,life]of [['nova',95,.6],['sigil',65,1]])effects.push({kind,x:p.x,y:p.y,r,color:'#aaffd6',life,max:life});particle(p.x,p.y,'#baffdf',32,160);floating(p.x,p.y-100,'HP +'+Math.round(hp)+' / MP +'+Math.round(mp),'#c5ffe1',true);tone(880,.25,'sine',.04);game.healGlow=.8;updateUI();if(game.mode==='roomEquipment')roomEquipment();return true;
}
function updatePotionUI(){
 if(!game.singleStage)return;const b=$('combatPotion');b.setAttribute('aria-label','回復薬 '+controlLabel('potion'));b.hidden=game.mode!=='play';b.disabled=!(game.fieldPotions>0)||!!game.bossScene||(game.potionLock||0)>0||p.hp>=p.maxHp&&p.mp>=p.maxMp||game.phase==='bossIntro'||p.cutin>0;b.title=!(game.fieldPotions>0)?'回復薬はフィールドの樽から入手':p.hp>=p.maxHp&&p.mp>=p.maxMp?'HP・MPは満タン':'HP・MPを回復';const potionKey=controlLabel('potion')+':'+game.fieldPotions;if(b.dataset.potionKey!==potionKey){b.dataset.potionKey=potionKey;b.innerHTML='<kbd>'+controlLabel('potion')+'</kbd><span class="potion-count"><i class="potion-bottle" aria-hidden="true"></i><b>×'+(game.fieldPotions||0)+'</b></span>';}b.classList.toggle('needed',p.hp<p.maxHp*.45);document.querySelector('.scene').classList.toggle('potion-glow',!reduced&&preferences.flashes&&(game.healGlow||0)>0);
}
function confirmDataReset(){
 if(game.mode!=='settings')return;game.mode='resetConfirm';openModal('<h2>冒険データを初期化しますか？</h2><p>ステージ解放・技・剣・所持金・記録・中断中の冒険を削除し、最初から始めます。元には戻せません。<br>音量と操作設定は残ります。</p><button id="cancelReset" class="cta">戻る</button><button id="confirmReset" class="text-button">冒険データを削除する</button>',false,'#cancelReset');$('cancelReset').onclick=()=>{game.mode='settings';openSettings()};$('confirmReset').onclick=resetGameData;
}
function resetGameData(){
 if(game.mode!=='resetConfirm')return false;const old=campaign;if(!saveCampaign(normalizeCampaign(null))){campaign=old;openModal('<h2>初期化できませんでした</h2><p>ブラウザが保存を許可していません。データは変更せず戻ります。</p><button id="resetFailedBack" class="cta">設定へ戻る</button>');$('resetFailedBack').onclick=()=>{game.mode='settings';openSettings()};return false}
 try{localStorage.removeItem('azure-records');localStorage.removeItem('swordsman-best')}catch{}
 for(const k of Object.keys(meta))delete meta[k];for(const k of ['runs','wins','perfects','combo','score','bestTime'])meta[k]=0;reset();openStageSelect();return true;
}
function chooseNewEnemy(){
 if(game.room===1)return runRandom()<.8?'slime':'bat';
 if(!game.goldSlimePlanned&&runRandom()<rareEncounterChance()){game.goldSlimePlanned=true;return 'goldSlime'}
 if(runRandom()<.18)return ['harpy','beetle','wraith'][Math.floor(runRandom()*3)];return null;
}
function newEnemyTick(e,dt){
 if(e.kind==='goldSlime')return tickGoldenDash(e,dt);
 if(e.kind==='harpy'&&e.state==='chase'&&(distance(e,p)>170||!canStand(e.x,e.y,e.r)||!coverClear(e,p))){const n=norm(p.x-e.x,p.y-e.y);e.x=clamp(e.x+n.x*e.speed*dt,100,660);e.y=clamp(e.y+n.y*e.speed*dt,STAGES[game.stage].y-170,STAGES[game.stage].y+320)}
 if(e.kind==='wraith'&&e.state==='recover'&&e.timer<.1){const q=safePoint(p.x+(runRandom()<.5?-160:160),clampPlayerY(p.y-70),e.r);particle(e.x,e.y,'#c4d2ff',8,75);e.x=q.x;e.y=q.y;particle(e.x,e.y,'#c4d2ff',8,75)}return false;
}
function drawNewEnemy(e,t){
 const glow=e.flash>0?'#fff7d5':'#c8e9ef';ctx.save();
 if(e.kind==='harpy'){const flap=Math.sin(t*13+e.phase)*13;for(const s of [-1,1]){path([[s*7,-40],[s*40,-65+flap],[s*50,-32+flap],[s*23,-25]],'#d9d5a6','#fff2ce');path([[s*15,-28],[s*21,-4],[s*8,-10]],'#9aaeb6')}ellipse(0,-34,13,21,'#668fa3');ellipse(0,-57,12,12,glow);path([[3,-58],[24,-53],[4,-49]],'#e8b067');ellipse(3,-59,3,3,'#23333f')}
 if(e.kind==='beetle'){for(const s of [-1,1])for(let i=0;i<3;i++){ctx.strokeStyle='#c2b094';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(s*13,-28+i*10);ctx.lineTo(s*31,-20+i*12);ctx.lineTo(s*35,-9+i*11);ctx.stroke()}ellipse(0,-20,23,29,'#796c91');path([[0,-49],[17,-35],[15,-8],[0,6]],'#4e496d',glow);path([[-5,-42],[0,-72],[8,-44]],'#e4ceaa');ellipse(-9,-38,3,3,'#ffb782');ellipse(9,-38,3,3,'#ffb782')}
 if(e.kind==='wraith'){const bob=Math.sin(t*5+e.phase)*5;path([[-22,0],[-18,-47+bob],[0,-67+bob],[18,-47+bob],[22,0],[10,-8],[0,4],[-10,-8]],'#667998',glow);ellipse(0,-40+bob,13,16,'#1a2946');ellipse(-5,-42+bob,3,3,'#9cffe9');ellipse(5,-42+bob,3,3,'#9cffe9');for(const s of [-1,1])path([[s*14,-36+bob],[s*33,-18],[s*29,-3],[s*22,-22]],'#94b6bb')}
 if(e.kind==='goldSlime'){const g=ctx.createRadialGradient(-7,-25,1,0,-12,29);g.addColorStop(0,'#fff8cd');g.addColorStop(.5,'#f4cf54');g.addColorStop(1,'#a67524');ellipse(0,-15,24,24,g);path([[-14,-34],[-18,-48],[-5,-42],[0,-54],[5,-42],[18,-48],[14,-34]],'#ffe7a2','#fff7dc');ellipse(-8,-17,3,4,'#674b25');ellipse(8,-17,3,4,'#674b25');ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffed9a';ctx.fillText('超レア · 経験値大量',0,-66)}ctx.restore();
}
function demonBarrage(e,dt){
 if(demonSignature(e,dt))return;
 e.barrageClock=(e.barrageClock||0)-dt;if(e.barrageClock>0)return;e.barrageClock=1.85;e.demonCast=1.6;const center=STAGES[game.stage].y,pattern=(e.barrageIndex||0)%3;e.barrageIndex=(e.barrageIndex||0)+1;
 const warn=(kind,x,y,r,time,extra)=>warnings.push({owner:e.id,sourceX:e.x,sourceY:e.y-100,kind,x,y,r,dir:{x:0,y:1},life:time,max:time,atk:44,perfectUsed:false,attack:'barrage',...extra});
 if(pattern===0){const safeLane=clamp(Math.round((p.x-140)/120),0,4);for(let lane=0;lane<5;lane++)if(lane!==safeLane)warn('line',140+lane*120,center-210,0,1.25,{length:570,width:82,barrage:'breath'});banner('冥炎の剣雨','縦の斬撃！ 光のない通路へ',1.1)}
 else if(pattern===1){warn('circle',p.x,p.y,112,1.4,{barrage:'meteor',atk:64});for(const s of [-1,1])warn('circle',clamp(p.x+s*195,120,640),clampPlayerY(p.y-120),72,1.7,{barrage:'meteor',atk:42});banner('巨星落下','大きな影から離れよう',1)}
 else{for(let i=0;i<3;i++)warn('line',i%2?670:90,center-90+i*140,0,1+i*.3,{dir:{x:i%2?-1:1,y:0},length:580,width:58,barrage:'sweep',atk:38});banner('冥王の大剣連斬','横切る斬撃のすき間へ',1)}
}
function resolveBarrage(w){const boss=enemies.find(e=>e.id===w.owner);if(boss)bossAttackSpectacle(w,boss);hitExplosives(q=>warningContains(w,q,16),w.atk);
 effects.push({kind:'beam',x:w.sourceX??w.x,y:w.sourceY??w.y,ex:w.x,ey:w.y,color:'#d49aff',life:.28,max:.28});if(warningContains(w)&&!w.perfectUsed){game.hitSource=w.barrage==='meteor'?'着地':'範囲攻撃';takeHit(w.atk,w.x,w.y)}effects.push({...w,shape:w.kind,kind:'telegraphHit',life:w.barrage==='breath'?.6:.4,max:w.barrage==='breath'?.6:.4});
 if(w.barrage==='breath'){effects.push({...w,kind:'demonFlame',life:.85,max:.85});hazards.push({...w,life:2.2,tick:.65,protected:false,atk:24})}if(w.barrage==='meteor'){effects.push({kind:'nova',x:w.x,y:w.y,r:w.r,color:'#e8adff',life:.65,max:.65});particle(w.x,w.y,'#dfb3ff',22,240);if(!reduced&&preferences.shake)shake=Math.max(shake,4)}
}
function drawBarrageSky(t){for(const w of warnings)if(w.attack==='barrage'&&showAttackWarning(w)){
 const progress=warningProgress(w),sx=w.sourceX??w.x,sy=w.sourceY??w.y;ctx.save();ctx.strokeStyle='#e2b3ff88';ctx.lineWidth=2;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((sx+w.x)/2,Math.min(sy,w.y)-110,w.x,w.y);ctx.stroke();ctx.setLineDash([]);ellipse(sx,sy,13+Math.sin(t*16)*3,13,'#efbbffaa');
 if(w.barrage==='meteor'){const launch=Math.min(1,progress/.4),fall=Math.max(0,(progress-.4)/.6),x=sx+(w.x-sx)*launch,y=progress<.4?sy-210*launch:w.y-(1-fall)*Math.max(210,w.y-sy+210);ctx.strokeStyle='#edb9ff99';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(x+14,y-55);ctx.lineTo(x,y);ctx.stroke();ellipse(x,y,w.r*.22,w.r*.25,'#a17aab');ellipse(x-5,y-5,w.r*.13,w.r*.14,'#ffdab2')}
 else{const q=progress,owner=enemies.find(e=>e.id===w.owner);if(owner?.awakened)drawBossProjectile({x:sx+(w.x-sx)*q,y:sy+(w.y-sy)*q,dir:norm(w.x-sx,w.y-sy),form:'demon'});else ellipse(sx+(w.x-sx)*q,sy+(w.y-sy)*q,9,12,'#ffd6a2')}ctx.restore();}}


function resetSettingsButton(){const b=document.createElement('button');b.id='resetData';b.className='text-button danger-button';b.textContent='冒険データを初期化';b.onclick=confirmDataReset;return b}

function drawDemonFlame(e){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#f7736977';ctx.fillRect(-e.width/2,0,e.width,e.length);for(let i=0;i<9;i++){const y=i*e.length/9,w=e.width*(.3+.15*Math.sin(i+elapsed*12));path([[-w,y+65],[0,y-22],[w,y+65],[0,y+35]],i%2?'#ffe4abbb':'#c8a0ff99')}ctx.restore()}
