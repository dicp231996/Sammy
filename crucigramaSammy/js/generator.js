/**
 * generator.js — Capa de LÓGICA ("backend").
 * Algoritmo puro de colocación: recibe [{word, clue}] y devuelve un layout.
 * No toca el DOM, así que se puede probar con Node.
 *
 * Idea general:
 *  1. La palabra más larga es la nº 1 y se coloca horizontal en (0,0),
 *     esquina superior izquierda de una cuadrícula inicial de L×L.
 *  2. Cada palabra nueva busca TODAS las letras ya colocadas que coinciden
 *     con alguna de sus letras y prueba a cruzarlas en perpendicular.
 *  3. Cada candidato se valida recorriendo su ruta celda por celda
 *     (coincidencia de letras, vecinos, extremos libres).
 *  4. Los candidatos válidos se puntúan: más cruces, dirección alternada
 *     (H, V, H, V…), menor crecimiento de la cuadrícula y mejor equilibrio
 *     (forma cuadrada y centro de masa centrado).
 *  5. Si la palabra no cabe, la cuadrícula crece hacia donde haga falta.
 *  6. Se repite varias veces con desempates aleatorios y se queda el mejor.
 */
(function (global) {
  'use strict';

  const H = 'H';
  const V = 'V';
  const MAX_GRID = 70; // límite de seguridad para el tamaño de la cuadrícula

  /** PRNG determinista (mulberry32) para que una "semilla" reproduzca el mismo crucigrama. */
  function createRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const key = (r, c) => r + ',' + c;
  const step = dir => (dir === H ? [0, 1] : [1, 0]);

  /** Cuadrícula dinámica y dispersa: crece en cualquier dirección. */
  class Grid {
    constructor(initialSize) {
      this.cells = new Map(); // "r,c" → { letter, H: idx|null, V: idx|null }
      this.byLetter = new Map(); // letra → Set de claves
      // La cuadrícula conceptual empieza en L×L desde (0,0)
      this.minR = 0; this.minC = 0;
      this.maxR = initialSize - 1; this.maxC = initialSize - 1;
      this.initialSize = initialSize;
      this.growthEvents = 0;
      this.sumR = 0; this.sumC = 0; this.count = 0; // para el centro de masa
    }

    get(r, c) { return this.cells.get(key(r, c)); }
    isEmpty(r, c) { return !this.cells.has(key(r, c)); }

    /** Límites ocupados solo por letras (lo que se verá). */
    letterBounds() {
      let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
      for (const k of this.cells.keys()) {
        const [r, c] = k.split(',').map(Number);
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (c < minC) minC = c; if (c > maxC) maxC = c;
      }
      return { minR, minC, maxR, maxC };
    }

    place(word, r0, c0, dir, idx) {
      const [dr, dc] = step(dir);
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i, k = key(r, c);
        let cell = this.cells.get(k);
        if (!cell) {
          cell = { letter: word[i], H: null, V: null };
          this.cells.set(k, cell);
          if (!this.byLetter.has(word[i])) this.byLetter.set(word[i], new Set());
          this.byLetter.get(word[i]).add(k);
          this.sumR += r; this.sumC += c; this.count++;
        }
        cell[dir] = idx;
      }
      // ¿Hubo que agrandar la cuadrícula?
      const rEnd = r0 + dr * (word.length - 1), cEnd = c0 + dc * (word.length - 1);
      const grew = r0 < this.minR || c0 < this.minC || rEnd > this.maxR || cEnd > this.maxC;
      if (grew) this.growthEvents++;
      this.minR = Math.min(this.minR, r0); this.minC = Math.min(this.minC, c0);
      this.maxR = Math.max(this.maxR, rEnd); this.maxC = Math.max(this.maxC, cEnd);
    }

    /**
     * Comprueba la ruta de una palabra. Devuelve null si no es válida,
     * o { intersections, newCells:[[r,c],…] } si lo es.
     */
    check(word, r0, c0, dir) {
      const [dr, dc] = step(dir);
      const len = word.length;
      // Los extremos deben quedar libres (no "pegar" palabras en línea)
      if (!this.isEmpty(r0 - dr, c0 - dc)) return null;
      if (!this.isEmpty(r0 + dr * len, c0 + dc * len)) return null;

      let intersections = 0;
      const newCells = [];
      for (let i = 0; i < len; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        const cell = this.get(r, c);
        if (cell) {
          // Cruce: misma letra y la celda no puede usarse ya en esta dirección
          if (cell.letter !== word[i] || cell[dir] !== null) return null;
          intersections++;
        } else {
          // Celda nueva: sus vecinos perpendiculares deben estar vacíos
          if (dir === H) {
            if (!this.isEmpty(r - 1, c) || !this.isEmpty(r + 1, c)) return null;
          } else {
            if (!this.isEmpty(r, c - 1) || !this.isEmpty(r, c + 1)) return null;
          }
          newCells.push([r, c]);
        }
      }
      if (intersections === 0 || newCells.length === 0) return null;
      return { intersections, newCells };
    }
  }

  /** Todas las posiciones válidas para `word`, cruzando letras ya colocadas. */
  function findCandidates(grid, word) {
    const seen = new Set();
    const out = [];
    for (let i = 0; i < word.length; i++) {
      const keys = grid.byLetter.get(word[i]);
      if (!keys) continue;
      for (const k of keys) {
        const [r, c] = k.split(',').map(Number);
        const cell = grid.cells.get(k);
        for (const dir of [H, V]) {
          if (cell[dir] !== null) continue; // esa letra ya está usada en esa dirección
          const r0 = dir === H ? r : r - i;
          const c0 = dir === H ? c - i : c;
          const id = r0 + ',' + c0 + dir;
          if (seen.has(id)) continue;
          seen.add(id);
          const res = grid.check(word, r0, c0, dir);
          if (res) out.push({ r0, c0, dir, ...res });
        }
      }
    }
    return out;
  }

  /** Mide qué tan equilibrado queda el tablero si se añaden `newCells`. */
  function evaluateShape(grid, newCells, extra) {
    let { minR, minC, maxR, maxC } = extra.bounds;
    let sumR = grid.sumR, sumC = grid.sumC, n = grid.count;
    for (const [r, c] of newCells) {
      if (r < minR) minR = r; if (r > maxR) maxR = r;
      if (c < minC) minC = c; if (c > maxC) maxC = c;
      sumR += r; sumC += c; n++;
    }
    const h = maxR - minR + 1, w = maxC - minC + 1;
    const cmR = sumR / n, cmC = sumC / n;
    const offR = (cmR - (minR + maxR) / 2) / h;
    const offC = (cmC - (minC + maxC) / 2) / w;
    return {
      w, h,
      imbalance: Math.sqrt(offR * offR + offC * offC), // 0 = centro de masa perfecto
      bounds: { minR, minC, maxR, maxC },
    };
  }

  function scoreCandidate(grid, cand, preferredDir, bounds, rng) {
    const before = { w: bounds.maxC - bounds.minC + 1, h: bounds.maxR - bounds.minR + 1 };
    const shape = evaluateShape(grid, cand.newCells, { bounds });
    const growth = (shape.w + shape.h) - (before.w + before.h);
    const ratio = Math.max(shape.w, shape.h) / Math.min(shape.w, shape.h);
    return (
      cand.intersections * 12 +
      (cand.dir === preferredDir ? 8 : 0) -
      growth * 1.5 -
      (ratio - 1) * 10 -
      shape.imbalance * 25 +
      rng() * 2 // pequeña variación entre intentos
    );
  }

  /** Un intento completo de construcción. */
  function buildOnce(entries, rng) {
    // Orden: más larga primero; empates se desordenan con la semilla
    const order = entries
      .map((e, i) => ({ ...e, originalIndex: i, tie: rng() }))
      .sort((a, b) => b.word.length - a.word.length || a.tie - b.tie);

    const first = order[0];
    const grid = new Grid(first.word.length);
    const placed = [];
    grid.place(first.word, 0, 0, H, 0);
    placed.push({ ...first, row: 0, col: 0, dir: H });

    let queue = order.slice(1);
    let progress = true;
    while (queue.length && progress) {
      progress = false;
      const rest = [];
      for (const entry of queue) {
        // Alterna: palabra 1 H, palabra 2 V, palabra 3 H…
        const preferredDir = placed.length % 2 === 0 ? H : V;
        const candidates = findCandidates(grid, entry.word);
        if (!candidates.length) { rest.push(entry); continue; }

        const bounds = grid.letterBounds();
        let best = null, bestScore = -Infinity;
        for (const cand of candidates) {
          const shape = evaluateShape(grid, cand.newCells, { bounds });
          if (shape.w > MAX_GRID || shape.h > MAX_GRID) continue;
          const s = scoreCandidate(grid, cand, preferredDir, bounds, rng);
          if (s > bestScore) { bestScore = s; best = cand; }
        }
        if (!best) { rest.push(entry); continue; }

        grid.place(entry.word, best.r0, best.c0, best.dir, placed.length);
        placed.push({ ...entry, row: best.r0, col: best.c0, dir: best.dir });
        progress = true;
      }
      queue = rest;
    }
    return { grid, placed, unplaced: queue };
  }

  function layoutScore(result) {
    const b = result.grid.letterBounds();
    const w = b.maxC - b.minC + 1, h = b.maxR - b.minR + 1;
    const shape = evaluateShape(result.grid, [], { bounds: b });
    let crossings = 0;
    for (const cell of result.grid.cells.values()) if (cell.H !== null && cell.V !== null) crossings++;
    return (
      result.placed.length * 1000 +
      crossings * 4 -
      Math.abs(w - h) * 6 -
      w * h * 0.25 -
      shape.imbalance * 60
    );
  }

  /** Convierte la cuadrícula interna en un layout listo para dibujar. */
  function toLayout(result, seed) {
    const { grid, placed, unplaced } = result;
    const b = grid.letterBounds();
    const width = b.maxC - b.minC + 1;
    const height = b.maxR - b.minR + 1;

    const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => null));
    for (const [k, cell] of grid.cells) {
      const [r, c] = k.split(',').map(Number);
      cells[r - b.minR][c - b.minC] = { letter: cell.letter, numbers: [] };
    }

    // Numeración por orden de colocación: la más larga es la nº 1
    const words = placed.map((p, i) => ({
      number: i + 1,
      word: p.word,
      clue: p.clue,
      dir: p.dir,
      row: p.row - b.minR,
      col: p.col - b.minC,
      length: p.word.length,
    }));
    for (const w of words) cells[w.row][w.col].numbers.push(w.number);

    return {
      seed,
      width,
      height,
      cells,
      words,
      across: words.filter(w => w.dir === H),
      down: words.filter(w => w.dir === V),
      unplaced: unplaced.map(u => ({ word: u.word, clue: u.clue })),
      stats: {
        initialGrid: `${grid.initialSize}×${grid.initialSize}`,
        finalGrid: `${width}×${height}`,
        growthEvents: grid.growthEvents,
        crossings: [...grid.cells.values()].filter(c => c.H !== null && c.V !== null).length,
      },
    };
  }

  /**
   * API pública.
   * @param {{word:string, clue:string}[]} entries
   * @param {{seed?:number, attempts?:number}} options
   */
  function generate(entries, options = {}) {
    if (!entries || entries.length < 2) throw new Error('Se necesitan al menos 2 palabras.');
    const seed = options.seed ?? Math.floor(Math.random() * 1e9);
    const attempts = options.attempts ?? 60;

    let best = null, bestScore = -Infinity;
    for (let a = 0; a < attempts; a++) {
      const result = buildOnce(entries, createRng(seed + a * 7919));
      const s = layoutScore(result);
      if (s > bestScore) { bestScore = s; best = result; }
      if (best.unplaced.length === 0 && a >= attempts / 2) break;
    }
    return toLayout(best, seed);
  }

  global.CW = global.CW || {};
  global.CW.generator = { generate, H, V };
  if (typeof module !== 'undefined') module.exports = global.CW.generator;
})(typeof window !== 'undefined' ? window : globalThis);
