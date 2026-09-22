(function(){
const COL={R:'#E24B4A',Y:'#EFBE2E',B:'#3D77C2',O:'#EC8730',G:'#4FA463',P:'#8257AE',N:'#7E6550'};
const DEEP={R:'#B22F31',Y:'#C08F12',B:'#255892',O:'#C4651B',G:'#2F7B45',P:'#5E3A83',N:'#5A4838'};
const BIT={R:1,Y:2,B:4}, KEYS={1:'R',2:'Y',4:'B',3:'O',6:'G',5:'P',7:'N'}, K=v=>KEYS[v]||0;
const PRIMS=['R','Y','B'];
const IMG={};let ready=0,need=0;
for(const k in TEX){need++;const im=new Image();im.onload=()=>{if(++ready>=need)render()};im.src=TEX[k];IMG[k]=im}

let REG=[],ADJ=[],GNAME='';
function useGeo(gi){
 const g=normalize(GEOS[gi%GEOS.length]());
 REG=g.regs;ADJ=buildAdj(REG);GNAME=g.name;
}
function spread(from,rad){const seen=new Set([from]);let f=[from];
 for(let d=0;d<rad;d++){const nx=[];f.forEach(i=>ADJ[i].forEach(j=>{if(!seen.has(j)){seen.add(j);nx.push(j)}}));f=nx}
 return [...seen]}
function applyDrop(st,from,col,rad){const g=st.slice();spread(from,rad).forEach(i=>g[i]|=BIT[col]);return g}

/* ---- 대칭 점수 ---- */
let MIRROR=[],ROT=[];
function buildSym(){
 const idx=new Map();
 REG.forEach((r,i)=>idx.set(Math.round(r.cx*180)+','+Math.round(r.cy*180),i));
 MIRROR=REG.map((r)=>{const j=idx.get(Math.round(-r.cx*180)+','+Math.round(r.cy*180));return j===undefined?-1:j});
 const ang=Math.PI/3;
 ROT=REG.map(r=>{const x=r.cx*Math.cos(ang)-r.cy*Math.sin(ang),y=r.cx*Math.sin(ang)+r.cy*Math.cos(ang);
  const j=idx.get(Math.round(x*180)+','+Math.round(y*180));return j===undefined?-1:j});
}
function symScore(g){
 let mh=0,mt=0,rh=0,rt=0;
 MIRROR.forEach((j,i)=>{if(j<0)return;mt++;if(g[i]===g[j])mh++});
 ROT.forEach((j,i)=>{if(j<0)return;rt++;if(g[i]===g[j])rh++});
 return Math.max(mt?mh/mt:0, rt?rh/rt:0);
}
function rate(g){
 let filled=0,mixed=0;const cols=new Set();
 for(let i=0;i<REG.length;i++){const v=g[i];if(!v)continue;
  if(v===7)return -1;filled++;cols.add(v);if(v!==1&&v!==2&&v!==4)mixed++}
 const fill=filled/REG.length;
 if(fill<.55||fill>.99)return -1;
 if(mixed===0)return -1;
 const sym=symScore(g),variety=Math.min(1,cols.size/4),mr=mixed/filled;
 return sym*42+variety*18+Math.max(0,1-Math.abs(mr-.3)/.45)*20+Math.max(0,1-Math.abs(fill-.88)/.4)*20;
}
function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const OPEN=[
 {geo:0,ds:[[0,'R',1]]},
 {geo:0,ds:[[8,'B',1]]},
 {geo:0,ds:[[0,'Y',2]]},
 {geo:0,ds:[[0,'R',1],[0,'B',1]]},
 {geo:0,ds:[[2,'Y',1],[5,'B',1]]},
 {geo:1,ds:[[0,'R',1],[0,'Y',1]]},
 {geo:1,ds:[[4,'B',1],[20,'Y',1]]},
 {geo:2,ds:[[0,'Y',2],[0,'R',1]]}
];
function genLevel(L){
 if(L<OPEN.length){
  const o=OPEN[L];useGeo(o.geo);
  let g=new Array(REG.length).fill(0);
  o.ds.forEach(([a,c,r])=>g=applyDrop(g,a,c,r));
  const items=[];
  o.ds.forEach(([,c,r])=>{const f=items.find(x=>x.c===c&&x.r===r);if(f)f.n++;else items.push({c,r,n:1})});
  items.sort((a,b)=>b.r-a.r);
  return {goal:g,items,score:0,name:GNAME};
 }
 const i=L-OPEN.length;
 useGeo(Math.floor(i/2)%GEOS.length);buildSym();
 const drops=Math.min(6,2+Math.floor(i/4));
 let best=null,bs=-1;
 for(let t=0;t<500;t++){
  const rand=mul(L*7919+t*104729+5);
  const ds=[];
  for(let k=0;k<drops;k++){
   ds.push([Math.floor(rand()*REG.length),PRIMS[Math.floor(rand()*3)],1+Math.floor(rand()*2)]);
  }
  let g=new Array(REG.length).fill(0);
  ds.forEach(([a,c,r])=>g=applyDrop(g,a,c,r));
  const sc=rate(g);
  if(sc>bs){bs=sc;best={ds,g}}
  if(bs>=80)break;
 }
 if(!best){const ds=[[0,'B',3],[0,'R',2]];let g=new Array(REG.length).fill(0);
  ds.forEach(([a,c,r])=>g=applyDrop(g,a,c,r));best={ds,g}}
 const items=[];
 best.ds.forEach(([,c,r])=>{const f=items.find(x=>x.c===c&&x.r===r);if(f)f.n++;else items.push({c,r,n:1})});
 items.sort((a,b)=>b.r-a.r||(a.c<b.c?-1:1));
 return {goal:best.g,items,score:Math.round(bs),name:GNAME};
}

/* ---- 상태 ---- */
let li=0,CUR=null,goal=[],cells=[],items=[],sel=0,hist=[],done=false;
let lit=0,litT=0,motes=[],anim=null,origins=[];
const bc=document.getElementById('board'),bx=bc.getContext('2d');
const gc=document.getElementById('goal'),gx=gc.getContext('2d');
const $=id=>document.getElementById(id);
const W=1000,CX=W/2,CY=W/2,RR=W*0.455;

/* ---------- 음악 (Web Audio) ---------- */
let BUF={},bgmSrc=null,bgmGain=null,musicOn=true,decoded=false;
let audioErr=0;
function loadOne(a,k,url){
 fetch(url,{cache:'force-cache'})
  .then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})
  .then(ab=>new Promise((res,rej)=>{
    const p=a.decodeAudioData(ab,res,rej);
    if(p&&p.then)p.then(res,rej);
  }))
  .then(buf=>{BUF[k]=buf;if(k==='bgm'){decoded=true;if(armed&&musicOn)startBgm()}})
  .catch(()=>{audioErr++});
}
function initMusic(){
 const a=ac();
 Object.keys(AUD).forEach(k=>loadOne(a,k,AUD[k]));
}
function playBuf(key,vol,when){
 const b=BUF[key];if(!b||!sound)return null;
 const a=ac(),s=a.createBufferSource(),g=a.createGain();
 s.buffer=b;g.gain.value=vol;s.connect(g);g.connect(a.destination);
 s.start(a.currentTime+(when||0));
 return {s,g};
}
function startBgm(){
 if(bgmSrc||!BUF.bgm||!musicOn)return;
 const a=ac();
 bgmGain=a.createGain();bgmGain.gain.value=0;bgmGain.connect(a.destination);
 bgmSrc=a.createBufferSource();bgmSrc.buffer=BUF.bgm;bgmSrc.loop=true;
 bgmSrc.connect(bgmGain);bgmSrc.start();
 bgmGain.gain.linearRampToValueAtTime(.30,a.currentTime+2.4);
}
function stopBgm(){
 if(!bgmSrc)return;
 const a=ac();
 try{bgmGain.gain.cancelScheduledValues(a.currentTime);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value,a.currentTime);
  bgmGain.gain.linearRampToValueAtTime(0,a.currentTime+.5);
  bgmSrc.stop(a.currentTime+.6)}catch(e){}
 bgmSrc=null;bgmGain=null;
}
function duck(to,sec){
 if(!bgmGain)return;const a=ac();
 try{bgmGain.gain.cancelScheduledValues(a.currentTime);
  bgmGain.gain.setValueAtTime(bgmGain.gain.value,a.currentTime);
  bgmGain.gain.linearRampToValueAtTime(to,a.currentTime+sec)}catch(e){}
}
function playDrop(){if(!playBuf('drop',.6)&&sound){tone(560,.11,'sine',.16,190);noise(.1,.07,900)}}
function playMix(){if(!playBuf('mix',.45)&&sound)tone(720,.2,'triangle',.1,1000)}
let AC=null,sound=true,armed=false;
function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC}
function arm(){if(armed)return;armed=true;try{ac().resume()}catch(e){};if(decoded)startBgm()}
['pointerdown','keydown'].forEach(e=>window.addEventListener(e,arm,{once:true}));
const HV=typeof navigator!=='undefined'&&!!navigator.vibrate;
function buzz(p){if(!HV)return;try{navigator.vibrate(p)}catch(e){}}
function tone(f,d,ty,v,sl,dl){if(!sound)return;const a=ac(),t=a.currentTime+(dl||0),o=a.createOscillator(),g=a.createGain();
 o.type=ty||'sine';o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.12,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.06)}
function noise(d,v,lp,dl){if(!sound)return;const a=ac(),len=a.sampleRate*d,b=a.createBuffer(1,len,a.sampleRate),c=b.getChannelData(0);
 for(let i=0;i<len;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.4);
 const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=lp||1200;
 const g=a.createGain();g.gain.value=v||.1;s.connect(f);f.connect(g);g.connect(a.destination);s.start(a.currentTime+(dl||0))}
const sDrop=()=>{playDrop();buzz(12)};
const sFill=()=>{noise(.3,.05,1400);buzz([0,16,24,10])};
const sMix=()=>{playMix();buzz([0,10,40,10])};
const sUndo=()=>{tone(320,.13,'sine',.1,640);buzz([0,8,30,8])};
const sPick=()=>{tone(900,.055,'sine',.07);buzz(7)};
function winFallback(){if(!sound)return;
 [261.6,329.6,392,523.3].forEach((f,k)=>tone(f,2.8,'sine',.07,null,k*.17));
 [1046,1318,1568].forEach((f,k)=>tone(f,1.9,'sine',.033,null,.55+k*.22));
 noise(2.3,.028,2600,.3)}
function sWin(){buzz([0,22,70,16,70,16,90,60]);
 duck(.09,.5);
 const r=playBuf('win',.85);
 if(!r)winFallback();
 setTimeout(()=>{if(musicOn)duck(.30,2.5)},7000);}

function hx(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mixHex(a,b,t){const A=hx(a),B=hx(b);
 return `rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`}
function path(ctx,r,cx,cy,rr,shrink){
 const s=shrink||0;
 ctx.beginPath();
 r.pts.forEach((p,i)=>{
  const dx=p[0]-r.cx, dy=p[1]-r.cy, d=Math.hypot(dx,dy)||1;
  const x=cx+(r.cx+dx*(1-s/d))*rr, y=cy+(r.cy+dy*(1-s/d))*rr;
  i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
 ctx.closePath();
}
function inside(r,x,y){
 let c=false;
 for(let i=0,j=r.pts.length-1;i<r.pts.length;j=i++){
  const a=r.pts[i],b=r.pts[j];
  if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}
 return c;
}
function glowOf(i){if(lit<=0)return 0;
 const d=Math.hypot(REG[i].cx,REG[i].cy);
 return Math.min(1,Math.max(0,(lit-d*.30)/.6))}
function drawRegion(ctx,i,cx,cy,rr,v,alpha,glow){
 const im=IMG[v];if(!im||!im.complete)return;
 const r=REG[i];
 ctx.save();path(ctx,r,cx,cy,rr,0);ctx.clip();
 ctx.globalAlpha=alpha;
 const size=rr*2.2;
 ctx.save();ctx.translate(cx,cy);ctx.rotate((i%4)*Math.PI/2);
 ctx.drawImage(im,-size/2,-size/2,size,size);ctx.restore();
 if(glow>0){
  ctx.globalCompositeOperation='overlay';
  ctx.globalAlpha=alpha*glow*.82;ctx.fillStyle=COL[v];ctx.fillRect(0,0,W,W);
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=alpha*glow*.44;ctx.fillStyle=COL[v];ctx.fillRect(0,0,W,W);
  ctx.globalCompositeOperation='source-over';
 }
 /* 유리 가장자리 — 두께감 */
 ctx.globalAlpha=alpha*(.34-glow*.18);
 ctx.strokeStyle='#000';ctx.lineWidth=rr*.030;
 path(ctx,r,cx,cy,rr,0);ctx.stroke();
 ctx.globalAlpha=alpha*(.16+glow*.22);
 ctx.strokeStyle='#FFF4D8';ctx.lineWidth=rr*.007;
 path(ctx,r,cx,cy,rr,0.011);ctx.stroke();
 ctx.restore();
}
function leadNet(ctx,cx,cy,rr,glow,pass){
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 if(pass==='under'){
  ctx.strokeStyle=glow>0?mixHex('#2E241C','#070504',glow):'#2E241C';
  ctx.lineWidth=rr*.072;
  REG.forEach(r=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()});
 }else{
  ctx.strokeStyle=glow>0?mixHex('#382C23','#0A0705',glow):'#382C23';
  ctx.lineWidth=rr*.021;
  REG.forEach(r=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()});
  ctx.globalAlpha=.34-glow*.2;
  ctx.strokeStyle='#A08E75';ctx.lineWidth=rr*.0055;
  ctx.save();ctx.translate(-rr*.005,-rr*.006);
  REG.forEach(r=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()});ctx.restore();
 }
 ctx.restore();
}
function drawAll(ctx,cx,cy,rr,g,alphaMap,useGlow,bgFill){
 const glow=useGlow?lit:0;
 leadNet(ctx,cx,cy,rr,glow,'under');
 if(bgFill){ctx.save();
  REG.forEach(r=>{path(ctx,r,cx,cy,rr,0);ctx.fillStyle=bgFill;ctx.fill()});ctx.restore()}
 for(let i=0;i<REG.length;i++){const v=K(g[i]);if(!v)continue;
  const a=alphaMap?(alphaMap[i]!==undefined?alphaMap[i]:1):1;if(a<=0)continue;
  drawRegion(ctx,i,cx,cy,rr,v,a,useGlow?glowOf(i):0)}
 leadNet(ctx,cx,cy,rr,glow,'over');
}
function render(){
 bx.clearRect(0,0,W,W);
 bx.save();
 const amb=bx.createRadialGradient(CX-RR*.18,CY-RR*.22,RR*.05,CX,CY,RR*1.15);
 amb.addColorStop(0,lit>0?'#FFE3A83c':'#FFE3A824');
 amb.addColorStop(1,'#FFE3A800');
 bx.fillStyle=amb;bx.fillRect(0,0,W,W);bx.restore();
 drawAll(bx,CX,CY,RR,cells,anim,true,lit>0?mixHex('#181209','#0A0806',lit):'#181209');
 if(lit>0){bx.save();bx.globalCompositeOperation='lighter';
  motes.forEach(m=>{bx.globalAlpha=lit*m.a*(.45+.55*Math.sin(performance.now()/760+m.p));
   bx.fillStyle='#FFF2CE';bx.beginPath();bx.arc(m.x,m.y,m.r,0,7);bx.fill()});bx.restore()}
 if(origins.length&&!done){bx.save();origins.forEach(i=>{
  bx.globalAlpha=.45;bx.fillStyle='#FFF6DE';bx.beginPath();
  bx.arc(CX+REG[i].cx*RR,CY+REG[i].cy*RR,RR*.012,0,7);bx.fill()});bx.restore()}
 const S=260;gx.clearRect(0,0,S,S);
 const sl=lit;lit=0;drawAll(gx,S/2,S/2,S*.45,goal,null,false,'#181209');lit=sl;
 renderPaints();
}
function renderPaints(){let h='';
 items.forEach((it,k)=>{
  const sz=it.r===1?40:it.r===2?50:58;
  const lab=it.r===1?'옆까지':it.r===2?'두 칸':'세 칸';
  h+=`<div class="pw"><button class="p${sel===k?' on':''}" data-k="${k}" ${it.n<=0?'disabled':''}
   style="width:${sz}px;height:${sz}px;background:radial-gradient(circle at 34% 30%, #ffffff70 0 15%, ${COL[it.c]} 46%, ${DEEP[it.c]} 100%)">
   <span class="cnt">${it.n}</span></button><span class="rng">${lab}</span></div>`});
 $('paints').innerHTML=h}
bc.addEventListener('click',e=>{
 if(done)return;const it=items[sel];
 if(!it||it.n<=0){$('msg').innerHTML='<small>아래에서 물감을 골라주세요</small>';return}
 const rc=bc.getBoundingClientRect();
 const x=((e.clientX-rc.left)/rc.width*W-CX)/RR, y=((e.clientY-rc.top)/rc.height*W-CY)/RR;
 for(let i=0;i<REG.length;i++)if(inside(REG[i],x,y)){place(i,sel);return}});
function place(at,k){
 const it=items[k];
 hist.push({cells:cells.slice(),items:items.map(o=>({...o})),sel,origins:origins.slice()});
 origins=origins.concat([at]);
 const before=cells.slice(), touched=spread(at,it.r);
 cells=applyDrop(cells,at,it.c,it.r);it.n--;
 sDrop();setTimeout(sFill,50);
 if(touched.some(i=>before[i]&&before[i]!==cells[i]))setTimeout(sMix,180);
 anim={};touched.forEach(i=>anim[i]=before[i]?1:0);
 const dist={};dist[at]=0;let f=[at];
 for(let d=1;d<=it.r;d++){const nx=[];f.forEach(i=>ADJ[i].forEach(j=>{if(dist[j]===undefined){dist[j]=d;nx.push(j)}}));f=nx}
 const t0=performance.now(),md=Math.max(1,it.r);
 (function step(){const t=(performance.now()-t0)/420;let alive=false;
  touched.forEach(i=>{const p=Math.min(1,Math.max(0,(t-(dist[i]/md)*.5)/.5));anim[i]=p;if(p<1)alive=true});
  render();if(alive)requestAnimationFrame(step);else{anim=null;render();check()}})();
 if(it.n<=0){const n2=items.findIndex(o=>o.n>0);sel=n2<0?sel:n2}
 renderPaints()}
function check(){
 for(let i=0;i<REG.length;i++)if((cells[i]||0)!==(goal[i]||0))return;
 done=true;
 motes=[...Array(30)].map(()=>{const a=Math.random()*Math.PI*2,d=Math.random()*RR*.9;
  return {x:CX+Math.cos(a)*d,y:CY+Math.sin(a)*d,r:1.8+Math.random()*4,a:.25+Math.random()*.5,p:Math.random()*6,vy:-(.1+Math.random()*.28)}});
 document.body.classList.add('lit');sWin();saveWon(li);updGal();
 $('msg').innerHTML='빛이 들어옵니다';
 litT=performance.now();
 (function b(){lit=Math.min(1,(performance.now()-litT)/1700);
  motes.forEach(m=>{m.y+=m.vy;if(m.y<CY-RR)m.y=CY+RR});render();
  if(lit<1)requestAnimationFrame(b);else{$('nextBtn').classList.add('show');
   (function l(){if(!done)return;motes.forEach(m=>{m.y+=m.vy;if(m.y<CY-RR)m.y=CY+RR});render();requestAnimationFrame(l)})()}})()}
$('undoBtn').addEventListener('click',()=>{if(!hist.length||done)return;
 const h=hist.pop();cells=h.cells;items=h.items;sel=h.sel;origins=h.origins||[];sUndo();$('msg').textContent='';render()});
$('galBtn').addEventListener('click',()=>{buildGallery();$('sheet').classList.add('open');
 $('sheet').setAttribute('aria-hidden','false');sPick()});
$('closeGal').addEventListener('click',()=>{$('sheet').classList.remove('open');
 $('sheet').setAttribute('aria-hidden','true')});
$('resetBtn').addEventListener('click',()=>load(li));
$('nextBtn').addEventListener('click',()=>load(li+1));
$('prevLv').addEventListener('click',()=>{if(li>0)load(li-1)});
$('nextLv').addEventListener('click',()=>load(li+1));
$('soundBtn').addEventListener('click',()=>{
 sound=!sound;musicOn=sound;
 $('soundBtn').textContent=sound?'소리':'소리 끔';
 if(sound){arm();startBgm();sPick()}else{stopBgm()}
 try{localStorage.setItem('lumenfall:sound',sound?'1':'0')}catch(e){}
});
$('paints').addEventListener('click',e=>{const b=e.target.closest('.p');if(!b||b.disabled)return;
 sel=+b.dataset.k;sPick();renderPaints();$('msg').textContent=''});
/* ---------- 창고 ---------- */
let SAVED=[];
function loadSaved(){try{const v=localStorage.getItem('lumenfall:won');SAVED=v?JSON.parse(v):[]}catch(e){SAVED=[]}}
function saveWon(k){if(SAVED.includes(k))return;SAVED.push(k);SAVED.sort((a,b)=>a-b);
 try{localStorage.setItem('lumenfall:won',JSON.stringify(SAVED))}catch(e){}}
function updGal(){$('galN').textContent=SAVED.length;
 $('sheetCount').textContent=SAVED.length?SAVED.length+'개':'';
 $('galEmpty').classList.toggle('hide',SAVED.length>0)}
function buildGallery(){
 const wrap=$('gallery');wrap.innerHTML='';
 const sREG=REG,sADJ=ADJ,sGN=GNAME;
 SAVED.forEach(k=>{
  const lv=genLevel(k);
  const d=document.createElement('div');d.className='gitem';
  const cv=document.createElement('canvas');cv.width=cv.height=220;
  d.appendChild(cv);
  const lab=document.createElement('span');lab.textContent=lv.name+' '+(k+1);
  d.appendChild(lab);wrap.appendChild(d);
  const c=cv.getContext('2d');
  c.fillStyle='#0F0B07';c.fillRect(0,0,220,220);
  const sl=lit;lit=1;
  drawAll(c,110,110,220*.45,lv.goal,null,true,'#181209');
  lit=sl;
 });
 REG=sREG;ADJ=sADJ;GNAME=sGN;
 updGal();
}
function load(k){
 li=k;done=false;hist=[];anim=null;lit=0;motes=[];origins=[];
 document.body.classList.remove('lit');
 CUR=genLevel(k);goal=CUR.goal;items=CUR.items.map(o=>({...o}));
 cells=new Array(REG.length).fill(0);sel=0;
 $('sub').textContent=CUR.name+' · '+(k+1);
 $('nextBtn').classList.remove('show');$('msg').textContent='';
 render()}
loadSaved();updGal();initMusic();
try{if(localStorage.getItem('lumenfall:sound')==='0'){sound=false;musicOn=false;$('soundBtn').textContent='소리 끔'}}catch(e){}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){try{ac().suspend()}catch(e){}}
 else if(armed){try{ac().resume()}catch(e){}}
});
load(SAVED.length?Math.max(...SAVED)+1:0);
})();
