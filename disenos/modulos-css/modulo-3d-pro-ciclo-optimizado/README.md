# Módulo 3D Pro con base · ciclo · optimizado

El [Módulo 3D Pro con base](../modulo-3d-pro-con-base/) con un **ciclo de diseños**: cada vez que una cara queda de espaldas cambia al siguiente diseño de la lista. Así, cada vez que el módulo muestra una cara es un diseño nuevo; al terminar la lista, el ciclo vuelve a empezar.

- **Orden:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio ocurre de espaldas, así que nunca se ve.
- **Contador:** abajo del título dice qué diseño se ve («Diseño 4 de 10»).
- **Arrastrar:** si el usuario gira el módulo con el dedo, el ciclo sigue funcionando en cualquier sentido.
- **Precarga:** todas las imágenes se cargan al inicio para que no haya parpadeos.
- Todo lo demás es igual que el diseño con base (medidas, encaje, luz y sombras).

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-pro-con-base`](../modulo-3d-pro-con-base/) v1 |
| Plantilla | Trae los 10 diseños de Close Connect como ejemplo |
| Rendimiento | ~56 cuadros por segundo con el procesador limitado a 4× |

## Optimizado (v2)

Copia de [`modulo-3d-pro-ciclo`](../modulo-3d-pro-ciclo/) con el **motor optimizado v2**. El original no se modificó. Se ve igual y tiene la misma API (comparado píxel por píxel a 28° y 160°: diferencia máxima de 2 sobre 255).

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
modulo-3d-pro-ciclo/
├── motor/
│   ├── modulo-3d.css        ← estilos + contador
│   └── modulo-3d.js         ← módulo + base + ciclo de caras
├── plantilla/
│   ├── index.html           ← [EDITAR] data-caras
│   └── caras/               ← cara-01 … cara-10 (diseños de ejemplo)
└── herramientas/
    └── preparar-cara.py     ← v2: detecta el círculo y quita fondo y aro gris
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño en orden:
   ```
   python3 herramientas/preparar-cara.py DISENO-1.png mi-carpeta/caras/cara-01.webp
   ```
3. En `index.html`, pon la lista en `data-caras` (mínimo 3; con 2 usa el diseño con base):
   ```html
   data-caras='["caras/cara-01.webp","caras/cara-02.webp","caras/cara-03.webp"]'
   ```

**Desde JavaScript:** `el.m3d.lista()` devuelve la lista y `el.m3d.estadoCiclo()` qué diseño hay en cada cara. `Modulo3D.montar(el, { caras: [...] })` crea un módulo con su propia lista.

## Notas
- Con un número par de diseños, el frente siempre muestra los nones (1, 3, 5…) y el reverso los pares. Con un número impar se van alternando en cada vuelta.
- La velocidad (`data-velocidad`, 34 °/s) marca cada cuánto aparece un diseño nuevo: uno cada ~5 segundos.
