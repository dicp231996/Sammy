/**
 * data/GeneradorPasos.js
 *
 * Construye la lista de pasos (fórmula general -> sustitución -> resultado)
 * que explican cómo se llega a cada dato de la función cuadrática:
 * concavidad, vértice, discriminante, intersecciones con los ejes,
 * y dilatación/contracción respecto a la parábola y = x².
 *
 * No recalcula nada por su cuenta: toma los valores ya calculados por
 * CalculadoraCuadratica y solo los explica paso a paso.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  const fmt = (n) => Number(n).toFixed(4);
  const signo = (n) => (n >= 0 ? `${fmt(n)}` : `(${fmt(n)})`);

  function generar(funcion, resultado) {
    const { a, b, c } = funcion;
    const r = resultado;
    const pasos = [];

    // 1. Concavidad
    pasos.push({
      titulo: 'Concavidad',
      formulaGeneral: 'Signo del coeficiente a',
      sustitucion: `a = ${a} ${a > 0 ? '(a > 0)' : '(a < 0)'}`,
      resultado: a > 0 ? 'Cóncava hacia arriba' : 'Cóncava hacia abajo',
      interpretacion: a > 0
        ? 'La parábola abre hacia arriba: el vértice es un valor mínimo.'
        : 'La parábola abre hacia abajo: el vértice es un valor máximo.',
    });

    // 2. Vértice
    pasos.push({
      titulo: 'Vértice',
      formulaGeneral: 'xᵥ = -b / (2a)      yᵥ = f(xᵥ)',
      sustitucion: `xᵥ = -(${b}) / (2·${a}) = ${fmt(r.verticeX)}`,
      resultado: `V (${fmt(r.verticeX)}, ${fmt(r.verticeY)})`,
      interpretacion: `Se evalúa f(${fmt(r.verticeX)}) para obtener la coordenada yᵥ = ${fmt(r.verticeY)}.`,
    });

    // 3. Discriminante
    pasos.push({
      titulo: 'Discriminante',
      formulaGeneral: 'Δ = b² - 4ac',
      sustitucion: `Δ = (${b})² - 4·${signo(a)}·${signo(c)} = ${fmt(r.discriminante)}`,
      resultado: r.discriminante > 0 ? 'Δ > 0' : r.discriminante === 0 ? 'Δ = 0' : 'Δ < 0',
      interpretacion: r.discriminante > 0
        ? 'Existen dos raíces reales distintas.'
        : r.discriminante === 0
          ? 'Existe una raíz real doble.'
          : 'No existen raíces reales; son complejas conjugadas.',
    });

    // 4. Intersección con el eje X
    let sustitucionX;
    let resultadoX;
    if (r.tieneRaicesReales) {
      if (r.raiz1 === r.raiz2) {
        sustitucionX = `x = -b / (2a) = ${fmt(r.raiz1)}`;
        resultadoX = `(${fmt(r.raiz1)}, 0)`;
      } else {
        sustitucionX = `x = (-b ± √Δ) / (2a) = (${signo(-b)} ± √${fmt(r.discriminante)}) / (2·${a})`;
        resultadoX = `(${fmt(r.raiz1)}, 0)  y  (${fmt(r.raiz2)}, 0)`;
      }
    } else {
      sustitucionX = '√Δ no existe en los reales porque Δ < 0';
      resultadoX = 'No hay intersección con el eje X';
    }
    pasos.push({
      titulo: 'Intersección con el eje X',
      formulaGeneral: 'x = (-b ± √Δ) / (2a)',
      sustitucion: sustitucionX,
      resultado: resultadoX,
      interpretacion: r.tieneRaicesReales
        ? 'Son los puntos donde la curva cruza (o toca) el eje X.'
        : 'La curva queda completamente por encima o por debajo del eje X.',
    });

    // 5. Intersección con el eje Y
    pasos.push({
      titulo: 'Intersección con el eje Y',
      formulaGeneral: 'f(0) = c',
      sustitucion: `f(0) = ${c}`,
      resultado: `(0, ${fmt(r.interseccionY)})`,
      interpretacion: 'Es el valor de la función cuando x = 0: siempre coincide con c.',
    });

    // 6. Dilatación / Contracción (respecto a la parábola base y = x²)
    const absA = Math.abs(a);
    let tipoEscala;
    let interpretacionEscala;
    if (absA > 1) {
      tipoEscala = 'Dilatación';
      interpretacionEscala = 'La parábola se estira verticalmente: se ve más angosta/cerrada que y = x².';
    } else if (absA < 1) {
      tipoEscala = 'Contracción';
      interpretacionEscala = 'La parábola se comprime verticalmente: se ve más ancha/abierta que y = x².';
    } else {
      tipoEscala = 'Sin dilatación ni contracción';
      interpretacionEscala = 'Con |a| = 1, la parábola conserva el mismo ancho que y = x².';
    }
    pasos.push({
      titulo: 'Dilatación / Contracción',
      formulaGeneral: 'Comparar |a| con 1',
      sustitucion: `|a| = |${a}| = ${fmt(absA)}`,
      resultado: tipoEscala,
      interpretacion: interpretacionEscala,
    });

    return pasos;
  }

  ns.GeneradorPasos = { generar };
})(window.QuadApp.data);
