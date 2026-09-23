/* 창턱 장식 — 별을 모으면 하나씩 생긴다. 64×64 그림, 바닥(y=62)이 창턱에 닿는다.
   그림 안 id는 장식마다 앞말을 붙여 겹치지 않게 한다. */
const DECO_LINE='#3B2515';
const DECO=[
{id:'sprout',name:'새싹 화분',need:3,svg:`
<defs><linearGradient id="dsp-p" x1="0" x2="1"><stop offset="0" stop-color="#A9532C"/><stop offset=".45" stop-color="#E08A55"/><stop offset="1" stop-color="#9A4724"/></linearGradient></defs>
<path d="M32 40C32 33 32 28 32 21" stroke="#4E8A3C" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M32 30C24 30 17 24 16 15C25 15 31 21 32 30Z" fill="#79BF5E" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M32 25C39 23 45 17 47 8C38 9 33 15 32 25Z" fill="#8FD06C" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M20 29C23 26 26 26 29 28M36 19C39 17 41 15 43 12" stroke="#CFF0A8" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M21 45H43L40 62H24Z" fill="url(#dsp-p)" stroke="${DECO_LINE}" stroke-width="1.6" stroke-linejoin="round"/>
<rect x="17" y="38" width="30" height="8" rx="2" fill="#D27A47" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M20 40.5H44" stroke="#F5B585" stroke-width="1.2" opacity=".8"/>`},

{id:'candle',name:'촛불',need:8,svg:`
<defs><radialGradient id="dca-g"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".75"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient>
<linearGradient id="dca-w" x1="0" x2="1"><stop offset="0" stop-color="#E9DCC6"/><stop offset=".5" stop-color="#FFF8EA"/><stop offset="1" stop-color="#D6C6AC"/></linearGradient></defs>
<circle class="dglow" cx="32" cy="16" r="16" fill="url(#dca-g)"/>
<path class="dflame" d="M32 6C35.5 11 37 14 37 17.5C37 20.6 34.8 23 32 23C29.2 23 27 20.6 27 17.5C27 14 28.5 11 32 6Z" fill="#FFC23D" stroke="#C9661E" stroke-width="1.2"/>
<path class="dflame" d="M32 12C33.8 15 34.4 16.6 34.4 18.2C34.4 19.8 33.3 21 32 21C30.7 21 29.6 19.8 29.6 18.2C29.6 16.6 30.2 15 32 12Z" fill="#FFF3C0"/>
<path d="M32 23V27" stroke="#3B2515" stroke-width="1.4"/>
<path d="M25 27H39V53H25Z" fill="url(#dca-w)" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M25 30C27 32 29 29 31 31C33 33 35 29 39 31" stroke="#FFFDF6" stroke-width="1.4" fill="none"/>
<ellipse cx="32" cy="56" rx="17" ry="4.5" fill="#C99A3C" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M21 55.5C26 57.5 38 57.5 43 55.5" stroke="#F3D383" stroke-width="1.2" fill="none"/>
<path d="M46 56C52 54 53 60 47 60" stroke="${DECO_LINE}" stroke-width="1.6" fill="none"/>
<path d="M17 58V60.5C22 63 42 63 47 60.5V58" fill="#9E7426" stroke="${DECO_LINE}" stroke-width="1.6"/>`},

{id:'shell',name:'조개껍데기',need:14,svg:`
<defs><linearGradient id="dsh-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9C8"/><stop offset="1" stop-color="#EE9E8C"/></linearGradient></defs>
<path d="M32 60L9 38C9 24 20 16 32 16C44 16 55 24 55 38Z" fill="url(#dsh-f)" stroke="${DECO_LINE}" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M32 60L15 27M32 60L22 20M32 60V16M32 60L42 20M32 60L49 27" stroke="#C86F63" stroke-width="1.3" fill="none"/>
<path d="M26 60H38L36 55H28Z" fill="#E58B7A" stroke="${DECO_LINE}" stroke-width="1.4"/>
<path d="M14 33C18 25 25 21 31 20" stroke="#FFF1E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>
<circle cx="47" cy="56" r="3" fill="#F7EFD9" stroke="${DECO_LINE}" stroke-width="1.2"/>
<circle cx="53" cy="59" r="2" fill="#E3D4B0" stroke="${DECO_LINE}" stroke-width="1"/>`},

{id:'tea',name:'찻잔',need:21,svg:`
<path class="dsteam" d="M27 20C24 16 30 13 27 8M36 20C33 16 39 13 36 8" stroke="#F4EBDD" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
<ellipse cx="32" cy="57" rx="24" ry="5" fill="#E7EEF3" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M12 55.5C18 58 46 58 52 55.5" stroke="#9DB4C8" stroke-width="1.2" fill="none"/>
<path d="M46 32C55 30 56 42 46 44" stroke="${DECO_LINE}" stroke-width="5.4" fill="none"/>
<path d="M46 32C55 30 56 42 46 44" stroke="#F6FAFC" stroke-width="2.6" fill="none"/>
<path d="M14 26H50C50 42 43 54 32 54C21 54 14 42 14 26Z" fill="#F6FAFC" stroke="${DECO_LINE}" stroke-width="1.6"/>
<ellipse cx="32" cy="26" rx="18" ry="4" fill="#B5763B" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M17 35H47" stroke="#6C9BD2" stroke-width="3"/>
<circle cx="24" cy="42" r="2.2" fill="#E77F86"/><circle cx="32" cy="45" r="2.2" fill="#6C9BD2"/><circle cx="40" cy="42" r="2.2" fill="#E77F86"/>
<path d="M18 30C19 40 22 47 26 50" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity=".9"/>`},

{id:'books',name:'책 더미',need:29,svg:`
<rect x="10" y="50" width="44" height="11" rx="1.5" fill="#C9534E" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M50 51V60" stroke="#F3E7D2" stroke-width="3"/><path d="M14 55.5H44" stroke="#F3C36A" stroke-width="1.6"/>
<rect x="14" y="40" width="38" height="10" rx="1.5" fill="#3F78B5" stroke="${DECO_LINE}" stroke-width="1.6" transform="rotate(-3 33 45)"/>
<path d="M17 45H43" stroke="#9CC4EC" stroke-width="1.4" transform="rotate(-3 33 45)"/>
<rect x="12" y="30" width="36" height="10" rx="1.5" fill="#4F9A5B" stroke="${DECO_LINE}" stroke-width="1.6" transform="rotate(2 30 35)"/>
<path d="M44 31V39" stroke="#F3E7D2" stroke-width="3" transform="rotate(2 30 35)"/>
<path d="M36 30C35 24 38 20 42 20C46 20 48 24 46 29" fill="#E24B4A" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M42 20C42 17 43 15 45 14" stroke="${DECO_LINE}" stroke-width="1.6" fill="none"/>
<path d="M44 16C47 14 50 15 51 17C48 18 46 18 44 16Z" fill="#79BF5E" stroke="${DECO_LINE}" stroke-width="1.2"/>
<path d="M39 23C38.5 25 38.6 26 39 27" stroke="#FFB6A8" stroke-width="1.4" fill="none" stroke-linecap="round"/>`},

{id:'bowl',name:'어항',need:38,svg:`
<defs><radialGradient id="dbw-w" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#B8E3F5"/><stop offset="1" stop-color="#4E9CC9"/></radialGradient></defs>
<path d="M22 14H42C42 17 40 18 40 20C49 23 55 31 55 40C55 52 45 61 32 61C19 61 9 52 9 40C9 31 15 23 24 20C24 18 22 17 22 14Z" fill="#D8EEF7" fill-opacity=".4" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M11 36C11 36 20 33 32 36C44 39 53 36 53 36C54 38 55 39 55 40C55 52 45 61 32 61C19 61 9 52 9 40Z" fill="url(#dbw-w)" stroke="${DECO_LINE}" stroke-width="1.4"/>
<path class="dfish" d="M25 47C28 42 35 42 38 47C35 52 28 52 25 47ZM38 47L44 43V51Z" fill="#F08A3C" stroke="${DECO_LINE}" stroke-width="1.3" stroke-linejoin="round"/>
<circle cx="29" cy="46" r="1.2" fill="${DECO_LINE}"/>
<path d="M16 50C17 46 17 43 19 41M19 58C21 53 20 49 23 45" stroke="#3E8E4E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<circle class="dbub" cx="41" cy="38" r="1.6" fill="none" stroke="#FFFFFF" stroke-width="1"/><circle class="dbub" cx="44" cy="31" r="1.2" fill="none" stroke="#FFFFFF" stroke-width="1"/>
<path d="M14 30C16 25 21 22 25 22" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".85"/>`},

{id:'hourglass',name:'모래시계',need:48,svg:`
<rect x="12" y="6" width="40" height="6" rx="2" fill="#A8743F" stroke="${DECO_LINE}" stroke-width="1.6"/>
<rect x="12" y="55" width="40" height="6" rx="2" fill="#A8743F" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M17 12V55M47 12V55" stroke="${DECO_LINE}" stroke-width="4.4"/><path d="M17 12V55M47 12V55" stroke="#C8925A" stroke-width="2.2"/>
<path d="M21 12H43C43 24 34 29 34 33.5C34 38 43 43 43 55H21C21 43 30 38 30 33.5C30 29 21 24 21 12Z" fill="#EAF6FA" fill-opacity=".55" stroke="${DECO_LINE}" stroke-width="1.5"/>
<path d="M25 20H39C37 25 33 27 32 30C31 27 27 25 25 20Z" fill="#EFC36A"/>
<path d="M32 31V47" stroke="#EFC36A" stroke-width="1.2"/>
<path d="M23 55C24 49 28 46 32 46C36 46 40 49 41 55Z" fill="#EFC36A" stroke="#C08F32" stroke-width=".8"/>
<path d="M24 15C25 20 27 23 29 25" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity=".85"/>`},

{id:'cactus',name:'선인장 화분',need:58,svg:`
<path d="M32 44C22 44 19 37 19 30C19 22 25 16 32 16C39 16 45 22 45 30C45 37 42 44 32 44Z" fill="#6FB25B" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M32 17V43M25 20C23 27 23 36 26 43M39 20C41 27 41 36 38 43" stroke="#4C8A3E" stroke-width="1.3" fill="none"/>
<path d="M22 27L20 26M22 34L20 34M42 27L44 26M42 34L44 34M32 24L32 22M29 33L27 32M35 33L37 32" stroke="#F3EBD2" stroke-width="1.2" stroke-linecap="round"/>
<path d="M32 17C29 14 28 10 31 9C32 11 33 11 33 9C36 10 35 14 32 17Z" fill="#F07A9C" stroke="${DECO_LINE}" stroke-width="1.2"/>
<path d="M18 46H46L42 62H22Z" fill="#5A8FC9" stroke="${DECO_LINE}" stroke-width="1.6" stroke-linejoin="round"/>
<rect x="15" y="41" width="34" height="7" rx="2" fill="#6FA3DA" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M24 53L28 57L32 53L36 57L40 53" stroke="#F3E7D2" stroke-width="1.6" fill="none" stroke-linejoin="round"/>`},

{id:'globe',name:'지구본',need:70,svg:`
<defs><radialGradient id="dgl-s" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#9FD2F2"/><stop offset="1" stop-color="#2F6FB0"/></radialGradient></defs>
<circle cx="32" cy="27" r="19" fill="url(#dgl-s)" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M18 21C22 17 27 19 28 23C29 27 24 28 25 33C26 37 21 38 18 34C15 30 15 25 18 21Z" fill="#7CC06A" stroke="${DECO_LINE}" stroke-width="1.2"/>
<path d="M35 12C40 11 46 15 46 20C44 22 41 20 39 23C37 26 41 29 38 32C35 34 32 30 33 26C34 22 30 21 31 17C32 14 33 13 35 12Z" fill="#7CC06A" stroke="${DECO_LINE}" stroke-width="1.2"/>
<path d="M40 38C43 36 46 37 45 40C43 42 40 41 40 38Z" fill="#7CC06A" stroke="${DECO_LINE}" stroke-width="1"/>
<path d="M13 30C10 19 18 7 30 6" stroke="${DECO_LINE}" stroke-width="4" fill="none"/><path d="M13 30C10 19 18 7 30 6" stroke="#D9AE52" stroke-width="2" fill="none"/>
<path d="M22 17C24 14 27 12 30 12" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M32 46V54" stroke="${DECO_LINE}" stroke-width="4.4"/><path d="M32 46V54" stroke="#C8925A" stroke-width="2.2"/>
<path d="M20 61C20 56 25 53 32 53C39 53 44 56 44 61Z" fill="#A8743F" stroke="${DECO_LINE}" stroke-width="1.6"/>`},

{id:'lantern',name:'등불',need:84,svg:`
<defs><radialGradient id="dln-g"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".6" stop-color="#FFC45A"/><stop offset="1" stop-color="#E88A2A"/></radialGradient>
<radialGradient id="dln-h"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient></defs>
<circle class="dglow" cx="32" cy="38" r="27" fill="url(#dln-h)"/>
<path d="M26 10C26 4 38 4 38 10" stroke="${DECO_LINE}" stroke-width="2.4" fill="none"/>
<path d="M20 18L32 9L44 18Z" fill="#4A4038" stroke="${DECO_LINE}" stroke-width="1.6" stroke-linejoin="round"/>
<rect x="21" y="18" width="22" height="34" rx="2" fill="url(#dln-g)" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path class="dflame" d="M32 27C35 31 36 33 36 36C36 38.5 34.2 40 32 40C29.8 40 28 38.5 28 36C28 33 29 31 32 27Z" fill="#FFF6D6"/>
<path d="M32 18V52M21 35H43" stroke="#4A4038" stroke-width="2"/>
<rect x="18" y="52" width="28" height="9" rx="1.5" fill="#4A4038" stroke="${DECO_LINE}" stroke-width="1.6"/>`},

{id:'starjar',name:'별 병',need:100,svg:`
<defs><radialGradient id="dsj-h"><stop offset="0" stop-color="#FFF2B8" stop-opacity=".6"/><stop offset="1" stop-color="#FFF2B8" stop-opacity="0"/></radialGradient></defs>
<circle class="dglow" cx="32" cy="42" r="24" fill="url(#dsj-h)"/>
<rect x="24" y="8" width="16" height="9" rx="2" fill="#B98552" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M26 17H38V22C46 25 50 31 50 39V56C50 59 48 61 45 61H19C16 61 14 59 14 56V39C14 31 18 25 26 22Z" fill="#DDF1F6" fill-opacity=".2" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path class="dtw" d="M24 40L25.5 43.5L29 44L26.4 46.3L27.2 50L24 48.1L20.8 50L21.6 46.3L19 44L22.5 43.5Z" fill="#FFD84A" stroke="#C99526" stroke-width=".8"/>
<path class="dtw" style="animation-delay:.7s" d="M39 33L40.1 35.6L43 36L40.9 37.8L41.5 40.6L39 39.2L36.5 40.6L37.1 37.8L35 36L37.9 35.6Z" fill="#FFE98C" stroke="#C99526" stroke-width=".8"/>
<path class="dtw" style="animation-delay:1.3s" d="M38 48L39.3 51L42.5 51.4L40.1 53.5L40.8 56.6L38 55L35.2 56.6L35.9 53.5L33.5 51.4L36.7 51Z" fill="#FFD84A" stroke="#C99526" stroke-width=".8"/>
<circle cx="31" cy="34" r="1.3" fill="#FFF6C8"/><circle cx="29" cy="55" r="1.1" fill="#FFF6C8"/><circle cx="45" cy="44" r="1" fill="#FFF6C8"/>
<path d="M18 36C19 31 22 28 26 26" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>`},

{id:'lamp',name:'유리 등',need:120,svg:`
<defs><radialGradient id="dlp-h" cy=".4"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".6"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient></defs>
<circle class="dglow" cx="32" cy="26" r="28" fill="url(#dlp-h)"/>
<path d="M10 34C10 18 20 8 32 8C44 8 54 18 54 34Z" fill="#2B2018" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M12.6 32C13 22 17 16 21.5 13L25 32Z" fill="#E24B4A" opacity=".92"/>
<path d="M25 32L22.5 12.4C25.5 10.6 28.6 9.9 31 9.8L31 32Z" fill="#EFBE2E" opacity=".92"/>
<path d="M33 32L33 9.8C35.6 9.9 38.6 10.6 41.5 12.4L39 32Z" fill="#4FA463" opacity=".92"/>
<path d="M39 32L42.5 13C47 16 51 22 51.4 32Z" fill="#3D77C2" opacity=".92"/>
<path d="M17 22H47" stroke="#2B2018" stroke-width="1.6"/>
<path d="M18 18C20 15 23 13 26 12" stroke="#FFFFFF" stroke-width="1.4" fill="none" opacity=".6"/>
<path d="M29 34V54M35 34V54" stroke="${DECO_LINE}" stroke-width="1.6"/><rect x="29" y="34" width="6" height="20" fill="#C99A3C"/>
<path d="M29 34V54M35 34V54" stroke="${DECO_LINE}" stroke-width="1.4"/>
<path d="M18 61C18 56 24 53 32 53C40 53 46 56 46 61Z" fill="#C99A3C" stroke="${DECO_LINE}" stroke-width="1.6"/>
<path d="M22 58C25 56 29 55.5 32 55.5" stroke="#F3D383" stroke-width="1.2" fill="none"/>`}
];
