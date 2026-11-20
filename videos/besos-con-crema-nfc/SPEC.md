# SPEC — Besos con Crema · Módulo PRO NFC (Close Connect)

GOAL:    Que quien lo vea entienda en 19 s que el módulo de Close Connect se acerca al celular, abre la landing del negocio y cada botón lleva a su red, y que quiera uno para su negocio.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16, Reels / TikTok), 30 fps, sin audio (pedido del cliente).
TIME:    19 s x 30 = 570 frames.

LOOK:
- Fondo de estudio en negro obsidiana: pared #060608 → #0c0c10, con luz principal suave arriba a la izquierda (radial #1c1b22 al 100 %, elipse de 60 x 40 %),
  piso continuo (curva infinita) desde y = 1150 con una mancha de luz de 5 % blanco bajo el módulo, viñeta del 55 % en las orillas y grano del 7 % (overlay).
- Texto: blanco #f4f2f7; un solo acento, el violeta de Close Connect #9b7bff, en una palabra por frase.
- Títulos: Outfit 700, de 120 a 220 px, tracking -2 %; subtítulos Outfit 400, 40 px, color #b9b4c6.
- Materiales: módulo de acrílico de 3 mm (canto translúcido rosado con borde de luz del lado derecho) y vinil mate (el arte real del cliente);
  base de acrílico transparente con bordes brillantes al 35 %; iPhone del mockup del cliente con pantalla real (landing reconstruida de sus archivos).

OBJECTS:
- Módulo PRO Besos con Crema: disco de 520 px (10 cm), girado -16° en Y, con el canto en 3D (9 capas de 2 px) y su base de acrílico.
- 5 módulos Close Connect de 7 cm (0.7 x el diámetro): discos morados con aro interior, ícono NFC, logo CC y "ACERCA TU CELULAR",
  acostados sobre el piso en perspectiva (rotateX 64–74°), tres desenfocados al fondo o en primer plano para dar profundidad.
- iPhone (frame morado del mockup), 400 px de ancho en el plano general; landing con barra de estado, logo, descripción, 3 botones neumórficos y el footer de Close Connect.
- Dedo: punto blanco al 55 % de 40 px lógicos con sombra; el botón se hunde (sombra interior) y hace una onda rosa #ec7fa3.
- Insignias de cada red: círculo de 132 px con el color de la red (WhatsApp #25D366, Instagram con su degradado, Facebook #1877F2) y el glifo de la landing en blanco.

MOTION:
- Llegadas: expo.out de 0.6 a 0.9 s; cámara: power2.inOut de 0.9 a 1.1 s; salidas: power3.in, 40 % más cortas que la entrada.
- Insignias: back.out(1.6) en escala (rebote del 0.7), nunca en opacidad. El tap dura 0.12 s hacia abajo y 0.18 s de regreso.
- Palabras de título: desenfoque de 8 px a 0 y opacidad de 0 a 1 en 0.16 s, con 0.07 s entre palabras; sin desplazamiento.

SHOTS:
1. 0.0–2.6  Hero del módulo (cámara a 1.3x). Un barrido de luz cruza el acrílico. Texto: "Módulo PRO" / "Acrílico 3 mm · vinil · 10 cm".
2. 2.6–4.4  La cámara abre a plano general y el iPhone entra de la derecha con desenfoque de movimiento, inclinado -8°, como escaneando. Ondas NFC salen del módulo al teléfono. Texto: "NFC" / "Acerca tu celular. Sin apps."
3. 4.4–6.6  Se enciende la pantalla, cae la notificación de la etiqueta NFC, el dedo la toca, aparece el loader de Close Connect y luego la landing de Besos con Crema.
4. 6.6–7.6  La cámara empuja hacia el teléfono (1.4x), que se endereza; el módulo se desenfoca y sale por la izquierda.
5. 7.8–13.6 Tres taps de 2 s cada uno: WhatsApp, Instagram y Facebook. El botón se hunde, sale la onda, la insignia de la red brota a la derecha con su etiqueta y abajo en la pantalla aparece "Abriendo …".
6. 13.8–16.3 La cámara regresa al plano general. Texto: "Diseño a tu medida" / "Tu marca. Tu landing. Tu módulo."
7. 16.3–19.0 Cierre: ondas NFC suaves y la frase "Un toque y listo." fija hasta el final.
Sello: logo de Close Connect fijo arriba a la izquierda (190 px), fundido con la pared (screen al 38 %) y con el grano encima, todo el video.

BANNED: vacío negro con elementos flotando al centro sin piso; glow, bloom, lens flares, partículas; tarjetas de vidrio; títulos que se mueven
después de llegar; todo entrando con fade + slide-up; anillos de clic decorativos fuera del tap real.
(El logo fijo en una esquina va a petición expresa del cliente).

QA: 0.0 (hero sin negro), 3.6 (teléfono junto al módulo + NFC), 5.3 (notificación), 6.4 (landing completa), 8.2 / 10.2 / 12.2 (cada tap con insignia),
15.0 (Diseño a tu medida), 18.5 (cierre). La landing debe leerse a 360 px de ancho en los taps.
