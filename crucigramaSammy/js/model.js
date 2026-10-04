/**
 * model.js — Capa de DATOS.
 * Guarda la cantidad objetivo de palabras, el Pool y el mapeo palabra → definición.
 * No sabe nada del DOM ni del algoritmo.
 */
(function (global) {
  'use strict';

  const MIN_WORDS = 5;
  const MAX_WORDS = 50;
  const MIN_LEN = 2;
  const MAX_LEN = 30;

  /** Pasa a mayúsculas, quita tildes y diéresis pero conserva la Ñ. */
  function normalizeWord(raw) {
    return String(raw || '')
      .trim()
      .toUpperCase()
      .replace(/Ñ/g, '\u0001')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0001/g, 'Ñ');
  }

  class CrosswordModel {
    constructor() {
      this.reset();
    }

    reset() {
      this.targetCount = 0;
      /** @type {{word:string, original:string, clue:string}[]} */
      this.entries = [];
      this.title = 'Mi crucigrama';
    }

    setTargetCount(value) {
      const n = Number.parseInt(value, 10);
      if (!Number.isInteger(n) || n < MIN_WORDS || n > MAX_WORDS) {
        throw new Error(`Elige un número entre ${MIN_WORDS} y ${MAX_WORDS}.`);
      }
      this.targetCount = n;
      if (this.entries.length > n) this.entries.length = n;
    }

    /** Valida sin modificar el Pool. Devuelve { ok, word, error }. */
    validateWord(raw) {
      const word = normalizeWord(raw);
      if (!word) return { ok: false, error: 'Escribe una palabra.' };
      if (/\s/.test(word)) return { ok: false, error: 'Solo una palabra, sin espacios.' };
      if (!/^[A-ZÑ]+$/.test(word)) return { ok: false, error: 'Usa solo letras (sin números ni símbolos).' };
      if (word.length < MIN_LEN) return { ok: false, error: `Mínimo ${MIN_LEN} letras.` };
      if (word.length > MAX_LEN) return { ok: false, error: `Máximo ${MAX_LEN} letras.` };
      if (this.entries.some(e => e.word === word)) return { ok: false, error: `«${word}» ya está en el Pool.` };
      if (this.isPoolComplete()) return { ok: false, error: 'El Pool ya está completo.' };
      return { ok: true, word };
    }

    addWord(raw) {
      const res = this.validateWord(raw);
      if (!res.ok) throw new Error(res.error);
      this.entries.push({ word: res.word, original: String(raw).trim(), clue: '' });
      return res.word;
    }

    removeWord(index) {
      this.entries.splice(index, 1);
    }

    isPoolComplete() {
      return this.targetCount > 0 && this.entries.length >= this.targetCount;
    }

    setClue(index, text) {
      if (this.entries[index]) this.entries[index].clue = String(text || '').trim();
    }

    firstMissingClue() {
      return this.entries.findIndex(e => !e.clue);
    }

    /** Mapeo final palabra → definición, que consume el generador. */
    toMapping() {
      return this.entries.map(e => ({ word: e.word, clue: e.clue }));
    }
  }

  global.CW = global.CW || {};
  global.CW.model = { CrosswordModel, normalizeWord, MIN_WORDS, MAX_WORDS };
  if (typeof module !== 'undefined') module.exports = global.CW.model;
})(typeof window !== 'undefined' ? window : globalThis);
