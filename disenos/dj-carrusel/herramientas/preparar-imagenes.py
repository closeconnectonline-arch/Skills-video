#!/usr/bin/env python3
"""DJ CARRUSEL · prepara una foto para una tarjeta.

Genera las 3 versiones que usa el carrusel:
  <nombre>.jpg           recorte vertical 1:3 (480x1440) a color  -> "imagen"
  <nombre>-idle.jpg      la misma tarjeta en gris oscuro          -> "idle"
  <nombre>-completa.jpg  la foto completa (lado mayor 1000 px)     -> "completa"

Uso:
  python3 preparar-imagenes.py FOTO.jpg NOMBRE [--centro 0.5] [--salida ../plantilla/img]

  --centro  posición horizontal del sujeto en la foto (0 = izquierda, 1 = derecha).
            Solo se ve la franja izquierda de las tarjetas de atrás, así que el sujeto
            queda al 42% del recorte.
Requiere Pillow (pip install pillow).
"""
import argparse, os
from PIL import Image, ImageOps, ImageEnhance

p = argparse.ArgumentParser()
p.add_argument("foto"); p.add_argument("nombre")
p.add_argument("--centro", type=float, default=0.5)
p.add_argument("--salida", default=os.path.join(os.path.dirname(__file__), "..", "plantilla", "img"))
a = p.parse_args()

os.makedirs(a.salida, exist_ok=True)
im = ImageOps.exif_transpose(Image.open(a.foto)).convert("RGB")
W, H = im.size
w = min(W, H // 3)
h = w * 3
cx = a.centro * W
x0 = int(max(0, min(W - w, cx - w * 0.42)))
y0 = (H - h) // 2
strip = im.crop((x0, y0, x0 + w, y0 + h)).resize((480, 1440), Image.LANCZOS)
base = os.path.join(a.salida, a.nombre)
strip.save(base + ".jpg", quality=82, optimize=True, progressive=True)
idle = ImageEnhance.Brightness(ImageOps.grayscale(strip).convert("RGB")).enhance(0.38)
idle.save(base + "-idle.jpg", quality=78, optimize=True, progressive=True)
full = im.copy(); full.thumbnail((1000, 1000), Image.LANCZOS)
full.save(base + "-completa.jpg", quality=82, optimize=True, progressive=True)
print("Listo:", base + ".jpg", base + "-idle.jpg", base + "-completa.jpg")
