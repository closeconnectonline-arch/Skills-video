# Módulo 3D Pro con base

El Módulo 3D render Pro encajado en una **base de acrílico transparente** con ranura. Gira en 3D con un vinil distinto en cada cara, sin flotar: queda apoyado en la base.

- **Base:** 8 × 2.5 × 0.3 cm, esquinas redondeadas de 4 mm y ranura de 3 cm × 3 mm al centro. Es transparente, con cantos pulidos que brillan y un ligero tinte verde-azulado.
- **Encaje calculado:** el módulo entra en la ranura hasta que su cuerda mide lo mismo que la ranura y se apoya en sus dos extremos. Con Ø10 cm y una ranura de 3 cm entra **2.3 mm** y queda a **0.7 mm** de la mesa (fórmula: `R − √(R² − (L/2)²)`).
- **Sombras:** en el piso hay sombra de la base, sombra del módulo y una orilla de luz que concentra el acrílico.
- **Interacción:** igual que el módulo sin base (arrastrar con inercia, pausa, frente y reverso).

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-render-pro`](../modulo-3d-render-pro/) v1 |
| Prefijo de clases | `.m3d`, `.m3d__*`, `.m3d__base--*` |
| Módulo por defecto | Pro Ø10 cm de **3 mm** (el Pro sin base es de 5 mm) |
| Rendimiento | 60 cuadros por segundo con el procesador limitado a 4× |

## Archivos
```
modulo-3d-pro-con-base/
├── motor/
│   ├── modulo-3d.css        ← estilos del módulo y de la base
│   └── modulo-3d.js         ← módulo + base (piezas, luz del acrílico, sombras, encaje)
├── plantilla/
│   ├── index.html           ← [EDITAR] data-frente, data-reverso y medidas
│   └── caras/               ← caras de relleno (Califícanos blanco y negro)
└── herramientas/
    └── preparar-cara.py     ← v2: detecta el círculo solo y quita fondo y aro gris
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara las caras:
   ```
   python3 herramientas/preparar-cara.py DISENO.png mi-carpeta/caras/frente.webp
   ```
   La v2 encuentra el círculo aunque esté cortado en la orilla del lienzo. Le quita el fondo transparente o liso, la franja blanca y el aro gris oscuro de la orilla, ajusta el círculo por mínimos cuadrados y conserva todo el contenido de adentro.
3. Cambia `data-frente` y `data-reverso` en `index.html`.

## Medidas (atributos)
| Atributo | Por defecto | Qué es |
|---|---|---|
| `data-base` | `acrilico` | Activa la base (sin él, el módulo flota como en el diseño sin base) |
| `data-base-largo` / `-ancho` / `-grueso` | `8` / `2.5` / `0.3` cm | Tamaño de la base |
| `data-base-radio` | `0.4` cm | Radio de las esquinas |
| `data-ranura-largo` / `-ancho` | `3` / `0.3` cm | Ranura |
| `data-grosor-mm` | `3` | Grosor del módulo (debe caber en la ranura) |
| `data-diametro-cm` | `10` | Diámetro real del módulo |

`el.m3d.medidas()` devuelve `{ hundidoMm, holguraMm }` para mostrarlos en la página.

## Para producción
- **Ranura real:** un módulo de 3 mm con vinil por ambos lados mide unos 3.2 mm. Corta la ranura de **3.2 a 3.3 mm** y haz un corte de prueba en el láser.
- **Módulo de 5 mm:** si el módulo es de 5 mm, la ranura debe ser de unos 5.3 mm (`data-ranura-ancho="0.53"`, `data-grosor-mm="5"`).

## Notas
- Sin refracción real: el acrílico no deforma lo que se ve a través. Para eso, usar Three.js.
- Las caras de la base se arman con 4 piezas alrededor de la ranura. Recortarlas con `clip-path` bajaba el rendimiento a 2 cuadros por segundo.
