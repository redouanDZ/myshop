const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
    const html = fs.readFileSync(f, 'utf8');
    if (html.includes('title="<span')) {
        console.log(f + ' has the broken title attribute!');
    }
});
