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
