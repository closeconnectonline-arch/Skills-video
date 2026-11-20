/* Panel de tarjetas apiladas + tarjetas desplegables con información.
   Reconstrucción sin librerías de "FeyCards" (Aceternity Labs, hecho con React + Motion).
   - Entrada: las tarjetas salen apiladas y se abren en abanico con resorte (la última primero).
   - Hover: la tarjeta pasa de gris a color y las de su derecha se recorren 60px.
   - Clic (nuevo): la tarjeta se queda activa y a su derecha se despliega un panel con la
     información de la foto; las tarjetas siguientes se recorren para dejarle espacio.
     Cierra con la X, Esc, clic en la misma tarjeta o clic fuera. Flechas ← → para navegar. */
(function () {
  const root = document.querySelector("[data-fey]");
  if (!root) return;

  const CARD_SPACING = 32;      // separación entre tarjetas
  const CARD_W = 160;
  const SHIFT_HOVER = 60;       // shiftDistance
  const PANEL_W = 304;          // ancho del panel de información
  const GAP = 16;               // espacio entre tarjeta y panel
  const SHIFT_OPEN = PANEL_W + GAP * 2;
  const STAGGER = 0.2;          // entranceStagger

  const items = JSON.parse(document.getElementById("fey-data").textContent);
  const deck = root.querySelector(".fey__deck");
  const wrap = root.querySelector(".fey__deck-wrap");
  const stage = root.querySelector(".fey__stage");
  const panel = root.querySelector(".fey__panel");
  const body = root.querySelector(".fey__panel-body");
  const last = items.length - 1;
  const lastCard = last - 1; // índice de tarjeta (sin contar la principal) de la del frente

  let hoverIndex = null;
  let openIndex = null;

  // ---- Construir tarjetas ----
  const cards = items.map((item, i) => {
    const isMain = i === 0;
    const isStatic = isMain || i === last; // sin cambio gris→color
    const card = document.createElement("button");
    card.type = "button";
    card.className = "fey__card" + (isMain ? " fey__card--main" : "") + (isStatic ? " fey__card--static" : "");
    card.style.setProperty("--left", i * CARD_SPACING + "px");
    card.setAttribute("aria-label", `Ver información: ${item.titulo}`);
    card.setAttribute("aria-expanded", "false");
    if (!isMain) {
      const k = i - 1; // índice de tarjeta como en el original
      card.style.setProperty("--from", -k * CARD_SPACING + "px");
      card.style.setProperty("--delay", (lastCard - k) * STAGGER + "s");
    }
    const num = String(i + 1).padStart(2, "0");
    card.innerHTML = `
      <div class="fey__inner">
        <img class="fey__img fey__img--active" src="${item.imagen}" alt="" draggable="false">
        ${!isStatic && item.idle ? `<img class="fey__img fey__img--idle" src="${item.idle}" alt="" draggable="false"><div class="fey__shade"></div>` : ""}
        <span class="fey__badge">${num}</span>
      </div>`;
    card.addEventListener("mouseenter", () => { hoverIndex = i; update(); });
    card.addEventListener("mouseleave", () => { hoverIndex = null; update(); });
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(openIndex === i ? null : i);
    });
    deck.appendChild(card);
    return card;
  });

  // ---- Panel ----
  function fillPanel(i, animate) {
    const item = items[i];
    body.querySelector(".fey__count").textContent =
      `${String(i + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    const img = body.querySelector(".fey__photo img");
    img.src = item.completa || item.imagen;
    img.alt = item.titulo;
    body.querySelector(".fey__name").textContent = item.titulo;
    body.querySelector(".fey__desc").textContent = item.descripcion;
    const dl = body.querySelector(".fey__meta");
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
  }

  // ---- Estado visual ----
  function update() {
    const active = openIndex !== null ? openIndex : hoverIndex;
    const shift = openIndex !== null ? SHIFT_OPEN : SHIFT_HOVER;

    cards.forEach((card, i) => {
      const moves = active !== null && i > active;
      card.querySelector(".fey__inner").style.setProperty("--shift", moves ? shift + "px" : "0px");
      card.classList.toggle("is-active", active === i);
      card.setAttribute("aria-expanded", String(openIndex === i));
    });

    root.classList.toggle("is-hovered", hoverIndex !== null && openIndex === null);
    root.classList.toggle("is-open", openIndex !== null);
    panel.setAttribute("aria-hidden", String(openIndex === null));

    // Posición del panel y centrado del conjunto
    const baseRight = last * CARD_SPACING + CARD_W; // 320
    let right = baseRight;
    if (openIndex !== null) {
      const panelLeft = openIndex * CARD_SPACING + CARD_W + GAP;
      panel.style.setProperty("--panel-left", panelLeft + "px");
      panel.style.setProperty("--panel-w", PANEL_W + "px");
      right = Math.max(panelLeft + PANEL_W, openIndex < last ? baseRight + SHIFT_OPEN : baseRight);
    }
    // Abierto: centra el conjunto completo (tarjetas + panel) dentro del mazo de 384px
    const deckW = deck.offsetWidth;
    const center = openIndex !== null ? deckW / 2 - right / 2 : 0;
    wrap.style.setProperty("--fey-center", center + "px");
    fitScale(right);
  }

  // Escala el escenario si no cabe en la pantalla
  function fitScale(right) {
    const needed = Math.max(baseWidth(), right) + 48;
    const scaleW = (window.innerWidth) / needed;
    const scaleH = (window.innerHeight - 40) / 520;
    stage.style.setProperty("--fey-scale", Math.min(1, scaleW, scaleH).toFixed(3));
  }
  function baseWidth() {
    return last * CARD_SPACING + CARD_W + SHIFT_OPEN; // reserva espacio para el panel abierto
  }

  // ---- Controles ----
  root.querySelector(".fey__close").addEventListener("click", (e) => { e.stopPropagation(); setOpen(null); });
  root.querySelector("[data-fey-prev]").addEventListener("click", (e) => {
    e.stopPropagation(); setOpen((openIndex - 1 + items.length) % items.length);
  });
  root.querySelector("[data-fey-next]").addEventListener("click", (e) => {
    e.stopPropagation(); setOpen((openIndex + 1) % items.length);
  });
  panel.addEventListener("click", (e) => e.stopPropagation());
  root.addEventListener("click", () => { if (openIndex !== null) setOpen(null); });
  document.addEventListener("keydown", (e) => {
    if (openIndex === null) return;
    if (e.key === "Escape") setOpen(null);
    if (e.key === "ArrowRight") setOpen((openIndex + 1) % items.length);
    if (e.key === "ArrowLeft") setOpen((openIndex - 1 + items.length) % items.length);
  });
  window.addEventListener("resize", update);

  update();
})();
