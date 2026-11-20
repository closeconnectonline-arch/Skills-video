# Identidad de marca

Todo lo relacionado con la marca: logos, colores, tipografía, imágenes, plantillas y forma de comunicar.
Claude consulta esta carpeta antes de hacer cualquier video o diseño.

> ⚠️ **Por completar:** llena los datos marcados como `[pendiente]` y sube los archivos a cada carpeta.

## Datos generales
| Dato | Valor |
|---|---|
| Nombre de la marca | [pendiente] |
| Eslogan | [pendiente] |
| Sitio web | [pendiente] |
| Redes sociales | [pendiente] |

## Estructura

```
marca/
├── logos/
│   ├── principal/      ← logo completo a color (SVG + PNG)
│   ├── secundario/     ← versión horizontal o alternativa
│   ├── isotipo/        ← solo el símbolo, sin texto
│   ├── monocromo/      ← versiones en blanco y en negro
│   └── favicon/        ← ícono pequeño para web
├── colores/
│   ├── paleta.md       ← colores con su uso
│   └── tokens.css      ← variables CSS para webs y videos
├── tipografia/
│   ├── tipografia.md   ← fuentes y jerarquía
│   └── fuentes/        ← archivos .woff2 / .ttf / .otf
├── imagenes/
│   ├── fotos/          ← fotografías de producto, equipo, etc.
│   ├── texturas/
│   └── fondos/
├── iconografia/        ← íconos propios de la marca
├── plantillas/
│   ├── redes-sociales/ ← posts, historias, portadas
│   ├── video/          ← intros, cierres, cintillos (lower thirds)
│   └── documentos/
└── voz-y-tono/
    └── voz-y-tono.md   ← cómo habla la marca
```

## Reglas para archivos
- **Logos:** sube siempre el **SVG** (vectorial) y un **PNG con fondo transparente** de al menos 1000 px.
- **Nombres:** minúsculas, guiones, sin espacios ni acentos. Ejemplo: `logo-principal-color.svg`, `logo-blanco.png`.
- **Fuentes:** revisa que la licencia permita usarlas en web y video.
