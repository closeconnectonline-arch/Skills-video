# Módulo 3D Estándar

Tarjeta vertical de **5.4 × 8.5 cm** de acrílico de **2 mm**, con vinil impreso en ambas caras, encajada en una **base de MDF**. Todo el conjunto flota y gira, y la tarjeta cambia al siguiente diseño cada vez que una cara queda de espaldas; al terminar la lista, el ciclo se repite.

- **Base de MDF:** bloque de 5 × 2 × 1.2 cm (largo × fondo × alto) con ranura de 2 mm al centro y a todo lo largo, de 6 mm de profundidad.
  - La cara es de MDF crudo con grano fino; el canto es más oscuro, con fibras y orillas ligeramente quemadas por el láser.
  - La ranura queda abierta en los extremos, así que ahí se ve el canto de la tarjeta.
- **Encaje:** la tarjeta entra hasta el fondo de la ranura; quedan visibles 7.9 cm. Como mide 5.4 cm y la base 5, sobresale 2 mm de cada lado.
- **Ciclo:** frente = diseño 1, reverso = diseño 2, luego 3, 4… Abajo del título aparece «Diseño 4 de 10».
- **Interacción:** arrastrar con inercia, pausa, frente y reverso.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-personal`](../modulo-3d-personal/) v1 (modelo vertical + base de MDF) |
| Modelo | `data-modelo="estandar"` + `data-base="mdf"` |
| Plantilla | Trae los 10 diseños de Close Connect como ejemplo |
| Rendimiento | 60 cuadros por segundo con el procesador limitado a 4× |

## Archivos
```
modulo-3d-estandar/
├── motor/
│   ├── modulo-3d.css          ← estilos (tarjeta + MDF con grano)
│   └── modulo-3d.js           ← módulo + tarjeta + base de MDF + ciclo
├── plantilla/
│   ├── index.html             ← [EDITAR] data-caras
│   └── caras/                 ← estandar-01 … estandar-10 (diseños de ejemplo)
└── herramientas/
    └── preparar-tarjeta.py    ← proporción exacta + diseño sobre vinil (usa --orientacion vertical)
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño:
   ```
   python3 herramientas/preparar-tarjeta.py DISENO.png mi-carpeta/caras/estandar-01.webp --vinil negro --orientacion vertical
   ```
   - **PNG transparente:** elige el vinil, negro para textos blancos o blanco para textos negros.
   - **PNG con fondo propio:** el vinil no cambia nada, porque el fondo del diseño lo cubre.
   - **Centrado:** revisa que el contenido quede centrado. Por ejemplo, el diseño 3 (Food Energy) traía el logo a 0.9 mm de la orilla y se recorrió 1.5 mm.
3. En `index.html`, pon la lista en `data-caras` (mínimo 3). Con 1 o 2 diseños, usa `data-frente` y `data-reverso`.

| Atributo | Por defecto | Qué controla |
|---|---|---|
| `data-mdf-largo` / `-fondo` / `-alto` | `5` / `2` / `1.2` cm | Base |
| `data-mdf-ranura` | `0.2` cm | Ancho de la ranura |
| `data-mdf-profundidad` | `0.6` cm | Profundidad de la ranura |
| `data-ancho-cm` / `data-alto-cm` | `5.4` / `8.5` | Tarjeta |
| `data-grosor-mm` / `data-radio-mm` | `2` / `3` | Grosor y esquinas |
| `data-flotar` | `8` en la plantilla | px de flotación (`0` para que quede quieto) |

`el.m3d.medidas()` devuelve `{ asomaMm, holguraMm }`.

## Para producción
- Una tarjeta de 2 mm con vinil por ambos lados mide unos 2.2 mm, así que no entra en una ranura de 2 mm. Corta la ranura de **2.3 mm** y haz un corte de prueba.
- La profundidad de 6 mm es un supuesto: es la mitad del alto. Si la real es otra, cambia `data-mdf-profundidad`.
