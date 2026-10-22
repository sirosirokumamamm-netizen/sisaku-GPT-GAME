// Self-contained presentation and combat additions. Save IDs remain stable.
function setHUDText(node,value){const text=String(value);if(node.textContent!==text)node.textContent=text}
function setHUDStyle(node,key,value){const text=String(value);if(node.style.getPropertyValue(key)!==text)node.style.setProperty(key,text)}
function setHUDAttribute(node,key,value){const text=String(value);if(node.getAttribute(key)!==text)node.setAttribute(key,text)}
function skillRecovery(s){return({nova:.24,dawn:.3,meteor:.2,thunder:.18,quake:.18,execute:.16})[s.id]||.09}
function dawnDamage(rank=p.learned.dawn||1){return (campaign.dawnUpgrade?[210,320,520]:[100,140,185])[clamp(rank,1,3)-1]*p.power}
function dawnRadius(rank=p.learned.dawn||1){return campaign.dawnUpgrade?Infinity:skillReach([300,330,360][clamp(rank,1,3)-1])}
function castDawnBlade(boost,manual=false){
 const rank=p.learned.dawn||1,r=dawnRadius(rank),color=campaign.dawnUpgrade?'#fff2bd':'#f2cb83';
 // Unsealed dawn reaches all living enemies, including beyond the camera. Cosmetic radius is bounded.
 for(const e of enemies)if(e.hp>0&&distance(p,e)<=r+e.r)hurtEnemy(e,dawnDamage(rank)*boost,true,color,false,false,manual,'light',false,'dawn');
 const visual=Math.min(Number.isFinite(r)?r:620,620);signatureRelease('dawn',p.x,p.y,{r:visual});
 if(rank>=3)trueSkillEffect(getSkill('dawn'));playCue('impact');
}
function bindTouchAction(button,type){
 button.addEventListener('pointerdown',e=>{if(button.disabled||game.mode!=='play')return;e.preventDefault();button.setPointerCapture(e.pointerId);action(type)});
 button.addEventListener('click',e=>{if(e.detail===0)action(type)});
}
function effectBudget(){return reduced?70:Math.min(view.w,view.h)<600||matchMedia('(pointer: coarse)').matches?(renderLoad.slow?140:200):(renderLoad.slow?240:360)}
function limitCosmetics(){
 const cap=effectBudget();if(effects.length>cap){let excess=effects.length-cap;effects=effects.filter(e=>!(excess>0&&['particle','afterimage','hitstar'].includes(e.kind)&&excess--));if(effects.length>cap){const essential=effects.filter(e=>['signatureRelease','astralSlash','artMotion','defeat','cataclysm','catastropheRelease'].includes(e.kind)),cosmetic=effects.filter(e=>!['signatureRelease','astralSlash','artMotion','defeat','cataclysm','catastropheRelease'].includes(e.kind));effects=[...(cap>essential.length?cosmetic.slice(-(cap-essential.length)):[]),...essential]}}
 const maxTexts=cap<=200?28:44;if(texts.length>maxTexts)texts=texts.slice(-maxTexts);
}
function godMotion(e){
 const phase=((game.time||0)+(e.phase||0)*.1)%5.2,flare=phase<2.6?.05:phase<3.4?Math.sin((phase-2.6)/.8*Math.PI):.18;
 return{phase:phase<2.6?'still':phase<3.4?'surge':'settle',speed:phase<2.6?32:phase<3.4?385:150,lift:phase<2.6?0:Math.sin((phase-2.6)/2.6*Math.PI)*17,flare};
}
// One original illustration for every skill; the unsealed dawn blade has its own art.
const SKILL_ART_SHEETS={
 blade:['crescent','whirl','pierce','flurry','dash','cross','wave','orbit','blood'],
 arcane:['execute','nova','dawn','guard','parry','heal','blink','wisp','focus'],
 elements:['flame','frost','thunder','meteor','chain','tornado','rain','quake','ultimatePower'],
 training:['power','haste','reach','vital','armor','crit','critpower','leech','magicpower'],
 mastery:['mana','cooldown','perfect','counter','killshield','magnet','charge','dawn-upgraded','fallback']
};
const SKILL_ART_INDEX=Object.fromEntries(Object.entries(SKILL_ART_SHEETS).flatMap(([sheet,ids])=>ids.map((id,cell)=>[id,{sheet,cell}])));
function skillArtwork(s){
 if(['laststand','bloodpact'].includes(s?.id))return eternalSkillArtwork(s);
 const key=s?.id==='dawn'&&campaign.dawnUpgrade?'dawn-upgraded':s?.id||'fallback',art=SKILL_ART_INDEX[key]||SKILL_ART_INDEX.fallback;
 return '<span class="skill-art skill-illustration art-'+art.sheet+'" data-art-key="'+(SKILL_ART_INDEX[key]?key:'fallback')+'" style="--art-x:'+((art.cell%3)*50)+'%;--art-y:'+(Math.floor(art.cell/3)*50)+'%" aria-hidden="true"></span>';
}
// Vegetation is deterministic and the pyramid remains outside walkable terrain.
function drawOvergrownRuins(t){
 if(!game.singleStage||game.region!==3)return;const y=STAGES[game.stage].y;
 for(const side of [-1,1]){const x=380+side*270;for(let level=0;level<5;level++){const width=142-level*23;prism(x-width/2,y-175-level*22,width,30,22+level*5,'#9a8357','#76503c','#453e32');ctx.strokeStyle='#b9986c66';ctx.beginPath();for(let j=0;j<4;j++){const xx=x-width/2+width*j/4;ctx.moveTo(xx,y-175-level*22);ctx.lineTo(xx,y-150-level*22)}ctx.stroke()}for(let i=0;i<9;i++){const xx=x-55+i*13,yy=y-142+(i%3)*9;path([[xx-5,yy],[xx-7,yy-20],[xx,yy-9],[xx+6,yy-25],[xx+5,yy]],i%2?'#4d7850':'#6e8f53')}}
}

function drawDivineArrival(q){
 const fade=Math.sin(Math.min(1,q)*Math.PI),radius=130+q*140;ctx.save();ctx.globalAlpha=.2+fade*.45;
 const halo=ctx.createRadialGradient(0,-90,8,0,-90,radius);halo.addColorStop(0,'#fff5c8aa');halo.addColorStop(.4,'#e3c27b44');halo.addColorStop(1,'#d1aa6200');ctx.fillStyle=halo;ctx.fillRect(-radius,-90-radius,radius*2,radius*2);
 ctx.strokeStyle='#fff0b5';ctx.lineWidth=2;const rays=reduced?6:16;for(let i=0;i<rays;i++){const a=i*Math.PI*2/rays+q*.24;ctx.beginPath();ctx.moveTo(Math.cos(a)*90,Math.sin(a)*90-90);ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius-90);ctx.stroke()}
 for(const r of [100,121]){ctx.beginPath();ctx.ellipse(0,-90,r,r*.65,0,0,Math.PI*2);ctx.stroke()}ctx.restore();
}
