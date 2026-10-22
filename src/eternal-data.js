// Stable IDs extend the existing campaign; stage-local Lv and permanent + never share storage.
const WASTELAND=7,TEMPLE=8,FORGE_MAX=5,WORLD_ORDER=[0,1,2,3,4,5,7,6,8];
function realmTier(region=game.region){return Math.max(0,WORLD_ORDER.indexOf(region))}
function visibleRegionIds(){return WORLD_ORDER.slice(0,visibleRegionCount())}
SKILLS.push({id:'laststand',name:'背水の一閃',icon:'✧',category:'sword',kind:'cone',desc:'HPが少ないほど強い一閃。威力は最大3倍。',damage:52,range:225,cd:4.8,mp:3,color:'#b2dbff',cost:1},{id:'bloodpact',name:'血契斬',icon:'†',category:'sword',kind:'cone',desc:'重い斬撃。最大HPの5%（最大12）を支払う。HP不足では使えない。',damage:125,range:210,cd:5.2,mp:2,color:'#f3a6ad',cost:1});
WEAPONS.push({id:'origin',name:'始祖の剣',price:4400,icon:'✺',color:'#ffdfaa',attack:270,speed:1.05,reach:1.35,element:'無',extra:'6撃ごとにMP＋2',regionUnlock:7,desc:'失われた剣の原型。長い間合いと魔力の循環。'},{id:'ancient',name:'いにしえの大太刀',price:4400,icon:'⟋',color:'#c8c3ff',attack:325,speed:.68,reach:2.05,element:'無',extra:'手動剣技の術式破壊＋12%',regionUnlock:7,desc:'悠久を越えた長い刃。振りは重いが間合いに優れる。'});
// IDs are retained for old purchases; only one equipped charm activates per combat room.
const CHARMS=[
 {id:'hearth',name:'若葉のお守り',color:'#91dfad',price:600,region:null,condition:'every',motif:'life',desc:'最大HPの8%を回復（最低6）。'},
 {id:'spring',name:'清泉のお守り',color:'#8cdbff',price:650,region:0,condition:'every',motif:'mana',desc:'最大MPの12%を回復（最低3）。'},
 {id:'purity',name:'清浄のお守り',color:'#f2e1ac',price:900,region:1,condition:'every',motif:'ward',desc:'その区画の状態異常を1回防ぐ。'},
 {id:'stoneguard',name:'岩守りのお守り',color:'#c4d7ba',price:1100,region:2,condition:'every',motif:'stone',desc:'その区画の最初の被弾3回を6軽減（最低1ダメージ）。'},
 {id:'valor',name:'決戦のお守り',color:'#efb8a6',price:1500,region:3,condition:'boss',motif:'life',desc:'最大HPの18%・最大MPの20%を回復（最低HP12・MP4）。'},
 {id:'secondwind',name:'再起のお守り',color:'#b4e6ac',price:1300,region:4,condition:'crisis',motif:'life',desc:'最大HPの22%を回復（最低15）。'},
 {id:'shadowward',name:'影渡りのお守り',color:'#d8c8ff',price:1800,region:6,condition:'boss',motif:'ward',desc:'耐久40のバリアを20秒間まとう。'},
 {id:'firstflame',name:'始原の火守り',color:'#ffdda0',price:2200,region:7,condition:'odd',motif:'flame',desc:'12秒間、通常攻撃を加速する。'},
 {id:'timekeeper',name:'時守りのお守り',color:'#b9eddf',price:2400,region:8,condition:'odd',motif:'time',desc:'必殺ゲージ＋15、最大MPの40%を回復（最低6）。'}
];
const PERMANENT_STATS={hp:{name:'生命の鍛錬',label:'最大HP',step:8,unit:''},mp:{name:'魔力の鍛錬',label:'最大MP',step:2,unit:''},attack:{name:'剛刃の鍛錬',label:'攻撃力・属性威力',step:4,unit:'%'},defense:{name:'堅守の鍛錬',label:'守備力',step:2,unit:''}};
function permanentStatProducts(){return Object.entries(PERMANENT_STATS).map(([key,s])=>{const level=campaign.permanentStats[key];return {id:'stat-'+key,name:s.name,level,max:5,currency:'stones',price:({hp:[35,65,105,160,230],mp:[35,65,105,160,230],attack:[50,90,145,220,310],defense:[50,90,145,220,310]})[key][Math.min(level,4)],desc:s.label+'を永続的に高める。すべての冒険の開始時に適用。'+(key==='defense'?'被ダメージ軽減には既存の上限が適用されます。':''),effect:s.label+' ＋'+level*s.step+s.unit+' → ＋'+Math.min(5,level+1)*s.step+s.unit}})}
function permanentStatBonuses(c=campaign){return Object.fromEntries(Object.entries(PERMANENT_STATS).map(([k,s])=>[k,(c.permanentStats?.[k]||0)*s.step]))}
function charmCondition(c){return {every:'毎区画',odd:'奇数区画',boss:'ボス戦',crisis:'奇数区画・HP35%以下'}[c.condition]}
function roomCharmMatches(c){return c.condition==='every'||c.condition==='boss'&&isBossStage()||c.condition==='odd'&&game.room%2===1||c.condition==='crisis'&&game.room%2===1&&p.hp/p.maxHp<=.35}
function activateRoomCharm(){
 if(!game.singleStage||!game.active||game.bossScene||p.hp<=0||game.roomCharm?.room===game.room)return false;
 const c=CHARMS.find(c=>c.id===game.startCharm);game.roomCharm={room:game.room,id:c?.id||null,guard:0,reduction:0,hits:0};
 if(!c||!roomCharmMatches(c))return false;let message='';const heal=(ratio,min)=>{const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+Math.max(min,Math.round(p.maxHp*ratio)));return Math.round(p.hp-before)},mana=(ratio,min)=>{const before=p.mp;p.mp=Math.min(p.maxMp,p.mp+Math.max(min,Math.round(p.maxMp*ratio)));return Math.round(p.mp-before)};
 if(c.id==='hearth')message='HP ＋'+heal(.08,6);
 if(c.id==='spring')message='MP ＋'+mana(.12,3);
 if(c.id==='valor')message='HP ＋'+heal(.18,12)+' / MP ＋'+mana(.20,4);
 if(c.id==='secondwind')message='HP ＋'+heal(.22,15);
 if(c.id==='purity'){game.roomCharm.guard=1;message='状態異常を1回防ぐ'}
 if(c.id==='stoneguard'){Object.assign(game.roomCharm,{reduction:6,hits:3});message='被弾3回を6軽減'}
 if(c.id==='shadowward'){p.shield=Math.max(p.shield,40);p.shieldTime=Math.max(p.shieldTime||0,20);message='バリア 40'}
 if(c.id==='firstflame'){p.focus=Math.max(p.focus||0,12);message='通常攻撃加速 · 12秒'}
 if(c.id==='timekeeper'){p.ultimate=Math.min(100,p.ultimate+15);message='必殺 ＋15 / MP ＋'+mana(.4,6)}
 floating(p.x,p.y-140,c.name+' · '+message,c.color,true);acquisitionToast(c.name+' · '+message,c.color);particle(p.x,p.y-25,c.color,12,90);effects.push({kind:'nova',x:p.x,y:p.y,r:70,color:c.color,life:.6,max:.6});updateUI();return true;
}
function absorbCharmAilment(){const c=game.roomCharm;if(!game.active||c?.room!==game.room||!c.guard)return false;c.guard=0;floating(p.x,p.y-120,'お守り · 状態異常を防いだ！','#fff0c4',true);effects.push({kind:'nova',x:p.x,y:p.y,r:85,color:'#fff0c4',life:.5,max:.5});playCue('parry');return true}
function reduceCharmDamage(amount){const c=game.roomCharm;if(!game.active||c?.room!==game.room||!c.hits)return amount;const reduced=Math.min(c.reduction,Math.max(0,amount-1));c.hits--;floating(p.x,p.y-140,'お守り −'+reduced+' · 残り'+c.hits+'回','#d5edca');return amount-reduced}
function realmGoldFactor(region=game.region){return [1,1.04,1.08,1.12,1.18,1.22,1.32,1.42,1.5][realmTier(region)]||1}

function wastelandUnlocked(c=campaign){return !!c.clears[5]||!!c.clears[6]||!!c.clears[7]}
function templeUnlocked(c=campaign){return !!c.legacyTempleAccess||!!c.clears[6]||!!c.clears[8]}
function stageRoomCount(region=game.region){return region===TEMPLE?8:region>=5?6:5}
function isTemple(region=game.region){return !!game.singleStage&&region===TEMPLE}
function isFinalRoom(){return game.room>=stageRoomCount()}
function unlockedRegionCount(c){return templeUnlocked(c)?9:shadowUnlocked(c)?8:wastelandUnlocked(c)?7:heavenUnlocked(c)?6:darkUnlocked(c)?5:finaleUnlocked(c)?4:Math.min(3,c.unlocked)}
function normalizeForge(raw){const out={weapon:{},ultimate:{},skill:{}};for(const [type,ids]of Object.entries({weapon:WEAPONS.map(w=>w.id),ultimate:ultimateArts().map(a=>a.id),skill:SKILLS.map(s=>s.id)}))for(const id of ids){const level=finiteInt(raw?.[type]?.[id],0,FORGE_MAX);if(level)out[type][id]=level}return out}
function normalizeEndgame(c,raw={}){
 c.permanentStats=Object.fromEntries(Object.keys(PERMANENT_STATS).map(k=>[k,finiteInt(raw.permanentStats?.[k],0,5)]));c.realmOrderVersion=2;c.legacyShadowAccess=raw.legacyShadowAccess===true||raw.realmOrderVersion!==2&&raw.unlocked>=7;c.legacyTempleAccess=raw.legacyTempleAccess===true||raw.realmOrderVersion!==2&&(raw.unlocked>=9||!!raw.clears?.[7]);c.craftStones=finiteInt(raw.craftStones);c.forge=normalizeForge(raw.forge);c.charms=[...new Set((Array.isArray(raw.charms)?raw.charms:[]).filter(id=>CHARMS.some(x=>x.id===id)))];c.charm=c.charms.includes(raw.charm)?raw.charm:null;c.craftRuns={};
 for(const [id,n]of Object.entries(raw.craftRuns||{}).slice(-64))if(id.length<100)c.craftRuns[id]=finiteInt(n,0,500);
 const t=raw.templeAttempt;c.templeAttempt=t&&typeof t.id==='string'&&t.id.length<100&&Number.isInteger(t.seed)?{id:t.id,seed:t.seed>>>0}:null;
}
function forgeLevel(type,id,c=campaign){return c.forge?.[type]?.[id]||0}
function forgeCost(type,level,id){const item=type==='weapon'?WEAPONS.find(w=>w.id===id):type==='ultimate'?ultimateArts().find(a=>a.id===id):getSkill(id);let weight=1;if(item){if(type==='weapon')weight=item.price===0?.72:1+Math.min(.32,item.price/14000);else if(type==='ultimate')weight=item.price===0?.85:1+Math.min(.3,item.price/14000);else weight=({nova:1.28,dawn:1.2,execute:1.08,guard:.82,heal:.82,focus:.85})[id]??(item.category==='passive'?.8:item.damage>=80?1.1:.95)}return Math.round([10,21,37,60,90][level]*({weapon:1,ultimate:1.2,skill:.8})[type]*weight)}
function inheritedForge(id){return game.inheritedSkills?.includes(id)?game.forgeSkills?.[id]||0:0}
function skillTier(){return game.skillTier||((campaign.clears[4])?2:1)}
function prepareSkillDamage(id,amount){if(!id)return amount;const hpRatio=clamp(p.hp/Math.max(1,p.maxHp),0,1),risk=id==='laststand'?1+2*(1-hpRatio):1;return amount*(skillTier()===2?1.18:1)*(1+.06*inheritedForge(id))*risk}
function capSkillDamage(amount,id){if(!id)return Math.round(amount);const late=skillTier()===2,knee=late?900:600,limit=late?1500:1000;return Math.min(limit,Math.max(1,Math.round(amount<=knee?amount:knee+(limit-knee)*(1-Math.exp(-(amount-knee)/(limit-knee))))))}
function bloodPactCost(){return Math.min(12,Math.max(1,Math.ceil(p.maxHp*.05)))}
function potionRecovery(){const ratio=.28+runRandom()*.15;return {ratio,hp:Math.max(18,Math.round(p.maxHp*ratio)),mp:Math.ceil(p.maxMp*.4)}}
function stoneReward(win){const base=[6,10,15,22,34,50,110,78,190][game.region]||3,rank=rankAssessment(win,win?1:(game.room-1)/stageRoomCount()).rank;return win?Math.round(base*(rank==='S'?1.4:rank==='A'?1.2:1)):Math.floor(base*Math.max(0,game.room-1)/stageRoomCount()*.3)}
function settleEndgameRewards(c,result){
 const target=finiteInt(result.stones,0,500),id=result.attemptId;if(id){const previous=c.craftRuns[id]||0;result.awardedStones=Math.max(0,target-previous);c.craftStones+=result.awardedStones;c.craftRuns[id]=Math.max(target,previous);const ids=Object.keys(c.craftRuns);if(ids.length>64)delete c.craftRuns[ids[0]]}if(result.stage===TEMPLE)c.templeAttempt=null;
}
function interruptedTemple(c){if(!c.templeAttempt)return;const t=c.templeAttempt;c.templeAttempt=null;if(c.pending)return;c.lastResult={stage:TEMPLE,attemptId:t.id,score:0,time:0,rank:'D',win:false,gold:0,spent:0,bankGold:0,stones:0,kills:0,hits:0,perfects:0,seed:t.seed,hint:'神殿の挑戦はページを閉じたため終了しました。中断からは再開できません。'};try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(c))}catch{storageAvailable=false}}
function startEndgameRun(){
 game.skillTier=campaign.clears[4]?2:1;game.inheritedSkills=campaign.carries.slice();game.forgeSkills={...campaign.forge.skill};game.forgeUltimate=forgeLevel('ultimate',game.ultimateArt);game.startCharm=campaign.charm;
 game.roomCharm=null;
 if(!isTemple())return false;
 const n=cloneCampaign();n.templeAttempt={id:game.attemptId,seed:game.seed};saveCampaign(n);bossRetrySnapshot=null;game.templeDrafting=true;game.phase='templeDraft';game.active=false;p.lv=7;p.maxHp+=30;p.hp=p.maxHp;p.maxMp+=8;p.mp=p.maxMp;p.xpNext=stageExperienceThreshold(p.lv);game.pendingChoices=6;game.choiceDelay=0;openDraft();return true;
}
function finishTempleDraft(){if(!game.templeDrafting||game.pendingChoices>0)return false;game.templeDrafting=false;game.mode='play';game.phase='travel';closeModal();encounter();return true}
function availableCharms(c=campaign){return CHARMS.filter(x=>x.region==null||c.clears[x.region]||c.charms.includes(x.id))}
function endgameBossRegion(){return isTemple()?[0,1,2,3,4,5,7,6][game.room-1]:game.region}

function skillForgeSuffix(id){const inRun=game.singleStage&&!game.settled&&!['stageSelect','preparation','weaponShop','training','collection','chest','stageResult','missions'].includes(game.mode),level=inRun?inheritedForge(id):forgeLevel('skill',id);return level?' ＋'+level:''}
function applyForgedCarryPassive(s){const level=inheritedForge(s.id),before={};if(level)for(const [key,value]of Object.entries(p))if(typeof value==='number')before[key]=value;s.apply();if(!level||s.id==='charge'||s.id==='ultimatePower')return;for(const [key,value]of Object.entries(before)){const after=p[key];if(typeof after==='number'&&Number.isFinite(after)&&after!==value){const next=after+(after-value)*.06*level;p[key]=['maxHp','maxMp','hp','mp'].includes(key)?Math.round(next):next}}}

function forgedPassiveRank(id){return (p.learned[id]||0)+(p.learned[id]?inheritedForge(id)*.06:0)}

function grantTemplePotion(){if(!isTemple()||game.templePotionRooms?.includes(game.room))return;game.templePotionRooms??=[];game.templePotionRooms.push(game.room);game.fieldPotions++;const gold=gainGold(360+game.room*60);acquisitionToast('決闘の支給 · ポーション＋1 / '+gold+' G','#baffce')}
