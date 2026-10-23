// One merchant visit, four shelves, one return path. Category changes never buy items.
const STORE_SHELVES=[['swords','剣','storeSwords'],['arts','秘伝書','storeArts'],['charms','お守り','storeCharms'],['expansion','枠拡張','storeExpansion']];
let storeVisit=null;
function storeMoney(value){return value.toLocaleString('ja-JP')+' G'}
function storeList(tab){return tab==='swords'?availableWeapons():tab==='arts'?ultimateArts().filter(a=>a.regionUnlock==null||campaign.clears[a.regionUnlock]||campaign.ultimates.includes(a.id)):tab==='charms'?availableCharms():expansionProducts()}
function storeOwned(tab,item){return tab==='swords'?campaign.weapons.includes(item.id):tab==='arts'?campaign.ultimates.includes(item.id):campaign.charms.includes(item.id)}
function storeEquipped(tab,item){return tab==='swords'?campaign.weapon===item.id:tab==='arts'?campaign.ultimate===item.id:campaign.equippedCharms.includes(item.id)}
function storePrice(tab,item){return tab==='swords'?weaponSale(item.id,storeRegion).price:item.price}
function storePicture(tab,item){return tab==='charms'?charmArtwork(item):storeArtwork(item,tab==='swords',tab==='arts')}
function storeStatus(tab,item){
 if(storeEquipped(tab,item))return tab==='arts'?'選択中':'装備中';
 if(storeOwned(tab,item))return tab==='arts'?'習得済み':'購入済み';
 return tab==='swords'?weaponPriceLabel(item,storeRegion):storeMoney(item.price);
}
function storeCard(tab,item,chosen){
 const owned=storeOwned(tab,item),equipped=storeEquipped(tab,item),attr=tab==='swords'?'data-sword':tab==='arts'?'data-product':'data-charm';
 return '<button class="store-item '+(equipped?'is-equipped':owned?'is-owned':'')+'" '+attr+'="'+item.id+'" aria-pressed="'+(chosen.id===item.id)+'"><i aria-hidden="true">'+storePicture(tab,item)+'</i><span class="store-item-copy"><b>'+item.name+'</b><small>'+storeStatus(tab,item)+'</small></span>'+(equipped?'<span class="store-equipped-mark" aria-hidden="true">◆</span>':'')+'</button>';
}
function storeDetail(tab,item){
 const owned=storeOwned(tab,item),equipped=storeEquipped(tab,item),price=storePrice(tab,item),shortage=Math.max(0,price-campaign.wallet),sale=tab==='swords'&&!owned&&weaponSale(item.id,storeRegion).sale;
 const title='<div class="store-detail-heading"><small>'+(equipped?(tab==='arts'?'選択中':'装備中'):owned?'購入済み':sale?'セール中 −100 G':'')+'</small><h3>'+item.name+'</h3></div>';
 const detail=tab==='swords'?weaponComparison(item,getWeapon(campaign.weapon))+'<p>'+item.element+'属性'+(item.extra==='なし'?'':' · '+item.extra)+'</p>':tab==='arts'?'<p>'+item.desc+'</p><dl class="store-art-metrics"><dt>基礎威力</dt><dd>'+Math.round(item.damage*(1+.08*forgeLevel('ultimate',item.id)))+'</dd></dl>':'<b class="store-trigger">'+charmCondition(item)+'の戦闘開始時</b><p class="store-effect">'+item.desc+'</p>';
 const full=tab==='charms'&&!equipped&&campaign.equippedCharms.length>=campaign.charmSlots;
 const swap=full?'<label class="store-swap">入れ替えるお守り<select id="storeCharmSlot">'+campaign.equippedCharms.map((id,slot)=>'<option value="'+slot+'">枠'+(slot+1)+' · '+CHARMS.find(c=>c.id===id).name+'</option>').join('')+'</select></label>':'';
 const verb=tab==='swords'?'装備':tab==='arts'?'選択':full?'入れ替え':'装備';
 const label=equipped?(tab==='arts'?'選択中':'装備中'):owned?verb+'する':storeMoney(price)+' · '+(tab==='arts'?'習得して使う':'購入して'+verb);
 const id=tab==='charms'?'charmBuy':'buySword';
 return '<section class="store-detail" aria-live="polite"><div class="store-detail-copy"><i class="store-hero" aria-hidden="true">'+storePicture(tab,item)+'</i>'+title+'<div class="store-description">'+detail+'</div></div>'+(equipped&&tab!=='charms'?'':'<div class="store-checkout">'+swap+(equipped&&tab==='charms'?'<button id="charmNone" class="store-remove">装備を外す</button>':'<button id="'+id+'" class="cta '+(sale?'is-sale':'')+'" '+(equipped||!owned&&shortage?'disabled':'')+'>'+label+'</button>')+(!owned&&shortage?'<small class="store-shortage">あと '+storeMoney(shortage)+'</small>':'')+'</div>')+'</section>';
}
function storeExpansions(selection){
 return '<div class="store-expansions">'+expansionProducts().map(item=>{
  const max=item.level>=item.max,shortage=Math.max(0,item.price-campaign.wallet),active=item.id===selection;
  return '<section class="store-expansion-card '+(active?'is-highlighted':'')+'" data-expansion-target="'+item.id+'"><div class="store-expansion-title"><i aria-hidden="true">'+storePicture('expansion',item)+'</i><div><h3>'+item.name+'</h3><b>'+item.level+' / '+item.max+' 枠</b></div></div><p>'+(item.id==='carryExpansion'?'解放した技を持ち込める数':'同時に装備できるお守りの数')+'</p><div class="store-slot-track" aria-label="現在'+item.level+'枠、最大'+item.max+'枠">'+Array.from({length:item.max},(_,i)=>'<span class="'+(i<item.level?'filled':i===item.level?'next':'')+'">'+(i<item.level?'◆':'＋')+'</span>').join('')+'</div><div class="store-checkout">'+(max?'<strong class="store-max">最大まで拡張済み</strong>':'<b class="store-next">'+item.level+' → '+(item.level+1)+' 枠</b><button '+(active?'id="buyExpansion" ':'')+'data-buy-expansion="'+item.id+'" class="cta" '+(shortage?'disabled':'')+'>'+storeMoney(item.price)+' · 1枠増やす</button>'+(shortage?'<small class="store-shortage">あと '+storeMoney(shortage)+'</small>':''))+'</div></section>';
 }).join('')+'</div>';
}
function closeStorefront(){storeVisit=null;return storeReturn==='preparation'?openPreparation(campaign.selected):openStageSelect()}
function openStorefront(tab='swords',selection=null,returnMode='stageSelect',focusSelector=null){
 if(!STORE_SHELVES.some(([id])=>id===tab)||!['stageSelect','stageResult','weaponShop','preparation','training'].includes(game.mode))return false;
 const old=$('modal'),continuing=game.mode==='weaponShop'&&!!storeVisit&&old.classList.contains('storefront-modal');
 if(continuing){storeVisit.scroll[storeTab]=old.querySelector('.store-items')?.scrollTop||0;storeVisit.detail[storeTab]=old.querySelector('.store-detail-copy')?.scrollTop||0}
 else{storeReturn=game.mode==='preparation'||returnMode==='preparation'?'preparation':'stageSelect';storeRegion=storeReturn==='preparation'?campaign.selected:recommendedStage();storeVisit={selected:{},scroll:{},detail:{}};clearFieldNotices()}
 refreshCampaign();game.mode='weaponShop';storeTab=tab;const items=storeList(tab);
 const item=items.find(x=>x.id===(selection||storeVisit.selected[tab]))||items.find(x=>storeEquipped(tab,x))||items[0];
 if(item)storeVisit.selected[tab]=item.id;
 const caption=tab==='charms'?'装備 '+campaign.equippedCharms.length+' / '+campaign.charmSlots+' 枠':tab==='swords'?'現在の剣と比較':tab==='arts'?'必殺技を1つ選択':'冒険の持ち込みを増やす';
 const content=tab==='expansion'?storeExpansions(selection||item?.id):'<div class="store-content"><section class="store-catalog"><div class="store-section-heading"><b>'+STORE_SHELVES.find(([id])=>id===tab)[1]+'</b><small>'+caption+'</small></div><div class="store-items '+(items.length<=4?'short-stock':'')+'" aria-label="商品一覧">'+items.map(x=>storeCard(tab,x,item)).join('')+'</div></section>'+ (item?storeDetail(tab,item):'<div class="store-empty">まだ商品がありません</div>')+'</div>';
 openModal('<header class="storefront-heading"><div><small>冒険の支度</small><h2>よろずや</h2></div><b class="storefront-wallet"><small>所持金</small>'+goldCounterMarkup(campaign.wallet,'wallet')+' <span>G</span></b></header><nav class="storefront-tabs" aria-label="商品カテゴリ">'+STORE_SHELVES.map(([key,label,id])=>'<button id="'+id+'" data-store-tab="'+key+'" aria-pressed="'+(key===tab)+'">'+label+'</button>').join('')+'</nav>'+content+'<div class="storefront-footer"><button id="weaponBack" class="text-button">‹ '+(storeReturn==='preparation'?'出発の確認へ':'冒険の地図へ')+'</button></div>',false,focusSelector||'#'+STORE_SHELVES.find(([id])=>id===tab)[2]);
 old.classList.add('storefront-modal');old.dataset.storeTab=tab;
 const shelf=old.querySelector('.store-items'),copy=old.querySelector('.store-detail-copy');if(shelf)shelf.scrollTop=storeVisit.scroll[tab]||0;if(copy)copy.scrollTop=selection?0:storeVisit.detail[tab]||0;
 menuNodes('[data-store-tab]').forEach(b=>b.onclick=()=>openStorefront(b.dataset.storeTab,null,storeReturn,'#'+b.id));
 // Selection focus stays on the selected card, without scrolling the entire dialog.
 menuNodes('.store-item').forEach(b=>{b.onclick=()=>{const attr=tab==='swords'?'data-sword':tab==='arts'?'data-product':'data-charm';openStorefront(tab,b.getAttribute(attr),storeReturn,'['+attr+'="'+b.getAttribute(attr)+'"]')}});
 if($('buySword'))$('buySword').onclick=()=>purchaseStoreItem(tab,item.id);
 if($('charmBuy'))$('charmBuy').onclick=()=>purchaseStoreItem(tab,item.id,$('storeCharmSlot')?+$('storeCharmSlot').value:null);
 if($('charmNone'))$('charmNone').onclick=()=>{if(game.mode!=='weaponShop'||storeTab!=='charms')return;refreshCampaign();const n=cloneCampaign();n.equippedCharms=n.equippedCharms.filter(id=>id!==item.id);n.charm=n.equippedCharms[0]||null;saveCampaign(n);openStorefront(tab,item.id,storeReturn,'#charmBuy');announce('お守りを外しました')};
 menuNodes('[data-buy-expansion]').forEach(b=>b.onclick=()=>purchaseExpansion(b.dataset.buyExpansion));
 $('weaponBack').onclick=closeStorefront;if(tab==='expansion'&&selection){const target=old.querySelector('[data-expansion-target="'+selection+'"]'),list=old.querySelector('.store-expansions');requestAnimationFrame(()=>{if(game.mode==='weaponShop'&&storeTab==='expansion'&&list.isConnected&&target){const delta=target.getBoundingClientRect().bottom-list.getBoundingClientRect().bottom;if(delta>0)list.scrollTop+=delta}})}return true;
}
function purchaseStoreItem(tab,id,slot=null){
 if(game.mode!=='weaponShop'||storeTab!==tab||tab==='expansion')return false;refreshCampaign();const item=storeList(tab).find(x=>x.id===id);if(!item||storeEquipped(tab,item))return false;
 const n=cloneCampaign(),owned=storeOwned(tab,item),price=storePrice(tab,item);if(!owned&&n.wallet<price)return false;
 if(!owned)n.wallet-=price;
 if(tab==='swords'){if(!owned)n.weapons.push(id);n.weapon=id}
 else if(tab==='arts'){if(!owned)n.ultimates.push(id);n.ultimate=id}
 else{if(!owned)n.charms.push(id);if(n.equippedCharms.length<n.charmSlots)n.equippedCharms.push(id);else{if(!Number.isInteger(slot)||slot<0||slot>=n.charmSlots)return false;n.equippedCharms[slot]=id}n.charm=n.equippedCharms[0]||null}
 saveCampaign(n);playCue('purchase');openStorefront(tab,id,storeReturn);announce(item.name+(owned?'を装備しました':'を購入しました'));return true;
}
function purchaseExpansion(id){
 if(game.mode!=='weaponShop'||storeTab!=='expansion')return false;refreshCampaign();const item=expansionProducts().find(x=>x.id===id);if(!item||item.level>=item.max||campaign.wallet<item.price)return false;
 const n=cloneCampaign();n.wallet-=item.price;if(id==='carryExpansion')n.carrySlots++;else n.charmSlots++;saveCampaign(n);playCue('purchase');openStorefront('expansion',id,storeReturn);announce(item.name+'を'+(item.level+1)+'枠に増やしました');return true;
}

// Keep the upgrade action visible while long descriptions and stat comparisons scroll.
function organizeTrainingDetail(){
 const detail=$('modal').querySelector('.training-detail');if(!detail||detail.querySelector('.training-empty'))return;
 const copy=document.createElement('div'),actions=document.createElement('div');copy.className='training-detail-copy';actions.className='training-actions';
 for(const node of [...detail.children])(node.matches('#forgeBuy,.training-max,.training-shortage')?actions:copy).append(node);
 detail.append(copy,actions);
}
