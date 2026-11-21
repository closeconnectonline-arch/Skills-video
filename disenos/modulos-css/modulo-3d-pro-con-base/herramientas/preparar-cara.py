#!/usr/bin/env python3
"""Convierte un diseño en una cara redonda lista para el Módulo 3D (v2).

Uso:
  python3 preparar-cara.py DISENO.png SALIDA.webp [--lado 900] [--margen 2]

Qué hace:
- Encuentra el círculo solo, aunque esté cortado en la orilla del lienzo:
  recorre 360 rayos desde afuera hacia el centro y toma la orilla donde empieza
  el contenido. Se salta el fondo transparente o liso y el aro gris oscuro (#212121)
  que traen algunos diseños.
- Ajusta un círculo por mínimos cuadrados a esa orilla y lo recorta con borde suave.
- Conserva todo el contenido de adentro; afuera queda transparente.
- Diseño rectangular (p. ej. vertical): mete todo el contenido en el círculo sin cortarlo.
"""
import argparse
import math

import numpy as np
from PIL import Image, ImageDraw

ARO = 33          # gris del aro que traen algunos diseños
TOL_ARO = 8


def mascara(lado):
    m = Image.new("L", (lado * 4, lado * 4), 0)
    ImageDraw.Draw(m).ellipse((2, 2, lado * 4 - 3, lado * 4 - 3), fill=255)
    return m.resize((lado, lado), Image.LANCZOS)


def viene_aro(px, cx, cy, ca, sa, r, alcance=30):
    """¿Hay aro gris en los siguientes px hacia adentro?"""
    h, w = px.shape[:2]
    for k in range(1, alcance):
        x, y = int(round(cx + (r - k) * ca)), int(round(cy + (r - k) * sa))
        if 0 <= x < w and 0 <= y < h and np.abs(px[y, x, :3] - ARO).max() < TOL_ARO:
            return True
    return False


def orilla(px, fondo, cx, cy, rmax):
    """Puntos de la orilla del contenido, recorriendo rayos de afuera hacia adentro."""
    h, w = px.shape[:2]
    puntos = []
    for i in range(360):
        a = math.radians(i)
        ca, sa = math.cos(a), math.sin(a)
        en_aro = False
        for r in np.arange(rmax, rmax * 0.5, -1.0):
            x, y = int(round(cx + r * ca)), int(round(cy + r * sa))
            if not (0 <= x < w and 0 <= y < h):
                continue
            p = px[y, x]
            if p[3] < 128 or (fondo is not None and np.abs(p[:3] - fondo).max() < 12):
                continue                        # fondo
            if np.abs(p[:3] - ARO).max() < TOL_ARO and (en_aro or r > rmax * 0.93):
                en_aro = True                   # aro gris de la orilla
                continue
            if not en_aro and p[:3].min() > 235 and r > rmax * 0.95 and viene_aro(px, cx, cy, ca, sa, r):
                continue                        # franja blanca por fuera del aro
            puntos.append((x, y))
            break
    return np.array(puntos, dtype=float)


def ajustar_circulo(p):
    """Mínimos cuadrados (Kåsa) + recorte de puntos atípicos."""
    for _ in range(3):
        A = np.c_[2 * p[:, 0], 2 * p[:, 1], np.ones(len(p))]
        b = (p ** 2).sum(1)
        cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]
        r = math.sqrt(c + cx * cx + cy * cy)
        d = np.hypot(p[:, 0] - cx, p[:, 1] - cy)
        bien = np.abs(d - np.median(d)) < max(4, 2.5 * np.std(d))
        if bien.all():
            break
        p = p[bien]
    d = np.hypot(p[:, 0] - cx, p[:, 1] - cy)
    return cx, cy, float(np.percentile(d, 8))   # radio que no deja huecos en la orilla


def preparar(entrada, salida, lado=900, margen=2.0):
    img = Image.open(entrada).convert("RGBA")
    px = np.asarray(img).astype(int)
    h, w = px.shape[:2]
    esquina = px[2, 2]
    fondo = None if esquina[3] < 128 else esquina[:3]

    if abs(w - h) > 2:
        # Rectangular: todo el contenido dentro del círculo, sin cortar
        gris = px[..., :3]
        distinto = (px[..., 3] > 128) & (np.abs(gris - (fondo if fondo is not None else 0)).max(-1) > 20)
        ys, xs = np.nonzero(distinto)
        cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        r = np.hypot(xs - cx, ys - cy).max() * 1.07
        relleno = tuple(int(v) for v in (fondo if fondo is not None else (255, 255, 255))) + (255,)
    else:
        opaco = px[..., 3] > 128
        if fondo is not None:
            opaco &= np.abs(px[..., :3] - fondo).max(-1) > 12
        ys, xs = np.nonzero(opaco)
        cx0, cy0 = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
        rmax = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 + 6
        cx, cy, r = ajustar_circulo(orilla(px, fondo, cx0, cy0, rmax))
        r -= margen
        relleno = (0, 0, 0, 0)

    caja = int(round(2 * r))
    lienzo = Image.new("RGBA", (caja, caja), relleno)
    lienzo.alpha_composite(img, (int(round(r - cx)), int(round(r - cy)))) if relleno[3] else \
        lienzo.paste(img, (int(round(r - cx)), int(round(r - cy))))
    cara = lienzo.resize((lado, lado), Image.LANCZOS)
    alfa = np.minimum(np.asarray(cara)[..., 3], np.asarray(mascara(lado)))
    cara.putalpha(Image.fromarray(alfa.astype(np.uint8)))
    cara.save(salida, quality=88)
    print(f"{salida}: centro ({cx:.0f}, {cy:.0f}), radio {r:.0f} px → {lado}x{lado}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("entrada")
    p.add_argument("salida")
    p.add_argument("--lado", type=int, default=900, help="tamaño de salida en px (900)")
    p.add_argument("--margen", type=float, default=2.0, help="px que se recortan hacia adentro de la orilla (2)")
    a = p.parse_args()
    preparar(a.entrada, a.salida, a.lado, a.margen)
