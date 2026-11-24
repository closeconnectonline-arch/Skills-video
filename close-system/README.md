# Close System

Carpeta exclusiva para todo lo relacionado con **Close System**: logos, diseños, renders y recursos de la marca.
No mezclar aquí archivos de Close Connect (esos viven en `marca/` y `disenos/`).

## Contenido

| Carpeta | Qué hay |
|---|---|
| [`logos/`](logos/) | Logotipo original (PNG con fondo transparente), versión vectorizada por capas (SVG) y vista plana |
| [`disenos/render-3d-logo/`](disenos/render-3d-logo/) | Logotipo en 3D cromado con three.js: flota, gira y se puede arrastrar |

## Logos

| Archivo | Uso |
|---|---|
| `close-system-logo-original.png` | Archivo maestro tal como lo entregó el dueño (6400 × 4267 px, fondo transparente) |
| `close-system-logo-capas.svg` | Vector por capas (`base`, `borde`, `bandas`, `letras`) generado con `disenos/render-3d-logo/herramientas/vectorizar-logo.py`; alimenta el render 3D |
| `close-system-logo-plano.png` | Cómo se ve el SVG en plano |

## Reglas
- Nombres en minúsculas y con guiones, sin espacios ni acentos.
- Los diseños siguen la misma estructura que `disenos/` del repositorio: `README.md`, `motor/` (no se edita por proyecto) y `plantilla/` (se copia y se llena).
- Commits descriptivos en español.
