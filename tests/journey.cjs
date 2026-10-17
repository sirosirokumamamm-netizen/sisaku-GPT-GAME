const{chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');await page.getByRole('button',{name:'剣士の冒険へ'}).click();
const runs=await page.evaluate(({rounds,naive})=>{
 const results=[];for(let round=0;round<rounds;round++)for(const style of ['sword','element','support']){selectedStyle=({sword:'azure',element:'storm',support:'ward'})[style];reset(20261017+round*10+['sword','element','support'].indexOf(style));begin();sounds=false;let frames=0;
  function escape(source,target){let best=null,score=-Infinity;for(let k=0;k<8;k++){const a=k*Math.PI/4,n={x:Math.cos(a),y:Math.sin(a)},point={x:clamp(p.x+n.x*100,105,655),y:clampPlayerY(p.y+n.y*100)},safe=canStand(point.x,point.y,p.r)&&(source.kind? !warningContains(source,point,20):distance(source,point)>source.r+20),value=(safe?300:0)+Math.min(distance(source,point),150)-distance(point,target)*.35+distance(point,p)*.2;if(value>score){score=value;best=n}}return best}
  for(;frames<60*480&&game.mode!=='end';frames++){
   if(game.mode==='draft'){
    const score=id=>{const s=getSkill(id);return (s.category===style?5:0)+(p.learned[id]?2:0)+(SKILLS.filter(a=>p.learned[a.id]&&a.category!=='passive').length<3&&s.category!=='passive'?3:0)+(['power','haste','vital','leech'].includes(id)?3:0)};
    const ranked=game.offers.map((id,i)=>({i,score:score(id)})).sort((a,b)=>b.score-a.score);chooseOffer(ranked[0].i);
   }
   if(game.mode==='camp'){const learned=SKILLS.filter(s=>p.learned[s.id]&&s.category!=='passive'&&s.kind!=='heal').sort((a,b)=>((b.category===style?4:0)+(p.learned[b.id]||0))-((a.category===style?4:0)+(p.learned[a.id]||0)));const loadout=['crescent',...learned.filter(s=>s.id!=='crescent').slice(0,2).map(s=>s.id)];for(let slot=0;slot<loadout.length;slot++)equipSkill(loadout[slot],slot);while(p.hp<p.maxHp-20&&p.potions)usePotion();if(p.hp<p.maxHp-25&&game.gold>=POTION.price){openShop();buyPotion(true);closeShop()}continueJourney();if(game.mode==='end')break}let target={x:380,y:p.y-180};
   if(game.phase==='combat'||game.phase==='waveBreak'){
    const closest=nearest(2000);if(closest)target=closest;
    const danger=naive?null:warnings.find(w=>warningContains(w));
    if(danger&&danger.life<=p.justWindow&&p.cd.roll===0){joystick=escape(danger,target);action('roll')}
    const mine=naive?null:hazards.find(z=>distance(z,p)<z.r+25),shot=naive?null:hostileShots.find(b=>distance(b,p)<95&&(p.x-b.x)*b.dir.x+(p.y-b.y)*b.dir.y>0);
    if(mine){const away=escape(mine,target);target={x:p.x+away.x*120,y:p.y+away.y*120}}
    else if(shot){target={x:p.x-shot.dir.y*180,y:p.y+shot.dir.x*180};if(distance(shot,p)<55&&p.cd.roll===0){joystick=norm(-shot.dir.y,shot.dir.x);action('roll')}}
    else if(danger){const away=escape(danger,target);target={x:p.x+away.x*160,y:p.y+away.y*160}}
    else if(distance(p,target)<70)target={x:p.x,y:p.y};
    for(let i=0;i<3;i++){const s=getSkill(p.loadout[i]);if(!s||(p.skillCooldowns[s.id]||0)>0||p.mp<s.mp)continue;const near=nearest(s.r||s.range||180);if(s.kind==='guard'){if(!p.shield)action(SLOT_NAMES[i])}else if(s.kind==='heal'){if(p.hp<p.maxHp-25)action(SLOT_NAMES[i])}else if(s.kind==='parry'){if(danger)action(SLOT_NAMES[i])}else if(near)action(SLOT_NAMES[i])}
   }else if(game.phase==='waveBreak'||game.phase==='stageClear')target={x:380,y:p.y};
   else{const chest=drops.find(d=>d.type==='chest');if(chest)target=chest}
   const dx=target.x-p.x,dy=target.y-p.y;joystick=Math.hypot(dx,dy)>8?(routeClear(p,target,p.r)?norm(dx,dy):routeDirection(p,target)):{x:0,y:0};if(naive&&game.active){const e=nearest(2000);if(e){const angle=frames/60*1.3,target={x:clamp(e.x+Math.cos(angle)*100,120,640),y:clampPlayerY(e.y+Math.sin(angle)*100)};joystick=routeClear(p,target,p.r)?norm(target.x-p.x,target.y-p.y):routeDirection(p,target)}}update(1/60);updateVisuals(1/60);
  }
  results.push({style,seed:game.seed,resonances:game.resonances,goals:game.goals,score:game.result?.score,rank:game.result?.rank,level:p.lv,goldEarned:game.goldEarned,goldSpent:game.goldSpent,cleared:game.cleared,kills:game.kills,hp:p.hp,seconds:Math.round(game.time),perfects:game.perfects,drafts:game.drafts,loadout:p.loadout,remaining:enemies.map(e=>({kind:e.kind,hp:e.hp,x:Math.round(e.x),y:Math.round(e.y)})),player:{x:Math.round(p.x),y:Math.round(p.y)},phase:game.phase,damageTaken:game.damageTaken,combatSeconds:Math.round(game.combatTime),skillUses:game.skillUses,barrels:game.barrels,win:game.mode==='end'&&game.cleared===STAGES.length});
 }reset();begin();return results;
},{rounds:Math.max(1,Number(process.env.JOURNEY_ROUNDS)||1),naive:process.env.NAIVE_PLAY==='1'});console.log(JSON.stringify(runs,null,2));if(process.env.NAIVE_PLAY==='1')assert(runs.some(r=>!r.win)&&runs.every(r=>r.damageTaken>0),'unobservant movement-and-cast bot must face meaningful danger');else assert(runs.every(r=>r.win&&r.drafts>=6&&r.kills>=260),'all styles must finish via actual random offers and horde combat');await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
