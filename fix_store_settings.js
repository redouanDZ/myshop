const fs = require('fs');

let mainJs = fs.readFileSync('js/main.js', 'utf8');

const newFunction = `function applyGlobalStoreSettings(settings) {
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
  
  if (settings.store_name) {
    // Update document title suffix safely without removing the page name
    const currentTitle = document.title;
    if (currentTitle.includes('-')) {
        document.title = currentTitle.split('-')[0] + '- ' + settings.store_name;
    } else {
        document.title = settings.store_name;
    }

    // Update footer brand or other hardcoded store names
    document.querySelectorAll('[data-i18n="footer.brand"], .footer-brand').forEach(el => {
        el.textContent = settings.store_name;
    });
  }

  // 2. Update Header Brand Name & Logo
  document.querySelectorAll('.logo a').forEach(logoLink => {
    let content = '';
    if (settings.store_logo) {
      // User wants circular logo, adding border-radius: 50% and object-fit: cover
      const altText = window.escapeHtml ? window.escapeHtml(settings.store_name || '') || 'MYSHOP' : (settings.store_name || 'MYSHOP');
      content += \`<img src="\${settings.store_logo}" alt="\${altText}" style="max-height: 42px; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-inline-end: 10px;">\`;
    }
    if (settings.store_name) {
      content += \`<span class="store-name-text" style="vertical-align: middle;">\${settings.store_name}</span>\`;
    }
    
    if (content) {
        logoLink.innerHTML = content;
        logoLink.style.display = 'flex';
        logoLink.style.alignItems = 'center';
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
      if (el.tagName === 'A') el.href = \`tel:\${settings.store_phone}\`;
    }
  });

  document.querySelectorAll('.footer-email, .contact-email').forEach(el => {
    if (settings.store_email) {
      el.textContent = settings.store_email;
      if (el.tagName === 'A') el.href = \`mailto:\${settings.store_email}\`;
    }
  });

  document.querySelectorAll('.footer-address, .contact-address, [data-i18n="footer.address"]').forEach(el => {
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
}`;

mainJs = mainJs.replace(/function applyGlobalStoreSettings\([\s\S]*?\n\}/s, newFunction);
fs.writeFileSync('js/main.js', mainJs, 'utf8');
console.log('Fixed js/main.js');
