const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
  await page.locator('#startButton').click();
  assert.equal(await page.locator('[data-stage]').count(),3,'only the first three stages are visible');
  assert.equal(await page.locator('[data-stage]:not(:disabled)').count(),1,'only the easiest starts unlocked');
  assert(await page.locator('[data-stage="2"]').isDisabled());
  assert(await page.evaluate(()=>!openPreparation(3)&&!startStageAttempt(3)),'hidden final stage cannot be entered');
  await page.screenshot({path:'/tmp/clear-flow-first-three.png'});
  await page.locator('[data-stage="0"]').click();await page.locator('#startStageButton').click();
  await page.evaluate(()=>{sounds=false;p.invuln=999;game.autoCd=999});
  const before=await page.evaluate(()=>({rolls:game.rolls,skills:game.skillUses}));
  await page.keyboard.down('d');await page.keyboard.down('Space');await page.waitForTimeout(1150);await page.keyboard.up('Space');await page.keyboard.up('d');
  assert(await page.evaluate(old=>game.rolls>=old.rolls+2&&game.skillUses===old.skills,before),'held Space repeats dodge and does not cast a sword skill');
  assert(await page.evaluate(()=>!keys.has('Shift')),'Space key release ends held dodge');
  // Regression: a pending level at room rest used to freeze its deferral timer and hide both exits.
  await page.evaluate(()=>{enemies=[];game.phase='stageClear';game.pendingChoices=1;game.choiceDelay=.22;grantStageReward()});
  assert.equal(await page.evaluate(()=>game.mode),'draft','pending growth opens before resting instead of freezing');
  assert(await page.locator('#deferChoice').isHidden(),'resting growth cannot be deferred into a frozen state');
  await page.locator('[data-offer="0"]').click();
  if(await page.evaluate(()=>game.mode==='replace'))await page.locator('#skipReplacement').click();
  assert(await page.locator('#roomEquipmentDone').isVisible(),'choosing growth automatically reaches the next-room confirmation');
  await page.screenshot({path:'/tmp/clear-flow-room-confirm.png'});
  await page.locator('#roomEquipmentDone').click();
  assert.equal(await page.evaluate(()=>game.room),2);
  // Finish all three stages via real wave/clear/reward hooks, including multiple growth selections.
  for(let region=0;region<3;region++){
   if(region){await page.evaluate(region=>openPreparation(region),region);await page.locator('#startStageButton').click()}
   const result=await page.evaluate(()=>{
    p.invuln=999;sounds=false;let guard=0,confirmations=0;
    while(!['chest','stageResult'].includes(game.mode)&&guard++<600){
     if(game.mode==='draft'){chooseOffer(0);continue}
     if(game.mode==='replace'){replaceAcquiredSkill(-1);continue}
     if(game.mode==='roomEquipment'){if(game.relicOffers?.length){chooseRelic(0);continue}confirmations++;$('roomEquipmentDone').click();continue}
     if(game.mode!=='play')throw Error('unexpected stopped mode '+game.mode);
     if(game.phase==='combat')for(const e of [...enemies])if(e.hp>0){e.spawnTime=0;e.hp=1;hurtEnemy(e,1000)}
     update(.1);updateVisuals(.1);
    }
    return {mode:game.mode,room:game.room,confirmations,guard};
   });
   assert.equal(result.mode,'chest','combat clear reaches chest in stage '+region);
   assert.equal(result.room,5);assert(result.confirmations>=3,'room confirmations are not skipped');
   await page.locator('[data-reward="0"]').click();
   if(region<2){assert.equal(await page.evaluate(()=>game.mode),'stageResult');await page.locator('#resultStages').click();assert.equal(await page.locator('[data-stage]').count(),3);assert(await page.locator('[data-stage="'+(region+1)+'"]').isEnabled())}
  }
  assert.equal(await page.evaluate(()=>game.mode),'finaleReveal','third clear triggers the final-stage discovery');
  assert(await page.getByRole('heading',{name:'最後の舞台が現れた'}).isVisible());
  await page.screenshot({path:'/tmp/clear-flow-finale-discovery.png'});
  await page.locator('#finaleContinue').click();assert.equal(await page.evaluate(()=>game.mode),'stageResult');
  await page.locator('#resultStages').click();assert.equal(await page.locator('[data-stage]').count(),4);assert(await page.locator('[data-stage="3"]').isEnabled());
  await page.screenshot({path:'/tmp/clear-flow-four-stages.png'});
  await page.reload();await page.locator('#startButton').click();assert.equal(await page.evaluate(()=>game.mode),'stageSelect');assert.equal(await page.locator('[data-stage]').count(),4,'discovery and clear progress survive reload');
  await page.evaluate(()=>{const old={...preferences,bindings:{...preferences.bindings,roll:'Shift'}};localStorage.setItem('azure-settings',JSON.stringify(old))});await page.reload();assert(await page.evaluate(()=>preferences.bindings.roll===' '&&boundKey(' ')==='Shift'),'saved default Shift binding migrates to Space');
  assert.deepEqual(errors,[]);
  console.log('PASS held Space dodge, deferred-growth deadlock regression, automatic rest confirmation, all five-room transitions, difficulty unlocks, hidden finale reveal and reload persistence');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
