const fs = require('fs');
let content = fs.readFileSync('js/i18n.js', 'utf8');

const replacement = `
        // تحديث العناصر التي تحمل data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.getValue(dict, key);
            if (val !== null) {
                if (el.children.length > 0) {
                    let textNodeFound = false;
                    for (let i = 0; i < el.childNodes.length; i++) {
                        if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim() !== '') {
                            el.childNodes[i].nodeValue = ' ' + val + ' ';
                            textNodeFound = true;
                            break;
                        }
                    }
                    if (!textNodeFound) {
                        el.appendChild(document.createTextNode(' ' + val));
                    }
                } else {
                    el.textContent = val;
                }
            }
        });
`;

content = content.replace(
    /\/\/ تحديث العناصر التي تحمل data-i18n\s+document\.querySelectorAll\('\[data-i18n\]'\)\.forEach\(el => \{[\s\S]*?el\.textContent = val;\s+\}\s+\}\);/,
    replacement.trim()
);

fs.writeFileSync('js/i18n.js', content, 'utf8');
console.log('Fixed i18n text node preservation');
