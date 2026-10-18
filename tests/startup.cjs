const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const mode of ['normal','legacy','no-script','no-canvas']){
   const context=await browser.newContext({javaScriptEnabled:mode!=='no-script'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   if(mode==='legacy')await page.addInitScript(()=>{CanvasRenderingContext2D.prototype.roundRect=undefined;window.ResizeObserver=undefined;MediaQueryList.prototype.addEventListener=undefined;Array.prototype.at=undefined});
   if(mode==='no-canvas')await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null});
   await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
   if(mode==='no-script'){assert(await page.locator('noscript').isVisible());assert(await page.locator('#bootStatus').isVisible())}
   else if(mode==='no-canvas'){assert.match(await page.locator('#bootStatus').innerText(),/起動できませんでした/)}
   else{
    await page.locator('#startButton').click();await page.locator('[data-stage="0"]').click();await page.locator('#startStageButton').click();
    await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');
    assert(await page.evaluate(()=>p.y<WORLD.start));
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
    assert(await page.evaluate(()=>cv.width>0&&cv.height>0));assert.deepEqual(errors,[]);
   }
   console.log('PASS startup: '+mode);await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
