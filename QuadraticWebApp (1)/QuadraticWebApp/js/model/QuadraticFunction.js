/**
 * model/QuadraticFunction.js
 *
 * Objeto que representa una función cuadrática f(x) = a*x^2 + b*x + c.
 * Es un objeto de datos puro: no calcula raíces, vértice, etc.
 * Esa responsabilidad vive en QuadApp.data (equivalente al paquete "data" en Java).
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.model = window.QuadApp.model || {};

(function (ns) {
  class QuadraticFunction {
    constructor(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
    }

    /** Evalúa la función en un valor de x dado. */
    evaluate(x) {
      return this.a * x * x + this.b * x + this.c;
    }

    /** Solo es cuadrática si a != 0. */
    esCuadratica() {
      return this.a !== 0;
    }

    toString() {
      return `f(x) = ${this.a}x² + ${this.b}x + ${this.c}`;
    }
  }

  ns.QuadraticFunction = QuadraticFunction;
})(window.QuadApp.model);
