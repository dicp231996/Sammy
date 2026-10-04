/**
 * ui/board-view.js — VISTA del paso 4: vista previa del crucigrama,
 * estadísticas de la cuadrícula, listas de definiciones y barra de acciones.
 */
(function (global) {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const { esc } = global.CW.ui.dialog;

  class BoardView {
    constructor(h) {
      this.h = h;
      this.canvas = $('#board-canvas');
      $('#board-back').addEventListener('click', () => h.onBack());
      $('#regen-btn').addEventListener('click', () => h.onRegenerate());
      $('#solution-toggle').addEventListener('change', e => h.onToggleSolution(e.target.checked));
      $('#pdf-btn').addEventListener('click', () => h.onPdf());
    }

    get showSolution() { return $('#solution-toggle').checked; }

    /** Redibuja solo el canvas (rápido: se llama en cada cambio de estilo). */
    draw(layout, theme) {
      global.CW.renderer.render(this.canvas, layout, theme, { showSolution: this.showSolution });
    }

    render(layout, theme) {
      this.draw(layout, theme);
      this.renderHeader(theme);

      const s = layout.stats;
      $('#board-stats').textContent =
        `Cuadrícula inicial ${s.initialGrid} → final ${s.finalGrid} · ` +
        `creció ${s.growthEvents} ${s.growthEvents === 1 ? 'vez' : 'veces'} · ` +
        `${s.crossings} cruces · ${layout.words.length} palabras colocadas`;

      const item = w => `<li value="${w.number}"><span class="muted">(${w.length})</span> ${esc(w.clue)}</li>`;
      $('#across-list').innerHTML = layout.across.map(item).join('') || '<li class="muted">—</li>';
      $('#down-list').innerHTML = layout.down.map(item).join('') || '<li class="muted">—</li>';

      const warn = $('#unplaced-warning');
      if (layout.unplaced.length) {
        warn.hidden = false;
        warn.innerHTML = `⚠️ No se pudieron cruzar: <strong>${layout.unplaced.map(u => esc(u.word)).join(', ')}</strong>. ` +
          'No comparten letras compatibles con el resto. Prueba «Regenerar» o cambia esas palabras.';
      } else {
        warn.hidden = true;
      }
    }

    renderHeader(theme) {
      const logo = $('#logo-preview');
      if (theme.assets.logo) { logo.src = theme.assets.logo.dataUrl; logo.hidden = false; }
      else { logo.hidden = true; logo.removeAttribute('src'); }
    }

    setBusy(busy) {
      $('#pdf-btn').disabled = busy;
      $('#pdf-btn').textContent = busy ? 'Generando…' : '📄 Guardar PDF';
    }
  }

  global.CW.ui.BoardView = BoardView;
})(window);
