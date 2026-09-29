// js/charts.js - Generación de gráficos con Chart.js

let chartsInstancias = {};

function crearTodasLasGraficas(data) {
  // Paleta de colores basada en el estilo CSS (--azul, --azul-claro, --dorado)
  const colores = {
    azul: '#1f3a5f',
    azulClaro: '#3f6ea5',
    dorado: '#c8963e',
    crema: '#faf6ef',
    gris: '#5b6470'
  };

  // 1. Gráfica de Modalidad (Doughnut)
  const ctxModalidad = document.getElementById('chartModalidad');
  if (ctxModalidad && data.por_modalidad) {
    chartsInstancias.modalidad = new Chart(ctxModalidad, {
      type: 'doughnut',
      data: {
        labels: data.por_modalidad.map(item => item.nombre),
        datasets: [{
          data: data.por_modalidad.map(item => item.total),
          backgroundColor: [colores.azul, colores.azulClaro, colores.dorado],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // 2. Gráfica de Tipo de Programa (Pie)
  const ctxTipo = document.getElementById('chartTipoPrograma');
  if (ctxTipo && data.por_tipo_programa) {
    chartsInstancias.tipoPrograma = new Chart(ctxTipo, {
      type: 'pie',
      data: {
        labels: data.por_tipo_programa.map(item => item.nombre),
        datasets: [{
          data: data.por_tipo_programa.map(item => item.total),
          backgroundColor: [colores.azulClaro, colores.dorado],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // 3. Gráfica de Sexo (Doughnut)
  const ctxSexo = document.getElementById('chartSexo');
  if (ctxSexo && data.por_sexo) {
    chartsInstancias.sexo = new Chart(ctxSexo, {
      type: 'doughnut',
      data: {
        labels: data.por_sexo.map(item => item.nombre),
        datasets: [{
          data: data.por_sexo.map(item => item.total),
          backgroundColor: [colores.azulClaro, colores.dorado, '#a0a0a0'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // 4. Gráfica de Estrato (Barras)
  const ctxEstrato = document.getElementById('chartEstrato');
  if (ctxEstrato && data.por_estrato) {
    // Ordenar estratos
    const estratosOrdenados = [...data.por_estrato].sort((a, b) => a.nombre.localeCompare(b.nombre));
    chartsInstancias.estrato = new Chart(ctxEstrato, {
      type: 'bar',
      data: {
        labels: estratosOrdenados.map(item => `Estrato ${item.nombre}`),
        datasets: [{
          label: 'Estudiantes',
          data: estratosOrdenados.map(item => item.total),
          backgroundColor: colores.azulClaro,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // 5. Gráfica de Top Ciudades de Nacimiento (Barras Horizontales)
  const ctxCiudades = document.getElementById('chartCiudades');
  if (ctxCiudades && data.top_ciudades_nacimiento) {
    chartsInstancias.ciudades = new Chart(ctxCiudades, {
      type: 'bar',
      data: {
        labels: data.top_ciudades_nacimiento.map(item => item.nombre),
        datasets: [{
          label: 'Matriculados',
          data: data.top_ciudades_nacimiento.map(item => item.total),
          backgroundColor: colores.dorado,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }
}