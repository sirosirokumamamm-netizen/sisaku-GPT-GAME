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
 menuTabs([['装備',menuNodes('.prep-loadout,.carry-label,.carry-description')],['戦い方',menuNodes('.style-options')],['持ち物',menuNodes('.preparation-shop')]]);
 const details=$('modal').querySelector('.preparation-shop');if(details){details.open=true;details.querySelector('summary').hidden=true}
 const note=document.createElement('small');note.textContent='剣：'+getWeapon(campaign.weapon).name;$('modal').querySelector('.prep-loadout').append(note);
}
function compactRest(focusSlot){
 if(game.relicOffers?.length)return;
 const modal=$('modal'),vitals=modal.querySelector('.rest-vitals'),equipment=modal.querySelector('.equipment-list'),heal=$('roomHeal');
 for(const n of menuNodes('.expedition-route,.relic-summary,.relic-owned,.automatic-summary,.rest-next,.rest-supply'))n.remove();for(const n of [...modal.children])if(n.tagName==='P'||n.classList.contains('save-note'))n.remove();
 modal.querySelector('h2').textContent='区画 '+game.room+' クリア';vitals.querySelector('small')?.remove();if(game.lastRecovery){const gain=document.createElement('small');gain.className='clear-recovery';gain.textContent='区画クリア回復　HP +'+game.lastRecovery.hp+' · MP +'+game.lastRecovery.mp;vitals.append(gain)}
 const recovery=document.createElement('section');recovery.className='rest-recovery';const status=document.createElement('small');status.textContent=p.hp<p.maxHp*.65?'♥ 次へ進む前に回復がおすすめ':'回復と装備を確認して次へ';recovery.append(status);
 const row=document.createElement('div');row.className='recovery-actions';const potion=document.createElement('button');potion.id='fieldPotion';potion.textContent=controlLabel('potion')+' 回復薬を使う ×'+(game.fieldPotions||0);potion.disabled=!(game.fieldPotions>0)||p.hp>=p.maxHp&&p.mp>=p.maxMp;potion.onclick=useCombatPotion;row.append(potion);
 recovery.append(row);
 const preview=document.createElement('small');preview.className='potion-preview';preview.textContent='HP '+Math.ceil(p.hp)+' → '+Math.min(p.maxHp,Math.ceil(p.hp)+Math.ceil(p.maxHp*.35))+' / '+p.maxHp+' · MP '+Math.floor(p.mp)+' → '+Math.min(p.maxMp,Math.floor(p.mp)+Math.ceil(p.maxMp*.4))+' / '+p.maxMp+'　所持 '+game.gold+' G';recovery.append(preview);if(heal)recovery.append(heal);vitals.after(recovery);
 const toggle=document.createElement('button');toggle.className='text-button';toggle.id='restEquipmentToggle';toggle.textContent='技の装備を変更';toggle.setAttribute('aria-expanded',String(Number.isInteger(focusSlot)));equipment.hidden=!Number.isInteger(focusSlot);toggle.onclick=()=>{equipment.hidden=!equipment.hidden;toggle.setAttribute('aria-expanded',String(!equipment.hidden));fitMenuPages()};recovery.after(toggle,equipment);
 $('roomEquipmentDone').textContent=game.room===4?'この装備でボスの門へ':'この装備で次の門へ';$('roomEquipmentBack').textContent='区画に戻る';
}
function compactResult(){menuTabs([['結果',menuNodes('.score-hero,.reward-received,.new-stage')],['くわしい記録',menuNodes('.result-summary')]])}
function paginateCollection(){
 const grid=$('modal').querySelector('.collection-grid'),cards=[...grid.children];let page=0;const pageSize=innerWidth<360||innerHeight<500?2:4;const nav=document.createElement('div');nav.className='menu-tabs';const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');prev.textContent='← 前';next.textContent='次 →';nav.append(prev,label,next);grid.after(nav);
 function show(){cards.forEach((c,i)=>c.hidden=Math.floor(i/pageSize)!==page);label.textContent=(page+1)+' / '+Math.max(1,Math.ceil(cards.length/pageSize));prev.disabled=page===0;next.disabled=(page+1)*pageSize>=cards.length}prev.onclick=()=>{page--;show()};next.onclick=()=>{page++;show()};show();
}
function compactSettings(){const bindings=$('modal').querySelector('.comfort-settings details');if(bindings){bindings.open=true;bindings.querySelector('summary').hidden=true}menuTabs([['操作',menuNodes('.help-steps,.settings-note')],['音・演出',menuNodes('.setting-row,.motion-option')],['細かい設定',[...menuNodes('.comfort-grid'),resetSettingsButton()]],['キー割当',[bindings]]]);$('modal').querySelector('.comfort-settings')?.remove()}
// On very short displays, paginate the visible blocks instead of clipping or scrolling.
function fitMenuPages(){
 const modal=$('modal');if($('overlay').hidden)return;if(modal.matches('.growth-modal,.inherit-modal,.embark-modal,.emporium-modal,.pause-modal,.settings-modal,.clear-result,.mission-modal,.mission-receipt-modal,.atlas-modal,.eternal-shop-modal'))return;modal.querySelector('.overflow-pager')?.remove();for(const n of modal.children)n.classList.remove('overflow-page');
 const limit=innerHeight-28,style=getComputedStyle(modal),padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+4;
 if(modal.scrollHeight<=limit)return;
 const nodes=[...modal.children].filter(n=>getComputedStyle(n).display!=='none'),pages=[[]];let used=0;const budget=limit-padding-62;
 for(const n of nodes){const s=getComputedStyle(n),height=n.getBoundingClientRect().height+parseFloat(s.marginTop)+parseFloat(s.marginBottom);if(used+height>budget&&pages.at(-1).length){pages.push([]);used=0}pages.at(-1).push(n);used+=height}
 if(pages.length<2)return;let index=0;const nav=document.createElement('div');nav.className='menu-tabs overflow-pager';nav.innerHTML='<button type="button">← 前の画面</button><span></span><button type="button">続き →</button>';modal.append(nav);
 function show(){pages.forEach((list,i)=>list.forEach(n=>n.classList.toggle('overflow-page',i!==index)));nav.children[0].disabled=index===0;nav.children[1].textContent=(index+1)+'/'+pages.length;nav.children[2].disabled=index===pages.length-1;modal.scrollTop=0}
 nav.children[0].onclick=()=>{index--;show()};nav.children[2].onclick=()=>{index++;show()};show();
}
window.addEventListener('resize',()=>requestAnimationFrame(fitMenuPages));
