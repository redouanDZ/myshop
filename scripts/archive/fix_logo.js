const fs = require('fs');

let content = fs.readFileSync('js/main.js', 'utf8');

// The line is: <img src="${settings.store_logo}" alt="${altText}" style="..."
content = content.replace(
    /src="\$\{settings\.store_logo\}" alt="\$\{altText\}"/,
    'src="${settings.store_logo}" alt="${altText}" onerror="this.style.display=\'none\'"'
);

fs.writeFileSync('js/main.js', content, 'utf8');
console.log('Added onerror to logo image');
