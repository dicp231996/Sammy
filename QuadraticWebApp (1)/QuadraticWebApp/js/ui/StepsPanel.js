/**
 * ui/StepsPanel.js
 *
 * Renderiza en el DOM la lista de pasos generada por
 * QuadApp.data.GeneradorPasos: una tarjeta numerada por cada paso,
 * con la fórmula general, la sustitución numérica y el resultado.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  class StepsPanel {
    constructor(contenedor) {
      this.contenedor = contenedor;
    }

    limpiar() {
      this.contenedor.innerHTML = `<div class="result-placeholder">El desarrollo paso a paso aparecerá aquí.</div>`;
    }

    mostrarPasos(pasos) {
      const tarjetas = pasos.map((paso, i) => this._tarjeta(paso, i + 1)).join('');
      this.contenedor.innerHTML = `<div class="steps-grid">${tarjetas}</div>`;
    }

    _tarjeta(paso, numero) {
      return `
        <div class="step-card">
          <div class="step-card__header">
            <span class="step-card__numero">${numero}</span>
            <span class="step-card__titulo">${this._escapar(paso.titulo)}</span>
          </div>
          <div class="step-card__formula">${this._escapar(paso.formulaGeneral)}</div>
          <div class="step-card__sustitucion">${this._escapar(paso.sustitucion)}</div>
          <div class="step-card__resultado">${this._escapar(paso.resultado)}</div>
          <p class="step-card__interpretacion">${this._escapar(paso.interpretacion)}</p>
        </div>`;
    }

    _escapar(texto) {
      const div = document.createElement('div');
      div.textContent = texto;
      return div.innerHTML;
    }
  }

  ns.StepsPanel = StepsPanel;
})(window.QuadApp.ui);
