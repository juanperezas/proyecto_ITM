// js/main.js - Lógica principal del dashboard interactivo con Modal y Campus

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

      // 3. Configurar la interactividad del campus y modal de sedes
      configurarEdificio(data);

      // 4. Renderizar las tarjetas de Áreas de Conocimiento
      renderizarAreas(data);

      // 5. Configurar animaciones de scroll con GSAP
      configurarGSAP();
    })
    .catch(error => console.error("Error al cargar los datos:", error));
});

// Anima los contadores numéricos (29.010 matriculados, facultades, etc.)
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

// Diccionario de figuras e íconos por facultad/carrera
const ICONOS_FACULTAD = {
  'Artes y Humanidades': '🎨',
  'Ciencias Económicas y Administrativas': '📊',
  'Ciencias Exactas y Aplicadas': '🧪',
  'Ingenierías': '⚙️',
  'Derecho y Ciencias Políticas': '⚖️',
  'Educación': '📚',
  'General': '🎓'
};

// Configura la interactividad de las sedes (Hotspots) y la interfaz modal
function configurarEdificio(data) {
  const hotspots = document.querySelectorAll('.campus-hotspot');
  const modalOverlay = document.getElementById('modalSede');
  const modalContenido = document.getElementById('modalSedeContenido');
  const btnCerrar = document.getElementById('cerrarModal');

  if (!hotspots.length || !modalOverlay || !modalContenido) return;

  // Abrir interfaz modal con tarjetas detalladas al hacer clic en un punto del campus
  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function () {
      const nombreSede = this.getAttribute('data-sede');

      // Buscar total de estudiantes de la sede
      const infoSede = data.por_sede ? data.por_sede.find(s => s.nombre === nombreSede) : null;
      const totalEstudiantes = infoSede ? infoSede.total.toLocaleString('es-CO') : 'N/A';

      // Filtrar las facultades asociadas a esta sede
      const facultadesSede = data.sedes_por_facultad ? data.sedes_por_facultad.filter(
        item => item['Sede Agrupada'] === nombreSede
      ) : [];

      // Generar tarjetas con figuras por facultad
      let tarjetasHTML = '';
      if (facultadesSede.length > 0) {
        tarjetasHTML = '<div class="facultades-grid">' +
          facultadesSede.map(f => {
            const icono = ICONOS_FACULTAD[f.Facultad] || '🏛️';
            return `
              <div class="facultad-card">
                <div class="facultad-icon">${icono}</div>
                <div class="facultad-nombre">${f.Facultad}</div>
                <div class="facultad-total">${f.total.toLocaleString('es-CO')} estudiantes</div>
              </div>
            `;
          }).join('') +
          '</div>';
      } else {
        tarjetasHTML = '<p style="text-align:center; padding: 20px; color: var(--gris);">No se registraron facultades específicas para esta sede.</p>';
      }

      // Inyectar HTML en la ventana modal
      modalContenido.innerHTML = `
        <div class="modal-header">
          <h3>🏛️ Sede ${nombreSede}</h3>
          <span class="modal-badge">Total matriculados: ${totalEstudiantes} estudiantes</span>
        </div>
        <h4 style="color: var(--azul); margin-top: 15px; text-align: center;">Facultades y Programas Destacados</h4>
        ${tarjetasHTML}
      `;

      // Mostrar el modal
      modalOverlay.classList.add('activo');
    });
  });

  // Cerrar el modal al hacer clic en el botón X
  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => modalOverlay.classList.remove('activo'));
  }

  // Cerrar el modal al hacer clic fuera del recuadro (overlay)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('activo');
    }
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
    const programas = data.programas_por_area ? data.programas_por_area[area.nombre] || [] : [];

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
