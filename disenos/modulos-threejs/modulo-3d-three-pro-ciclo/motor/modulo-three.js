/* Módulo 3D Close Connect · motor three.js v1 (copia de trabajo, no reemplaza a los motores CSS)
   Acrílico con transmisión real (IOR 1.49), luz de estudio HDR (RoomEnvironment), sombras suaves,
   vinil satinado con laminado brillante, MDF procedural con canto quemado por láser y ciclo de diseños
   (cada cara cambia al siguiente diseño cuando queda de espaldas). Medidas en cm. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

const MODELOS = {
  pro:      { forma: "circulo", diametro: 10, grosor: 0.3, base: "acrilico", inclinacion: -13, flotar: 0 },
  proplus:  { forma: "circulo", diametro: 7,  grosor: 0.3, base: null,       inclinacion: -10, flotar: 0.35, altura: 0.9 },
  personal: { forma: "tarjeta", ancho: 8.5, alto: 5.4, grosor: 0.2, radio: 0.3, base: null, inclinacion: -10, flotar: 0.3, altura: 0.9 },
  estandar: { forma: "tarjeta", ancho: 5.4, alto: 8.5, grosor: 0.2, radio: 0.3, base: "mdf", inclinacion: -12, flotar: 0.25, altura: 0.35 }
};
const REDUCE = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const BISEL = 0.025;

/* ---------- Texturas procedurales ---------- */
function lienzo(w, h, pintar) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  pintar(c.getContext("2d"), w, h); return c;
}
function ruido(ctx, w, h, fuerza, base) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * fuerza;
    d[i] = Math.max(0, Math.min(255, (base ? base[0] : d[i]) + n));
    d[i + 1] = Math.max(0, Math.min(255, (base ? base[1] : d[i + 1]) + n));
    d[i + 2] = Math.max(0, Math.min(255, (base ? base[2] : d[i + 2]) + n));
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
function texturaCanvas(c, srgb, repetir) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repetir[0], repetir[1]); }
  return t;
}
/* Rugosidad satinada del vinil laminado (micro-variación, sin patrón visible) */
function mapaSatinado() {
  return texturaCanvas(lienzo(256, 256, (ctx, w, h) => { ruido(ctx, w, h, 26, [150, 150, 150]); }), false, [6, 6]);
}
/* MDF crudo: grano fino moteado + fibras suaves */
function mdfCara() {
  return lienzo(1024, 512, (ctx, w, h) => {
    ruido(ctx, w, h, 20, [168, 132, 96]);
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 4 + Math.random() * 14;
      ctx.strokeStyle = Math.random() < 0.5 ? "rgba(120,84,50,.18)" : "rgba(222,190,150,.16)";
      ctx.lineWidth = 0.6 + Math.random() * 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * Math.cos(Math.random() * 6.28), y + l * Math.sin(Math.random() * 6.28)); ctx.stroke();
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${90 + Math.random() * 40},${60 + Math.random() * 25},${35},${0.15 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  });
}
/* Canto cortado con láser: más oscuro, fibras en capas y orillas quemadas */
function mdfCanto() {
  return lienzo(1024, 256, (ctx, w, h) => {
    ruido(ctx, w, h, 26, [112, 76, 46]);
    for (let y = 0; y < h; y += 1) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? "60,38,20" : "150,108,70"},${Math.random() * 0.12})`;
      ctx.fillRect(0, y, w, 1);
    }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(28,16,8,.85)"); g.addColorStop(0.12, "rgba(40,24,12,.25)");
    g.addColorStop(0.5, "rgba(0,0,0,0)");
    g.addColorStop(0.88, "rgba(40,24,12,.25)"); g.addColorStop(1, "rgba(28,16,8,.85)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
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

/* ---------- Materiales ---------- */
function acrilico(grosor, tinte) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.035, transmission: 1, thickness: grosor,
    ior: 1.49, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.02,
    attenuationColor: new THREE.Color(tinte || 0xd4efe8), attenuationDistance: 1.6,
    envMapIntensity: 1.25
  });
}
function cantoAcrilico() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe6f7f2, metalness: 0, roughness: 0.06, transmission: 0.75, thickness: 0.6, ior: 1.49,
    attenuationColor: new THREE.Color(0x9fdccd), attenuationDistance: 0.8,
    clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 2.6
  });
}
function vinil(mapa, satinado) {
  return new THREE.MeshPhysicalMaterial({
    map: mapa, roughness: 0.38, roughnessMap: satinado, metalness: 0,
    clearcoat: 0.75, clearcoatRoughness: 0.14, specularIntensity: 0.6,
    alphaTest: 0.5, alphaToCoverage: true, envMapIntensity: 0.9
  });
}

/* ---------- Geometrías ---------- */
function rectRedondo(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function circulo(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function placa(forma, grosor) {
  const g = new THREE.ExtrudeGeometry(forma, {
    depth: grosor - 2 * BISEL, bevelEnabled: true, bevelThickness: BISEL, bevelSize: BISEL,
    bevelSegments: 6, curveSegments: 128
  });
  g.translate(0, 0, -(grosor - 2 * BISEL) / 2);
  g.computeVertexNormals();
  return g;
}
function superficie(forma, w, h) {
  const g = new THREE.ShapeGeometry(forma, 128), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return g;
}

/* ---------- Montaje ---------- */
export async function montar(raiz, opciones = {}) {
  const dato = (k, d) => (opciones[k] !== undefined ? opciones[k] : (raiz.dataset[k] !== undefined ? raiz.dataset[k] : d));
  const clave = dato("modelo", "pro");
  const M = Object.assign({}, MODELOS[clave]);
  const caras = typeof dato("caras") === "string" ? JSON.parse(dato("caras")) : dato("caras", []);
  const velocidad = parseFloat(dato("velocidad", 34));
  const titulo = dato("titulo", ""), subtitulo = dato("subtitulo", "Arrastra para girar");

  raiz.classList.add("m3t");
  raiz.innerHTML =
    '<canvas class="m3t__lienzo" aria-label="Módulo 3D girando"></canvas>' +
    '<div class="m3t__cargando">Cargando diseños…</div>' +
    '<div class="m3t__pie">' +
    (titulo ? '<div class="m3t__titulo"><strong></strong><span></span><em class="m3t__contador"></em></div>' : "") +
    (dato("controles", "si") === "no" ? "" :
      '<div class="m3t__controles"><button type="button" data-accion="girar" aria-pressed="true">Girando</button>' +
      '<button type="button" data-accion="frente">Frente</button><button type="button" data-accion="reverso">Reverso</button></div>') +
    "</div>";
  if (titulo) {
    raiz.querySelector(".m3t__titulo strong").textContent = titulo;
    raiz.querySelector(".m3t__titulo span").textContent = subtitulo;
  }
  const lienzoEl = raiz.querySelector("canvas");

  /* Renderizador */
  const renderer = new THREE.WebGLRenderer({ canvas: lienzoEl, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opciones.captura });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opciones.dpr || 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;   // fiel al color de los diseños
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const escena = new THREE.Scene();
  escena.background = fondoEstudio();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.55;

  /* Luz de estudio: principal suave, dos contraluces fríos para los cantos y relleno */
  const principal = new THREE.DirectionalLight(0xfff4e8, 2.4);
  principal.position.set(3, 16, 6);
  principal.castShadow = true;
  principal.shadow.mapSize.set(1024, 1024);
  principal.shadow.radius = 22; principal.shadow.blurSamples = 25; principal.shadow.bias = -0.0004;
  Object.assign(principal.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  escena.add(principal);
  const contra1 = new THREE.SpotLight(0xcfe3ff, 60, 40, 0.5, 0.8, 1.6); contra1.position.set(-9, 8, -8);
  const contra2 = new THREE.SpotLight(0xffffff, 45, 40, 0.5, 0.8, 1.6); contra2.position.set(9, 5, -6);
  const relleno = new THREE.HemisphereLight(0xdfe8ff, 0x2a2420, 0.35);
  escena.add(contra1, contra2, relleno);
  /* Softbox: barre un reflejo suave sobre el laminado al girar */
  RectAreaLightUniformsLib.init();
  const softbox = new THREE.RectAreaLight(0xffffff, 3.2, 10, 5);
  softbox.position.set(-7, 9, 9); softbox.lookAt(0, 3, 0); escena.add(softbox);

  /* Piso: solo sombras + sombra de contacto */
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.3 }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; escena.add(piso);
  const contacto = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: sombraSuave(), transparent: true, depthWrite: false, opacity: 0.8 }));
  contacto.rotation.x = -Math.PI / 2; contacto.position.y = 0.003; escena.add(contacto);

  /* Texturas de diseños (precarga completa) */
  const cargador = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const texturas = await Promise.all(caras.map((src) => new Promise((ok, mal) => cargador.load(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; t.minFilter = THREE.LinearMipmapLinearFilter; ok(t);
  }, undefined, mal))));
  const satinado = mapaSatinado();

  /* Pieza (todo lo que gira) */
  const pieza = new THREE.Group(); escena.add(pieza);
  const modulo = new THREE.Group(); pieza.add(modulo);
  let ancho, alto, formaPlaca, formaVinil;
  if (M.forma === "circulo") {
    const R = M.diametro / 2; ancho = alto = M.diametro;
    formaPlaca = circulo(R - BISEL); formaVinil = circulo(R - BISEL - 0.004);
  } else {
    ancho = M.ancho; alto = M.alto;
    formaPlaca = rectRedondo(ancho - 2 * BISEL, alto - 2 * BISEL, M.radio - BISEL);
    formaVinil = rectRedondo(ancho - 2 * BISEL - 0.008, alto - 2 * BISEL - 0.008, M.radio - BISEL - 0.004);
  }
  const placaMesh = new THREE.Mesh(placa(formaPlaca, M.grosor), [acrilico(M.grosor), cantoAcrilico()]);
  modulo.add(placaMesh);
  const geoVinil = superficie(formaVinil, ancho, alto);
  const matFrente = vinil(texturas[0], satinado), matReverso = vinil(texturas[1 % texturas.length], satinado);
  const frente = new THREE.Mesh(geoVinil, matFrente); frente.position.z = M.grosor / 2 + 0.0015;
  const reverso = new THREE.Mesh(geoVinil, matReverso); reverso.rotation.y = Math.PI; reverso.position.z = -(M.grosor / 2 + 0.0015);
  frente.castShadow = reverso.castShadow = true;
  modulo.add(frente, reverso);

  let yModulo, alturaTotal, sombraEsc;
  if (M.base === "acrilico") {
    /* Base 8 × 2.5 × 0.3 cm, esquinas 4 mm, ranura pasante 3 cm × 3.2 mm; el disco entra hasta que su cuerda = ranura */
    const L = 8, A = 2.5, G = 0.3, ranL = 3, ranA = M.grosor + 0.02;
    const s = rectRedondo(L, A, 0.4);
    const h = new THREE.Path(); h.moveTo(-ranL / 2, -ranA / 2); h.lineTo(ranL / 2, -ranA / 2); h.lineTo(ranL / 2, ranA / 2); h.lineTo(-ranL / 2, ranA / 2); h.lineTo(-ranL / 2, -ranA / 2);
    s.holes.push(h);
    const gb = new THREE.ExtrudeGeometry(s, { depth: G - 2 * 0.02, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 48 });
    gb.rotateX(-Math.PI / 2); gb.translate(0, 0.02, 0);
    const mb = acrilico(G, 0xc6ebe2); mb.envMapIntensity = 2.2;
    const base = new THREE.Mesh(gb, [mb, cantoAcrilico()]); base.receiveShadow = true;
    pieza.add(base);
    const R = M.diametro / 2, hundido = R - Math.sqrt(R * R - (ranL / 2) * (ranL / 2));
    yModulo = G - hundido + R;
    alturaTotal = yModulo + R; sombraEsc = [L * 1.25, A * 2.2];
  } else if (M.base === "mdf") {
    /* Base 5 × 2 × 1.2 cm, ranura 2 mm × 6 mm abierta en los extremos; la tarjeta entra hasta el fondo */
    const L = 5, F = 2, H = 1.2, ran = M.grosor, prof = 0.6;
    const tCara = texturaCanvas(mdfCara(), true), tCanto = texturaCanvas(mdfCanto(), true);
    const bump = texturaCanvas(mdfCara(), false);
    const mCara = new THREE.MeshStandardMaterial({ map: tCara, roughness: 0.88, bumpMap: bump, bumpScale: 0.6, envMapIntensity: 0.6 });
    const mCanto = new THREE.MeshStandardMaterial({ map: tCanto, roughness: 0.92, bumpMap: tCanto, bumpScale: 0.8, envMapIntensity: 0.5 });
    /* Perfil en U extruido a lo largo: una sola pieza, sin uniones visibles */
    const u = new THREE.Shape(), hr = ran / 2;
    u.moveTo(-F / 2, 0); u.lineTo(F / 2, 0); u.lineTo(F / 2, H); u.lineTo(hr, H); u.lineTo(hr, H - prof);
    u.lineTo(-hr, H - prof); u.lineTo(-hr, H); u.lineTo(-F / 2, H); u.lineTo(-F / 2, 0);
    let gm = new THREE.ExtrudeGeometry(u, { depth: L, bevelEnabled: false });
    gm.translate(0, 0, -L / 2); gm.rotateY(Math.PI / 2);          // ahora el largo va en X, el fondo en Z
    gm.computeVertexNormals();
    const pos = gm.attributes.position, nor = gm.attributes.normal, uv = gm.attributes.uv;
    gm.clearGroups();
    const tri = pos.count / 3, cara = [], canto = [];
    for (let i = 0; i < tri; i++) (Math.abs(nor.getY(i * 3)) > 0.5 ? cara : canto).push(i);
    const orden = cara.concat(canto), np = new Float32Array(pos.count * 3), nn = new Float32Array(pos.count * 3), nu = new Float32Array(pos.count * 2);
    orden.forEach((t, k) => {
      for (let v = 0; v < 3; v++) {
        const o = t * 3 + v, d = k * 3 + v, x = pos.getX(o), y = pos.getY(o), z = pos.getZ(o);
        np.set([x, y, z], d * 3); nn.set([nor.getX(o), nor.getY(o), nor.getZ(o)], d * 3);
        const ny = nor.getY(o), nx = nor.getX(o);
        if (Math.abs(ny) > 0.5) nu.set([(x + L / 2) / L, (z + F / 2) / F * 0.5], d * 2);
        else nu.set([Math.abs(nx) > 0.5 ? (z + F / 2) / F * 0.4 : (x + L / 2) / L, y / H], d * 2);
      }
    });
    gm = new THREE.BufferGeometry();
    gm.setAttribute("position", new THREE.BufferAttribute(np, 3)); gm.setAttribute("normal", new THREE.BufferAttribute(nn, 3)); gm.setAttribute("uv", new THREE.BufferAttribute(nu, 2));
    gm.addGroup(0, cara.length * 3, 0); gm.addGroup(cara.length * 3, canto.length * 3, 1);
    const mdf = new THREE.Mesh(gm, [mCara, mCanto]); mdf.castShadow = mdf.receiveShadow = true; pieza.add(mdf);
    yModulo = H - prof + alto / 2;
    alturaTotal = H - prof + alto; sombraEsc = [L * 1.5, F * 2.4];
    placaMesh.receiveShadow = true;
  } else {
    yModulo = (M.altura || 0.6) + alto / 2;
    alturaTotal = yModulo + alto / 2; sombraEsc = [ancho * 0.95, Math.max(1.6, ancho * 0.22)];
  }
  modulo.position.y = yModulo;
  contacto.scale.set(sombraEsc[0], sombraEsc[1], 1);

  /* Cámara */
  const camara = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  const centroY = alturaTotal * 0.5;
  function encuadrar() {
    const w = raiz.clientWidth || 800, h = raiz.clientHeight || 600;
    renderer.setSize(w, h, false); camara.aspect = w / h;
    const tam = Math.max(alturaTotal * 1.12, Math.max(ancho, M.base === "acrilico" ? 8 : 0) * 1.1 / Math.min(1, camara.aspect));
    const dist = (tam / 2) / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * 1.5;
    const inc = THREE.MathUtils.degToRad(-M.inclinacion);
    camara.position.set(0, centroY + Math.sin(inc) * dist, Math.cos(inc) * dist);
    camara.lookAt(0, centroY - alturaTotal * 0.13, 0);
    camara.updateProjectionMatrix();
  }
  encuadrar();
  new ResizeObserver(encuadrar).observe(raiz);

  /* Ciclo de diseños: cada cara cambia cuando queda de espaldas */
  const n = texturas.length;
  let idxFrente = 0, idxReverso = 1 % n, siguiente = 2 % n;
  let ry = parseFloat(dato("inicio", 20)), frenteVisible = true;
  const contador = raiz.querySelector(".m3t__contador");
  function revisarCiclo() {
    const vis = Math.cos(THREE.MathUtils.degToRad(ry)) > 0;
    if (vis !== frenteVisible && n > 2) {
      if (!vis) { idxFrente = siguiente; matFrente.map = texturas[idxFrente]; }
      else { idxReverso = siguiente; matReverso.map = texturas[idxReverso]; }
      siguiente = (siguiente + 1) % n;
    }
    frenteVisible = vis;
    if (contador) contador.textContent = "Diseño " + ((vis ? idxFrente : idxReverso) + 1) + " de " + n;
  }

  /* Interacción */
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
    else { auto = false; inercia = 0; const base = a === "frente" ? 0 : 180; objetivo = base + Math.round((ry - base) / 360) * 360; }
    marcar();
  }));

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(raiz);

  raiz.querySelector(".m3t__cargando").remove();
  let previo = performance.now(), t = 0;
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - previo) / 1000); previo = ahora;
    if (visible || opciones.captura) {
      t += dt;
      if (!arrastrando) {
        if (objetivo !== null) { ry += (objetivo - ry) * Math.min(1, dt * 5); if (Math.abs(objetivo - ry) < 0.05) ry = objetivo; }
        else if (Math.abs(inercia) > 2) { ry += inercia * dt; inercia *= Math.pow(0.04, dt); }
        else if (auto) { inercia = 0; vel += (velocidad - vel) * Math.min(1, dt * 2); ry += vel * dt; }
      }
      pieza.rotation.y = THREE.MathUtils.degToRad(ry);
      const flota = REDUCE ? 0 : (Math.sin(t * 1.6) * 0.5 + 0.5) * M.flotar;
      pieza.position.y = flota;
      const lejos = M.flotar ? flota / M.flotar : 0;
      contacto.material.opacity = 0.78 - lejos * 0.28;
      contacto.scale.set(sombraEsc[0] * (1 + lejos * 0.12), sombraEsc[1] * (1 + lejos * 0.12), 1);
      revisarCiclo();
      renderer.render(escena, camara);
    }
    if (!opciones.captura) requestAnimationFrame(cuadro);
  }
  revisarCiclo();
  requestAnimationFrame(cuadro);

  const api = {
    lista: () => caras.slice(),
    estadoCiclo: () => ({ frente: idxFrente + 1, reverso: idxReverso + 1, total: n }),
    pose: (grados) => { ry = grados; auto = false; marcar(); revisarCiclo(); pieza.rotation.y = THREE.MathUtils.degToRad(ry); renderer.render(escena, camara); },
    renderer
  };
  raiz.m3t = api;
  return api;
}

export function montarTodos() {
  return Promise.all([...document.querySelectorAll("[data-modulo-three]")].map((el) => montar(el)));
}
if (typeof window !== "undefined") {
  window.ModuloThree = { montar, montarTodos };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarTodos); else montarTodos();
}
