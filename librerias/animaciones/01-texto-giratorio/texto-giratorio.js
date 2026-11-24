/* Texto giratorio (reconstrucción en JS sin dependencias del "Container Text Flip" de Aceternity UI) · v1
 *
 * Uso:
 *   <span class="texto-giratorio" data-texto-giratorio data-palabras="mejor|moderno|bonito">mejor</span>
 *   <script src="texto-giratorio.js"></script>
 *
 * Opciones (data-* o TextoGiratorio.montar(el, {...})):
 *   palabras   lista separada por "|" (obligatoria)
 *   intervalo  ms entre palabras (3000, como el original)
 *   duracion   ms de la animación (700, como el original): el ancho tarda la mitad
 *   retraso    ms entre letra y letra (20, como el original)
 *
 * - El texto inicial del elemento se queda como respaldo sin JS (pon ahí la primera palabra).
 * - Lectores de pantalla: leen una sola versión fija (la primera palabra); la animación va oculta para ellos.
 * - Se pausa fuera de pantalla y con la pestaña oculta. Con "reducir movimiento" se queda en la primera palabra.
 */
(function () {
  'use strict';

  function opcion(el, o, nombre, defecto) {
    var v = o && o[nombre] != null ? o[nombre] : el.getAttribute('data-' + nombre);
    return v == null || v === '' ? defecto : v;
  }

  function montar(el, o) {
    if (el.tg) return el.tg;
    var palabras = opcion(el, o, 'palabras', '');
    palabras = (Array.isArray(palabras) ? palabras : String(palabras).split('|'))
      .map(function (p) { return String(p).trim(); }).filter(Boolean);
    if (!palabras.length) return null;
    var intervalo = +opcion(el, o, 'intervalo', 3000);
    var duracion = +opcion(el, o, 'duracion', 700);
    var retraso = +opcion(el, o, 'retraso', 20);
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    el.classList.add('texto-giratorio');
    el.style.setProperty('--tg-duracion', duracion + 'ms');
    // versión fija para lectores de pantalla + capa animada oculta para ellos
    el.textContent = '';
    var lector = document.createElement('span');
    lector.className = 'texto-giratorio__lector';
    lector.textContent = palabras[0];
    var texto = document.createElement('span');
    texto.className = 'texto-giratorio__texto';
    texto.setAttribute('aria-hidden', 'true');
    el.appendChild(lector); el.appendChild(texto);

    var i = 0, timer = null, visible = true, vivo = true;

    function relleno() { return parseFloat(getComputedStyle(el).getPropertyValue('--tg-relleno')) || 15; }
    function medir(animar) {
      if (!animar) el.classList.add('texto-giratorio--sin-transicion');
      el.style.width = (texto.scrollWidth + relleno() * 2) + 'px';
      if (!animar) { void el.offsetWidth; el.classList.remove('texto-giratorio--sin-transicion'); }
    }
    function pintar(animar) {
      var frag = document.createDocumentFragment();
      Array.from(palabras[i]).forEach(function (letra, k) {
        var s = document.createElement('span');
        s.className = 'texto-giratorio__letra' + (animar ? ' entra' : '');
        s.textContent = letra === ' ' ? ' ' : letra;
        if (animar) s.style.animationDelay = (k * retraso) + 'ms';
        frag.appendChild(s);
      });
      texto.textContent = '';
      texto.appendChild(frag);
      medir(animar);
    }
    function siguiente() { i = (i + 1) % palabras.length; pintar(true); }
    function actualizar() {
      var debe = vivo && !quieto && visible && !document.hidden && palabras.length > 1;
      if (debe && !timer) timer = setInterval(siguiente, intervalo);
      else if (!debe && timer) { clearInterval(timer); timer = null; }
    }

    pintar(false);
    // la fuente puede cargar después y cambiar el ancho
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (vivo) medir(false); });
    function alCambiarTamano() { medir(false); }
    window.addEventListener('resize', alCambiarTamano);
    var vigia = null;
    if ('IntersectionObserver' in window) {
      vigia = new IntersectionObserver(function (en) { visible = en[en.length - 1].isIntersecting; actualizar(); });
      vigia.observe(el);
    }
    document.addEventListener('visibilitychange', actualizar);
    actualizar();

    el.tg = {
      palabra: function () { return palabras[i]; },
      detener: function () {
        vivo = false; actualizar();
        window.removeEventListener('resize', alCambiarTamano);
        document.removeEventListener('visibilitychange', actualizar);
        if (vigia) vigia.disconnect();
      }
    };
    return el.tg;
  }

  function montarTodos() {
    document.querySelectorAll('[data-texto-giratorio]').forEach(function (el) { montar(el); });
  }

  window.TextoGiratorio = { montar: montar, montarTodos: montarTodos };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarTodos);
  else montarTodos();
})();
