"""시험판 한 장짜리 HTML 만들기 (에셋을 모두 안에 넣는다). python3 tools/pic/artifact.py 출력경로"""
import re,base64,json,sys,os
os.chdir(os.path.join(os.path.dirname(__file__),'..','..'))
h=open('index.html').read()
head=h[h.index('<head>')+6:h.index('</head>')];body=h[h.index('<body>')+6:h.index('</body>')]
head=re.sub(r'<meta[^>]*>\n?','',head).replace('<title>Lumenfall</title>','<title>Lumenfall · 그림 창</title>')
b64=lambda p,m='image/png':'data:%s;base64,%s'%(m,base64.b64encode(open(p,'rb').read()).decode())
cat={k:b64(f'assets/char/cat_{k}.png') for k in ['base','curious','happy','sunny','surprised']}
drop={c:{e:b64(f'assets/char/drop{c}_{e}.png') for e in ['base','excited','sleepy','asleep']} for c in 'RYB'}
assets=('const TEX='+json.dumps({k:b64(f'assets/glass_{k}.png') for k in 'RYBOGPN'})+';\nconst AUD='+
 json.dumps({k:b64(f'assets/{k}.mp3','audio/mpeg') for k in ['bgm','win','drop','mix']})+';\nconst CHAR='+json.dumps({'cat':cat,'drop':drop})+';\n')
body=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(assets if m.group(1)=='assets.js' else open(m.group(1)).read())+'</script>',body)
s=head+body
a=""" fetch(url,{cache:'force-cache'})
  .then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})"""
b=""" (url.startsWith('data:')?Promise.resolve().then(()=>{const bin=atob(url.slice(url.indexOf(',')+1)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer}):
  fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}))"""
assert s.count(a)==1;s=s.replace(a,b)
open(sys.argv[1],'w').write(s);print(len(s))
