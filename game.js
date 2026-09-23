(function(){
const COL={R:'#E24B4A',Y:'#EFBE2E',B:'#3D77C2',O:'#EC8730',G:'#4FA463',P:'#8257AE',N:'#7E6550'};
const DEEP={R:'#B22F31',Y:'#C08F12',B:'#255892',O:'#C4651B',G:'#2F7B45',P:'#5E3A83',N:'#5A4838'};
const LIGHT={R:'#FF8A7A',Y:'#FFE16B',B:'#8CC4FF',O:'#FFB35C',G:'#8FE0A0',P:'#C9A2F0',N:'#C9B8A4'};
const BIT={R:1,Y:2,B:4}, KEYS={1:'R',2:'Y',4:'B',3:'O',6:'G',5:'P',7:'N'}, K=v=>KEYS[v]||0;
const PRIMS=['R','Y','B'];
const IMG={};let ready=0,need=0;
for(const k in TEX){need++;const im=new Image();im.onload=()=>{if(++ready>=need)render()};im.src=TEX[k];IMG[k]=im}

let REG=[],ADJ=[],GNAME='',RINGS=null,RINGIDX=[],OUTLINES=null,LOCK=[];
/* 그림 창: 조각과 이웃을 미리 계산해 둔 자료를 그대로 쓴다. 부분이 다르면 이웃이 아니다. */
function usePic(pi,fine){
 const P=PICS[pi],S=fine?P.fine:P.base;
 REG=S.regs.map(r=>({pts:r.pts,cx:r.cx,cy:r.cy,part:r.part}));ADJ=S.adj;GNAME=P.name;
 RINGS=null;RINGIDX=[];RRAD=[];OUTLINES=P.outlines;
 LOCK=REG.map(()=>0);TWIN=REG.map(()=>-1);DRY=REG.map(()=>false);CLEAR=REG.map(()=>false);
}
function useGeo(gi){
 if(typeof gi==='object'&&gi){usePic(gi.pic,gi.fine);return}
 OUTLINES=null;LOCK=[];TWIN=[];DRY=[];CLEAR=[];
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
 seq.forEach(a=>{g=a[0]==='rot'?rotateRing(g,a[1],a[2]):applyDrop(g,a[0],a[1],a[2],a[3]==='L')});
 return g;
}
function itemsOf(seq){
 const items=[];
 seq.forEach(a=>{if(a[0]==='rot')return;const[,c,r]=a,sub=a[3]==='L';
  const f=items.find(x=>x.c===c&&x.r===r&&!!x.sub===sub);if(f)f.n++;else items.push({c,r,n:1,sub})});
 items.sort((a,b)=>(a.sub?1:0)-(b.sub?1:0)||b.r-a.r||(a.c<b.c?-1:1));
 return items;
}
function spread(from,rad){const seen=new Set([from]);let f=[from];
 for(let d=0;d<rad;d++){const nx=[];f.forEach(i=>ADJ[i].forEach(j=>{if(!seen.has(j)){seen.add(j);nx.push(j)}}));f=nx}
 return [...seen]}
/* 특수 유리
 - 쌍둥이(TWIN): 한 조각에 물감이 닿으면 짝 조각에도 같은 물감이 닿는다.
 - 마르는 유리(DRY): 처음 닿은 색으로 굳어서, 그다음 물감은 묻지 않는다(번짐은 지나간다).
 - 투명 유리(CLEAR): 물감이 묻지 않는다. 번짐은 그대로 지나간다.
 - 빛 방울(sub): 닿은 조각에서 그 원색을 뺀다. */
let TWIN=[],DRY=[],CLEAR=[];
function reach(from,rad){const s=new Set(spread(from,rad));[...s].forEach(i=>{if(TWIN[i]>=0)s.add(TWIN[i])});return [...s]}
function applyDrop(st,from,col,rad,sub){const g=st.slice();
 reach(from,rad).forEach(i=>{if(CLEAR[i]||(DRY[i]&&g[i]))return;g[i]=sub?g[i]&~BIT[col]:g[i]|BIT[col]});return g}

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
/* ---- 가장 적은 방울 수 ----
 색은 비트 OR로만 더해지고 빠지지 않으므로, 쓸 수 있는 방울은 번짐 자리가 전부
 목표에서 그 원색을 가진 조각 안에 들어가는 것뿐이다. 그래서 원색마다 따로
 「그 원색 조각들을 정확히 덮는 가장 적은 방울 수」를 찾아 더하면 된다. */
function minDrops(g,its){
 let total=0;
 for(const c of PRIMS){
  const b=BIT[c],S=new Set();g.forEach((v,i)=>{if((v&b)&&!LOCK[i])S.add(i)});
  its=its.filter(it=>!it.sub);
  if(!S.size)continue;
  const cnt={};its.forEach(it=>{if(it.c===c)cnt[it.r]=(cnt[it.r]||0)+it.n});
  const cand=[],seen=new Set();
  Object.keys(cnt).forEach(r=>{r=+r;for(let at=0;at<REG.length;at++){
   const fp=reach(at,r).filter(i=>!CLEAR[i]);if(!fp.every(i=>S.has(i)))continue;
   const key=r+':'+fp.slice().sort((a,b)=>a-b).join(',');if(seen.has(key))continue;seen.add(key);
   cand.push({r,fp})}});
  const max=Object.values(cnt).reduce((a,b)=>a+b,0);
  const cov=new Map();
  const dfs=d=>{
   let need=-1;for(const i of S)if(!cov.get(i)){need=i;break}
   if(need<0)return true;if(d===0)return false;
   for(const k of cand){if(!cnt[k.r]||!k.fp.includes(need))continue;
    cnt[k.r]--;k.fp.forEach(i=>cov.set(i,(cov.get(i)||0)+1));
    const ok=dfs(d-1);
    k.fp.forEach(i=>cov.set(i,cov.get(i)-1));cnt[k.r]++;
    if(ok)return true}
   return false};
  let best=max;for(let d=1;d<=max;d++)if(dfs(d)){best=d;break}
  total+=best;
 }
 return total;
}
/* 그림 창 판 만들기: 부분마다 아직 허용된 색이 아닌 조각을 골라, 그 색에 모자란 원색 방울을
 떨어뜨리기를 반복한다. 허용된 색으로 빈틈없이 채워지면 한 벌이 된다. 여러 벌 중
 점수가 가장 높은 것을 고른다. 같은 단계는 같은 판. */
/* 색 이름별로 허용하는 색과 주인공 색. 값은 원색 비트(빨1 노2 파4)의 합이다. */
const PAL={red:{want:1,allow:[1,3],ratio:.65,max:3},orange:{want:3,allow:[3,2,1],ratio:.65,max:3},
 yellow:{want:2,allow:[2,3,6],ratio:.65,max:3},green:{want:6,allow:[6,2],ratio:.75,max:4},
 blue:{want:4,allow:[4,6,5],ratio:.65,max:3},purple:{want:5,allow:[5,4,1],ratio:.6,max:4}};
/* 난이도 곡선(단계 번호 L은 0부터, 아래 설명의 단계는 화면에 보이는 번호)
 - 칠할 부분: 1~3단계 한 곳 → 4~8단계 두 곳 → 9~16단계 세 곳 → 그다음 네 곳
 - 조각: 8단계부터 가끔(세 판에 한 번) 잘게, 15단계부터 모두 잘게
 - 필요 없는 방울: 8단계부터 하나, 17단계부터 둘
 - 쌍둥이 유리: 11단계부터 한 쌍(25단계부터 두 쌍)
 - 마르는 유리: 18단계부터 한 조각(31단계부터 두 조각)
 - 투명 유리: 24단계부터 한 조각(35단계부터 두 조각)
 - 빛 방울(원색 빼기): 30단계부터 한 부분에 하나
 - 단계가 오를수록 한 부분에 방울을 더 쓰고, 섞인 색이 많은 판을 고른다. */
const TUNE=L=>({
 nAct:L<3?1:L<8?2:L<16?3:4,
 fine:L>=14||(L>=7&&L%3===0),
 decoys:L>=16?2:L>=7?1:0,
 twins:L>=24?2:L>=10?1:0,
 dry:L>=30?2:L>=17?1:0,
 clear:L>=34?2:L>=23?1:0,
 light:L>=29,
 extra:L>=10?1:0,
 perDrop:Math.max(9,22-L),
 mixBonus:Math.min(34,12+L*1.5)});
function genPic(L,pi){
 const T=TUNE(L),v=Math.floor(L/PICS.length);
 usePic(pi,T.fine);const P=PICS[pi];
 const recipes=P.pals.map(ps=>PAL[ps[v%ps.length]]);
 const parts=recipes.map((rc,k)=>k);
 /* 칠할 부분은 조각이 많은 부분부터 고르되, 단계마다 조금씩 섞는다 */
 const pr=mul(L*131+7);
 const size=k=>REG.filter(r=>r.part===k).length+pr()*3;
 const order=parts.slice().sort((a,b)=>size(b)-size(a));
 const act=new Set(order.slice(0,Math.min(parts.length,T.nAct)));
 /* 특수 유리 자리 정하기: 칠할 부분 안에서 서로 떨어진 조각끼리 쌍둥이, 마르는 유리는 따로 */
 const sr=mul(L*613+29),actIdx=REG.map((r,i)=>act.has(r.part)?i:-1).filter(i=>i>=0);
 for(let k=0;k<T.twins;k++){
  for(let t=0;t<40;t++){const a=actIdx[Math.floor(sr()*actIdx.length)],b=actIdx[Math.floor(sr()*actIdx.length)];
   if(a===b||TWIN[a]>=0||TWIN[b]>=0||REG[a].part!==REG[b].part)continue;
   if(spread(a,2).includes(b))continue;TWIN[a]=b;TWIN[b]=a;break}}
 for(let k=0;k<T.dry;k++){
  for(let t=0;t<40;t++){const a=actIdx[Math.floor(sr()*actIdx.length)];if(TWIN[a]>=0||DRY[a])continue;DRY[a]=true;break}}
 for(let k=0;k<T.clear;k++){
  for(let t=0;t<40;t++){const a=actIdx[Math.floor(sr()*actIdx.length)];
   if(TWIN[a]>=0||DRY[a]||CLEAR[a])continue;
   /* 부분에 조각이 셋 이상 남을 때만 투명하게 */
   if(REG.filter((r,j)=>r.part===REG[a].part&&!CLEAR[j]).length<4)continue;CLEAR[a]=true;break}}
 const lightPart=T.light?order.find(k=>act.has(k)):-1;
 let ds=[];const pre=[];
 recipes.forEach((rc,part)=>{
  const idx=REG.map((r,i)=>r.part===part&&!CLEAR[i]?i:-1).filter(i=>i>=0);
  const on=act.has(part),special=on&&idx.some(i=>TWIN[i]>=0||DRY[i]);
  let best=null,bs=-1e9;
  for(let t=0;t<900;t++){
   const rand=mul(L*7919+part*3301+t*104729+11);
   let g=new Array(REG.length).fill(0);const seq=[];
   const lim=rc.max+(on?T.extra:0)+(special?1:0);
   for(let k=0;k<lim;k++){
    const bad=idx.filter(i=>!rc.allow.includes(g[i]));if(!bad.length)break;
    const i=bad[Math.floor(rand()*bad.length)];
    const goals=rc.allow.filter(a=>(a&g[i])===g[i]&&a!==g[i]);if(!goals.length)break;
    const gl=goals[Math.floor(rand()*goals.length)],miss=PRIMS.filter(c=>(gl&BIT[c])&&!(g[i]&BIT[c]));
    const c=miss[Math.floor(rand()*miss.length)],r=1+Math.floor(rand()*2);
    const at=spread(i,r).filter(j=>REG[j].part===part);
    const d=[at[Math.floor(rand()*at.length)],c,r];seq.push(d);g=applyDrop(g,d[0],d[1],d[2]);
   }
   if(idx.some(i=>!rc.allow.includes(g[i])))continue;
   /* 빛 방울: 섞인 조각 하나를 골라 그 원색 하나를 빼고, 부분이 여전히 허용된 색이면 넣는다 */
   let lightBonus=0;
   if(part===lightPart){
    const mixed=idx.filter(i=>[3,5,6].includes(g[i]));
    if(mixed.length){const i=mixed[Math.floor(rand()*mixed.length)],cs=PRIMS.filter(c=>g[i]&BIT[c]);
     const c=cs[Math.floor(rand()*cs.length)],g2=applyDrop(g,i,c,1,true);
     if(idx.every(j=>rc.allow.includes(g2[j]))&&idx.some(j=>g2[j]!==g[j])){seq.push([i,c,1,'L']);g=g2;lightBonus=35}}
    if(!lightBonus)continue;
   }
   const f=idx.filter(i=>g[i]===rc.want).length/idx.length;
   const kinds=new Set(idx.map(i=>g[i])).size;
   /* 마르는 유리가 실제로 순서를 가르는 판(먼저 굳어 다른 색을 막은 판)에 점수를 더 준다 */
   let orderMatters=0;
   if(special&&idx.some(i=>DRY[i])){const rev=seq.slice().reverse().reduce((h,d)=>applyDrop(h,d[0],d[1],d[2]),new Array(REG.length).fill(0));
    if(idx.some(i=>rev[i]!==g[i]))orderMatters=25}
   orderMatters+=lightBonus;
   const sc=-Math.abs(f-rc.ratio)*50+(kinds>1?T.mixBonus:0)+(kinds>2?T.mixBonus*.6:0)-seq.length*(on?T.perDrop:25)+orderMatters;
   if(sc>bs){bs=sc;best=seq}
  }
  if(!best)best=[[idx[0],PRIMS.find(c=>rc.want&BIT[c]),2]];
  if(on)ds=ds.concat(best);else pre.push(...best);
 });
 const pg=runSeq(pre);pg.forEach((x,i)=>{if(x)LOCK[i]=x});
 const start=LOCK.slice();
 const g=runSeq(ds).map((x,i)=>x|start[i]);
 /* 필요 없는 방울: 이미 쓰는 방울과 같은 모양으로 섞어 두어 눈에 띄지 않게 한다 */
 const items=itemsOf(ds),dr=mul(L*977+3);
 for(let k=0;k<T.decoys&&items.length;k++){const it=items[Math.floor(dr()*items.length)];it.n++}
 /* 마르는 유리가 있으면 순서가 결과를 바꿔 가장 적은 방울 계산이 맞지 않으므로 만든 순서의 길이를 기준으로 한다 */
 const par=DRY.some(x=>x)||ds.some(d=>d[3]==='L')?ds.length:Math.min(ds.length,minDrops(g,items));
 return {goal:g,items,start,score:0,name:GNAME,rotate:false,geo:{pic:pi,fine:T.fine},par,pic:true,ds,
  lock:LOCK.slice(),twin:TWIN.slice(),dry:DRY.slice(),clear:CLEAR.slice(),
  intro:{10:'twin',17:'dry',23:'clear',29:'light'}[L]||null,tut:L===0};
}
function genLevel(L){
 /* 모든 판이 그림 창이다. 도안을 차례로 돌린다. */
 return genPic(L,L%PICS.length);
 if(L<OPEN.length){
  const o=OPEN[L];useGeo(o.geo);
  const g=runSeq(o.ds);
  let start=null;
  if(o.scramble){start=g.slice();o.scramble.forEach(([ring,st])=>start=rotateRing(start,ring,st))}
  const items=o.scramble?[]:itemsOf(o.ds);
  const rotate=!!RINGS&&L>=8;
  const par=o.scramble?o.scramble.length:rotate?o.ds.length:minDrops(g,items);
  return {goal:g,items,start,score:0,name:GNAME,rotate,hintRot:!!o.hintRot,geo:o.geo,par};
 }
 const i=L-OPEN.length;
 const gi=Math.floor(i/2)%GEOS.length;
 useGeo(gi);buildSym();
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
 const its=itemsOf(best.ds);
 /* 고리 판은 돌리기까지 포함한 수로 센다. 생성한 순서의 길이가 기준이다. */
 const par=RINGS?best.ds.length:minDrops(best.g,its);
 return {goal:best.g,items:its,score:Math.round(bs),name:GNAME,rotate:!!RINGS,geo:gi,par};
}

/* ---- 상태 ---- */
let li=0,CUR=null,goal=[],cells=[],items=[],sel=0,hist=[],done=false,undone=false;
let peek=false;
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
 if(v===7)cat('surprised',true,2400);
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
  ctx.lineWidth=rr*(OUTLINES?.05:.072);
  REG.forEach(r=>withRot(ctx,r,cx,cy,()=>{path(ctx,r,cx,cy,rr,0);ctx.stroke()}));
  if(OUTLINES){ctx.lineWidth=rr*.12;OUTLINES.forEach(o=>{ctx.beginPath();
   o.forEach((p,k)=>{const x=cx+p[0]*rr,y=cy+p[1]*rr;k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke()})}
 }else{
  if(OUTLINES){
   /* 굵은 납선: 번짐이 넘지 못하는 경계 */
   ctx.strokeStyle=glow>0?mixHex('#3A2E24','#0A0705',glow):'#3A2E24';ctx.lineWidth=rr*.05;
   OUTLINES.forEach(o=>{ctx.beginPath();o.forEach((p,k)=>{const x=cx+p[0]*rr,y=cy+p[1]*rr;k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke()});
   ctx.save();ctx.globalAlpha=.42-glow*.2;ctx.strokeStyle='#B8A487';ctx.lineWidth=rr*.009;ctx.translate(-rr*.008,-rr*.009);
   OUTLINES.forEach(o=>{ctx.beginPath();o.forEach((p,k)=>{const x=cx+p[0]*rr,y=cy+p[1]*rr;k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.stroke()});
   ctx.restore();
  }
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
  let a=alphaMap?(alphaMap[i]!==undefined?alphaMap[i]:1):1;if(a<=0)continue;
  if(LOCK[i]&&!useGlow)a*=.55;else if(LOCK[i])a*=.55+.45*glow;
  withRot(ctx,REG[i],cx,cy,()=>drawRegion(ctx,i,cx,cy,rr,v,a,useGlow?glowOf(i):0))}
 drawSpecial(ctx,cx,cy,rr);
 if(!(useGlow&&lit>0))drawDots(ctx,cx,cy,rr,g);
 leadNet(ctx,cx,cy,rr,glow,'over');
}
/* 색 점: 섞인 색(주황·초록·보라) 조각 가운데에만 든 원색 두 개를 작은 점으로 찍는다.
 비슷한 색(주황과 노랑 등)을 헷갈리지 않게 하려는 것. 원색 조각까지 찍으면 정답을 다 알려 주는 셈이라 빼 둔다.
 완성해 빛이 든 창과 창고 그림에는 찍지 않는다. */
function drawDots(ctx,cx,cy,rr,g){
 const DOT={R:'#E83A3A',Y:'#FFD21F',B:'#2F7FE0'};
 for(let i=0;i<REG.length;i++){const v=g[i];if(![3,5,6].includes(v)||LOCK[i]||CLEAR[i])continue;
  const cs=PRIMS.filter(c=>v&BIT[c]),x=cx+REG[i].cx*rr,y=cy+REG[i].cy*rr,r=rr*.028,gap=r*2.3;
  cs.forEach((c,k)=>{const dx=(k-(cs.length-1)/2)*gap;
   ctx.beginPath();ctx.arc(x+dx,y,r,0,7);ctx.fillStyle=DOT[c];ctx.fill();
   ctx.lineWidth=rr*.009;ctx.strokeStyle='#1A120B';ctx.stroke()})}
}
/* 특수 유리 표시: 마르는 유리는 성에 낀 듯한 빗금, 쌍둥이는 짝마다 같은 색 고리 */
function drawSpecial(ctx,cx,cy,rr){
 if(!DRY.length&&!TWIN.length&&!CLEAR.length)return;
 CLEAR.forEach((c,i)=>{if(!c)return;const r=REG[i];
  ctx.save();path(ctx,r,cx,cy,rr,0);ctx.clip();
  const x0=cx+r.cx*rr,y0=cy+r.cy*rr,gr=ctx.createLinearGradient(x0-rr*.2,y0-rr*.2,x0+rr*.2,y0+rr*.2);
  gr.addColorStop(0,'rgba(245,250,255,.55)');gr.addColorStop(.5,'rgba(200,220,240,.22)');gr.addColorStop(1,'rgba(245,250,255,.42)');
  ctx.fillStyle=gr;ctx.fillRect(x0-rr*.5,y0-rr*.5,rr,rr);ctx.restore()});
 DRY.forEach((d,i)=>{if(!d)return;const r=REG[i];
  ctx.save();path(ctx,r,cx,cy,rr,0);ctx.clip();ctx.globalAlpha=.55;ctx.strokeStyle='#F4F0FF';ctx.lineWidth=rr*.011;
  const x0=cx+r.cx*rr,y0=cy+r.cy*rr,st=rr*.045;
  for(let k=-8;k<=8;k++){ctx.beginPath();ctx.moveTo(x0+k*st-rr*.4,y0-rr*.4);ctx.lineTo(x0+k*st+rr*.4,y0+rr*.4);ctx.stroke()}
  ctx.restore()});
 const seen=new Set();let pair=0;
 TWIN.forEach((j,i)=>{if(j<0||seen.has(i))return;seen.add(i);seen.add(j);
  const col=pair++%2?'#DDE6F0':'#F5CE6A';
  [i,j].forEach(k=>{const x=cx+REG[k].cx*rr,y=cy+REG[k].cy*rr;
   ctx.save();ctx.strokeStyle=col;ctx.lineWidth=rr*.014;ctx.globalAlpha=.9;
   ctx.beginPath();ctx.arc(x,y,rr*.045,0,7);ctx.stroke();
   ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,rr*.014,0,7);ctx.fill();ctx.restore()})});
}
function render(){
 bx.clearRect(0,0,W,W);
 bx.save();
 const amb=bx.createRadialGradient(CX-RR*.18,CY-RR*.22,RR*.05,CX,CY,RR*1.15);
 amb.addColorStop(0,lit>0?'#FFE3A83c':'#FFE3A824');
 amb.addColorStop(1,'#FFE3A800');
 bx.fillStyle=amb;bx.fillRect(0,0,W,W);bx.restore();
 ROT_VIS=drag&&drag.moved?{ring:drag.ring,ang:drag.ang}:WIG;
 /* 목표 그림을 누르면 창 자리에 목표를 크게 보여 준다(다시 누르거나 창을 누르면 돌아온다) */
 if(peek&&!done){drawAll(bx,CX,CY,RR,goal,null,false,'#181209');
  bx.save();bx.font=`${Math.round(RR*.075)}px Jua, sans-serif`;bx.textAlign='center';bx.fillStyle='#F3DFB6';
  bx.fillText('목표 그림 · 누르면 돌아가요',CX,W-RR*.03);bx.restore()}
 else drawAll(bx,CX,CY,RR,cells,anim,true,lit>0?mixHex('#181209','#0A0806',lit):'#181209');
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
 if(CUR&&CUR.tut&&!hist.length&&!done){
  /* 1단계 안내: 첫 방울을 떨어뜨릴 조각에 숨쉬는 고리 */
  const i=CUR.ds[0][0],t=performance.now()/1000,x=CX+REG[i].cx*RR,y=CY+REG[i].cy*RR;
  bx.save();bx.strokeStyle='#FFF3D0';bx.lineWidth=RR*.02;bx.globalAlpha=.55+.4*Math.sin(t*4);
  bx.beginPath();bx.arc(x,y,RR*(.09+.02*Math.sin(t*4)),0,7);bx.stroke();bx.restore();
  if(!tutLoop){tutLoop=true;(function tl(){if(!CUR||!CUR.tut||hist.length||done){tutLoop=false;render();return}
   if(!anim)render();requestAnimationFrame(tl)})()}
 }
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
 const idle=performance.now()-idleT>12000;
 /* 방울이 많으면(필요 없는 방울·빛 방울까지 7~8개) 한 줄에 들어가도록 줄이고, 그래도 넘치면 두 줄로 */
 const baseW=it=>it.r===1?44:it.r===2?54:62,slot=it=>Math.max(baseW(it),it.sub?72:50);
 const avail=Math.min(window.innerWidth||400,440)-32-10,need=items.reduce((a,it)=>a+slot(it),0)+18*Math.max(0,items.length-1);
 const sc=Math.max(.72,Math.min(1,avail/need));
 $('paints').style.gap=`10px ${Math.round(18*sc)}px`;
 items.forEach((it,k)=>{
  const w=Math.round(baseW(it)*sc);
  const lab=(it.r===1?'옆까지':it.r===2?'두 칸':'세 칸')+(it.sub?' 빼기':'');
  /* 방울 표정: 고른 방울은 신남, 다 쓴 방울은 잠듦, 한동안 손대지 않으면 졸림 */
  const face=it.n<=0?'asleep':sel===k?'excited':idle?'sleepy':'base';
  h+=`<div class="pw" style="min-width:${Math.round(slot(it)*sc)}px"><button class="p${sel===k?' on':''}${it.sub?' light':''}" data-k="${k}" ${it.n<=0?'disabled':''} aria-label="${lab} 물감"
   style="width:${w}px;height:${Math.round(w*1.18)}px;background-image:url(${CHAR.drop[it.c][face]})">
   <span class="cnt">${it.n}</span></button><span class="rng" style="font-size:${(11*Math.max(.82,sc)).toFixed(1)}px">${lab}</span></div>`});
 $('paints').innerHTML=h}
let drag=null,rotatedOnce=false,hintLoop=false,tutLoop=false;
/* 창턱 고양이: 판이 열리면 궁금, 조금 뒤 기본, 탁해지면 궁금, 완성하면 기쁨 */
let catT=0,lastPaint='';
/* 새 표정 그림이 없으면 비슷한 표정으로 대신한다 */
const CATOK={base:1,curious:1,happy:1,sunny:1,surprised:1},CATALT={sleepy:'base',yawn:'curious',wave:'happy',love:'sunny'};
['sleepy','yawn','wave','love'].forEach(k=>{if(!CHAR.cat[k])return;const im=new Image();im.onload=()=>CATOK[k]=1;im.src=CHAR.cat[k]});
const catSrc=f=>CHAR.cat[CATOK[f]?f:(CATALT[f]||'base')];
let catNap=false;
function cat(face,hop,back){const el=$('cat');if(!el)return;el.src=catSrc(face);
 if(face!=='sleepy'&&catNap){catNap=false;$('catz').classList.remove('on')}
 if(hop){el.classList.remove('hop');void el.offsetWidth;el.classList.add('hop')}
 clearTimeout(catT);if(back)catT=setTimeout(()=>{if(!done)el.src=CHAR.cat.base},back)}
/* 20초 동안 아무것도 하지 않으면 고양이가 꾸벅꾸벅 존다. 화면을 누르면 하품하며 깬다 */
setInterval(()=>{if(!done&&CUR&&!catNap&&!document.hidden&&performance.now()-idleT>20000){catNap=true;cat('sleepy');catNap=true;$('catz').classList.add('on')}},1000);
document.addEventListener('pointerdown',()=>{if(catNap){catNap=false;$('catz').classList.remove('on');cat('yawn',true,1400)}},true);
/* 고양이 머리 위로 하트가 몽글몽글 */
function catHearts(n){const box=$('cathearts');if(!box)return;
 for(let i=0;i<n;i++)setTimeout(()=>{const h=document.createElement('i');h.style.left=(20+Math.random()*50)+'%';h.style.animationDuration=(1.4+Math.random()*.8)+'s';
  h.innerHTML='<svg viewBox="0 0 24 22"><path d="M12 21C5 15 1 11 1 6.5 1 3.4 3.4 1 6.4 1c2.2 0 4 1.2 5.6 3.2C13.6 2.2 15.4 1 17.6 1 20.6 1 23 3.4 23 6.5 23 11 19 15 12 21Z" fill="#FF8FA6" stroke="#B8475E" stroke-width="1.4"/></svg>';
  box.appendChild(h);setTimeout(()=>h.remove(),2400)},i*180)}
setInterval(()=>{if(!done&&CUR){const k=performance.now()-idleT>12000;if(k!==lastPaint){lastPaint=k;renderPaints()}}},1000);
function local(e){const rc=bc.getBoundingClientRect();
 return {x:((e.clientX-rc.left)/rc.width*W-CX)/RR, y:((e.clientY-rc.top)/rc.height*W-CY)/RR}}
/* 누른 자리가 조각 안이 아니면(납선 위 등) 가장 가까운 조각을 고른다. 작은 조각도 손가락으로 누르기 쉽게 */
function segDist(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy)}
function regionAt(p){for(let i=REG.length-1;i>=0;i--)if(inside(REG[i],p.x,p.y))return i;
 let best=-1,bd=0.07;
 REG.forEach((r,i)=>{for(let k=0;k<r.pts.length;k++){const d=segDist(p.x,p.y,r.pts[k],r.pts[(k+1)%r.pts.length]);if(d<bd){bd=d;best=i}}});
 return best}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}
gc.addEventListener('click',()=>{if(done)return;peek=!peek;sPick();render()});
bc.addEventListener('pointerdown',e=>{
 if(done)return;
 if(peek){peek=false;render();return}
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
 if(LOCK[dr.i]){$('msg').innerHTML='<small>이 유리는 이미 끼워져 있어요</small>';return}
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
 const before=cells.slice(), touched=reach(at,it.r);$('msg').textContent='';
 cells=applyDrop(cells,at,it.c,it.r,it.sub);it.n--;
 sDrop();setTimeout(sFill,50);
 fxDrop(at,it.c);
 const newMix=touched.find(i=>cells[i]!==before[i]&&[3,5,6,7].includes(cells[i]));
 if(newMix!==undefined)setTimeout(()=>fxName(newMix,cells[newMix]),230);
 if(touched.some(i=>before[i]&&before[i]!==cells[i]))setTimeout(sMix,180);
 const A={};anim=A;touched.forEach(i=>A[i]=before[i]?1:0);
 const dist={};dist[at]=0;let f=[at];
 for(let d=1;d<=it.r;d++){const nx=[];f.forEach(i=>ADJ[i].forEach(j=>{if(dist[j]===undefined){dist[j]=d;nx.push(j)}}));f=nx}
 touched.forEach(i=>{if(dist[i]===undefined)dist[i]=it.r});
 const t0=performance.now(),md=Math.max(1,it.r);
 /* 빠르게 연달아 떨어뜨리면 새 방울의 번짐이 이전 번짐을 넘겨받는다(이전 것은 여기서 멈춘다) */
 (function step(){if(anim!==A){check();return}
  const t=(performance.now()-t0)/420;let alive=false;
  touched.forEach(i=>{const p=Math.min(1,Math.max(0,(t-(dist[i]/md)*.5)/.5));A[i]=p;if(p<1)alive=true});
  render();if(alive)requestAnimationFrame(step);else{anim=null;render();check()}})();
 if(it.n<=0){const n2=items.findIndex(o=>o.n>0);sel=n2<0?sel:n2}
 renderPaints()}
function check(){
 for(let i=0;i<REG.length;i++)if((cells[i]||0)!==(goal[i]||0))return;
 done=true;
 motes=[...Array(30)].map(()=>{const a=Math.random()*Math.PI*2,d=Math.random()*RR*.9;
  return {x:CX+Math.cos(a)*d,y:CY+Math.sin(a)*d,r:1.8+Math.random()*4,a:.25+Math.random()*.5,p:Math.random()*6,vy:-(.1+Math.random()*.28)}});
 const moves=hist.length,st=1+(undone?0:1)+(moves<=CUR.par?1:0);
 const before=starTotal(),vBefore=setHave();
 document.body.classList.add('lit');sWin();saveWon(li,st);updGal();fxWin();cat(st===3?'sunny':'happy',true);
 showStars(st,moves);gotDeco(before);gotHouse(vBefore);
 litT=performance.now();
 (function b(){lit=Math.min(1,(performance.now()-litT)/1700);
  motes.forEach(m=>{m.y+=m.vy;if(m.y<CY-RR)m.y=CY+RR});render();
  if(lit<1)requestAnimationFrame(b);else{$('nextBtn').classList.add('show');setTimeout(()=>{if(done)cat('wave',true)},2600);
   (function l(){if(!done)return;motes.forEach(m=>{m.y+=m.vy;if(m.y<CY-RR)m.y=CY+RR});render();requestAnimationFrame(l)})()}})()}
$('undoBtn').addEventListener('click',()=>{if(!hist.length||done)return;
 undone=true;const h=hist.pop();cells=h.cells;items=h.items;sel=h.sel;origins=h.origins||[];sUndo();$('msg').textContent='';render();cat('curious',false,1500)});
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
 sel=+b.dataset.k;idleT=performance.now();sPick();renderPaints();$('msg').textContent=''});
/* ---------- 창고 ---------- */
let SAVED=[];
let STARS={};
function loadSaved(){try{const v=localStorage.getItem('lumenfall:pic-won');SAVED=v?JSON.parse(v):[]}catch(e){SAVED=[]}
 try{STARS=JSON.parse(localStorage.getItem('lumenfall:pic-stars')||'{}')||{}}catch(e){STARS={}}}
/* 창고용 완성 그림 기억: 판을 다시 만들지 않고 바로 그리려고 목표 색과 조각 모양 종류를 적어 둔다 */
let SNAP={};
try{SNAP=JSON.parse(localStorage.getItem('lumenfall:pic-snap')||'{}')||{}}catch(e){SNAP={}}
/* 도안 조각이 바뀌면(SNAPV를 올리면) 예전 기록은 버리고 다시 만든다 */
const SNAPV=2;
function snapOk(k){const sn=SNAP[k];return !!sn&&sn.v===SNAPV}
function snapOf(k,lv){return {v:SNAPV,g:lv.goal.join(''),f:lv.geo.fine?1:0,c:(lv.clear||[]).map((x,i)=>x?i:-1).filter(i=>i>=0)}}
function saveSnap(k,lv){SNAP[k]=snapOf(k,lv);try{localStorage.setItem('lumenfall:pic-snap',JSON.stringify(SNAP))}catch(e){}}
function saveWon(k,st){
 if(CUR&&CUR.pic)saveSnap(k,CUR);
 if(st&&(STARS[k]||0)<st){STARS[k]=st;try{localStorage.setItem('lumenfall:pic-stars',JSON.stringify(STARS))}catch(e){}}
 if(SAVED.includes(k))return;SAVED.push(k);SAVED.sort((a,b)=>a-b);
 try{localStorage.setItem('lumenfall:pic-won',JSON.stringify(SAVED))}catch(e){}}
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function parText(){return CUR.rotate?`${CUR.par}번 만에`:`방울 ${CUR.par}개로`}
function showStars(st,moves){
 const ok1=!undone,ok2=moves<=CUR.par;
 $('msg').innerHTML=`<div class="stars">${[0,1,2].map(k=>`<span class="st" style="animation-delay:${.9+k*.28}s">${k<st?'★':'☆'}</span>`).join('')}</div>`+
  `<small><span class="${ok2?'ok':'no'}">${parText()}</span> · <span class="${ok1?'ok':'no'}">되돌리기 없이</span></small>`;
 for(let k=0;k<st;k++)setTimeout(()=>{tone(880*Math.pow(1.26,k),.35,'sine',.07);buzz(14)},900+k*280);
}
function updGal(){$('galN').textContent=SAVED.length;
 $('galEmpty').classList.toggle('hide',SAVED.length>0)}
/* 창고: 그림을 묶음으로 나눠 벽에 건다. 한 번이라도 완성한 그림은 가장 최근 창을, 아직 못 만든 그림은 납선만 보여 준다. */
const SETS=[
 ["정원", ["튤립", "나무", "버섯", "나비", "선인장", "달팽이", "해바라기", "네잎클로버", "벚꽃", "무당벌레", "꿀벌"]],
 ["과일과 채소", ["사과", "체리", "딸기", "포도", "당근", "수박", "호박"]],
 ["맛있는 것", ["아이스크림", "컵케이크", "케이크", "머그컵"]],
 ["하늘과 우주", ["해님", "별", "로켓", "열기구", "무지개", "초승달", "토성", "구름과 번개", "연"]],
 ["바다", ["물고기", "돛단배", "고래", "게", "문어", "잠수함", "등대"]],
 ["탈것", ["자동차", "버스", "기차", "비행기", "트럭"]],
 ["집과 학교", ["집", "연필", "종", "책", "우산", "책가방", "시계", "전구", "물감 팔레트", "트로피"]],
 ["동물 친구", ["고양이 얼굴", "부엉이", "거북", "여우", "곰", "토끼", "펭귄", "오리", "병아리"]],
 ["축제와 계절", ["눈사람", "단풍잎", "크리스마스트리", "선물상자", "왕관", "성", "텐트", "하트 풍선", "열쇠", "촛불"]]];
function drawThumb(cv,g,lit1){
 const c=cv.getContext('2d'),S=cv.width;c.clearRect(0,0,S,S);
 const sl=lit;lit=lit1?1:0;drawAll(c,S/2,S/2,S*.45,g,null,!!lit1,'#181209');lit=sl;
}
function buildGallery(){
 const wrap=$('gallery');wrap.innerHTML='';
 wrap.appendChild(villageSection());
 wrap.appendChild(decoSection());
 const N=PICS.length,byName={};PICS.forEach((p,i)=>byName[p.name]=i);
 let have=0;
 SETS.forEach(([title,names])=>{
  const got=names.filter(n=>SAVED.some(k=>k%N===byName[n])).length;have+=got;
  const sec=document.createElement('section');sec.className='gset'+(got===names.length?' full':'');sec.dataset.set=title;
  sec.innerHTML=`<h3>${title}<span>${got} / ${names.length}${got===names.length?' · 모두 모았어요':''}</span></h3><div class="wall"></div>`;
  const wall=sec.querySelector('.wall');
  names.forEach(n=>{
   const pi=byName[n];if(pi===undefined)return;
   const ks=SAVED.filter(k=>k%N===pi),d=document.createElement('div');d.className='gitem'+(ks.length?'':' todo');
   const cv=document.createElement('canvas');cv.width=cv.height=200;
   const fr=document.createElement('div');fr.className='frame';fr.appendChild(cv);d.appendChild(fr);
   const lab=document.createElement('span');
   if(ks.length){const k=Math.max(...ks),best=Math.max(...ks.map(x=>STARS[x]||1));
    if(!snapOk(k))saveSnap(k,genLevel(k));
    const sn=SNAP[k];usePic(pi,!!sn.f);sn.c.forEach(i=>CLEAR[i]=true);
    drawThumb(cv,sn.g.split('').map(Number),true);lab.innerHTML=`${n}<b>${starStr(best)}</b>${ks.length>1?`<i>${ks.length}장</i>`:''}`}
   else{usePic(pi,false);drawThumb(cv,new Array(REG.length).fill(0),false);lab.textContent='?'}
   d.appendChild(lab);wall.appendChild(d)});
  wrap.appendChild(sec)});
 $('sheetCount').textContent=`그림 ${have} / ${N}`;
 /* 지금 판의 창 모양과 특수 유리로 되돌린다 */
 if(CUR){useGeo(CUR.geo);if(CUR.pic){LOCK=CUR.lock.slice();TWIN=CUR.twin.slice();DRY=CUR.dry.slice();CLEAR=CUR.clear.slice()}}
 $('galEmpty').classList.add('hide');
}
/* ---------- 마을 지도 ---------- */
/* 묶음마다 건물 하나. 모은 그림만큼 창에 불이 들어오고, 묶음을 다 모으면 건물이 환해진다. */
function setHave(){const N=PICS.length,byName={},out={};PICS.forEach((p,i)=>byName[p.name]=i);
 const got=new Set(SAVED.map(k=>k%N));
 SETS.forEach(([t,names])=>{out[t]=[names.filter(n=>got.has(byName[n])).length,names.length]});return out}
function villageSection(){
 const have=setHave(),full=VILLAGE.filter(b=>have[b.set]&&have[b.set][0]>=have[b.set][1]).length;
 const sec=document.createElement('section');sec.className='gset';
 sec.innerHTML=`<h3>마을<span>불 켜진 집 ${full} / ${VILLAGE.length}</span></h3>`+villageSVG(have)+
  `<div class="vlist">${VILLAGE.map((b,bi)=>{const [g,n]=have[b.set];return `<button data-i="${bi}" class="${g>=n?'full':''}">${b.name} ${g}/${n}<small>${b.set}</small><i><b style="width:${Math.round(100*g/n)}%"></b></i></button>`}).join('')}</div>`+
  `<p class="dnote">마을 그림을 누르면 크게 보여요. 건물 이름을 누르면 그 묶음 그림으로 가요.</p>`;
 sec.querySelector('.village').addEventListener('click',()=>openVillage(have));
 sec.querySelectorAll('.vlist button').forEach(b=>b.addEventListener('click',()=>goSet(VILLAGE[+b.dataset.i].set)));
 return sec}
/* 마을 크게 보기: 옆으로 미는 파노라마. 건물을 누르면 그 묶음 벽으로 간다 */
function openVillage(have){
 const box=$('vbigScroll');box.innerHTML=villageSVG(have);
 box.querySelectorAll('.vb').forEach(g=>{g.style.cursor='pointer';g.addEventListener('click',e=>{e.stopPropagation();closeVillage();goSet(VILLAGE[+g.dataset.i].set)})});
 $('vbig').classList.add('open');sPick();
 requestAnimationFrame(()=>{box.scrollLeft=(box.scrollWidth-box.clientWidth)/2});
}
function closeVillage(){$('vbig').classList.remove('open')}
function goSet(name){
 const sec=[...document.querySelectorAll('#gallery .gset')].find(s=>s.dataset.set===name);if(!sec)return;
 sec.scrollIntoView({behavior:'smooth',block:'start'});
 sec.classList.remove('flash');void sec.offsetWidth;sec.classList.add('flash');sPick();
}
$('vbigClose').addEventListener('click',closeVillage);
function gotHouse(before){
 const now=setHave(),fresh=VILLAGE.filter(b=>{const a=before[b.set],c=now[b.set];return c[0]>=c[1]&&a[0]<a[1]});
 if(!fresh.length)return;
 setTimeout(()=>{tone(660,.4,'triangle',.06);tone(990,.5,'sine',.05,0,.18);buzz([0,20,60,20]);cat('love',true);catHearts(6)},2200);
 $('msg').insertAdjacentHTML('beforeend',`<small class="newdeco">「${fresh[0].set}」 그림을 다 모았어요!<br>마을 ${fresh.map(b=>b.name).join(' · ')}에 불이 켜졌어요 · 창고에서 보세요</small>`);
}
/* ---------- 창턱 장식 · 방 꾸미기 ---------- */
/* 별(단계마다 최고 기록)을 모으면 장식이 하나씩 생긴다. 얻은 장식은 열 개까지 꺼내 놓을 수 있다.
   놓는 자리는 아래 창턱(늘 그대로)과 벽 선반(세 개까지). 선반은 게임 그림(창과 목표 그림)과 안내 글을
   절대 가리지 않는 빈 벽에만 걸린다. 고양이는 창턱 위에서만 옮긴다(몸이 커서 선반에 올리면 그림을 가린다).
   자리 기록 lumenfall:room = {cat:{s:'sill',x}, shelves:[{x,y}], items:[{id,s,x}]}
   s가 'sill'이면 x는 창턱 폭에서의 비율(0~1), 선반 번호면 x는 선반 가운데에서 벗어난 정도(-0.42~0.42).
   선반 x·y는 방(목표 그림 줄 위 ~ 창턱) 안의 픽셀 대신 비율이고 y는 선반 윗면. */
let SILL=[];
try{SILL=JSON.parse(localStorage.getItem('lumenfall:sill')||'[]')||[]}catch(e){SILL=[]}
const SILL_MAX=10,SH_MAX=3,SH_W=96,SH_BELOW=16,SH_ABOVE=54;
let ROOM=null;
try{ROOM=JSON.parse(localStorage.getItem('lumenfall:room')||'null')}catch(e){ROOM=null}
if(!ROOM||!Array.isArray(ROOM.items))ROOM={cat:{s:'sill',x:.87},shelves:[],items:[]};
if(!Array.isArray(ROOM.shelves)){ROOM.shelves=[];ROOM.items.forEach(o=>{if(o.s!=='sill'){o.s='sill';o.x=-1}});delete ROOM.tables}
if(ROOM.cat.s!=='sill')ROOM.cat={s:'sill',x:.87};
function starTotal(){let t=0;for(const k in STARS)t+=+STARS[k]||0;return t}
function saveRoom(){SILL=ROOM.items.map(o=>o.id);
 try{localStorage.setItem('lumenfall:sill',JSON.stringify(SILL));localStorage.setItem('lumenfall:room',JSON.stringify(ROOM))}catch(e){}}
function saveSill(){ /* 목록(SILL)이 바뀌면 방 자리도 맞춘다 */
 ROOM.items=ROOM.items.filter(o=>SILL.includes(o.id));
 ROOM.items.forEach(o=>{if(o.x===-1)o.x=sillFree()});
 SILL.forEach(id=>{if(!ROOM.items.some(o=>o.id===id))ROOM.items.push({id,s:'sill',x:sillFree()})});saveRoom()}
/* 창턱에서 비어 있는 자리 하나(왼쪽부터). 고양이 자리는 피한다 */
function sillFree(){const used=ROOM.items.filter(o=>o.s==='sill'&&o.x>=0).map(o=>o.x);used.push(ROOM.cat.x,ROOM.cat.x-.08);
 for(let x=.07;x<.96;x+=.11)if(used.every(u=>Math.abs(u-x)>.09))return +x.toFixed(3);return .07+Math.random()*.6}
/* 장식은 제미나이 그림(ART.deco)을 쓰고, 그림이 없으면 deco.js의 SVG로 그린다 */
const svgOf=d=>(typeof ART!=='undefined'&&ART.deco[d.id])?`<img class="dimg d-${d.id}" src="${ART.deco[d.id]}" alt="" draggable="false">`:`<svg viewBox="0 0 64 64" aria-hidden="true">${d.svg}</svg>`;
/* 벽 선반: 아래 창턱과 같은 나무 판 + 작은 받침 두 개 */
const SH_SVG=`<svg viewBox="0 0 96 26" aria-hidden="true"><defs><linearGradient id="shw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A6440"/><stop offset="1" stop-color="#5A3E26"/></linearGradient></defs>
<path d="M14 9V14Q14 24 26 24H28V9ZM82 9V14Q82 24 70 24H68V9Z" fill="#4A3220" stroke="#3B2515" stroke-width="1.2"/>
<rect x="1" y="1" width="94" height="9" rx="2" fill="url(#shw)" stroke="#3B2515" stroke-width="1.2"/><path d="M4 3.2H92" stroke="#B08658" stroke-width="1.1" opacity=".85"/></svg>`;
/* 방의 크기: 목표 그림 줄 위에서 창턱 윗면까지 */
/* 가로로 넓은 화면(태블릿·컴퓨터)에서는 방이 화면 양옆 빈 벽까지 넓어져 선반을 더 달 수 있다 */
function roomGeo(){const room=$('room'),wrap=room.parentElement,sb=$('sillBar'),gr=document.querySelector('.goalrow');
 const off=Math.max(0,wrap.getBoundingClientRect().left),top=gr.offsetTop-6,line=sb.offsetTop+sb.offsetHeight-3;
 const W=Math.max(wrap.clientWidth,document.documentElement.clientWidth);
 return {top,H:line-top,W,off,sx0:off+sb.offsetLeft,sw:sb.offsetWidth}}
/* 선반이 가리면 안 되는 곳: 창(게임 그림) 전체, 목표 그림, 안내 글, 창턱 위 고양이 */
function noGo(g){const base=$('room').getBoundingClientRect(),out=[];
 const add=(r,m)=>{if(r&&r.width)out.push({l:r.left-base.left-m,t:r.top-base.top-m,r:r.right-base.left+m,b:r.bottom-base.top+m})};
 add($('board').getBoundingClientRect(),6);add($('goal').getBoundingClientRect(),6);
 const rg=document.createRange();rg.selectNodeContents(document.querySelector('.goallab'));[...rg.getClientRects()].forEach(r=>add(r,6));
 const cb=$('catbox').getBoundingClientRect();if(cb.width)add(cb,4);
 return out}
function shelfOk(g,ng,x,y,skip){const a={l:x-SH_W/2-4,r:x+SH_W/2+4,t:y-SH_ABOVE,b:y+SH_BELOW+4};
 if(a.l<0||a.r>g.W||a.t<0||a.b>g.H-56)return false;
 if(ng.some(n=>a.l<n.r&&a.r>n.l&&a.t<n.b&&a.b>n.t))return false;
 return ROOM.shelves.every((s,i)=>i===skip||Math.abs(s.x*g.W-x)>=SH_W+6||Math.abs(s.y*g.H-y)>=SH_ABOVE+SH_BELOW+6)}
/* (x,y)에서 가장 가까운, 선반을 걸 수 있는 빈 벽. 없으면 null */
function shelfSpot(g,ng,x,y,skip){let best=null,bd=1e9;
 for(let yy=SH_ABOVE;yy<=g.H-60-SH_BELOW;yy+=4)for(let xx=SH_W/2+4;xx<=g.W-SH_W/2-4;xx+=4){
  const d=(xx-x)**2+(yy-y)**2;if(d<bd&&shelfOk(g,ng,xx,yy,skip)){bd=d;best={x:xx,y:yy}}}
 return best}
function surfPos(g,s,x){if(s==='sill')return {x:g.sx0+x*g.sw,y:g.H};const t=ROOM.shelves[s];if(!t)return {x:g.sx0+.5*g.sw,y:g.H};
 return {x:t.x*g.W+x*SH_W,y:t.y*g.H}}
function renderRoom(fresh){
 const g=roomGeo(),room=$('room');room.style.top=g.top+'px';room.style.height=g.H+'px';room.style.left=(-g.off)+'px';room.style.width=g.W+'px';
 const c=surfPos(g,'sill',ROOM.cat.x),cb=$('catbox');cb.style.left=c.x+'px';cb.style.top=c.y+2+'px';cb.style.zIndex=3+Math.round(c.y/10);
 /* 화면 크기·안내 글 길이가 바뀌어 선반이 그림에 걸리면 가장 가까운 빈 벽으로 옮기고, 빈 벽이 없으면 치운다 */
 const ng=noGo(g);let moved=false;
 for(let i=ROOM.shelves.length-1;i>=0;i--){const s=ROOM.shelves[i],x=s.x*g.W,y=s.y*g.H;
  if(shelfOk(g,ng,x,y,i))continue;const sp=shelfSpot(g,ng,x,y,i);moved=true;
  if(sp){s.x=sp.x/g.W;s.y=sp.y/g.H}else dropShelf(i)}
 if(moved)saveRoom();
 $('roomT').innerHTML=ROOM.shelves.map((t,i)=>`<div class="tbl" data-k="t${i}" style="left:${t.x*g.W}px;top:${t.y*g.H+SH_BELOW+10}px">${SH_SVG}</div>`).join('');
 ROOM.items=ROOM.items.filter(o=>o.s==='sill'||ROOM.shelves[o.s]);
 $('roomI').innerHTML=ROOM.items.map((o,i)=>{const d=DECO.find(d=>d.id===o.id);if(!d)return'';const p=surfPos(g,o.s,o.x);
  return `<div class="it${o.id===fresh?' d':''}" data-k="i${i}" title="${d.name}" style="left:${p.x}px;top:${p.y}px;z-index:${2+Math.round(p.y/10)}">${svgOf(d)}</div>`}).join('');
 if(decorating)renderTray();
}
function dropShelf(ti){ROOM.items.forEach(o=>{if(o.s===ti){o.s='sill';o.x=-1}else if(typeof o.s==='number'&&o.s>ti)o.s--});
 ROOM.shelves.splice(ti,1);ROOM.items.forEach(o=>{if(o.x===-1)o.x=sillFree()})}
const renderSill=renderRoom;
/* ----- 꾸미기 모드 ----- */
let decorating=false,rdrag=null;
function setDecor(on){decorating=on;document.body.classList.toggle('decorating',on);if(on){peek=false;render()}renderRoom();sPick()}
function hint(t){$('decohint').textContent=t}
function renderTray(){
 const tot=starTotal(),free=DECO.filter(d=>tot>=d.need&&!SILL.includes(d.id));
 $('tray').innerHTML=free.length?free.map(d=>`<button data-id="${d.id}" title="${d.name}">${svgOf(d)}</button>`).join(''):`<span class="empty2">${DECO.some(d=>tot>=d.need)?'얻은 장식을 모두 꺼내 놓았어요':'별을 모으면 장식이 생겨요'}</span>`;
 $('tblBtn').disabled=ROOM.shelves.length>=SH_MAX;$('tblBtn').textContent=`선반 달기 ${ROOM.shelves.length}/${SH_MAX}`;
 hint(`장식 ${SILL.length}/${SILL_MAX} · 장식·선반·고양이를 끌어서 옮겨요. 아래 칸으로 끌어 오면 내려놓아요.`)}
$('decoBtn').addEventListener('click',()=>setDecor(true));
$('decoDone').addEventListener('click',()=>setDecor(false));
$('tray').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(!b)return;
 if(SILL.length>=SILL_MAX){hint(`한 번에 ${SILL_MAX}개까지 놓을 수 있어요. 놓인 장식 하나를 아래 칸으로 끌어 내려 주세요.`);return}
 ROOM.items.push({id:b.dataset.id,s:'sill',x:sillFree()});saveRoom();renderRoom(b.dataset.id);sPick()});
$('tblBtn').addEventListener('click',()=>{if(ROOM.shelves.length>=SH_MAX)return;const g=roomGeo(),ng=noGo(g);
 const sp=shelfSpot(g,ng,g.W,0,-1);
 if(!sp){hint('그림을 가리지 않고 선반을 달 빈 벽이 더 없어요.');return}
 ROOM.shelves.push({x:sp.x/g.W,y:sp.y/g.H});saveRoom();renderRoom();sPick()});
$('resetRoom').addEventListener('click',()=>{ROOM.shelves=[];ROOM.cat={s:'sill',x:.87};
 ROOM.items.forEach(o=>{o.s='sill';o.x=-1});ROOM.items.forEach(o=>{o.x=sillFree()});saveRoom();renderRoom();sPick()});
/* 끌기: 놓을 때 가장 가까운 윗면(창턱이나 선반)에 앉힌다. 아래 칸 위에서 놓으면 내려놓는다.
   선반은 그림을 가리지 않는 가장 가까운 빈 벽에 붙는다. 고양이는 창턱을 따라서만 움직인다 */
function roomPt(e){const r=$('room').getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
function snapFor(g,p){let best={s:'sill',y:g.H,x0:g.sx0,x1:g.sx0+g.sw},bd=Math.abs(p.y-g.H);
 ROOM.shelves.forEach((t,i)=>{const cx=t.x*g.W,y=t.y*g.H;
  if(p.x>cx-SH_W/2-6&&p.x<cx+SH_W/2+6){const d=Math.abs(p.y-y);if(d<bd){bd=d;best={s:i,y,x0:cx-SH_W/2,x1:cx+SH_W/2}}}});return best}
function overTray(e){const r=$('tray').getBoundingClientRect();return e.clientY>r.top-6&&e.clientY<r.bottom+6&&e.clientX>r.left&&e.clientX<r.right}
$('room').addEventListener('pointerdown',e=>{if(!decorating)return;const el=e.target.closest('.it,.tbl,.catbox');if(!el)return;
 e.preventDefault();const p=roomPt(e),k=el===$('catbox')?'cat':el.dataset.k;
 rdrag={el,k,dx:parseFloat(el.style.left)-p.x,dy:parseFloat(el.style.top)-p.y,id:e.pointerId,ng:k[0]==='t'?noGo(roomGeo()):null};el.classList.add('drag');
 try{el.setPointerCapture(e.pointerId)}catch(_){} sPick()});
$('room').addEventListener('pointermove',e=>{if(!rdrag||e.pointerId!==rdrag.id)return;const p=roomPt(e),g=roomGeo();
 let x=p.x+rdrag.dx,y=p.y+rdrag.dy;if(rdrag.k==='cat')y=g.H+2;
 rdrag.el.style.left=x+'px';rdrag.el.style.top=y+'px';
 const sl=$('snapline'),tr=overTray(e)&&rdrag.k!=='cat';$('tray').classList.toggle('hot',tr);
 if(rdrag.k[0]==='t'){const ok=shelfOk(g,rdrag.ng,x,y-SH_BELOW-10,+rdrag.k.slice(1));rdrag.el.classList.toggle('bad',!ok&&!tr);sl.classList.remove('on')}
 else if(!tr){const sn=rdrag.k==='cat'?{x0:g.sx0,x1:g.sx0+g.sw,y:g.H}:snapFor(g,{x,y});sl.style.left=sn.x0+'px';sl.style.width=(sn.x1-sn.x0)+'px';sl.style.top=sn.y+'px';sl.classList.add('on')}
 else sl.classList.remove('on')});
function endRoomDrag(e){if(!rdrag||e.pointerId!==rdrag.id)return;const d=rdrag;rdrag=null;d.el.classList.remove('drag','bad');
 $('snapline').classList.remove('on');$('tray').classList.remove('hot');
 const p=roomPt(e),g=roomGeo(),x=p.x+d.dx,y=p.y+d.dy,tray=overTray(e);
 if(d.k==='cat'){ROOM.cat.x=Math.max(.06,Math.min(.94,(x-g.sx0)/g.sw))}
 else if(d.k[0]==='i'){const o=ROOM.items[+d.k.slice(1)];
  if(tray)ROOM.items.splice(+d.k.slice(1),1);
  else{const sn=snapFor(g,{x,y});o.s=sn.s;
   o.x=sn.s==='sill'?Math.max(.03,Math.min(.97,(x-g.sx0)/g.sw)):Math.max(-.42,Math.min(.42,(x-ROOM.shelves[sn.s].x*g.W)/SH_W))}}
 else{const ti=+d.k.slice(1);
  if(tray)dropShelf(ti);
  else{const sp=shelfSpot(g,d.ng||noGo(g),x,y-SH_BELOW-10,ti);
   if(sp){ROOM.shelves[ti].x=sp.x/g.W;ROOM.shelves[ti].y=sp.y/g.H}else hint('그림을 가리지 않는 빈 벽에만 선반을 달 수 있어요.')}}
 saveRoom();renderRoom();tone(620,.06,'sine',.06);buzz(8)}
$('room').addEventListener('pointerup',endRoomDrag);$('room').addEventListener('pointercancel',endRoomDrag);
function gotDeco(before){
 const now=starTotal(),fresh=DECO.filter(d=>d.need>before&&d.need<=now);if(!fresh.length)return;
 let placed=false;
 fresh.forEach(d=>{if(SILL.length<SILL_MAX&&!SILL.includes(d.id)){SILL.push(d.id);placed=true}});
 saveSill();
 setTimeout(()=>{renderSill(fresh[fresh.length-1].id);tone(1320,.3,'sine',.06);buzz(12);cat('surprised',true);setTimeout(()=>{if(done)cat('happy',true)},900)},1900);
 $('msg').insertAdjacentHTML('beforeend',`<small class="newdeco">새 장식 「${fresh.map(d=>d.name).join('」 「')}」을 얻었어요`+
  (placed?'<br>창턱에 올려 두었어요':'<br>창고에서 창턱에 올릴 수 있어요')+'</small>');
}
function decoSection(){
 const tot=starTotal(),nx=DECO.find(d=>d.need>tot),sec=document.createElement('section');sec.className='gset';
 sec.innerHTML=`<h3>창턱 꾸미기<span>별 ${tot}개${nx?` · 다음 장식까지 ${nx.need-tot}개`:' · 모두 얻었어요'}</span></h3><div class="decos"></div>`+
  `<p class="dnote">얻은 장식을 누르면 창턱에 올리거나 내려요. 한 번에 ${SILL_MAX}개까지 놓을 수 있어요. 자리를 옮기려면 게임 화면의 「꾸미기」를 누르세요.</p>`;
 const box=sec.querySelector('.decos'),note=sec.querySelector('.dnote');
 DECO.forEach(d=>{const open=tot>=d.need,b=document.createElement('button');
  b.className='dk'+(open?'':' lock')+(SILL.includes(d.id)?' on':'');
  b.innerHTML=svgOf(d)+`<span>${open?d.name:'별 '+d.need+'개'}</span>`;
  if(open)b.addEventListener('click',()=>{
   const at=SILL.indexOf(d.id);
   if(at>=0){SILL.splice(at,1);b.classList.remove('on');saveSill();renderSill()}
   else if(SILL.length>=SILL_MAX){note.textContent='창턱이 가득 찼어요. 올려 둔 장식 하나를 먼저 눌러 내려 주세요.';return}
   else{SILL.push(d.id);b.classList.add('on');saveSill();renderSill(d.id)}
   sPick()});
  box.appendChild(b)});
 return sec;
}
/* ---------- 단계 고르기 ---------- */
/* 깬 단계와 그다음 한 단계까지 고를 수 있다. 다시 해서 별 세 개에 도전할 수 있게. */
const NEWGLASS={10:1,17:1,23:1,29:1};
function frontier(){return Math.max(SAVED.length?Math.max(...SAVED)+1:0,li)}
function buildLevels(){
 const wrap=$('lvList');wrap.innerHTML='';
 const F=frontier(),upto=Math.max(10,Math.ceil((F+1)/10)*10),N=PICS.length;
 $('lvCount').textContent=`별 ${starTotal()}개`;
 let curEl=null;
 for(let s=0;s<upto;s+=10){
  let got=0;for(let k=s;k<s+10;k++)got+=STARS[k]||0;
  const sec=document.createElement('section');sec.className='lvset';
  sec.innerHTML=`<h3>${s+1}~${s+10}단계<span>★ ${got} / 30</span></h3><div class="lvgrid"></div>`;
  const grid=sec.querySelector('.lvgrid');
  for(let k=s;k<s+10;k++){
   const won=SAVED.includes(k),open=k<=F,b=document.createElement('button');
   b.className='lv'+(k===li?' cur':'')+(open?'':' lock')+(open&&!won?' new':'');
   const cv=document.createElement('canvas');cv.width=cv.height=120;b.appendChild(cv);
   b.insertAdjacentHTML('beforeend',`<em>${k+1}</em><b>${won?starStr(STARS[k]||1):open?(k===F?'새 창':'도전'):''}</b>`+(NEWGLASS[k]?'<i>새 유리</i>':''));
   if(won){if(!snapOk(k))saveSnap(k,genLevel(k));const sn=SNAP[k];usePic(k%N,!!sn.f);
    if(sn.g.length===REG.length){sn.c.forEach(i=>CLEAR[i]=true);drawThumb(cv,sn.g.split('').map(Number),true)}}
   else if(open){usePic(k%N,false);drawThumb(cv,new Array(REG.length).fill(0),false)}
   if(open)b.addEventListener('click',()=>{closeLv();if(k!==li)load(k)});
   if(k===li)curEl=b;
   grid.appendChild(b)}
  wrap.appendChild(sec)}
 if(CUR){useGeo(CUR.geo);if(CUR.pic){LOCK=CUR.lock.slice();TWIN=CUR.twin.slice();DRY=CUR.dry.slice();CLEAR=CUR.clear.slice()}}
 if(curEl)requestAnimationFrame(()=>curEl.scrollIntoView({block:'center'}));
}
function openLv(){buildLevels();$('lvSheet').classList.add('open');$('lvSheet').setAttribute('aria-hidden','false');sPick()}
function closeLv(){$('lvSheet').classList.remove('open');$('lvSheet').setAttribute('aria-hidden','true')}
$('lvBtn').addEventListener('click',openLv);
$('sub').addEventListener('click',openLv);
$('closeLv').addEventListener('click',closeLv);
function load(k){
 li=k;done=false;undone=false;hist=[];peek=false;FX=[];anim=null;lit=0;motes=[];origins=[];
 document.body.classList.remove('lit');
 CUR=genLevel(k);goal=CUR.goal;items=CUR.items.map(o=>({...o}));
 cells=CUR.start?CUR.start.slice():new Array(REG.length).fill(0);sel=0;rotatedOnce=false;drag=null;WIG=null;idleT=performance.now();
 if(CUR.rotate)setTimeout(wiggle,700);
 const TIMES=['dawn','noon','dusk','night'],TNAME={dawn:'아침',noon:'한낮',dusk:'저녁',night:'밤'};
 const tm=TIMES[Math.floor(k/4)%4];document.body.dataset.time=tm;
 $('sub').innerHTML=CUR.name+' · '+(k+1)+'<span class="timechip">'+TNAME[tm]+'</span>';
 $('nextBtn').classList.remove('show');$('msg').textContent='';
 cat('curious',true,2200);
 TWIN=CUR.twin?CUR.twin.slice():[];DRY=CUR.dry?CUR.dry.slice():[];CLEAR=CUR.clear?CUR.clear.slice():[];
 if(CUR.tut){const k=items.findIndex(o=>o.c===CUR.ds[0][1]&&o.r===CUR.ds[0][2]);if(k>=0)sel=k;
  $('msg').innerHTML='<small>반짝이는 유리를 톡 눌러 물감을 떨어뜨려 보세요</small>'}
 else if(CUR.intro==='twin')$('msg').innerHTML='<small>같은 고리가 달린 두 조각은 쌍둥이예요.<br>한쪽에 물감이 닿으면 짝에도 닿아요</small>';
 else if(CUR.intro==='dry')$('msg').innerHTML='<small>빗금 유리는 처음 닿은 색으로 굳어요.<br>어느 물감을 먼저 떨어뜨릴지 생각해 보세요</small>';
 else if(CUR.intro==='clear')$('msg').innerHTML='<small>투명 유리에는 물감이 묻지 않아요.<br>번짐은 그대로 지나가요</small>';
 else if(CUR.intro==='light')$('msg').innerHTML='<small>반짝이는 빛 방울은 닿은 조각에서 그 색을 빼요.<br>주황에 빛 노랑을 떨어뜨리면 빨강이 돼요</small>';
 const best=STARS[k]||0;
 $('par').innerHTML=`<b>★★★</b> <span class="nw">${parText()}</span> · <span class="nw">되돌리기 없이</span>`+(best?`<span class="best">${starStr(best)}</span>`:'');
 render();requestAnimationFrame(renderRoom)}
window.addEventListener('resize',()=>{if(CUR)renderPaints();renderRoom()});
loadSaved();updGal();
/* 창턱이 나오기 전부터 별을 모은 사람은 처음 열 때 얻은 장식 가운데 가장 좋은 넷을 올려 둔다 */
try{if(localStorage.getItem('lumenfall:sill')===null){const t=starTotal();SILL=DECO.filter(d=>d.need<=t).slice(-4).map(d=>d.id)}}catch(e){}
saveSill();
renderSill();initMusic();
try{if(localStorage.getItem('lumenfall:sound')==='0'){sound=false;musicOn=false;$('soundBtn').textContent='소리 끔'}}catch(e){}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){try{ac().suspend()}catch(e){}}
 else if(armed){try{ac().resume()}catch(e){}}
});
load(SAVED.length?Math.max(...SAVED)+1:0);
})();
