const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined});await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 console.log(await page.evaluate(()=>{
  let count=0;const ok=(v,m)=>{if(!v)throw Error(m);count++};
  window.theatreProfile=()=>{saveCampaign(normalizeCampaign({version:1,realmOrderVersion:2,missionVersion:1,darkRevealed:true,heavenRevealed:true,finaleRevealed:true,clears:Object.fromEntries(WORLD_ORDER.map(i=>[i,{rank:'A',time:100,score:100}])),wallet:9000,craftStones:1000,weapons:WEAPONS.map(w=>w.id),ultimates:ultimateArts().map(a=>a.id),rares:RARE_IDS}));game.mode='stageSelect';sounds=false};
  window.theatreFight=(region=4)=>{theatreProfile();startStageAttempt(region,244);game.room=stageRoomCount(region);game.templeDrafting=false;game.pendingChoices=0;game.mode='play';game.phase='combat';game.active=true;game.bossScene=null;game.choiceDelay=999;game.spawnPlan=[];game.waveQueued=false;game.pendingHit=null;enemies=[];warnings=[];effects=[];hostileShots=[];hazards=[];fields=[];bolts=[];scheduled=[];drops=[];terrain=[];p.x=680;p.y=STAGES[game.stage].y+180;p.hp=p.maxHp=1000;p.mp=p.maxMp=100;p.autoCd=999;p.invuln=999;p.armor=0;p.parry=0;p.shield=0;p.cutin=0;p.ultimateTime=0;p.skillCharge=null;p.skillPose=null;clearFieldNotices();closeModal();const e=spawnEnemy('boss',680,STAGES[game.stage].y);configureRealmBoss(e,0);e.spawnTime=0;e.state='chase';e.cooldown=999;e.facing={x:0,y:1};enemies=[e];cam={x:e.x,y:e.y-85};return e};
  window.theatreGate=()=>{const e=theatreFight(4);game.room=stageRoomCount()-1;game.active=false;game.campReady=true;game.phase='roomRest';enemies=[];p.learned={crescent:3,nova:3,dawn:3,flurry:1,whirl:2,flame:2,bloodpact:1};p.loadout=['dawn','nova','flurry'];p.hp=216;p.maxHp=216;p.mp=45;p.maxMp=52;game.fieldPotions=3;openBossGate();return e};
  // Every normal/endgame/mine boss is animated through all cinematic beats.
  const themes=new Set();for(const region of [0,1,2,3,4,5,6,7,9]){
   const e=theatreFight(region);themes.add(bossThemeKey(e));const hp=e.hp,x=e.x,y=e.y,player=p.hp;
   for(const kind of ['arrival','transform','defeat']){
    const before={...e,facing:{...e.facing}};beginBossScene(kind,e,kind==='transform'?before:null);const scene=game.bossScene;
    for(const q of [0,.18,.44,.53,.6,.76,.93,1]){scene.time=scene.duration*q;render(q*6)}
    ok(e.hp===hp&&e.x===x&&e.y===y&&p.hp===player,'cinematic render cannot change battle '+region+' '+kind);endBossScene();
   }
  }ok(themes.size===9,'distinct themes include ancient and mine bosses');
  let e=theatreFight(4);const w={kind:'ring',x:p.x,y:p.y,r:900,inner:120,owner:e.id,atk:90,dir:{x:1,y:0},max:2,life:2};
  emitBossTheatre(w,e);emitBossTheatre(w,e);ok(effects.filter(f=>f.kind==='bossTheatre').length===1,'one cosmetic instance per real warning');ok(w.atk===90&&w.life===2&&w.inner===120,'cosmetics preserve damage and timing');
  for(let i=0;i<50;i++)emitBossTheatre({...w,theatreEmitted:false},e);ok(effects.filter(f=>f.kind==='bossTheatre').length<=6,'visual pool bounded');
  effects=[];emitBossTheatre({...w,x:1e9,y:1e9,r:100,theatreEmitted:false},e);ok(!effects.length,'offscreen explosions are not allocated');
  // Pixel-level refuge test: the new impact art never paints over a safe ring's hole.
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);cam={x:200,y:200};drawBossTheatre({kind:'bossTheatre',theme:'god',x:200,y:200,shape:'ring',r:230,inner:70,dir:{x:1,y:0},seed:3},.7);ok(ctx.getImageData(200,200,1,1).data[3]===0,'safe refuge remains visually clear');const pixels=ctx.getImageData(0,0,Math.min(390,cv.width),Math.min(500,cv.height)).data;ok(pixels.some((n,i)=>i%4===3&&n>0),'ring spectacle actually draws');ctx.restore();
  e=theatreFight(4);reduced=true;beginBossScene('arrival',e);ok(game.bossScene.duration===1,'reduced motion keeps shortened cinematic');const pose=bossScenePose(game.bossScene,e,.5);ok(pose.y===0&&pose.angle===0&&pose.x===1,'reduced motion removes leaps and rotation');effects=[];emitBossTheatre({...w,theatreEmitted:false},e);ok(!effects.length,'reduced motion skips new combat debris');render(1);endBossScene();reduced=false;
  preferences.flashes=false;beginBossScene('transform',e,{...e});game.bossScene.time=game.bossScene.duration*.6;render(2);endBossScene();preferences.flashes=true;
  // Rendering all attack shapes also catches missing dirs/radii and context leaks.
  for(const theme of Object.keys(BOSS_THEMES))for(const shape of ['circle','ring','line','fan']){ctx.save();drawBossTheatre({kind:'bossTheatre',theme,x:e.x,y:e.y,shape,r:250,inner:90,width:130,length:600,spread:.7,dir:{x:.8,y:.6},seed:7},.6);ctx.restore()}
  // The temple receives the requested increase; other regions and later temple fights retain their HP.
  theatreProfile();game.singleStage=true;game.region=TEMPLE;game.stage=4;
  for(let room=1;room<=8;room++)for(const index of [0,1]){game.room=room;const source=endgameBossRegion(),boss=spawnEnemy('boss',680,STAGES[game.stage].y),old=Math.round(REGIONS[source].hp*1.42*(source===3?.58:1));configureRealmBoss(boss,index);ok(source<=4?boss.maxHp>=old*1.3:boss.maxHp===old,'temple-only HP adjustment room '+room+' index '+index)}
  e=theatreFight(4);ok(e.maxHp===REGIONS[4].hp,'normal demon HP unchanged');
  theatreFight(MINE);game.room=3;game.active=false;game.campReady=true;game.phase='roomRest';ok(openBossGate()&&$('modal').querySelector('.boss-gate-heading h2').textContent===mineBossName(),'mine gate uses its own boss and cavern artwork');
  theatreGate();const hp=p.hp,mp=p.mp,base=p.power,reach=p.reach,rate=p.autoInterval;equipRunWeapon('greatsword');equipRunWeapon('traveler');ok(Math.abs(p.power-base)<1e-8&&Math.abs(p.reach-reach)<1e-8&&Math.abs(p.autoInterval-rate)<1e-8,'weapon swap round trip does not stack stats');ok(p.hp===hp&&p.mp===mp,'gate never heals for free');
  return 'PASS '+count+' cinematic, combat separation, refuge pixels, effect budget, reduced motion and temple HP checks';
 }));
 // Real touch selection, skill swap and one deliberate boss confirmation.
 await page.locator('[data-gate-target="skill0"]').tap();await page.locator('[data-gate-choice="nova"]').tap();assert.deepEqual(await page.evaluate(()=>p.loadout),['nova','dawn','flurry']);
 await page.locator('[data-gate-target="skill2"]').tap();await page.locator('[data-gate-choice=""]').tap();assert.equal(await page.evaluate(()=>p.loadout[2]),null);
 await page.locator('#gateWeapon').tap();await page.locator('[data-gate-choice="origin"]').tap();assert.equal(await page.evaluate(()=>game.weapon),'origin');
 await page.locator('#gateUltimate').tap();await page.locator('[data-gate-choice="warped"]').tap();assert.equal(await page.evaluate(()=>game.ultimateArt),'warped');assert.deepEqual(await page.evaluate(()=>[p.hp,p.mp,game.fieldPotions]),[216,45,3]);
 await page.locator('#bossGateBack').tap();assert.equal(await page.evaluate(()=>game.phase),'exitWalk');
 await page.evaluate(()=>{game.phase='roomRest';openBossGate()});await page.locator('#bossGateConfirm').tap();assert.equal(await page.evaluate(()=>game.room),5);assert(await page.evaluate(()=>!!game.bossScene),'boss entrance plays after confirmation');
 // Inspect the actual frames in desktop, portrait and landscape, with the action row always reachable.
 for(const [width,height]of [[1280,800],[390,844],[320,568],[568,320],[844,390]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>theatreGate());await page.waitForTimeout(80);
  assert(await page.evaluate(()=>{const m=$('modal'),r=m.getBoundingClientRect(),body=m.querySelector('.boss-gate-body');return document.documentElement.scrollWidth<=innerWidth&&m.scrollWidth<=m.clientWidth+1&&body.getBoundingClientRect().height>70&&['bossGateBack','bossGateConfirm'].every(id=>{const b=$(id).getBoundingClientRect();return b.width>0&&b.top>=r.top&&b.bottom<=r.bottom&&b.bottom<=innerHeight})}),'gate fits '+width+'x'+height);
  if(height<=450)assert(await page.locator('.gate-choice-list').evaluate(e=>e.firstElementChild.getBoundingClientRect().bottom<=e.getBoundingClientRect().bottom+1),'first landscape option is fully readable');
  await page.screenshot({path:'/tmp/boss-gate-'+width+'.png'});
  if(width!==320&&width!==568)for(const region of [0,1,2,3,4,5,6,7,9]){
   await page.evaluate(region=>{const e=theatreFight(region);if([4,5,6].includes(region)){const before={...e,facing:{...e.facing}};e.bossPhase=2;e.awakened=true;beginBossScene('transform',e,before)}else beginBossScene('arrival',e);game.bossScene.time=game.bossScene.duration*.63;cam={x:e.x,y:e.y-85};render(3);game.mode='pause'},region);
   await page.screenshot({path:'/tmp/boss-theatre-'+region+'-'+width+'.png'});
  }
 }
 // Real combat impacts retain visible refuges and player/telegraph priority layers.
 for(const [width,height]of [[390,844],[844,390]])for(const region of [4,5,6]){
  await page.setViewportSize({width,height});await page.waitForTimeout(70);await page.evaluate(region=>{const e=theatreFight(region);const refuge={x:p.x+120,y:p.y-60},w=personaWarning(e,'ring',refuge.x,refuge.y,2,{r:arenaCoverRadius(refuge),inner:125,atk:80,persist:1,move:region===4?'infernalDominion':region===5?'stellarReversal':'eclipsePrison'});resolvePersonaStrike(w,e);warnings=[];for(const fx of effects)if(fx.kind==='bossTheatre')fx.life=.8;cam={x:p.x,y:p.y-80};render(3);game.mode='pause'},region);await page.screenshot({path:'/tmp/boss-impact-'+region+'-'+width+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS touch loadout selection, skill swapping, boss confirmation, 5 responsive layouts and 9 boss themes without runtime errors');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
