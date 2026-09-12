/**
 * ui/EstudioPanel.js
 *
 * Ejecuta la guía interactiva del modo "Estudio": muestra un ejercicio
 * a la vez (informativo, numérico o de opción múltiple), valida la
 * respuesta contra el valor esperado y da feedback inmediato. La
 * mecánica de pregunta/validación vive en ui/PreguntaWidget.js, que
 * también usa ui/PruebaPanel.js.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  class EstudioPanel {
    constructor(contenedor) {
      this.contenedor = contenedor;
      this.ejercicios = [];
      this.indice = 0;
      this.resuelto = false;

      this.contenedor.addEventListener('click', (e) => this._onClick(e));
    }

    limpiar() {
      this.ejercicios = [];
      this.contenedor.innerHTML = `<div class="result-placeholder">Presiona Calcular y luego cambia a la pestaña Estudio para practicar.</div>`;
    }

    /** Reinicia la guía con una nueva lista de ejercicios (nueva función). */
    iniciar(ejercicios) {
      this.ejercicios = ejercicios;
      this.indice = 0;
      this.resuelto = false;
      this._render();
    }

    _onClick(e) {
      const accion = e.target.dataset ? e.target.dataset.accion : null;
      const opcion = e.target.dataset ? e.target.dataset.opcion : null;

      if (accion === 'verificar') {
        this._verificarNumerico();
      } else if (accion === 'siguiente') {
        this._avanzar();
      } else if (accion === 'reiniciar') {
        this.indice = 0;
        this.resuelto = false;
        this._render();
      } else if (opcion !== null && opcion !== undefined && !this.resuelto) {
        this._verificarOpcion(Number(opcion));
      }
    }

    _avanzar() {
      this.indice += 1;
      this.resuelto = false;
      this._render();
    }

    _ejercicioActual() {
      return this.ejercicios[this.indice];
    }

    _esUltimo() {
      return this.indice >= this.ejercicios.length - 1;
    }

    _render() {
      if (!this.ejercicios.length) {
        this.limpiar();
        return;
      }
      if (this.indice >= this.ejercicios.length) {
        this._renderFinal();
        return;
      }

      const W = ns.PreguntaWidget;
      const ej = this._ejercicioActual();
      const numero = this.indice + 1;
      const total = this.ejercicios.length;

      let cuerpo;
      if (ej.tipo === 'info') {
        cuerpo = W.cuerpoInfo(ej, this._esUltimo() ? 'Finalizar' : 'Continuar');
      } else if (ej.tipo === 'numeric') {
        cuerpo = W.cuerpoNumerico(ej, this.resuelto);
      } else {
        cuerpo = W.cuerpoOpciones(ej, this.resuelto);
      }

      this.contenedor.innerHTML = `
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
      W.mostrarFeedback(this.contenedor, correcta, ej.explicacion);
      W.mostrarBotonSiguiente(this.contenedor, this._esUltimo() ? 'Finalizar' : 'Siguiente paso');
    }

    _renderFinal() {
      this.contenedor.innerHTML = `
        <div class="study-final">
          <div class="study-final__icono">✓</div>
          <h3>¡Completaste el estudio de esta función!</h3>
          <p>Repasaste la concavidad, el discriminante, las raíces, las intersecciones con los ejes, el vértice y el efecto de dilatación/contracción.</p>
          <button class="btn-estudio" data-accion="reiniciar">Repetir el estudio</button>
        </div>`;
    }
  }

  ns.EstudioPanel = EstudioPanel;
})(window.QuadApp.ui);
