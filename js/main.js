// js/main.js - Lógica principal del dashboard interactivo

document.addEventListener("DOMContentLoaded", function () {
  // Cargar el archivo JSON procesado con los datos de matriculados
  fetch('data/resumen.json')
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo data/resumen.json");
      }
      return response.json();
    })
    .then(data => {
      // 1. Dibujar gráficos (función definida en charts.js)
      if (typeof crearTodasLasGraficas === 'function') {
        crearTodasLasGraficas(data);
      }

      // 2. Animar los números de las tarjetas estadísticas
      animarContadores();

      // 3. Configurar la interactividad con las ventanas del edificio
      configurarEdificio(data);

      // 4. Renderizar las tarjetas de Áreas de Conocimiento
      renderizarAreas(data);

      // 5. Configurar animaciones de scroll con GSAP
      configurarGSAP();
    })
    .catch(error => console.error("Error al cargar los datos:", error));
});

// Anima los contadores numéricos (29.010 matriculados, 4 facultades, etc.)
function animarContadores() {
  const contadores = document.querySelectorAll('.stat-card__num');

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    contadores.forEach(el => {
      const valorFinal = parseInt(el.getAttribute('data-count'), 10) || 0;

      gsap.to(el, {
        innerText: valorFinal,
        duration: 2,
        ease: "power2.out",
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        onUpdate: function () {
          el.innerText = Math.floor(el.innerText).toLocaleString('es-CO');
        }
      });
    });
  } else {
    // Alternativa sin GSAP por si falla la carga de la librería
    contadores.forEach(el => {
      const valorFinal = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.innerText = valorFinal.toLocaleString('es-CO');
    });
  }
}

// Configura la interactividad de las ventanas en el edificio de la universidad
function configurarEdificio(data) {
  const ventanas = document.querySelectorAll('.ventana');
  const panelSede = document.getElementById('panelSede');

  if (!ventanas.length || !panelSede) return;

  ventanas.forEach(ventana => {
    ventana.addEventListener('click', function () {
      const nombreSede = this.getAttribute('data-sede');

      // Buscar el total de estudiantes de la sede seleccionada
      const infoSede = data.por_sede.find(s => s.nombre === nombreSede);
      const totalEstudiantes = infoSede ? infoSede.total.toLocaleString('es-CO') : 'N/A';

      // Filtrar las facultades asociadas a esta sede
      const facultadesSede = data.sedes_por_facultad.filter(
        item => item['Sede Agrupada'] === nombreSede
      );

      let htmlFacultades = '';
      if (facultadesSede.length > 0) {
        htmlFacultades = '<ul>' +
          facultadesSede.map(f => `
            <li>
              <span>${f.Facultad}</span>
              <strong>${f.total.toLocaleString('es-CO')}</strong>
            </li>
          `).join('') +
          '</ul>';
      } else {
        htmlFacultades = '<p>No se registraron datos específicos por facultad para esta sede.</p>';
      }

      // Actualizar el contenido del panel lateral en pantalla
      panelSede.innerHTML = `
        <h3>🏛️ ${nombreSede}</h3>
        <p style="margin-bottom: 12px; font-weight: 700; color: var(--dorado);">
          Total matriculados: ${totalEstudiantes} estudiantes
        </p>
        <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--azul);">Estudiantes por facultad:</h4>
        ${htmlFacultades}
      `;
    });
  });
}

// Diccionario de emoticonos para las áreas del conocimiento
const EMOJIS_AREA = {
  engranaje: '⚙️',
  grafico: '📊',
  paleta: '🎨',
  matraz: '🧪',
  libro: '📚',
  birrete: '🎓',
  balanza: '⚖️'
};

// Renderiza dinámicamente las tarjetas desplegables de Áreas de Conocimiento
function renderizarAreas(data) {
  const gridAreas = document.getElementById('gridAreas');
  if (!gridAreas || !data.por_area_conocimiento) return;

  gridAreas.innerHTML = '';

  data.por_area_conocimiento.forEach(area => {
    const emoji = EMOJIS_AREA[area.icono] || '📚';
    const programas = data.programas_por_area[area.nombre] || [];

    const card = document.createElement('div');
    card.className = 'area-card';

    let listaHTML = '';
    if (programas.length > 0) {
      listaHTML = '<ul class="area-card__lista">' +
        programas.map(p => `<li>• ${p.nombre} (<strong>${p.total.toLocaleString('es-CO')}</strong>)</li>`).join('') +
        '</ul>';
    }

    card.innerHTML = `
      <div class="area-card__icon">${emoji}</div>
      <div class="area-card__nombre">${area.nombre}</div>
      <div class="area-card__total">${area.total.toLocaleString('es-CO')} estudiantes</div>
      ${listaHTML}
    `;

    // Permitir desplegar/ocultar los programas al hacer clic en la tarjeta
    card.addEventListener('click', function () {
      this.classList.toggle('abierta');
    });

    gridAreas.appendChild(card);
  });
}

// Animaciones de revelado suave al hacer scroll con GSAP ScrollTrigger
function configurarGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const secciones = document.querySelectorAll('section');
  secciones.forEach(sec => {
    gsap.from(sec, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sec,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  });
}