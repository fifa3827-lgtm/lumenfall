(function(){
const COL={R:'#E24B4A',Y:'#EFBE2E',B:'#3D77C2',O:'#EC8730',G:'#4FA463',P:'#8257AE',N:'#7E6550'};
const DEEP={R:'#B22F31',Y:'#C08F12',B:'#255892',O:'#C4651B',G:'#2F7B45',P:'#5E3A83',N:'#5A4838'};
const LIGHT={R:'#FF8A7A',Y:'#FFE16B',B:'#8CC4FF',O:'#FFB35C',G:'#8FE0A0',P:'#C9A2F0',N:'#C9B8A4'};
const BIT={R:1,Y:2,B:4}, KEYS={1:'R',2:'Y',4:'B',3:'O',6:'G',5:'P',7:'N'}, K=v=>KEYS[v]||0;
const PRIMS=['R','Y','B'];
const IMG={};let ready=0,need=0;
for(const k in TEX){need++;const im=new Image();im.onload=()=>{if(++ready>=need)render()};im.src=TEX[k];IMG[k]=im}

let REG=[],ADJ=[],GNAME='',RINGS=null,RINGIDX=[];
function useGeo(gi){
 const g=normalize(GEOS[gi%GEOS.length]());
 REG=g.regs;ADJ=buildAdj(REG);GNAME=g.name;RINGS=g.rings||null;
 RINGIDX=[];RRAD=[];
 if(RINGS){REG.forEach((r,i)=>{(RINGIDX[r.ring]=RINGIDX[r.ring]||[])[r.k]=i;
  let mn=9,mx=0;r.pts.forEach(p=>{const d=Math.hypot(p[0],p[1]);mn=Math.min(mn,d);mx=Math.max(mx,d)});
  const o=RRAD[r.ring]||{in:9,out:0};o.in=Math.min(o.in,mn);o.out=Math.max(o.out,mx);RRAD[r.ring]=o})}
}
let RRAD=[];
function rotateRing(st,ring,steps){
 const arr=RINGIDX[ring];if(!arr||arr.length<2)return st;
 const n=arr.length,s2=((steps%n)+n)%n,out=st.slice();
 for(let j=0;j<n;j++)out[arr[(j+s2)%n]]=st[arr[j]];
 return out;
}
function mapRingIdx(i,ring,steps){
 const r=REG[i];if(!r||r.ring!==ring)return i;
 const arr=RINGIDX[ring],n=arr.length;
 return arr[(((r.k+steps)%n)+n)%n];
}
function runSeq(seq){
 let g=new Array(REG.length).fill(0);
 seq.forEach(a=>{g=a[0]==='rot'?rotateRing(g,a[1],a[2]):applyDrop(g,a[0],a[1],a[2])});
 return g;
}
function itemsOf(seq){
 const items=[];
 seq.forEach(a=>{if(a[0]==='rot')return;const[,c,r]=a;
  const f=items.find(x=>x.c===c&&x.r===r);if(f)f.n++;else items.push({c,r,n:1})});
 items.sort((a,b)=>b.r-a.r||(a.c<b.c?-1:1));
 return items;
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
 {geo:2,ds:[[0,'Y',2],[0,'R',1]]},
 {geo:0,ds:[[1,'R',1],[4,'B',1]],scramble:[[1,2],[2,5]],hintRot:true},
 {geo:0,ds:[[7,'Y',1],['rot',2,4]]}
];
function genLevel(L){
 if(L<OPEN.length){
  const o=OPEN[L];useGeo(o.geo);
  const g=runSeq(o.ds);
  let start=null;
  if(o.scramble){start=g.slice();o.scramble.forEach(([ring,st])=>start=rotateRing(start,ring,st))}
  const items=o.scramble?[]:itemsOf(o.ds);
  return {goal:g,items,start,score:0,name:GNAME,rotate:!!RINGS&&L>=8,hintRot:!!o.hintRot};
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
  if(RINGS){
   const nrot=Math.min(3,1+Math.floor(i/10));
   for(let k=0;k<nrot;k++){
    const ring=1+Math.floor(rand()*(RINGS.length-1)),cnt=RINGS[ring];
    const pos=1+Math.floor(rand()*ds.length);
    ds.splice(pos,0,['rot',ring,1+Math.floor(rand()*(cnt-1))]);
   }
  }
  const g=runSeq(ds);
  const sc=rate(g);
  if(sc>bs){bs=sc;best={ds,g}}
  if(bs>=80)break;
 }
 if(!best){const ds=[[0,'B',3],[0,'R',2]];best={ds,g:runSeq(ds)}}
 return {goal:best.g,items:itemsOf(best.ds),score:Math.round(bs),name:GNAME,rotate:!!RINGS};
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
const sTick=()=>{tone(1250,.03,'square',.025);buzz(4)};
const sRot=()=>{tone(380,.12,'triangle',.08,300);noise(.12,.04,2200);buzz([0,10,30,14])};
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
let ROT_VIS=null,WIG=null,wigT=0,idleT=0;
let FX=[],fxLoop=false;
const MIXNAME={3:'주황!',6:'초록!',5:'보라!',7:'탁해요'};
function fxPump(){
 if(fxLoop)return;fxLoop=true;
 (function f(){
  FX=FX.filter(p=>p.life<p.max);
  if(!FX.length){fxLoop=false;render();return}
  if(!animBusy())render();
  requestAnimationFrame(f);
 })();
}
function animBusy(){return !!anim||(done&&lit<1)}
function stepFX(dt){
 FX.forEach(p=>{p.life+=dt;
  if(p.vx!==undefined){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=p.g*dt;if(p.spin)p.rot+=p.spin*dt}});
}
let fxLast=performance.now();
function drawFX(){
 const now=performance.now(),dt=Math.min(.05,(now-fxLast)/1000);fxLast=now;stepFX(dt);
 FX.forEach(p=>{
  const t=p.life/p.max;if(t>=1)return;
  bx.save();
  if(p.type==='ripple'){
   bx.globalAlpha=(1-t)*.7;bx.strokeStyle=p.c;bx.lineWidth=RR*.018*(1-t)+1;
   bx.beginPath();bx.arc(p.x,p.y,p.r0+(p.r1-p.r0)*t,0,7);bx.stroke();
  }else if(p.type==='blob'){
   const k=t<.35?t/.35:1, sx=1+.45*(1-k), sy=1-.40*(1-k);
   bx.globalAlpha=(1-t)*.9;bx.fillStyle=p.c;
   bx.translate(p.x,p.y);bx.scale(sx,sy);
   bx.beginPath();bx.arc(0,0,p.r*(1+.35*t),0,7);bx.fill();
   bx.globalAlpha=(1-t)*.5;bx.fillStyle='#fff';bx.beginPath();bx.arc(-p.r*.35,-p.r*.35,p.r*.3,0,7);bx.fill();
  }else if(p.type==='drop'){
   bx.globalAlpha=(1-t);bx.fillStyle=p.c;
   bx.beginPath();bx.arc(p.x,p.y,p.r*(1-t*.5),0,7);bx.fill();
  }else if(p.type==='text'){
   const pop=t<.18?(t/.18):1, sc=t<.18?(.4+pop*.8):(1.2-(t-.18)*.25);
   bx.globalAlpha=t<.7?1:(1-(t-.7)/.3);
   bx.translate(p.x,p.y-t*RR*.16);bx.scale(sc,sc);
   bx.font=`${Math.round(RR*.11)}px Jua, "Apple SD Gothic Neo", sans-serif`;
   bx.textAlign='center';bx.textBaseline='middle';
   bx.lineWidth=RR*.022;bx.strokeStyle='#1A120B';bx.lineJoin='round';bx.strokeText(p.text,0,0);
   bx.fillStyle=p.c;bx.fillText(p.text,0,0);
  }else if(p.type==='shard'){
   bx.globalAlpha=(1-t)*(0.6+0.4*Math.sin(p.life*18));
   bx.translate(p.x,p.y);bx.rotate(p.rot);bx.fillStyle=p.c;
   bx.beginPath();bx.moveTo(0,-p.r);bx.lineTo(p.r*.55,0);bx.lineTo(0,p.r);bx.lineTo(-p.r*.55,0);bx.closePath();bx.fill();
   bx.globalAlpha*=.8;bx.fillStyle='#fff';bx.beginPath();bx.moveTo(0,-p.r*.8);bx.lineTo(p.r*.18,-p.r*.1);bx.lineTo(0,0);bx.closePath();bx.fill();
  }
  bx.restore();
 });
}
function regCenter(i){return {x:CX+REG[i].cx*RR,y:CY+REG[i].cy*RR}}
function fxDrop(i,col){
 const c=regCenter(i),hexc=COL[col];
 FX.push({type:'blob',x:c.x,y:c.y,r:RR*.07,c:hexc,life:0,max:.45});
 FX.push({type:'ripple',x:c.x,y:c.y,r0:RR*.04,r1:RR*.22,c:hexc,life:0,max:.55});
 for(let k=0;k<7;k++){const a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.4,v=RR*(.55+Math.random()*.6);
  FX.push({type:'drop',x:c.x,y:c.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:RR*3.2,r:RR*(.012+Math.random()*.014),c:hexc,life:0,max:.55})}
 fxPump();
}
function fxName(i,v){
 const c=regCenter(i),k=KEYS[v];
 FX.push({type:'text',x:c.x,y:c.y-RR*.04,text:MIXNAME[v]||'',c:v===7?'#C9B8A4':(LIGHT[k]||'#fff'),life:0,max:1.1});
 fxPump();
}
function fxWin(){
 const cols=['R','Y','B','O','G','P'];
 for(let k=0;k<46;k++){
  const a=Math.random()*Math.PI*2,d=RR*(.2+Math.random()*.7),v=RR*(.35+Math.random()*.9);
  FX.push({type:'shard',x:CX+Math.cos(a)*d*.3,y:CY+Math.sin(a)*d*.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v-RR*.3,g:RR*.9,
   r:RR*(.018+Math.random()*.03),rot:Math.random()*6,spin:(Math.random()-.5)*8,c:LIGHT[cols[k%6]],life:0,max:1.3+Math.random()*.7});
 }
 fxPump();
 const bw=document.querySelector('.boardwrap');bw.classList.remove('pop');void bw.offsetWidth;bw.classList.add('pop');
}
function withRot(ctx,r,cx,cy,fn){
 if(ROT_VIS&&r.ring===ROT_VIS.ring){ctx.save();ctx.translate(cx,cy);ctx.rotate(ROT_VIS.ang);ctx.translate(-cx,-cy);fn();ctx.restore()}
 else fn();
}
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
  REG.forEach(r=>withRot(ctx,r,cx,cy,()=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()}));
 }else{
  ctx.strokeStyle=glow>0?mixHex('#382C23','#0A0705',glow):'#382C23';
  ctx.lineWidth=rr*.021;
  REG.forEach(r=>withRot(ctx,r,cx,cy,()=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()}));
  ctx.globalAlpha=.34-glow*.2;
  ctx.strokeStyle='#A08E75';ctx.lineWidth=rr*.0055;
  ctx.save();ctx.translate(-rr*.005,-rr*.006);
  REG.forEach(r=>withRot(ctx,r,cx,cy,()=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()}));ctx.restore();
 }
 ctx.restore();
}
function drawAll(ctx,cx,cy,rr,g,alphaMap,useGlow,bgFill){
 const glow=useGlow?lit:0;
 leadNet(ctx,cx,cy,rr,glow,'under');
 if(bgFill){ctx.save();
  REG.forEach(r=>withRot(ctx,r,cx,cy,()=>{path(ctx,r,cx,cy,rr,0);ctx.fillStyle=bgFill;ctx.fill()}));ctx.restore()}
 for(let i=0;i<REG.length;i++){const v=K(g[i]);if(!v)continue;
  const a=alphaMap?(alphaMap[i]!==undefined?alphaMap[i]:1):1;if(a<=0)continue;
  withRot(ctx,REG[i],cx,cy,()=>drawRegion(ctx,i,cx,cy,rr,v,a,useGlow?glowOf(i):0))}
 leadNet(ctx,cx,cy,rr,glow,'over');
}
function render(){
 bx.clearRect(0,0,W,W);
 bx.save();
 const amb=bx.createRadialGradient(CX-RR*.18,CY-RR*.22,RR*.05,CX,CY,RR*1.15);
 amb.addColorStop(0,lit>0?'#FFE3A83c':'#FFE3A824');
 amb.addColorStop(1,'#FFE3A800');
 bx.fillStyle=amb;bx.fillRect(0,0,W,W);bx.restore();
 ROT_VIS=drag&&drag.moved?{ring:drag.ring,ang:drag.ang}:WIG;
 drawAll(bx,CX,CY,RR,cells,anim,true,lit>0?mixHex('#181209','#0A0806',lit):'#181209');
 if(CUR&&CUR.rotate&&RINGS&&!done)drawDials();
 ROT_VIS=null;
 if(CUR&&CUR.hintRot&&!rotatedOnce&&!done){
  const t=performance.now()/1000, rr=RR*0.56, a0=-Math.PI*0.95+Math.sin(t*1.6)*0.10, a1=a0+Math.PI*0.55;
  bx.save();bx.strokeStyle='#FFF3D0';bx.globalAlpha=.55+.25*Math.sin(t*3);bx.lineWidth=RR*.028;bx.lineCap='round';
  bx.beginPath();bx.arc(CX,CY,rr,a0,a1);bx.stroke();
  const ex=CX+Math.cos(a1)*rr, ey=CY+Math.sin(a1)*rr, ta=a1+Math.PI/2, h=RR*.07;
  bx.beginPath();bx.moveTo(ex,ey);
  bx.lineTo(ex-Math.cos(ta-0.5)*h,ey-Math.sin(ta-0.5)*h);
  bx.moveTo(ex,ey);bx.lineTo(ex-Math.cos(ta+0.5)*h,ey-Math.sin(ta+0.5)*h);bx.stroke();
  bx.restore();
  if(!hintLoop){hintLoop=true;(function hl(){if(!CUR||!CUR.hintRot||rotatedOnce||done){hintLoop=false;return}
   if(!drag)render();requestAnimationFrame(hl)})()}
 }
 if(lit>0){bx.save();bx.globalCompositeOperation='lighter';
  motes.forEach(m=>{bx.globalAlpha=lit*m.a*(.45+.55*Math.sin(performance.now()/760+m.p));
   bx.fillStyle='#FFF2CE';bx.beginPath();bx.arc(m.x,m.y,m.r,0,7);bx.fill()});bx.restore()}
 drawFX();
 if(origins.length&&!done){bx.save();origins.forEach(i=>{
  bx.globalAlpha=.45;bx.fillStyle='#FFF6DE';bx.beginPath();
  bx.arc(CX+REG[i].cx*RR,CY+REG[i].cy*RR,RR*.012,0,7);bx.fill()});bx.restore()}
 const S=260;gx.clearRect(0,0,S,S);
 const sl=lit;lit=0;drawAll(gx,S/2,S/2,S*.45,goal,null,false,'#181209');lit=sl;
 renderPaints();
}
function drawDials(){
 for(let ring=1;ring<RINGS.length;ring++){
  const R0=RRAD[ring];if(!R0)continue;
  const cnt=RINGS[ring], rOut=R0.out*RR;
  const held=drag&&drag.ring===ring;
  const ang=(ROT_VIS&&ROT_VIS.ring===ring)?ROT_VIS.ang:0;
  bx.save();
  bx.translate(CX,CY);bx.rotate(ang);
  if(held){
   bx.globalAlpha=.30;bx.strokeStyle='#FFF1C8';bx.lineWidth=(R0.out-R0.in)*RR;
   bx.beginPath();bx.arc(0,0,(R0.in+R0.out)/2*RR,0,Math.PI*2);bx.stroke();
  }
  bx.globalAlpha=held?.95:.62;
  bx.strokeStyle='#C9A560';bx.lineWidth=RR*.010;
  bx.beginPath();bx.arc(0,0,rOut-RR*.004,0,Math.PI*2);bx.stroke();
  bx.fillStyle=held?'#FFE7A6':'#D9B56C';
  for(let k=0;k<cnt;k++){
   const a=(k/cnt)*Math.PI*2-Math.PI/2;
   bx.beginPath();bx.arc(Math.cos(a)*(rOut-RR*.004),Math.sin(a)*(rOut-RR*.004),RR*(held?.017:.013),0,7);bx.fill();
  }
  bx.restore();
 }
}
function wiggle(){
 if(!CUR||!CUR.rotate||!RINGS||done)return;
 const n=RINGS.length-1,per=.42,t0=performance.now();
 (function w(){
  if(drag||done||!CUR||!CUR.rotate){WIG=null;render();return}
  const t=(performance.now()-t0)/1000,idx=Math.floor(t/per);
  if(idx>=n){WIG=null;render();return}
  const lt=(t-idx*per)/per;
  WIG={ring:idx+1,ang:0.11*Math.sin(lt*Math.PI*2)*(1-lt)};
  render();requestAnimationFrame(w);
 })();
}
function idleCheck(){
 if(!CUR||!CUR.rotate||done)return;
 if(!rotatedOnce&&!drag&&performance.now()-idleT>9000){idleT=performance.now();wiggle()}
}
setInterval(idleCheck,1000);
function renderPaints(){let h='';
 items.forEach((it,k)=>{
  const sz=it.r===1?40:it.r===2?50:58;
  const lab=it.r===1?'옆까지':it.r===2?'두 칸':'세 칸';
  h+=`<div class="pw"><button class="p${sel===k?' on':''}" data-k="${k}" ${it.n<=0?'disabled':''}
   style="width:${sz}px;height:${sz}px;background:radial-gradient(circle at 34% 30%, #ffffff70 0 15%, ${COL[it.c]} 46%, ${DEEP[it.c]} 100%)">
   <span class="cnt">${it.n}</span></button><span class="rng">${lab}</span></div>`});
 $('paints').innerHTML=h}
let drag=null,rotatedOnce=false,hintLoop=false;
function local(e){const rc=bc.getBoundingClientRect();
 return {x:((e.clientX-rc.left)/rc.width*W-CX)/RR, y:((e.clientY-rc.top)/rc.height*W-CY)/RR}}
function regionAt(p){for(let i=0;i<REG.length;i++)if(inside(REG[i],p.x,p.y))return i;return -1}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}
bc.addEventListener('pointerdown',e=>{
 if(done)return;
 const p=local(e),i=regionAt(p);
 const ring=(i>=0&&CUR.rotate&&REG[i].ring>0)?REG[i].ring:-1;
 drag={i,ring,a0:Math.atan2(p.y,p.x),ang:0,moved:false,last:0};WIG=null;idleT=performance.now();
 if(ring>0)render();
 try{bc.setPointerCapture(e.pointerId)}catch(_){}
});
bc.addEventListener('pointermove',e=>{
 if(!drag||drag.ring<0)return;
 const p=local(e),d=angDiff(Math.atan2(p.y,p.x),drag.a0);
 if(!drag.moved&&Math.abs(d)<0.10)return;
 drag.moved=true;drag.ang=d;
 const cnt=RINGIDX[drag.ring].length,st=Math.round(d/(Math.PI*2/cnt));
 if(st!==drag.last){drag.last=st;sTick()}
 render();
});
function endDrag(e){
 if(!drag)return;const dr=drag;drag=null;idleT=performance.now();
 if(dr.moved){
  const cnt=RINGIDX[dr.ring].length,st=Math.round(dr.ang/(Math.PI*2/cnt));
  if(st!==0){
   hist.push({cells:cells.slice(),items:items.map(o=>({...o})),sel,origins:origins.slice()});
   cells=rotateRing(cells,dr.ring,st);
   origins=origins.map(i=>mapRingIdx(i,dr.ring,st));
   rotatedOnce=true;sRot();
  }
  render();check();return;
 }
 if(dr.i<0)return;
 if(!items.length)return;
 const it=items[sel];
 if(!it||it.n<=0){$('msg').innerHTML='<small>아래에서 물감을 골라주세요</small>';return}
 place(dr.i,sel);
}
bc.addEventListener('pointerup',endDrag);
bc.addEventListener('pointercancel',()=>{drag=null;render()});
function place(at,k){
 const it=items[k];
 hist.push({cells:cells.slice(),items:items.map(o=>({...o})),sel,origins:origins.slice()});
 origins=origins.concat([at]);
 const before=cells.slice(), touched=spread(at,it.r);
 cells=applyDrop(cells,at,it.c,it.r);it.n--;
 sDrop();setTimeout(sFill,50);
 fxDrop(at,it.c);
 const newMix=touched.find(i=>cells[i]!==before[i]&&[3,5,6,7].includes(cells[i]));
 if(newMix!==undefined)setTimeout(()=>fxName(newMix,cells[newMix]),230);
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
 document.body.classList.add('lit');sWin();saveWon(li);updGal();fxWin();
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
 cells=CUR.start?CUR.start.slice():new Array(REG.length).fill(0);sel=0;rotatedOnce=false;drag=null;WIG=null;idleT=performance.now();
 if(CUR.rotate)setTimeout(wiggle,700);
 const TIMES=['dawn','noon','dusk','night'],TNAME={dawn:'아침',noon:'한낮',dusk:'저녁',night:'밤'};
 const tm=TIMES[Math.floor(k/4)%4];document.body.dataset.time=tm;
 $('sub').innerHTML=CUR.name+' · '+(k+1)+'<span class="timechip">'+TNAME[tm]+'</span>';
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
