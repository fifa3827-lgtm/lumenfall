/* ===== 창 모양 ===== */
const TAU=Math.PI*2;
function keyOf(x,y){return Math.round(x*2000)+','+Math.round(y*2000)}
function polyRegion(pts){
 let cx=0,cy=0;pts.forEach(p=>{cx+=p[0];cy+=p[1]});
 return {pts,cx:cx/pts.length,cy:cy/pts.length};
}
function buildAdj(regs){
 const map=new Map();
 regs.forEach((r,i)=>{
  const n=r.pts.length;
  for(let k=0;k<n;k++){
   const a=r.pts[k],b=r.pts[(k+1)%n];
   const mk=keyOf((a[0]+b[0])/2,(a[1]+b[1])/2);
   if(!map.has(mk))map.set(mk,[]);
   map.get(mk).push(i);
  }
 });
 const adj=regs.map(()=>new Set());
 map.forEach(list=>{for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
  if(list[i]!==list[j]){adj[list[i]].add(list[j]);adj[list[j]].add(list[i])}}});
 return adj.map(s=>[...s]);
}

function geoRose(){
 const RINGS=[1,6,12,18], RAD=[0,.20,.44,.68,.95], STEP=TAU/72;
 const regs=[];
 const arc=(r,a0,a1)=>{const p=[];for(let a=a0;a<a1-1e-9;a+=STEP)p.push([Math.cos(a-Math.PI/2)*r,Math.sin(a-Math.PI/2)*r]);
  p.push([Math.cos(a1-Math.PI/2)*r,Math.sin(a1-Math.PI/2)*r]);return p};
 RINGS.forEach((cnt,ring)=>{
  for(let k=0;k<cnt;k++){
   const a0=k/cnt*TAU,a1=(k+1)/cnt*TAU;
   if(ring===0){regs.push(polyRegion(arc(RAD[1],0,TAU).slice(0,-1)));break}
   const outer=arc(RAD[ring+1],a0,a1), inner=arc(RAD[ring],a0,a1).reverse();
   regs.push(polyRegion(outer.concat(inner)));
  }
 });
 return {regs,name:'장미창'};
}
function geoHex(){
 const R=0.175, rings=3, regs=[];
 const hex=(cx,cy)=>{const p=[];for(let k=0;k<6;k++){const a=k*TAU/6+Math.PI/6;
  p.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R])}return p};
 for(let q=-rings;q<=rings;q++)for(let r=-rings;r<=rings;r++){
  const s=-q-r;if(Math.abs(s)>rings)continue;
  const x=R*Math.sqrt(3)*(q+r/2), y=R*1.5*r;
  if(Math.hypot(x,y)>0.95)continue;
  regs.push(polyRegion(hex(x,y)));
 }
 return {regs,name:'벌집창'};
}
function geoDiamond(){
 const S=0.30, regs=[], n=4;
 for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){
  if(Math.abs(i)+Math.abs(j)>n+1)continue;
  const x=(i+j)*S/2, y=(j-i)*S/2;
  if(Math.abs(x)+Math.abs(y)>0.95)continue;
  regs.push(polyRegion([[x,y-S/2],[x+S/2,y],[x,y+S/2],[x-S/2,y]]));
 }
 return {regs,name:'마름모창'};
}
function geoGothic(){
 const cols=5, regs=[];
 const W=1.20, x0=-W/2, cw=W/cols;
 const baseY=0.92, springY=0.06;
 const archTop=(x)=>{ // 뾰족 아치
  const t=Math.abs(x)/(W/2);
  return springY - (1.00)*Math.sqrt(Math.max(0,1-t*t)) - (1-t)*0.16;
 };
 const rows=4, ah=(baseY-springY)/rows;
 for(let c=0;c<cols;c++){
  const xa=x0+c*cw, xb=xa+cw;
  for(let r=0;r<rows;r++){
   const ya=springY+r*ah, yb=ya+ah;
   regs.push(polyRegion([[xa,ya],[xb,ya],[xb,yb],[xa,yb]]));
  }
  // 아치 부분
  const steps=6;
  const top=[],bot=[];
  for(let s=0;s<=steps;s++){
   const x=xa+(xb-xa)*s/steps;
   top.push([x,archTop(x)]);
  }
  regs.push(polyRegion(top.concat([[xb,springY],[xa,springY]])));
 }
 return {regs,name:'첨두창'};
}
function geoStarGrid(){
 const regs=[], S=0.38, n=2;
 for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){
  const cx=i*S, cy=j*S;
  if(Math.hypot(cx,cy)>1.05)continue;
  // 팔각형
  const oct=[];const r=S*0.5, k=r*0.4142;
  oct.push([cx-k,cy-r],[cx+k,cy-r],[cx+r,cy-k],[cx+r,cy+k],
           [cx+k,cy+r],[cx-k,cy+r],[cx-r,cy+k],[cx-r,cy-k]);
  regs.push(polyRegion(oct));
  // 사이 마름모 — 팔각형의 잘린 모서리와 변을 공유
  if(i<n&&j<n){
   const dx=cx+r,dy=cy+r,hk=r-k;
   if(Math.hypot(dx,dy)>1.10)continue;
   regs.push(polyRegion([[dx,dy-hk],[dx+hk,dy],[dx,dy+hk],[dx-hk,dy]]));
  }
 }
 return {regs,name:'별격자창'};
}

function geoTriangle(){
 const S=0.30, H=S*Math.sqrt(3)/2, regs=[];
 for(let row=-3;row<=3;row++){
  for(let c=-5;c<=5;c++){
   const up=((c+row)%2+2)%2===0;
   const x0=c*S/2, y0=row*H;
   const p = up
    ? [[x0-S/2,y0+H/2],[x0+S/2,y0+H/2],[x0,y0-H/2]]
    : [[x0-S/2,y0-H/2],[x0+S/2,y0-H/2],[x0,y0+H/2]];
   const cx=(p[0][0]+p[1][0]+p[2][0])/3, cy=(p[0][1]+p[1][1]+p[2][1])/3;
   if(Math.hypot(cx,cy*1.05)>0.78)continue;
   regs.push(polyRegion(p));
  }
 }
 return {regs,name:'삼각창'};
}
function geoCross(){
 const S=0.26, regs=[];
 for(let i=-3;i<=3;i++)for(let j=-4;j<=4;j++){
  if(Math.abs(i)>1 && Math.abs(j)>1)continue;
  if(Math.abs(i)>2 || Math.abs(j)>3)continue;
  const x=i*S,y=j*S;
  regs.push(polyRegion([[x-S/2,y-S/2],[x+S/2,y-S/2],[x+S/2,y+S/2],[x-S/2,y+S/2]]));
 }
 return {regs,name:'십자창'};
}
function geoRose8(){
 const RINGS=[1,8,16,24], RAD=[0,.19,.42,.67,.95], STEP=TAU/96;
 const regs=[];
 const arc=(r,a0,a1)=>{const p=[];for(let a=a0;a<a1-1e-9;a+=STEP)p.push([Math.cos(a-Math.PI/2)*r,Math.sin(a-Math.PI/2)*r]);
  p.push([Math.cos(a1-Math.PI/2)*r,Math.sin(a1-Math.PI/2)*r]);return p};
 RINGS.forEach((cnt,ring)=>{
  for(let k=0;k<cnt;k++){
   if(ring===0){regs.push(polyRegion(arc(RAD[1],0,TAU).slice(0,-1)));break}
   const a0=k/cnt*TAU,a1=(k+1)/cnt*TAU;
   regs.push(polyRegion(arc(RAD[ring+1],a0,a1).concat(arc(RAD[ring],a0,a1).reverse())));
  }
 });
 return {regs,name:'팔엽창'};
}
function geoLancetPair(){
 const regs=[], cols=6, W=1.30, x0=-W/2, cw=W/cols;
 const springY=0.10, baseY=0.92, rows=3, ah=(baseY-springY)/rows;
 const half=W/2;
 const top=(x)=>{
  const side=x<0?-1:1, lx=(x-side*half/2)/(half/2);
  const t=Math.min(1,Math.abs(lx));
  return springY-0.55*Math.sqrt(Math.max(0,1-t*t))-(1-t)*0.10;
 };
 for(let c=0;c<cols;c++){
  const xa=x0+c*cw, xb=xa+cw;
  for(let r=0;r<rows;r++){
   const ya=springY+r*ah, yb=ya+ah;
   regs.push(polyRegion([[xa,ya],[xb,ya],[xb,yb],[xa,yb]]));
  }
  const pts=[];
  for(let s=0;s<=6;s++){const x=xa+(xb-xa)*s/6;pts.push([x,top(x)])}
  regs.push(polyRegion(pts.concat([[xb,springY],[xa,springY]])));
 }
 return {regs,name:'쌍아치창'};
}
function normalize(g){
 let minx=9,maxx=-9,miny=9,maxy=-9;
 g.regs.forEach(r=>r.pts.forEach(p=>{minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);
  miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1])}));
 const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
 const sc=1.88/Math.max(maxx-minx,maxy-miny);
 g.regs.forEach(r=>{r.pts=r.pts.map(p=>[(p[0]-cx)*sc,(p[1]-cy)*sc]);
  r.cx=(r.cx-cx)*sc;r.cy=(r.cy-cy)*sc});
 return g;
}
const GEOS=[geoRose,geoHex,geoDiamond,geoStarGrid,geoGothic,geoTriangle,geoCross,geoRose8,geoLancetPair];
