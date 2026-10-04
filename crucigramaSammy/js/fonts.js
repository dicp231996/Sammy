/**
 * fonts.js — Capa de TIPOGRAFÍAS.
 * Catálogo de fuentes (del sistema + Google Fonts), carga bajo demanda para
 * que el <canvas> las use, y registro de fuentes propias subidas por el
 * usuario (.ttf, .otf, .woff, .woff2) mediante la API FontFace.
 */
(function (global) {
  'use strict';

  /** [etiqueta, valor CSS, grupo] */
  const CATALOG = [
    ['Arial', 'Arial, Helvetica, sans-serif', 'Sistema'],
    ['Verdana', 'Verdana, Geneva, sans-serif', 'Sistema'],
    ['Trebuchet', "'Trebuchet MS', 'Segoe UI', sans-serif", 'Sistema'],
    ['Georgia', "Georgia, 'Times New Roman', serif", 'Sistema'],
    ['Times', "'Times New Roman', Times, serif", 'Sistema'],
    ['Courier', "'Courier New', monospace", 'Sistema'],
    ['Impact', 'Impact, Haettenschweiler, sans-serif', 'Sistema'],
    ['Roboto', "'Roboto', sans-serif", 'Google Fonts'],
    ['Montserrat', "'Montserrat', sans-serif", 'Google Fonts'],
    ['Poppins', "'Poppins', sans-serif", 'Google Fonts'],
    ['Nunito', "'Nunito', sans-serif", 'Google Fonts'],
    ['Playfair Display', "'Playfair Display', serif", 'Google Fonts'],
    ['Merriweather', "'Merriweather', serif", 'Google Fonts'],
    ['Bebas Neue', "'Bebas Neue', sans-serif", 'Google Fonts'],
    ['Lobster', "'Lobster', cursive", 'Google Fonts'],
    ['Pacifico', "'Pacifico', cursive", 'Google Fonts'],
    ['Caveat', "'Caveat', cursive", 'Google Fonts'],
    ['Permanent Marker', "'Permanent Marker', cursive", 'Google Fonts'],
    ['Special Elite', "'Special Elite', monospace", 'Google Fonts'],
    ['Press Start 2P', "'Press Start 2P', monospace", 'Google Fonts'],
  ];

  const custom = []; // fuentes subidas: [etiqueta, valor, 'Mis fuentes']
  const listeners = new Set();

  function all() { return [...custom, ...CATALOG]; }
  function onChange(fn) { listeners.add(fn); }

  /** Primer nombre de familia de un valor CSS: "'Lobster', cursive" → Lobster */
  function primaryFamily(cssValue) {
    return String(cssValue).split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  }

  /** Asegura que la fuente esté descargada antes de dibujar en el canvas. */
  async function ensure(cssValue, weight = '700') {
    if (!document.fonts || !document.fonts.load) return;
    const fam = primaryFamily(cssValue);
    try {
      await Promise.all([
        document.fonts.load(`${weight} 32px "${fam}"`, 'AÑÉ1'),
        document.fonts.load(`400 32px "${fam}"`, 'AÑÉ1'),
      ]);
    } catch (_) { /* sin internet: el navegador usa la fuente de respaldo */ }
  }

  /** Registra una fuente propia desde un archivo. Devuelve su valor CSS. */
  async function registerFile(file) {
    if (!file) throw new Error('No se seleccionó ningún archivo.');
    if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) throw new Error('Usa un archivo .ttf, .otf, .woff o .woff2.');
    if (file.size > 8 * 1024 * 1024) throw new Error('La fuente supera los 8 MB.');
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w\s-]/g, '').trim() || 'MiFuente';
    const family = `Custom ${base} ${custom.length + 1}`;
    const face = new FontFace(family, await file.arrayBuffer());
    try { await face.load(); } catch (_) { throw new Error('El archivo no es una fuente válida.'); }
    document.fonts.add(face);
    const value = `'${family}', sans-serif`;
    custom.unshift([`${base} (propia)`, value, 'Mis fuentes']);
    listeners.forEach(fn => fn());
    return value;
  }

  /** HTML de <option>s agrupadas, con vista previa de la fuente. */
  function optionsHtml() {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const groups = {};
    for (const [label, value, group] of all()) (groups[group] = groups[group] || []).push([label, value]);
    return Object.entries(groups).map(([g, items]) =>
      `<optgroup label="${esc(g)}">${items.map(([l, v]) =>
        `<option value="${esc(v)}" style="font-family:${esc(v)}">${esc(l)}</option>`).join('')}</optgroup>`
    ).join('');
  }

  global.CW = global.CW || {};
  global.CW.fonts = { CATALOG, all, ensure, registerFile, optionsHtml, onChange, primaryFamily };
})(window);
