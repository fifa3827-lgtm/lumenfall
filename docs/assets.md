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

## 캐릭터 (준비 중)

배경을 **진분홍 #FF00FF**로 둔다. 고양이가 크림색이라 검정이나 흰 배경이면 몸까지 지워진다.

### 고양이 기본

```
A cute chubby cream-colored cat with soft orange tabby stripes, sitting upright and facing the viewer
in a gentle three-quarter view, looking slightly upward with big round shiny eyes and a tiny smile.
Rosy pink cheeks, small pink nose, fluffy tail curled around its front paws. Style: soft cozy
storybook illustration, clean smooth shapes, gentle warm lighting, thin darker outline, like a sticker
for a casual mobile game. Full body visible, centered, nothing cut off. Solid flat magenta background
(#FF00FF), completely uniform. No text, no shadow on the ground, no props, no watermark.
```

### 고양이 동작 (기본 이미지를 첨부하고)

```
Same cat, same art style, same colors, same size and framing, same magenta background.
Only the pose and expression change: ___
```

| 동작 | 빈칸 |
|---|---|
| 궁금 | ears perked up high, head tilted to one side, eyes wide and curious |
| 기쁨 | eyes closed in happy crescent shapes, big smile, tail raised high and curved at the tip |
| 놀람 | eyes very round and wide, tiny open mouth, ears slightly back, fur a little puffed |
| 햇볕 | eyes gently closed, blissful face, cheeks extra rosy, head tilted back as if basking in warm sunlight |

### 물감 방울 기본

빨강 하나만 뽑는다. 노랑과 파랑은 유리와 같은 방법으로 색을 바꾼다.

```
A cute round water-drop character made of glossy red paint (#E24B4A), shaped like a plump teardrop
with a pointed top. A soft white highlight on the upper left. Simple cute face in the lower middle:
two small black dot eyes with a tiny white shine, a small happy smile, soft pink blush on both cheeks.
Style: soft cozy casual mobile game sticker, smooth clean shapes, thin darker red outline. Centered,
full body. Solid flat magenta background (#FF00FF). No text, no shadow, no arms or legs, no watermark.
```

### 물감 방울 표정 (기본 이미지를 첨부하고)

```
Same paint drop character, same shape, color, size, framing and magenta background.
Only the face changes: ___
```

| 표정 | 빈칸 |
|---|---|
| 신남 | eyes squeezed into happy arcs, wide open smiling mouth, three tiny sparkle lines above its head |
| 졸림 | half-closed sleepy eyes shown as short flat lines, small calm mouth |
| 잠듦 | eyes fully closed as gentle curves, tiny round mouth, a small "z" floating near the top |

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
