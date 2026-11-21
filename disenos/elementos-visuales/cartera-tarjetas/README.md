# Cartera de tarjetas

Cartera verde con hasta 3 tarjetas de banco asomando del bolsillo y el balance total oculto con asteriscos.

- **Entrada:** las tarjetas caen dentro de la cartera una tras otra.
- **Hover / primer toque:** la cartera sube, las tarjetas salen en abanico y el balance total aparece (el ojo se abre).
- **Hover / toque en una tarjeta:** pasa al frente, crece y muestra el número completo.
- **Cerrar (táctil):** toque en el bolsillo o fuera de la cartera.
- El **balance total se calcula solo** sumando el saldo de cada tarjeta.

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Diseño de byllzz en Uiverse.io (solo CSS), reconstruido con HTML, balance automático y soporte táctil |
| Prefijo de clases | `.cartera`, `.cartera__*` |
| Colores por defecto | Cartera `#1e341e`, bolsillo `#2c4a2c`, balance `#a7c59e` |
| Fuente | `system-ui` (cámbiala con `--ct-fuente`) |

## Archivos
```
cartera-tarjetas/
├── motor/
│   ├── cartera-tarjetas.css   ← estilos, animaciones y estados
│   └── cartera-tarjetas.js    ← crea tarjetas, bolsillo, balance y toques
└── plantilla/
    └── index.html             ← página base con datos de relleno: [EDITAR] tarjetas
```

## Cómo usarlo
1. Copia `plantilla/` (y `motor/`, si lo usarás fuera del repositorio).
2. En `index.html`, llena el bloque JSON:
   ```json
   {
     "moneda": "MXN",
     "idioma": "es-MX",
     "tituloBalance": "Balance total",
     "tarjetas": [
       { "nombre": "Banco", "fondo": "#635bff", "texto": "#ffffff",
         "titular": "Nombre", "numero": "0000 0000 0000 1111", "saldo": 1000 }
     ]
   }
   ```
   - Máximo **3 tarjetas**: la 1ª queda atrás y la 3ª al frente.
   - Si el `fondo` es claro (p. ej. blanco), el chip y las etiquetas se oscurecen solos.
   - Para un balance fijo en vez de la suma, agrega `"balance": 12345`.
   - Sin `saldo` en una tarjeta, no se muestra su saldo ni cuenta para el total.
3. Cambia o quita el texto de abajo con `data-indicacion`.

## Personalización
**Variables CSS** (en la página, sobre `.cartera`):

| Variable | Por defecto | Qué controla |
|---|---|---|
| `--ct-cartera` | `#1e341e` | Fondo interior de la cartera |
| `--ct-bolsillo` / `--ct-costura` | `#2c4a2c` / `#4d6f47` | Bolsillo y su costura |
| `--ct-balance-oculto` / `--ct-balance` | `#839e7b` / `#a7c59e` | Asteriscos y balance visible |
| `--ct-ojo` | `#3be60b` | Icono del ojo |
| `--ct-indicacion` | `#003087` | Texto bajo la cartera |
| `--ct-fuente` | `system-ui` | Tipografía |

**Atributos** en el contenedor `[data-cartera-tarjetas]`:

| Atributo | Por defecto | Qué controla |
|---|---|---|
| `data-moneda` | `MXN` | Moneda (si el JSON no la trae) |
| `data-idioma` | `es-MX` | Formato de números |
| `data-indicacion` | — | Texto bajo la cartera (sin él, no se muestra) |

**Desde JavaScript:** `CarteraTarjetas.iniciar(elemento, datos)` crea la cartera con datos propios y devuelve `{ abrir(), cerrar(), mostrar(i), total }`.

## Uso en un video (HyperFrames)
Quita `data-cartera-tarjetas` para que no se inicie solo, llama `CarteraTarjetas.iniciar(...)` a mano y controla los estados desde la línea de tiempo: `abrir()` para sacar las tarjetas y el balance, `mostrar(0|1|2)` para revelar una tarjeta y `cerrar()` para guardarlas.

## Notas
- Colores y tipografía de marca siguen `[pendiente]` en `marca/`; cuando estén listos, pásalos a las variables `--ct-*`.
- Los números y saldos de la plantilla son de relleno. No pongas números de tarjeta reales: el repositorio es público.
