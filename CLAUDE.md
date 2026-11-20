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

## Diseños
- Elementos visuales completos y reutilizables van en `disenos/<nombre-corto>/` con `README.md`, `motor/` (CSS + JS que no se edita por proyecto) y `plantilla/` (página base con contenido de relleno). Opcionales: `ejemplo-*/` y `herramientas/`.
- Al agregar uno, actualiza la tabla del catálogo en `disenos/README.md`.
- Para usar un diseño, copia su `plantilla/` y llénala; no modifiques el motor salvo para mejorarlo para todos (sube la versión en su README).

## Git
- Guarda los cambios con commits descriptivos en español.
