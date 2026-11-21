#!/usr/bin/env python3
"""Convierte un diseño en una cara redonda lista para el Módulo 3D.

Uso:
  python3 preparar-cara.py DISENO.png SALIDA.webp [--recorte 1.2] [--lado 900]

- Imagen cuadrada (diseño ya redondo): recorta un círculo centrado, quitando
  --recorte % del radio para eliminar el aro o borde de la orilla.
- Imagen no cuadrada (p. ej. vertical): mete todo el contenido dentro del
  círculo sin cortarlo y rellena con el color del fondo del diseño.
- Sale un WebP de LADO x LADO px con transparencia fuera del círculo.
"""
import argparse

import numpy as np
from PIL import Image, ImageDraw


def mascara(lado):
    m = Image.new("L", (lado * 4, lado * 4), 0)
    ImageDraw.Draw(m).ellipse((2, 2, lado * 4 - 3, lado * 4 - 3), fill=255)
    return m.resize((lado, lado), Image.LANCZOS)


def preparar(entrada, salida, recorte=1.2, lado=900):
    img = Image.open(entrada).convert("RGB")
    w, h = img.size
    if abs(w - h) <= 2:
        cx, cy = w / 2, h / 2
        r = min(w, h) / 2 * (1 - recorte / 100)
        fondo = img.getpixel((int(cx), int(cy - r * 0.97)))
    else:
        fondo = img.getpixel((2, 2))
        gris = np.asarray(img.convert("L")).astype(int)
        distinto = np.abs(gris - int(np.mean(fondo))) > 20
        ys, xs = np.nonzero(distinto)
        cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        r = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2).max() * 1.07

    caja = int(round(2 * r))
    lienzo = Image.new("RGB", (caja, caja), fondo)
    lienzo.paste(img, (int(round(r - cx)), int(round(r - cy))))
    cara = lienzo.resize((lado, lado), Image.LANCZOS).convert("RGBA")
    cara.putalpha(mascara(lado))
    cara.save(salida, quality=88)
    print(f"{salida}: {lado}x{lado}, fondo {fondo}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("entrada")
    p.add_argument("salida")
    p.add_argument("--recorte", type=float, default=1.2, help="%% del radio a recortar en diseños redondos (1.2)")
    p.add_argument("--lado", type=int, default=900, help="tamaño de salida en px (900)")
    a = p.parse_args()
    preparar(a.entrada, a.salida, a.recorte, a.lado)
