/**
 * =====================================================
 * COLECTIVO PRIMARIO - JAVASCRIPT
 * Proyecto Académico | Ene-Abr 2026
 * Funcionalidades: Navegación, Validación, Filtros, KPIs
 * =====================================================
 */

// ========================================
// FUNCIONES DE MEDICIÓN PARA INVESTIGACIÓN (KPIs)
// Objetivo: Registrar conversiones para cálculo del +30%
// Fórmula: (Consultas después − Consultas antes) ÷ Consultas antes × 100
// ========================================

function trackConversion(eventName) {
  console.log(`[KPI] Conversión registrada: ${eventName} - ${new Date().toISOString()}`);
  
  // Opción A: Google Analytics 4 (descomentar si se integra)
  /*
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      'event_category': 'conversion',
      'event_label': 'landing_page_colectivo_primario',
      'value': 1
    });
  }
  */
  
  // Opción B: Registro en consola para exportar a hoja de cálculo
  // Útil para medición manual durante la investigación
}

// ========================================
// NAVEGACIÓN MOBILE
// ========================================

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle?.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  nav.classList.toggle('nav--active');
});

// Cerrar menú al hacer click en enlace (UX mobile)
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav--active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ========================================
// VALIDACIÓN Y ENVÍO DE FORMULARIO
// Método: Validación client-side + Email/WhatsApp fallback
// ========================================

const form = document.getElementById('contactForm');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let isValid = true;
  
  // Limpiar errores previos
  document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form__input').forEach(el => el.classList.remove('input--error'));
  
  // Validaciones client-side (UX: feedback inmediato)
  const campos = [
    { id: 'nombre', validator: v => v.trim().length >= 2, msg: 'El nombre es obligatorio (mín. 2 caracteres)' },
    { id: 'email', validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Ingresa un correo válido' },
    { id: 'servicio', validator: v => v !== '', msg: 'Selecciona un servicio' },
    { id: 'mensaje', validator: v => v.trim().length >= 20, msg: 'Describe tu idea (mín. 20 caracteres)' }
  ];
  
  campos.forEach(({ id, validator, msg }) => {
    const input = document.getElementById(id);
    if (!validator(input.value)) {
      showError(input, `error${id.charAt(0).toUpperCase() + id.slice(1)}`, msg);
      isValid = false;
    }
  });
  
  if (!isValid) return;
  
  // ✅ Formulario válido - Preparar envío
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  
  // Obtener datos del formulario
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const telefono = document.getElementById('telefono').value;
  const servicio = document.getElementById('servicio').value;
  const artista = document.getElementById('artista').value;
  const mensaje = document.getElementById('mensaje').value;
  const artistaOculto = document.getElementById('artista_seleccionado')?.value;
  
  // Usar artista del campo oculto si existe
  const artistaFinal = artistaOculto || artista;
  
  // Crear mensaje formateado
  const mensajeFormateado = `
🎨 *NUEVA CONSULTA - COLECTIVO PRIMARIO*

*Nombre:* ${nombre}
*Email:* ${email}
${telefono ? `*Teléfono:* ${telefono}` : ''}
*Servicio:* ${servicio}
${artistaFinal ? `*Artista:* ${artistaFinal}` : '*Artista:* Sin preferencia'}

*Mensaje:*
${mensaje}

---
📅 Fecha: ${new Date().toLocaleString('es-MX')}
  `.trim();
  
  // Opción 1: Abrir WhatsApp (RECOMENDADO - Mayor conversión)
  const whatsappNumber = '5218126082227';
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensajeFormateado)}`;
  
  // Opción 2: Abrir cliente de correo (fallback)
  const subject = encodeURIComponent(`Consulta desde web - ${nombre}`);
  const emailBody = encodeURIComponent(mensajeFormateado.replace(/\*/g, ''));
  const emailURL = `mailto:colectivoprimario@gmail.com?subject=${subject}&body=${emailBody}`;
  
  // Mostrar opciones al usuario
  setTimeout(() => {
    const opcion = confirm(
      '✅ ¡Formulario validado correctamente!\n\n' +
      '¿Cómo deseas enviar tu consulta?\n\n' +
      '• ACEPTAR → Enviar por WhatsApp (más rápido)\n' +
      '• CANCELAR → Enviar por correo electrónico'
    );
    
    if (opcion) {
      // WhatsApp
      window.open(whatsappURL, '_blank');
      trackConversion('form_whatsapp_sent');
    } else {
      // Email
      window.location.href = emailURL;
      trackConversion('form_email_sent');
    }
    
    // Resetear formulario
    form.reset();
    if (document.getElementById('artista_seleccionado')) {
      document.getElementById('artista_seleccionado').value = '';
    }
    
    // Restaurar botón
    btn.disabled = false;
    btn.innerHTML = originalText;
    
    // Mensaje de confirmación
    setTimeout(() => {
      alert('🎨 Gracias por tu interés en Colectivo Primario.\n\nTe contactaremos en menos de 24 horas.');
    }, 500);
    
  }, 800);
});

function showError(input, errorId, message) {
  input.classList.add('input--error');
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
  input.focus();
}

// ========================================
// FUNCIÓN: Seleccionar artista para pre-llenar formulario
// CRO: Reducir pasos para contacto directo con artista específico
// ========================================

function selectArtist(artistName, serviceType) {
  // Pre-seleccionar servicio en el formulario de contacto
  const servicioSelect = document.getElementById('servicio');
  if (servicioSelect) {
    servicioSelect.value = serviceType;
  }
  
  // Pre-seleccionar artista en el select
  const artistaSelect = document.getElementById('artista');
  if (artistaSelect) {
    artistaSelect.value = artistName;
  }
  
  // Llenar campo oculto con el artista seleccionado
  const artistaInput = document.getElementById('artista_seleccionado');
  if (artistaInput) artistaInput.value = artistName;
  
  // Pre-llenar mensaje con referencia al artista
  const mensajeTextarea = document.getElementById('mensaje');
  if (mensajeTextarea && !mensajeTextarea.value.trim()) {
    mensajeTextarea.value = `Hola, me interesa agendar con ${artistName}. Mi idea es: `;
  }
  
  // Scroll suave al formulario
  const contactoSection = document.getElementById('contacto');
  if (contactoSection) {
    contactoSection.scrollIntoView({ behavior: 'smooth' });
    // Enfocar el campo mensaje para facilitar edición
    setTimeout(() => mensajeTextarea?.focus(), 800);
  }
  
  // Trackear conversión específica por artista (KPI avanzado)
  trackConversion(`artist_selected_${artistName.toLowerCase().replace(' ', '_').replace('ó', 'o')}`);
}

// ========================================
// FILTROS DE PORTAFOLIO (UX: reducción de carga cognitiva)
// ========================================

const filterBtns = document.querySelectorAll('.portafolio__filters .filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Actualizar estado activo (accesibilidad)
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    
    const filter = btn.dataset.filter;
    
    // Filtrar items con animación suave
    portfolioItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'block';
        setTimeout(() => item.style.opacity = '1', 50);
      } else {
        item.style.opacity = '0';
        setTimeout(() => item.style.display = 'none', 200);
      }
    });
  });
});

// ========================================
// FILTROS DE ARTISTAS
// ========================================

const artistFilterBtns = document.querySelectorAll('.artistas__filters .filter-btn');
const artistCards = document.querySelectorAll('.artista-card');

artistFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Actualizar estado activo (accesibilidad)
    artistFilterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    
    const filter = btn.dataset.filter;
    
    // Filtrar tarjetas con animación
    artistCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'block';
        setTimeout(() => card.style.opacity = '1', 50);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 200);
      }
    });
  });
});

// ========================================
// BOTONES DE PORTAFOLIO POR ARTISTA
// Redirección a página de portafolio individual
// ========================================

document.querySelectorAll('.artista-card__portfolio').forEach(btn => {
  btn.addEventListener('click', function() {
    const artistName = this.closest('.artista-card').querySelector('.artista-card__name').textContent;
    
    // Mapeo de artistas a sus páginas de portafolio
    const portfolioPages = {
      'Deba': 'portafolio-deba.html',
      'Doek': 'portafolio-doek.html',
      'Neko': 'portafolio-neko.html',
      'David': 'portafolio-david.html'
    };
    
    // Obtener la página del artista o redirigir al portafolio general
    const targetPage = portfolioPages[artistName] || 'index.html#portafolio';
    
    // Redirigir a la página de portafolio
    window.location.href = targetPage;
    
    // Trackear la visita
    trackConversion('artist_portfolio_view');
  });
});

// ========================================
// SCROLL SUAVE PARA ANCLAS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========================================
// HEADER CON EFECTO AL SCROLL
// ========================================

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('header--scrolled');
  } else {
    header.classList.remove('header--scrolled');
  }
});

// ========================================
// INICIALIZACIÓN: Registro de visita (KPI base)
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[KPI] Landing page cargada - Colectivo Primario');
  trackConversion('page_view');
});
