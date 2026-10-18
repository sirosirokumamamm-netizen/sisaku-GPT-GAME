// Expedition systems. Combat stays in core.js; these rules only affect the campaign.
const ROOM_ROLES={
 approach:{name:'前哨戦',icon:'⚔',color:'#a2dfff',hint:'群れへ踏み込み、最初の力を選ぼう',reward:'経験値で成長'},
 horde:{name:'大群',icon:'≋',color:'#99ecc3',hint:'小さな敵の大群。広い技でまとめて斬ろう',reward:'小さな敵から経験値を集める'},
 elite:{name:'精鋭',icon:'♜',color:'#ffbc8e',hint:'金の冠が精鋭。攻撃後の隙を狙おう',reward:'精鋭1体につき＋60 G'},
 treasure:{name:'宝庫',icon:'✦',color:'#f4d28a',hint:'守り手を倒すと、今回限りの秘宝を選べる',reward:'秘宝を4択から獲得'},
 boss:{name:'決闘',icon:'♛',color:'#dabaff',hint:'一対一の決闘。攻撃後に大きな隙が生まれる',reward:'レア技の永久解放・次の舞台へ'}
};
const RELICS=[
 {id:'edge',name:'剣聖の紋章',icon:'⚔',color:'#9cddff',desc:'手動の技が強くなる。群れを斬る一撃を磨く。',detail:'手動技のダメージ ＋18%'},
 {id:'glass',name:'蒼晶のしずく',icon:'◆',color:'#9bdfff',desc:'MPが早く戻る。魔法を重ねたい剣士へ。',detail:'MP自動回復 ＋0.45 / 秒・最大MP ＋6'},
 {id:'feather',name:'風渡りの羽',icon:'➶',color:'#a8f4da',desc:'回避を少し早く使える。距離はそのまま。',detail:'回避の再使用 0.95秒 → 0.80秒'},
 {id:'heart',name:'旅人の灯火',icon:'♥',color:'#ffc0ae',desc:'休憩の回復量が増える。今の休憩にも有効。',detail:'区画クリア時のHP回復 最大HPの12% → 22%'},
 {id:'crown',name:'黎明の冠',icon:'♛',color:'#ffe1a1',desc:'必殺ゲージが早くたまる。覚醒をもう一度。',detail:'必殺ゲージの獲得量 ＋25%'},
 {id:'fang',name:'終焉の牙',icon:'☽',color:'#d7c2ff',desc:'弱った敵への一撃を強化。ボスの最後を押し切る。',detail:'残りHP35%以下の敵へのダメージ ＋25%'},
 {id:'ward',name:'護りの琥珀',icon:'◇',color:'#a5edbf',desc:'次の区画の開幕を守る。HPは戦闘中に回復しない。',detail:'各区画の開始時、20ダメージ分の盾を12秒付与'},
 {id:'vow',name:'紅蓮の誓い',icon:'ϟ',color:'#ffac99',desc:'攻めに賭ける秘宝。強くなるぶん、被弾に注意。',detail:'全ダメージ ＋22%・受けるダメージ ＋12%'}
];
const REGION_SIGNATURES=[['whirl','wave','orbit','parry'],['frost','chain','rain','focus'],['flame','meteor','quake','wisp'],['nova','execute','blink','tornado']];
function makeRoomRoute(){return ['approach',...shuffle(['horde','elite','treasure']),'boss']}
function roomRole(room=game.room){return ROOM_ROLES[game.roomRoute?.[room-1]]||ROOM_ROLES[room===5?'boss':room===1?'approach':['horde','elite','treasure'][room-2]]}
function hasRelic(id){return game.singleStage&&game.relic===id}
function relicDamage(e,heavy,automatic){return (hasRelic('edge')&&heavy&&!automatic?1.18:1)*(hasRelic('fang')&&e.hp/e.maxHp<=.35?1.25:1)*(hasRelic('vow')?1.22:1)}
function prepareRoomReward(){
 if(roomRole()===ROOM_ROLES.treasure&&!game.relic&&!game.relicOffers?.length)game.relicOffers=shuffle(RELICS.map(r=>r.id)).slice(0,4);
}
function chooseRelic(index){
 if(game.mode!=='roomEquipment'||game.phase!=='roomRest'||game.relic||!Number.isInteger(index))return false;
 const relic=RELICS.find(r=>r.id===game.relicOffers?.[index]);if(!relic)return false;
 game.relic=relic.id;game.relicOffers=[];
 if(relic.id==='glass'){p.maxMp+=6;p.mp=Math.min(p.maxMp,p.mp+6);p.manaRegen+=.45;}
 if(relic.id==='heart')p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*.1));
 tone(1040,.18,'sine',.035);roomEquipment();return true;
}
function relicChoiceHTML(){return game.relicOffers?.length?'<section class="relic-choice"><h3>宝庫の秘宝を一つ選ぼう</h3><p>今回の挑戦だけ有効 · スロット不要</p><div class="relic-grid">'+game.relicOffers.map((id,i)=>{const r=RELICS.find(r=>r.id===id);return '<button data-relic="'+i+'" style="--relic-color:'+r.color+'"><span>'+r.icon+'</span><strong>'+r.name+'</strong><small>'+r.desc+'</small><b>'+r.detail+'</b><kbd>'+(i+1)+'</kbd></button>'}).join('')+'</div></section>':''}
function relicSummary(){const r=RELICS.find(r=>r.id===game.relic);return r?'<div class="relic-owned" style="--relic-color:'+r.color+'"><b>'+r.icon+' '+r.name+'</b><span>'+r.detail+'</span></div>':''}
function routeStrip(){return '<ol class="expedition-route" aria-label="今回の区画構成">'+Array.from({length:5},(_,i)=>{const role=roomRole(i+1);return '<li class="'+(i+1<game.room?'done':i+1===game.room?'current':'')+'" style="--room-color:'+role.color+'"><span>'+(i+1<game.room?'✓':role.icon)+'</span><b>'+role.name+'</b><small>'+(i+1)+'/5</small></li>'}).join('')+'</ol>'}
function restPreview(){const next=roomRole(game.room+1);return '<div class="rest-next" style="--room-color:'+next.color+'"><small>次の区画 '+(game.room+1)+'/5</small><b>'+next.icon+' '+(game.room===4?REGIONS[game.region].boss:next.name)+'</b><span>'+next.hint+'</span></div>'}
function applyRoomRelic(){if(hasRelic('ward')){p.shield=Math.max(p.shield,20);p.shieldTime=12}}
function restShopHTML(){
 const needed=p.hp<p.maxHp||p.mp<p.maxMp,disabled=game.restPotionUsed||game.gold<70||!needed;
 return '<div class="rest-shop"><div><b>旅のポーション · 70 G</b><small>HPを約3割・MPを約4割回復。休憩ごとに1本。</small><span>所持 '+game.gold+' G'+(game.restPotionUsed?' · 購入済み':'')+'</span></div><button id="restPotion" '+(disabled?'disabled':'')+'>'+(!needed?'回復不要':game.restPotionUsed?'使用済み':game.gold<70?'ゴールド不足':'購入して回復')+'</button></div>';
}
function buyRestPotion(){
 if(game.mode!=='roomEquipment'||game.active||game.phase!=='roomRest'||game.restPotionUsed||game.gold<70||p.hp>=p.maxHp&&p.mp>=p.maxMp)return false;
 game.gold-=70;game.goldSpent+=70;game.restPotionUsed=true;p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*.35));p.mp=Math.min(p.maxMp,p.mp+Math.ceil(p.maxMp*.4));tone(760,.16,'sine',.03);roomEquipment();return true;
}
function decorateCampaignEnemy(e,index){
 if(e.kind==='boss')return;
 if(roomRole()===ROOM_ROLES.horde){e.hp=e.maxHp=Math.round(e.hp*.72);e.speed*=1.06;}
 if(roomRole()===ROOM_ROLES.elite&&index<1){e.elite=true;e.trait=game.wave===1?'breaker':'swift';e.name=e.trait==='breaker'?'精鋭・重撃':'精鋭・疾走';e.hp=e.maxHp=Math.round(e.hp*2.1);e.atk*=1.18;if(e.trait==='swift')e.speed*=1.2;}
}
function campaignEnemyKind(){
 const role=roomRole();
 if(role===ROOM_ROLES.horde)return runRandom()<.85?'slime':'bat';
 if(role===ROOM_ROLES.elite)return ['slime','bat','shield','archer'][Math.floor(runRandom()*(game.region===0?2:4))];
 return null;
}

// Explicit suspension only at a resolved rest; no serialization of live enemies/timers.
const REST_PLAYER_FIELDS=['hp','maxHp','mp','maxMp','xp','xpNext','lv','power','autoInterval','reach','magicPower','leech','armor','crit','critPower','manaRegen','cooldownFactor','magnet','goldBonus','killShield','justWindow','counterDuration','ultimate'];
const REST_GAME_FIELDS=['seed','rng','region','room','kills','gold','goldEarned','goldSpent','goldFraction','totalXP','time','combatTime','hitsTaken','damageTaken','damageDealt','perfects','maxCombo','rolls','skillUses','attacks','flanks','blocks','totems','eliteKills','barrels','bossPunishes','resonances','goals','drafts'];
function normalizeRest(raw){
 if(!raw||raw.version!==1||typeof raw.id!=='string'||raw.id.length>100||!raw.player||!raw.run)return null;
 const g=raw.run,v=raw.player;if(!Number.isInteger(g.region)||g.region<0||g.region>3||!Number.isInteger(g.room)||g.room<1||g.room>4||!STYLES.some(s=>s.id===raw.style))return null;
 if(!REST_PLAYER_FIELDS.every(k=>Number.isFinite(v[k])&&v[k]>=0&&v[k]<=1000000)||!REST_GAME_FIELDS.every(k=>Number.isFinite(g[k])&&g[k]>=0&&g[k]<=((k==='seed'||k==='rng')?0xffffffff:100000000)))return null;
 if(!Number.isInteger(g.seed)||!Number.isInteger(g.rng)||!Number.isInteger(v.lv))return null;
 if(v.hp<=0||v.hp>v.maxHp||v.mp>v.maxMp||v.maxMp<=0||v.maxHp<=0||v.xpNext<=0||v.lv<1||v.cooldownFactor<.1||v.autoInterval<.05)return null;
 if(!Array.isArray(raw.route)||raw.route.length!==5||raw.route[0]!=='approach'||raw.route[4]!=='boss'||new Set(raw.route.slice(1,4)).size!==3||!raw.route.slice(1,4).every(x=>['horde','elite','treasure'].includes(x)))return null;
 if(!v.learned||Object.entries(v.learned).some(([id,n])=>!getSkill(id)||!Number.isInteger(n)||n<1||n>3)||!Array.isArray(v.loadout)||v.loadout.length!==3||v.loadout.some(id=>id!==null&&(!v.learned[id]||!isManualSkill(getSkill(id))))||new Set(v.loadout.filter(Boolean)).size!==v.loadout.filter(Boolean).length)return null;
 if(raw.relic!==null&&!RELICS.some(r=>r.id===raw.relic))return null;
 return {version:1,id:raw.id,style:raw.style,route:raw.route.slice(),relic:raw.relic,restPotionUsed:raw.restPotionUsed===true,player:{...Object.fromEntries(REST_PLAYER_FIELDS.map(k=>[k,v[k]])),learned:{...v.learned},loadout:v.loadout.slice()},run:Object.fromEntries(REST_GAME_FIELDS.map(k=>[k,g[k]])),damageSources:Object.fromEntries(Object.entries(raw.damageSources||{}).filter(([k,v])=>['突進','弾','残る炎','着地','範囲攻撃','接近'].includes(k)&&Number.isFinite(v)&&v>=0))};
}
function suspendExpedition(){
 if(game.mode!=='roomEquipment'||game.pendingChoices||game.relicOffers?.length||game.active)return false;
 const record=normalizeRest({version:1,id:game.attemptId,style:game.style,route:game.roomRoute,relic:game.relic||null,restPotionUsed:game.restPotionUsed,player:{...Object.fromEntries(REST_PLAYER_FIELDS.map(k=>[k,p[k]])),learned:p.learned,loadout:p.loadout},run:Object.fromEntries(REST_GAME_FIELDS.map(k=>[k,game[k]||0])),damageSources:game.damageSources});
 if(!record)return false;const n=cloneCampaign();n.suspended=record;saveCampaign(n);
 if(!storageAvailable){roomEquipment();const note=$('modal').querySelector('.save-note');note.textContent='保存できませんでした。このまま続けられます。';return false}
 openStageSelect();return true;
}
function resumeExpedition(){
 refreshCampaign();const record=normalizeRest(campaign.suspended);if(!record||campaign.pending||!availableStage(record.run.region))return false;
 const n=cloneCampaign();n.suspended=null;saveCampaign(n);selectedStyle=record.style;reset(record.run.seed);applyStyle();Object.assign(p,record.player);p.learned={...record.player.learned};p.loadout=record.player.loadout.slice();p.build=SKILLS.filter(s=>s.category==='passive'&&p.learned[s.id]).map(s=>s.name);Object.assign(game,record.run,{singleStage:true,style:record.style,stage:REGIONS[record.run.region].stage,roomRoute:record.route,relic:record.relic,restPotionUsed:record.restPotionUsed,relicOffers:[],attemptId:record.id,damageSources:record.damageSources,settled:false,mode:'play',phase:'roomRest',active:false,campReady:true,waves:2});
 p.x=380;p.y=STAGES[game.stage].y+145;game.roomEntryKills=game.kills;buildTerrain();makeDecor();cam={x:p.x,y:p.y-220};roomEquipment();updateUI();return true;
}
function openCollection(filter='all'){
 if(!['stageSelect','collection'].includes(game.mode))return;game.mode='collection';
 const list=RARE_IDS.filter(id=>filter==='all'||(filter==='owned'?campaign.rares.includes(id):!campaign.rares.includes(id)));
 openModal('<div class="eyebrow">剣士の記録 · 永久解放</div><h2>旅のコレクション</h2><p>解放 '+campaign.rares.length+' / '+RARE_IDS.length+'。出発時に一つ持ち込めます。</p><div class="collection-tabs">'+[['all','すべて'],['owned','解放済み'],['new','未解放']].map(([id,label])=>'<button data-collection="'+id+'" aria-pressed="'+(filter===id)+'">'+label+'</button>').join('')+'</div><div class="collection-grid">'+list.map(id=>{const s=getSkill(id),owned=campaign.rares.includes(id),region=REGION_SIGNATURES.findIndex(ids=>ids.includes(id));return '<article class="'+(owned?'owned':'')+'"><span style="color:'+s.color+'">'+s.icon+'</span><strong>'+s.name+'</strong><small>'+(owned?'✓ 解放済み':'未解放')+' · '+skillRole(s)+'</small><p>'+s.desc+'</p><small>'+(region>=0?'「'+REGIONS[region].name+'」の初回宝箱で優先':'すべてのクリア宝箱で出現')+'</small></article>'}).join('')+'</div>'+(!list.length?'<p>まだありません。クリア宝箱で新しい技を選ぼう。</p>':'')+'<button id="collectionBack" class="cta">ステージ選択へ</button>');
 $('modal').classList.add('collection-modal');$('modal').querySelectorAll('[data-collection]').forEach(b=>b.onclick=()=>openCollection(b.dataset.collection));$('collectionBack').onclick=openStageSelect;
}

// A restrained floor set-piece distinguishes the room without obscuring telegraphs.
function drawExpeditionFloor(t){
 if(!game.singleStage)return;const role=roomRole(),y=STAGES[game.stage].y;ctx.save();ctx.globalAlpha=.19;ctx.strokeStyle=role.color;ctx.lineWidth=2;
 if(game.room===5){for(const r of [130,155,210]){ctx.beginPath();ctx.arc(380,y,r,0,Math.PI*2);ctx.stroke()}for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(380+Math.cos(a)*155,y+Math.sin(a)*155);ctx.lineTo(380+Math.cos(a)*210,y+Math.sin(a)*210);ctx.stroke()}}
 else if(role===ROOM_ROLES.treasure){ctx.strokeRect(330,y-55,100,110);ctx.strokeRect(343,y-42,74,84);ctx.font='40px Georgia';ctx.textAlign='center';ctx.fillStyle=role.color;ctx.fillText('✦',380,y+14)}
 else{for(const x of [180,580])for(let j=-1;j<2;j++){ctx.beginPath();ctx.moveTo(x-14,y+j*75+10);ctx.lineTo(x,y+j*75-4);ctx.lineTo(x+14,y+j*75+10);ctx.stroke()}}
 ctx.restore();
}

function regionArtwork(index){
 const skies=[['#416f9c','#c4e2b0'],['#1c527c','#78d6cf'],['#352c59','#e59169'],['#1c224a','#9183bb']][index];
 const scenery=[
  '<path d="M0 84 Q80 28 155 80 T340 68V160H0Z" fill="#3f7e68"/><path d="M0 119 Q110 50 220 105 T340 78V160H0Z" fill="#245c52"/><path d="M160 160Q110 127 191 100L202 100Q153 129 220 160" fill="#d5c696"/><g fill="#214b49"><path d="M38 30L13 112H63Z"/><path d="M298 13L265 120H330Z"/></g><g fill="#75bd80"><path d="M38 32L22 79H53Z"/><path d="M298 15L276 77H320Z"/></g>',
  '<path d="M0 80L65 42 105 90 161 36 217 88 280 30 340 75V160H0Z" fill="#326f7a"/><path d="M105 90Q235 105 135 160H280Q326 122 165 90" fill="#7bd4d9"/><path d="M0 120H340V142H0Z" fill="#697e88"/><path d="M34 160V137Q60 101 86 137V160M132 160V137Q158 101 184 137V160M230 160V137Q256 101 282 137V160" fill="#254e65"/><path d="M0 117H340" stroke="#d6d4b5" stroke-width="6"/>',
  '<path d="M0 125L73 60 120 91 191 27 259 96 303 71 340 110V160H0Z" fill="#493d57"/><path d="M191 27L171 50 183 46 192 55 202 44 214 49Z" fill="#ffcb83"/><path d="M191 55L183 83 201 111 187 160H219L214 115 199 83 202 44" fill="#f38955"/><path d="M0 153L51 120 94 160M253 160L291 118 340 140V160" fill="#2f3048"/><path d="M192 19Q168 2 199 -14" fill="none" stroke="#bc8094" stroke-width="16" opacity=".4"/>',
  '<path d="M0 114L75 81 148 117 254 74 340 107V160H0Z" fill="#3c426b"/><path d="M100 160V59H133V40H208V59H240V160H208V92Q170 57 133 92V160Z" fill="#777fa1"/><path d="M93 59H247V74H93Z" fill="#bdc3d3"/><path d="M108 160V77M232 160V77" stroke="#acb4d0" stroke-width="5"/><path d="M170 78L198 115 170 152 143 115Z" fill="#a6dce1" opacity=".65"/><g fill="#e3d7fc"><circle cx="38" cy="34" r="2"/><circle cx="78" cy="22" r="1.5"/><circle cx="279" cy="28" r="2"/><circle cx="299" cy="65" r="1.5"/></g>'
 ][index];
 return '<svg class="region-artwork" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="regionSky'+index+'" x2="0" y2="1"><stop stop-color="'+skies[0]+'"/><stop offset="1" stop-color="'+skies[1]+'"/></linearGradient></defs><path fill="url(#regionSky'+index+')" d="M0 0H340V160H0Z"/><circle cx="252" cy="38" r="22" fill="'+(index===2?'#ffc294':'#edf0d9')+'" opacity=".8"/>'+scenery+'</svg>';
}
