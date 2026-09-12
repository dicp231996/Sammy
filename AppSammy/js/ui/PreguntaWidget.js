/**
 * ui/PreguntaWidget.js
 *
 * Lógica compartida para mostrar y validar una pregunta (numérica o de
 * opción múltiple) dentro de un contenedor dado. La usan tanto
 * ui/EstudioPanel.js como ui/PruebaPanel.js para no duplicar la parte
 * más delicada: la validación numérica con magnitud + checkbox de
 * signo, y el resaltado de correcto/incorrecto.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.ui = window.QuadApp.ui || {};

(function (ns) {
  function redondear1(n) {
    return Math.round(Number(n) * 10) / 10;
  }

  /** Extrae la magnitud (valor absoluto) de un texto, ignorando cualquier signo tecleado. */
  function parsearMagnitud(texto) {
    const limpio = texto.trim().replace(',', '.').replace(/^-/, '');
    if (limpio === '') return null;
    const valor = Number(limpio);
    return Number.isFinite(valor) ? Math.abs(valor) : null;
  }

  function cuerpoInfo(ej, textoBoton) {
    return `
      <div class="study-card__resultado">${ej.resultado}</div>
      <div class="study-actions">
        <button class="btn-estudio" data-accion="siguiente">${textoBoton}</button>
      </div>`;
  }

  function cuerpoNumerico(ej, resuelto) {
    const campos = ej.campos.map((campo) => `
      <div class="study-input-row">
        <label class="study-input">
          <span>${campo.label}</span>
          <input type="text" inputmode="decimal" class="study-input__field" data-campo="${campo.id}" ${resuelto ? 'disabled' : ''} />
        </label>
        <label class="signo-toggle" title="Marcar si es negativo">
          <input type="checkbox" class="study-input__neg" data-campo-neg="${campo.id}" ${resuelto ? 'disabled' : ''} />
          <span class="signo-toggle__box">−</span>
        </label>
      </div>`).join('');

    return `
      <div class="study-inputs">${campos}</div>
      <div class="study-feedback" id="pregunta-feedback"></div>
      <div class="study-actions" id="pregunta-actions">
        ${resuelto ? '' : '<button class="btn-estudio" data-accion="verificar">Verificar</button>'}
      </div>`;
  }

  function cuerpoOpciones(ej, resuelto) {
    const opciones = ej.opciones.map((texto, i) => `
      <button class="study-option" data-opcion="${i}" ${resuelto ? 'disabled' : ''}>${texto}</button>`).join('');

    return `
      <div class="study-options">${opciones}</div>
      <div class="study-feedback" id="pregunta-feedback"></div>
      <div class="study-actions" id="pregunta-actions"></div>`;
  }

  /** Lee y valida los campos numéricos dentro de `raiz`. Devuelve true si todos son correctos. */
  function verificarNumerico(raiz, ej) {
    let todasCorrectas = true;

    ej.campos.forEach((campo) => {
      const input = raiz.querySelector(`[data-campo="${campo.id}"]`);
      const checkboxNeg = raiz.querySelector(`[data-campo-neg="${campo.id}"]`);

      const magnitud = parsearMagnitud(input.value);
      const esValido = magnitud !== null;
      const valorUsuario = esValido ? (checkboxNeg.checked ? -magnitud : magnitud) : null;
      const correcta = esValido && redondear1(valorUsuario) === redondear1(campo.esperado);

      input.disabled = true;
      checkboxNeg.disabled = true;
      input.classList.add(correcta ? 'correcto' : 'incorrecto');
      if (!correcta) todasCorrectas = false;
    });

    return todasCorrectas;
  }

  /** Marca la opción elegida dentro de `raiz`. Devuelve true si era la correcta. */
  function verificarOpcion(raiz, ej, indiceElegido) {
    const botones = raiz.querySelectorAll('.study-option');
    const correcta = indiceElegido === ej.correcta;

    botones.forEach((boton, i) => {
      boton.disabled = true;
      if (i === ej.correcta) boton.classList.add('correcta');
      if (i === indiceElegido && !correcta) boton.classList.add('incorrecta');
    });

    return correcta;
  }

  function mostrarFeedback(raiz, correcta, explicacion) {
    const feedback = raiz.querySelector('#pregunta-feedback');
    if (!feedback) return;

    if (correcta) {
      feedback.className = 'study-feedback exito';
      feedback.innerHTML = `<strong>¡Correcto!</strong> ${explicacion || ''}`;
    } else {
      feedback.className = 'study-feedback error';
      feedback.innerHTML = `<strong>No es correcto.</strong> La solución es: ${explicacion || ''}`;
    }
  }

  function mostrarBotonSiguiente(raiz, textoBoton) {
    const acciones = raiz.querySelector('#pregunta-actions');
    if (!acciones) return;
    acciones.innerHTML = `<button class="btn-estudio" data-accion="siguiente">${textoBoton}</button>`;
  }

  ns.PreguntaWidget = {
    parsearMagnitud,
    redondear1,
    cuerpoInfo,
    cuerpoNumerico,
    cuerpoOpciones,
    verificarNumerico,
    verificarOpcion,
    mostrarFeedback,
    mostrarBotonSiguiente,
  };
})(window.QuadApp.ui);
