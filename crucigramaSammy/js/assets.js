/**
 * assets.js — Capa de RECURSOS.
 * Convierte archivos de imagen subidos por el usuario en objetos listos
 * para dibujar (dataURL + HTMLImageElement). Usar dataURL evita que el
 * canvas quede "contaminado" y así se puede exportar a PDF.
 */
(function (global) {
  'use strict';

  const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
  const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
      img.src = src;
    });
  }

  /** @returns {Promise<{name:string, dataUrl:string, img:HTMLImageElement}>} */
  async function loadImageFile(file) {
    if (!file) throw new Error('No se seleccionó ningún archivo.');
    if (!ACCEPTED.includes(file.type)) throw new Error('Formato no soportado. Usa PNG, JPG, WEBP, GIF o SVG.');
    if (file.size > MAX_BYTES) throw new Error('La imagen supera los 12 MB.');
    const dataUrl = await readAsDataUrl(file);
    const img = await loadImage(dataUrl);
    return { name: file.name, dataUrl, img };
  }

  global.CW = global.CW || {};
  global.CW.assets = { loadImageFile, ACCEPTED };
})(typeof window !== 'undefined' ? window : globalThis);
