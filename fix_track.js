const fs = require('fs');
let html = fs.readFileSync('track-order.html', 'utf8');

const newStyles = `
        @media (max-width: 768px) {
            .track-form-grid { grid-template-columns: 1fr; }
            
            /* Responsive Stepper for Mobile */
            .timeline-stepper { flex-direction: column; align-items: flex-start; margin-right: 20px; margin-left: 20px; }
            .timeline-stepper::before { top: 0; bottom: 0; left: auto; right: 22px; width: 4px; height: auto; }
            .timeline-progress-bar { top: 0; left: auto; right: 22px; width: 4px !important; transition: height 0.4s ease; }
            .step-node { display: flex; align-items: center; width: 100%; margin-bottom: 25px; text-align: right; }
            .step-icon { margin-left: 15px; flex-shrink: 0; margin-right: 0; }
            
            .order-header-info { flex-direction: column; }
            .order-result-box { overflow-x: auto; }
        }

        /* Dark Mode Support */
        [data-theme="dark"] .track-container { background: var(--card-bg, #1e293b); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        [data-theme="dark"] .form-field label { color: #cbd5e1; }
        [data-theme="dark"] .form-field input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
        [data-theme="dark"] .timeline-stepper::before { background: #334155; }
        [data-theme="dark"] .step-icon { background: #1e293b; border-color: #334155; }
        [data-theme="dark"] .step-label { color: #94a3b8; }
        [data-theme="dark"] .order-header-info { background: #0f172a; }
        [data-theme="dark"] .order-info-item span { color: #94a3b8; }
        [data-theme="dark"] .order-info-item strong { color: #f1f5f9; }
        [data-theme="dark"] .order-items-table th { background: #0f172a; color: #cbd5e1; border-color: #334155; }
        [data-theme="dark"] .order-items-table td { border-color: #1e293b; color: #f1f5f9; }
        [data-theme="dark"] .order-items-table .product-cell span { color: #f1f5f9; }
`;

html = html.replace(/@media \(max-width: 768px\) \{[\s\S]*?\.track-form-grid[^}]*\}[^}]*\}/, newStyles);
fs.writeFileSync('track-order.html', html, 'utf8');
console.log('Fixed track-order styles');
