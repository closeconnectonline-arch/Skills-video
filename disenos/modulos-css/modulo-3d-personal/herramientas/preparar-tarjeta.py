#!/usr/bin/env python3
"""Convierte un diseño PNG en una cara de tarjeta lista para el Módulo 3D (Personal o Estándar).

Uso:
  python3 preparar-tarjeta.py DISENO.png SALIDA.webp --vinil negro|blanco [--orientacion horizontal|vertical]

- Deja la proporción exacta de la tarjeta (8.5 × 5.4 horizontal o 5.4 × 8.5 vertical)
  recortando por igual lo que sobre en los lados, sin mover el diseño.
- Pone el diseño (PNG transparente) sobre el color del vinil.
  Regla: textos e íconos blancos → vinil negro; textos negros → vinil blanco.
  Revisa siempre una hoja de contacto sobre negro y sobre blanco antes de decidir.
- Sale un WebP de 15 px por mm: 1275 × 810 (horizontal) u 810 × 1275 (vertical).
"""
import argparse

from PIL import Image

COLORES = {"negro": (10, 10, 10, 255), "blanco": (255, 255, 255, 255)}


def preparar(entrada, salida, vinil, orientacion="horizontal"):
    ancho, alto = (1275, 810) if orientacion == "horizontal" else (810, 1275)
    img = Image.open(entrada).convert("RGBA")
    w, h = img.size
    objetivo = ancho / alto
    if w / h > objetivo:                       # sobra ancho
        nw = round(h * objetivo); x0 = (w - nw) // 2
        img = img.crop((x0, 0, x0 + nw, h))
    else:                                      # sobra alto
        nh = round(w / objetivo); y0 = (h - nh) // 2
        img = img.crop((0, y0, w, y0 + nh))
    img = img.resize((ancho, alto), Image.LANCZOS)
    fondo = Image.new("RGBA", (ancho, alto), COLORES[vinil])
    fondo.alpha_composite(img)
    fondo.convert("RGB").save(salida, quality=90)
    print(f"{salida}: {w}x{h} → {ancho}x{alto}, vinil {vinil}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("entrada")
    p.add_argument("salida")
    p.add_argument("--vinil", choices=["negro", "blanco"], required=True)
    p.add_argument("--orientacion", choices=["horizontal", "vertical"], default="horizontal")
    a = p.parse_args()
    preparar(a.entrada, a.salida, a.vinil, a.orientacion)
