const fs = require('fs');

let css = fs.readFileSync('css/style.css', 'utf8');

const darkModeFixesUpdated = `

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
[data-theme="dark"] .express-checkout-box h3 + span,
[data-theme="dark"] .express-checkout-box h3 ~ span {
    background: rgba(14, 165, 233, 0.2) !important;
    color: #7dd3fc !important;
}

/* The summary box */
[data-theme="dark"] #express-order-form > div:nth-last-child(2) {
    background: #0f172a !important;
    border-color: #334155 !important;
}

/* Summary text colors */
[data-theme="dark"] #express-order-form > div:nth-last-child(2) > div {
    color: #cbd5e1 !important;
}
[data-theme="dark"] #express-order-form > div:nth-last-child(2) > div span {
    color: #f1f5f9 !important;
}

[data-theme="dark"] #express-order-form > div:nth-last-child(2) > div:last-child {
    border-top-color: #334155 !important;
}
[data-theme="dark"] #express-order-form > div:nth-last-child(2) > div:last-child span {
    color: #60a5fa !important;
}

/* Shipping type radio boxes */
[data-theme="dark"] #express-order-form .shipping-type-selector label {
    background: #1e293b !important;
    border-color: #334155 !important;
    color: #cbd5e1 !important;
}
[data-theme="dark"] #express-order-form .shipping-type-selector input:checked + label {
    background: rgba(59, 130, 246, 0.1) !important;
    border-color: var(--primary-color) !important;
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

// Remove the old injection
let cleanCss = css.replace(/\/\* --- Product Page Dark Mode Fixes --- \*\/[\s\S]*?(?=\n\n|\Z)/g, '');
// Wait, I didn't add a closing marker. I'll just remove everything from the comment to the end of the file.
const splitIndex = css.indexOf('/* --- Product Page Dark Mode Fixes --- */');
if (splitIndex !== -1) {
    css = css.substring(0, splitIndex).trim();
}

css += '\n\n' + darkModeFixesUpdated;

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('Applied better dark mode fixes for product page');
