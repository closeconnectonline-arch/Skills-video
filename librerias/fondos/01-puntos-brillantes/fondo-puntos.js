/* Fondo de puntos brillantes · v1
 * Reconstrucción sin dependencias (canvas 2D) del fondo "Dotted Glow Background" de Aceternity UI,
 * a partir de los ajustes de su ejemplo: gap 10, radius 1.6, opacity 1, backgroundOpacity 0,
 * speedMin 0.3, speedMax 1.6, speedScale 1, puntos neutral-500 y brillo neutral-600 / sky-800.
 * Solo el fondo: sin logo ni texto.
 *
 * Uso:
 *   <div class="fondo-puntos" data-fondo-puntos></div>   (dentro de un contenedor con position: relative)
 *   <script src="fondo-puntos.js"></script>              (monta todos los [data-fondo-puntos])
 *   FondoPuntos.montar(el, { gap: 12, color: "#737373" })  (o a mano, con opciones)
 *
 * Opciones (atributo data-* u objeto):
 *   gap 10 · radio 1.6 · color "#737373" · brillo "#075985" · opacidad 1
 *   fondo "" · fondo-opacidad 0 · vel-min 0.3 · vel-max 1.6 · vel-escala 1 · fps 40
 *   color/brillo aceptan un color CSS o una variable CSS ("--mi-color").
 *
 * Rendimiento: un solo canvas por fondo; los puntos se agrupan en 10 niveles de brillo y cada nivel
 * se pinta con una sola instrucción; el brillo usa un sprite pre-dibujado (sin shadowBlur por punto).
 * Se pausa fuera de pantalla y con la pestaña oculta; con "reducir movimiento" queda estático.
 */
(function () {
  "use strict";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NIVELES = 10;

  function leer(el, op, k, d) {
    if (op && op[k] != null) return op[k];
    var v = el.getAttribute("data-" + k);
    return v == null || v === "" ? d : v;
  }
  function resolverColor(el, c) {
    c = String(c).trim();
    if (c.indexOf("--") === 0) {
      var v = getComputedStyle(el).getPropertyValue(c).trim();
      return v || "#737373";
    }
    return c;
  }
  function sprite(color, r, halo) {
    var t = Math.ceil((r + halo) * 2 + 2), c = document.createElement("canvas");
    c.width = c.height = t;
    var x = c.getContext("2d"), m = t / 2;
    if (halo) {
      var g = x.createRadialGradient(m, m, 0, m, m, r + halo);
      g.addColorStop(0, color); g.addColorStop(r / (r + halo), color);
      g.addColorStop(Math.min(1, (r + halo * 0.35) / (r + halo)), colorAlfa(color, 0.45));
      g.addColorStop(1, colorAlfa(color, 0));
      x.fillStyle = g; x.fillRect(0, 0, t, t);
    } else {
      x.fillStyle = color; x.beginPath(); x.arc(m, m, r, 0, Math.PI * 2); x.fill();
    }
    return c;
  }
  function colorAlfa(color, a) {
    var c = document.createElement("canvas").getContext("2d");
    c.fillStyle = color; var s = c.fillStyle;           // normaliza a #rrggbb o rgba()
    if (s[0] === "#") {
      var n = parseInt(s.slice(1), 16);
      return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
    }
    return s.replace(/rgba?\(([^)]+)\)/, function (_, p) { var q = p.split(","); return "rgba(" + q[0] + "," + q[1] + "," + q[2] + "," + a + ")"; });
  }

  function montar(el, op) {
    if (el._fondoPuntos) return el._fondoPuntos;
    var cfg = {
      gap: +leer(el, op, "gap", 10), radio: +leer(el, op, "radio", 1.6),
      color: leer(el, op, "color", "#737373"), brillo: leer(el, op, "brillo", "#075985"),
      opacidad: +leer(el, op, "opacidad", 1), fondo: leer(el, op, "fondo", ""), fondoOpacidad: +leer(el, op, "fondo-opacidad", 0),
      velMin: +leer(el, op, "vel-min", 0.3), velMax: +leer(el, op, "vel-max", 1.6), velEscala: +leer(el, op, "vel-escala", 1),
      fps: +leer(el, op, "fps", 40)
    };
    var cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.className = "fondo-puntos__lienzo";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    var dpr = 1, W = 0, H = 0, puntos = [], spPunto = null, spBrillo = null, sp = 0;
    var vivo = true, enPantalla = true, ultimo = 0, raf = 0;

    function preparar() {
      var r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var color = resolverColor(el, cfg.color), brillo = resolverColor(el, cfg.brillo);
      spPunto = sprite(color, cfg.radio * dpr, 0);
      spBrillo = sprite(brillo, cfg.radio * dpr, cfg.radio * dpr * 2.2);
      sp = spBrillo.width / dpr;
      // rejilla centrada
      var g = cfg.gap, cols = Math.ceil(W / g) + 1, filas = Math.ceil(H / g) + 1;
      var ox = (W - (cols - 1) * g) / 2, oy = (H - (filas - 1) * g) / 2;
      puntos = new Array(cols * filas);
      for (var j = 0, k = 0; j < filas; j++) for (var i = 0; i < cols; i++, k++) {
        puntos[k] = { x: ox + i * g, y: oy + j * g, v: cfg.velMin + Math.random() * (cfg.velMax - cfg.velMin), f: Math.random() * Math.PI * 2 };
      }
      dibujar(performance.now());
    }

    function dibujar(t) {
      ctx.clearRect(0, 0, W, H);
      if (cfg.fondo && cfg.fondoOpacidad > 0) {
        ctx.globalAlpha = cfg.fondoOpacidad; ctx.fillStyle = resolverColor(el, cfg.fondo); ctx.fillRect(0, 0, W, H);
      }
      var s = t / 1000 * cfg.velEscala, r = cfg.radio;
      // agrupa por nivel de brillo: una sola llamada de pintado por nivel
      var cubos = [];
      for (var n = 0; n < NIVELES; n++) cubos.push([]);
      var brillan = [];
      for (var i = 0; i < puntos.length; i++) {
        var p = puntos[i];
        var o = 0.5 + 0.5 * Math.sin(s * p.v + p.f);          // 0..1, cada punto a su ritmo
        var a = 0.16 + 0.64 * o * o * o;                        // base tenue, picos suaves
        cubos[Math.min(NIVELES - 1, (a * NIVELES) | 0)].push(p);
        if (o > 0.94) brillan.push(p, (o - 0.94) / 0.06 * 0.85);   // pocos puntos brillan a la vez
      }
      var tam = spPunto.width / dpr, m = tam / 2;
      for (n = 0; n < NIVELES; n++) {
        var c = cubos[n]; if (!c.length) continue;
        ctx.globalAlpha = cfg.opacidad * (n + 0.5) / NIVELES;
        for (var q = 0; q < c.length; q++) ctx.drawImage(spPunto, c[q].x - m, c[q].y - m, tam, tam);
      }
      var mb = sp / 2;
      for (q = 0; q < brillan.length; q += 2) {
        ctx.globalAlpha = cfg.opacidad * brillan[q + 1];
        ctx.drawImage(spBrillo, brillan[q].x - mb, brillan[q].y - mb, sp, sp);
      }
      ctx.globalAlpha = 1;
    }

    function cuadro(t) {
      raf = 0;
      if (!vivo || !enPantalla || document.hidden) return;
      if (t - ultimo >= 1000 / cfg.fps) { ultimo = t; dibujar(t); }
      raf = requestAnimationFrame(cuadro);
    }
    function arrancar() { if (!REDUCE && vivo && !raf && enPantalla && !document.hidden) raf = requestAnimationFrame(cuadro); }

    preparar();
    var ro = window.ResizeObserver ? new ResizeObserver(function () { preparar(); }) : null;
    if (ro) ro.observe(el); else window.addEventListener("resize", preparar);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (e) { enPantalla = e[e.length - 1].isIntersecting; arrancar(); }, { rootMargin: "50px" }) : null;
    if (io) io.observe(el);
    function alVisibilidad() { arrancar(); }
    document.addEventListener("visibilitychange", alVisibilidad);
    arrancar();

    var api = {
      redibujar: preparar,
      detener: function () {
        vivo = false; if (raf) cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); if (io) io.disconnect();
        document.removeEventListener("visibilitychange", alVisibilidad);
        cv.remove(); el._fondoPuntos = null;
      }
    };
    el._fondoPuntos = api;
    return api;
  }

  window.FondoPuntos = {
    montar: montar,
    montarTodos: function (sel) { return Array.prototype.map.call(document.querySelectorAll(sel || "[data-fondo-puntos]"), function (e) { return montar(e); }); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { window.FondoPuntos.montarTodos(); });
  else window.FondoPuntos.montarTodos();
})();
