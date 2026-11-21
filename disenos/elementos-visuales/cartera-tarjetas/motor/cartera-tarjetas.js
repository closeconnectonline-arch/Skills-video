/* Cartera de tarjetas · motor v1
   Crea la cartera, las tarjetas y el balance total a partir de un bloque JSON.
   Se inicia solo en todo elemento con [data-cartera-tarjetas].
   No edites este archivo por proyecto. */
(function () {
  "use strict";

  var MAX_TARJETAS = 3;

  var BOLSILLO =
    '<svg width="280" height="160" viewBox="0 0 280 160" aria-hidden="true">' +
    '<path class="cartera__bolsillo-forma" d="M0 28 Q0 8 20 8 H95 Q140 40 185 8 H260 Q280 8 280 28 V100 Q280 160 220 160 H60 Q0 160 0 100 Z"/>' +
    '<path class="cartera__bolsillo-costura" d="M8 32 Q8 16 22 16 H93 Q140 50 187 16 H258 Q272 16 272 32 V100 Q272 152 220 152 H60 Q8 152 8 100 Z"/>' +
    "</svg>";

  var OJO_CERRADO =
    '<svg class="cartera__ojo-cerrado" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
    '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
    '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  var OJO_ABIERTO =
    '<svg class="cartera__ojo-abierto" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ¿El color de fondo es claro? (para ajustar chip y etiquetas)
  function esClaro(color) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color || "").trim());
    if (!m) return false;
    var h = m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1];
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 200;
  }

  function iniciar(el, datos) {
    datos = datos || {};
    var moneda = datos.moneda || el.getAttribute("data-moneda") || "MXN";
    var idioma = datos.idioma || el.getAttribute("data-idioma") || "es-MX";
    var tituloBalance = datos.tituloBalance || "Balance total";
    var tarjetas = (datos.tarjetas || []).slice(0, MAX_TARJETAS);

    function dinero(n) {
      try { return Number(n || 0).toLocaleString(idioma, { style: "currency", currency: moneda }); }
      catch (e) { return moneda + " " + Number(n || 0).toFixed(2); }
    }

    el.classList.add("cartera");
    var html = '<div class="cartera__fondo"></div>';

    tarjetas.forEach(function (t, i) {
      var numero = String(t.numero || "");
      var estilo = "background:" + esc(t.fondo || "#635bff") + ";color:" + esc(t.texto || "#ffffff");
      var clara = esClaro(t.fondo) ? " cartera__tarjeta--clara" : "";
      var saldo = t.saldo != null ? '<span class="cartera__etiqueta">Saldo ' + esc(dinero(t.saldo)) + "</span>" : "";
      html +=
        '<div class="cartera__tarjeta cartera__tarjeta--' + (i + 1) + clara + '" style="' + estilo + '">' +
          '<div class="cartera__tarjeta-interior">' +
            '<div class="cartera__tarjeta-arriba"><span>' + esc(t.nombre) + '</span><div class="cartera__chip"></div></div>' +
            '<div class="cartera__tarjeta-abajo">' +
              '<div><span class="cartera__etiqueta">' + esc(t.etiquetaTitular || "Titular") + '</span>' +
              '<span class="cartera__valor">' + esc(t.titular) + "</span></div>" +
              '<div class="cartera__numero-caja">' + saldo +
                '<span class="cartera__numero-oculto">**** ' + esc(numero.slice(-4)) + "</span>" +
                '<span class="cartera__numero">' + esc(numero) + "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
    });

    var total = tarjetas.reduce(function (s, t) { return s + Number(t.saldo || 0); }, 0);
    if (datos.balance != null) total = Number(datos.balance); // balance fijo opcional

    html +=
      '<div class="cartera__bolsillo">' + BOLSILLO +
        '<div class="cartera__contenido">' +
          '<span class="cartera__titulo-balance">' + esc(tituloBalance) + "</span>" +
          '<div class="cartera__balance-caja">' +
            '<div class="cartera__balance-oculto">******</div>' +
            '<div class="cartera__balance">' + esc(dinero(total)) + "</div>" +
          "</div>" +
          '<div class="cartera__ojo">' + OJO_CERRADO + OJO_ABIERTO + "</div>" +
        "</div>" +
      "</div>";

    el.innerHTML = html;

    function tarjetasEl() { return el.querySelectorAll(".cartera__tarjeta"); }
    function abrir() { el.classList.add("is-abierta"); }
    function cerrar() {
      el.classList.remove("is-abierta");
      tarjetasEl().forEach(function (c) { c.classList.remove("is-activa"); });
    }
    function mostrar(i) {
      abrir();
      tarjetasEl().forEach(function (c, j) { c.classList.toggle("is-activa", j === i); });
    }

    // Táctil: 1er toque abre; toque en tarjeta la revela; toque fuera cierra
    el.addEventListener("click", function (e) {
      var tarjeta = e.target.closest(".cartera__tarjeta");
      if (!el.classList.contains("is-abierta")) { abrir(); return; }
      if (!tarjeta) { cerrar(); return; }
      var activa = tarjeta.classList.contains("is-activa");
      tarjetasEl().forEach(function (c) { c.classList.remove("is-activa"); });
      if (!activa) tarjeta.classList.add("is-activa");
    });
    document.addEventListener("click", function (e) { if (!el.contains(e.target)) cerrar(); });

    return { abrir: abrir, cerrar: cerrar, mostrar: mostrar, total: total };
  }

  function leerDatos(el) {
    var bloque = el.querySelector('script[type="application/json"]') ||
      (el.id && document.querySelector('script[type="application/json"][data-para="' + el.id + '"]'));
    if (!bloque) return {};
    try { return JSON.parse(bloque.textContent); }
    catch (e) { console.error("Cartera de tarjetas: JSON inválido", e); return {}; }
  }

  function iniciarTodas() {
    document.querySelectorAll("[data-cartera-tarjetas]").forEach(function (el) {
      if (el.__cartera) return;
      el.__cartera = iniciar(el, leerDatos(el));
    });
  }

  window.CarteraTarjetas = { iniciar: iniciar };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarTodas);
  else iniciarTodas();
})();
