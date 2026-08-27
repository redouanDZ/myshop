const fs = require('fs');

const extraCartHtmlReplacements = [
    ['تصفح متجر المنتجات', '<span data-i18n="cart.browse_shop">تصفح متجر المنتجات</span>'],
    ['© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', '<span data-i18n="footer.copyright">© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</span>'],
    ["item.name || 'منتج'", "item.name || window.I18n.t('product.store_customer', 'منتج')"],
    ["item.category || 'إلكترونيات'", "item.category || window.I18n.t('categories.electronics', 'إلكترونيات')"],
    ["item.category || 'عام'", "item.category || window.I18n.t('categories.general', 'عام')"],
    ["${Number(item.price).toLocaleString()} دج", "${Number(item.price).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}"],
    ["${(Number(item.price) * Number(item.quantity)).toLocaleString()} دج", "${(Number(item.price) * Number(item.quantity)).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}"],
    ["title=\"إزالة المنتج\"", "data-i18n=\"cart.remove_item\" title=\"إزالة المنتج\""],
    ["+ ' دج'", "+ ' ' + window.I18n.t('common.currency', 'دج')"],
    ["المجموع الفرعي", "<span data-i18n=\"checkout.subtotal\">المجموع الفرعي</span>"],
    ["${subtotal.toLocaleString()} دج", "${subtotal.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}"],
    ["مصاريف الشحن", "<span data-i18n=\"checkout.shipping_cost\">مصاريف الشحن</span>"],
    ["تُحسب حسب الولاية عند الدفع", "<span data-i18n=\"cart.shipping_calc\">تُحسب حسب الولاية عند الدفع</span>"],
    ["الخصم", "<span data-i18n=\"checkout.discount\">الخصم</span>"],
    ["-${discount.toLocaleString()} دج", "-${discount.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}"],
    ["المجموع (قبل الشحن)", "<span data-i18n=\"cart.total_pre_shipping\">المجموع (قبل الشحن)</span>"],
    ["${estimatedTotal.toLocaleString()} دج", "${estimatedTotal.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}"],
    ["* سيتم احتساب تكلفة التوصيل الدقيقة (400 - 900 دج) وإضافتها للإجمالي النهائي بعد اختيار ولايتك في صفحة الدفع.", "<span data-i18n=\"cart.shipping_note\">* سيتم احتساب تكلفة التوصيل الدقيقة (400 - 900 دج) وإضافتها للإجمالي النهائي بعد اختيار ولايتك في صفحة الدفع.</span>"],
    ["placeholder=\"رمز الخصم (مثال: SAVE10)\"", "data-i18n=\"cart.promo_placeholder\" placeholder=\"رمز الخصم (مثال: SAVE10)\""],
    [">تطبيق</button>", "><span data-i18n=\"cart.apply_promo\">تطبيق</span></button>"],
    ["متابعة إلى الدفع", "<span data-i18n=\"cart.checkout_btn\">متابعة إلى الدفع</span>"],
    [">متابعة التسوق</a>", "><span data-i18n=\"cart.continue_shopping\">متابعة التسوق</span></a>"],
    ["'تم تطبيق الخصم بنجاح! 🎉'", "window.I18n.t('messages.promo_success', 'تم تطبيق الخصم بنجاح! 🎉')"],
    ["'تم تطبيق خصم 10% بنجاح! 🎉'", "window.I18n.t('messages.promo_success_10', 'تم تطبيق خصم 10% بنجاح! 🎉')"],
    ["'تم تطبيق خصم 20% بنجاح! 🎉'", "window.I18n.t('messages.promo_success_20', 'تم تطبيق خصم 20% بنجاح! 🎉')"],
    ["'رمز الخصم غير صالح'", "window.I18n.t('messages.promo_invalid', 'رمز الخصم غير صالح')"],
    ["'عربة التسوق فارغة'", "window.I18n.t('messages.cart_empty', 'عربة التسوق فارغة')"]
];

const extraCheckoutHtmlReplacements = [
    ["التالي: اختيار طريقة الدفع", "<span data-i18n=\"checkout.next_payment\">التالي: اختيار طريقة الدفع</span>"],
    ["السابق: معلومات الشحن", "<span data-i18n=\"checkout.prev_shipping\">السابق: معلومات الشحن</span>"],
    ["التالي: مراجعة الطلب", "<span data-i18n=\"checkout.next_review\">التالي: مراجعة الطلب</span>"],
    ["السابق: طريقة الدفع", "<span data-i18n=\"checkout.prev_payment\">السابق: طريقة الدفع</span>"],
    ["تأكيد الطلب الآن", "<span data-i18n=\"checkout.confirm_btn\">تأكيد الطلب الآن</span>"],
    ["حماية تامة للبيانات والطلبات", "<span data-i18n=\"checkout.footer_protection\">حماية تامة للبيانات والطلبات</span>"]
];

function processFile(filename, replacements) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');
    replacements.forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(filename, content, 'utf8');
}

processFile('cart.html', extraCartHtmlReplacements);
processFile('checkout.html', extraCheckoutHtmlReplacements);

const localesKeys = {
    'cart.remove_item': { ar: 'إزالة المنتج', en: 'Remove Product', fr: 'Retirer le produit' },
    'cart.shipping_calc': { ar: 'تُحسب حسب الولاية عند الدفع', en: 'Calculated by Wilaya at checkout', fr: 'Calculé par Wilaya à la caisse' },
    'cart.total_pre_shipping': { ar: 'المجموع (قبل الشحن)', en: 'Total (Before Shipping)', fr: 'Total (Avant expédition)' },
    'cart.shipping_note': { ar: '* سيتم احتساب تكلفة التوصيل الدقيقة (400 - 900 دج) وإضافتها للإجمالي النهائي بعد اختيار ولايتك في صفحة الدفع.', en: '* Exact delivery cost (400 - 900 DZD) will be calculated and added to final total after selecting your Wilaya at checkout.', fr: '* Le coût exact de livraison (400 - 900 DA) sera calculé et ajouté au total final après avoir sélectionné votre Wilaya à la caisse.' },
    'messages.promo_success_10': { ar: 'تم تطبيق خصم 10% بنجاح! 🎉', en: '10% discount applied successfully! 🎉', fr: 'Réduction de 10% appliquée avec succès ! 🎉' },
    'messages.promo_success_20': { ar: 'تم تطبيق خصم 20% بنجاح! 🎉', en: '20% discount applied successfully! 🎉', fr: 'Réduction de 20% appliquée avec succès ! 🎉' }
};

['ar', 'en', 'fr'].forEach(lang => {
    const file = `locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    Object.keys(localesKeys).forEach(keyPath => {
        const parts = keyPath.split('.');
        let curr = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = localesKeys[keyPath][lang];
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
});
console.log('Swept up remaining strings');
