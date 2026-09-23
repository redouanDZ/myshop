const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const darkModeFixes = `

/* --- Product Page Dark Mode Fixes --- */

[data-theme="dark"] .product-container {
    background-color: var(--card-bg, #1e293b) !important;
}

[data-theme="dark"] .express-checkout-box {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    border-color: rgba(59, 130, 246, 0.4) !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .express-checkout-box h3 {
    color: #f1f5f9 !important;
}

[data-theme="dark"] .express-checkout-box label {
    color: #cbd5e1 !important;
}

[data-theme="dark"] .express-checkout-box .tab-panel {
    background-color: transparent !important;
}

/* The badge with blue background */
[data-theme="dark"] .express-checkout-box h3 + span {
    background: rgba(14, 165, 233, 0.2) !important;
    color: #7dd3fc !important;
}

/* The summary box */
[data-theme="dark"] .express-checkout-box > div > form > div:nth-last-child(2) {
    background: #0f172a !important;
    border-color: #334155 !important;
}

/* Summary text colors */
[data-theme="dark"] .express-checkout-box > div > form > div:nth-last-child(2) > div {
    color: #cbd5e1 !important;
}
[data-theme="dark"] .express-checkout-box > div > form > div:nth-last-child(2) > div:last-child {
    border-top-color: #334155 !important;
    color: #60a5fa !important;
}

/* The quantity buttons in dark mode */
[data-theme="dark"] .quantity-btn {
    background: #334155 !important;
    color: #f1f5f9 !important;
    border-color: #475569 !important;
}

[data-theme="dark"] .quantity input {
    background: #0f172a !important;
    color: #f1f5f9 !important;
    border-color: #475569 !important;
}
[data-theme="dark"] .quantity {
    border-color: #475569 !important;
}

`;

if (!css.includes('Product Page Dark Mode Fixes')) {
    css += darkModeFixes;
    fs.writeFileSync('css/style.css', css, 'utf8');
    console.log('Fixed product page dark mode');
} else {
    console.log('Already fixed');
}
