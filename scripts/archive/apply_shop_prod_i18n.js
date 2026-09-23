const fs = require('fs');

const shopReplacements = [
    ['<title>التسوق - متجر الإلكتروني</title>', '<title data-i18n="shop.meta_title">التسوق - متجر الإلكتروني</title>'],
    ['<h1>التسوق</h1>', '<h1 data-i18n="shop.title">التسوق</h1>'],
    ['>الرئيسية</a>', ' data-i18n="footer.link_home">الرئيسية</a>'],
    ['>التسوق</div>', ' data-i18n="shop.title">التسوق</div>'],
    ['<h3>فلاتر المنتجات</h3>', '<h3 data-i18n="shop.filters_title">فلاتر المنتجات</h3>'],
    ['>إعادة ضبط</button>', ' data-i18n="shop.reset_filters">إعادة ضبط</button>'],
    ['<h4>التصنيفات</h4>', '<h4 data-i18n="shop.categories_title">التصنيفات</h4>'],
    ['>الكل</span>', ' data-i18n="shop.cat_all">الكل</span>'],
    ['>إلكترونيات</span>', ' data-i18n="categories.electronics">إلكترونيات</span>'],
    ['>ملابس</span>', ' data-i18n="categories.fashion">ملابس</span>'],
    ['>كتب</span>', ' data-i18n="categories.books">كتب</span>'],
    ['<h4>أقصى سعر (دج)</h4>', '<h4 data-i18n="shop.max_price_title">أقصى سعر (دج)</h4>'],
    ['>حتى:</span>', ' data-i18n="shop.price_up_to">حتى:</span>'],
    ['<h4>التقييم</h4>', '<h4 data-i18n="shop.rating_title">التقييم</h4>'],
    ['>جميع التقييمات</span>', ' data-i18n="shop.all_ratings">جميع التقييمات</span>'],
    ['>⭐ 4.5 فما فوق (ممتاز)</span>', ' data-i18n="shop.stars_4_5">⭐ 4.5 فما فوق (ممتاز)</span>'],
    ['>⭐ 4.0 فما فوق (جيد جداً)</span>', ' data-i18n="shop.stars_4_0">⭐ 4.0 فما فوق (جيد جداً)</span>'],
    ['>⭐ 3.0 فما فوق</span>', ' data-i18n="shop.stars_3_0">⭐ 3.0 فما فوق</span>'],
    ['<h4>التوفر في المتجر</h4>', '<h4 data-i18n="shop.availability_title">التوفر في المتجر</h4>'],
    ['>المتوفر في المخزون فقط</span>', ' data-i18n="shop.in_stock_only">المتوفر في المخزون فقط</span>'],
    ['placeholder="ابحث عن منتج بالاسم..."', 'data-i18n="shop.search_placeholder" placeholder="ابحث عن منتج بالاسم..."'],
    ['>الأحدث أولاً</option>', ' data-i18n="shop.sort_newest">الأحدث أولاً</option>'],
    ['>التقييم: الأعلى تقييماً ⭐</option>', ' data-i18n="shop.sort_rating">التقييم: الأعلى تقييماً ⭐</option>'],
    ['>السعر: الأقل إلى الأعلى</option>', ' data-i18n="shop.sort_price_asc">السعر: الأقل إلى الأعلى</option>'],
    ['>السعر: الأعلى إلى الأقل</option>', ' data-i18n="shop.sort_price_desc">السعر: الأعلى إلى الأقل</option>'],
    ['>الاسم: أ-ي</option>', ' data-i18n="shop.sort_name_asc">الاسم: أ-ي</option>'],
    ['>الاسم: ي-أ</option>', ' data-i18n="shop.sort_name_desc">الاسم: ي-أ</option>'],
    ['<p>&copy; 2025 متجر الإلكتروني. جميع الحقوق محفوظة.</p>', '<p data-i18n="footer.copyright">&copy; 2025 متجر الإلكتروني. جميع الحقوق محفوظة.</p>'],
    ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"'],
    ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"'],
    ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"'],
    ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"'],
    ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"']
];

const prodReplacements = [
    ['<title>تفاصيل المنتج - متجر الإلكتروني</title>', '<title data-i18n="product.meta_title">تفاصيل المنتج - متجر الإلكتروني</title>'],
    ['<h1>تفاصيل المنتج</h1>', '<h1 data-i18n="product.page_title">تفاصيل المنتج</h1>'],
    ['>الرئيسية</a>', ' data-i18n="footer.link_home">الرئيسية</a>'],
    ['>التسوق</a>', ' data-i18n="shop.title">التسوق</a>'],
    ['>تفاصيل المنتج</span>', ' data-i18n="product.page_title">تفاصيل المنتج</span>'],
    ['alt="المنتج الرئيسي"', 'data-i18n="product.main_image_alt" alt="المنتج الرئيسي"'],
    ['<h3>اللون:</h3>', '<h3 data-i18n="product.color_label">اللون:</h3>'],
    ['<h3>المقاس:</h3>', '<h3 data-i18n="product.size_label">المقاس:</h3>'],
    ['title="أضف للمفضلة"', 'data-i18n="product.add_wishlist_title" title="أضف للمفضلة"'],
    ['<h3>الشراء السريع (الدفع عند الاستلام)</h3>', '<h3 data-i18n="product.quick_buy_title">الشراء السريع (الدفع عند الاستلام)</h3>'],
    ['>طلب مباشر</span>', ' data-i18n="product.direct_order">طلب مباشر</span>'],
    ['>الاسم الكامل</label>', ' data-i18n="checkout.full_name">الاسم الكامل</label>'],
    ['placeholder="مثال: أحمد بن علي"', 'data-i18n="product.name_placeholder" placeholder="مثال: أحمد بن علي"'],
    ['>رقم الهاتف</label>', ' data-i18n="checkout.phone">رقم الهاتف</label>'],
    ['>الولاية</label>', ' data-i18n="checkout.wilaya">الولاية</label>'],
    ['>-- اختر الولاية --</option>', ' data-i18n="product.select_wilaya">-- اختر الولاية --</option>'],
    ['>البلدية / العنوان</label>', ' data-i18n="checkout.address">البلدية / العنوان</label>'],
    ['placeholder="البلدية أو العنوان"', 'data-i18n="product.address_placeholder" placeholder="البلدية أو العنوان"'],
    ['>نوع التوصيل</label>', ' data-i18n="product.delivery_type">نوع التوصيل</label>'],
    ['>🏠 للمنزل (</span>', ' data-i18n="product.to_home">🏠 للمنزل (</span>'],
    ['>🏢 للمكتب (</span>', ' data-i18n="product.to_desk">🏢 للمكتب (</span>'],
    ['>سعر المنتجات (</span>', ' data-i18n="product.products_price">سعر المنتجات (</span>'],
    ['>تكلفة التوصيل:</span>', ' data-i18n="product.delivery_cost">تكلفة التوصيل:</span>'],
    ['>المجموع الإجمالي:</span>', ' data-i18n="product.total_price">المجموع الإجمالي:</span>'],
    ['>اضغط هنا لتأكيد الطلب الآن ⚡</button>', ' data-i18n="product.confirm_order_now">اضغط هنا لتأكيد الطلب الآن ⚡</button>'],
    ['>شحن متوفر لـ 58 ولاية</span>', ' data-i18n="product.shipping_58_wilayas">شحن متوفر لـ 58 ولاية</span>'],
    ['>الدفع نقداً عند الاستلام</span>', ' data-i18n="product.cod_available">الدفع نقداً عند الاستلام</span>'],
    ['>منتج أصلي ومضمون 100%</span>', ' data-i18n="product.authentic_guarantee">منتج أصلي ومضمون 100%</span>'],
    ['>العلامة التجارية</td>', ' data-i18n="product.brand">العلامة التجارية</td>'],
    ['>منتج معتمد</td>', ' data-i18n="product.certified_product">منتج معتمد</td>'],
    ['>الضمان</td>', ' data-i18n="product.warranty">الضمان</td>'],
    ['>ضمان الجودة ضد عيوب الصناعة</td>', ' data-i18n="product.warranty_desc">ضمان الجودة ضد عيوب الصناعة</td>'],
    ['placeholder="اكتب مراجعتك هنا..."', 'data-i18n="product.review_placeholder" placeholder="اكتب مراجعتك هنا..."'],
    ['>نوفر خدمة التوصيل السريع والآمن إلى كافة ولايات الجزائر (58 ولاية). يتم حساب سعر الشحن تلقائياً عند الدفع بناءً على الولاية المختارة ونوع التوصيل (منزلي أو مكتب استلام).</p>', ' data-i18n="product.shipping_policy">نوفر خدمة التوصيل السريع والآمن إلى كافة ولايات الجزائر (58 ولاية). يتم حساب سعر الشحن تلقائياً عند الدفع بناءً على الولاية المختارة ونوع التوصيل (منزلي أو مكتب استلام).</p>'],
    ['>المتجر الإلكتروني</div>', ' data-i18n="footer.brand">المتجر الإلكتروني</div>'],
    ['>وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.</p>', ' data-i18n="footer.description">وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.</p>'],
    ['<h3>روابط سريعة</h3>', '<h3 data-i18n="footer.quick_links">روابط سريعة</h3>'],
    ['>عربة التسوق</a>', ' data-i18n="footer.link_cart">عربة التسوق</a>'],
    ['>تتبع طلبي</a>', ' data-i18n="footer.link_track">تتبع طلبي</a>'],
    ['<h3>تواصل معنا</h3>', '<h3 data-i18n="footer.contact">تواصل معنا</h3>'],
    ['>الجزائر العاصمة، الجزائر</li>', ' data-i18n="footer.address">الجزائر العاصمة، الجزائر</li>'],
    ['<h3>طرق الدفع</h3>', '<h3 data-i18n="footer.payment_shipping">طرق الدفع</h3>'],
    ['>الدفع عند الاستلام</span>', ' data-i18n="footer.badge_cod">الدفع عند الاستلام</span>'],
    ['>&copy; 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</p>', ' data-i18n="footer.copyright">&copy; 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</p>'],
    ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"'],
    ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"'],
    ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"'],
    ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"'],
    ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"']
];

let shopHtml = fs.readFileSync('shop.html', 'utf8');
shopReplacements.forEach(r => {
    shopHtml = shopHtml.split(r[0]).join(r[1]);
});
fs.writeFileSync('shop.html', shopHtml, 'utf8');

let prodHtml = fs.readFileSync('product.html', 'utf8');
prodReplacements.forEach(r => {
    prodHtml = prodHtml.split(r[0]).join(r[1]);
});
fs.writeFileSync('product.html', prodHtml, 'utf8');
console.log('shop.html and product.html processed.');
