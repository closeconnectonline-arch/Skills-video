# Tooltip animado de avatares (6 círculos)

Fila de 6 fotos circulares encimadas. Al pasar el mouse, la foto crece un poco y aparece encima un tooltip negro con nombre y cargo que entra con efecto resorte y se inclina/desplaza siguiendo el movimiento del mouse. Debajo del tooltip hay dos líneas de luz (esmeralda y azul cielo).

| Dato | Valor |
|---|---|
| Origen | `AnimatedTooltip` de Aceternity UI (archivo `tool_tip_6_circulos.md`, solo traía la demo en React) |
| Clases / selectores principales | `.avatar-tooltip`, `.avatar-tooltip__item`, `.avatar-tooltip__img`, `.avatar-tooltip__tip`, `.avatar-tooltip__name`, `.avatar-tooltip__role` |
| Colores | Tooltip `#000000`, texto y borde `#ffffff`, líneas `#10b981` y `#0ea5e9` |
| Fuentes | Ninguna (hereda la de la página) |
| HTML | ✅ Reconstruido en HTML + CSS + JS sin librerías, con las fotos de la sesión *Untitled* |

## Archivos
- `index.html`: demo lista para abrir en el navegador.
- `style.css`: estilos. Las variables `--at-*` controlan tamaño, encimado y colores.
- `script.js`: animación (resortes de entrada y de giro), sin dependencias.
- `img/avatar-01.jpg` … `avatar-06.jpg`: recortes cuadrados de 400×400 px de las fotos originales.
- `react/animated-tooltip.tsx`: el componente original en React (necesita `framer-motion` y Tailwind).
- `react/animated-tooltip-demo.tsx`: la demo en React con estas fotos (copia `img/` a `public/avatares/`).

## Cómo editarlo
- **Nombres y cargos:** en `index.html`, cambia `Integrante N` y `Untitled crew` en cada `.avatar-tooltip__item` (son textos provisionales).
- **Fotos:** reemplaza los archivos de `img/` o cambia el `src`.
- **Tamaño:** `--at-size` (por defecto 56px) y `--at-overlap` (-16px).

## Uso en un video (HyperFrames)
Copia el HTML, el CSS y el JS dentro de la composición. Para que la animación quede fija en el render, sustituye los eventos de mouse por una animación en la línea de tiempo (por ejemplo, mostrar el tooltip de cada foto en secuencia) y cambia los colores por los de `marca/colores/tokens.css`.
