const fs = require('fs');

const files = fs.readdirSync('.', { withFileTypes: true })
    .filter(d => !d.isDirectory() && d.name.endsWith('.html'))
    .map(d => d.name);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace data-i18n="..." with data-i18n-title="..." for header icons
    content = content.replace(/class="theme-toggle-btn"([^>]*)data-i18n="common.toggle_theme"/g, 'class="theme-toggle-btn"$1data-i18n-title="common.toggle_theme"');
    content = content.replace(/class="wishlist-icon"([^>]*)data-i18n="common.wishlist"/g, 'class="wishlist-icon"$1data-i18n-title="common.wishlist"');
    content = content.replace(/class="cart-icon"([^>]*)data-i18n="common.cart_title"/g, 'class="cart-icon"$1data-i18n-title="common.cart_title"');
    content = content.replace(/class="user-icon"([^>]*)data-i18n="common.my_account"/g, 'class="user-icon"$1data-i18n-title="common.my_account"');
    
    // Also handle case where data-i18n comes BEFORE the class
    content = content.replace(/data-i18n="common.toggle_theme"([^>]*)class="theme-toggle-btn"/g, 'data-i18n-title="common.toggle_theme"$1class="theme-toggle-btn"');
    content = content.replace(/data-i18n="common.wishlist"([^>]*)class="wishlist-icon"/g, 'data-i18n-title="common.wishlist"$1class="wishlist-icon"');
    content = content.replace(/data-i18n="common.cart_title"([^>]*)class="cart-icon"/g, 'data-i18n-title="common.cart_title"$1class="cart-icon"');
    content = content.replace(/data-i18n="common.my_account"([^>]*)class="user-icon"/g, 'data-i18n-title="common.my_account"$1class="user-icon"');

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed header icons i18n attributes');
