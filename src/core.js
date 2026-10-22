'use strict';
const $=id=>document.getElementById(id),cv=$('world');let ctx=cv.getContext('2d');
if(!ctx)throw new Error('描画機能が利用できません。別のブラウザで開いてください。');
const WORLD={w:760,start:6240,end:80};
const STAGES=[{name:'陽だまりの草原',y:5840,count:10},{name:'翡翠の石橋',y:5240,count:13},{name:'蒼羽の森',y:4640,count:16},{name:'朱の古城門',y:4040,count:19},{name:'月影の闘技場',y:3440,count:1,boss:true},{name:'水晶の峡谷',y:2840,count:21},{name:'熾火の鍛冶場',y:2240,count:23},{name:'嵐の庭園',y:1640,count:24},{name:'結晶の祭壇',y:440,count:1,boss:true}];
function isBossStage(index=game.stage){return game?.singleStage?(game.region===8||game.room===stageRoomCount()):!!STAGES[index]?.boss}

const SKILLS=[
{id:'crescent',name:'蒼月斬',icon:'☽',category:'sword',kind:'cone',desc:'前方を広く薙ぎ払う。MP不要の基本剣技。',damage:34,range:165,cd:2.2,mp:0,color:'#71e9ff',cost:1},
{id:'whirl',name:'旋風剣',icon:'◎',category:'sword',kind:'ring',desc:'剣を一周させ、周囲の敵をまとめて斬る。',damage:30,r:135,cd:3.8,mp:3,color:'#a7ffe5',cost:1},
{id:'pierce',name:'貫きの突き',icon:'➶',category:'sword',kind:'line',desc:'正面へ細く鋭い突き。一直線の敵を貫く。',damage:46,range:340,width:54,cd:4,mp:2,color:'#c0faff',cost:1},
{id:'flurry',name:'三連閃',icon:'Ⅲ',category:'sword',kind:'flurry',desc:'前方に3連撃。1発17、隙を逃さず畳みかける。',damage:17,range:155,cd:4,mp:3,color:'#ffe2b4',cost:1},
{id:'dash',name:'疾風抜刀',icon:'»',category:'sword',kind:'dash',desc:'前へ90踏み込み、進路の敵を斬る。',damage:40,range:230,width:95,cd:4.3,mp:3,color:'#9dffcd',cost:1},
{id:'cross',name:'十字斬り',icon:'✚',category:'sword',kind:'cross',desc:'縦横の十字に斬撃。側面の敵も巻き込む。',damage:36,range:260,width:64,cd:4.6,mp:3,color:'#f5e2a2',cost:1},
{id:'wave',name:'飛翔剣',icon:'≋',category:'sword',kind:'projectile',desc:'幅広い三日月の斬撃が遠くへ飛ぶ。幅150、8体を貫通。',damage:32,range:1200,width:150,cd:4,mp:3,color:'#76e5ff',cost:1},
{id:'orbit',name:'守護の双刃',icon:'⟳',category:'sword',kind:'orbit',desc:'8秒間、2本の剣が周回して敵を斬る。',damage:12,r:105,cd:12,mp:6,color:'#b6e5ff',cost:2},
{id:'blood',name:'紅蓮の吸命剣',icon:'♥',category:'sword',kind:'blood',desc:'前方を斬り、命中ごとに、戦闘後のHP回復が増える。',damage:30,range:160,cd:6,mp:4,color:'#ff7ea9',cost:2},
{id:'execute',name:'断罪の一刀',icon:'✧',category:'sword',kind:'execute',desc:'最寄りの敵に65。HP35%以下の敵には2.5倍。',damage:65,range:220,cd:6,mp:5,color:'#fff0a4',cost:2},
{id:'flame',name:'炎牙',icon:'♨',category:'element',kind:'cone',desc:'炎の斬撃。さらに3秒間、毎秒8の炎上。',damage:28,range:190,status:'burn',cd:5,mp:4,color:'#ff9b53',cost:1},
{id:'frost',name:'氷華円舞',icon:'❄',category:'element',kind:'ring',desc:'周囲を凍てつかせ、4秒間移動速度を半減。',damage:22,r:170,status:'frost',cd:5,mp:4,color:'#9cf5ff',cost:1},
{id:'thunder',name:'天雷の剣',icon:'ϟ',category:'element',kind:'target',desc:'近くの敵に大剣を落とす。周囲120にも80。',damage:80,r:120,range:520,cd:7,mp:7,color:'#ffe877',cost:2},
{id:'meteor',name:'星落とし',icon:'✶',category:'element',kind:'meteor',desc:'0.8秒後に隕石。敵の集団へ威力95の爆発。',damage:95,r:145,range:520,cd:8,mp:8,color:'#ffac72',cost:2},
{id:'chain',name:'連鎖雷',icon:'↯',category:'element',kind:'chain',desc:'雷が近くの敵へ跳ぶ。最大5体まで連鎖。',damage:33,range:360,cd:5.5,mp:5,color:'#e1ceff',cost:2},
{id:'tornado',name:'風縛り',icon:'〰',category:'element',kind:'field',desc:'3秒間の竜巻。敵を引き寄せ、0.4秒ごとに9。',damage:9,r:110,duration:3,interval:.4,pull:true,cd:8,mp:6,color:'#91ffc8',cost:2},
{id:'rain',name:'剣の雨',icon:'⋮',category:'element',kind:'field',desc:'2.4秒間、狙った場所へ剣が降る。0.4秒ごとに14。',damage:14,r:130,duration:2.4,interval:.4,cd:8,mp:7,color:'#a8e6ff',cost:2},
{id:'quake',name:'地裂斬',icon:'≡',category:'element',kind:'ring',desc:'周囲200を砕き、1.2秒間敵の行動を止める。',damage:28,r:200,status:'stun',cd:7,mp:6,color:'#efcb8b',cost:2},
{id:'nova',name:'ダーククラッシュ',icon:'☾',category:'sword',kind:'execute',desc:'黒紫のオーラを溜めて単体を断つ。Lv.3で封印解放。回避で溜めを中断可能。',damage:190,r:0,range:260,cd:15,mp:12,color:'#b87be6',cost:3,lv:3},
{id:'dawn',name:'黎明の大剣',icon:'✧',category:'sword',kind:'ring',desc:'光を溜め、全周を斬る。最初から出現。魔王撃破ミッションで改へ。持ち越し権は宝箱で獲得。',damage:100,r:300,range:300,cd:14,mp:10,color:'#ffe6a0',cost:3},
{id:'guard',name:'蒼鋼の護り',icon:'⬟',category:'support',kind:'guard',desc:'8秒間、合計35ダメージを防ぐバリア。',cd:10,mp:4,color:'#7fcaff',cost:1},
{id:'parry',name:'鏡の構え',icon:'◇',category:'support',kind:'parry',desc:'1秒間の受け流し。被弾を無効化し周囲へ50。',damage:50,r:145,cd:6,mp:4,color:'#eff8ff',cost:2},
{id:'heal',name:'癒しの光',icon:'✣',category:'support',kind:'heal',desc:'HPを28回復。薬草が切れても戦い続ける。',cd:12,mp:6,color:'#a3ffb9',cost:1},
{id:'blink',name:'影渡り',icon:'◈',category:'support',kind:'blink',desc:'最寄りの敵の背後へ瞬間移動し周囲を斬る。',damage:38,r:90,range:300,cd:6,mp:5,color:'#c7a8ff',cost:2},
{id:'wisp',name:'星の相棒',icon:'✺',category:'support',kind:'wisp',desc:'10秒間、光の精霊が0.9秒ごとに敵を射撃。',damage:15,duration:10,cd:16,mp:7,color:'#ffdb94',cost:2},
{id:'focus',name:'剣気解放',icon:'↑',category:'support',kind:'focus',desc:'5秒間、通常攻撃を1.6倍速に。',duration:5,cd:12,mp:5,color:'#ffb7d0',cost:1},
{id:'power',name:'剣の鍛錬',icon:'⚔',category:'passive',desc:'剣技・通常攻撃の威力を15%増やす。',cost:1,apply:()=>p.power+=.15},
{id:'haste',name:'速剣',icon:'»',category:'passive',desc:'通常攻撃の間隔を10%短縮。',cost:1,apply:()=>p.autoInterval*=.9},
{id:'reach',name:'長剣の心得',icon:'↔',category:'passive',desc:'通常攻撃・前方剣技の射程を12%増やす。',cost:1,apply:()=>p.reach+=.12},
{id:'vital',name:'たくましさ',icon:'♥',category:'passive',desc:'最大HPを18増やす。戦闘後にその分回復。',cost:1,apply:()=>{p.maxHp+=18;restoreHealth(18)}},
{id:'armor',name:'軽鎧の心得',icon:'⬡',category:'passive',desc:'受けるダメージを1減らす。',cost:1,apply:()=>p.armor++},
{id:'crit',name:'急所狙い',icon:'✧',category:'passive',desc:'会心率を10%増やす。',cost:1,apply:()=>p.crit+=.1},
{id:'critpower',name:'会心の極意',icon:'✷',category:'passive',desc:'会心時のダメージ倍率を0.3増やす。',cost:1,apply:()=>p.critPower+=.3},
{id:'leech',name:'勝利の息吹',icon:'✚',category:'passive',desc:'撃破ごとに、戦闘後のHP回復を少し増やす。',cost:1,apply:()=>p.leech+=2},
{id:'magicpower',name:'属性の心得',icon:'✦',category:'passive',desc:'属性技の威力を15%増やす。',cost:1,apply:()=>p.magicPower+=.15},
{id:'mana',name:'魔力循環',icon:'◆',category:'passive',desc:'最大MP＋6、毎秒MP0.3を自然回復。',cost:1,apply:()=>{p.maxMp+=6;p.mp=Math.min(p.maxMp,p.mp+6);p.manaRegen+=.3}},
{id:'cooldown',name:'技の冴え',icon:'◴',category:'passive',desc:'すべての攻撃技の再使用時間を8%短縮。',cost:1,apply:()=>p.cooldownFactor*=.92},
{id:'perfect',name:'見切りの極意',icon:'◈',category:'passive',desc:'ジャスト回避の受付を0.03秒延長。',cost:1,apply:()=>p.justWindow+=.03},
{id:'counter',name:'反撃の心得',icon:'↶',category:'passive',desc:'ジャスト回避後の反撃猶予を0.7秒延長。',cost:1,apply:()=>p.counterDuration+=.7},
{id:'killshield',name:'戦意の鎧',icon:'⬟',category:'passive',desc:'撃破時にバリアを2獲得。最大20、6秒持続。',cost:1,apply:()=>p.killShield+=2},
{id:'magnet',name:'収集の風',icon:'◎',category:'passive',desc:'金貨の吸引範囲＋90、獲得ゴールド＋15%。',cost:1,apply:()=>{p.magnet+=90;p.goldBonus+=.15}}
];
SKILLS.push(
{id:'ultimatePower',name:'必殺技強化',icon:'✵',category:'passive',desc:'蒼雷斬の威力と覚醒の持続時間がアップ。スロット不要。',cost:1,apply:()=>{}},
{id:'charge',name:'チャージ',icon:'ϟ',category:'passive',desc:'必殺ゲージがたまりやすくなる。獲得時にも少し充填。',cost:1,apply:()=>chargeUltimate(20,true)}
);
const SLOT_NAMES=['slash','magic','thunder'],SLOT_KEYS=['J','K','L'];
const getSkill=id=>SKILLS.find(s=>s.id===id);
let inputBuffer=null;
let p,game,enemies=[],drops=[],effects=[],texts=[],warnings=[],decor=[],fields=[],bolts=[],scheduled=[],hostileShots=[],hazards=[],keys=new Set(),joystick={x:0,y:0},cam={x:380,y:3400},view={w:900,h:680,scale:1},lastTime=0,elapsed=0,hitstop=0,shake=0,bannerTTL=0,sounds=true,audio=null,uiClock=0,pointerId=null,padPointerId=null;
let combat={slow:0,flash:0,flashColor:'190,232,255',trail:0,zoom:1},book={tab:'all',query:'',pending:null,returnMode:'play'};
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
function readStore(key){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}}
function writeStore(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
const initialSettings=readStore('azure-settings');
const preferences={effects:Number.isFinite(initialSettings.effects)?Math.max(0,Math.min(1,initialSettings.effects)):.75,music:Number.isFinite(initialSettings.music)?Math.max(0,Math.min(1,initialSettings.music)):.2,motion:initialSettings.motion==='reduced'?'reduced':'system'};
const meta=readStore('azure-records');for(const key of ['runs','wins','perfects','combo','score','bestTime'])if(!Number.isFinite(meta[key])||meta[key]<0)meta[key]=0;
const STYLES=[{id:'azure',name:'蒼月の型',start:['crescent','reach'],desc:'剣の間合い＋12%・剣技威力＋10%。初期：蒼月斬＋長剣の心得。HP90 / MP24。連剣：通常攻撃3回命中で次の手動剣技＋12%。',color:'#8cdeff'},{id:'storm',name:'雷光の型',start:['crescent','thunder'],desc:'天雷の剣を初期装備。属性技威力＋15%・MP回復は約2倍。HP80 / MP30。魔剣循環：通常攻撃3回命中でMP＋1（0.8秒間隔）。',color:'#dfbeff'},{id:'ward',name:'堅守の型',start:['crescent','guard'],desc:'自動バリアで守りながら戦う。防御＋2・HP108 / MP20。初期：蒼月斬＋蒼鋼の護り。重構：通常攻撃の間隔を0.7秒空けると次の通常攻撃＋12%。',color:'#b8efc5'}];
let selectedStyle='azure',settingsReturn='start',musicClock=0,musicBeat=0;
function styleStartingSkills(id=game.style||selectedStyle){return (STYLES.find(s=>s.id===id)||STYLES[0]).start}
function applyStyle(){
 if(game.styleApplied)return;game.styleApplied=true;game.style=selectedStyle;
 if(selectedStyle==='storm'){p.hp=p.maxHp=80;p.mp=p.maxMp=30;p.manaRegen=.75;p.magicPower*=1.15}
 else if(selectedStyle==='ward'){p.hp=p.maxHp=108;p.mp=p.maxMp=20;p.armor=2}
 else p.power*=1.1;
 for(const id of styleStartingSkills()){if(p.learned[id])continue;const s=getSkill(id);p.learned[id]=1;if(s.category==='passive')s.apply();else if(isManualSkill(s))p.loadout[p.loadout.indexOf(null)]=id;else p.autoSkillTimers[id]=0}updateUI();
}
function styleButtons(){return '<div class="style-options" role="group" aria-label="剣士の流派">'+STYLES.map(s=>'<button class="style-option" data-style="'+s.id+'" aria-pressed="'+(s.id===selectedStyle)+'" style="--path-color:'+s.color+'"><b>'+s.name+'</b><small>'+s.desc+'</small></button>').join('')+'</div>'}
function bindStyleButtons(){document.querySelectorAll('[data-style]').forEach(b=>b.onclick=()=>{selectedStyle=b.dataset.style;document.querySelectorAll('[data-style]').forEach(a=>a.setAttribute('aria-pressed',String(a.dataset.style===selectedStyle)))})}
function updateTutorial(){
 if(game.active&&game.stage===0&&!game.tutorialDone){let title,detail;if(game.skillUses===0){title='群れに近づいたら、蒼月斬';detail='J / 右下の技ボタン。通常攻撃は自動。'}else if(game.rolls===0){title='赤い予告から短く回避';detail='移動しながら Shift / 回避。金色の瞬間なら反撃強化。'}else if(p.lv===1){title='倒して経験値を集めよう';detail='上のEXPが満タンになると、4択から強化。'}else{game.tutorialDone=true;return}if(game.phase==='combat'){$('guide').firstChild.textContent=title;$('guide').querySelector('small').textContent=detail}}
}
function nextGoal(win){if(!win)return game.hitsTaken>5?'次の目標：赤い予告へ入り続けず、攻撃後の隙に近づこう。':'次の目標：同じ旅で敵の配置を覚え、もう1ステージ先へ。';if(game.perfects<3)return '次の目標：ジャスト回避を3回決めて、無料の強化技を使おう。';if(game.goals<4)return '次の目標：任意目標を4つ達成。地形と技を使い分けよう。';return '次の目標：別の流派と系統を組み合わせ、自己ベストへ。'}
function recordRun(result){
 const previous=meta.last&&typeof meta.last==='object'?meta.last:null;
 const comparison={perfects:game.perfects-meta.perfects,combo:game.maxCombo-meta.combo,score:result.score-meta.score};
 meta.runs++;if(result.win)meta.wins++;meta.perfects=Math.max(meta.perfects,game.perfects);meta.combo=Math.max(meta.combo,game.maxCombo);meta.score=Math.max(meta.score,result.score);if(result.win&&(!meta.bestTime||result.time<meta.bestTime))meta.bestTime=result.time;
 const earned=[];if(result.win)earned.push('結晶の守り手');if(game.perfects>=5)earned.push('見切りの剣士');if(game.goals>=4)earned.push('旅路の達人');
 const oldTitles=Array.isArray(meta.titles)?meta.titles.filter(t=>['結晶の守り手','見切りの剣士','旅路の達人'].includes(t)):[];
 const fresh=earned.filter(t=>!oldTitles.includes(t));meta.titles=[...new Set([...oldTitles,...earned])];meta.last={score:result.score,time:result.time,perfects:game.perfects,combo:game.maxCombo,win:result.win};writeStore('azure-records',meta);
 const diff=previous&&Number.isFinite(previous.score)?result.score-previous.score:null;
 return '<div class="run-insights"><b>'+(diff===null?'最初の冒険を記録':diff>=0?'前回より +'+diff.toLocaleString('ja-JP')+' 点':'前回との差 '+diff.toLocaleString('ja-JP')+' 点')+'</b><div>ジャスト回避 '+game.perfects+'回'+(comparison.perfects>0?' · 自己ベスト！':'')+' / 最大 '+game.maxCombo+'連鎖'+(comparison.combo>0?' · 自己ベスト！':'')+'</div><div>任意目標 '+game.goals+'/'+STAGES.length+' · 被弾 '+game.hitsTaken+'回 · 相乗効果 '+game.resonances+'回</div>'+(fresh.length?'<div class="new-title">称号獲得：'+fresh.join(' / ')+'</div>':'')+'<p>'+nextGoal(result.win)+'</p></div>';
}
function openSettings(){
 if(!['play','pause','start','settings','stageSelect','preparation','stageResult'].includes(game.mode))return;if(game.mode!=='settings')settingsReturn=game.mode;game.mode='settings';
 openModal('<div class="eyebrow">CONTROLS & COMFORT</div><h2>操作と設定</h2><div class="help-steps"><b>① 近づけば自動で斬る</b><span>WASD・矢印 / 左スティックで移動</span><b>② 赤い予告を避ける</b><span>Shift / 回避。金色の予告で成功するとスロー</span><b>③ 光った技で斬り返す</b><span>J・K・L / 右の技。ジャスト回避後は威力2倍・MP不要</span><b>④ 4択で技を獲得</b><span>空き枠へ自動装備。満杯なら色で入替。緑の技は自動発動</span></div><label class="setting-row">効果音 <input id="effectsVolume" type="range" min="0" max="100" value="'+Math.round(preferences.effects*100)+'"><output id="effectsValue">'+Math.round(preferences.effects*100)+'%</output></label><label class="setting-row">音楽 <input id="musicVolume" type="range" min="0" max="100" value="'+Math.round(preferences.music*100)+'"><output id="musicValue">'+Math.round(preferences.music*100)+'%</output></label><label class="motion-option"><input id="motionSetting" type="checkbox" '+(preferences.motion==='reduced'?'checked':'')+'> 画面揺れ・発光・ズームを抑える</label><p class="settings-note">端末の「動きを減らす」設定にも従います。<br>E：回復 / B：商店 / Tab：装備 / P：一時停止<br>回復は最大3本。回復と装備変更は戦闘後のみです。</p><button class="cta" id="closeSettings">設定を閉じる</button>');$('modal').classList.add('settings-modal');
 for(const [id,key] of [['effectsVolume','effects'],['musicVolume','music']])$(id).oninput=()=>{preferences[key]=Number($(id).value)/100;$(key+'Value').textContent=$(id).value+'%';writeStore('azure-settings',preferences)};
 $('motionSetting').onchange=()=>{preferences.motion=$('motionSetting').checked?'reduced':'system';reduced=motionQuery.matches||preferences.motion==='reduced';shake=0;combat.flash=0;combat.zoom=1;writeStore('azure-settings',preferences)};$('closeSettings').onclick=closeSettings;appendComfortSettings();compactSettings();addTouchLayoutSetting();
}
function closeSettings(){if(game.mode!=='settings')return;if(settingsReturn==='stageSelect'){openStageSelect();return}if(settingsReturn==='preparation'){openPreparation(campaign.selected);return}if(settingsReturn==='stageResult'){showStageResult(campaign.lastResult);return}game.mode=settingsReturn;if(settingsReturn==='start')showStart();else if(settingsReturn==='pause'){game.mode='play';pause()}else closeModal()}

let reduced=motionQuery.matches||preferences.motion==='reduced';const onMotionChange=()=>{reduced=motionQuery.matches||preferences.motion==='reduced'};if(motionQuery.addEventListener)motionQuery.addEventListener('change',onMotionChange);else if(motionQuery.addListener)motionQuery.addListener(onMotionChange);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),norm=(x,y)=>{const d=Math.hypot(x,y);return d>0?{x:x/d,y:y/d}:{x:0,y:-1}};
// Physical scenery, shared by collision, navigation, spawning and projectile cover.
let terrain=[],decals=[],flowCache=null,flowCaches=new Map(),stepClock=0,impactClock=0,audioBus=null;
const CAMERA={desktopAnchor:.70,mobileAnchor:.67,spriteHeight:.94,depth:.78};
const treeSprites=new Map(),groundChunks=new Map(),walkabilityMasks=new Map();
function buildTerrain(){WORLD.w=bossArenaActive()?1360:760;if(game.singleStage){generateRoomTerrain();return}
 terrain=[];
 for(let i=0;i<STAGES.length;i++){
  const y=STAGES[i].y;if(STAGES[i].boss){terrain.push({kind:'wall',x:90,y:y-222,w:210,h:24,solid:true},{kind:'wall',x:460,y:y-222,w:210,h:24,solid:true});continue}
  terrain.push({kind:'wall',x:90,y:y-222,w:210,h:24,solid:true},{kind:'wall',x:460,y:y-222,w:210,h:24,solid:true});
  terrain.push({kind:'rock',x:185+(i%2)*15,y:y-65,r:32,solid:true},{kind:'rock',x:573-(i%2)*13,y:y+95,r:34,solid:true});
  terrain.push({kind:'ruin',x:215,y:y-140,w:58,h:34,solid:true},{kind:'ruin',x:495,y:y-130,w:58,h:34,solid:true});
  terrain.push({kind:'barrel',x:245,y:y+55,r:16,solid:false,broken:false},{kind:'barrel',x:520,y:y-12,r:16,solid:false,broken:false});
  if(i===1){terrain.push({kind:'water',x:90,y:y+5,w:205,h:70,solid:true},{kind:'water',x:465,y:y+5,w:205,h:70,solid:true},{kind:'bridge',x:295,y:y+5,w:170,h:70,solid:false})}
  if(i===2)terrain.push({kind:'shallows',x:525,y:y+30,r:72,solid:false},{kind:'rock',x:305,y:y-50,r:25,solid:true});
  if(i===3)terrain.push({kind:'barrel',x:325,y:y+35,r:16,solid:false,broken:false},{kind:'barrel',x:420,y:y+10,r:16,solid:false,broken:false});
  if(i===5)terrain.push({kind:'crystal',x:265,y:y+30,r:29,solid:true},{kind:'crystal',x:485,y:y-45,r:30,solid:true});
  if(i===6)terrain.push({kind:'barrel',x:320,y:y+55,r:16,solid:false,broken:false},{kind:'barrel',x:420,y:y+5,r:16,solid:false,broken:false},{kind:'furnace',x:580,y:y-115,w:55,h:55,solid:true});
  if(i===4)terrain.push({kind:'ruin',x:260,y:y+15,w:45,h:75,solid:true},{kind:'ruin',x:460,y:y+15,w:45,h:75,solid:true});
 }
 flowCache=null;flowCaches.clear();walkabilityMasks.clear();decals=[];stepClock=0;
}
function terrainCollision(x,y,r,t){
 if(!t.solid)return false;
 if(t.r)return Math.hypot(x-t.x,y-t.y)<r+t.r;
 return Math.hypot(x-clamp(x,t.x,t.x+t.w),y-clamp(y,t.y,t.y+t.h))<r;
}
function canStand(x,y,r=17){if(bossArenaActive()){const b=battleBounds();return x>=b.left+r&&x<=b.right-r&&y>=b.top+r&&y<=b.bottom-r&&!terrain.some(t=>terrainCollision(x,y,r,t))}return x>=(game.singleStage?65:100)+r*.2&&x<=(game.singleStage?695:660)-r*.2&&y>=WORLD.end&&y<=WORLD.start+75&&!terrain.some(t=>terrainCollision(x,y,r,t))}
function coverClear(a,b,r=2){
 const d=distance(a,b),steps=Math.ceil(d/10);for(let i=1;i<=steps;i++){const u=i/Math.max(1,steps),x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;if(terrain.some(t=>t.solid&&t.kind!=='water'&&terrainCollision(x,y,r,t)))return false}return true;
}
function routeClear(a,b,r=18){const d=distance(a,b),steps=Math.ceil(d/12);for(let i=1;i<=steps;i++){const u=i/steps;if(!canStand(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,r))return false}return true}
function terrainSpeed(a){return terrain.some(t=>['shallows','lava'].includes(t.kind)&&distance(a,t)<t.r)? .82:1}
function moveActor(a,dx,dy){
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/7)),r=a.r||17,b=battleBounds();
 for(let i=0;i<n;i++){let x=clamp(a.x+dx/n,b.left+r,b.right-r),y=a.y+dy/n;if(a===p)y=clampPlayerY(y);else if(game.singleStage)y=clamp(y,b.top+r,b.bottom-r);else if(game.active&&game.stage<STAGES.length)y=Math.max(y,STAGES[game.stage].y-170);
  if(canStand(x,a.y,r))a.x=x;if(canStand(a.x,y,r))a.y=y;
 }
}
function safePoint(x,y,r=18){if(bossArenaActive()){const b=battleBounds();return{x:clamp(x,b.left+r,b.right-r),y:clamp(y,b.top+r,b.bottom-r)}}
 const minY=game.active&&game.stage<STAGES.length?STAGES[game.stage].y-170:WORLD.end+20;x=clamp(x,110,650);y=clamp(y,minY,WORLD.start+50);if(canStand(x,y,r))return{x,y};
 for(let radius=24;radius<=200;radius+=20)for(let i=0;i<16;i++){const a=i*Math.PI/8,px=clamp(x+Math.cos(a)*radius,110,650),py=clamp(y+Math.sin(a)*radius,minY,WORLD.start+50);if(canStand(px,py,r))return{x:px,y:py}}
 return{x:380,y};
}
function buildFlow(target,radius=19){
 const size=16,cols=Math.ceil(WORLD.w/size),rows=Math.ceil((WORLD.start+120)/size),key=Math.floor(target.x/size)+','+Math.floor(target.y/size)+','+game.stage+','+game.active+','+radius;
 const cached=flowCaches.get(key);if(cached&&game.time-cached.time<.2)return cached;
 const pass=new Uint8Array(cols*rows),cost=new Int16Array(cols*rows);cost.fill(30000);
 const arena=bossArenaActive()?battleBounds():null,minY=arena?arena.top:game.active&&game.stage<STAGES.length?STAGES[game.stage].y-190:WORLD.end,maxY=arena?arena.bottom:game.active?Math.max(STAGES[game.stage].y+500,target.y+180):WORLD.start+75;
 const first=Math.max(0,Math.ceil((minY-size/2)/size)),last=Math.min(rows-1,Math.floor((maxY-size/2)/size));let mask=walkabilityMasks.get(radius);if(!mask){mask=new Uint8Array(cols*rows);walkabilityMasks.set(radius,mask)}
 for(let y=first;y<=last;y++)for(let x=0;x<cols;x++){const cell=y*cols+x;if(!mask[cell])mask[cell]=canStand(x*size+size/2,y*size+size/2,radius)?1:2;if(mask[cell]===1)pass[cell]=1}

 let start=Math.floor(target.y/size)*cols+Math.floor(target.x/size);if(!pass[start]){let near=Infinity;for(let j=0;j<pass.length;j++)if(pass[j]){const d=Math.hypot((j%cols)*size+size/2-target.x,Math.floor(j/cols)*size+size/2-target.y);if(d<near){near=d;start=j}}}
 const queue=[start];cost[start]=0;for(let k=0;k<queue.length;k++){const at=queue[k],x=at%cols,y=Math.floor(at/cols);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*cols+nx;if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&pass[n]&&cost[n]>cost[at]+1){cost[n]=cost[at]+1;queue.push(n)}}}
 flowCache={key,time:game.time,size,cols,rows,cost};flowCaches.set(key,flowCache);if(flowCaches.size>24)flowCaches.delete(flowCaches.keys().next().value);return flowCache;
}
function routeDirection(a,target=p){
 if(routeClear(a,target,a.r||17))return norm(target.x-a.x,target.y-a.y);
 const f=buildFlow(target,Math.max(19,a.r||17)),cx=Math.floor(a.x/f.size),cy=Math.floor(a.y/f.size);let best=null,score=Infinity;
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy,point={x:x*f.size+f.size/2,y:y*f.size+f.size/2};if(x<0||x>=f.cols||y<0||y>=f.rows||!routeClear(a,point,a.r||17))continue;const value=f.cost[y*f.cols+x]+distance(a,point)/100;if(value<score){score=value;best=point}}
 return best?norm(best.x-a.x,best.y-a.y):{x:0,y:0};
}
function scatterPlan(wave){
 const st=STAGES[game.stage];if(isBossStage())return game.singleStage&&endgameBossRegion()===3?[{...safePoint(arenaX(250),arenaY(st.y-100),44),kind:'boss',r:36},{...safePoint(arenaX(510),arenaY(st.y-100),44),kind:'boss',r:36}]:[{...safePoint(arenaX(380),arenaY(st.y-65),58),kind:'boss',r:42}];
 const count=game.singleStage?stageWaveSize(game.stage,wave):wave===1?st.count:Math.ceil(st.count*.72)+2,points=[],formation=Math.floor(runRandom()*4);
 for(let i=0;i<count;i++){
  const kind=waveKind(i),side=i%4;let best=null,bestScore=-Infinity;
  for(let j=0;j<150;j++){
   let x=runRange(125,635),y=runRange(st.y-150,st.y+260);
   if(j<70){if(formation===0)x=side%2?runRange(490,635):runRange(125,270);if(formation===1)y=side<2?runRange(st.y+150,st.y+300):runRange(st.y-150,st.y-30);if(formation===2){const angle=i/count*Math.PI*2+runRange(-.3,.3);x=p.x+Math.cos(angle)*runRange(185,280);y=p.y+Math.sin(angle)*runRange(175,260)}if(formation===3){x=side<2?runRange(125,300):runRange(460,635);y=st.y+(side%2?180:-110)+runRange(-55,55)}}
   if(y<st.y-170||y>st.y+330||!canStand(x,y,26))continue;
   const d=distance(p,{x,y}),space=points.length?Math.min(...points.map(a=>distance(a,{x,y}))):250;if(d<165||space<40)continue;
   const score=Math.min(space,82)+Math.min(d,245)*.18;if(score>bestScore){best={x,y};bestScore=score}if(space>60&&j>14)break;
  }
  if(!best){for(let j=0;j<100;j++){const q=safePoint(runRange(125,635),runRange(st.y-150,st.y+280),26);if(distance(q,p)>155&&points.every(a=>distance(a,q)>38)){best=q;break}}}
  if(best)points.push({...best,kind,r:18});
 }
 return points;
}
function areaContains(spec,point,r=0){
 const {s,x,y,face}=spec,dx=point.x-x,dy=point.y-y,d=Math.hypot(dx,dy),along=dx*face.x+dy*face.y,across=Math.abs(dx*face.y-dy*face.x);
 if(['ring','field','target','meteor','blink','parry','orbit'].includes(s.kind))return d<(s.r||130)+r;
 if(['line','dash'].includes(s.kind))return along>-25&&along<(s.range||230)&&across<(s.width||65)/2+r;
 if(s.kind==='cross')return Math.abs(dx)<s.width/2+r&&Math.abs(dy)<s.range/2||Math.abs(dy)<s.width/2+r&&Math.abs(dx)<s.range/2;
 return d<(s.range||180)&&(d<60||along/Math.max(1,d)>-.25);
}
function explodeBarrel(t){
 if(game.singleStage&&t.content){openSupplyBarrel(t);return}
 if(t.broken)return;t.broken=true;game.barrels++;effects.push({kind:'nova',x:t.x,y:t.y,r:115,color:'#ffb45c',life:.5,max:.5});particle(t.x,t.y,'#ffce86',28,250);decals.push({kind:'scorch',x:t.x,y:t.y,life:8,max:8});floating(t.x,t.y-45,'誘爆！','#ffd291',true);
 for(const e of enemies)if(e.hp>0&&distance(e,t)<115+e.r)hurtEnemy(e,24+game.stage*3,true,'#ffc477');
 hostileShots=hostileShots.filter(b=>distance(b,t)>130);for(const other of terrain)if(other.kind==='barrel'&&!other.broken&&distance(other,t)<115)explodeBarrel(other);
 if(!reduced)shake=Math.max(shake,9);tone(95,.25,'triangle',.05);
}
const AUTO_IDS=new Set(['orbit','wisp','guard','focus']);
const SLOT_COLORS=['#73ddff','#caa3ff','#ffbd83'];
function isAutoSkill(s){return !!s&&AUTO_IDS.has(s.id)}
function isManualSkill(s){return !!s&&s.category!=='passive'&&s.kind!=='heal'&&!isAutoSkill(s)}
function skillType(s){return isAutoSkill(s)?{label:'自動発動・枠不要',color:'#8ff0ba'}:s.category==='passive'?{label:'常時強化・枠不要',color:'#ffe09b'}:s.kind==='heal'?{label:'休憩で使う・枠不要',color:'#ffb5c1'}:{label:'ボタンで発動',color:'#8dcfff'}}
for(const s of SKILLS)if(isAutoSkill(s)){s.mp=0;s.auto=true}

function skillPower(s,rank=p.learned[s.id]||1){return (s.category==='sword'?p.power:p.magicPower)*(1+(rank-1)*.2)}
function skillCooldown(s,rank=p.learned[s.id]||1){return s.cd*p.cooldownFactor*(1-(rank-1)*.06)}
function skillPrimary(s,rank){
 if(s.kind==='guard')return{label:'バリア',value:Math.round((35+(rank-1)*10)*(1+.06*inheritedForge(s.id))),unit:''};
 if(s.kind==='heal')return{label:'回復HP',value:Math.round((28+(rank-1)*8)*(1+.06*inheritedForge(s.id))),unit:''};
 if(s.kind==='focus')return{label:'1.6倍速',value:Math.round((5+(rank-1))*(1+.06*inheritedForge(s.id))*10)/10,unit:'秒'};
 if(s.kind==='parry')return{label:'受け流し',value:Math.round((1+(rank-1)*.15)*(1+.06*inheritedForge(s.id))*100)/100,unit:'秒'};
 const value=s.id==='nova'?Math.round(darkCrashDamage(rank)):s.id==='dawn'?Math.round(dawnDamage(rank)):Math.round((s.damage||0)*skillPower(s,rank));return{label:s.id==='dawn'?'中央威力':s.kind==='flurry'?'3連合計':s.kind==='field'?'1回の威力':s.kind==='orbit'?'接触威力':s.kind==='wisp'?'1発の威力':'威力',value:s.kind==='flurry'?capSkillDamage(prepareSkillDamage(s.id,value),s.id)*3:capSkillDamage(prepareSkillDamage(s.id,value),s.id),unit:''};
}
function passiveComparison(id,rank){
 const n=rank||0,after=n+1,values={ultimatePower:['覚醒持続','秒',8+n,9+n],charge:['蓄積速度','%',100+25*n,125+25*n],power:['攻撃力','',Math.round(p.power*165),Math.round((p.power+.15)*165)],haste:['通常攻撃間隔','秒',.43*.9**n,.43*.9**after],reach:['剣の射程','%',100+12*n,100+12*after],vital:['最大HP','',p.maxHp,p.maxHp+18],armor:['被ダメ軽減','',p.armor,p.armor+1],crit:['会心率','%',Math.round(p.crit*100),Math.round((p.crit+.1)*100)],critpower:['会心倍率','倍',p.critPower,p.critPower+.3],leech:['撃破時HP回復','',p.leech,p.leech+2],magicpower:['属性威力','%',Math.round(p.magicPower*100),Math.round((p.magicPower+.15)*100)],mana:['最大MP','',p.maxMp,p.maxMp+6],cooldown:['再使用時間','%',Math.round(p.cooldownFactor*100),Math.round(p.cooldownFactor*.92*100)],perfect:['回避受付','秒',p.justWindow,p.justWindow+.03],counter:['反撃猶予','秒',p.counterDuration,p.counterDuration+.7],killshield:['撃破時バリア','',p.killShield,p.killShield+2],magnet:['吸引範囲','',p.magnet,p.magnet+90]};
 const [label,unit,before,end]=values[id];return{label,unit,before,after:end};
}
const statNumber=v=>Number.isInteger(v)?String(v):Number(v.toFixed(2)).toString();
function currentStatsHTML(s,rank){const m=skillPrimary(s,rank);return '<div class="metric-row"><span>'+m.label+'</span><strong>'+statNumber(m.value)+m.unit+'</strong></div><div class="metric-row"><span>再使用 / 消費MP</span><strong>'+statNumber(skillCooldown(s,rank))+'秒 / '+s.mp+'</strong></div>'}
function comparisonHTML(s,rank){
 if(s.category==='passive'){if(s.id==='reach'||s.id==='magnet'){const labels=['標準','広い','さらに広い','とても広い'];return '<div class="metric-row"><span>'+(s.id==='reach'?'届く範囲':'回収する範囲')+'</span><strong>'+labels[rank]+' → <em>'+labels[rank+1]+'</em></strong></div>'}const m=passiveComparison(s.id,rank);return '<div class="metric-row"><span>'+m.label+'</span><strong>'+statNumber(m.before)+'<i> → </i><em>'+statNumber(m.after)+m.unit+'</em></strong></div>'}
 const next=skillPrimary(s,rank+1),old=rank?skillPrimary(s,rank):null,cd=skillCooldown(s,rank+1),oldCd=rank?skillCooldown(s,rank):null;
 return '<div class="metric-row"><span>'+next.label+'</span><strong>'+(old?statNumber(old.value)+'<i> → </i>':'')+'<em>'+statNumber(next.value)+next.unit+'</em></strong></div><div class="metric-row"><span>再使用</span><strong>'+(oldCd?statNumber(oldCd)+'<i> → </i>':'')+'<em>'+statNumber(cd)+'秒</em></strong></div><div class="metric-row"><span>消費MP</span><strong>'+s.mp+'</strong></div>';
}

const POTION={price:80,hp:45,mp:12};
function enemyVisible(e){
 const scale=view.scale*(reduced?1:combat.zoom),x=view.w/2+(e.x-cam.x)*scale,y=view.h/2+(e.y-cam.y)*scale*CAMERA.depth;
 return e.hp>0&&x>0&&x<view.w&&y>85&&y<view.h-110;
}
function visibleEnemyCount(){return enemies.filter(enemyVisible).length}
function reinforcementReady(){if(game.singleStage){if(isBossStage()||!game.active||game.phase!=='combat'||game.wave>=game.waves||game.waveQueued)return false;return enemies.filter(e=>e.hp>0).length===0||(game.kills-game.waveEntryKills>=Math.ceil(game.waveInitial*.7)&&visibleEnemyCount()<=Math.max(2,Math.floor(game.waveInitial*.2)))}
 if(isBossStage()||!game.active||game.phase!=='combat'||game.wave!==1||game.waveQueued)return false;
 const initial=game.waveInitial||1,defeated=game.kills-game.waveEntryKills,limit=Math.max(2,Math.floor(initial*.3));
 return enemies.filter(e=>e.hp>0).length===0||(defeated>=Math.ceil(initial*.55)&&visibleEnemyCount()<=limit);
}
function gainExperience(amount){
 if(game.singleStage&&game.finalBossDefeated)return;
 if(game.singleStage&&!isBossStage())amount=Math.max(1,Math.round(amount*[.85,1,1.08,1.18][clamp(game.room-1,0,3)]));p.xp+=amount;game.totalXP+=amount;
 while(p.xp>=p.xpNext){p.xp-=p.xpNext;p.lv++;p.xpNext=game.singleStage?stageExperienceThreshold(p.lv):Math.ceil(p.xpNext*1.45);playCue('level');p.maxHp+=6;game.restHealing=(game.restHealing||0)+6;game.pendingChoices++;game.choiceDelay=.22;p.invuln=Math.max(p.invuln,.3);floating(p.x,p.y-140,'LEVEL UP! Lv.'+p.lv,'#fff0a9',true);log('経験値がたまった！ Lv.'+p.lv+'に成長。スキルを1つ選べる。','good')}
}
function flushLevelChoices(){if(finishTempleDraft())return;if(game.finalBossDefeated){game.pendingChoices=0;return}if(growthPresentationBusy()||game.bossScene||game.mode!=='play'||game.stage>=STAGES.length||game.phase==='bossIntro')return;if(game.pendingChoices>0&&game.choiceDelay<=0)openDraft()}
function prepareBoss(){
 if(game.bossPrepared)return;if(game.singleStage){prepareBossScene();return}game.bossPrepared=true;game.phase='bossIntro';game.phaseTimer=preferences.shortCinematics?1.2:2.8;startEpicEvent('強敵襲来',REGIONS[game.region||0].boss,REGIONS[game.region||0].color,game.phaseTimer);clearHostiles();fields=[];bolts=[];scheduled=[];enemies=[];resetInput();
 document.querySelector('.scene').classList.add('boss-arrival');banner('ボス出現！',game.singleStage?game.region===3?'二体の守護者 — 同時決戦':REGIONS[game.region].boss+' — 5区画目の決闘':game.stage===4?'月影の守護者 — 一対一の決闘':'結晶の巨兵 — 最後の決闘',1.7);tone(110,.6,'triangle',.06);updateUI();
}
function restoreHealth(amount){if(game.active){game.restHealing=Math.min(p.maxHp*.35,(game.restHealing||0)+amount);return}p.hp=Math.min(p.maxHp,p.hp+amount)}
function usePotion(){
 if(!game.campReady||game.active||!p.potions||p.potionCd>0||p.hp>=p.maxHp&&p.mp>=p.maxMp)return false;
 const hp=Math.min(POTION.hp,p.maxHp-p.hp),mp=Math.min(POTION.mp,p.maxMp-p.mp);p.potions--;p.potionCd=game.active?6:0;p.hp+=hp;p.mp+=mp;
 floating(p.x,p.y-110,'HP +'+Math.round(hp)+' / MP +'+Math.round(mp),'#b8ffda',true);particle(p.x,p.y,'#aaffce',20,100);tone(760,.2);log('ポーションを飲んだ！ HPとMPが回復。','good');updateUI();return true;
}
function buyPotion(drink=false){
 if(game.mode!=='shop'||game.gold<POTION.price||game.shopStock<=0||(!drink&&p.potions>=3)||drink&&(p.potionCd>0||p.hp>=p.maxHp&&p.mp>=p.maxMp))return false;
 const oldGold=game.gold;game.gold-=POTION.price;animateGoldChange('run',oldGold,game.gold);game.goldSpent+=POTION.price;game.shopStock--;p.potions++;if(drink)usePotion();tone(920,.1);openShop();updateUI();return true;
}
function openShop(){if(game.singleStage)return;
 if(!game.campReady||game.active||!['play','camp','shop'].includes(game.mode))return;game.mode='shop';
 const can=game.gold>=POTION.price&&game.shopStock>0,needed=p.potionCd<=0&&(p.hp<p.maxHp||p.mp<p.maxMp);
 openModal('<div class="eyebrow">TRAVEL MERCHANT</div><h2>旅のポーション商店</h2><p>HPとMPをまとめて回復。購入中は一時停止。<br>使ったゴールドも、獲得分としてスコアに残ります。</p><div class="shop-wallet"><span>所持ゴールド</span><strong>'+goldCounterMarkup(game.gold,'run')+' G</strong></div><div class="shop-item"><div class="shop-potion">✚</div><div><strong>冒険のポーション</strong><p>HPを45、MPを12回復。<br>所持：'+p.potions+' / 3本 · 在庫：'+game.shopStock+'本</p></div><b>80 G</b></div><div class="shop-preview">HP '+Math.ceil(p.hp)+' → '+Math.min(p.maxHp,Math.ceil(p.hp+POTION.hp))+' / MP '+Math.floor(p.mp)+' → '+Math.min(p.maxMp,Math.floor(p.mp+POTION.mp))+'</div><div class="shop-actions"><button id="buyStock" '+(!can||p.potions>=3?'disabled':'')+'>購入して持っておく</button><button id="buyDrink" '+(!can||!needed?'disabled':'')+'>購入して今飲む</button></div>'+(game.shopStock<=0?'<p class="shop-shortage">売り切れ。次のステージに入ると2本補充します。</p>':game.gold<POTION.price?'<p class="shop-shortage">購入にはあと'+(POTION.price-game.gold)+' G必要です。</p>':'')+'<p class="shop-shortage">最大3本所持。回復できるのは戦闘後のみ。'+(p.potionCd>0?'あと'+p.potionCd.toFixed(1)+'秒。':'')+'</p><button id="closeShop" class="cta">準備に戻る</button><div class="keyboard-hint">E：手持ちのポーションを飲む / Esc：戻る</div>');
 $('modal').classList.add('shop-modal');$('buyStock').onclick=()=>buyPotion(false);$('buyDrink').onclick=()=>buyPotion(true);$('closeShop').onclick=closeShop;
}
function closeShop(){if(game.mode!=='shop')return;showCamp()}
function calculateResult(win){if(game.singleStage)return stageResult(win);
 const parts={kills:game.kills*100,experience:game.totalXP*4,gold:game.goldEarned*5,stages:game.cleared*1000,technique:game.perfects*100+game.maxCombo*25,clear:win?10000:0,time:win?Math.max(0,Math.round((360-game.time)*20)):0};
 const score=Object.values(parts).reduce((sum,n)=>sum+n,0),rank=score>=96000?'S':score>=80000?'A':score>=55000?'B':score>=25000?'C':'D';
 return{score,rank,parts,time:game.time,win};
}
const friendlyDescriptions={
 crescent:'前方を広く薙ぎ払う。MP不要で気軽に使える基本の剣技。',whirl:'自分の周囲をぐるりと斬る。囲まれたときに強い。',pierce:'遠くまで届く鋭い突き。一直線に並んだ敵を貫く。',flurry:'近くの前方へ素早い3連撃。大きな隙に畳みかける。',dash:'前へ踏み込み、進路の敵をまとめて斬る。',cross:'縦横の十字を斬り払う。横から迫る敵も巻き込む。',wave:'遠くまで飛ぶ斬撃。複数の敵を貫通する。',orbit:'しばらく2本の剣が周囲を回る。近づいた敵を自動で斬る。',blood:'前方を斬る。命中するほど、戦闘後に回復するHPが増える。',execute:'近くの敵へ強力な一刀。弱った敵にはさらに大ダメージ。',flame:'前方へ炎の斬撃。命中した敵はしばらく燃え続ける。',frost:'周囲の広い範囲を凍てつかせ、敵の移動を遅くする。',thunder:'遠くの敵へ大剣を落とし、周囲もまとめて攻撃する。',meteor:'狙った場所へ少し遅れて隕石が落下。広範囲を爆発で包む。',chain:'雷が近くの敵へ次々と跳ぶ。散らばった群れに強い。',tornado:'竜巻で敵を引き寄せ、しばらく連続ダメージを与える。',rain:'狙った場所に剣の雨を降らせ、広範囲を繰り返し攻撃する。',quake:'さらに広い範囲の地面を砕き、敵の動きを一時的に止める。',nova:'魔王の確定報酬。単体を砕く闇の剣。Lv.3の真・で封印解放。',guard:'ダメージを肩代わりするバリアをまとう。攻め込む前に。',parry:'短時間だけ受け流しの構え。攻撃を防ぐと周囲へ反撃する。',heal:'戦闘後の休憩でHPを回復。戦闘中には使えない。',blink:'近くの敵の背後へ瞬間移動し、その周囲を斬る。',wisp:'光の精霊を呼び、しばらく近くの敵を自動で射撃する。',focus:'しばらく通常攻撃が速くなる。群れやボスを斬り続けたいときに。',reach:'剣がより広い範囲へ届くようになる。',magnet:'遠くの金貨や雫を回収しやすくなり、獲得ゴールドも増える。',mana:'最大MPが増え、MPの自動回復もさらに速くなる。'
};
for(const s of SKILLS)if(friendlyDescriptions[s.id])s.desc=friendlyDescriptions[s.id];
function areaLabel(s){if(s.id==='dawn')return campaign.dawnUpgrade?'全敵・射程制限なし':'最大広範囲 · 周囲 '+Math.round(dawnRadius());if(s.id==='nova')return '単体 · 間合い '+Math.round(skillReach((p.learned.nova||0)>=3?480:260));const r=resolvedSkill(s);if(r.range)return(s.kind==='chain'?'連鎖 · ':s.kind==='cross'?'十字 · ':'')+'間合い '+Math.round(r.range);if(r.r)return '周囲 '+Math.round(r.r);return '自分を強化'}

// Run contents use their own generator, independent of rendering particles.
for(const id of AUTO_IDS){const s=getSkill(id);s.desc=({orbit:'自動で双剣が周回し、近くの敵を斬る。',wisp:'自動で精霊が現れ、近くの敵を撃つ。',guard:'敵が近いと自動でバリアを張る。',focus:'敵が近いと自動で通常攻撃が速くなる。'})[id]+' スロット・MP不要。'}
function runRandom(){let t=game.rng=(game.rng+0x6D2B79F5)>>>0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
function runRange(a,b){return a+runRandom()*(b-a)}
const PATHS=[
 {id:'blade',name:'剣舞',color:'#86e7ff',ids:'crescent whirl pierce flurry dash cross wave orbit execute dawn power haste reach crit critpower ultimatePower',small:'5回命中で、近くへ追撃の斬波',large:'斬波が強くなり、さらに広く届く'},
 {id:'storm',name:'雷鳴',color:'#dbbaff',ids:'thunder chain frost tornado rain quake magicpower mana cooldown charge',small:'攻撃技の命中後、近くの敵へ追加の雷',large:'追加の雷が強くなり、もう1体へ連鎖'},
 {id:'ember',name:'紅蓮',color:'#ffad83',ids:'flame meteor blood nova leech',small:'攻撃技の命中で炎上。燃える敵を倒すと爆発',large:'炎上と撃破時の爆発が強くなる'},
 {id:'ward',name:'見切り',color:'#a9f4bb',ids:'guard parry heal blink wisp focus vital armor perfect counter killshield magnet',small:'ジャスト回避でバリアを獲得',large:'回避のバリアが強まり、休憩時のHP回復も増える'}
];
function skillPath(id){return PATHS.find(path=>path.ids.split(' ').includes(id))}
function pathPoints(id){const path=PATHS.find(a=>a.id===id);return path.ids.split(' ').reduce((n,id)=>n+(p.learned[id]||0),0)}
function pathTier(id){const n=pathPoints(id);return n>=6?2:n>=3?1:0}
function pathsHTML(){return '<div class="path-grid">'+PATHS.map(a=>{const n=pathPoints(a.id),tier=pathTier(a.id);return '<div class="path-card '+(tier?'active':'')+'" style="--path-color:'+a.color+'"><b>'+a.name+' <span>'+n+' / '+(tier===2?'完成':tier===1?'6':'3')+'</span></b><small>'+(tier===2?a.large:tier===1?a.small+'。6でさらに強化':a.small)+'</small></div>'}).join('')+'</div>'}
const EVOLUTIONS={crescent:['3回使うごとに蒼い刃の威力＋18','ジャスト回避後の反撃が広い蒼い一閃に'],chain:['雷がさらに多くの敵へ跳ぶ','最後の敵の周囲に落雷'],blood:['斬った敵がしばらく出血する','戦闘後のHP回復が増える'],frost:['凍結が長く続く','凍った敵へ追加の氷撃'],wave:['貫通する敵の数が増える','扇状に3本の斬撃を放つ'],guard:['バリアを厚くする','バリア展開時に周囲を押し返す']};
function evolutionText(s,rank){const a=EVOLUTIONS[s.id];return a?(rank>=2?'進化：'+a[1]:rank===1?'強化：'+a[0]:'Lv.2で '+a[0]):''}
function applyResonance(e,heavy,proc){
 if(proc)return;
 const blade=pathTier('blade');if(blade&&++p.bladeHits%5===0&&p.resonanceCd.blade<=0){p.resonanceCd.blade=.35;game.resonances++;effects.push({kind:'nova',x:p.x,y:p.y,r:blade===2?185:135,life:.3,max:.3,color:'#93eaff'});for(const a of enemies)if(a.hp>0&&distance(p,a)<(blade===2?185:135)&&coverClear(p,a))hurtEnemy(a,(blade===2?16:9)*p.power,false,'#93eaff',true)}
 const storm=pathTier('storm');if(storm&&heavy&&p.resonanceCd.storm<=0){p.resonanceCd.storm=.8;game.resonances++;let from=e;const hit=new Set([e.id]);for(let i=0;i<(storm===2?2:1);i++){const a=nearest(200,from,hit);if(!a)break;effects.push({kind:'beam',x:from.x,y:from.y,ex:a.x,ey:a.y,color:'#ddbaff',life:.2,max:.2});hurtEnemy(a,(storm===2?16:10)*p.magicPower,false,'#ddbaff',true,true,false,'lightning');hit.add(a.id);from=a}}
 if(heavy&&pathTier('ember')&&e.hp>0){e.burn=Math.max(e.burn,3);e.burnTick=0;e.resonanceBurn=true}
}
function onBurnDefeat(e){const tier=pathTier('ember');if(!tier||!e.resonanceBurn||p.resonanceCd.ember>0)return;p.resonanceCd.ember=.15;game.resonances++;effects.push({kind:'nova',x:e.x,y:e.y,r:tier===2?150:105,color:'#ffae80',life:.4,max:.4});for(const a of enemies)if(a.hp>0&&distance(e,a)<(tier===2?150:105))hurtEnemy(a,tier===2?24:14,true,'#ffae80',true,true,false,'fire')}
const STAGE_THEMES=[
 {title:'草原の一閃',hint:'群れを引きつけ、蒼月斬でまとめて斬ろう',goal:'一度の技で3体を倒す',key:'multi',target:3},
 {title:'石橋の見切り',hint:'突進を横へ避けよう。盾の番人は背後が弱点',goal:'ジャスト回避を1回決める',key:'perfects',target:1},
 {title:'森の祈りを断つ',hint:'緑の支援役を先に倒すと、周りの敵が弱まる',goal:'支援役を2体倒す',key:'totems',target:2},
 {title:'古城の連鎖爆発',hint:'火薬樽で誘爆。第二陣には古城の守護者',goal:'火薬樽を2つ爆発させる',key:'barrels',target:2},
 {title:'月影の決闘',hint:'攻撃を避けてから、隙に斬り返そう',goal:'ボスの隙に技を2回当てる',key:'bossPunishes',target:2},
 {title:'峡谷の射線',hint:'水晶柱で矢を防ぎ、隙を見て背後へ回ろう',goal:'盾の背後へ攻撃を3回当てる',key:'flanks',target:3},
 {title:'熾火の連鎖',hint:'火薬樽と紅蓮の爆発で、鍛冶場を突破しよう',goal:'一度の技で5体を倒す',key:'multi',target:5},
 {title:'嵐を越えて',hint:'左右の射手を遮蔽物で分断しよう',goal:'ジャスト回避を2回決める',key:'perfects',target:2},
 {title:'結晶との決戦',hint:'ボスが攻撃した直後は、大技を当てる好機',goal:'ボスの隙に技を3回当てる',key:'bossPunishes',target:3}
];
function activeTheme(){return game.singleStage?(isBossStage()?{title:'ボスとの決闘',hint:REGIONS[game.region].boss+'の攻撃後を狙おう',goal:'攻撃後の隙に技を2回当てる',key:'bossPunishes',target:2}:{title:roomRole().name+' · 区画'+game.room,hint:roomRole().hint,goal:roomRole()===ROOM_ROLES.elite?'精鋭を2体倒す':'一度の技で3体を倒す',key:roomRole()===ROOM_ROLES.elite?'eliteKills':'multi',target:roomRole()===ROOM_ROLES.elite?2:3}):STAGE_THEMES[game.stage]}
function startStage(){const st=activeTheme();game.stageStart={eliteKills:game.eliteKills,flanks:game.flanks,perfects:game.perfects,totems:game.totems,barrels:game.barrels,bossPunishes:game.bossPunishes,time:game.time};game.stageMulti=0;game.stageCombo=0;game.stageGoalDone=false;game.shopStock=2;banner(st.title,st.hint,2);log((game.singleStage?'区画 '+game.room:'STAGE '+(game.stage+1))+'：'+st.hint,'good')}
function stageGoalProgress(){const t=activeTheme();if(!t||!game.stageStart)return 0;return t.key==='multi'?game.stageMulti:t.key==='combo'?game.stageCombo:game[t.key]-game.stageStart[t.key]}
function updateStageGoal(){const st=activeTheme();if(!st||!game.stageStart||game.stageGoalDone||stageGoalProgress()<st.target)return;game.stageGoalDone=true;game.goals++;const gold=gainGold(40);p.mp=Math.min(p.maxMp,p.mp+3);floating(p.x,p.y-145,'目標達成 +'+gold+' G','#ffedab',true);log('任意目標達成！ '+st.goal+'。'+gold+' GとMPを獲得。','good')}
function openRoute(){if(game.singleStage){openFieldGuide();return}if(game.mode!=='play')return;game.mode='route';openModal('<div class="eyebrow">YOUR JOURNEY</div><h2>9の地を巡る旅</h2><div class="journey-list">'+STAGES.map((s,i)=>'<div class="'+(i<game.cleared?'done':i===game.stage?'current':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b><section><strong>'+s.name+(s.boss?' · BOSS':'')+'</strong><small>'+STAGE_THEMES[i].hint+'</small></section><span>'+(i<game.cleared?'✓':i===game.stage?'現在地':'')+'</span></div>').join('')+'</div><button class="cta" id="closeRoute">冒険に戻る</button>');$('modal').classList.add('route-modal');$('closeRoute').onclick=closeRoute}
function closeRoute(){if(game.mode!=='route')return;game.mode='play';closeModal()}
function objectiveHTML(){const s=activeTheme();return s&&game.active?'任意：'+s.goal+' '+(game.stageGoalDone?'✓':Math.min(s.target,stageGoalProgress())+'/'+s.target):''}

function log(s,type=''){const el=document.createElement('p');el.className=type;el.textContent=s;$('log').append(el);while($('log').children.length>35)$('log').firstChild.remove();$('log').scrollTop=$('log').scrollHeight}
function announce(s){$('announcement').textContent=s}
function banner(title,sub='',time=2.2){$('banner').replaceChildren(document.createTextNode(title));const small=document.createElement('small');small.textContent=sub;$('banner').append(small);bannerTTL=time;$('banner').classList.add('show');announce(title)}
function tone(f=440,d=.12,type='sine',vol=.035,pan=0,music=false){vol*=music?preferences.music:preferences.effects;if(!sounds||vol<=0)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(50,f*.65),audio.currentTime+d);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.00001,vol*.01),audio.currentTime+d);if(!audioBus){audioBus=audio.createDynamicsCompressor();audioBus.threshold.value=-15;audioBus.ratio.value=5;audioBus.connect(audio.destination)}o.connect(g);if(audio.createStereoPanner){const stereo=audio.createStereoPanner();stereo.pan.value=clamp(pan,-1,1);g.connect(stereo);stereo.connect(audioBus)}else g.connect(audioBus);o.start();o.stop(audio.currentTime+d)}catch{}}
function resetInput(){inputBuffer=null;if(p)p.rollHeld=false;keys.clear();joystick={x:0,y:0};$('stick').style.removeProperty('--stick-x');$('stick').style.removeProperty('--stick-y');pointerId=null;padPointerId=null}
function openModal(html,isBook=false,focusSelector='button:not([disabled])'){
 resetInput();syncPlayLayout();const modal=$('modal');modal.classList.remove('draft-modal','equipment-modal','shop-modal','result-modal','settings-modal','route-modal','camp-modal','replacement-modal','stage-select-modal','preparation-modal','chest-modal','finale-reveal-modal','short','collection-modal','pause-modal','growth-modal','inherit-modal','embark-modal','atlas-modal','clear-result','rest-modal','mobile-rest','choosing-relic','compact-map','weapon-modal','world-map-modal','sword-shop-modal','carry-preparation','heaven-reveal','emporium-modal','mission-modal','mission-receipt-modal','eternal-shop-modal','expanded-stock','training-modal','charm-modal');modal.classList.toggle('skillbook-modal',isBook);modal.innerHTML=html;modal.scrollTop=0;$('overlay').hidden=false;
 if(!storageAvailable&&!modal.querySelector('.save-note')){const note=document.createElement('small');note.className='save-note save-error';note.textContent=saveNote();modal.append(note)}const content=modal.firstElementChild;
 if(!isBook)requestAnimationFrame(()=>{if($('overlay').hidden||modal.firstElementChild!==content)return;fitMenuPages();[...modal.querySelectorAll(focusSelector)].find(el=>!el.disabled&&el.getClientRects().length)?.focus({preventScroll:true})});
}
function closeModal(){syncPlayLayout();$('overlay').hidden=true;$('modal').classList.remove('skillbook-modal');cv.focus({preventScroll:true})}
function reset(seed){bossRetrySnapshot=null;
 const runSeed=Number.isInteger(seed)?seed>>>0:(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
 p={ultimate:0,ultimateTime:0,cutin:0,autoSkillTimers:{},skillCharge:null,skillPose:null,castLock:0,hurtRecovery:0,attackRecovery:0,potionCd:0,bladeHits:0,resonanceCd:{blade:0,storm:0,ember:0},skillCasts:{},swing:0,swingHeavy:false,swingSide:1,swingFace:{x:0,y:-1},x:380,y:WORLD.start,r:17,hp:90,maxHp:90,xp:0,xpNext:24,mp:24,maxMp:24,potions:1,lv:1,power:1,autoInterval:.43,autoCd:.2,reach:1,magicPower:1,leech:0,armor:0,crit:.05,critPower:1.7,manaRegen:.35,cooldownFactor:1,magnet:180,goldBonus:0,killShield:0,shield:0,shieldTime:0,parry:0,focus:0,wisp:0,wispCd:0,face:{x:0,y:-1},rollDir:{x:0,y:-1},rollTime:0,dodgeAge:99,invuln:0,justWindow:.22,perfectCd:0,counter:0,counterDuration:3.5,points:0,learned:{crescent:1},loadout:['crescent',null,null],nextReplace:1,skillCooldowns:{},cd:{roll:0},build:[]};
 game={pendingReplacement:null,equipFlash:null,campReady:false,restHealing:0,styleApplied:false,style:selectedStyle,tutorialDone:false,seed:runSeed,rng:runSeed,resonances:0,bossPunishes:0,goals:0,stageStart:null,stageGoalDone:false,stageMulti:0,stageCombo:0,shopStock:2,choiceDelay:0,goldEarned:0,goldSpent:0,totalXP:0,pendingChoices:0,bossPrepared:false,result:null,waveInitial:0,waveEntryKills:0,waveQueued:false,blocks:0,flanks:0,totems:0,eliteKills:0,bossFallen:false,damageTaken:0,damageDealt:0,hitsTaken:0,skillUses:0,rolls:0,combatTime:0,barrels:0,spawnPlan:[],offers:[],drafts:0,attacks:0,goldFraction:0,mode:'start',phase:'travel',phaseTimer:0,wave:0,waves:2,stage:0,active:false,cleared:0,kills:0,gold:0,combo:0,comboTime:0,maxCombo:0,perfects:0,time:0,furthest:WORLD.start,clearedKills:0};
 clearPlayerAilments();enemies=[];drops=[];effects=[];texts=[];warnings=[];fields=[];bolts=[];scheduled=[];hostileShots=[];hazards=[];elapsed=0;hitstop=0;shake=0;bannerTTL=0;uiClock=0;combat={slow:0,flash:0,flashColor:'190,232,255',trail:0,zoom:1};book={tab:'all',query:'',pending:null,returnMode:'play'};
 document.querySelector('.scene').classList.remove('boss-arrival','ultimate-cutin','cinematic-playing');if($('sceneSkip'))$('sceneSkip').hidden=true;$('banner').classList.remove('show');$('log').replaceChildren();resetInput();cam={x:380,y:p.y-220};buildTerrain();makeDecor();updateUI();showStart();
}
function showStart(){if(typeof campaign!=='undefined'&&campaign.pending){openChest();return}openModal('<div class="seal">⚔</div><div class="eyebrow">蒼刃の剣士 · EXPANDED EDITION</div><h2>一戦ごとに、強くなる。</h2><p>近づけば自動で斬る。群れには技で一閃。<br>大群、精鋭、宝庫。毎回変わる5区画。<br>5区画目のボスを倒し、新しい力を持ち帰ろう。</p><div class="start-features"><span>☽ 通常攻撃はオート</span><span>✦ 秘宝で戦い方が変わる</span></div><button class="cta" id="startButton">ステージを選ぶ</button><button class="text-button" id="startSettings">操作と設定</button>');$('startButton').onclick=openStageSelect;$('startSettings').onclick=openSettings}
function begin(){applyStyle();game.mode='play';closeModal();log('剣士の冒険がはじまった。まずは上へ！','good');banner('陽だまりの草原へ','通常攻撃はオート。技と短い回避を使おう。',2.2);tone(660,.2)}
function makeDecor(){decor=[];for(let y=60;y<WORLD.start+250;y+=65){for(const side of [-1,1])decor.push({x:side<0?rnd(-100,90):rnd(670,860),y:y+rnd(-20,20),kind:Math.random()<.6?'tree':'rock',size:rnd(.7,1.3),seed:rnd(0,9)});if(Math.random()<.8)decor.push({x:rnd(125,640),y,kind:'grass',size:1,seed:rnd(0,9)})}}
function spawnEnemy(kind,x,y){
 const st=game.singleStage?realmTier():game.stage,table={duelist:[31+st*3,135,7+st*.7],hexer:[29+st*3,85,8+st*.7],harpy:[28+st*3,170,6+st*.7],beetle:[40+st*4,105,8+st*.7],wraith:[26+st*3,115,7+st*.7],goldSlime:[12,285,0],slime:[22+st*3,102,5+st*.7],bat:[20+st*3,155,6+st*.7],archer:[30+st*3,92,6+st*.7],bomber:[28+st*3,85,7+st*.7],shield:[52+st*4,95,8+st*.7],totem:[32+st*3,68,5+st*.7],boss:[st===4?2000:3600,100,st===4?13:17]};
 let [hp,speed,atk]=table[kind]||table.slime;if(game.singleStage&&kind!=='goldSlime'){if(kind!=='boss'){hp*=kind==='slime'?.78:kind==='bat'?.8:.9;atk*=game.region===0?.95:1.2;speed*=game.stage===0?.92:1.08}else hp=REGIONS[game.region].hp;}
 if(game.singleStage&&kind!=='boss'&&kind!=='goldSlime'){const phase=clamp(game.room-1,0,3);hp*=[.64,.85,1.03,1.18][phase];atk*=[.72,.8,.95,1.08][phase];speed*=[.92,.96,1,1.05][phase]}return{id:Math.random(),kind,facing:{x:0,y:1},recoil:0,bossPhase:1,exposed:0,elite:false,name:kind==='boss'&&game.singleStage?REGIONS[game.region].boss:({harpy:'白翼のハーピー',beetle:'角鎧のビートル',wraith:'さまよう亡霊',goldSlime:'金色のスライム',shield:'盾の番人',totem:'灯の祈祷師',boss:game.stage===4?'月影の守護者':'結晶の巨兵',bat:'蒼羽コウモリ',archer:'紫の射手',bomber:'火花キノコ',slime:'青しずく'})[kind],x,y,r:kind==='boss'?42:kind==='slime'?18:16,hp,maxHp:hp,state:'chase',timer:0,cooldown:rnd(.25,1.7),flash:0,spawnTime:0,phase:rnd(0,6),knock:{x:0,y:0},speed,atk,burn:0,burnTick:0,frost:0,stun:0,pattern:0,summons:0};
}
function waveKind(i){if(game.singleStage)return regionEnemyKind();if(game.singleStage&&game.region===2)return ['slime','slime','bomber','bat','shield','slime','bomber'][i%7];if(game.singleStage&&game.region===3)return ['slime','archer','shield','slime','totem','bat'][i%6];if(game.singleStage&&game.region===0)return i%6===5&&game.room>1?'bat':'slime';
 const lists=[['slime','slime','bat','slime','slime'],['slime','bat','shield','slime','bat'],['slime','archer','bat','totem','slime'],['slime','bomber','shield','slime','archer'],['slime','bat','archer','shield','totem','bomber'],['slime','archer','totem','bat','shield'],['slime','bomber','slime','shield','bomber','bat'],['slime','bat','slime','archer','shield']];
 const list=lists[Math.min(game.stage,lists.length-1)];return list[i%list.length];
}
function spawnWave(){
 const boss=isBossStage(),plan=game.spawnPlan.length?game.spawnPlan:scatterPlan(game.wave);game.spawnPlan=[];
 for(const [spawnIndex,point] of plan.entries()){const e=spawnEnemy(point.kind,point.x,point.y);e.spawnTime=boss?.85:1.05;if(game.singleStage){decorateCampaignEnemy(e,spawnIndex);configureRealmBoss(e,spawnIndex);configureDistinctMob(e);}if(game.stage===3&&game.wave===2&&!enemies.some(a=>a.elite)&&point.kind==='shield'){e.elite=true;e.name='古城の守護者';e.hp=e.maxHp=e.hp*2;e.atk+=2}enemies.push(e);particle(e.x,e.y,'#9ce8ff',5,75)}
 if(game.wave===1||game.singleStage){game.waveInitial=plan.length;game.waveEntryKills=game.kills;game.waveQueued=false}game.phase='combat';if(!boss)banner(game.wave===1?(game.singleStage?(realmChapter()||roomRole().name)+' · 開戦':'接敵'):'増援！',game.singleStage&&game.wave===1?roomRole().hint:'',game.wave===1?1.3:.75);log(STAGES[game.stage].name+' · WAVE '+game.wave+'/'+(game.singleStage?game.waves:2)+'：'+plan.length+'体。');updateUI();
}
function encounter(){game.active=true;game.campReady=false;game.bossFallen=false;game.bossPrepared=false;game.wave=1;if(game.singleStage)applyRoomRelic();startStage();if(isBossStage())prepareBoss();else{spawnWave();activateRoomCharm()}}
function clearHostiles(){for(const e of enemies){e.shadowTransit=null;e.shadowMirage=null;e.royalTransit=null;e.royalChain=0;e.demonRush=null;e.nextRush=false;e.attackSequence=null;}cancelSkillCharge();if(game){game.pendingHit=null;game.damageThreat=null;game.royalPressure=null;}for(const e of enemies)if(e.hp>0&&e.state==='windup'){e.state='chase';e.cooldown=.6;e.leapFrom=e.leapTo=null}warnings=[];hostileShots=[];hazards=[];combat.slow=0}
function beginWaveBreak(){
 game.phase='waveBreak';game.phaseTimer=.65;game.waveQueued=true;game.spawnPlan=scatterPlan(game.singleStage?game.wave+1:2);
 banner('増援接近','',.65);tone(740,.15);updateUI();
}
function clearStage(){
 clearHostiles();game.phase='stageClear';game.phaseTimer=game.bossFallen?1.4:.8;game.clearedKills=game.kills;
 updateStageGoal();banner(game.bossFallen?'BOSS 撃破！':game.singleStage?'区画 '+game.room+' CLEAR！':'STAGE '+(game.stage+1)+' CLEAR！','ひと息つこう。',game.phaseTimer);log('群れを一掃！ 関門を突破した！','good');tone(1040,.2);updateUI();
}
function grantStageReward(){if(game.singleStage){completeStageAttempt();return}
 game.active=false;game.cleared++;game.campReady=true;clearHostiles();fields=[];bolts=[];scheduled=[];inputBuffer=null;
 for(const d of drops)if(d.type==='coin')gainGold(d.value);drops=[];
 const recovery=Math.round(p.maxHp*(game.bossFallen?.3:.16))+(game.restHealing||0);p.hp=Math.min(p.maxHp,p.hp+recovery);p.mp=Math.min(p.maxMp,p.mp+7);game.restHealing=0;
 gainGold(50+game.stage*25);game.phase='rest';game.pendingAdvance=true;game.shopStock=2;game.combo=0;game.mode='play';flushLevelChoices();if(game.mode==='play')showCamp();
}
function showCamp(){
 if(!game.campReady||game.active)return;game.mode='camp';
 const last=game.stage===STAGES.length-1;
 openModal('<div class="camp-crest">✦</div><div class="eyebrow">'+(game.bossFallen?'決闘を制した':'STAGE '+(game.stage+1)+' CLEAR')+'</div><h2>装備を変更しますか？</h2><p>HP・MPが少し回復しました。</p><div class="camp-vitals"><span>♥ '+Math.ceil(p.hp)+' / '+p.maxHp+'</span><span>◆ '+Math.floor(p.mp)+' / '+p.maxMp+'</span><span>'+game.gold+' G</span></div><div class="camp-loadout">'+p.loadout.map((id,i)=>'<span><kbd>'+SLOT_KEYS[i]+'</kbd> '+(id?getSkill(id).name+' Lv.'+p.learned[id]:'未装備')+'</span>').join('')+'</div><div class="camp-actions"><button id="campEquip">装備を変更</button><button id="campPotion" '+(!p.potions||p.hp>=p.maxHp&&p.mp>=p.maxMp?'disabled':'')+'>回復する ×'+p.potions+'</button><button id="campShop">ポーション商店</button></div>'+ (p.learned.heal?'<button id="campHealSkill" class="text-button" '+(p.mp<getSkill('heal').mp||p.hp>=p.maxHp?'disabled':'')+'>癒しの光を使う · MP '+getSkill('heal').mp+'</button>':'') +'<button id="campContinue" class="cta">'+(last?'冒険の結果へ':'この装備で次へ')+'</button>');
 $('modal').classList.add('camp-modal');if($('campHealSkill'))$('campHealSkill').onclick=()=>{const s=getSkill('heal');if(p.mp>=s.mp&&p.hp<p.maxHp){p.mp-=s.mp;castSkill(s,1);showCamp()}};$('campEquip').onclick=openSkillBook;$('campShop').onclick=openShop;$('campPotion').onclick=()=>{usePotion();showCamp()};$('campContinue').onclick=continueJourney;requestAnimationFrame(()=>$('campContinue')?.focus({preventScroll:true}));updateUI();
}
function continueJourney(){
 if(game.mode!=='camp'||!game.campReady)return;game.campReady=false;game.pendingAdvance=false;game.stage++;game.phase='travel';game.mode='play';closeModal();
 if(game.stage>=STAGES.length){finish(true);return}flushLevelChoices();updateUI();
}
function particle(x,y,color,count=10,speed=120){if(!visibleWorldCircle(x,y,220))return;count=Math.ceil(count*(preferences.particles??1));count=Math.min(count,Math.max(0,effectBudget()-effects.length));for(let i=0;i<count;i++){const a=rnd(0,Math.PI*2),v=rnd(20,speed);effects.push({kind:'particle',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:rnd(.25,.6),max:.6,color,size:rnd(2,5),z:3,vz:rnd(70,150)})}}
function floating(x,y,text,color='#ffe5a2',big=false){if(preferences.numbers===false&&/^([会心 −+]*\d)/.test(String(text)))return;if(texts.length>40)texts.shift();texts.push({x,y,text:String(text),color,life:.85,max:.85,big})}
function nearest(range,point=p,exclude=new Set()){let result=null,d=range;for(const e of enemies){if(e.hp<=0||exclude.has(e.id))continue;const ed=distance(point,e);if(ed<d){d=ed;result=e}}return result}
function slashEffect(heavy,face,color='#c1f3ff'){p.swing=heavy?.3:.22;p.swingHeavy=heavy;p.swingSide*=-1;p.swingFace={...face};effects.push({kind:'slash',x:p.x,y:p.y,angle:Math.atan2(face.y,face.x),heavy,color,life:.22,max:.22})}
function hurtEnemy(e,amount,heavy=false,color='#fff0af',proc=false,automatic=false,manual=false,element='none',bladeContact=false,skillId=null){
 if(game.bossScene||e.hp<=0||e.spawnTime>0||e.state==='revive')return 0;const divineGlance=game.singleStage&&e.form==='god'&&e.bossPhase!==2&&e.ward>0;if(divineGlance)mirrorGuard(e);amount=prepareSkillDamage(skillId,amount)*outgoingStatusMultiplier();if(!e.catastrophe&&game.singleStage&&e.form==='demon'&&e.awakened&&e.cycle==='assault')amount*=.45;
 if(game.singleStage&&game.weapon==='starfall'&&e.kind==='boss')amount*=1.2;if(game.singleStage)amount*=relicDamage(e,heavy,automatic||proc);const affinity=affinityMultiplier(e,element);amount*=affinity;let guarded=false;if(p.ultimateTime>0)amount*=1.4+.15*forgedPassiveRank('ultimatePower');
 if(e.catastrophe)return hitCatastropheGuard(e,capSkillDamage(amount,skillId)*(game.weapon==='ancient'&&manual&&getSkill(skillId)?.category==='sword'?1.12:1));if(epicBossProtected(e))return 0;
 if(e.kind==='shield'&&e.state!=='recover'){const incoming=norm(p.x-e.x,p.y-e.y),front=incoming.x*e.facing.x+incoming.y*e.facing.y>.25;if(front){amount*=.1;guarded=true;if(e.flash<=0)floating(e.x,e.y-70,'盾！ 背後へ','#cce5ff');game.blocks++}else{amount*=1.25;game.flanks++;}}
 if(e.kind==='boss'&&e.state!=='recover')amount*=e.coreBroken>0?1.3:.65;
 if(e.kind==='boss'&&e.state==='recover'&&e.exposed>0){amount*=1.25;if(heavy&&!proc)game.bossPunishes++;}const critical=!divineGlance&&!guarded&&Math.random()<p.crit,dmg=divineGlance||e.kind==='goldSlime'?1:Math.max(1,capSkillDamage(amount*(critical?p.critPower:1),skillId)),actual=Math.min(e.hp,dmg);e.hp-=dmg;game.damageDealt+=actual;chargeUltimate(actual*.025);if(game.singleStage&&e.kind==='boss'){game.bossDamage+=actual;e.xpDamage=(e.xpDamage||0)+actual;if(e.hp>0&&e.xpDamage>=e.maxHp*.25){e.xpDamage-=e.maxHp*.25;gainExperience(Math.ceil(p.xpNext*.55))}}e.flash=.14;e.recoil=.14;recordBladeImpact(e,{heavy,color,proc,automatic,manual,bladeContact,guarded,critical,weak:affinity>1&&!guarded});
 const weak=affinity>1&&!guarded&&!divineGlance;if(divineGlance||heavy&&!automatic||critical||weak)floating(e.x,e.y-36,(weak?'弱点！ ':'')+(critical?'会心 ':'')+dmg,weak?'#ffdb83':critical?'#ffe26c':color,heavy||critical||weak);const dir=norm(e.x-p.x,e.y-p.y),force=e.kind==='boss'?.2:1;
 e.knock={x:dir.x*(guarded?360:heavy?185:48)*force,y:dir.y*(guarded?360:heavy?185:48)*force};particle(e.x,e.y-15,color,heavy?5:2,heavy?220:90);
 effects.push({kind:'burst',x:e.x,y:e.y-18,life:.2,max:.2,r:heavy?38:18,color});
 if(!reduced&&!automatic&&!proc){shake=Math.max(shake,critical?3:heavy?1.6:0)}
 if(impactClock<=0){playBladeContact(e,{heavy,critical,weak,guarded,contact:bladeContact||manual&&!automatic&&!proc});tone(e.kind==='boss'?110:e.kind==='shield'?180:critical?780:heavy?260:420,.055,'triangle',heavy?.025:.012,clamp((e.x-p.x)/300,-.8,.8));impactClock=.045}
 if(heavy&&(!combat.hitFxClock||combat.hitFxClock<=0)){combat.hitFxClock=.045;effects.push({kind:'hitstar',x:e.x,y:e.y-22,r:45,angle:Math.atan2(dir.y,dir.x),color,life:.19,max:.19})}if(heavy){combat.flash=Math.max(combat.flash,.035);combat.flashColor='190,240,255'}if(!proc&&heavy&&pathTier('ember'))e.resonanceBurn=true;if(e.hp<=0)kill(e,automatic||proc);applyResonance(e,heavy,proc);return actual;
}
function kill(e,automatic=false){
 if(interceptBossDefeat(e))return;
 if(game.singleStage&&isFinalRoom()&&e.kind==='boss'&&!enemies.some(other=>other!==e&&other.kind==='boss'&&other.hp>0)){game.finalBossDefeated=true;game.pendingChoices=0;game.offers=[];game.pendingReplacement=null;}
 effects.push({kind:'defeat',x:e.x,y:e.y,body:e.kind,dir:norm(e.x-p.x,e.y-p.y),life:.38,max:.38,color:e.kind==='boss'?'#f6d581':e.kind==='bat'?'#caa0ff':'#a3e8ff'});
 if(e.shadowMaster!=null){particle(e.x,e.y,'#c8b7f1',10,120);return}
 if(e.kind==='goldSlime'){gainExperience(120);const gold=gainGold(80);floating(e.x,e.y-95,'超レア撃破！ EXP +120 / '+gold+' G','#ffe59f',true)}if(e.kind==='totem')game.totems++;if(e.elite){game.eliteKills++;const gold=gainGold(60);floating(e.x,e.y-100,'強敵撃破 +'+gold+' G','#ffe7a0',true)}
 onBurnDefeat(e);
 chargeUltimate(e.kind==='boss'?20:3);game.kills++;gainExperience(e.kind==='boss'?75:e.elite?24:e.kind==='slime'?4:e.kind==='bat'?5:6);game.combo=game.comboTime>0?game.combo+1:1;game.comboTime=3.5;game.stageCombo=Math.max(game.stageCombo,game.combo);game.maxCombo=Math.max(game.maxCombo,game.combo);particle(e.x,e.y,e.kind==='bat'?'#cd9fff':'#6fd6ff',8,210);
 if(e.kind==='boss'&&!game.bossFallen&&!enemies.some(other=>other!==e&&other.hp>0&&other.kind==='boss')){game.bossFallen=true;game.wave=2;game.phase='combat';game.waveQueued=true;game.spawnPlan=[];clearHostiles();for(const a of enemies)if(a!==e&&a.hp>0){a.hp=0;kill(a)}if(game.singleStage)beginBossScene('defeat',e);banner('BOSS 撃破！','灯火の結晶を取り戻そう。',1.6)}
 if(!reduced){shake=Math.max(shake,e.kind==='boss'?9:1.5);hitstop=Math.max(hitstop,e.kind==='boss'?.13:0)}
 for(let i=0;i<(e.kind==='boss'?15:3);i++){const a=rnd(0,Math.PI*2);drops.push({x:e.x,y:e.y,vx:Math.cos(a)*rnd(70,150),vy:Math.sin(a)*rnd(70,150),age:0,type:'coin',value:game.combo>=3?4:3})}
 drops.push({x:e.x+10,y:e.y,vx:20,vy:-40,age:0,type:'mana',value:2});if(p.leech){restoreHealth(p.leech)}
 if(p.killShield){p.shield=Math.min(20,p.shield+p.killShield);p.shieldTime=6}
 if(game.combo===3||game.combo%5===0){floating(e.x,e.y-82,game.combo+' CHAIN','#ffcf7d',true);tone(520+Math.min(game.combo,8)*80,.1,'sine',.025,clamp((e.x-p.x)/300,-.85,.85))}else tone(430,.1,'triangle',.025,clamp((e.x-p.x)/300,-.85,.85));
}
function autoAttack(){
 const e=nearest(125*p.reach,p,new Set(enemies.filter(a=>!coverClear(p,a)).map(a=>a.id))),barrel=terrain.find(t=>t.kind==='barrel'&&!t.broken&&distance(t,p)<125*p.reach&&coverClear(p,t)),aim=e||barrel;if(!aim)return;
 const bladeBoost=prepareStyleStrike();p.attackRecovery=.12;p.face=norm(aim.x-p.x,aim.y-p.y);slashEffect(false,p.face,game.singleStage?getWeapon().color:'#c1f3ff');const hit=[];
 for(const target of enemies){const n=norm(target.x-p.x,target.y-p.y);if(distance(p,target)<125*p.reach&&n.x*p.face.x+n.y*p.face.y>0&&coverClear(p,target)){if(hurtEnemy(target,13*p.power*bladeBoost,false,'#fff0af',false,true,false,weaponElement(),true)>0)hit.push(target)}}
 if(hit.length)completeStyleStrike();if(game.singleStage)weaponStrike(hit);
 for(const t of terrain)if(t.kind==='barrel'&&!t.broken&&distance(t,p)<125*p.reach){const n=norm(t.x-p.x,t.y-p.y);if(n.x*p.face.x+n.y*p.face.y>0)explodeBarrel(t)}p.autoCd=p.autoInterval/(p.focus>0?1.6:1);tone(340,.06,'triangle',.02);
}
function warningContains(w,point=p,padding=p.r*.5){if(w.kind==='fan'){const dx=point.x-w.x,dy=point.y-w.y,d=Math.hypot(dx,dy),along=dx*w.dir.x+dy*w.dir.y;return d<w.length+padding&&along> -padding&&(d<25||Math.acos(clamp(along/(d||1),-1,1))<w.spread+Math.atan2(padding,d))}if(w.kind==='circle'||w.kind==='bullet')return Math.hypot(point.x-w.x,point.y-w.y)<w.r+padding;if(w.kind==='ring'){const d=Math.hypot(point.x-w.x,point.y-w.y);return d<w.r+padding&&d>w.inner-padding;}const dx=point.x-w.x,dy=point.y-w.y,along=dx*w.dir.x+dy*w.dir.y,across=Math.abs(dx*w.dir.y-dy*w.dir.x);return along>-15-padding&&along<w.length+padding&&across<w.width/2+padding}
function perfectDodge(w){
 if(w.perfectUsed||p.perfectCd>0||!enemies.some(e=>e.id===w.owner&&e.hp>0))return false;
 w.perfectUsed=true;if(game.singleStage&&game.region===3){const boss=enemies.find(e=>e.id===w.owner&&e.kind==='boss');if(boss){boss.coreBroken=3.5;floating(boss.x,boss.y-135,'核心露出！','#a4f7ff',true)}}p.perfectCd=1.5;p.counter=p.counterDuration;const ward=pathTier('ward');if(ward){p.shield=Math.max(p.shield,ward===2?24:12);p.shieldTime=6;if(ward===2)restoreHealth(5);game.resonances++}p.mp=Math.min(p.maxMp,p.mp+5);for(const id of Object.keys(p.skillCooldowns))p.skillCooldowns[id]=0;
 combat.slow=1.25;combat.flash=.24;combat.flashColor='140,225,255';game.perfects++;playCue('dodge');
 effects.push({kind:'burst',x:p.x,y:p.y-18,life:.6,max:.6,r:130,color:'#aeedff'});particle(p.x,p.y-22,'#c2f2ff',20,180);banner('JUST DODGE','次の技 ×2 · MP消費なし',1.3);log('ジャスト回避！ 次の技が威力2倍。','good');tone(1160,.36,'sine',.06);updateUI();return true;
}
function consumeCounter(){if(p.counter<=0)return 1;p.counter=0;floating(p.x,p.y-110,'COUNTER ×2','#fff0b0',true);return 2}
function movement(){let x=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0)+joystick.x,y=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0)+joystick.y;const len=Math.hypot(x,y);if(len>1){x/=len;y/=len}return{x,y}}
function hitArea(spec){
 spec={...spec,s:resolvedSkill(spec.s)};const {s,boost}=spec,power=skillPower(s)*boost;let hits=0;
 for(const t of terrain)if(t.kind==='barrel'&&!t.broken&&areaContains(spec,t,t.r))explodeBarrel(t);
 for(const e of enemies){if(e.hp<=0||!areaContains(spec,e,e.r))continue;
  if(['cone','line','dash','blood','flurry','cross'].includes(s.kind)&&!coverClear({x:spec.x,y:spec.y},e))continue;
  hurtEnemy(e,s.damage*power,true,s.color,false,!!s.auto,!!s.manual,skillElement(s),false,s.id);hits++;if(s.status==='burn'){e.burn=3;e.burnTick=0}if(s.status==='frost')e.frost=(p.learned[s.id]||1)>=2?5.5:4;if(s.status==='stun')e.stun=1.2;if(s.kind==='blood'){restoreHealth(4+((p.learned.blood||1)>=3&&e.hp<=0?4:0));if((p.learned.blood||1)>=2){e.bleed=3;e.bleedTick=0}}
 }return hits;
}
function castSkill(s,boost){const assisted=skillAimTarget(s,s.range||s.r||500);if(assisted&&isManualSkill(s))p.face=norm(assisted.x-p.x,assisted.y-p.y);if(['meteor','quake','execute'].includes(s.id))signatureRelease(s.id);s=resolvedSkill(s);s={...s,manual:isManualSkill(s)&&p.loadout.includes(s.id)};playerArtSound(s);emitCombatBloom(s);if(s.id==='nova'){castDarkCrash(boost,s.manual);return}if(s.id==='dawn'){castDawnBlade(boost,s.manual);return}if(isManualSkill(s)&&(p.learned[s.id]||0)>=3)trueSkillEffect(s);
 if(s.category!=='passive'&&effects.length<340)effects.push({kind:'sigil',x:p.x,y:p.y,r:isAutoSkill(s)?31:48,color:s.color,life:.28,max:.28});
 const rankNow=p.learned[s.id]||1;p.skillCasts[s.id]=(p.skillCasts[s.id]||0)+1;
 if(s.id==='crescent'&&rankNow>=3&&boost>1)s={...s,range:s.range*1.35};
 if(s.id==='frost'&&rankNow>=3){for(const e of enemies)if(e.hp>0&&e.frost>0&&distance(e,p)<s.r)hurtEnemy(e,16*p.magicPower,true,s.color,true,!!s.auto,!!s.manual,skillElement(s),false,s.id)}
 if(s.id==='crescent'&&rankNow>=2&&p.skillCasts[s.id]%3===0){s={...s,damage:s.damage+18};}
 const target=skillAimTarget(s,s.range||500,!['target','meteor','field','execute'].includes(s.kind));if(target)p.face=norm(target.x-p.x,target.y-p.y);
 const face={...p.face},rank=p.learned[s.id]||1,damageScale=skillPower(s,rank)*boost;
 emitArtMotion(s);let x=p.x,y=p.y;
 if(['target','meteor','field'].includes(s.kind)){x=target?target.x:p.x+face.x*140;y=target?target.y:p.y+face.y*140}
 if(s.kind==='guard'){p.shield=Math.max(p.shield,(35+(rank-1)*10)*boost*(1+.06*inheritedForge(s.id)));p.shieldTime=8;if(s.id==='guard'&&rank>=3){for(const e of enemies)if(distance(e,p)<160){const n=norm(e.x-p.x,e.y-p.y);e.knock={x:n.x*260,y:n.y*260};e.stun=.3}effects.push({kind:'nova',x:p.x,y:p.y,r:160,life:.4,max:.4,color:s.color})}floating(p.x,p.y-110,'BARRIER +'+p.shield,'#98e7ff');return}
 if(s.kind==='parry'){p.parry=(1+(rank-1)*.15)*(1+.06*inheritedForge(s.id));p.parryBoost=boost;floating(p.x,p.y-110,'受け流しの構え','#dff5ff');return}
 if(s.kind==='heal'){if(!game.campReady||game.active)return;const amount=Math.round((28+(rank-1)*8)*(1+.06*inheritedForge(s.id)));p.hp=Math.min(p.maxHp,p.hp+amount*boost);floating(p.x,p.y-110,'HP +'+amount*boost,'#a7ffb3',true);particle(p.x,p.y,'#afffbc',20);return}
 if(s.kind==='focus'){p.focus=(5+(rank-1))*boost*(1+.06*inheritedForge(s.id));floating(p.x,p.y-110,'剣気解放 ×1.6','#ffbfdc',true);return}
 if(s.kind==='wisp'){p.wisp=10+(rank-1)*2;p.wispBoost=boost;p.wispCd=0;return}
 if(s.kind==='orbit'){fields.push({kind:'orbit',s,boost,x:p.x,y:p.y,life:8+(rank-1)*2,clock:0,hitTimes:{}});return}
 if(s.kind==='execute'){if(target){hurtEnemy(target,s.damage*damageScale*(target.hp/target.maxHp<=.35?2.5:1),true,s.color,false,false,s.manual,skillElement(s),false,s.id);effects.push({kind:'thunder',x:target.x,y:target.y,r:55,life:.35,max:.35})}return}
 if(s.kind==='projectile'){const angles=rank>=3?[-.16,0,.16]:[0],base=Math.atan2(face.y,face.x);for(const a of angles)bolts.push({x,y,dir:{x:Math.cos(base+a),y:Math.sin(base+a)},life:s.range/(s.id==='wave'?780:580),speed:s.id==='wave'?780:580,s,boost,hit:new Set(),remaining:s.id==='wave'?(rank>=2?12:8):rank>=2?5:3});return}
 if(s.kind==='chain'){let current={x:p.x,y:p.y},hit=new Set();for(let i=0;i<(rank>=2?7:5);i++){const e=nearest(i?170:s.range,current,hit);if(!e)break;effects.push({kind:'beam',x:current.x,y:current.y,ex:e.x,ey:e.y,color:s.color,life:.28,max:.28});hurtEnemy(e,s.damage*damageScale,true,s.color,false,false,s.manual,skillElement(s),false,s.id);hit.add(e.id);current=e}if(rank>=3&&hit.size){effects.push({kind:'nova',x:current.x,y:current.y,r:100,life:.35,max:.35,color:s.color});for(const e of enemies)if(e.hp>0&&distance(e,current)<100)hurtEnemy(e,20*damageScale,true,s.color,true,!!s.auto,!!s.manual,skillElement(s),false,s.id)}return}
 if(s.kind==='blink'&&target){particle(p.x,p.y,'#cfb2ff',15);const point=safePoint(target.x+face.x*55,clampPlayerY(target.y+face.y*55),p.r);p.x=point.x;p.y=clampPlayerY(point.y);p.invuln=Math.max(p.invuln,.2);x=p.x;y=p.y}
 if(s.kind==='dash'){moveActor(p,face.x*90,face.y*90)}
 if(s.kind==='meteor'){scheduled.push({time:.8,spec:{s,x,y,face,boost}});effects.push({kind:'mark',x,y,r:s.r,color:s.color,life:.8,max:.8});return}
 if(s.kind==='field'){fields.push({kind:'field',s,boost,x,y,life:s.duration,clock:0});return}
 const spec={s,x,y,face,boost};hitArea(spec);
 if(s.kind==='flurry'){scheduled.push({time:.12,spec},{time:.24,spec})}
 if(['cone','blood','flurry'].includes(s.kind)&&s.id!=='crescent')slashEffect(true,face,s.color);
 else if(s.kind==='target')effects.push({kind:'thunder',x,y,r:s.r,life:.7,max:.7});
 else if(['line','dash','cross'].includes(s.kind)){effects.push({kind:'beam',x,y,ex:x+face.x*(s.range||260),ey:y+face.y*(s.range||260),color:s.color,life:.28,max:.28});if(s.kind==='cross')effects.push({kind:'beam',x:x-130,y,ex:x+130,ey:y,color:s.color,life:.28,max:.28})}
 else if(s.id!=='crescent')effects.push({kind:'nova',x,y,r:s.r||130,color:s.color,life:.55,max:.55});
}
function chargeUltimate(amount,reward=false){if(!reward&&(p.ultimateTime>0||p.cutin>0))return;p.ultimate=clamp(p.ultimate+amount*(1+.25*forgedPassiveRank('charge'))*(hasRelic('crown')?1.25:1),0,100)}
function action(type){
 if(game.mode!=='play'||game.singleStage&&!combatActionsAvailable())return;
 if((p.ailments?.paralyze||0)>0&&!['roll','heal'].includes(type))return;if(type==='ultimate'){activateUltimate();return}if(p.cutin>0||game.phase==='bossIntro')return;
 if(type==='heal'){if(!p.potions){openShop();return}usePotion();return}
 if(type==='roll'){if(game.pendingHit&&p.cd.roll<=.12)p.cd.roll=0;
  if(p.cd.roll>0){if(p.cd.roll<=.14)inputBuffer={type,life:.16};return}inputBuffer=null;const input=movement();p.rollDir=Math.hypot(input.x,input.y)>.1?norm(input.x,input.y):{...p.face};
  if(game.singleStage){const dx=p.rollDir.x*12,dy=p.rollDir.y*12;if(!(Math.abs(dx)>.1&&canStand(p.x+dx,p.y,p.r))&&!(Math.abs(dy)>.1&&canStand(p.x,p.y+dy,p.r))){p.cd.roll=.15;return}}
 cancelSkillCharge(true);resolveCoyoteDodge();p.hurtRecovery=0;if(p.ailments)p.ailments.paralyze=0;game.dashFlash=.2;game.rolls++;p.rollTime=.17;p.dodgeAge=0;p.invuln=Math.max(p.invuln,.28);p.cd.roll=hasRelic('feather')?.8:.95;
  const w=warnings.find(w=>!w.perfectUsed&&w.life>0&&w.life<=p.justWindow&&warningContains(w));if(w)perfectDodge(w);else{const bullet=hostileShots.find(b=>distance(b,p)<52&&(p.x-b.x)*b.dir.x+(p.y-b.y)*b.dir.y>0);if(bullet)perfectDodge(bullet)}particle(p.x,p.y,'#cceeff',8,80);tone(230,.12,'triangle',.025);updateUI();return;
 }
 const index=SLOT_NAMES.indexOf(type);if(index<0)return;const id=p.loadout[index];if(!id){banner('経験値でレベルアップ','4択から新しい技を選ぼう。',1);return}
 const s=getSkill(id);if(isAutoSkill(s))return;if(s.kind==='heal'){banner('回復は戦闘後に','',.7);return}if(p.rollTime>0||p.castLock>0||p.hurtRecovery>0||(p.skillCooldowns[id]||0)>0){if(p.castLock<=.14||p.rollTime>0||p.hurtRecovery>0||(p.skillCooldowns[id]||0)<=.14)inputBuffer={type,life:Math.max(.18,p.rollTime+.08,p.castLock+.08,(p.hurtRecovery||0)+.08)};return}inputBuffer=null;const free=p.counter>0;if(!free&&p.mp<s.mp){banner('MPが足りない','青い雫かジャスト回避で回復。',1);return}
 if(beginSkillCharge(s,free))return;if(!free)p.mp-=s.mp;releaseManualSkill(s,free);
}
function takeHit(amount,x,y){
 if(p.invuln>0||game.mode!=='play'||game.bossScene||p.cutin>0)return;if(queueCoyoteHit(amount,x,y))return;
 if(p.parry>0){p.parry=0;p.counter=p.counterDuration;hitArea({s:{kind:'parry',damage:50*(p.parryBoost||1),r:145,color:'#c5edff',category:'sword',id:'parry'},x:p.x,y:p.y,face:p.face,boost:1});effects.push({kind:'nova',x:p.x,y:p.y,r:145,life:.4,max:.4});floating(p.x,p.y-110,'PARRY!','#d0f1ff',true);return}
 let dmg=Math.max(1,Math.round(Math.max(1,amount*(hasRelic('vow')?1.12:1)-Math.min(p.armor,amount*.35))*(p.ultimateTime>0?.5:1)));if(p.shield>0){const absorbed=Math.min(p.shield,dmg);p.shield-=absorbed;dmg-=absorbed;floating(p.x,p.y-110,'防御 '+absorbed,'#a6eaff');if(!dmg){p.invuln=.16;return}}
 dmg=reduceCharmDamage(dmg);p.hurtHud=2;if(game.singleStage){const source=game.hitSource||'接近';game.damageSources[source]=(game.damageSources[source]||0)+dmg;}game.damageTaken+=Math.min(p.hp,dmg);game.hitsTaken++;for(const id of Object.keys(p.skillCooldowns))p.skillCooldowns[id]=Math.max(0,p.skillCooldowns[id]-.25);const before=p.hp;p.hp=Math.max(0,p.hp-dmg);p.hurtRecovery=.07;p.invuln=.8;recordReadableHit(dmg,before);combat.hurt=.25;floating(p.x,p.y-110,'−'+dmg,'#ffb2a4',true);particle(p.x,p.y,'#ffb9af',8,100);tone(100,.16,'triangle',.05);if(!reduced){shake=Math.max(shake,4);hitstop=Math.max(hitstop,.035)};if(game.damageThreat?.ailment&&p.hp>0)applyPlayerAilment(game.damageThreat.ailment);if(!p.hp)finish(false);
}
function enemyWarning(e){
 if(e.shadowReplica){shadowRetainerWarning(e);return}
 if(game.singleStage&&epicEnemyWarning(e))return;if(game.singleStage&&e.kind==='bomber'&&hazards.length>=2){e.cooldown=.35;return}if(warnings.length>=5&&e.kind!=='boss'){e.cooldown=.2;return}
 if(game.singleStage&&e.kind==='boss'&&enemies.some(a=>a!==e&&a.kind==='boss'&&a.hp>0&&a.state==='windup')){e.cooldown=.25;return}
 const aimed=warnings.filter(w=>warningContains(w)).length;if(e.kind!=='boss'&&aimed>=(game.singleStage&&game.region<2?1:2)){e.cooldown=.3;return}
 if(game.singleStage&&e.kind!=='boss'&&game.time<(game.nextAttackAt||0)){e.cooldown=.15;return}if(game.singleStage&&e.kind!=='boss')game.nextAttackAt=game.time+(game.stage<2?.46:.22);e.state='windup';const input=movement(),lead=e.kind==='archer'?.38:e.kind==='bomber'?.42:.24,target={x:clamp(p.x+input.x*205*lead,battleBounds().left+40,battleBounds().right-40),y:p.y+input.y*205*lead},dir=norm(target.x-e.x,target.y-e.y);e.facing=dir;const boosted=enemies.some(a=>a.kind==='totem'&&a.hp>0&&a.id!==e.id&&distance(a,e)<210),base={owner:e.id,dir,atk:Math.round(e.atk*(boosted?1.3:1)),perfectUsed:false};
 function warn(kind,x,y,r,time,extra={}){if(game.singleStage&&game.region<2)time*=e.kind==='boss'?1.15:1.35;if(e.trait==='breaker')time*=1.15;warnings.push({...base,kind,x,y,r,life:time,max:time,...extra});e.timer=time}
 if(distinctMobWarning(e,warn,target,dir))return;if(e.kind==='harpy'){warn('line',e.x,e.y,0,.95,{length:310,width:55,attack:'dash'});return}if(e.kind==='beetle'){warn('line',e.x,e.y,0,1.15,{length:360,width:80,attack:'bossDash'});return}if(e.kind==='wraith'){warn('circle',target.x,target.y,76,1.05,{attack:'pulse'});return}if(e.kind==='slime'){warn('circle',target.x,target.y,e.trait==='breaker'?82:58,.48,{attack:'hop'});return}
 if(e.kind==='bat'){warn('line',e.x,e.y,0,.54,{length:205,width:58,attack:'dash'});return}
 if(e.kind==='archer'){warn('fan',e.x,e.y,0,.62,{length:440,spread:.29,rays:3,attack:'volley'});return}
 if(e.kind==='shield'){warn('line',e.x,e.y,0,.8,{length:150,width:72,attack:'bash'});return}
 if(e.kind==='totem'){warn('circle',p.x,p.y,38,.95,{attack:'pulse'});return}
 if(e.kind==='bomber'){warn('circle',target.x,target.y,76,.78,{attack:'mine'});return}
 if(game.singleStage&&e.form){realmBossWarning(e,warn,target,dir);return}
 const pattern=(e.pattern+++(game.singleStage&&game.region===1?3:0))%(e.bossPhase===2?6:4),pace=e.bossPhase===2?.92:1;
 if(pattern===4){const length=Math.min(460,distance(e,target)+130);warn('line',e.x,e.y,0,.95,{length,width:134,attack:'bossDash'});return}
 if(pattern===5){const center=STAGES[game.stage].y,point=safePoint(clamp(target.x,155,605),clamp(target.y,center-130,center+230),e.r);warn('circle',point.x,point.y,100,1.1,{attack:'leap'});e.leapFrom={x:e.x,y:e.y};e.leapTo=point;return}

 if(pattern===0)warn('circle',e.x,e.y,135,.9*pace,{attack:'stomp'});
 if(pattern===1)warn('ring',e.x,e.y,210,1*pace,{inner:75,attack:'shockwave'});
 if(pattern===2){warn('line',e.x,e.y,0,.85*pace,{length:340,width:60,attack:'beam'});warn('line',e.x,e.y,0,.85*pace,{dir:{x:-dir.y,y:dir.x},length:340,width:60,attack:'beam'})}
 if(pattern===3)warn('fan',e.x,e.y,0,.9*pace,{length:650,spread:.75,rays:7,attack:'fan'});
}
function shootFan(e,dir,count,speed){
 const angle=Math.atan2(dir.y,dir.x);for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.23;hostileShots.push(empowerBossThreat({kind:e.kind==='boss'?'bossSlash':'bullet',form:e.form,owner:e.id,x:e.x,y:e.y-10,r:7,dir:{x:Math.cos(a),y:Math.sin(a)},speed,life:3,atk:e.atk,perfectUsed:false},e))}
}
function resolveWarning(w){
 if(game.mode!=='play')return;const owner=enemies.find(e=>e.id===w.owner&&e.hp>0);if(!owner)return;if(w.stateOnly){resolveAilmentWave(w,owner);return}empowerBossThreat(w,owner);
 if(w.attack==='persona'){resolvePersonaStrike(w,owner);return}if(owner.kind==='boss'&&w.attack!=='epic'&&w.attack!=='barrage')bossAttackSpectacle(w,owner);if(w.attack==='epic'){resolveEpicStrike(w,owner);return}if(w.attack==='barrage'){if(warningContains(w)&&p.rollTime>0&&p.dodgeAge<.2)perfectDodge(w);resolveBarrage(w);return}if(!['volley','fan','dash','bossDash'].includes(w.attack))hitExplosives(q=>warningContains(w,q,16),w.atk);const inside=warningContains(w);if(inside&&!w.perfectUsed&&p.rollTime>0&&p.dodgeAge<.2)perfectDodge(w);
 if(w.attack==='volley'||w.attack==='fan'){effects.push({...w,shape:w.kind,kind:'telegraphHit',life:.16,max:.16});shootFan(owner,w.dir,w.attack==='fan'?7:3,w.attack==='fan'?245:295);owner.state='recover';owner.timer=owner.kind==='boss'?(game.singleStage?1:1.5):1.1;owner.exposed=owner.kind==='boss'?owner.timer:0;return}
 if(w.attack==='mine'){effects.push({...w,shape:w.kind,kind:'telegraphHit',life:.16,max:.16});hazards.push({owner:w.owner,x:w.x,y:w.y,r:w.r,life:2.2,tick:.05,atk:w.atk,protected:w.perfectUsed});owner.state='recover';owner.timer=1;return}
 if(w.attack==='dash'||w.attack==='bossDash'){owner.state='dash';owner.dashDir=w.dir;owner.dashAtk=w.atk;owner.dashTime=w.attack==='bossDash'?w.length/620:.3;owner.dashProtected=w.perfectUsed;return}
 if(inside&&!w.perfectUsed){game.hitSource=attackLabel(w.attack);takeHit(w.atk,w.x,w.y);}
 if(game.singleStage&&owner.kind==='boss'&&owner.bossPhase===2&&w.attack==='leap'&&hazards.length<2)hazards.push({owner:w.owner,x:w.x,y:w.y,r:w.r*.95,life:3,tick:.7,atk:Math.round(w.atk*.8),protected:false});if(game.singleStage&&game.region===2&&owner.kind==='boss'&&w.attack==='stomp'&&hazards.length<2)hazards.push({owner:w.owner,x:w.x,y:w.y,r:w.r*.65,life:1.5,tick:.3,atk:w.atk*.6,protected:w.perfectUsed});if(w.attack==='hop'||w.attack==='leap'){const point=safePoint(w.x,w.y,owner.r);owner.x=point.x;owner.y=point.y;owner.leapFrom=null;owner.leapTo=null}
 effects.push({...w,shape:w.kind,kind:'telegraphHit',life:.18,max:.18});owner.state='recover';owner.timer=owner.kind==='boss'?(game.singleStage?(owner.bossPhase===2?.85:1.05):(owner.bossPhase===2?1.5:1.2)):.7;owner.exposed=owner.kind==='boss'?owner.timer:0;if(owner.kind==='boss')floating(owner.x,owner.y-135,'反撃の隙！','#b9f9df',true);
}
function updateHostiles(dt){
 const live=new Set(enemies.filter(e=>e.hp>0).map(e=>e.id));
 for(const b of hostileShots){if(!live.has(b.owner)){b.life=0;continue}const old={x:b.x,y:b.y};b.x+=b.dir.x*b.speed*dt;b.y+=b.dir.y*b.speed*dt;b.life-=dt;if(!coverClear(old,b,b.r)){b.life=0;particle(b.x,b.y,'#ffd3bc',4,65);continue}
  hitExplosives(q=>segmentHits(old,b,q,b.r+16),b.atk);const dx=b.x-old.x,dy=b.y-old.y,l=dx*dx+dy*dy,t=l?clamp(((p.x-old.x)*dx+(p.y-old.y)*dy)/l,0,1):0;
  if(Math.hypot(p.x-old.x-dx*t,p.y-old.y-dy*t)<p.r+b.r){if(p.rollTime>0&&p.dodgeAge<.2)perfectDodge(b);if(!b.perfectUsed){game.hitSource='弾';takeHit(b.atk,b.x,b.y);}b.life=0}
 }
 hostileShots=hostileShots.filter(b=>b.life>0);
 for(const z of hazards){if(!live.has(z.owner)){z.life=0;continue}z.life-=dt;z.tick-=dt;if(z.tick<=0){if(!z.protected&&(z.kind?warningContains(z):distance(z,p)<z.r+p.r*.4)){game.hitSource='残る炎';takeHit(z.atk,z.x,z.y);}hitExplosives(q=>z.kind?warningContains(z,q,16):distance(z,q)<z.r+16,z.atk);z.tick=.6}}
 hazards=hazards.filter(z=>z.life>0);
}
function updateEnemies(dt,worldDt){
 const current=[...enemies],cleanup=game.singleStage&&!isBossStage()&&game.wave===game.waves&&current.filter(e=>e.hp>0).length<=3;
 for(const e of current){
  if(e.hp<=0)continue;tickImpactReaction(e,dt);if(e.hitPause>0){e.hitPause=Math.max(0,e.hitPause-dt);continue}if(e.spawnTime>0){e.spawnTime=Math.max(0,e.spawnTime-worldDt);continue}e.flash=Math.max(0,e.flash-dt);e.recoil=Math.max(0,(e.recoil||0)-dt);moveActor(e,e.knock.x*dt,e.knock.y*dt);e.knock.x*=Math.exp(-12*dt);e.knock.y*=Math.exp(-12*dt);
  if(!(e.hitStagger>0)&&game.singleStage&&newEnemyTick(e,worldDt))continue;e.exposed=Math.max(0,(e.exposed||0)-worldDt);e.coreBroken=Math.max(0,(e.coreBroken||0)-worldDt);
  if(e.kind==='boss'&&e.bossPhase===1&&e.hp/e.maxHp<=.5){if(e.form==='god'&&game.singleStage){transformGod(e);return}e.bossPhase=2;clearHostiles();e.leapFrom=null;e.leapTo=null;e.state='recover';e.timer=1.5;e.exposed=1.5;e.speed=150;e.pattern=4;banner('本性解放！','突進と跳躍を見切れ',1.5);particle(e.x,e.y,'#ffd49a',36,220);if(game.singleStage){beginBossScene('enrage',e);return}}
  const realmHeld=game.singleStage&&e.kind==='boss'&&updateRealmBoss(e,worldDt*(e.bossPhase===2?1.18:1));if(e.state==='revive')continue;
  e.burn=Math.max(0,e.burn-worldDt);e.frost=Math.max(0,e.frost-worldDt);e.stun=Math.max(0,e.stun-worldDt);
  e.bleed=Math.max(0,(e.bleed||0)-worldDt);if(e.bleed>0){e.bleedTick-=worldDt;if(e.bleedTick<=0){hurtEnemy(e,5,false,'#ff9cae',true);e.bleedTick=.6}}
  if(e.burn>0){e.burnTick-=worldDt;if(e.burnTick<=0){hurtEnemy(e,e.resonanceBurn&&pathTier('ember')===2?7:4,false,'#ffb06a',true,true,false,'fire');e.burnTick=.5}}if(e.hp<=0||e.stun>0||e.hitStagger>0||realmHeld)continue;
  if(e.state==='windup'&&e.leapTo){const w=warnings.find(w=>w.owner===e.id&&w.attack==='leap');if(w){const progress=warningProgress(w);e.x=e.leapFrom.x+(e.leapTo.x-e.leapFrom.x)*progress;e.y=e.leapFrom.y+(e.leapTo.y-e.leapFrom.y)*progress;}continue}
  if(e.state==='dash'){const from={x:e.x,y:e.y};moveActor(e,e.dashDir.x*620*worldDt,e.dashDir.y*620*worldDt);hitExplosives(q=>segmentHits(from,e,q,e.r+16),e.atk);e.dashTime-=worldDt;if(game.singleStage&&e.kind==='boss'&&Math.hypot(e.x-from.x,e.y-from.y)<620*worldDt*.3){e.dashTime=0;e.crashed=true;particle(e.x,e.y,'#ffdd9a',20,180);floating(e.x,e.y-135,'体勢を立て直す','#ffe7ad',true)}const dx=e.x-from.x,dy=e.y-from.y,length=dx*dx+dy*dy,u=length?clamp(((p.x-from.x)*dx+(p.y-from.y)*dy)/length,0,1):0;if(Math.hypot(p.x-from.x-dx*u,p.y-from.y-dy*u)<e.r+p.r+8&&!e.dashProtected){if(p.rollTime>0&&p.dodgeAge<.2){const tell={owner:e.id,perfectUsed:false};if(perfectDodge(tell))e.dashProtected=true}if(!e.dashProtected){game.hitSource='突進';takeHit(e.kind==='boss'?(e.dashAtk??empowerBossThreat({atk:e.atk},e).atk):e.atk,e.x,e.y);}}if(e.dashTime<=0){e.state='recover';e.timer=e.kind==='boss'?(game.singleStage?(e.crashed?1.1:1.2):1.6):.7;e.exposed=e.kind==='boss'?e.timer:0;e.crashed=false;}if(game.active&&game.stage<STAGES.length)e.y=Math.max(e.y,battleBounds().top+e.r);continue}
  e.cooldown-=worldDt*(e.kind==='boss'&&e.bossPhase===2?1.25:1);
  if(e.state==='chase'){
   e.facing=norm(p.x-e.x,p.y-e.y);
   const d=distance(e,p),ranged=!cleanup&&(e.kind==='archer'||e.kind==='bomber'||e.kind==='totem'||e.kind==='hexer'),reach=e.kind==='boss'?(e.bossPhase===2?530:235):ranged?330:e.kind==='bat'?275:150,n=norm(p.x-e.x,p.y-e.y),speed=e.speed*(e.speedPulse||1)*(e.frost>0?.5:1);
   if(d>reach||!coverClear(e,p)){const flank=!cleanup&&e.kind!=='boss'&&d>175,angle=e.phase+(e.kind==='bat'?1.2:0),target=flank?{x:clamp(p.x+Math.cos(angle)*120,125,635),y:p.y+Math.sin(angle)*100}:p,route=routeDirection(e,target);moveActor(e,route.x*speed*worldDt,route.y*speed*worldDt)}
   else{if(ranged&&d<105){moveActor(e,-n.x*speed*.7*worldDt,-n.y*speed*.7*worldDt)}else if(ranged){moveActor(e,-n.y*Math.sin(elapsed+e.phase)*speed*.35*worldDt,n.x*Math.sin(elapsed+e.phase)*speed*.35*worldDt)}if(e.cooldown<=0)enemyWarning(e)}
  }else{e.timer-=worldDt;if(e.state==='recover'&&e.timer<=0){e.state='chase';e.cooldown=rnd(.2,.6)}}
  const bounds=battleBounds();e.x=clamp(e.x,bounds.left+e.r,bounds.right-e.r);if(game.active&&game.stage<STAGES.length)e.y=Math.max(e.y,bounds.top+e.r);
 }
}
function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(runRandom()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function drawOffers(){
 const pool=SKILLS.filter(s=>(s.id!=='nova'||darkCrashUnlocked())&&(!game.singleStage||!isBossStage()||!['heal','leech'].includes(s.id))&&(p.learned[s.id]||0)<3&&p.lv>=(s.lv||1)),picks=[];
 const add=filter=>{if(picks.length>=4)return;const candidates=pool.filter(s=>!picks.includes(s.id)&&filter(s));if(candidates.length)picks.push(weightedSkillPick(candidates).id)};
 if(p.loadout.includes(null))add(s=>isManualSkill(s)&&!p.learned[s.id]);
 if(runRandom()<.6)add(s=>s.id==='ultimatePower'||s.id==='charge');if(picks.length<4)add(s=>!!p.learned[s.id]);if(runRandom()<.6)add(s=>isAutoSkill(s)&&!p.learned[s.id]);const strongest=PATHS.slice().sort((a,b)=>pathPoints(b.id)-pathPoints(a.id))[0];add(s=>skillPath(s.id)?.id===strongest.id);if(picks.length<4)add(s=>s.category==='passive');while(picks.length<4){const n=picks.length;add(()=>true);if(n===picks.length)break}return shuffle(picks);
}
function openDraft(){if(game.offers.length){game.mode='draft';renderDraft();return}game.offers=drawOffers();game.mode='draft';game.drafts++;renderDraft()}
function offerSlot(id){if(p.learned[id]||!isManualSkill(getSkill(id)))return -1;return p.loadout.indexOf(null)}
function renderDraft(){renderGrowthCards()}
function completeChoice(s,rank){
 game.mode='play';closeModal();tone(880,.1);if(isManualSkill(s)&&p.learned[s.id]>=3)trueSkillEffect(s);acquisitionToast(skillDisplayName(s)+(rank?' 強化！':' 習得！'));banner(skillDisplayName(s)+(rank?' 強化！':' 習得！'),'',.6);log(s.name+' · Lv.'+p.learned[s.id]+'！','good');updateUI();if(game.afterGrowthStage&&!game.pendingChoices){game.afterGrowthStage=false;completeStageAttempt();return}flushLevelChoices();if(game.campReady&&game.mode==='play'){if(game.singleStage)presentRoomRest();else showCamp();}
}
function chooseOffer(index){
 if(game.mode!=='draft'||!Number.isInteger(index)||!game.offers[index])return false;
 const id=game.offers[index],s=getSkill(id),rank=p.learned[id]||0;if(!s||rank>=3||p.lv<(s.lv||1))return false;p.learned[id]=rank+1;
 game.chosenSkills=[...new Set([...(game.chosenSkills||[]),id])];game.offers=[];game.pendingChoices=Math.max(0,game.pendingChoices-1);
 if(s.category==='passive'){s.apply();if(!rank)p.build.push(s.name)}
 else if(isAutoSkill(s))p.autoSkillTimers[id]=0;
 else if(!rank&&isManualSkill(s)){
  const slot=p.loadout.indexOf(null);if(slot>=0){p.loadout[slot]=id;game.equipFlash={slot,time:1.1}}
  else{game.pendingReplacement={id,rank};renderReplacement();return true}
 }
 completeChoice(s,rank);return true;
}
function renderReplacement(){
 const pending=game.pendingReplacement;if(!pending)return;const incoming=getSkill(pending.id);game.mode='replace';
 openModal('<div class="eyebrow">NEW SKILL</div><h2>どの技と入れ替える？</h2><div class="incoming-skill" style="--choice-color:'+incoming.color+'"><span>'+incoming.icon+'</span><div><strong>'+incoming.name+'</strong><small>'+incoming.desc+'</small></div></div><div class="replace-grid">'+p.loadout.map((id,i)=>{const old=getSkill(id),m=skillPrimary(old,p.learned[id]);return '<button class="replace-slot" data-replace="'+i+'" style="--slot-color:'+SLOT_COLORS[i]+'"><kbd>'+(game.singleStage?controlLabel(SLOT_NAMES[i]):SLOT_KEYS[i])+'</kbd><span>'+old.icon+'</span><b>'+old.name+'</b><small>Lv.'+p.learned[id]+' · '+m.label+' '+statNumber(m.value)+m.unit+'</small><strong>この枠に装備</strong></button>'}).join('')+'</div><button class="text-button" id="skipReplacement">今の装備を使う</button>');
 $('modal').classList.add('replacement-modal');$('modal').querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>replaceAcquiredSkill(Number(b.dataset.replace)));$('skipReplacement').onclick=()=>replaceAcquiredSkill(-1);
}
function replaceAcquiredSkill(slot){
 if(game.mode!=='replace'||!game.pendingReplacement||!Number.isInteger(slot)||slot< -1||slot>2)return false;
 const {id,rank}=game.pendingReplacement;if(slot>=0){p.loadout[slot]=id;game.equipFlash={slot,time:1.1}}game.pendingReplacement=null;completeChoice(getSkill(id),rank);return true;
}
function updateAutoSkills(dt){
 if(game.mode!=='play'||!game.active||!['combat','waveBreak'].includes(game.phase))return;
 for(const id of AUTO_IDS){if(!p.learned[id])continue;const s=getSkill(id);p.autoSkillTimers[id]=Math.max(0,(p.autoSkillTimers[id]||0)-dt);if(p.autoSkillTimers[id]>0||!nearest(id==='wisp'?500:320))continue;
  if(id==='guard'&&p.shield>10||id==='focus'&&p.focus>0)continue;
  if(id==='orbit')fields=fields.filter(f=>f.s.id!==id);
  castSkill(s,1);p.autoSkillTimers[id]=Math.max(4,skillCooldown(s));game.autoCasts=(game.autoCasts||0)+1;
 }
}

function automaticSummary(){const learned=SKILLS.filter(s=>isAutoSkill(s)&&p.learned[s.id]);return learned.length?'<div class="automatic-summary"><b>自動発動 · 枠不要</b>'+learned.map(s=>'<span>'+s.icon+' '+skillDisplayName(s)+' Lv.'+p.learned[s.id]+'</span>').join('')+'</div>':''}
function openSkillBook(){if(game.singleStage&&!game.active){if(['roomRest','exitWalk'].includes(game.phase)){game.phase='roomRest';roomEquipment()}else openPreparation(campaign.selected);return}
 if(game.mode==='draft'){renderDraft();return}if(!game.campReady||game.active||!['play','camp','skills'].includes(game.mode))return;game.mode='skills';
 const learned=SKILLS.filter(s=>p.learned[s.id]&&isManualSkill(s));
 openModal('<div class="eyebrow">YOUR BUILD</div><h2>装備を確認</h2><p>新しい技は経験値でレベルアップしたときの4択で習得します。</p><div class="equipment-list">'+p.loadout.map((id,i)=>'<label><kbd>'+SLOT_KEYS[i]+'</kbd><select data-slot="'+i+'" aria-label="'+SLOT_KEYS[i]+'に装備する技"><option value="">未装備</option>'+learned.map(s=>'<option value="'+s.id+'" '+(s.id===id?'selected':'')+'>'+skillDisplayName(s)+' Lv.'+p.learned[s.id]+'</option>').join('')+'</select></label><div class="equipped-metrics">'+(id?currentStatsHTML(getSkill(id),p.learned[id]):'次の4択で技を習得できます。')+'</div>').join('')+'</div>'+automaticSummary()+pathsHTML()+'<p class="passive-summary">常時強化：'+(p.build.join(' / ')||'なし')+'</p><button class="cta" id="closeBook">準備に戻る</button><div class="keyboard-hint">Escで戻る · 装備変更で再使用時間は戻りません。</div>');
 $('modal').classList.add('equipment-modal');$('closeBook').onclick=closeSkillBook;$('modal').querySelectorAll('[data-slot]').forEach(el=>el.onchange=()=>{equipSkill(el.value,Number(el.dataset.slot));openSkillBook()});
}
function equipSkill(id,slot){if(!game.campReady||game.active)return false;if(slot<0||slot>2||id&&(!p.learned[id]||(getSkill(id)?.category==='passive'||getSkill(id)?.kind==='heal'||isAutoSkill(getSkill(id)))))return false;const previous=p.loadout.indexOf(id),old=p.loadout[slot];if(id&&previous>=0)p.loadout[previous]=old;p.loadout[slot]=id||null;updateUI();return true}
function closeSkillBook(){if(game.mode!=='skills')return;showCamp()}

function finish(win){if(game.singleStage){if(win)completeStageAttempt();else finishStageLoss();return}
 if(game.mode==='end')return;game.mode='end';for(const d of drops)if(d.type==='coin')gainGold(d.value);drops=drops.filter(d=>d.type!=='coin');
 const result=calculateResult(win);game.result=result;let best=0;
 try{best=Math.max(result.score,Number(localStorage.getItem('swordsman-best-score'))||0);localStorage.setItem('swordsman-best-score',String(best));const progress=Math.max(game.cleared,Number(localStorage.getItem('swordsman-best'))||0);localStorage.setItem('swordsman-best',String(progress))}catch{}
 const num=n=>n.toLocaleString('ja-JP'),insights=recordRun(result),seed=game.seed,style=game.style;
 openModal('<div class="eyebrow">'+(win?'ALL STAGES COMPLETE':'ADVENTURE RESULT')+'</div><h2>'+(win?'剣の先に、夜明け。':'この剣は、まだ折れない。')+'</h2><div class="score-hero"><div class="rank-badge rank-'+result.rank+'"><small>RANK</small><b>'+result.rank+'</b></div><div><small>TOTAL SCORE</small><strong>'+num(result.score)+'</strong><span>自己ベスト '+num(best)+'</span></div></div><div class="result-time"><span>TIME</span><strong>'+formatTime(result.time)+'</strong><small>選択・商店・一時停止の時間は除く</small></div><div class="score-breakdown"><div><span>討伐 '+game.kills+'体・経験値</span><b>+'+num(result.parts.kills+result.parts.experience)+'</b></div><div><span>獲得ゴールド '+game.goldEarned+' G × 5</span><b>+'+num(result.parts.gold)+'</b></div><div><span>突破 '+game.cleared+' / '+STAGES.length+'・クリア</span><b>+'+num(result.parts.stages+result.parts.clear)+'</b></div><div><span>回避・連鎖・タイムボーナス</span><b>+'+num(result.parts.technique+result.parts.time)+'</b></div></div>'+insights+'<p class="score-note">商店で使ったゴールドもスコアに含まれます。</p><button class="cta" id="retry">新しい剣士で再挑戦</button><div class="retry-options"><button id="retrySame">同じ旅に再挑戦</button><button id="chooseStyle">流派を選び直す</button></div><small class="seed-note">旅の番号 '+seed+' · 同じ旅では敵の配置と抽選の乱数列を再現</small>');$('modal').classList.add('result-modal');$('retry').onclick=()=>{selectedStyle=style;reset();begin()};$('retrySame').onclick=()=>{selectedStyle=style;reset(seed);begin()};$('chooseStyle').onclick=()=>reset();updateUI();
}
function gainGold(value){const before=game.gold,earned=game.goldEarned,total=value*(game.singleStage?.94*realmGoldFactor():1)*(1+p.goldBonus)+game.goldFraction,gain=Math.floor(total+1e-9);game.goldFraction=total-gain;game.gold+=gain;game.goldEarned+=gain;animateGoldChange('run',before,game.gold);animateGoldChange('earned',earned,game.goldEarned);return gain}
function formatTime(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0')}
function pause(){if(game.mode==='play'){game.mode='pause';openModal('<div class="seal">Ⅱ</div><h2>ひとやすみ</h2><p>冒険は一時停止しています。</p><button class="cta" id="resume">冒険を続ける</button><button class="text-button" id="pauseSettings">操作と設定</button>');$('modal').classList.add('pause-modal');$('resume').onclick=resume;$('pauseSettings').onclick=openSettings;const touchButton=document.createElement('button');touchButton.className='text-button';touchButton.id='pauseTouchLayout';touchButton.textContent='タッチ操作の配置';touchButton.onclick=openTouchLayout;$('modal').append(touchButton);if(game.singleStage){const quit=document.createElement('button');quit.className='text-button';quit.id='pauseQuit';quit.textContent='この挑戦を終了する';quit.onclick=confirmAbandonExpedition;$('modal').append(quit)}}else if(game.mode==='pause')resume()}
function resume(){if(game.mode!=='pause')return;game.mode='play';closeModal()}
function clampPlayerY(y){if(bossArenaActive()){const b=battleBounds();return clamp(y,b.top+p.r,b.bottom-p.r)}if(game.singleStage)return clamp(y,STAGES[game.stage].y-245,STAGES[game.stage].y+365);return clamp(y,game.active&&game.stage<STAGES.length?STAGES[game.stage].y-190:WORLD.end,WORLD.start+70)}
function update(dt){if(game.mode==='play'||game.mode==='roomEquipment'){game.potionLock=Math.max(0,(game.potionLock||0)-dt);game.healGlow=Math.max(0,(game.healGlow||0)-dt);}
 if(game.mode!=='play')return;tickCoyote(dt);if(game.mode!=='play')return;if(game.bossScene){updateBossScene(dt);return}if(game.singleStage&&game.phase==='exitWalk'){walkToNextRoom(dt);return}if(game.singleStage&&game.phase==='roomRest'){game.choiceDelay=0;game.draftDeferred=0;flushLevelChoices();return}if(p.cutin>0){p.cutin=Math.max(0,p.cutin-dt);if(!p.cutin){document.querySelector('.scene').classList.remove('ultimate-cutin');releaseAstralSlash()}return}if(game.phase==='bossIntro'){game.phaseTimer-=dt;if(game.phaseTimer<=0){document.querySelector('.scene').classList.remove('boss-arrival');spawnWave()}return}tickPlayerAilments(dt);if(game.mode!=='play')return;game.time+=dt;game.choiceDelay=Math.max(0,game.choiceDelay-dt);if(game.equipFlash)game.equipFlash.time=Math.max(0,game.equipFlash.time-dt);for(const key of Object.keys(p.resonanceCd))p.resonanceCd[key]=Math.max(0,p.resonanceCd[key]-dt);if(game.phase==='combat')game.combatTime+=dt;const worldDt=dt*(combat.slow>0?.16:1);elapsed+=worldDt;
 if(game.singleStage){updateStageAttempt(dt)}if(game.active){chargeUltimate(dt*(game.singleStage?1.35:.8));p.ultimateTime=Math.max(0,p.ultimateTime-dt)}
 for(const k of ['hurtRecovery','castLock','attackRecovery','potionCd','swing','counter','perfectCd','invuln','rollTime','shieldTime','parry','focus','wisp'])p[k]=Math.max(0,(p[k]||0)-dt);
 if(!p.shieldTime)p.shield=0;p.dodgeAge+=dt;combat.slow=Math.max(0,combat.slow-dt);p.mp=Math.min(p.maxMp,p.mp+p.manaRegen*dt);game.comboTime=Math.max(0,game.comboTime-dt);if(!game.comboTime)game.combo=0;
 p.cd.roll=Math.max(0,p.cd.roll-dt);for(const id of Object.keys(p.skillCooldowns))p.skillCooldowns[id]=Math.max(0,p.skillCooldowns[id]-dt);p.autoCd=Math.max(0,p.autoCd-dt);
 if(p.skillPose){p.skillPose.life=Math.max(0,p.skillPose.life-dt);if(!p.skillPose.life)p.skillPose=null;}updateSkillCharge(dt);if(game.mode!=='play'||game.bossScene)return;
 if(inputBuffer){const queued=inputBuffer;queued.life-=dt;if(queued.life<=0)inputBuffer=null;else{const id=p.loadout[SLOT_NAMES.indexOf(queued.type)];if(queued.type==='roll'?p.cd.roll===0:p.rollTime===0&&p.castLock===0&&!(p.hurtRecovery>0)&&!(p.skillCooldowns[id]>0)){inputBuffer=null;action(queued.type);if(game.mode!=='play')return}}}
 if((keys.has('Shift')||p.rollHeld)&&p.cd.roll===0&&Math.hypot(movement().x,movement().y)>.1)action('roll');
 const input=movement(),rolling=p.rollTime>0,move=rolling?p.rollDir:input,speed=p.skillCharge?0:rolling?470:(p.ailments?.paralyze>0?0:205*walkingWeight())*(p.ultimateTime>0?1.18:1)*(p.castLock>.09?.72:1)*(p.hurtRecovery>0?.35:1);
 if(rolling){combat.trail-=dt;if(combat.trail<=0){effects.push({kind:'afterimage',x:p.x,y:p.y,life:.18,max:.18});combat.trail=.025}}
 if(Math.hypot(input.x,input.y)>.12&&!rolling&&p.castLock<=0)p.face=norm(input.x,input.y);moveActor(p,move.x*speed*dt*terrainSpeed(p),move.y*speed*dt*terrainSpeed(p));stepClock-=dt;if(Math.hypot(move.x,move.y)>.2&&stepClock<=0){stepClock=.12;decals.push({kind:'step',x:p.x+rnd(-6,6),y:p.y+3,life:3,max:3});}game.furthest=Math.min(game.furthest,p.y);
 if(game.phase==='travel'&&game.stage<STAGES.length&&!game.active&&p.y<STAGES[game.stage].y+110)encounter();if(p.autoCd===0&&!rolling&&!(p.ailments?.paralyze>0)&&p.castLock<=0&&!(p.hurtRecovery>0))autoAttack();updateAutoSkills(dt);
 for(const event of scheduled){event.time-=dt;if(event.time<=0){hitArea(event.spec);effects.push({kind:'nova',x:event.spec.x,y:event.spec.y,r:event.spec.s.r||130,life:.45,max:.45,color:event.spec.s.color})}}scheduled=scheduled.filter(e=>e.time>0);
 updateFields(dt);updateBolts(dt);
 if(p.wisp>0){p.wispCd-=dt;if(p.wispCd<=0){const target=nearest(380);if(target){const s=getSkill('wisp');bolts.push({x:p.x+30,y:p.y-45,dir:norm(target.x-p.x-30,target.y-p.y+45),speed:480,life:.9,s,boost:p.wispBoost||1,hit:new Set(),remaining:1});p.wispCd=.9}}}
 updateEnemies(dt,worldDt);
 for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){const a=enemies[i],b=enemies[j];if(a.hp<=0||b.hp<=0||a.hitPause>0||b.hitPause>0)continue;const d=distance(a,b),min=a.r+b.r+6;if(d<min&&d>.01){const n=norm(a.x-b.x,a.y-b.y),push=(min-d)*worldDt*2;moveActor(a,n.x*push,n.y*push);moveActor(b,-n.x*push,-n.y*push)}}
 if(game.bossScene)return;updateReadableThreats(worldDt);updateEpicWarnings(worldDt);for(const w of warnings){const owner=enemies.find(e=>e.id===w.owner);if(owner?.stun>0||owner?.hitPause>0||owner?.hitStagger>0)continue;w.life-=worldDt;if(w.life<=0){game.damageThreat=w;resolveWarning(w);game.damageThreat=null}}warnings=warnings.filter(w=>w.life>0&&enemies.some(e=>e.id===w.owner&&e.hp>0));updateHostiles(worldDt);enemies=enemies.filter(e=>e.hp>0);if(game.mode!=='play')return;
 if(game.bossScene)return;if(reinforcementReady())beginWaveBreak();else if(game.phase==='combat'&&(game.wave===(game.singleStage?game.waves:2)||isBossStage())&&!enemies.length)clearStage();
 else if(game.phase==='waveBreak'){game.phaseTimer-=dt;if(game.phaseTimer<=0){game.wave++;spawnWave()}}
 else if(game.phase==='stageClear'){game.phaseTimer-=dt;if(game.phaseTimer<=0&&!growthPresentationBusy()){grantStageReward();return}}
 if(game.singleStage)updateFieldItems(dt);updateDrops(dt);updateStageGoal();flushLevelChoices();uiClock+=dt;if(uiClock>.08){updateUI();uiClock=0}
}
function updateFields(dt){for(const f of fields){f.life-=dt;f.clock-=dt;const s=f.s;if(f.kind==='orbit'){f.x=p.x;f.y=p.y;for(let i=0;i<2;i++){const angle=game.time*5+i*Math.PI,x=p.x+Math.cos(angle)*s.r,y=p.y+Math.sin(angle)*s.r;for(const e of enemies)if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<e.r+20&&(f.hitTimes[e.id]||0)<=game.time){hurtEnemy(e,s.damage*p.power*f.boost*(1+((p.learned[s.id]||1)-1)*.2),true,s.color,false,!!s.auto,!!s.manual,skillElement(s),false,s.id);f.hitTimes[e.id]=game.time+.45}}}else{if(s.pull)for(const e of enemies){if(distance(f,e)<s.r+40){const n=norm(f.x-e.x,f.y-e.y);moveActor(e,n.x*65*dt,n.y*65*dt)}}if(f.clock<=0){hitArea({s,x:f.x,y:f.y,face:p.face,boost:f.boost});f.clock=s.interval}}}fields=fields.filter(f=>f.life>0)}
function updateBolts(dt){for(const b of bolts){const before={x:b.x,y:b.y};b.x+=b.dir.x*b.speed*dt;b.y+=b.dir.y*b.speed*dt;b.life-=dt;if(!coverClear(before,b,8)){b.life=0;particle(b.x,b.y,b.s.color,4,60);continue}for(const t of terrain)if(t.kind==='barrel'&&!t.broken&&distance(t,b)<28)explodeBarrel(t);for(const e of enemies){if(e.hp<=0||b.hit.has(e.id))continue;const dx=b.x-before.x,dy=b.y-before.y,len=dx*dx+dy*dy,t=len?clamp(((e.x-before.x)*dx+(e.y-before.y)*dy)/len,0,1):0;if(Math.hypot(e.x-before.x-dx*t,e.y-before.y-dy*t)<e.r+(b.s.width?b.s.width/2:16)){hurtEnemy(e,b.s.damage*(b.s.category==='sword'?p.power:p.magicPower)*b.boost*(1+((p.learned[b.s.id]||1)-1)*.2),true,b.s.color,false,!!b.s.auto,!!b.s.manual,skillElement(b.s),false,b.s.id);b.hit.add(e.id);b.remaining--;if(b.remaining<=0){b.life=0;break}}}}bolts=bolts.filter(b=>b.life>0)}
function updateDrops(dt){for(const d of drops){if(d.type==='fieldPotion'||d.type==='bomb')continue;d.age+=dt;if(d.type==='chest'){if(distance(d,p)<52){d.collected=true;gainGold(d.value);p.hp=Math.min(p.maxHp,p.hp+18);p.mp=Math.min(p.maxMp,p.mp+4);particle(d.x,d.y,'#ffe18a',25,160);floating(d.x,d.y-50,'+'+d.value+' G','#ffe8a1',true);if(game.stage===STAGES.length)finish(true)}continue}d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=Math.exp(-6*dt);d.vy*=Math.exp(-6*dt);if(d.age>.4&&(distance(d,p)<p.magnet||d.age>2.5)){const n=norm(p.x-d.x,p.y-d.y);d.x+=n.x*(300+d.age*90)*dt;d.y+=n.y*(300+d.age*90)*dt}if(distance(d,p)<22){d.collected=true;if(d.type==='coin'){gainGold(d.value);tone(900+rnd(0,150),.04,'sine',.01)}else p.mp=Math.min(p.maxMp,p.mp+d.value)}}drops=drops.filter(d=>!d.collected)}
function updateVisuals(dt){updateMajestyPresentation(dt);if(game.lastHit)game.lastHit.life=Math.max(0,game.lastHit.life-dt);if(game.epicEvent)game.epicEvent.life=Math.max(0,game.epicEvent.life-dt);impactClock=Math.max(0,impactClock-dt);bannerTTL=Math.max(0,bannerTTL-dt);if(!bannerTTL)$('banner').classList.remove('show');for(const e of effects){e.life-=dt;if(e.kind==='particle'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=Math.exp(-3*dt);e.vy*=Math.exp(-3*dt);e.z=(e.z||0)+(e.vz||0)*dt;e.vz=(e.vz||0)-400*dt;if(e.z<0){e.z=0;e.vz=Math.abs(e.vz)*.25}}}effects=effects.filter(e=>e.life>0);limitCosmetics();for(const t of texts){t.life-=dt;t.y-=30*dt}texts=texts.filter(t=>t.life>0);combat.zoom+=(combat.slow>0?1.045-combat.zoom:1-combat.zoom)*(1-Math.exp(-9*dt));combat.flash=Math.max(0,combat.flash-dt);combat.hurt=Math.max(0,(combat.hurt||0)-dt);combat.hitFxClock=Math.max(0,(combat.hitFxClock||0)-dt);for(const d of decals)d.life-=dt;decals=decals.filter(d=>d.life>0).slice(-150);shake*=Math.exp(-13*dt)}
function updateUI(){
 syncPlayLayout();if(!p)return;for(const id of [...SLOT_NAMES,'roll'])$(id).disabled=game.singleStage&&!combatActionsAvailable();if(game.singleStage){updateStageHUD();updatePotionUI()}const ultimate=$('ultimate');setHUDStyle(ultimate,'--charge',p.ultimate+'%');ultimate.classList.toggle('ready',p.ultimate>=100);ultimate.classList.toggle('active',p.ultimateTime>0);ultimate.disabled=game.mode!=='play'||game.singleStage&&!combatActionsAvailable()||!game.active||p.ultimate<100||p.ultimateTime>0;setHUDText(ultimate.querySelector('small'),game.singleStage&&!combatActionsAvailable()?'戦闘中に使用':p.ultimateTime>0?'覚醒中 '+p.ultimateTime.toFixed(1)+'秒':p.ultimate>=100?'残りHP最大の敵を狙う':'充填 '+Math.floor(p.ultimate)+'%');document.querySelector('.scene').classList.toggle('boss-active',enemies.some(e=>e.kind==='boss'));setHUDText($('level'),'LV '+p.lv);setHUDText($('journeyLabel'),game.singleStage?roomRole().name+' '+game.room+'/'+stageRoomCount()+' ▾':'STAGE '+Math.min(game.stage+1,STAGES.length)+' / '+STAGES.length+' ▾');const routeKey=game.stage+':'+game.cleared;if(game.routeDotsKey!==routeKey){game.routeDotsKey=routeKey;$('routeDots').innerHTML=STAGES.map((s,i)=>'<i class="'+(i<game.cleared?'done':i===game.stage?'current':'')+'" title="'+s.name+'"></i>').join('')};$('xpBar').style.width=p.xp/p.xpNext*100+'%';setHUDText($('xpText'),p.xp+' / '+p.xpNext);setHUDText($('timeHud'),formatTime(game.time));setHUDText($('hpText'),Math.ceil(p.hp)+' / '+p.maxHp);setHUDText($('mpText'),Math.floor(p.mp)+' / '+p.maxMp);$('hpBar').style.width=p.hp/p.maxHp*100+'%';$('mpBar').style.width=p.mp/p.maxMp*100+'%';setHUDText($('stageText'),(isBossStage()?'BOSS · ':'')+(game.singleStage?REGIONS[game.region].name:STAGES[Math.min(game.stage,STAGES.length-1)].name));updateGoldHUD($('goldHud'),game.gold,'run');updateGoldHUD($('gold'),game.goldEarned,'earned');setHUDText($('kills'),game.kills);setHUDText($('combo'),game.combo>1?game.combo+' CHAIN':'—');$('progress').style.height=game.singleStage?((game.room-1)/stageRoomCount()*100)+'%':clamp((WORLD.start-game.furthest)/(WORLD.start-(STAGES[STAGES.length-1].y-240))*100,0,100)+'%';
 setHUDText($('heal'),p.potionCd>0?'回復 '+p.potionCd.toFixed(1)+'秒':p.potions?'回復 × '+p.potions:'回復を買う');$('heal').disabled=!game.campReady||game.active||p.potionCd>0||p.potions>0&&p.hp>=p.maxHp&&p.mp>=p.maxMp;$('heal').title='ポーション：HP45・MP12回復';$('skillsButton').disabled=!game.campReady||game.active;$('shopButton').disabled=game.singleStage||!game.campReady||game.active;setHUDText($('skillsButton'),'⚔ 装備');$('skillsButton').classList.remove('has-points');
 for(let i=0;i<3;i++){const b=$(SLOT_NAMES[i]),s=getSkill(p.loadout[i]),cd=s?p.skillCooldowns[s.id]||0:0;setHUDText(b.querySelector('.icon'),s?s.icon:'＋');setHUDText(b.querySelector('b'),s?skillDisplayName(s):'成長で習得');let badge=b.querySelector('.skill-strength');if(!badge){badge=document.createElement('small');badge.className='skill-strength';b.insertBefore(badge,b.querySelector('kbd'))}const metric=s?skillPrimary(s,p.learned[s.id]):null;setHUDText(b.querySelector('kbd'),game.singleStage?controlLabel(SLOT_NAMES[i]):SLOT_KEYS[i]);setHUDText(badge,s?'Lv.'+p.learned[s.id]+(s.mp?' · MP '+s.mp:''):'');setHUDStyle(b,'--slot-color',SLOT_COLORS[i]);setHUDStyle(b,'--skill-color',SLOT_COLORS[i]);b.classList.toggle('just-equipped',game.equipFlash?.slot===i&&game.equipFlash.time>0);b.classList.toggle('empty',!s);b.classList.toggle('charging',p.skillCharge?.id===s?.id);b.classList.toggle('on-cooldown',cd>.05);b.classList.toggle('counter-ready',!!s&&p.counter>0);setHUDText(b.querySelector('.cooldown'),cd.toFixed(1));setHUDStyle(b,'--cooldown-angle',s?(cd/skillCooldown(s)*360)+'deg':'0deg');b.title=s?skillDisplayName(s)+' Lv.'+p.learned[s.id]+' / '+metric.label+metric.value+' / 再使用'+statNumber(skillCooldown(s))+'秒':'';setHUDAttribute(b,'aria-label',s?skillDisplayName(s)+' '+SLOT_KEYS[i]:'未習得 '+SLOT_KEYS[i]);b.style.opacity=s&&p.mp<s.mp&&p.counter<=0?.55:1}
 const automatic=[...AUTO_IDS].filter(id=>p.learned[id]),autoKey=automatic.map(id=>id+':'+p.learned[id]).join('|');if(game.autoUiKey!==autoKey){game.autoUiKey=autoKey;$('autoTray').innerHTML=automatic.map(id=>'<span class="auto-status" data-auto="'+id+'" title="'+skillDisplayName(getSkill(id))+' · 自動発動 · Lv.'+p.learned[id]+'" aria-label="'+skillDisplayName(getSkill(id))+' 自動 Lv.'+p.learned[id]+'"><i>'+getSkill(id).icon+'</i><b>自動</b></span>').join('')}for(const el of $('autoTray').children){const id=el.dataset.auto;setHUDStyle(el,'--auto-ready',String(1-(p.autoSkillTimers[id]||0)/Math.max(4,skillCooldown(getSkill(id)))))}
 if(game.singleStage){setHUDText($('roll').querySelector('kbd'),controlLabel('roll'));setHUDText($('ultimate').querySelector('span'),getUltimateArt().name+' · '+controlLabel('ultimate'));setHUDAttribute($('ultimate'),'aria-label','必殺技 '+getUltimateArt().name+' '+controlLabel('ultimate'))}
 $('roll').classList.toggle('on-cooldown',p.cd.roll>.05);setHUDText($('roll').querySelector('.cooldown'),p.cd.roll.toFixed(1));
 $('dodgeFeedback').hidden=combat.slow<=0;$('slowBar').style.width=combat.slow/1.25*100+'%';$('counterCue').hidden=p.counter<=0||game.singleStage&&!combatActionsAvailable();setHUDText($('counterTime'),p.counter.toFixed(1)+'s');updateReadableControls();
 let title='↑ 北へ進もう',sub=STAGE_THEMES[Math.min(game.stage,STAGES.length-1)].hint;
 if(game.phase==='combat'){title=(game.stage===STAGES.length-1?'BOSS · ':'STAGE '+(game.stage+1)+' / '+STAGES.length+' · ')+'WAVE '+game.wave+' / '+(game.singleStage?game.waves:2);sub='画面内 '+visibleEnemyCount()+'体 / 全体 '+enemies.filter(e=>e.hp>0).length+'体 · 経験値を集めよう！'}
 if(game.phase==='waveBreak'){title='敵が減った！ 増援接近';sub='次の増援まで '+Math.max(0,game.phaseTimer).toFixed(1)+'秒 · すぐ次の群れへ'}
 if(game.phase==='stageClear'){title='関門 CLEAR！';sub='全て撃破！ 回復とゴールドを受け取ろう。'}
 if(game.stage>=STAGES.length){title='↑ 結晶の宝箱へ';sub='触れると冒険クリア。'}
 const guideKey=title+'|'+sub;if(game.guideUiKey!==guideKey){game.guideUiKey=guideKey;$('guide').replaceChildren(document.createTextNode(title));const small=document.createElement('small');small.textContent=sub;$('guide').append(small);}setHUDText($('objective'),'');$('objective').classList.toggle('achieved',game.stageGoalDone);updateTutorial();
 setHUDText($('waveBadge'),game.phase==='waveBreak'?'増援まで '+game.phaseTimer.toFixed(1)+'s':game.phase==='stageClear'?'全滅確認 · CLEAR':game.active?'群れ '+game.wave+'/'+(game.singleStage?game.waves:2)+' · '+enemies.filter(e=>e.hp>0).length+'体':'次の関門へ ↑');$('waveBadge').className='wave-badge '+game.phase;
 const routeDetailKey=routeKey+':'+game.wave+':'+game.active;if(game.routeDetailKey!==routeDetailKey){game.routeDetailKey=routeDetailKey;$('route').innerHTML=STAGES.map((s,i)=>'<div class="route-item '+(i<game.cleared?'done':i===game.stage?'active':'')+'"><span class="node">'+(i<game.cleared?'✓':i+1)+'</span><div>'+s.name+'<small>'+(i<game.cleared?'2 WAVES CLEAR':i===game.stage&&game.active?'WAVE '+game.wave+' / 2':i===STAGES.length-1?'BOSS · 2 WAVES':'2 WAVES')+'</small></div></div>').join('');}
 const buildKey=p.loadout.map(id=>id+':'+p.learned[id]).join('|')+'|'+p.build.join();if(game.buildUiKey!==buildKey){game.buildUiKey=buildKey; $('build').replaceChildren();const base=document.createElement('b');base.textContent='装備中の技';$('build').append(base);for(let i=0;i<3;i++){const s=getSkill(p.loadout[i]);$('build').append(document.createElement('br'),document.createTextNode(SLOT_KEYS[i]+' · '+(s?skillDisplayName(s)+' Lv.'+p.learned[s.id]:'未装備')))}if(p.build.length)$('build').append(document.createElement('br'),document.createTextNode('常時：'+p.build.join(' / ')));}setHUDText($('pause'),game.mode==='pause'?'再開':'一時停止');if(game.singleStage){setHUDText($('waveBadge'),game.phase==='roomRest'?'区画クリア · 次へ':isBossStage()?'BOSS · 1対1':'区画 '+game.room+'/'+stageRoomCount()+' · '+game.wave+'/'+game.waves+'波 · '+enemies.filter(e=>e.hp>0).length+'体');$('routeDots').hidden=true;}
}

