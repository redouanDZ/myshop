const fs = require('fs');

function fixFile(file, replacements) {
    let html = fs.readFileSync(file, 'utf8');
    let original = html;
    
    for (let r of replacements) {
        html = html.split(r.find).join(r.replace);
    }
    
    if (html !== original) {
        fs.writeFileSync(file, html, 'utf8');
        console.log('Fixed ' + file);
    }
}

fixFile('invoice.html', [
    {
        find: "' + window.I18n.t('common.currency', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency', 'د.ج')}"
    },
    {
        find: "' + window.I18n.t('invoice.error_loading', 'حدث خطأ أثناء جلب الفاتورة: {error}').replace('{error}', window.escapeHtml ? window.escapeHtml(err.message) : err.message) + '",
        replace: "${window.I18n.t('invoice.error_loading', 'حدث خطأ أثناء جلب الفاتورة: {error}').replace('{error}', window.escapeHtml ? window.escapeHtml(err.message) : err.message)}"
    }
]);

fixFile('track-order.html', [
    {
        find: "' + window.I18n.t('common.currency_alt', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency_alt', 'د.ج')}"
    },
    {
        find: "' + window.I18n.t('common.currency', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency', 'د.ج')}"
    }
]);

fixFile('order-confirmation.html', [
    {
        find: "' + window.I18n.t('common.currency_alt', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency_alt', 'د.ج')}"
    },
    {
        find: "' + window.I18n.t('common.currency', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency', 'د.ج')}"
    }
]);

fixFile('product.html', [
    {
        find: "' + window.I18n.t('common.currency_alt', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency_alt', 'د.ج')}"
    },
    {
        find: "' + window.I18n.t('common.currency', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency', 'د.ج')}"
    }
]);
