/* Tooltip animado de avatares — versión sin librerías.
   Imita el AnimatedTooltip de Aceternity (framer-motion):
   - Entrada con resorte: opacidad 0→1, y 20px→0, escala 0.6→1 (rigidez 260, amortiguación 10).
   - Al mover el mouse sobre la foto, el tooltip gira (±45°) y se desplaza (±50px)
     con resorte (rigidez 100, amortiguación 5).
   Uso: <div class="avatar-tooltip" data-avatar-tooltip> … </div> (ver index.html). */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Resorte simple (masa 1) integrado en pasos pequeños
  function spring(stiffness, damping, value) {
    return { k: stiffness, c: damping, x: value, v: 0, target: value };
  }
  function step(s, dt) {
    const a = -s.k * (s.x - s.target) - s.c * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
  }
  function settled(s) {
    return Math.abs(s.x - s.target) < 0.001 && Math.abs(s.v) < 0.001;
  }
  const map = (v, a, b, c, d) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return c + (d - c) * t;
  };

  function setup(item) {
    const img = item.querySelector(".avatar-tooltip__img");
    const tip = item.querySelector(".avatar-tooltip__tip");
    if (!img || !tip) return;

    const enter = spring(260, 10, 0);   // 0 = oculto, 1 = visible
    const rot = spring(100, 5, 0);      // grados
    const tx = spring(100, 5, 0);       // px
    let raf = 0;
    let last = 0;

    function render() {
      const p = enter.x;
      const opacity = Math.min(1, Math.max(0, p));
      const y = 20 * (1 - p);
      const scale = 0.6 + 0.4 * p;
      tip.style.opacity = opacity;
      tip.style.transform =
        `translateX(-50%) translateX(${tx.x}px) translateY(${y}px) ` +
        `rotate(${rot.x}deg) scale(${scale})`;
    }

    function loop(now) {
      let dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const n = Math.ceil(dt / 0.004);
      for (let i = 0; i < n; i++) {
        step(enter, dt / n); step(rot, dt / n); step(tx, dt / n);
      }
      render();
      const done = settled(enter) && settled(rot) && settled(tx);
      if (done && enter.target === 0) {
        tip.classList.remove("is-visible");
        raf = 0;
        return;
      }
      raf = done ? 0 : requestAnimationFrame(loop);
    }
    function kick() {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    item.addEventListener("mouseenter", () => {
      tip.classList.add("is-visible");
      if (reduce) { enter.x = 1; render(); return; }
      enter.target = 1;
      kick();
    });
    item.addEventListener("mouseleave", () => {
      if (reduce) { tip.classList.remove("is-visible"); return; }
      enter.target = 0;
      rot.target = 0; tx.target = 0;
      kick();
    });
    img.addEventListener("mousemove", (e) => {
      if (reduce) return;
      const x = e.offsetX - img.offsetWidth / 2;
      rot.target = map(x, -100, 100, -45, 45);
      tx.target = map(x, -100, 100, -50, 50);
      kick();
    });
    // En pantallas táctiles: tocar muestra/oculta
    img.addEventListener("touchstart", () => {
      item.dispatchEvent(new Event(enter.target ? "mouseleave" : "mouseenter"));
    }, { passive: true });
  }

  document
    .querySelectorAll("[data-avatar-tooltip] .avatar-tooltip__item")
    .forEach(setup);
})();
