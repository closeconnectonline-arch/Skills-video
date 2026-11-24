/* Fondo de puntos brillantes · v2
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
 * Rendimiento (v2): dos capas. La rejilla de puntos tenues se dibuja UNA vez en un canvas fijo; en el
 * otro solo se animan los puntos que se están encendiendo (densidad 5 %, se reemplazan al apagarse), y
 * cada cuadro solo borra y repinta esos rectángulos. El brillo es un sprite pre-dibujado.
 * Se pausa fuera de pantalla y con la pestaña oculta; con "reducir movimiento" queda estático.
 * Opciones nuevas: densidad (0.05 = 5 % de los puntos encendiéndose a la vez) y resolucion (1 por defecto; 2 en pantallas retina
 * si se quiere el punto más nítido, a cambio de unas 2 veces más trabajo).
 */
(function () {
  "use strict";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      fps: +leer(el, op, "fps", 40), densidad: +leer(el, op, "densidad", 0.05),
      resolucion: +leer(el, op, "resolucion", 1)
    };
    function lienzo() {
      var c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true"); c.className = "fondo-puntos__lienzo"; el.appendChild(c); return c;
    }
    var cvFijo = lienzo(), cv = lienzo();          // rejilla fija + capa de puntos que se encienden
    var ctxFijo = cvFijo.getContext("2d"), ctx = cv.getContext("2d");
    var dpr = 1, W = 0, H = 0, puntos = [], spPunto = null, spBrillo = null, sp = 0, activos = [];
    var vivo = true, enPantalla = true, ultimo = 0, raf = 0;

    function preparar() {
      var r = el.getBoundingClientRect();
      // v2: resolución 1× por defecto: los puntos son halos difusos y a tamaño real no se distingue de 2×,
      // pero el navegador combina 4 veces menos píxeles por cuadro (medido: el doble de fluidez en celular)
      dpr = Math.max(1, Math.min(cfg.resolucion, window.devicePixelRatio || 1));
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      [cvFijo, cv].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      ctxFijo.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var color = resolverColor(el, cfg.color), brillo = resolverColor(el, cfg.brillo);
      spPunto = sprite(color, cfg.radio * dpr, 0);
      spBrillo = sprite(brillo, cfg.radio * dpr, cfg.radio * dpr * 2.2);
      sp = spBrillo.width / dpr;
      // rejilla centrada
      var g = cfg.gap, cols = Math.ceil(W / g) + 1, filas = Math.ceil(H / g) + 1;
      var ox = (W - (cols - 1) * g) / 2, oy = (H - (filas - 1) * g) / 2;
      puntos = new Array(cols * filas);
      for (var j = 0, k = 0; j < filas; j++) for (var i = 0; i < cols; i++, k++) {
        puntos[k] = { x: ox + i * g, y: oy + j * g };
      }
      pintarFijo();
      var ahora = performance.now(), n = Math.max(1, Math.round(puntos.length * cfg.densidad));
      activos = [];
      for (var a = 0; a < n; a++) activos.push(nuevoActivo(ahora, true));
      ctx.clearRect(0, 0, W, H);
      dibujar(ahora);
    }

    // Capa fija: cada punto con un brillo base tenue y ligeramente distinto (como el original en reposo)
    function pintarFijo() {
      ctxFijo.clearRect(0, 0, W, H);
      if (cfg.fondo && cfg.fondoOpacidad > 0) {
        ctxFijo.globalAlpha = cfg.fondoOpacidad; ctxFijo.fillStyle = resolverColor(el, cfg.fondo); ctxFijo.fillRect(0, 0, W, H);
      }
      var tam = spPunto.width / dpr, m = tam / 2;
      for (var i = 0; i < puntos.length; i++) {
        ctxFijo.globalAlpha = cfg.opacidad * (0.16 + Math.random() * 0.14);
        ctxFijo.drawImage(spPunto, puntos[i].x - m, puntos[i].y - m, tam, tam);
      }
      ctxFijo.globalAlpha = 1;
    }
    // Un punto que se enciende y se apaga a su propia velocidad (vel-min…vel-max, como el original)
    function nuevoActivo(t, alAzar) {
      var v = (cfg.velMin + Math.random() * (cfg.velMax - cfg.velMin)) * cfg.velEscala;
      var dur = Math.PI / v * 1000;               // medio ciclo de seno: de apagado a encendido a apagado
      return { p: puntos[(Math.random() * puntos.length) | 0], t0: alAzar ? t - Math.random() * dur : t, dur: dur, x: 0, y: 0, ocupado: false };
    }

    function dibujar(t) {
      var mb = sp / 2, tam = spPunto.width / dpr, m = tam / 2;
      // 1) borra solo lo que se pintó en el cuadro anterior
      for (var i = 0; i < activos.length; i++) {
        var a = activos[i];
        if (a.ocupado) ctx.clearRect(a.x - mb - 1, a.y - mb - 1, sp + 2, sp + 2);
      }
      // 2) pinta los puntos que se están encendiendo
      for (i = 0; i < activos.length; i++) {
        a = activos[i];
        var k = (t - a.t0) / a.dur;
        if (k >= 1) { activos[i] = a = nuevoActivo(t, false); k = 0; }
        var o = Math.sin(Math.max(0, k) * Math.PI);       // 0 → 1 → 0
        a.x = a.p.x; a.y = a.p.y; a.ocupado = o > 0.02;
        if (!a.ocupado) continue;
        ctx.globalAlpha = cfg.opacidad * (0.64 * o * o * o + 0.1 * o);
        ctx.drawImage(spPunto, a.x - m, a.y - m, tam, tam);
        if (o > 0.8) { ctx.globalAlpha = cfg.opacidad * (o - 0.8) / 0.2 * 0.85; ctx.drawImage(spBrillo, a.x - mb, a.y - mb, sp, sp); }
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
        cv.remove(); cvFijo.remove(); el._fondoPuntos = null;
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
