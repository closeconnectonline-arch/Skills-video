# Módulo 3D Pro Plus sin base · ciclo · optimizado

Copia del [Módulo 3D Pro con base · ciclo](../modulo-3d-pro-ciclo/) **sin la base de acrílico**: solo el círculo de acrílico con sus dos caras, flotando y girando. Cada vez que una cara queda de espaldas cambia al siguiente diseño de la lista, igual que el Pro.

- **Forma:** círculo de acrílico transparente Ø7 cm × 3 mm, con vinil en las dos caras (`data-modelo="proplus"` + `data-canto="acrilico"`).
- **Sin base:** sin `data-base`, el motor lo hace flotar (10 px) con una inclinación de cámara de −10° y sombra en el piso.
- **Ciclo:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio ocurre de espaldas, así que nunca se ve. Mismas 10 caras de ejemplo que el Pro.
- **Motor:** el mismo de `modulo-3d-pro-ciclo` v1, copiado sin cambios para que este diseño sea independiente.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Copia de [`modulo-3d-pro-ciclo`](../modulo-3d-pro-ciclo/) v1 (el original no se modificó) |
| Plantilla | Trae los 10 diseños de Close Connect como ejemplo |

## Optimizado (v2)

Copia de [`modulo-3d-proplus-ciclo`](../modulo-3d-proplus-ciclo/) con el **motor optimizado v2**. El original no se modificó. Se ve igual y tiene la misma API (comparado píxel por píxel a 28° y 160°: diferencia máxima de 2 sobre 255).

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
modulo-3d-proplus-ciclo/
├── motor/
│   ├── modulo-3d.css        ← igual al del Pro ciclo
│   └── modulo-3d.js         ← igual al del Pro ciclo
├── plantilla/
│   ├── index.html           ← [EDITAR] data-caras (sin data-base)
│   └── caras/               ← cara-01 … cara-10
└── herramientas/
    └── preparar-cara.py
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño: `python3 herramientas/preparar-cara.py DISENO.png mi-carpeta/caras/cara-01.webp`
3. Pon la lista en `data-caras` (mínimo 3).

**Para incrustarlo en una página sin título ni botones:** monta con JavaScript en un elemento que no tenga `data-modulo-3d`:
```js
Modulo3D.montar(el, { modelo: "proplus", canto: "acrilico", "grosor-mm": 3, titulo: "", controles: "no", caras: [...] });
```

### v3 (2026-11-24)
Motor optimizado v3 (las cuatro copias `*-optimizado` comparten el mismo motor). Opcional y compatible con v2:
- `data-cuadros="30"`: el giro automático va a un ritmo fijo y los módulos de la página se turnan los cuadros; al arrastrar vuelve a 60.
- `data-luz-reparto="3"`: el sombreado del canto y la base se reparte entre cuadros (siempre con el ángulo actual).
- Siempre: fuera de pantalla oculta sus piezas (`.m3d--fuera`), así el navegador no carga con sus capas 3D; transparencias a 2 decimales y reflejo en pasos de 1 %.
Medido en el catálogo de Close Connect (390 px, CPU ×4, sin GPU): inicio 20 → 27 cuadros/s, modelos 19 → 49, paquetes 13 → 30. Comparado píxel por píxel con v2 en 5 ángulos: diferencia máxima 3 sobre 255.
