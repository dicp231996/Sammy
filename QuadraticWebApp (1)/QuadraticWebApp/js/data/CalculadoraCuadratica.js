/**
 * data/CalculadoraCuadratica.js
 *
 * Contiene la lógica de cálculo: discriminante, raíces (reales o
 * complejas), vértice, intersección con el eje Y y concavidad.
 * Es la traducción directa de CalculadoraCuadratica.java.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns, model) {
  /**
   * Calcula todos los datos relevantes de la función cuadrática dada.
   * Lanza un Error si a === 0 (no sería una función cuadrática).
   */
  function calcular(funcion) {
    if (!funcion.esCuadratica()) {
      throw new Error("El coeficiente 'a' no puede ser 0, o la función deja de ser cuadrática.");
    }

    const a = funcion.a;
    const b = funcion.b;
    const c = funcion.c;

    const resultado = new ns.ResultadoCalculo();

    const discriminante = (b * b) - (4 * a * c);
    resultado.discriminante = discriminante;

    const verticeX = -b / (2 * a);
    const verticeY = funcion.evaluate(verticeX);
    resultado.setVertice(verticeX, verticeY);

    resultado.interseccionY = c;
    resultado.concavidad = a > 0
      ? 'Cóncava hacia arriba (tiene mínimo)'
      : 'Cóncava hacia abajo (tiene máximo)';

    if (discriminante > 0) {
      const raizDisc = Math.sqrt(discriminante);
      const raiz1 = (-b + raizDisc) / (2 * a);
      const raiz2 = (-b - raizDisc) / (2 * a);
      resultado.setRaicesReales(raiz1, raiz2);
      resultado.tipoRaices = 'Dos raíces reales distintas';
    } else if (discriminante === 0) {
      const raizUnica = -b / (2 * a);
      resultado.setRaicesReales(raizUnica, raizUnica);
      resultado.tipoRaices = 'Una raíz real doble';
    } else {
      const parteReal = -b / (2 * a);
      const parteImaginaria = Math.sqrt(-discriminante) / (2 * a);
      resultado.setRaicesComplejas(parteReal, parteImaginaria);
      resultado.tipoRaices = 'Raíces complejas conjugadas';
    }

    return resultado;
  }

  ns.CalculadoraCuadratica = { calcular };
})(window.QuadApp.data, window.QuadApp.model);
