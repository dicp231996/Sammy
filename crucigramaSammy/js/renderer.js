/**
 * renderer.js — Capa de PRESENTACIÓN GRÁFICA.
 * Dibuja un layout (del generador) en un <canvas> usando el estilo del Theme.
 * El mismo código sirve para la vista previa y para el PDF, así lo que ves
 * es exactamente lo que se exporta. Las casillas vacías no se dibujan.
 */
(function (global) {
  'use strict';

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  /** Dibuja una imagen dentro de un rectángulo según el modo de ajuste. */
  function drawImageFit(ctx, img, x, y, w, h, fit) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    if (fit === 'stretch') { ctx.drawImage(img, x, y, w, h); return; }
    if (fit === 'tile') {
      const pattern = ctx.createPattern(img, 'repeat');
      ctx.save(); ctx.fillStyle = pattern; ctx.translate(x, y); ctx.fillRect(0, 0, w, h); ctx.restore();
      return;
    }
    const scale = fit === 'contain' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  /** Espacio mínimo alrededor del tablero para que quepan las flechas externas. */
  function effectivePadding(style) {
    const needed = style.showArrows && style.arrowStyle === 'outside' ? style.cellSize * 0.5 : 0;
    return Math.max(style.padding, needed);
  }

  /**
   * Geometría lógica (sin escala): tamaño total y posición del tablero,
   * dejando arriba una franja para el título si está activo.
   */
  function measure(layout, style, title) {
    const { cellSize, gap } = style;
    const pad = effectivePadding(style);
    const boardW = layout.width * cellSize + (layout.width - 1) * gap;
    const boardH = layout.height * cellSize + (layout.height - 1) * gap;

    let titleH = 0, titleW = 0;
    const hasTitle = style.showTitle && title;
    if (hasTitle) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `700 ${style.titleSize}px ${style.titleFontFamily}`;
      titleW = ctx.measureText(title).width;
      titleH = style.titleSize * 1.5;
    }
    const width = Math.max(boardW, titleW) + pad * 2;
    const height = boardH + pad * 2 + titleH;
    return {
      width, height, pad, titleH,
      boardX: (width - boardW) / 2,
      boardY: pad + titleH,
      titleY: pad * 0.6 + titleH / 2,
    };
  }

  /** Flecha: shaft + punta, apuntando en `dir` con la punta en (tx, ty). */
  function drawArrow(ctx, tx, ty, dir, len, color) {
    const head = len * 0.45, half = len * 0.28;
    const [ux, uy] = dir === 'H' ? [1, 0] : [0, 1]; // hacia donde apunta
    const [px, py] = [-uy, ux];                      // perpendicular
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, len * 0.14);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx - ux * len, ty - uy * len);
    ctx.lineTo(tx - ux * head, ty - uy * head);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - ux * head + px * half, ty - uy * head + py * half);
    ctx.lineTo(tx - ux * head - px * half, ty - uy * head - py * half);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Dibuja una flecha por palabra marcando su primera letra y dirección. */
  function drawArrows(ctx, layout, style, geo) {
    const { cellSize: cs, gap } = style;
    // Casilla vacía que ocupa cada flecha externa; si dos coinciden, se separan
    const hostOf = w => (w.dir === 'H' ? `${w.row},${w.col - 1}` : `${w.row - 1},${w.col}`);
    const hostCount = new Map();
    for (const w of layout.words) hostCount.set(hostOf(w), (hostCount.get(hostOf(w)) || 0) + 1);

    for (const w of layout.words) {
      const x = geo.boardX + w.col * (cs + gap);
      const y = geo.boardY + w.row * (cs + gap);
      if (style.arrowStyle === 'outside') {
        // En el hueco anterior a la palabra (siempre vacío), apuntando a la 1.ª casilla
        const len = cs * 0.42;
        const pos = hostCount.get(hostOf(w)) > 1 ? 0.3 : 0.55;
        if (w.dir === 'H') drawArrow(ctx, x - 2, y + cs * pos, 'H', len, style.arrowColor);
        else drawArrow(ctx, x + cs * pos, y - 2, 'V', len, style.arrowColor);
      } else {
        // Pequeño triángulo dentro de la 1.ª casilla, pegado al borde de entrada
        const t = cs * 0.16, b = style.borderWidth;
        ctx.save();
        ctx.fillStyle = style.arrowColor;
        ctx.beginPath();
        if (w.dir === 'H') {
          const cy = y + cs * 0.62;
          ctx.moveTo(x + b + 1, cy - t * 0.7); ctx.lineTo(x + b + 1 + t, cy); ctx.lineTo(x + b + 1, cy + t * 0.7);
        } else {
          const cx = x + cs * 0.62;
          ctx.moveTo(cx - t * 0.7, y + b + 1); ctx.lineTo(cx, y + b + 1 + t); ctx.lineTo(cx + t * 0.7, y + b + 1);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} layout  resultado de CW.generator.generate
   * @param {Theme}  theme
   * @param {{showSolution?:boolean, scale?:number, maxPixels?:number, title?:string}} opts
   *        title: si se omite, se usa theme.title
   */
  function render(canvas, layout, theme, opts = {}) {
    const style = theme.style;
    const assets = theme.assets;
    const title = opts.title !== undefined ? opts.title : theme.title;
    const size = measure(layout, style, title);

    // Escala (nitidez) limitada para no crear canvases gigantes
    let scale = opts.scale || global.devicePixelRatio || 1;
    const maxPixels = opts.maxPixels || 5000;
    scale = Math.min(scale, maxPixels / size.width, maxPixels / size.height);

    canvas.width = Math.round(size.width * scale);
    canvas.height = Math.round(size.height * scale);
    canvas.style.aspectRatio = `${size.width} / ${size.height}`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    // 1) Fondo
    ctx.fillStyle = style.bgColor;
    ctx.fillRect(0, 0, size.width, size.height);
    if (assets.background) {
      ctx.save();
      ctx.globalAlpha = style.bgOpacity;
      drawImageFit(ctx, assets.background.img, 0, 0, size.width, size.height, style.bgFit);
      ctx.restore();
    }

    // 2) Título
    if (size.titleH) {
      ctx.save();
      ctx.font = `700 ${style.titleSize}px ${style.titleFontFamily}`;
      ctx.fillStyle = style.titleColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, size.width / 2, size.titleY);
      ctx.restore();
    }

    // 3) Casillas (solo las que contienen letra)
    const { cellSize: cs, gap, radius, borderWidth } = style;
    const numberFont = `700 ${Math.max(8, cs * 0.26)}px ${style.numberFontFamily}`;
    const letterFont = `${style.fontWeight} ${cs * 0.56}px ${style.fontFamily}`;

    for (let r = 0; r < layout.height; r++) {
      for (let c = 0; c < layout.width; c++) {
        const cell = layout.cells[r][c];
        if (!cell) continue;
        const x = size.boardX + c * (cs + gap);
        const y = size.boardY + r * (cs + gap);
        const inset = borderWidth / 2;

        // Relleno (+ sombra opcional)
        ctx.save();
        if (style.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.25)';
          ctx.shadowBlur = cs * 0.15;
          ctx.shadowOffsetY = cs * 0.05;
        }
        roundRectPath(ctx, x + inset, y + inset, cs - borderWidth, cs - borderWidth, radius);
        ctx.fillStyle = hexToRgba(style.cellColor, style.cellOpacity);
        ctx.fill();
        ctx.restore();

        // Textura de casilla (asset)
        if (assets.cell) {
          ctx.save();
          roundRectPath(ctx, x + inset, y + inset, cs - borderWidth, cs - borderWidth, radius);
          ctx.clip();
          ctx.globalAlpha = style.cellImageOpacity;
          drawImageFit(ctx, assets.cell.img, x, y, cs, cs, 'cover');
          ctx.restore();
        }

        // Borde
        if (borderWidth > 0) {
          roundRectPath(ctx, x + inset, y + inset, cs - borderWidth, cs - borderWidth, radius);
          ctx.lineWidth = borderWidth;
          ctx.strokeStyle = style.borderColor;
          ctx.stroke();
        }

        // Número(s) de palabra
        if (cell.numbers.length) {
          ctx.font = numberFont;
          ctx.fillStyle = style.numberColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const off = Math.max(cs * 0.07, Math.min(radius, cs / 2) * 0.32); // se aleja de esquinas redondeadas
          ctx.fillText(cell.numbers.join('/'), x + borderWidth + off, y + borderWidth + off * 0.75);
        }

        // Letra (solo en modo solución)
        if (opts.showSolution) {
          ctx.font = letterFont;
          ctx.fillStyle = style.letterColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.letter, x + cs / 2, y + cs / 2 + cs * 0.06);
        }
      }
    }
    // 4) Flechas de inicio de palabra
    if (style.showArrows) drawArrows(ctx, layout, style, size);

    return { width: size.width, height: size.height, scale };
  }

  global.CW = global.CW || {};
  global.CW.renderer = { render, measure };
})(typeof window !== 'undefined' ? window : globalThis);
