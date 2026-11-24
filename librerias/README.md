# Librerías de componentes

Componentes web reutilizables (botones, tooltips, tarjetas, etc.) para landing pages y videos con HyperFrames.

Cada componente tiene un `index.html`: ábrelo en el navegador para ver la demo.
Dónde conseguir más recursos: [RECURSOS.md](RECURSOS.md).

## Cómo está organizado

```
librerias/
├── _plantilla/      ← copia esta carpeta para crear un componente nuevo
├── botones/
├── tooltips/
├── tarjetas/
├── formularios/
├── animaciones/
├── transiciones/
└── iconos/
```

Cada componente vive en su propia carpeta con un número y un nombre corto:

```
botones/03-flecha-expandible/
├── README.md     ← qué es, clases, colores y estado
├── style.css     ← el CSS
└── index.html    ← el HTML (opcional, pero necesario para usarlo)
```

## Cómo agregar un componente

1. Copia `_plantilla/` dentro de la categoría que corresponda.
2. Renómbrala con el siguiente número: `08-nombre-corto` (minúsculas, guiones, sin acentos ni espacios).
3. Pega el CSS en `style.css` y el HTML en `index.html` (si solo tienes el CSS, Claude puede reconstruir el HTML).
4. Llena el `README.md` del componente.
5. Agrégalo a la tabla del catálogo de abajo.

Si la categoría no existe, crea la carpeta nueva y añádela al árbol de arriba.

> También puedes pedírselo a Claude: *"agrega este botón a la librería"* y pegar el código.

## Catálogo

### Botones
| # | Componente | Descripción | HTML |
|---|---|---|---|
| 01 | [Espaciado hover](botones/01-espaciado-hover/) | Píldora blanca que se vuelve morada y separa las letras | ✅ |
| 02 | [Marcador con ícono](botones/02-marcador-icono/) | Botón negro con ícono degradado que se expande | ✅ |
| 03 | [Flecha expandible](botones/03-flecha-expandible/) | Botón morado con flecha que se expande | ✅ |
| 04 | [Marquesina en movimiento](botones/04-marquesina-movimiento/) | Texto que se desplaza en bucle al pasar el mouse | ✅ |
| 05 | [Tres redes sociales](botones/05-tres-redes-sociales/) | Íconos circulares con etiqueta flotante | ✅ |
| 06 | [Cuatro redes efecto vidrio](botones/06-cuatro-redes-glass/) | Íconos glassmorphism con borde brillante | ✅ |
| 07 | [Selector de tres opciones](botones/07-selector-tres-opciones/) | Radio buttons con barra luminosa deslizante | ✅ |

### Tooltips
| # | Componente | Descripción | HTML |
|---|---|---|---|
| 01 | [Pop-up de red social](tooltips/01-popup-red-social/) | Ícono 3D que muestra tarjeta de perfil | ✅ |
| 02 | [Redes estilo dibujo a mano](tooltips/02-doodle-redes-sociales/) | Íconos pastel sobre hoja de cuaderno | ✅ |
| 03 | [Avatares animados](tooltips/03-avatares-animados/) | 6 fotos circulares con tooltip que gira siguiendo el mouse | ✅ |

### Tarjetas
| # | Componente | Descripción | HTML |
|---|---|---|---|
| 01 | [Panel de tarjetas desplegables](tarjetas/01-panel-fey/) | Tarjetas apiladas que pasan a color y despliegan un panel con la info de cada foto | ✅ |

### Fondos
| # | Componente | Descripción | HTML |
|---|---|---|---|
| 01 | [Puntos brillantes](fondos/01-puntos-brillantes/) | Rejilla de puntos tenues que se iluminan a su ritmo con halo suave; solo el fondo (sin logo ni texto) | ✅ |

### Formularios · Animaciones · Transiciones · Íconos
_Sin componentes todavía._
