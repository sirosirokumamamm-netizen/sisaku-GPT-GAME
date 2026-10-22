// Readability signals derive from live game state; they do not change combat rules.
function survivalState(){
 const ratio=p.hp/Math.max(1,p.maxHp),manaBlocked=p.counter<=0&&p.loadout.some(id=>{const s=getSkill(id);return s&&isManualSkill(s)&&p.skillCharge?.id!==id&&s.mp>p.mp}),stock=game.singleStage?game.fieldPotions||0:p.potions||0;
 const potionUsable=game.singleStage&&['play','roomEquipment'].includes(game.mode)&&!game.bossScene&&game.phase!=='bossIntro'&&p.cutin<=0&&p.hp>0&&stock>0&&!(game.potionLock>0)&&(p.hp<p.maxHp||p.mp<p.maxMp);
 return {ratio,critical:p.hp>0&&ratio<=.3,manaBlocked,stock,potionUsable,potionPrompt:potionUsable&&(ratio<=.55||manaBlocked)};
}
function readableCooldown(node,remaining,total,ready){
 node.classList.toggle('control-ready',ready);node.classList.toggle('on-cooldown',remaining>.05);setHUDStyle(node,'--cooldown-angle',clamp(remaining/Math.max(.01,total),0,1)*360+'deg');
}
function updateReadableControls(){
 const state=survivalState(),allowed=game.mode==='play'&&(!game.singleStage||combatActionsAvailable())&&p.cutin<=0,unlocked=!(p.castLock>0||p.rollTime>0||p.hurtRecovery>0||p.ailments?.paralyze>0);
 for(const id of SLOT_NAMES){const node=$(id),s=getSkill(p.loadout[SLOT_NAMES.indexOf(id)]),remaining=s?p.skillCooldowns[s.id]||0:0,low=!!s&&p.mp<s.mp&&p.counter<=0&&p.skillCharge?.id!==s.id;
  readableCooldown(node,remaining,s?skillCooldown(s):1,allowed&&unlocked&&!!s&&!low&&remaining<=.05);node.classList.toggle('mana-low',low);node.style.opacity='1';
  let tag=node.querySelector('.skill-state');if(!tag){tag=document.createElement('small');tag.className='skill-state';tag.setAttribute('aria-hidden','true');node.append(tag)}setHUDText(tag,low&&remaining<=.05?'MP不足':'');
  if(s)setHUDAttribute(node,'aria-label',skillDisplayName(s)+' · '+(remaining>.05?'再使用まで '+remaining.toFixed(1)+'秒':low?'MP不足':p.skillCharge?.id===s.id?'溜め中':'使用可能'));
 }
 $('battleHint').classList.toggle('survival-busy',game.mode==='play'&&game.active&&(state.critical||state.potionPrompt||state.manaBlocked));
 const roll=$('roll');readableCooldown(roll,p.cd.roll,hasRelic('feather')?.8:.95,allowed&&p.cd.roll<=.05);setHUDAttribute(roll,'aria-label',p.cd.roll>.05?'回避 · 再使用まで '+p.cd.roll.toFixed(1)+'秒':'回避 · 使用可能');
 if(game.singleStage){const bottle=$('combatPotion');bottle.classList.toggle('potion-ready',state.potionPrompt);bottle.classList.toggle('needed',state.potionPrompt&&state.critical);setHUDStyle(bottle,'--potion-cooldown-angle',clamp((game.potionLock||0)/.65,0,1)*360+'deg');
  let label=bottle.querySelector('.potion-status');if(!label){label=document.createElement('small');label.className='potion-status';label.setAttribute('aria-hidden','true');bottle.append(label)}
  const caption=state.stock<=0?'空':game.potionLock>0?game.potionLock.toFixed(1)+'秒':state.potionUsable?'回復可':p.hp>=p.maxHp&&p.mp>=p.maxMp?'満タン':'待機';setHUDText(label,caption);setHUDAttribute(bottle,'aria-label','回復薬 '+state.stock+'個 · '+caption+' · '+controlLabel('potion'));
 }
}
let survivalEdgeCache=null;
function drawSurvivalScreen(t){
 if(game.mode!=='play'||!game.active||game.bossScene||p.cutin>0||!survivalState().critical)return;
 if(!survivalEdgeCache||survivalEdgeCache.w!==view.w||survivalEdgeCache.h!==view.h||survivalEdgeCache.pixelWidth!==cv.width){const w=view.w,h=view.h,d=Math.min(36,w*.07,h*.08),bands=[[0,0,d,0,[0,0,d,h]],[w,0,w-d,0,[w-d,0,d,h]],[0,0,0,d,[0,0,w,d]],[0,h,0,h-d,[0,h-d,w,d]]];survivalEdgeCache={w,h,pixelWidth:cv.width,bands:bands.map(([x,y,ex,ey,rect])=>{const gradient=ctx.createLinearGradient(x,y,ex,ey);gradient.addColorStop(0,'#d56a75');gradient.addColorStop(1,'#9f354900');return {gradient,rect}})}}
 ctx.save();ctx.globalAlpha=reduced||!preferences.flashes?.13:.15+Math.sin(t*2.4)*.025;for(const b of survivalEdgeCache.bands){ctx.fillStyle=b.gradient;ctx.fillRect(...b.rect)}ctx.restore();
}
function survivalHUDPlacement(width,height){
 const zoom=reduced?1:combat.zoom,scale=view.scale*zoom,sx=view.w/2+(p.x-cam.x)*scale,sy=view.h/2+(p.y-cam.y)*scale*CAMERA.depth;
 const obstacles=[...bossTrackerObstacles,{left:0,right:182,top:0,bottom:100}];
 enemies.filter(e=>e.kind==='boss'&&e.hp>0).forEach((e,i)=>{const y=(view.h<450?103:view.w<600?144:138)+([...AUTO_IDS].some(id=>p.learned[id])?27:0)+i*38;obstacles.push({left:15,right:view.w-15,top:y-22,bottom:y+(e.catastrophe?74:12)})});
 const candidates=[{x:0,y:20},{x:90,y:-42},{x:-90,y:-42},{x:0,y:-110},{x:90,y:-20},{x:-90,y:-20},{x:0,y:-140}];
 for(const v of candidates){const rect={left:sx+(v.x-width/2)*zoom,right:sx+(v.x+width/2)*zoom,top:sy+v.y*zoom,bottom:sy+(v.y+height)*zoom};if(rect.left<8||rect.right>view.w-8||rect.top<8||rect.bottom>view.h-8)continue;if(!obstacles.some(b=>rect.left<b.right+3&&rect.right>b.left-3&&rect.top<b.bottom+3&&rect.bottom>b.top-3))return v;}
 return {x:0,y:-110};
}
function drawSurvivalActor(t){
 if(game.mode!=='play'||game.bossScene||p.cutin>0)return;const s=survivalState(),showHP=s.critical||p.hurtHud>0||p.shield>0;if(!showHP&&!s.potionPrompt&&!s.manaBlocked)return;
 if(s.critical){ctx.save();ctx.translate(p.x,p.y+5);ctx.scale(1/view.scale,1/(view.scale*CAMERA.depth));ctx.strokeStyle='#f1a4a5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,30,12,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
 const label=s.potionPrompt?'＋ 回復 ×'+s.stock:s.critical?(s.stock>0?'回復薬 待機中':'回復薬なし'):s.manaBlocked?'MP不足':'',color=s.potionPrompt?'#baf2d1':s.critical?'#f2bec3':'#b4e5ff';ctx.save();ctx.font='800 10px system-ui';const w=Math.max(showHP?78:0,ctx.measureText(label).width+18),offset=survivalHUDPlacement(w,showHP?(label?44:22):19);
 if(showHP){ctx.save();ctx.translate(offset.x/view.scale,(offset.y-19*view.scale*CAMERA.depth)/(view.scale*CAMERA.depth));drawPlayerHealth();ctx.restore()}
 if(label){ctx.translate(p.x,p.y);ctx.scale(1/view.scale,1/(view.scale*CAMERA.depth));const y=offset.y+(showHP?25:0);rounded(offset.x-w/2,y,w,19,7,'#0e1c2deb',color);ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(label,offset.x,y+13)}ctx.restore();
}
function setTouchPreset(side){
 if(!touchEdit)return;const layout=defaultTouchLayout();touchEdit.layouts[touchOrientation()]=Object.fromEntries(Object.entries(layout).map(([key,item])=>[key,{...item,x:side==='left'?1-item.x:item.x}]));resetInput();touchEditorControls();applyTouchLayout();
}
