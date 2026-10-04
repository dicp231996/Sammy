/**
 * theme.js — Capa de ESTILO.
 * Estado de personalización (formato de casillas, fondo, assets) con
 * valores por defecto, presets y notificación de cambios.
 * No dibuja nada: solo describe CÓMO debe verse el crucigrama.
 */
(function (global) {
  'use strict';

  const DEFAULTS = Object.freeze({
    cellSize: 44,         // px por casilla en la vista previa
    gap: 2,               // separación entre casillas
    radius: 4,            // esquinas redondeadas
    borderWidth: 2,
    borderColor: '#1f2937',
    cellColor: '#ffffff',
    cellOpacity: 1,       // 0–1
    cellImageOpacity: 1,  // opacidad de la textura de casilla (si hay)
    letterColor: '#111827',
    numberColor: '#b91c1c',
    fontFamily: 'Arial, Helvetica, sans-serif',        // letras
    numberFontFamily: 'Arial, Helvetica, sans-serif',  // números de las casillas
    fontWeight: '700',
    // Título dibujado dentro del crucigrama
    showTitle: true,
    titleFontFamily: "'Montserrat', sans-serif",
    titleSize: 34,
    titleColor: '#111827',
    // Flechas que indican dónde empieza cada palabra
    showArrows: true,
    arrowStyle: 'outside', // outside = en la casilla vacía previa | inside = dentro de la 1.ª casilla
    arrowColor: '#b91c1c',
    shadow: true,
    bgColor: '#f1f5f9',
    bgFit: 'cover',       // cover | contain | stretch | tile
    bgOpacity: 1,
    padding: 36,
  });

  const PRESETS = {
    'Clásico': {},
    'Moderno': {
      radius: 10, gap: 4, borderWidth: 0, cellColor: '#ffffff', letterColor: '#0f172a',
      numberColor: '#6366f1', bgColor: '#e0e7ff', shadow: true,
      fontFamily: "'Poppins', sans-serif", numberFontFamily: "'Poppins', sans-serif",
      titleFontFamily: "'Poppins', sans-serif", titleColor: '#312e81', arrowColor: '#6366f1',
    },
    'Pizarra': {
      radius: 2, gap: 3, borderWidth: 2, borderColor: '#e2e8f0', cellColor: '#1e293b',
      cellOpacity: 0.85, letterColor: '#f8fafc', numberColor: '#facc15', bgColor: '#0f172a',
      shadow: false, fontFamily: "'Special Elite', monospace", numberFontFamily: "'Courier New', monospace",
      titleFontFamily: "'Caveat', cursive", titleSize: 44, titleColor: '#f8fafc', arrowColor: '#facc15',
    },
    'Pastel': {
      radius: 14, gap: 5, borderWidth: 2, borderColor: '#f9a8d4', cellColor: '#fff7ed',
      letterColor: '#9d174d', numberColor: '#0e7490', bgColor: '#fdf2f8', shadow: false,
      fontFamily: "'Nunito', sans-serif", numberFontFamily: "'Nunito', sans-serif",
      titleFontFamily: "'Pacifico', cursive", titleColor: '#9d174d', arrowColor: '#0e7490',
    },
    'Periódico': {
      radius: 0, gap: 0, borderWidth: 1, borderColor: '#000000', cellColor: '#ffffff',
      letterColor: '#000000', numberColor: '#000000', bgColor: '#ffffff', shadow: false,
      fontFamily: "'Times New Roman', Times, serif", numberFontFamily: "'Times New Roman', Times, serif",
      fontWeight: '400', titleFontFamily: "'Playfair Display', serif", titleColor: '#000000',
      arrowColor: '#000000', arrowStyle: 'inside',
    },
  };


  class Theme {
    constructor() {
      this.style = { ...DEFAULTS };
      /** Assets subidos por el usuario: { background, cell, logo } → {dataUrl, img, name} */
      this.assets = { background: null, cell: null, logo: null };
      this.title = 'Mi crucigrama';
      this.listeners = new Set();
    }

    setTitle(text) {
      this.title = String(text || '').trim();
      this.emit();
    }

    /** Todas las fuentes en uso (para precargarlas antes de dibujar). */
    fontsInUse() {
      const s = this.style;
      return [...new Set([s.fontFamily, s.numberFontFamily, s.titleFontFamily])];
    }

    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    emit() { this.listeners.forEach(fn => fn(this)); }

    set(prop, value) {
      if (!(prop in DEFAULTS)) return;
      const def = DEFAULTS[prop];
      this.style[prop] = typeof def === 'number' ? Number(value) : typeof def === 'boolean' ? Boolean(value) : value;
      this.emit();
    }

    applyPreset(name) {
      this.style = { ...DEFAULTS, ...(PRESETS[name] || {}) };
      this.emit();
    }

    setAsset(slot, asset) {
      if (!(slot in this.assets)) return;
      this.assets[slot] = asset;
      this.emit();
    }
  }

  global.CW = global.CW || {};
  global.CW.theme = { Theme, DEFAULTS, PRESETS };
})(typeof window !== 'undefined' ? window : globalThis);
