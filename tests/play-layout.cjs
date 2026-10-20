const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const url=process.env.BASE_URL||'http://127.0.0.1:8000';

async function center(page){
  const delta=await page.evaluate(()=>{
    const a=$('movePad').getBoundingClientRect(),b=$('stick').getBoundingClientRect();
    return {x:b.x+b.width/2-a.x-a.width/2,y:b.y+b.height/2-a.y-a.height/2,joy:joystick};
  });
  assert(Math.abs(delta.x)<.6&&Math.abs(delta.y)<.6,JSON.stringify(delta));
  assert.deepEqual(delta.joy,{x:0,y:0});
}
async function fieldBounds(page){
  const metrics=await page.evaluate(()=>{
    const scene=document.querySelector('.scene'),r=scene.getBoundingClientRect(),s=getComputedStyle(scene);
    return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,
      border:s.borderWidth,radius:s.borderRadius,shadow:s.boxShadow,
      chrome:[...document.querySelectorAll('header button')].filter(e=>e.getClientRects().length).map(e=>e.id),
      hud:document.querySelector('.hud').getBoundingClientRect().height,
      overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(metrics.x,0);assert.equal(metrics.y,0);
  assert.equal(metrics.w,metrics.vw);assert.equal(metrics.h,metrics.vh);
  assert.equal(metrics.border,'0px');assert.equal(metrics.radius,'0px');assert.equal(metrics.shadow,'none');
  assert.deepEqual(metrics.chrome,['pause']);assert(metrics.hud<100);assert(!metrics.overflow);
  const boxes=await page.locator('#movePad,#roll,#slash,#magic,#thunder,#combatPotion,#ultimate,#pause').filter({visible:true}).evaluateAll(nodes=>nodes.map(e=>{
    const r=e.getBoundingClientRect();return {id:e.id,x:r.x,y:r.y,w:r.width,h:r.height};
  }));
  for(const r of boxes){
    assert(r.w>=44&&r.h>=44,'touch target '+JSON.stringify(r));
    assert(r.x>=0&&r.y>=0&&r.x+r.w<=metrics.vw+.5&&r.y+r.h<=metrics.vh+.5,'viewport '+JSON.stringify(r));
  }
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i],b=boxes[j];
    assert(!(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h),'overlap '+a.id+' / '+b.id);
  }
}

(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
    page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
    // Exercise automatic rejection and the trusted first-tap fallback without resizing the test viewport.
    await page.addInitScript(()=>{
      window.fullscreenCalls=[];
      Object.defineProperty(document,'fullscreenEnabled',{get:()=>true});
      Object.defineProperty(document,'fullscreenElement',{get:()=>fullscreenCalls.length>1?document.documentElement:null});
      Element.prototype.requestFullscreen=function(){
        fullscreenCalls.push(navigator.userActivation.isActive);
        return fullscreenCalls.length===1?Promise.reject(new Error('Gesture required')):Promise.resolve();
      };
    });
    for(const [width,height] of [[320,568],[390,844],[568,320],[667,375],[844,390],[1280,900]]){
      await page.setViewportSize({width,height});
      await page.goto(url);
      assert.equal(await page.evaluate(()=>fullscreenCalls.length),1);
      assert.deepEqual(await page.locator('.scene').evaluate(e=>{
        const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];
      }),[0,0,width,height],'viewport filled before the first tap');
      await page.locator('[data-stage="0"]').tap();
      await page.locator('#startStageButton').tap();
      await page.evaluate(()=>{sounds=false;p.invuln=999;game.pendingChoices=0});
      assert.deepEqual(await page.evaluate(()=>fullscreenCalls),[false,true]);
      await fieldBounds(page);await center(page);
      await page.locator('#pause').tap();assert(await page.locator('#resume').isVisible());
      await page.locator('#resume').tap();assert.equal(await page.evaluate(()=>game.mode),'play');
      await page.evaluate(()=>{enemies=[];scheduled=[];game.pendingChoices=1;game.phase='stageClear';finishRoom()});
      assert.equal(await page.evaluate(()=>game.mode),'draft');
      assert.equal(await page.locator('#deferChoice').count(),0);
      await page.locator('[data-offer]').first().tap();
      assert.equal(await page.evaluate(()=>game.pendingChoices),0);
      assert.equal(await page.evaluate(()=>game.phase),'exitWalk');
      assert(await page.locator('#overlay').isHidden());assert(await page.locator('.skill-group').isHidden());
      assert(await page.locator('#ultimate').isHidden());assert(await page.locator('#movePad').isVisible());
      assert(await page.locator('#combatPotion').isVisible());
      const r=await page.locator('#roomExit').boundingBox();
      assert(r.height>=44&&r.height<=52);assert(r.width<=210&&r.y>=height-80,JSON.stringify(r));
      await page.screenshot({path:'/tmp/play-rest-'+width+'.png'});
      await page.locator('#roomExit').tap();
      await page.locator('#roomEquipmentDone').tap();assert(await page.locator('#overlay').isHidden());
      await center(page);
      const room=await page.evaluate(()=>{p.x=380;p.y=STAGES[game.stage].y-196;walkToNextRoom(.016);return game.room});
      assert.equal(room,2);await fieldBounds(page);
      console.log('PASS viewport, minimal HUD, pause, optional preparation and gate progression '+width+'×'+height);
    }
    await page.setViewportSize({width:390,height:844});await page.goto(url);
    await page.locator('[data-stage="0"]').tap();await page.locator('#startStageButton').tap();
    await page.evaluate(()=>{sounds=false;p.invuln=999;p.autoCd=999;game.pendingChoices=0});
    const cdp=await page.context().newCDPSession(page);
    const pad=await page.locator('#movePad').boundingBox(),slash=await page.locator('#slash').boundingBox(),roll=await page.locator('#roll').boundingBox();
    const t={x:pad.x+pad.width/2,y:pad.y+pad.height*.2,id:1};
    const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
    await touch('touchStart',[t]);
    assert(await page.evaluate(()=>joystick.y<-.5));
    const uses=await page.evaluate(()=>game.skillUses);
    await touch('touchStart',[t,{x:slash.x+slash.width/2,y:slash.y+slash.height/2,id:2}]);
    assert.equal(await page.evaluate(()=>game.skillUses),uses+1);
    // CDP touchEnd points identify the released contacts, not the remaining ones.
    await touch('touchEnd',[{x:slash.x+slash.width/2,y:slash.y+slash.height/2,id:2}]);
    assert(await page.evaluate(()=>joystick.y<-.5));
    const rolls=await page.evaluate(()=>game.rolls);
    await touch('touchStart',[t,{x:roll.x+roll.width/2,y:roll.y+roll.height/2,id:2}]);
    assert.equal(await page.evaluate(()=>game.rolls),rolls+1);
    await touch('touchEnd',[]);await center(page);
    await touch('touchStart',[t]);await touch('touchCancel',[]);await center(page);
    await touch('touchStart',[t]);await touch('touchMove',[{...t,y:t.y-1}]);
    await page.evaluate(()=>$('movePad').releasePointerCapture(padPointerId));
    await touch('touchMove',[{...t,y:t.y-2}]);await center(page);await touch('touchEnd',[]);
    await touch('touchStart',[t]);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    await center(page);assert(await page.locator('#resume').isVisible());await touch('touchEnd',[]);
    await page.locator('#resume').tap();
    await touch('touchStart',[t]);await page.setViewportSize({width:844,height:390});
    await page.waitForFunction(()=>padPointerId===null);await center(page);await touch('touchEnd',[]);
    await fieldBounds(page);assert.deepEqual(errors,[]);
    console.log('PASS joystick centering on idle, release, cancel, lost capture, pause and rotation; movement with skills and dodge');

    // Rejected or unavailable native fullscreen must leave the game usable without error loops.
    for(const supported of [false,true]){
      const fallback=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
      const fallbackErrors=[];fallback.on('pageerror',e=>fallbackErrors.push(e.message));
      await fallback.addInitScript(supported=>{
        window.fullscreenCalls=0;
        Object.defineProperty(document,'fullscreenEnabled',{get:()=>supported});
        Element.prototype.webkitRequestFullscreen=undefined;
        Element.prototype.requestFullscreen=supported?()=>{fullscreenCalls++;return Promise.reject(new Error('Denied'))}:undefined;
      },supported);
      await fallback.goto(url);await fallback.locator('[data-stage="0"]').tap();await fallback.locator('#startStageButton').tap();
      await fieldBounds(fallback);assert.equal(await fallback.evaluate(()=>fullscreenCalls),supported?2:0);
      assert.deepEqual(fallbackErrors,[]);await fallback.close();
    }
    console.log('PASS native fullscreen rejection and unsupported-browser fallbacks');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
