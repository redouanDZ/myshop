const fs = require('fs');
const path = require('path');

const scriptToInject = `
    <!-- Theme Anti-Flicker -->
    <script>
        (function(){
            var theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>
`;

function inject(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            if (f === 'admin') {
                inject(fullPath);
            }
        } else if (f.endsWith('.html')) {
            let html = fs.readFileSync(fullPath, 'utf8');
            // Check if already injected
            if (!html.includes('Theme Anti-Flicker')) {
                // Find </head>
                const idx = html.indexOf('</head>');
                if (idx !== -1) {
                    html = html.substring(0, idx) + scriptToInject + html.substring(idx);
                    fs.writeFileSync(fullPath, html, 'utf8');
                    console.log('Injected anti-flicker in ' + fullPath);
                }
            }
        }
    }
}

inject('.');
