/**
 * data/ResultadoCalculo.js
 *
 * Objeto que contiene todos los resultados derivados de analizar
 * una función cuadrática: discriminante, raíces, vértice, etc.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  class ResultadoCalculo {
    constructor() {
      this.discriminante = 0;
      this.tipoRaices = '';

      this.tieneRaicesReales = false;
      this.raiz1 = 0;
      this.raiz2 = 0;

      this.parteRealCompleja = 0;
      this.parteImaginariaCompleja = 0;

      this.verticeX = 0;
      this.verticeY = 0;
      this.interseccionY = 0;
      this.concavidad = '';
    }

    setRaicesReales(raiz1, raiz2) {
      this.raiz1 = raiz1;
      this.raiz2 = raiz2;
      this.tieneRaicesReales = true;
    }

    setRaicesComplejas(parteReal, parteImaginaria) {
      this.parteRealCompleja = parteReal;
      this.parteImaginariaCompleja = parteImaginaria;
      this.tieneRaicesReales = false;
    }

    setVertice(x, y) {
      this.verticeX = x;
      this.verticeY = y;
    }
  }

  ns.ResultadoCalculo = ResultadoCalculo;
})(window.QuadApp.data);
