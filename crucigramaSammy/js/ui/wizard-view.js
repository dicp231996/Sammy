/**
 * ui/wizard-view.js — VISTA de los pasos 1–3 (cantidad, Pool, definiciones).
 * Solo lee el modelo para pintar y reenvía los eventos del usuario al
 * controlador mediante callbacks. Nunca modifica el modelo directamente.
 */
(function (global) {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const { esc } = global.CW.ui.dialog;

  class WizardView {
    /** @param {Record<string, Function>} h callbacks del controlador */
    constructor(h) {
      this.h = h;
      this.bind();
    }

    bind() {
      const h = this.h;
      // Paso 1
      const range = $('#count-range'), input = $('#count-input');
      range.addEventListener('input', () => { input.value = range.value; });
      input.addEventListener('input', () => { range.value = input.value; });
      $('#count-form').addEventListener('submit', e => { e.preventDefault(); h.onCount(input.value, $('#start-title').value); });

      // Paso 2
      $('#word-form').addEventListener('submit', e => { e.preventDefault(); h.onAddWord($('#word-input').value); });
      $('#pool-list').addEventListener('click', e => {
        const btn = e.target.closest('[data-remove]');
        if (btn) h.onRemoveWord(Number(btn.dataset.remove));
      });
      $('#words-back').addEventListener('click', () => h.onWordsBack());
      $('#words-next').addEventListener('click', () => h.onWordsNext());

      // Paso 3
      $('#clue-form').addEventListener('submit', e => { e.preventDefault(); h.onSaveClue($('#clue-input').value); });
      $('#clue-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); h.onSaveClue(e.target.value); }
      });
      $('#clue-prev').addEventListener('click', () => h.onPrevClue());
      $('#mapping-body').addEventListener('click', e => {
        const btn = e.target.closest('[data-edit]');
        if (btn) h.onEditClue(Number(btn.dataset.edit));
      });
      $('#clues-back').addEventListener('click', () => h.onCluesBack());
      $('#generate-btn').addEventListener('click', () => h.onGenerate());
    }

    showStep(name) {
      document.querySelectorAll('.step').forEach(s => { s.hidden = s.id !== `step-${name}`; });
      const order = ['count', 'words', 'clues', 'board'];
      const current = order.indexOf(name);
      document.querySelectorAll('#stepper li').forEach(li => {
        const i = order.indexOf(li.dataset.step);
        li.classList.toggle('active', i === current);
        li.classList.toggle('done', i < current);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderCount(value, error = '') {
      if (value) { $('#count-input').value = value; $('#count-range').value = value; }
      $('#count-error').textContent = error;
      $('#count-input').focus();
    }

    renderWords(model, error = '') {
      const n = model.entries.length, total = model.targetCount;
      $('#words-progress').textContent = `${n} / ${total}`;
      $('#words-bar').style.width = `${(n / total) * 100}%`;
      $('#word-error').textContent = error;
      $('#pool-list').innerHTML = model.entries
        .map((e, i) => `<li class="chip"><span class="chip-num">${i + 1}</span>${esc(e.word)}
          <button class="chip-x" data-remove="${i}" aria-label="Quitar ${esc(e.word)}">×</button></li>`)
        .join('');
      const complete = model.isPoolComplete();
      $('#word-input').disabled = complete;
      $('#word-add').disabled = complete;
      $('#word-input').placeholder = complete ? '¡Pool completo!' : `Palabra ${n + 1} de ${total}…`;
      $('#words-next').disabled = !complete;
      if (!complete) $('#word-input').focus(); else $('#words-next').focus();
    }

    clearWordInput() { $('#word-input').value = ''; }

    renderClues(model, index, error = '') {
      const total = model.entries.length;
      const done = model.entries.filter(e => e.clue).length;
      $('#clues-progress').textContent = `${done} / ${total}`;
      $('#clues-bar').style.width = `${(done / total) * 100}%`;
      $('#clue-error').textContent = error;

      const entry = model.entries[index];
      $('#clue-index').textContent = `Palabra ${index + 1} de ${total}`;
      $('#clue-word').textContent = entry.word;
      $('#clue-length').textContent = `${entry.word.length} letras`;
      $('#clue-input').value = entry.clue;
      $('#clue-prev').disabled = index === 0;
      $('#clue-input').focus();

      $('#mapping-body').innerHTML = model.entries
        .map((e, i) => `<tr class="${i === index ? 'current' : ''}">
          <td>${i + 1}</td><td class="mono">${esc(e.word)}</td>
          <td>${e.clue ? esc(e.clue) : '<em class="muted">pendiente</em>'}</td>
          <td><button class="btn btn-small btn-ghost" data-edit="${i}">Editar</button></td></tr>`)
        .join('');
      $('#generate-btn').disabled = done < total;
    }
  }

  global.CW.ui.WizardView = WizardView;
})(window);
