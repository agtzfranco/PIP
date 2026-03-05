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
// VALIDACIÓN Y ENVÍO DE FORMULARIO (AJAX)
// ========================================

const form = document.getElementById('contactForm');

form?.addEventListener('submit', async (e) => {
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
  
  // Preparar envío
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  
  try {
    // Crear FormData con los datos del formulario
    const formData = new FormData(form);
    
    // Sincronizar artista seleccionado (del select o del campo oculto)
    const artistaSelect = document.getElementById('artista');
    const artistaOculto = document.getElementById('artista_seleccionado');
    if (artistaSelect && artistaSelect.value && !artistaOculto.value) {
      artistaOculto.value = artistaSelect.value;
    }
    
    // Agregar parámetros UTM si existen en la URL (para tracking de campañas)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('utm_source')) formData.append('utm_source', urlParams.get('utm_source'));
    if (urlParams.has('utm_medium')) formData.append('utm_medium', urlParams.get('utm_medium'));
    
    // Enviar a PHP via Fetch API (o usar Formspree para MVP sin backend)
    const response = await fetch('procesar-contacto.php', {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // ✅ Éxito: registrar KPI y mostrar confirmación
      trackConversion(result.kpi_event || 'form_submitted');
      
      // Feedback visual al usuario
      alert(result.message);
      form.reset();
      
      // Limpiar campo oculto
      if (artistaOculto) artistaOculto.value = '';
      
    } else {
      // ❌ Error de validación del servidor
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach(msg => alert('⚠️ ' + msg));
      } else {
        alert('Error: ' + (result.error || 'No se pudo procesar tu solicitud'));
      }
      trackConversion(result.kpi_event || 'form_error');
    }
    
  } catch (error) {
    // ❌ Error de red o servidor - FALLBACK A FORMSPREE O EMAIL
    console.error('[ERROR AJAX]', error);
    
    // Fallback: abrir cliente de correo como respaldo
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const servicio = document.getElementById('servicio').value;
    const mensaje = document.getElementById('mensaje').value;
    const artista = document.getElementById('artista').value;
    
    const subject = encodeURIComponent(`Consulta desde web - ${nombre}`);
    const body = encodeURIComponent(
      `Nombre: ${nombre}\n` +
      `Email: ${email}\n` +
      `Servicio: ${servicio}\n` +
      `Artista: ${artista || 'Sin preferencia'}\n\n` +
      `Mensaje:\n${mensaje}`
    );
    
    const confirmFallback = confirm(
      '⚠️ No se pudo conectar con el servidor.\n\n' +
      '¿Deseas abrir tu cliente de correo para enviar la consulta?'
    );
    
    if (confirmFallback) {
      window.location.href = `mailto:gmrqzf@gmail.com?subject=${subject}&body=${body}`;
      trackConversion('form_email_fallback');
    } else {
      alert('Puedes contactarnos directamente por WhatsApp: +52 1 81 2197 2533');
      trackConversion('form_network_error');
    }
    
  } finally {
    // Restaurar botón
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
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
// ========================================

document.querySelectorAll('.artista-card__portfolio').forEach(btn => {
  btn.addEventListener('click', function() {
    const artistName = this.closest('.artista-card').querySelector('.artista-card__name').textContent;
    alert(`🎨 Portafolio completo de ${artistName}\n\n(Esta funcionalidad se implementará en la fase 2 del proyecto)`);
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
