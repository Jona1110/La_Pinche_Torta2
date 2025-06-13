// Menú móvil
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

// ===== SISTEMA DE CÓDIGOS DE DESCUENTO =====
class DiscountSystem {
  constructor() {
    this.storageKey = 'tortasClickCount';
    this.codesKey = 'tortasUsedCodes';
    this.clicksNeeded = 5; // Cada 5 clics se genera un código
    this.discountCodes = [
      { code: 'TORTA10', discount: '10% de descuento', message: '¡10% OFF en tu próxima torta!' },
      { code: 'TACOS15', discount: '15% de descuento', message: '¡15% OFF en tacos dorados!' },
      { code: 'PROMO20', discount: '20% de descuento', message: '¡20% OFF en tu pedido!' },
      { code: 'ESPECIAL25', discount: '25% de descuento', message: '¡25% OFF - Oferta especial!' },
      { code: 'VIP30', discount: '30% de descuento', message: '¡30% OFF - Cliente VIP!' }
    ];
    this.init();
  }

  init() {
    this.createDiscountModal();
    this.setupWhatsAppLinks();
    this.updateProgressBar();
  }

  getClickCount() {
    return parseInt(localStorage.getItem(this.storageKey) || '0');
  }

  getUsedCodes() {
    return JSON.parse(localStorage.getItem(this.codesKey) || '[]');
  }

  incrementClick() {
    const currentCount = this.getClickCount();
    const newCount = currentCount + 1;
    localStorage.setItem(this.storageKey, newCount.toString());
    return newCount;
  }

  addUsedCode(code) {
    const usedCodes = this.getUsedCodes();
    usedCodes.push(code);
    localStorage.setItem(this.codesKey, JSON.stringify(usedCodes));
  }

  generateDiscountCode() {
    const usedCodes = this.getUsedCodes();
    const availableCodes = this.discountCodes.filter(dc => !usedCodes.includes(dc.code));
    
    if (availableCodes.length === 0) {
      // Si ya se usaron todos los códigos, crear uno aleatorio
      const randomDiscount = [10, 15, 20][Math.floor(Math.random() * 3)];
      const randomCode = 'ESPECIAL' + Math.floor(Math.random() * 1000);
      return {
        code: randomCode,
        discount: `${randomDiscount}% de descuento`,
        message: `¡${randomDiscount}% OFF con código ${randomCode}!`
      };
    }
    
    const randomIndex = Math.floor(Math.random() * availableCodes.length);
    return availableCodes[randomIndex];
  }

  createDiscountModal() {
    const modalHTML = `
      <div id="discountModal" class="discount-modal" style="display: none;">
        <div class="discount-modal-content">
          <div class="discount-confetti">🎉</div>
          <h3>¡Felicidades!</h3>
          <p id="discountMessage">¡Has ganado un descuento!</p>
          <div class="discount-code-container">
            <span>Código:</span>
            <div id="discountCode" class="discount-code">CODIGO123</div>
            <button id="copyCodeBtn" class="copy-btn">📋 Copiar</button>
          </div>
          <p class="discount-instructions">Menciona este código al hacer tu pedido por WhatsApp</p>
          <button id="continueToWhatsApp" class="btn btn-primary">Continuar a WhatsApp</button>
          <button id="closeDiscountModal" class="close-modal">×</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Agregar estilos CSS para el modal
    const style = document.createElement('style');
    style.textContent = `
      .discount-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }

      .discount-modal-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        position: relative;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .discount-confetti {
        font-size: 3rem;
        margin-bottom: 20px;
        animation: bounce 1s infinite;
      }

      .discount-modal-content h3 {
        color: #d35400;
        font-size: 2rem;
        margin-bottom: 15px;
        font-family: 'Dancing Script', cursive;
      }

      .discount-code-container {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        border: 2px dashed #d35400;
      }

      .discount-code {
        font-size: 1.5rem;
        font-weight: bold;
        color: #d35400;
        font-family: 'Courier New', monospace;
        margin: 10px 0;
        padding: 10px;
        background: white;
        border-radius: 8px;
        display: inline-block;
        min-width: 150px;
      }

      .copy-btn {
        background: #28a745;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        margin-left: 10px;
        transition: all 0.3s ease;
      }

      .copy-btn:hover {
        background: #218838;
        transform: scale(1.05);
      }

      .discount-instructions {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 20px;
      }

      .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
      }

      .progress-container {
        background: #f0f0f0;
        border-radius: 25px;
        padding: 3px;
        margin: 20px 0;
        position: relative;
        overflow: hidden;
      }

      .progress-bar {
        background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
        height: 20px;
        border-radius: 25px;
        transition: width 0.5s ease;
        position: relative;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8rem;
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }

      .clicks-counter {
        text-align: center;
        margin: 10px 0;
        font-size: 0.9rem;
        color: #666;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }

  createProgressIndicator() {
    const progressHTML = `
      <div class="discount-progress-widget">
        <div class="clicks-counter">
          <span id="clicksCount">0</span> / ${this.clicksNeeded} clics para descuento 🎁
        </div>
        <div class="progress-container">
          <div class="progress-bar" id="progressBar">
            <div class="progress-text" id="progressText">0%</div>
          </div>
        </div>
      </div>
    `;

    // Estilos para el widget
    const style = document.createElement('style');
    style.textContent = `
      .discount-progress-widget {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 999;
        min-width: 200px;
        border: 2px solid #d35400;
      }

      @media (max-width: 768px) {
        .discount-progress-widget {
          bottom: 80px;
          right: 10px;
          left: 10px;
          min-width: unset;
        }
      }
    `;
    document.head.appendChild(style);
  }

  updateProgressBar() {
    const currentClicks = this.getClickCount();
    const progress = Math.min((currentClicks % this.clicksNeeded) / this.clicksNeeded * 100, 100);
    
    // Crear el widget si no existe
    if (!document.querySelector('.discount-progress-widget')) {
      this.createProgressIndicator();
    }

    const clicksCountEl = document.getElementById('clicksCount');
    const progressBarEl = document.getElementById('progressBar');
    const progressTextEl = document.getElementById('progressText');

    if (clicksCountEl && progressBarEl && progressTextEl) {
      const remainingClicks = this.clicksNeeded - (currentClicks % this.clicksNeeded);
      clicksCountEl.textContent = currentClicks % this.clicksNeeded;
      progressBarEl.style.width = progress + '%';
      progressTextEl.textContent = Math.round(progress) + '%';
      
      // Actualizar el texto del contador
      const counterText = document.querySelector('.clicks-counter');
      if (remainingClicks === this.clicksNeeded) {
        counterText.innerHTML = `<span id="clicksCount">0</span> / ${this.clicksNeeded} clics para descuento 🎁`;
      } else {
        counterText.innerHTML = `<span id="clicksCount">${currentClicks % this.clicksNeeded}</span> / ${this.clicksNeeded} clics para descuento 🎁`;
      }
    }
  }

  showDiscountModal(discountData, whatsappUrl) {
    const modal = document.getElementById('discountModal');
    const messageEl = document.getElementById('discountMessage');
    const codeEl = document.getElementById('discountCode');
    const copyBtn = document.getElementById('copyCodeBtn');
    const continueBtn = document.getElementById('continueToWhatsApp');
    const closeBtn = document.getElementById('closeDiscountModal');

    messageEl.textContent = discountData.message;
    codeEl.textContent = discountData.code;

    // Funcionalidad de copiar código
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(discountData.code).then(() => {
        copyBtn.textContent = '✅ Copiado';
        copyBtn.style.background = '#28a745';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copiar';
          copyBtn.style.background = '#28a745';
        }, 2000);
      }).catch(() => {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = discountData.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.textContent = '✅ Copiado';
      });
    });

    // Funcionalidad de continuar a WhatsApp
    continueBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      window.open(whatsappUrl, '_blank');
    });

    // Cerrar modal
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    modal.style.display = 'flex';
  }

  setupWhatsAppLinks() {
    // Encontrar todos los enlaces de WhatsApp
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
    
    whatsappLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const clickCount = this.incrementClick();
        const whatsappUrl = link.href;
        
        // Verificar si es momento de dar un descuento
        if (clickCount % this.clicksNeeded === 0) {
          const discountData = this.generateDiscountCode();
          this.addUsedCode(discountData.code);
          this.showDiscountModal(discountData, whatsappUrl);
        } else {
          // Continuar normalmente a WhatsApp
          window.open(whatsappUrl, '_blank');
        }
        
        // Actualizar la barra de progreso
        this.updateProgressBar();
      });
    });
  }
}

// Inicializar el sistema de descuentos cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
  new DiscountSystem();
});

// ===== RESTO DEL CÓDIGO ORIGINAL =====

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

const observer = new IntersectionObserver((entries) => {
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
    observer.observe(el);
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