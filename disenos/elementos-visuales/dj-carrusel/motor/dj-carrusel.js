/* ============================================================
   DJ CARRUSEL · motor (v1) — sin librerías
   Basado en "FeyCards" de Aceternity Labs (React + Motion), reconstruido en JS.

   Qué hace
   - Entrada: las tarjetas salen apiladas y se abren en abanico con resorte (la del frente primero).
   - Hover: la tarjeta pasa de gris a color y las de su derecha se recorren.
   - Clic: a la derecha de la tarjeta se despliega un panel con la información de la foto.
     Cierra con ✕, Esc, clic en la misma tarjeta o clic fuera. Navega con ← → o los botones.

   Uso
     <section class="djc" data-dj-carrusel> … marcado de la plantilla …
       <script type="application/json" data-djc-datos>[ …fotos… ]</script>
     </section>
     <script src="dj-carrusel.js"></script>

   Opciones (atributos data- en la <section>, todos opcionales)
     data-espaciado="32"     separación entre tarjetas (px)
     data-desplazamiento="60" cuánto se recorren al pasar el mouse (px)
     data-panel="304"        ancho del panel de información (px)
     data-escalonado="0.2"   retraso entre tarjetas en la entrada (s)

   Datos de cada foto (JSON). La primera es la foto de fondo; la última, la del frente
   (siempre a color). Campos: titulo, descripcion, imagen, idle (opcional: sin idle la
   tarjeta no cambia de gris a color), completa (opcional) y datos { "Etiqueta": "Valor" }.

   También se puede iniciar a mano: DjCarrusel.iniciar(elemento, fotos)
   ============================================================ */
(function (global) {
  const CARD_W = 160;

  function iniciar(root, datos) {
    if (!root || root.__djc) return;
    root.__djc = true;

    const opt = root.dataset;
    const CARD_SPACING = +opt.espaciado || 32;
    const SHIFT_HOVER = +opt.desplazamiento || 60;
    const PANEL_W = +opt.panel || 304;
    const GAP = 16;
    const SHIFT_OPEN = PANEL_W + GAP * 2;
    const STAGGER = opt.escalonado !== undefined ? +opt.escalonado : 0.2;

    const fuente = root.querySelector("[data-djc-datos]");
    const items = datos || (fuente ? JSON.parse(fuente.textContent) : []);
    if (!items.length) return;

    const deck = root.querySelector(".djc__deck");
    const wrap = root.querySelector(".djc__deck-wrap");
    const stage = root.querySelector(".djc__stage");
    const panel = root.querySelector(".djc__panel");
    const body = root.querySelector(".djc__panel-body");
    const last = items.length - 1;
    const lastCard = last - 1;
    const baseRight = last * CARD_SPACING + CARD_W;

    // El mazo mide lo del original (384px) o más si hay muchas tarjetas
    const deckW = Math.max(384, baseRight + 64);
    root.style.setProperty("--djc-deck-w", deckW + "px");

    let hoverIndex = null;
    let openIndex = null;
    const pad = (n) => String(n).padStart(2, "0");

    // ---- Tarjetas ----
    const cards = items.map((item, i) => {
      const isMain = i === 0;
      const isStatic = isMain || i === last || !item.idle;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "djc__card" + (isMain ? " djc__card--main" : "") + (isStatic ? " djc__card--static" : "");
      card.style.setProperty("--left", i * CARD_SPACING + "px");
      card.setAttribute("aria-label", `Ver información: ${item.titulo || "foto " + (i + 1)}`);
      card.setAttribute("aria-expanded", "false");
      if (!isMain) {
        const k = i - 1;
        card.style.setProperty("--from", -k * CARD_SPACING + "px");
        card.style.setProperty("--delay", (lastCard - k) * STAGGER + "s");
      }
      const inner = document.createElement("div");
      inner.className = "djc__inner";
      const act = new Image();
      act.className = "djc__img djc__img--active";
      act.src = item.imagen; act.alt = ""; act.draggable = false;
      inner.appendChild(act);
      if (!isStatic) {
        const idle = new Image();
        idle.className = "djc__img djc__img--idle";
        idle.src = item.idle; idle.alt = ""; idle.draggable = false;
        const shade = document.createElement("div");
        shade.className = "djc__shade";
        inner.append(idle, shade);
      }
      const badge = document.createElement("span");
      badge.className = "djc__badge";
      badge.textContent = pad(i + 1);
      inner.appendChild(badge);
      card.appendChild(inner);

      card.addEventListener("mouseenter", () => { hoverIndex = i; update(); });
      card.addEventListener("mouseleave", () => { hoverIndex = null; update(); });
      card.addEventListener("click", (e) => { e.stopPropagation(); setOpen(openIndex === i ? null : i); });
      deck.appendChild(card);
      return card;
    });

    // ---- Panel ----
    function fillPanel(i, animate) {
      const item = items[i];
      body.querySelector(".djc__count").textContent = `${pad(i + 1)} / ${pad(items.length)}`;
      const img = body.querySelector(".djc__photo img");
      img.src = item.completa || item.imagen;
      img.alt = item.titulo || "";
      body.querySelector(".djc__name").textContent = item.titulo || "";
      body.querySelector(".djc__desc").textContent = item.descripcion || "";
      const dl = body.querySelector(".djc__meta");
      dl.innerHTML = "";
      Object.entries(item.datos || {}).forEach(([k, v]) => {
        const dt = document.createElement("dt"); dt.textContent = k;
        const dd = document.createElement("dd"); dd.textContent = v;
        dl.append(dt, dd);
      });
      if (animate) {
        body.classList.remove("is-swapping");
        void body.offsetWidth;
        body.classList.add("is-swapping");
      }
    }

    function setOpen(i) {
      const wasOpen = openIndex !== null;
      openIndex = i;
      if (i !== null) fillPanel(i, wasOpen);
      update();
      root.dispatchEvent(new CustomEvent("djc:cambio", { detail: { abierta: i, foto: i !== null ? items[i] : null } }));
    }

    // ---- Estado visual ----
    function update() {
      const active = openIndex !== null ? openIndex : hoverIndex;
      const shift = openIndex !== null ? SHIFT_OPEN : SHIFT_HOVER;

      cards.forEach((card, i) => {
        const moves = active !== null && i > active;
        card.firstChild.style.setProperty("--shift", moves ? shift + "px" : "0px");
        card.classList.toggle("is-active", active === i);
        card.setAttribute("aria-expanded", String(openIndex === i));
      });

      root.classList.toggle("is-hovered", hoverIndex !== null && openIndex === null);
      root.classList.toggle("is-open", openIndex !== null);
      panel.setAttribute("aria-hidden", String(openIndex === null));

      let right = baseRight;
      if (openIndex !== null) {
        const panelLeft = openIndex * CARD_SPACING + CARD_W + GAP;
        panel.style.setProperty("--panel-left", panelLeft + "px");
        panel.style.setProperty("--panel-w", PANEL_W + "px");
        right = Math.max(panelLeft + PANEL_W, openIndex < last ? baseRight + SHIFT_OPEN : baseRight);
      }
      const center = openIndex !== null ? deckW / 2 - right / 2 : 0;
      wrap.style.setProperty("--djc-center", center + "px");

      // Escala para pantallas chicas (reserva espacio para el panel abierto)
      const needed = Math.max(baseRight + SHIFT_OPEN, right) + 48;
      const w = root.clientWidth || window.innerWidth;
      const scale = Math.min(1, w / needed, (window.innerHeight - 40) / 520);
      stage.style.setProperty("--djc-scale", scale.toFixed(3));
    }

    // ---- Controles ----
    const go = (d) => setOpen((openIndex + d + items.length) % items.length);
    root.querySelector(".djc__close").addEventListener("click", (e) => { e.stopPropagation(); setOpen(null); });
    root.querySelector("[data-djc-prev]").addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
    root.querySelector("[data-djc-next]").addEventListener("click", (e) => { e.stopPropagation(); go(1); });
    panel.addEventListener("click", (e) => e.stopPropagation());
    root.addEventListener("click", () => { if (openIndex !== null) setOpen(null); });
    document.addEventListener("keydown", (e) => {
      if (openIndex === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
    window.addEventListener("resize", update);

    update();
    return { abrir: setOpen, cerrar: () => setOpen(null) };
  }

  global.DjCarrusel = { iniciar };
  document.querySelectorAll("[data-dj-carrusel]").forEach((el) => iniciar(el));
})(window);
