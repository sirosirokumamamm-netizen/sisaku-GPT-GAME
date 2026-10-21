// Shared campaign affordances: the displayed action always matches the allowed action.
function combatActionsAvailable(){return !game.bossScene&&game.mode==='play'&&game.active&&['combat','waveBreak'].includes(game.phase)}
function difficultyStars(index){return index===6?'<em class="shadow-stars">★★★★★★★</em>':index===5?'<em class="heaven-stars">★★★★★★</em>':index===4?'★★★★<em class="dark-star" aria-label="赤い星">★</em>':'★'.repeat(index+1)+'☆'.repeat(3-index)}
function recommendedSword(region=recommendedStage()){const ids=region===5?['abyss','greatsword']:region===6?['starfall','dawn','ember']:region===4?['dawn','echo']:region===3?['rapier']:region===2?['frostblade']:region===1?['echo']:['greatsword'];return ids.map(getWeapon).find(w=>availableWeapons().some(a=>a.id===w.id))||getWeapon('greatsword')}
function recoveryFeedback(hp,mp){
 effects.push({kind:'nova',x:p.x,y:p.y,r:100,color:'#aaffd6',life:.8,max:.8},{kind:'sigil',x:p.x,y:p.y,r:65,color:'#aaffd6',life:1.2,max:1.2});particle(p.x,p.y,'#aaffd6',28,150);floating(p.x,p.y-110,'HP +'+hp+' · MP +'+mp,'#c5ffe1',true);game.healGlow=1;tone(880,.22,'sine',.04);
}

function mapScenery(){return '<g opacity=".7">'+[[80,65],[105,83],[130,58],[205,330],[235,310],[615,280],[640,300],[590,312],[430,110],[455,90]].map(([x,y])=>'<path d="M'+(x-3)+' '+y+'v24" stroke="#92744d" stroke-width="5"/><path d="M'+(x-17)+' '+(y+10)+'l17 -35 l17 35Z" fill="#215a43" stroke="#76a26c" stroke-width="2"/>').join('')+'<path d="M304 164 l55 12 m-56 -5 l55 12 m-51 -18 l-3 20 m52 -12 l-3 22" stroke="#cfb788" stroke-width="5"/><path d="M470 348 l25 -45 l28 45Z" fill="#674d49"/><path d="M488 317 l7 -14 l9 15Z" fill="#deaf84"/></g>'}
