// Original vector artwork shares the illustrated cards' framing without extra downloads.
const WEAPON_ROLES={traveler:'基本・素直な間合い',rapier:'手数・風の連撃',greatsword:'超広範囲・重い歩み',ember:'炎上・継続ダメージ',frostblade:'減速・安全な間合い',echo:'連鎖・群れに強い',abyss:'衝撃波・闇の一撃',starfall:'長射程・対ボス',dawn:'回復・剣技の循環'};
function storeArtwork(w,sword,art){
 if(sword)return weaponArtwork(w);
 const color=w.color||'#f4d391',id=w.id;let drawing;
 if(art){drawing=`<path d="M42 38Q60 27 80 40Q100 27 118 38V132Q97 121 80 134Q61 121 42 132Z" fill="#543753" stroke="#edca7e" stroke-width="3"/><path d="M80 42V128M50 49L69 44M92 48L110 44M50 118L68 113M92 116L110 112" stroke="#dfb677"/>${id==='raika'?'<g fill="#b2eaff" stroke="#fff0c1">'+Array.from({length:5},(_,i)=>'<path d="M80 49L86 69L80 85L74 69Z" transform="rotate('+i*72+' 80 85)"/>').join('')+'</g>':id==='raigai'?'<path d="M80 47L90 77L84 112H76L70 77Z" fill="#d1b7ff" stroke="#fff0c1"/><path d="M65 108H95M80 113V124" stroke="#ffe1a1" stroke-width="4"/>':'<path d="M87 54L65 89H83L72 116L103 77H84Z" fill="#b6e5ff" stroke="#fff0c1"/>'}`;
 }else if(id==='carryExpansion'){drawing='<g fill="#294f62" stroke="#ffe0a0" stroke-width="3"><path d="M35 42H76V107H35Z" transform="rotate(-16 55 75)"/><path d="M66 35H112V114H66Z"/><path d="M93 55H131V123H93Z" transform="rotate(16 112 89)"/></g><path d="M82 55V94M63 75H103" stroke="#fff6cc" stroke-width="6"/>';
 }else drawing='<path d="M80 29L118 61L109 116L80 139L51 116L42 61Z" fill="#77602b" stroke="#ffe5a8" stroke-width="3"/><path d="M80 48L88 73L114 80L88 88L80 113L72 88L47 80L72 73Z" fill="#fff2a9"/><path d="M58 39Q80 12 102 39" fill="none" stroke="#edce8e" stroke-width="4"/>';
 return `<svg viewBox="0 0 160 160" role="presentation"><path d="M0 0H160V160H0Z" fill="#13253b"/><g fill="none" stroke="${color}"><circle cx="80" cy="80" r="60" opacity=".28"/><circle cx="80" cy="80" r="49" opacity=".16"/><path d="M11 132L143 17M27 151L156 37M10 50L50 10" opacity=".17"/></g><g fill="${color}" opacity=".7"><path d="M24 34l2 7 7 2-7 2-2 7-2-7-7-2 7-2Z"/><circle cx="132" cy="110" r="2"/><circle cx="118" cy="26" r="2"/></g>${drawing}<path d="M0 155Q80 117 160 155V160H0Z" fill="#081626" opacity=".5"/></svg>`;
}
function weaponComparison(w,current){
 return '<div class="weapon-role">'+WEAPON_ROLES[w.id]+'</div><dl class="weapon-comparison">'+[['attack','攻撃力'],['speed','速度'],['reach','間合い']].map(([key,label])=>{const scale=key==='attack'?1:100,delta=Math.round((w[key]-current[key])*scale),state=delta>0?'gain':delta<0?'loss':'equal';return `<div><dt>${label}</dt><dd>${Math.round(w[key]*scale)}${key==='attack'?'':'%'}<span class="stat-delta ${state}">${delta?(delta>0?'▲ +':'▼ ')+Math.abs(delta)+'pt':'＝ 同じ'}</span></dd></div>`}).join('')+'</dl>';
}
function regionArtwork(i){
 const colors=[['#224c47','#b4ed9b'],['#164054','#90e4f2'],['#4b293b','#ffbd76'],['#39493e','#d2c792'],['#2b2346','#daafff'],['#334b66','#fff0ba'],['#20242d','#dee4f1']],c=colors[i];
 const scenery=[
 '<path d="M0 80Q50 30 115 73T200 55V125H0Z" fill="#356447"/><g fill="#163e37" stroke="#79a87a"><path d="M12 89L35 20L57 89ZM66 94L94 13L120 94ZM132 86L156 25L182 86Z"/></g>',
 '<path d="M0 75Q70 106 200 47V120H0Z" fill="#377e8d"/><path d="M42 0L64 120M135 0L118 120" stroke="#81a29a" stroke-width="12"/><path d="M0 75H200M25 100H160" stroke="#b2e9e6" stroke-width="2" opacity=".7"/>',
 '<path d="M0 118L66 26L93 57L127 12L200 118Z" fill="#442e38" stroke="#ae7862"/><path d="M99 48L127 13L152 49L129 41L117 56Z" fill="#ffb775"/><path d="M127 47L141 68L130 86L156 120M65 54L52 83L62 120" fill="none" stroke="#e57e4d" stroke-width="4"/>',
 '<path d="M20 111L97 21L174 111Z" fill="#9a7c56" stroke="#dbc59a"/><path d="M35 94H159M49 78H146M63 62H132M77 46H118M97 21V112" stroke="#68583e"/><path d="M0 118L32 89L50 106L74 92L95 119M140 116L155 80L177 92L200 73V120Z" fill="#46734b"/><path d="M20 109V49H42V106M167 100V51H187V96" fill="#806048" stroke="#c2a181"/>',
 '<path d="M20 120V60H43V35H56V60H78V15H92V64H111V38H126V69H148V47H161V120Z" fill="#161b30" stroke="#765a95"/><path d="M79 120V86Q100 56 116 86V120" fill="#b485d0"/><path d="M0 20L57 32L23 56M200 23L157 37L184 64" fill="none" stroke="#a88cc6"/>',
 '<circle cx="100" cy="43" r="31" fill="none" stroke="#ffeaba" stroke-width="3"/><path d="M0 108Q20 79 65 101Q101 71 142 97Q183 73 200 102V120H0Z" fill="#a7c7d3"/><path d="M50 64L100 37L150 64ZM61 67V110M85 67V110M115 67V110M139 67V110" fill="#ecedce" stroke="#fff1bd" stroke-width="5"/>'
 ,'<path d="M0 110L35 58L53 86L75 29L100 74L131 13L169 79L200 55V120H0Z" fill="#373b45" stroke="#767b87"/><path d="M70 120V77L100 51L130 77V120M83 120V89H117V120" fill="#12161e" stroke="#a5aab6"/><circle cx="100" cy="32" r="20" fill="none" stroke="#dde1e8"/>'
 ][i];
 return `<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><path d="M0 0H200V120H0Z" fill="${c[0]}"/><circle cx="157" cy="25" r="17" fill="${c[1]}" opacity=".25"/>${scenery}<path d="M0 0H200V120H0Z" fill="none" stroke="${c[1]}" stroke-width="2" opacity=".3"/></svg>`;
}
function atlasDetails(){
 let shapes='<g fill="none" stroke="#d8c59a" opacity=".22">';for(let i=0;i<8;i++)shapes+=`<path d="M${15+i*5} ${80+i*18}Q${170+i*14} ${-10+i*22} ${325+i*29} ${50+i*25}T${680-i*3} ${100+i*32}"/>`;shapes+='</g>';
 shapes+='<g fill="#eee4b9" opacity=".6"><path d="M343 221l8-25 8 25-8-5Z"/><path d="M340 225Q351 234 362 225" fill="none" stroke="#eee4b9"/></g>';
 return shapes+mapScenery()+'<g fill="none" stroke="#cce3d8" stroke-width="1" opacity=".3"><path d="M10 290q15-7 30 0t30 0M595 365q18-7 36 0t36 0M5 40q20-6 40 0t40 0"/></g><g font-family="serif" fill="#fff0cb" opacity=".65" letter-spacing="4"><text x="350" y="29" text-anchor="middle" font-size="12">AZURE REALMS</text><text x="350" y="391" text-anchor="middle" font-size="9">剣と、まだ見ぬ世界へ</text></g>';
}
// A rolling frame interval estimate adapts cosmetic density only; combat stays unchanged.
const renderLoad={slow:false,last:0,total:0,count:0};
function sampleRenderLoad(now){
 if(renderLoad.last&&game.mode==='play'&&!document.hidden&&!game.bossScene){const interval=now-renderLoad.last;if(interval>0){renderLoad.total+=Math.min(interval,100);renderLoad.count++}if(renderLoad.count>=90){const average=renderLoad.total/renderLoad.count,wasSlow=renderLoad.slow;renderLoad.slow=renderLoad.slow?average>22:average>28;if(wasSlow!==renderLoad.slow)resize();renderLoad.total=0;renderLoad.count=0}}
 else{renderLoad.total=0;renderLoad.count=0}renderLoad.last=now;
}
// Accept a near miss up to 8 CSS px outside a visible control. The closest edge wins
// in gaps; direct button presses always win. Native pointer capture preserves multitouch.
function nearestTouchControl(x,y){
 const candidates=[$('movePad'),$('slash'),$('magic'),$('thunder'),$('roll'),$('ultimate'),$('combatPotion')];let best=null,score=Infinity;
 for(const node of candidates){if(node.disabled||node.classList.contains('empty')||!node.getClientRects().length||getComputedStyle(node).visibility==='hidden')continue;const r=node.getBoundingClientRect();if(!r.width||!r.height)continue;const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),distance=Math.hypot(dx,dy);if(distance<=8&&distance<score){score=distance;best=node}}
 return best;
}
function initTouchHitAreas(){
 document.addEventListener('pointerdown',e=>{
  if(!e.isTrusted||e.pointerType!=='touch'||game.mode!=='play'||game.bossScene||e.target.closest('button,#movePad,input,select,#touchEditor'))return;
  const button=nearestTouchControl(e.clientX,e.clientY);if(!button)return;e.preventDefault();e.stopImmediatePropagation();
  button.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary,clientX:e.clientX,clientY:e.clientY,buttons:e.buttons,button:e.button}));
 },{capture:true,passive:false});
 for(const id of ['slash','magic','thunder','roll','ultimate','combatPotion']){
  const button=$(id);button.addEventListener('pointerdown',()=>{if(!button.disabled&&game.mode==='play')button.classList.add('touch-pressed')});
 }
 const release=()=>document.querySelectorAll('.touch-pressed').forEach(b=>b.classList.remove('touch-pressed'));
 document.addEventListener('pointerup',release,true);document.addEventListener('pointercancel',release,true);window.addEventListener('blur',release);
}
function drawSkillCrown(e,a){
 ctx.translate(e.x,e.y);ctx.scale(1,.55);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=e.color;ctx.lineWidth=2*a+.5;
 const r=e.r*(1.3-a*.5);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<8;i++){const angle=i*Math.PI/4+(1-a)*.5;ctx.save();ctx.rotate(angle);ctx.beginPath();ctx.moveTo(r-4,0);ctx.lineTo(r+9*a,0);ctx.stroke();ctx.restore()}
}
