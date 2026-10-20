// Short, independently replayable stages. One versioned snapshot commits rewards atomically.
const CAMPAIGN_KEY='azure-campaign-v1';
const REGIONS=[{name:'陽だまりの草原',stage:0,boss:'翠角の森王',color:'#9fdfa7',icon:'♣',hint:'広い足場と、斬り倒しやすい群れ',hp:1500},{name:'翡翠の水路',stage:1,boss:'蒼潮の番人',color:'#83d9ee',icon:'≈',hint:'橋と水路で射線を見極める',hp:2100},{name:'熾火の火山',stage:6,boss:'熔翼の古竜',color:'#ffb487',icon:'♨',hint:'火薬樽と炎を使い分ける',hp:2900},{name:'星霜の遺跡',stage:8,boss:'星核の守護者',color:'#c9b7ff',icon:'✦',hint:'柱の陰から反撃を狙う',hp:4200},{name:'闇の世界',stage:4,boss:'冥王ヴァルガ',color:'#dd9fff',icon:'♜',hint:'闇の門を越え、復活する魔王へ',hp:4600},{name:'天界',stage:5,boss:'創世神アストラ',color:'#fff0b5',icon:'☀',hint:'雲海の神殿。神の障壁が解ける瞬間を狙う',hp:6200}];
// Keep the historical save key; all skills can now be inherited.
const RARE_IDS=SKILLS.map(s=>s.id);
const STAGE_ICONS=['☀','≈','♣','♜','☾','◇','♨','ϟ','✦'];
const STAGE_COLORS=['#89dba6','#83cddd','#80cfae','#d3b38c','#baacff','#94e5ff','#ffb48a','#b8c7ff','#cfb8ff','#9eeaff'];
const SUPPLIES={hp:{name:'生命のポーション',short:'HPの余裕',desc:'次の挑戦の最大HP＋24。満タンで出発。',price:80,amount:24},mp:{name:'魔力のポーション',short:'MPの余裕',desc:'次の挑戦の最大MP＋10。満タンで出発。',price:65,amount:10}};
const finiteInt=(v,min=0,max=100000000)=>Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):min;
let storageAvailable=true;
function normalizeCampaign(raw){
 const c={version:1,unlocked:1,clears:{},rares:[],carry:null,carries:[],carrySlots:1,luckCharm:0,dawnUpgrade:false,ultimates:['sorai'],ultimate:'sorai',wallet:0,stock:{hp:0,mp:0},prepared:{hp:false,mp:false},selected:0,style:'azure',pending:null,lastResult:null,revision:0,finaleRevealed:false,darkRevealed:false,heavenRevealed:false,weapons:['traveler'],weapon:'traveler',suspended:null};
 if(!raw||raw.version!==1)return c;
 c.weapons=['traveler',...new Set((Array.isArray(raw.weapons)?raw.weapons:[]).filter(id=>id!=='traveler'&&WEAPONS.some(w=>w.id===id)))];c.weapon=c.weapons.includes(raw.weapon)?raw.weapon:'traveler';c.darkRevealed=raw.darkRevealed===true;c.heavenRevealed=raw.heavenRevealed===true;
 c.unlocked=finiteInt(raw.unlocked,1,REGIONS.length);c.wallet=finiteInt(raw.wallet);c.revision=finiteInt(raw.revision);c.rares=[...new Set((Array.isArray(raw.rares)?raw.rares:[]).filter(id=>RARE_IDS.includes(id)))];c.carry=c.rares.includes(raw.carry)?raw.carry:null;c.carrySlots=finiteInt(raw.carrySlots,1,3);c.luckCharm=finiteInt(raw.luckCharm,0,2);c.carries=[...new Set((Array.isArray(raw.carries)?raw.carries:c.carry?[c.carry]:[]).filter(id=>c.rares.includes(id)))].slice(0,c.carrySlots);c.carry=c.carries[0]||null;c.dawnUpgrade=raw.dawnUpgrade===true;c.ultimates=['sorai',...new Set((Array.isArray(raw.ultimates)?raw.ultimates:[]).filter(id=>id!=='sorai'&&ultimateArts().some(a=>a.id===id)))];c.ultimate=c.ultimates.includes(raw.ultimate)?raw.ultimate:'sorai';
 c.selected=finiteInt(raw.selected,0,c.unlocked-1);c.style=STYLES.some(s=>s.id===raw.style)?raw.style:'azure';
 for(const id of ['hp','mp'])c.wallet+=finiteInt(raw.stock?.[id],0,3)*SUPPLIES[id].price;
 for(let i=0;i<REGIONS.length;i++){const r=raw.clears?.[i];if(r&&Number.isFinite(r.score)&&Number.isFinite(r.time)&&['S','A','B','C','D'].includes(r.rank))c.clears[i]={score:finiteInt(r.score),time:Math.max(.01,Math.min(36000,r.time)),rank:r.rank,visits:finiteInt(r.visits,1)};}
 if(c.clears[4]||c.dawnUpgrade){c.dawnUpgrade=true;for(const id of ['nova','dawn'])if(!c.rares.includes(id))c.rares.push(id)}
 if(heavenUnlocked(c)){c.unlocked=6;c.selected=finiteInt(raw.selected,0,5)}c.suspended=normalizeRest(raw.suspended);if(c.suspended&&(c.suspended.run.region===5?!heavenUnlocked(c):c.suspended.run.region===4?!darkUnlocked(c):c.suspended.run.region===3?!finaleUnlocked(c):c.suspended.run.region>=c.unlocked))c.suspended=null;
 c.finaleRevealed=raw.finaleRevealed===true||!!c.clears[3];
 const validResult=r=>r&&Number.isInteger(r.stage)&&r.stage>=0&&r.stage<REGIONS.length&&Number.isFinite(r.score)&&Number.isFinite(r.time)&&['S','A','B','C','D'].includes(r.rank)&&typeof r.win==='boolean';
 const cleanResult=r=>({...r,score:finiteInt(r.score),time:Math.max(0,Math.min(36000,r.time)),gold:finiteInt(r.gold,0,100000),spent:finiteInt(r.spent,0,100000),bankGold:finiteInt(r.bankGold??r.gold,0,100000),kills:finiteInt(r.kills),hits:finiteInt(r.hits),perfects:finiteInt(r.perfects),hint:typeof r.hint==='string'?r.hint.slice(0,200):'次の挑戦へ。',received:typeof r.received==='string'?r.received.slice(0,150):null,newStage:Number.isInteger(r.newStage)&&r.newStage>=0&&r.newStage<REGIONS.length?r.newStage:null});
 if(validResult(raw.lastResult))c.lastResult=cleanResult(raw.lastResult);
 const q=raw.pending;if(q&&typeof q.id==='string'&&q.id.length<100&&validResult(q.result)&&q.result.win&&Array.isArray(q.offers)&&q.offers.length===4&&new Set(q.offers.map(o=>o?.id)).size===4&&q.offers.every(o=>o&&((o.kind==='rare'&&RARE_IDS.includes(o.id))||(o.kind==='supply'&&['hp','mp'].includes(o.supply))||(o.kind==='gold'&&Number.isFinite(o.amount)&&o.amount>0&&o.amount<=500))))c.pending={...q,first:q.first===true,result:cleanResult(q.result)};
 return c;
}
function loadCampaign(){const raw=readStore(CAMPAIGN_KEY);const c=normalizeCampaign(raw);if(!raw.version){try{const legacy=Number(localStorage.getItem('swordsman-best'));if(Number.isFinite(legacy)&&legacy>0)c.unlocked=Math.min(REGIONS.length,1+Math.ceil(legacy/3));if(meta.wins>0)c.unlocked=REGIONS.length;}catch{storageAvailable=false}}return c}
let campaign=loadCampaign();
selectedStyle=campaign.style;
function saveCampaign(next){
 next.version=1;next.revision=(campaign.revision||0)+1;
 try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(next));storageAvailable=true}catch{storageAvailable=false}
 campaign=next;return storageAvailable;
}
function cloneCampaign(){return JSON.parse(JSON.stringify(campaign))}
function refreshCampaign(){try{const raw=JSON.parse(localStorage.getItem(CAMPAIGN_KEY)||'null');if(raw?.version===1&&raw.revision>campaign.revision)campaign=normalizeCampaign(raw)}catch{storageAvailable=false}}
window.addEventListener('storage',e=>{if(e.key!==CAMPAIGN_KEY)return;refreshCampaign();if(game.mode==='chest')campaign.pending?openChest():showStageResult(campaign.lastResult);else if(game.mode==='stageSelect')openStageSelect()});
function saveNote(){return storageAvailable?'進行・解放した技は自動保存':'このブラウザでは保存できません。このページを閉じるまで遊べます。'}
function finaleUnlocked(c=campaign){return [0,1,2].every(i=>!!c.clears[i])||!!c.clears[3]}
function availableStage(index){return Number.isInteger(index)&&index>=0&&index<REGIONS.length&&(index===5?heavenUnlocked():index===4?darkUnlocked():index===3?finaleUnlocked():index<campaign.unlocked)}
function stageWaveSize(index,wave){const region=game.singleStage?game.region:index,role=game.singleStage?roomRole():null;const base=role===ROOM_ROLES.horde?22:role===ROOM_ROLES.elite?8:role===ROOM_ROLES.treasure?10:16;return Math.min(26,base+region*2-(wave===2?2:0))}
function stageDuration(index){return index<2?'約2〜3分':'約3〜5分'}
function stageRewardText(index){return campaign.clears[index]?'今回選んだ技から4候補・1つ継承＋40 G':'今回選んだ技から4候補・1つ継承＋150 G'}
function skillRole(s){return isAutoSkill(s)?'自動・枠不要':s.category==='passive'?'常時強化':s.kind==='heal'?'休憩用':['parry','guard','blink'].includes(s.kind)?'守り・反撃':['execute','flurry','line'].includes(s.kind)?'単体・強敵向き':s.kind==='projectile'?'遠くの敵へ':'群れ・広範囲'}
function openStageSelect(){
 game.bossScene=null;document.querySelector('.scene').classList.remove('boss-arrival','ultimate-cutin','cinematic-playing');if($('sceneSkip'))$('sceneSkip').hidden=true;$('roomExit').hidden=true;$('growthButton').hidden=true;$('battleHint').hidden=true;
 refreshCampaign();if(campaign.pending){openChest();return}if(finaleUnlocked()&&!campaign.finaleRevealed){showFinaleReveal(openStageSelect);return}if(darkUnlocked()&&!campaign.darkRevealed){openDarkReveal(openStageSelect);return}if(heavenUnlocked()&&!campaign.heavenRevealed){openHeavenReveal();return}game.mode='stageSelect';game.active=false;resetInput();
 const count=heavenUnlocked()?6:darkUnlocked()?5:finaleUnlocked()?4:3,positions=[[25,82],[75,82],[75,50],[25,50],[25,18],[75,18]],recommended=recommendedSword();
 openModal('<div class="eyebrow">冒険の地図 · '+campaign.wallet+' G</div><h2>次の目的地を選ぼう</h2><div class="world-map" aria-label="ワールドマップ"><svg viewBox="0 0 700 400" preserveAspectRatio="none" aria-hidden="true"><rect width="700" height="400" fill="#173c49"/><path d="M20 370 Q-30 180 95 80 Q240 -20 400 25 Q650 0 680 170 Q740 340 540 380Z" fill="#3b6857" stroke="#7a9870" stroke-width="6"/><path d="M290 0 Q370 100 310 190 T420 400" fill="none" stroke="#428c9b" stroke-width="26"/>'+worldRouteSvg(count,positions)+'<g fill="#294e47" stroke="#75917a" stroke-width="3"><path d="M30 220 L75 120 L130 220Z"/><path d="M420 355 L470 260 L520 355Z"/><path d="M520 80 L575 10 L630 80Z"/></g>'+mapScenery()+'</svg>'+REGIONS.slice(0,count).map((r,i)=>{const locked=!availableStage(i),done=!!campaign.clears[i];return '<button data-stage="'+i+'" class="map-node '+(locked?'unexplored':done?'cleared':'available')+'" style="left:'+positions[i][0]+'%;top:'+positions[i][1]+'%;--stage-color:'+r.color+'" '+(locked?'disabled':'')+'><i>'+ (locked?'☁':done?'✓':r.icon)+'</i><strong>'+r.name+'</strong><span>'+difficultyStars(i)+'</span><small>'+(locked?'前の舞台をクリア':done?'クリア済み':'ここから冒険')+'</small></button>'}).join('')+'</div><button id="weaponShop" class="map-shop"><b>🏪 よろずやへ</b><span>'+ (campaign.weapon==='traveler'?'おすすめ：'+recommended.name+' · '+recommended.price+' G':'装備中：'+getWeapon(campaign.weapon).name)+'</span></button>'+(campaign.suspended?'<button id="resumeExpedition" class="resume-expedition">▶ 中断から再開 · 区画 '+campaign.suspended.run.room+'</button>':'')+'<div class="map-footer"><button id="campaignCollection">技の図鑑</button><button id="campaignSettings">設定</button></div>');
 $('modal').classList.add('world-map-modal');menuNodes('[data-stage]').forEach(b=>b.onclick=()=>openPreparation(+b.dataset.stage));$('weaponShop').onclick=()=>openWeaponShop();$('campaignCollection').onclick=()=>openCollection();$('campaignSettings').onclick=openSettings;if($('resumeExpedition'))$('resumeExpedition').onclick=resumeExpedition;addAtlasPresentation();
}
function buySupply(){return false}
function startStageAttempt(index,seed){
 refreshCampaign();if(!availableStage(index)||campaign.pending||!['preparation','stageResult','stageSelect'].includes(game.mode))return false;
 const n=cloneCampaign(),carries=n.carries.slice(),prepared={...n.prepared};n.selected=index;n.suspended=null;for(const id of ['hp','mp'])if(prepared[id]&&n.stock[id]>0){n.stock[id]--;n.prepared[id]=false}else prepared[id]=false;for(const id of ['hp','mp'])n.prepared[id]=false;saveCampaign(n);
 selectedStyle=n.style;reset(seed);game.singleStage=true;game.roomRoute=makeRoomRoute();game.relic=null;game.relicOffers=[];game.weapon=campaign.weapon;game.ultimateArt=campaign.ultimate;game.fieldPotions=0;game.roomPotionCollected=false;game.restPotionUsed=false;game.region=index;game.stage=REGIONS[index].stage;game.room=1;game.waves=2;game.attemptId=Date.now().toString(36)+'-'+game.seed.toString(36)+'-'+Math.random().toString(36).slice(2,8);game.settled=false;game.damageSources={};game.chosenSkills=[];game.roomEntryKills=0;game.bossDamage=0;game.nextAttackAt=0;game.draftDeferred=0;game.targetId=null;game.restHealing=0;
 applyStyle();p.x=380;p.y=STAGES[game.stage].y+145;p.maxHp+=index*6+(prepared.hp?24:0);p.maxMp+=Math.floor(index/2)+(prepared.mp?10:0);p.hp=p.maxHp;p.mp=p.maxMp;p.power=1+index*.08;p.magicPower=p.power;p.xpNext=18;p.potions=0;p.ultimate=20;applyWeapon();
 applyCarrySkills(carries);
 game.mode='play';closeModal();buildTerrain();
 cam={x:p.x,y:p.y-view.h/(view.scale*CAMERA.depth)*((view.w<600?CAMERA.mobileAnchor:CAMERA.desktopAnchor)-.5)};game.furthest=p.y;encounter();updateUI();return true;
}
function stageResult(win){
 const gold=game.goldEarned,completion=win?1:Math.min(.95,((game.room-1)+(isBossStage()?Math.min(1,game.bossDamage/(REGIONS[game.region].hp*(game.region===4?1.8:game.region===3?1.16:1))):Math.min(1,(game.kills-game.roomEntryKills)/32)))/5),target=game.region<2?150:240;
 const parts={combat:Math.round(completion*4000),gold:gold*5,clear:win?2000:0,time:win?Math.round(clamp((target*1.5-game.time)/target,0,1)*1500):0,technique:Math.round(Math.max(0,1000-game.hitsTaken*65)+Math.min(500,game.perfects*60))};
 const score=Object.values(parts).reduce((a,b)=>a+b,0),quality=(win?55:0)+Math.round(completion*10)+(win?clamp((target*1.5-game.time)/target,0,1)*15:0)+Math.max(0,15-game.hitsTaken)+Math.min(5,game.perfects);
 return{stage:game.region,attemptId:game.attemptId,score,rank:quality>=90?'S':quality>=78?'A':quality>=65?'B':quality>=45?'C':'D',time:game.time,win,parts,gold,spent:game.goldSpent,bankGold:Math.max(0,gold-game.goldSpent-(game.bankedGold||0)),kills:game.kills,level:p.lv,perfects:game.perfects,hits:game.hitsTaken,hint:lossAdvice(),seed:game.seed};
}
function lossAdvice(){const worst=Object.entries(game.damageSources||{}).sort((a,b)=>b[1]-a[1])[0]?.[0];if(!worst)return game.blocks>8?'盾持ちの正面は硬い。背後か攻撃後を狙おう。':'技で群れをまとめて倒し、成長を重ねよう。';return ({'突進':'突進は進路の横へ。止まった直後に反撃。','弾':'射手は弾の間を抜けて接近すると倒しやすい。','残る炎':'地面に残る炎から離れ、安全な場所で戦おう。','着地':'跳躍の着地点から離れ、着地したら反撃。'})[worst]||'広がる予兆の外へ移動し、発動後に近づこう。'}
function attackLabel(attack){return ({bossDash:'突進',dash:'突進',leap:'着地',hop:'着地',mine:'残る炎',volley:'弾',fan:'弾'})[attack]||'範囲攻撃'}
function collectStageGold(){for(const d of drops)if(d.type==='coin'&&!d.collected)gainGold(d.value);drops=drops.filter(d=>['fieldPotion','bomb'].includes(d.type)&&!d.collected)}
function chestOffers(first){
 const selected=[...new Set(game.chosenSkills||[])].filter(id=>!!getSkill(id));
 const picks=shuffle(selected).slice(0,4);
 for(const id of shuffle(RARE_IDS.filter(id=>!picks.includes(id)))){if(picks.length>=4)break;picks.push(id)}
 return shuffle(picks).map(id=>({kind:'rare',id,fromRun:selected.includes(id)}));
}
function completeStageAttempt(){
 if(game.singleStage&&game.room<5){finishRoom();return true}
 if(!game.singleStage||game.settled)return false;if(game.pendingChoices>0){game.afterGrowthStage=true;game.active=false;game.mode='play';game.choiceDelay=0;openDraft();return true}game.settled=true;game.active=false;game.mode='chest';clearHostiles();collectStageGold();game.pendingChoices=0;game.offers=[];fields=[];bolts=[];scheduled=[];const first=!campaign.clears[game.region],result=stageResult(true);game.result=result;
 const n=cloneCampaign();if(game.region===4){if(!n.rares.includes('nova'))n.rares.push('nova');n.dawnUpgrade=true;if(!n.rares.includes('dawn'))n.rares.push('dawn');acquisitionToast('黎明の大剣・改 解放！','#ffe6a0')}n.pending={id:game.attemptId,result,first,offers:chestOffers(first)};saveCampaign(n);openChest();return true;
}
function rewardInfo(o){if(o.kind==='rare'){const s=getSkill(o.id);return{icon:s.icon,name:s.name,tag:REGION_SIGNATURES[campaign.pending?.result.stage??game.region]?.includes(o.id)?'地域の秘技 · 永久解放':'希少 · 永久解放',desc:s.desc,benefit:'次の挑戦に持ち込める · '+skillRole(s)}}if(o.kind==='supply'){const s=SUPPLIES[o.supply];return{icon:o.supply==='hp'?'♥':'◆',name:s.name,tag:'準備用品',desc:s.desc,benefit:'所持数＋1 · 出発前に選んで使う'}}return{icon:'◈',name:o.amount+' Gの宝袋',tag:'準備資金',desc:'新しい剣の購入に使える。',benefit:'所持ゴールド＋'+o.amount}}
function openChest(){renderInheritance()}
function claimChest(id,index){
 refreshCampaign();const q=campaign.pending;if(game.mode!=='chest'||!q||q.id!==id||!Number.isInteger(index)||!q.offers[index])return false;
 const n=cloneCampaign(),o=q.offers[index],stage=q.result.stage,prior=n.clears[stage];let received=rewardInfo(o).name;
 if(o.kind==='rare'){if(!n.rares.includes(o.id))n.rares.push(o.id);else{n.wallet+=160;received+='（所持済み：160 G）'}n.carries=[o.id,...n.carries.filter(id=>id!==o.id)].slice(0,n.carrySlots);n.carry=n.carries[0];}else if(o.kind==='supply'){n.wallet+=SUPPLIES[o.supply].price;received+='（廃止品：購入価格を返金）'}else n.wallet+=o.amount;
 n.wallet+=(q.result.bankGold??q.result.gold)+(q.first?150:40)+(q.first&&stage===4?650:0);if(q.first&&stage===4)received+=' · 神討ちの支度金 +650 G';n.unlocked=Math.max(n.unlocked,Math.min(3,stage+2));n.clears[stage]={score:Math.max(prior?.score||0,q.result.score),rank:prior&&'SABCD'.indexOf(prior.rank)<'SABCD'.indexOf(q.result.rank)?prior.rank:q.result.rank,time:Math.min(prior?.time||Infinity,q.result.time),visits:(prior?.visits||0)+1};n.lastResult={...q.result,received,first:q.first,newStage:q.first&&stage+1===campaign.unlocked&&stage<REGIONS.length-1?stage+1:null};n.pending=null;if(finaleUnlocked(n))n.unlocked=Math.max(n.unlocked,4);if(darkUnlocked(n))n.unlocked=5;if(heavenUnlocked(n))n.unlocked=6;if(n.lastResult.newStage===3&&!finaleUnlocked(n))n.lastResult.newStage=null;saveCampaign(n);acquisitionToast(rewardInfo(o).name+' 獲得！');openStageSelect();return true;
}
function finishStageLoss(){if(game.settled)return;game.settled=true;game.active=false;clearHostiles();collectStageGold();const n=cloneCampaign();n.lastResult=stageResult(false);n.wallet+=n.lastResult.bankGold??n.lastResult.gold;game.bankedGold=(game.bankedGold||0)+(n.lastResult.bankGold??n.lastResult.gold);saveCampaign(n);showStageResult(n.lastResult)}
function showStageResult(result){
 if(!result){openStageSelect();return}game.mode='stageResult';game.active=false;game.result=result;
 openModal('<div class="eyebrow">'+(result.win?'STAGE CLEAR':'RESULT')+'</div><h2>'+REGIONS[result.stage].name+'</h2><div class="score-hero"><div class="rank-badge rank-'+result.rank+'"><small>RANK</small><b>'+result.rank+'</b></div><div><small>総合スコア</small><strong>'+result.score.toLocaleString('ja-JP')+'</strong><span>'+formatTime(result.time)+' · '+result.kills+'体撃破</span></div></div>'+(result.received?'<p class="reward-received">✦ '+escapeText(result.received)+'</p>':'')+'<div class="result-summary"><span>持ち帰り '+(result.bankGold??result.gold)+' G</span><span>被弾 '+result.hits+'回</span><span>ジャスト回避 '+result.perfects+'回</span></div><p>'+ (result.win?'地図で剣を整え、次の冒険へ。':escapeText(result.hint))+'</p><button id="resultStages" class="cta">ワールドマップへ · よろずやで準備</button>');$('modal').classList.add('result-modal');$('resultStages').onclick=openStageSelect;appendBossRetry(result);compactResult();
}

function updateStageAttempt(dt){
 p.hurtHud=Math.max(0,(p.hurtHud||0)-dt);game.readySound=Math.max(0,(game.readySound||0)-dt);
 if(p.ultimate>=100&&!game.ultimateNotified){game.ultimateNotified=true;tone(1060,.15,'sine',.04);floating(p.x,p.y-115,'必殺技 準備完了','#9ceeff',true)}if(p.ultimate<100)game.ultimateNotified=false;
 if(game.phase==='waveBreak'&&!enemies.some(e=>e.hp>0)&&game.restHealing>0){p.hp=Math.min(p.maxHp,p.hp+game.restHealing);game.restHealing=0;}
}
function updateStageHUD(){
 $('roomExit').hidden=!['roomRest','exitWalk'].includes(game.phase)||game.mode!=='play';$('roomExit').textContent='✦ 装備を整える'+(game.pendingChoices?' · 成長 '+game.pendingChoices:game.relicOffers?.length?' · 秘宝あり':'');
 $('growthButton').hidden=true;$('growthButton').textContent='成長を選ぶ ×'+game.pendingChoices;
 $('battleHint').hidden=game.mode!=='play'||game.phase==='stageClear';let text='';if(game.phase==='exitWalk')text='↑ 光る門へ進むと、次の区画が始まる';else if(game.stage===0&&game.kills<3)text='敵に近づくと、自動で斬る';else if(game.stage===0&&game.skillUses===0)text='群れへ蒼月斬 · '+controlLabel('slash');else if(p.counter>0)text='反撃の好機！ 次の技が強化';else if(p.ultimate>=100)text='必殺技の準備完了 · '+controlLabel('ultimate');else if(enemies.some(e=>e.elite))text='金の冠が精鋭 · 攻撃後の隙を狙おう';else if(game.region<2&&enemies.some(e=>e.kind==='boss'&&e.bossPhase===2))text='突進を石柱へ誘い、装甲を崩そう';else if(game.region===3&&isBossStage())text='ジャスト回避で核心露出';else if(game.stage<2&&game.rolls===0&&warnings.length)text='予兆の外へ。回避は '+controlLabel('roll')+' 長押し';$('battleHint').textContent=text;
}
function openFieldGuide(){if(game.mode!=='play')return;game.mode='fieldGuide';openModal('<div class="eyebrow">今回の挑戦</div><h2>'+REGIONS[game.region].name+'</h2><p>'+(isBossStage()?game.region===3?'二体のボス。片方の攻撃後の隙を狙おう。':game.region===4?'魔王は復活する。巨大化後は核心露出を狙おう。':'ボスとの一対一。攻撃後の隙を狙おう。':'区画 '+game.room+' / 5。4つの区画を越え、5区画目でボスへ。')+'</p>'+routeStrip()+relicSummary()+'<p>'+roomRole().reward+'</p><p>蒼雷斬は残りHP最大の敵を自動追尾する剣閃。障壁中は温存。発動後の覚醒中は攻撃と移動が強化され、被ダメージは半減。</p><p>この挑戦の成長は今回限り。宝箱で解放した技は次回も持ち込めます。</p><button class="cta" id="closeFieldGuide">戦闘に戻る</button>');$('closeFieldGuide').onclick=()=>{game.mode='play';closeModal()}}
// Comfort settings and bindings are kept separate from progression.
const ACTION_KEYS={up:'w',left:'a',down:'s',right:'d',slash:'j',magic:'k',thunder:'l',roll:'Shift',ultimate:'q',potion:'h'};
const DEFAULT_BINDINGS={...ACTION_KEYS,roll:' '};
const BINDING_NAMES={up:'上',left:'左',down:'下',right:'右',slash:'技1',magic:'技2',thunder:'技3',roll:'回避',ultimate:'必殺技',potion:'回復薬'};
const normalizeKey=k=>k.length===1?k.toLowerCase():k;
preferences.shake=typeof initialSettings.shake==='boolean'?initialSettings.shake:true;preferences.flashes=typeof initialSettings.flashes==='boolean'?initialSettings.flashes:true;preferences.numbers=typeof initialSettings.numbers==='boolean'?initialSettings.numbers:true;preferences.particles=Number.isFinite(initialSettings.particles)?clamp(initialSettings.particles,.25,1):.75;preferences.shortCinematics=initialSettings.shortCinematics===true;
preferences.bindings={...DEFAULT_BINDINGS};if(initialSettings.bindings&&Object.keys(initialSettings.bindings).length>=9&&Object.keys(ACTION_KEYS).filter(id=>id!=='potion').every(id=>typeof initialSettings.bindings[id]==='string')&&new Set(Object.values(initialSettings.bindings)).size===Object.keys(initialSettings.bindings).length&&Object.values(initialSettings.bindings).every(k=>/^[a-z0-9]$/.test(k)||k==='Shift'||k===' '))preferences.bindings={...DEFAULT_BINDINGS,...initialSettings.bindings};if(Object.entries(preferences.bindings).some(([id,k])=>id!=='potion'&&k===preferences.bindings.potion))preferences.bindings.potion=['h','v','n'].find(k=>!Object.values(initialSettings.bindings).includes(k))||'h';if(preferences.bindings.roll==='Shift'&&!Object.values(preferences.bindings).includes(' ')){preferences.bindings.roll=' ';writeStore('azure-settings',preferences)}
function controlLabel(id){return preferences.bindings[id]===' '?'SPACE':preferences.bindings[id]?.toUpperCase()||id}
function boundKey(key){for(const [id,value]of Object.entries(preferences.bindings))if(key===value)return ACTION_KEYS[id];if(key==='Shift'&&preferences.bindings.roll===' ')return 'Shift';return Object.values(ACTION_KEYS).includes(key)?'Unbound':key}
function appendComfortSettings(){
 const panel=document.createElement('div');panel.className='comfort-settings';panel.innerHTML='<div class="comfort-grid">'+[['shake','画面揺れ'],['flashes','閃光'],['numbers','ダメージ数字'],['shortCinematics','演出を短縮']].map(([id,label])=>'<label><input data-comfort="'+id+'" type="checkbox" '+(preferences[id]?'checked':'')+'>'+label+'</label>').join('')+'</div><label class="setting-row">粒子の量<input id="particleAmount" type="range" min="25" max="100" value="'+preferences.particles*100+'"></label><details><summary>キーを変更する</summary><p>ボタンを押して、英数字・Space・Shiftを入力。Escで取消。重複したキーは交換。</p><div class="binding-grid">'+Object.keys(DEFAULT_BINDINGS).map(id=>'<button data-binding="'+id+'">'+BINDING_NAMES[id]+'：'+controlLabel(id)+'</button>').join('')+'</div><button id="resetBindings" class="text-button">標準に戻す</button></details>';$('modal').insertBefore(panel,$('closeSettings'));
 panel.querySelectorAll('[data-comfort]').forEach(b=>b.onchange=()=>{preferences[b.dataset.comfort]=b.checked;writeStore('azure-settings',preferences)});$('particleAmount').oninput=e=>{preferences.particles=Number(e.target.value)/100;writeStore('azure-settings',preferences)};
 panel.querySelectorAll('[data-binding]').forEach(b=>b.onclick=()=>{pendingBinding=b.dataset.binding;b.textContent='キーを入力…'});$('resetBindings').onclick=()=>{preferences.bindings={...DEFAULT_BINDINGS};writeStore('azure-settings',preferences);openSettings()};
 const help=$('modal').querySelector('.help-steps');help.innerHTML='<b>① 近づけば自動で斬る</b><span>'+['up','left','down','right'].map(controlLabel).join('・')+' / 矢印 / 左スティック</span><b>② ボスの強攻撃は予告から離れる</b><span>'+controlLabel('roll')+' / 回避を長押し。直前の成功でスロー</span><b>③ 群れや敵の隙に技を使う</b><span>'+['slash','magic','thunder'].map(controlLabel).join('・')+' / 右の技ボタン</span><b>④ 必殺技で一気に攻める</b><span>命中・撃破・見切りで充填。満タンで '+controlLabel('ultimate')+' / 必殺技</span>';const note=$('modal').querySelector('.settings-note');if(note)note.textContent='ステージごとにHP・MPは満タン。購入・持ち込み変更は出発前に。通常攻撃は自動。';
}
let pendingBinding=null;
window.addEventListener('keydown',e=>{if(!pendingBinding||game.mode!=='settings')return;e.preventDefault();e.stopImmediatePropagation();const k=normalizeKey(e.key);if(k==='Escape'){pendingBinding=null;openSettings();return}if(!/^[a-z0-9]$/.test(k)&&k!=='Shift'&&k!==' ')return;const other=Object.keys(preferences.bindings).find(id=>id!==pendingBinding&&preferences.bindings[id]===k);if(other)preferences.bindings[other]=preferences.bindings[pendingBinding];preferences.bindings[pendingBinding]=k;pendingBinding=null;writeStore('azure-settings',preferences);openSettings()},true);

function finishRoom(){
 if(['roomRest','exitWalk'].includes(game.phase))return;game.active=false;game.phase='roomRest';game.campReady=true;clearHostiles();collectStageGold();fields=[];bolts=[];scheduled=[];
 const beforeHP=p.hp,beforeMP=p.mp;const recovery=Math.round(p.maxHp*.12)+(game.restHealing||0)+(hasRelic('heart')?Math.ceil(p.maxHp*.1):0);p.hp=Math.min(p.maxHp,p.hp+recovery);p.mp=Math.min(p.maxMp,p.mp+Math.ceil(p.maxMp*.25));game.restHealing=0;
 game.lastRecovery={hp:Math.ceil(p.hp-beforeHP),mp:Math.ceil(p.mp-beforeMP)};recoveryFeedback(game.lastRecovery.hp,game.lastRecovery.mp);banner('区画クリア！','上へ進もう',1);acquisitionToast('HP・MP回復！');game.mode='play';game.draftDeferred=0;game.choiceDelay=0;resetInput();prepareRoomReward();game.phase='exitWalk';game.campReady=true;updateUI();flushLevelChoices();
}
function advanceRoom(){
 if(!game.singleStage||game.mode!=='play'||game.phase!=='roomRest'||game.active)return false;if(game.pendingChoices>0){game.choiceDelay=0;openDraft();return false}
 if(game.relicOffers?.length){game.relicOffers=[];acquisitionToast('秘宝は見送りました')}game.restPotionUsed=false;game.roomPotionCollected=false;game.room++;game.roomEntryKills=game.kills;game.wave=0;game.waves=game.room===5?1:2;game.phase='travel';game.campReady=false;game.bossPrepared=false;game.bossFallen=false;game.stageGoalDone=false;game.nextAttackAt=game.time+.5;game.spawnPlan=[];game.waveQueued=false;enemies=[];drops=[];p.x=380;p.y=STAGES[game.stage].y+145;buildTerrain();makeDecor();resetInput();cam={x:p.x,y:p.y-view.h/(view.scale*CAMERA.depth)*((view.w<600?CAMERA.mobileAnchor:CAMERA.desktopAnchor)-.5)};encounter();updateUI();return true;
}
function generateRoomTerrain(){
 groundChunks.clear();terrain=[];const y=STAGES[game.stage].y,region=game.region,boss=game.room===5;game.roomLayout=[];
 if(boss)terrain.push({kind:'water',x:35,y:y-290,w:690,h:85,solid:true});else terrain.push({kind:'wall',x:90,y:y-222,w:210,h:24,solid:true},{kind:'wall',x:460,y:y-222,w:210,h:24,solid:true});
 if(region===1){const riverY=y+runRange(-45,50),bridgeWidth=boss?250:190;terrain.push({kind:'water',x:95,y:riverY,w:285-bridgeWidth/2,h:65,solid:true},{kind:'water',x:380+bridgeWidth/2,y:riverY,w:285-bridgeWidth/2,h:65,solid:true},{kind:'bridge',x:380-bridgeWidth/2,y:riverY,w:bridgeWidth,h:65,solid:false})}
 const count=boss?2:region===0?3:5;
 for(let i=0;i<count;i++){let point=null;for(let j=0;j<45;j++){const side=i%2?-1:1,x=380+side*runRange(115,220),yy=y+runRange(-130,220),q={x,y:yy};if(distance(q,p)<95||terrain.some(t=>terrainCollision(x,yy,58,t)))continue;point=q;break}if(!point)continue;const kind=boss&&region<2?'ruin':region>=3?'crystal':region===2&&i===0?'furnace':i%3===0?'ruin':'rock';const item=['ruin','furnace'].includes(kind)?{kind,x:point.x-20,y:point.y-15,w:40,h:40,solid:true}:{kind,...point,r:runRange(22,31),solid:true};terrain.push(item);game.roomLayout.push([kind,Math.round(point.x),Math.round(point.y)]);}
 if(!boss)for(let i=0;i<(region===2?5:2);i++){const q={x:runRange(160,600),y:y+runRange(-110,180)};if(canStand(q.x,q.y,22)&&distance(q,p)>65)terrain.push({kind:'barrel',...q,r:16,solid:false,broken:false})}
 if(region===2)for(const side of [-1,1])terrain.push({kind:'lava',x:380+side*runRange(200,230),y:y+runRange(-80,120),r:runRange(26,42),solid:false});
 if(region===5){terrain=terrain.filter(t=>!['rock','crystal','furnace'].includes(t.kind));for(const x of [150,610])terrain.push({kind:'ruin',x:x-16,y:y+40,w:32,h:38,solid:true})}if(region===0&&!boss)terrain.push({kind:'shallows',x:runRange(145,235),y:y+runRange(-80,80),r:38,solid:false});
 scatterSupplies();
 flowCache=null;flowCaches.clear();walkabilityMasks.clear();decals=[];stepClock=0;
}

function escapeText(text){return String(text||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function regionEnemyKind(){const fresh=chooseNewEnemy();if(fresh)return fresh;const specialized=campaignEnemyKind();if(specialized)return specialized;const pools=[game.room===1?['slime']:['slime','slime','slime','bat'],['slime','slime','bat','archer','shield'],['slime','slime','bomber','slime','bat','shield'],['slime','slime','archer','shield','totem','bat']];const pool=pools[game.region]||['slime','bat','shield','archer','totem','bomber'];return pool[Math.floor(runRandom()*pool.length)]}

function appendDraftDetails(){
 const details=document.createElement('details');details.className='draft-details';details.innerHTML='<summary>詳しい性能・組み合わせを見る</summary>'+game.offers.map(id=>{const s=getSkill(id),rank=p.learned[id]||0,path=skillPath(id),evolution=evolutionText(s,rank),manual=isManualSkill(s);return '<section><b>'+s.icon+' '+s.name+' · '+skillRole(s)+'</b><p>'+(manual?'再使用 '+statNumber(skillCooldown(s,rank+1))+'秒 · MP '+s.mp+' · '+areaLabel(s):isAutoSkill(s)?'自動発動 · MP不要 · スロット不要':'スロット不要')+'</p>'+(evolution?'<p>'+evolution+'</p>':'')+(path?'<p>'+path.name+'系：合計 '+pathPoints(path.id)+' → '+(pathPoints(path.id)+1)+'。3段階分で '+path.small+'。6段階分で強化。</p>':'')+'</section>'}).join('');$('modal').append(details);
}

function presentRoomRest(){if(!game.active&&game.mode==='play'){game.phase='exitWalk';updateUI()}}
function showFinaleReveal(done){
 game.mode='finaleReveal';game.active=false;resetInput();
 openModal('<div class="finale-seal" aria-hidden="true">✦</div><div class="eyebrow">三つの試練、踏破</div><h2>最後の舞台が現れた</h2><div class="finale-landscape stage-landscape landscape-3"><span>✦</span><b>04</b></div><h3>星霜の遺跡</h3><p>三つの地に刻んだ勝利が、<br>閉ざされていた遺跡への道を開いた。</p><button id="finaleContinue" class="cta">新しい舞台へ</button>');
 $('modal').classList.add('finale-reveal-modal');if(preferences.shortCinematics||reduced)$('modal').classList.add('short');
 $('finaleContinue').onclick=()=>{if(game.mode!=='finaleReveal')return;const n=cloneCampaign();n.finaleRevealed=true;saveCampaign(n);tone(1040,.2,'sine',.04);done()};
 tone(220,.4,'triangle',.04);
}
