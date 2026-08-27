const fs = require('fs');

const files = fs.readdirSync('.', { withFileTypes: true })
    .filter(d => !d.isDirectory() && d.name.endsWith('.html'))
    .map(d => d.name);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Globally replace data-i18n="common.menu" with data-i18n-title="common.menu" 
    // since it's only used for the mobile menu button and shouldn't inject text.
    content = content.split('data-i18n="common.menu"').join('data-i18n-title="common.menu"');

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed mobile menu button i18n attribute');
