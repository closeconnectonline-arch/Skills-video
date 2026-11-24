# Biblioteca de diseños

Elementos visuales completos y reutilizables (secciones, galerías, héroes…) listos para usar en landing pages y videos.
A diferencia de `librerias/` (componentes sueltos), cada diseño aquí tiene un **motor** que no se toca y una **plantilla** que se copia y se llena.

## Cómo está organizado

Los diseños se agrupan por categoría:

```
disenos/
├── modulos-css/          ← módulos NFC 3D hechos solo con CSS + JS (sin dependencias)
├── modulos-threejs/      ← módulos NFC 3D fotorrealistas hechos con three.js
└── elementos-visuales/   ← otros elementos: carruseles, carteras, etc.
    └── <nombre-del-diseno>/
        ├── README.md        ← qué es, cómo usarlo y qué se puede cambiar
        ├── motor/           ← CSS + JS del diseño (no se edita por proyecto)
        ├── plantilla/       ← página base con textos e imágenes de relleno: cópiala
        ├── ejemplo-*/       ← (opcional) la plantilla llena con contenido real
        └── herramientas/    ← (opcional) scripts de apoyo, p. ej. preparar imágenes
```

## Cómo usar un diseño
1. Copia la carpeta `plantilla/` a tu proyecto (o a una carpeta nueva).
2. Ajusta la ruta al motor (`../motor/…`) si la moviste.
3. Llena textos e imágenes en los bloques marcados con `[EDITAR]`.

> También puedes pedírselo a Claude: *"usa el Dj carrusel con estas fotos"*.

## Catálogo

### Módulos con CSS (`modulos-css/`)
| Diseño | Descripción | Origen | Versión |
|---|---|---|---|
| [Módulo 3D render Pro y Pro Plus](modulos-css/modulo-3d-render-pro/) | Módulo circular de acrílico (o PVC) que flota y gira en 3D con un vinil distinto en cada cara | Close Connect (desde cero) | v1 |
| [Módulo 3D Pro con base](modulos-css/modulo-3d-pro-con-base/) | Módulo Pro girando encajado en una base de acrílico transparente con ranura, con encaje y sombras calculados | Close Connect (desde cero) | v1 |
| [Módulo 3D Pro con base · ciclo](modulos-css/modulo-3d-pro-ciclo/) | Módulo Pro con base que cambia a un diseño nuevo cada vez que muestra una cara, en ciclo | Close Connect (desde cero) | v1 |
| [Módulo 3D Pro Plus sin base · ciclo](modulos-css/modulo-3d-proplus-ciclo/) | Copia del Pro ciclo sin base: círculo de acrílico Ø7 cm con dos caras que flota, gira y cambia de diseño en ciclo | Close Connect (desde cero) | v1 |
| [Módulo 3D Personal](modulos-css/modulo-3d-personal/) | Tarjeta horizontal 8.5 × 5.4 cm de acrílico con vinil en ambas caras que flota, gira y cambia de diseño en ciclo | Close Connect (desde cero) | v1 |
| [Módulo 3D Estándar](modulos-css/modulo-3d-estandar/) | Tarjeta vertical 5.4 × 8.5 cm con vinil en ambas caras, encajada en base de MDF con ranura; flota, gira y cambia de diseño en ciclo | Close Connect (desde cero) | v1 |
| [Módulo 3D Pro con base · ciclo · optimizado](modulos-css/modulo-3d-pro-ciclo-optimizado/) | Copia de [Módulo 3D Pro con base · ciclo](modulos-css/modulo-3d-pro-ciclo/) con motor v2: pausa real fuera de pantalla, sombras pre-dibujadas, canto adaptable e imágenes bajo demanda; se ve igual | Close Connect (desde cero) | v2 |
| [Módulo 3D Pro Plus sin base · ciclo · optimizado](modulos-css/modulo-3d-proplus-ciclo-optimizado/) | Copia de [Módulo 3D Pro Plus sin base · ciclo](modulos-css/modulo-3d-proplus-ciclo/) con motor v2: pausa real fuera de pantalla, sombras pre-dibujadas, canto adaptable e imágenes bajo demanda; se ve igual | Close Connect (desde cero) | v2 |
| [Módulo 3D Personal · optimizado](modulos-css/modulo-3d-personal-optimizado/) | Copia de [Módulo 3D Personal](modulos-css/modulo-3d-personal/) con motor v2: pausa real fuera de pantalla, sombras pre-dibujadas, canto adaptable e imágenes bajo demanda; se ve igual | Close Connect (desde cero) | v2 |
| [Módulo 3D Estándar · optimizado](modulos-css/modulo-3d-estandar-optimizado/) | Copia de [Módulo 3D Estándar](modulos-css/modulo-3d-estandar/) con motor v2: pausa real fuera de pantalla, sombras pre-dibujadas, canto adaptable e imágenes bajo demanda; se ve igual | Close Connect (desde cero) | v2 |

### Módulos con three.js (`modulos-threejs/`)
| Diseño | Descripción | Origen | Versión |
|---|---|---|---|
| [Módulo 3D Pro con base · three.js](modulos-threejs/modulo-3d-three-pro-ciclo/) | Pro Ø10 cm en base de acrílico con transmisión real, luz de estudio HDR, sombras suaves y ciclo de diseños | Derivado de `modulo-3d-pro-ciclo` | v1 |
| [Módulo 3D Pro Plus · three.js](modulos-threejs/modulo-3d-three-proplus-ciclo/) | Pro Plus Ø7 cm de acrílico flotando, con cantos pulidos, softbox y ciclo de diseños | Derivado de `modulo-3d-proplus-ciclo` | v1 |
| [Módulo 3D Personal · three.js](modulos-threejs/modulo-3d-three-personal/) | Tarjeta 8.5 × 5.4 cm de acrílico flotando, con vinil laminado y ciclo de diseños | Derivado de `modulo-3d-personal` | v1 |
| [Módulo 3D Estándar · three.js](modulos-threejs/modulo-3d-three-estandar/) | Tarjeta 5.4 × 8.5 cm en base de MDF con grano y canto quemado por láser, con ciclo de diseños | Derivado de `modulo-3d-estandar` | v1 |

### Elementos visuales (`elementos-visuales/`)
| Diseño | Descripción | Origen | Versión |
|---|---|---|---|
| [Dj carrusel](elementos-visuales/dj-carrusel/) | Tarjetas apiladas que pasan a color y despliegan un panel con la información de cada foto | FeyCards (Aceternity Labs) | v1 |
| [Cartera de tarjetas](elementos-visuales/cartera-tarjetas/) | Cartera con hasta 3 tarjetas que salen en abanico y revela el balance total calculado | byllzz (Uiverse.io) | v1 |
