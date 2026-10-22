// Numbers animate only their text nodes. Redrawing a menu keeps the same count.
const goldAnimations=new Map();
function animateGoldChange(channel,before,after){
 if(before===after)return;const prior=goldAnimations.get(channel),from=prior?.to===before?prior.value:before;
 goldAnimations.set(channel,{from,to:after,value:reduced?after:from,time:0,duration:reduced?0:.7});
}
function goldDisplay(value,channel){const a=goldAnimations.get(channel);return Math.round(a?.to===value?a.value:value).toLocaleString('ja-JP')}
function goldCounterMarkup(value,channel){return '<span data-gold-counter="'+channel+'" data-gold-target="'+value+'" aria-label="'+value.toLocaleString('ja-JP')+'">'+goldDisplay(value,channel)+'</span>'}
function updateGoldHUD(node,value,channel){
 let span=node.querySelector('[data-gold-counter]');if(!span){node.innerHTML=goldCounterMarkup(value,channel)+' G';span=node.firstElementChild;}
 setHUDAttribute(span,'data-gold-target',value);setHUDAttribute(span,'aria-label',value.toLocaleString('ja-JP'));setHUDText(span,goldDisplay(value,channel));
}
function tickGoldAnimations(dt){
 for(const [channel,a]of goldAnimations){
  if(a.time>=a.duration&&a.value===a.to)continue;a.time=Math.min(a.duration,a.time+dt);const q=a.duration?clamp(a.time/a.duration,0,1):1;a.value=a.from+(a.to-a.from)*(1-(1-q)**3);if(q===1)a.value=a.to;
  const text=Math.round(a.value).toLocaleString('ja-JP');for(const node of document.querySelectorAll('[data-gold-counter="'+channel+'"]'))if(Number(node.dataset.goldTarget)===a.to)setHUDText(node,text);
 }
}
function recommendedStage(){
 if(game.mode==='preparation')return campaign.selected;
 if(game.mode==='weaponShop')return storeRegion;
 const next=REGIONS.findIndex((_,i)=>availableStage(i)&&!campaign.clears[i]);return next<0?campaign.selected:next;
}
function weaponSale(id,region=recommendedStage()){
 const w=getWeapon(id),sale=w.price>0&&recommendedSword(region).id===id;
 return {sale,original:w.price,price:Math.max(0,w.price-(sale?100:0))};
}
function weaponPriceLabel(w,region){const q=weaponSale(w.id,region);return q.sale?'<span class="sale-price"><b>'+q.price.toLocaleString('ja-JP')+' G</b><em>セール中</em></span>':q.price.toLocaleString('ja-JP')+' G'}
function addPreparationMissions(){
 const footer=$('modal').querySelector('.embark-footer');if(!footer)return;
 const button=document.createElement('button');button.id='prepMissions';button.className='prep-missions';const ready=missionClaimable().length;
 button.innerHTML='<i>✧</i><span><b>ミッション</b><small>'+(ready?ready+'件の報酬':'冒険の実績')+'</small></span>';button.onclick=()=>openMissions(ready?'ready':'progress');footer.insertBefore(button,$('startStageButton'));footer.classList.add('with-missions');
}
function bossDamageFactor(){return [1.45,1.45,1.4,1.4,1.35,1.35,1.4][game.region]||1.4}
function empowerBossThreat(w,owner=enemies.find(e=>e.id===w.owner)){
 if(game.singleStage&&owner?.kind==='boss'&&!w.bossPowerApplied){w.atk=Math.round(w.atk*bossDamageFactor());w.bossPowerApplied=true;}return w;
}
// Movement shadows never enter warnings, projectiles, hazards or damage resolution.
function chooseShadowLanding(e){
 const y=STAGES[game.stage].y,points=[[145,-95],[615,-75],[155,255],[605,255],[380,-125],[145,110],[615,120],[380,280]];
 const candidates=points.map(([x,dy])=>safePoint(arenaX(x),arenaY(y+dy),e.r)).filter(q=>canStand(q.x,q.y,e.r)&&distance(q,p)>110&&distance(q,e)>200).sort((a,b)=>distance(b,e)-distance(a,e));
 return candidates.length?candidates[Math.floor(runRandom()*Math.min(3,candidates.length))]:null;
}
function startShadowTransit(e){
 const to=chooseShadowLanding(e);if(!to)return false;
 const duration=e.awakened?.5:.65;e.shadowTransit={from:{x:e.x,y:e.y},to,time:0,duration};e.shadowMoveClock=e.awakened?.8:1.4;e.shadowMirage={life:duration,max:duration};return true;
}
function updateShadowTransit(e,dt){
 const transit=e.shadowTransit;if(transit){
  transit.time+=dt;if(transit.time>=transit.duration){Object.assign(e,safePoint(transit.to.x,transit.to.y,e.r));e.shadowTransit=null;e.shadowBeat=Math.max(.3,e.shadowBeat||0)}return true;
 }
 e.shadowMoveClock=(e.shadowMoveClock??.2)-dt;
 if(e.shadowMoveClock<=0&&!warnings.some(w=>w.owner===e.id)&&startShadowTransit(e))return true;return false;
}
function drawShadowTransitCues(t){
 drawRoyalTransitCues(t);if(game.bossScene)return;for(const e of enemies){const s=e.shadowTransit;if(!s||e.hp<=0)continue;const q=clamp(s.time/s.duration,0,1);ctx.save();
  for(const [point,arrival]of [[s.from,false],[s.to,true]]){ctx.save();ctx.translate(point.x,point.y);ctx.strokeStyle=arrival?'#aebbd5':'#746e89';ctx.fillStyle='#09091366';ctx.lineWidth=2;ctx.setLineDash([2,7]);ctx.beginPath();ctx.ellipse(0,0,e.r+12+q*10,(e.r+12+q*10)*.45,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
   for(let i=0;i<6;i++){const a=i*Math.PI/3+t*2,r=e.r*.8;ctx.strokeStyle='#9096b799';ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r*.4);ctx.quadraticCurveTo(Math.cos(a+.7)*r,-30-q*30,Math.cos(a+.3)*r*.5,-45-q*45);ctx.stroke()}
   if(arrival){ctx.save();ctx.translate(0,24);ctx.scale(1,1/CAMERA.depth);ctx.font='700 11px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0b101b';ctx.strokeText('影渡り · 移動',0,0);ctx.fillStyle='#d0d8eb';ctx.fillText('影渡り · 移動',0,0);ctx.restore()}ctx.restore();
  }ctx.restore();
 }
}
function drawShadeRegent(e,t){
 const s=e.shadowTransit,mirage=e.shadowMirage,q=s?clamp(s.time/s.duration,0,1):mirage?1-mirage.life/mirage.max:0;
 if(s||mirage){const radius=(reduced?32:105)*Math.sin(q*Math.PI),turn=reduced?0:q*Math.PI*2;for(let i=0;i<3;i++){const a=turn+i*Math.PI*2/3;ctx.save();ctx.globalAlpha*=.27*Math.sin(q*Math.PI);ctx.translate(Math.cos(a)*radius,Math.sin(a)*radius*.55);ctx.rotate(reduced?0:turn*.4);drawShadeRegentBody(e,t+i);ctx.restore()}
  ctx.save();if(s)ctx.globalAlpha*=Math.max(.2,Math.abs(1-q*2));if(!reduced)ctx.rotate(Math.sin(q*Math.PI)*.08+turn);drawShadeRegentBody(e,t);ctx.restore();
 }else drawShadeRegentBody(e,t);
}
