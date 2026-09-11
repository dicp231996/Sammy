/**
 * ui/InputPanel.js
 *
 * Se conecta a los campos a, b, c y al botón "Calcular" del DOM,
 * valida la entrada y notifica al callback registrado.
 * Equivalente a InputPanel.java + su interfaz Listener.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  class InputPanel {
    /**
     * @param {Object} elementos - referencias a los elementos del DOM.
     * @param {HTMLInputElement} elementos.campoA
     * @param {HTMLInputElement} elementos.campoB
     * @param {HTMLInputElement} elementos.campoC
     * @param {HTMLButtonElement} elementos.boton
     * @param {HTMLElement} elementos.etiquetaError
     */
    constructor({ campoA, campoB, campoC, boton, etiquetaError }) {
      this.campoA = campoA;
      this.campoB = campoB;
      this.campoC = campoC;
      this.boton = boton;
      this.etiquetaError = etiquetaError;
      this.onCalcular = null;

      this.boton.addEventListener('click', () => this._procesarClick());

      const enterHandler = (e) => {
        if (e.key === 'Enter') this._procesarClick();
      };
      this.campoA.addEventListener('keydown', enterHandler);
      this.campoB.addEventListener('keydown', enterHandler);
      this.campoC.addEventListener('keydown', enterHandler);
    }

    /** Registra el callback: (a, b, c) => void */
    setListener(callback) {
      this.onCalcular = callback;
    }

    _procesarClick() {
      this.etiquetaError.textContent = '';

      const a = this._parsear(this.campoA.value);
      const b = this._parsear(this.campoB.value);
      const c = this._parsear(this.campoC.value);

      if (a === null || b === null || c === null) {
        this.etiquetaError.textContent = 'Ingresa solo números válidos en a, b y c.';
        return;
      }

      if (a === 0) {
        this.etiquetaError.textContent = "El coeficiente 'a' no puede ser 0.";
        return;
      }

      if (this.onCalcular) {
        this.onCalcular(a, b, c);
      }
    }

    _parsear(texto) {
      const limpio = texto.trim().replace(',', '.');
      if (limpio === '') return null;
      const valor = Number(limpio);
      return Number.isFinite(valor) ? valor : null;
    }
  }

  ns.InputPanel = InputPanel;
})(window.QuadApp.ui);
