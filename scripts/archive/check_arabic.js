const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
    const html = fs.readFileSync(f, 'utf8');
    let idx = html.indexOf('المفضلة">');
    if (idx !== -1) {
        console.log(`--- ${f} ---`);
        console.log(html.substring(idx - 60, idx + 40));
    }
});
