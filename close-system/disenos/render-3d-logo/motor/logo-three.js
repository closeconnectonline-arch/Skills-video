/* Logo 3D Close System · motor three.js v1
   Derivado del motor de `modulo-3d-three-proplus-ciclo` (el original no se modificó): mismo estudio
   (RoomEnvironment, luz principal con sombras VSM, contraluces, softbox), misma interacción y pausa.
   En lugar de un módulo, arma un logotipo en relieve a partir de un SVG por capas:
     base   → placa cromada con el contorno del logo; al frente lleva el campo negro con destellos
     borde  → orilla cromada en relieve
     bandas → anillos y trazos: esmalte blanco con cantos cromados
     letras → letras y estrellas: esmalte blanco más alto, con bisel cromado redondeado
   Medidas en cm. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const REDUCE = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Alto, bisel y material de cada capa (sobre la cara de la placa) */
const CAPAS = {
  borde:  { alto: 0.09, bisel: 0.06, ancho: 0.05,  pasos: 6, tapa: "cromo" },
  bandas: { alto: 0.1,  bisel: 0.06, ancho: 0.03, pasos: 6, tapa: "esmalte" },
  letras: { alto: 0.22, bisel: 0.12, ancho: 0.045, pasos: 10, tapa: "esmalte", afuera: true }
};

/* ---------- Texturas procedurales ---------- */
function lienzo(w, h, pintar) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  pintar(c.getContext("2d"), w, h); return c;
}
function texturaCanvas(c, srgb, repetir) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repetir[0], repetir[1]); }
  t.anisotropy = 8;
  return t;
}
/* Campo negro con destellos finos (como el del logo original) */
function destellos() {
  const color = lienzo(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#0c0c0e"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const v = 60 + Math.random() * 160 | 0, s = Math.random() < 0.85 ? 1 : 2;
      ctx.fillStyle = `rgb(${v},${v},${v + 6})`; ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  });
  const rug = lienzo(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#8a8a8a"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { ctx.fillStyle = "#151515"; ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
  });
  return { map: texturaCanvas(color, true, [1.6, 1.6]), roughnessMap: texturaCanvas(rug, false, [1.6, 1.6]) };
}
/* Micro-variación del cromo pulido (evita un espejo "de computadora") */
function pulido() {
  return texturaCanvas(lienzo(256, 256, (ctx, w, h) => {
    const img = ctx.createImageData(w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 30 + Math.random() * 22; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
  }), false, [3, 3]);
}
function sombraSuave() {
  return texturaCanvas(lienzo(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(0,0,0,.9)"); g.addColorStop(0.45, "rgba(0,0,0,.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }), false);
}
function fondoEstudio() {
  return texturaCanvas(lienzo(1024, 1024, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.45, w * 0.78);
    g.addColorStop(0, "#34383f"); g.addColorStop(0.45, "#1d1f24"); g.addColorStop(1, "#08090b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }), true);
}
/* Entorno para el cromo: el cuarto de estudio + tiras de luz que dibujan reflejos largos */
function entornoCromo(renderer) {
  const sala = new RoomEnvironment();
  const tira = (x, y, z, sx, sy, ry, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = ry; sala.add(m);
  };
  tira(0, 9, 13, 26, 1.6, 0, 9);     // franja alta al frente: reflejo horizontal sobre letras
  tira(-13, 2, 6, 1.4, 10, 1.2, 5);  // columna izquierda
  tira(13, 4, 2, 1.4, 10, -1.3, 4);  // columna derecha
  tira(0, -4, 12, 26, 3, 0, 2.2);    // rebote del piso
  const pmrem = new THREE.PMREMGenerator(renderer);
  return pmrem.fromScene(sala, 0.035).texture;
}

/* ---------- Materiales ---------- */
function materiales() {
  const rug = pulido();
  const cromo = new THREE.MeshPhysicalMaterial({
    color: 0xf4f6fa, metalness: 1, roughness: 0.075, roughnessMap: rug, envMapIntensity: 1.35,
    clearcoat: 0.4, clearcoatRoughness: 0.03
  });
  const esmalte = new THREE.MeshPhysicalMaterial({
    color: 0xf3f2ee, metalness: 0, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05,
    sheen: 0.25, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.85
  });
  const d = destellos();
  const campo = new THREE.MeshPhysicalMaterial({
    map: d.map, roughness: 1, roughnessMap: d.roughnessMap, metalness: 0.55,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9
  });
  return { cromo, esmalte, campo };
}

/* ---------- Geometrías a partir del SVG ---------- */
async function leerCapas(url) {
  const texto = await (await fetch(url)).text();
  const datos = new SVGLoader().parse(texto);
  const vb = datos.xml.getAttribute("viewBox").split(/[ ,]+/).map(Number);
  const capas = {};
  for (const p of datos.paths) {
    const nodo = p.userData.node, nombre = nodo.getAttribute("data-capa") || nodo.id;
    if (!nombre) continue;
    capas[nombre] = (capas[nombre] || []).concat(p.toShapes(true));
  }
  return { capas, ancho: vb[2], alto: vb[3] };
}
/* Extrusión con bisel redondeado. Hacia adentro (bevelOffset negativo) el borde queda en el contorno del dibujo;
   hacia afuera (afuera = true) la tapa no se deforma nunca: el SVG trae la tapa ya adelgazada y el bisel crece hasta el contorno */
function relieve(formas, alto, bisel, ancho, pasos, afuera) {
  const g = new THREE.ExtrudeGeometry(formas, {
    depth: Math.max(0.001, alto - bisel), bevelEnabled: true, bevelThickness: bisel, bevelSize: ancho,
    bevelOffset: afuera ? 0 : -ancho, bevelSegments: pasos, curveSegments: 2
  });
  return g;
}
/* Separa la tapa superior (z = zTapa) del resto para darle otro material */
function tapaYCantos(g, zTapa) {
  const pos = g.attributes.position, idx = g.index.array, arriba = [], resto = [];
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [idx[t], idx[t + 1], idx[t + 2]];
    (tri.every((i) => pos.getZ(i) > zTapa - 1e-4) ? arriba : resto).push(...tri);
  }
  g.setIndex(arriba.concat(resto));
  g.clearGroups(); g.addGroup(0, arriba.length, 0); g.addGroup(arriba.length, resto.length, 1);
  return g;
}
/* Pasa de píxeles del SVG (Y hacia abajo) a cm centrados; corrige el giro de los triángulos
   que produce el espejo y suaviza normales para que los biseles se vean redondos */
function aCm(g, esc, ancho, alto, conservarUV) {
  g.scale(esc, -esc, 1); g.translate(-ancho / 2, alto / 2, 0);
  if (!conservarUV) { g.deleteAttribute("uv"); g.deleteAttribute("normal"); g = mergeVertices(g, 1e-5); }
  if (!g.index) g = mergeVertices(g, 0);
  const ix = g.index.array;
  for (let t = 0; t < ix.length; t += 3) { const a = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = a; }
  g.index.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/* ---------- Montaje ---------- */
export async function montar(raiz, opciones = {}) {
  const dato = (k, d) => (opciones[k] !== undefined ? opciones[k] : (raiz.dataset[k] !== undefined ? raiz.dataset[k] : d));
  const svg = dato("svg", "close-system-logo.svg");
  const anchoCm = parseFloat(dato("ancho", 12));          // ancho real del logo
  const grosor = parseFloat(dato("grosor", 0.32));        // placa cromada
  const dosCaras = dato("caras", "2") !== "1";            // 2 = logo al frente y atrás; 1 = reverso cromado liso
  const velocidad = parseFloat(dato("velocidad", 30));
  const flotar = parseFloat(dato("flotar", 0.3)), altura = parseFloat(dato("altura", 0.9));
  const inclinacion = parseFloat(dato("inclinacion", -9));
  const titulo = dato("titulo", ""), subtitulo = dato("subtitulo", "Arrastra para girar");

  raiz.classList.add("l3t");
  raiz.innerHTML =
    '<canvas class="l3t__lienzo" role="img" aria-label="Logotipo Close System en 3D, cromado, girando"></canvas>' +
    '<div class="l3t__cargando">Cargando logotipo…</div>' +
    '<div class="l3t__pie">' +
    (titulo ? '<div class="l3t__titulo"><strong></strong><span></span></div>' : "") +
    (dato("controles", "si") === "no" ? "" :
      '<div class="l3t__controles"><button type="button" data-accion="girar" aria-pressed="true">Girando</button>' +
      '<button type="button" data-accion="frente">Frente</button><button type="button" data-accion="perfil">Perfil</button></div>') +
    "</div>";
  if (titulo) {
    raiz.querySelector(".l3t__titulo strong").textContent = titulo;
    raiz.querySelector(".l3t__titulo span").textContent = subtitulo;
  }
  const lienzoEl = raiz.querySelector("canvas");

  /* Renderizador */
  const renderer = new THREE.WebGLRenderer({ canvas: lienzoEl, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opciones.captura });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opciones.dpr || 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const escena = new THREE.Scene();
  escena.background = fondoEstudio();
  escena.environment = entornoCromo(renderer);
  escena.environmentIntensity = 0.9;

  /* Luz de estudio (igual que el motor de módulos) */
  const principal = new THREE.DirectionalLight(0xfff4e8, 2.2);
  principal.position.set(3, 16, 6);
  principal.castShadow = true;
  principal.shadow.mapSize.set(1024, 1024);
  principal.shadow.radius = 22; principal.shadow.blurSamples = 25; principal.shadow.bias = -0.0004;
  Object.assign(principal.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
  escena.add(principal);
  const contra1 = new THREE.SpotLight(0xcfe3ff, 60, 40, 0.5, 0.8, 1.6); contra1.position.set(-9, 8, -8);
  const contra2 = new THREE.SpotLight(0xffffff, 45, 40, 0.5, 0.8, 1.6); contra2.position.set(9, 5, -6);
  const relleno = new THREE.HemisphereLight(0xdfe8ff, 0x2a2420, 0.3);
  escena.add(contra1, contra2, relleno);
  RectAreaLightUniformsLib.init();
  const softbox = new THREE.RectAreaLight(0xffffff, 3, 12, 5);
  softbox.position.set(-7, 9, 9); softbox.lookAt(0, 3, 0); escena.add(softbox);

  const piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.3 }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; escena.add(piso);
  const contacto = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: sombraSuave(), transparent: true, depthWrite: false, opacity: 0.8 }));
  contacto.rotation.x = -Math.PI / 2; contacto.position.y = 0.003; escena.add(contacto);

  /* Logotipo */
  const { capas, ancho: anchoSvg, alto: altoSvg } = await leerCapas(svg);
  if (!capas.base) throw new Error("El SVG necesita una capa con data-capa=\"base\"");
  const esc = anchoCm / anchoSvg, ancho = anchoCm, alto = altoSvg * esc;
  const mat = materiales();
  const pieza = new THREE.Group(); escena.add(pieza);
  const logo = new THREE.Group(); pieza.add(logo);
  /* El SVG crece hacia abajo: escalamos con Y invertida y centramos */
  const ajustar = (g, uv) => aCm(g, esc, ancho, alto, uv);

  /* Placa base cromada (Y invertida voltea las normales: se corrige con side) */
  const bBase = 0.05;
  const gBase = ajustar(new THREE.ExtrudeGeometry(capas.base, {
    depth: grosor - 2 * bBase, bevelEnabled: true, bevelThickness: bBase, bevelSize: bBase * 0.8 / esc,
    bevelOffset: -bBase * 0.8 / esc, bevelSegments: 6, curveSegments: 2
  }));
  gBase.translate(0, 0, -(grosor - 2 * bBase) / 2);
  const placa = new THREE.Mesh(gBase, mat.cromo); placa.castShadow = true; logo.add(placa);

  function cara() {
    const g = new THREE.Group();
    /* Campo negro: superficie plana sobre la placa */
    const gc = ajustar(new THREE.ShapeGeometry(capas.base, 2), true);
    const pc = gc.attributes.position, uv = gc.attributes.uv;
    for (let i = 0; i < pc.count; i++) uv.setXY(i, pc.getX(i) / 2, pc.getY(i) / 2);
    const campo = new THREE.Mesh(gc, mat.campo);
    campo.position.z = 0.0015; g.add(campo);
    for (const nombre of ["borde", "bandas", "letras"]) {
      if (!capas[nombre]) continue;
      const c = CAPAS[nombre];
      let gr = ajustar(relieve(capas[nombre], c.alto, c.bisel, c.ancho / esc, c.pasos, c.afuera));
      const zTapa = c.alto;   // tapa superior en z = alto (depth + bevelThickness)
      gr = tapaYCantos(gr, zTapa);
      const m = new THREE.Mesh(gr, [c.tapa === "cromo" ? mat.cromo : mat.esmalte, mat.cromo]); m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
    return g;
  }
  const frente = cara(); frente.position.z = grosor / 2; logo.add(frente);
  if (dosCaras) { const atras = cara(); atras.rotation.y = Math.PI; atras.position.z = -grosor / 2; logo.add(atras); }

  const yLogo = altura + alto / 2, alturaTotal = yLogo + alto / 2;
  logo.position.y = yLogo;
  const sombraEsc = [ancho * 0.92, Math.max(1.6, ancho * 0.2)];
  contacto.scale.set(sombraEsc[0], sombraEsc[1], 1);

  /* Cámara */
  const camara = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  const centroY = alturaTotal * 0.5;
  function encuadrar() {
    const w = raiz.clientWidth || 800, h = raiz.clientHeight || 600;
    renderer.setSize(w, h, false); camara.aspect = w / h;
    const tam = Math.max(alturaTotal * 1.15, ancho * 1.08 / Math.min(1, camara.aspect));
    const dist = (tam / 2) / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * 1.08;
    const inc = THREE.MathUtils.degToRad(-inclinacion);
    camara.position.set(0, centroY + Math.sin(inc) * dist, Math.cos(inc) * dist);
    camara.lookAt(0, centroY - alturaTotal * 0.1, 0);
    camara.updateProjectionMatrix();
  }
  encuadrar();
  new ResizeObserver(encuadrar).observe(raiz);

  /* Interacción (igual que el motor de módulos) */
  let ry = parseFloat(dato("inicio", 0));
  let auto = !REDUCE, vel = velocidad, arrastrando = false, ultX = 0, ultT = 0, inercia = 0, objetivo = null;
  const btnGirar = raiz.querySelector('[data-accion="girar"]');
  const marcar = () => { if (btnGirar) { btnGirar.setAttribute("aria-pressed", String(auto)); btnGirar.textContent = auto ? "Girando" : "Pausa"; } };
  lienzoEl.addEventListener("pointerdown", (e) => { arrastrando = true; objetivo = null; inercia = 0; ultX = e.clientX; ultT = performance.now(); lienzoEl.setPointerCapture(e.pointerId); });
  lienzoEl.addEventListener("pointermove", (e) => {
    if (!arrastrando) return;
    const ahora = performance.now(), dx = e.clientX - ultX;
    ry += dx * 0.6; inercia = (dx * 0.6) / Math.max(0.008, (ahora - ultT) / 1000); ultX = e.clientX; ultT = ahora;
  });
  const soltar = () => { if (!arrastrando) return; arrastrando = false; vel = 0; inercia = Math.max(-900, Math.min(900, inercia)); };
  lienzoEl.addEventListener("pointerup", soltar); lienzoEl.addEventListener("pointercancel", soltar);
  raiz.querySelectorAll("[data-accion]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.accion;
    if (a === "girar") { auto = !auto; objetivo = null; vel = auto ? 0 : vel; }
    else { auto = false; inercia = 0; const base = a === "frente" ? 0 : 62; objetivo = base + Math.round((ry - base) / 360) * 360; }
    marcar();
  }));

  let visible = !document.hidden;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(raiz);

  raiz.querySelector(".l3t__cargando").remove();
  let previo = performance.now(), t = 0;
  function dibujar() {
    pieza.rotation.y = THREE.MathUtils.degToRad(ry);
    const flota = REDUCE ? 0 : (Math.sin(t * 1.6) * 0.5 + 0.5) * flotar;
    pieza.position.y = flota;
    const lejos = flotar ? flota / flotar : 0;
    contacto.material.opacity = 0.78 - lejos * 0.28;
    contacto.scale.set(sombraEsc[0] * (1 + lejos * 0.12) * Math.max(0.35, Math.abs(Math.cos(pieza.rotation.y))), sombraEsc[1] * (1 + lejos * 0.12), 1);
    renderer.render(escena, camara);
  }
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - previo) / 1000); previo = ahora;
    if (visible && !document.hidden) {
      t += dt;
      if (!arrastrando) {
        if (objetivo !== null) { ry += (objetivo - ry) * Math.min(1, dt * 5); if (Math.abs(objetivo - ry) < 0.05) ry = objetivo; }
        else if (Math.abs(inercia) > 2) { ry += inercia * dt; inercia *= Math.pow(0.04, dt); }
        else if (auto) { inercia = 0; vel += (velocidad - vel) * Math.min(1, dt * 2); ry += vel * dt; }
      }
      dibujar();
    }
    if (!opciones.captura) requestAnimationFrame(cuadro);
  }
  if (opciones.captura) dibujar(); else requestAnimationFrame(cuadro);

  const api = {
    pose: (grados, tiempo) => { ry = grados; if (tiempo !== undefined) t = tiempo; auto = false; marcar(); dibujar(); },
    renderer
  };
  raiz.l3t = api;
  return api;
}

export function montarTodos() {
  return Promise.all([...document.querySelectorAll("[data-logo-three]")].map((el) => montar(el)));
}
if (typeof window !== "undefined") {
  window.LogoThree = { montar, montarTodos };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarTodos); else montarTodos();
}
