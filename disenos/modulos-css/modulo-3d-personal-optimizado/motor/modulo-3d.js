/* Módulo 3D · motor optimizado v3 (derivado de Módulo 3D Estándar v1; mismo aspecto y misma API)
   v3: data-cuadros limita los cuadros por segundo del giro automático (p. ej. 30) a un ritmo fijo y
   reparte los cuadros entre los módulos de la página (cada uno dibuja en su turno), para que varios
   módulos juntos no saturen el celular. Al arrastrar, con inercia o al ir a un ángulo vuelve a 60.
   data-luz-reparto (p. ej. 3) reparte el sombreado del canto y de la base entre varios cuadros: en cada
   cuadro se ilumina una parte de los segmentos, siempre con el ángulo actual; al detenerse quedan todos al día.
   Además las transparencias del sombreado van a 2 decimales y el reflejo de las caras se mueve en pasos de 1 %,
   así muchos segmentos no se repintan cuando el cambio no se notaría.
   Fuera de pantalla el módulo además oculta sus piezas (clase m3d--fuera): el navegador deja de
   cargar con sus capas 3D mientras otros módulos giran. El escenario conserva su tamaño.
   Sin data-cuadros ni data-luz-reparto el giro y la luz se calculan igual que en v2.
   Optimizaciones v2: pausa real fuera de pantalla y con la pestaña oculta (sigue donde iba),
   canto adaptable al tamaño en pantalla, imágenes del ciclo bajo demanda (actual + siguiente)
   y sombras pre-dibujadas en motor/texturas/ (sin filter: blur en cada cuadro).
   API nueva: pausar(), reanudar(). detener() ahora también suelta sus escuchas.
   Se monta solo en todo elemento con [data-modulo-3d]. No edites este archivo por proyecto.

   Atributos:
     data-modelo     "pro" (acrílico Ø10 × 0.5 cm) | "proplus" (PVC Ø7 × 0.2 cm) |
                     "personal" (tarjeta horizontal 8.5 × 5.4 × 0.2 cm de acrílico, esquinas de 3 mm) |
                     "estandar" (tarjeta vertical 5.4 × 8.5 × 0.2 cm, base de MDF)
     data-frente     imagen redonda del vinil del frente
     data-reverso    imagen redonda del vinil del reverso (sin ella, repite el frente)
     data-titulo     línea principal bajo el módulo (vacío = sin título)
     data-subtitulo  línea secundaria
     data-controles  "no" para ocultar los botones
     data-velocidad  grados por segundo (40)
     data-inicio     ángulo inicial (20)
     data-luz-reparto en cuántos cuadros se reparte el sombreado del canto y la base (1 = todo cada cuadro; 3 recomendado)
     data-cuadros    cuadros por segundo del giro automático (60 = sin límite; 30 recomendado con varios módulos)
     data-grosor-mm  grosor real del módulo en mm (por defecto el del modelo)
     data-diametro-cm diámetro real del módulo (10 en Pro, 7 en Pro Plus)
     data-inclinacion grados de inclinación de cámara (-16 con base, -10 sin base)
     data-flotar     px de flotación (0 con base, 10 sin base)
     data-caras      lista JSON de imágenes: cada vez que una cara se oculta, cambia a la siguiente
   Base de MDF (data-base="mdf"), medidas en cm:
     data-mdf-largo (5)  data-mdf-fondo (2)  data-mdf-alto (1.2)  data-mdf-ranura (0.2)  data-mdf-profundidad (0.6)
   Base de acrílico transparente (data-base="acrilico"), medidas en cm:
     data-base-largo (8)  data-base-ancho (2.5)  data-base-grueso (0.3)  data-base-radio (0.4)
     data-ranura-largo (3)  data-ranura-ancho (0.3)
*/
(function () {
  "use strict";

  var MODELOS = {
    pro:     { grosor: 0.05,   canto: "acrilico", titulo: "Módulo Pro · Acrílico transparente Ø10 cm" },
    proplus: { grosor: 0.0286, canto: "pvc",      titulo: "Módulo Pro Plus · PVC Ø7 cm" },
    personal: { forma: "tarjeta", anchoCm: 8.5, altoCm: 5.4, grosorMm: 2, radioMm: 3, canto: "acrilico",
                titulo: "Módulo Personal · tarjeta 8.5 × 5.4 cm" },
    estandar: { forma: "tarjeta", anchoCm: 5.4, altoCm: 8.5, grosorMm: 2, radioMm: 3, canto: "acrilico",
                titulo: "Módulo Estándar · tarjeta 5.4 × 8.5 cm con base de MDF" }
  };

  var LUZ = norm([-0.45, -0.65, 0.62]);              // luz de arriba a la izquierda
  var MEDIO = norm([LUZ[0], LUZ[1], LUZ[2] + 1]);    // vector medio luz-ojo (especular)
  var TURNOS = 0;                                     // v3: reparte los cuadros entre módulos
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function punto(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  // rota un vector igual que CSS: rotateX(rx) rotateY(ry)
  function rotar(v, rx, ry) {
    var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    var x1 = v[0] * cy + v[2] * sy, y1 = v[1], z1 = -v[0] * sy + v[2] * cy;
    return [x1, y1 * cx - z1 * sx, y1 * sx + z1 * cx];
  }
  function url(u) { return u ? 'url("' + String(u).replace(/"/g, '\\"') + '")' : "none"; }

  function montar(raiz, opciones) {
    opciones = opciones || {};
    var dato = function (k, d) { return opciones[k] != null ? opciones[k] : (raiz.getAttribute("data-" + k) || d); };
    var modelo = MODELOS[dato("modelo", "pro")] || MODELOS.pro;
    var conBase = dato("base", "") === "acrilico";
    var conMDF = dato("base", "") === "mdf";
    var esTarjeta = modelo.forma === "tarjeta";
    var diamCm = esTarjeta ? parseFloat(dato("ancho-cm", modelo.anchoCm))
                           : parseFloat(dato("diametro-cm", modelo === MODELOS.proplus ? 7 : 10));
    var altoCm = esTarjeta ? parseFloat(dato("alto-cm", modelo.altoCm)) : diamCm;
    var radioMm = esTarjeta ? parseFloat(dato("radio-mm", modelo.radioMm)) : 0;
    if (esTarjeta && !dato("grosor-mm", "")) raiz.setAttribute("data-grosor-mm", modelo.grosorMm);
    var grosorMm = dato("grosor-mm", esTarjeta ? String(modelo.grosorMm) : "");
    var cfg = {
      grosor: grosorMm ? parseFloat(grosorMm) / (diamCm * 10) : modelo.grosor,
      canto: dato("canto", modelo.canto),
      segmentos: 64,
      velocidad: parseFloat(dato("velocidad", 40)),
      inclinacion: parseFloat(dato("inclinacion", conBase ? -16 : -10)),
      flotar: parseFloat(dato("flotar", conBase ? 0 : 10)),
      cuadros: Math.max(1, Math.min(60, parseFloat(dato("cuadros", 60)) || 60)),
      reparto: Math.max(1, Math.min(8, parseInt(dato("luz-reparto", 1), 10) || 1))
    };
    // Base de acrílico (medidas en cm)
    var base = {
      largo: parseFloat(dato("base-largo", 8)),
      ancho: parseFloat(dato("base-ancho", 2.5)),
      grueso: parseFloat(dato("base-grueso", 0.3)),
      radio: parseFloat(dato("base-radio", 0.4)),
      ranuraLargo: parseFloat(dato("ranura-largo", 3)),
      ranuraAncho: parseFloat(dato("ranura-ancho", 0.3))
    };
    var titulo = dato("titulo", modelo.titulo);
    var subtitulo = dato("subtitulo", "Arrastra para girar");

    raiz.classList.add("m3d");
    if (conBase) raiz.classList.add("m3d--con-base");
    if (esTarjeta) raiz.classList.add("m3d--tarjeta");
    if (conMDF) raiz.classList.add("m3d--con-mdf");
    raiz.innerHTML =
      '<div class="m3d__escena" aria-label="Módulo girando en 3D. Arrastra para girarlo.">' +
        '<div class="m3d__sombra"></div>' +
        '<div class="m3d__modulo">' +
          '<div class="m3d__cara m3d__cara--frente"><div class="m3d__luz"></div><div class="m3d__reflejo"></div></div>' +
          '<div class="m3d__cara m3d__cara--reverso"><div class="m3d__luz"></div><div class="m3d__reflejo"></div></div>' +
        "</div>" +
      "</div>" +
      (titulo ? '<div class="m3d__titulo"><strong></strong><span></span></div>' : "") +
      (dato("controles", "si") !== "no"
        ? '<div class="m3d__controles">' +
            '<button type="button" data-accion="girar" aria-pressed="true">Girando</button>' +
            '<button type="button" data-accion="frente">Frente</button>' +
            '<button type="button" data-accion="reverso">Reverso</button>' +
          "</div>"
        : "");
    if (titulo) {
      raiz.querySelector(".m3d__titulo strong").textContent = titulo;
      raiz.querySelector(".m3d__titulo span").textContent = subtitulo;
    }

    var escena = raiz.querySelector(".m3d__escena");
    var modulo = raiz.querySelector(".m3d__modulo");
    var sombra = raiz.querySelector(".m3d__sombra");
    var frente = raiz.querySelector(".m3d__cara--frente");
    var reverso = raiz.querySelector(".m3d__cara--reverso");
    var caras = [
      { el: frente, n: [0, 0, 1], luz: frente.querySelector(".m3d__luz"), ref: frente.querySelector(".m3d__reflejo") },
      { el: reverso, n: [0, 0, -1], luz: reverso.querySelector(".m3d__luz"), ref: reverso.querySelector(".m3d__reflejo") }
    ];
    var colorFrente = "rgba(245,245,245,.95)", colorReverso = "rgba(10,10,10,.95)";

    function setCara(lado, src) {
      if (lado === "frente") {
        frente.style.backgroundImage = url(src);
        muestrearColor(src, function (c) { colorFrente = c; ultimaLuz = null; });
      } else {
        reverso.style.backgroundImage = url(src);
        muestrearColor(src, function (c) { colorReverso = c; ultimaLuz = null; });
      }
    }
    function setCaras(f, r) { setCara("frente", f); setCara("reverso", r || f); }

    /* ---------- Ciclo de caras ----------
       La cara que se oculta (de espaldas a la cámara) cambia a la siguiente imagen,
       así cada vez que el módulo muestra una cara, es un diseño nuevo. */
    var lista = [];
    try { lista = JSON.parse(dato("caras", "[]")) || []; } catch (e) { lista = []; }
    if (opciones.caras) lista = opciones.caras;
    var ciclo = { siguiente: 2, idxFrente: 0, idxReverso: 1, frenteOculto: null, reversoOculto: null };
    // v2: solo se precarga lo que viene (antes se descargaban todas las imágenes al montar)
    var precargadas = {};
    function precargar(i) {
      if (!lista.length) return;
      var src = lista[i % lista.length];
      if (!src || precargadas[src]) return;
      precargadas[src] = true; var im = new Image(); im.decoding = "async"; im.src = src;
    }
    precargar(2);
    var etiqueta = null;
    function marcarDiseno(z) {
      if (!lista.length || !etiqueta) return;
      var i = (z >= 0 ? ciclo.idxFrente : ciclo.idxReverso) % lista.length;
      var texto = "Diseño " + (i + 1) + " de " + lista.length;
      if (etiqueta.textContent !== texto) etiqueta.textContent = texto;
    }
    function revisarCiclo(z) {           // z: hacia dónde mira el frente (+1 cámara, −1 espaldas)
      if (lista.length < 3) return;
      var fOculto = z < -0.2, fVisible = z > 0.2;
      if (ciclo.frenteOculto === null) { ciclo.frenteOculto = fOculto; ciclo.reversoOculto = fVisible; return; }
      if (fOculto && !ciclo.frenteOculto) {
        ciclo.idxFrente = ciclo.siguiente++;
        setCara("frente", lista[ciclo.idxFrente % lista.length]);
        precargar(ciclo.siguiente);
      }
      if (fVisible && !ciclo.reversoOculto) {
        ciclo.idxReverso = ciclo.siguiente++;
        setCara("reverso", lista[ciclo.idxReverso % lista.length]);
        precargar(ciclo.siguiente);
      }
      if (fOculto) ciclo.frenteOculto = true; else if (fVisible) ciclo.frenteOculto = false;
      if (fVisible) ciclo.reversoOculto = true; else if (fOculto) ciclo.reversoOculto = false;
    }
    // color de la orilla del vinil (se ve en el canto)
    function muestrearColor(src, listo) {
      if (!src) return;
      var img = new Image();
      img.onload = function () {
        try {
          var c = document.createElement("canvas"); c.width = c.height = 40;
          var g = c.getContext("2d"); g.drawImage(img, 0, 0, 40, 40);
          var p = g.getImageData(20, 3, 1, 1).data;
          listo("rgba(" + p[0] + "," + p[1] + "," + p[2] + ",.95)");
        } catch (e) { /* imagen de otro dominio: se queda el color por defecto */ }
      };
      img.src = src;
    }

    var D, T, segs = [];
    function construir() {
      segs.forEach(function (s) { s.el.remove(); }); segs = [];
      D = modulo.offsetWidth;
      T = Math.max(esTarjeta ? 3 : (cfg.canto === "pvc" ? 3 : 6), D * cfg.grosor);
      frente.style.transform = "translateZ(" + T / 2 + "px)";
      reverso.style.transform = "rotateY(180deg) translateZ(" + T / 2 + "px)";
      if (esTarjeta) {
        // Tarjeta: alto según proporción real y canto alrededor del rectángulo redondeado
        var Hh = D * altoCm / diamCm, rr = Math.max(1, D * (radioMm / 10) / diamCm);
        modulo.style.height = Hh + "px";
        frente.style.borderRadius = reverso.style.borderRadius = rr + "px";
        var piezasCanto = [
          { x: 0, y: -Hh / 2, a: -Math.PI / 2, l: D - 2 * rr },
          { x: 0, y: Hh / 2, a: Math.PI / 2, l: D - 2 * rr },
          { x: D / 2, y: 0, a: 0, l: Hh - 2 * rr },
          { x: -D / 2, y: 0, a: Math.PI, l: Hh - 2 * rr }
        ];
        [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]].forEach(function (c) {
          var cx = c[0] * (D / 2 - rr), cy = c[1] * (Hh / 2 - rr), n = 5;
          for (var j = 0; j < n; j++) {
            var aa = (c[2] + (j + 0.5) * 90 / n) * Math.PI / 180;
            piezasCanto.push({ x: cx + (rr - 0.3) * Math.cos(aa), y: cy + (rr - 0.3) * Math.sin(aa), a: aa, l: rr * (Math.PI / 2) / n + 0.8 });
          }
        });
        piezasCanto.forEach(function (q) {
          var el = document.createElement("div");
          el.className = "m3d__canto";
          el.style.width = T + "px";
          el.style.height = (q.l + 0.6) + "px";
          el.style.marginLeft = -T / 2 + "px";
          el.style.marginTop = -(q.l + 0.6) / 2 + "px";
          el.style.transform = "translate3d(" + q.x + "px," + q.y + "px,0) rotateZ(" + q.a + "rad) rotateY(90deg)";
          modulo.appendChild(el);
          segs.push({ el: el, nx: Math.cos(q.a), ny: Math.sin(q.a), ultimo: "" });
        });
      } else {
      // v2: canto adaptable; con el módulo chico en pantalla no se distinguen 64 segmentos de 32
      var N = parseInt(dato("segmentos", ""), 10) || (D < 150 ? 40 : D < 200 ? 52 : cfg.segmentos);
      var R = D / 2 - 0.5, largo = (2 * Math.PI * R) / N + 1.2;
      for (var i = 0; i < N; i++) {
        var a = (i / N) * 2 * Math.PI, el = document.createElement("div");
        el.className = "m3d__canto";
        el.style.width = T + "px";
        el.style.height = largo + "px";
        el.style.marginLeft = -T / 2 + "px";
        el.style.marginTop = -largo / 2 + "px";
        el.style.transform = "rotateZ(" + a + "rad) translateX(" + R + "px) rotateY(90deg)";
        modulo.appendChild(el);
        segs.push({ el: el, nx: Math.cos(a), ny: Math.sin(a), ultimo: "" });
      }
      }
      if (conBase) construirBase();
      if (conMDF) construirMDF();
    }

    /* ---------- Base de MDF ----------
       Bloque de madera con una ranura a todo lo largo, al centro. La tarjeta entra hasta
       el fondo de la ranura; la base es opaca, así que lo que entra no se ve. */
    var mdf = {
      largo: parseFloat(dato("mdf-largo", 5)), fondo: parseFloat(dato("mdf-fondo", 2)),
      alto: parseFloat(dato("mdf-alto", 1.2)), ranura: parseFloat(dato("mdf-ranura", 0.2)),
      prof: parseFloat(dato("mdf-profundidad", 0.6))
    };
    var piezasMDF = [], infoMDF = null;
    function construirMDF() {
      piezasMDF.forEach(function (p) { p.el.remove(); }); piezasMDF = [];
      var k = D / diamCm, Hc = D * altoCm / diamCm;
      var L = mdf.largo * k, F = mdf.fondo * k, A = mdf.alto * k, s = mdf.ranura * k + 0.6, P = mdf.prof * k;
      var yT = Hc / 2 - P, yB = yT + A, yM = (yT + yB) / 2;
      var tira = (F - s) / 2, zt = s / 2 + tira / 2;
      infoMDF = { asomaMm: (altoCm - mdf.prof) * 10, holguraMm: (mdf.ranura * 10) - (grosorMm ? parseFloat(grosorMm) : 2) };
      function pieza(w, h, tf, n, tipo) {
        var el = document.createElement("div");
        el.className = "m3d__mdf m3d__mdf--" + tipo;
        el.style.width = w + "px"; el.style.height = h + "px";
        el.style.marginLeft = -w / 2 + "px"; el.style.marginTop = -h / 2 + "px";
        el.style.transform = tf;
        modulo.appendChild(el);
        piezasMDF.push({ el: el, n: n, tipo: tipo, ultimo: "" });
      }
      var t3 = function (x, y, z) { return "translate3d(" + x + "px," + y + "px," + z + "px) "; };
      // arriba: dos tiras a los lados de la ranura
      pieza(L, tira, t3(0, yT, zt) + "rotateX(90deg)", [0, -1, 0], "cara");
      pieza(L, tira, t3(0, yT, -zt) + "rotateX(90deg)", [0, -1, 0], "cara");
      // abajo
      pieza(L, F, t3(0, yB, 0) + "rotateX(-90deg)", [0, 1, 0], "cara");
      // frente y atrás
      pieza(L, A, t3(0, yM, F / 2), [0, 0, 1], "canto");
      pieza(L, A, t3(0, yM, -F / 2) + "rotateY(180deg)", [0, 0, -1], "canto");
      // extremos con la muesca de la ranura (forma de U)
      [[1, 90], [-1, -90]].forEach(function (e) {
        var x = e[0] * L / 2;
        pieza(tira, A, t3(x, yM, zt) + "rotateY(" + e[1] + "deg)", [e[0], 0, 0], "canto");
        pieza(tira, A, t3(x, yM, -zt) + "rotateY(" + e[1] + "deg)", [e[0], 0, 0], "canto");
        pieza(s, A - P, t3(x, (yT + P + yB) / 2, 0) + "rotateY(" + e[1] + "deg)", [e[0], 0, 0], "canto");
      });
      // paredes y fondo de la ranura (miran hacia adentro)
      pieza(L, P, t3(0, yT + P / 2, s / 2) + "rotateY(180deg)", [0, 0, -1], "ranura");
      pieza(L, P, t3(0, yT + P / 2, -s / 2), [0, 0, 1], "ranura");
      pieza(L, s, t3(0, yT + P, 0) + "rotateX(90deg)", [0, -1, 0], "ranura");
    }
    function iluminarMDF(rxr, ryr) {
      piezasMDF.forEach(function (p) {
        var n = rotar(p.n, rxr, ryr);
        var dif = Math.max(0, punto(n, LUZ));
        var spec = Math.pow(Math.max(0, punto(n, MEDIO)), 12);
        // MDF crudo: cara lisa café claro; canto cortado más oscuro y fibroso; ranura en sombra
        var base = p.tipo === "cara" ? [199, 163, 121] : p.tipo === "canto" ? [176, 138, 96] : [120, 92, 62];
        var f = (p.tipo === "ranura" ? 0.45 : 0.42) + 0.58 * dif;
        var c = base.map(function (v) { return Math.min(255, Math.round(v * f + 18 * spec)); });
        var col = "rgb(" + c.join(",") + ")";
        if (col !== p.ultimo) { p.el.style.backgroundColor = col; p.ultimo = col; }
      });
    }

    /* ---------- Base de acrílico transparente ----------
       Física: el módulo (radio R) entra en la ranura (largo Lr) hasta que su cuerda
       mide Lr. Profundidad = R − √(R² − (Lr/2)²). Se apoya en los dos extremos
       superiores de la ranura; las paredes de la ranura lo mantienen vertical. */
    var piezas = [], info = null;
    function construirBase() {
      piezas.forEach(function (p) { p.el.remove(); }); piezas = [];
      var k = D / diamCm;                             // px por cm
      var Rcm = diamCm / 2;
      var hundido = Rcm - Math.sqrt(Math.max(0, Rcm * Rcm - Math.pow(base.ranuraLargo / 2, 2)));
      info = { hundidoMm: hundido * 10, holguraMm: (base.grueso - hundido) * 10 };
      raiz.setAttribute("data-hundido-mm", info.hundidoMm.toFixed(2));

      var L = base.largo * k, W = base.ancho * k, t = base.grueso * k, r = Math.min(base.radio * k, W / 2);
      var sL = base.ranuraLargo * k, sW = base.ranuraAncho * k + 0.6; // 0.6 px: holgura visual
      var yTop = (Rcm - hundido) * k, yMid = yTop + t / 2, yBot = yTop + t;

      function pieza(w, h, tf, n, tipo, extra) {
        var el = document.createElement("div");
        el.className = "m3d__base m3d__base--" + tipo;
        el.style.width = w + "px"; el.style.height = h + "px";
        el.style.marginLeft = -w / 2 + "px"; el.style.marginTop = -h / 2 + "px";
        el.style.transform = tf;
        if (extra) extra(el);
        modulo.appendChild(el);
        var p = { el: el, n: n, tipo: tipo, ultimo: "" };
        piezas.push(p); return p;
      }
      // Cara grande con la ranura: 4 piezas (izquierda, derecha, delante y detrás de la ranura).
      // El fondo se reparte con background-position para que se vea como una sola placa.
      function cara(y, rot, n) {
        var lado = (L - sL) / 2, tira = (W - sW) / 2;
        var trozos = [
          { x: 0,        z: 0,             w: lado, h: W,    radio: r + "px 0 0 " + r + "px" },
          { x: L - lado, z: 0,             w: lado, h: W,    radio: "0 " + r + "px " + r + "px 0" },
          { x: lado,     z: 0,             w: sL,   h: tira, radio: "0" },
          { x: lado,     z: W - tira,      w: sL,   h: tira, radio: "0" }
        ];
        var grupo = [];
        trozos.forEach(function (q) {
          // centro del trozo respecto al centro de la placa (x → X, z → Z)
          var cx = q.x + q.w / 2 - L / 2, cz = q.z + q.h / 2 - W / 2;
          if (rot < 0) cz = -cz; // la cara de abajo está volteada
          var p = pieza(q.w, q.h, "translate3d(" + cx + "px," + y + "px," + cz + "px) rotateX(" + rot + "deg)", n, "cara",
            function (el) {
              el.style.borderRadius = q.radio;
              el.style.backgroundSize = L + "px " + W + "px";
              el.style.backgroundPosition = (-q.x) + "px " + (-q.z) + "px";
            });
          grupo.push(p);
        });
        return grupo;
      }

      // Sombras en el piso (van primero para quedar debajo)
      pieza(L + 1.2 * k, W + 1.6 * k, "translate3d(" + (0.25 * k) + "px," + (yBot + 0.5) + "px," + (-0.35 * k) + "px) rotateX(90deg)", [0, -1, 0], "sombra");
      pieza(D * 0.92, 0.9 * k, "translate3d(" + (0.4 * k) + "px," + (yBot + 0.4) + "px," + (-0.6 * k) + "px) rotateX(90deg)", [0, -1, 0], "sombra-modulo");
      pieza(L, W, "translate3d(" + (0.12 * k) + "px," + (yBot + 0.3) + "px," + (-0.18 * k) + "px) rotateX(90deg)", [0, -1, 0], "caustica",
        function (el) { el.style.borderRadius = r + "px"; });

      // Caras grandes con la ranura recortada
      cara(yBot, -90, [0, 1, 0]);
      // Cantos rectos
      pieza(L - 2 * r, t, "translate3d(0," + yMid + "px," + (W / 2) + "px)", [0, 0, 1], "canto");
      pieza(L - 2 * r, t, "translate3d(0," + yMid + "px," + (-W / 2) + "px) rotateY(180deg)", [0, 0, -1], "canto");
      pieza(W - 2 * r, t, "translate3d(" + (L / 2) + "px," + yMid + "px,0) rotateY(90deg)", [1, 0, 0], "canto");
      pieza(W - 2 * r, t, "translate3d(" + (-L / 2) + "px," + yMid + "px,0) rotateY(-90deg)", [-1, 0, 0], "canto");
      // Esquinas redondeadas (6 segmentos cada una)
      [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]].forEach(function (c) {
        var cx = c[0] * (L / 2 - r), cz = c[1] * (W / 2 - r), N = 6;
        for (var i = 0; i < N; i++) {
          var a = (c[2] + (i + 0.5) * 90 / N) * Math.PI / 180;
          var nx = Math.cos(a), nz = Math.sin(a);
          pieza(r * (Math.PI / 2) / N + 0.8, t,
            "translate3d(" + (cx + r * nx) + "px," + yMid + "px," + (cz + r * nz) + "px) rotateY(" + (90 - a * 180 / Math.PI) + "deg)",
            [nx, 0, nz], "canto");
        }
      });
      // Paredes de la ranura (miran hacia adentro)
      pieza(sL, t, "translate3d(0," + yMid + "px," + (sW / 2) + "px) rotateY(180deg)", [0, 0, -1], "ranura");
      pieza(sL, t, "translate3d(0," + yMid + "px," + (-sW / 2) + "px)", [0, 0, 1], "ranura");
      pieza(sW, t, "translate3d(" + (sL / 2) + "px," + yMid + "px,0) rotateY(-90deg)", [-1, 0, 0], "ranura");
      pieza(sW, t, "translate3d(" + (-sL / 2) + "px," + yMid + "px,0) rotateY(90deg)", [1, 0, 0], "ranura");
      // Cara superior al final: es la que se ve encima de todo
      cara(yTop, 90, [0, -1, 0]);
    }

    function iluminarBase(rxr, ryr, parte) {
      piezas.forEach(function (p, j) {
        if (parte >= 0 && j % cfg.reparto !== parte) return;
        if (p.tipo === "sombra" || p.tipo === "sombra-modulo" || p.tipo === "caustica") return;
        var n = rotar(p.n, rxr, ryr);
        var frente = n[2];                                  // >0: mira a la cámara
        var dif = Math.max(0, punto(n, LUZ));
        var spec = frente > 0 ? Math.pow(Math.max(0, punto(n, MEDIO)), 60) : 0;
        var fres = Math.pow(1 - Math.abs(frente), 3);
        var bg;
        if (p.tipo === "cara") {
          // superficie pulida: casi invisible de frente, refleja en ángulo rasante
          // Fresnel del acrílico (n≈1.49): de frente refleja ~4 %, en ángulo rasante mucho más,
          // pero lo que refleja es el estudio oscuro, así que se ve gris tenue y no lechoso
          var a = Math.max(0, 0.025 + 0.09 * fres + 0.5 * spec + (frente < 0 ? -0.01 : 0));
          var desplaza = (50 + n[0] * 140).toFixed(1);
          bg = "linear-gradient(105deg, rgba(225,242,246," + a.toFixed(2) + ") 0%," +
            "rgba(255,255,255," + (a + 0.12 * (0.3 + dif)).toFixed(2) + ") " + Math.round(desplaza) + "%," +
            "rgba(200,222,226," + a.toFixed(2) + ") 100%)";
        } else {
          // canto cortado y pulido: se ve más denso (tinte verde-azulado del acrílico)
          var base = p.tipo === "ranura" ? 0.16 : 0.3;
          var al = base + 0.28 * dif + 0.2 * fres + (frente < 0 ? -0.08 : 0);
          var g = Math.round(222 + 30 * dif);
          var tinte = "rgba(" + (g - 30) + "," + g + "," + (g - 8) + "," + Math.max(0.08, al).toFixed(2) + ")";
          var luz = (0.35 + 0.65 * spec + 0.3 * dif).toFixed(2);
          bg = "linear-gradient(180deg, rgba(255,255,255," + luz + ") 0 1px," + tinte + " 1px," +
            "rgba(255,255,255," + (0.08 + 0.6 * spec).toFixed(2) + ") 55%," + tinte + " calc(100% - 1px)," +
            "rgba(255,255,255," + (luz * 0.6).toFixed(2) + ") calc(100% - 1px))";
        }
        if (bg !== p.ultimo) {
          if (p.tipo === "cara") p.el.style.backgroundImage = bg; else p.el.style.background = bg;
          p.ultimo = bg;
        }
      });
    }

    function iluminar(rxr, ryr, parte) {
      caras.forEach(function (c) {
        var n = rotar(c.n, rxr, ryr);
        var dif = Math.max(0, punto(n, LUZ));
        c.luz.style.opacity = (0.26 * (1 - dif)).toFixed(3);
        var spec = Math.pow(Math.max(0, punto(n, MEDIO)), 6);
        c.ref.style.opacity = (0.15 + 0.85 * spec).toFixed(3);
        c.ref.style.backgroundPosition = Math.round(50 + n[0] * 120) + "% 0";
      });
      segs.forEach(function (s, j) {
        if (parte >= 0 && j % cfg.reparto !== parte) return;
        var n = rotar([s.nx, s.ny, 0], rxr, ryr);
        var dif = Math.max(0, punto(n, LUZ));
        var spec = Math.pow(Math.max(0, punto(n, MEDIO)), 40);
        var bg;
        if (cfg.canto === "pvc") {
          var v = Math.round(150 + 95 * dif + 10 * spec);
          bg = "rgb(" + v + "," + v + "," + v + ")";
        } else {
          var fres = Math.pow(1 - Math.abs(n[2]), 2);
          var a = (0.18 + 0.25 * dif + 0.2 * fres).toFixed(2);
          var b = Math.round(205 + 50 * dif), cB = Math.min(255, b + 15);
          var brillo = (0.15 + 0.85 * spec).toFixed(2);
          var vidrio = "rgba(" + (b - 25) + "," + b + "," + cB + "," + a + ")";
          bg = "linear-gradient(90deg," +
            colorFrente + " 0 1.5px," + vidrio + " 1.5px," +
            "rgba(255,255,255," + brillo + ") 50%," +
            vidrio + " calc(100% - 1.5px)," + colorReverso + " calc(100% - 1.5px))";
        }
        if (bg !== s.ultimo) { s.el.style.background = bg; s.ultimo = bg; }
      });
    }

    var ry = parseFloat(dato("inicio", 20)), rx = cfg.inclinacion, vel = cfg.velocidad, auto = !REDUCE;
    var arrastrando = false, ultX = 0, ultY = 0, ultT = 0, inercia = 0, objetivo = null;
    var ultimaLuz = null, turnoLuz = 0, luzPendiente = 0, t0 = performance.now(), prev = null, vivo = true;

    var pausado = false, enPantalla = true, pausaManual = false, pausaDesde = 0;
    var CUADRO = 1000 / 60, cada = Math.max(1, Math.round(60 / cfg.cuadros)), fase = TURNOS++, ultimoPaso = 0;
    function cuadro(ahora) {
      if (!vivo) return;
      if (pausado) return;            // v2: no se agenda otro cuadro mientras esté en pausa
      // v3: ritmo fijo y por turnos en el giro automático (nunca al arrastrar ni con inercia)
      if (cada > 1 && !arrastrando && objetivo === null && Math.abs(inercia) <= 2) {
        var transcurrido = ahora - ultimoPaso;
        var miTurno = (Math.floor(ahora / CUADRO) + fase) % cada === 0;
        if (transcurrido < CUADRO * cada * 1.5 && (!miTurno || transcurrido < CUADRO * (cada - 0.5))) {
          requestAnimationFrame(cuadro);
          return;
        }
      }
      ultimoPaso = ahora;
      var dt = Math.min(0.05, (ahora - (prev || ahora)) / 1000); prev = ahora;
      if (!arrastrando) {
        if (objetivo !== null) {
          var dif = ((objetivo - ry) % 360 + 540) % 360 - 180;
          ry += dif * Math.min(1, dt * 6);
          if (Math.abs(dif) < 0.2) { ry = objetivo; objetivo = null; }
        } else if (Math.abs(inercia) > 2) {
          ry += inercia * dt; inercia *= Math.pow(0.04, dt);
        } else if (auto) {
          inercia = 0;
          vel += (cfg.velocidad - vel) * Math.min(1, dt * 2);
          ry += vel * dt;
        }
        rx += (cfg.inclinacion - rx) * Math.min(1, dt * 3);
      }
      var t = (ahora - t0) / 1000;
      var flota = REDUCE ? 0 : Math.sin(t * 1.6) * cfg.flotar;
      var rxTot = rx + (REDUCE ? 0 : Math.sin(t * 0.9) * 3);
      modulo.style.transform = "translateY(" + flota + "px) rotateX(" + rxTot + "deg) rotateY(" + ry + "deg)";

      var ancho = 0.55 + 0.45 * Math.abs(Math.cos(ry * Math.PI / 180));
      var cerca = 1 - flota / (cfg.flotar * 4 || 1);
      sombra.style.transform = "translateX(-50%) scale(" + (ancho * cerca).toFixed(3) + "," + cerca.toFixed(3) + ")";
      sombra.style.opacity = (0.25 + 0.35 * cerca).toFixed(3);

      var zFrente = rotar([0, 0, 1], rxTot * Math.PI / 180, ry * Math.PI / 180)[2];
      revisarCiclo(zFrente);
      marcarDiseno(zFrente);
      var clave = Math.round(ry) + "|" + Math.round(rxTot);
      if (clave !== ultimaLuz) {
        // v3: recién construido (ultimaLuz null) se ilumina todo; si no, se reparte entre cuadros
        luzPendiente = ultimaLuz === null ? -1 : cfg.reparto;
        ultimaLuz = clave;
      }
      if (luzPendiente !== 0) {
        var parte = luzPendiente < 0 || cfg.reparto === 1 ? -1 : (turnoLuz++ % cfg.reparto);
        iluminar(rxTot * Math.PI / 180, ry * Math.PI / 180, parte);
        if (conBase) iluminarBase(rxTot * Math.PI / 180, ry * Math.PI / 180, parte);
        if (conMDF) iluminarMDF(rxTot * Math.PI / 180, ry * Math.PI / 180);
        luzPendiente = luzPendiente < 0 ? 0 : luzPendiente - 1;
      }
      requestAnimationFrame(cuadro);
    }

    escena.addEventListener("pointerdown", function (e) {
      arrastrando = true; objetivo = null; inercia = 0;
      ultX = e.clientX; ultY = e.clientY; ultT = performance.now();
      escena.setPointerCapture(e.pointerId);
    });
    escena.addEventListener("pointermove", function (e) {
      if (!arrastrando) return;
      var ahora = performance.now(), dx = e.clientX - ultX, dy = e.clientY - ultY;
      ry += dx * 0.6;
      rx = Math.max(-45, Math.min(45, rx - dy * 0.3));
      inercia = (dx * 0.6) / Math.max(0.008, (ahora - ultT) / 1000);
      ultX = e.clientX; ultY = e.clientY; ultT = ahora;
    });
    function soltar() { arrastrando = false; vel = 0; inercia = Math.max(-900, Math.min(900, inercia)); }
    escena.addEventListener("pointerup", soltar);
    escena.addEventListener("pointercancel", soltar);

    var btnGiro = raiz.querySelector('[data-accion="girar"]');
    function marcarGiro() {
      if (!btnGiro) return;
      btnGiro.setAttribute("aria-pressed", auto ? "true" : "false");
      btnGiro.textContent = auto ? "Girando" : "En pausa";
    }
    function girar(si) { auto = si == null ? !auto : !!si; vel = 0; objetivo = null; marcarGiro(); }
    function mirar(grados) { auto = false; inercia = 0; objetivo = grados; marcarGiro(); }
    raiz.addEventListener("click", function (e) {
      var b = e.target.closest("[data-accion]"); if (!b) return;
      var acc = b.getAttribute("data-accion");
      if (acc === "girar") girar();
      if (acc === "frente") mirar(0);
      if (acc === "reverso") mirar(180);
    });

    if (lista.length >= 2) setCaras(lista[0], lista[1]);
    else setCaras(dato("frente", lista[0] || ""), dato("reverso", ""));
    if (lista.length) {
      etiqueta = document.createElement("div");
      etiqueta.className = "m3d__contador";
      var tit = raiz.querySelector(".m3d__titulo");
      if (tit) tit.appendChild(etiqueta);
    }
    construir();
    function alCambiarTamano() { construir(); ultimaLuz = null; }
    window.addEventListener("resize", alCambiarTamano);
    requestAnimationFrame(cuadro);

    /* ---------- v2: pausa real ----------
       Fuera de pantalla, con la pestaña oculta o con pausar(): deja de dibujar.
       Al reanudar sigue en el mismo ángulo y el mismo diseño (no reinicia). */
    function actualizarPausa() {
      var debe = pausaManual || !enPantalla || document.hidden;
      raiz.classList.toggle("m3d--fuera", !enPantalla);   // v3: sin capas 3D fuera de pantalla
      if (debe && !pausado) { pausado = true; pausaDesde = performance.now(); }
      else if (!debe && pausado) {
        pausado = false;
        t0 += performance.now() - pausaDesde;   // la flotación sigue donde iba
        prev = null;                              // sin salto de tiempo
        if (vivo) requestAnimationFrame(cuadro);
      }
    }
    var vigia = null;
    if ("IntersectionObserver" in window) {
      vigia = new IntersectionObserver(function (en) { enPantalla = en[en.length - 1].isIntersecting; actualizarPausa(); }, { rootMargin: "100px" });
      vigia.observe(raiz);
    }
    document.addEventListener("visibilitychange", actualizarPausa);

    return {
      setCaras: setCaras,
      lista: function () { return lista.slice(); },
      estadoCiclo: function () { return { frente: ciclo.idxFrente % (lista.length || 1), reverso: ciclo.idxReverso % (lista.length || 1) }; },
      girar: girar,
      frente: function () { mirar(0); },
      reverso: function () { mirar(180); },
      angulo: function (g) { mirar(g); },
      detener: function () {
        vivo = false;
        window.removeEventListener("resize", alCambiarTamano);
        document.removeEventListener("visibilitychange", actualizarPausa);
        if (vigia) vigia.disconnect();
      },
      pausar: function () { pausaManual = true; actualizarPausa(); },
      reanudar: function () { pausaManual = false; actualizarPausa(); },
      enPausa: function () { return pausado; },
      medidas: function () { return conMDF ? infoMDF : info; }
    };
  }

  function montarTodos() {
    document.querySelectorAll("[data-modulo-3d]").forEach(function (el) {
      if (!el.m3d) el.m3d = montar(el);
    });
  }

  window.Modulo3D = { montar: montar, montarTodos: montarTodos };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarTodos);
  else montarTodos();
})();
