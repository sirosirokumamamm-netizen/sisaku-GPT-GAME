const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined});
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 console.log(await page.evaluate(()=>{
  let n=0;const ok=(v,m)=>{if(!v)throw Error(m);n++};sounds=false;
  for(const style of ['azure','storm','ward']){
   campaign=normalizeCampaign({version:1,style,rares:['whirl','flame']});saveCampaign(campaign);game.mode='stageSelect';startStageAttempt(0,8401);
   const initial=styleStartingSkills();ok(initial.every(id=>p.learned[id]===1),'style grants initial kit '+style);
   if(style==='azure')ok(p.power===1.1&&p.reach===1.12,'azure has reach and sword damage advantage');
   if(style==='storm')ok(p.loadout.includes('thunder')&&p.manaRegen===.75&&p.magicPower===1.15,'storm has spell and regeneration advantage');
   if(style==='ward')ok(p.armor===2&&p.maxHp===108&&isAutoSkill(getSkill('guard')),'ward has passive defense and automatic guard');
   game.chosenSkills=[...initial,'whirl','flame','wave','frost','power','mana'];
   for(let i=0;i<100;i++){const q=chestOffers(false);ok(q.length===4&&new Set(q.map(o=>o.id)).size===4&&q.every(o=>o.kind==='rare'&&!campaign.rares.includes(o.id)&&!initial.includes(o.id)),'new rewards exclude owned and initial skills '+style)}
  }
  campaign=normalizeCampaign({version:1,style:'storm',rares:RARE_IDS.filter(id=>id!=='wave'&&id!=='frost')});saveCampaign(campaign);game.chosenSkills=['wave','frost','thunder'];game.style='storm';let q=chestOffers(false);
  ok(q.filter(o=>o.kind==='rare').map(o=>o.id).sort().join(',')==='frost,wave'&&q.filter(o=>o.kind==='gold').length===2,'nearly complete library uses two new skills and honest funding fallback');
  const result={stage:0,score:100,time:50,rank:'B',win:true,gold:0};let old=normalizeCampaign({...campaign,pending:{id:'legacy',first:false,result,offers:[{kind:'rare',id:'thunder'},{kind:'rare',id:'whirl'},{kind:'gold',id:'old-a',amount:160},{kind:'gold',id:'old-b',amount:180}]}});
  ok(old.pending.offers[0].id==='thunder','unopened legacy chest is not silently rewritten');
  campaign=normalizeCampaign({version:1,style:'storm',rares:['wave','whirl','reach'],carries:['wave','whirl'],carrySlots:3});saveCampaign(campaign);game.mode='stageSelect';startStageAttempt(0,55);
  ok(p.loadout.includes('wave')&&p.loadout.includes('whirl')&&p.loadout.length===3,'two carried manual skills fit alongside style kit');
  campaign=normalizeCampaign({...campaign,style:'azure',carries:['reach']});saveCampaign(campaign);game.mode='stageSelect';startStageAttempt(0,56);ok(p.reach===1.12,'legacy initial passive carry cannot double its starting bonus');
  ok(getWeapon('rapier').price===getWeapon('greatsword').price,'early sword sidegrades same price');
  ok(['ember','frostblade','echo'].every(id=>getWeapon(id).price===1800),'elemental sword sidegrades same price');
  ok(['abyss','starfall','dawn'].every(id=>getWeapon(id).price===3600),'late sword sidegrades same price');
  campaign=normalizeCampaign({version:1,wallet:9000});saveCampaign(campaign);game.mode='stageSelect';openWeaponShop('stageSelect','greatsword');$('buySword').click();ok(campaign.wallet===7800&&campaign.weapon==='greatsword','new price is charged exactly once');
  openWeaponShop('stageSelect','rapier');$('buySword').click();const money=campaign.wallet;openWeaponShop('stageSelect','greatsword');$('buySword').click();ok(campaign.wallet===money&&campaign.weapon==='greatsword','owned sword switches for free');
  ok(document.querySelectorAll('.stat-delta').length===3,'weapon comparison includes three explicit deltas');
  game.mode='play';reduced=false;renderLoad.slow=false;const high=effectBudget();renderLoad.slow=true;ok(effectBudget()<high,'slow-frame feedback reduces only cosmetics');reduced=true;ok(effectBudget()===70,'reduced motion retains small budget');reduced=false;renderLoad.slow=false;
  return 'PASS '+n+' style, inheritance, old-save, equipment, price and cosmetic-budget assertions';
 }));
 // Compute contrast for visible text-bearing menu controls using their actual resolved colors.
 const contrast=()=>page.evaluate(()=>{
  const rgb=s=>{const a=s.match(/[\d.]+/g);return a? a.slice(0,3).map(Number):[0,0,0]},lum=a=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),bad=[];
  for(const button of document.querySelectorAll('#modal button:not(:disabled)')){
   if(!button.getClientRects().length||button.matches('.draft-card,.map-node,.sword-list button'))continue;
   const style=getComputedStyle(button);if(style.backgroundImage!=='none')continue;
   let node=button,background=getComputedStyle(node).backgroundColor;while(background==='rgba(0, 0, 0, 0)'&&node.parentElement){node=node.parentElement;background=getComputedStyle(node).backgroundColor}
   const ratio=(Math.max(lum(rgb(style.color)),lum(rgb(background)))+.05)/(Math.min(lum(rgb(style.color)),lum(rgb(background)))+.05);
   if(ratio<4.5)bad.push({id:button.id,text:button.textContent.slice(0,25),color:style.color,background,ratio});
  }return bad;
 });
 await page.evaluate(()=>{campaign=normalizeCampaign({...campaign,rares:RARE_IDS,wallet:9000,clears:Object.fromEntries([0,1,2,3,4,5].map(i=>[i,{score:100,time:50,rank:'B'}])),finaleRevealed:true,darkRevealed:true,heavenRevealed:true,pending:null});saveCampaign(campaign)});
 for(const [width,height]of [[320,568],[390,844],[568,320],[844,390],[1280,900]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{game.mode='stageSelect';campaign.carries=[];campaign.carry=null;saveCampaign(campaign);openStageSelect()});assert.deepEqual(await contrast(),[],'map button contrast '+width);
  assert.equal(await page.locator('.region-art svg').count(),7);assert.equal(await page.locator('.cleared-ribbon').first().textContent(),'クリア');
  await page.locator('[data-stage="0"]').tap();assert.equal(await page.locator('.carry-grid [data-carry]').count(),45);assert.equal(await page.locator('.carry-grid [hidden]').count(),0);assert.equal(await page.locator('.embark-pages').count(),0);
  const last=page.locator('.carry-grid [data-carry]').last();await last.scrollIntoViewIfNeeded();assert(await last.isVisible());await last.tap();assert((await page.locator('#carryCount').textContent()).includes('1 /'));
  assert(await page.locator('#startStageButton').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}));assert.deepEqual(await contrast(),[],'departure button contrast '+width);
  await page.locator('#prepStore').tap();assert.equal(await page.locator('.store-card-art svg').count(),9);assert.deepEqual(await contrast(),[],'store button contrast '+width);
  const finalSword=page.locator('[data-sword="dawn"]');await finalSword.scrollIntoViewIfNeeded();await finalSword.tap();assert((await page.locator('.weapon-role').textContent()).includes('循環'));assert(await page.locator('#weaponBack').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}));
  await page.locator('#storeTools').tap();assert.equal(await page.locator('.store-card-art svg').count(),2);assert.deepEqual(await contrast(),[]);
  await page.locator('#weaponBack').tap();await page.locator('#startStageButton').tap();await page.locator('#pause').tap();assert.deepEqual(await contrast(),[],'pause button contrast '+width);
  await page.locator('#pauseTouchLayout').tap();assert.equal(await page.locator('[data-touch-pick]').count(),4);assert(!(await page.locator('#saveTouchLayout').isDisabled()));await page.locator('#cancelTouchLayout').tap();
  console.log('PASS one-page library, distinct map/store artwork, price comparison and readable actions '+width+'×'+height);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{game.mode='stageSelect';campaign=normalizeCampaign({version:1});saveCampaign(campaign);openPreparation(0);startStageAttempt(0,88);game.bossScene=null;game.pendingChoices=0;p.invuln=999;p.autoCd=999;terrain=[];enemies=[];const e=spawnEnemy('shield',p.x+70,p.y);e.hp=e.maxHp=100000;e.state='recover';e.timer=999;enemies=[e];updateUI();syncPlayLayout();applyTouchLayout()});
 await page.waitForTimeout(60);
 const cdp=await page.context().newCDPSession(page),touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints}),pad=await page.locator('#movePad').boundingBox(),slash=await page.locator('#slash').boundingBox();
 const a={id:1,x:pad.x+pad.width/2,y:pad.y+pad.height/2-30},near={id:2,x:slash.x+slash.width/2,y:slash.y+slash.height+6};
 const before=await page.evaluate(()=>game.skillUses);await touch('touchStart',[a]);await touch('touchStart',[a,near]);await touch('touchEnd',[near]);
 assert.equal(await page.evaluate(()=>game.skillUses),before+1,'near miss activates skill exactly once while moving');assert(await page.evaluate(()=>joystick.y<-.2),'movement remains held');
 await page.evaluate(()=>{p.skillCooldowns={};p.castLock=0});const far={...near,y:slash.y+slash.height+14};await touch('touchStart',[a,far]);await touch('touchEnd',[far]);assert.equal(await page.evaluate(()=>game.skillUses),before+1,'14px miss does not activate');
 const roll=await page.locator('#roll').boundingBox(),dodges=await page.evaluate(()=>game.rolls);const rollTouch={id:2,x:roll.x+roll.width+6,y:roll.y+roll.height/2};await touch('touchStart',[a,rollTouch]);await touch('touchEnd',[rollTouch]);assert.equal(await page.evaluate(()=>game.rolls),dodges+1,'expanded dodge hit area works');await touch('touchEnd',[]);
 // Hidden controls must remeasure correctly even when rotated while resting.
 for(const size of [[844,390],[390,844],[568,320],[320,568],[390,844]]){
  await page.evaluate(()=>{game.phase='exitWalk';game.active=false;syncPlayLayout()});await page.setViewportSize({width:size[0],height:size[1]});await page.waitForTimeout(40);await page.evaluate(()=>{game.phase='combat';game.active=true;updateUI();syncPlayLayout()});await page.waitForTimeout(70);
  const boxes=await page.evaluate(()=>{const rect=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {pad:rect($('movePad')),stick:rect($('stick')),skills:rect(document.querySelector('.skill-group')),ultimate:rect($('ultimate')),potion:rect($('combatPotion')),viewport:touchViewport()}});
  for(const name of ['pad','skills','ultimate','potion']){const r=boxes[name];assert(r.x>=0&&r.y>=0&&r.x+r.w<=size[0]+1&&r.y+r.h<=size[1]+1,JSON.stringify(boxes))}
  assert(Math.abs(boxes.pad.x+boxes.pad.w/2-boxes.stick.x-boxes.stick.w/2)<.6&&Math.abs(boxes.pad.y+boxes.pad.h/2-boxes.stick.y-boxes.stick.h/2)<.6,'stick centered after hidden rotation');
  const positions=JSON.stringify(boxes);await page.waitForTimeout(100);const stable=await page.evaluate(()=>{const rect=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {pad:rect($('movePad')),stick:rect($('stick')),skills:rect(document.querySelector('.skill-group')),ultimate:rect($('ultimate')),potion:rect($('combatPotion')),viewport:touchViewport()}});assert.equal(JSON.stringify(stable),positions,'controls do not drift after layout settles');
 }
 assert.deepEqual(errors,[]);console.log('PASS real near-miss multitouch, bounded hit areas, hidden-control rotation and stable centered controls');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
