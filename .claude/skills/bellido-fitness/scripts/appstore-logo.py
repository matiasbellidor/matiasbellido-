# Logo de una app con su ícono ACTUAL de la App Store -> PNG 144x144: el logo
# centrado en un círculo blanco con fondo transparente, igual que los de
# public/logos (los botones de Gmail, Outlook, redes, WhatsApp).
# Sirve para íconos con fondo blanco (Outlook, Gmail). Uno con fondo de color
# (ej. WhatsApp verde) quedaría como un cuadrado dentro del círculo: para esos,
# usar icon-png.cjs (glifo de Simple Icons).
#
# Uso (necesita Pillow):
#   python appstore-logo.py <id de la App Store> <salida.png> <lado del logo, px de 144>
# Ej.:
#   python appstore-logo.py 951937596 public/logos/outlook.png 74   # Microsoft Outlook
#   python appstore-logo.py 422689480 public/logos/gmail.png 78     # Gmail
# El id es el número del link de la App Store (apps.apple.com/.../id951937596).
# El lado: 72-78 deja el logo del mismo peso visual que los glifos de 72 px de icon-png.cjs.
import json
import sys
import urllib.request
from io import BytesIO

from PIL import Image, ImageDraw

app_id, out, side = sys.argv[1], sys.argv[2], float(sys.argv[3])
UA = {"User-Agent": "portfoliobellido-logo-script"}

with urllib.request.urlopen(urllib.request.Request(f"https://itunes.apple.com/lookup?id={app_id}&country=ar", headers=UA)) as r:
    app = json.load(r)["results"][0]
art = app["artworkUrl512"].rsplit("/", 1)[0] + "/1024x1024bb.png"
with urllib.request.urlopen(urllib.request.Request(art, headers=UA)) as r:
    im = Image.open(BytesIO(r.read())).convert("RGB")
print(f"{app['trackName']} ({app['sellerName']}), versión del {app.get('currentVersionReleaseDate', '?')[:10]}")

# Caja del logo: píxeles con color (descarta el fondo blanco y el borde gris del ícono)
px = im.load()
xs, ys = [], []
for y in range(0, im.height, 2):
    for x in range(0, im.width, 2):
        r, g, b = px[x, y]
        if max(r, g, b) - min(r, g, b) > 40:
            xs.append(x)
            ys.append(y)
logo = im.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))

SS = 4  # se dibuja a 576 y se achica: el borde del círculo queda suave
N = 144 * SS
scale = side * SS / max(logo.size)
logo = logo.resize((round(logo.width * scale), round(logo.height * scale)), Image.LANCZOS)
canvas = Image.new("RGB", (N, N), "white")
canvas.paste(logo, ((N - logo.width) // 2, (N - logo.height) // 2))
mask = Image.new("L", (N, N), 0)
ImageDraw.Draw(mask).ellipse((0, 0, N - 1, N - 1), fill=255)
canvas.putalpha(mask)
canvas.resize((144, 144), Image.LANCZOS).save(out, optimize=True)
print(f"+ {out}")
