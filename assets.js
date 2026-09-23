/* 에셋 경로 */
const TEX = {
  R:'assets/glass_R.png', Y:'assets/glass_Y.png', B:'assets/glass_B.png',
  O:'assets/glass_O.png', G:'assets/glass_G.png', P:'assets/glass_P.png',
  N:'assets/glass_N.png'
};
const AUD = {
  bgm:'assets/bgm.mp3', win:'assets/win.mp3',
  drop:'assets/drop.mp3', mix:'assets/mix.mp3'
};
/* 캐릭터: 창턱 고양이와 물감 방울 (제미나이 원본을 진분홍 배경에서 잘라냄) */
const CHAR = {
  cat:{base:'assets/char/cat_base.png', curious:'assets/char/cat_curious.png', happy:'assets/char/cat_happy.png',
       sunny:'assets/char/cat_sunny.png', surprised:'assets/char/cat_surprised.png',
       /* 새 표정(제미나이 2×2 판): 없으면 게임이 비슷한 표정으로 대신한다 */
       sleepy:'assets/char/cat_sleepy.png', yawn:'assets/char/cat_yawn.png', wave:'assets/char/cat_wave.png', love:'assets/char/cat_love.png'},
  drop:{}
};
['R','Y','B'].forEach(c=>{CHAR.drop[c]={};['base','excited','sleepy','asleep'].forEach(e=>CHAR.drop[c][e]=`assets/char/drop${c}_${e}.png`)});
/* 창턱 장식과 마을 건물 그림 (제미나이 3×3 그림판을 tools/art/cut_sheet.py로 잘라 webp로) */
const ART={deco:{},house:{}};
['sprout','candle','shell','tea','books','bowl','hourglass','cactus','globe','lantern','starjar','lamp','globe2','jack','mill','boat','vase','train']
 .forEach(k=>ART.deco[k]=`assets/deco/${k}.webp`);
['greenhouse','school','church','station','observatory','barn','bakery','fruit','lighthouse']
 .forEach(k=>{ART.house[k]=`assets/village/${k}.webp`;ART.house[k+'_off']=`assets/village/${k}_off.webp`});
