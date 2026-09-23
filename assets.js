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
       sunny:'assets/char/cat_sunny.png', surprised:'assets/char/cat_surprised.png'},
  drop:{}
};
['R','Y','B'].forEach(c=>{CHAR.drop[c]={};['base','excited','sleepy','asleep'].forEach(e=>CHAR.drop[c][e]=`assets/char/drop${c}_${e}.png`)});
