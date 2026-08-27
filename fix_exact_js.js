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

fixFile('account.html', [
    {
        find: "' + window.I18n.t('account.order_id', 'طلب #{id}').replace('{id}', ord.id) + '",
        replace: "${window.I18n.t('account.order_id', 'طلب #{id}').replace('{id}', ord.id)}"
    },
    {
        find: "' + window.I18n.t('common.currency_alt', 'د.ج') + '",
        replace: "${window.I18n.t('common.currency_alt', 'د.ج')}"
    },
    {
        find: "' + window.I18n.t('account.view_details', 'عرض التفاصيل') + '",
        replace: "${window.I18n.t('account.view_details', 'عرض التفاصيل')}"
    }
]);

fixFile('wishlist.html', [
    {
        find: "' + window.I18n.t('wishlist.products_count', 'منتجات') + '",
        replace: "${window.I18n.t('wishlist.products_count', 'منتجات')}"
    },
    {
        find: "' + window.I18n.t('wishlist.empty_msg_alt', 'لم تقم بإضافة أي منتجات إلى قائمة الرغبات الخاصة بك بعد. استكشف متجرنا واعثر على ما تحب!') + '",
        replace: "${window.I18n.t('wishlist.empty_msg_alt', 'لم تقم بإضافة أي منتجات إلى قائمة الرغبات الخاصة بك بعد. استكشف متجرنا واعثر على ما تحب!')}"
    }
]);

// Are there any others? Let's fix shop.html, cart.html etc just in case!
// Let's use regex that finds all "' + window.I18n.t(...) + '" inside template literals.
// If it's inside ` ` then the nearest quote before it is NOT a single quote.

