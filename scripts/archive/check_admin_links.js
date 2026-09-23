const fs = require('fs');
const files = fs.readdirSync('admin').filter(f => f.endsWith('.html'));
files.forEach(f => {
    const html = fs.readFileSync('admin/' + f, 'utf8');
    const match = html.match(/<a href="([^"]+)"[^>]*class="[^"]*active[^"]*"/);
    if (match) {
        console.log(f + ' -> active link is ' + match[1]);
    } else {
        console.log(f + ' -> NO active link found');
    }
});
