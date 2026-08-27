const fs = require('fs');
let html = fs.readFileSync('track-order.html', 'utf8');

// Fix Desktop progress bar
html = html.replace('.timeline-progress-bar {\n            position: absolute;', '.timeline-progress-bar {\n            width: var(--progress-perc, 0%);\n            position: absolute;');

// Fix Mobile progress bar
html = html.replace('.timeline-progress-bar { top: 0; left: auto; right: 22px; width: 4px !important; transition: height 0.4s ease; }', '.timeline-progress-bar { top: 0; left: auto; right: 22px; width: 4px !important; height: var(--progress-perc, 0%); transition: height 0.4s ease; }');

// Wait, I already ruined it slightly with the previous replace.
// Let's just use regex to clean up .timeline-progress-bar in the mobile query.
html = html.replace(/(\.timeline-progress-bar\s*\{[^}]*width:\s*4px\s*!important;\s*transition:\s*height\s*0\.4s\s*ease;\s*\})/g, '.timeline-progress-bar { top: 0; left: auto; right: 22px; width: 4px !important; height: var(--progress-perc, 0%); transition: height 0.4s ease; }');

fs.writeFileSync('track-order.html', html, 'utf8');
console.log('Fixed progress bar mobile height');
