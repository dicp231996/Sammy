/**
 * ui/PruebaPanel.js
 *
 * Examen cronometrado: 30 preguntas elegidas al azar de un banco de
 * 200+ (QuadApp.data.GeneradorPool), con el mismo formato guiado que
 * el modo Estudio (fórmula, sustitución y feedback inmediato, vía
 * ui/PreguntaWidget.js). Al terminar, entrega una calificación en
 * escala chilena (1.0 a 7.0) con exigencia del 60%.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  const TOTAL_PREGUNTAS = 30;
  const TAMANO_BANCO = 200;
  const DURACION_SEGUNDOS = 90 * 60;
  const EXIGENCIA = 0.6;

  class PruebaPanel {
    constructor(contenedor) {
      this.contenedor = contenedor;
      this.preguntas = [];
      this.indice = 0;
      this.resuelto = false;
      this.aciertos = 0;
      this.segundosRestantes = DURACION_SEGUNDOS;
      this.timerId = null;

      this.contenedor.addEventListener('click', (e) => this._onClick(e));
      this._renderInicio();
    }

    _onClick(e) {
      const accion = e.target.dataset ? e.target.dataset.accion : null;
      const opcion = e.target.dataset ? e.target.dataset.opcion : null;

      if (accion === 'comenzar') {
        this._comenzar();
      } else if (accion === 'verificar') {
        this._verificarNumerico();
      } else if (accion === 'siguiente') {
        this._avanzar();
      } else if (accion === 'reiniciar') {
        this._renderInicio();
      } else if (opcion !== null && opcion !== undefined && !this.resuelto) {
        this._verificarOpcion(Number(opcion));
      }
    }

    _renderInicio() {
      this._detenerTimer();
      this.contenedor.innerHTML = `
        <div class="prueba-inicio">
          <h3>Prueba de funciones cuadráticas</h3>
          <ul class="prueba-inicio__lista">
            <li>${TOTAL_PREGUNTAS} preguntas elegidas al azar de un banco de más de ${TAMANO_BANCO}.</li>
            <li>90 minutos en total, con cronómetro visible en pantalla.</li>
            <li>Mismo formato guiado que en Estudio: fórmula, sustitución y feedback en cada pregunta.</li>
            <li>Exigencia del 60% para la nota mínima de aprobación (4.0), escala 1.0 a 7.0.</li>
          </ul>
          <button class="btn-estudio" data-accion="comenzar">Comenzar prueba</button>
        </div>`;
    }

    _comenzar() {
      const pool = window.QuadApp.data.GeneradorPool.generarPool(TAMANO_BANCO);
      this.preguntas = window.QuadApp.data.GeneradorPool.elegirPreguntas(pool, TOTAL_PREGUNTAS);
      this.indice = 0;
      this.resuelto = false;
      this.aciertos = 0;
      this.segundosRestantes = DURACION_SEGUNDOS;

      this._iniciarTimer();
      this._renderPregunta();
    }

    _iniciarTimer() {
      this._detenerTimer();
      this.timerId = setInterval(() => {
        this.segundosRestantes -= 1;
        this._actualizarTimerUI();
        if (this.segundosRestantes <= 0) {
          this._finalizar(true);
        }
      }, 1000);
    }

    _detenerTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    _formatoTiempo(segundosTotales) {
      const s = Math.max(0, segundosTotales);
      const m = Math.floor(s / 60);
      const ss = s % 60;
      return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }

    _actualizarTimerUI() {
      const el = this.contenedor.querySelector('#prueba-timer');
      if (el) {
        el.textContent = this._formatoTiempo(this.segundosRestantes);
        el.classList.toggle('prueba-header__timer--urgente', this.segundosRestantes <= 5 * 60);
      }
    }

    _ejercicioActual() {
      return this.preguntas[this.indice];
    }

    _esUltimo() {
      return this.indice >= this.preguntas.length - 1;
    }

    _renderPregunta() {
      const W = ns.PreguntaWidget;
      const ej = this._ejercicioActual();
      const numero = this.indice + 1;
      const total = this.preguntas.length;

      const cuerpo = ej.tipo === 'numeric'
        ? W.cuerpoNumerico(ej, this.resuelto)
        : W.cuerpoOpciones(ej, this.resuelto);

      this.contenedor.innerHTML = `
        <div class="prueba-header">
          <span class="prueba-header__progreso">Pregunta ${numero} de ${total}</span>
          <span class="prueba-header__timer" id="prueba-timer">${this._formatoTiempo(this.segundosRestantes)}</span>
        </div>
        <div class="study-card">
          <div class="study-card__header">
            <span class="study-card__numero">${numero}/${total}</span>
            <span class="study-card__titulo">${ej.titulo}</span>
          </div>
          <p class="study-card__guia">${ej.guia || ''}</p>
          <div class="study-card__formula">${ej.formula}</div>
          ${cuerpo}
        </div>`;
    }

    _verificarNumerico() {
      const W = ns.PreguntaWidget;
      const ej = this._ejercicioActual();
      const correcta = W.verificarNumerico(this.contenedor, ej);
      this._registrarRespuesta(correcta, ej);
    }

    _verificarOpcion(indiceElegido) {
      const W = ns.PreguntaWidget;
      const ej = this._ejercicioActual();
      const correcta = W.verificarOpcion(this.contenedor, ej, indiceElegido);
      this._registrarRespuesta(correcta, ej);
    }

    _registrarRespuesta(correcta, ej) {
      const W = ns.PreguntaWidget;
      this.resuelto = true;
      if (correcta) this.aciertos += 1;
      W.mostrarFeedback(this.contenedor, correcta, ej.explicacion);
      W.mostrarBotonSiguiente(this.contenedor, this._esUltimo() ? 'Finalizar prueba' : 'Siguiente pregunta');
    }

    _avanzar() {
      if (this._esUltimo()) {
        this._finalizar(false);
        return;
      }
      this.indice += 1;
      this.resuelto = false;
      this._renderPregunta();
    }

    _calcularNota(porcentaje) {
      let nota;
      if (porcentaje >= EXIGENCIA) {
        nota = 4 + ((porcentaje - EXIGENCIA) / (1 - EXIGENCIA)) * 3;
      } else {
        nota = 1 + (porcentaje / EXIGENCIA) * 3;
      }
      return Math.min(7, Math.max(1, nota));
    }

    _finalizar(porTiempo) {
      this._detenerTimer();

      // Si el tiempo se acabó a mitad de una pregunta sin responder,
      // esa pregunta cuenta como incorrecta (no suma a aciertos).
      const total = this.preguntas.length;
      const respondidas = porTiempo ? this.indice + (this.resuelto ? 1 : 0) : total;
      const porcentaje = total ? this.aciertos / total : 0;
      const nota = this._calcularNota(porcentaje);
      const aprobado = nota >= 4.0;

      this.contenedor.innerHTML = `
        <div class="prueba-final">
          ${porTiempo ? '<p class="prueba-final__aviso">Se acabó el tiempo: la prueba se entregó automáticamente.</p>' : ''}
          <div class="prueba-final__nota ${aprobado ? 'aprobado' : 'reprobado'}">${nota.toFixed(1)}</div>
          <p class="prueba-final__detalle">${this.aciertos} de ${total} correctas (${Math.round(porcentaje * 100)}%)${porTiempo ? ` · alcanzaste a responder ${respondidas} de ${total}` : ''}</p>
          <p class="prueba-final__estado ${aprobado ? 'aprobado' : 'reprobado'}">${aprobado ? 'Aprobado' : 'Reprobado'} · exigencia 60% para el 4.0</p>
          <button class="btn-estudio" data-accion="reiniciar">Rendir otra prueba</button>
        </div>`;
    }
  }

  ns.PruebaPanel = PruebaPanel;
})(window.QuadApp.ui);
