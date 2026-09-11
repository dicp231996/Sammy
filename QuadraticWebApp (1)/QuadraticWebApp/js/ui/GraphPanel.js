/**
 * ui/GraphPanel.js
 *
 * Dibuja la parábola, ejes, grid, vértice, raíces reales e
 * intersección Y sobre un <canvas>, con escala automática.
 * Es la traducción directa de GraphPanel.java a Canvas 2D.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  // Colores leídos directamente de las variables CSS del tema,
  // para que la gráfica siempre esté sincronizada con theme.css.
  function leerColor(nombreVariable) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(nombreVariable)
      .trim();
  }

  class GraphPanel {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.funcion = null;
      this.resultado = null;

      this.xMin = -10;
      this.xMax = 10;
      this.yMin = -10;
      this.yMax = 10;

      this._colores = {
        fondo: leerColor('--bg-panel'),
        grid: leerColor('--grid-line'),
        ejes: leerColor('--axis-line'),
        curva: leerColor('--accent'),
        vertice: leerColor('--yellow'),
        raiz: leerColor('--red'),
        interseccion: leerColor('--text-primary'),
        textoSecundario: leerColor('--text-dim'),
      };

      window.addEventListener('resize', () => this._ajustarTamano());
      this._ajustarTamano();
      this._dibujar();
    }

    setFuncion(funcion, resultado) {
      this.funcion = funcion;
      this.resultado = resultado;
      this._calcularRangoVisible();
      this._dibujar();
    }

    limpiar() {
      this.funcion = null;
      this.resultado = null;
      this._dibujar();
    }

    _ajustarTamano() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';

      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._dibujar();
    }

    _anchoLogico() {
      return this.canvas.width / (window.devicePixelRatio || 1);
    }

    _altoLogico() {
      return this.canvas.height / (window.devicePixelRatio || 1);
    }

    _calcularRangoVisible() {
      const r = this.resultado;
      const f = this.funcion;

      let minX = r.verticeX;
      let maxX = r.verticeX;

      if (r.tieneRaicesReales) {
        minX = Math.min(minX, Math.min(r.raiz1, r.raiz2));
        maxX = Math.max(maxX, Math.max(r.raiz1, r.raiz2));
      }

      const spread = Math.max(maxX - minX, 1);
      const paddingX = Math.max(spread * 0.6, 3);

      this.xMin = minX - paddingX;
      this.xMax = maxX + paddingX;

      let muestraYMin = Infinity;
      let muestraYMax = -Infinity;
      const muestras = 200;
      for (let i = 0; i <= muestras; i++) {
        const x = this.xMin + (this.xMax - this.xMin) * i / muestras;
        const y = f.evaluate(x);
        muestraYMin = Math.min(muestraYMin, y);
        muestraYMax = Math.max(muestraYMax, y);
      }

      muestraYMin = Math.min(muestraYMin, 0);
      muestraYMax = Math.max(muestraYMax, 0);

      const spreadY = Math.max(muestraYMax - muestraYMin, 1);
      const paddingY = spreadY * 0.15;

      this.yMin = muestraYMin - paddingY;
      this.yMax = muestraYMax + paddingY;
    }

    _xAPixel(x, width) {
      return (x - this.xMin) / (this.xMax - this.xMin) * width;
    }

    _yAPixel(y, height) {
      return height - (y - this.yMin) / (this.yMax - this.yMin) * height;
    }

    _calcularPaso(rango) {
      const pasoAprox = rango / 10;
      const magnitud = Math.pow(10, Math.floor(Math.log10(pasoAprox)));
      const residuo = pasoAprox / magnitud;
      let paso;
      if (residuo < 1.5) paso = 1;
      else if (residuo < 3.5) paso = 2;
      else if (residuo < 7.5) paso = 5;
      else paso = 10;
      return paso * magnitud;
    }

    _dibujar() {
      const ctx = this.ctx;
      const width = this._anchoLogico();
      const height = this._altoLogico();
      const c = this._colores;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = c.fondo;
      ctx.fillRect(0, 0, width, height);

      if (!this.funcion || !this.resultado) {
        ctx.fillStyle = c.textoSecundario;
        ctx.font = '14px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('La gráfica aparecerá aquí', width / 2, height / 2);
        return;
      }

      this._dibujarGrid(ctx, width, height);
      this._dibujarEjes(ctx, width, height);
      this._dibujarCurva(ctx, width, height);
      this._dibujarPuntosNotables(ctx, width, height);
    }

    _dibujarGrid(ctx, width, height) {
      ctx.strokeStyle = this._colores.grid;
      ctx.lineWidth = 1;

      const pasoX = this._calcularPaso(this.xMax - this.xMin);
      const pasoY = this._calcularPaso(this.yMax - this.yMin);

      ctx.beginPath();
      for (let x = Math.ceil(this.xMin / pasoX) * pasoX; x <= this.xMax; x += pasoX) {
        const px = Math.round(this._xAPixel(x, width)) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
      }
      for (let y = Math.ceil(this.yMin / pasoY) * pasoY; y <= this.yMax; y += pasoY) {
        const py = Math.round(this._yAPixel(y, height)) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
      }
      ctx.stroke();
    }

    _dibujarEjes(ctx, width, height) {
      ctx.strokeStyle = this._colores.ejes;
      ctx.lineWidth = 1.5;

      const ejeX = Math.round(this._yAPixel(0, height)) + 0.5;
      const ejeY = Math.round(this._xAPixel(0, width)) + 0.5;

      ctx.beginPath();
      if (ejeX >= 0 && ejeX <= height) {
        ctx.moveTo(0, ejeX);
        ctx.lineTo(width, ejeX);
      }
      if (ejeY >= 0 && ejeY <= width) {
        ctx.moveTo(ejeY, 0);
        ctx.lineTo(ejeY, height);
      }
      ctx.stroke();

      ctx.fillStyle = this._colores.textoSecundario;
      ctx.font = '12px "Space Grotesk", sans-serif';
      if (ejeX >= 0 && ejeX <= height) {
        ctx.textAlign = 'right';
        ctx.fillText('x', width - 8, ejeX - 6);
      }
      if (ejeY >= 0 && ejeY <= width) {
        ctx.textAlign = 'left';
        ctx.fillText('y', ejeY + 6, 14);
      }
    }

    _dibujarCurva(ctx, width, height) {
      ctx.strokeStyle = this._colores.curva;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';

      const puntos = Math.max(Math.floor(width), 100);

      ctx.beginPath();
      for (let i = 0; i <= puntos; i++) {
        const x = this.xMin + (this.xMax - this.xMin) * i / puntos;
        const y = this.funcion.evaluate(x);
        const px = this._xAPixel(x, width);
        const py = this._yAPixel(y, height);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    _dibujarPuntosNotables(ctx, width, height) {
      const r = this.resultado;

      this._dibujarPunto(ctx, r.verticeX, r.verticeY, width, height, this._colores.vertice, 'Vértice');
      this._dibujarPunto(ctx, 0, r.interseccionY, width, height, this._colores.interseccion, null);

      if (r.tieneRaicesReales) {
        this._dibujarPunto(ctx, r.raiz1, 0, width, height, this._colores.raiz, null);
        if (r.raiz1 !== r.raiz2) {
          this._dibujarPunto(ctx, r.raiz2, 0, width, height, this._colores.raiz, null);
        }
      }
    }

    _dibujarPunto(ctx, x, y, width, height, color, etiqueta) {
      const px = this._xAPixel(x, width);
      const py = this._yAPixel(y, height);
      const radio = 5;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, radio, 0, Math.PI * 2);
      ctx.fill();

      if (etiqueta) {
        ctx.font = '12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(etiqueta, px + 9, py - 8);
      }
    }
  }

  ns.GraphPanel = GraphPanel;
})(window.QuadApp.ui);
