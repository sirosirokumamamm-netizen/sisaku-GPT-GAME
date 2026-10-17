const{chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1040}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message)});
 const url=process.env.BASE_URL||'http://127.0.0.1:8000';await page.goto(url);await page.getByRole('button',{name:'剣士の冒険へ'}).click();
 await page.keyboard.down('w');await page.waitForTimeout(2100);await page.keyboard.up('w');assert(await page.evaluate(()=>game.active&&game.wave===1));await page.screenshot({path:'/tmp/swordsman-desktop.png',fullPage:true});
 const checks=await page.evaluate(()=>{
 const tests=[],ok=(condition,name)=>{if(!condition)throw Error(name);tests.push(name)};
 const clean=()=>{reset();begin();sounds=false;p.autoCd=999;p.crit=0;hitstop=0};
 const foe=(dx=0,dy=-70)=>{const e=spawnEnemy('slime',p.x+dx,p.y+dy);e.hp=e.maxHp=1000;e.state='recover';e.timer=999;enemies.push(e);return e};
 const grant=id=>{p.learned[id]=1;p.loadout[0]=id;p.mp=p.maxMp=100;return getSkill(id)};
 const tick=(seconds)=>{for(let t=0;t<seconds;t+=1/60){update(1/60);updateVisuals(1/60)}};
 clean();ok(SKILLS.length===40&&new Set(SKILLS.map(s=>s.id)).size===40,'40 unique skills');ok(SKILLS.filter(s=>s.category!=='passive').length===25,'25 active skills');ok(SKILLS.filter(s=>s.category==='passive').length===15,'15 passive skills');ok(p.loadout[0]==='crescent'&&p.loadout.filter(Boolean).length===1&&p.points===0,'start with one sword skill');
 let e=foe();p.autoCd=0;update(.016);ok(e.hp===987,'normal attack is automatic');
 clean();e=foe();action('slash');ok(e.hp===966,'starting crescent damages front');const cd=p.skillCooldowns.crescent;action('slash');ok(p.skillCooldowns.crescent===cd&&e.hp===966,'cooldown prevents repeated attack');
 clean();e=foe();enemyWarning(e);warnings[0].life=.15;p.skillCooldowns.crescent=2;p.mp=0;action('roll');ok(combat.slow===1.25&&game.perfects===1&&p.counter>0,'last moment dodge triggers slow and counter');ok(p.skillCooldowns.crescent===0&&p.mp===5,'perfect dodge restores MP and refreshes skills');const w=warnings[0];p.invuln=0;resolveWarning(w);ok(p.hp===90,'perfectly avoided strike cannot deal damage');perfectDodge(w);ok(game.perfects===1,'same warning cannot farm perfect');
 clean();e=foe();enemyWarning(e);warnings[0].life=.55;action('roll');ok(!combat.slow,'early dodge has no slow bonus');
 clean();e=foe(300);enemyWarning(e);warnings[0].life=.1;p.x=105;action('roll');ok(!combat.slow,'out-of-danger roll has no perfect bonus');
 clean();e=foe();enemyWarning(e);warnings[0].life=.1;e.hp=0;action('roll');ok(!combat.slow,'dead owner cannot grant perfect');
 clean();keys.add('d');const px=p.x;action('roll');tick(.17);resetInput();ok(p.x-px>60&&p.x-px<85,'dodge distance is about 70-80, not old 150+');ok(p.cd.roll>0&&p.cd.roll<1,'short dodge has recovery cooldown');
 clean();e=foe(0,-300);e.state='chase';e.cooldown=99;combat.slow=1.25;const ey=e.y,py=p.y;keys.add('w');update(.1);resetInput();ok(Math.abs(py-p.y-20.5)<.001,'player keeps normal movement speed in slow');ok(Math.abs(e.y-ey)<=e.speed*.016+.001&&e.y!==ey,'enemy movement slows to sixteen percent');
 clean();e=foe();p.counter=3.5;action('slash');ok(e.hp===932&&p.counter===0,'counter doubles next skill once');
 // Every active skill must change combat, movement, resources or a timed effect.
 for(const s of SKILLS.filter(s=>s.category!=='passive')){
  clean();grant(s.id);e=foe(s.kind==='orbit'?105:0,s.kind==='orbit'?0:-70);p.hp=35;
  const oldX=p.x,oldY=p.y;if(s.kind==='heal'){game.campReady=true;p.mp-=s.mp;castSkill(s,1)}else action('slash');const mpAfterCast=p.mp;
  if(s.kind==='guard'){ok(p.shield===35&&p.shieldTime>0,'guard creates barrier');const hp=p.hp;takeHit(10,p.x,p.y);ok(p.hp===hp&&p.shield===25,'barrier absorbs damage')}
  else if(s.kind==='parry'){ok(p.parry>0,'parry opens timed stance');const hp=p.hp;takeHit(10,p.x,p.y);ok(p.hp===hp&&e.hp<1000&&p.counter>0,'parry blocks and counters')}
  else if(s.kind==='heal')ok(p.hp===63,'healing skill restores HP');
  else if(s.kind==='focus')ok(p.focus===5,'focus gives attack speed buff');
  else if(s.kind==='wisp'){tick(1);ok(e.hp<1000,'wisp fires real projectiles')}
  else if(s.kind==='orbit'){updateFields(.01);ok(fields.length===1&&e.hp<1000,'orbit blades damage nearby enemy')}
  else if(s.kind==='field'){updateFields(.016);ok(fields.length===1&&e.hp<1000,s.id+' field ticks damage')}
  else if(s.kind==='meteor'){ok(e.hp===1000&&scheduled.length===1,'meteor waits before impact');tick(.9);ok(e.hp<1000,'meteor impact deals delayed damage')}
  else if(s.kind==='projectile'){ok(bolts.length===1&&e.hp===1000,'flying slash starts as a projectile');tick(.3);ok(e.hp<1000,'flying slash hits along its path')}
  else ok(e.hp<1000,s.id+' deals damage');
  if(s.kind==='dash'||s.kind==='blink')ok(p.x!==oldX||p.y!==oldY,s.id+' moves swordsman');
  if(s.status==='burn'){ok(e.burn>0,'flame applies burn');const hp=e.hp;tick(.6);ok(e.hp<hp,'burn deals damage over time')}
  if(s.status==='frost')ok(e.frost>0,'ice applies movement slow');
  if(s.status==='stun')ok(e.stun>0,'quake stuns enemies');
  ok(mpAfterCast===100-s.mp,s.id+' consumes listed MP');
 }
 clean();grant('chain');const chain=[foe(0,-80),foe(100,-110),foe(210,-150)];action('slash');ok(chain.every(e=>e.hp<1000),'chain lightning jumps between enemies');
 clean();grant('execute');e=foe();e.hp=300;action('slash');ok(e.hp===137,'execute gets low-health multiplier');
 clean();grant('flurry');e=foe();action('slash');tick(.3);ok(e.hp<=949,'flurry actually delivers three hits');
 clean();grant('thunder');p.mp=0;p.counter=3;foe();action('slash');ok(p.mp===0&&p.counter===0&&p.skillCooldowns.thunder>0,'counter allows free high-cost skill');
 clean();grant('whirl');p.mp=0;action('slash');ok(!p.skillCooldowns.whirl,'insufficient MP does not start cooldown');

 clean();p.lv=4;
 const combinations=new Set();for(let i=0;i<100;i++){const offers=drawOffers();ok(offers.length===4&&new Set(offers).size===4,'unique eligible four-card draw '+i);ok(offers.every(id=>(p.learned[id]||0)<3&&p.lv>=(getSkill(id).lv||1)),'rank and level filtering '+i);combinations.add([...offers].sort().join(','))}
 ok(combinations.size>5,'offer sets genuinely vary');
 openDraft();const saved=[...game.offers];openSkillBook();ok(JSON.stringify(game.offers)===JSON.stringify(saved),'equipment button cannot reroll reward');openDraft();ok(JSON.stringify(game.offers)===JSON.stringify(saved),'reopening draft preserves offers');
 const picked=game.offers[0];ok(chooseOffer(0)&&game.mode==='play'&&p.learned[picked]>0,'one choice grants skill and resumes immediately');ok(!chooseOffer(0),'reward cannot be claimed twice');
 function chooseSpecific(id){game.mode='draft';game.offers=[id,...SKILLS.filter(s=>s.id!==id).slice(0,3).map(s=>s.id)];return chooseOffer(0)}
 clean();p.lv=4;for(const skill of SKILLS.filter(s=>s.category==='passive'))ok(chooseSpecific(skill.id)&&p.learned[skill.id]===1,skill.id+' passive is applied by choice');ok(p.power>1&&p.armor>0&&p.crit>.05&&p.manaRegen>0&&p.cooldownFactor<1,'passives really affect stats');
 chooseSpecific('whirl');chooseSpecific('wave');ok(p.loadout[1]===null&&p.loadout[2]===null,'learning waits for post-battle loadout');game.campReady=true;equipSkill('whirl',1);equipSkill('wave',2);chooseSpecific('frost');ok(p.loadout[1]==='whirl'&&p.learned.frost===1,'new skill preserves equipped technique');chooseSpecific('chain');ok(p.loadout[2]==='wave','learning never rotates equipped slots');
 p.skillCooldowns.frost=4;equipSkill('frost',2);ok(p.skillCooldowns.frost===4&&new Set(p.loadout).size===3,'equipment swap preserves cooldown without duplication');
 const hpmax=p.maxHp;chooseSpecific('vital');chooseSpecific('vital');ok(!chooseSpecific('vital')&&p.maxHp===hpmax+36,'rank 3 cap enforced');
 clean();ok(!chooseSpecific('nova'),'ultimate cannot be selected before level 3');
 clean();game.active=true;game.wave=1;game.phase='combat';enemies=[];update(.01);ok(game.phase==='waveBreak'&&game.phaseTimer===1.25,'first wave has readable reinforcement warning');update(.5);ok(game.phase==='waveBreak'&&!enemies.length,'break is visible');update(.8);ok(game.wave===2&&enemies.length===10&&game.phase==='combat','second horde arrives quickly');
 enemies=[];update(.01);ok(game.phase==='stageClear'&&game.phaseTimer===1.6&&game.mode==='play','clear has a deliberate closing beat');update(1.61);ok(game.mode==='camp'&&game.stage===0,'stage reward asks about equipment');continueJourney();ok(game.mode==='play'&&game.stage===1,'camp confirmation resumes travel');ok(p.lv===1,'stage completion does not grant a level');gainExperience(p.xpNext);tick(.24);ok(game.mode==='draft'&&game.offers.length===4&&p.lv===2,'experience triggers level and four choices');chooseOffer(0);ok(game.mode==='play','reward is one-tap resume');
 clean();game.phase='waveBreak';game.phaseTimer=.6;game.active=true;pause();update(1);ok(game.phaseTimer===.6,'pause freezes reinforcements');resume();
 clean();game.stage=STAGES.length-1;game.wave=1;game.active=true;spawnWave();ok(enemies.length===1&&enemies[0].kind==='boss','boss starts alone');const boss=enemies[0];boss.spawnTime=0;boss.hp=boss.maxHp*.69;updateEnemies(.016,.016);ok(enemies.length===1,'boss first phase transition has no adds');boss.hp=boss.maxHp*.34;updateEnemies(.016,.016);ok(enemies.length===1&&boss.bossPhase===2,'boss awakening remains one on one');
 clean();const archetypes=[];for(const kind of ['slime','bat','archer','bomber','shield','totem']){warnings=[];const enemy=spawnEnemy(kind,p.x,p.y-90);enemies.push(enemy);enemyWarning(enemy);archetypes.push(warnings[0].attack)}ok(new Set(archetypes).size===6,'six normal enemy archetypes have different attacks');
 clean();e=spawnEnemy('boss',p.x,p.y-100);enemies=[e];const patterns=[];for(let i=0;i<4;i++){warnings=[];enemyWarning(e);patterns.push(warnings.map(w=>w.attack).join(','))}ok(new Set(patterns).size===4,'boss cycles four distinct attack patterns');
 clean();e=spawnEnemy('archer',p.x,p.y-100);enemies=[e];enemyWarning(e);resolveWarning(warnings[0]);ok(hostileShots.length===3&&e.state==='recover','archer launches real fan projectiles');const shot=hostileShots[1];shot.x=p.x;shot.y=p.y-24;shot.dir={x:0,y:1};const hp=p.hp;updateHostiles(.1);ok(p.hp<hp,'hostile projectile can damage player');
 clean();e=spawnEnemy('archer',p.x,p.y-100);enemies=[e];shootFan(e,{x:0,y:1},1,220);hostileShots[0].x=p.x;hostileShots[0].y=p.y-30;p.rollTime=.1;p.dodgeAge=.05;p.invuln=.2;updateHostiles(.1);ok(game.perfects===1&&combat.slow>0&&p.hp===90,'rolling through bullet can perfect dodge');e.hp=0;updateHostiles(.01);ok(hostileShots.length===0,'defeating shooter clears its bullets');
 clean();e=spawnEnemy('bomber',p.x,p.y-120);enemies=[e];enemyWarning(e);resolveWarning(warnings[0]);ok(hazards.length===1,'bomber leaves persistent hazard');const health=p.hp;updateHostiles(.1);ok(p.hp<health,'hazard damages on contact');e.hp=0;updateHostiles(.1);ok(!hazards.length,'defeating bomber clears its trap');
 clean();e=spawnEnemy('bat',p.x,p.y-160);enemies=[e];enemyWarning(e);resolveWarning(warnings[0]);const ey2=e.y;updateEnemies(.05,.05);ok(e.state==='dash'&&e.y>ey2+20,'bat charges over time');
 const ring={kind:'ring',x:0,y:0,r:200,inner:75};ok(!warningContains(ring,{x:0,y:0},0)&&warningContains(ring,{x:100,y:0},0)&&!warningContains(ring,{x:230,y:0},0),'boss ring has a safe center and outer edge');
 clean();game.stage=3;game.active=true;e=spawnEnemy('archer',380,STAGES[3].y-400);enemies=[e];updateEnemies(.016,.016);ok(e.y>=STAGES[3].y-170,'ranged enemy cannot retreat behind inaccessible gate');
 clean();game.stage=STAGES.length-1;game.phase='stageClear';game.phaseTimer=.01;game.active=true;update(.02);ok(game.mode==='camp','final clear opens victory camp');continueJourney();ok(game.mode==='end'&&game.stage===STAGES.length,'final confirmation completes game');
 clean();p.hp=1;takeHit(20,p.x,p.y);ok(game.mode==='end','death screen works');
 clean();openDraft();chooseOffer(0);reset();begin();ok(game.offers.length===0&&game.drafts===0&&!hostileShots.length&&!hazards.length&&Object.keys(p.learned).length===1,'restart clears draft and all new combat state');
 return tests;
 });
 console.log('PASS',checks.length,'combat, waves and skill assertions');

 // A reward is four clickable cards, not a library or a second equipment step.
 await page.evaluate(()=>{p.lv=2;game.cleared=1;openDraft()});assert.equal(await page.locator('.draft-card').count(),4);await page.screenshot({path:'/tmp/tempo-draft.png',fullPage:true});const selected=await page.evaluate(()=>game.offers[1]);await page.keyboard.press('2');assert(await page.evaluate(id=>game.mode==='play'&&p.learned[id]>0,selected));
 await page.evaluate(()=>{game.active=false;game.campReady=true;showCamp()});await page.locator('#campEquip').click();assert.equal(await page.locator('.equipment-list select').count(),3);await page.getByRole('button',{name:'準備に戻る'}).click();await page.locator('#campContinue').click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/tempo-mobile.png',fullPage:true});
 const pad=await page.locator('#movePad').boundingBox(),skill=await page.locator('#slash').boundingBox();assert(pad.x+pad.width<skill.x);const y1=await page.evaluate(()=>p.y);await page.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2);await page.mouse.down();await page.mouse.move(pad.x+pad.width/2,pad.y+3);await page.waitForTimeout(400);await page.mouse.up();assert(await page.evaluate(y=>p.y<y,y1));assert.deepEqual(await page.evaluate(()=>joystick),{x:0,y:0});
 await page.evaluate(()=>{game.cleared=2;openDraft()});await page.screenshot({path:'/tmp/tempo-draft-mobile.png',fullPage:true});assert.equal(await page.locator('.draft-card').count(),4);await page.locator('.draft-card').first().click();assert.equal(await page.evaluate(()=>game.mode),'play');
 await page.setViewportSize({width:320,height:740});await page.evaluate(()=>openDraft());await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('.draft-card').count(),4);await page.locator('.draft-card').nth(2).click();
 const quiet=await browser.newPage({reducedMotion:'reduce'});await quiet.goto(url);await quiet.getByRole('button',{name:'剣士の冒険へ'}).click();assert(await quiet.evaluate(()=>{p.crit=0;const e=spawnEnemy('slime',p.x,p.y-50);e.hp=500;enemies=[e];action('slash');return reduced&&shake===0&&hitstop===0}));await quiet.close();assert.deepEqual(errors,[]);
 console.log('PASS desktop/mobile random four-choice UI, immediate resume, equipment, joystick, reduced motion, zero JS errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
