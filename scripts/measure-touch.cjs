// A repeatable local rendering stress sample. This is not a physical-phone benchmark.
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined});await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 const cdp=await page.context().newCDPSession(page),rows=[],signature=process.argv.includes('--signature');
 const trials=process.argv.includes('--trials');const scenarios=[{w:390,h:844,region:0,rate:1},{w:844,h:390,region:4,rate:1},{w:390,h:844,region:5,rate:1},{w:390,h:844,region:6,rate:1},{w:390,h:844,region:6,room:2,rate:1},{w:390,h:844,region:0,rate:4}];
 for(const scenario of trials?scenarios.filter(s=>[5,6].includes(s.region)&&!s.room).map(s=>({...s,trial:true,survival:process.argv.includes('--survival')})):process.argv.includes('--demon-boss')?scenarios.filter(s=>s.region===4):process.argv.includes('--shadow-boss')?scenarios.filter(s=>s.region===6&&!s.room):signature?scenarios.filter(s=>s.rate===1&&s.region===0||s.region===6&&s.room===2).map(s=>({...s,signature:true})):process.argv.includes('--shadow-horde')?scenarios.filter(s=>s.region===6&&s.room===2):scenarios){
  await page.setViewportSize({width:scenario.w,height:scenario.h});await cdp.send('Emulation.setCPUThrottlingRate',{rate:scenario.rate});
  rows.push(await page.evaluate(async scenario=>{
   campaign=normalizeCampaign({version:1,clears:Object.fromEntries([0,1,2,3,4,5].map(i=>[i,{score:100,time:10,rank:'A'}])),unlocked:6,finaleRevealed:true,darkRevealed:true,heavenRevealed:true});saveCampaign(campaign);game.mode='stageSelect';startStageAttempt(scenario.region,9810+scenario.region);sounds=false;preferences.particles=1;preferences.flashes=true;reduced=false;renderLoad.slow=false;renderLoad.count=0;renderLoad.total=0;resize();
   const bossScenario=scenario.region&&scenario.room!==2;game.roomRoute=['approach','horde','elite','treasure','boss'];game.room=bossScenario?5:2;buildTerrain();enemies=[];spawnWave();
   if(bossScenario){const boss=enemies.find(e=>e.kind==='boss');if([4,6].includes(scenario.region))interceptBossDefeat(boss);else transformGod(boss);endBossScene();if(scenario.region===4){boss.doomClock=0;boss.barrageClock=0}}
   else{enemies=enemies.slice(0,4);game.wave=2;spawnWave()}
   for(const e of enemies){e.hp=e.maxHp=9999999;e.spawnTime=0}p.hp=p.maxHp=100000;p.invuln=100000;p.mp=p.maxMp=100000;game.pendingChoices=0;if(scenario.survival)p.hp=p.maxHp*.25;
   for(const id of [...AUTO_IDS,'crescent','rain','whirl','nova','dawn','meteor'])p.learned[id]=3;p.loadout=scenario.signature?['nova','dawn','meteor']:['crescent','rain','whirl'];
   const originalRender=render,originalAdvance=advanceSimulation,costs=[],intervals=[];let elapsedCost=0,previous=0,count=0,maxEffects=0,maxMajorEffects=0,trialFrames=0;
   advanceSimulation=function(dt){const at=performance.now();originalAdvance(dt);elapsedCost+=performance.now()-at};
   render=function(t){const at=performance.now();originalRender(t);elapsedCost+=performance.now()-at};
   try{await new Promise(resolve=>{
    function sample(now){if(count>=30){costs.push(elapsedCost);intervals.push(now-previous)}elapsedCost=0;previous=now;maxEffects=Math.max(maxEffects,effects.length);maxMajorEffects=Math.max(maxMajorEffects,effects.filter(e=>e.kind==='cataclysm').length);if(enemies.some(e=>e.catastrophe))trialFrames++;if(scenario.trial&&count%70===30){const e=enemies.find(e=>e.kind==='boss');e.catastropheRecovery=0;beginCatastrophe(e);applyPlayerAilment('blind');applyPlayerAilment('poison');}
     joystick={x:Math.sin(count*.04)*.3,y:Math.cos(count*.04)*.2};if(count%18===0){p.skillCooldowns={};if(scenario.signature)action(SLOT_NAMES[Math.floor(count/18)%3]);else{p.castLock=0;for(const actionName of SLOT_NAMES)action(actionName)}}
     if(++count>=210)resolve();else requestAnimationFrame(sample)
    }requestAnimationFrame(sample)
   })}finally{render=originalRender;advanceSimulation=originalAdvance;joystick={x:0,y:0}}
   costs.sort((a,b)=>a-b);intervals.sort((a,b)=>a-b);
   return {...scenario,region:REGIONS[scenario.region].name,enemies:enemies.length,samples:costs.length,workMedianMs:+costs[90].toFixed(2),workP95Ms:+costs[171].toFixed(2),frameP95Ms:+intervals[171].toFixed(2),maxEffects,maxMajorEffects,trialFrames,adaptiveSlow:renderLoad.slow,budget:effectBudget(),canvasPixelRatio:+(cv.width/view.w).toFixed(2),finite:Number.isFinite(p.hp)&&Number.isFinite(p.x),mode:game.mode};
  },scenario));
 }
 if(process.argv.includes('--demon-boss')&&!rows.some(r=>r.maxMajorEffects>0))throw Error('major attack was not sampled');
 if(trials&&rows.some(r=>r.trialFrames<5))throw Error('ritual not sampled');
 if(errors.length||rows.some(r=>!r.finite||r.mode!=='play'||r.maxEffects>200||r.workP95Ms>100||r.rate===1&&r.region==='影の世界'&&r.room===2&&r.frameP95Ms>100))throw Error(JSON.stringify({errors,rows}));
 console.log(JSON.stringify({environment:trials?'Headless Chromium, DPR 2, cloud host; god and shadow rituals plus blind/poison; not a phone':signature?'Headless Chromium, DPR 2, cloud host; signature scenarios at normal CPU speed, not a phone':process.argv.includes('--demon-boss')?'Headless Chromium, DPR 2, cloud host; Demon boss at normal CPU speed, not a phone':process.argv.includes('--shadow-boss')?'Headless Chromium, DPR 2, cloud host; Shadow boss at normal CPU speed, not a phone':'Headless Chromium, DPR 2, cloud host; last scenario uses 4x CPU throttle, not a phone',method:'30 warmup + 180 real animation frames; grass/shadow horde or second-form boss; automatic skills and repeated manual effects (signature=true: charged Dark Crash, Dawn, Meteor); simulation + render CPU costs',rows},null,2));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
