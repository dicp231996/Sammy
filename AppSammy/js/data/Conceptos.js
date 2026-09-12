/**
 * data/Conceptos.js
 *
 * Glosario estático de conceptos de funciones cuadráticas para la
 * pestaña "Conceptos". Contenido fijo (no depende de a, b, c):
 * explicaciones correctas pero con un tono cercano, no de libro de
 * texto.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.data = window.QuadApp.data || {};

(function (ns) {
  ns.Conceptos = [
    {
      icono: '📐',
      termino: 'Función cuadrática',
      explicacion:
        'Es cualquier función que se puede escribir como f(x) = ax² + bx + c, con a distinto de 0. El "cuadrática" viene de que x aparece elevado al cuadrado: eso es justo lo que hace que, al graficarla, aparezca esa curva en forma de U en vez de una línea recta.',
    },
    {
      icono: '🧂',
      termino: 'Coeficientes a, b y c',
      explicacion:
        'Son los "ingredientes" de la función: cambian su forma final, pero la receta base (x²) es siempre la misma. El coeficiente a es el que más manda: decide si la parábola es angosta o ancha, y si mira hacia arriba o hacia abajo. b la empuja hacia los lados. Y c es simplemente dónde parte la curva en el eje Y, cuando x vale 0.',
    },
    {
      icono: '🌙',
      termino: 'Parábola',
      explicacion:
        'Es la curva con forma de U (o de U invertida) que dibuja toda función cuadrática. Aparece por todos lados en la vida real: la trayectoria de una pelota lanzada al aire, el cable de un puente colgante, o el chorro de agua de una manguera.',
    },
    {
      icono: '😊',
      termino: 'Concavidad',
      explicacion:
        'Es simplemente hacia dónde "mira" la parábola. Si a es positivo, la parábola sonríe: abre hacia arriba, como una U. Si a es negativo, hace pucherito: abre hacia abajo, como una U invertida. Ese pequeño signo le cambia toda la personalidad a la curva.',
    },
    {
      icono: '🎯',
      termino: 'Vértice',
      explicacion:
        'Es el punto más importante de la parábola: la punta de la U. Si la parábola sonríe, ahí está su valor más bajo (el mínimo). Si hace pucherito, ahí está su valor más alto (el máximo). Es literalmente el punto de quiebre de la función, donde deja de bajar y empieza a subir (o viceversa).',
    },
    {
      icono: '🪞',
      termino: 'Eje de simetría',
      explicacion:
        'Es una línea vertical invisible que pasa justo por el vértice y parte la parábola en dos mitades que son espejo una de la otra. Si doblaras el gráfico por esa línea, ambos lados de la curva calzarían perfecto.',
    },
    {
      icono: '🔍',
      termino: 'Discriminante (Δ)',
      explicacion:
        'Es un pequeño cálculo, Δ = b² - 4ac, que funciona como un detector de raíces: te dice, antes de resolver nada, cuántas veces la parábola va a tocar el eje X. Si Δ es positivo, la toca en dos puntos distintos. Si es cero, la toca justo en un solo punto (como si la acariciara). Y si es negativo, ni la roza.',
    },
    {
      icono: '0️⃣',
      termino: 'Raíces (o ceros de la función)',
      explicacion:
        'Son los valores de x donde la función vale exactamente 0, es decir, donde la parábola cruza (o toca) el eje X. Por eso también se llaman "ceros": ahí es donde la función se anula por completo.',
    },
    {
      icono: '↔️',
      termino: 'Intersección con el eje X',
      explicacion:
        'Es el nombre más formal para las raíces, vistas como puntos en el plano: (x, 0). Puede haber cero, una o dos, dependiendo de lo que diga el discriminante.',
    },
    {
      icono: '↕️',
      termino: 'Intersección con el eje Y',
      explicacion:
        'Es mucho más fácil de lo que suena: basta con evaluar la función en x = 0, y el resultado siempre coincide con el coeficiente c. Es como preguntar "¿dónde arranca la curva verticalmente?", antes de que x se mueva para ningún lado.',
    },
    {
      icono: '🎈',
      termino: 'Dilatación y contracción',
      explicacion:
        'Tienen que ver con qué tan angosta o ancha se ve la parábola comparada con la más básica, y = x². Si |a| es mayor que 1, la parábola se estira y se ve más flaca: eso es dilatación. Si |a| es menor que 1, se relaja y se ve más ancha: eso es contracción. Y si |a| es exactamente 1, queda igual que la básica.',
    },
    {
      icono: '🌀',
      termino: 'Raíces complejas (cuando Δ < 0)',
      explicacion:
        'Cuando el discriminante es negativo, las "raíces" existen igual, pero no en el mundo de los números que usamos todos los días (los reales), sino en uno un poco más abstracto: los números complejos, que incluyen la famosa unidad imaginaria i. Para el gráfico, esto solo significa una cosa muy concreta: la parábola nunca toca el eje X.',
    },
  ];
})(window.QuadApp.data);
