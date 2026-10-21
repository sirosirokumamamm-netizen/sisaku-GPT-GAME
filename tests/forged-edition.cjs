const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[];
  page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined});
  await page.goto(base);await page.locator('[data-stage="0"]').tap();await page.locator('#startStageButton').tap();
  console.log(await page.evaluate(()=>{
   let n=0;const ok=(value,message)=>{if(!value)throw Error(message);n++};sounds=false;game.mode='pause';game.pendingChoices=0;game.bossScene=null;
   const foe=spawnEnemy('slime',p.x+40,p.y);foe.spawnTime=0;foe.hp=foe.maxHp=10000;foe.element='water';enemies=[foe];p.crit=0;texts=[];
   const hp=foe.hp,damage=hurtEnemy(foe,100,true,'#fff',false,false,true,'lightning');
   ok(damage===135&&hp-foe.hp===135,'weakness increases actual damage');ok(texts.at(-1).text==='弱点！ 135','weakness accompanies damage');
   texts=[];hurtEnemy(foe,100,true,'#fff',false,false,true,'fire');ok(!texts.some(t=>t.text.includes('弱点')),'neutral affinity is not called a weakness');
   const gold=spawnEnemy('goldSlime',p.x+60,p.y);gold.spawnTime=0;gold.element='water';enemies=[gold];texts=[];
   ok(hurtEnemy(gold,100,true,'#fff',false,false,true,'lightning')===1&&!texts.some(t=>t.text.includes('弱点')),'gold slime keeps fixed damage');
   const boss=spawnEnemy('boss',p.x,p.y-100);boss.spawnTime=0;const small={owner:boss.id,atk:12,kind:'circle',r:45,attack:'slam'},strong={...small,atk:60},normal={...strong,owner:foe.id};enemies=[boss,foe];
   ok(!showAttackWarning(small)&&showAttackWarning(strong)&&!showAttackWarning(normal),'only a boss strong attack has a warning');
   const list=[small,strong,normal];warnings=list.slice();let strokes=0;const stroke=ctx.stroke;ctx.stroke=function(){strokes++;return stroke.apply(this,arguments)};
   try{drawWarning({...small,x:380,y:p.y,life:1,max:1},0);drawWarning({...normal,x:380,y:p.y,life:1,max:1},0);ok(strokes===0,'hidden warnings have no drawing');drawWarning({...strong,x:380,y:p.y,life:1,max:1},0);ok(strokes>0,'strong warning remains visible')}finally{ctx.stroke=stroke}
   ok(warnings.length===3,'visibility does not delete attack simulation');
   game.chosenSkills=['power','frost','dawn','mana','flame','orbit'];const selected=new Set(game.chosenSkills);
   for(let i=0;i<40;i++){const q=chestOffers(i===0);ok(q.length===4&&new Set(q.map(o=>o.id)).size===4&&q.every(o=>o.kind==='rare'&&selected.has(o.id)&&o.fromRun),'four unique candidates from chosen skills')}
   game.chosenSkills=['power','power','frost'];let q=chestOffers(false);ok(q.length===4&&q.some(o=>o.id==='power')&&q.some(o=>o.id==='frost'),'missing candidates are filled without losing chosen skills');
   game.chosenSkills=[];q=chestOffers(false);ok(q.length===4&&q.every(o=>getSkill(o.id)),'empty history still yields four skills');
   game.rng=123456;let dawn=0;for(let i=0;i<12000;i++)if(weightedSkillPick([getSkill('dawn'),getSkill('crescent')]).id==='dawn')dawn++;
   ok(dawn/12000>.42&&dawn/12000<.47,'dawn weight is slightly reduced, not locked out');
   p.lv=1;p.learned={crescent:1};p.loadout=['crescent',null,null];ok(Array.from({length:200},drawOffers).some(q=>q.includes('dawn')),'dawn can still appear from level one');
   ok(skillBadges(getSkill('orbit')).includes('枠不要')&&skillBadges(getSkill('orbit')).includes('MP不要'),'automatic badges distinguish both costs');
   ok(skillBadges(getSkill('crescent')).includes('MP不要')&&!skillBadges(getSkill('crescent')).includes('枠不要'),'free manual skill still uses a slot');
   ok(skillBadges(getSkill('heal')).includes('枠不要')&&!skillBadges(getSkill('heal')).includes('MP不要'),'rest healing costs MP without a slot');
   game.mode='preparation';game.pendingChoices=0;startStageAttempt(0,103);game.pendingChoices=2;game.choiceDelay=0;flushLevelChoices();
   ok(game.mode==='draft'&&!$('deferChoice'),'growth cannot be deferred');chooseOffer(0);ok(game.pendingChoices===1&&game.mode==='draft','all queued growth must be resolved');chooseOffer(0);ok(game.pendingChoices===0&&game.mode==='play','combat returns after growth');
   game.active=false;game.phase='roomRest';game.chosenSkills=['power','dawn'];game.room=2;game.relicOffers=[];roomEquipment();
   ok(suspendExpedition()&&campaign.suspended.chosenSkills.join(',')==='power,dawn','suspension saves chosen history');
   ok(resumeExpedition()&&game.chosenSkills.join(',')==='power,dawn','suspension restores chosen history');
   const old=JSON.parse(JSON.stringify(campaign));old.suspended=null;old.rares=['wave'];old.carries=['wave'];old.carrySlots=1;
   const legacy=normalizeCampaign(old);ok(legacy.rares.includes('wave')&&legacy.carries[0]==='wave','old inventory remains compatible');
   const sample={stage:0,score:1000,time:50,win:true,rank:'B',gold:40,bankGold:40};old.pending={id:'old-chest',result:sample,offers:[{kind:'rare',id:'wave'},{kind:'rare',id:'flame'},{kind:'gold',id:'gold-180',amount:180},{kind:'gold',id:'gold-220',amount:220}],first:true};
   ok(normalizeCampaign(old).pending.offers[2].kind==='gold','old unopened rewards survive unchanged');
   game.mode='preparation';startStageAttempt(0,22);game.room=5;game.chosenSkills=['power','mana','flame','dawn'];game.pendingChoices=0;game.settled=false;completeStageAttempt();
   $('resultStages').click();const saved=JSON.parse(localStorage.getItem(CAMPAIGN_KEY)),offers=campaign.pending.offers.map(o=>o.id),id=campaign.pending.id;ok(offers.every(x=>['power','mana','flame','dawn'].includes(x)),'completion uses the run history');
   campaign=normalizeCampaign(saved);openChest();ok(campaign.pending.offers.map(o=>o.id).join(',')===offers.join(','),'reload cannot reroll rewards');
   ok(claimChest(id,0)&&campaign.rares.includes(offers[0])&&campaign.carries[0]===offers[0],'reward is unlocked and prepared for the next run');const wallet=campaign.wallet;
   ok(!claimChest(id,0)&&campaign.wallet===wallet,'reward cannot be claimed twice');
   game.mode='preparation';startStageAttempt(0,29);game.room=5;game.pendingChoices=2;game.settled=false;completeStageAttempt();ok(game.mode==='stageResult'&&game.pendingChoices===0,'final boss shows rank without growth');$('resultStages').click();ok(game.mode==='chest'&&game.pendingChoices===0,'inheritance follows rank without growth');
   const normalized=normalizeTouchSettings({portrait:{pad:{x:2,y:-1,scale:9,opacity:-1},skills:{x:NaN,y:0,scale:1,opacity:1}}});
   ok(normalized.portrait.pad.x===1&&normalized.portrait.pad.y===0&&normalized.portrait.pad.scale===1.25&&normalized.portrait.pad.opacity===.4&&!normalized.portrait.skills,'invalid layout settings are bounded');
   return 'PASS '+n+' affinity, warning, growth, weighted offers, persistence and reward assertions';
  }));
  await page.evaluate(()=>{campaign=normalizeCampaign({...campaign,rares:RARE_IDS,wallet:5000,pending:null,clears:Object.fromEntries([0,1,2,3,4,5].map(i=>[i,{score:100,time:50,rank:'B'}])),finaleRevealed:true,darkRevealed:true,heavenRevealed:true});saveCampaign(campaign);game.mode='stageSelect';game.pendingChoices=0;openStageSelect()});
  for(const [width,height]of [[320,568],[390,844],[568,320],[667,375],[844,390],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>openStageSelect());
   assert.equal(await page.locator('[data-stage="0"] .cleared-ribbon').textContent(),'クリア');
   assert.notEqual(await page.locator('[data-stage="0"]>i').textContent(),'✓');assert(await page.locator('#weaponShop').isVisible());
   const mapFaults=await page.locator('.world-map').evaluate(map=>{const bounds=map.getBoundingClientRect(),nodes=[...map.querySelectorAll('[data-stage]')].map(e=>e.getBoundingClientRect()),errors=[];nodes.forEach((r,i)=>{if(r.left<bounds.left||r.right>bounds.right||r.top<bounds.top||r.bottom>bounds.bottom)errors.push('clip '+i);for(let j=i+1;j<nodes.length;j++){const b=nodes[j];if(r.left<b.right&&b.left<r.right&&r.top<b.bottom&&b.top<r.bottom)errors.push('overlap '+i+'/'+j)}});return errors});assert.deepEqual(mapFaults,[],'six map nodes '+width);
   await page.locator('[data-stage="0"]').tap();
   const parts=await page.locator('#modal').evaluate(e=>{const r=e.getBoundingClientRect();return {w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight,actions:['prepStore','startStageButton'].map(id=>{const x=document.getElementById(id).getBoundingClientRect();return {id,x:x.left,y:x.top,w:x.width,h:x.height,bottom:x.bottom,inside:x.top>=r.top&&x.bottom<=r.bottom}})}});
   assert(parts.sw<=parts.w+2&&parts.sh<=parts.h+2,JSON.stringify(parts));for(const x of parts.actions)assert(x.inside&&x.h>=44&&x.w>=44,JSON.stringify(x));
   const count=await page.locator('.carry-grid [data-carry]:visible').count();assert.equal(count,43);assert.equal(await page.locator('.embark-pages').count(),0);
   await page.locator('.carry-grid [data-carry]').first().tap();assert((await page.locator('#carryDetail').textContent()).includes('蒼月斬'));
   await page.locator('#prepStore').tap();assert(await page.locator('#weaponBack').isVisible());await page.locator('#weaponBack').tap();
   await page.locator('#startStageButton').tap();await page.evaluate(()=>{p.invuln=999;game.pendingChoices=0;enemies=[];game.active=false;game.phase='exitWalk';updateUI();applyTouchLayout()});
   assert(await page.locator('#combatPotion').isVisible());assert(await page.locator('#roomExit').isVisible());
   const box=await page.locator('#roomExit').boundingBox();assert(box.height>=44&&box.height<=52&&box.width<220);
   await page.evaluate(()=>{game.pendingChoices=1;game.choiceDelay=0;flushLevelChoices()});assert.equal(await page.locator('[data-offer]:visible').count(),4);
   await page.waitForTimeout(250);await page.screenshot({path:'/tmp/forged-growth-'+width+'.png'});
   const clipped=await page.locator('#modal').evaluate(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2);assert(!clipped,'growth overflow '+width);
   await page.locator('[data-offer]').first().tap();
   console.log('PASS map, departure, store return, persistent potion and mandatory growth '+width+'×'+height);
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{game.mode='preparation';startStageAttempt(0,45);game.pendingChoices=0;p.invuln=999});
  await page.locator('#pause').tap();await page.locator('#pauseTouchLayout').tap();assert(!(await page.locator('#saveTouchLayout').isDisabled()));
  await page.locator('#touchScale').evaluate(e=>{e.value='110';e.dispatchEvent(new Event('input',{bubbles:true}))});
  const pad=await page.locator('#movePad').boundingBox(),cdp=await page.context().newCDPSession(page),t={id:1,x:pad.x+pad.width/2,y:pad.y+pad.height/2};
  const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  await touch('touchStart',[t]);await touch('touchMove',[{...t,x:t.x+10,y:t.y-16}]);await touch('touchEnd',[]);
  for(const key of ['potion','ultimate','skills']){
   const before=await page.evaluate(key=>currentTouchLayout()[key].x,key);
   const rect=await page.locator(key==='skills'?'.skill-group':key==='potion'?'#combatPotion':'#ultimate').boundingBox();
   const point={id:1,x:rect.x+rect.width/2,y:rect.y+rect.height/2};
   await touch('touchStart',[point]);await touch('touchMove',[{...point,x:point.x+2}]);await touch('touchEnd',[]);
   assert.notEqual(await page.evaluate(key=>currentTouchLayout()[key].x,key),before,'drag '+key);
  }
  assert(!(await page.locator('#saveTouchLayout').isDisabled()));await page.locator('#saveTouchLayout').tap();
  const savedState=await page.evaluate(()=>({preferences:preferences.touchLayout,w:innerWidth,h:innerHeight,edit:touchEdit,mode:game.mode}));assert(savedState.preferences.portrait,JSON.stringify(savedState));const saved=savedState.preferences.portrait.pad;assert.equal(saved.scale,1.1);assert(saved.y<.91);
  await page.reload();await page.locator('[data-stage="0"]').tap();await page.locator('#startStageButton').tap();
  const restored=await page.locator('#movePad').boundingBox();assert(Math.abs(restored.width-123.2)<1,'pad size persisted');
  const delta=await page.evaluate(()=>{const a=$('movePad').getBoundingClientRect(),b=$('stick').getBoundingClientRect();return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2)});assert(delta<.6,'resized joystick stays centered');
  await page.locator('#pause').tap();await page.locator('#pauseTouchLayout').tap();
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(100);assert.equal(await page.locator('#touchOrientation').textContent(),'横画面の配置');
  assert(!(await page.locator('#saveTouchLayout').isDisabled()));await page.locator('.touch-adjustments summary').tap();await page.locator('#mirrorTouchLayout').tap();assert(!(await page.locator('#saveTouchLayout').isDisabled()));
  await page.locator('[data-touch-pick="skills"]').tap();await page.locator('#touchOpacity').evaluate(e=>{e.value='60';e.dispatchEvent(new Event('input',{bubbles:true}))});await page.locator('#saveTouchLayout').tap();
  assert.equal(await page.evaluate(()=>preferences.touchLayout.landscape.skills.opacity),.6);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>game.mode),'pause','saving must not also activate resume behind the editor');
  assert.equal(await page.evaluate(()=>preferences.touchLayout.portrait.pad.scale),1.1,'orientation settings remain separate');
  await page.locator('#pauseTouchLayout').tap();const snapshot=await page.evaluate(()=>JSON.stringify(preferences.touchLayout));
  await page.locator('#resetTouchLayout').tap();await page.locator('#cancelTouchLayout').tap();assert.equal(await page.evaluate(()=>JSON.stringify(preferences.touchLayout)),snapshot,'cancel does not persist changes');
  console.log('PASS draggable controls, size, opacity, mirrored layout, orientation separation, reload and cancellation');
  console.log(await page.evaluate(()=>{
   game.mode='play';game.active=false;game.phase='exitWalk';game.pendingChoices=0;game.bossScene=null;enemies=[];closeModal();sounds=true;preferences.music=.3;preferences.effects=0;
   const names=[0,1,2,3,4,5].map(region=>{game.region=region;game.active=true;game.room=1;return musicSceneKey()});if(new Set(names).size!==6)throw Error('region music is shared');
   for(const theme of Object.values(SCORE_THEMES))if(theme.lead.length!==16||theme.chords.length!==4||!theme.lead.every(Number.isFinite))throw Error('invalid score');
   game.region=0;game.room=1;game.active=false;effects=[];reduced=false;preferences.flashes=true;
   for(let i=0;i<100;i++)emitSkillAccent(getSkill('flame'));limitCosmetics();if(effects.length>effectBudget())throw Error('unbounded new effects');
   reduced=true;const size=effects.length;emitSkillAccent(getSkill('dawn'));if(effects.length!==size)throw Error('reduced motion ignored');reduced=false;
   return 'PASS six regional scores, score structure, bounded accents and reduced-motion behavior';
  }));
  await page.waitForTimeout(1200);const status=await page.evaluate(()=>({voices:musicVoices,state:audio?.state||'unknown'}));assert.equal(status.state,'running');assert(status.voices>0&&status.voices<=48);assert.deepEqual(errors,[]);
  console.log('PASS no runtime errors; music voice budget '+status.voices+'/48');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
