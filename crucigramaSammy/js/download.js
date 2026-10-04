/**
 * download.js — Capa de ENTREGA DE ARCHIVOS.
 * Decide cómo se entrega un archivo generado al usuario:
 *  - Dentro de un artefacto de Claude: usa la capacidad "downloads"
 *    (el visor muestra una confirmación y el usuario acepta la descarga).
 *  - Abierto como archivo local o en tu propio hosting: descarga normal
 *    del navegador mediante un enlace temporal.
 */
(function (global) {
  'use strict';

  // Capacidad "downloads" del artefacto (null si la página no corre dentro de Claude)
  let pending = null;
  function getClaudeDownloads() {
    if (!pending) {
      pending = global.claude && typeof global.claude.use === 'function'
        ? global.claude.use('downloads').catch(() => null)
        : null;
    }
    return pending || Promise.resolve(null);
  }
  // Se pide al cargar para que esté lista cuando el usuario haga clic
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', getClaudeDownloads);
  else getClaudeDownloads();

  function browserDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Entrega un Blob al usuario.
   * @returns {Promise<'saved'|'declined'>}
   */
  async function saveFile(blob, filename) {
    const downloads = await getClaudeDownloads();
    if (downloads) {
      try {
        await downloads.save({ filename, data: blob });
        return 'saved';
      } catch (err) {
        if (err && err.code === 'declined') return 'declined';
        if (err && err.code === 'rate_limited') throw new Error('Ya hay una descarga pendiente de confirmar.');
        // Cualquier otro error: se intenta la descarga normal del navegador
      }
    }
    browserDownload(blob, filename);
    return 'saved';
  }

  global.CW = global.CW || {};
  global.CW.download = { saveFile };
})(window);
