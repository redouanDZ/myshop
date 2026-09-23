const fs = require('fs');

const cartJsFixes = [
    ["name: product.name || 'منتج'", "name: product.name || window.I18n.t('product.store_customer', 'منتج')"]
];

const checkoutJsFixes = [
    ["'<option value=\"\">-- اختر ولايتك (58 ولاية) --</option>'", "'<option value=\"\">' + window.I18n.t('checkout.select_wilaya_58', '-- اختر ولايتك (58 ولاية) --') + '</option>'"],
    ["'<option value=\"16\">16 - الجزائر العاصمة (Alger)</option>'", "'<option value=\"16\">' + window.I18n.t('wilayas.algiers_16', '16 - الجزائر العاصمة (Alger)') + '</option>'"],
    ["'<i class=\"fas fa-spinner fa-spin\"></i> جاري تأكيد وتسجيل الطلب...'", "'<i class=\"fas fa-spinner fa-spin\"></i> ' + window.I18n.t('messages.confirming_order_full', 'جاري تأكيد وتسجيل الطلب...')"],
    ["'<i class=\"fas fa-check-circle\"></i> تأكيد الطلب الآن'", "'<i class=\"fas fa-check-circle\"></i> ' + window.I18n.t('checkout.confirm_btn', 'تأكيد الطلب الآن')"]
];

function applyFixes(filename, replacements) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');
    replacements.forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(filename, content, 'utf8');
}

applyFixes('js/cart.js', cartJsFixes);
applyFixes('js/checkout.js', checkoutJsFixes);
console.log('Fixed js strings');
