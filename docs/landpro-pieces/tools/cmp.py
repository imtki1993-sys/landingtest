import sys
from PIL import Image
t=sys.argv[1]; d="/tmp/claude-0/lp"
ref=Image.open(f"{d}/refs/{t}.jpg").convert("RGB")
shot=Image.open(f"{d}/{sys.argv[2] if len(sys.argv)>2 else "final"}/{t}_1440.png").convert("RGB")
W=560
r=ref.resize((W,int(ref.height*W/ref.width)))
s=shot.resize((W,int(shot.height*W/shot.width)))
H=max(r.height,s.height)
c=Image.new("RGB",(W*2+20,H),"white"); c.paste(r,(0,0)); c.paste(s,(W+20,0))
# split into chunks of max 1500 tall
n=0
for y in range(0,H,1500):
    c.crop((0,y,W*2+20,min(H,y+1500))).save(f"{d}/{sys.argv[2] if len(sys.argv)>2 else "final"}/cmp_{t}_{n}.png"); n+=1
print(t,n,"parts", r.height, s.height)
