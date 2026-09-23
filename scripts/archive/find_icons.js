const fs = require('fs');

const files = fs.readdirSync('.', { withFileTypes: true })
    .filter(d => !d.isDirectory() && d.name.endsWith('.html'))
    .map(d => d.name);

let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Match elements with data-i18n that only contain an <i> tag and whitespace
    const regex = /<([a-z]+)[^>]*data-i18n="([^"]*)"[^>]*>\s*<i [^>]*><\/i>\s*<\/\1>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        console.log(`${file} -> data-i18n="${match[2]}"`);
        count++;
    }
});
if (count === 0) console.log('No icon-only elements with data-i18n found.');
