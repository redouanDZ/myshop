const fs = require('fs');

const fixString = (file, find, replace) => {
    let html = fs.readFileSync(file, 'utf8');
    if (html.includes(find)) {
        html = html.split(find).join(replace);
        fs.writeFileSync(file, html, 'utf8');
        console.log('Fixed ' + file);
    }
};

const currencyAlt = "' + window.I18n.t('common.currency_alt', 'د.ج') + '";
const currency = "' + window.I18n.t('common.currency', 'د.ج') + '";

const files = ['invoice.html', 'track-order.html', 'order-confirmation.html', 'product.html'];

files.forEach(f => {
    fixString(f, currencyAlt, "${window.I18n.t('common.currency_alt', 'د.ج')}");
    fixString(f, currency, "${window.I18n.t('common.currency', 'د.ج')}");
});

// Also fix invoice.error_loading
let inv = fs.readFileSync('invoice.html', 'utf8');
inv = inv.replace(/' \+ window\.I18n\.t\('invoice\.error_loading'.*?err\.message\) \+ '/g, "${window.I18n.t('invoice.error_loading', 'حدث خطأ أثناء جلب الفاتورة: {error}').replace('{error}', window.escapeHtml ? window.escapeHtml(err.message) : err.message)}");
fs.writeFileSync('invoice.html', inv, 'utf8');
console.log('Fixed invoice error loading');
