/* Carrusel 3D de módulos Close Connect · v1
   Diseño guardado en Skills-video: disenos/modulos-threejs/carrusel-3d-modulos/
   Reconstrucción del "floating can carousel" (ola, entrada de 4.5 s, inercia, arrastre con lanzamiento,
   rueda, teclas, pausa y repetir) con los módulos de Close Connect en lugar de latas.
   Solo 4 módulos (Pro, Pro Plus, Personal, Estándar) en un bucle infinito: cuando uno sale por un lado
   y vuelve a entrar por el otro, trae diseños nuevos. Luz de estudio suavizada para que los blancos no se quemen.
   Cada módulo conserva sus funciones: gira sobre su eje, flota, cambia de diseño en cada giro
   (la cara cambia cuando queda de espaldas) y el módulo del centro se puede girar al tacto. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MODELOS, crearRecursos, crearModulo } from "./piezas.js";

const ORDEN = ["pro", "proplus", "personal", "estandar"];   // el bucle repite este orden
const N = ORDEN.length;
const ESCALA_CM = 0.33;                                      // cm del módulo → unidades de escena
const ENTRADA = 4.5;
const MEDIO_MODULO = 2.6;                                     // medio ancho máximo de un módulo en escena (Pro con base)
const LUZ = { focoMax: 50, factorFoco: 0.34, exposicion: 0.82, entorno: 0.6, relleno: 0.45, contra: 0.8 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const power4Out = (p) => 1 - Math.pow(1 - clamp(p, 0, 1), 5);
const envolver = (v, min, max) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };
const TAN10 = Math.tan(THREE.MathUtils.degToRad(10));

function fondoEstudio(w, h) {
  const c = document.createElement("canvas"), k = 512 / Math.max(w, h);
  c.width = Math.max(64, Math.round(w * k)); c.height = Math.max(64, Math.round(h * k));
  const ctx = c.getContext("2d"), W = c.width, H = c.height;
  const g = ctx.createRadialGradient(W * 0.5, H * 1.02, 0, W * 0.5, H * 0.9, Math.max(W, H) * 0.95);
  g.addColorStop(0, "#5a5a5c"); g.addColorStop(0.32, "#2e2e30"); g.addColorStop(0.7, "#151516"); g.addColorStop(1, "#0b0b0c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function montar(seccion, opciones = {}) {
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  let REDUCE = reduceMQ.matches;
  const L = Object.assign({}, LUZ, opciones.luz || {});
  /* Diseños de cada modelo: vienen de la plantilla (opciones.disenos, o el <script type="application/json">
     cuyo id está en data-disenos). Cada modelo necesita al menos 1 diseño; con 3 o más, el ciclo los va rotando. */
  let LISTAS = opciones.disenos;
  if (!LISTAS && seccion.dataset.disenos) {
    const nodo = document.getElementById(seccion.dataset.disenos);
    if (!nodo) throw new Error("No encontré la lista de diseños #" + seccion.dataset.disenos);
    LISTAS = JSON.parse(nodo.textContent);
  }
  if (!LISTAS) throw new Error("Falta la lista de diseños (data-disenos)");
  for (const t of ORDEN) {
    if (!Array.isArray(LISTAS[t]) || !LISTAS[t].length) throw new Error("Falta al menos un diseño para el modelo " + MODELOS[t].nombre + " (" + t + ")");
  }

  /* --- Interfaz: anterior/siguiente, 4 puntos (uno por modelo), pausa y repetir --- */
  seccion.classList.add("cc-carrusel");
  seccion.innerHTML =
    '<canvas class="cc-carrusel__lienzo" aria-hidden="true"></canvas>' +
    '<div class="cc-carrusel__cargando" role="status">Cargando módulos…</div>' +
    '<div class="cc-carrusel__nav">' +
    '<button type="button" class="cc-btn" data-a="anterior" aria-label="Módulo anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<div class="cc-carrusel__puntos" role="group" aria-label="Elegir modelo">' +
    ORDEN.map((t) => `<button type="button" class="cc-punto" data-tipo="${t}" aria-label="Ir al módulo ${MODELOS[t].nombre}" aria-pressed="false"></button>`).join("") +
    "</div>" +
    '<button type="button" class="cc-btn" data-a="siguiente" aria-label="Módulo siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
    "</div>" +
    '<div class="cc-carrusel__esquina">' +
    '<button type="button" class="cc-btn" data-a="repetir" aria-label="Repetir la entrada"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg></button>' +
    '<button type="button" class="cc-btn cc-btn--grande" data-a="pausa" aria-label="Pausar" aria-pressed="false"><svg class="i-pausa" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg></button>' +
    "</div>" +
    '<p class="cc-sr" aria-live="polite"></p>';
  const canvas = seccion.querySelector("canvas"), anuncio = seccion.querySelector(".cc-sr");
  const btnPausa = seccion.querySelector('[data-a="pausa"]'), puntos = [...seccion.querySelectorAll(".cc-punto")];

  /* --- Carga: decodificar imágenes y fuentes antes de empezar --- */
  const cargador = new THREE.TextureLoader();
  const texturas = {};
  await Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...ORDEN.map((t) => Promise.all(LISTAS[t].map((src) => new Promise((ok, mal) => {
      cargador.load(src, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; ok(tx); }, undefined, () => mal(new Error("No cargó: " + src)));
    }))).then((arr) => { texturas[t] = arr; }))
  ]);

  /* --- Renderizador, escena, cámara y luz de estudio --- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = L.exposicion;
  renderer.transmissionResolutionScale = 0.6;
  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04);
  escena.environment = entorno.texture;
  escena.environmentIntensity = L.entorno;
  const camara = new THREE.PerspectiveCamera(20, 1, 0.1, 200);
  const focos = [[0, 3.5, 0, 0, 0, 1], [0, -3, 2, 0, 0, 1.8]].map(([x, y, z, tx, ty, tz]) => {
    const f = new THREE.SpotLight(0xffffff, 0, 8, Math.PI / 4, 1, 0.1);
    f.position.set(x, y, z); f.target.position.set(tx, ty, tz); escena.add(f, f.target); return f;
  });
  const relleno = new THREE.DirectionalLight(0xfff4e8, L.relleno); relleno.position.set(4, 8, 14); escena.add(relleno);
  const contra = new THREE.DirectionalLight(0xcfe3ff, L.contra); contra.position.set(-6, 5, -10); escena.add(contra);

  /* --- Los 4 módulos --- */
  const rec = crearRecursos();
  const copias = ORDEN.map((tipo, i) => {
    const lista = texturas[tipo], n = lista.length, k = (i * 3) % n;
    const m = crearModulo(tipo, rec, lista[k], lista[(k + 1) % n]);
    const soporte = new THREE.Group(); soporte.add(m.pieza); m.pieza.scale.setScalar(ESCALA_CM);
    escena.add(soporte);
    m.pieza.traverse((o) => { o.userData.idx = i; });
    return {
      tipo, i, soporte, m, lista, n,
      idxF: k, idxR: (k + 1) % n, sig: (k + 2) % n, frenteVisible: true,
      giro: i * 70 + 15, velGiro: 0, fase: i * 1.7, xPrev: null, vueltas: 0
    };
  });
  const objetos = copias.map((c) => c.m.pieza);

  /* --- Estado (posición en "lugares": 1 lugar = 1 módulo) --- */
  let ancho = 1, alto = 1, ratio = 1, paso = 5.5, medioVisible = 8;
  const est = { pos: 0, objetivo: 0, transcurrido: 0, pausado: REDUCE, mx: 0, my: 0, smx: 0, smy: 0, arrastre: null, seleccion: -1, ultimaRueda: 0, cuadros: 0 };
  function zCamara(T) {
    let z = lerp(25, 29, power4Out((T - 1) / 2.5));
    if (camara.aspect < 0.8) z *= Math.max(1.08, 5.0 / (TAN10 * camara.aspect) / 29);   // vertical: el central completo y orillas de los vecinos
    return z;
  }
  function ajustar() {
    const b = seccion.getBoundingClientRect(); ancho = Math.max(1, b.width); alto = Math.max(1, b.height);
    renderer.setSize(ancho, alto, false); camara.aspect = ancho / alto; camara.updateProjectionMatrix();
    ratio = clamp(1440 / ancho, 1, 2.4);
    medioVisible = zCamara(ENTRADA) * TAN10 * camara.aspect;
    /* con 4 módulos el bucle mide 4 lugares: el salto de un extremo al otro debe ocurrir fuera de cuadro */
    /* el módulo que espera en el lugar ±2 está más al fondo (z = -2·3.5 - 0.2), donde la vista es más ancha */
    const medioAlFondo = (zCamara(ENTRADA) + 7.2) * TAN10 * camara.aspect;
    paso = Math.max(camara.aspect < 0.8 ? 4.4 : 5.5, (medioAlFondo + MEDIO_MODULO + 0.3) / 2);
    medioVisible = medioAlFondo;
    if (escena.background) escena.background.dispose();
    escena.background = fondoEstudio(ancho, alto);   // el acrílico necesita "ver" el fondo para refractarlo
  }
  ajustar();
  const ro = new ResizeObserver(ajustar); ro.observe(seccion);

  const lugarCentral = () => Math.round(est.objetivo);
  const indiceCentral = () => ((lugarCentral() % N) + N) % N;
  function marcarPausa() {
    btnPausa.setAttribute("aria-pressed", String(est.pausado));
    btnPausa.setAttribute("aria-label", est.pausado ? "Reproducir" : "Pausar");
    seccion.classList.toggle("cc-carrusel--pausado", est.pausado);
  }
  function anunciarSeleccion() {
    const idx = indiceCentral();
    if (idx === est.seleccion) return;
    est.seleccion = idx; const tipo = ORDEN[idx];
    anuncio.textContent = "Módulo " + MODELOS[tipo].nombre;
    puntos.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.tipo === tipo)));
  }
  function mover(pasos) { est.objetivo = Math.round(est.objetivo) + pasos; if (REDUCE) est.pos = est.objetivo; anunciarSeleccion(); }
  function irATipo(tipo) {
    const destino = ORDEN.indexOf(tipo), actual = lugarCentral();
    let d = ((destino - actual) % N + N) % N; if (d > N / 2) d -= N;   // ruta más corta en el bucle
    est.objetivo = actual + d; if (REDUCE) est.pos = est.objetivo; anunciarSeleccion();
  }
  function repetir() {
    est.transcurrido = REDUCE ? ENTRADA : 0; est.pos = est.objetivo = 0; est.mx = est.my = est.smx = est.smy = 0;
    est.seleccion = -1; copias.forEach((c) => { c.velGiro = 0; c.xPrev = null; }); anunciarSeleccion();
  }

  /* --- Entrada: arrastre (carrusel o giro del módulo central), clic en vecinos, rueda, teclas --- */
  const rayo = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function golpe(e) {
    const b = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    rayo.setFromCamera(ndc, camara);
    const h = rayo.intersectObjects(objetos, true)[0];
    return h ? h.object.userData.idx : -1;
  }
  const alPresionar = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const idx = golpe(e);
    est.arrastre = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ux: e.clientX, ut: performance.now(), ultDelta: 0, modo: null, idx,
      giroCentral: idx >= 0 && idx === indiceCentral() };
  };
  const alMover = (e) => {
    const b = seccion.getBoundingClientRect();
    est.mx = e.clientX - (b.left + b.width / 2); est.my = e.clientY - (b.top + b.height / 2);
    const a = est.arrastre; if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x0, dy = e.clientY - a.y0;
    if (!a.modo) {
      if (Math.hypot(dx, dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { est.arrastre = null; return; }   // gesto vertical: se deja el desplazamiento nativo
      a.modo = a.giroCentral ? "giro" : "carrusel";
      try { seccion.setPointerCapture(e.pointerId); } catch (_) {}
      seccion.classList.add("cc-carrusel--arrastrando");
    }
    const d = e.clientX - a.ux, ahora = performance.now();
    if (a.modo === "carrusel") est.objetivo -= (d * 0.02) / 3.5;    // misma sensibilidad que el original (0.02 por px con paso 3.5)
    else { const c = copias[a.idx]; c.giro += d * 0.6; c.velGiro = (d * 0.6) / Math.max(0.008, (ahora - a.ut) / 1000); }
    a.ultDelta = d; a.ux = e.clientX; a.ut = ahora;
  };
  const alSoltar = (e) => {
    const a = est.arrastre; if (!a || a.id !== e.pointerId) return;
    est.arrastre = null; seccion.classList.remove("cc-carrusel--arrastrando");
    if (a.modo === "carrusel") {
      if (performance.now() - a.ut < 100) est.objetivo += (-a.ultDelta * 0.16) / 3.5;
      est.objetivo = Math.round(est.objetivo); if (REDUCE) est.pos = est.objetivo; anunciarSeleccion();
    } else if (a.modo === "giro") {
      const c = copias[a.idx]; c.velGiro = clamp(performance.now() - a.ut < 100 ? c.velGiro : 0, -900, 900);
    } else if (a.idx >= 0 && a.idx !== indiceCentral()) {
      mover(envolver(a.idx - est.pos, -N / 2, N / 2) > 0 ? 1 : -1);
    }
  };
  const alRueda = (e) => {
    if (e.ctrlKey) return;                       // zoom con pellizco del navegador
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 2) return;
    e.preventDefault();
    const ahora = performance.now(); if (ahora - est.ultimaRueda < 280) return;
    est.ultimaRueda = ahora; mover(d > 0 ? 1 : -1);
  };
  const alTecla = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); mover(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); mover(-1); }
  };
  const alClic = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.tipo) irATipo(b.dataset.tipo);
    else if (b.dataset.a === "anterior") mover(-1);
    else if (b.dataset.a === "siguiente") mover(1);
    else if (b.dataset.a === "repetir") repetir();
    else if (b.dataset.a === "pausa") { est.pausado = !est.pausado; marcarPausa(); }
  };
  const alCambiarReduce = () => {
    REDUCE = reduceMQ.matches;
    if (REDUCE) { est.transcurrido = Math.max(est.transcurrido, ENTRADA); est.pos = est.objetivo; est.pausado = true; marcarPausa(); }
  };
  canvas.addEventListener("pointerdown", alPresionar);
  seccion.addEventListener("pointermove", alMover);
  seccion.addEventListener("pointerup", alSoltar);
  seccion.addEventListener("pointercancel", alSoltar);
  seccion.addEventListener("wheel", alRueda, { passive: false });
  seccion.addEventListener("keydown", alTecla);
  seccion.addEventListener("click", alClic);
  reduceMQ.addEventListener("change", alCambiarReduce);

  /* --- Bucle --- */
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), wp = new THREE.Vector3();
  let visible = true, oculto = document.hidden, raf = 0, previo = performance.now();
  function revisarCiclo(c) {
    c.m.frente.getWorldQuaternion(q); c.m.frente.getWorldPosition(wp);
    v3.set(0, 0, 1).applyQuaternion(q);
    const vis = v3.dot(wp.sub(camara.position).negate()) > 0;
    if (vis !== c.frenteVisible && c.n > 2) {
      if (!vis) { c.idxF = c.sig; c.m.mf.map = c.lista[c.idxF]; } else { c.idxR = c.sig; c.m.mr.map = c.lista[c.idxR]; }
      c.sig = (c.sig + 1) % c.n;
    }
    c.frenteVisible = vis;
  }
  /* Al dar la vuelta al bucle (fuera de cuadro) el módulo regresa con dos diseños nuevos */
  function nuevaVuelta(c) {
    c.vueltas++;
    c.idxF = c.sig; c.idxR = (c.sig + 1) % c.n; c.sig = (c.sig + 2) % c.n;
    c.m.mf.map = c.lista[c.idxF]; c.m.mr.map = c.lista[c.idxR];
  }
  function cuadro(ahora) {
    raf = 0;
    const dtReal = Math.min(0.05, (ahora - previo) / 1000); previo = ahora;
    const anima = !est.pausado;                   // con movimiento reducido arranca en pausa; si la persona da Reproducir, se anima
    const dt = anima ? dtReal : 0;                // la pausa congela línea de tiempo y reloj
    est.transcurrido += dt;
    const T = est.transcurrido;
    const k = 1 - Math.exp(-10 * dtReal);
    if (!est.arrastre) est.objetivo = Math.round(est.objetivo);
    est.pos = REDUCE ? est.objetivo : est.pos + (est.objetivo - est.pos) * k;
    est.smx += (est.mx - est.smx) * k; est.smy += (est.my - est.smy) * k;

    const qE = power4Out((T - 2) / 2.5), abierto = T >= ENTRADA;
    const espaciado = abierto ? 1 : lerp(10, 1, qE), ola = abierto ? 1 : qE;
    camara.position.set(0, 0, zCamara(T)); camara.lookAt(0, 0, 0);
    let luz = 30 * power4Out(T / 2.5); if (T >= 2) luz = lerp(30, L.focoMax, qE);
    focos.forEach((f) => { f.intensity = (luz / 2) * L.factorFoco; f.angle = Math.PI / 4 * (2 - qE); });

    const e = 3.5 / paso;   // conserva la forma de la ola original aunque los módulos estén más separados
    for (const c of copias) {
      const lugar = envolver(c.i - est.pos, -N / 2, N / 2);
      if (c.xPrev !== null && Math.abs(lugar - c.xPrev) > N / 2) nuevaVuelta(c);
      c.xPrev = lugar;
      const x = lugar * paso;
      const cx = x * espaciado, inf = clamp(1 - Math.abs(lugar), 0, 1);
      const s = c.soporte;
      s.position.set(cx, Math.sin(cx * 0.25 * ratio * e * ola), (-Math.abs(x) * e - 0.2) * ola);
      s.rotation.set(-Math.PI / 9 * ola + (est.smy / 1280) * 0.2 * inf, (cx * 0.5 * e - Math.PI / 9) * ola + (est.smx / 1280) * 0.2 * inf, Math.PI / 16 * ola);
      s.scale.setScalar(1.2);
      /* funciones del módulo: giro sobre su eje (con inercia si lo giraste), flotado y ciclo */
      const tocando = est.arrastre && est.arrastre.modo === "giro" && est.arrastre.idx === c.i;
      if (!tocando) {
        if (Math.abs(c.velGiro) > 2) { c.giro += c.velGiro * dtReal; c.velGiro *= Math.pow(0.04, dtReal); }
        else { c.velGiro = 0; c.giro += 34 * dt; }
      }
      const giroEntrada = abierto ? 0 : (Math.PI / 9) * (1 - qE) * inf;
      c.m.pieza.rotation.y = THREE.MathUtils.degToRad(c.giro) + giroEntrada;
      c.m.pieza.position.y = Math.sin(est.transcurrido * 1.6 + c.fase) * 0.12;
    }
    escena.updateMatrixWorld();
    for (const c of copias) revisarCiclo(c);
    renderer.render(escena, camara); est.cuadros++;
    if (visible && !oculto) raf = requestAnimationFrame(cuadro);
  }
  function reanudar() { if (!raf && visible && !oculto) { previo = performance.now(); raf = requestAnimationFrame(cuadro); } }
  const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; reanudar(); });
  io.observe(seccion);
  const alVisibilidad = () => { oculto = document.hidden; reanudar(); };
  document.addEventListener("visibilitychange", alVisibilidad);

  seccion.querySelector(".cc-carrusel__cargando").remove();
  seccion.classList.add("cc-carrusel--listo");
  if (REDUCE) est.transcurrido = ENTRADA;
  marcarPausa(); anunciarSeleccion(); reanudar();

  const api = {
    estado: () => ({ pos: est.pos, objetivo: est.objetivo, central: indiceCentral(), tipo: ORDEN[indiceCentral()],
      transcurrido: est.transcurrido, cuadros: est.cuadros, pausado: est.pausado, paso, medioVisible,
      ciclo: copias.map((c) => [c.idxF + 1, c.idxR + 1]), vueltas: copias.map((c) => c.vueltas), giroCentral: copias[indiceCentral()].giro }),
    /* para pruebas: congela todo y pone el módulo central en un ángulo */
    pose(grados) { est.pausado = true; marcarPausa(); const c = copias[indiceCentral()]; c.giro = grados; c.velGiro = 0; },
    mover, irATipo, repetir,
    desmontar() {
      cancelAnimationFrame(raf); raf = 0; io.disconnect(); ro.disconnect();
      canvas.removeEventListener("pointerdown", alPresionar);
      seccion.removeEventListener("pointermove", alMover); seccion.removeEventListener("pointerup", alSoltar);
      seccion.removeEventListener("pointercancel", alSoltar); seccion.removeEventListener("wheel", alRueda);
      seccion.removeEventListener("keydown", alTecla); seccion.removeEventListener("click", alClic);
      reduceMQ.removeEventListener("change", alCambiarReduce); document.removeEventListener("visibilitychange", alVisibilidad);
      copias.forEach((c) => c.m.liberar()); rec.liberar();
      Object.values(texturas).flat().forEach((t) => t.dispose());
      if (escena.background) escena.background.dispose();
      entorno.dispose(); pmrem.dispose(); renderer.dispose();
    }
  };
  seccion.ccCarrusel = api;
  return api;
}

if (typeof window !== "undefined") {
  window.CCCarrusel = { montar };
  const auto = () => document.querySelectorAll("[data-cc-carrusel]").forEach((el) => montar(el).catch((err) => {
    let c = el.querySelector(".cc-carrusel__cargando");
    if (!c) { el.classList.add("cc-carrusel"); el.innerHTML = '<div class="cc-carrusel__cargando" role="alert"></div>'; c = el.firstChild; }
    c.textContent = err.message;
    console.error(err);
  }));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
}
