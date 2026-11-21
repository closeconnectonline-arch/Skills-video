# Dj carrusel

Galería de fotos en tarjetas verticales apiladas sobre fondo negro, con un titular al centro.

- **Entrada:** las tarjetas salen apiladas y se abren en abanico con efecto resorte (la del frente primero).
- **Hover:** la tarjeta pasa de gris a color, las de su derecha se recorren y el titular se vuelve transparente al centro.
- **Clic:** a la derecha de la tarjeta se despliega un panel con número, foto completa, título, descripción y datos. Las tarjetas siguientes se recorren y todo se recentra.
- **Cerrar / navegar:** ✕, Esc, clic fuera o en la misma tarjeta · botones Anterior/Siguiente o flechas ← →.
- Funciona con **3 o más fotos** y se escala solo en pantallas chicas.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | `FeyCards` de Aceternity Labs (React + Motion), reconstruido en HTML/CSS/JS sin librerías |
| Prefijo de clases | `.djc`, `.djc__*` |
| Colores por defecto | Fondo `#000000`, texto `#ffffff`, panel `#0b0b0c` |
| Fuente | `system-ui` (cámbiala con `--djc-fuente`) |

## Archivos
```
dj-carrusel/
├── motor/
│   ├── dj-carrusel.css      ← estilos y animaciones
│   └── dj-carrusel.js       ← lógica (crea tarjetas, hover, panel, teclado)
├── plantilla/
│   ├── index.html           ← página base con relleno: [EDITAR] titular, indicación y fotos
│   └── img/                 ← imágenes de relleno foto-01 … foto-06
├── ejemplo-untitled/
│   └── index.html           ← la plantilla con las fotos de la sesión Untitled
└── herramientas/
    └── preparar-imagenes.py ← convierte una foto en las 3 versiones que usa el carrusel
```

## Cómo usarlo
1. Copia `plantilla/` (y `motor/`, si lo usarás fuera del repositorio).
2. Prepara cada foto:
   ```
   python3 herramientas/preparar-imagenes.py MI_FOTO.jpg foto-01 --centro 0.45 --salida mi-pagina/img
   ```
   `--centro` es dónde está el sujeto en la foto (0 = izquierda, 1 = derecha). Genera `foto-01.jpg` (tarjeta a color, 480×1440), `foto-01-idle.jpg` (tarjeta en gris) y `foto-01-completa.jpg` (para el panel).
3. En `index.html`, llena el bloque de datos:
   ```json
   {
     "titulo": "Título",
     "descripcion": "Texto del panel",
     "imagen": "img/foto-02.jpg",
     "idle": "img/foto-02-idle.jpg",
     "completa": "img/foto-02-completa.jpg",
     "datos": { "Archivo": "…", "Escena": "…" }
   }
   ```
   - La **primera** foto es la de fondo y la **última** la del frente; esas dos no usan `idle` (siempre se ven a color).
   - Sin `idle`, una tarjeta tampoco cambia de gris a color.
   - En `datos` puedes poner las filas que quieras (etiqueta → valor).
4. Cambia el titular en las **dos** líneas `<h1>`.

## Personalización
**Variables CSS** (en la página, sobre `.djc`):

| Variable | Por defecto | Qué controla |
|---|---|---|
| `--djc-fondo` | `#000000` | Fondo de la sección |
| `--djc-texto` / `--djc-texto-suave` | `#fff` / 60% | Textos |
| `--djc-panel` / `--djc-borde` | `#0b0b0c` / 10% blanco | Panel de información |
| `--djc-fuente` | `system-ui` | Tipografía |
| `--djc-card-w` / `--djc-card-h` | `160px` / `480px` | Tamaño de tarjeta (si cambias el ancho, cambia también `CARD_W` en el motor) |
| `--djc-swap` | `0.5s` | Velocidad del cambio gris → color |
| `--djc-spring` / `--djc-spring-dur` | resorte `bounce .2` | Curva de los movimientos |

**Atributos** en `<section class="djc" data-dj-carrusel>`:

| Atributo | Por defecto | Qué controla |
|---|---|---|
| `data-espaciado` | `32` | Separación entre tarjetas (px) |
| `data-desplazamiento` | `60` | Cuánto se recorren al pasar el mouse (px) |
| `data-panel` | `304` | Ancho del panel (px) |
| `data-escalonado` | `0.2` | Retraso entre tarjetas al entrar (s) |

**Desde JavaScript:** la sección emite el evento `djc:cambio` (`detail.abierta`, `detail.foto`) al abrir o cerrar, y `DjCarrusel.iniciar(elemento, fotos)` permite crearlo con datos propios.

## Uso en un video (HyperFrames)
Copia el marcado y el motor en la composición. Para el render, en vez del mouse, abre las tarjetas en secuencia desde la línea de tiempo: el motor devuelve `{ abrir(i), cerrar() }` al llamar `DjCarrusel.iniciar(...)` a mano (quita `data-dj-carrusel` para que no se inicie solo).

## Notas
- Colores y tipografía de marca siguen `[pendiente]` en `marca/`; cuando estén listos, pásalos a las variables `--djc-*`.
- Componente de origen: [`librerias/tarjetas/01-panel-fey`](../../../librerias/tarjetas/01-panel-fey/).
