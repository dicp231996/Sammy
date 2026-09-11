/**
 * ui/InputPanel.js
 *
 * Se conecta a los campos a, b, c y al botón "Calcular" del DOM.
 * Cada coeficiente se ingresa como magnitud (sin signo) en el campo
 * de texto, y un checkbox "−" decide si es negativo. Esto evita
 * depender de la tecla "-" del teclado numérico del celular, que en
 * la mayoría de los teléfonos no está disponible con inputmode="decimal".
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
     * @param {HTMLInputElement} elementos.negA - checkbox de signo de a
     * @param {HTMLInputElement} elementos.negB - checkbox de signo de b
     * @param {HTMLInputElement} elementos.negC - checkbox de signo de c
     * @param {HTMLButtonElement} elementos.boton
     * @param {HTMLElement} elementos.etiquetaError
     */
    constructor({ campoA, campoB, campoC, negA, negB, negC, boton, etiquetaError }) {
      this.campoA = campoA;
      this.campoB = campoB;
      this.campoC = campoC;
      this.negA = negA;
      this.negB = negB;
      this.negC = negC;
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

      const a = this._leerConSigno(this.campoA, this.negA);
      const b = this._leerConSigno(this.campoB, this.negB);
      const c = this._leerConSigno(this.campoC, this.negC);

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

    /**
     * Lee la magnitud del campo de texto (ignorando cualquier signo que
     * el usuario haya tecleado ahí) y le aplica el signo del checkbox.
     */
    _leerConSigno(campo, checkboxNeg) {
      const magnitud = this._parsearMagnitud(campo.value);
      if (magnitud === null) return null;
      return checkboxNeg.checked ? -magnitud : magnitud;
    }

    _parsearMagnitud(texto) {
      const limpio = texto.trim().replace(',', '.').replace(/^-/, '');
      if (limpio === '') return null;
      const valor = Number(limpio);
      return Number.isFinite(valor) ? Math.abs(valor) : null;
    }
  }

  ns.InputPanel = InputPanel;
})(window.QuadApp.ui);
