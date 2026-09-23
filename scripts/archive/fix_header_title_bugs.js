const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Check for any title="<span..."
    const regex = /title="<span[^>]*>([^<]*)<\/span>">/g;
    if (regex.test(html)) {
        html = html.replace(regex, 'title="$1">');
        changed = true;
    }
    
    // Check for cart title bug (if any)
    const cartBroken = `title="' + window.I18n.t('common.cart_title', 'السلة') + '">`;
    if (html.includes(cartBroken)) {
        html = html.split(cartBroken).join('title="السلة">');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, html, 'utf8');
        console.log('Fixed ' + f);
    }
});
