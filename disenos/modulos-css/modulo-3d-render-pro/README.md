# Módulo 3D render Pro y Pro Plus

Módulo circular de Close Connect que flota y gira en 3D, con un **vinil impreso distinto en cada cara**: al girar se ven el frente, el canto y el reverso.

- **Giro:** da vueltas solo, flota suavemente y tiene una sombra en el piso que acompaña el movimiento.
- **Luz:** cada cara se oscurece al alejarse de la luz y tiene un reflejo que se mueve con el giro.
- **Canto:** el Pro es de acrílico transparente con brillo y deja ver la orilla de cada vinil. El Pro Plus es de PVC blanco más delgado.
- **Interacción:** se arrastra con el dedo o el mouse para girarlo, con inercia. Tiene botones para pausar, ver el frente y ver el reverso.
- **Accesibilidad:** con «reducir movimiento» activado en el sistema, el módulo se queda quieto.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Hecho desde cero en CSS 3D + JS, sin librerías (inspirado en una moneda de bitcoin girando) |
| Prefijo de clases | `.m3d`, `.m3d__*`, fondo `.m3d-estudio` |
| Medidas | Pro: Ø10 cm × 0.5 cm de acrílico · Pro Plus: Ø7 cm × 0.2 cm de PVC (las de la skill `cc-render-modulos`) |
| Rendimiento | 60 cuadros por segundo con el procesador limitado a 4× |

## Archivos
```
modulo-3d-render-pro/
├── motor/
│   ├── modulo-3d.css           ← escena, caras, canto, título y controles
│   └── modulo-3d.js            ← arma el módulo, giro, luz, arrastre y botones
├── plantilla/
│   ├── index.html              ← página base: [EDITAR] data-frente y data-reverso
│   └── caras/                  ← caras de relleno (frente.webp, reverso.webp)
├── ejemplo-calificanos/
│   ├── index.html              ← primera prueba: Califícanos blanco al frente y negro atrás
│   └── caras/
└── herramientas/
    └── preparar-cara.py        ← convierte cualquier diseño en una cara redonda WebP
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva (p. ej. `ejemplo-<cliente>/`).
2. Prepara cada diseño (PNG o JPG):
   ```
   python3 herramientas/preparar-cara.py DISENO-FRENTE.png ejemplo-cliente/caras/frente.webp
   python3 herramientas/preparar-cara.py DISENO-REVERSO.png ejemplo-cliente/caras/reverso.webp
   ```
   - **Diseño cuadrado y redondo:** recorta el círculo y quita el aro de la orilla. Usa `--recorte 2` si el aro es más grueso.
   - **Diseño rectangular** (p. ej. vertical): mete todo el contenido en el círculo sin cortarlo y rellena con el color de fondo.
   - Sale un WebP de 900 × 900 px, transparente fuera del círculo.
3. En `index.html`, cambia los atributos:
   ```html
   <div data-modulo-3d
        data-modelo="pro"
        data-frente="caras/frente.webp"
        data-reverso="caras/reverso.webp"
        data-titulo="Módulo Pro · Cliente"
        data-subtitulo="Arrastra para girar"></div>
   ```

| Atributo | Por defecto | Qué controla |
|---|---|---|
| `data-modelo` | `pro` | `pro` (acrílico Ø10 cm) o `proplus` (PVC Ø7 cm, se ve al 70 %) |
| `data-frente` / `data-reverso` | — | Cara de cada lado. Sin reverso, repite el frente |
| `data-titulo` / `data-subtitulo` | Nombre del modelo / «Arrastra para girar» | Textos bajo el módulo. `data-titulo=""` los quita |
| `data-controles` | `si` | `no` oculta los botones |
| `data-velocidad` | `40` | Grados por segundo |
| `data-inicio` | `20` | Ángulo inicial |

## Personalización
| Variable | Por defecto | Qué controla |
|---|---|---|
| `--m3d-diametro` | `min(68vw, 320px)` | Tamaño del Pro en pantalla (el Pro Plus usa `min(48vw, 224px)`) |
| `--m3d-texto` / `--m3d-fuente` | `#e9ecef` / `system-ui` | Título y botones |
| `--m3d-fondo-1` / `--m3d-fondo-2` | `#2a2d33` / `#0d0e11` | Fondo de estudio (clase `.m3d-estudio`) |

**Desde JavaScript:** `Modulo3D.montar(elemento, opciones)` devuelve `{ setCaras(frente, reverso), girar(si), frente(), reverso(), angulo(grados), detener() }`. Los módulos montados solos quedan en `elemento.m3d`.

## Uso en un video (HyperFrames)
Pon `data-controles="no"` y `data-titulo=""`. Desde la línea de tiempo, usa `el.m3d.girar(false)` y luego `el.m3d.angulo(…)` para mostrar cada cara en el momento justo.

## Notas
- Para una página pública, usa marcas ficticias o diseños con permiso del cliente (regla de `cc-render-modulos`).
- Si después se necesita refracción real del acrílico, el siguiente paso es Three.js (ver la skill `cc-render-modulos`).
