const fs = require('fs');

const files = ['invoice.html', 'track-order.html', 'order-confirmation.html', 'product.html', 'account.html', 'wishlist.html'];

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let original = html;
    
    // Replace all occurrences of currency and currency_alt
    html = html.replace(/' \+ window\.I18n\.t\('common\.currency_alt', '.*?'\) \+ '/g, "${window.I18n.t('common.currency_alt', 'د.ج')}");
    html = html.replace(/' \+ window\.I18n\.t\('common\.currency', '.*?'\) \+ '/g, "${window.I18n.t('common.currency', 'د.ج')}");
    
    if (html !== original) {
        fs.writeFileSync(f, html, 'utf8');
        console.log('Fixed currencies in ' + f);
    }
});
