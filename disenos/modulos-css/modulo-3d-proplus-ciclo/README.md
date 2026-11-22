# Módulo 3D Pro Plus sin base · ciclo

Copia del [Módulo 3D Pro con base · ciclo](../modulo-3d-pro-ciclo/) **sin la base de acrílico**: solo el círculo de acrílico con sus dos caras, flotando y girando. Cada vez que una cara queda de espaldas cambia al siguiente diseño de la lista, igual que el Pro.

- **Forma:** círculo de acrílico transparente Ø7 cm × 3 mm, con vinil en las dos caras (`data-modelo="proplus"` + `data-canto="acrilico"`).
- **Sin base:** sin `data-base`, el motor lo hace flotar (10 px) con una inclinación de cámara de −10° y sombra en el piso.
- **Ciclo:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio ocurre de espaldas, así que nunca se ve. Mismas 10 caras de ejemplo que el Pro.
- **Motor:** el mismo de `modulo-3d-pro-ciclo` v1, copiado sin cambios para que este diseño sea independiente.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Copia de [`modulo-3d-pro-ciclo`](../modulo-3d-pro-ciclo/) v1 (el original no se modificó) |
| Plantilla | Trae los 10 diseños de Close Connect como ejemplo |

## Archivos
```
modulo-3d-proplus-ciclo/
├── motor/
│   ├── modulo-3d.css        ← igual al del Pro ciclo
│   └── modulo-3d.js         ← igual al del Pro ciclo
├── plantilla/
│   ├── index.html           ← [EDITAR] data-caras (sin data-base)
│   └── caras/               ← cara-01 … cara-10
└── herramientas/
    └── preparar-cara.py
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño: `python3 herramientas/preparar-cara.py DISENO.png mi-carpeta/caras/cara-01.webp`
3. Pon la lista en `data-caras` (mínimo 3).

**Para incrustarlo en una página sin título ni botones:** monta con JavaScript en un elemento que no tenga `data-modulo-3d`:
```js
Modulo3D.montar(el, { modelo: "proplus", canto: "acrilico", "grosor-mm": 3, titulo: "", controles: "no", caras: [...] });
```
