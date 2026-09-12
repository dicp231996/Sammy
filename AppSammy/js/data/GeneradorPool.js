/**
 * data/GeneradorPool.js
 *
 * Construye el banco de preguntas para el modo "Prueba": genera
 * funciones cuadráticas aleatorias con variedad real (dos raíces,
 * raíz doble, sin raíces reales; dilatación, contracción y ninguna),
 * y por cada una reutiliza GeneradorEjercicios para obtener sus
 * preguntas evaluables (descarta los pasos puramente informativos,
 * que no tienen una respuesta que calificar).
 *
 * No hardcodea 200 problemas de texto: los genera proceduralmente
 * para asegurar variedad y evitar que el banco se sienta repetitivo.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  function entero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function redondearMedios(n) {
    return Math.round(n * 2) / 2;
  }

  const VALORES_A = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3];

  function elegirA() {
    return VALORES_A[entero(0, VALORES_A.length - 1)];
  }

  /** f(x) = a(x - r1)(x - r2), r1 != r2: garantiza dos raíces reales distintas. */
  function funcionDosRaices() {
    const a = elegirA();
    let r1 = entero(-8, 8);
    let r2 = entero(-8, 8);
    while (r2 === r1) r2 = entero(-8, 8);
    return {
      a,
      b: redondearMedios(-a * (r1 + r2)),
      c: redondearMedios(a * r1 * r2),
    };
  }

  /** f(x) = a(x - r)^2: garantiza una raíz real doble (Δ = 0). */
  function funcionRaizDoble() {
    const a = elegirA();
    const r = entero(-8, 8);
    return {
      a,
      b: redondearMedios(-2 * a * r),
      c: redondearMedios(a * r * r),
    };
  }

  /** Elige b y c de forma que el discriminante quede negativo a propósito. */
  function funcionSinRaices() {
    const a = elegirA();
    const b = entero(-10, 10);
    const offset = entero(1, 6);
    const c = redondearMedios((b * b) / (4 * a) + (a > 0 ? offset : -offset));
    return { a, b, c };
  }

  function generarFuncion() {
    const r = Math.random();
    if (r < 0.5) return funcionDosRaices();
    if (r < 0.75) return funcionRaizDoble();
    return funcionSinRaices();
  }

  /**
   * Genera un banco de al menos `minimoItems` preguntas evaluables,
   * repartidas entre suficientes funciones distintas.
   */
  function generarPool(minimoItems) {
    const { QuadraticFunction } = window.QuadApp.model;
    const { CalculadoraCuadratica, GeneradorEjercicios } = window.QuadApp.data;

    const pool = [];
    const vistos = new Set();
    let intentos = 0;

    while (pool.length < minimoItems && intentos < 1000) {
      intentos++;
      const { a, b, c } = generarFuncion();
      if (a === 0) continue;

      const clave = `${a}|${b}|${c}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      const funcion = new QuadraticFunction(a, b, c);
      let resultado;
      try {
        resultado = CalculadoraCuadratica.calcular(funcion);
      } catch (e) {
        continue;
      }

      GeneradorEjercicios.generar(funcion, resultado)
        .filter((ej) => ej.tipo === 'numeric' || ej.tipo === 'choice')
        .forEach((ej, i) => {
          pool.push(Object.assign({}, ej, { idPool: `${clave}-${ej.id}-${i}` }));
        });
    }

    return pool;
  }

  /** Baraja el banco (Fisher-Yates) y devuelve `cantidad` preguntas sin repetir. */
  function elegirPreguntas(pool, cantidad) {
    const copia = pool.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia.slice(0, Math.min(cantidad, copia.length));
  }

  ns.GeneradorPool = { generarPool, elegirPreguntas };
})(window.QuadApp.data);
