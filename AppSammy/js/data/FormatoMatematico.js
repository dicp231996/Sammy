/**
 * data/FormatoMatematico.js
 *
 * Utilidades compartidas por GeneradorPasos y GeneradorEjercicios para
 * mostrar números redondeados a 1 decimal y construir fracciones/raíces
 * como HTML (fracción apilada, radical con barra), en vez de texto plano
 * tipo "a/b". No depende del DOM: son solo strings de HTML.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  /** Redondea a 1 decimal y normaliza "-0.0" a "0.0". */
  function fmt(n) {
    let valor = Number(n);
    if (Object.is(valor, -0)) valor = 0;
    const texto = valor.toFixed(1);
    return texto === '-0.0' ? '0.0' : texto;
  }

  /** Fracción apilada (numerador sobre denominador con línea). */
  function frac(numeradorHtml, denominadorHtml) {
    return `<span class="math-frac"><span class="math-num">${numeradorHtml}</span><span class="math-den">${denominadorHtml}</span></span>`;
  }

  /** Raíz cuadrada con radical y barra superior sobre el contenido. */
  function raiz(contenidoHtml) {
    return `<span class="math-sqrt"><span class="math-sqrt-radical">\u221A</span><span class="math-sqrt-content">${contenidoHtml}</span></span>`;
  }

  ns.FormatoMatematico = { fmt, frac, raiz };
})(window.QuadApp.data);
