// Endgame presentation and explicit, atomic shop transactions.
Object.assign(WEAPON_ROLES,{origin:'循環・始まりの剣',ancient:'長大・重い剣閃'});
Object.assign(SKILL_SUMMARIES,{laststand:'HPが少ないほど強い一閃',bloodpact:'HPを支払い、重い斬撃を放つ'});
Object.assign(SIGNATURE_CHARGES,{laststand:.28,bloodpact:.3});
Object.assign(ART_MOTIONS,{laststand:'last-stand',bloodpact:'blood-pact'});
Object.assign(COMBAT_SOUNDS,{laststand:[900,240,.45,'triangle',.6,3200,.06],bloodpact:[170,55,.5,'sawtooth',.7,1500,.065],warped:[2100,90,.9,'sawtooth',.7,5000,.075]});
function bossCommitmentPending(e){return warnings.some(w=>w.owner===e.id&&w.life>0)||hostileShots.some(w=>w.owner===e.id&&w.life>0)||hazards.some(w=>w.owner===e.id&&w.life>0)||!!e.attackSequence||!!e.demonRush||game.pendingHit?.warning?.owner===e.id}
function configureEndgameBoss(e,index){
 const source=endgameBossRegion();e.archetypeRegion=source;
 if(game.region<TEMPLE&&game.region!==WASTELAND)return;
 e.name=REGIONS[source].boss;e.form=['beast','monster','dragon','sentinel','demon','god','demon','sentinel'][source];e.shadowLord=source===6;e.ancientWarden=source===7;
 if(source===3){e.name=index?'月影の守護獣':'星核の守護者';e.form=index?'beast':'sentinel';e.r=38}
 if(isTemple()){const multiplier=(1.4+Math.min(.2,(campaign.clears[TEMPLE]?.visits||0)*.02))*(source<=4?1.35:1);e.hp=e.maxHp=Math.round(REGIONS[source].hp*multiplier*(source===3?.58:1));e.speed*=1.12;}
 e.atk=(source===4?56:source===5?54:source===6?62:source===7?60:22+source*5)*(isTemple()?1.22:1);e.r=e.form==='god'?56:e.ancientWarden?52:e.r;e.awakened=false;e.cycle='assault';e.cycleTime=8;
 if(e.form==='god'){e.ward=1;e.godCycle=0;e.cycleTime=3.3;e.godAttack=1.2}Object.assign(e,safePoint(e.x,e.y,e.r));
}
function updateBonusBossArt(e,dt){
 if(e.state==='revive'||e.state==='recover'||e.exposed>0||e.catastrophe||e.royalTransit||e.shadowTransit||e.demonRush||e.cycleTime<=0)return false;
 e.bonusArtClock=(e.bonusArtClock??9)-dt;if(e.bonusArtClock>0||bossCommitmentPending(e))return false;e.bonusArtClock=isTemple()?12:17;
 const point={x:p.x,y:p.y},damage=Math.round(e.atk*1.3);let name;
 if(e.shadowLord){name='葬影の鎌輪';personaWarning(e,'ring',point.x,point.y,1.65,{r:440,inner:100,atk:damage,move:'umbraWheel',persist:.8})}
 else if(e.ancientWarden){name='始祖・剣塚崩し';for(let i=0;i<5;i++)epicWarning(e,'circle',clamp(point.x+(i-2)*110,battleBounds().left+50,battleBounds().right-50),point.y+(i%2?90:-60),100,1.25+i*.22,{atk:damage,style:'ancient',persist:.65,extraArt:true})}
 else if(e.form==='beast'){name='翠角・大地縫い';for(let i=0;i<3;i++)epicWarning(e,'circle',point.x+(i-1)*120,point.y,95,1.2+i*.25,{atk:damage,style:'roots',extraArt:true})}
 else if(e.form==='monster'){name='蒼潮・逆巻く奔流';const n=norm(p.x-e.x,p.y-e.y);for(const [i,a]of [-.5,.5].entries())epicWarning(e,'fan',e.x,e.y,0,1.5+i*.35,{dir:{x:Math.cos(Math.atan2(n.y,n.x)+a),y:Math.sin(Math.atan2(n.y,n.x)+a)},length:700,spread:.7,atk:damage,style:'tide',extraArt:true})}
 else if(e.form==='dragon'){name='熔翼・灼天崩落';const q=randomRefuge();epicWarning(e,'ring',q.x,q.y,arenaCoverRadius(q),2.65,{inner:125,atk:damage,persist:.8,style:'firestorm',extraArt:true})}
 else if(e.form==='sentinel'){name='星核・三極光';const r=arenaCoverRadius(point);for(let i=0;i<3;i++){const a=i*Math.PI/3,n={x:Math.cos(a),y:Math.sin(a)};epicWarning(e,'line',point.x-n.x*r,point.y-n.y*r,0,1.4+i*.28,{dir:n,length:r*2,width:85,atk:damage,style:'crystal',extraArt:true})}}
 else if(e.form==='god'){name='星環の逆流';personaWarning(e,'ring',e.x,e.y,2.25,{r:arenaCoverRadius(e),inner:135,atk:damage,move:'stellarReversal',persist:.65,breakFirstWard:e.bossPhase!==2&&e.ward>0})}
 else{name='灰燼の踏み潰し';personaWarning(e,'circle',e.x,e.y,1.45,{r:245,atk:damage,move:'ashenCrown',persist:.8})}
 e.lastBonusArt=name;banner(name,e.form==='dragon'||e.form==='god'||e.shadowLord?'光る内側へ、または発動に合わせて回避':'予兆を見切り、発動後に反撃',1.1);return true;
}
function moveAncientWarden(e,dt,casting=false){
 const d=distance(e,p),n=norm(p.x-e.x,p.y-e.y);e.wardenMoveClock=(e.wardenMoveClock||0)-dt;e.wardenBurst=Math.max(0,(e.wardenBurst||0)-dt);
 if(e.wardenMoveClock<=0){e.wardenMoveClock=e.bossPhase===2?.38:.52;e.wardenSide=-(e.wardenSide||1);e.wardenBurst=d>125?(e.bossPhase===2?.22:.18):.1;const toward=d>340?1:d<135?-.65:.32,side=d>340?.24:1;e.wardenDirection=norm(n.x*toward-n.y*side*e.wardenSide,n.y*toward+n.x*side*e.wardenSide)}
 const q=e.wardenDirection||n,speed=(e.wardenBurst>0?(e.bossPhase===2?1150:900):(e.bossPhase===2?650:500))*(casting?.8:1),before={x:e.x,y:e.y};moveActor(e,q.x*speed*dt,q.y*speed*dt);
 if(distance(before,e)<speed*dt*.25)e.wardenMoveClock=0;e.wardenDust=(e.wardenDust||0)-dt;if(e.wardenDust<=0&&distance(before,e)>1){e.wardenDust=.09;particle(e.x,e.y+8,'#c4b08b',3,80);effects.push({kind:'burst',x:e.x,y:e.y+10,r:e.wardenBurst>0?42:24,color:'#d9c59b',life:.22,max:.22})}
}
function updateAncientWarden(e,dt){
 if(!e.ancientWarden)return false;e.demonCast=Math.max(0,(e.demonCast||0)-dt);if(e.state==='recover'){e.timer-=dt;e.exposed=Math.max(0,e.timer);if(e.timer<=0)e.state='chase';return true}
 const pending=bossCommitmentPending(e);moveAncientWarden(e,dt,pending);if(pending)return true;e.ancientClock=(e.ancientClock??.35)-dt;
 if(e.ancientClock<=0){e.ancientClock=e.bossPhase===2?.18:.32;const n=norm(p.x-e.x,p.y-e.y),pattern=(e.ancientPattern||0)%(e.bossPhase===2?6:4),pace=e.bossPhase===2?.78:1;const strike=(kind,x,y,r,time,extra)=>epicWarning(e,kind,x,y,r,time*pace,extra);e.ancientPattern=(e.ancientPattern||0)+1;e.lastWardenArt=pattern;e.state='windup';
  if(pattern===0){for(const [i,a]of [-.3,.3].entries()){const angle=Math.atan2(n.y,n.x)+a;strike('fan',e.x,e.y,0,.75+i*.2,{dir:{x:Math.cos(angle),y:Math.sin(angle)},length:620,spread:.85,atk:e.atk,style:'ancient',swift:true})}}
  else if(pattern===1){const r=arenaCoverRadius(p);for(const [i,a]of [Math.PI/4,-Math.PI/4].entries()){const d={x:Math.cos(a),y:Math.sin(a)};strike('line',p.x-d.x*r,p.y-d.y*r,0,.85+i*.18,{dir:d,length:r*2,width:135,atk:e.atk*1.1,style:'ancient',swift:true})}}
  else if(pattern===2){for(let i=0;i<4;i++)strike('circle',p.x+(i-1.5)*85,p.y+(i%2?65:-45),112,.7+i*.16,{follow:i===0,lockTime:.3,atk:e.atk,style:'ancient',swift:true})}
  else if(pattern===3){const q=randomRefuge();strike('ring',q.x,q.y,arenaCoverRadius(q),2,{inner:125,atk:e.atk*1.45,persist:.55,style:'ancient'})}
  else if(pattern===4){strike('circle',e.x,e.y,285,.65,{atk:e.atk*1.1,style:'ancient',swift:true});strike('line',e.x,e.y,0,.9,{dir:n,length:arenaCoverRadius(e),width:155,atk:e.atk*1.2,style:'ancient'})}
  else{for(let i=0;i<5;i++){const a=i*Math.PI*2/5;strike('line',e.x+Math.cos(a)*180,e.y+Math.sin(a)*180,0,.7+i*.12,{dir:{x:-Math.cos(a),y:-Math.sin(a)},length:720,width:95,atk:e.atk,style:'ancient',swift:true})}}combatSound(pattern===3?'stone-break':'demon-blade',e.x);return true;
 }return true;
}
function releaseWarpedFlash(){
 const target=enemies.find(e=>e.id===p.ultimateTarget&&e.hp>0);p.ultimateTarget=null;if(!target)return;const from={x:p.x,y:p.y},base=Math.atan2(target.y-p.y,target.x-p.x),length=Math.max(1100,distance(from,target)+300),power=(getUltimateArt('warped').damage+70*forgedPassiveRank('ultimatePower'))*p.power*(1+.08*(game.forgeUltimate||0));
 for(const e of enemies)if(e.hp>0){const n=norm(e.x-p.x,e.y-p.y),angle=Math.atan2(n.y,n.x);if(e===target||Math.abs(Math.atan2(Math.sin(angle-base),Math.cos(angle-base)))<.9)hurtEnemy(e,power*(e===target?1:.65),true,'#e5c6ff',true,false,false,'lightning')}
 effects.push({kind:'warpedFlash',x:p.x,y:p.y,angle:base,length,life:1.05,max:1.05});p.invuln=Math.max(p.invuln,.8);combatSound('warped',p.x);floating(target.x,target.y-90,'いびつな閃光','#f2d2ff',true);
}
function drawWarpedFlash(e,a){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);for(const [i,angle]of [-.55,0,.55].entries()){ctx.save();ctx.rotate(angle);for(const [width,color]of [[22,'#24163e'],[11,'#be8fe7'],[3,'#fff1d3']]){ctx.strokeStyle=color;ctx.lineWidth=width*a;ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(e.length*.35,(i-1)*90);ctx.lineTo(e.length*.63,-(i-1)*70);ctx.lineTo(e.length,0);ctx.stroke()}ctx.restore()}ctx.restore()}
function drawEternalWarden(e,t){
 const enraged=e.bossPhase===2,casting=e.demonCast>0,bob=Math.sin(t*2.4)*5,core=enraged?'#ff975c':'#bce5cf',bone=e.flash>0?'#fff9e6':'#c5b999',iron='#323d43';ctx.save();ctx.translate(0,-30+bob);
 // A suspended royal skeleton: segmented spine, stone ribs, an antler mask and paired sickles.
 for(let i=0;i<5;i++){const yy=40+i*18,w=24-i*3;path([[-w,yy],[0,yy-7],[w,yy],[w-4,yy+10],[0,yy+16],[-w+4,yy+10]],iron,'#9f947c')}
 path([[-22,-65],[-51,-42],[-63,4],[-36,36],[0,45],[36,36],[63,4],[51,-42],[22,-65]],'#202e34','#a99778');
 for(const side of [-1,1]){for(let rib=0;rib<4;rib++){const yy=-35+rib*17;path([[side*9,yy-4],[side*(42+rib*2),yy-15],[side*(48+rib*2),yy-6],[side*16,yy+8]],bone,'#655f51')}
  const sway=Math.sin(t*2+side)*5,raise=casting?-26:0;path([[side*47,-44],[side*80,-61],[side*99,-36],[side*79,-15],[side*55,-22]],iron,'#bbad8e');ctx.strokeStyle=bone;ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(side*82,-23);ctx.lineTo(side*(101+sway),28+raise);ctx.stroke();
  ctx.save();ctx.translate(side*(104+sway),30+raise);ctx.scale(side,1);ctx.rotate(casting?-.75:.15);path([[-5,27],[-4,-62],[5,-67],[7,25]],'#5c4b40','#d1bc8c');path([[0,-66],[27,-105],[53,-103],[66,-73],[60,-35],[39,-8],[49,-50],[39,-75],[20,-78]],bone,'#eee1b6');ctx.strokeStyle=core;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(15,-70);ctx.bezierCurveTo(63,-108,69,-40,42,-18);ctx.stroke();ctx.restore();
  path([[side*22,-73],[side*43,-98],[side*47,-136],[side*36,-123],[side*25,-95]],bone,'#71654e');}
 path([[-26,-94],[-18,-115],[0,-122],[18,-115],[26,-94],[18,-65],[0,-51],[-18,-65]],bone,'#f1deb1');path([[-19,-91],[0,-101],[19,-91],[11,-76],[0,-68],[-11,-76]],'#15272d');ellipse(0,-87,13,7,core);ellipse(0,-87,3,7,'#163344');path([[-12,-60],[0,-67],[12,-60],[8,-49],[-8,-49]],'#7b7768','#d5c6a1');
 ellipse(0,-2,13,26,core);ctx.strokeStyle=core;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,1,29+i*13,45+i*9,Math.sin(t*.5)*.1,-.8,Math.PI*1.7);ctx.stroke()}if(enraged){ctx.globalAlpha=.45;for(let i=0;i<4;i++){const a=t*.45+i*Math.PI/2;ctx.save();ctx.translate(Math.cos(a)*125,Math.sin(a)*48);ctx.rotate(a);path([[-4,-25],[0,-55],[6,-27],[3,24],[-3,24]],bone,core);ctx.restore()}}ctx.restore();
}
function drawEternalScenery(t){
 if(!game.singleStage||game.region<7||isMine())return;const b=worldBounds(),y=STAGES[game.stage].y;ctx.save();
 if(game.region===WASTELAND){ctx.fillStyle='#b48f5924';ctx.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);for(let i=0;i<18;i++){const x=95+(i*173)%610,yy=y-250+(i*137)%650;ctx.strokeStyle='#a69573';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+8,yy-24);ctx.lineTo(x+3,yy-42);ctx.moveTo(x+1,yy-15);ctx.lineTo(x-10,yy-27);ctx.stroke();ellipse(x+4,yy+3,17,6,'#584c483b')}for(const x of [85,675]){path([[x-18,y-100],[x-14,y-270],[x+15,y-235],[x+19,y-95]],'#6d6258','#b7a482')}}
 else{const cx=680;ctx.strokeStyle='#e4e0b43b';ctx.lineWidth=3;for(const r of [150,230,320]){ctx.beginPath();ctx.ellipse(cx,y+30,r,r*.8,0,0,Math.PI*2);ctx.stroke()}for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*285,y+30+Math.sin(a)*228);ctx.lineTo(cx+Math.cos(a)*310,y+30+Math.sin(a)*248);ctx.stroke()}ctx.save();ctx.translate(cx,y+30);ctx.rotate(t*.04);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-225);ctx.moveTo(0,0);ctx.lineTo(145,35);ctx.stroke();ctx.restore()}
 ctx.restore();
}
function eternalRegionArtwork(i){const temple=i===8,c=temple?'#c0e2d6':'#e9c28c';return `<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><path d="M0 0H200V120H0Z" fill="${temple?'#293c4b':'#6c5847'}"/><circle cx="100" cy="42" r="29" fill="none" stroke="${c}" stroke-width="3" opacity=".7"/>${temple?'<path d="M28 53L100 20L172 53ZM40 58V115M68 58V115M132 58V115M160 58V115" fill="#717f7b" stroke="#dce4c1" stroke-width="7"/><path d="M100 28V49L115 58" fill="none" stroke="#fff0bd" stroke-width="3"/>':'<path d="M0 100Q40 64 78 99T200 82V120H0Z" fill="#a08a61"/><path d="M18 102V48L35 35L38 100M153 110L158 55L176 47L182 108" fill="#463e3d" stroke="#c4ae85"/><path d="M92 110L96 72L103 50L110 72L108 111M83 106H120" fill="#d4c6a1" stroke="#ffde9c"/>'}</svg>`}
function eternalSkillArtwork(s){const blood=s.id==='bloodpact',c=blood?'#ed8eae':'#9edfff',blade=blood?'#f0bbc8':'#d8f4ff';const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><defs><radialGradient id="g"><stop stop-color="${blood?'#78384d':'#31517b'}"/><stop offset="1" stop-color="#10172c"/></radialGradient></defs><path d="M0 0H300V200H0Z" fill="url(#g)"/><g fill="none" stroke="${c}"><circle cx="155" cy="100" r="73" opacity=".4"/><circle cx="155" cy="100" r="88" opacity=".2"/><path d="M20 160Q110 40 280 45M35 180Q130 90 278 78" stroke-width="7" opacity=".6"/></g><g transform="rotate(32 150 100)"><path d="M139 139L139 38L150 13L161 38V139Z" fill="${blade}" stroke="#fff5db" stroke-width="3"/><path d="M150 36V124" stroke="${c}" stroke-width="3"/><path d="M120 138L133 128L150 134L167 128L180 138L150 145Z" fill="#ac8c5d" stroke="#eedaa8" stroke-width="2"/><path d="M145 146H155V180H145Z" fill="#362b41" stroke="#ddb995"/></g>${blood?'<path d="M80 53C71 69 67 76 67 82A13 13 0 0093 82C93 75 87 67 80 53Z" fill="#f3aac2"/>':'<path d="M226 45L210 91L227 79L210 128L249 70L231 76Z" fill="#c4edff"/>'}</svg>`;return '<span class="skill-art skill-illustration eternal-skill-art" data-art-key="'+s.id+'" style="background-image:url(&quot;data:image/svg+xml,'+encodeURIComponent(svg)+'&quot;)" aria-hidden="true"></span>'}
function newStageRewards(region){return region===6?'影渡りのお守りの購入権':region===7?'始祖の剣・いにしえの大太刀・いびつな閃光・始原の火守りの購入権':region===8?'時守りのお守りの購入権':''}
function addEternalResult(result,first=false){
 const target=result.awardedStones??Math.max(0,(result.stones||0)-(campaign.craftRuns[result.attemptId]||0)),block=document.createElement('div');block.className='eternal-result';block.innerHTML='<b>技巧石 ＋'+target+'</b><span>鍛錬場で剣・必殺技・継承技を＋強化</span>'+(first&&newStageRewards(result.stage)?'<small>'+newStageRewards(result.stage)+'</small>':'');$('modal').querySelector('.result-summary')?.after(block);
}
function forgeItems(type){return type==='weapon'?WEAPONS.filter(w=>campaign.weapons.includes(w.id)):type==='ultimate'?ultimateArts().filter(a=>campaign.ultimates.includes(a.id)):campaign.rares.map(getSkill).filter(Boolean)}
function forgeCaption(type,id,level){return trainingMetrics(type,id,level).filter(m=>m.up).map(m=>m.label+' '+m.value+m.unit).join('／')}
function buyForgeUpgrade(type,id){
 refreshCampaign();if(game.mode!=='training'||!['weapon','ultimate','skill'].includes(type)||!forgeItems(type).some(x=>x.id===id))return false;const level=forgeLevel(type,id);if(level>=FORGE_MAX)return false;const cost=forgeCost(type,level,id);if(campaign.craftStones<cost)return false;const n=cloneCampaign();n.craftStones-=cost;n.forge[type][id]=level+1;saveCampaign(n);playCue('purchase');openForgeStore(type,id);return true;
}
function openForgeStore(type='weapon',selection=null){return openTraining(type,selection)}
function charmArtwork(c){
 const motif={life:'<path d="M80 110C29 80 49 49 67 59L80 71L93 59C111 49 131 80 80 110Z"/>',mana:'<path d="M80 49C62 75 54 84 58 96A24 24 0 00102 96C106 84 98 75 80 49Z"/>',ward:'<path d="M80 51L105 61V82Q103 103 80 115Q57 103 55 82V61Z"/><path d="M66 80L77 91L96 69" fill="none" stroke="#203a42" stroke-width="5"/>',stone:'<path d="M55 65L79 51L104 64L109 96L82 114L52 97ZM55 65L82 79L104 64M82 79V114"/>',flame:'<path d="M81 48C98 76 100 66 103 84C114 114 57 127 56 94C55 81 67 72 67 61L77 80Z"/>',time:'<path d="M57 53H103M57 113H103M63 53Q61 74 80 83Q99 92 97 113M97 53Q99 74 80 83Q61 92 63 113" fill="none" stroke-width="5"/>'}[c.motif];
 return '<svg viewBox="0 0 160 160" aria-hidden="true"><path d="M0 0H160V160H0Z" fill="#152c3c"/><circle cx="80" cy="85" r="61" fill="none" stroke="'+c.color+'" opacity=".2"/><path d="M62 27Q80 2 98 27L88 39M62 27L72 39" fill="none" stroke="#cfb47d" stroke-width="4"/><path d="M80 30L119 52L123 112L80 140L37 112L41 52Z" fill="#273d47" stroke="#e6c689" stroke-width="3"/><path d="M80 39L111 57L114 107L80 130L46 107L49 57Z" fill="none" stroke="'+c.color+'" opacity=".5"/><g fill="'+c.color+'" stroke="'+c.color+'" stroke-width="2">'+motif+'</g></svg>';
}
function openCharmStore(selection=null){return openStorefront('charms',typeof selection==='string'?selection:null,storeReturn)}
function addEndgamePreparation(index){
 const equipped=$('modal').querySelector('.embark-kit');if(equipped){const blade=forgeLevel('weapon',campaign.weapon),art=forgeLevel('ultimate',campaign.ultimate);if(blade)equipped.querySelector('.kit-weapon strong').textContent+=' ＋'+blade;if(art)equipped.querySelector('.kit-ultimate b').textContent+=' ＋'+art;addCharmPreparation(equipped,index)}
 const footer=$('modal').querySelector('.embark-footer');if(footer){const train=document.createElement('button');train.id='prepTraining';train.className='prep-missions';train.innerHTML='<i>'+trainingSymbol()+'</i><span><b>鍛錬場</b><small>装備・永続強化</small></span>';train.onclick=()=>openTraining();footer.insertBefore(train,$('prepMissions')||$('startStageButton'));footer.classList.add('with-training')}
 const rules=$('modal').querySelector('.embark-kit');if(index===TEMPLE&&rules){const note=document.createElement('p');note.className='temple-rule';note.textContent='最高難度：最初に6回の技選択。8区画すべて決闘。中断・ボス再挑戦・ページを閉じての再開はできません。';rules.append(note)}
}
