// Small, explicit pages keep touch controls reachable without wheel scrolling.
function menuTabs(groups,initial=0){
 const modal=$('modal'),nav=document.createElement('div');nav.className='menu-tabs';nav.setAttribute('role','tablist');const panels=[];
 groups.forEach(([label,nodes],i)=>{const panel=document.createElement('section');panel.className='menu-panel';panel.id='menu-panel-'+i;panel.setAttribute('role','tabpanel');nodes.filter(Boolean).forEach(n=>panel.append(n));panels.push(panel);const b=document.createElement('button');b.textContent=label;b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);b.onclick=()=>{select(i);fitMenuPages()};nav.append(b)});
 const anchor=modal.querySelector('h2');anchor.after(nav);nav.after(...panels);
 function select(i){panels.forEach((p,j)=>p.hidden=i!==j);[...nav.children].forEach((b,j)=>b.setAttribute('aria-selected',String(i===j)));modal.scrollTop=0}select(initial);return select;
}
function menuNodes(selector){return [...$('modal').querySelectorAll(selector)]}
function compactStageMap(){ $('modal').classList.add('compact-map') }
function compactPreparation(){
 menuTabs([['装備',menuNodes('.prep-loadout,.carry-label,.carry-description')],['戦い方',menuNodes('.style-options')],['出発の補助',menuNodes('.preparation-shop')]]);
 const details=$('modal').querySelector('.preparation-shop');if(details){details.open=true;details.querySelector('summary').hidden=true}
 const note=document.createElement('small');note.textContent='剣：'+getWeapon(campaign.weapon).name;$('modal').querySelector('.prep-loadout').append(note);
}
function compactRest(focusSlot){
 if(game.relicOffers?.length)return;
 const potion=document.createElement('button');potion.id='fieldPotion';potion.className='text-button';potion.textContent='樽の回復薬 ×'+(game.fieldPotions||0)+' · HPとMPを回復';potion.disabled=!(game.fieldPotions>0)||p.hp>=p.maxHp&&p.mp>=p.maxMp;potion.onclick=useFieldPotion;
 const needs=p.hp<p.maxHp*.65||p.mp<p.maxMp*.4;
 menuTabs([['次の区画',menuNodes('.rest-next,.relic-summary')],['技の装備',menuNodes('.equipment-list,.automatic-summary')],[(needs?'♥ 回復がおすすめ':'回復'),[potion,...menuNodes('.rest-supply,#roomHeal')]]],Number.isInteger(focusSlot)?1:0);
 const details=$('modal').querySelector('.rest-supply');if(details){details.open=true;details.querySelector('summary').hidden=true}
 $('roomEquipmentDone').textContent='準備完了 · 上の門へ歩く';$('roomEquipmentBack').textContent='区画を見渡す';
}
function compactResult(){menuTabs([['結果',menuNodes('.score-hero,.reward-received,.new-stage')],['くわしい記録',menuNodes('.result-summary')]])}
function paginateCollection(){
 const grid=$('modal').querySelector('.collection-grid'),cards=[...grid.children];let page=0;const pageSize=innerWidth<360||innerHeight<500?2:4;const nav=document.createElement('div');nav.className='menu-tabs';const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');prev.textContent='← 前';next.textContent='次 →';nav.append(prev,label,next);grid.after(nav);
 function show(){cards.forEach((c,i)=>c.hidden=Math.floor(i/pageSize)!==page);label.textContent=(page+1)+' / '+Math.max(1,Math.ceil(cards.length/pageSize));prev.disabled=page===0;next.disabled=(page+1)*pageSize>=cards.length}prev.onclick=()=>{page--;show()};next.onclick=()=>{page++;show()};show();
}
function compactSettings(){const bindings=$('modal').querySelector('.comfort-settings details');if(bindings){bindings.open=true;bindings.querySelector('summary').hidden=true}menuTabs([['操作',menuNodes('.help-steps,.settings-note')],['音・演出',menuNodes('.setting-row,.motion-option')],['細かい設定',menuNodes('.comfort-grid')],['キー割当',[bindings]]]);$('modal').querySelector('.comfort-settings')?.remove()}
function openWeaponShop(returnMode='stageSelect',page=0){
 if(!['stageSelect','stageResult','weaponShop'].includes(game.mode)||returnMode==='stageResult'&&!campaign.lastResult?.win)return false;
 game.mode='weaponShop';refreshCampaign();const chosen=WEAPONS.slice(page*2,page*2+2);
 openModal('<div class="eyebrow">剣の店 · '+campaign.wallet+' G</div><h2>自分の戦い方に合う剣を</h2><p>購入した剣は永久所持。次の出発から使います。</p><div class="weapon-grid">'+chosen.map(w=>'<article style="--weapon-color:'+w.color+'"><h3>'+w.icon+' '+w.name+'</h3><p>'+w.desc+'</p><dl><dt>一撃 / 攻撃速度 / 刃の広さ</dt><dd>'+Math.round(w.power*100)+'% / '+Math.round(w.speed*100)+'% / '+Math.round(w.reach*100)+'%</dd><dt>属性・追加効果</dt><dd>'+w.element+' · '+w.extra+'</dd></dl><button data-weapon="'+w.id+'" '+(campaign.weapon===w.id||!campaign.weapons.includes(w.id)&&campaign.wallet<w.price?'disabled':'')+'>'+(campaign.weapon===w.id?'装備中':campaign.weapons.includes(w.id)?'この剣を装備':w.price+' Gで購入して装備')+'</button></article>').join('')+'</div><div class="menu-tabs"><button id="weaponPrev" '+(!page?'disabled':'')+'>← 前</button><span>'+(page+1)+' / 3</span><button id="weaponNext" '+(page===2?'disabled':'')+'>次 →</button></div><button id="weaponBack" class="cta">戻る</button>');$('modal').classList.add('weapon-modal');
 $('weaponPrev').onclick=()=>openWeaponShop(returnMode,page-1);$('weaponNext').onclick=()=>openWeaponShop(returnMode,page+1);$('weaponBack').onclick=()=>returnMode==='stageResult'?showStageResult(campaign.lastResult):openStageSelect();
 menuNodes('[data-weapon]').forEach(b=>b.onclick=()=>{if(game.mode!=='weaponShop')return;refreshCampaign();const w=getWeapon(b.dataset.weapon),n=cloneCampaign();if(!n.weapons.includes(w.id)){if(n.wallet<w.price)return;n.wallet-=w.price;n.weapons.push(w.id)}n.weapon=w.id;saveCampaign(n);openWeaponShop(returnMode,page)});return true;
}
// On very short displays, paginate the visible blocks instead of clipping or scrolling.
function fitMenuPages(){
 const modal=$('modal');if($('overlay').hidden)return;modal.querySelector('.overflow-pager')?.remove();for(const n of modal.children)n.classList.remove('overflow-page');
 const limit=innerHeight-28,style=getComputedStyle(modal),padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+4;
 if(modal.scrollHeight<=limit)return;
 const nodes=[...modal.children].filter(n=>getComputedStyle(n).display!=='none'),pages=[[]];let used=0;const budget=limit-padding-62;
 for(const n of nodes){const s=getComputedStyle(n),height=n.getBoundingClientRect().height+parseFloat(s.marginTop)+parseFloat(s.marginBottom);if(used+height>budget&&pages.at(-1).length){pages.push([]);used=0}pages.at(-1).push(n);used+=height}
 if(pages.length<2)return;let index=0;const nav=document.createElement('div');nav.className='menu-tabs overflow-pager';nav.innerHTML='<button type="button">← 前の画面</button><span></span><button type="button">続き →</button>';modal.append(nav);
 function show(){pages.forEach((list,i)=>list.forEach(n=>n.classList.toggle('overflow-page',i!==index)));nav.children[0].disabled=index===0;nav.children[1].textContent=(index+1)+'/'+pages.length;nav.children[2].disabled=index===pages.length-1;modal.scrollTop=0}
 nav.children[0].onclick=()=>{index--;show()};nav.children[2].onclick=()=>{index++;show()};show();
}
window.addEventListener('resize',()=>requestAnimationFrame(fitMenuPages));
