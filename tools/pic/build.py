"""도안(designs.py)을 조각으로 잘라 pictures.js를 만든다.  python3 tools/pic/build.py"""
import json, os, sys, numpy as np
from shapely.geometry import MultiPoint, Point, box, Polygon
from shapely.ops import voronoi_diagram
sys.path.insert(0,os.path.dirname(__file__))
from designs import DESIGNS
def split(poly,k,rng):
    if k<=1:return [poly]
    minx,miny,maxx,maxy=poly.bounds;pts=[]
    while len(pts)<k:
        p=(rng.uniform(minx,maxx),rng.uniform(miny,maxy))
        if poly.contains(Point(p)):pts.append(p)
    for _ in range(40):
        cells=[c.intersection(poly) for c in voronoi_diagram(MultiPoint(pts),envelope=box(-3,-3,3,3)).geoms]
        cells=[c for c in cells if not c.is_empty and c.area>1e-5]
        pts=[(c.centroid.x,c.centroid.y) for c in cells]
    out=[]
    for c in cells:
        if c.geom_type!='Polygon':c=max(c.geoms,key=lambda g:g.area)
        out.append(c.simplify(0.006))
    return out
def comps(g):
    return [g] if g.geom_type=='Polygon' else sorted([x for x in g.geoms if x.area>0.012],key=lambda x:-x.area)
MIN_R=0.066  # 조각 안에 들어가는 원의 반지름 하한(정규화 좌표). 손가락으로 누를 수 있는 크기
def thick(g):
    lo,hi=0,0.4
    for _ in range(14):
        m=(lo+hi)/2
        if g.buffer(-m).is_empty:hi=m
        else:lo=m
    return lo
def cut(parts,mult,sc=1):
    rng=np.random.default_rng(7)
    regs=[];outlines=[];pals=[]
    for poly,k,pal in parts:
        cs=comps(poly.buffer(0));tot=sum(c.area for c in cs)
        for c in cs:
            pi=len(pals);pals.append(pal)
            kk=max(1,round(k*mult*c.area/tot))
            # 조각이 너무 가늘게 나오면 개수를 줄여 다시 자른다
            while True:
                pieces=split(c,kk,rng)
                if kk<=1 or min(thick(p) for p in pieces)*sc>=MIN_R:break
                kk-=1
            for piece in pieces:
                regs.append({'pts':[list(p) for p in list(piece.exterior.coords)[:-1]],'part':pi,'_g':piece})
            outlines.append([list(p) for p in c.simplify(0.003).exterior.coords])
    adj=[[] for _ in regs]
    for i,a in enumerate(regs):
        for j in range(i+1,len(regs)):
            b=regs[j]
            if a['part']==b['part'] and a['_g'].buffer(0.003).intersection(b['_g'].buffer(0.003)).area>0.0006:
                adj[i].append(j);adj[j].append(i)
    for r in regs:
        c=r.pop('_g').centroid;r['cx'],r['cy']=c.x,c.y
    return regs,adj,outlines,pals
from shapely.ops import unary_union as _U
def thicken(parts,sc):
    '''통째로 한 조각이어도 가는 부분(별·줄기·끈 등)은 살짝 부풀려 누를 수 있게 한다. 부푼 만큼 이웃 부분에서 뺀다.'''
    grown=[]
    for pi,(poly,k,pal) in enumerate(parts):
        for c in comps(poly.buffer(0)):
            t=thick(c)*sc
            if t<MIN_R:grown.append((pi,c,c.buffer((MIN_R-t)/sc+0.004,join_style=1,resolution=6).simplify(0.003)))
    if not grown:return parts
    out=[]
    for pi,(poly,k,pal) in enumerate(parts):
        g=poly.buffer(0)
        for gj,c,cg in grown:
            g=g.union(cg) if gj==pi else g.difference(cg)
        out.append((g.buffer(0),k,pal))
    return out
PICS=[]
for fn in DESIGNS:
    name,parts=fn()
    out={'name':name}
    mnx,mny,mxx,mxy=_U([pp[0] for pp in parts]).bounds;sc0=1.80/max(mxx-mnx,mxy-mny)
    parts=thicken(parts,sc0)
    for key,mult in (('base',1),('fine',1.7)):
        regs,adj,outlines,pals=cut(parts,mult,sc0)
        if key=='base':
            xs=[p[0] for o in outlines for p in o];ys=[p[1] for o in outlines for p in o]
            cx=(min(xs)+max(xs))/2;cy=(min(ys)+max(ys))/2;sc=1.80/max(max(xs)-min(xs),max(ys)-min(ys))
        T=lambda p:[round((p[0]-cx)*sc,3),round((p[1]-cy)*sc,3)]
        for r in regs:
            r['pts']=[T(p) for p in r['pts']];r['cx'],r['cy']=T([r['cx'],r['cy']])
        out[key]={'regs':regs,'adj':adj}
        if key=='base':out['outlines']=[[T(p) for p in o] for o in outlines];out['pals']=pals
    PICS.append(out)
    print(name,'조각',len(out['base']['regs']),'/',len(out['fine']['regs']),'부분',len(out['pals']))
root=os.path.join(os.path.dirname(__file__),'..','..')
open(os.path.join(root,'pictures.js'),'w').write('/* 그림 창 도안 — tools/pic/build.py 로 만든다. 손으로 고치지 않는다. */\nconst PICS='+json.dumps(PICS,ensure_ascii=False,separators=(',',':'))+';\n')
json.dump(PICS,open('/tmp/pics.json','w'),ensure_ascii=False)
