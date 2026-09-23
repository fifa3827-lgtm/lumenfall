# Lumenfall 에셋

그림은 생성형 AI(Gemini)로 원본을 만들고, 코드로 다듬어 쓴다.
사람이 그릴 필요는 없지만 **고르는 기준**은 사람이 가진다. 이 문서는 그 기준과 방법이다.

## 현재 쓰는 에셋

```
assets/
  glass_R.png  glass_Y.png  glass_B.png     원색 유리
  glass_O.png  glass_G.png  glass_P.png     혼합색 유리
  glass_N.png                                탁한 유리
  bgm.mp3                                    배경음악
  win.mp3                                    완성 음악
  drop.mp3                                   물방울
  mix.mp3                                    크리스털 (색이 섞일 때)
  char/                                      고양이 5장, 물감 방울 12장 (아래 「캐릭터」)
  deco/                                      창턱 장식 18장 (webp, 높이 120)
  village/                                   마을 건물 9채 × 불 켠·끈 2장 (webp, 높이 150)
```

## 유리

### 원본 한 장

파랑 한 장만 뽑는다. 나머지 여섯 색은 코드로 만든다.

```
A single square piece of medieval stained glass, cobalt blue (#3D77C2), filling most of the frame.
Hand-cut edges that are slightly wavy and imperfect, not machine-straight. The glass has visible
internal character: a few small trapped air bubbles, faint horizontal streaks where the color pooled
unevenly, and areas where it is slightly thicker and therefore darker. Warm light passes through from
behind, so thin areas glow brighter and thick areas go deep. No lead came, no frame, just the glass
piece alone. Style: hand-crafted medieval stained glass, flat 2D, viewed straight-on with no
perspective. No text, no letters, no watermark. Pure black background (#000000). Centered, single
object, generous margin. Soft even lighting, no harsh specular highlights, no 3D render look,
no photorealism.
```

### 일곱 색 만들기

1. 밝기 22 이하를 배경으로 보고, 가장 큰 덩어리 하나만 남긴다. 워터마크와 잡티는 여기서 떨어져 나간다.
2. 남은 유리의 밝기만 뽑아 3~97 백분위로 늘린다.
3. 색마다 그림자 · 중간 · 밝은 색 세 개를 정하고, 밝기 0.55를 경계로 두 구간을 선형 보간한다.
4. 240×240으로 줄여 저장한다.

기포와 줄무늬가 일곱 장 모두 같아서 한 가족처럼 보인다. 칸마다 90도씩 돌리고 뒤집어 반복감을 없앤다.

| 색 | 그림자 | 중간 | 밝은 색 |
|---|---|---|---|
| R | #8E2224 | #E24B4A | #FF9E8E |
| Y | #8A6208 | #EFBE2E | #FFF0A0 |
| B | #1B4272 | #3D77C2 | #A8D4FF |
| O | #8A420E | #EC8730 | #FFCB86 |
| G | #1E5A34 | #4FA463 | #A9E6B0 |
| P | #432764 | #8257AE | #CFA8F0 |
| N | #463628 | #7E6550 | #B9A184 |

glass_N.png는 128색으로 줄여 19KB다. 화면에서는 차이가 보이지 않는다.

## 납선

지금은 코드로 그린다. 어두운 굵은 선 위에 얇은 선, 그 위로 왼쪽 위에 금속 반사선.

제미나이로 뽑은 납선 이미지(두드린 자국과 이음매가 있는 가로 막대)도 있지만,
조각 모양이 다각형이 되면서 곡선 변을 따라 이미지를 휘게 그리기 어려워 쓰지 않는다.

## 써봤다가 뺀 것

| 에셋 | 뺀 이유 |
|---|---|
| 돌벽 배경 | 질감이 유리와 어울리지 않아 화면 전체가 우중충해졌다 |
| 돌 창틀 | 너무 두꺼워 유리를 가렸다. 얇게 잘라도 액자처럼 보이지 않았다 |
| 황동 보강대 | 벽 표시로 썼는데 너무 두꺼웠다. 얇은 빛나는 선으로 바꿨다가, 조각 모양이 바뀌면서 벽 자체가 없어졌다 |
| 빛줄기 | 사각형 창에서만 어울렸다 |

## 캐릭터

```
assets/char/
  cat_base.png  cat_curious.png  cat_happy.png  cat_surprised.png  cat_sunny.png   창턱 고양이 (높이 240)
  cat_sleepy.png  cat_yawn.png  cat_wave.png  cat_love.png                      새 표정(졸기·하품·흔들기·행복, 2×2 판에서 자름)
  drop{R,Y,B}_{base,excited,sleepy,asleep}.png                                     물감 방울 (높이 140)
```

원본은 진분홍(#FF00FF) 배경으로 뽑는다. 고양이가 크림색이라 검정이나 흰 배경이면 몸까지 지워진다.

### 배경 지우기

1. 네 귀퉁이의 중앙값을 배경색으로 잡고, 배경색과의 거리로 투명도를 정한다(거리 60~120 사이를 부드럽게).
2. 가장 큰 덩어리 하나만 남기고 구멍을 메운다. 오른쪽 아래 제미나이 워터마크는 여기서 떨어져 나간다.
   신남 방울 머리 위 반짝이 선도 함께 떨어져 나가서 지금은 없다.
3. 반투명 가장자리에서 배경색을 빼 분홍 테두리를 없앤다.
4. 여백을 잘라 내고 높이를 맞춘다.

### 노랑·파랑 방울

빨강 방울 네 장에서 색상만 돌린다. 볼 홍조는 몸보다 분홍 쪽(색상 0.93~0.99)이라 얼굴 부분에서 그 색만 골라 남기고,
나머지 빨간 기운(몸·테두리·반사광)은 노랑(색상 0.125, 조금 밝게)이나 파랑(0.59, 조금 어둡게)으로 바꾼다.

### 프롬프트

고양이 기본 (첨부 없이):

```
A cute chubby cream-colored cat with soft orange tabby stripes, sitting upright and facing the viewer
in a gentle three-quarter view, looking slightly upward with big round shiny eyes and a tiny smile.
Rosy pink cheeks, small pink nose, fluffy tail curled around its front paws. Style: soft cozy
storybook illustration, clean smooth shapes, gentle warm lighting, thin darker outline, like a sticker
for a casual mobile game. Square 1:1. Full body visible, centered, nothing cut off. Solid flat magenta
background (#FF00FF), completely uniform. No text, no shadow on the ground, no props, no watermark.
```

고양이 동작 (기본 이미지를 첨부하고, 빈칸만 바꿔 한 장씩):

```
Keep the same cat character from the attached image: same art style, same fur colors and stripe pattern,
same line thickness, same solid flat magenta background (#FF00FF), square 1:1, similar size in the frame.
Redraw it in a NEW pose that is clearly different from the reference: ___
Whole body and whole tail inside the frame. No text, no shadow on the ground, no props, no watermark.
```

"같은 그림" "같은 크기·위치"를 너무 세게 적으면 제미나이가 거의 복사만 한다. 「NEW pose, clearly different」를 넣어야 바뀐다.

| 동작 | 빈칸 |
|---|---|
| 궁금 | the cat tilts its head strongly to the LEFT, ears perked straight up, eyes very wide, mouth in a tiny "o", and it lifts ONE front paw up near its chest |
| 기쁨 | eyes closed in happy crescent shapes, a big wide open smile, tail raised high straight up with a curl at the tip |
| 놀람 | leans back in surprise, eyes very round and wide, tiny open mouth, ears pulled back, fur and tail puffed up |
| 햇볕 | head tilted back, eyes gently closed, blissful smile, extra rosy cheeks, basking in warm sunlight, tail lying loosely |

물감 방울 기본 (첨부 없이, 빨강 하나만):

```
A cute round water-drop character made of glossy red paint (#E24B4A), shaped like a plump teardrop with a soft pointed top.
A soft white highlight on the upper left. Simple cute face in the lower middle: two small black dot eyes with a tiny white shine,
a small happy smile, soft pink blush on both cheeks. Style: soft cozy storybook sticker for a casual mobile game, smooth clean shapes,
thin darker red outline. Square 1:1, centered, about 60% of the frame height. Solid flat magenta background (#FF00FF).
No text, no shadow, no arms or legs, no watermark.
```

물감 방울 표정 (기본 이미지를 첨부하고): 「Keep the same paint drop character … Change ONLY the face: ___」.
신남 = eyes squeezed into happy arcs, wide open smiling mouth / 졸림 = half-closed sleepy eyes as short flat lines /
잠듦 = eyes fully closed as gentle curves, tiny round mouth. 「z」 글자는 엉뚱하게 나와서 뺐다.

## 고르는 기준

하나라도 걸리면 다시 뽑는다.

1. 정면인가. 조금이라도 비스듬하면 격자가 어긋나 보인다.
2. 대상이 하나만 있는가.
3. 배경이 완전히 균일한가.
4. 글자나 서명이 없는가.
5. 같은 묶음의 다른 이미지와 크기 · 위치 · 질감이 같은가.
6. 3D 렌더처럼 번들거리지 않는가.

제미나이 이미지는 오른쪽 아래에 반짝이 워터마크가 붙는다. 배경 위에 있으면 가장 큰 덩어리만 남기는 단계에서 떨어지고,
대상 위에 있으면 좌우 대칭 위치의 조각을 뒤집어 덮는다.

## 소리

| 파일 | 출처 | 처리 |
|---|---|---|
| bgm.mp3 | Suno | 앞뒤 1.5초 페이드, 모노 32kHz 56kbps. 120초 반복 |
| win.mp3 | Suno | 모노 32kHz 72kbps. 8.8초 |
| drop.mp3 | Freesound 853900 (alexzavesa) | 앞 무음 잘라냄, 모노 80kbps. 0.58초 |
| mix.mp3 | Freesound 609186 (mareyeslo) | 29초 녹음 중 15.4초 지점 한 번만 1.3초로 자름. 300Hz 이하 제거, 꼬리 0.55초 페이드 |

Suno 프롬프트 (종교적인 오르간은 뺐다):

```
Calm ambient instrumental. Soft glass harmonica and celesta playing slow, sparse notes with long
decay. Warm and gentle, like sunlight in a quiet room. No drums, no vocals, no build-up.
Seamless loop, 2 minutes.
```

```
A short, bright shimmer of glass bells and celesta rising into a warm major chord, then fading.
8 seconds, soft reverb, no vocals, no drums.
```

소리는 Web Audio로 한 번 디코딩해 버퍼로 재생한다. 불러오기에 실패하면 코드로 만든 합성음이 대신 난다.
완성 음악이 나오는 동안 배경음악은 0.09까지 줄였다가 7초 뒤 돌아온다.

## 창턱 장식 · 마을 건물

제미나이에 **3×3 그림판**으로 9개씩 한 번에 뽑는다(네 번이면 36장). 한 장씩 뽑는 것보다 빠르고, 한 판 안에서 그림체와 크기가 잘 맞는다.
고양이 기본 그림(`cat_base.png`)을 첨부해 그림체를 맞춘다. 원본 판과 프롬프트는 사용자 컴퓨터의 `다운로드\루멘폴-장식그림`에 있다.

| 판 | 내용 |
|---|---|
| sheet_deco1.png | 새싹 화분 · 촛불 · 조개껍데기 / 찻잔 · 책 더미 · 어항 / 모래시계 · 선인장 화분 · 지구본 |
| sheet_deco2.png | 등불 · 별 병 · 유리 등 / 스노볼 · 호박 등불 · 풍차 / 종이배 · 꽃병 · 기차 모형 |
| sheet_house.png | 온실 · 학교 · 성당 / 기차역 · 천문대 · 헛간 / 빵집 · 과일 가게 · 등대 (창에 불 켬) |
| sheet_house_off.png | 위 판을 첨부해 창 불만 끈 것 |

프롬프트 끝에 공통으로 붙이는 말: 「첨부한 고양이 그림과 같은 그림체 … 정사각형 1:1 그림 한 장에 가로 3칸 × 세로 3칸으로 9개를 고르게 나눠 배치,
서로 닿거나 겹치지 않게, 칸 나누는 선 없이, 배경은 완전히 고른 진분홍 단색(#FF00FF), 글자·번호·그림자·워터마크 없이」.

### 자르기

```
python3 tools/art/cut_sheet.py 판.png 출력폴더 이름1,…,이름9 높이 [불빛그림이름,…]
```

1. 네 귀퉁이 중앙값을 배경색으로 보고 색 거리 60~120 사이를 부드러운 투명도로 둔다.
2. 칸(3×3)마다 가장 큰 덩어리와 그것의 3% 이상인 덩어리(찻잔 김, 기차 연기)만 남긴다.
   **판 오른쪽 아래 구석의 작은 반짝이(제미나이 표시)는 여기서 지운다.**
3. 덩어리 안쪽은 완전히 불투명하게 둔다. 건물 판은 배경이 어두운 진분홍이라 빨간 벽이 반투명으로 읽혀 초록으로 바뀌었다.
   배경색과 거의 같은 구멍(손잡이 안쪽 등)만 투명하게 남긴다.
4. 반투명 가장자리에서 배경색을 뺀다. 투명 유리(별 병)처럼 배경이 비쳐 분홍 기가 도는 곳은 눌러 준다.
5. 불빛 그림(촛불 · 등불 · 별 병 · 유리 등)은 빛 번짐이 진분홍과 섞여 있어서, 초록 값으로 빛의 양을 되짚어 따뜻한 빛만 남긴다.
   유리 등은 갓 아래 연어색 번짐을 지운다.
6. 게임에는 webp로 줄여 넣는다(장식 높이 120, 건물 150). 36장에 약 240KB.

### 게임에서

- 장식은 `ART.deco`(assets.js)에 그림이 있으면 그림을, 없으면 `deco.js`의 SVG를 쓴다. 불빛 장식은 은은하게 빛이 숨 쉰다.
- 마을은 하늘과 땅만 SVG로 그리고, 건물은 불 끈 그림 위에 불 켠 그림을 모은 그림 비율만큼(최대 75%) 겹친다.
  묶음을 다 모으면 불 켠 그림만 그리고 뒤에 빛을 번지게 한다. 하나도 없으면 조금 더 어둡게.

### 고양이 새 표정 (2×2 판)

기본 고양이를 첨부하고 「같은 고양이를 네 가지 새 자세로, 가로 2칸 × 세로 2칸」으로 한 장에 뽑는다(졸기 · 하품 기지개 · 앞발 흔들기 · 행복).
`GRID=2 python3 tools/art/cut_sheet.py 판.png 폴더 cat_sleepy,cat_yawn,cat_wave,cat_love 400`으로 자르고 높이 240으로 맞춘다.
