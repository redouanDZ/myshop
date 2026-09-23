const fs = require('fs');
let html = fs.readFileSync('track-order.html', 'utf8');

html = html.replace(/(\.timeline-progress-bar\s*\{\s*)(position:\s*absolute;)/, '$1width: var(--progress-perc, 0%);\n            $2');

fs.writeFileSync('track-order.html', html, 'utf8');
