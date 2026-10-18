// Short, independently replayable stages. One versioned snapshot commits rewards atomically.
const CAMPAIGN_KEY='azure-campaign-v1';
const REGIONS=[{name:'陽だまりの草原',stage:0,boss:'翠角の森王',color:'#9fdfa7',icon:'♣',hint:'広い足場と、斬り倒しやすい群れ',hp:1500},{name:'翡翠の水路',stage:1,boss:'蒼潮の番人',color:'#83d9ee',icon:'≈',hint:'橋と水路で射線を見極める',hp:2100},{name:'熾火の火山',stage:6,boss:'熔鉄の巨兵',color:'#ffb487',icon:'♨',hint:'火薬樽と炎を使い分ける',hp:2900},{name:'星霜の遺跡',stage:8,boss:'星核の守護者',color:'#c9b7ff',icon:'✦',hint:'柱の陰から反撃を狙う',hp:3800}];
const RARE_IDS=['whirl','wave','pierce','flurry','cross','dash','chain','frost','thunder','flame','rain','meteor','tornado','quake','nova','execute','blink','parry','orbit','wisp','guard','focus'];
const STAGE_ICONS=['☀','≈','♣','♜','☾','◇','♨','ϟ','✦'];
const STAGE_COLORS=['#89dba6','#83cddd','#80cfae','#d3b38c','#baacff','#94e5ff','#ffb48a','#b8c7ff','#cfb8ff','#9eeaff'];
const SUPPLIES={hp:{name:'生命のポーション',short:'HPの余裕',desc:'次の挑戦の最大HP＋24。満タンで出発。',price:80,amount:24},mp:{name:'魔力のポーション',short:'MPの余裕',desc:'次の挑戦の最大MP＋10。満タンで出発。',price:65,amount:10}};
const finiteInt=(v,min=0,max=100000000)=>Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):min;
let storageAvailable=true;
function normalizeCampaign(raw){
 const c={version:1,unlocked:1,clears:{},rares:[],carry:null,wallet:0,stock:{hp:0,mp:0},prepared:{hp:false,mp:false},selected:0,style:'azure',pending:null,lastResult:null,revision:0,finaleRevealed:false,suspended:null};
 if(!raw||raw.version!==1)return c;
 c.unlocked=finiteInt(raw.unlocked,1,REGIONS.length);c.wallet=finiteInt(raw.wallet);c.revision=finiteInt(raw.revision);c.rares=[...new Set((Array.isArray(raw.rares)?raw.rares:[]).filter(id=>RARE_IDS.includes(id)))];c.carry=c.rares.includes(raw.carry)?raw.carry:null;
 c.selected=finiteInt(raw.selected,0,c.unlocked-1);c.style=STYLES.some(s=>s.id===raw.style)?raw.style:'azure';
 for(const id of ['hp','mp']){c.stock[id]=finiteInt(raw.stock?.[id],0,3);c.prepared[id]=raw.prepared?.[id]===true&&c.stock[id]>0;}
 for(let i=0;i<REGIONS.length;i++){const r=raw.clears?.[i];if(r&&Number.isFinite(r.score)&&Number.isFinite(r.time)&&['S','A','B','C','D'].includes(r.rank))c.clears[i]={score:finiteInt(r.score),time:Math.max(.01,Math.min(36000,r.time)),rank:r.rank,visits:finiteInt(r.visits,1)};}
 c.suspended=normalizeRest(raw.suspended);if(c.suspended&&(c.suspended.run.region===3?!finaleUnlocked(c):c.suspended.run.region>=c.unlocked))c.suspended=null;
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
function availableStage(index){return Number.isInteger(index)&&index>=0&&index<REGIONS.length&&(index===3?finaleUnlocked():index<campaign.unlocked)}
function stageWaveSize(index,wave){const region=game.singleStage?game.region:index,role=game.singleStage?roomRole():null;const base=role===ROOM_ROLES.horde?22:role===ROOM_ROLES.elite?8:role===ROOM_ROLES.treasure?10:16;return Math.min(26,base+region*2-(wave===2?2:0))}
function stageDuration(index){return index<2?'約2〜3分':'約3〜5分'}
function stageRewardText(index){return campaign.clears[index]?'未解放のレア技 / 準備用品＋40 G':'初回：この地域のレア技を優先＋150 G'}
function skillRole(s){return isAutoSkill(s)?'自動・枠不要':s.category==='passive'?'常時強化':s.kind==='heal'?'休憩用':['parry','guard','blink'].includes(s.kind)?'守り・反撃':['execute','flurry','line'].includes(s.kind)?'単体・強敵向き':s.kind==='projectile'?'遠くの敵へ':'群れ・広範囲'}
function openStageSelect(){
 document.querySelector('.scene').classList.remove('boss-arrival','ultimate-cutin');$('roomExit').hidden=true;$('growthButton').hidden=true;$('battleHint').hidden=true;
 refreshCampaign();if(campaign.pending){openChest();return}if(finaleUnlocked()&&!campaign.finaleRevealed){showFinaleReveal(openStageSelect);return}game.mode='stageSelect';game.active=false;resetInput();
 const visibleRegions=REGIONS.slice(0,finaleUnlocked()?4:3),recommended=visibleRegions.findIndex((_,i)=>availableStage(i)&&!campaign.clears[i]);
 openModal('<div class="eyebrow">蒼刃の剣士 · 短い冒険</div><h2>次の舞台を選ぼう</h2><p>やさしい順に、一つずつ。4区画を越え、5区画目のボスへ。</p><div class="campaign-summary"><b>'+visibleRegions.filter((_,i)=>campaign.clears[i]).length+' / '+visibleRegions.length+' クリア</b><span>'+campaign.wallet+' G</span><button id="campaignCollection" class="text-button">技の図鑑 '+campaign.rares.length+'/'+RARE_IDS.length+'</button><button id="campaignSettings" class="text-button">操作・設定</button></div>'+(campaign.suspended?'<button id="resumeExpedition" class="resume-expedition"><b>▶ 中断した冒険を再開</b><span>'+REGIONS[campaign.suspended.run.region].name+' · 区画 '+campaign.suspended.run.room+'クリア後 / Lv.'+campaign.suspended.player.lv+'</span></button>':'')+'<div class="stage-grid">'+visibleRegions.map((s,i)=>{const r=campaign.clears[i],locked=!availableStage(i);return '<button class="stage-card '+(locked?'locked':r?'cleared':'available')+'" data-stage="'+i+'" '+(locked?'disabled':'')+' style="--stage-color:'+s.color+'"><div class="stage-landscape landscape-'+(i%4)+'">'+regionArtwork(i)+'<span>'+s.icon+'</span><b>'+String(i+1).padStart(2,'0')+'</b></div><div class="stage-card-copy"><small>'+(locked?'未解放 · STAGE '+i+'クリアで解放':r?'✓ クリア済み':i===recommended?'▶ おすすめ':'挑戦可能')+'</small><strong>'+s.name+'</strong><span>難度 '+['★☆☆☆','★★☆☆','★★★☆','★★★★'][i]+' · '+stageDuration(i)+'</span><small>'+(locked?'次の冒険が待っている':r?'最高 '+r.rank+' · '+r.score.toLocaleString('ja-JP')+'点 · 最速 '+formatTime(r.time):stageRewardText(i))+'</small></div></button>'}).join('')+'</div>'+(!finaleUnlocked()?'<p class="finale-progress">三つの舞台を制覇すると、新たな道が開く · '+[0,1,2].filter(i=>campaign.clears[i]).length+'/3</p>':'')+'<small class="save-note">'+saveNote()+'</small>');
 $('modal').classList.add('stage-select-modal');$('modal').querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>openPreparation(Number(b.dataset.stage)));$('campaignSettings').onclick=openSettings;$('campaignCollection').onclick=()=>openCollection();if($('resumeExpedition'))$('resumeExpedition').onclick=resumeExpedition;
}
function openPreparation(index){
 refreshCampaign();if(campaign.pending){openChest();return false}if(!availableStage(index))return false;
 const next=cloneCampaign();next.selected=index;saveCampaign(next);game.mode='preparation';game.active=false;selectedStyle=campaign.style;const s=REGIONS[index],carry=getSkill(campaign.carry);
 openModal('<div class="eyebrow">STAGE '+(index+1)+' · '+stageDuration(index)+'</div><h2>'+s.name+'</h2><p>'+s.hint+'。5区画目のボスを倒すと宝箱。'+'</p><div class="prep-loadout"><b>この装備で出発しますか？</b><span>☽ 蒼月斬 ＋ '+(carry?carry.icon+' '+carry.name:'持ち込みなし')+'</span><small>必殺技は別枠。HP・MPは毎回満タン。</small></div><label class="carry-label">持ち込むレア技<select id="carrySelect"><option value="">持ち込みなし</option>'+campaign.rares.map(id=>{const s=getSkill(id);return '<option value="'+id+'" '+(id===campaign.carry?'selected':'')+'>'+s.name+' · '+skillRole(s)+'</option>'}).join('')+'</select></label><p class="carry-description">'+(carry?carry.desc:'クリア宝箱で技を解放すると、次の挑戦に一つ持ち込めます。')+'</p>'+styleButtons()+'<details class="preparation-shop"><summary>出発の準備 · '+campaign.wallet+' G</summary><p>任意の補助。購入は所持数に追加。選んだ分だけ出発時に使います。</p>'+Object.entries(SUPPLIES).map(([id,item])=>'<div class="supply-row"><label><input type="checkbox" data-prepare="'+id+'" '+(campaign.prepared[id]?'checked':'')+' '+(!campaign.stock[id]?'disabled':'')+'><b>'+item.name+' ×'+campaign.stock[id]+'</b><small>'+item.desc+'</small></label><button data-buy="'+id+'" '+(campaign.wallet<item.price||campaign.stock[id]>=3?'disabled':'')+'>'+item.price+' Gで購入</button></div>').join('')+'</details>'+(campaign.suspended?'<p class="save-note">新しく出発すると、中断中の挑戦は終了します。</p>':'')+'<button id="startStageButton" class="cta">この装備で挑戦</button><div class="prep-footer"><button id="backStages" class="text-button">ステージ選択へ</button><button id="prepSettings" class="text-button">操作・設定</button></div><small class="save-note">'+saveNote()+'</small>');
 $('modal').classList.add('preparation-modal');bindStyleButtons();document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{const n=cloneCampaign();n.style=selectedStyle;saveCampaign(n)}));
 $('carrySelect').onchange=e=>{const n=cloneCampaign();n.carry=campaign.rares.includes(e.target.value)?e.target.value:null;saveCampaign(n);openPreparation(index)};
 $('modal').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{buySupply(b.dataset.buy);openPreparation(index);$('modal').querySelector('details').open=true});
 $('modal').querySelectorAll('[data-prepare]').forEach(b=>b.onchange=()=>{const n=cloneCampaign();n.prepared[b.dataset.prepare]=b.checked&&n.stock[b.dataset.prepare]>0;saveCampaign(n)});
 $('startStageButton').onclick=()=>startStageAttempt(index);$('backStages').onclick=openStageSelect;$('prepSettings').onclick=openSettings;return true;
}
function buySupply(id){refreshCampaign();const item=SUPPLIES[id];if(game.mode!=='preparation'||!item||campaign.wallet<item.price||campaign.stock[id]>=3)return false;const n=cloneCampaign();n.wallet-=item.price;n.stock[id]++;saveCampaign(n);tone(860,.1);return true}
function startStageAttempt(index,seed){
 refreshCampaign();if(!availableStage(index)||campaign.pending||!['preparation','stageResult','stageSelect'].includes(game.mode))return false;
 const n=cloneCampaign(),carry=n.carry,prepared={...n.prepared};n.selected=index;n.suspended=null;for(const id of ['hp','mp'])if(prepared[id]&&n.stock[id]>0){n.stock[id]--;n.prepared[id]=false}else prepared[id]=false;saveCampaign(n);
 selectedStyle=n.style;reset(seed);game.singleStage=true;game.roomRoute=makeRoomRoute();game.relic=null;game.relicOffers=[];game.restPotionUsed=false;game.region=index;game.stage=REGIONS[index].stage;game.room=1;game.waves=2;game.attemptId=Date.now().toString(36)+'-'+game.seed.toString(36)+'-'+Math.random().toString(36).slice(2,8);game.settled=false;game.damageSources={};game.roomEntryKills=0;game.bossDamage=0;game.nextAttackAt=0;game.draftDeferred=0;game.targetId=null;game.restHealing=0;
 applyStyle();p.x=380;p.y=STAGES[game.stage].y+145;p.maxHp+=index*6+(prepared.hp?24:0);p.maxMp+=Math.floor(index/2)+(prepared.mp?10:0);p.hp=p.maxHp;p.mp=p.maxMp;p.power=1+index*.08;p.magicPower=p.power;p.xpNext=18;p.potions=0;p.ultimate=20;
 if(carry&&RARE_IDS.includes(carry)){p.learned[carry]=1;const s=getSkill(carry);if(isManualSkill(s))p.loadout[1]=carry;else if(s.category==='passive')s.apply();else p.autoSkillTimers[carry]=0;}
 game.mode='play';closeModal();buildTerrain();
 cam={x:p.x,y:p.y-view.h/(view.scale*CAMERA.depth)*((view.w<600?CAMERA.mobileAnchor:CAMERA.desktopAnchor)-.5)};game.furthest=p.y;encounter();updateUI();return true;
}
function stageResult(win){
 const gold=game.goldEarned,completion=win?1:Math.min(.95,((game.room-1)+(isBossStage()?Math.min(1,game.bossDamage/REGIONS[game.region].hp):Math.min(1,(game.kills-game.roomEntryKills)/32)))/5),target=game.region<2?150:240;
 const parts={combat:Math.round(completion*4000),gold:gold*5,clear:win?2000:0,time:win?Math.round(clamp((target*1.5-game.time)/target,0,1)*1500):0,technique:Math.round(Math.max(0,1000-game.hitsTaken*65)+Math.min(500,game.perfects*60))};
 const score=Object.values(parts).reduce((a,b)=>a+b,0),quality=(win?55:0)+Math.round(completion*10)+(win?clamp((target*1.5-game.time)/target,0,1)*15:0)+Math.max(0,15-game.hitsTaken)+Math.min(5,game.perfects);
 return{stage:game.region,attemptId:game.attemptId,score,rank:quality>=90?'S':quality>=78?'A':quality>=65?'B':quality>=45?'C':'D',time:game.time,win,parts,gold,spent:game.goldSpent,bankGold:Math.max(0,gold-game.goldSpent),kills:game.kills,level:p.lv,perfects:game.perfects,hits:game.hitsTaken,hint:lossAdvice(),seed:game.seed};
}
function lossAdvice(){const worst=Object.entries(game.damageSources||{}).sort((a,b)=>b[1]-a[1])[0]?.[0];if(!worst)return game.blocks>8?'盾持ちの正面は硬い。背後か攻撃後を狙おう。':'技で群れをまとめて倒し、成長を重ねよう。';return ({'突進':'突進は進路の横へ。止まった直後に反撃。','弾':'射手は弾の間を抜けて接近すると倒しやすい。','残る炎':'地面に残る炎から離れ、安全な場所で戦おう。','着地':'跳躍の着地点から離れ、着地したら反撃。'})[worst]||'広がる予兆の外へ移動し、発動後に近づこう。'}
function attackLabel(attack){return ({bossDash:'突進',dash:'突進',leap:'着地',hop:'着地',mine:'残る炎',volley:'弾',fan:'弾'})[attack]||'範囲攻撃'}
function collectStageGold(){for(const d of drops)if(d.type==='coin')gainGold(d.value);drops=[]}
function chestOffers(first){
 const signature=first?shuffle(REGION_SIGNATURES[game.region].filter(id=>!campaign.rares.includes(id))).slice(0,2):[];
 const pool=shuffle(RARE_IDS.filter(id=>!campaign.rares.includes(id)&&!signature.includes(id)));
 const fresh=[...signature,...pool].slice(0,first?4:3).map(id=>({kind:'rare',id}));
 const extras=[{kind:'supply',id:'supply-hp',supply:'hp'},{kind:'supply',id:'supply-mp',supply:'mp'},{kind:'gold',id:'gold-180',amount:180},{kind:'gold',id:'gold-220',amount:220}];
 for(const item of extras){if(fresh.length>=4)break;fresh.push(item.kind==='supply'&&campaign.stock[item.supply]>=3?{kind:'gold',id:item.id,amount:160}:item)}return shuffle(fresh);
}
function completeStageAttempt(){
 if(game.singleStage&&game.room<5){finishRoom();return true}
 if(!game.singleStage||game.settled)return false;game.settled=true;game.active=false;game.mode='chest';clearHostiles();collectStageGold();game.pendingChoices=0;game.offers=[];fields=[];bolts=[];scheduled=[];const first=!campaign.clears[game.region],result=stageResult(true);game.result=result;
 const n=cloneCampaign();n.pending={id:game.attemptId,result,first,offers:chestOffers(first)};saveCampaign(n);openChest();return true;
}
function rewardInfo(o){if(o.kind==='rare'){const s=getSkill(o.id);return{icon:s.icon,name:s.name,tag:REGION_SIGNATURES[campaign.pending?.result.stage??game.region]?.includes(o.id)?'地域の秘技 · 永久解放':'希少 · 永久解放',desc:s.desc,benefit:'次の挑戦に持ち込める · '+skillRole(s)}}if(o.kind==='supply'){const s=SUPPLIES[o.supply];return{icon:o.supply==='hp'?'♥':'◆',name:s.name,tag:'準備用品',desc:s.desc,benefit:'所持数＋1 · 出発前に選んで使う'}}return{icon:'◈',name:o.amount+' Gの宝袋',tag:'準備資金',desc:'出発前のポーション購入に使える。',benefit:'所持ゴールド＋'+o.amount}}
function openChest(){
 if(!campaign.pending){openStageSelect();return}game.mode='chest';game.active=false;const q=campaign.pending;
 openModal('<div class="chest-emblem '+(preferences.shortCinematics?'short':'')+'" aria-hidden="true"><span>✦</span><i></i></div><div class="eyebrow">STAGE '+(q.result.stage+1)+' CLEAR · '+(q.first?'初回の宝箱':'再挑戦の宝箱')+'</div><h2>次の冒険に、新しい力を。</h2><p>一つ選んで獲得。解放した技は次回も使えます。</p><div class="chest-grid">'+q.offers.map((o,i)=>{const r=rewardInfo(o);return '<button class="reward-card" data-reward="'+i+'"><small>'+r.tag+'<kbd>'+(i+1)+'</kbd></small><span>'+r.icon+'</span><strong>'+r.name+'</strong><p>'+r.desc+'</p><b>'+r.benefit+'</b></button>'}).join('')+'</div><small class="save-note">'+saveNote()+' · 選択前に閉じても宝箱を再開できます</small>');$('modal').classList.add('chest-modal');$('modal').querySelectorAll('[data-reward]').forEach(b=>b.onclick=()=>claimChest(q.id,Number(b.dataset.reward)));tone(900,.2,'sine',.03);
}
function claimChest(id,index){
 refreshCampaign();const q=campaign.pending;if(game.mode!=='chest'||!q||q.id!==id||!Number.isInteger(index)||!q.offers[index])return false;
 const n=cloneCampaign(),o=q.offers[index],stage=q.result.stage,prior=n.clears[stage];let received=rewardInfo(o).name;
 if(o.kind==='rare'){if(!n.rares.includes(o.id)){n.rares.push(o.id);if(!n.carry)n.carry=o.id}else{n.wallet+=160;received+='（解放済み：160 G）'}}else if(o.kind==='supply'){if(n.stock[o.supply]<3)n.stock[o.supply]++;else{n.wallet+=160;received+='（所持上限：160 G）'}}else n.wallet+=o.amount;
 n.wallet+=(q.result.bankGold??q.result.gold)+(q.first?150:40);n.unlocked=Math.max(n.unlocked,Math.min(3,stage+2));n.clears[stage]={score:Math.max(prior?.score||0,q.result.score),rank:prior&&'SABCD'.indexOf(prior.rank)<'SABCD'.indexOf(q.result.rank)?prior.rank:q.result.rank,time:Math.min(prior?.time||Infinity,q.result.time),visits:(prior?.visits||0)+1};n.lastResult={...q.result,received,first:q.first,newStage:q.first&&stage+1===campaign.unlocked&&stage<REGIONS.length-1?stage+1:null};n.pending=null;if(finaleUnlocked(n))n.unlocked=4;if(n.lastResult.newStage===3&&!finaleUnlocked(n))n.lastResult.newStage=null;saveCampaign(n);if(finaleUnlocked()&&!campaign.finaleRevealed)showFinaleReveal(()=>showStageResult(campaign.lastResult));else showStageResult(n.lastResult);return true;
}
function finishStageLoss(){if(game.settled)return;game.settled=true;game.active=false;clearHostiles();collectStageGold();const n=cloneCampaign();n.lastResult=stageResult(false);n.wallet+=n.lastResult.bankGold??n.lastResult.gold;saveCampaign(n);showStageResult(n.lastResult)}
function showStageResult(result){
 if(!result){openStageSelect();return}game.mode='stageResult';game.active=false;game.result=result;const r=campaign.clears[result.stage],hasNext=result.win&&result.stage<REGIONS.length-1&&availableStage(result.stage+1);
 openModal('<div class="eyebrow">STAGE '+(result.stage+1)+' · '+(result.win?'CLEAR':'RESULT')+'</div><h2>'+(result.win?'この一戦が、次の力に。':'もう一度、斬り開こう。')+'</h2><div class="score-hero"><div class="rank-badge rank-'+result.rank+'"><small>RANK</small><b>'+result.rank+'</b></div><div><small>総合スコア</small><strong>'+result.score.toLocaleString('ja-JP')+'</strong><span>'+formatTime(result.time)+' · '+result.kills+'体撃破</span></div></div>'+(result.received?'<p class="reward-received">✦ 獲得：'+escapeText(result.received)+'</p>':'')+(result.newStage!==null&&result.newStage!==undefined?'<p class="new-stage">STAGE '+(result.newStage+1)+'「'+REGIONS[result.newStage].name+'」解放！</p>':'')+'<p>'+escapeText(result.hint)+'</p><div class="result-summary"><span>獲得 '+result.gold+' G</span>'+(result.spent?'<span>回復に使用 '+result.spent+' G</span>':'')+(result.win?'<span>クリア報酬 ＋'+(result.first?150:40)+' G</span>':'')+'<span>被弾 '+result.hits+'回</span><span>ジャスト回避 '+result.perfects+'回</span></div><small>このステージの最高 '+(r?r.rank+' · '+r.score+'点 · 最速 '+formatTime(r.time):'未クリア')+'<br>購入で使ったゴールドはスコアから引かれません。<br>タイムは選択・休憩・一時停止を除く実戦時間です。</small>'+(hasNext?'<button class="cta" id="nextStage">次のステージの準備へ</button>':'')+'<button class="'+(hasNext?'text-button':'cta')+'" id="retryStage">同じステージに再挑戦</button><button class="text-button" id="resultStages">ステージ選択へ</button><small class="save-note">'+saveNote()+'</small>');$('modal').classList.add('result-modal');if($('nextStage'))$('nextStage').onclick=()=>openPreparation(result.stage+1);$('retryStage').onclick=()=>openPreparation(result.stage);$('resultStages').onclick=openStageSelect;
}
function updateStageAttempt(dt){
 game.draftDeferred=Math.max(0,(game.draftDeferred||0)-dt);p.hurtHud=Math.max(0,(p.hurtHud||0)-dt);game.readySound=Math.max(0,(game.readySound||0)-dt);
 if(p.ultimate>=100&&!game.ultimateNotified){game.ultimateNotified=true;tone(1060,.15,'sine',.04);floating(p.x,p.y-115,'必殺技 準備完了','#9ceeff',true)}if(p.ultimate<100)game.ultimateNotified=false;
 if(game.phase==='waveBreak'&&!enemies.some(e=>e.hp>0)&&game.restHealing>0){p.hp=Math.min(p.maxHp,p.hp+game.restHealing);game.restHealing=0;}
}
function updateStageHUD(){
 $('roomExit').hidden=game.phase!=='roomRest'||game.mode!=='play';$('roomExit').textContent=game.room===4?'5区画目 · ボスへ進む':'次の区画へ · '+(game.room+1)+'/5';
 $('growthButton').hidden=!(game.pendingChoices>0&&game.draftDeferred>0&&game.mode==='play');$('growthButton').textContent='成長を選ぶ ×'+game.pendingChoices;
 $('battleHint').hidden=game.mode!=='play'||game.phase==='stageClear';let text='';if(game.stage===0&&game.kills<3)text='敵に近づくと、自動で斬る';else if(game.stage===0&&game.skillUses===0)text='群れへ蒼月斬 · '+controlLabel('slash');else if(p.counter>0)text='反撃の好機！ 次の技が強化';else if(p.ultimate>=100)text='必殺技の準備完了 · '+controlLabel('ultimate');else if(enemies.some(e=>e.elite))text='金の冠が精鋭 · 攻撃後の隙を狙おう';else if(game.region<2&&enemies.some(e=>e.kind==='boss'&&e.bossPhase===2))text='突進を石柱へ誘い、装甲を崩そう';else if(game.region===3&&isBossStage())text='ジャスト回避で核心露出';else if(game.stage<2&&game.rolls===0&&warnings.length)text='予兆の外へ。回避は '+controlLabel('roll')+' 長押し';$('battleHint').textContent=text;
}
function openFieldGuide(){if(game.mode!=='play')return;game.mode='fieldGuide';openModal('<div class="eyebrow">今回の挑戦</div><h2>'+REGIONS[game.region].name+'</h2><p>'+(isBossStage()?'ボスとの一対一。攻撃後の隙を狙おう。':'区画 '+game.room+' / 5。4つの区画を越え、5区画目でボスへ。')+'</p>'+routeStrip()+relicSummary()+'<p>'+roomRole().reward+'</p><p>必殺ゲージは命中・撃破・ジャスト回避で増加。覚醒中は攻撃と移動が強化され、被ダメージは半減。</p><p>この挑戦の成長は今回限り。宝箱で解放した技は次回も持ち込めます。</p><button class="cta" id="closeFieldGuide">戦闘に戻る</button>');$('closeFieldGuide').onclick=()=>{game.mode='play';closeModal()}}
// Comfort settings and bindings are kept separate from progression.
const ACTION_KEYS={up:'w',left:'a',down:'s',right:'d',slash:'j',magic:'k',thunder:'l',roll:'Shift',ultimate:'q'};
const DEFAULT_BINDINGS={...ACTION_KEYS,roll:' '};
const BINDING_NAMES={up:'上',left:'左',down:'下',right:'右',slash:'技1',magic:'技2',thunder:'技3',roll:'回避',ultimate:'必殺技'};
const normalizeKey=k=>k.length===1?k.toLowerCase():k;
preferences.shake=typeof initialSettings.shake==='boolean'?initialSettings.shake:true;preferences.flashes=typeof initialSettings.flashes==='boolean'?initialSettings.flashes:true;preferences.numbers=typeof initialSettings.numbers==='boolean'?initialSettings.numbers:true;preferences.particles=Number.isFinite(initialSettings.particles)?clamp(initialSettings.particles,.25,1):.75;preferences.shortCinematics=initialSettings.shortCinematics===true;
preferences.bindings={...DEFAULT_BINDINGS};if(initialSettings.bindings&&Object.keys(DEFAULT_BINDINGS).every(id=>typeof initialSettings.bindings[id]==='string')&&new Set(Object.values(initialSettings.bindings)).size===9&&Object.values(initialSettings.bindings).every(k=>/^[a-z0-9]$/.test(k)||k==='Shift'||k===' '))preferences.bindings={...initialSettings.bindings};if(preferences.bindings.roll==='Shift'&&!Object.values(preferences.bindings).includes(' ')){preferences.bindings.roll=' ';writeStore('azure-settings',preferences)}
function controlLabel(id){return preferences.bindings[id]===' '?'SPACE':preferences.bindings[id]?.toUpperCase()||id}
function boundKey(key){for(const [id,value]of Object.entries(preferences.bindings))if(key===value)return ACTION_KEYS[id];if(key==='Shift'&&preferences.bindings.roll===' ')return 'Shift';return Object.values(ACTION_KEYS).includes(key)?'Unbound':key}
function appendComfortSettings(){
 const panel=document.createElement('div');panel.className='comfort-settings';panel.innerHTML='<div class="comfort-grid">'+[['shake','画面揺れ'],['flashes','閃光'],['numbers','ダメージ数字'],['shortCinematics','演出を短縮']].map(([id,label])=>'<label><input data-comfort="'+id+'" type="checkbox" '+(preferences[id]?'checked':'')+'>'+label+'</label>').join('')+'</div><label class="setting-row">粒子の量<input id="particleAmount" type="range" min="25" max="100" value="'+preferences.particles*100+'"></label><details><summary>キーを変更する</summary><p>ボタンを押して、英数字・Space・Shiftを入力。Escで取消。重複したキーは交換。</p><div class="binding-grid">'+Object.keys(DEFAULT_BINDINGS).map(id=>'<button data-binding="'+id+'">'+BINDING_NAMES[id]+'：'+controlLabel(id)+'</button>').join('')+'</div><button id="resetBindings" class="text-button">標準に戻す</button></details>';$('modal').insertBefore(panel,$('closeSettings'));
 panel.querySelectorAll('[data-comfort]').forEach(b=>b.onchange=()=>{preferences[b.dataset.comfort]=b.checked;writeStore('azure-settings',preferences)});$('particleAmount').oninput=e=>{preferences.particles=Number(e.target.value)/100;writeStore('azure-settings',preferences)};
 panel.querySelectorAll('[data-binding]').forEach(b=>b.onclick=()=>{pendingBinding=b.dataset.binding;b.textContent='キーを入力…'});$('resetBindings').onclick=()=>{preferences.bindings={...DEFAULT_BINDINGS};writeStore('azure-settings',preferences);openSettings()};
 const help=$('modal').querySelector('.help-steps');help.innerHTML='<b>① 近づけば自動で斬る</b><span>'+['up','left','down','right'].map(controlLabel).join('・')+' / 矢印 / 左スティック</span><b>② 薄い予兆が満ちる前に離れる</b><span>'+controlLabel('roll')+' / 回避を長押し。直前の成功でスロー</span><b>③ 群れや敵の隙に技を使う</b><span>'+['slash','magic','thunder'].map(controlLabel).join('・')+' / 右の技ボタン</span><b>④ 必殺技で一気に攻める</b><span>命中・撃破・見切りで充填。満タンで '+controlLabel('ultimate')+' / 必殺技</span>';const note=$('modal').querySelector('.settings-note');if(note)note.textContent='ステージごとにHP・MPは満タン。購入・持ち込み変更は出発前に。通常攻撃は自動。';
}
let pendingBinding=null;
window.addEventListener('keydown',e=>{if(!pendingBinding||game.mode!=='settings')return;e.preventDefault();e.stopImmediatePropagation();const k=normalizeKey(e.key);if(k==='Escape'){pendingBinding=null;openSettings();return}if(!/^[a-z0-9]$/.test(k)&&k!=='Shift'&&k!==' ')return;const other=Object.keys(preferences.bindings).find(id=>id!==pendingBinding&&preferences.bindings[id]===k);if(other)preferences.bindings[other]=preferences.bindings[pendingBinding];preferences.bindings[pendingBinding]=k;pendingBinding=null;writeStore('azure-settings',preferences);openSettings()},true);

function finishRoom(){
 if(game.phase==='roomRest')return;game.active=false;game.phase='roomRest';game.campReady=true;clearHostiles();collectStageGold();fields=[];bolts=[];scheduled=[];
 const recovery=Math.round(p.maxHp*.12)+(game.restHealing||0)+(hasRelic('heart')?Math.ceil(p.maxHp*.1):0);p.hp=Math.min(p.maxHp,p.hp+recovery);p.mp=Math.min(p.maxMp,p.mp+Math.ceil(p.maxMp*.25));game.restHealing=0;
 banner('区画 '+game.room+' CLEAR','HP・MP回復。装備を確認して次へ。',1);game.mode='play';game.draftDeferred=0;game.choiceDelay=0;resetInput();prepareRoomReward();presentRoomRest();updateUI();
}
function advanceRoom(){
 if(!game.singleStage||game.mode!=='play'||game.phase!=='roomRest'||game.active)return false;if(game.pendingChoices>0){game.draftDeferred=0;openDraft();return false}
 if(game.relicOffers?.length){roomEquipment();return false}game.restPotionUsed=false;game.room++;game.roomEntryKills=game.kills;game.wave=0;game.waves=game.room===5?1:2;game.phase='travel';game.campReady=false;game.bossPrepared=false;game.bossFallen=false;game.stageGoalDone=false;game.nextAttackAt=game.time+.5;game.spawnPlan=[];game.waveQueued=false;enemies=[];p.x=380;p.y=STAGES[game.stage].y+145;buildTerrain();makeDecor();resetInput();cam={x:p.x,y:p.y-view.h/(view.scale*CAMERA.depth)*((view.w<600?CAMERA.mobileAnchor:CAMERA.desktopAnchor)-.5)};encounter();updateUI();return true;
}
function roomEquipment(focusSlot=null){
 const previousScroll=$('modal').scrollTop;
 if(game.phase!=='roomRest'||game.active)return;if(game.pendingChoices>0){presentRoomRest();return}game.mode='roomEquipment';const learned=SKILLS.filter(s=>p.learned[s.id]&&isManualSkill(s)),needsRelic=!!game.relicOffers?.length;
 openModal('<div class="eyebrow">'+roomRole().name+' · 区画 '+game.room+' CLEAR</div><h2>区画クリア！</h2>'+routeStrip()+'<div class="rest-vitals"><span>♥ HP <b>'+Math.ceil(p.hp)+' / '+p.maxHp+'</b></span><span>◆ MP <b>'+Math.floor(p.mp)+' / '+p.maxMp+'</b></span><small>回復済み · 休憩中はタイム停止</small></div>'+relicChoiceHTML()+relicSummary()+'<p>装備を変更しますか？ そのままでも進めます。</p><div class="equipment-list">'+p.loadout.map((id,i)=>'<label style="--slot-color:'+SLOT_COLORS[i]+'"><kbd>'+controlLabel(SLOT_NAMES[i])+'</kbd><select data-room-slot="'+i+'"><option value="">未装備</option>'+learned.map(s=>'<option value="'+s.id+'" '+(id===s.id?'selected':'')+'>'+s.name+' Lv.'+p.learned[s.id]+'</option>').join('')+'</select></label>').join('')+'</div>'+automaticSummary()+(p.learned.heal?'<button id="roomHeal" class="text-button" '+(p.mp<6||p.hp>=p.maxHp?'disabled':'')+'>癒しの光で回復 · MP 6</button>':'')+restShopHTML()+restPreview()+'<button id="roomEquipmentDone" class="cta" '+(needsRelic?'disabled':'')+'>'+(needsRelic?'上の4つから秘宝を選ぼう':game.room===4?'この装備でボスへ':'この装備で'+roomRole(game.room+1).name+'へ')+'</button><div class="prep-footer"><button id="suspendExpedition" class="text-button" '+(needsRelic?'disabled':'')+'>中断して保存</button><button id="roomEquipmentBack" class="text-button">休憩に戻る</button></div><small class="save-note">'+saveNote()+'</small>',false,needsRelic?'[data-relic]':'#roomEquipmentDone');
 $('modal').classList.add('equipment-modal','rest-modal');$('modal').classList.toggle('choosing-relic',needsRelic);$('modal').querySelectorAll('[data-room-slot]').forEach(b=>b.onchange=()=>{equipSkill(b.value,Number(b.dataset.roomSlot));roomEquipment(Number(b.dataset.roomSlot))});$('modal').querySelectorAll('[data-relic]').forEach(b=>b.onclick=()=>chooseRelic(Number(b.dataset.relic)));if($('roomHeal'))$('roomHeal').onclick=()=>{p.mp-=6;castSkill(getSkill('heal'),1);roomEquipment()};$('roomEquipmentDone').onclick=()=>{if(game.relicOffers?.length)return;game.mode='play';closeModal();advanceRoom()};$('roomEquipmentBack').onclick=()=>{game.mode='play';closeModal();updateUI()};$('suspendExpedition').onclick=suspendExpedition;if($('restPotion'))$('restPotion').onclick=buyRestPotion;
 if(Number.isInteger(focusSlot))requestAnimationFrame(()=>{if(game.mode!=='roomEquipment')return;const select=$('modal').querySelector('[data-room-slot="'+focusSlot+'"]');select?.focus({preventScroll:true});$('modal').scrollTop=previousScroll});
}
function generateRoomTerrain(){
 groundChunks.clear();terrain=[];const y=STAGES[game.stage].y,region=game.region,boss=game.room===5;game.roomLayout=[];
 terrain.push({kind:'wall',x:90,y:y-222,w:210,h:24,solid:true},{kind:'wall',x:460,y:y-222,w:210,h:24,solid:true});
 if(region===1){const riverY=y+runRange(-45,50),bridgeWidth=boss?250:190;terrain.push({kind:'water',x:95,y:riverY,w:285-bridgeWidth/2,h:65,solid:true},{kind:'water',x:380+bridgeWidth/2,y:riverY,w:285-bridgeWidth/2,h:65,solid:true},{kind:'bridge',x:380-bridgeWidth/2,y:riverY,w:bridgeWidth,h:65,solid:false})}
 const count=boss?2:region===0?3:5;
 for(let i=0;i<count;i++){let point=null;for(let j=0;j<45;j++){const side=i%2?-1:1,x=380+side*runRange(115,220),yy=y+runRange(-130,220),q={x,y:yy};if(distance(q,p)<95||terrain.some(t=>terrainCollision(x,yy,58,t)))continue;point=q;break}if(!point)continue;const kind=boss&&region<2?'ruin':region===3?'crystal':region===2&&i===0?'furnace':i%3===0?'ruin':'rock';const item=['ruin','furnace'].includes(kind)?{kind,x:point.x-20,y:point.y-15,w:40,h:40,solid:true}:{kind,...point,r:runRange(22,31),solid:true};terrain.push(item);game.roomLayout.push([kind,Math.round(point.x),Math.round(point.y)]);}
 if(!boss)for(let i=0;i<(region===2?5:2);i++){const q={x:runRange(160,600),y:y+runRange(-110,180)};if(canStand(q.x,q.y,22)&&distance(q,p)>65)terrain.push({kind:'barrel',...q,r:16,solid:false,broken:false})}
 if(region===2)for(const side of [-1,1])terrain.push({kind:'lava',x:380+side*runRange(200,230),y:y+runRange(-80,120),r:runRange(26,42),solid:false});
 if(region===0&&!boss)terrain.push({kind:'shallows',x:runRange(145,235),y:y+runRange(-80,80),r:38,solid:false});
 flowCache=null;flowCaches.clear();walkabilityMasks.clear();decals=[];stepClock=0;
}

function escapeText(text){return String(text||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function regionEnemyKind(){const specialized=campaignEnemyKind();if(specialized)return specialized;const pools=[game.room===1?['slime']:['slime','slime','slime','bat'],['slime','slime','bat','archer','shield'],['slime','slime','bomber','slime','bat','shield'],['slime','slime','archer','shield','totem','bat']];const pool=pools[game.region];return pool[Math.floor(runRandom()*pool.length)]}

function appendDraftDetails(){
 const details=document.createElement('details');details.className='draft-details';details.innerHTML='<summary>詳しい性能・組み合わせを見る</summary>'+game.offers.map(id=>{const s=getSkill(id),rank=p.learned[id]||0,path=skillPath(id),evolution=evolutionText(s,rank),manual=isManualSkill(s);return '<section><b>'+s.icon+' '+s.name+' · '+skillRole(s)+'</b><p>'+(manual?'再使用 '+statNumber(skillCooldown(s,rank+1))+'秒 · MP '+s.mp+' · '+areaLabel(s):isAutoSkill(s)?'自動発動 · MP不要 · スロット不要':'スロット不要')+'</p>'+(evolution?'<p>'+evolution+'</p>':'')+(path?'<p>'+path.name+'系：合計 '+pathPoints(path.id)+' → '+(pathPoints(path.id)+1)+'。3段階分で '+path.small+'。6段階分で強化。</p>':'')+'</section>'}).join('');$('modal').append(details);
}

function presentRoomRest(){
 if(game.phase!=='roomRest'||game.active||game.mode!=='play')return;
 game.choiceDelay=0;game.draftDeferred=0;
 if(game.pendingChoices>0)flushLevelChoices();else roomEquipment();
}
function showFinaleReveal(done){
 game.mode='finaleReveal';game.active=false;resetInput();
 openModal('<div class="finale-seal" aria-hidden="true">✦</div><div class="eyebrow">三つの試練、踏破</div><h2>最後の舞台が現れた</h2><div class="finale-landscape stage-landscape landscape-3"><span>✦</span><b>04</b></div><h3>星霜の遺跡</h3><p>三つの地に刻んだ勝利が、<br>閉ざされていた遺跡への道を開いた。</p><button id="finaleContinue" class="cta">新しい舞台へ</button>');
 $('modal').classList.add('finale-reveal-modal');if(preferences.shortCinematics||reduced)$('modal').classList.add('short');
 $('finaleContinue').onclick=()=>{if(game.mode!=='finaleReveal')return;const n=cloneCampaign();n.finaleRevealed=true;saveCampaign(n);tone(1040,.2,'sine',.04);done()};
 tone(220,.4,'triangle',.04);
}
