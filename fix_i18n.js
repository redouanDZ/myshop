const fs = require('fs');

let content = fs.readFileSync('js/i18n.js', 'utf8');
const replacement = `
        // تحديث العناصر التي تحمل data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = this.getValue(dict, key);
            if (val !== null) el.title = val;
        });

        // تحديث العناصر التي تحمل data-i18n-placeholder
`;

if (!content.includes('data-i18n-title')) {
    content = content.replace('// تحديث العناصر التي تحمل data-i18n-placeholder', replacement);
    fs.writeFileSync('js/i18n.js', content, 'utf8');
    console.log('Added data-i18n-title support');
}
