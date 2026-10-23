// Focused service UI regression: navigation, real purchases, readable states and viewport containment.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined});
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
  await page.evaluate(()=>{
   window.menuProfile=(extra={})=>{saveCampaign(normalizeCampaign({version:1,realmOrderVersion:2,missionVersion:1,darkRevealed:true,heavenRevealed:true,finaleRevealed:true,clears:Object.fromEntries(WORLD_ORDER.map(i=>[i,{rank:'A',score:100,time:100}])),wallet:15000,craftStones:10000,rares:RARE_IDS,carries:['whirl'],weapons:['traveler'],charms:['hearth','spring'],equippedCharms:['hearth','spring'],charmSlots:2,...extra}));game.mode='stageSelect'};
  });
  // A visit retains its originating preparation screen, selection and shelf scroll.
  await page.evaluate(()=>{menuProfile();openPreparation(7)});
  await page.locator('#prepStore').tap();
  for(const id of ['storeSwords','storeArts','storeCharms','storeExpansion'])assert(await page.locator('#'+id).isVisible());
  const wallet=await page.evaluate(()=>campaign.wallet);
  await page.locator('#storeCharms').tap();
  await page.locator('[data-charm="purity"]').tap();
  await page.locator('#storeCharmSlot').selectOption('1');
  await page.locator('#charmBuy').tap();
  assert.deepEqual(await page.evaluate(()=>campaign.equippedCharms),['hearth','purity'],'replace the chosen slot, not an arbitrary charm');
  assert.equal(await page.evaluate(()=>campaign.wallet),wallet-900);
  assert(await page.locator('#charmNone').isVisible());
  await page.locator('#charmNone').tap();
  assert.deepEqual(await page.evaluate(()=>campaign.equippedCharms),['hearth']);
  await page.locator('#charmBuy').tap();
  assert.equal(await page.evaluate(()=>campaign.wallet),wallet-900,'equipping an owned charm is free');
  await page.locator('.store-items').evaluate(e=>e.scrollTop=e.scrollHeight);
  const top=await page.locator('.store-items').evaluate(e=>e.scrollTop);
  await page.locator('#storeSwords').tap();
  await page.locator('#storeCharms').tap();
  assert.equal(await page.locator('[data-charm="purity"]').getAttribute('aria-pressed'),'true');
  assert(Math.abs(await page.locator('.store-items').evaluate(e=>e.scrollTop)-top)<2,'shelf scroll survives category change');
  await page.locator('#storeExpansion').tap();
  await page.locator('[data-buy-expansion="carryExpansion"]').tap();
  assert.equal(await page.evaluate(()=>campaign.carrySlots),2);
  await page.locator('#storeArts').tap();
  await page.locator('[data-product="raika"]').tap();
  await page.locator('#buySword').tap();
  assert.equal(await page.evaluate(()=>campaign.ultimate),'raika');
  await page.locator('#storeSwords').tap();
  await page.locator('[data-sword="rapier"]').tap();
  const sale=await page.evaluate(()=>weaponSale('rapier',storeRegion).price),before=await page.evaluate(()=>campaign.wallet);
  await page.locator('#buySword').tap();
  assert.equal(await page.evaluate(()=>campaign.wallet),before-sale);
  await page.locator('[data-sword="traveler"]').tap();await page.locator('#buySword').tap();
  assert.equal(await page.evaluate(()=>campaign.wallet),before-sale,'changing purchased equipment never charges twice');
  await page.locator('#weaponBack').tap();
  assert.equal(await page.evaluate(()=>game.mode),'preparation');assert.equal(await page.evaluate(()=>campaign.selected),7);
  assert.deepEqual(await page.evaluate(()=>campaign.carries),['whirl']);
  await page.locator('#expandCarry').tap();
  assert.equal(await page.locator('#storeExpansion').getAttribute('aria-pressed'),'true');
  await page.locator('[data-buy-expansion="carryExpansion"]').tap();await page.locator('#weaponBack').tap();
  assert.equal(await page.evaluate(()=>campaign.carrySlots),3);
  await page.locator('#expandCharm').tap();
  assert(await page.locator('[data-expansion-target="charmExpansion"]').evaluate(e=>e.classList.contains('is-highlighted')));
  await page.locator('#weaponBack').tap();
  // Maximum and unaffordable states cannot spend; locked goods stay locked.
  console.log(await page.evaluate(()=>{
   let count=0;const ok=(v,m)=>{if(!v)throw Error(m);count++};
   menuProfile({wallet:204,carrySlots:3,charmSlots:3});openExpansionStore();
   const money=campaign.wallet;ok(!purchaseExpansion('carryExpansion')&&!purchaseExpansion('charmExpansion'),'maximum caps reject purchases');
   ok(!$('modal').textContent.includes('3 → 3'),'no misleading maximum comparison');
   ok(campaign.wallet===money,'capped purchase never charges');
   menuProfile({wallet:204});openWeaponShop('stageSelect','rapier');ok($('buySword').disabled,'unaffordable purchase disabled');
   ok(!purchaseStoreItem('swords','rapier')&&campaign.wallet===204,'unaffordable direct transaction rejected');
   game.mode='stageSelect';saveCampaign(normalizeCampaign({version:1}));openWeaponShop();
   ok(!$('modal').querySelector('[data-sword="origin"]'),'locked sword never listed');
   openStorefront('charms');ok($('modal').querySelectorAll('[data-charm]').length===1,'new save only lists unlocked charm');
   ok(!purchaseStoreItem('charms','timekeeper'),'locked charm cannot be bought');
   closeStorefront();ok(game.mode==='stageSelect','map-origin shop returns directly to map');
   return 'PASS '+count+' price, ownership, maximum and unlock checks';
  }));
  // Geometry checks exercise the screenshot's low wallet and maximum slot states.
  for(const [width,height]of [[1920,870],[1280,800],[390,844],[320,568],[568,320],[844,390]]){
   await page.setViewportSize({width,height});
   for(const screen of ['swords','arts','charms','expansion','training','growth','missions','emptyMissions','prep']){
    await page.evaluate(screen=>{menuProfile({wallet:204,carrySlots:3,charmSlots:2,weapons:WEAPONS.map(x=>x.id),ultimates:ultimateArts().map(x=>x.id),charms:['hearth'],equippedCharms:['hearth']});if(screen==='training'||screen==='growth')openTraining(screen==='growth'?'growth':'skill');else if(screen==='missions')openMissions('progress');else if(screen==='emptyMissions'){const n=cloneCampaign();n.claimedMissions=missionCatalog().map(m=>m.id);saveCampaign(n);openMissions('ready')}else if(screen==='prep')openPreparation(8);else openStorefront(screen)},screen);
    await page.waitForTimeout(90);
    const geometry=await page.evaluate(()=>{
     const m=$('modal'),r=m.getBoundingClientRect(),contains=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&b.top>=r.top-1&&b.bottom<=r.bottom+1&&b.left>=r.left-1&&b.right<=r.right+1};
     const actions=[...m.querySelectorAll('#weaponBack,#forgeBack,#forgeBuy,#missionBack,#missionClaim,#startStageButton,.storefront-tabs>button')];
     if(innerHeight<=450)actions.push(...m.querySelectorAll('[data-buy-expansion]'));
     const list=m.querySelector('.store-items'),detail=m.querySelector('.store-detail');
     return {overflow:document.documentElement.scrollWidth>innerWidth||m.scrollWidth>m.clientWidth+1,actions:actions.every(contains),pager:!!m.querySelector('.overflow-pager'),badCopy:/undefined|NaN|3 → 3/.test(m.textContent),aligned:!list||!detail||innerWidth<=600||Math.abs(list.getBoundingClientRect().bottom-detail.getBoundingClientRect().bottom)<4,blankDetail:m.querySelector('.mission-empty')?getComputedStyle(m.querySelector('.mission-detail')).display!=='none':false};
    });
    assert(!geometry.overflow&&geometry.actions&&!geometry.pager&&!geometry.badCopy&&geometry.aligned&&!geometry.blankDetail,'usable '+screen+' '+width+'x'+height+' '+JSON.stringify(geometry));
    if(['swords','charms','expansion','training','missions'].includes(screen)&&(width===390||width===1280||width===568))await page.screenshot({path:'/tmp/ux-'+screen+'-'+width+'.png'});
   }
  }
  // Pointer and keyboard navigation after a viewport/orientation change.
  await page.evaluate(()=>{menuProfile();openWeaponShop()});
  await page.locator('#storeCharms').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#storeCharms').getAttribute('aria-pressed'),'true');
  assert(await page.evaluate(()=>document.activeElement.id==='storeCharms'),'keyboard focus remains on the active tab');
  const contrast=await page.locator('#storeCharms').evaluate(e=>{
   const c=getComputedStyle(e),rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=a=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0),a=lum(rgb(c.color)),b=lum(rgb(c.backgroundColor));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });assert(contrast>=4.5,'selected tab contrast '+contrast);
  assert.deepEqual(errors,[]);
  console.log('PASS merchant purchases/equip/slot replacement, all four tabs, remembered scroll/selection, direct returns, 6 viewport sizes, keyboard, contrast and no runtime errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
