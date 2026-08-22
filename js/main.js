// Global variables
var currentUserId = window.currentUserId || 1;

/**
 * Dark / Light Theme Manager
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (document.body) document.body.classList.add('dark-mode');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) document.body.classList.remove('dark-mode');
  }
}

// Run immediately to avoid page flicker
initTheme();

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  if (document.body) {
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  localStorage.setItem('theme', newTheme);
  updateThemeToggleIcons(newTheme);

  if (window.showToast) {
    window.showToast(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع الفاتح ☀️', 'info');
  }
}

function updateThemeToggleIcons(theme) {
  const buttons = document.querySelectorAll('.theme-toggle-btn');
  buttons.forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        btn.setAttribute('title', 'التبديل إلى الوضع الفاتح');
        btn.setAttribute('aria-label', 'التبديل إلى الوضع الفاتح');
      } else {
        icon.className = 'fas fa-moon';
        btn.setAttribute('title', 'التبديل إلى الوضع الليلي');
        btn.setAttribute('aria-label', 'التبديل إلى الوضع الليلي');
      }
    }
  });
}

function setupThemeToggleButtons() {
  const userActionsList = document.querySelectorAll('.user-actions');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  userActionsList.forEach(container => {
    if (!container.querySelector('.theme-toggle-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'theme-toggle-btn';
      toggleBtn.onclick = toggleTheme;
      toggleBtn.innerHTML = `<i class="${currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}"></i>`;
      toggleBtn.setAttribute('title', currentTheme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي');
      
      const userIcon = container.querySelector('.user-icon');
      if (userIcon) {
        container.insertBefore(toggleBtn, userIcon);
      } else {
        container.appendChild(toggleBtn);
      }
    }
  });

  updateThemeToggleIcons(currentTheme);
}

// Make globally accessible
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;

/**
 * Wishlist Manager (LocalStorage based)
 */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(productId, productName = 'المنتج') {
  let wishlist = getWishlist();
  const index = wishlist.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`تم إزالة "${productName}" من قائمة المفضلة`, 'info');
  } else {
    wishlist.push(productId);
    isAdded = true;
    showToast(`تمت إضافة "${productName}" إلى قائمة المفضلة ❤️`, 'success');
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  return isAdded;
}

function updateWishlistUI() {
  const wishlist = getWishlist();
  const count = wishlist.length;
  const wishlistBadges = document.querySelectorAll('.wishlist-count');
  wishlistBadges.forEach(badge => {
    badge.textContent = count;
  });

  // Update heart buttons on cards
  const wishlistBtns = document.querySelectorAll('[data-wishlist-id]');
  wishlistBtns.forEach(btn => {
    const id = parseInt(btn.getAttribute('data-wishlist-id'), 10);
    const icon = btn.querySelector('i');
    if (wishlist.includes(id)) {
      btn.classList.add('active');
      if (icon) icon.className = 'fas fa-heart text-danger';
    } else {
      btn.classList.remove('active');
      if (icon) icon.className = 'far fa-heart';
    }
  });
}

window.getWishlist = getWishlist;
window.toggleWishlist = toggleWishlist;
window.updateWishlistUI = updateWishlistUI;

/**
 * Global Toast Notification System
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار: 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - مدة الظهور بالملي ثانية (افتراضي 3500ms)
 */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('role', 'status');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const iconClass = icons[type] || icons.success;

  toast.innerHTML = `
    <div class="toast-content">
      <i class="${iconClass} toast-icon"></i>
      <span class="toast-message">${message}</span>
    </div>
    <button type="button" class="toast-close" aria-label="إغلاق">&times;</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  let dismissTimeout = setTimeout(() => {
    removeToast(toast);
  }, duration);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    clearTimeout(dismissTimeout);
    removeToast(toast);
  });

  toast.addEventListener('mouseenter', () => {
    clearTimeout(dismissTimeout);
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'paused';
  });

  toast.addEventListener('mouseleave', () => {
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'running';
    dismissTimeout = setTimeout(() => {
      removeToast(toast);
    }, 1500);
  });
}

function removeToast(toast) {
  if (!toast) return;
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

window.showToast = showToast;

/**
 * Back To Top Button Handler
 */
function initBackToTop() {
  let btn = document.getElementById('back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'العودة إلى الأعلى');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

/**
 * Newsletter Form Handler
 */
function initNewsletter() {
  const forms = document.querySelectorAll('form[data-newsletter], .newsletter-form, footer form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast('شكراً لاشتراكك في النشرة البريدية! 🎉 ستبدأ بتلقي العروض قريباً.', 'success');
        input.value = '';
      } else {
        showToast('يرجى إدخال البريد الإلكتروني بشكل صحيح', 'warning');
      }
    });
  });
}

// Sync cart counter on page load
function syncCartCounter() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const cartItems = JSON.parse(savedCart);
      const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const cartCounts = document.querySelectorAll('.cart-count');
      cartCounts.forEach(el => el.textContent = totalCount);
    } catch (e) {}
  }
}

// Network Status Watcher (Online / Offline mode)
function initNetworkStatusWatcher() {
  const banner = document.createElement('div');
  banner.id = 'offline-notification-banner';
  banner.style.cssText = 'display:none; position:fixed; top:0; left:0; right:0; z-index:10000; background:#dc2626; color:#fff; text-align:center; padding:10px 15px; font-weight:bold; font-size:0.92rem; box-shadow:0 4px 12px rgba(0,0,0,0.2);';
  banner.innerHTML = '<i class="fas fa-wifi"></i> أنت غير متصل بالإنترنت حالياً (وضع التصفح دون اتصال). يلزم الاتصال لتأكيد الطلبات.';
  document.body.appendChild(banner);

  function updateStatus() {
    if (!navigator.onLine) {
      banner.style.display = 'block';
    } else {
      if (banner.style.display === 'block') {
        banner.style.display = 'none';
        if (window.showToast) {
          window.showToast('✅ تمت استعادة الاتصال بالإنترنت بنجاح!', 'success');
        }
      }
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  if (!navigator.onLine) updateStatus();
}

// Service Worker Registration
function registerPwaServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {})
        .catch(() => {});
    });
  }
}

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggleButtons();
  initBackToTop();
  initNewsletter();
  updateWishlistUI();
  syncCartCounter();
  initNetworkStatusWatcher();
  registerPwaServiceWorker();
});

