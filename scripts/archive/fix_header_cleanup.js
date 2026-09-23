const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Check for cart title broken string anywhere
    const cartBroken = /title="' \+ window\.I18n\.t\('common\.cart_title', 'السلة'\) \+ '"/g;
    if (cartBroken.test(html)) {
        html = html.replace(cartBroken, 'title="السلة"');
        changed = true;
    }
    
    // Check for wishlist title broken string
    const wishBroken = /title="<span data-i18n="footer\.link_wishlist">المفضلة<\/span>"/g;
    if (wishBroken.test(html)) {
        html = html.replace(wishBroken, 'title="المفضلة"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, html, 'utf8');
        console.log('Fixed clean up in ' + f);
    }
});
