// Shared visual language and explicit combat/reward rules. Save skill IDs stay stable.
const DAWN_OFFER_WEIGHT=.8;
function weightedSkillPick(candidates){
 let roll=runRandom()*candidates.reduce((n,s)=>n+(s.id==='dawn'?DAWN_OFFER_WEIGHT:1),0);
 for(const s of candidates){roll-=s.id==='dawn'?DAWN_OFFER_WEIGHT:1;if(roll<0)return s}return candidates.at(-1);
}
function showAttackWarning(w){
 const owner=enemies.find(e=>e.id===w.owner);
 return owner?.kind==='boss'&&(w.attack==='persona'||w.style==='doom'||w.attack==='barrage'||['bossDash','leap'].includes(w.attack)||w.atk>=35||w.r>=115||w.length>=300&&w.width>=80);
}
const ELEMENTS={none:{name:'無',color:'#d3dfdf'},nature:{name:'草木',color:'#9fe8b6'},water:{name:'水',color:'#8edfff'},fire:{name:'炎',color:'#ffae73'},ice:{name:'氷',color:'#b4f5ff'},lightning:{name:'雷',color:'#ffe999'},wind:{name:'風',color:'#a4ffe0'},earth:{name:'土',color:'#e6c393'},dark:{name:'闇',color:'#d7acff'},light:{name:'光',color:'#fff2ad'}};
function skillElement(s){return ({flame:'fire',meteor:'fire',frost:'ice',thunder:'lightning',chain:'lightning',tornado:'wind',dash:'wind',quake:'earth',nova:'dark',blink:'dark',dawn:'light',wisp:'light',rain:'light',guard:'light',parry:'light',orbit:'light'})[s?.id]||'none'}
function weaponElement(){return ({'炎':'fire','氷':'ice','雷':'lightning','風':'wind','闇':'dark','光':'light','星':'light'})[getWeapon(game.weapon).element]||getWeapon(game.weapon).hiddenElement||'none'}
function enemyElement(e){
 if(e.element&&ELEMENTS[e.element])return e.element;
 if(e.kind==='boss')return ({god:'light',demon:'dark',dragon:'fire',beast:'nature',monster:'earth'})[e.form]||['nature','water','fire','earth','dark','light'][game.region||0];
 return ({slime:'water',bat:'wind',harpy:'wind',beetle:'earth',bomber:'fire',totem:'nature',wraith:'dark'})[e.kind]||'none';
}
function affinityMultiplier(e,element){return e.kind!=='goldSlime'&&({nature:'fire',water:'lightning',fire:'ice',ice:'fire',wind:'earth',earth:'wind',dark:'light',light:'dark'})[enemyElement(e)]===element?1.35:1}
function elementBadge(s){const el=ELEMENTS[skillElement(s)];return skillElement(s)==='none'?'':`<span class="element-tag" style="--element:${el.color}">${el.name}</span>`}
function skillMana(s){return s.category==='passive'||isAutoSkill(s)?0:s.mp||0}
function skillBadges(s){
 const manual=isManualSkill(s),free=skillMana(s)===0;
 const slots='<svg viewBox="0 0 24 18" aria-hidden="true"><rect x="1" y="3" width="6" height="12" rx="1"/><rect x="9" y="3" width="6" height="12" rx="1"/><rect x="17" y="3" width="6" height="12" rx="1"/>'+(manual?'':'<path d="M1 17L23 1"/>')+'</svg>';
 const mana='<svg viewBox="0 0 20 22" aria-hidden="true"><path d="M10 2C7 7 3 10 3 14a7 7 0 0014 0c0-4-4-7-7-12Z"/>'+(free?'<path d="M3 20L18 3"/>':'')+'</svg>';
 return `<span class="rule-badge ${manual?'uses-slot':'no-slot'}" title="${manual?'手動の技スロットを1枠使います':'スロットを使わず効果を得られます'}">${slots}<b>${manual?'技枠':'枠不要'}</b></span><span class="rule-badge ${free?'no-mana':'uses-mana'}" title="${free?'MPを消費しません':'使用時にMPを'+s.mp+'消費します'}">${mana}<b>${free?'MP不要':'MP '+s.mp}</b></span>`;
}
const SKILL_SUMMARIES={crescent:'前方を広く薙ぐ基本剣技',whirl:'周囲の敵をまとめて薙ぎ払う',pierce:'一直線に敵を貫く',flurry:'前方へ素早い三連撃',dash:'踏み込みながら進路を斬る',cross:'縦横の敵を十字に斬る',wave:'貫通する斬撃を遠くへ放つ',orbit:'周回する双刃が自動で攻撃',blood:'命中で戦闘後の回復を増やす',execute:'弱った敵へ大きな一撃',flame:'前方を焼き、炎上させる',frost:'周囲の敵を凍らせ減速',thunder:'標的と周囲へ落雷の剣',meteor:'敵の集団へ隕石を落とす',chain:'雷が敵から敵へ連鎖',tornado:'竜巻が敵を引き寄せる',rain:'狙った場所へ剣が降り注ぐ',quake:'周囲を砕き、行動を止める',nova:'単体を砕く闇の一撃',dawn:'最大級の範囲を薙ぐ光の大剣',guard:'自動でバリアを展開',parry:'構えて受け流し、反撃',heal:'休憩中にHPを回復',blink:'敵の背後へ移動して斬る',wisp:'光の精霊が自動で射撃',focus:'通常攻撃を一時的に高速化',power:'通常攻撃と剣技を強化',haste:'通常攻撃を速くする',reach:'通常攻撃と前方剣技を遠くへ',vital:'最大HPと戦闘後の回復を増やす',armor:'受けるダメージを軽減',crit:'会心が発生しやすくなる',critpower:'会心の威力を高める',leech:'撃破で戦闘後の回復を増やす',magicpower:'属性技の威力を高める',mana:'最大MPと自然回復を強化',cooldown:'技を早く再使用できる',perfect:'ジャスト回避の受付を延長',counter:'回避後の反撃猶予を延長',killshield:'撃破でバリアを得る',magnet:'金貨を引き寄せ、収入も増加',ultimatePower:'必殺技の威力と覚醒時間を強化',charge:'必殺ゲージをためやすくする'};
function draftMetric(s,rank){
 if(s.category==='passive'){const m=passiveComparison(s.id,rank);return m.label+' '+statNumber(m.before)+' → '+statNumber(m.after)+m.unit}
 const m=skillPrimary(s,rank+1);return m.label+' '+(rank?statNumber(skillPrimary(s,rank).value)+' → ':'')+statNumber(m.value)+m.unit;
}
function skillCardContents(s,rank,kind='draft',fromRun=false){
 const manual=isManualSkill(s),slot=p.loadout.indexOf(s.id),empty=p.loadout.indexOf(null);
 const action=kind==='reward'?(campaign.rares.includes(s.id)?'所持済み ＋160 G':'永久解放して継承'):rank?(slot>=0?'技'+(slot+1)+'を強化':'所持効果を強化'):manual?(empty>=0?'技'+(empty+1)+'へ装備':'技枠を選んで入替'):isAutoSkill(s)?'自動で発動':s.kind==='heal'?'休憩で回復':'常時効果を獲得';
 return `<div class="card-art">${skillArtwork(s)}<div class="card-badges">${skillBadges(s)}</div><strong>${skillDisplayName(s,kind==='reward'?0:rank+1)}</strong></div><div class="card-copy"><p>${SKILL_SUMMARIES[s.id]||s.desc}</p><div class="card-metric"><b>${kind==='reward'?(fromRun?'今回選んだ技':'追加の候補'):draftMetric(s,rank)}</b><span>${kind==='reward'?'次回 Lv.1':'Lv.'+(rank||0)+' → '+(rank+1)}</span></div><div class="card-action"><span>${manual?'◴ '+statNumber(skillCooldown(s,Math.max(1,rank+1)))+'秒':isAutoSkill(s)?'⟳ 自動':s.kind==='heal'?'♧ 休憩用':'∞ 常時'}</span><b>${action}</b></div></div>`;
}
function renderGrowthCards(){
 openModal(`<div class="growth-heading"><h2>次の力を選ぼう</h2><span>Lv.${p.lv} · 4つから1つ${game.pendingChoices>1?' · 残り'+game.pendingChoices+'回':''}</span></div><div class="draft-grid">${game.offers.map((id,i)=>{const s=getSkill(id);return `<button class="draft-card illustrated ${isManualSkill(s)?'uses-slot':'slot-free'}" data-skill="${id}" data-offer="${i}" style="--card-order:${i}">${skillCardContents(s,p.learned[id]||0)}</button>`}).join('')}</div>`);
 $('modal').classList.add('draft-modal','growth-modal');menuNodes('[data-offer]').forEach(b=>b.onclick=()=>chooseOffer(+b.dataset.offer));
}
function renderInheritance(){
 if(!campaign.pending){openStageSelect();return}game.mode='chest';game.active=false;const q=campaign.pending;
 openModal(`<div class="growth-heading"><h2>勝利の力を、次の旅へ</h2><span>RANK ${q.result.rank} · ${q.result.score.toLocaleString('ja-JP')}点</span></div><p class="inherit-note">4候補から1つ選んで、次の旅へ。<small>新しい候補は未継承・流派の初期技以外が対象。不足分は技や資金で補充</small></p>${q.result.stage===4?'<div class="boss-drop">ダーククラッシュ解放 · 黎明の大剣は「改」へ</div>':''}<div class="chest-grid">${q.offers.map((o,i)=>{const s=getSkill(o.id);if(o.kind==='rare'&&s)return `<button class="reward-card draft-card illustrated ${isManualSkill(s)?'uses-slot':'slot-free'}" data-reward="${i}" style="--card-order:${i}">${skillCardContents(s,0,'reward',o.fromRun===true)}</button>`;const r=rewardInfo(o);return `<button class="reward-card legacy-reward" data-reward="${i}"><span>${r.icon}</span><strong>${r.name}</strong><p>${r.desc}</p><b>${r.benefit}</b></button>`}).join('')}</div><small class="inherit-save">自動保存済み · 閉じてもこの4候補から再開</small>`);
 $('modal').classList.add('chest-modal','inherit-modal');menuNodes('[data-reward]').forEach(b=>b.onclick=()=>claimChest(q.id,+b.dataset.reward));playCue('victory');
}
function renderEmbark(index){
 refreshCampaign();if(campaign.pending){openChest();return false}if(!availableStage(index))return false;
 const n=cloneCampaign();n.selected=index;saveCampaign(n);game.mode='preparation';game.active=false;selectedStyle=campaign.style;
 const weapon=getWeapon(campaign.weapon),style=STYLES.find(s=>s.id===campaign.style),ids=campaign.rares;
 openModal(`<div class="embark-heading"><button id="backStages" aria-label="地図へ戻る">←</button><div><small>出発の確認 · 全5区画</small><h2>${REGIONS[index].name}</h2></div><span class="embark-stars">${difficultyStars(index)}</span></div><div class="embark-body"><section class="embark-kit"><div class="kit-weapon"><i style="color:${weapon.color}">${weapon.icon}</i><div><small>装備中の剣</small><strong>${weapon.name}</strong><span>${weapon.element}属性 · ${weapon.extra}</span></div></div><div class="kit-vitals"><b>♥ HP・MP 満タン</b><span>通常攻撃はオート</span></div><div class="kit-ultimate"><small>必殺技</small><b>${getUltimateArt(campaign.ultimate).name}</b></div><label class="embark-style">流派<select id="prepStyle">${STYLES.map(s=>`<option value="${s.id}" ${s.id===campaign.style?'selected':''}>${s.name}</option>`).join('')}</select><button id="prepSettings" aria-label="操作と設定">⚙︎</button></label><p class="style-note">${style.desc}</p></section><section class="embark-carry"><div class="carry-heading"><h3 id="carryCount">持ち込み技 ${campaign.carries.length} / ${campaign.carrySlots}</h3><button data-carry="" aria-pressed="${!campaign.carries.length}">外す</button></div>${ids.length?`<div class="carry-grid">${ids.map(id=>{const s=getSkill(id);return `<button data-carry="${id}" aria-pressed="${campaign.carries.includes(id)}"><i class="carry-skill-illustration">${skillArtwork(s)}</i><b>${skillDisplayName(s,0)}</b><span>${isManualSkill(s)?'技枠':'枠不要'} · ${skillMana(s)?'MP '+skillMana(s):'MP不要'}</span></button>`}).join('')}</div>`:'<div class="empty-carry"><b>流派の初期技と、一歩を踏み出そう。</b><span>ステージをクリアすると技を継承できます。</span><div>'+skillArtwork(getSkill('crescent'))+'</div></div>'}<p id="carryDetail" class="carry-detail" role="status">${campaign.carries.length?'選択中：'+campaign.carries.map(id=>skillDisplayName(getSkill(id),0)).join(' / '):'持ち込みなし · MP不要の蒼月斬で出発'}</p></section></div><div class="embark-footer"><button id="prepStore"><i>▣</i><span><b>よろずや</b><small>剣・持ち込み枠・秘伝書</small></span><em>→</em></button><button id="startStageButton" class="cta">冒険へ出発 <span>→</span></button></div>`);
 $('modal').classList.add('preparation-modal','embark-modal');
 $('prepStyle').onchange=e=>{const n=cloneCampaign();n.style=e.target.value;selectedStyle=n.style;saveCampaign(n);$('modal').querySelector('.style-note').textContent=STYLES.find(s=>s.id===n.style).desc};
 menuNodes('[data-carry]').forEach(b=>b.onclick=()=>{const n=cloneCampaign(),id=b.dataset.carry;let note='';if(!id)n.carries=[];else if(n.carries.includes(id))n.carries=n.carries.filter(x=>x!==id);else if(n.carries.length<n.carrySlots)n.carries.push(id);else if(n.carrySlots===1)n.carries=[id];else{note='枠がいっぱいです。選択中の技を押して外せます。';playCue('deny')}n.carry=n.carries[0]||null;saveCampaign(n);menuNodes('[data-carry]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.carry?n.carries.includes(c.dataset.carry):!n.carries.length)));$('carryCount').textContent='持ち込み技 '+n.carries.length+' / '+n.carrySlots;$('carryDetail').textContent=note||(id?skillDisplayName(getSkill(id),0)+'：'+SKILL_SUMMARIES[id]:'持ち込みなし · 蒼月斬で出発')});
 $('startStageButton').onclick=()=>startStageAttempt(index);$('prepStore').onclick=()=>openWeaponShop('preparation');$('backStages').onclick=openStageSelect;$('prepSettings').onclick=openSettings;return true;
}
function atlasDecor(){return `<defs><linearGradient id="atlasSea" x2="0" y2="1"><stop stop-color="#101f3a"/><stop offset="1" stop-color="#28546a"/></linearGradient><pattern id="atlasGrid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#b5d0bb22"/></pattern><filter id="atlasShadow"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-opacity=".4"/></filter></defs><rect width="700" height="400" fill="url(#atlasSea)"/><rect width="700" height="400" fill="url(#atlasGrid)"/><g filter="url(#atlasShadow)"><path d="M25 350Q-5 230 85 105Q180 22 270 45L348 100L430 38Q572-5 645 85Q730 160 665 270L572 350L430 365L310 318L160 385Z" fill="#638478" stroke="#d0c39b" stroke-width="4"/><path d="M45 330Q100 235 182 250T315 310L260 360L135 375Z" fill="#6d9869"/><path d="M285 80Q365 120 327 190T405 365" fill="none" stroke="#4f97ad" stroke-width="24"/><path d="M480 195L530 92L580 172L620 108L655 245Z" fill="#8d6655" stroke="#bf9a71" stroke-width="2"/><path d="M535 100L546 124L520 124Z" fill="#f7b076"/><path d="M286 171L338 96L389 171Z" fill="#a59265" stroke="#d8c493" stroke-width="3"/><path d="M80 80L122 25L165 80Z" fill="#514968"/><path d="M495 45Q560 0 628 48Q567 77 495 45Z" fill="#dfe9cf" stroke="#fff0b0" stroke-width="2"/></g><g class="atlas-cloud" fill="#eff7f01a"><ellipse cx="160" cy="100" rx="80" ry="20"/><ellipse cx="505" cy="285" rx="95" ry="24"/></g><g transform="translate(650 345)" fill="none" stroke="#e7d8ac"><path d="M0-24V24M-24 0H24M0-18L6 0L0 18L-6 0Z"/><circle r="27" opacity=".5"/></g>`}
function addAtlasPresentation(){
 const modal=$('modal');modal.classList.add('atlas-modal');const map=modal.querySelector('.world-map'),svg=map?.querySelector('svg');if(svg)svg.innerHTML=atlasDecor()+worldRouteSvg(visibleRegionCount(),atlasPositions())+atlasDetails();
 if(map)map.dataset.realmCount=visibleRegionCount();menuNodes('[data-stage]').forEach(node=>{const i=+node.dataset.stage;node.querySelector('i').textContent=availableStage(i)?REGIONS[i].icon:'☁';node.insertAdjacentHTML('afterbegin','<span class="region-art" aria-hidden="true">'+regionArtwork(i)+'</span>');if(campaign.clears[i]){const label=document.createElement('span');label.className='cleared-ribbon';label.textContent='クリア';node.prepend(label);node.querySelector('small').textContent='もう一度挑む'}});
 $('weaponShop').innerHTML='<b>▣ よろずや</b><span>剣を買う・技の持ち込み枠を増やす</span><small>所持金 '+campaign.wallet.toLocaleString('ja-JP')+' G　→</small>';
}
function emitSkillAccent(s){
 if(reduced||!preferences.flashes||!isManualSkill(s)||effects.length>=effectBudget()-5)return;
 const target=nearest(s.range||500),to=target||{x:p.x+p.face.x*160,y:p.y+p.face.y*160};
 effects.push({kind:'skillRibbon',x:p.x,y:p.y-24,ex:to.x,ey:to.y-24,color:s.color,life:.4,max:.4});
 effects.push({kind:'skillCrown',x:p.x,y:p.y-8,r:55,color:s.color,life:.48,max:.48});
 particle(to.x,to.y-25,s.color,renderLoad.slow?5:10,150);
 if(skillElement(s)!=='none')effects.push({kind:'elementAccent',element:skillElement(s),x:to.x,y:to.y-22,r:44,color:s.color,life:.45,max:.45});
}
function drawSkillRibbon(e,a){
 const dx=e.ex-e.x,dy=e.ey-e.y,n=norm(-dy,dx),bend=Math.min(65,Math.hypot(dx,dy)*.3),cx=(e.x+e.ex)/2+n.x*bend,cy=(e.y+e.ey)/2+n.y*bend;
 ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const [width,color]of [[12*a,e.color],[3*a,'#fff5d0']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.quadraticCurveTo(cx,cy,e.ex,e.ey);ctx.stroke()}
}
function drawElementAccent(e,a){
 ctx.translate(e.x,e.y);ctx.globalCompositeOperation='lighter';const progress=1-a;ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineWidth=2*a+1;
 const count=reduced?3:6;
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count+progress*.5,x=Math.cos(angle)*e.r*progress,y=Math.sin(angle)*e.r*progress;
  if(e.element==='lightning'){ctx.beginPath();ctx.moveTo(x,y-18*a);ctx.lineTo(x-6*a,y);ctx.lineTo(x+5*a,y-3*a);ctx.lineTo(x,y+18*a);ctx.stroke()}
  else if(e.element==='ice'||e.element==='earth'){path([[x,y-14*a],[x+5*a,y],[x,y+9*a],[x-5*a,y]],e.color,'#fff2d7')}
  else if(e.element==='fire'){ellipse(x,y,4*a,12*a,e.color)}
  else{ctx.beginPath();ctx.arc(0,0,e.r*(.4+progress*.6),angle,angle+.45);ctx.stroke()}
 }
}
function drawRealmAmbience(t){
 if(game.singleStage&&game.region===6){drawShadowMist(t);return}
 if(reduced||!game.singleStage)return;const bounds=worldBounds(),colors=['#d1ffc1','#b0ecff','#ffc484','#e5d9aa','#d0a4ed','#fff3bd'],color=colors[game.region]||'#d0d0d0',count=Math.round((renderLoad.slow?12:22)*preferences.particles);ctx.save();
 for(let i=0;i<count;i++){const x=70+((i*113.7+t*(game.region===2?8:3))%620),y=bounds.top+((i*89.3+t*(game.region===2?-12:4))%(bounds.bottom-bounds.top)+(bounds.bottom-bounds.top))%(bounds.bottom-bounds.top);ctx.globalAlpha=.12+Math.sin(t+i)*.07;ellipse(x,y,game.region===2?2:3,game.region===2?5:2,color)}ctx.restore();
}
