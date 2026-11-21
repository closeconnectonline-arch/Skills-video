# Biblioteca de diseños

Elementos visuales completos y reutilizables (secciones, galerías, héroes…) listos para usar en landing pages y videos.
A diferencia de `librerias/` (componentes sueltos), cada diseño aquí tiene un **motor** que no se toca y una **plantilla** que se copia y se llena.

## Cómo está organizado

```
disenos/
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
| Diseño | Descripción | Origen | Versión |
|---|---|---|---|
| [Dj carrusel](dj-carrusel/) | Tarjetas apiladas que pasan a color y despliegan un panel con la información de cada foto | FeyCards (Aceternity Labs) | v1 |
| [Cartera de tarjetas](cartera-tarjetas/) | Cartera con hasta 3 tarjetas que salen en abanico y revela el balance total calculado | byllzz (Uiverse.io) | v1 |
