/**
 * app/main.js
 *
 * Punto de entrada de la aplicación web. Instancia los paneles,
 * los conecta entre sí, maneja el cambio de pestaña (Calculadora,
 * Estudio, Prueba, Conceptos) y arranca la app cuando el DOM está
 * listo. Equivalente a Main.java + MainFrame.java del proyecto de
 * escritorio.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.app = window.QuadApp.app || {};

(function (app, model, data, ui) {
  const MODOS = ['calculadora', 'estudio', 'prueba', 'conceptos'];

  function iniciar() {
    const inputPanel = new ui.InputPanel({
      campoA: document.getElementById('input-a'),
      campoB: document.getElementById('input-b'),
      campoC: document.getElementById('input-c'),
      negA: document.getElementById('input-a-neg'),
      negB: document.getElementById('input-b-neg'),
      negC: document.getElementById('input-c-neg'),
      boton: document.getElementById('btn-calcular'),
      etiquetaError: document.getElementById('input-error'),
    });

    const graphPanel = new ui.GraphPanel(document.getElementById('grafica'));
    const resultPanel = new ui.ResultPanel(document.getElementById('resultados-contenido'));
    const stepsPanel = new ui.StepsPanel(document.getElementById('pasos-contenido'));
    const estudioPanel = new ui.EstudioPanel(document.getElementById('estudio-contenido'));
    // eslint-disable-next-line no-unused-vars
    const pruebaPanel = new ui.PruebaPanel(document.getElementById('prueba-contenido'));
    // eslint-disable-next-line no-unused-vars
    const conceptosPanel = new ui.ConceptosPanel(document.getElementById('conceptos-contenido'));

    const workspace = document.getElementById('workspace');
    const tabs = {};
    MODOS.forEach((modo) => {
      tabs[modo] = document.getElementById(`tab-${modo}`);
    });

    function cambiarModo(modo) {
      MODOS.forEach((m) => {
        if (m !== 'calculadora') {
          workspace.classList.toggle(`modo-${m}`, m === modo);
        }
        tabs[m].classList.toggle('active', m === modo);
      });
    }

    MODOS.forEach((modo) => {
      tabs[modo].addEventListener('click', () => cambiarModo(modo));
    });

    inputPanel.setListener((a, b, c) => {
      try {
        const funcion = new model.QuadraticFunction(a, b, c);
        const resultado = data.CalculadoraCuadratica.calcular(funcion);
        const pasos = data.GeneradorPasos.generar(funcion, resultado);
        const ejercicios = data.GeneradorEjercicios.generar(funcion, resultado);

        resultPanel.mostrarResultado(funcion, resultado);
        graphPanel.setFuncion(funcion, resultado);
        stepsPanel.mostrarPasos(pasos);
        estudioPanel.iniciar(ejercicios);
      } catch (err) {
        resultPanel.mostrarError(err.message);
        graphPanel.limpiar();
        stepsPanel.limpiar();
        estudioPanel.limpiar();
      }
    });

    // Calcula el ejemplo inicial (a=2, b=0, c=-4) al cargar la página.
    document.getElementById('btn-calcular').click();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window.QuadApp.app, window.QuadApp.model, window.QuadApp.data, window.QuadApp.ui);
