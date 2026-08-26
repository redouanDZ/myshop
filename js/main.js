// Global variables and initialization

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
 * Universal HTML Sanitization Helper to defend against DOM / Stored XSS
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

/**
 * Wishlist Manager (Synchronized with window.WishlistManager)
 */
function getWishlist() {
  if (window.WishlistManager) {
    return window.WishlistManager.getLocalItems().map(p => Number(p.id));
  }
  try {
    const raw = localStorage.getItem('myshop_wishlist') || localStorage.getItem('wishlist');
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return parsed.map(p => Number(p.id));
    }
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch (e) {
    return [];
  }
}

async function toggleWishlist(productId, productName = 'المنتج') {
  const prodId = Number(productId);
  if (!prodId) return false;

  if (window.WishlistManager) {
    const result = await window.WishlistManager.toggleItem({
      id: prodId,
      name: productName
    });
    updateWishlistUI();
    return result;
  }

  let wishlist = getWishlist();
  const index = wishlist.indexOf(prodId);
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`تم إزالة "${productName}" من قائمة المفضلة`, 'info');
  } else {
    wishlist.push(prodId);
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
  const wishlistBadges = document.querySelectorAll('.wishlist-count, #wishlist-count');
  wishlistBadges.forEach(badge => {
    badge.textContent = count;
  });

  // Update heart buttons on cards
  const wishlistBtns = document.querySelectorAll('[data-wishlist-id], .product-wishlist');
  wishlistBtns.forEach(btn => {
    const id = parseInt(btn.getAttribute('data-wishlist-id'), 10);
    const icon = btn.querySelector('i');
    if (id && wishlist.includes(id)) {
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

/**
 * Mobile Navigation Drawer Manager
 */
function initMobileNavigation() {
  const header = document.querySelector('header');
  if (!header) return;

  const container = header.querySelector('.container');
  if (!container) return;

  // Check or create mobile hamburger button
  let menuBtn = container.querySelector('.mobile-menu-btn');
  if (!menuBtn) {
    menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.setAttribute('aria-label', 'فتح القائمة الرئيسية');
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    container.appendChild(menuBtn);
  }

  // Create overlay & drawer if not present
  let overlay = document.getElementById('mobile-nav-overlay');
  let drawer = document.getElementById('mobile-nav-drawer');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobile-nav-overlay';
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
  }

  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'mobile-nav-drawer';
    drawer.className = 'mobile-nav-drawer';
    
    // Copy nav items from current header nav if exists
    const currentNavLinks = container.querySelectorAll('nav ul li a');
    let linksHtml = '';
    
    if (currentNavLinks.length > 0) {
      currentNavLinks.forEach(link => {
        const href = link.getAttribute('href') || '#';
        const text = link.textContent.trim();
        const active = link.classList.contains('active') ? 'active' : '';
        const i18n = link.getAttribute('data-i18n') ? `data-i18n="${link.getAttribute('data-i18n')}"` : '';
        
        let icon = 'fas fa-chevron-left';
        if (href.includes('index.html') || href === '/') icon = 'fas fa-home';
        else if (href.includes('shop.html')) icon = 'fas fa-shopping-bag';
        else if (href.includes('cart.html')) icon = 'fas fa-shopping-cart';
        else if (href.includes('wishlist.html')) icon = 'fas fa-heart';
        else if (href.includes('track-order.html')) icon = 'fas fa-truck';
        else if (href.includes('account.html')) icon = 'fas fa-user';
        
        linksHtml += `<li><a href="${href}" class="${active}" ${i18n}><i class="${icon}"></i> <span>${text}</span></a></li>`;
      });
    } else {
      linksHtml = `
        <li><a href="index.html" data-i18n="nav.home"><i class="fas fa-home"></i> <span>الرئيسية</span></a></li>
        <li><a href="shop.html" data-i18n="nav.shop"><i class="fas fa-shopping-bag"></i> <span>التسوق</span></a></li>
        <li><a href="cart.html" data-i18n="nav.cart"><i class="fas fa-shopping-cart"></i> <span>عربة التسوق</span></a></li>
        <li><a href="wishlist.html" data-i18n="nav.wishlist"><i class="fas fa-heart"></i> <span>المفضلة</span></a></li>
        <li><a href="track-order.html" data-i18n="nav.track_order"><i class="fas fa-truck"></i> <span>تتبع طلبي</span></a></li>
        <li><a href="account.html" data-i18n="nav.account"><i class="fas fa-user"></i> <span>حسابي</span></a></li>
      `;
    }

    drawer.innerHTML = `
      <div class="mobile-drawer-header">
        <div class="drawer-logo">
          <i class="fas fa-shopping-bag" style="color: var(--primary-color);"></i> المتجر الإلكتروني
        </div>
        <button type="button" class="mobile-drawer-close" aria-label="إغلاق القائمة">&times;</button>
      </div>
      <ul class="mobile-drawer-links">
        ${linksHtml}
      </ul>
      <div class="mobile-drawer-footer">
        <a href="account.html" class="btn btn-outline" style="width: 100%; justify-content: center; font-size: 0.92rem; padding: 10px;">
          <i class="fas fa-user-circle"></i> حسابي الشخصي
        </a>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  function openDrawer() {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  
  const closeBtn = drawer.querySelector('.mobile-drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * Apply Global Dynamic Store Settings (Logo, Branding, Social, Policies, Announcement, Payment Toggles)
 */
function applyGlobalStoreSettings(settings) {
  if (!settings) return;

  // 1. Update Document Title / Favicon
  if (settings.store_favicon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.store_favicon;
  }

  // 2. Update Header Brand Name & Logo
  document.querySelectorAll('.logo a').forEach(logoLink => {
    if (settings.store_logo) {
      logoLink.innerHTML = `<img src="${settings.store_logo}" alt="${window.escapeHtml ? window.escapeHtml(settings.store_name || '') || 'MYSHOP' : (settings.store_name || 'MYSHOP')}" style="max-height: 42px; width: auto; vertical-align: middle;">`;
    } else if (settings.store_name) {
      logoLink.textContent = settings.store_name;
    }
  });

  // 3. Update Announcement Bar if present
  const announcementEl = document.querySelector('.top-announcement-bar') || document.getElementById('announcement-bar');
  if (announcementEl && settings.announcement_bar_text) {
    announcementEl.textContent = settings.announcement_bar_text;
  }

  // 4. Update Footer Contact Info & Social Links
  document.querySelectorAll('.footer-phone, .contact-phone').forEach(el => {
    if (settings.store_phone) {
      el.textContent = settings.store_phone;
      if (el.tagName === 'A') el.href = `tel:${settings.store_phone}`;
    }
  });

  document.querySelectorAll('.footer-email, .contact-email').forEach(el => {
    if (settings.store_email) {
      el.textContent = settings.store_email;
      if (el.tagName === 'A') el.href = `mailto:${settings.store_email}`;
    }
  });

  document.querySelectorAll('.footer-address, .contact-address').forEach(el => {
    if (settings.store_address) el.textContent = settings.store_address;
  });

  document.querySelectorAll('.social-links a.facebook, a[title="فيسبوك"]').forEach(el => {
    if (settings.facebook_url) el.href = settings.facebook_url;
  });

  document.querySelectorAll('.social-links a.instagram, a[title="إنستغرام"]').forEach(el => {
    if (settings.instagram_url) el.href = settings.instagram_url;
  });

  document.querySelectorAll('.social-links a.tiktok, a[title="تيك توك"]').forEach(el => {
    if (settings.tiktok_url) el.href = settings.tiktok_url;
  });

  // 5. Payment Methods Visibility Control (Checkout / Express)
  if (settings.enable_cod === 'false') {
    const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]') || document.querySelector('.cod-option');
    if (codRadio) {
      const container = codRadio.closest('.payment-option') || codRadio.parentElement;
      if (container) container.style.display = 'none';
    }
  }

  if (settings.enable_chargily === 'false') {
    const chargilyRadio = document.querySelector('input[name="paymentMethod"][value="chargily"]') || document.querySelector('.chargily-option');
    if (chargilyRadio) {
      const container = chargilyRadio.closest('.payment-option') || chargilyRadio.parentElement;
      if (container) container.style.display = 'none';
    }
  }
}

/**
 * Marketing Pixels & Event Tracker
 */
async function initMarketingPixels() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const settings = await res.json();
    if (!settings) return;

    window.storeSettings = settings;
    applyGlobalStoreSettings(settings);

    // 1. Facebook Pixel
    if (settings.facebook_pixel_id && typeof window.fbq !== 'function') {
      (function(f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', String(settings.facebook_pixel_id).trim());
      window.fbq('track', 'PageView');
    }

    // 2. TikTok Pixel
    if (settings.tiktok_pixel_id && typeof window.ttq !== 'object') {
      (function (w, d, t) {
        w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
        ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
        ttq.load = function (e, n) {
          var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {};
          var o = document.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = i + "?sdkid=" + e + "&lib=" + t;
          var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
        };
        ttq.load(String(settings.tiktok_pixel_id).trim());
        ttq.page();
      })(window, document, 'ttq');
    }

    // 3. Google Analytics 4
    if (settings.google_analytics_id) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.google_analytics_id.trim())}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', settings.google_analytics_id.trim());
    }

    // Custom helper to track e-commerce actions
    window.trackPixelEvent = function(eventName, params = {}) {
      if (typeof window.fbq === 'function') window.fbq('track', eventName, params);
      if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') window.ttq.track(eventName, params);
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    };
  } catch (e) {}
}

/**
 * Mobile Bottom Sticky Navigation Bar
 */
function initMobileBottomBar() {
  if (document.querySelector('.mobile-bottom-nav') || window.location.pathname.includes('/admin/')) {
    return;
  }

  const path = window.location.pathname;
  const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '';
  const isShop = path.includes('shop.html') || path.includes('product.html');
  const isWishlist = path.includes('wishlist.html');
  const isCart = path.includes('cart.html') || path.includes('checkout.html');
  const isAccount = path.includes('account.html');

  const bottomNav = document.createElement('nav');
  bottomNav.className = 'mobile-bottom-nav';
  bottomNav.id = 'mobileBottomNav';
  bottomNav.setAttribute('aria-label', 'شريط التنقل السفلي للهاتف');

  bottomNav.innerHTML = `
    <a href="index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
      <i class="fas fa-home"></i>
      <span>الرئيسية</span>
    </a>
    <a href="shop.html" class="mobile-nav-item ${isShop ? 'active' : ''}">
      <i class="fas fa-shopping-bag"></i>
      <span>التسوق</span>
    </a>
    <a href="wishlist.html" class="mobile-nav-item ${isWishlist ? 'active' : ''}">
      <div class="nav-icon-badge-wrap">
        <i class="fas fa-heart"></i>
        <span class="mobile-badge wishlist-count">0</span>
      </div>
      <span>المفضلة</span>
    </a>
    <a href="cart.html" class="mobile-nav-item ${isCart ? 'active' : ''}">
      <div class="nav-icon-badge-wrap">
        <i class="fas fa-shopping-cart"></i>
        <span class="mobile-badge cart-count">0</span>
      </div>
      <span>السلة</span>
    </a>
    <a href="account.html" class="mobile-nav-item ${isAccount ? 'active' : ''}">
      <i class="fas fa-user"></i>
      <span>حسابي</span>
    </a>
  `;

  document.body.appendChild(bottomNav);

  syncCartCounter();
  updateWishlistUI();
}

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggleButtons();
  initMobileNavigation();
  initMobileBottomBar();
  initBackToTop();
  initNewsletter();
  updateWishlistUI();
  syncCartCounter();
  initNetworkStatusWatcher();
  registerPwaServiceWorker();
  initMarketingPixels();
});


