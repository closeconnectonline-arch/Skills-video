/* Módulo 3D Pro con base · motor v1 (derivado de Módulo 3D render Pro v1)
   Se monta solo en todo elemento con [data-modulo-3d]. No edites este archivo por proyecto.

   Atributos:
     data-modelo     "pro" (acrílico Ø10 × 0.5 cm, canto transparente) | "proplus" (PVC Ø7 × 0.2 cm, canto blanco)
     data-frente     imagen redonda del vinil del frente
     data-reverso    imagen redonda del vinil del reverso (sin ella, repite el frente)
     data-titulo     línea principal bajo el módulo (vacío = sin título)
     data-subtitulo  línea secundaria
     data-controles  "no" para ocultar los botones
     data-velocidad  grados por segundo (40)
     data-inicio     ángulo inicial (20)
     data-grosor-mm  grosor real del módulo en mm (por defecto el del modelo)
     data-diametro-cm diámetro real del módulo (10 en Pro, 7 en Pro Plus)
     data-inclinacion grados de inclinación de cámara (-16 con base, -10 sin base)
     data-flotar     px de flotación (0 con base, 10 sin base)
   Base de acrílico transparente (data-base="acrilico"), medidas en cm:
     data-base-largo (8)  data-base-ancho (2.5)  data-base-grueso (0.3)  data-base-radio (0.4)
     data-ranura-largo (3)  data-ranura-ancho (0.3)
*/
(function () {
  "use strict";

  var MODELOS = {
    pro:     { grosor: 0.05,   canto: "acrilico", titulo: "Módulo Pro · Acrílico transparente Ø10 cm" },
    proplus: { grosor: 0.0286, canto: "pvc",      titulo: "Módulo Pro Plus · PVC Ø7 cm" }
  };

  var LUZ = norm([-0.45, -0.65, 0.62]);              // luz de arriba a la izquierda
  var MEDIO = norm([LUZ[0], LUZ[1], LUZ[2] + 1]);    // vector medio luz-ojo (especular)
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
    var diamCm = parseFloat(dato("diametro-cm", modelo === MODELOS.proplus ? 7 : 10));
    var grosorMm = dato("grosor-mm", "");
    var cfg = {
      grosor: grosorMm ? parseFloat(grosorMm) / (diamCm * 10) : modelo.grosor,
      canto: dato("canto", modelo.canto),
      segmentos: 64,
      velocidad: parseFloat(dato("velocidad", 40)),
      inclinacion: parseFloat(dato("inclinacion", conBase ? -16 : -10)),
      flotar: parseFloat(dato("flotar", conBase ? 0 : 10))
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

    function setCaras(f, r) {
      frente.style.backgroundImage = url(f);
      reverso.style.backgroundImage = url(r || f);
      muestrearColor(f, function (c) { colorFrente = c; ultimaLuz = null; });
      muestrearColor(r || f, function (c) { colorReverso = c; ultimaLuz = null; });
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
      T = Math.max(cfg.canto === "pvc" ? 3 : 6, D * cfg.grosor);
      frente.style.transform = "translateZ(" + T / 2 + "px)";
      reverso.style.transform = "rotateY(180deg) translateZ(" + T / 2 + "px)";
      var N = cfg.segmentos, R = D / 2 - 0.5, largo = (2 * Math.PI * R) / N + 1.2;
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
      if (conBase) construirBase();
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

    function iluminarBase(rxr, ryr) {
      piezas.forEach(function (p) {
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
          var a = 0.025 + 0.09 * fres + 0.5 * spec + (frente < 0 ? -0.01 : 0);
          var desplaza = (50 + n[0] * 140).toFixed(1);
          bg = "linear-gradient(105deg, rgba(225,242,246," + a.toFixed(3) + ") 0%," +
            "rgba(255,255,255," + (a + 0.12 * (0.3 + dif)).toFixed(3) + ") " + desplaza + "%," +
            "rgba(200,222,226," + a.toFixed(3) + ") 100%)";
        } else {
          // canto cortado y pulido: se ve más denso (tinte verde-azulado del acrílico)
          var base = p.tipo === "ranura" ? 0.16 : 0.3;
          var al = base + 0.28 * dif + 0.2 * fres + (frente < 0 ? -0.08 : 0);
          var g = Math.round(222 + 30 * dif);
          var tinte = "rgba(" + (g - 30) + "," + g + "," + (g - 8) + "," + Math.max(0.08, al).toFixed(3) + ")";
          var luz = (0.35 + 0.65 * spec + 0.3 * dif).toFixed(3);
          bg = "linear-gradient(180deg, rgba(255,255,255," + luz + ") 0 1px," + tinte + " 1px," +
            "rgba(255,255,255," + (0.08 + 0.6 * spec).toFixed(3) + ") 55%," + tinte + " calc(100% - 1px)," +
            "rgba(255,255,255," + (luz * 0.6).toFixed(3) + ") calc(100% - 1px))";
        }
        if (bg !== p.ultimo) {
          if (p.tipo === "cara") p.el.style.backgroundImage = bg; else p.el.style.background = bg;
          p.ultimo = bg;
        }
      });
    }

    function iluminar(rxr, ryr) {
      caras.forEach(function (c) {
        var n = rotar(c.n, rxr, ryr);
        var dif = Math.max(0, punto(n, LUZ));
        c.luz.style.opacity = (0.26 * (1 - dif)).toFixed(3);
        var spec = Math.pow(Math.max(0, punto(n, MEDIO)), 6);
        c.ref.style.opacity = (0.15 + 0.85 * spec).toFixed(3);
        c.ref.style.backgroundPosition = (50 + n[0] * 120) + "% 0";
      });
      segs.forEach(function (s) {
        var n = rotar([s.nx, s.ny, 0], rxr, ryr);
        var dif = Math.max(0, punto(n, LUZ));
        var spec = Math.pow(Math.max(0, punto(n, MEDIO)), 40);
        var bg;
        if (cfg.canto === "pvc") {
          var v = Math.round(150 + 95 * dif + 10 * spec);
          bg = "rgb(" + v + "," + v + "," + v + ")";
        } else {
          var fres = Math.pow(1 - Math.abs(n[2]), 2);
          var a = (0.18 + 0.25 * dif + 0.2 * fres).toFixed(3);
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
    var ultimaLuz = null, t0 = performance.now(), prev = null, vivo = true;

    function cuadro(ahora) {
      if (!vivo) return;
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

      var clave = Math.round(ry) + "|" + Math.round(rxTot);
      if (clave !== ultimaLuz) {
        iluminar(rxTot * Math.PI / 180, ry * Math.PI / 180);
        if (conBase) iluminarBase(rxTot * Math.PI / 180, ry * Math.PI / 180);
        ultimaLuz = clave;
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

    setCaras(dato("frente", ""), dato("reverso", ""));
    construir();
    window.addEventListener("resize", function () { construir(); ultimaLuz = null; });
    requestAnimationFrame(cuadro);

    return {
      setCaras: setCaras,
      girar: girar,
      frente: function () { mirar(0); },
      reverso: function () { mirar(180); },
      angulo: function (g) { mirar(g); },
      detener: function () { vivo = false; },
      medidas: function () { return info; }
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
