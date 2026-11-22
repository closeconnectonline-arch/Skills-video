/* Piezas de los módulos Close Connect para el carrusel.
   Copia adaptada de modulos-threejs/motor/modulo-three.js v1 (el original no se modifica):
   mismas medidas, acrílico con transmisión, vinil laminado y MDF procedural.
   Aquí las geometrías y materiales se comparten entre todas las copias del carrusel. */
import * as THREE from "three";

export const MODELOS = {
  pro:      { nombre: "Pro",      forma: "circulo", diametro: 10, grosor: 0.3, base: "acrilico" },
  proplus:  { nombre: "Pro Plus", forma: "circulo", diametro: 7,  grosor: 0.3, base: null },
  personal: { nombre: "Personal", forma: "tarjeta", ancho: 8.5, alto: 5.4, grosor: 0.2, radio: 0.3, base: null },
  estandar: { nombre: "Estándar", forma: "tarjeta", ancho: 5.4, alto: 8.5, grosor: 0.2, radio: 0.3, base: "mdf" }
};
const BISEL = 0.025;

function lienzo(w, h, pintar) { const c = document.createElement("canvas"); c.width = w; c.height = h; pintar(c.getContext("2d"), w, h); return c; }
function ruido(ctx, w, h, f, base) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * f;
    d[i] = Math.max(0, Math.min(255, base[0] + n)); d[i + 1] = Math.max(0, Math.min(255, base[1] + n)); d[i + 2] = Math.max(0, Math.min(255, base[2] + n)); d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
function tex(c, srgb, rep) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function mdfCara() {
  return lienzo(512, 256, (ctx, w, h) => {
    ruido(ctx, w, h, 20, [168, 132, 96]);
    for (let i = 0; i < 1300; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 3 + Math.random() * 10, a = Math.random() * 6.28;
      ctx.strokeStyle = Math.random() < 0.5 ? "rgba(120,84,50,.18)" : "rgba(222,190,150,.16)"; ctx.lineWidth = 0.6 + Math.random() * 0.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * Math.cos(a), y + l * Math.sin(a)); ctx.stroke();
    }
  });
}
function mdfCanto() {
  return lienzo(512, 128, (ctx, w, h) => {
    ruido(ctx, w, h, 26, [112, 76, 46]);
    for (let y = 0; y < h; y++) { ctx.fillStyle = `rgba(${Math.random() < 0.5 ? "60,38,20" : "150,108,70"},${Math.random() * 0.12})`; ctx.fillRect(0, y, w, 1); }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(28,16,8,.85)"); g.addColorStop(0.12, "rgba(40,24,12,.25)"); g.addColorStop(0.5, "rgba(0,0,0,0)");
    g.addColorStop(0.88, "rgba(40,24,12,.25)"); g.addColorStop(1, "rgba(28,16,8,.85)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}
function rectRedondo(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function circulo(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function placa(forma, g) {
  const geo = new THREE.ExtrudeGeometry(forma, { depth: g - 2 * BISEL, bevelEnabled: true, bevelThickness: BISEL, bevelSize: BISEL, bevelSegments: 4, curveSegments: 72 });
  geo.translate(0, 0, -(g - 2 * BISEL) / 2); geo.computeVertexNormals(); return geo;
}
function superficie(forma, w, h) {
  const g = new THREE.ShapeGeometry(forma, 72), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  uv.needsUpdate = true; return g;
}

/* Recursos compartidos: se crean una vez por modelo y los reutilizan todas las copias */
export function crearRecursos() {
  const satinado = tex(lienzo(128, 128, (ctx, w, h) => ruido(ctx, w, h, 26, [150, 150, 150])), false, [6, 6]);
  const acrilico = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.035, transmission: 1, thickness: 0.3, ior: 1.49, clearcoat: 1, clearcoatRoughness: 0.02,
    attenuationColor: new THREE.Color(0xd4efe8), attenuationDistance: 1.6, envMapIntensity: 1.25
  });
  /* canto pulido sin refracción: se ve como orilla de acrílico brillante, sin el "aro dentado" y más ligero */
  const canto = new THREE.MeshPhysicalMaterial({
    color: 0xbfded6, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, ior: 1.49,
    specularIntensity: 1, envMapIntensity: 2.2, sheen: 0.4, sheenColor: new THREE.Color(0xe9fff9)
  });
  const baseAcr = acrilico.clone(); baseAcr.attenuationColor = new THREE.Color(0xc6ebe2); baseAcr.envMapIntensity = 2.2;
  const tCanto = tex(mdfCanto(), true);
  const mCara = new THREE.MeshStandardMaterial({ map: tex(mdfCara(), true), roughness: 0.88, bumpMap: tex(mdfCara(), false), bumpScale: 0.6, envMapIntensity: 0.6 });
  const mCanto = new THREE.MeshStandardMaterial({ map: tCanto, roughness: 0.92, bumpMap: tCanto, bumpScale: 0.8, envMapIntensity: 0.5 });

  const geos = {};
  for (const clave of Object.keys(MODELOS)) {
    const M = MODELOS[clave], g = {};
    let ancho, alto, fPlaca, fVinil;
    if (M.forma === "circulo") { const R = M.diametro / 2; ancho = alto = M.diametro; fPlaca = circulo(R - BISEL); fVinil = circulo(R - BISEL - 0.004); }
    else {
      ancho = M.ancho; alto = M.alto;
      fPlaca = rectRedondo(ancho - 2 * BISEL, alto - 2 * BISEL, M.radio - BISEL);
      fVinil = rectRedondo(ancho - 2 * BISEL - 0.008, alto - 2 * BISEL - 0.008, M.radio - BISEL - 0.004);
    }
    g.ancho = ancho; g.alto = alto; g.placa = placa(fPlaca, M.grosor); g.vinil = superficie(fVinil, ancho, alto);
    if (M.base === "acrilico") {
      const L = 8, A = 2.5, G = 0.3, ranL = 3, ranA = M.grosor + 0.02, s = rectRedondo(L, A, 0.4), h = new THREE.Path();
      h.moveTo(-ranL / 2, -ranA / 2); h.lineTo(ranL / 2, -ranA / 2); h.lineTo(ranL / 2, ranA / 2); h.lineTo(-ranL / 2, ranA / 2); h.lineTo(-ranL / 2, -ranA / 2);
      s.holes.push(h);
      const gb = new THREE.ExtrudeGeometry(s, { depth: G - 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 32 });
      gb.rotateX(-Math.PI / 2); gb.translate(0, 0.02, 0);
      const R = M.diametro / 2, hundido = R - Math.sqrt(R * R - (ranL / 2) ** 2);
      g.base = gb; g.yModulo = G - hundido + R; g.altura = g.yModulo + R;
    } else if (M.base === "mdf") {
      const L = 5, F = 2, H = 1.2, ran = M.grosor, prof = 0.6, hr = ran / 2, u = new THREE.Shape();
      u.moveTo(-F / 2, 0); u.lineTo(F / 2, 0); u.lineTo(F / 2, H); u.lineTo(hr, H); u.lineTo(hr, H - prof);
      u.lineTo(-hr, H - prof); u.lineTo(-hr, H); u.lineTo(-F / 2, H); u.lineTo(-F / 2, 0);
      const gm = new THREE.ExtrudeGeometry(u, { depth: L, bevelEnabled: false });
      gm.translate(0, 0, -L / 2); gm.rotateY(Math.PI / 2); gm.computeVertexNormals();
      const pos = gm.attributes.position, nor = gm.attributes.normal, tri = pos.count / 3, cara = [], canto2 = [];
      for (let i = 0; i < tri; i++) (Math.abs(nor.getY(i * 3)) > 0.5 ? cara : canto2).push(i);
      const orden = cara.concat(canto2), np = new Float32Array(pos.count * 3), nn = new Float32Array(pos.count * 3), nu = new Float32Array(pos.count * 2);
      orden.forEach((t, k) => {
        for (let v = 0; v < 3; v++) {
          const o = t * 3 + v, d = k * 3 + v, x = pos.getX(o), y = pos.getY(o), z = pos.getZ(o), nx = nor.getX(o), ny = nor.getY(o);
          np.set([x, y, z], d * 3); nn.set([nx, ny, nor.getZ(o)], d * 3);
          if (Math.abs(ny) > 0.5) nu.set([(x + L / 2) / L, (z + F / 2) / F * 0.5], d * 2);
          else nu.set([Math.abs(nx) > 0.5 ? (z + F / 2) / F * 0.4 : (x + L / 2) / L, y / H], d * 2);
        }
      });
      const gb = new THREE.BufferGeometry();
      gb.setAttribute("position", new THREE.BufferAttribute(np, 3)); gb.setAttribute("normal", new THREE.BufferAttribute(nn, 3)); gb.setAttribute("uv", new THREE.BufferAttribute(nu, 2));
      gb.addGroup(0, cara.length * 3, 0); gb.addGroup(cara.length * 3, canto2.length * 3, 1);
      gm.dispose();
      g.base = gb; g.yModulo = H - prof + alto / 2; g.altura = H - prof + alto;
    } else { g.yModulo = alto / 2; g.altura = alto; }
    geos[clave] = g;
  }
  return {
    geos, satinado, acrilico, canto, baseAcr, mCara, mCanto,
    liberar() {
      Object.values(geos).forEach((g) => { g.placa.dispose(); g.vinil.dispose(); if (g.base) g.base.dispose(); });
      [satinado, tCanto, mCara.map, mCara.bumpMap].forEach((t) => t.dispose());
      [acrilico, canto, baseAcr, mCara, mCanto].forEach((m) => m.dispose());
    }
  };
}

export function materialVinil(mapa, satinado) {
  return new THREE.MeshPhysicalMaterial({
    map: mapa, roughness: 0.5, roughnessMap: satinado, clearcoat: 0.35, clearcoatRoughness: 0.26,
    specularIntensity: 0.3, alphaTest: 0.5, envMapIntensity: 0.55,   // laminado satinado: brilla sin "quemar" los blancos
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4   // evita que el vinil "pelee" con el acrílico a escala chica
  });
}

/* Una copia del módulo: grupo "pieza" con el origen en su centro visual (gira y flota sobre sí misma) */
export function crearModulo(clave, rec, mapaFrente, mapaReverso) {
  const M = MODELOS[clave], g = rec.geos[clave];
  const pieza = new THREE.Group(), cuerpo = new THREE.Group();
  pieza.add(cuerpo); cuerpo.position.y = -g.altura / 2;
  const modulo = new THREE.Group(); modulo.position.y = g.yModulo; cuerpo.add(modulo);
  modulo.add(new THREE.Mesh(g.placa, [rec.acrilico, rec.canto]));
  const mf = materialVinil(mapaFrente, rec.satinado), mr = materialVinil(mapaReverso, rec.satinado);
  const frente = new THREE.Mesh(g.vinil, mf); frente.position.z = M.grosor / 2 + 0.012;
  const reverso = new THREE.Mesh(g.vinil, mr); reverso.rotation.y = Math.PI; reverso.position.z = -(M.grosor / 2 + 0.012);
  modulo.add(frente, reverso);
  if (M.base === "acrilico") cuerpo.add(new THREE.Mesh(g.base, [rec.baseAcr, rec.canto]));
  else if (M.base === "mdf") cuerpo.add(new THREE.Mesh(g.base, [rec.mCara, rec.mCanto]));
  return { pieza, frente, mf, mr, liberar() { mf.dispose(); mr.dispose(); } };
}
