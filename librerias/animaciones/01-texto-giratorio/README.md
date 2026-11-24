# Texto giratorio

Caja con relieve que va cambiando de palabra: el ancho se ajusta a cada palabra y las letras aparecen una tras otra saliendo de un desenfoque.

| Dato | Valor |
|---|---|
| Origen | Ejemplo de "Container Text Flip" (Aceternity UI) pegado por el usuario (`Tecnología nfc para tu negocio.md`). El archivo traía solo el ejemplo de uso (React), no el componente; se reconstruyó en JS sin dependencias con los ajustes del original |
| Ajustes del original | Cambia cada `3000 ms`; animación de `700 ms` (el ancho tarda la mitad); `20 ms` entre letras; letras de `opacity 0 + blur(10px)` a nítidas; caja `rounded-lg`, `pt-2 pb-3`, negritas, +30 px de ancho |
| Clases / selectores principales | `.texto-giratorio`, `[data-texto-giratorio]`, `.texto-giratorio--oscuro` |
| Colores | Claro: degradado `#f3f4f6 → #e5e7eb`, borde `#d1d5db`. Oscuro: `#374151 → #1f2937`, borde `hsla(205,89%,46%,.24)`. Se cambian con `--tg-fondo`, `--tg-sombra` y `--tg-color` |
| Fuentes | Ninguna (hereda la del texto) |
| HTML | Listo |
| Versión | v1 |

## Archivos
- `texto-giratorio.js`: monta solo los `[data-texto-giratorio]` de la página (sin dependencias).
- `style.css`: la caja, la animación de las letras y la variante oscura.
- `index.html`: demo con las palabras del ejemplo original (claro) y un ejemplo en español (oscuro).

## Uso
```html
<p>Tecnología para tu <span class="texto-giratorio" data-texto-giratorio data-palabras="negocio|tienda|clínica">negocio</span></p>
<script src="texto-giratorio.js"></script>
```
Opciones (`data-*` o `TextoGiratorio.montar(el, {...})`): `palabras` (separadas por `|`), `intervalo` (3000), `duracion` (700), `retraso` (20). Variable CSS `--tg-relleno` (15px por lado).

## Notas
- Pon la primera palabra como texto del elemento: es lo que se ve sin JS y lo que leen los lectores de pantalla (la animación va oculta para ellos).
- Se pausa fuera de pantalla y con la pestaña oculta; con "reducir movimiento" se queda en la primera palabra.
- `el.tg.detener()` lo apaga; `el.tg.palabra()` dice la palabra actual.
