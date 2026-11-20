# Panel de tarjetas apiladas desplegables

Una foto principal y 5 tarjetas verticales encimadas sobre fondo negro, con un titular al centro.
- **Entrada:** las tarjetas salen apiladas y se abren en abanico con efecto resorte (la del frente primero).
- **Hover:** la tarjeta pasa de gris a color, las de su derecha se recorren 60 px y el titular cambia a un degradado transparente al centro para dejar ver las fotos.
- **Clic (función nueva):** la tarjeta se queda a color y a su derecha se **despliega un panel** con la información de la foto (número, foto completa, título, descripción y datos). Las tarjetas siguientes se recorren para dejarle espacio y todo el conjunto se recentra.
- Cerrar: botón ✕, tecla Esc, clic en la misma tarjeta o clic fuera. Navegar: botones Anterior/Siguiente o flechas ← →.

| Dato | Valor |
|---|---|
| Origen | `FeyCards` de Aceternity Labs (archivo `Panel_visual.md`, React + Motion, sin HTML) |
| Clases / selectores principales | `.fey`, `.fey__title`, `.fey__deck`, `.fey__card`, `.fey__inner`, `.fey__img--active`, `.fey__img--idle`, `.fey__panel` |
| Colores | Fondo `#000000`, texto `#ffffff`, panel `#0b0b0c`, bordes `rgba(255,255,255,.1)` |
| Fuentes | Ninguna (system-ui) |
| HTML | ✅ Reconstruido en HTML + CSS + JS sin librerías, con las fotos de la sesión *Untitled* |

## Archivos
- `index.html`: demo. Los textos e imágenes de cada tarjeta están en el bloque `<script id="fey-data">` (JSON): edítalos ahí.
- `style.css`: estilos. Variables `--fey-*` para colores, tamaño de tarjeta y velocidad.
- `script.js`: crea las tarjetas a partir de los datos y maneja hover, despliegue y teclado.
- `img/NN-nombre.jpg`: recorte vertical 1:3 de cada foto (a color).
- `img/NN-nombre-idle.jpg`: la misma tarjeta en gris oscuro (estado en reposo; el original usaba una imagen `idle.webp`).
- `img/NN-nombre-completa.jpg`: la foto completa (1000 px) que aparece en el panel.

## Equivalencias con el original
| Original (React) | Aquí |
|---|---|
| `CARD_SPACING = 32` | `CARD_SPACING` en `script.js` |
| `shiftDistance = 60` | `SHIFT_HOVER` |
| `swapDuration = 0.5` | `--fey-swap` |
| `entranceStagger = 0.2` | `STAGGER` |
| `spring { visualDuration: .5, bounce: .2 }` | `--fey-spring` (curva `linear()` calculada del mismo resorte) |
| `mask-b-from-10%` | `mask-image` en `.fey__inner` (por tarjeta, para que las recorridas no se recorten) |

## Notas
- Las fotos no traían datos de cámara (EXIF), así que el panel muestra archivo, tratamiento, escena y formato. Los títulos y descripciones son provisionales.
- El titular es la traducción del original ("Inspired by the pros. Made for you."); cámbialo por el tuyo.
- Colores y tipografía de marca siguen `[pendiente]` en `marca/`; cuando estén, reemplaza las variables `--fey-*`.
- En pantallas chicas el conjunto se escala para caber.
