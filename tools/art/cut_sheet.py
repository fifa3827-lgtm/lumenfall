"""제미나이 3×3 그림판(진분홍 배경)을 9장으로 잘라 투명 PNG로 만든다.
   python3 tools/art/cut_sheet.py 판.png 출력폴더 이름1,이름2,...,이름9 [높이]
   - 네 귀퉁이 중앙값을 배경색으로 보고 색 거리로 투명도를 정한다(60~120 사이 부드럽게)
   - 칸(3×3)마다 가장 큰 덩어리와, 그것의 3% 이상인 덩어리(김·연기 등)만 남긴다
   - 오른쪽 아래 구석의 작은 반짝이(제미나이 표시)는 지운다
   - 안쪽은 불투명으로 두고, 반투명 가장자리에서만 배경색을 빼 분홍 테두리를 없앤다"""
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
src,out,names=sys.argv[1],sys.argv[2],sys.argv[3].split(',');H=int(sys.argv[4]) if len(sys.argv)>4 else 160
GLOW=set(sys.argv[5].split(',')) if len(sys.argv)>5 else set()   # 불빛 번짐이 진분홍과 섞인 그림
im=np.asarray(Image.open(src).convert('RGB')).astype(float);h,w,_=im.shape
k=max(8,w//40);corners=np.concatenate([im[:k,:k].reshape(-1,3),im[:k,-k:].reshape(-1,3),im[-k:,:k].reshape(-1,3),im[-k:,-k:].reshape(-1,3)])
bg=np.median(corners,0)
d=np.sqrt(((im-bg)**2).sum(2))
a=np.clip((d-60)/60,0,1)
solid=a>0.5
lab,n=ndimage.label(solid)
areas=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
cents=ndimage.center_of_mass(np.ones_like(lab),lab,range(1,n+1))
keep=np.zeros(n+1,bool)
cells={}
for i,(ar,(cy,cx)) in enumerate(zip(areas,cents),1):
    if ar<40:continue
    c=(min(2,int(cy/h*3)),min(2,int(cx/w*3)))
    cells.setdefault(c,[]).append((ar,i,cy,cx))
os.makedirs(out,exist_ok=True)
for r in range(3):
    for c in range(3):
        comps=sorted(cells.get((r,c),[]),reverse=True)
        if not comps:print('빈 칸',r,c);continue
        big=comps[0][0];ids=[]
        for ar,i,cy,cx in comps:
            if ar<big*0.03:continue
            # 제미나이 반짝이 표시: 판 오른쪽 아래 구석의 작은 덩어리
            if cy>h*0.8 and cx>w*0.8 and ar<big*0.08:continue
            ids.append(i)
        m=np.isin(lab,ids)
        m=ndimage.binary_dilation(m,iterations=3)
        m=ndimage.binary_fill_holes(m)
        alpha=np.where(m,a,0)
        # 안쪽은 완전히 불투명하게. 배경색과 비슷한 빨강(진분홍 배경)이 반투명으로 잘못 읽혀 색이 바뀌는 것을 막는다
        inner=ndimage.binary_erosion(m,iterations=5)
        alpha=np.where(inner&(d>=45),1.0,alpha)   # 배경색과 거의 같은 구멍(손잡이 안쪽 등)은 그대로 투명
        ys,xs=np.where(alpha>0.02)
        y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        rgb=im[y0:y1,x0:x1].copy();al=alpha[y0:y1,x0:x1]
        # 분홍 번짐 빼기: 반투명 픽셀에서 배경색 섞인 만큼 되돌린다
        aa=np.clip(al,1e-3,1)[...,None]
        rgb=np.clip((rgb-bg*(1-aa))/aa,0,255)
        # 투명 유리·불빛처럼 배경이 비쳐 진분홍 기가 도는 곳(빨강≈파랑이 초록보다 훨씬 큼)을 초록 쪽으로 눌러 준다
        R,G,B=rgb[...,0],rgb[...,1],rgb[...,2];lo=np.minimum(R,B)
        pink=(np.abs(R-B)<28)&(lo-G>40)&(bg[0]>bg[1]+80)&(bg[2]>bg[1]+80)
        k2=np.where(pink,0.3,1.0)
        rgb[...,0]=np.where(pink,G+(R-G)*k2,R);rgb[...,2]=np.where(pink,G+(B-G)*k2,B)
        al=np.where(pink&(al<0.95),al*0.35,al)   # 불빛 번짐 가장자리의 분홍은 옅게
        if names[r*3+c] in GLOW:
            # 불빛 번짐 = 따뜻한 빛과 진분홍 배경의 섞임. 초록 값으로 빛의 양을 되짚어 따뜻한 빛만 남긴다
            R,G,B=rgb[...,0],rgb[...,1],rgb[...,2]
            mix=(R>180)&(B>G+5)&(R>G+60)
            warm=np.array([255,236,168.]);t=np.clip((G-bg[1])/(warm[1]-bg[1]),0,1)
            for ch in range(3):rgb[...,ch]=np.where(mix,warm[ch],rgb[...,ch])
            al=np.where(mix,np.minimum(al,t*0.9),al)
            if names[r*3+c]=='lamp':
                # 탁상 등: 갓 아래 연어색 번짐(제미나이가 그린 빛)은 지운다. 갓(위쪽 절반)은 건드리지 않는다
                yy=np.arange(rgb.shape[0])[:,None]>rgb.shape[0]*0.55
                glow=yy&(((R>230)&(G<215)&(np.abs(B-G)<30))|(mix)|((al<0.99)&(R>200)&(G>150)))
                al=np.where(glow,0,al)
        rgba=np.dstack([rgb,al*255]).astype(np.uint8)
        img=Image.fromarray(rgba,'RGBA')
        s=H/img.height if img.height>=img.width else H/img.width
        img=img.resize((max(1,round(img.width*s)),max(1,round(img.height*s))),Image.LANCZOS)
        name=names[r*3+c];img.save(os.path.join(out,name+'.png'),optimize=True)
        print(name,img.size,len(ids),'덩어리')
