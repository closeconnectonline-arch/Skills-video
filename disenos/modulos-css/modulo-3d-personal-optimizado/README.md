# Módulo 3D Personal · optimizado

Tarjeta horizontal de **8.5 × 5.4 cm** de acrílico de **2 mm**, con vinil impreso en ambas caras. Flota, gira y cambia al siguiente diseño cada vez que una cara queda de espaldas; al terminar la lista, el ciclo se repite.

- **Forma:** rectángulo con esquinas de 3 mm y canto de acrílico transparente alrededor de todo el contorno.
- **Ciclo:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio nunca se ve y abajo del título aparece «Diseño 4 de 12».
- **Interacción:** arrastrar con inercia, pausa, frente y reverso.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-pro-ciclo`](../modulo-3d-pro-ciclo/) v1 (forma de tarjeta agregada) |
| Modelo | `data-modelo="personal"` |
| Plantilla | Trae los 12 diseños de Close Connect como ejemplo |
| Rendimiento | 60 cuadros por segundo con el procesador limitado a 4× |

## Optimizado (v2)

Copia de [`modulo-3d-personal`](../modulo-3d-personal/) con el **motor optimizado v2**. El original no se modificó. Se ve igual y tiene la misma API (comparado píxel por píxel a 28° y 160°: diferencia máxima de 2 sobre 255).

| Optimización | Qué hace |
|---|---|
| Pausa real | Deja de dibujar fuera de pantalla (con 100 px de margen) y con la pestaña oculta. Al volver sigue en el mismo ángulo y el mismo diseño. API: `pausar()`, `reanudar()`, `enPausa()` |
| Sombras pre-dibujadas | Las sombras del piso son imágenes en `motor/texturas/` (antes `filter: blur()` recalculado en cada cuadro) |
| Canto adaptable | 64 segmentos con el módulo grande; 52 por debajo de 200 px y 40 por debajo de 150 px, donde no se distingue. Se puede fijar con `data-segmentos` |
| Imágenes bajo demanda | Solo descarga las dos caras visibles y la siguiente del ciclo (antes descargaba toda la lista al montar) |
| `detener()` limpio | También suelta sus escuchas (`resize`, `visibilitychange`, `IntersectionObserver`) |

El motor es el mismo en las cuatro copias optimizadas (Pro, Pro Plus, Personal y Estándar): sirve para los cuatro modelos.
Las texturas de ruido (estudio y MDF) se dejaron como SVG: medido, no cuestan rendimiento y como imagen pesarían unos 220 KB.

## Archivos
```
modulo-3d-personal/
├── motor/
│   ├── modulo-3d.css          ← estilos (incluye la forma de tarjeta)
│   └── modulo-3d.js           ← módulo + tarjeta + ciclo (también sirve para pro / proplus)
├── plantilla/
│   ├── index.html             ← [EDITAR] data-caras
│   └── caras/                 ← tarjeta-01 … tarjeta-12 (diseños de ejemplo)
└── herramientas/
    └── preparar-tarjeta.py    ← proporción exacta + diseño sobre vinil negro o blanco
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño (PNG transparente):
   ```
   python3 herramientas/preparar-tarjeta.py DISENO.png mi-carpeta/caras/tarjeta-01.webp --vinil negro
   ```
   - **Vinil:** textos e íconos blancos → `negro`; textos negros → `blanco`. Antes de elegir, revisa una hoja de contacto de cada diseño sobre negro y sobre blanco.
   - **Proporción:** la herramienta recorta por igual lo que sobre, sin mover el diseño.
3. En `index.html`, pon la lista en `data-caras` (mínimo 3). Con 1 o 2 diseños, usa `data-frente` y `data-reverso`.

| Atributo | Por defecto | Qué controla |
|---|---|---|
| `data-modelo` | `personal` | Tarjeta horizontal |
| `data-ancho-cm` / `data-alto-cm` | `8.5` / `5.4` | Medidas reales |
| `data-grosor-mm` | `2` | Grosor |
| `data-radio-mm` | `3` | Esquinas |
| `data-canto` | `acrilico` | `pvc` para un canto blanco opaco |

## Notas de los diseños de ejemplo
- Vinil negro: 1, 5, 7, 11, 12. Vinil blanco: 2, 3, 4, 6, 8, 9, 10.
- Los diseños 8, 9 y 10 son idénticos.
- En el 11 (Inmobiliaria), el recuadro blanco detrás de la palabra viene en el diseño. En el 5 y el 7, el ícono NFC gris oscuro casi no se ve sobre el negro.

### v3 (2026-11-24)
Motor optimizado v3 (las cuatro copias `*-optimizado` comparten el mismo motor). Opcional y compatible con v2:
- `data-cuadros="30"`: el giro automático va a un ritmo fijo y los módulos de la página se turnan los cuadros; al arrastrar vuelve a 60.
- `data-luz-reparto="3"`: el sombreado del canto y la base se reparte entre cuadros (siempre con el ángulo actual).
- Siempre: fuera de pantalla oculta sus piezas (`.m3d--fuera`), así el navegador no carga con sus capas 3D; transparencias a 2 decimales y reflejo en pasos de 1 %.
Medido en el catálogo de Close Connect (390 px, CPU ×4, sin GPU): inicio 20 → 27 cuadros/s, modelos 19 → 49, paquetes 13 → 30. Comparado píxel por píxel con v2 en 5 ángulos: diferencia máxima 3 sobre 255.
