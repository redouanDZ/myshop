const fs = require('fs');

const shopReplacements = [
    ['> فلاتر المنتجات</h3>', '> <span data-i18n="shop.filters_title">فلاتر المنتجات</span></h3>'],
    ['> إعادة ضبط</button>', '> <span data-i18n="shop.reset_filters">إعادة ضبط</span></button>'],
    ['> التصنيفات</h4>', '> <span data-i18n="shop.categories_title">التصنيفات</span></h4>'],
    ['> أقصى سعر (دج)</h4>', '> <span data-i18n="shop.max_price_title">أقصى سعر (دج)</span></h4>'],
    ['<span>0 دج</span>', '<span>0 <span data-i18n="common.currency">دج</span></span>'],
    ['200,000 دج', '200,000 <span data-i18n="common.currency">دج</span>'],
    ['> التقييم</h4>', '> <span data-i18n="shop.rating_title">التقييم</span></h4>'],
    ['> التوفر في المتجر</h4>', '> <span data-i18n="shop.availability_title">التوفر في المتجر</span></h4>'],
    ["'خطأ في جلب المنتجات'", "window.I18n.t('messages.fetch_products_error', 'خطأ في جلب المنتجات')"],
    ["'حدث خطأ في تحميل المنتجات. يرجى المحاولة لاحقاً.'", "window.I18n.t('messages.load_products_error', 'حدث خطأ في تحميل المنتجات. يرجى المحاولة لاحقاً.')"],
    ["+ ' دج'", "+ ' ' + window.I18n.t('common.currency', 'دج')"],
    ["`عُثر على (${filteredProducts.length}) منتج`", "window.I18n.t('shop.products_found', 'عُثر على ({count}) منتج').replace('{count}', filteredProducts.length)"],
    ["لم نجد منتجات مطابقة لخيارات البحث", "<span data-i18n=\"shop.empty_title\">لم نجد منتجات مطابقة لخيارات البحث</span>"],
    ["جرب استخدام كلمات بحث مختلفة أو قم بتوسيع نطاق السعر والتصنيفات المختارة.", "<span data-i18n=\"shop.empty_desc\">جرب استخدام كلمات بحث مختلفة أو قم بتوسيع نطاق السعر والتصنيفات المختارة.</span>"],
    ["> إعادة تعيين الفلاتر", "> <span data-i18n=\"shop.reset_filters_btn\">إعادة تعيين الفلاتر</span>"],
    ["product.category || 'عام'", "window.I18n.t('categories.general', 'عام')"],
    ["aria-label=\"المفضلة\"", "data-i18n=\"common.wishlist\" aria-label=\"المفضلة\""],
    ["<small style=\"font-size: 0.85rem; font-weight: 600;\">دج</small>", "<small style=\"font-size: 0.85rem; font-weight: 600;\" data-i18n=\"common.currency\">دج</small>"],
    ["`متوفر (${stockNum})`", "window.I18n.t('product.in_stock_count', 'متوفر ({count})').replace('{count}', stockNum)"],
    ["'نفد المخزون'", "window.I18n.t('product.out_of_stock', 'نفد المخزون')"],
    [">التفاصيل</a>", " data-i18n=\"product.details\">التفاصيل</a>"],
    ["</i> أضف للسلة", "</i> <span data-i18n=\"product.add_to_cart\">أضف للسلة</span>"],
    ["> السابق", " data-i18n=\"shop.prev_page\"> السابق"],
    ["التالي <i", "<span data-i18n=\"shop.next_page\">التالي</span> <i"],
    ["'تعذر العثور على بيانات المنتج'", "window.I18n.t('messages.product_not_found', 'تعذر العثور على بيانات المنتج')"],
    ["`تمت إضافة \"${product.name}\" إلى سلة التسوق 🛒`", "window.I18n.t('messages.add_cart_success_name', 'تمت إضافة \"{name}\" إلى سلة التسوق 🛒').replace('{name}', product.name)"],
    ["'حدث خطأ أثناء إضافة المنتج إلى السلة'", "window.I18n.t('messages.add_cart_error', 'حدث خطأ أثناء إضافة المنتج إلى السلة')"]
];

const prodReplacements = [
    ["> الشراء السريع (الدفع عند الاستلام)", "> <span data-i18n=\"product.quick_buy_title\">الشراء السريع (الدفع عند الاستلام)</span>"],
    ["> طلب مباشر", "> <span data-i18n=\"product.direct_order\">طلب مباشر</span>"],
    ["الاسم الكامل <span", "<span data-i18n=\"checkout.full_name\">الاسم الكامل</span> <span"],
    ["رقم الهاتف <span", "<span data-i18n=\"checkout.phone\">رقم الهاتف</span> <span"],
    ["الولاية <span", "<span data-i18n=\"checkout.wilaya\">الولاية</span> <span"],
    ["500 دج", "500 <span data-i18n=\"common.currency\">دج</span>"],
    ["350 دج", "350 <span data-i18n=\"common.currency\">دج</span>"],
    ["0 دج", "0 <span data-i18n=\"common.currency\">دج</span>"],
    ["> اضغط هنا لتأكيد الطلب الآن ⚡", "> <span data-i18n=\"product.confirm_order_now\">اضغط هنا لتأكيد الطلب الآن ⚡</span>"],
    ["المتجر الإلكتروني", "<span data-i18n=\"footer.brand\">المتجر الإلكتروني</span>"],
    ["وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.", "<span data-i18n=\"footer.description\">وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.</span>"],
    ["الجزائر العاصمة، الجزائر", "<span data-i18n=\"footer.address\">الجزائر العاصمة، الجزائر</span>"],
    ["الدفع عند الاستلام", "<span data-i18n=\"features.cod_title\">الدفع عند الاستلام</span>"],
    ["'خطأ في جلب المنتج'", "window.I18n.t('messages.fetch_product_error', 'خطأ في جلب المنتج')"],
    ["`${Number(currentProduct.price).toLocaleString()} دج`", "`${Number(currentProduct.price).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["'وصف غير متوفر'", "window.I18n.t('product.no_description', 'وصف غير متوفر')"],
    ["`${currentProduct.name} - المتجر الإلكتروني`", "`${currentProduct.name} - ${window.I18n.t('footer.brand', 'المتجر الإلكتروني')}`"],
    ["'نفد المخزون حالياً'", "window.I18n.t('product.out_of_stock_now', 'نفد المخزون حالياً')"],
    ["`⚠️ سارع بالطلب! متبقي ${stockNum} قطع فقط في المخزون`", "window.I18n.t('product.hurry_stock', '⚠️ سارع بالطلب! متبقي {count} قطع فقط في المخزون').replace('{count}', stockNum)"],
    ["`صورة ${index + 1}`", "window.I18n.t('product.image_alt', 'صورة {index}').replace('{index}', index + 1)"],
    ["'خطأ في تحميل المنتج'", "window.I18n.t('messages.load_product_error', 'خطأ في تحميل المنتج')"],
    ["'<p style=\"color:#64748b; padding:15px;\">لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيّم هذا المنتج!</p>'", "'<p style=\"color:#64748b; padding:15px;\">' + window.I18n.t('product.no_reviews_yet', 'لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيّم هذا المنتج!') + '</p>'"],
    ["'عميل المتجر'", "window.I18n.t('product.store_customer', 'عميل المتجر')"],
    ["الخيارات المتاحة (المقاس / اللون / السعة):", "<span data-i18n=\"product.available_options\">الخيارات المتاحة (المقاس / اللون / السعة):</span>"],
    ["`${v.name} ${v.priceModifier ? \\`(+\\${v.priceModifier} دج)\\` : ''}`", "`${v.name} ${v.priceModifier ? \\`(+\\${v.priceModifier} \\${window.I18n.t('common.currency', 'دج')})\\` : ''}`"],
    ["`${unitPrice.toLocaleString()} دج`", "`${unitPrice.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["['أسود', 'أبيض', 'أزرق']", "[window.I18n.t('colors.black', 'أسود'), window.I18n.t('colors.white', 'أبيض'), window.I18n.t('colors.blue', 'أزرق')]"],
    ["'أسود'", "window.I18n.t('colors.black', 'أسود')"],
    ["'تمت إضافة المنتج إلى السلة بنجاح! 🛒'", "window.I18n.t('messages.add_cart_success', 'تمت إضافة المنتج إلى السلة بنجاح! 🛒')"],
    ["'حدث خطأ أثناء إضافة المنتج'", "window.I18n.t('messages.add_cart_error', 'حدث خطأ أثناء إضافة المنتج')"],
    ["'تمت إضافة المنتج إلى قائمة الرغبات'", "window.I18n.t('messages.add_wishlist_success', 'تمت إضافة المنتج إلى قائمة الرغبات')"],
    ["'يرجى اختيار التقييم بالنجوم وكتابة تعليقك'", "window.I18n.t('messages.review_validation', 'يرجى اختيار التقييم بالنجوم وكتابة تعليقك')"],
    ["'<i class=\"fas fa-spinner fa-spin\"></i> جاري الإرسال...'", "'<i class=\"fas fa-spinner fa-spin\"></i> ' + window.I18n.t('common.sending', 'جاري الإرسال...')"],
    ["'يرجى تسجيل الدخول أولاً لإضافة تقييمك ⭐'", "window.I18n.t('messages.login_to_review', 'يرجى تسجيل الدخول أولاً لإضافة تقييمك ⭐')"],
    ["'يرجى تسجيل الدخول أولاً لإضافة تقييمك'", "window.I18n.t('messages.login_to_review_alt', 'يرجى تسجيل الدخول أولاً لإضافة تقييمك')"],
    ["'فشل إرسال التقييم'", "window.I18n.t('messages.submit_review_fail', 'فشل إرسال التقييم')"],
    ["'تمت إضافة تقييمك بنجاح! ⭐'", "window.I18n.t('messages.submit_review_success', 'تمت إضافة تقييمك بنجاح! ⭐')"],
    ["'إرسال التقييم'", "window.I18n.t('product.submit_review', 'إرسال التقييم')"],
    ["'خطأ في جلب المنتجات'", "window.I18n.t('messages.fetch_products_error', 'خطأ في جلب المنتجات')"],
    ["'<p style=\"color: #64748b; padding: 15px;\">لا توجد منتجات مشابهة حالياً</p>'", "'<p style=\"color: #64748b; padding: 15px;\">' + window.I18n.t('product.no_similar_products', 'لا توجد منتجات مشابهة حالياً') + '</p>'"],
    ["<p class=\"price\">${Number(p.price).toLocaleString()} دج</p>", "<p class=\"price\">${Number(p.price).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}</p>"],
    ["عرض التفاصيل", "<span data-i18n=\"product.view_details\">عرض التفاصيل</span>"],
    ["'<p style=\"color: #64748b; padding: 15px;\">لا توجد منتجات مشابهة</p>'", "'<p style=\"color: #64748b; padding: 15px;\">' + window.I18n.t('product.no_similar_products_alt', 'لا توجد منتجات مشابهة') + '</p>'"],
    ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
    ["'وهران'", "window.I18n.t('wilayas.oran', 'وهران')"],
    ["'قسنطينة'", "window.I18n.t('wilayas.constantine', 'قسنطينة')"],
    ["'سطيف'", "window.I18n.t('wilayas.setif', 'سطيف')"],
    ["'البليدة'", "window.I18n.t('wilayas.blida', 'البليدة')"],
    ["`${Number(selectedOpt.dataset.home).toLocaleString()} دج`", "`${Number(selectedOpt.dataset.home).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${Number(selectedOpt.dataset.desk).toLocaleString()} دج`", "`${Number(selectedOpt.dataset.desk).toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${subtotal.toLocaleString()} دج`", "`${subtotal.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${shipping.toLocaleString()} دج`", "`${shipping.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${total.toLocaleString()} دج`", "`${total.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
    ["'يرجى إدخال الاسم الكامل'", "window.I18n.t('messages.enter_full_name', 'يرجى إدخال الاسم الكامل')"],
    ["'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456 أو 0666123456 أو 0777123456)'", "window.I18n.t('messages.enter_valid_phone', 'يرجى إدخال رقم هاتف جزائري صحيح')"],
    ["'يرجى اختيار الولاية'", "window.I18n.t('messages.select_wilaya', 'يرجى اختيار الولاية')"],
    ["'<i class=\"fas fa-spinner fa-spin\"></i> جاري تأكيد طلبك...'", "'<i class=\"fas fa-spinner fa-spin\"></i> ' + window.I18n.t('messages.confirming_order', 'جاري تأكيد طلبك...')"],
    ["'تعذر تأكيد الطلب، يرجى المحاولة لاحقاً'", "window.I18n.t('messages.order_confirm_fail', 'تعذر تأكيد الطلب، يرجى المحاولة لاحقاً')"],
    ["'حدث خطأ أثناء تأكيد الطلب'", "window.I18n.t('messages.order_error', 'حدث خطأ أثناء تأكيد الطلب')"],
    ["'<i class=\"fas fa-check-circle\"></i> اضغط هنا لتأكيد الطلب الآن ⚡'", "'<i class=\"fas fa-check-circle\"></i> ' + window.I18n.t('product.confirm_order_now', 'اضغط هنا لتأكيد الطلب الآن ⚡')"]
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

console.log('Replaced all logical strings in shop.html and product.html');
