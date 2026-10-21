// Rewards and their receipt live in the same campaign snapshot. IDs are save contracts.
function missionCatalog(){
 const quests=REGIONS.flatMap((r,i)=>[
  {id:'clear-'+i,title:r.name+'を踏破',region:i,rank:'D',icon:r.icon,gold:100},
  {id:'rank-a-'+i,title:r.name+'の熟練者',region:i,rank:'A',icon:'✧',gold:80},
  {id:'rank-s-'+i,title:r.name+'の覇者',region:i,rank:'S',icon:'♛',gold:120}
 ]);
 return [...quests,
  {id:'demon-legacy',title:'冥王の遺産',region:4,rank:'D',icon:'☾',gold:250,skill:'nova',weapon:'abyss',detail:'ダーククラッシュを永久解放。冥王の黒刃がよろずやに入荷。'},
  {id:'dawn-reforged',title:'黎明、再鍛',region:4,rank:'D',icon:'☀',gold:250,upgrade:true,detail:'黎明の大剣・改を解放。威力と射程の封印が解ける。'},
  {id:'heaven-steel',title:'神を穿つ鋼',region:5,rank:'D',icon:'✦',gold:100,weapon:'starfall',detail:'天穿つ大剣がよろずやに入荷。'},
  {id:'holy-steel',title:'光を継ぐ剣',region:5,rank:'A',icon:'☼',gold:100,weapon:'dawn',detail:'黎明の聖剣がよろずやに入荷。'},
  {id:'slayer-300',title:'刃の旅路',stat:'kills',target:300,icon:'⚔',gold:100,hp:2},
  {id:'slayer-1200',title:'千の影を越えて',stat:'kills',target:1200,icon:'⚔',gold:150,hp:2},
  {id:'perfect-20',title:'見切りの心得',stat:'perfects',target:20,icon:'◇',gold:100,mp:1},
  {id:'arts-100',title:'剣と魔術の呼吸',stat:'skills',target:100,icon:'✴',gold:100,mp:1},
  {id:'shadow-heart',title:'影に呑まれぬ心',region:6,rank:'D',icon:'◈',gold:100,hp:2}
 ];
}
function normalizeMissions(c,raw){
 c.missionVersion=1;c.claimedMissions=[];c.shopUnlocks=[];c.missionStats={kills:0,perfects:0,skills:0};c.missionRuns={};
 if(!raw)return;
 const catalog=missionCatalog(),ids=new Set(catalog.map(m=>m.id));
 c.claimedMissions=[...new Set((Array.isArray(raw.claimedMissions)?raw.claimedMissions:[]).filter(id=>ids.has(id)))];
 c.shopUnlocks=[...new Set((Array.isArray(raw.shopUnlocks)?raw.shopUnlocks:[]).filter(id=>['abyss','starfall','dawn'].includes(id)))];
 for(const key of Object.keys(c.missionStats))c.missionStats[key]=finiteInt(raw.missionStats?.[key]);
 if(raw.missionRuns&&typeof raw.missionRuns==='object')for(const [id,v]of Object.entries(raw.missionRuns).slice(-64)){
  if(id.length>100||!v||typeof v!=='object')continue;c.missionRuns[id]=Object.fromEntries(Object.keys(c.missionStats).map(k=>[k,finiteInt(v[k])]));
 }
 // Players keep all stock previously available and every already-earned upgrade.
 if(raw.missionVersion!==1&&heavenUnlocked(c))c.shopUnlocks=['abyss','starfall','dawn'];
 for(const m of catalog)if(c.claimedMissions.includes(m.id))applyMissionUnlock(c,m);
}
function applyMissionUnlock(c,m){
 if(m.skill&&!c.rares.includes(m.skill))c.rares.push(m.skill);
 if(m.weapon&&!c.shopUnlocks.includes(m.weapon))c.shopUnlocks.push(m.weapon);
 if(m.upgrade){c.dawnUpgrade=true;if(!c.rares.includes('dawn'))c.rares.push('dawn')}
}
function missionBonuses(c=campaign){return missionCatalog().filter(m=>c.claimedMissions.includes(m.id)).reduce((b,m)=>({hp:b.hp+(m.hp||0),mp:b.mp+(m.mp||0)}),{hp:0,mp:0})}
function recordMissionRun(c){
 const id=game.attemptId;if(!id)return;const prior=c.missionRuns[id]||{};
 const now={kills:game.kills||0,perfects:game.perfects||0,skills:game.skillUses||0};
 for(const key of Object.keys(now)){now[key]=finiteInt(now[key]);c.missionStats[key]+=Math.max(0,now[key]-(prior[key]||0));now[key]=Math.max(now[key],prior[key]||0)}
 c.missionRuns[id]=now;const ids=Object.keys(c.missionRuns);if(ids.length>64)delete c.missionRuns[ids[0]];
}
function missionComplete(m,c=campaign){return m.stat?(c.missionStats[m.stat]||0)>=m.target:!!c.clears[m.region]&&'SABCD'.indexOf(c.clears[m.region].rank)<='SABCD'.indexOf(m.rank)}
function missionClaimable(c=campaign){return missionCatalog().filter(m=>!c.claimedMissions.includes(m.id)&&missionComplete(m,c))}
function missionCondition(m){return m.stat?({kills:'累計撃破',perfects:'累計ジャスト回避',skills:'手動技の累計発動'})[m.stat]+' '+m.target+'回':REGIONS[m.region].name+'を'+(m.rank==='D'?'クリア':m.rank==='A'?'Aランク以上でクリア':'Sランクでクリア')}
function missionReward(m){return [m.gold+' G',m.hp?'永続HP ＋'+m.hp:'',m.mp?'永続MP ＋'+m.mp:'',m.upgrade?'技を強化':'',m.skill?'技を解放':'',m.weapon?'武器が入荷':''].filter(Boolean).join(' · ')}
function claimMission(id){
 if(game.mode!=='missions')return false;refreshCampaign();const m=missionCatalog().find(q=>q.id===id);
 if(!m||campaign.claimedMissions.includes(id)||!missionComplete(m))return false;
 const n=cloneCampaign();n.claimedMissions.push(id);n.wallet+=m.gold;applyMissionUnlock(n,m);n.revision=(campaign.revision||0)+1;
 try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(n));storageAvailable=true}catch{storageAvailable=false;announce('保存できませんでした。空き容量をご確認のうえ、もう一度受け取ってください。');openMissions('ready',id);return false}
 campaign=n;playCue('purchase');acquisitionToast(m.title+' · '+missionReward(m),'#ffdfa3');openMissions('ready',id);return true;
}
function openMissions(tab='ready',selection=null){
 refreshCampaign();game.mode='missions';game.active=false;const all=missionCatalog(),ready=missionClaimable(),claimed=campaign.claimedMissions;
 const list=all.filter(m=>tab==='claimed'?claimed.includes(m.id):tab==='progress'?!claimed.includes(m.id)&&!missionComplete(m):missionComplete(m)&&!claimed.includes(m.id));
 const chosen=list.find(m=>m.id===selection)||list[0],bonus=missionBonuses();
 openModal(`<div class="mission-heading"><div><div class="eyebrow">ADVENTURER'S GUILD</div><h2>ミッション</h2></div><b>${campaign.wallet.toLocaleString('ja-JP')} <small>G</small></b></div><div class="mission-tabs" role="group" aria-label="ミッションの絞り込み">${[['ready','受取可能 '+ready.length],['progress','挑戦中'],['claimed','受取済み '+claimed.length]].map(([id,label])=>`<button data-mission-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div><div class="mission-body"><div class="mission-list" aria-label="ミッション一覧">${list.length?list.map(m=>`<button data-mission="${m.id}" aria-pressed="${chosen?.id===m.id}" class="mission-item ${claimed.includes(m.id)?'claimed':''}"><i>${m.icon}</i><span><b>${m.title}</b><small>${missionReward(m)}</small></span><em>${claimed.includes(m.id)?'受取済':'ready'===tab?'達成！':'挑戦中'}</em></button>`).join(''):'<div class="mission-empty"><b>✧</b><strong>'+(tab==='ready'?'報酬はすべて受取済み':tab==='claimed'?'最初の実績を刻もう':'すべてのミッションを達成！')+'</strong><p>新たな舞台へ、次の一歩を。</p></div>'}</div><div class="mission-detail">${chosen?`<span class="mission-seal">${chosen.icon}</span><small>${claimed.includes(chosen.id)?'REWARD RECEIVED':missionComplete(chosen)?'MISSION COMPLETE':'YOUR NEXT CHALLENGE'}</small><h3>${chosen.title}</h3><p>${missionCondition(chosen)}</p>${chosen.stat?`<div class="mission-meter"><i style="width:${Math.min(100,campaign.missionStats[chosen.stat]/chosen.target*100)}%"></i></div><b>${Math.min(chosen.target,campaign.missionStats[chosen.stat])} / ${chosen.target}</b>`:''}<div class="mission-reward"><b>${missionReward(chosen)}</b>${chosen.detail?'<p>'+chosen.detail+'</p>':''}</div>`:'<span class="mission-seal">♜</span><h3>冒険の記録が、力になる</h3><p>達成したミッションから<br>報酬を受け取れます。</p>'}</div></div><div class="mission-footer"><button id="missionBack">‹ 地図へ</button><small>永続強化 HP＋${bonus.hp} · MP＋${bonus.mp}</small><button id="missionClaim" class="cta" ${!chosen||claimed.includes(chosen.id)||!missionComplete(chosen)?'disabled':''}>${chosen&&claimed.includes(chosen.id)?'受取済み':'報酬を受け取る'}</button></div>`);
 $('modal').classList.add('mission-modal');document.querySelectorAll('[data-mission-tab]').forEach(b=>b.onclick=()=>openMissions(b.dataset.missionTab));document.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{const top=$('modal').querySelector('.mission-list').scrollTop;openMissions(tab,b.dataset.mission);$('modal').querySelector('.mission-list').scrollTop=top});$('missionBack').onclick=openStageSelect;$('missionClaim').onclick=()=>claimMission(chosen?.id);
}
function addMissionHub(){
 const shop=$('weaponShop');if(!shop)return;const ready=missionClaimable().length,button=document.createElement('button');button.id='missionHub';button.className='map-missions';button.innerHTML='<i>✧</i><span><b>ミッション</b><small>'+(ready?'報酬を受け取れます':'冒険の実績と解放報酬')+'</small></span><em>'+(ready||'›')+'</em>';button.onclick=()=>openMissions(ready?'ready':'progress');
 const hub=document.createElement('div');hub.className='map-hub';shop.before(hub);hub.append(shop,button);const map=$('modal').querySelector('.world-map');map?.classList.add('atlas-living');
 const svg=map?.querySelector('svg');if(svg)svg.insertAdjacentHTML('beforeend',`<g class="atlas-wind" fill="none" stroke="#d4f1db55" stroke-width="2"><path d="M30 290Q120 180 255 235T650 180"/><path d="M60 165Q200 75 360 130T670 80"/></g><g class="atlas-ship" fill="#ead1a0" stroke="#243c52" stroke-width="2"><path d="M344 259L377 263L369 274L351 272Z"/><path d="M358 259V228L377 254Z" fill="#f6e7c4"/><path d="M355 232L342 253H355Z" fill="#c79f69"/></g><g class="atlas-beacon" fill="none" stroke="#fff2b2" opacity=".6"><ellipse cx="565" cy="45" rx="42" ry="14"/><path d="M565 3V22M565 66V82M519 45H532M599 45H613"/></g>`);

}
