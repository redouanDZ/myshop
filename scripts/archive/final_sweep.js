const fs = require('fs');

const fileReplacements = {
    'wishlist.html': [
        ['تصفح المنتجات الآن', '<span data-i18n="wishlist.empty_btn">تصفح المنتجات الآن</span>'],
        ["window.escapeHtml(p.category || 'عام') : (p.category || 'عام')", "window.escapeHtml(p.category || window.I18n.t('categories.general', 'عام')) : (p.category || window.I18n.t('categories.general', 'عام'))"],
        ['title="حذف من المفضلة"', 'data-i18n="wishlist.remove_btn" title="حذف من المفضلة"'],
        ['${Number(p.price).toLocaleString()} دج', '${Number(p.price).toLocaleString()} ${window.I18n.t("common.currency", "دج")}'],
        ["${isOutOfStock ? 'نفد المخزون' : 'أضف للسلة'}", "${isOutOfStock ? window.I18n.t('product.out_of_stock', 'نفد المخزون') : window.I18n.t('product.add_to_cart', 'أضف للسلة')}"],
        ["'تمت إضافة المنتج إلى سلة التسوق 🛒'", "window.I18n.t('messages.add_cart_success', 'تمت إضافة المنتج إلى سلة التسوق 🛒')"]
    ],
    'track-order.html': [
        ['الرئيسية', '<span data-i18n="footer.link_home">الرئيسية</span>'],
        ['التسوق', '<span data-i18n="footer.link_shop">التسوق</span>'],
        ['عربة التسوق', '<span data-i18n="footer.link_cart">عربة التسوق</span>'],
        ['المفضلة', '<span data-i18n="footer.link_wishlist">المفضلة</span>'],
        ['تتبع طلبي', '<span data-i18n="footer.link_track">تتبع طلبي</span>'],
        ['>تتبّع مسار شحنتك</h1>', '><span data-i18n="track.page_title">تتبّع مسار شحنتك</span></h1>'],
        ['أدخل رقم الطلب ورقم هاتفك للاطلاع على آخر مستجدات حالة الطلب وموعد التوصيل', '<span data-i18n="track.form_desc">أدخل رقم الطلب ورقم هاتفك للاطلاع على آخر مستجدات حالة الطلب وموعد التوصيل</span>'],
        ['رقم الطلب (Order ID / DZ-xxxx)', '<span data-i18n="track.order_id_label">رقم الطلب (Order ID / DZ-xxxx)</span>'],
        ['placeholder="مثال: DZ-2026-12345 أو 1001"', 'data-i18n="track.order_id_placeholder" placeholder="مثال: DZ-2026-12345 أو 1001"'],
        ['رقم الهاتف المسجل في الطلب', '<span data-i18n="track.phone_label">رقم الهاتف المسجل في الطلب</span>'],
        ['placeholder="مثال: 0550000000"', 'data-i18n="track.phone_placeholder" placeholder="مثال: 0550000000"'],
        ['تتبع الطلب', '<span data-i18n="track.submit_btn">تتبع الطلب</span>'],
        ['>تم استلام الطلب</div>', '><span data-i18n="track.status_pending">تم استلام الطلب</span></div>'],
        ['>قيد التجهيز والتأكيد</div>', '><span data-i18n="track.status_processing">قيد التجهيز والتأكيد</span></div>'],
        ['>تم الشحن للتوصيل</div>', '><span data-i18n="track.status_shipped">تم الشحن للتوصيل</span></div>'],
        ['>تم التسليم بنجاح</div>', '><span data-i18n="track.status_delivered">تم التسليم بنجاح</span></div>'],
        ['>رقم الطلب</span>', '><span data-i18n="account.col_order_num">رقم الطلب</span>'],
        ['>تاريخ الطلب</span>', '><span data-i18n="account.col_date">تاريخ الطلب</span>'],
        ['>الولاية والعنوان</span>', '><span data-i18n="track.wilaya_address">الولاية والعنوان</span>'],
        ['>طريقة الدفع</span>', '><span data-i18n="conf.payment_method">طريقة الدفع</span>'],
        ['>حالة الطلب</span>', '><span data-i18n="account.col_status">حالة الطلب</span>'],
        ['>المنتج</th>', '><span data-i18n="track.product">المنتج</span></th>'],
        ['>الكمية</th>', '><span data-i18n="invoice.col_qty">الكمية</span></th>'],
        ['>السعر الإجمالي</th>', '><span data-i18n="track.total_price">السعر الإجمالي</span></th>'],
        ['المبلغ الإجمالي (شامل التوصيل):', '<span data-i18n="track.grand_total">المبلغ الإجمالي (شامل التوصيل):</span>'],
        ['0 دج', '0 <span data-i18n="common.currency">دج</span>'],
        ['>فتح الفاتورة', '><span data-i18n="track.open_invoice">فتح الفاتورة</span>'],
        ['>مواصلة التسوق', '><span data-i18n="conf.continue_shopping">مواصلة التسوق</span>'],
        ["'جاري البحث...'", "window.I18n.t('track.btn_tracking', 'جاري البحث...')"],
        ["'لم نتمكن من العثور على طلب مطابق للبيانات المدخلة.'", "window.I18n.t('messages.tracking_not_found', 'لم نتمكن من العثور على طلب مطابق للبيانات المدخلة.')"],
        ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
        ["'استلام من المكتب'", "window.I18n.t('invoice.desk_pickup', 'استلام من المكتب')"],
        ["'توصيل للمنزل'", "window.I18n.t('invoice.home_delivery', 'توصيل للمنزل')"],
        ["${Number(order.total).toLocaleString()} دج", "${Number(order.total).toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["'حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.'", "window.I18n.t('messages.tracking_error_network', 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.')"],
        ["'قيد المراجعة'", "window.I18n.t('track.status_pending', 'قيد المراجعة')"],
        ["'تم الشحن مع الموزع 🚚'", "window.I18n.t('track.status_shipped_truck', 'تم الشحن مع الموزع 🚚')"],
        ["'تم التسليم بنجاح ✅'", "window.I18n.t('track.status_delivered_check', 'تم التسليم بنجاح ✅')"],
        ["'ملغي ❌'", "window.I18n.t('track.status_cancelled_cross', 'ملغي ❌')"],
        ['تسوق آمن وموثوق لـ 58 ولاية جزائرية مع متابعة دقيقة لمسار شحنتك لحظة بلحظة.', '<span data-i18n="track.footer_desc">تسوق آمن وموثوق لـ 58 ولاية جزائرية مع متابعة دقيقة لمسار شحنتك لحظة بلحظة.</span>'],
        ['>روابط هامة</h3>', '><span data-i18n="checkout.footer_links">روابط هامة</span></h3>'],
        ['>دعم الشحن والمتابعة</h3>', '><span data-i18n="track.footer_support">دعم الشحن والمتابعة</span></h3>'],
        ['توصيل سريع إلى 58 ولاية', '<span data-i18n="track.footer_fast_delivery">توصيل سريع إلى 58 ولاية</span>']
    ],
    'order-confirmation.html': [
        ['>تأكيد الطلب</h1>', '><span data-i18n="conf.page_title">تأكيد الطلب</span></h1>'],
        ['>تم تسجيل طلبك بنجاح!</h2>', '><span data-i18n="conf.success_title">تم تسجيل طلبك بنجاح!</span></h2>'],
        ['شكراً لتسوقك معنا. سنتصل بك قريباً لتأكيد تفاصيل الشحن والتوصيل.', '<span data-i18n="conf.success_desc">شكراً لتسوقك معنا. سنتصل بك قريباً لتأكيد تفاصيل الشحن والتوصيل.</span>'],
        ['>تفاصيل الطلب</h3>', '><span data-i18n="conf.order_details">تفاصيل الطلب</span></h3>'],
        ['>تاريخ الطلب:</span>', '><span data-i18n="account.col_date">تاريخ الطلب:</span>'],
        ['>حالة الطلب:</span>', '><span data-i18n="account.col_status">حالة الطلب:</span>'],
        ['>قيد المعالجة</span>', '><span data-i18n="conf.status_pending">قيد المعالجة</span>'],
        ['>المستلم:</span>', '><span data-i18n="conf.customer_name">المستلم:</span>'],
        ['>الولاية والتوصيل:</span>', '><span data-i18n="conf.delivery_address">الولاية والتوصيل:</span>'],
        ['>المنتجات المطلوبة</h4>', '><span data-i18n="conf.ordered_products">المنتجات المطلوبة</span></h4>'],
        ['>إجمالي المنتجات:</span>', '><span data-i18n="cart.total_products">إجمالي المنتجات:</span>'],
        ['>تكلفة الشحن والتوصيل:</span>', '><span data-i18n="checkout.shipping_cost">تكلفة الشحن والتوصيل:</span>'],
        ['>المبلغ الإجمالي للدفع:</span>', '><span data-i18n="checkout.total">المبلغ الإجمالي للدفع:</span>'],
        ['>تتبع مسار الشحنة', '><span data-i18n="conf.track_btn">تتبع مسار الشحنة</span>'],
        ['>عرض وطباعة الفاتورة', '><span data-i18n="account.btn_invoice">عرض وطباعة الفاتورة</span>'],
        ['>مواصلة التسوق', '><span data-i18n="conf.continue_shopping">مواصلة التسوق</span>'],
        ['>روابط هامة</h3>', '><span data-i18n="checkout.footer_links">روابط هامة</span></h3>'],
        ['ضمان الجودة والتسليم', '<span data-i18n="conf.guarantee">ضمان الجودة والتسليم</span>']
    ],
    'invoice.html': [
        ['0 دج', '0 <span data-i18n="common.currency">دج</span>'],
        ['© 2026 جميع الحقوق محفوظة.', '<span data-i18n="invoice.copyright">© 2026 جميع الحقوق محفوظة.</span>'],
        ['>العودة للمتجر</a>', '><span data-i18n="invoice.back_to_store">العودة للمتجر</span></a>'],
        ['>تتبع الطلب</a>', '><span data-i18n="invoice.track_order">تتبع الطلب</span></a>'],
        ['>طباعة / تحميل PDF</button>', '><span data-i18n="invoice.print">طباعة / تحميل PDF</span></button>'],
        ["'لم يتم تحديد رقم الطلب'", "window.I18n.t('invoice.no_order_id', 'لم يتم تحديد رقم الطلب')"]
    ]
};

Object.keys(fileReplacements).forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    fileReplacements[file].forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(file, content, 'utf8');
});

const newKeys = {
    'wishlist.remove_btn': { ar: 'حذف من المفضلة', en: 'Remove from Wishlist', fr: 'Retirer des favoris' },
    'footer.link_wishlist': { ar: 'المفضلة', en: 'Wishlist', fr: 'Favoris' },
    'track.wilaya_address': { ar: 'الولاية والعنوان', en: 'Wilaya & Address', fr: 'Wilaya & Adresse' },
    'track.product': { ar: 'المنتج', en: 'Product', fr: 'Produit' },
    'track.total_price': { ar: 'السعر الإجمالي', en: 'Total Price', fr: 'Prix Total' },
    'track.grand_total': { ar: 'المبلغ الإجمالي (شامل التوصيل):', en: 'Grand Total (Including Delivery):', fr: 'Montant Total (Livraison incluse):' },
    'track.open_invoice': { ar: 'فتح الفاتورة', en: 'Open Invoice', fr: 'Ouvrir la facture' },
    'messages.tracking_not_found': { ar: 'لم نتمكن من العثور على طلب مطابق للبيانات المدخلة.', en: 'We could not find an order matching the provided details.', fr: 'Nous n\'avons pas pu trouver de commande correspondant aux détails fournis.' },
    'messages.tracking_error_network': { ar: 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.', en: 'Network error occurred, please try again.', fr: 'Erreur réseau, veuillez réessayer.' },
    'track.status_shipped_truck': { ar: 'تم الشحن مع الموزع 🚚', en: 'Shipped with Delivery Agent 🚚', fr: 'Expédié avec le livreur 🚚' },
    'track.status_delivered_check': { ar: 'تم التسليم بنجاح ✅', en: 'Delivered Successfully ✅', fr: 'Livré avec succès ✅' },
    'track.status_cancelled_cross': { ar: 'ملغي ❌', en: 'Cancelled ❌', fr: 'Annulé ❌' },
    'track.footer_desc': { ar: 'تسوق آمن وموثوق لـ 58 ولاية جزائرية مع متابعة دقيقة لمسار شحنتك لحظة بلحظة.', en: 'Secure and reliable shopping for 58 Algerian wilayas with precise step-by-step shipment tracking.', fr: 'Achats sécurisés et fiables pour les 58 wilayas algériennes avec suivi précis de votre expédition étape par étape.' },
    'track.footer_support': { ar: 'دعم الشحن والمتابعة', en: 'Shipping & Tracking Support', fr: 'Support d\'expédition et de suivi' },
    'track.footer_fast_delivery': { ar: 'توصيل سريع إلى 58 ولاية', en: 'Fast delivery to 58 wilayas', fr: 'Livraison rapide vers 58 wilayas' },
    'conf.page_title': { ar: 'تأكيد الطلب', en: 'Order Confirmation', fr: 'Confirmation de commande' },
    'conf.ordered_products': { ar: 'المنتجات المطلوبة', en: 'Ordered Products', fr: 'Produits commandés' }
};

['ar', 'en', 'fr'].forEach(lang => {
    const file = `locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    Object.keys(newKeys).forEach(keyPath => {
        const parts = keyPath.split('.');
        let curr = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = newKeys[keyPath][lang];
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('Final sweep done!');
