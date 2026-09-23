const fs = require('fs');
const cheerio = require('cheerio');

const files = [
    'index.html', 'shop.html', 'cart.html', 'checkout.html', 
    'product.html', 'account.html', 'wishlist.html', 
    'track-order.html', 'order-confirmation.html', 'invoice.html'
];

const results = [];
const arabicRegex = /[\u0600-\u06FF]/;

function processNode($, node, file) {
    if (node.type === 'text') {
        const text = node.data.trim();
        if (arabicRegex.test(text)) {
            const parent = $(node).parent();
            if (!parent.attr('data-i18n')) {
                results.push({
                    file,
                    text,
                    tag: parent.get(0).tagName,
                    type: 'text',
                    id: parent.attr('id') || '',
                    class: parent.attr('class') || ''
                });
            }
        }
    } else if (node.type === 'tag') {
        const elem = $(node);
        if (!elem.attr('data-i18n')) {
            ['placeholder', 'title', 'alt', 'aria-label'].forEach(attr => {
                const val = elem.attr(attr);
                if (val && arabicRegex.test(val)) {
                    results.push({
                        file,
                        text: val,
                        tag: node.tagName,
                        type: attr,
                        id: elem.attr('id') || '',
                        class: elem.attr('class') || ''
                    });
                }
            });
        }
        
        elem.contents().each((i, child) => {
            if (['script', 'style'].includes(child.tagName)) return;
            processNode($, child, file);
        });
    }
}

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    
    const title = $('title').text();
    if (arabicRegex.test(title) && !$('title').attr('data-i18n')) {
        results.push({ file, text: title, tag: 'title', type: 'text' });
    }
    
    $('meta[content]').each((i, el) => {
        const content = $(el).attr('content');
        if (arabicRegex.test(content) && !$(el).attr('data-i18n')) {
            results.push({ file, text: content, tag: 'meta', type: $(el).attr('name') || 'meta' });
        }
    });

    $('body').contents().each((i, el) => {
        if (['script', 'style'].includes(el.tagName)) return;
        processNode($, el, file);
    });
});

fs.writeFileSync('untranslated.json', JSON.stringify(results, null, 2));
console.log('Found ' + results.length + ' untranslated items.');
