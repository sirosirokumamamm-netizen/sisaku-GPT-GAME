// Original layered scores: minor strings, bass, harmony and synthesized percussion.
// No samples or external downloads; bounded voices and one cached noise buffer.
const SCORE_THEMES={
 map:{bpm:88,base:146.83,scale:[0,2,3,5,7,9,10,12],lead:[0,2,4,7,6,4,2,1,0,2,4,6,5,4,1,2],chords:[0,-3,-5,-2]},
 shop:{bpm:96,base:164.81,scale:[0,2,4,5,7,9,11,12],lead:[0,4,5,4,2,4,1,2,0,4,7,5,4,2,1,4],chords:[0,-5,-3,-2]},
 rest:{bpm:76,base:146.83,scale:[0,2,3,5,7,8,10,12],lead:[0,-1,2,-1,4,-1,6,4,5,-1,4,2,1,-1,2,-1],chords:[0,-3,-5,-2]},
 grass:{bpm:116,base:146.83,scale:[0,2,3,5,7,9,10,12],lead:[0,4,2,4,6,4,7,6,4,2,3,5,4,2,1,2],chords:[0,-3,-5,-2]},
 water:{bpm:120,base:164.81,scale:[0,2,3,5,7,8,10,12],lead:[0,2,4,6,7,6,4,2,1,3,5,7,6,4,2,1],chords:[0,-5,-3,-2]},
 volcano:{bpm:134,base:130.81,scale:[0,1,3,5,7,8,10,12],lead:[0,0,4,2,1,4,0,6,7,4,2,1,0,4,6,1],chords:[0,-1,-5,-2]},
 ruins:{bpm:122,base:146.83,scale:[0,2,3,6,7,8,11,12],lead:[0,4,3,4,6,7,4,2,0,3,4,6,5,3,1,4],chords:[0,-3,-6,-2]},
 dark:{bpm:132,base:110,scale:[0,1,3,5,7,8,10,12],lead:[0,4,0,1,6,4,3,1,0,2,4,7,6,4,1,0],chords:[0,-1,-5,-2]},
 heaven:{bpm:126,base:196,scale:[0,2,4,6,7,9,11,12],lead:[0,4,6,7,3,4,7,6,0,3,4,7,6,4,3,1],chords:[0,-2,-5,-3]},
 boss:{bpm:140,base:146.83,scale:[0,2,3,5,7,8,10,12],lead:[0,0,4,2,1,4,5,4,0,2,4,6,5,4,3,1],chords:[0,-5,-3,-2]},
 demon:{bpm:144,base:110,scale:[0,1,3,5,7,8,11,12],lead:[0,1,4,3,0,2,5,4,1,0,3,4,6,5,4,1],chords:[0,-1,-5,-3]},
 god:{bpm:138,base:196,scale:[0,2,4,6,7,9,11,12],lead:[0,4,6,7,3,4,7,6,0,3,4,7,6,4,3,1],chords:[0,-2,-6,-3]},
 omen:{bpm:70,base:73.42,scale:[0,1,3,5,6,8,10,12],lead:[0,-1,1,-1,4,-1,3,-1,0,-1,2,-1,1,-1,0,-1],chords:[0,-1,-5,-2]},
 shadow:{bpm:128,base:98,scale:[0,1,3,5,6,8,11,12],lead:[0,3,1,4,0,5,3,1,6,4,3,0,1,3,6,4],chords:[0,-1,-6,-3]},
 victory:{bpm:108,base:196,scale:[0,2,4,5,7,9,11,12],lead:[0,2,4,7,4,5,6,7,4,2,5,7,6,5,4,7],chords:[0,-5,-3,-2]}
};
let musicVoices=0,drumNoise=null;
function musicSceneKey(){
 if(game.bossScene)return game.bossScene.kind==='defeat'?'victory':'omen';
 if(game.mode==='weaponShop')return 'shop';if(['stageSelect','preparation','start'].includes(game.mode))return 'map';
 if(['stageResult','chest'].includes(game.mode))return 'victory';
 if(game.mode==='play'&&game.active)return isBossStage()?(endgameBossRegion()===6?'shadow':endgameBossRegion()===5?'god':endgameBossRegion()===4?'demon':'boss'):['grass','water','volcano','ruins','dark','heaven','shadow','ruins','dark'][game.region||0];return 'rest';
}
function layeredScoreNote(f,d,type,volume,delay=0){
 if(!sounds||!audio||audio.state!=='running'||preferences.music<=0||musicVoices>=48||!Number.isFinite(f))return;
 const start=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain(),filter=audio.createBiquadFilter();musicVoices++;
 o.type=type;o.frequency.value=f;o.detune.value=type==='sawtooth'?-4:0;filter.type='lowpass';filter.frequency.value=type==='sawtooth'?1350:2800;filter.Q.value=.6;
 g.gain.setValueAtTime(.00001,start);g.gain.linearRampToValueAtTime(volume*preferences.music,start+(d>.8?.12:.012));g.gain.exponentialRampToValueAtTime(.00001,start+d);
 o.connect(filter);filter.connect(g);g.connect(audioBus||audio.destination);o.onended=()=>{musicVoices--;o.disconnect();filter.disconnect();g.disconnect()};o.start(start);o.stop(start+d+.02);
}
function scoreDrum(kind,volume){
 if(!audio||audio.state!=='running'||musicVoices>=48)return;
 const now=audio.currentTime,g=audio.createGain(),duration=kind==='hat'?.045:kind==='kick'?.19:.12;let source;
 if(kind==='kick'){source=audio.createOscillator();source.type='sine';source.frequency.setValueAtTime(125,now);source.frequency.exponentialRampToValueAtTime(42,now+.13);source.connect(g)}
 else{
  if(!drumNoise){drumNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.2),audio.sampleRate);const data=drumNoise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.5}
  source=audio.createBufferSource();source.buffer=drumNoise;const filter=audio.createBiquadFilter();filter.type='highpass';filter.frequency.value=kind==='hat'?6500:1100;source.connect(filter);filter.connect(g);source._filter=filter;
 }
 musicVoices++;g.gain.setValueAtTime(volume*preferences.music,now);g.gain.exponentialRampToValueAtTime(.00001,now+duration);g.connect(audioBus||audio.destination);source.onended=()=>{musicVoices--;source.disconnect();source._filter?.disconnect();g.disconnect()};source.start(now);source.stop(now+duration+.01);
}
function updateLayeredMusic(dt){
 if(!sounds||!audio||audio.state!=='running'||preferences.music<=0||['pause','settings','touchLayout'].includes(game.mode)||document.hidden)return;
 const name=musicSceneKey(),phase=game.mode==='play'&&game.active&&enemies.some(e=>e.hp>0&&e.kind==='boss'&&(e.bossPhase===2||e.awakened))?2:1,key=name+':'+phase;
 if(key!==musicScene){musicScene=key;musicClock=0;musicBeat=0}musicClock-=dt;if(musicClock>0)return;
 const theme=SCORE_THEMES[name],calm=['map','shop','rest','victory'].includes(name),step=60/(theme.bpm+(phase===2?8:0))/4,beat=musicBeat++,i=beat%16,bar=Math.floor(beat/16),root=theme.base*2**(theme.chords[bar%4]/12),duck=game.bossScene?.45:1,lead=theme.lead[(i+(bar%2?4:0))%16];musicClock+=step;
 const degree=theme.scale[lead%8]+Math.floor(lead/8)*12;
 if(lead>=0&&(i%2===0||!calm))scoreNote(root*2**(degree/12)*(calm?1:2),step*(calm?3:1.7),calm?'triangle':'sawtooth',.035*duck);
 if(i%4===0){scoreNote(root/2,step*3.5,'triangle',.055*duck);if(!calm)scoreNote(root,step*1.6,'triangle',.02*duck)}
 if(i%16===0)for(const n of [0,theme.scale[2],7])scoreNote(root*2**(n/12),step*14,'sine',.012*duck);
 if(i%2===0){const arp=[0,4,2,4,0,5,2,4][i/2];scoreNote(root*2**(theme.scale[arp]/12),step*1.35,'triangle',.016*duck)}
 if(!calm&&name!=='omen'){
  if(i===0||i===8||phase===2&&i===11)scoreDrum('kick',.1*duck);
  if(i===4||i===12)scoreDrum('snare',.065*duck);
  if(i%2===0||phase===2)scoreDrum('hat',.022*duck);
 }else if(name==='shop'&&i%4===2)scoreDrum('hat',.012);
}
