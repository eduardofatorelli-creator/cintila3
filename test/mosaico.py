# Visual R04: junta capturas das mesas num mosaico para revisão (recorta a coluna da mesa + backbox).
# Uso: python test/mosaico.py <pasta> <prefixo> <saida.png> [colunas] [x0,y0,x1,y1]
import sys, glob, os
from PIL import Image, ImageDraw
pasta, prefixo, saida = sys.argv[1], sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
caixa = tuple(int(v) for v in sys.argv[5].split(',')) if len(sys.argv) > 5 else (470, 0, 970, 900)
ordem = sys.argv[6].split(',') if len(sys.argv) > 6 else None
arqs = [os.path.join(pasta, prefixo + i + '.png') for i in ordem] if ordem else sorted(glob.glob(os.path.join(pasta, prefixo + '*.png')))
ims = [Image.open(a).crop(caixa) for a in arqs if os.path.exists(a)]
w, h = ims[0].size; esc = 0.5
tw, th = int(w * esc), int(h * esc); linhas = (len(ims) + cols - 1) // cols
M = Image.new('RGB', (tw * cols, th * linhas), (0, 0, 0)); d = ImageDraw.Draw(M)
for i, im in enumerate(ims):
    x, y = (i % cols) * tw, (i // cols) * th; M.paste(im.resize((tw, th)), (x, y)); d.text((x + 4, y + 4), str(i + 1), fill=(255, 255, 0))
M.save(saida); print(saida, M.size)
