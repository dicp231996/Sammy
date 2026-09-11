/**
 * data/GeneradorEjercicios.js
 *
 * Construye la secuencia de ejercicios guiados del modo "Estudio":
 * una mezcla de pasos informativos (solo lectura, con botón Continuar)
 * y pasos interactivos (numéricos o de opción múltiple) que el usuario
 * debe resolver. Cada ejercicio interactivo trae su respuesta correcta
 * y una explicación con la sustitución numérica, para dar feedback
 * cuando el usuario se equivoca.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  function generar(funcion, resultado) {
    const { fmt, frac, raiz } = ns.FormatoMatematico;
    const { a, b, c } = funcion;
    const r = resultado;
    const ejercicios = [];

    // 0. Sustitución de coeficientes (informativo)
    ejercicios.push({
      id: 'coeficientes',
      titulo: 'Sustituye los coeficientes',
      tipo: 'info',
      guia: 'Toda función cuadrática tiene la forma f(x) = a·x² + b·x + c. El primer paso siempre es identificar y sustituir tus coeficientes en la fórmula.',
      formula: 'f(x) = a·x² + b·x + c',
      resultado: `f(x) = (${fmt(a)})x² + (${fmt(b)})x + (${fmt(c)})`,
    });

    // 1. Discriminante (numérico)
    ejercicios.push({
      id: 'discriminante',
      titulo: 'Calculemos el discriminante',
      tipo: 'numeric',
      guia: 'El discriminante nos dice, antes de calcular nada más, cuántas raíces reales tiene la función. Sustituye los coeficientes y resuelve.',
      formula: 'Δ = b² - 4ac',
      campos: [{ id: 'delta', label: 'Δ =', esperado: r.discriminante }],
      explicacion: `Δ = (${fmt(b)})² - 4\u00B7(${fmt(a)})\u00B7(${fmt(c)}) = ${fmt(r.discriminante)}`,
    });

    // 2. Interpretar el discriminante (opción múltiple)
    const opcionesDelta = [
      'Dos raíces reales distintas (Δ > 0)',
      'Una raíz real doble (Δ = 0)',
      'Ninguna raíz real: son complejas conjugadas (Δ < 0)',
    ];
    const correctaDelta = r.discriminante > 0 ? 0 : r.discriminante === 0 ? 1 : 2;
    ejercicios.push({
      id: 'interpretarDelta',
      titulo: 'Veamos qué nos dice el delta',
      tipo: 'choice',
      guia: `Ya sabemos que Δ = ${fmt(r.discriminante)}. Según su signo, ¿cuántas raíces reales tiene la función?`,
      formula: 'Δ &gt; 0 &rarr; 2 raíces&nbsp;&nbsp;&nbsp;Δ = 0 &rarr; 1 raíz&nbsp;&nbsp;&nbsp;Δ &lt; 0 &rarr; 0 raíces reales',
      opciones: opcionesDelta,
      correcta: correctaDelta,
      explicacion: `Con Δ = ${fmt(r.discriminante)}, la función tiene ${opcionesDelta[correctaDelta].toLowerCase()}.`,
    });

    // 3. Intersección con el eje X
    if (r.tieneRaicesReales) {
      if (r.raiz1 === r.raiz2) {
        ejercicios.push({
          id: 'raicesX',
          titulo: 'Intersección con el eje X',
          tipo: 'numeric',
          guia: 'Como Δ = 0, hay una única raíz real. Calcúlala con la fórmula general.',
          formula: `x = ${frac('-b', '2a')}`,
          campos: [{ id: 'x1', label: 'x =', esperado: r.raiz1 }],
          explicacion: `x = ${frac(`-(${fmt(b)})`, `2\u00B7(${fmt(a)})`)} = ${fmt(r.raiz1)}`,
        });
      } else {
        ejercicios.push({
          id: 'raicesX',
          titulo: 'Intersección con el eje X',
          tipo: 'numeric',
          guia: 'Usa la fórmula general para encontrar las dos raíces reales.',
          formula: `x = ${frac(`-b ± ${raiz('Δ')}`, '2a')}`,
          campos: [
            { id: 'x1', label: 'x₁ =', esperado: r.raiz1 },
            { id: 'x2', label: 'x₂ =', esperado: r.raiz2 },
          ],
          explicacion: `x = ${frac(`-(${fmt(b)}) ± ${raiz(fmt(r.discriminante))}`, `2\u00B7(${fmt(a)})`)} &rarr; x₁ = ${fmt(r.raiz1)}, x₂ = ${fmt(r.raiz2)}`,
        });
      }
    } else {
      ejercicios.push({
        id: 'raicesX',
        titulo: 'Intersección con el eje X',
        tipo: 'info',
        guia: 'Como el discriminante es negativo, la raíz cuadrada de Δ no existe en los números reales.',
        formula: `x = ${frac(`-b ± ${raiz('Δ')}`, '2a')}`,
        resultado: 'La parábola no cruza el eje X.',
      });
    }

    // 4. Intersección con el eje Y (numérico)
    ejercicios.push({
      id: 'interseccionY',
      titulo: 'Intersección con el eje Y',
      tipo: 'numeric',
      guia: 'Evalúa la función en x = 0. Fíjate que este valor siempre coincide con uno de tus coeficientes.',
      formula: 'f(0) = c',
      campos: [{ id: 'y0', label: 'y =', esperado: c }],
      explicacion: `f(0) = ${fmt(c)}`,
    });

    // 5. Vértice (numérico, dos campos)
    ejercicios.push({
      id: 'vertice',
      titulo: 'Encontremos el vértice',
      tipo: 'numeric',
      guia: 'Primero calcula xᵥ con la fórmula general, luego evalúa f(xᵥ) para obtener yᵥ.',
      formula: `x\u1D65 = ${frac('-b', '2a')}&nbsp;&nbsp;&nbsp;y\u1D65 = f(x\u1D65)`,
      campos: [
        { id: 'vx', label: 'xᵥ =', esperado: r.verticeX },
        { id: 'vy', label: 'yᵥ =', esperado: r.verticeY },
      ],
      explicacion: `x\u1D65 = ${frac(`-(${fmt(b)})`, `2\u00B7(${fmt(a)})`)} = ${fmt(r.verticeX)} &rarr; y\u1D65 = f(${fmt(r.verticeX)}) = ${fmt(r.verticeY)}`,
    });

    // 6. Concavidad (opción múltiple)
    ejercicios.push({
      id: 'concavidad',
      titulo: '¿Hacia dónde abre la parábola?',
      tipo: 'choice',
      guia: `Observa el signo de a. Aquí a = ${fmt(a)}.`,
      formula: 'a &gt; 0 &rarr; abre hacia arriba&nbsp;&nbsp;&nbsp;a &lt; 0 &rarr; abre hacia abajo',
      opciones: ['Cóncava hacia arriba', 'Cóncava hacia abajo'],
      correcta: a > 0 ? 0 : 1,
      explicacion: a > 0
        ? `Como a = ${fmt(a)} &gt; 0, la parábola abre hacia arriba y el vértice es un mínimo.`
        : `Como a = ${fmt(a)} &lt; 0, la parábola abre hacia abajo y el vértice es un máximo.`,
    });

    // 7. Dilatación / Contracción (opción múltiple)
    const absA = Math.abs(a);
    const opcionesEscala = ['Dilatación (|a| > 1)', 'Contracción (|a| < 1)', 'Ninguna (|a| = 1)'];
    const correctaEscala = absA > 1 ? 0 : absA < 1 ? 1 : 2;
    ejercicios.push({
      id: 'escala',
      titulo: '¿Dilatación o contracción?',
      tipo: 'choice',
      guia: `Compara |a| con 1. Aquí |a| = |${fmt(a)}| = ${fmt(absA)}.`,
      formula: 'Comparar |a| con 1',
      opciones: opcionesEscala,
      correcta: correctaEscala,
      explicacion: `Con |a| = ${fmt(absA)}, se produce ${opcionesEscala[correctaEscala].toLowerCase()} respecto a y = x².`,
    });

    return ejercicios;
  }

  ns.GeneradorEjercicios = { generar };
})(window.QuadApp.data);
