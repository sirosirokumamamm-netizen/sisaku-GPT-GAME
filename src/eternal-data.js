// Stable IDs extend the existing campaign; stage-local Lv and permanent + never share storage.
const WASTELAND=7,TEMPLE=8,FORGE_MAX=5;
SKILLS.push({id:'laststand',name:'背水の一閃',icon:'✧',category:'sword',kind:'cone',desc:'HPが少ないほど強い一閃。威力は最大3倍。',damage:52,range:225,cd:4.8,mp:3,color:'#b2dbff',cost:1},{id:'bloodpact',name:'血契斬',icon:'†',category:'sword',kind:'cone',desc:'重い斬撃。最大HPの5%（最大12）を支払う。HP不足では使えない。',damage:125,range:210,cd:5.2,mp:2,color:'#f3a6ad',cost:1});
WEAPONS.push({id:'origin',name:'始祖の剣',price:4400,icon:'✺',color:'#ffdfaa',attack:270,speed:1.05,reach:1.35,element:'無',extra:'6撃ごとにMP＋2',regionUnlock:7,desc:'失われた剣の原型。長い間合いと魔力の循環。'},{id:'ancient',name:'いにしえの大太刀',price:4400,icon:'⟋',color:'#c8c3ff',attack:325,speed:.68,reach:2.05,element:'無',extra:'手動剣技の術式破壊＋12%',regionUnlock:7,desc:'悠久を越えた長い刃。振りは重いが間合いに優れる。'});
const CHARMS=[{id:'shadowward',name:'影渡りの護符',icon:'◈',color:'#d8c8ff',price:1800,region:6,desc:'出発時に25の盾を18秒間まとう。'},{id:'firstflame',name:'始原の火守り',icon:'✺',color:'#ffdda0',price:2200,region:7,desc:'出発時から12秒間、通常攻撃が速くなる。'},{id:'timekeeper',name:'時守りのおまもり',icon:'⌛',color:'#b9eddf',price:2400,region:8,desc:'出発時に必殺ゲージ＋25、MPを全回復。'}];
function wastelandUnlocked(c=campaign){return !!c.clears[6]||!!c.clears[7]}
function templeUnlocked(c=campaign){return !!c.clears[7]||!!c.clears[8]}
function stageRoomCount(region=game.region){return region===TEMPLE?8:5}
function isTemple(region=game.region){return !!game.singleStage&&region===TEMPLE}
function isFinalRoom(){return game.room>=stageRoomCount()}
function unlockedRegionCount(c){return templeUnlocked(c)?9:wastelandUnlocked(c)?8:shadowUnlocked(c)?7:heavenUnlocked(c)?6:darkUnlocked(c)?5:finaleUnlocked(c)?4:Math.min(3,c.unlocked)}
function normalizeForge(raw){const out={weapon:{},ultimate:{},skill:{}};for(const [type,ids]of Object.entries({weapon:WEAPONS.map(w=>w.id),ultimate:ultimateArts().map(a=>a.id),skill:SKILLS.map(s=>s.id)}))for(const id of ids){const level=finiteInt(raw?.[type]?.[id],0,FORGE_MAX);if(level)out[type][id]=level}return out}
function normalizeEndgame(c,raw={}){
 c.craftStones=finiteInt(raw.craftStones);c.forge=normalizeForge(raw.forge);c.charms=[...new Set((Array.isArray(raw.charms)?raw.charms:[]).filter(id=>CHARMS.some(x=>x.id===id)))];c.charm=c.charms.includes(raw.charm)?raw.charm:null;c.craftRuns={};
 for(const [id,n]of Object.entries(raw.craftRuns||{}).slice(-64))if(id.length<100)c.craftRuns[id]=finiteInt(n,0,500);
 const t=raw.templeAttempt;c.templeAttempt=t&&typeof t.id==='string'&&t.id.length<100&&Number.isInteger(t.seed)?{id:t.id,seed:t.seed>>>0}:null;
}
function forgeLevel(type,id,c=campaign){return c.forge?.[type]?.[id]||0}
function forgeCost(type,level){return Math.round([12,26,48,80,125][level]*({weapon:1,ultimate:1.3,skill:.8})[type])}
function inheritedForge(id){return game.inheritedSkills?.includes(id)?game.forgeSkills?.[id]||0:0}
function skillTier(){return game.skillTier||((campaign.clears[4])?2:1)}
function prepareSkillDamage(id,amount){if(!id)return amount;const hpRatio=clamp(p.hp/Math.max(1,p.maxHp),0,1),risk=id==='laststand'?1+2*(1-hpRatio):1;return amount*(skillTier()===2?1.18:1)*(1+.03*inheritedForge(id))*risk}
function capSkillDamage(amount,id){if(!id)return Math.round(amount);const late=skillTier()===2,knee=late?900:600,limit=late?1500:1000;return Math.min(limit,Math.max(1,Math.round(amount<=knee?amount:knee+(limit-knee)*(1-Math.exp(-(amount-knee)/(limit-knee))))))}
function bloodPactCost(){return Math.min(12,Math.max(1,Math.ceil(p.maxHp*.05)))}
function potionRecovery(){const ratio=.28+runRandom()*.15;return {ratio,hp:Math.max(18,Math.round(p.maxHp*ratio)),mp:Math.ceil(p.maxMp*.4)}}
function stoneReward(win){const base=[3,5,8,11,17,24,36,58,110][game.region]||3,rank=rankAssessment(win,win?1:(game.room-1)/stageRoomCount()).rank;return win?Math.round(base*(rank==='S'?1.4:rank==='A'?1.2:1)):Math.floor(base*Math.max(0,game.room-1)/stageRoomCount()*.3)}
function settleEndgameRewards(c,result){
 const target=finiteInt(result.stones,0,500),id=result.attemptId;if(id){const previous=c.craftRuns[id]||0;result.awardedStones=Math.max(0,target-previous);c.craftStones+=result.awardedStones;c.craftRuns[id]=Math.max(target,previous);const ids=Object.keys(c.craftRuns);if(ids.length>64)delete c.craftRuns[ids[0]]}if(result.stage===TEMPLE)c.templeAttempt=null;
}
function interruptedTemple(c){if(!c.templeAttempt)return;const t=c.templeAttempt;c.templeAttempt=null;if(c.pending)return;c.lastResult={stage:TEMPLE,attemptId:t.id,score:0,time:0,rank:'D',win:false,gold:0,spent:0,bankGold:0,stones:0,kills:0,hits:0,perfects:0,seed:t.seed,hint:'神殿の挑戦はページを閉じたため終了しました。中断からは再開できません。'};try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(c))}catch{storageAvailable=false}}
function startEndgameRun(){
 game.skillTier=campaign.clears[4]?2:1;game.inheritedSkills=campaign.carries.slice();game.forgeSkills={...campaign.forge.skill};game.forgeUltimate=forgeLevel('ultimate',game.ultimateArt);game.startCharm=campaign.charm;
 if(game.startCharm==='shadowward'){p.shield=Math.max(p.shield,25);p.shieldTime=18}if(game.startCharm==='firstflame')p.focus=12;if(game.startCharm==='timekeeper'){p.ultimate=Math.min(100,p.ultimate+25);p.mp=p.maxMp}
 if(!isTemple())return false;
 const n=cloneCampaign();n.templeAttempt={id:game.attemptId,seed:game.seed};saveCampaign(n);bossRetrySnapshot=null;game.templeDrafting=true;game.phase='templeDraft';game.active=false;p.lv=7;p.maxHp+=30;p.hp=p.maxHp;p.maxMp+=8;p.mp=p.maxMp;p.xpNext=stageExperienceThreshold(p.lv);game.pendingChoices=6;game.choiceDelay=0;openDraft();return true;
}
function finishTempleDraft(){if(!game.templeDrafting||game.pendingChoices>0)return false;game.templeDrafting=false;game.mode='play';game.phase='travel';closeModal();encounter();return true}
function availableCharms(c=campaign){return CHARMS.filter(x=>c.clears[x.region]||c.charms.includes(x.id))}
function endgameBossRegion(){return isTemple()?[0,1,2,3,4,5,6,7][game.room-1]:game.region}

function skillForgeSuffix(id){const inRun=game.singleStage&&!game.settled&&!['stageSelect','preparation','weaponShop','collection','chest','stageResult','missions'].includes(game.mode),level=inRun?inheritedForge(id):forgeLevel('skill',id);return level?' ＋'+level:''}
function applyForgedCarryPassive(s){const level=inheritedForge(s.id),before={};if(level)for(const [key,value]of Object.entries(p))if(typeof value==='number')before[key]=value;s.apply();if(!level||s.id==='charge'||s.id==='ultimatePower')return;for(const [key,value]of Object.entries(before)){const after=p[key];if(typeof after==='number'&&Number.isFinite(after)&&after!==value){const next=after+(after-value)*.03*level;p[key]=['maxHp','maxMp','hp','mp'].includes(key)?Math.round(next):next}}}

function forgedPassiveRank(id){return (p.learned[id]||0)+(p.learned[id]?inheritedForge(id)*.03:0)}
