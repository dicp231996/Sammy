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
    │   └── QuadraticFunction.js     -> QuadApp.model (objeto a, b, c)
    ├── data/
    │   ├── ResultadoCalculo.js      -> QuadApp.data (objeto de resultados)
    │   └── CalculadoraCuadratica.js -> QuadApp.data (lógica de cálculo)
    ├── ui/
    │   ├── GraphPanel.js    -> QuadApp.ui (dibuja en <canvas>)
    │   ├── InputPanel.js    -> QuadApp.ui (campos a, b, c + botón)
    │   └── ResultPanel.js   -> QuadApp.ui (resultados en texto)
    └── app/
        └── main.js          -> QuadApp.app (equivalente a Main+MainFrame)
```

Se usan `<script>` normales (no ES modules) para que la app funcione
abriendo el archivo directamente, sin problemas de CORS. Cada archivo
se auto-registra en su namespace (`QuadApp.model`, `QuadApp.data`,
`QuadApp.ui`, `QuadApp.app`), imitando los paquetes de Java.

## Diferencias frente a la versión de escritorio

- El cálculo (`model` + `data`) es una traducción línea por línea de
  la lógica en Java: mismos resultados, mismas fórmulas.
- La gráfica usa `Canvas 2D` en vez de `Graphics2D` de Swing, con el
  mismo criterio de autoescalado (basado en vértice y raíces).
- Es responsiva: en pantallas angostas los tres paneles se apilan en
  una sola columna.
- Requiere conexión a internet solo para cargar las tipografías
  (Google Fonts); si no hay conexión, cae a una fuente del sistema.

## Llevarla a producción

Al ser solo HTML/CSS/JS estático, puedes publicarla en cualquier
hosting estático sin configuración adicional: GitHub Pages, Netlify,
Vercel, Cloudflare Pages, un bucket S3 con hosting estático, etc.
Basta con subir la carpeta `QuadraticWebApp/` completa.
