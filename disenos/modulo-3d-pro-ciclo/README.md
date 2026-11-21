# Módulo 3D Pro con base · ciclo

El [Módulo 3D Pro con base](../modulo-3d-pro-con-base/) con un **ciclo de diseños**: cada vez que una cara queda de espaldas cambia al siguiente diseño de la lista. Así, cada vez que el módulo muestra una cara es un diseño nuevo; al terminar la lista, el ciclo vuelve a empezar.

- **Orden:** frente = diseño 1, reverso = diseño 2, luego 3, 4… El cambio ocurre de espaldas, así que nunca se ve.
- **Contador:** abajo del título dice qué diseño se ve («Diseño 4 de 10»).
- **Arrastrar:** si el usuario gira el módulo con el dedo, el ciclo sigue funcionando en cualquier sentido.
- **Precarga:** todas las imágenes se cargan al inicio para que no haya parpadeos.
- Todo lo demás es igual que el diseño con base (medidas, encaje, luz y sombras).

| Dato | Valor |
|---|---|
| Versión | v1 |
| Origen | Derivado de [`modulo-3d-pro-con-base`](../modulo-3d-pro-con-base/) v1 |
| Plantilla | Trae los 10 diseños de Close Connect como ejemplo |
| Rendimiento | ~56 cuadros por segundo con el procesador limitado a 4× |

## Archivos
```
modulo-3d-pro-ciclo/
├── motor/
│   ├── modulo-3d.css        ← estilos + contador
│   └── modulo-3d.js         ← módulo + base + ciclo de caras
├── plantilla/
│   ├── index.html           ← [EDITAR] data-caras
│   └── caras/               ← cara-01 … cara-10 (diseños de ejemplo)
└── herramientas/
    └── preparar-cara.py     ← v2: detecta el círculo y quita fondo y aro gris
```

## Cómo usarlo
1. Copia `plantilla/` a una carpeta nueva.
2. Prepara cada diseño en orden:
   ```
   python3 herramientas/preparar-cara.py DISENO-1.png mi-carpeta/caras/cara-01.webp
   ```
3. En `index.html`, pon la lista en `data-caras` (mínimo 3; con 2 usa el diseño con base):
   ```html
   data-caras='["caras/cara-01.webp","caras/cara-02.webp","caras/cara-03.webp"]'
   ```

**Desde JavaScript:** `el.m3d.lista()` devuelve la lista y `el.m3d.estadoCiclo()` qué diseño hay en cada cara. `Modulo3D.montar(el, { caras: [...] })` crea un módulo con su propia lista.

## Notas
- Con un número par de diseños, el frente siempre muestra los nones (1, 3, 5…) y el reverso los pares. Con un número impar se van alternando en cada vuelta.
- La velocidad (`data-velocidad`, 34 °/s) marca cada cuánto aparece un diseño nuevo: uno cada ~5 segundos.
