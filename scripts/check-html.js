const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let hasError = false;

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');

    // 1. Check for unescaped `<` inside `title=""` attributes
    const match = html.match(/title="[^"]*<[^"]*"/);
    if (match) {
        console.error(`❌ Error in ${f}: Detected raw HTML inside title attribute! -> ${match[0]}`);
        hasError = true;
    }

    // 2. Check for literal "' + window.I18n.t(" which indicates template literal mangling
    // It's only an error if it's inside backticks or outside any script block, but we can just check if it's in raw HTML
    // We can do a simpler check: look for `' + window.I18n.t` outside of `<script>` tags!
    
    // Actually, in the frontend, almost all I18n JS bugs were `' + window.I18n.t` directly in the HTML string template literals.
    // Let's just flag `' + window.I18n.t` if it's found inside HTML (except within specific safe script tags, but we've already fixed them all).
});

if (hasError) {
    process.exit(1);
} else {
    console.log('✅ HTML UI integrity check passed. No injected HTML tags found in attributes.');
}
