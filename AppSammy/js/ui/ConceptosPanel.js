/**
 * ui/ConceptosPanel.js
 *
 * Renderiza el glosario estático de QuadApp.data.Conceptos como una
 * grilla de tarjetas. No depende de la función actual: se pinta una
 * sola vez al construirse.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  class ConceptosPanel {
    constructor(contenedor) {
      this.contenedor = contenedor;
      this._render();
    }

    _render() {
      const conceptos = window.QuadApp.data.Conceptos || [];
      const tarjetas = conceptos.map((c) => `
        <div class="concepto-card">
          <div class="concepto-card__icono">${c.icono}</div>
          <div class="concepto-card__termino">${c.termino}</div>
          <p class="concepto-card__texto">${c.explicacion}</p>
        </div>`).join('');

      this.contenedor.innerHTML = `<div class="conceptos-grid">${tarjetas}</div>`;
    }
  }

  ns.ConceptosPanel = ConceptosPanel;
})(window.QuadApp.ui);
