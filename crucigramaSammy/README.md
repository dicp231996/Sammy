# Creador de Crucigramas

App web (HTML + CSS + JavaScript, sin servidor) para crear crucigramas personalizados y exportarlos a PDF.

## Usarla en tu computador
Abre `index.html` con doble clic en Chrome, Edge o Firefox.

## Publicarla en internet (gratis)

### Opción A — Netlify Drop (la más rápida)
1. Descomprime el zip.
2. Entra a https://app.netlify.com/drop y crea una cuenta gratuita.
3. Arrastra la carpeta `crucigrama` (la que contiene `index.html`) a la página.
4. Netlify te da un enlace público. En «Site configuration → Change site name» puedes elegir uno como `mis-crucigramas.netlify.app`.

Para actualizar: en tu sitio de Netlify, pestaña «Deploys», arrastra de nuevo la carpeta.

### Opción B — GitHub Pages
1. Crea un repositorio público en GitHub, por ejemplo `crucigramas`.
2. «Add file → Upload files» y sube el CONTENIDO de la carpeta (`index.html`, `css/`, `js/`), no la carpeta misma.
3. «Settings → Pages» → Source: «Deploy from a branch», rama `main`, carpeta `/ (root)` → Save.
4. En un par de minutos queda en `https://TU-USUARIO.github.io/crucigramas/`.

## Estructura
- `js/model.js` — datos (Pool y definiciones)
- `js/generator.js` — algoritmo de colocación
- `js/theme.js`, `js/fonts.js`, `js/assets.js` — personalización
- `js/renderer.js` — dibujo en canvas
- `js/pdf-exporter.js`, `js/download.js` — exportación y descarga del PDF
- `js/ui/*` — pantallas
- `js/app.js` — controlador

Requiere internet para jsPDF (PDF) y Google Fonts; sin conexión usa la impresión del navegador y fuentes del sistema.
