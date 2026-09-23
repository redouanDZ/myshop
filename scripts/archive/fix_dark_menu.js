const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const fix = `
/* Dark mode mobile menu button fix */
[data-theme="dark"] .mobile-menu-btn,
body.dark-mode .mobile-menu-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}
`;

if (!css.includes('Dark mode mobile menu button fix')) {
    css += fix;
    fs.writeFileSync('css/style.css', css, 'utf8');
    console.log('Fixed mobile menu btn dark mode');
} else {
    console.log('Already fixed');
}
