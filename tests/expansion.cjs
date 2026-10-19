const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
  const checks=await page.evaluate(()=>{
   let count=0;const ok=(v,m)=>{if(!v)throw Error(m);count++};sounds=false;
   const beginRest=(relic)=>{game.mode='preparation';campaign.pending=null;startStageAttempt(0,408);game.roomRoute=['approach','treasure','horde','elite','boss'];game.room=2;enemies=[];game.pendingChoices=0;game.phase='stageClear';p.hp=35;p.mp=3;grantStageReward();if(relic){game.relicOffers=[relic,...RELICS.filter(r=>r.id!==relic).slice(0,3).map(r=>r.id)];roomEquipment();chooseRelic(0)}};
   const orders=new Set();for(let seed=1;seed<31;seed++){game.rng=seed;const route=makeRoomRoute();ok(route[0]==='approach'&&route[4]==='boss'&&new Set(route).size===5,'one of each role, fixed entry and boss');orders.add(route.join(','))}ok(orders.size===1&&orders.has('approach,horde,treasure,elite,boss'),'room roles follow increasing pressure');
   beginRest();ok(game.mode==='roomEquipment'&&game.relicOffers.length===4,'four treasure choices at real room clear');ok(new Set(game.relicOffers).size===4,'distinct relics');const offers=game.relicOffers.join();roomEquipment();ok(offers===game.relicOffers.join(),'equipment reopening cannot reroll treasure');ok($('roomEquipmentDone').disabled,'next action explains required reward');ok(!suspendExpedition(),'unresolved treasure cannot suspend');game.mode='play';ok(!advanceRoom()&&game.mode==='roomEquipment','rest exit cannot bypass treasure');
   ok(chooseRelic(0)&&!!game.relic&&!game.relicOffers.length,'one relic accepted');const chosen=game.relic;ok(!chooseRelic(1)&&game.relic===chosen,'double choice cannot stack relics');ok(p.loadout.filter(Boolean).length===1,'relic never consumes a manual slot');
   beginRest('glass');ok(p.maxMp===30&&p.manaRegen===.8,'mana relic adds capacity and regeneration');
   beginRest('heart');ok(p.hp===35+Math.round(p.maxHp*.12)+Math.ceil(p.maxHp*.1),'rest relic also applies once at acquisition');const recovered=p.hp;roomEquipment();ok(p.hp===recovered,'reopening rest never heals again');
   beginRest('feather');game.mode='play';game.active=true;game.phase='combat';joystick={x:1,y:0};action('roll');ok(p.cd.roll===.8&&p.rollTime===.17,'shorter cooldown, same step distance');
   beginRest('crown');p.ultimate=0;chargeUltimate(20);ok(p.ultimate===25,'charge relic uses same ultimate cap');chargeUltimate(200);ok(p.ultimate===100,'charge remains capped');
   beginRest('edge');const target={hp:100,maxHp:100};ok(relicDamage(target,true,false)===1.18&&relicDamage(target,true,true)===1,'manual relic excludes automatic damage');
   beginRest('fang');ok(relicDamage({hp:34,maxHp:100},false,false)===1.25&&relicDamage(target,true,false)===1,'finisher has a health threshold');
   beginRest('ward');$('roomEquipmentDone').click();if(game.phase==='exitWalk'){p.x=380;p.y=STAGES[game.stage].y-240;update(.016)}ok(p.shield===20&&p.shieldTime===12&&game.room===3,'defensive relic grants a bounded opening shield');
   beginRest('vow');game.mode='play';game.active=true;game.phase='combat';p.hp=90;p.invuln=0;p.armor=0;takeHit(25,p.x,p.y);ok(p.hp===62&&relicDamage(target,true,false)===1.22,'risk relic increases outgoing and incoming damage');
   // Equal enemy kinds differ by role; no hidden third wave or boss adds.
   game.roomRoute=['approach','horde','elite','treasure','boss'];game.room=2;const swarm=spawnEnemy('slime',200,p.y);decorateCampaignEnemy(swarm,0);ok(swarm.hp<18&&stageWaveSize(0,1)===22,'horde is plentiful and fragile');game.room=3;game.wave=1;const elite=spawnEnemy('slime',200,p.y);decorateCampaignEnemy(elite,0);ok(elite.elite&&elite.trait==='breaker'&&elite.hp>30&&stageWaveSize(0,1)===8,'elite room is smaller and marked');const plain=spawnEnemy('slime',240,p.y);decorateCampaignEnemy(plain,1);ok(!plain.elite,'one elite per wave');game.wave=2;const swift=spawnEnemy('bat',200,p.y);decorateCampaignEnemy(swift,0);ok(swift.trait==='swift'&&swift.speed>plain.speed,'second elite has a distinct movement trait');
   game.room=3;game.wave=game.waves=2;game.phase='combat';game.active=true;game.mode='play';buildTerrain();const archer=spawnEnemy('archer',380,p.y-240);enemies=[archer];archer.cooldown=4;const beforeDistance=distance(archer,p);updateEnemies(.1,.1);ok(distance(archer,p)<beforeDistance,'last ranged enemy closes distance instead of kiting');
   beginRest('glass');game.gold=180;game.goldEarned=180;game.goldSpent=0;game.time=65;const score=stageResult(true).score;ok(!buyRestPotion(),'recovery shop removed');ok(game.gold===180&&game.goldSpent===0&&stageResult(true).score===score,'inventory recovery leaves gold intact');game.fieldPotions=1;useCombatPotion();game.active=false;roomEquipment();
   // All permanent stat fields, chosen skills, relic, route, money and elapsed time survive.
   p.learned.whirl=2;p.learned.power=1;p.power=1.15;p.loadout[1]='whirl';p.lv=4;p.xp=9;p.xpNext=68;game.goldFraction=.25;
   ok(suspendExpedition(),'resolved rest suspends');ok(game.mode==='stageSelect'&&campaign.suspended&&$('resumeExpedition'),'map offers explicit resume');
   const record=campaign.suspended;ok(normalizeRest({...record,run:{...record.run,room:5}})===null,'cannot restore a finished boss');ok(normalizeRest({...record,player:{...record.player,loadout:['whirl','whirl',null]}})===null,'duplicate manual slots rejected');ok(normalizeRest({...record,player:{...record.player,hp:Infinity}})===null,'nonfinite save rejected');ok(normalizeRest({...record,route:['approach','boss','boss','boss','boss']})===null,'invalid route rejected');
   return count;
  });
  await page.reload();await page.locator('#startButton').click();assert(await page.locator('#resumeExpedition').isVisible());await page.locator('#resumeExpedition').click();
  assert.deepEqual(await page.evaluate(()=>({room:game.room,relic:game.relic,mp:p.maxMp,regen:p.manaRegen,lv:p.lv,skill:p.learned.whirl,slot:p.loadout[1],power:p.power,gold:game.gold,spent:game.goldSpent,time:game.time,potion:game.restPotionUsed,saved:campaign.suspended})),{room:2,relic:'glass',mp:30,regen:.8,lv:4,skill:2,slot:'whirl',power:1.15,gold:180,spent:0,time:65,potion:false,saved:null});
  assert.equal(await page.locator('#restPotion').count(),0,'recovery shop stays removed after resume');
  await page.locator('#roomEquipmentDone').click();await page.evaluate(()=>{if(game.phase==='exitWalk'){p.x=380;p.y=STAGES[game.stage].y-240;update(.016)}});assert.equal(await page.evaluate(()=>game.room),3);
  // Settlement credits only the unspent gold and is still exactly-once.
  await page.evaluate(()=>{finishStageLoss()});assert.equal(await page.evaluate(()=>campaign.wallet),180);await page.evaluate(()=>finishStageLoss());assert.equal(await page.evaluate(()=>campaign.wallet),180);
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>{openStageSelect()});await page.screenshot({path:'/tmp/expanded-map-'+width+'.png'});
   await page.locator('#campaignCollection').click();assert.equal(await page.locator('.collection-grid article').count(),22);await page.locator('[data-collection="owned"]').click();assert.equal(await page.locator('.collection-grid article').count(),0);await page.locator('[data-collection="all"]').click();await page.screenshot({path:'/tmp/expanded-collection-'+width+'.png'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'collection fits viewport');await page.locator('#collectionBack').click();
   await page.evaluate(()=>{openPreparation(0);startStageAttempt(0,19);game.roomRoute=['approach','treasure','horde','elite','boss'];game.room=2;enemies=[];game.pendingChoices=0;game.phase='stageClear';grantStageReward()});
   assert.equal(await page.locator('[data-relic]').count(),4);await page.screenshot({path:'/tmp/expanded-treasure-'+width+'.png'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('[data-relic]')].every(e=>e.scrollWidth<=e.clientWidth+1)),'relic choices fit narrow screen');await page.locator('[data-relic="1"]').click();await page.locator('#roomEquipmentDone').click();await page.evaluate(()=>{if(game.phase==='exitWalk'){p.x=380;p.y=STAGES[game.stage].y-240;update(.016)}});assert.equal(await page.evaluate(()=>game.room),3);
  }
  const regional=await page.evaluate(()=>{let n=0;for(let region=0;region<4;region++){game.region=region;campaign.rares=[];const offers=chestOffers(true);if(offers.length!==4||offers.filter(o=>REGION_SIGNATURES[region].includes(o.id)).length<2)throw Error('regional signatures');n++}return n});
  assert.deepEqual(errors,[]);console.log('PASS '+(checks+regional)+' expansion checks; reload/resume, one-time net settlement, collection and treasure at 320/390/1280px');
  const context=await browser.newContext();await context.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('denied')}});const blocked=await context.newPage();await blocked.goto(process.env.BASE_URL||'http://127.0.0.1:8000');assert(await blocked.evaluate(()=>{openPreparation(0);startStageAttempt(0,1);game.phase='stageClear';enemies=[];game.pendingChoices=0;grantStageReward();return !suspendExpedition()&&game.mode==='roomEquipment'&&$('modal').textContent.includes('保存できませんでした')}),'denied save keeps playable rest and reports failure');await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
