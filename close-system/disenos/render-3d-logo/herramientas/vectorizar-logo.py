"""Vectoriza el logo Close System (PNG con fondo transparente) en un SVG por capas para el motor 3D.

Uso:  python3 vectorizar-logo.py logo-original.png close-system-logo.svg [--mapa mapa.png]

Capas que genera (atributo data-capa):
  base    silueta completa del logo (placa cromada + campo negro)
  borde   orilla cromada de 22 px alrededor de la silueta
  bandas  anillos y trazos curvos (esmalte blanco)
  letras  tapa de letras y estrellas, 6 px más delgada: el motor le crea un bisel cromado hacia afuera
          hasta el contorno real (así la tapa nunca se deforma). letras-dibujo es el contorno real, solo visual.

Las piezas blancas se separan por componentes conectados. Cuáles son "bandas" se decide por forma
(muy anchas o muy delgadas); el resto son letras y estrellas. Con --mapa se guarda una imagen con
cada pieza numerada y coloreada para revisar la separación.
Requiere: opencv-python, numpy, pillow.
"""
import sys, cv2, numpy as np
from PIL import Image

ESCALA = 0.5          # se trabaja a la mitad del tamaño original (6400 px → ~2000 px)
UMBRAL_BLANCO = 150   # luminancia mínima de las piezas blancas
AREA_MIN = 800        # px; descarta los destellos del campo negro

def E(r): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
def suavizar(m, b):
    return (cv2.GaussianBlur(m.astype(np.float32), (0, 0), b / 3) > 0.5).astype(np.uint8)

def main(entrada, salida, mapa=None):
    a = np.array(Image.open(entrada).convert("RGBA"))
    ys, xs = np.where(a[..., 3] > 128)
    a = a[max(0, ys.min() - 40):ys.max() + 40, max(0, xs.min() - 40):xs.max() + 40]
    a = cv2.resize(a, None, fx=ESCALA, fy=ESCALA, interpolation=cv2.INTER_AREA)
    al, L = a[..., 3], cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2GRAY)

    # Silueta: la pieza opaca más grande, con huecos rellenos
    n, lab, st, _ = cv2.connectedComponentsWithStats((al > 128).astype(np.uint8), 8)
    S = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    h, w = S.shape
    ff = S.copy(); cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 1); S = S | (1 - ff)

    # Piezas blancas
    claro = ((L > UMBRAL_BLANCO) & (S > 0)).astype(np.uint8)
    claro = cv2.medianBlur(claro * 255, 5) // 255
    claro = cv2.morphologyEx(claro, cv2.MORPH_OPEN, E(2))
    n, lab, st, cen = cv2.connectedComponentsWithStats(claro, 8)
    anchoLogo = xs.max() - xs.min()
    bandas, letras = [], []
    for i in range(1, n):
        x, y, ww, hh, area = st[i]
        if area < AREA_MIN: continue
        relleno = area / (ww * hh)
        # anillos: casi tan anchos como el logo; trazos: largos, delgados y poco rellenos
        es_banda = ww > 0.6 * anchoLogo * ESCALA or (ww > 2.5 * hh and relleno < 0.35)
        (bandas if es_banda else letras).append(i)

    def redondear(ids, r, adelgazar=0):
        out = np.zeros_like(S)
        for i in ids:
            k = cv2.copyMakeBorder((lab == i).astype(np.uint8), r * 2, r * 2, r * 2, r * 2, cv2.BORDER_CONSTANT, 0)
            k = cv2.morphologyEx(k, cv2.MORPH_CLOSE, E(r))       # r pequeño: no rellena las muescas de S y E
            if adelgazar: k = cv2.erode(k, E(adelgazar))         # recupera la separación entre letras
            out |= k[r * 2:-r * 2, r * 2:-r * 2]
        return out

    base = suavizar(S, 9)
    borde = base - cv2.erode(base, E(22))
    ban = suavizar(redondear(bandas, 4), 5)
    let = suavizar(redondear(letras, 4, 3), 5)
    let_tapa = suavizar(redondear(letras, 4, 9), 5)

    ys2, xs2 = np.where(base > 0); pad = 20
    ox, oy = xs2.min() - pad, ys2.min() - pad
    W, H = xs2.max() - xs2.min() + 2 * pad, ys2.max() - ys2.min() + 2 * pad

    def trazo(m, eps=0.7):
        cs, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        d = []
        for c in cs:
            if cv2.contourArea(c) < 60: continue
            c = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(float)
            if len(c) < 4: continue
            c -= (ox, oy); k = len(c); s = f"M{c[0][0]:.1f} {c[0][1]:.1f}"
            for i in range(k):   # Catmull-Rom → Bézier cúbica
                p0, p1, p2, p3 = c[i - 1], c[i], c[(i + 1) % k], c[(i + 2) % k]
                b1, b2 = p1 + (p2 - p0) / 6, p2 - (p3 - p1) / 6
                s += f"C{b1[0]:.1f} {b1[1]:.1f} {b2[0]:.1f} {b2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
            d.append(s + "Z")
        return " ".join(d)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<title>Close System · logotipo vectorizado por capas</title>
<!-- Capas para el motor 3D (data-capa): base (campo negro), borde (orilla cromada), bandas (anillos y trazos), letras (tapa de letras y estrellas, invisible). letras-dibujo es solo para ver el logo plano -->
<path id="base" data-capa="base" fill="#0d0d0f" fill-rule="evenodd" d="{trazo(base)}"/>
<path id="borde" data-capa="borde" fill="#8c8f96" fill-rule="evenodd" d="{trazo(borde)}"/>
<path id="bandas" data-capa="bandas" fill="#f4f4f2" stroke="#2a2a2e" stroke-width="5" fill-rule="evenodd" d="{trazo(ban)}"/>
<path id="letras-tapa" data-capa="letras" fill="#f7f7f5" fill-opacity="0" fill-rule="evenodd" d="{trazo(let_tapa)}"/>
<path id="letras-dibujo" fill="#f7f7f5" stroke="#2a2a2e" stroke-width="7" stroke-linejoin="round" fill-rule="evenodd" d="{trazo(let)}"/>
</svg>'''
    open(salida, "w").write(svg)
    print(f"{salida}: {W}×{H}px · {len(bandas)} bandas · {len(letras)} letras/estrellas")

    if mapa:
        vis = np.zeros((h, w, 3), np.uint8); vis[S > 0] = (40, 40, 40)
        for i in bandas: vis[lab == i] = (120, 160, 255)
        for i in letras: vis[lab == i] = (255, 210, 90)
        for i in bandas + letras:
            cv2.putText(vis, str(i), (int(cen[i][0]), int(cen[i][1])), 0, 1.1, (255, 0, 0), 3)
        Image.fromarray(vis).save(mapa)

if __name__ == "__main__":
    if len(sys.argv) < 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2], sys.argv[sys.argv.index("--mapa") + 1] if "--mapa" in sys.argv else None)
