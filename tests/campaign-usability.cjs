const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 740 } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8000');
    await page.evaluate(() => { localStorage.setItem('swordsman-best', '4'); localStorage.removeItem(CAMPAIGN_KEY); });
    await page.reload();
    assert.equal(await page.evaluate(() => campaign.unlocked), 3, 'legacy completion migrates into regional unlocks');
    await page.evaluate(() => localStorage.setItem(CAMPAIGN_KEY, '{broken'));
    await page.reload();
    assert(await page.locator('#startButton').isVisible(), 'corrupt save still starts');
    await page.locator('#startButton').click();
    await page.locator('[data-stage="0"]').click();
    await page.locator('#startStageButton').click();
    await page.evaluate(() => { enemies=[]; game.pendingChoices=0; game.phase='stageClear'; p.learned.whirl=1; p.loadout[1]='whirl'; grantStageReward(); });
    const before = await page.evaluate(() => ({ time:game.time, hp:p.hp, mp:p.mp }));
    await page.evaluate(() => update(20));
    assert.deepEqual(await page.evaluate(() => ({ time:game.time,hp:p.hp,mp:p.mp })), before, 'rest neither penalizes time nor grants unlimited regeneration');
    assert.equal(await page.evaluate(() => game.mode), 'roomEquipment', 'clear automatically opens equipment confirmation');
    await page.getByRole('tab',{name:'技の装備'}).click();await page.locator('[data-room-slot="0"]').selectOption('whirl');
    assert.equal(await page.locator('[data-room-slot="1"]').inputValue(), 'crescent', 'swapped slot visibly updates');
    await page.screenshot({path:'/tmp/campaign-room-equipment-320.png'});
    await page.locator('#roomEquipmentDone').click();await page.evaluate(()=>{p.x=380;p.y=STAGES[game.stage].y-240;update(.016)});
    assert.equal(await page.evaluate(() => game.room), 2);
    await page.evaluate(() => { game.mode='draft';game.pendingChoices=1;game.offers=['crescent','chain','guard','charge'];renderDraft(); });
    const cards = await page.locator('.draft-card').count();assert.equal(cards, 4);
    await page.screenshot({path:'/tmp/campaign-growth-320.png'});
    await page.locator('.draft-details summary').click();
    assert(await page.locator('.draft-details').innerText().then(t=>t.includes('再使用')&&t.includes('剣舞系')));
    await page.locator('.draft-details summary').click();
    await page.locator('[data-offer="2"]').click();
    assert(await page.evaluate(()=>p.learned.guard===1&&!p.loadout.includes('guard')));
    await page.evaluate(()=>{campaign.clears[0]={rank:'S',score:1,time:100,visits:1};game.mode='play';game.room=5;game.time=1000;game.hitsTaken=10;completeStageAttempt();claimChest(campaign.pending.id,0)});
    assert.equal(await page.evaluate(()=>campaign.clears[0].rank),'S','higher score cannot erase the best rank');
    for(let region=0;region<4;region++){
      await page.setViewportSize({width:1280,height:900});
      await page.evaluate(region=>{campaign.unlocked=4;for(let i=0;i<3;i++)campaign.clears[i]={rank:'B',score:1,time:1,visits:1};game.mode='preparation';startStageAttempt(region,451);game.room=5;game.bossPrepared=false;buildTerrain();prepareBoss();update(2);p.invuln=99;game.mode='pause';enemies[0].spawnTime=0;enemies[0].bossPhase=2;bannerTTL=0;$('banner').classList.remove('show');render(1);},region);
      await page.screenshot({path:'/tmp/region-'+region+'-boss.png'});
    }
    assert.deepEqual(errors, []);
    console.log('PASS migration, corrupted save recovery, rest timing, keyboard confirmation, visible equipment swaps, growth details and four boss visuals');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
