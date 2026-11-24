# Fondo de puntos brillantes

Rejilla de puntos tenues en la que cada punto se ilumina a su propio ritmo, con un halo suave; se desvanece hacia las orillas. **Solo el fondo**: el logo y el texto del ejemplo original se eliminaron.

| Dato | Valor |
|---|---|
| Origen | Ejemplo de "Dotted Glow Background" (Aceternity UI) pegado por el usuario. El archivo traía solo el ejemplo de uso (React/Tailwind), no el componente; el fondo se reconstruyó desde cero en canvas con los mismos ajustes del ejemplo |
| Ajustes del original | `gap 10`, `radius 1.6`, `opacity 1`, `backgroundOpacity 0`, `speedMin 0.3`, `speedMax 1.6`, `speedScale 1`, máscara radial al 90 % |
| Clases / selectores principales | `.fondo-puntos`, `[data-fondo-puntos]`, `.fondo-puntos--desvanecido`, `.fondo-puntos--orillas` |
| Colores | Puntos `#737373` (neutral-500); brillo `#075985` (sky-800, oscuro) o `#525252` (neutral-600, claro). Cambian con `data-color` y `data-brillo` (acepta variables CSS) |
| Fuentes | Ninguna |
| HTML | Listo |

## Archivos
- `fondo-puntos.js`: el fondo (canvas 2D, sin dependencias). Monta solo los `[data-fondo-puntos]` de la página.
- `style.css`: posición del fondo, máscaras y la demo.
- `index.html`: demo con el recuadro del ejemplo original, en oscuro y en claro.

## Uso
```html
<section style="position:relative">
  <div class="fondo-puntos fondo-puntos--orillas" data-fondo-puntos data-color="#737373" data-brillo="#7c5cff"></div>
  … contenido con position:relative y z-index:1 …
</section>
<script src="fondo-puntos.js"></script>
```
Opciones (`data-*` o `FondoPuntos.montar(el, {...})`): `gap`, `radio`, `color`, `brillo`, `opacidad`, `fondo`, `fondo-opacidad`, `vel-min`, `vel-max`, `vel-escala`, `fps` (40).

## Notas
- Rendimiento: un canvas por fondo; los puntos se pintan agrupados en 10 niveles de brillo y el halo es un sprite pre-dibujado (sin `shadowBlur` por punto). Se pausa fuera de pantalla y con la pestaña oculta; con "reducir movimiento" queda quieto.
- El contenedor necesita `position: relative` (o absolute/fixed); el contenido encima, `z-index: 1`.
