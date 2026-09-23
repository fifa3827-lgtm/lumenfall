/* 마을 지도 — 창고의 묶음 하나마다 건물 하나. 그 묶음에서 모은 그림만큼 창에 불이 들어오고,
   묶음을 다 모으면 건물 전체가 환해진다. 400×220 밤 풍경 하나에 그린다. */
const VL='#1E150E';            // 윤곽선
const VOFF='#1A1510';          // 불 꺼진 창
function vRose(cx,cy,r0,r1,n){ // 성당 둥근 창: 부채꼴 n개
 const out=[],C=['#E24B4A','#EFBE2E','#3D77C2','#4FA463','#8257AE','#EC8730'];
 for(let i=0;i<n;i++){const a0=(i/n)*Math.PI*2-Math.PI/2+.04,a1=((i+1)/n)*Math.PI*2-Math.PI/2-.04,
  p=(r,a)=>`${(cx+Math.cos(a)*r).toFixed(1)} ${(cy+Math.sin(a)*r).toFixed(1)}`;
  out.push({d:`M${p(r0,a0)}L${p(r1,a0)}A${r1} ${r1} 0 0 1 ${p(r1,a1)}L${p(r0,a1)}A${r0} ${r0} 0 0 0 ${p(r0,a0)}Z`,c:C[i%C.length]})}
 return out}
const VILLAGE=[
{set:'정원',name:'온실',hx:40,hy:125,body:`
<path d="M8 150V120Q40 90 72 120V150Z" fill="#4E7F66" stroke="${VL}" stroke-width="1.6"/>
<path d="M24 150V106M40 150V98M56 150V106M8 128H72" stroke="#2C4A3A" stroke-width="1.4" fill="none"/>
<path d="M36 150V140H44V150Z" fill="#2C4A3A"/>`,
 win:[{x:11,y:129,w:11,h:19},{x:26,y:129,w:12,h:19},{x:46,y:129,w:8,h:9},{x:58,y:129,w:11,h:19},{x:14,y:115,w:8,h:11},{x:27,y:106,w:11,h:20},{x:42,y:106,w:12,h:20},{x:58,y:115,w:8,h:11}],lit:'#CFF3A8'},

{set:'집과 학교',name:'학교',hx:113,hy:118,body:`
<path d="M113 86V66" stroke="${VL}" stroke-width="1.6"/><path class="vflag" d="M113 66H127L123 70L127 74H113Z" fill="#E24B4A" stroke="${VL}" stroke-width="1.2"/>
<rect x="80" y="106" width="66" height="44" fill="#B5654A" stroke="${VL}" stroke-width="1.6"/>
<path d="M75 108L113 84L151 108Z" fill="#6A3B2E" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<circle cx="113" cy="99" r="5.5" fill="#F3E7D2" stroke="${VL}" stroke-width="1.2"/><path d="M113 96V99H116" stroke="${VL}" stroke-width="1" fill="none"/>
<rect x="107" y="134" width="12" height="16" fill="#4A2A20" stroke="${VL}" stroke-width="1.2"/>`,
 win:[{x:85,y:112,w:9,h:9},{x:98,y:112,w:9,h:9},{x:119,y:112,w:9,h:9},{x:132,y:112,w:9,h:9},{x:85,y:126,w:9,h:9},{x:98,y:126,w:9,h:9},{x:119,y:126,w:9,h:9},{x:132,y:126,w:9,h:9},{x:85,y:140,w:9,h:7},{x:132,y:140,w:9,h:7}],lit:'#FFD98A'},

{set:'축제와 계절',name:'성당',hx:200,hy:108,body:`
<path d="M158 150V80L167 58L176 80V150Z" fill="#8C7A68" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M224 150V80L233 58L242 80V150Z" fill="#8C7A68" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M174 150V92L200 66L226 92V150Z" fill="#A08D78" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M200 66V52M195 57H205" stroke="${VL}" stroke-width="1.8"/>
<circle cx="200" cy="100" r="14" fill="#3A2E24" stroke="${VL}" stroke-width="1.6"/>
<path d="M192 150V132Q200 122 208 132V150Z" fill="#4A3526" stroke="${VL}" stroke-width="1.4"/>`,
 win:[...vRose(200,100,4.5,12.5,8),{x:164,y:88,w:6,h:14,r:3,c:'#8CC4FF'},{x:230,y:88,w:6,h:14,r:3,c:'#8CC4FF'},{x:164,y:112,w:6,h:14,r:3,c:'#FFB35C'},{x:230,y:112,w:6,h:14,r:3,c:'#FFB35C'}],lit:'#FFD98A'},

{set:'탈것',name:'기차역',hx:290,hy:124,body:`
<rect x="252" y="118" width="76" height="32" fill="#5E7A8C" stroke="${VL}" stroke-width="1.6"/>
<path d="M246 119L257 106H323L334 119Z" fill="#3E4F5A" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<rect x="283" y="90" width="14" height="16" fill="#5E7A8C" stroke="${VL}" stroke-width="1.4"/>
<circle cx="290" cy="97" r="4.2" fill="#F3E7D2" stroke="${VL}" stroke-width="1"/>
<path d="M281 90L290 83L299 90Z" fill="#3E4F5A" stroke="${VL}" stroke-width="1.2"/>`,
 win:[{x:257,y:124,w:10,h:18,r:5},{x:271,y:124,w:10,h:18,r:5},{x:285,y:124,w:10,h:26,r:5},{x:299,y:124,w:10,h:18,r:5},{x:313,y:124,w:10,h:18,r:5}],lit:'#FFE3A0'},

{set:'하늘과 우주',name:'천문대',hx:365,hy:128,body:`
<path d="M334 150Q360 134 400 138V150Z" fill="#324435"/>
<rect x="346" y="124" width="38" height="24" fill="#D6CFC3" stroke="${VL}" stroke-width="1.6"/>
<path d="M343 125A22 22 0 0 1 387 125Z" fill="#8A9AAF" stroke="${VL}" stroke-width="1.6"/>
<path d="M362 104H368V125H362Z" fill="#2A3140"/>
<path class="vscope" d="M364 112L382 94" stroke="#C9A560" stroke-width="3.2" stroke-linecap="round"/>`,
 win:[{x:351,y:130,w:7,h:7,r:3.5},{x:361,y:130,w:8,h:14},{x:372,y:130,w:7,h:7,r:3.5},{x:363,y:106,w:4,h:17,c:'#BFD9FF'}],lit:'#FFE3A0'},

{set:'동물 친구',name:'헛간',hx:47,hy:172,body:`
<path d="M16 192V162L47 142L78 162V192Z" fill="#B8483E" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M12 164L47 140L82 164" stroke="#F3E7D2" stroke-width="3" fill="none" stroke-linejoin="round"/>
<rect x="36" y="170" width="22" height="22" fill="#8E342C" stroke="#F3E7D2" stroke-width="1.8"/>
<path d="M36 170L58 192M58 170L36 192" stroke="#F3E7D2" stroke-width="1.6"/>`,
 win:[{x:42,y:152,w:10,h:10,r:5},{x:21,y:172,w:10,h:9},{x:63,y:172,w:10,h:9}],lit:'#FFD98A'},

{set:'맛있는 것',name:'빵집',hx:126,hy:172,body:`
<rect x="98" y="162" width="56" height="30" fill="#E7C9A0" stroke="${VL}" stroke-width="1.6"/>
<path d="M94 162V154H158V162Q154 167 150 162Q146 167 142 162Q138 167 134 162Q130 167 126 162Q122 167 118 162Q114 167 110 162Q106 167 102 162Q98 167 94 162Z" fill="#E24B4A" stroke="${VL}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M104 154V164M118 154V164M134 154V164M148 154V164" stroke="#FFF3E6" stroke-width="5" opacity=".9"/>
<rect x="136" y="172" width="12" height="20" fill="#7A4B2C" stroke="${VL}" stroke-width="1.2"/>
<ellipse cx="126" cy="148" rx="9" ry="5" fill="#D9974A" stroke="${VL}" stroke-width="1.2"/>`,
 win:[{x:103,y:170,w:13,h:14},{x:119,y:170,w:13,h:14},{x:139,y:175,w:6,h:6}],lit:'#FFD98A'},

{set:'과일과 채소',name:'과일 가게',hx:274,hy:174,body:`
<rect x="246" y="164" width="56" height="28" fill="#8DB368" stroke="${VL}" stroke-width="1.6"/>
<path d="M242 164V156H306V164Q302 169 298 164Q294 169 290 164Q286 169 282 164Q278 169 274 164Q270 169 266 164Q262 169 258 164Q254 169 250 164Q246 169 242 164Z" fill="#4FA463" stroke="${VL}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M252 156V166M266 156V166M282 156V166M296 156V166" stroke="#F3F7E6" stroke-width="5" opacity=".9"/>
<rect x="250" y="183" width="22" height="9" fill="#A8743F" stroke="${VL}" stroke-width="1.2"/><rect x="276" y="183" width="22" height="9" fill="#A8743F" stroke="${VL}" stroke-width="1.2"/>
<circle cx="256" cy="182" r="3.2" fill="#E24B4A"/><circle cx="262" cy="181" r="3.2" fill="#E24B4A"/><circle cx="267" cy="182" r="3.2" fill="#E24B4A"/>
<circle cx="281" cy="182" r="3.2" fill="#EFBE2E"/><circle cx="287" cy="181" r="3.2" fill="#EC8730"/><circle cx="293" cy="182" r="3.2" fill="#EFBE2E"/>`,
 win:[{x:252,y:169,w:18,h:11},{x:278,y:169,w:18,h:11}],lit:'#FFE3A0'},

{set:'바다',name:'등대',tx:-26,hx:354,hy:150,body:`
<path class="vbeam" d="M354 126L400 112V142Z M354 126L316 116V136Z" fill="#FFF0B8" opacity="0"/>
<path d="M342 192L346 134H362L366 192Z" fill="#F3EFE6" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M345 150H363L364 164H344Z M343.4 176H364.6L365.4 188H342.6Z" fill="#D24A42"/>
<rect x="344" y="120" width="20" height="14" fill="#3A2E24" stroke="${VL}" stroke-width="1.6"/>
<path d="M341 120L354 109L367 120Z" fill="#D24A42" stroke="${VL}" stroke-width="1.6" stroke-linejoin="round"/>`,
 win:[{x:348,y:123,w:12,h:9,c:'#FFF3C0'},{x:351,y:140,w:6,h:7,r:3},{x:351,y:167,w:6,h:7,r:3},{x:350,y:182,w:8,h:10}],lit:'#FFD98A'}
];
/* have: 묶음 이름 → [모은 수, 전체 수] */
function villageSVG(have){
 let lit=0,body='';
 VILLAGE.forEach((b,bi)=>{const [g,n]=have[b.set]||[0,1],full=g>=n&&n>0;if(full)lit++;
  const k=full?b.win.length:Math.floor(b.win.length*g/n);
  const wins=b.win.map((w,i)=>{const on=i<k,f=on?(w.c||b.lit):VOFF,cl=on?' class="von"':'';
   return w.d?`<path${cl} d="${w.d}" fill="${f}"/>`:`<rect${cl} x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="${w.r||0.8}" fill="${f}"/>`}).join('');
  body+=`<g class="vb${full?' full':''}${g?'':' off'}" data-i="${bi}"${b.tx?` transform="translate(${b.tx} 0)"`:''}>${full?`<ellipse cx="${b.hx}" cy="${b.hy}" rx="46" ry="34" fill="url(#vhalo)"/>`:''}${b.body}${wins}</g>`});
 let stars='';const R=(i)=>((Math.sin(i*97.1)*43758.5)%1+1)%1;
 for(let i=0;i<14+lit*5;i++)stars+=`<circle class="vstar" style="animation-delay:${(R(i+3)*3).toFixed(2)}s" cx="${(R(i)*400).toFixed(1)}" cy="${(R(i+50)*70+4).toFixed(1)}" r="${(0.6+R(i+9)*1.1).toFixed(2)}" fill="#FFF6D8"/>`;
 return `<svg class="village" viewBox="0 0 400 220" role="img" aria-label="마을 지도">
<defs><linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A33"/><stop offset="1" stop-color="#3A2F4E"/></linearGradient>
<radialGradient id="vhalo"><stop offset="0" stop-color="#FFD98A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>
<filter id="vglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="400" height="220" fill="url(#vsky)"/>${stars}
<circle cx="44" cy="30" r="13" fill="#FFF1C8" opacity=".9"/><circle cx="50" cy="26" r="12" fill="#1A2140"/>
<path d="M0 152Q70 138 150 148T300 144T400 146V220H0Z" fill="#2B3A2C"/>
<path d="M0 190Q100 184 200 190T400 188V220H0Z" fill="#22301F"/>
${body}</svg>`}
