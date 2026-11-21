# Módulo 3D Estándar · three.js

Versión fotorrealista del [`modulo-3d-estandar`](../../modulos-css/modulo-3d-estandar/) hecha con **three.js**. Tarjeta vertical 5.4 × 8.5 cm de acrílico de 2 mm encajada en una base de MDF 5 × 2 × 1.2 cm con ranura de 2 mm × 6 mm abierta en los extremos (quedan visibles 7.9 cm). El conjunto flota.

![Vista previa](vista-previa.png)

- **Acrílico real:** `MeshPhysicalMaterial` con transmisión, IOR 1.49, cantos pulidos con bisel y un ligero tinte verde-azulado.
- **Iluminación de estudio:** entorno HDR (`RoomEnvironment`), luz principal con sombras suaves (VSM), dos contraluces para los cantos y un softbox que barre un reflejo sobre el laminado al girar. Tone mapping *Neutral* para respetar los colores del diseño.
- **Texturas:** vinil satinado con laminado brillante (rugosidad con micro-variación); MDF crudo con grano fino y canto más oscuro con orillas quemadas por el láser, en una sola pieza sin uniones.
- **Ciclo:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio ocurre de espaldas, así que nunca se ve. Abajo del título dice «Diseño N de M».
- **Interacción:** arrastrar con inercia, botones Girando/Pausa, Frente y Reverso. Se pausa fuera de pantalla y respeta `prefers-reduced-motion`.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-estandar`](../../modulos-css/modulo-3d-estandar/) v1 (el original no se modificó) |
| Motor | `motor/modulo-three.js` (fuente) → `motor/modulo-three.min.js` (three.js r187 incluido, sin CDN) |
| Modelo | `data-modelo="estandar"` |
| Plantilla | Trae los diseños de ejemplo de Close Connect (estandar-01 … estandar-10) |

## Archivos
```
modulo-3d-three-estandar/
├── motor/
│   ├── modulo-three.js       ← fuente (ES module, importa three)
│   ├── modulo-three.min.js   ← paquete listo para usar (incluye three.js)
│   └── modulo-three.css      ← estilos del título, contador y botones
├── plantilla/
│   ├── index.html            ← [EDITAR] data-caras
│   └── caras/                ← estandar-01 … estandar-10
└── vista-previa.png
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño con la herramienta del diseño CSS original (`../../modulos-css/modulo-3d-estandar/herramientas/`).
3. Pon la lista en `data-caras` (mínimo 3) en `index.html`.

**Desde JavaScript:** `ModuloThree.montar(el, { modelo: "estandar", caras: [...], titulo: "", controles: "no" })`. El elemento expone `el.m3t.lista()`, `el.m3t.estadoCiclo()` y `el.m3t.pose(grados)`.

## Volver a generar el motor
```
npm install three esbuild
npx esbuild motor/modulo-three.js --bundle --minify --format=iife --outfile=motor/modulo-three.min.js
```
El mismo motor sirve para los 4 modelos (`pro`, `proplus`, `personal`, `estandar`); si lo mejoras, cópialo a los 4 diseños y sube la versión.

## Verificación (v1)
- Chrome sin pantalla (SwiftShader) a 1280 y 390 px: sin errores de consola y sin desborde horizontal.
- El ciclo cambia la imagen: tras una vuelta pasa de los diseños 1/2 a 3/4.
- Pendiente: medir cuadros por segundo en un teléfono real.
