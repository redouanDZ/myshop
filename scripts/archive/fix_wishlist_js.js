const fs = require('fs');
let html = fs.readFileSync('wishlist.html', 'utf8');

html = html.replace(/headerCount\.textContent = `\$\{wishlistProducts\.length\} ' \+ window\.I18n\.t\('wishlist\.products_count', '.*?'\) \+ '`;/g, "headerCount.textContent = `${wishlistProducts.length} ${window.I18n.t('wishlist.products_count', 'منتجات')}`;");

fs.writeFileSync('wishlist.html', html, 'utf8');
console.log('Fixed wishlist.html JS');
