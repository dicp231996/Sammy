/**
 * app.js — CONTROLADOR.
 * Orquesta el flujo: Modelo ⇄ Vistas, llama al Generador, al Renderer y al
 * Exportador PDF. Es el único archivo que conoce a todas las capas.
 */
(function (global) {
  'use strict';

  const { CrosswordModel, normalizeWord } = global.CW.model;
  const { generate } = global.CW.generator;
  const { Theme } = global.CW.theme;
  const { confirm, toast, esc } = global.CW.ui.dialog;
  const { WizardView, BoardView, CustomizerView } = global.CW.ui;

  const model = new CrosswordModel();
  const theme = new Theme();
  const state = { step: 'count', clueIndex: 0, layout: null };

  // ---------- Paso 1: cantidad ----------
  async function onCount(value, title) {
    if (title !== undefined) setTitle(title);
    const n = Number.parseInt(value, 10);
    if (model.entries.length > n) {
      const ok = await confirm({
        title: 'Reducir cantidad',
        text: `Ya tienes ${model.entries.length} palabras. Se eliminarán las últimas ${model.entries.length - n}. ¿Continuar?`,
        okText: 'Sí, reducir', cancelText: 'Cancelar', danger: true,
      });
      if (!ok) return;
    }
    try {
      model.setTargetCount(n);
    } catch (err) {
      wizard.renderCount(null, err.message);
      return;
    }
    goTo('words');
  }

  // ---------- Paso 2: Pool ----------
  async function onAddWord(raw) {
    const check = model.validateWord(raw);
    if (!check.ok) { wizard.renderWords(model, check.error); return; }

    const typed = String(raw).trim();
    const changed = typed.toUpperCase() !== check.word;
    const ok = await confirm({
      title: `Palabra ${model.entries.length + 1} de ${model.targetCount}`,
      html: `<p>¿Agregar esta palabra al Pool?</p>
             <p class="big-word">${esc(check.word)}</p>
             ${changed ? `<p class="muted">Escribiste «${esc(typed)}»; se guardará sin tildes.</p>` : ''}
             <p class="muted">${check.word.length} letras</p>`,
      okText: 'Sí, agregar', cancelText: 'Corregir',
    });
    if (!ok) {
      wizard.renderWords(model);
      const input = document.querySelector('#word-input');
      input.focus(); input.select();
      return;
    }
    model.addWord(raw);
    wizard.clearWordInput();
    wizard.renderWords(model);
    if (model.isPoolComplete()) toast('¡Pool completo! Ahora las definiciones.', 'ok');
  }

  async function onRemoveWord(index) {
    const entry = model.entries[index];
    const ok = await confirm({
      title: 'Quitar palabra',
      html: `<p>¿Quitar <strong>${esc(entry.word)}</strong> del Pool?${entry.clue ? ' Su definición también se borrará.' : ''}</p>`,
      okText: 'Sí, quitar', cancelText: 'Cancelar', danger: true,
    });
    if (!ok) return;
    model.removeWord(index);
    wizard.renderWords(model);
  }

  // ---------- Paso 3: definiciones ----------
  async function onSaveClue(text) {
    const clue = String(text || '').trim();
    const entry = model.entries[state.clueIndex];
    if (!clue) { wizard.renderClues(model, state.clueIndex, 'Escribe una definición.'); return; }

    const ok = await confirm({
      title: 'Confirmar definición',
      html: `<p class="big-word">${esc(entry.word)}</p><p>«${esc(clue)}»</p>`,
      okText: 'Sí, guardar', cancelText: 'Corregir',
    });
    if (!ok) { document.querySelector('#clue-input').focus(); return; }

    model.setClue(state.clueIndex, clue);
    // Siguiente pendiente (primero hacia adelante, luego desde el inicio)
    const entries = model.entries;
    let next = entries.findIndex((e, i) => i > state.clueIndex && !e.clue);
    if (next === -1) next = model.firstMissingClue();
    if (next === -1) {
      wizard.renderClues(model, state.clueIndex);
      toast('¡Todas las definiciones listas! Ya puedes generar el crucigrama.', 'ok');
      document.querySelector('#generate-btn').focus();
      return;
    }
    state.clueIndex = next;
    wizard.renderClues(model, state.clueIndex);
  }

  function onPrevClue() {
    if (state.clueIndex > 0) state.clueIndex--;
    wizard.renderClues(model, state.clueIndex);
  }

  function onEditClue(index) {
    state.clueIndex = index;
    wizard.renderClues(model, index);
  }

  // ---------- Paso 4: tablero ----------
  function buildLayout(seed) {
    state.layout = generate(model.toMapping(), { seed });
    board.render(state.layout, theme);
  }

  function onGenerate() {
    if (model.firstMissingClue() !== -1) { toast('Faltan definiciones.', 'error'); return; }
    goTo('board');
    buildLayout();
    if (state.layout.unplaced.length) toast('Algunas palabras no pudieron cruzarse.', 'error');
  }

  function onRegenerate() {
    buildLayout(Math.floor(Math.random() * 1e9));
    toast('Nueva distribución generada');
  }

  async function onPdf() {
    if (!state.layout) return;
    board.setBusy(true);
    // Pequeña pausa para que el botón muestre "Generando…" antes del trabajo pesado
    await new Promise(r => setTimeout(r, 30));
    try {
      const result = await global.CW.pdf.exportPdf(state.layout, theme, {
        title: theme.title || 'Crucigrama',
        includeSolution: customizer.includeSolution,
        paper: customizer.paper,
        orientation: customizer.orientation,
      });
      if (result === 'saved') toast('PDF listo', 'ok');
      else if (result === 'declined') toast('Descarga cancelada');
      else toast('Usa «Guardar como PDF» en el diálogo de impresión', 'ok');
    } catch (err) {
      console.error(err);
      toast('No se pudo generar el PDF: ' + err.message, 'error');
    } finally {
      board.setBusy(false);
    }
  }

  /** Título único para toda la app (paso 1, panel, lienzo y PDF). */
  function setTitle(text) {
    const t = String(text || '').trim();
    model.title = t;
    theme.setTitle(t);
    customizer.setTitle(t);
  }

  // ---------- Navegación ----------
  function goTo(step) {
    state.step = step;
    wizard.showStep(step);
    if (step === 'count') wizard.renderCount(model.targetCount || 10);
    if (step === 'words') wizard.renderWords(model);
    if (step === 'clues') {
      const missing = model.firstMissingClue();
      state.clueIndex = missing === -1 ? 0 : missing;
      wizard.renderClues(model, state.clueIndex);
    }
  }

  // ---------- Montaje ----------
  const wizard = new WizardView({
    onCount, onAddWord, onRemoveWord, onSaveClue, onPrevClue, onEditClue, onGenerate,
    onWordsBack: () => goTo('count'),
    onWordsNext: () => goTo('clues'),
    onCluesBack: () => goTo('words'),
  });

  const board = new BoardView({
    onBack: () => goTo('clues'),
    onRegenerate,
    onToggleSolution: () => state.layout && board.draw(state.layout, theme),
    onPdf,
  });

  const customizer = new CustomizerView(theme, {
    onTitle: title => { model.title = title; theme.setTitle(title); document.querySelector('#start-title').value = title; },
  });

  // Cualquier cambio de estilo o asset redibuja la vista previa al instante
  let raf = 0;
  theme.onChange(() => {
    if (!state.layout) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      board.draw(state.layout, theme);
      board.renderHeader(theme);
    });
  });

  // Solo para depurar desde la consola
  global.CW.app = { model, theme, state, normalizeWord };

  // Precarga las fuentes por defecto y redibuja cuando estén listas
  Promise.all(theme.fontsInUse().map(f => global.CW.fonts.ensure(f))).then(() => theme.emit());

  goTo('count');
})(window);
