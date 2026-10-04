/**
 * pdf-exporter.js — Capa de EXPORTACIÓN.
 * Genera un PDF con: logo + título, tablero, definiciones (a dos columnas)
 * y, opcionalmente, una página con la solución. Permite elegir tamaño de
 * papel y orientación. Usa jsPDF (cargado por CDN); si no está disponible
 * (sin internet), recurre a la impresión del navegador.
 */
(function (global) {
  'use strict';

  /** Tamaños de papel en milímetros (ancho × alto en vertical). */
  const PAPER_SIZES = {
    carta:    { label: 'Carta',             w: 215.9, h: 279.4 },
    oficio:   { label: 'Oficio',            w: 216,   h: 330 },
    legal:    { label: 'Legal / Oficio US', w: 215.9, h: 355.6 },
    a5:       { label: 'A5',                w: 148,   h: 210 },
    a4:       { label: 'A4',                w: 210,   h: 297 },
    a3:       { label: 'A3',                w: 297,   h: 420 },
    b4:       { label: 'B4',                w: 250,   h: 353 },
    tabloide: { label: 'Tabloide',          w: 279.4, h: 431.8 },
  };

  /** "Carta (21,6 × 27,9 cm)" */
  function paperLabel(key) {
    const p = PAPER_SIZES[key];
    const cm = mm => (Math.round(mm) / 10).toLocaleString('es-CL', { maximumFractionDigits: 1 });
    return `${p.label} (${cm(p.w)} × ${cm(p.h)} cm)`;
  }

  /** Geometría de la página según tamaño y orientación. */
  function makePage(paperKey, orientation) {
    const p = PAPER_SIZES[paperKey] || PAPER_SIZES.carta;
    const landscape = orientation === 'landscape';
    const w = landscape ? p.h : p.w;
    const h = landscape ? p.w : p.h;
    const margin = Math.max(10, Math.min(w, h) * 0.07);
    return { w, h, margin, contentW: w - margin * 2 };
  }

  function slug(text) {
    return String(text || 'crucigrama')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'crucigrama';
  }

  /** Convierte cualquier imagen (incluido SVG/WEBP) a PNG, que jsPDF sí entiende. */
  function rasterize(img, maxSide = 800) {
    const iw = img.naturalWidth || 300, ih = img.naturalHeight || 150;
    const s = Math.min(1, maxSide / Math.max(iw, ih));
    const c = document.createElement('canvas');
    c.width = Math.round(iw * s); c.height = Math.round(ih * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }

  /** Renderiza el tablero en un canvas fuera de pantalla, en alta resolución. */
  function boardImage(layout, theme, showSolution) {
    const canvas = document.createElement('canvas');
    const info = global.CW.renderer.render(canvas, layout, theme, { showSolution, scale: 3, maxPixels: 4200 });
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.93), width: info.width, height: info.height };
  }

  function clueLine(w) {
    return `${w.number}. ${w.clue || '(sin definición)'} (${w.length})`;
  }

  /** Cabecera: logo opcional + título + subtítulo. Devuelve la Y donde seguir. */
  function drawHeader(doc, page, title, theme, subtitle) {
    let y = page.margin;
    const logo = theme.assets.logo;
    if (logo) {
      const maxH = 22, maxW = 60;
      const ratio = logo.img.naturalWidth / logo.img.naturalHeight || 1;
      let h = maxH, w = h * ratio;
      if (w > maxW) { w = maxW; h = w / ratio; }
      doc.addImage(rasterize(logo.img), 'PNG', (page.w - w) / 2, y, w, h);
      y += h + 4;
    }
    // Si el título ya va dibujado en el tablero (con su fuente), no se repite
    if (title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(20, 20, 20);
      doc.text(title, page.w / 2, y + 6, { align: 'center', maxWidth: page.contentW });
      y += 10;
    }
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(subtitle, page.w / 2, y + 2, { align: 'center' });
      y += 6;
    }
    return y + 4;
  }

  /** Coloca el tablero centrado dentro del área disponible. */
  function drawBoard(doc, page, img, y, maxH) {
    const ratio = img.width / img.height;
    let w = page.contentW, h = w / ratio;
    if (h > maxH) { h = maxH; w = h * ratio; }
    doc.addImage(img.dataUrl, 'JPEG', (page.w - w) / 2, y, w, h);
    return y + h + 8;
  }

  /**
   * Definiciones en columnas tipo periódico: el texto baja por la columna
   * izquierda, sigue en la derecha y continúa en páginas nuevas si hace falta.
   * Si el tablero dejó poco espacio, las definiciones empiezan en otra página.
   */
  function drawClues(doc, page, layout, startY) {
    const cols = page.contentW >= 160 ? 2 : 1;
    const gapX = 8;
    const colW = (page.contentW - gapX * (cols - 1)) / cols;
    const bottom = page.h - page.margin;
    const LINE = 4.8;

    let y = startY;
    if (bottom - y < 40) { doc.addPage(); y = page.margin; }

    // Encabezado general con línea separadora
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 20);
    doc.text('Definiciones', page.margin, y);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(page.margin, y + 2, page.w - page.margin, y + 2);
    y += 9;

    let top = y, col = 0;
    const colX = () => page.margin + col * (colW + gapX);
    const ensure = needed => {
      if (y + needed <= bottom) return;
      if (col < cols - 1) { col++; y = top; }
      else { doc.addPage(); col = 0; top = y = page.margin; }
    };

    const section = (label, list) => {
      if (!list.length) return;
      ensure(LINE * 3); // que el subtítulo no quede solo al final de una columna
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(label, colX(), y);
      y += 6;
      for (const w of list) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        const lines = doc.splitTextToSize(clueLine(w), colW);
        ensure(lines.length * LINE);
        doc.text(lines, colX(), y);
        y += lines.length * LINE + 1.2;
      }
      y += 4;
    };
    section('Horizontales', layout.across);
    section('Verticales', layout.down);
  }

  function printFallback(layout, theme, title, paperKey, orientation) {
    const img = boardImage(layout, theme, false);
    const p = PAPER_SIZES[paperKey] || PAPER_SIZES.carta;
    const size = orientation === 'landscape' ? `${p.h}mm ${p.w}mm` : `${p.w}mm ${p.h}mm`;
    const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const list = arr => arr.map(w => `<li>${esc(clueLine(w))}</li>`).join('');
    const win = window.open('', '_blank');
    if (!win) throw new Error('El navegador bloqueó la ventana de impresión.');
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
      <style>@page{size:${size};margin:15mm}body{font-family:Arial,sans-serif}
      img{max-width:100%;display:block;margin:0 auto 16px}h1{text-align:center}
      .cols{columns:2;column-gap:8mm}ul{list-style:none;padding:0;margin:0 0 12px}</style></head><body>
      ${theme.assets.logo ? `<img src="${theme.assets.logo.dataUrl}" style="max-height:80px">` : ''}
      <h1>${esc(title)}</h1><img src="${img.dataUrl}">
      <h2>Definiciones</h2><div class="cols">
      <h3>Horizontales</h3><ul>${list(layout.across)}</ul>
      <h3>Verticales</h3><ul>${list(layout.down)}</ul></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    win.document.close();
  }

  /**
   * @param {object} layout
   * @param {Theme} theme
   * @param {{title:string, includeSolution:boolean, paper:string, orientation:'portrait'|'landscape'}} opts
   * @returns {Promise<'saved'|'declined'|'print'>}
   */
  async function exportPdf(layout, theme, opts) {
    const title = (opts.title || 'Crucigrama').trim();
    const paper = PAPER_SIZES[opts.paper] ? opts.paper : 'carta';
    const orientation = opts.orientation === 'landscape' ? 'landscape' : 'portrait';
    const JsPDF = global.jspdf && global.jspdf.jsPDF;
    if (!JsPDF) { printFallback(layout, theme, title, paper, orientation); return 'print'; }

    const page = makePage(paper, orientation);
    const doc = new JsPDF({ unit: 'mm', format: [page.w, page.h], orientation });
    doc.setProperties({ title });

    // Página 1: tablero vacío + definiciones
    const titleInBoard = theme.style.showTitle && !!theme.title;
    let y = drawHeader(doc, page, titleInBoard ? null : title, theme, `${layout.words.length} palabras`);
    const boardShare = orientation === 'landscape' ? 0.62 : 0.55;
    y = drawBoard(doc, page, boardImage(layout, theme, false), y, page.h * boardShare);
    drawClues(doc, page, layout, y);

    // Página final: solución
    if (opts.includeSolution) {
      doc.addPage();
      const y2 = drawHeader(doc, page, titleInBoard ? null : title, theme, 'Solución');
      drawBoard(doc, page, boardImage(layout, theme, true), y2, page.h - y2 - page.margin);
    }

    // La entrega del archivo la decide download.js (artefacto o navegador normal)
    return global.CW.download.saveFile(doc.output('blob'), `${slug(title)}.pdf`);
  }

  global.CW = global.CW || {};
  global.CW.pdf = { exportPdf, PAPER_SIZES, paperLabel };
})(typeof window !== 'undefined' ? window : globalThis);
