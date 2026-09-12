# Calculadora de Funciones Cuadráticas — versión Web

Versión 100% cliente (sin servidor) de la calculadora de funciones
cuadráticas. Corre enteramente en el navegador: `a`, `b`, `c` →
discriminante, raíces, vértice, eje de simetría, concavidad y la
gráfica de la parábola en un `<canvas>`.

## Cómo usarla

Simplemente abre `index.html` con doble clic (funciona directo con
`file://`, sin necesidad de servidor ni instalar nada). Si prefieres
servirla localmente (por ejemplo para simular un dominio real):

```bash
cd QuadraticWebApp
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Estructura del proyecto

Mantiene la misma separación de responsabilidades del proyecto de
escritorio en Java, ahora como "paquetes" JavaScript bajo el
namespace global `QuadApp`:

```
QuadraticWebApp/
├── index.html
├── css/
│   ├── theme.css      -> paleta y tipografías (equivalente a DarkTheme.java)
│   └── layout.css      -> estructura de página y estilos de componentes
└── js/
    ├── model/
    │   └── QuadraticFunction.js       -> QuadApp.model (objeto a, b, c)
    ├── data/
    │   ├── FormatoMatematico.js       -> formato a 1 decimal + HTML de fracciones/raíces
    │   ├── ResultadoCalculo.js        -> QuadApp.data (objeto de resultados)
    │   ├── CalculadoraCuadratica.js   -> QuadApp.data (lógica de cálculo)
    │   ├── GeneradorPasos.js          -> narra el desarrollo paso a paso (solo lectura)
    │   ├── GeneradorEjercicios.js     -> arma la guía interactiva del modo Estudio
    │   ├── GeneradorPool.js           -> banco de 200+ preguntas para el modo Prueba
    │   └── Conceptos.js               -> glosario estático para la pestaña Conceptos
    ├── ui/
    │   ├── GraphPanel.js       -> QuadApp.ui (dibuja en <canvas>, escala 1:1)
    │   ├── InputPanel.js       -> QuadApp.ui (campos a, b, c + botón)
    │   ├── ResultPanel.js      -> QuadApp.ui (resultados en texto)
    │   ├── StepsPanel.js       -> QuadApp.ui (tarjetas de desarrollo paso a paso)
    │   ├── PreguntaWidget.js   -> lógica compartida de pregunta/validación (Estudio y Prueba)
    │   ├── EstudioPanel.js     -> QuadApp.ui (guía interactiva con feedback)
    │   ├── PruebaPanel.js      -> QuadApp.ui (examen cronometrado con nota chilena)
    │   └── ConceptosPanel.js   -> QuadApp.ui (glosario en tarjetas)
    └── app/
        └── main.js          -> QuadApp.app (equivalente a Main+MainFrame)
```

## Funcionalidades

- **Calculadora**: ingresa a, b, c y obtén discriminante, raíces, vértice,
  intersecciones y concavidad, con la gráfica de la parábola.
- **Desarrollo paso a paso**: debajo de los resultados, 6 tarjetas explican
  cómo se llega a cada dato (concavidad, vértice, discriminante,
  intersecciones con los ejes, dilatación/contracción), con la fórmula
  general (fracciones y raíces reales, no texto plano) y la sustitución
  numérica.
- **Modo Estudio** (pestaña): una guía interactiva que resuelve la
  función actual paso a paso pidiéndote que completes cada cálculo.
  Si aciertas lo confirma; si te equivocas, te muestra la respuesta
  correcta y la sustitución que la explica, antes de dejarte avanzar.
- **Modo Prueba** (pestaña): examen cronometrado de 30 preguntas
  elegidas al azar de un banco de más de 200 (generado a partir de
  funciones cuadráticas variadas: dos raíces, raíz doble, sin raíces
  reales, dilatación/contracción/ninguna). 90 minutos con cronómetro
  visible; mismo formato guiado que Estudio en cada pregunta. Al
  terminar (o cuando se acaba el tiempo) entrega una calificación en
  escala chilena de 1.0 a 7.0, con exigencia del 60% para el 4.0.
- **Conceptos** (pestaña): glosario con explicaciones cercanas y
  correctas de los términos clave (coeficientes, discriminante,
  vértice, concavidad, dilatación/contracción, raíces complejas, etc.).
- **Gráfica con escala 1:1**: una unidad en el eje X ocupa exactamente
  los mismos píxeles que una unidad en el eje Y, así la forma real de
  la parábola no se distorsiona visualmente.
- **Signo con checkbox**: cada campo numérico (coeficientes y
  respuestas en Estudio/Prueba) se ingresa como magnitud, con una
  casilla "−" para marcar si es negativo. Esto evita depender de la
  tecla "-" del teclado numérico del celular.
- Todos los números se muestran redondeados a 1 decimal.

## Diferencias frente a la versión de escritorio

- El cálculo (`model` + `data`) es una traducción línea por línea de
  la lógica en Java: mismos resultados, mismas fórmulas.
- La gráfica usa `Canvas 2D` en vez de `Graphics2D` de Swing, con
  autoescalado basado en vértice y raíces, y aspecto 1:1 forzado.
- Es responsiva: en pantallas angostas los paneles se apilan en una
  sola columna.
- Requiere conexión a internet solo para cargar las tipografías
  (Google Fonts); si no hay conexión, cae a una fuente del sistema.

## Llevarla a producción

Al ser solo HTML/CSS/JS estático, puedes publicarla en cualquier
hosting estático sin configuración adicional: GitHub Pages, Netlify,
Vercel, Cloudflare Pages, un bucket S3 con hosting estático, etc.
Basta con subir la carpeta `QuadraticWebApp/` completa.
