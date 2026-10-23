// Direct equipment changes within one boss gate, with no nested selection dialogs.
let bossGateTarget='weapon';
function gateItemArt(type,item){return !item?'<span class="gate-empty-art" aria-hidden="true">＋</span>':type==='weapon'?weaponArtwork(item):type==='ultimate'?storeArtwork(item,false,true):skillArtwork(item)}
function gateTargetItem(target){return target==='weapon'?getWeapon(game.weapon):target==='ultimate'?getUltimateArt(game.ultimateArt):getSkill(p.loadout[+target.slice(-1)])}
function gateItemName(type,item){return !item?'技を選ぶ':type==='skill'?skillDisplayName(item)+' <em>Lv.'+p.learned[item.id]+'</em>':item.name+(forgeLevel(type,item.id)?' ＋'+forgeLevel(type,item.id):'')}
function gateSlotButton(target,label){
 const type=target.startsWith('skill')?'skill':target,item=gateTargetItem(target);
 return '<button class="gate-loadout-card '+(!item?'is-empty':'')+'" data-gate-target="'+target+'" '+(target==='weapon'?'id="gateWeapon"':target==='ultimate'?'id="gateUltimate"':'data-gate-slot="'+target.slice(-1)+'"')+' aria-pressed="'+(bossGateTarget===target)+'"><i aria-hidden="true">'+gateItemArt(type,item)+'</i><span><small>'+label+'</small><b>'+gateItemName(type,item)+'</b></span><strong aria-hidden="true">›</strong></button>';
}
function gateSkillBadges(s){return '<span class="gate-skill-cost">'+(s.id==='bloodpact'?'HP 8%':skillMana(s)?'MP '+skillMana(s):'MP不要')+'</span><span>'+skillCooldown(s).toFixed(1)+'秒</span>'}
function gateChoiceMarkup(item,type){
 const current=gateTargetItem(bossGateTarget),selected=(current?.id||'')===(item?.id||''),other=type==='skill'&&item?p.loadout.indexOf(item.id):-1;
 const metrics=!item?'この技枠を空ける':type==='weapon'?'攻撃力 '+Math.round(item.attack*(1+.06*forgeLevel('weapon',item.id)))+' · 速度 '+Math.round(item.speed*100)+' · 間合い '+Math.round(item.reach*100):type==='ultimate'?'基礎威力 '+Math.round(item.damage*(1+.08*forgeLevel('ultimate',item.id))):gateSkillBadges(item);
 return '<button class="gate-choice '+(selected?'is-selected':'')+'" data-gate-choice="'+(item?.id||'')+'" aria-pressed="'+selected+'"><i aria-hidden="true">'+gateItemArt(type,item)+'</i><span class="gate-choice-copy"><b>'+gateItemName(type,item)+'</b><small>'+metrics+'</small></span>'+(selected?'<strong class="gate-choice-tag">装備中</strong>':other>=0?'<strong class="gate-choice-tag is-transfer">技'+(other+1)+'と交換</strong>':'')+'</button>';
}
function openBossGate(target=null,focusChoice=false){
 if(game.active||game.pendingChoices||!nextRoomIsBoss())return false;
 const modal=$('modal'),continuing=game.mode==='bossPreparation'&&!!modal.querySelector('.gate-loadout'),same=continuing&&(!target||target===bossGateTarget),bodyTop=continuing?modal.querySelector('.boss-gate-body').scrollTop:0,listTop=same?modal.querySelector('.gate-choice-list').scrollTop:0;
 if(!continuing)bossGateTarget='weapon';if(target&&['weapon','ultimate','skill0','skill1','skill2'].includes(target))bossGateTarget=target;
 game.mode='bossPreparation';clearFieldNotices();resetInput();
 const region=isTemple()?[0,1,2,3,4,5,7,6][game.room]:game.region,bossName=isMine()?mineBossName():REGIONS[region].boss,type=bossGateTarget.startsWith('skill')?'skill':bossGateTarget,item=gateTargetItem(bossGateTarget),label=type==='weapon'?'剣':type==='ultimate'?'必殺技':'技 '+(+bossGateTarget.slice(-1)+1),items=type==='weapon'?campaign.weapons.map(id=>getWeapon(id)):type==='ultimate'?campaign.ultimates.map(id=>getUltimateArt(id)):[null,...SKILLS.filter(s=>p.learned[s.id]&&isManualSkill(s))];
 const description=!item?'使いたい技を選んでください。':type==='weapon'?item.element+'属性'+(item.extra==='なし'?'':' · '+item.extra):type==='ultimate'?item.desc:SKILL_SUMMARIES[item.id]||item.desc;
 openModal('<header class="boss-gate-heading"><div class="gate-realm-art" aria-hidden="true">'+(isMine()?mineCaveArtwork():regionArtwork(region))+'</div><div class="gate-header-copy"><span>ボス戦の準備</span><h2>'+bossName+'</h2><small>'+(isTemple()?'第'+(game.room+1)+'刻 · ':isMine()?'深度'+mineDepth()+' · ':'')+REGIONS[game.region].name+'</small></div></header><div class="boss-gate-vitals"><div class="gate-vital gate-hp"><span>HP <b>'+Math.ceil(p.hp)+' / '+p.maxHp+'</b></span><i><em style="width:'+clamp(p.hp/p.maxHp*100,0,100)+'%"></em></i></div><div class="gate-vital gate-mp"><span>MP <b>'+Math.floor(p.mp)+' / '+p.maxMp+'</b></span><i><em style="width:'+clamp(p.mp/p.maxMp*100,0,100)+'%"></em></i></div><span class="gate-potions">ポーション <b>×'+game.fieldPotions+'</b></span></div><div class="boss-gate-body"><section class="gate-loadout" aria-label="変更する装備や技"><h3>装備</h3><div class="gate-gear-slots">'+gateSlotButton('weapon','剣')+gateSlotButton('ultimate','必殺技')+'</div><h3>戦闘に使う技</h3><div class="gate-skill-slots">'+[0,1,2].map(i=>gateSlotButton('skill'+i,'技 '+(i+1))).join('')+'</div></section><section class="gate-picker"><div class="gate-picker-heading"><h3>'+label+'を選ぶ</h3><small>'+items.filter(Boolean).length+(type==='weapon'?'本':'種類')+'</small></div><p class="gate-current-summary" role="status">'+description+'</p><div class="gate-choice-list" aria-label="'+label+'の候補">'+items.map(x=>gateChoiceMarkup(x,type)).join('')+'</div></section></div><div class="service-footer"><button id="bossGateBack">扉の前へ戻る</button><button id="bossGateConfirm" class="cta">この装備で挑む <span>→</span></button></div>',false,continuing?(focusChoice?'[data-gate-choice="'+(item?.id||'')+'"]':'[data-gate-target="'+bossGateTarget+'"]'):'#bossGateConfirm');
 modal.classList.add('boss-gate-modal','boss-gate-illustrated');
 modal.querySelector('.boss-gate-body').scrollTop=bodyTop;modal.querySelector('.gate-choice-list').scrollTop=listTop;
 menuNodes('[data-gate-target]').forEach(b=>b.onclick=()=>{openBossGate(b.dataset.gateTarget,true);if(matchMedia('(max-width:600px) and (min-height:451px)').matches){const body=modal.querySelector('.boss-gate-body'),picker=modal.querySelector('.gate-picker');body.scrollTop+=picker.getBoundingClientRect().top-body.getBoundingClientRect().top}});
 menuNodes('[data-gate-choice]').forEach(b=>b.onclick=()=>{
  if(game.mode!=='bossPreparation')return;const id=b.dataset.gateChoice;
  if(type==='weapon'){if(!equipRunWeapon(id))return}
  else if(type==='ultimate'){if(!campaign.ultimates.includes(id))return;game.ultimateArt=id;game.forgeUltimate=forgeLevel('ultimate',id)}
  else if(!equipSkill(id,+bossGateTarget.slice(-1)))return;
  playCue('equip');openBossGate(null,true);announce(label+'を変更しました');
 });
 $('bossGateBack').onclick=()=>{game.mode='play';game.phase='exitWalk';p.y=STAGES[game.stage].y-130;closeModal();resetInput();updateUI()};
 $('bossGateConfirm').onclick=()=>{if(game.mode!=='bossPreparation')return;game.bossGateApproved=true;game.mode='play';closeModal();advanceRoom()};return true;
}
