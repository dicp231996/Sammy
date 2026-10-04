/**
 * ui/customizer-view.js — VISTA del panel de personalización.
 * Conecta los controles del formulario con el Theme (formato de casillas,
 * fondo, texto, presets) y gestiona la subida de assets.
 */
(function (global) {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const { toast, esc } = global.CW.ui.dialog;
  const { PRESETS } = global.CW.theme;
  const fonts = global.CW.fonts;
  const FONT_PROPS = ['fontFamily', 'numberFontFamily', 'titleFontFamily'];

  class CustomizerView {
    /**
     * @param {Theme} theme
     * @param {{onTitle:Function}} h
     */
    constructor(theme, h) {
      this.theme = theme;
      this.h = h;
      this.root = $('#customizer');
      this.buildStaticOptions();
      this.bindControls();
      this.bindAssets();
      this.bindFontUpload();
      this.sync();
    }

    buildStaticOptions() {
      this.buildFontOptions();
      const { PAPER_SIZES, paperLabel } = global.CW.pdf;
      $('#pdf-paper').innerHTML = Object.keys(PAPER_SIZES)
        .map(k => `<option value="${k}"${k === 'carta' ? ' selected' : ''}>${esc(paperLabel(k))}</option>`)
        .join('');
      $('#preset-row').innerHTML = Object.keys(PRESETS)
        .map(name => `<button type="button" class="btn btn-small" data-preset="${esc(name)}">${esc(name)}</button>`)
        .join('');
    }

    /** Llena todos los selectores de fuente, conservando lo elegido. */
    buildFontOptions() {
      const html = fonts.optionsHtml();
      this.root.querySelectorAll('.font-select').forEach(sel => {
        sel.innerHTML = html;
        const v = this.theme.style[sel.dataset.prop];
        if (v) sel.value = v;
        sel.style.fontFamily = sel.value;
      });
    }

    bindControls() {
      this.root.querySelectorAll('[data-prop]').forEach(el => {
        const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evt, async () => {
          const prop = el.dataset.prop;
          const value = el.type === 'checkbox' ? el.checked : el.value;
          if (FONT_PROPS.includes(prop)) {
            el.style.fontFamily = value;
            await fonts.ensure(value); // descarga la fuente antes de dibujar
          }
          this.theme.set(prop, value);
        });
      });
      $('#preset-row').addEventListener('click', e => {
        const btn = e.target.closest('[data-preset]');
        if (!btn) return;
        this.theme.applyPreset(btn.dataset.preset);
        this.sync();
        // Las fuentes del preset pueden no estar descargadas aún
        Promise.all(this.theme.fontsInUse().map(f => fonts.ensure(f))).then(() => this.theme.emit());
        toast(`Estilo «${btn.dataset.preset}» aplicado`);
      });
      $('#title-input').addEventListener('input', e => this.h.onTitle(e.target.value));
    }

    bindAssets() {
      this.root.querySelectorAll('.asset').forEach(row => {
        const slot = row.dataset.slot;
        const input = row.querySelector('input[type=file]');
        input.addEventListener('change', async () => {
          const file = input.files[0];
          input.value = ''; // permite volver a subir el mismo archivo
          if (!file) return;
          try {
            const asset = await global.CW.assets.loadImageFile(file);
            this.theme.setAsset(slot, asset);
            this.syncAssets();
            toast(`Imagen «${file.name}» cargada`, 'ok');
          } catch (err) {
            toast(err.message, 'error');
          }
        });
        row.querySelector('.asset-remove').addEventListener('click', () => {
          this.theme.setAsset(slot, null);
          this.syncAssets();
        });
      });
    }

    bindFontUpload() {
      const input = $('#font-file');
      input.addEventListener('change', async () => {
        const file = input.files[0];
        input.value = '';
        if (!file) return;
        try {
          const value = await fonts.registerFile(file);
          this.buildFontOptions();
          this.theme.set('fontFamily', value); // se aplica a las letras; queda disponible en todas las listas
          this.sync();
          toast(`Fuente «${file.name}» añadida`, 'ok');
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    }

    setTitle(text) { $('#title-input').value = text; }

    /** Refleja el estado del Theme en los controles. */
    sync() {
      const s = this.theme.style;
      this.root.querySelectorAll('[data-prop]').forEach(el => {
        const v = s[el.dataset.prop];
        if (el.type === 'checkbox') el.checked = !!v; else el.value = String(v);
        if (el.classList.contains('font-select')) el.style.fontFamily = el.value;
      });
      this.syncAssets();
    }

    syncAssets() {
      this.root.querySelectorAll('.asset').forEach(row => {
        const asset = this.theme.assets[row.dataset.slot];
        const thumb = row.querySelector('.asset-thumb');
        row.querySelector('.asset-remove').hidden = !asset;
        thumb.hidden = !asset;
        if (asset) { thumb.src = asset.dataUrl; thumb.title = asset.name; } else thumb.removeAttribute('src');
      });
    }

    get title() { return $('#title-input').value.trim() || 'Crucigrama'; }
    get includeSolution() { return $('#pdf-solution').checked; }
    get paper() { return $('#pdf-paper').value; }
    get orientation() { return $('#pdf-orientation').value; }
  }

  global.CW.ui.CustomizerView = CustomizerView;
})(window);
