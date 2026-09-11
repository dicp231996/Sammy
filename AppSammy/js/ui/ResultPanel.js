/**
 * ui/ResultPanel.js
 *
 * Renderiza en el DOM los resultados calculados para la función
 * cuadrática actual. Equivalente a ResultPanel.java.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  class ResultPanel {
    constructor(contenedor) {
      this.contenedor = contenedor;
    }

    mostrarError(mensaje) {
      this.contenedor.innerHTML = `<div class="result-error">${this._escapar(mensaje)}</div>`;
    }

    mostrarResultado(funcion, resultado) {
      const fmt = window.QuadApp.data.FormatoMatematico.fmt;

      let raicesHtml;
      if (resultado.tieneRaicesReales) {
        if (resultado.raiz1 === resultado.raiz2) {
          raicesHtml = `
            <div class="result-row"><span><span class="tag-raiz"></span>x</span><span>${fmt(resultado.raiz1)}</span></div>`;
        } else {
          raicesHtml = `
            <div class="result-row"><span><span class="tag-raiz"></span>x₁</span><span>${fmt(resultado.raiz1)}</span></div>
            <div class="result-row"><span><span class="tag-raiz"></span>x₂</span><span>${fmt(resultado.raiz2)}</span></div>`;
        }
      } else {
        const re = fmt(resultado.parteRealCompleja);
        const im = fmt(resultado.parteImaginariaCompleja);
        raicesHtml = `
          <div class="result-row"><span><span class="tag-raiz"></span>x₁</span><span>${re} + ${im}i</span></div>
          <div class="result-row"><span><span class="tag-raiz"></span>x₂</span><span>${re} - ${im}i</span></div>`;
      }

      this.contenedor.innerHTML = `
        <div class="result-block">
          <div class="result-formula">${this._escapar(funcion.toString())}</div>

          <div class="result-row"><span>Discriminante</span><span>${fmt(resultado.discriminante)}</span></div>
          <div class="result-row"><span>Tipo de raíces</span><span>${this._escapar(resultado.tipoRaices)}</span></div>

          <div class="result-section">
            ${raicesHtml}
          </div>

          <div class="result-section">
            <div class="result-row"><span><span class="tag-raiz tag-vertice"></span>Vértice</span><span>(${fmt(resultado.verticeX)}, ${fmt(resultado.verticeY)})</span></div>
            <div class="result-row"><span>Eje de simetría</span><span>x = ${fmt(resultado.verticeX)}</span></div>
            <div class="result-row"><span>Intersección Y</span><span>(0, ${fmt(resultado.interseccionY)})</span></div>
            <div class="result-row"><span>Concavidad</span><span>${this._escapar(resultado.concavidad)}</span></div>
          </div>
        </div>`;
    }

    _escapar(texto) {
      const div = document.createElement('div');
      div.textContent = texto;
      return div.innerHTML;
    }
  }

  ns.ResultPanel = ResultPanel;
})(window.QuadApp.ui);
