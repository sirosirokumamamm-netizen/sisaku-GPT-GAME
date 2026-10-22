// Normalized centers keep independent portrait/landscape layouts portable across screen sizes.
const TOUCH_TARGETS={pad:{id:'movePad',label:'移動スティック'},skills:{selector:'.skill-group',label:'技・回避ボタン'},ultimate:{id:'ultimate',label:'必殺技'},potion:{id:'combatPotion',label:'ポーション'}};
let touchEdit=null,touchDrag=null,touchClickGuard=null;
function touchOrientation(){const {w,h}=touchViewport();return w>h?'landscape':'portrait'}
function touchNode(key){const t=TOUCH_TARGETS[key];return t.id?$(t.id):document.querySelector(t.selector)}
function normalizeTouchSettings(raw){
 const clean={};for(const orientation of ['portrait','landscape']){
  const src=raw?.[orientation];if(!src||typeof src!=='object')continue;const layout={};
  for(const key of Object.keys(TOUCH_TARGETS)){const item=src[key];if(item&&[item.x,item.y,item.scale,item.opacity].every(Number.isFinite))layout[key]={x:clamp(item.x,0,1),y:clamp(item.y,0,1),scale:clamp(item.scale,key==='pad'?.75:key==='skills'?.85:.95,1.25),opacity:clamp(item.opacity,.4,1)}}clean[orientation]=layout;
 }return clean;
}
preferences.touchLayout=normalizeTouchSettings(initialSettings.touchLayout);
function touchViewport(){const scene=document.querySelector('.scene');return {w:scene.clientWidth||innerWidth,h:scene.clientHeight||innerHeight}}
function defaultTouchLayout(){
 const {w,h}=touchViewport(),wide=w>=600||h<=450&&w>=480,tiny=w<=360,padSize=tiny||wide?96:112,node=touchNode('skills'),skillsW=node?.offsetWidth||(wide?(h<=450?278:302):tiny?174:196),skillsH=node?.offsetHeight||(wide?68:132),edge=wide?16:tiny?10:14,bottom=20;
 const point=(x,y)=>({x:x/w,y:y/h,scale:1,opacity:.9});
 return {pad:point(edge+padSize/2,h-bottom-padSize/2),skills:point(w-edge-skillsW/2,h-bottom-skillsH/2),ultimate:point(w-edge-64,h-bottom-skillsH-36),potion:point(wide?174:tiny?140:156,wide?h-bottom-27:h-bottom-skillsH-30)};
}
function touchClientPoint(x,y){const r=document.querySelector('.scene').getBoundingClientRect();return {x:(x-r.left)/(r.width||1),y:(y-r.top)/(r.height||1)}}
function currentTouchLayout(){const orientation=touchOrientation();return {...defaultTouchLayout(),...(touchEdit?touchEdit.layouts:preferences.touchLayout)[orientation]}}
let touchLayoutFrame=0;
function scheduleTouchLayout(){if(touchLayoutFrame)return;touchLayoutFrame=requestAnimationFrame(()=>{touchLayoutFrame=0;applyTouchLayout()})}
function applyTouchLayout(){
 const layout=currentTouchLayout(),scene=document.querySelector('.scene'),style=getComputedStyle(scene),{w,h}=touchViewport();
 const safe={left:parseFloat(style.getPropertyValue('--touch-safe-left'))||0,right:parseFloat(style.getPropertyValue('--touch-safe-right'))||0,top:parseFloat(style.getPropertyValue('--touch-safe-top'))||0,bottom:parseFloat(style.getPropertyValue('--touch-safe-bottom'))||0};
 for(const key of Object.keys(TOUCH_TARGETS)){
  const node=touchNode(key),item=layout[key];if(!node||!node.offsetWidth||!node.offsetHeight)continue;
  // Convert scene coordinates to the node's actual containing block; wrappers may have an inset.
  const parent=node.offsetParent||scene,pr=parent.getBoundingClientRect(),sr=scene.getBoundingClientRect(),originX=(pr.left-sr.left)*w/(sr.width||w),originY=(pr.top-sr.top)*h/(sr.height||h);
  // Never position hidden controls using stale sizes from another orientation.
  const width=node.offsetWidth,height=node.offsetHeight;
  const halfW=width*item.scale/2,halfH=height*item.scale/2,x=clamp(item.x*w,halfW+Math.max(10,safe.left),w-halfW-Math.max(10,safe.right)),y=clamp(item.y*h,halfH+Math.max(10,safe.top),h-halfH-Math.max(10,safe.bottom));
  for(const [property,value]of Object.entries({left:(x-originX)+'px',top:(y-originY)+'px',right:'auto',bottom:'auto',transform:`translate(-50%,-50%) scale(${item.scale})`,opacity:String(item.opacity)}))if(node.style.getPropertyValue(property)!==value)node.style.setProperty(property,value,'important');
  node.classList.toggle('touch-selected',!!touchEdit&&touchEdit.selected===key);
 }
 if(touchEdit)validateTouchLayout();cacheBossTrackerLayout();
}
function validateTouchLayout(){
 const entries=Object.keys(TOUCH_TARGETS).map(key=>({key,node:touchNode(key),r:touchNode(key).getBoundingClientRect()})),overlap=new Set();
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const a=entries[i],b=entries[j];if(a.r.left<b.r.right-3&&b.r.left<a.r.right-3&&a.r.top<b.r.bottom-3&&b.r.top<a.r.bottom-3){overlap.add(a.key);overlap.add(b.key)}}
 entries.forEach(x=>x.node.classList.toggle('touch-overlap',overlap.has(x.key)));
 const panel=$('touchEditor'),r=panel?.getBoundingClientRect(),covered=r&&entries.some(x=>x.r.left<r.right&&x.r.right>r.left&&x.r.top<r.bottom&&x.r.bottom>r.top);
 if($('touchLayoutStatus'))$('touchLayoutStatus').textContent=overlap.size?'操作が重なっています。離して配置してください。':covered?'設定パネル付近も配置できます。保存後に操作できます。':'ボタンをドラッグして配置できます';
 if($('saveTouchLayout'))$('saveTouchLayout').disabled=overlap.size>0;return overlap.size===0;
}
function touchEditorControls(){
 if(!touchEdit)return;const current=currentTouchLayout(),item=current[touchEdit.selected],base=defaultTouchLayout();document.querySelectorAll('[data-touch-preset]').forEach(b=>b.setAttribute('aria-pressed',String(Object.keys(base).every(key=>Math.abs(current[key].x-(b.dataset.touchPreset==='left'?1-base[key].x:base[key].x))<.005&&Math.abs(current[key].y-base[key].y)<.005&&current[key].scale===1))));document.querySelectorAll('[data-touch-pick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.touchPick===touchEdit.selected)));
 $('touchScale').min=touchEdit.selected==='pad'?'75':touchEdit.selected==='skills'?'85':'95';$('touchScale').value=Math.round(item.scale*100);$('touchOpacity').value=Math.round(item.opacity*100);$('touchScaleValue').textContent=Math.round(item.scale*100)+'%';$('touchOpacityValue').textContent=Math.round(item.opacity*100)+'%';$('touchOrientation').textContent=touchOrientation()==='portrait'?'縦画面の配置':'横画面の配置';
}
function openTouchLayout(){
 if(!['settings','pause'].includes(game.mode))return;resetInput();touchEdit={returnMode:game.mode,selected:'pad',layouts:JSON.parse(JSON.stringify(preferences.touchLayout))};game.mode='touchLayout';$('overlay').hidden=true;syncPlayLayout();
 const panel=document.createElement('section');panel.id='touchEditor';panel.setAttribute('aria-label','タッチ操作の配置');panel.innerHTML=`<div class="touch-editor-heading"><b>操作のカスタマイズ</b><span id="touchOrientation"></span></div><p class="touch-editor-hint">動かしたい操作をタップ → そのままドラッグ</p><div class="touch-picks">${Object.entries(TOUCH_TARGETS).map(([key,t])=>`<button data-touch-pick="${key}">${({pad:'移動',skills:'技・回避',ultimate:'必殺技',potion:'回復'})[key]}</button>`).join('')}</div><div class="touch-presets"><span>基本配置</span><button data-touch-preset="right">移動：左／技：右</button><button data-touch-preset="left">移動：右／技：左</button></div><details class="touch-adjustments"><summary>大きさ・濃さ・左右反転</summary><div class="touch-editor-options"><button id="mirrorTouchLayout">左右を反転</button><label>大きさ <output id="touchScaleValue"></output><input id="touchScale" type="range" min="75" max="125" step="5"></label><label>濃さ <output id="touchOpacityValue"></output><input id="touchOpacity" type="range" min="40" max="100" step="5"></label></div></details><p id="touchLayoutStatus" role="status"></p><div class="touch-editor-actions"><button id="resetTouchLayout">初期配置</button><button id="cancelTouchLayout">取消</button><button id="saveTouchLayout">保存</button></div>`;document.body.append(panel);
 document.querySelectorAll('[data-touch-pick]').forEach(b=>b.onclick=()=>{touchEdit.selected=b.dataset.touchPick;touchEditorControls();applyTouchLayout()});

 document.querySelectorAll('[data-touch-preset]').forEach(b=>b.onclick=()=>setTouchPreset(b.dataset.touchPreset));
 for(const [id,property]of [['touchScale','scale'],['touchOpacity','opacity']])$(id).oninput=e=>{const orientation=touchOrientation();touchEdit.layouts[orientation]={...currentTouchLayout(),[touchEdit.selected]:{...currentTouchLayout()[touchEdit.selected],[property]:Number(e.target.value)/100}};touchEditorControls();applyTouchLayout()};
 $('mirrorTouchLayout').onclick=()=>{const layout=currentTouchLayout();touchEdit.layouts[touchOrientation()]=Object.fromEntries(Object.entries(layout).map(([key,item])=>[key,{...item,x:1-item.x}]));touchEditorControls();applyTouchLayout()};
 $('resetTouchLayout').onclick=()=>{delete touchEdit.layouts[touchOrientation()];touchEditorControls();applyTouchLayout()};
 $('saveTouchLayout').onclick=()=>{if(!validateTouchLayout())return;preferences.touchLayout=normalizeTouchSettings(touchEdit.layouts);writeStore('azure-settings',preferences);closeTouchLayout()};$('cancelTouchLayout').onclick=closeTouchLayout;
 // Act on touch release as well as keyboard clicks; a preceding drag can delay compatibility clicks.
 for(const button of panel.querySelectorAll('button')){
  const action=button.onclick;let lastTouch=-Infinity;
  button.onclick=e=>{if(e.detail===0||performance.now()-lastTouch>700)action(e)};
  button.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&!button.disabled){lastTouch=performance.now();touchClickGuard={x:e.clientX,y:e.clientY,until:performance.now()+700};e.preventDefault();action(e)}});
 }
 touchEditorControls();applyTouchLayout();
}
function closeTouchLayout(){
 if(!touchEdit)return;const mode=touchEdit.returnMode;touchEdit=null;touchDrag=null;$('touchEditor')?.remove();Object.keys(TOUCH_TARGETS).forEach(key=>touchNode(key).classList.remove('touch-overlap','touch-selected'));
 game.mode=mode;syncPlayLayout();applyTouchLayout();if(mode==='settings')openSettings();else{game.mode='play';pause()}
}
function addTouchLayoutSetting(){
 const help=$('modal').querySelector('.help-steps');if(!help)return;
 const button=document.createElement('button');button.id='touchLayoutButton';button.className='touch-layout-entry';button.textContent='✥ タッチ操作の位置・サイズを調整';button.onclick=openTouchLayout;help.append(button);
}
function initTouchLayout(){
 // A touch-release action may replace the panel before the compatibility click arrives.
 // Consume that one click, so Save cannot also press Resume beneath the removed editor.
 document.addEventListener('pointerdown',()=>touchClickGuard=null,true);
 document.addEventListener('click',e=>{const guard=touchClickGuard;if(guard&&e.detail>0&&performance.now()<guard.until&&Math.hypot(e.clientX-guard.x,e.clientY-guard.y)<4){touchClickGuard=null;e.preventDefault();e.stopImmediatePropagation()}},true);
 const scene=document.querySelector('.scene');scene.append($('combatPotion'));
 Object.keys(TOUCH_TARGETS).forEach(key=>{const node=touchNode(key);node.dataset.touchTarget=key;node.addEventListener('pointerdown',e=>{
  if(!touchEdit)return;e.preventDefault();e.stopImmediatePropagation();touchEdit.selected=key;const r=node.getBoundingClientRect();touchDrag={id:e.pointerId,key,dx:e.clientX-r.x-r.width/2,dy:e.clientY-r.y-r.height/2};node.setPointerCapture(e.pointerId);touchEditorControls();applyTouchLayout();
 },true)});
 document.addEventListener('pointermove',e=>{if(!touchEdit||!touchDrag||e.pointerId!==touchDrag.id)return;e.preventDefault();const layout=currentTouchLayout();touchEdit.layouts[touchOrientation()]={...layout,[touchDrag.key]:{...layout[touchDrag.key],...touchClientPoint(e.clientX-touchDrag.dx,e.clientY-touchDrag.dy)}};applyTouchLayout()},{passive:false});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>{if(touchDrag?.id===e.pointerId)touchDrag=null},true);
 window.addEventListener('resize',()=>{touchDrag=null;if(touchEdit)touchEditorControls();scheduleTouchLayout()});
 if(window.ResizeObserver){const observer=new ResizeObserver(scheduleTouchLayout);observer.observe(scene);Object.keys(TOUCH_TARGETS).forEach(key=>observer.observe(touchNode(key)))}
 window.visualViewport?.addEventListener('resize',()=>{resetInput();touchDrag=null;scheduleTouchLayout()});window.visualViewport?.addEventListener('scroll',scheduleTouchLayout);document.addEventListener('fullscreenchange',()=>{resetInput();scheduleTouchLayout()});
 window.addEventListener('keydown',e=>{if(game.mode==='touchLayout'&&e.key==='Escape'){e.preventDefault();closeTouchLayout()}});
 applyTouchLayout();
}
