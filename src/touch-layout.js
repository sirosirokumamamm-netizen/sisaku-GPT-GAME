// Normalized centers keep independent portrait/landscape layouts portable across screen sizes.
const TOUCH_TARGETS={pad:{id:'movePad',label:'移動スティック'},skills:{selector:'.skill-group',label:'技・回避ボタン'},ultimate:{id:'ultimate',label:'必殺技'},potion:{id:'combatPotion',label:'ポーション'}};
let touchEdit=null,touchDrag=null;
function touchOrientation(){return innerWidth>innerHeight?'landscape':'portrait'}
function touchNode(key){const t=TOUCH_TARGETS[key];return t.id?$(t.id):document.querySelector(t.selector)}
function normalizeTouchSettings(raw){
 const clean={};for(const orientation of ['portrait','landscape']){
  const src=raw?.[orientation];if(!src||typeof src!=='object')continue;const layout={};
  for(const key of Object.keys(TOUCH_TARGETS)){const item=src[key];if(item&&[item.x,item.y,item.scale,item.opacity].every(Number.isFinite))layout[key]={x:clamp(item.x,0,1),y:clamp(item.y,0,1),scale:clamp(item.scale,key==='pad'?.75:key==='skills'?.85:.95,1.25),opacity:clamp(item.opacity,.4,1)}}clean[orientation]=layout;
 }return clean;
}
preferences.touchLayout=normalizeTouchSettings(initialSettings.touchLayout);
function defaultTouchLayout(){
 const w=innerWidth,h=innerHeight,wide=w>=600||h<=450&&w>=480,tiny=w<=360,pad=tiny||wide?96:112,skillsW=wide?278:tiny?174:196,skillsH=wide?64:132,edge=wide?16:tiny?10:14,bottom=20;
 const point=(x,y)=>({x:x/w,y:y/h,scale:1,opacity:.85});
 return {pad:point(edge+pad/2,h-bottom-pad/2),skills:point(w-edge-skillsW/2,h-bottom-skillsH/2),ultimate:point(w-edge-64,h-bottom-skillsH-36),potion:point(wide?174:tiny?140:156,wide?h-bottom-27:h-bottom-skillsH-30)};
}
function currentTouchLayout(){const orientation=touchOrientation();return {...defaultTouchLayout(),...(touchEdit?touchEdit.layouts:preferences.touchLayout)[orientation]}}
function applyTouchLayout(){
 const layout=currentTouchLayout(),scene=document.querySelector('.scene'),style=getComputedStyle(scene);
 const safe={left:parseFloat(style.getPropertyValue('--touch-safe-left'))||0,right:parseFloat(style.getPropertyValue('--touch-safe-right'))||0,top:parseFloat(style.getPropertyValue('--touch-safe-top'))||0,bottom:parseFloat(style.getPropertyValue('--touch-safe-bottom'))||0};
 for(const key of Object.keys(TOUCH_TARGETS)){
  const node=touchNode(key),item=layout[key];if(!node)continue;
  const width=node.offsetWidth||Number(node.dataset.touchWidth)||60,height=node.offsetHeight||Number(node.dataset.touchHeight)||60;
  if(node.offsetWidth){node.dataset.touchWidth=width;node.dataset.touchHeight=height}
  const halfW=width*item.scale/2,halfH=height*item.scale/2,x=clamp(item.x*innerWidth,halfW+Math.max(8,safe.left),innerWidth-halfW-Math.max(8,safe.right)),y=clamp(item.y*innerHeight,halfH+Math.max(8,safe.top),innerHeight-halfH-Math.max(8,safe.bottom));
  for(const [property,value]of Object.entries({left:x+'px',top:y+'px',right:'auto',bottom:'auto',transform:`translate(-50%,-50%) scale(${item.scale})`,opacity:String(item.opacity)}))node.style.setProperty(property,value,'important');
  node.classList.toggle('touch-selected',!!touchEdit&&touchEdit.selected===key);
 }
 if(touchEdit)validateTouchLayout();
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
 if(!touchEdit)return;const item=currentTouchLayout()[touchEdit.selected];$('touchTarget').value=touchEdit.selected;
 $('touchScale').min=touchEdit.selected==='pad'?'75':touchEdit.selected==='skills'?'85':'95';$('touchScale').value=Math.round(item.scale*100);$('touchOpacity').value=Math.round(item.opacity*100);$('touchScaleValue').textContent=Math.round(item.scale*100)+'%';$('touchOpacityValue').textContent=Math.round(item.opacity*100)+'%';$('touchOrientation').textContent=touchOrientation()==='portrait'?'縦画面の配置':'横画面の配置';
}
function openTouchLayout(){
 if(!['settings','pause'].includes(game.mode))return;resetInput();touchEdit={returnMode:game.mode,selected:'pad',layouts:JSON.parse(JSON.stringify(preferences.touchLayout))};game.mode='touchLayout';$('overlay').hidden=true;syncPlayLayout();
 const panel=document.createElement('section');panel.id='touchEditor';panel.setAttribute('aria-label','タッチ操作の配置');panel.innerHTML=`<div class="touch-editor-heading"><b>操作のカスタマイズ</b><span id="touchOrientation"></span></div><div class="touch-editor-options"><select id="touchTarget" aria-label="編集する操作">${Object.entries(TOUCH_TARGETS).map(([key,t])=>`<option value="${key}">${t.label}</option>`).join('')}</select><button id="mirrorTouchLayout">左右を反転</button><label>大きさ <output id="touchScaleValue"></output><input id="touchScale" type="range" min="75" max="125" step="5"></label><label>不透明度 <output id="touchOpacityValue"></output><input id="touchOpacity" type="range" min="40" max="100" step="5"></label></div><p id="touchLayoutStatus" role="status"></p><div class="touch-editor-actions"><button id="resetTouchLayout">この向きを初期配置へ</button><button id="cancelTouchLayout">取消</button><button id="saveTouchLayout">保存して戻る</button></div>`;document.body.append(panel);
 $('touchTarget').onchange=e=>{touchEdit.selected=e.target.value;touchEditorControls();applyTouchLayout()};
 for(const [id,property]of [['touchScale','scale'],['touchOpacity','opacity']])$(id).oninput=e=>{const orientation=touchOrientation();touchEdit.layouts[orientation]={...currentTouchLayout(),[touchEdit.selected]:{...currentTouchLayout()[touchEdit.selected],[property]:Number(e.target.value)/100}};touchEditorControls();applyTouchLayout()};
 $('mirrorTouchLayout').onclick=()=>{const layout=currentTouchLayout();touchEdit.layouts[touchOrientation()]=Object.fromEntries(Object.entries(layout).map(([key,item])=>[key,{...item,x:1-item.x}]));applyTouchLayout()};
 $('resetTouchLayout').onclick=()=>{delete touchEdit.layouts[touchOrientation()];touchEditorControls();applyTouchLayout()};
 $('saveTouchLayout').onclick=()=>{if(!validateTouchLayout())return;preferences.touchLayout=normalizeTouchSettings(touchEdit.layouts);writeStore('azure-settings',preferences);closeTouchLayout()};$('cancelTouchLayout').onclick=closeTouchLayout;
 // Act on touch release as well as keyboard clicks; a preceding drag can delay compatibility clicks.
 for(const id of ['saveTouchLayout','cancelTouchLayout','resetTouchLayout','mirrorTouchLayout']){
  const button=$(id),action=button.onclick;let lastTouch=-Infinity;
  button.onclick=e=>{if(e.detail===0||performance.now()-lastTouch>700)action(e)};
  button.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&!button.disabled){lastTouch=performance.now();e.preventDefault();action(e)}});
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
 const scene=document.querySelector('.scene');scene.append($('combatPotion'));
 Object.keys(TOUCH_TARGETS).forEach(key=>{const node=touchNode(key);node.dataset.touchTarget=key;node.addEventListener('pointerdown',e=>{
  if(!touchEdit)return;e.preventDefault();e.stopImmediatePropagation();touchEdit.selected=key;const r=node.getBoundingClientRect();touchDrag={id:e.pointerId,key,dx:e.clientX-r.x-r.width/2,dy:e.clientY-r.y-r.height/2};node.setPointerCapture(e.pointerId);touchEditorControls();applyTouchLayout();
 },true)});
 document.addEventListener('pointermove',e=>{if(!touchEdit||!touchDrag||e.pointerId!==touchDrag.id)return;e.preventDefault();const layout=currentTouchLayout();touchEdit.layouts[touchOrientation()]={...layout,[touchDrag.key]:{...layout[touchDrag.key],x:(e.clientX-touchDrag.dx)/innerWidth,y:(e.clientY-touchDrag.dy)/innerHeight}};applyTouchLayout()},{passive:false});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>{if(touchDrag?.id===e.pointerId)touchDrag=null},true);
 window.addEventListener('resize',()=>{touchDrag=null;requestAnimationFrame(()=>{if(touchEdit)touchEditorControls();applyTouchLayout()})});
 window.addEventListener('keydown',e=>{if(game.mode==='touchLayout'&&e.key==='Escape'){e.preventDefault();closeTouchLayout()}});
 applyTouchLayout();
}
