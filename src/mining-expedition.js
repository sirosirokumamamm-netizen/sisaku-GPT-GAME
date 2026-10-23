Object.assign(SIGNATURE_CHARGES,{orebreaker:.28,deepflare:.24});
// A separate endless route: stable campaign IDs, four rooms per depth, no normal clear chest.
let mineSelectedDepth=1;
function isMine(region=game.region){return !!game.singleStage&&region===MINE}
function mineDepth(){return Math.max(1,game.mineDepth||1)}
function validMineStart(depth,c=campaign){return Number.isInteger(depth)&&(depth===1||depth>=2&&depth%2===0&&depth<=c.mineProgress.highestCleared)}
function mineScale(depth=mineDepth(),room=game.room){const d=Math.max(0,depth-1);return (1+d*.45+d*d*.035)*(1+(room-1)*.035)}
function mineBossName(depth=mineDepth()){return ['晶角の穿孔獣','玄武岩の鉱王','燐光の晶霊'][(depth-1)%3]}
function addMineEntry(hub){
 const available=availableStage(MINE),b=document.createElement('button');b.id='mineEntry';b.className='map-mine';b.disabled=!available;b.innerHTML='<i>◈</i><span><b>晶窟鉱山</b><small>'+(available?'技巧石採掘 · 深度'+campaign.mineProgress.highestCleared+'踏破':'火山クリアで解放')+'</small></span>';b.onclick=()=>{mineSelectedDepth=1;openPreparation(MINE)};hub.append(b);hub.classList.add('has-mine');
}
function addMinePreparation(){
 const kit=$('modal').querySelector('.embark-kit'),highest=Math.floor(campaign.mineProgress.highestCleared/2)*2;if(!validMineStart(mineSelectedDepth))mineSelectedDepth=1;
 $('modal').querySelector('.embark-heading small').textContent='技巧石の採掘 · 4区画ごとに次の深度';$('modal').querySelector('.embark-stars').textContent='ENDLESS';const section=document.createElement('section');section.className='mine-start';section.innerHTML='<div class="mine-title-art">'+mineCaveArtwork()+'</div><h3>採掘を始める深度</h3><div class="mine-start-controls"><button id="mineFromOne" aria-pressed="'+(mineSelectedDepth===1)+'">深度1</button><label>踏破済みの偶数深度<input id="mineDepthInput" type="number" min="2" step="2" max="'+Math.max(2,highest)+'" value="'+(mineSelectedDepth===1?2:mineSelectedDepth)+'" '+(highest<2?'disabled':'')+'></label><button id="mineApplyDepth" '+(highest<2?'disabled':'')+'>ここから</button></div><p id="mineStartNote">深度'+mineSelectedDepth+'から出発。'+(highest?'深度'+highest+'までの偶数深度を指定可能。':'偶数深度を踏破すると、ここで再出発できます。')+'</p><small>技巧石は区画ごとに確保。お金は控えめ。休憩時に撤退・中断できます。</small>';kit.append(section);
 $('mineFromOne').onclick=()=>{mineSelectedDepth=1;openPreparation(MINE)};$('mineApplyDepth').onclick=()=>{const value=Number($('mineDepthInput').value);if(!validMineStart(value)){$('mineStartNote').textContent='踏破済みの偶数深度を指定してください。';return}mineSelectedDepth=value;openPreparation(MINE)};$('startStageButton').innerHTML='深度'+mineSelectedDepth+'へ採掘開始 →';
}
function startMineRun(){
 game.mineDepth=validMineStart(mineSelectedDepth)?mineSelectedDepth:1;game.mineStonesEarned=0;game.mineInitialChoices=true;game.templeDrafting=true;game.phase='mineDraft';game.active=false;game.pendingChoices=Math.min(12,2+Math.floor((mineDepth()-1)*1.5));game.choiceDelay=0;p.maxHp+=Math.min(120,(mineDepth()-1)*8);p.hp=p.maxHp;game.fieldPotions=1;openDraft();return true;
}
function mineEnemyKind(){const pool=mineDepth()<3?['slime','beetle','bat','shield']:['beetle','wraith','hexer','shield','duelist','bomber'];return pool[Math.floor(runRandom()*pool.length)]}
function decorateMineEnemy(e,index){
 const scale=mineScale();e.hp=e.maxHp=Math.round((e.kind==='shield'?68:48)*scale*(e.kind==='bat'?.75:1));e.atk=Math.round((10+(mineDepth()-1)*2.2)*(1+(game.room-1)*.015));e.speed*=1+Math.min(.4,(mineDepth()-1)*.025);e.name='晶窟の'+(e.name||'魔物');if(game.room===3&&index===0){e.elite=true;e.hp=e.maxHp=Math.round(e.hp*1.8);e.atk*=1.12}
}
function configureMineBoss(e){
 Object.assign(e,{mineBoss:true,mineVariant:(mineDepth()-1)%3,form:'sentinel',name:mineBossName(),hp:Math.round(2400*mineScale()),atk:Math.round(24+(mineDepth()-1)*3.5),r:48,speed:230,bossPhase:1,awakened:false,cycle:'assault',cycleTime:999,pattern:0,mineAttackClock:.8});e.maxHp=e.hp;Object.assign(e,safePoint(e.x,e.y,e.r));
}
function updateMineBoss(e,dt){
 e.demonCast=Math.max(0,(e.demonCast||0)-dt);if(e.state==='recover'){e.timer-=dt;e.exposed=Math.max(0,e.timer);if(e.timer<=0)e.state='chase';return true}if(bossCommitmentPending(e))return true;
 const n=norm(p.x-e.x,p.y-e.y);if(distance(e,p)>175)moveActor(e,n.x*(e.bossPhase===2?320:245)*dt,n.y*(e.bossPhase===2?320:245)*dt);e.mineAttackClock-=dt;if(e.mineAttackClock>0)return true;e.mineAttackClock=e.bossPhase===2?.55:.9;const pattern=(e.pattern++ +e.mineVariant)%4,pace=e.bossPhase===2?.82:1;
 if(pattern===0){epicWarning(e,'line',e.x,e.y,0,1*pace,{dir:n,length:750,width:135,atk:e.atk*1.15,style:'crystal'});banner('穿孔の一撃','一直線の鉱脈から横へ',.9)}
 else if(pattern===1){for(let i=0;i<3+e.mineVariant;i++)epicWarning(e,'circle',p.x+(i-1)*100,p.y+(i%2?70:-40),95,(.9+i*.22)*pace,{atk:e.atk,style:'crystal'});banner('晶石崩落','降り注ぐ結晶を見切れ',.9)}
 else if(pattern===2){epicWarning(e,'circle',e.x,e.y,215,1.1*pace,{atk:e.atk*1.25,style:'crystal'});epicWarning(e,'fan',e.x,e.y,0,1.4*pace,{dir:n,length:560,spread:.85,atk:e.atk,style:'crystal'})}
 else{const q=randomRefuge();epicWarning(e,'ring',q.x,q.y,arenaCoverRadius(q),2.1*pace,{inner:145,atk:e.atk*1.4,style:'crystal'});banner('地脈の共振','光る結晶の内側へ',1.4)}return true;
}
function grantMineRoomReward(){
 const absolute=(mineDepth()-1)*4+game.room,n=cloneCampaign(),prior=n.mineClaims[game.attemptId]||{last:0,stones:0};if(absolute<=prior.last)return false;
 const amount=Math.round((game.room===4?120:36)*(1+(mineDepth()-1)*.55)+(game.room===4?mineDepth()*12:game.room*3));n.craftStones+=amount;n.mineClaims[game.attemptId]={last:absolute,stones:prior.stones+amount};const ids=Object.keys(n.mineClaims);if(ids.length>64)delete n.mineClaims[ids[0]];if(game.room===4)n.mineProgress.highestCleared=Math.max(n.mineProgress.highestCleared,mineDepth());saveCampaign(n);game.mineStonesEarned=prior.stones+amount;
 acquisitionToast('技巧石 ＋'+amount+' · 確保済み','#b3eddc');if(game.room===4){game.fieldPotions++;banner('深度'+mineDepth()+' 踏破！',mineDepth()%2===0?'この深度から再挑戦できるようになった':'次の深度では敵が一段強くなる',2)}return true;
}
function finishMineRun(retreat=false){
 if(!isMine()||game.settled)return false;game.settled=true;game.active=false;clearHostiles();collectStageGold();const result=stageResult(false);result.mineDepth=mineDepth();result.mineStones=campaign.mineClaims[game.attemptId]?.stones||game.mineStonesEarned||0;result.retreat=retreat;result.stones=0;const n=cloneCampaign();recordMissionRun(n);n.lastResult=result;n.wallet+=result.bankGold;n.suspended=null;game.bankedGold=(game.bankedGold||0)+result.bankGold;saveCampaign(n);game.mode='mineResult';
 openModal('<header class="mine-result-heading"><small>CRYSTAL EXPEDITION</small><h2>'+(retreat?'採掘から帰還':'採掘の記録')+'</h2><p>到達 深度'+mineDepth()+' · 区画'+game.room+' / 4</p></header><div class="mine-result-rewards"><strong>技巧石 '+result.mineStones+'<small>区画ごとに確保した合計</small></strong><b>ゴールド ＋'+result.bankGold+' G</b></div><p>一度確保した技巧石は失いません。踏破済みの偶数深度から再挑戦できます。</p><button id="mineResultBack" class="cta">冒険の地図へ</button>');$('modal').classList.add('mine-result-modal');$('mineResultBack').onclick=openStageSelect;return true;
}
function addMineRestControls(){if(!isMine())return;const b=document.createElement('button');b.id='mineRetreat';b.className='text-button';b.textContent='採掘を終えて帰還 · 技巧石は確保済み';b.onclick=()=>{if(game.active||game.mode!=='roomEquipment')return;finishMineRun(true)};$('modal').append(b)}
function castMineSkill(skill,boost){
 const s={...resolvedSkill(skill),manual:true};playerArtSound(s);p.skillCasts[s.id]=(p.skillCasts[s.id]||0)+1;emitArtMotion({...s,id:s.id==='orebreaker'?'quake':'flame'});
 if(s.id==='orebreaker'){hitArea({s,x:p.x,y:p.y,face:{...p.face},boost});for(const r of [s.r*.65,s.r])effects.push({kind:'nova',x:p.x,y:p.y,r,color:s.color,life:.55,max:.55});particle(p.x,p.y,s.color,22,190)}
 else{fields.push({kind:'field',s,boost,x:p.x,y:p.y,life:s.duration,clock:0,hitTimes:{}});effects.push({kind:'nova',x:p.x,y:p.y,r:s.r,color:s.color,life:.65,max:.65})}
}
function mineCaveArtwork(){return '<svg viewBox="0 0 240 80" aria-hidden="true"><path d="M0 0H240V80H0Z" fill="#162531"/><path d="M0 0L35 33L49 12L67 42L90 5L116 23L151 0L184 37L210 15L240 0M0 80L41 56L74 80L103 59L155 80L191 50L240 80" fill="#35444b" stroke="#6d8587"/><path d="M100 73L105 41L117 26L125 41L123 73ZM144 78L148 57L160 40L169 57L167 78Z" fill="#4e9d96" stroke="#b1ecd6"/><path d="M117 33V66M160 48V72" stroke="#e5f4bc"/></svg>'}
function miningSkillArtwork(s){const ore=s.id==='orebreaker',svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160"><path d="M0 0H240V160H0Z" fill="#142536"/><circle cx="120" cy="80" r="62" fill="#294655" stroke="'+s.color+'"/><g fill="'+s.color+'" stroke="#f2f0c8" stroke-width="2">'+(ore?'<path d="M89 120L92 60L112 24L130 60L126 120ZM137 129L145 83L162 59L178 85L169 131Z"/><path d="M37 136Q113 40 211 56" fill="none" stroke-width="7"/>':'<path d="M119 25C148 65 153 47 170 88C189 142 70 158 64 104C60 80 85 68 83 45L111 78Z"/><path d="M27 124Q119 59 213 122" fill="none" stroke-width="6"/>')+'</g></svg>';return '<span class="skill-art skill-illustration" data-art-key="'+s.id+'" style="background-image:url(&quot;data:image/svg+xml,'+encodeURIComponent(svg)+'&quot;);background-size:cover" aria-hidden="true"></span>'}
function drawMineCavern(t){
 if(!isMine())return;const b=worldBounds(),y=STAGES[game.stage].y;ctx.save();ctx.fillStyle='#101d2a99';ctx.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);for(let i=0;i<12;i++){const x=(bossArenaActive()?100:95)+(bossArenaActive()?1100:570)*(i%2),yy=y-370+i*80;path([[x-32,yy+45],[x-18,yy-35],[x+4,yy-80],[x+26,yy-25],[x+35,yy+50]],'#263541','#6f858655');if(i%3===0){path([[x-5,yy+19],[x-8,yy-20],[x+5,yy-40],[x+15,yy-16],[x+12,yy+20]],'#427d81','#a5ded0');ellipse(x+6,yy-17,3,8,'#caf2cf')}}ctx.restore();
}
function drawMineBoss(e,t){
 ctx.save();ctx.translate(e.x,e.y);const bob=Math.sin(t*3)*4,c=e.flash>0?'#fff2d4':['#94d6c6','#d3b18d','#c6b8ee'][e.mineVariant];ellipse(0,8,65,25,'#0a152b99');if(e.mineVariant===0){for(const side of [-1,1]){for(let i=0;i<3;i++){ctx.strokeStyle='#9caaa2';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(side*20,-24+i*15);ctx.lineTo(side*65,-40+i*25+bob);ctx.lineTo(side*80,-16+i*25);ctx.stroke()}}ellipse(0,-38,46,56,'#3e6e6e');path([[-15,-76],[0,-149],[20,-72]],c,'#e6efc9');path([[-40,-44],[0,-75],[40,-44],[0,7]],'#2f535e',c)}
 else if(e.mineVariant===1){for(const side of [-1,1]){rounded(side<0?-73:37,-93+bob,37,95,8,'#56616a',c);rounded(side<0?-38:7,-5,31,43,7,'#414f5b',c)}path([[-40,-108],[-50,-20],[0,16],[50,-20],[40,-108],[0,-132]],'#44515e',c);path([[-19,-115],[-22,-149],[0,-163],[22,-149],[19,-115]],'#6d7372',c);ellipse(0,-61,16,25,c)}
 else{for(let i=0;i<7;i++){const a=i*Math.PI*2/7+t*.3,x=Math.cos(a)*65,yy=-65+Math.sin(a)*58;path([[x-10,yy+15],[x-8,yy-14],[x,yy-36],[x+12,yy-13],[x+10,yy+16]],'#635d89',c)}ellipse(0,-61,29,45,'#3d3a65');ellipse(0,-65,15,27,c);ellipse(0,-65,4,18,'#253047')}
 for(const x of [-14,14])ellipse(x,-94,5,4,'#fcf6cc');ctx.restore();
}
