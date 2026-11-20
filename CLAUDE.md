# Instrucciones para Claude

- Habla siempre en **español** con el usuario.
- Este repositorio guarda skills de video, librerías de componentes y la identidad de marca.

## Marca
- Antes de crear cualquier video, diseño o componente, revisa `marca/` (colores en `marca/colores/tokens.css`, tipografía, logos, voz y tono) y úsala.
- Si un dato de marca sigue como `[pendiente]`, pregúntalo al usuario en lugar de inventarlo.
- Archivos nuevos de marca: van en la subcarpeta correspondiente de `marca/`, con nombres en minúsculas y guiones, sin espacios ni acentos.

## Librerías
- Un componente por carpeta: `librerias/<categoria>/<NN>-<nombre-corto>/` con `README.md`, `style.css` e `index.html`.
- Para agregar uno: copia `librerias/_plantilla/`, usa el siguiente número de la categoría y actualiza la tabla del catálogo en `librerias/README.md`.
- Si el usuario pega código en formato Markdown escapado (`\#`, `\-`, `\*`), límpialo antes de guardarlo.

## Git
- Guarda los cambios con commits descriptivos en español.
