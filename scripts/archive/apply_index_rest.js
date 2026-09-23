const fs = require('fs');

const replacements = [
    ['<meta name="twitter:title" content="متجري - متجر الإلكترونيات العصرية">', '<meta name="twitter:title" data-i18n="home.meta.twitter_title" content="متجري - متجر الإلكترونيات العصرية">'],
    ['<meta name="twitter:description" content="تسوق أحدث الحواسيب والملحقات التقنية بأفضل الأسعار.">', '<meta name="twitter:description" data-i18n="home.meta.twitter_desc" content="تسوق أحدث الحواسيب والملحقات التقنية بأفضل الأسعار.">'],
    ['"name": "متجري"', '"name": "MyShop"'],
    ['"description": "متجر إلكتروني متكامل للإلكترونيات والأجهزة الحديثة"', '"description": "Complete E-Store for electronics and modern devices"'],
    ['عرض كل المنتجات <i class="fas fa-chevron-left"', '<span data-i18n="home.view_all">عرض كل المنتجات</span> <i class="fas fa-chevron-left"'],
    ['اكتشف جميع العروض <i class="fas fa-chevron-left"', '<span data-i18n="home.discover_offers">اكتشف جميع العروض</span> <i class="fas fa-chevron-left"'],
    ['وجهتك الأولى الموثوقة للتسوق الإلكتروني في الجزائر. نقدم منتجات تقنية أصلية بأفضل الأسعار مع توصيل سريع لـ 58 ولاية ودفع آمن عند الاستلام.', '<span data-i18n="footer.description">وجهتك الأولى الموثوقة للتسوق الإلكتروني في الجزائر. نقدم منتجات تقنية أصلية بأفضل الأسعار مع توصيل سريع لـ 58 ولاية ودفع آمن عند الاستلام.</span>'],
    ['> الرئيسية</a>', '> <span data-i18n="footer.link_home">الرئيسية</span></a>'],
    ['&copy; 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', '<span data-i18n="footer.copyright">&copy; 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</span>'],
    ["p.category || 'عام'", "window.I18n.t('categories.general', 'عام')"],
    ["p.category || 'عام')", "window.I18n.t('categories.general', 'عام'))"],
    ["aria-label=\"المفضلة\"", "data-i18n=\"common.wishlist\" aria-label=\"المفضلة\""],
    ["<small style=\"font-size: 0.85rem; font-weight: 600;\">دج</small>", "<small style=\"font-size: 0.85rem; font-weight: 600;\" data-i18n=\"common.currency\">دج</small>"],
    ["<small style=\"font-size: 0.85rem;\">دج</small>", "<small style=\"font-size: 0.85rem;\" data-i18n=\"common.currency\">دج</small>"],
    ["} دج</span>", "} <span data-i18n=\"common.currency\">دج</span></span>"],
    ["`متوفر (${p.stock})`", "window.I18n.t('product.in_stock_count', 'متوفر ({count})').replace('{count}', p.stock)"],
    ["'نفد المخزون'", "window.I18n.t('product.out_of_stock', 'نفد المخزون')"],
    [">التفاصيل</a>", " data-i18n=\"product.details\">التفاصيل</a>"],
    ["</i> أضف للسلة", "</i> <span data-i18n=\"product.add_to_cart\">أضف للسلة</span>"],
    ["p.category || 'عرض حصري'", "window.I18n.t('categories.exclusive_offer', 'عرض حصري')"],
    ["تخفيض خاص 🔥", "<span data-i18n=\"home.special_discount\">تخفيض خاص 🔥</span>"],
    ["</i> اطلب الآن بالعرض", "</i> <span data-i18n=\"product.order_now_offer\">اطلب الآن بالعرض</span>"],
    ["'تمت إضافة المنتج إلى السلة بنجاح! 🛒'", "window.I18n.t('messages.add_cart_success', 'تمت إضافة المنتج إلى السلة بنجاح! 🛒')"],
    ["'حدث خطأ أثناء إضافة المنتج'", "window.I18n.t('messages.add_cart_error', 'حدث خطأ أثناء إضافة المنتج')"],
];

let html = fs.readFileSync('index.html', 'utf8');
let c = 0;
replacements.forEach(r => {
    if (html.includes(r[0])) {
        // replace all occurrences
        html = html.split(r[0]).join(r[1]);
        c++;
    } else {
        console.log("NOT FOUND: " + r[0]);
    }
});
fs.writeFileSync('index.html', html, 'utf8');
console.log('Replaced ' + c + ' strings in index.html');
