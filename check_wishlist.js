const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
    const html = fs.readFileSync(f, 'utf8');
    const index = html.indexOf('wishlist-icon');
    if (index !== -1) {
        console.log(`--- ${f} ---`);
        console.log(html.substring(index - 50, index + 200));
    }
});
