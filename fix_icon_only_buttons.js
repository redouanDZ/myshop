const fs = require('fs');

const files = fs.readdirSync('.', { withFileTypes: true })
    .filter(d => !d.isDirectory() && d.name.endsWith('.html'))
    .map(d => d.name);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Convert data-i18n to data-i18n-title on icon-only elements
    const regex = /<([a-z]+)([^>]*)data-i18n="([^"]*)"([^>]*)>(\s*<i [^>]*><\/i>\s*)<\/\1>/gi;
    content = content.replace(regex, '<$1$2data-i18n-title="$3"$4>$5</$1>');

    // Do a second pass in case attributes are ordered differently
    // Actually regex above is flexible, but what if data-i18n is at the very end before ">"? It's matched by ([^>]*).
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed icon-only buttons i18n attributes');
