const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const headerIconsFix = `

/* --- Header Icons Dark Mode Fixes --- */
[data-theme="dark"] .cart-icon, 
[data-theme="dark"] .user-icon, 
[data-theme="dark"] .wishlist-icon, 
[data-theme="dark"] .theme-toggle-btn,
body.dark-mode .cart-icon, 
body.dark-mode .user-icon, 
body.dark-mode .wishlist-icon, 
body.dark-mode .theme-toggle-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}
`;

css += '\n' + headerIconsFix;

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('Fixed header icons dark mode');
