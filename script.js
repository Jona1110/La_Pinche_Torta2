// ===== SISTEMA DE CUPONES =====

// Configuración del sistema
const COUPON_CONFIG = {
  clicksRequired: 10,
  discountAmount: "1 Torta Gratis",
  expirationDays: 7,
  cooldownSeconds: 30,
  maxCouponsPerDay: 4,
  storageKey: 'tortasCouponSystem'
};

// Estado del sistema
let couponSystem = {
  clicks: 0,
  lastClickTime: 0,
  couponsGenerated: [],
  dailyCoupons: 0,
  lastCouponDate: null
};

// Inicializar sistema de cupones
function initCouponSystem() {
  loadCouponData();
  updateProgressBar();
  attachWhatsAppListeners();
  checkDailyReset();
}

// Cargar datos del localStorage
function loadCouponData() {
  const saved = localStorage.getItem(COUPON_CONFIG.storageKey);
  if (saved) {
    try {
      const data = JSON.parse(atob(saved)); // Decodificar base64
      couponSystem = { ...couponSystem, ...data };
    } catch (e) {
      console.log('Error loading coupon data, resetting...');
      resetCouponData();
    }
  }
}

// Guardar datos en localStorage
function saveCouponData() {
  const encoded = btoa(JSON.stringify(couponSystem)); // Codificar en base64
  localStorage.setItem(COUPON_CONFIG.storageKey, encoded);
}

// Resetear datos del sistema
function resetCouponData() {
  couponSystem = {
    clicks: 0,
    lastClickTime: 0,
    couponsGenerated: [],
    dailyCoupons: 0,
    lastCouponDate: null
  };
  saveCouponData();
  updateProgressBar();
}

// Verificar reset diario
function checkDailyReset() {
  const today = new Date().toDateString();
  if (couponSystem.lastCouponDate !== today) {
    couponSystem.dailyCoupons = 0;
    couponSystem.lastCouponDate = today;
    saveCouponData();
  }
}

// Adjuntar listeners a todos los enlaces de WhatsApp
function attachWhatsAppListeners() {
  const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
  
  whatsappLinks.forEach(link => {
    link.addEventListener('click', handleWhatsAppClick);
  });
}

// Manejar clic en WhatsApp
function handleWhatsAppClick(event) {
  event.preventDefault(); // Prevenir redirección inmediata
  
  const currentTime = Date.now();
  const timeSinceLastClick = (currentTime - couponSystem.lastClickTime) / 1000;
  
  // Verificar cooldown
  if (timeSinceLastClick < COUPON_CONFIG.cooldownSeconds) {
    showCooldownMessage();
    return;
  }
  
  // Verificar límite diario
  if (couponSystem.dailyCoupons >= COUPON_CONFIG.maxCouponsPerDay) {
    redirectToWhatsApp(event.target.href);
    return;
  }
  
  // Incrementar contador
  couponSystem.clicks++;
  couponSystem.lastClickTime = currentTime;
  
  // Verificar si debe generar cupón
  if (couponSystem.clicks >= COUPON_CONFIG.clicksRequired) {
    generateCoupon(event.target.href);
  } else {
    updateProgressBar();
    saveCouponData();
    redirectToWhatsApp(event.target.href);
  }
}

// Mostrar mensaje de cooldown
function showCooldownMessage() {
  const remainingTime = COUPON_CONFIG.cooldownSeconds - Math.floor((Date.now() - couponSystem.lastClickTime) / 1000);
  
  // Crear toast notification
  const toast = document.createElement('div');
  toast.className = 'cooldown-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">⏰</span>
      <span class="toast-text">Espera ${remainingTime} segundos antes del siguiente clic</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Generar cupón
function generateCoupon(whatsappUrl) {
  const coupon = createCouponCode();
  
  // Resetear contador
  couponSystem.clicks = 0;
  couponSystem.dailyCoupons++;
  couponSystem.couponsGenerated.push(coupon);
  
  // Guardar datos
  saveCouponData();
  updateProgressBar();
  
  // Mostrar modal del cupón
  showCouponModal(coupon, whatsappUrl);
}

// Crear código de cupón único
function createCouponCode() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  const checksum = calculateChecksum(dateStr + timeStr + random);
  
  const code = `TORTA-${dateStr}-${timeStr}-${random}-${checksum}`;
  
  const expirationDate = new Date(now.getTime() + (COUPON_CONFIG.expirationDays * 24 * 60 * 60 * 1000));
  
  return {
    code: code,
    generatedDate: now,
    expirationDate: expirationDate,
    used: false,
    discount: COUPON_CONFIG.discountAmount
  };
}

// Calcular checksum para validación
function calculateChecksum(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return (sum % 100).toString().padStart(2, '0');
}

// Mostrar modal del cupón
function showCouponModal(coupon, whatsappUrl) {
  const modal = document.getElementById('couponModal');
  const codeElement = document.getElementById('couponCode');
  const generatedDateElement = document.getElementById('generatedDate');
  const expirationDateElement = document.getElementById('expirationDate');
  
  // Actualizar contenido del cupón
  codeElement.textContent = coupon.code;
  generatedDateElement.textContent = formatDate(coupon.generatedDate);
  expirationDateElement.textContent = formatDate(coupon.expirationDate, false);
  
  // Mostrar modal con animación
  modal.classList.add('show');
  
  // Reproducir sonido de celebración (opcional)
  playCelebrationSound();
  
  // Configurar botones
  setupCouponModalButtons(whatsappUrl);
  
  // Auto-cerrar después de 30 segundos
  setTimeout(() => {
    if (modal.classList.contains('show')) {
      closeCouponModal();
      redirectToWhatsApp(whatsappUrl);
    }
  }, 30000);
}

// Configurar botones del modal
function setupCouponModalButtons(whatsappUrl) {
  const takeScreenshotBtn = document.getElementById('takeScreenshotBtn');
  const goToWhatsAppBtn = document.getElementById('goToWhatsAppBtn');
  
  takeScreenshotBtn.onclick = () => {
    showScreenshotInstructions();
  };
  
  goToWhatsAppBtn.onclick = () => {
    closeCouponModal();
    redirectToWhatsApp(whatsappUrl);
  };
}

// Mostrar instrucciones para captura
function showScreenshotInstructions() {
  const instructions = document.createElement('div');
  instructions.className = 'screenshot-instructions';
  instructions.innerHTML = `
    <div class="instructions-content">
      <h3>📱 Instrucciones para Captura</h3>
      <div class="device-instructions">
        <div class="device-type">
          <h4>📱 En móvil:</h4>
          <p>• iPhone: Botón lateral + Botón de volumen</p>
          <p>• Android: Botón de encendido + Botón de volumen</p>
        </div>
        <div class="device-type">
          <h4>💻 En computadora:</h4>
          <p>• Windows: Tecla Windows + Shift + S</p>
          <p>• Mac: Cmd + Shift + 4</p>
        </div>
      </div>
      <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
        Entendido
      </button>
    </div>
  `;
  
  document.body.appendChild(instructions);
  
  setTimeout(() => {
    if (instructions.parentElement) {
      instructions.remove();
    }
  }, 10000);
}

// Cerrar modal del cupón
function closeCouponModal() {
  const modal = document.getElementById('couponModal');
  modal.classList.remove('show');
}

// Redireccionar a WhatsApp
function redirectToWhatsApp(url) {
  window.open(url, '_blank');
}

// Actualizar barra de progreso
function updateProgressBar() {
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  
  if (progressText && progressFill) {
    const percentage = (couponSystem.clicks / COUPON_CONFIG.clicksRequired) * 100;
    
    progressText.textContent = `Clics para cupón: ${couponSystem.clicks}/${COUPON_CONFIG.clicksRequired}`;
    progressFill.style.width = `${percentage}%`;
    
    // Animación especial cuando está cerca
    if (couponSystem.clicks >= COUPON_CONFIG.clicksRequired - 1) {
      progressFill.style.animation = 'pulse 1s infinite';
    } else {
      progressFill.style.animation = 'none';
    }
  }
}

// Formatear fecha
function formatDate(date, includeTime = true) {
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Date(date).toLocaleDateString('es-ES', options);
}

// Reproducir sonido de celebración
function playCelebrationSound() {
  // Crear contexto de audio para sonido sintético
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    // Silenciosamente fallar si no hay soporte de audio
  }
}

// Función para administradores - resetear sistema
function adminResetCoupons() {
  if (confirm('¿Estás seguro de que quieres resetear el sistema de cupones?')) {
    resetCouponData();
    alert('Sistema de cupones reseteado');
  }
}

// Función para administradores - ver estadísticas
function adminShowStats() {
  const stats = {
    totalClicks: couponSystem.clicks,
    totalCoupons: couponSystem.couponsGenerated.length,
    dailyCoupons: couponSystem.dailyCoupons,
    lastClick: new Date(couponSystem.lastClickTime).toLocaleString()
  };
  
  console.log('Estadísticas del Sistema de Cupones:', stats);
  alert(`Estadísticas:
Clics actuales: ${stats.totalClicks}
Cupones generados: ${stats.totalCoupons}
Cupones hoy: ${stats.dailyCoupons}
Último clic: ${stats.lastClick}`);
}

// CSS adicional para elementos dinámicos
const additionalCSS = `
.cooldown-toast {
  position: fixed;
  top: 100px;
  right: 20px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  z-index: 9999;
  animation: slideInRight 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.screenshot-instructions {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.instructions-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.instructions-content h3 {
  color: #d35400;
  margin-bottom: 20px;
}

.device-instructions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
  text-align: left;
}

.device-type h4 {
  color: #333;
  margin-bottom: 10px;
}

.device-type p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
}

@media (max-width: 768px) {
  .device-instructions {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .cooldown-toast {
    right: 10px;
    left: 10px;
    top: 80px;
  }
}
`;

// Inyectar CSS adicional
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  initCouponSystem();
  
  // Exponer funciones de admin en consola para debugging
  window.adminResetCoupons = adminResetCoupons;
  window.adminShowStats = adminShowStats;
});

// Actualizar sistema existente de menú móvil y video
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      
      // Animación del botón hamburguesa
      const spans = menuToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Cerrar menú al hacer clic en un enlace
  const navLinksItems = document.querySelectorAll('.nav-links a');
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
});

// Video controls
const video = document.getElementById('video-tortas');
const playButton = document.getElementById('play-button');

if (video && playButton) {
  // Ocultar el botón si el video está en reproducción automática
  if (!video.paused) {
    playButton.style.display = 'none';
  }

  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      playButton.style.display = 'none';
    } else {
      video.pause();
      playButton.style.display = 'block';
    }
  });

  video.addEventListener('play', () => {
    playButton.style.display = 'none';
  });

  video.addEventListener('pause', () => {
    playButton.style.display = 'block';
  });

  // Pausar video cuando no esté visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && !video.paused) {
        video.pause();
      }
    });
  });
  
  observer.observe(video);
}

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const mensaje = document.getElementById('mensaje').value;
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola! Mi nombre es ${nombre}. ${mensaje}. Mi teléfono es ${telefono}.`;
    const whatsappURL = `https://wa.me/526651368330?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Limpiar formulario
    contactForm.reset();
    
    // Mostrar mensaje de confirmación
    alert('¡Gracias! Te redirigimos a WhatsApp para completar tu mensaje.');
  });
}

// Smooth scrolling para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Animaciones al hacer scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Aplicar animaciones a elementos
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.item, .promo-item, .horario-card, .info-card, .social-icon');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollObserver.observe(el);
  });
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(211, 84, 0, 0.95)';
    header.style.backdropFilter = 'blur(10px)';
  } else {
    header.style.background = 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)';
    header.style.backdropFilter = 'none';
  }
});

// Lazy loading para imágenes
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

