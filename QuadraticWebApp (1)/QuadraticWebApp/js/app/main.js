/**
 * app/main.js
 *
 * Punto de entrada de la aplicación web. Instancia los paneles,
 * los conecta entre sí y arranca la app cuando el DOM está listo.
 * Equivalente a Main.java + MainFrame.java del proyecto de escritorio.
 */
window.QuadApp = window.QuadApp || {};
window.QuadApp.app = window.QuadApp.app || {};

(function (app, model, data, ui) {
  function iniciar() {
    const inputPanel = new ui.InputPanel({
      campoA: document.getElementById('input-a'),
      campoB: document.getElementById('input-b'),
      campoC: document.getElementById('input-c'),
      boton: document.getElementById('btn-calcular'),
      etiquetaError: document.getElementById('input-error'),
    });

    const graphPanel = new ui.GraphPanel(document.getElementById('grafica'));
    const resultPanel = new ui.ResultPanel(document.getElementById('resultados-contenido'));
    const stepsPanel = new ui.StepsPanel(document.getElementById('pasos-contenido'));

    inputPanel.setListener((a, b, c) => {
      try {
        const funcion = new model.QuadraticFunction(a, b, c);
        const resultado = data.CalculadoraCuadratica.calcular(funcion);
        const pasos = data.GeneradorPasos.generar(funcion, resultado);

        resultPanel.mostrarResultado(funcion, resultado);
        graphPanel.setFuncion(funcion, resultado);
        stepsPanel.mostrarPasos(pasos);
      } catch (err) {
        resultPanel.mostrarError(err.message);
        graphPanel.limpiar();
        stepsPanel.limpiar();
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
