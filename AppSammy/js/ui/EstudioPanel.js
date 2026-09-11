/**
 * ui/EstudioPanel.js
 *
 * Ejecuta la guía interactiva del modo "Estudio": muestra un ejercicio
 * a la vez (informativo, numérico o de opción múltiple), valida la
 * respuesta del usuario contra el valor esperado (redondeado a 1
 * decimal) y da feedback: si acierta lo confirma, si se equivoca le
 * muestra la respuesta correcta y la sustitución que la explica.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  function redondear1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

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

      const ej = this._ejercicioActual();
      const numero = this.indice + 1;
      const total = this.ejercicios.length;

      let cuerpo;
      if (ej.tipo === 'info') {
        cuerpo = this._cuerpoInfo(ej);
      } else if (ej.tipo === 'numeric') {
        cuerpo = this._cuerpoNumerico(ej);
      } else {
        cuerpo = this._cuerpoOpciones(ej);
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

    _cuerpoInfo(ej) {
      const esUltimo = this._esUltimo();
      return `
        <div class="study-card__resultado">${ej.resultado}</div>
        <div class="study-actions">
          <button class="btn-estudio" data-accion="siguiente">${esUltimo ? 'Finalizar' : 'Continuar'}</button>
        </div>`;
    }

    _cuerpoNumerico(ej) {
      const campos = ej.campos.map((campo) => `
        <label class="study-input">
          <span>${campo.label}</span>
          <input type="text" inputmode="decimal" class="study-input__field" data-campo="${campo.id}" ${this.resuelto ? 'disabled' : ''} />
        </label>`).join('');

      return `
        <div class="study-inputs">${campos}</div>
        <div class="study-feedback" id="study-feedback"></div>
        <div class="study-actions" id="study-actions">
          ${this.resuelto ? '' : '<button class="btn-estudio" data-accion="verificar">Verificar</button>'}
        </div>`;
    }

    _cuerpoOpciones(ej) {
      const opciones = ej.opciones.map((texto, i) => `
        <button class="study-option" data-opcion="${i}" ${this.resuelto ? 'disabled' : ''}>${texto}</button>`).join('');

      return `
        <div class="study-options">${opciones}</div>
        <div class="study-feedback" id="study-feedback"></div>
        <div class="study-actions" id="study-actions"></div>`;
    }

    _verificarNumerico() {
      const ej = this._ejercicioActual();
      const inputs = this.contenedor.querySelectorAll('.study-input__field');

      let todasCorrectas = true;
      const detalles = [];

      ej.campos.forEach((campo, i) => {
        const valorTexto = inputs[i].value.trim().replace(',', '.');
        const valorUsuario = Number(valorTexto);
        const esValido = valorTexto !== '' && Number.isFinite(valorUsuario);
        const correcta = esValido && redondear1(valorUsuario) === redondear1(campo.esperado);

        inputs[i].disabled = true;
        inputs[i].classList.add(correcta ? 'correcto' : 'incorrecto');
        if (!correcta) todasCorrectas = false;
        detalles.push(correcta);
      });

      this.resuelto = true;
      this._mostrarFeedback(todasCorrectas, ej.explicacion);
      this._mostrarBotonSiguiente();
    }

    _verificarOpcion(indiceElegido) {
      const ej = this._ejercicioActual();
      const botones = this.contenedor.querySelectorAll('.study-option');
      const correcta = indiceElegido === ej.correcta;

      botones.forEach((boton, i) => {
        boton.disabled = true;
        if (i === ej.correcta) boton.classList.add('correcta');
        if (i === indiceElegido && !correcta) boton.classList.add('incorrecta');
      });

      this.resuelto = true;
      this._mostrarFeedback(correcta, ej.explicacion);
      this._mostrarBotonSiguiente();
    }

    _mostrarFeedback(correcta, explicacion) {
      const feedback = this.contenedor.querySelector('#study-feedback');
      if (!feedback) return;

      if (correcta) {
        feedback.className = 'study-feedback exito';
        feedback.innerHTML = `<strong>¡Correcto!</strong> ${explicacion || ''}`;
      } else {
        feedback.className = 'study-feedback error';
        feedback.innerHTML = `<strong>No es correcto.</strong> La solución es: ${explicacion || ''}`;
      }
    }

    _mostrarBotonSiguiente() {
      const acciones = this.contenedor.querySelector('#study-actions');
      if (!acciones) return;
      const esUltimo = this._esUltimo();
      acciones.innerHTML = `<button class="btn-estudio" data-accion="siguiente">${esUltimo ? 'Finalizar' : 'Siguiente paso'}</button>`;
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
