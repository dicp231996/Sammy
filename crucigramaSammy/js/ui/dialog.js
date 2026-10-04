/**
 * ui/dialog.js — Componentes de INTERFAZ reutilizables:
 * diálogo de confirmación (Promise<boolean>) y avisos breves (toast).
 */
(function (global) {
  'use strict';

  const $ = sel => document.querySelector(sel);

  /**
   * Muestra un diálogo modal y resuelve true/false.
   * @param {{title:string, html?:string, text?:string, okText?:string, cancelText?:string, danger?:boolean}} o
   */
  function confirm(o) {
    const dialog = $('#confirm-dialog');
    $('#confirm-title').textContent = o.title || '¿Confirmar?';
    const body = $('#confirm-body');
    if (o.html) body.innerHTML = o.html; else body.textContent = o.text || '';
    const ok = $('#confirm-ok');
    const cancel = $('#confirm-cancel');
    ok.textContent = o.okText || 'Sí, confirmar';
    cancel.textContent = o.cancelText || 'Corregir';
    ok.classList.toggle('btn-danger', !!o.danger);

    return new Promise(resolve => {
      const done = value => {
        ok.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onCancel);
        dialog.removeEventListener('cancel', onCancel);
        dialog.close();
        resolve(value);
      };
      const onOk = () => done(true);
      const onCancel = e => { if (e) e.preventDefault(); done(false); };
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
      dialog.addEventListener('cancel', onCancel); // tecla Esc
      dialog.showModal();
      ok.focus();
    });
  }

  let toastTimer = null;
  function toast(message, type = 'info') {
    const el = $('#toast');
    el.textContent = message;
    el.className = `toast show toast-${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
  }

  /** Escapa texto para insertarlo en HTML. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  global.CW = global.CW || {};
  global.CW.ui = global.CW.ui || {};
  global.CW.ui.dialog = { confirm, toast, esc };
})(window);
