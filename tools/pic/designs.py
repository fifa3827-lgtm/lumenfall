"""그림 창 도안. 부분(굵은 납선으로 나뉨)마다 모양·조각 수·색 이름을 적는다.
색 이름: red orange yellow green blue purple. 여러 개를 주면 회차마다 돌아가며 쓴다."""
import numpy as np
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from shapely import affinity
def bez(p0,p1,p2,p3,n=14):
    t=np.linspace(0,1,n)[:,None];p0,p1,p2,p3=map(np.array,(p0,p1,p2,p3))
    return list(map(tuple,((1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t**2*p2+t**3*p3)))
def path(*segs):
    pts=[]
    for s in segs: pts+= s if not pts else s[1:]
    return Polygon(pts).buffer(0)
def circ(x,y,r):return Point(x,y).buffer(r,resolution=24)
def ell(x,y,rx,ry,rot=0):return affinity.rotate(affinity.scale(Point(x,y).buffer(1,resolution=24),rx,ry),rot)
def poly(*p):return Polygon(p).buffer(0)
U=unary_union
def minus(a,*bs):
    for b in bs:a=a.difference(b)
    return a

def tulip():
    flower=path(bez((-0.31,-0.66),(-0.40,-0.35),(-0.33,-0.05),(0,0.02)),bez((0,0.02),(0.33,-0.05),(0.40,-0.35),(0.31,-0.66)),
      bez((0.31,-0.66),(0.22,-0.52),(0.16,-0.46),(0.12,-0.42)),bez((0.12,-0.42),(0.08,-0.55),(0.04,-0.70),(0,-0.76)),
      bez((0,-0.76),(-0.04,-0.70),(-0.08,-0.55),(-0.12,-0.42)),bez((-0.12,-0.42),(-0.16,-0.46),(-0.22,-0.52),(-0.31,-0.66)))
    pot=poly((-0.34,0.60),(0.34,0.60),(0.25,0.98),(-0.25,0.98)).buffer(0.03).buffer(-0.01)
    stem=box(-0.05,-0.02,0.05,0.64)
    lL=path(bez((-0.04,0.60),(-0.30,0.52),(-0.50,0.30),(-0.50,-0.02)),bez((-0.50,-0.02),(-0.34,0.14),(-0.12,0.30),(-0.04,0.40)))
    lR=path(bez((0.04,0.62),(0.28,0.56),(0.46,0.42),(0.50,0.16)),bez((0.50,0.16),(0.34,0.24),(0.14,0.36),(0.04,0.46)))
    plant=minus(U([stem,lL,lR]),flower,pot)
    return '튤립',[(flower,7,['red','purple','yellow']),(plant,7,['green']),(pot,4,['orange','blue'])]

def fish():
    body=ell(-0.08,0,0.62,0.40)
    tail=poly((0.42,0),(0.85,-0.38),(0.78,0),(0.85,0.38))
    head=minus(body,box(-0.30,-1,1,1))
    rest=minus(body,head)
    fin=path(bez((-0.20,-0.36),(-0.05,-0.62),(0.20,-0.60),(0.30,-0.30)))
    fin=minus(fin,body)
    return '물고기',[(head,4,['yellow','orange']),(rest,7,['blue','orange','purple']),(U([tail,fin]).difference(body),6,['purple','red','green'])]

def house():
    roof=poly((-0.72,-0.10),(0,-0.78),(0.72,-0.10))
    wall=box(-0.56,-0.10,0.56,0.72)
    door=box(-0.14,0.30,0.14,0.72)
    win=U([box(-0.46,0.02,-0.22,0.24),box(0.22,0.02,0.46,0.24)])
    wall=minus(wall,door,win)
    chim=box(0.34,-0.70,0.50,-0.40).difference(roof)
    return '집',[(roof,6,['red','purple']),(wall,6,['yellow','orange']),(U([door,chim]),3,['green','blue']),(win,2,['blue'])]

def tree():
    crown=U([circ(0,-0.35,0.40),circ(-0.34,-0.10,0.30),circ(0.34,-0.10,0.30),circ(0,0.02,0.30)])
    trunk=poly((-0.10,0.18),(0.10,0.18),(0.14,0.80),(-0.14,0.80)).difference(crown)
    apples=U([circ(-0.22,-0.30,0.08),circ(0.18,-0.46,0.08),circ(0.26,-0.02,0.08)])
    crown=minus(crown,apples)
    return '나무',[(crown,8,['green']),(trunk,3,['orange']),(apples,3,['red','yellow','purple'])]

def mushroom():
    cap=path(bez((-0.70,0.05),(-0.70,-0.60),(0.70,-0.60),(0.70,0.05)))
    dots=U([circ(-0.30,-0.20,0.10),circ(0.10,-0.34,0.09),circ(0.40,-0.08,0.08)])
    cap=minus(cap,dots)
    stem=path(bez((-0.22,0.05),(-0.30,0.40),(-0.26,0.70),(0,0.72)),bez((0,0.72),(0.26,0.70),(0.30,0.40),(0.22,0.05)))
    return '버섯',[(cap,7,['red','purple','blue']),(dots,3,['yellow']),(stem,4,['orange','yellow'])]

def butterfly():
    body=ell(0,0.05,0.07,0.52)
    wUL=ell(-0.40,-0.28,0.36,0.30,20).difference(body);wUR=affinity.scale(wUL,-1,1,origin=(0,0))
    wLL=ell(-0.30,0.30,0.25,0.22,-20).difference(body).difference(wUL);wLR=affinity.scale(wLL,-1,1,origin=(0,0))
    return '나비',[(U([wUL,wUR]),8,['purple','blue','orange']),(U([wLL,wLR]),6,['yellow','red','green']),(body,3,['orange','blue'])]

def boat():
    hull=poly((-0.72,0.35),(0.72,0.35),(0.48,0.68),(-0.48,0.68))
    sail1=poly((-0.04,-0.80),(-0.04,0.28),(-0.60,0.28))
    sail2=poly((0.04,-0.62),(0.04,0.28),(0.52,0.28))
    wave=path(bez((-0.80,0.74),(-0.4,0.66),(0.4,0.82),(0.80,0.74)),[(0.80,0.74),(0.80,0.92),(-0.80,0.92),(-0.80,0.74)])
    wave=wave.difference(hull)
    return '돛단배',[(sail1,5,['yellow','red']),(sail2,4,['orange','purple']),(hull,4,['red','blue']),(wave,5,['blue','green'])]

def icecream():
    cone=poly((-0.30,0.05),(0.30,0.05),(0,0.90))
    s1=circ(0,-0.12,0.32);s2=circ(0,-0.52,0.26).difference(s1)
    cherry=circ(0.06,-0.82,0.09).difference(s2)
    s1=s1.difference(cone)
    return '아이스크림',[(cone,4,['orange']),(s1,6,['yellow','green','blue']),(s2,5,['purple','red','orange']),(cherry,1,['red'])]

def rocket():
    body=path(bez((-0.22,0.50),(-0.30,-0.10),(-0.20,-0.55),(0,-0.85)),bez((0,-0.85),(0.20,-0.55),(0.30,-0.10),(0.22,0.50)))
    nose=body.intersection(box(-1,-1,1,-0.50));body=body.difference(nose)
    win=circ(0,-0.20,0.11);body=body.difference(win)
    fins=U([poly((-0.24,0.10),(-0.50,0.58),(-0.22,0.50)),poly((0.24,0.10),(0.50,0.58),(0.22,0.50))]).difference(body)
    flame=path(bez((-0.16,0.52),(-0.20,0.75),(-0.05,0.85),(0,0.95)),bez((0,0.95),(0.05,0.85),(0.20,0.75),(0.16,0.52)))
    return '로켓',[(nose,3,['red','purple']),(body,5,['blue','green']),(U([fins,win]),4,['orange','yellow']),(flame,3,['yellow','orange'])]

def heartballoon():
    h=path(bez((0,-0.30),(-0.10,-0.72),(-0.72,-0.66),(-0.66,-0.20)),bez((-0.66,-0.20),(-0.60,0.12),(-0.20,0.30),(0,0.52)),
           bez((0,0.52),(0.20,0.30),(0.60,0.12),(0.66,-0.20)),bez((0.66,-0.20),(0.72,-0.66),(0.10,-0.72),(0,-0.30)))
    left=h.intersection(box(-1,-1,0,1));right=h.difference(left)
    knot=poly((-0.08,0.60),(0.08,0.60),(0,0.50)).buffer(0.02)
    tail=path(bez((-0.03,0.62),(0.10,0.72),(-0.10,0.84),(0.03,0.95)),bez((0.03,0.95),(0.10,0.84),(-0.06,0.72),(0.05,0.62))).buffer(0.015)
    return '하트 풍선',[(left,6,['red','purple']),(right,6,['red','orange','purple']),(U([knot,tail]).difference(h),2,['yellow'])]

def star():
    pts=[]
    for k in range(10):
        a=-np.pi/2+k*np.pi/5;r=0.9 if k%2==0 else 0.40
        pts.append((np.cos(a)*r,np.sin(a)*r+0.06))
    s=Polygon(pts)
    core=circ(0,0.06,0.30);arms=s.difference(core)
    return '별',[(core,4,['orange','red']),(arms,10,['yellow','green','blue'])]

def sun():
    core=circ(0,0,0.40)
    rays=[]
    for k in range(8):
        a=k*np.pi/4
        c,s=np.cos(a),np.sin(a)
        rays.append(poly((c*0.48-s*0.10,s*0.48+c*0.10),(c*0.86,s*0.86),(c*0.48+s*0.10,s*0.48-c*0.10)))
    face=core
    return '해님',[(face,6,['yellow','orange']),(U(rays),8,['orange','red'])]

DESIGNS=[tulip,fish,house,tree,mushroom,butterfly,boat,icecream,rocket,heartballoon,star,sun]

# ---- 두 번째 묶음: 계절 · 학교 · 동물 ----
def snowman():
    body=circ(0,0.46,0.42);head=circ(0,-0.30,0.30).difference(body)
    hat=U([box(-0.22,-0.98,0.22,-0.64),box(-0.36,-0.68,0.36,-0.56)]).difference(head)
    # 목도리는 손가락으로 누를 수 있게 두껍게(높이 0.20)
    scarf=box(-0.34,-0.10,0.34,0.10)
    head=head.difference(scarf);body=body.difference(scarf)
    return '눈사람',[(body,6,['blue','purple']),(head,4,['blue']),(scarf,2,['red','green']),(hat,3,['purple','red'])]

def maple():
    pts=[(0,-0.95),(0.14,-0.55),(0.40,-0.70),(0.30,-0.30),(0.80,-0.40),(0.62,-0.10),(0.85,0.08),(0.40,0.20),(0.46,0.46),
         (0.11,0.34),(0.11,0.95),(-0.11,0.95),(-0.11,0.34),(-0.46,0.46),(-0.40,0.20),(-0.85,0.08),(-0.62,-0.10),(-0.80,-0.40),
         (-0.30,-0.30),(-0.40,-0.70),(-0.14,-0.55)]
    leaf=Polygon(pts).buffer(0)
    stem=leaf.intersection(box(-0.15,0.40,0.15,1));leaf=leaf.difference(stem)
    left=leaf.intersection(box(-1,-1,0,1));right=leaf.difference(left)
    return '단풍잎',[(left,6,['red','orange']),(right,6,['orange','yellow']),(stem,2,['orange'])]

def watermelon():
    rind=path(bez((-0.85,-0.25),(-0.70,0.60),(0.70,0.60),(0.85,-0.25))).buffer(0)
    flesh=path(bez((-0.72,-0.25),(-0.58,0.44),(0.58,0.44),(0.72,-0.25))).buffer(0)
    rind=rind.difference(flesh)
    seeds=U([ell(-0.30,0.0,0.05,0.08),ell(0,0.12,0.05,0.08),ell(0.30,0.0,0.05,0.08)])
    flesh=flesh.difference(seeds)
    return '수박',[(flesh,7,['red']),(rind,5,['green']),(seeds,3,['purple','blue'])]

def umbrella():
    can=path(bez((-0.85,-0.05),(-0.80,-0.80),(0.80,-0.80),(0.85,-0.05)))
    a=can.intersection(box(-1,-1,-0.28,1));c=can.intersection(box(0.28,-1,1,1));b=can.difference(a).difference(c)
    handle=U([box(-0.08,-0.05,0.08,0.70),Point(-0.20,0.70).buffer(0.28).difference(Point(-0.20,0.70).buffer(0.12)).intersection(box(-1,0.70,1,1))])
    return '우산',[(a,4,['blue','purple']),(b,4,['yellow','red']),(c,4,['blue','green']),(handle,3,['orange'])]

def pencil():
    body=box(-0.18,-0.45,0.18,0.55)
    tip=poly((-0.18,0.55),(0.18,0.55),(0,0.95))
    lead=poly((-0.11,0.72),(0.11,0.72),(0,0.95));tip=tip.difference(lead)
    eraser=box(-0.18,-0.90,0.18,-0.60);band=box(-0.18,-0.60,0.18,-0.45)
    return '연필',[(body,5,['yellow','green']),(tip,2,['orange']),(lead,1,['purple']),(eraser,2,['red']),(band,1,['blue'])]

def bell():
    b=path(bez((-0.62,0.50),(-0.50,0.30),(-0.52,-0.62),(0,-0.66)),bez((0,-0.66),(0.52,-0.62),(0.50,0.30),(0.62,0.50)))
    rim=box(-0.70,0.50,0.70,0.66)
    clap=circ(0,0.78,0.12)
    top=circ(0,-0.76,0.11).difference(b)
    band=b.intersection(box(-1,0.10,1,0.28));b=b.difference(band)
    return '종',[(b,7,['yellow','orange']),(band,2,['red','blue']),(rim,3,['orange']),(U([clap,top]),2,['purple'])]

def book():
    L=poly((-0.85,-0.55),(-0.02,-0.45),(-0.02,0.65),(-0.85,0.55));R=poly((0.02,-0.45),(0.85,-0.55),(0.85,0.55),(0.02,0.65))
    cover=poly((-0.98,-0.50),(0,-0.40),(0.98,-0.50),(0.98,0.78),(0,0.90),(-0.98,0.78)).difference(L).difference(R)
    mark=poly((0.44,0.50),(0.70,0.50),(0.70,1.02),(0.57,0.92),(0.44,1.02)).difference(R).difference(cover)
    return '책',[(L,6,['yellow','blue']),(R,6,['yellow','green']),(cover,4,['red','purple']),(mark,1,['green','red'])]

def catface():
    face=ell(0,0.12,0.72,0.62)
    earL=poly((-0.66,-0.10),(-0.58,-0.88),(-0.18,-0.42));earR=poly((0.66,-0.10),(0.58,-0.88),(0.18,-0.42))
    ears=U([earL,earR]).difference(face)
    eyes=U([ell(-0.28,0.02,0.10,0.14),ell(0.28,0.02,0.10,0.14)])
    nose=poly((-0.13,0.24),(0.13,0.24),(0,0.40))
    face=face.difference(eyes).difference(nose)
    return '고양이 얼굴',[(face,8,['orange','yellow']),(ears,4,['orange','red']),(eyes,2,['green','blue']),(nose,1,['red'])]

def owl():
    body=ell(0,0.15,0.58,0.75)
    eyes=U([circ(-0.24,-0.18,0.20),circ(0.24,-0.18,0.20)])
    beak=poly((-0.08,0.02),(0.08,0.02),(0,0.20))
    belly=ell(0,0.52,0.34,0.30)
    ears=U([poly((-0.50,-0.40),(-0.44,-0.85),(-0.20,-0.52)),poly((0.50,-0.40),(0.44,-0.85),(0.20,-0.52))]).difference(body)
    body=minus(body,eyes,beak,belly)
    return '부엉이',[(body,7,['purple','orange']),(eyes,2,['yellow']),(belly,4,['yellow','green']),(U([beak,ears]),3,['orange','red'])]

def turtle():
    shell=path(bez((-0.62,0.20),(-0.60,-0.62),(0.60,-0.62),(0.62,0.20)))
    head=circ(0.82,0.05,0.18).difference(shell)
    legs=U([ell(-0.42,0.34,0.14,0.12),ell(0.40,0.34,0.14,0.12),poly((-0.60,0.04),(-0.96,0.18),(-0.60,0.30))]).difference(shell)
    mid=shell.intersection(circ(0,-0.14,0.26));shell=shell.difference(mid)
    return '거북',[(shell,7,['green','blue']),(mid,2,['yellow','orange']),(U([head,legs]),4,['green','yellow'])]

def cactus():
    main=box(-0.18,-0.80,0.18,0.40).union(circ(0,-0.80,0.18))
    armL=U([box(-0.56,-0.36,-0.18,-0.18),box(-0.56,-0.66,-0.38,-0.18),circ(-0.47,-0.66,0.09)])
    armR=U([box(0.18,-0.12,0.56,0.06),box(0.38,-0.48,0.56,0.06),circ(0.47,-0.48,0.09)])
    pot=poly((-0.42,0.40),(0.42,0.40),(0.32,0.92),(-0.32,0.92))
    flower=circ(0,-0.98,0.15).difference(main)
    return '선인장',[(main,5,['green']),(U([armL,armR]).difference(main),4,['green','yellow']),(pot,4,['orange','red','purple']),(flower,1,['red','purple'])]

def cupcake():
    cup=poly((-0.52,0.10),(0.52,0.10),(0.38,0.85),(-0.38,0.85))
    cream=U([circ(-0.30,-0.02,0.26),circ(0.30,-0.02,0.26),circ(0,-0.30,0.30),box(-0.56,-0.02,0.56,0.10)]).difference(cup)
    cherry=circ(0,-0.70,0.13).difference(cream)
    return '컵케이크',[(cup,5,['blue','orange']),(cream,7,['purple','yellow','red']),(cherry,1,['red'])]

def balloon():
    env=path(bez((0,0.30),(-0.80,0.00),(-0.70,-0.95),(0,-0.95)),bez((0,-0.95),(0.70,-0.95),(0.80,0.00),(0,0.30)))
    s1=env.intersection(box(-1,-1,-0.22,1));s3=env.intersection(box(0.22,-1,1,1));s2=env.difference(s1).difference(s3)
    basket=box(-0.24,0.46,0.24,0.86)
    return '열기구',[(s1,4,['red','blue']),(s2,4,['yellow']),(s3,4,['red','green']),(basket,2,['orange'])]

def snail():
    shell=circ(0.10,-0.10,0.50)
    swirl=circ(0.14,-0.14,0.24)
    body=path(bez((-0.90,0.45),(-0.80,0.20),(-0.40,0.40),(0.60,0.40)),[(0.60,0.40),(0.70,0.58),(-0.90,0.58)]).difference(shell)
    head=circ(-0.74,0.18,0.18).difference(body)
    shell=shell.difference(swirl)
    return '달팽이',[(shell,7,['orange','purple']),(swirl,2,['yellow','red']),(U([body,head]),4,['green','yellow'])]

DESIGNS += [snowman,maple,watermelon,umbrella,pencil,bell,book,catface,owl,turtle,cactus,cupcake,balloon,snail]

# ---- 세 번째 묶음: 정원·과일·하늘·바다·탈것·물건·동물·축제 (46가지) ----
def rect(x0,y0,x1,y1):return box(x0,y0,x1,y1)
def petals(cx,cy,n,r,pr,off=0):
    return U([ell(cx+np.cos(off+k*2*np.pi/n)*r,cy+np.sin(off+k*2*np.pi/n)*r,pr,pr*0.62,np.degrees(off+k*2*np.pi/n)) for k in range(n)])

def sunflower():
    core=circ(0,-0.25,0.24);pet=petals(0,-0.25,10,0.40,0.20).difference(core)
    stem=rect(-0.05,0.10,0.05,0.95).difference(pet)
    leaf=U([ell(-0.26,0.52,0.24,0.10,-30),ell(0.26,0.62,0.24,0.10,30)]).difference(stem)
    return '해바라기',[(pet,9,['yellow','orange']),(core,4,['orange','red']),(U([stem,leaf]),5,['green'])]

def clover():
    ls=U([circ(0,-0.40,0.27),circ(-0.34,-0.08,0.27),circ(0.34,-0.08,0.27),circ(0,0.20,0.27)])
    stem=poly((-0.05,0.40),(0.05,0.40),(0.20,0.95),(0.10,0.95)).difference(ls)
    mid=circ(0,-0.10,0.12);ls=ls.difference(mid)
    return '네잎클로버',[(ls,10,['green']),(mid,1,['yellow']),(stem,2,['green','yellow'])]

def apple():
    body=U([circ(-0.24,0.12,0.50),circ(0.24,0.12,0.50)]).intersection(box(-1,-0.40,1,1)).buffer(0.02)
    stem=rect(-0.04,-0.66,0.06,-0.36).difference(body)
    leaf=ell(0.26,-0.56,0.20,0.10,-25).difference(body)
    shine=ell(-0.32,-0.06,0.10,0.16,20);body=body.difference(shine)
    return '사과',[(body,8,['red','yellow']),(shine,1,['orange']),(U([stem,leaf]),2,['green'])]

def cherry():
    a=circ(-0.34,0.44,0.30);b=circ(0.34,0.50,0.30)
    st=U([poly((-0.36,0.16),(-0.28,0.16),(0.04,-0.70),(-0.04,-0.70)),poly((0.30,0.22),(0.38,0.22),(0.06,-0.70),(-0.02,-0.70))])
    leaf=ell(0.30,-0.62,0.26,0.11,-15).difference(st)
    return '체리',[(a,4,['red','purple']),(b,4,['red','purple']),(st.difference(a).difference(b),3,['green','orange']),(leaf,2,['green'])]

def strawberry():
    body=path(bez((-0.62,-0.30),(-0.70,0.30),(-0.20,0.90),(0,0.95)),bez((0,0.95),(0.20,0.90),(0.70,0.30),(0.62,-0.30)))
    top=U([poly((-0.62,-0.34),(-0.30,-0.62),(0,-0.36),(0.30,-0.62),(0.62,-0.34),(0,-0.18))]).difference(body)
    cap=rect(-0.06,-0.90,0.06,-0.50).difference(top)
    return '딸기',[(body,9,['red','orange']),(U([top,cap]),4,['green'])]

def grapes():
    pts=[(-0.36,-0.30),(0,-0.30),(0.36,-0.30),(-0.18,0.02),(0.18,0.02),(-0.36,0.34),(0,0.34),(0.36,0.34),(-0.18,0.66),(0.18,0.66),(0,0.95)]
    gr=[circ(x,y*0.9,0.20) for x,y in pts]
    bunch=U(gr)
    stem=rect(-0.04,-0.80,0.05,-0.46).difference(bunch);leaf=ell(-0.24,-0.62,0.26,0.12,15).difference(bunch).difference(stem)
    return '포도',[(bunch,11,['purple','blue','green']),(U([stem,leaf]),3,['green'])]

def carrot():
    body=poly((-0.30,-0.40),(0.30,-0.40),(0.04,0.95),(-0.04,0.95)).buffer(0.04)
    tops=U([ell(-0.18,-0.66,0.10,0.26,-20),ell(0,-0.72,0.10,0.28),ell(0.18,-0.66,0.10,0.26,20)]).difference(body)
    return '당근',[(body,7,['orange','red']),(tops,4,['green'])]

def xmastree():
    t1=poly((0,-0.95),(-0.36,-0.42),(0.36,-0.42));t2=poly((0,-0.62),(-0.56,0.04),(0.56,0.04)).difference(t1)
    t3=poly((0,-0.24),(-0.74,0.56),(0.74,0.56)).difference(t1).difference(t2)
    trunk=rect(-0.12,0.56,0.12,0.90)
    star=Polygon([(np.cos(-np.pi/2+k*np.pi/5)*(0.16 if k%2==0 else 0.07),np.sin(-np.pi/2+k*np.pi/5)*(0.16 if k%2==0 else 0.07)-0.95) for k in range(10)]).buffer(0.02).difference(t1)
    return '크리스마스트리',[(t1,3,['green']),(t2,5,['green','blue']),(t3,7,['green']),(trunk,2,['orange']),(star,1,['yellow'])]

def pumpkin():
    body=U([ell(-0.34,0.15,0.34,0.52),ell(0.34,0.15,0.34,0.52),ell(0,0.15,0.36,0.58)])
    stem=poly((-0.06,-0.70),(0.10,-0.70),(0.14,-0.40),(-0.10,-0.40)).difference(body)
    face=U([poly((-0.34,-0.04),(-0.14,-0.04),(-0.24,-0.22)),poly((0.14,-0.04),(0.34,-0.04),(0.24,-0.22)),poly((-0.36,0.30),(0.36,0.30),(0.20,0.48),(0,0.40),(-0.20,0.48))])
    body=body.difference(face)
    return '호박',[(body,10,['orange','yellow']),(face,3,['yellow','red']),(stem,1,['green'])]

def blossom():
    pet=petals(0,0,5,0.44,0.34,-np.pi/2)
    core=circ(0,0,0.20);pet=pet.difference(core)
    return '벚꽃',[(pet,10,['red','purple']),(core,3,['yellow','orange'])]

def rainbow():
    bands=[];r=[0.95,0.80,0.65,0.50,0.35]
    for k in range(4):
        b=circ(0,0.45,r[k]).difference(circ(0,0.45,r[k+1])).intersection(box(-1,-1,1,0.45))
        bands.append(b)
    cloud=U([circ(-0.70,0.50,0.20),circ(-0.48,0.46,0.22),circ(0.48,0.46,0.22),circ(0.70,0.50,0.20)])
    bands=[b.difference(cloud) for b in bands]
    return '무지개',[(bands[0],5,['red']),(bands[1],4,['orange','yellow']),(bands[2],4,['green']),(bands[3],3,['blue','purple']),(cloud,4,['blue'])]

def moon():
    m=circ(0,0,0.80).difference(circ(0.34,-0.18,0.70))
    stars=U([Polygon([(np.cos(-np.pi/2+k*np.pi/5)*(0.18 if k%2==0 else 0.08)+cx,np.sin(-np.pi/2+k*np.pi/5)*(0.18 if k%2==0 else 0.08)+cy) for k in range(10)]) for cx,cy in [(0.46,0.02),(0.20,0.50)]]).difference(m)
    return '초승달',[(m,7,['yellow','orange']),(stars,2,['yellow','blue'])]

def saturn():
    pl=circ(0,0,0.46)
    ring=ell(0,0,0.95,0.26,-18).difference(ell(0,0,0.62,0.14,-18))
    front=ring.difference(pl.intersection(box(-1,-1,1,0.02)).buffer(0)).difference(pl.difference(box(-1,0.0,1,1)))
    pl=pl.difference(front)
    band=pl.intersection(ell(0,0,0.60,0.10,-18));pl=pl.difference(band)
    return '토성',[(pl,6,['orange','yellow']),(band,2,['red','purple']),(front,6,['yellow','blue'])]

def storm():
    cloud=U([circ(-0.42,-0.20,0.30),circ(0,-0.38,0.38),circ(0.44,-0.18,0.30),rect(-0.60,-0.20,0.60,0.12)])
    bolt=poly((0.06,0.10),(-0.24,0.56),(-0.02,0.56),(-0.18,0.96),(0.28,0.40),(0.04,0.40),(0.20,0.10)).difference(cloud)
    drops=U([ell(-0.52,0.40,0.08,0.13),ell(0.50,0.46,0.08,0.13)])
    return '구름과 번개',[(cloud,8,['blue','purple']),(bolt,3,['yellow','orange']),(drops,2,['blue'])]

def kite():
    k=poly((0,-0.95),(0.50,-0.30),(0,0.40),(-0.50,-0.30))
    q=[k.intersection(box(-1,-1,0,-0.30)),k.intersection(box(0,-1,1,-0.30)),k.intersection(box(-1,-0.30,0,1)),k.intersection(box(0,-0.30,1,1))]
    tail=U([poly((-0.02,0.40),(0.02,0.40),(0.10,0.95),(0.04,0.95)).buffer(0.02),poly((-0.14,0.56),(0.14,0.60),(0,0.68)),poly((-0.06,0.78),(0.24,0.80),(0.12,0.88))])
    return '연',[(q[0],2,['red']),(q[1],2,['yellow']),(q[2],2,['blue']),(q[3],2,['green']),(tail,3,['orange','purple'])]

def car():
    body=U([rect(-0.90,-0.02,0.90,0.40),poly((-0.50,-0.02),(-0.30,-0.40),(0.34,-0.40),(0.58,-0.02))]).buffer(0.03)
    win=U([poly((-0.40,-0.06),(-0.24,-0.32),(-0.02,-0.32),(-0.02,-0.06)),poly((0.04,-0.06),(0.04,-0.32),(0.28,-0.32),(0.46,-0.06))])
    wh=U([circ(-0.52,0.42,0.20),circ(0.52,0.42,0.20)])
    body=body.difference(win).difference(wh)
    return '자동차',[(body,8,['red','blue','yellow']),(win,2,['blue']),(wh,2,['purple'])]

def bus():
    body=rect(-0.92,-0.46,0.92,0.40).buffer(0.04)
    wins=U([rect(-0.80+k*0.42,-0.34,-0.50+k*0.42,-0.04) for k in range(4)])
    wh=U([circ(-0.52,0.42,0.18),circ(0.52,0.42,0.18)])
    body=body.difference(wins).difference(wh)
    return '버스',[(body,8,['yellow','orange']),(wins,4,['blue']),(wh,2,['purple'])]

def train():
    cab=rect(0.20,-0.60,0.82,0.30);boiler=rect(-0.78,-0.24,0.20,0.30)
    chim=rect(-0.60,-0.60,-0.36,-0.24);roof=rect(0.14,-0.72,0.90,-0.60)
    win=rect(0.34,-0.46,0.68,-0.16);cab=cab.difference(win)
    wh=U([circ(-0.50,0.46,0.18),circ(0,0.46,0.18),circ(0.52,0.46,0.18)]).difference(boiler).difference(cab)
    return '기차',[(boiler,5,['red','green']),(cab,4,['blue','red']),(U([chim,roof]),2,['purple']),(win,1,['yellow']),(wh,3,['orange'])]

def airplane():
    body=ell(0,0,0.92,0.18)
    wing=poly((-0.10,-0.10),(0.20,-0.10),(-0.10,-0.80),(-0.30,-0.80)).union(poly((-0.10,0.10),(0.20,0.10),(-0.10,0.80),(-0.30,0.80))).difference(body)
    tail=poly((-0.70,-0.08),(-0.90,-0.46),(-0.76,-0.46),(-0.56,-0.08)).difference(body)
    wins=U([circ(0.20+k*0.18,-0.02,0.05) for k in range(3)]);body=body.difference(wins)
    return '비행기',[(body,6,['blue','yellow']),(wing,6,['red','purple']),(tail,1,['red']),(wins,3,['yellow'])]

def submarine():
    body=ell(0,0.12,0.86,0.38)
    tower=rect(-0.20,-0.46,0.24,-0.16).buffer(0.03).difference(body)
    scope=rect(0.10,-0.78,0.18,-0.46).union(rect(0.10,-0.78,0.30,-0.70)).difference(tower)
    port=U([circ(-0.40,0.10,0.11),circ(0,0.10,0.11),circ(0.40,0.10,0.11)]);body=body.difference(port)
    return '잠수함',[(body,8,['yellow','orange']),(U([tower,scope]),3,['orange','red']),(port,3,['blue'])]

def truck():
    box_=rect(-0.92,-0.50,0.20,0.30);cab=poly((0.24,-0.26),(0.66,-0.26),(0.90,0.02),(0.90,0.30),(0.24,0.30))
    win=poly((0.34,-0.18),(0.62,-0.18),(0.78,0.00),(0.34,0.00));cab=cab.difference(win)
    wh=U([circ(-0.56,0.40,0.18),circ(0.56,0.40,0.18)]).difference(box_).difference(cab)
    return '트럭',[(box_,7,['green','blue','orange']),(cab,3,['red']),(win,1,['blue']),(wh,2,['purple'])]

def castle():
    wall=rect(-0.60,-0.20,0.60,0.90)
    towers=U([rect(-0.90,-0.50,-0.52,0.90),rect(0.52,-0.50,0.90,0.90)]).difference(wall)
    caps=U([poly((-0.96,-0.50),(-0.46,-0.50),(-0.71,-0.92)),poly((0.46,-0.50),(0.96,-0.50),(0.71,-0.92))])
    gate=path(bez((-0.22,0.90),(-0.22,0.30),(0.22,0.30),(0.22,0.90)));wall=wall.difference(gate)
    flag=poly((0,-0.20),(0,-0.70),(0.30,-0.56),(0.04,-0.46)).buffer(0.02).difference(wall)
    return '성',[(wall,7,['purple','blue']),(towers,4,['purple']),(caps,2,['red','orange']),(gate,2,['orange']),(flag,1,['yellow','red'])]

def lighthouse():
    body=poly((-0.30,0.80),(0.30,0.80),(0.18,-0.40),(-0.18,-0.40))
    b1=body.intersection(box(-1,-0.40,1,-0.02));b2=body.intersection(box(-1,-0.02,1,0.38));b3=body.intersection(box(-1,0.38,1,0.80))
    lamp=rect(-0.24,-0.70,0.24,-0.40);roof=poly((-0.30,-0.70),(0.30,-0.70),(0,-0.96))
    base=rect(-0.56,0.80,0.56,0.96)
    return '등대',[(b1,2,['red']),(b2,2,['yellow','blue']),(b3,2,['red']),(lamp,2,['yellow']),(U([roof,base]),3,['purple','orange'])]

def tent():
    t=poly((0,-0.80),(-0.92,0.70),(0.92,0.70))
    door=poly((0,-0.20),(-0.28,0.70),(0.28,0.70));t=t.difference(door)
    l=t.intersection(box(-1,-1,0,1));r=t.difference(l)
    flag=poly((0,-0.80),(0,-0.98),(0.24,-0.90)).buffer(0.02).difference(t)
    ground=rect(-0.98,0.70,0.98,0.86)
    return '텐트',[(l,5,['orange','red']),(r,5,['yellow','orange']),(door,2,['purple','blue']),(U([flag]),1,['red']),(ground,3,['green'])]

def backpack():
    bag=rect(-0.56,-0.46,0.56,0.86).buffer(0.10)
    handle=circ(0,-0.56,0.26).difference(circ(0,-0.56,0.14)).difference(bag)
    pocket=rect(-0.38,0.30,0.38,0.74).buffer(0.04);flap=rect(-0.56,-0.46,0.56,-0.14).buffer(0.06).intersection(bag)
    bag=bag.difference(pocket).difference(flap)
    return '책가방',[(bag,6,['blue','red']),(flap,3,['yellow','green']),(pocket,3,['orange','purple']),(handle,2,['orange'])]

def clock():
    rim=circ(0,0.08,0.86).difference(circ(0,0.08,0.66))
    face=circ(0,0.08,0.66)
    hands=U([rect(-0.04,-0.42,0.04,0.10),poly((-0.02,0.04),(0.40,0.16),(0.40,0.24),(-0.02,0.12))]).buffer(0.02)
    face=face.difference(hands)
    bells=U([circ(-0.56,-0.74,0.18),circ(0.56,-0.74,0.18)]).difference(circ(0,0.08,0.86))
    return '시계',[(rim,6,['red','blue']),(face,6,['yellow']),(hands,2,['purple']),(bells,2,['orange','yellow'])]

def bulb():
    g=U([circ(0,-0.24,0.56),poly((-0.30,0.18),(0.30,0.18),(0.22,0.50),(-0.22,0.50))])
    base=rect(-0.24,0.50,0.24,0.86).buffer(0.02)
    fil=poly((-0.16,0.30),(-0.10,-0.10),(0,0.06),(0.10,-0.10),(0.16,0.30)).buffer(0.035).intersection(g)
    g=g.difference(fil)
    rays=U([poly((-0.86,-0.64),(-0.70,-0.60),(-0.80,-0.48)),poly((0.86,-0.64),(0.70,-0.60),(0.80,-0.48)),poly((-0.06,-0.98),(0.06,-0.98),(0,-0.84))]).buffer(0.03)
    return '전구',[(g,7,['yellow']),(fil,1,['orange','red']),(base,3,['blue','purple']),(rays,3,['yellow','orange'])]

def mug():
    cup=rect(-0.56,-0.40,0.40,0.80).buffer(0.06)
    handle=circ(0.52,0.18,0.30).difference(circ(0.52,0.18,0.16)).difference(cup)
    coffee=rect(-0.50,-0.40,0.34,-0.24);cup=cup.difference(coffee)
    heart=U([circ(-0.14,0.14,0.10),circ(0.02,0.14,0.10),poly((-0.24,0.18),(0.12,0.18),(-0.06,0.42))]);cup=cup.difference(heart)
    steam=U([ell(-0.30,-0.66,0.06,0.18),ell(-0.04,-0.72,0.06,0.20),ell(0.22,-0.66,0.06,0.18)])
    return '머그컵',[(cup,7,['blue','green','purple']),(handle,2,['blue']),(coffee,2,['orange']),(heart,1,['red']),(steam,3,['yellow'])]

def gift():
    boxb=rect(-0.70,-0.20,0.70,0.90);lid=rect(-0.80,-0.44,0.80,-0.20)
    rib=U([rect(-0.10,-0.44,0.10,0.90)])
    bow=U([ell(-0.26,-0.60,0.24,0.14,15),ell(0.26,-0.60,0.24,0.14,-15)]).difference(lid)
    boxb=boxb.difference(rib);lid=lid.difference(rib)
    return '선물상자',[(boxb,6,['red','blue','purple']),(lid,3,['red','blue']),(rib,3,['yellow']),(bow,2,['yellow','orange'])]

def cake():
    t1=rect(-0.76,0.30,0.76,0.86);t2=rect(-0.52,-0.20,0.52,0.30)
    cream=rect(-0.80,0.22,0.80,0.36).union(rect(-0.56,-0.26,0.56,-0.14))
    t1=t1.difference(cream);t2=t2.difference(cream)
    candles=U([rect(-0.26,-0.60,-0.14,-0.26),rect(0.14,-0.60,0.26,-0.26)])
    flames=U([ell(-0.20,-0.74,0.08,0.12),ell(0.20,-0.74,0.08,0.12)])
    return '케이크',[(t1,6,['purple','red']),(t2,4,['yellow','orange']),(cream,4,['blue','yellow']),(candles,2,['green','red']),(flames,2,['orange'])]

def crown():
    c=poly((-0.86,0.60),(-0.86,-0.50),(-0.44,-0.04),(0,-0.70),(0.44,-0.04),(0.86,-0.50),(0.86,0.60))
    band=c.intersection(box(-1,0.28,1,1));c=c.difference(band)
    gems=U([circ(-0.44,0.46,0.10),circ(0,0.46,0.10),circ(0.44,0.46,0.10)]);band=band.difference(gems)
    tops=U([circ(-0.86,-0.60,0.12),circ(0,-0.82,0.12),circ(0.86,-0.60,0.12)]).difference(c)
    return '왕관',[(c,7,['yellow','orange']),(band,4,['orange']),(gems,3,['red','blue','green']),(tops,3,['red','purple'])]

def key():
    ring=circ(-0.46,-0.30,0.40).difference(circ(-0.46,-0.30,0.18))
    shaft=rect(-0.12,-0.40,0.86,-0.20).difference(circ(-0.46,-0.30,0.40))
    teeth=U([rect(0.46,-0.20,0.60,0.12),rect(0.70,-0.20,0.86,0.20)])
    return '열쇠',[(ring,6,['yellow','orange']),(shaft,4,['yellow']),(teeth,2,['orange','red'])]

def palette():
    p=ell(0,0.05,0.92,0.72).difference(circ(0.40,0.34,0.16))
    blobs=U([circ(-0.50,-0.10,0.14),circ(-0.18,-0.40,0.14),circ(0.22,-0.40,0.14),circ(0.54,-0.10,0.14),circ(-0.38,0.30,0.14)])
    p=p.difference(blobs)
    return '물감 팔레트',[(p,8,['orange','yellow']),(blobs,5,['red','blue','green'])]

def trophy():
    cup=path(bez((-0.60,-0.80),(-0.60,-0.10),(-0.30,0.20),(0,0.22)),bez((0,0.22),(0.30,0.20),(0.60,-0.10),(0.60,-0.80)))
    handles=U([circ(-0.62,-0.46,0.24).difference(circ(-0.62,-0.46,0.12)),circ(0.62,-0.46,0.24).difference(circ(0.62,-0.46,0.12))]).difference(cup)
    stem=rect(-0.10,0.20,0.10,0.56);base=rect(-0.46,0.56,0.46,0.86)
    star=Polygon([(np.cos(-np.pi/2+k*np.pi/5)*(0.20 if k%2==0 else 0.09),np.sin(-np.pi/2+k*np.pi/5)*(0.20 if k%2==0 else 0.09)-0.40) for k in range(10)])
    cup=cup.difference(star)
    return '트로피',[(cup,6,['yellow','orange']),(star,1,['red']),(handles,2,['yellow']),(U([stem,base]),3,['orange','purple'])]

def candle():
    body=rect(-0.28,-0.20,0.28,0.80);flame=path(bez((0,-0.26),(-0.30,-0.40),(-0.12,-0.80),(0,-0.96)),bez((0,-0.96),(0.12,-0.80),(0.30,-0.40),(0,-0.26)))
    inner=ell(0,-0.44,0.08,0.14);flame=flame.difference(inner)
    dish=ell(0,0.84,0.62,0.12).union(rect(-0.62,0.76,0.62,0.84))
    body=body.difference(dish)
    return '촛불',[(body,5,['red','purple','blue']),(flame,3,['orange','yellow']),(inner,1,['yellow']),(dish,3,['orange'])]

def fox():
    face=poly((-0.80,-0.30),(0.80,-0.30),(0,0.80)).buffer(0.06)
    ears=U([poly((-0.80,-0.30),(-0.62,-0.92),(-0.26,-0.30)),poly((0.80,-0.30),(0.62,-0.92),(0.26,-0.30))]).difference(face)
    cheeks=U([poly((-0.60,-0.10),(-0.02,0.10),(0,0.74)),poly((0.60,-0.10),(0.02,0.10),(0,0.74))]).intersection(face)
    face=face.difference(cheeks)
    nose=circ(0,0.66,0.09)
    eyes=U([ell(-0.32,-0.04,0.07,0.10),ell(0.32,-0.04,0.07,0.10)]);face=face.difference(eyes)
    cheeks=cheeks.difference(nose)
    return '여우',[(face,6,['orange','red']),(ears,4,['orange']),(cheeks,4,['yellow']),(U([eyes,nose]),3,['purple'])]

def bear():
    face=circ(0,0.14,0.70)
    ears=U([circ(-0.56,-0.46,0.24),circ(0.56,-0.46,0.24)]).difference(face)
    snout=ell(0,0.42,0.30,0.22);nose=ell(0,0.32,0.10,0.07)
    eyes=U([circ(-0.26,0.00,0.07),circ(0.26,0.00,0.07)])
    face=face.difference(snout).difference(eyes);snout=snout.difference(nose)
    return '곰',[(face,7,['orange','red']),(ears,2,['orange','red']),(snout,3,['yellow']),(U([nose,eyes]),3,['purple'])]

def rabbit():
    face=ell(0,0.34,0.62,0.56)
    ears=U([ell(-0.28,-0.50,0.20,0.46,-8),ell(0.28,-0.50,0.20,0.46,8)]).difference(face)
    inner=U([ell(-0.28,-0.46,0.075,0.30,-8),ell(0.28,-0.46,0.075,0.30,8)]).intersection(ears);ears=ears.difference(inner)
    eyes=U([circ(-0.22,0.24,0.07),circ(0.22,0.24,0.07)]);nose=poly((-0.08,0.44),(0.08,0.44),(0,0.54))
    face=face.difference(eyes).difference(nose)
    return '토끼',[(face,7,['yellow','blue']),(ears,4,['yellow','blue']),(inner,2,['red']),(U([eyes,nose]),3,['purple','red'])]

def penguin():
    body=ell(0,0.12,0.58,0.82)
    belly=ell(0,0.30,0.38,0.56)
    feet=U([ell(-0.24,0.94,0.18,0.07),ell(0.24,0.94,0.18,0.07)]).difference(body)
    beak=poly((-0.10,-0.34),(0.10,-0.34),(0,-0.18))
    eyes=U([circ(-0.18,-0.46,0.07),circ(0.18,-0.46,0.07)])
    body=body.difference(belly).difference(beak).difference(eyes)
    belly=belly.difference(beak)
    return '펭귄',[(body,7,['blue','purple']),(belly,5,['yellow','blue']),(U([beak,feet]),3,['orange']),(eyes,2,['yellow'])]

def duck():
    body=ell(0.08,0.40,0.78,0.44);head=circ(-0.46,-0.30,0.30).difference(body)
    beak=poly((-0.76,-0.30),(-1.04,-0.20),(-0.76,-0.14)).difference(head)
    wing=ell(0.20,0.30,0.40,0.20,-10);body=body.difference(wing)
    eye=circ(-0.52,-0.38,0.06);head=head.difference(eye)
    return '오리',[(body,7,['yellow','green']),(wing,3,['orange','yellow']),(head,3,['green','yellow']),(U([beak,eye]),2,['orange'])]

def chick():
    body=circ(0,0.24,0.66);shell=path([(-0.72,0.30),(-0.52,0.12),(-0.34,0.30),(-0.16,0.10),(0,0.30),(0.16,0.10),(0.34,0.30),(0.52,0.12),(0.72,0.30)],bez((0.72,0.30),(0.70,0.90),(-0.70,0.90),(-0.72,0.30)))
    body=body.difference(shell)
    beak=poly((-0.10,-0.06),(0.10,-0.06),(0,0.10));eyes=U([circ(-0.24,-0.18,0.07),circ(0.24,-0.18,0.07)])
    tuft=U([ell(-0.08,-0.52,0.06,0.16,-20),ell(0.08,-0.52,0.06,0.16,20)]).difference(body)
    body=body.difference(beak).difference(eyes)
    return '병아리',[(body,6,['yellow']),(shell,6,['blue','purple','green']),(U([beak,tuft]),2,['orange']),(eyes,2,['purple'])]

def whale():
    body=path(bez((-0.90,0.10),(-0.90,-0.50),(0.40,-0.60),(0.60,0.00)),bez((0.60,0.00),(0.70,0.40),(-0.40,0.60),(-0.90,0.10)))
    tail=poly((0.56,0.02),(0.96,-0.36),(0.90,0.00),(0.98,0.30)).difference(body)
    belly=body.intersection(ell(-0.20,0.40,0.70,0.24));body=body.difference(belly)
    spout=U([ell(-0.30,-0.76,0.07,0.16,-25),ell(-0.14,-0.80,0.07,0.16,25)])
    eye=circ(-0.54,-0.02,0.06);body=body.difference(eye)
    return '고래',[(body,7,['blue','purple']),(belly,3,['yellow','blue']),(tail,2,['blue']),(U([spout,eye]),3,['blue','green'])]

def crab():
    body=ell(0,0.20,0.66,0.40)
    claws=U([circ(-0.70,-0.44,0.20).difference(poly((-0.70,-0.44),(-0.40,-0.80),(-0.36,-0.50))),circ(0.70,-0.44,0.20).difference(poly((0.70,-0.44),(0.40,-0.80),(0.36,-0.50)))])
    arms=U([poly((-0.46,-0.02),(-0.60,-0.30),(-0.50,-0.36),(-0.36,-0.06)),poly((0.46,-0.02),(0.60,-0.30),(0.50,-0.36),(0.36,-0.06))]).difference(body).difference(claws)
    legs=U([poly((-0.56+k*0.16,0.44),(-0.84+k*0.10,0.80),(-0.74+k*0.10,0.84),(-0.44+k*0.16,0.50)) for k in range(2)]+[poly((0.56-k*0.16,0.44),(0.84-k*0.10,0.80),(0.74-k*0.10,0.84),(0.44-k*0.16,0.50)) for k in range(2)]).difference(body)
    eyes=U([circ(-0.20,-0.30,0.10),circ(0.20,-0.30,0.10)]).difference(body)
    return '게',[(body,7,['red','orange']),(claws,4,['red']),(U([arms,legs]),6,['orange','red']),(eyes,2,['yellow'])]

def ladybug():
    body=circ(0,0.14,0.72);head=circ(0,-0.60,0.26).difference(body)
    l=body.intersection(box(-1,-1,-0.03,1));r=body.intersection(box(0.03,-1,1,1))
    spots=U([circ(-0.36,-0.06,0.12),circ(-0.30,0.40,0.12),circ(0.36,-0.06,0.12),circ(0.30,0.40,0.12)])
    l=l.difference(spots);r=r.difference(spots)
    return '무당벌레',[(l,5,['red','orange']),(r,5,['red','orange']),(spots,4,['purple','blue']),(head,2,['purple'])]

def bee():
    body=ell(0,0.20,0.62,0.44)
    stripes=U([body.intersection(box(-0.30,-1,-0.14,1)),body.intersection(box(0.06,-1,0.22,1))])
    body=body.difference(stripes)
    wings=U([ell(-0.20,-0.40,0.26,0.20,-20),ell(0.24,-0.42,0.26,0.20,20)]).difference(ell(0,0.20,0.62,0.44))
    sting=poly((0.60,0.16),(0.86,0.22),(0.60,0.30)).difference(ell(0,0.20,0.62,0.44))
    return '꿀벌',[(body,6,['yellow','orange']),(stripes,2,['purple']),(wings,4,['blue']),(sting,1,['orange'])]

def octopus():
    head=path(bez((-0.56,0.20),(-0.70,-0.90),(0.70,-0.90),(0.56,0.20)))
    from shapely.geometry import LineString
    def leg(x0,d):  # 머리 아래에서 내려와 끝이 바깥으로 말리는 다리
        return LineString(bez((x0,0.05),(x0+d*0.05,0.45),(x0+d*0.10,0.72),(x0+d*0.30,0.66))).buffer(0.085,cap_style=1)
    legs=U([leg(-0.46,-1),leg(-0.16,-0.5),leg(0.16,0.5),leg(0.46,1)]).difference(head)
    eyes=U([circ(-0.20,-0.20,0.10),circ(0.20,-0.20,0.10)]);head=head.difference(eyes)
    spots=U([circ(-0.26,-0.54,0.07),circ(0.14,-0.62,0.06),circ(0.34,-0.40,0.06)]);head=head.difference(spots)
    return '문어',[(head,6,['purple','red']),(legs,8,['purple','red']),(eyes,2,['yellow']),(spots,3,['red','orange'])]

DESIGNS += [sunflower,clover,apple,cherry,strawberry,grapes,carrot,xmastree,pumpkin,blossom,
            rainbow,moon,saturn,storm,kite,car,bus,train,airplane,submarine,truck,
            castle,lighthouse,tent,backpack,clock,bulb,mug,gift,cake,crown,key,palette,trophy,candle,
            fox,bear,rabbit,penguin,duck,chick,whale,crab,ladybug,bee,octopus]
