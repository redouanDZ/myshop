const fs = require('fs');

const cartReplacements = [
    ['<title>عربة التسوق - متجر الإلكتروني</title>', '<title data-i18n="cart.meta_title">عربة التسوق - متجر الإلكتروني</title>'],
    ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"'],
    ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"'],
    ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"'],
    ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"'],
    ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"'],
    ['>المنتجات المضافة</h2>', '><span data-i18n="cart.added_products">المنتجات المضافة</span></h2>'],
    ['المتجر الإلكتروني', '<span data-i18n="footer.brand">المتجر الإلكتروني</span>'],
    ['وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.', '<span data-i18n="footer.description">وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.</span>'],
    ['الجزائر العاصمة، الجزائر', '<span data-i18n="footer.address">الجزائر العاصمة، الجزائر</span>'],
    ['الدفع عند الاستلام', '<span data-i18n="features.cod_title">الدفع عند الاستلام</span>'],
    ['>عربة التسوق فارغة حالياً</h3>', '><span data-i18n="cart.empty_title">عربة التسوق فارغة حالياً</span></h3>'],
    ['>لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف تشكيلتنا الواسعة وابدأ التسوق الآن.</p>', '><span data-i18n="cart.empty_desc">لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف تشكيلتنا الواسعة وابدأ التسوق الآن.</span></p>'],
    ['>تصفح متجر المنتجات</a>', '><span data-i18n="cart.browse_shop">تصفح متجر المنتجات</span></a>'],
    ['<h3>روابط سريعة</h3>', '<h3 data-i18n="footer.quick_links">روابط سريعة</h3>'],
    ['>الرئيسية</a>', '><span data-i18n="footer.link_home">الرئيسية</span></a>'],
    ['>التسوق</a>', '><span data-i18n="footer.link_shop">التسوق</span></a>'],
    ['>عربة التسوق</a>', '><span data-i18n="footer.link_cart">عربة التسوق</span></a>'],
    ['>تتبع طلبي</a>', '><span data-i18n="footer.link_track">تتبع طلبي</span></a>'],
    ['<h3>تواصل معنا</h3>', '<h3 data-i18n="footer.contact">تواصل معنا</h3>'],
    ['<h3>طرق الدفع</h3>', '<h3 data-i18n="footer.payment_shipping">طرق الدفع</h3>'],
    ['© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', '<span data-i18n="footer.copyright">© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</span>']
];

const checkoutReplacements = [
    ['<title>إتمام الطلب والدفع - المتجر الإلكتروني</title>', '<title data-i18n="checkout.meta_title">إتمام الطلب والدفع - المتجر الإلكتروني</title>'],
    ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"'],
    ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"'],
    ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"'],
    ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"'],
    ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"'],
    ['>معلومات الشحن والتوصيل</h2>', '><span data-i18n="checkout.shipping_info">معلومات الشحن والتوصيل</span></h2>'],
    ['الاسم الكامل', '<span data-i18n="checkout.full_name">الاسم الكامل</span>'],
    ['placeholder="أدخل اسمك الكامل"', 'data-i18n="checkout.name_placeholder" placeholder="أدخل اسمك الكامل"'],
    ['رقم الهاتف (الجزائر)', '<span data-i18n="checkout.phone_label">رقم الهاتف (الجزائر)</span>'],
    ['placeholder="مثال: 0550123456 أو 0660123456"', 'data-i18n="checkout.phone_placeholder" placeholder="مثال: 0550123456 أو 0660123456"'],
    ['البريد الإلكتروني (اختياري لاستلام الفاتورة)', '<span data-i18n="checkout.email_label">البريد الإلكتروني (اختياري لاستلام الفاتورة)</span>'],
    ['الولاية (58 ولاية)', '<span data-i18n="checkout.wilaya_label">الولاية (58 ولاية)</span>'],
    ['>جاري تحميل الولايات...</option>', '><span data-i18n="checkout.wilaya_loading">جاري تحميل الولايات...</span></option>'],
    ['العنوان الكامل / البلدية', '<span data-i18n="checkout.address_label">العنوان الكامل / البلدية</span>'],
    ['placeholder="البلدية، اسم الشارع، رقم العمارة أو المنزل..."', 'data-i18n="checkout.address_placeholder" placeholder="البلدية، اسم الشارع، رقم العمارة أو المنزل..."'],
    ['نوع التوصيل المفضل:', '<span data-i18n="checkout.delivery_type_label">نوع التوصيل المفضل:</span>'],
    ['توصيل للمنزل (Home Delivery)', '<span data-i18n="checkout.home_delivery">توصيل للمنزل (Home Delivery)</span>'],
    ['>السعر: حسب الولاية</span>', '><span data-i18n="checkout.home_delivery_price">السعر: حسب الولاية</span>'],
    ['استلام من المكتب (Stop Desk)', '<span data-i18n="checkout.desk_delivery">استلام من المكتب (Stop Desk)</span>'],
    ['>السعر: خيار اقتصادي</span>', '><span data-i18n="checkout.desk_delivery_price">السعر: خيار اقتصادي</span>'],
    ['ملاحظات خاصة بالموزع (اختياري)', '<span data-i18n="checkout.notes_label">ملاحظات خاصة بالموزع (اختياري)</span>'],
    ['placeholder="أوقات التواجد المفضلة، تفاصيل إضافية..."', 'data-i18n="checkout.notes_placeholder" placeholder="أوقات التواجد المفضلة، تفاصيل إضافية..."'],
    ['>التالي: اختيار طريقة الدفع</button>', '><span data-i18n="checkout.next_payment">التالي: اختيار طريقة الدفع</span></button>'],
    ['>طريقة الدفع</h2>', '><span data-i18n="checkout.payment_method">طريقة الدفع</span></h2>'],
    ['الدفع عند الاستلام (COD)', '<span data-i18n="checkout.cod_title">الدفع عند الاستلام (COD)</span>'],
    ['>الأكثر استخداماً</span>', '><span data-i18n="checkout.most_used">الأكثر استخداماً</span>'],
    ['>ادفع نقداً ومباشرة عند استلام الطلب من موزع شركة التوصيل.</p>', '><span data-i18n="checkout.cod_desc">ادفع نقداً ومباشرة عند استلام الطلب من موزع شركة التوصيل.</span></p>'],
    ['الدفع الإلكتروني (البطاقة الذهبية / CIB)', '<span data-i18n="checkout.epay_title">الدفع الإلكتروني (البطاقة الذهبية / CIB)</span>'],
    ['>دفع فوري وآمن عبر بوابة الدفع الإلكتروني الجزائرية الرسمية.</p>', '><span data-i18n="checkout.epay_desc">دفع فوري وآمن عبر بوابة الدفع الإلكتروني الجزائرية الرسمية.</span></p>'],
    ['تحويل بريدي / بنكي (CCP / BaridiMob)', '<span data-i18n="checkout.ccp_title">تحويل بريدي / بنكي (CCP / BaridiMob)</span>'],
    ['>إرسال المبلغ إلى الحساب البريدي وتأكيد الطلب بإرسال الوصل.</p>', '><span data-i18n="checkout.ccp_desc">إرسال المبلغ إلى الحساب البريدي وتأكيد الطلب بإرسال الوصل.</span></p>'],
    ['>معلومات الحساب البريدي (CCP / BaridiMob)</h3>', '><span data-i18n="checkout.ccp_info_title">معلومات الحساب البريدي (CCP / BaridiMob)</span></h3>'],
    ['>يرجى تحويل إجمالي الطلب إلى الحساب التالي وإرسال صورة الوصل عبر واتساب أو البريد:</p>', '><span data-i18n="checkout.ccp_info_desc">يرجى تحويل إجمالي الطلب إلى الحساب التالي وإرسال صورة الوصل عبر واتساب أو البريد:</span></p>'],
    ['رقم الحساب البريدي (CCP):', '<span data-i18n="checkout.ccp_account_number">رقم الحساب البريدي (CCP):</span>'],
    ['المفتاح', '<span data-i18n="checkout.ccp_key">المفتاح</span>'],
    ['الاسم:', '<span data-i18n="checkout.ccp_name">الاسم:</span>'],
    ['المتجر الإلكتروني', '<span data-i18n="footer.brand">المتجر الإلكتروني</span>'],
    ['>السابق: معلومات الشحن</button>', '><span data-i18n="checkout.prev_shipping">السابق: معلومات الشحن</span></button>'],
    ['>التالي: مراجعة الطلب</button>', '><span data-i18n="checkout.next_review">التالي: مراجعة الطلب</span></button>'],
    ['>مراجعة وتأكيد الطلب</h2>', '><span data-i18n="checkout.review_title">مراجعة وتأكيد الطلب</span></h2>'],
    ['>ملخص المنتجات والتوصيل</h3>', '><span data-i18n="checkout.summary_title">ملخص المنتجات والتوصيل</span></h3>'],
    ['>المجموع الفرعي للمنتجات:</span>', '><span data-i18n="checkout.subtotal">المجموع الفرعي للمنتجات:</span>'],
    ['>تكلفة الشحن والتوصيل (</span>', '><span data-i18n="checkout.shipping_cost">تكلفة الشحن والتوصيل (</span>'],
    ['>الولاية</span>', '><span data-i18n="checkout.wilaya_fallback">الولاية</span>'],
    ['>الخصم المطبق:</span>', '><span data-i18n="checkout.discount">الخصم المطبق:</span>'],
    ['>المبلغ الإجمالي المستحق:</span>', '><span data-i18n="checkout.total">المبلغ الإجمالي المستحق:</span>'],
    ['>0 دج</strong>', '>0 <span data-i18n="common.currency">دج</span></strong>'],
    ['>-0 دج</strong>', '>-0 <span data-i18n="common.currency">دج</span></strong>'],
    ['>0 دج</span>', '>0 <span data-i18n="common.currency">دج</span></span>'],
    ['أوافق على', '<span data-i18n="checkout.agree">أوافق على</span>'],
    ['>شروط الخدمة</a>', '><span data-i18n="checkout.tos">شروط الخدمة</span></a>'],
    ['وسياسة الاسترجاع الخاصة بالمتجر.', '<span data-i18n="checkout.and_policy">وسياسة الاسترجاع الخاصة بالمتجر.</span>'],
    ['>السابق: طريقة الدفع</button>', '><span data-i18n="checkout.prev_payment">السابق: طريقة الدفع</span></button>'],
    ['>تأكيد الطلب الآن</button>', '><span data-i18n="checkout.confirm_btn">تأكيد الطلب الآن</span></button>'],
    ['>تسوق آمن وموثوق لـ 58 ولاية جزائرية مع ضمان الدفع عند الاستلام وسرعة الشحن.</p>', '><span data-i18n="checkout.footer_desc">تسوق آمن وموثوق لـ 58 ولاية جزائرية مع ضمان الدفع عند الاستلام وسرعة الشحن.</span></p>'],
    ['<h3>روابط هامة</h3>', '<h3 data-i18n="checkout.footer_links">روابط هامة</h3>'],
    ['>الرئيسية</a>', '><span data-i18n="footer.link_home">الرئيسية</span></a>'],
    ['>التسوق</a>', '><span data-i18n="footer.link_shop">التسوق</span></a>'],
    ['>عربة التسوق</a>', '><span data-i18n="footer.link_cart">عربة التسوق</span></a>'],
    ['>تتبع طلبي</a>', '><span data-i18n="footer.link_track">تتبع طلبي</span></a>'],
    ['<h3>دعم الطلبات</h3>', '<h3 data-i18n="checkout.footer_support">دعم الطلبات</h3>'],
    ['>حماية تامة للبيانات والطلبات</li>', '><span data-i18n="checkout.footer_protection">حماية تامة للبيانات والطلبات</span></li>'],
    ['<h3>طرق الدفع</h3>', '<h3 data-i18n="footer.payment_shipping">طرق الدفع</h3>'],
    ['الدفع عند الاستلام', '<span data-i18n="features.cod_title">الدفع عند الاستلام</span>'],
    ['© 2026 المتجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', '<span data-i18n="checkout.footer_copyright">© 2026 المتجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</span>']
];

const jsCartReplacements = [
    ["'لا يمكن إضافة أكثر من 20 قطعة من نفس المنتج'", "window.I18n.t('messages.cart_limit', 'لا يمكن إضافة أكثر من 20 قطعة من نفس المنتج')"],
    ["'المنتج'", "window.I18n.t('product.store_customer', 'المنتج')"], // mapped 'product' for fallback string
    ["`تمت إضافة \"${product.name || 'المنتج'}\" إلى سلة التسوق 🛒`", "window.I18n.t('messages.add_cart_success_name', 'تمت إضافة \"{name}\" إلى سلة التسوق 🛒').replace('{name}', product.name || 'المنتج')"],
    ["'حدث خطأ أثناء إضافة المنتج إلى عربة التسوق'", "window.I18n.t('messages.add_cart_error_2', 'حدث خطأ أثناء إضافة المنتج إلى عربة التسوق')"],
    ["'لا يمكن أن تتجاوز الكمية 20 قطعة'", "window.I18n.t('messages.qty_limit', 'لا يمكن أن تتجاوز الكمية 20 قطعة')"],
    ["'حدث خطأ أثناء تحديث كمية المنتج'", "window.I18n.t('messages.update_qty_error', 'حدث خطأ أثناء تحديث كمية المنتج')"],
    ["'تمت إزالة المنتج من السلة'", "window.I18n.t('messages.item_removed', 'تمت إزالة المنتج من السلة')"],
    ["'حدث خطأ أثناء إزالة المنتج من عربة التسوق'", "window.I18n.t('messages.remove_error', 'حدث خطأ أثناء إزالة المنتج من عربة التسوق')"],
    ["عربة التسوق فارغة حالياً", "' + window.I18n.t('cart.empty_title', 'عربة التسوق فارغة حالياً') + '"],
    ["استكشف تشكيلتنا الواسعة وأضف منتجاتك المفضلة للسلة!", "' + window.I18n.t('cart.empty_desc', 'استكشف تشكيلتنا الواسعة وأضف منتجاتك المفضلة للسلة!') + '"],
    ["تصفح المنتجات", "' + window.I18n.t('cart.browse_shop', 'تصفح المنتجات') + '"],
    ["الكمية: ${item.quantity}", "' + window.I18n.t('cart.item_qty', 'الكمية: {qty}').replace('{qty}', item.quantity) + '"],
    ["} دج<", "} ' + window.I18n.t('common.currency', 'دج') + '<"],
    ["إزالة العنصر", "' + window.I18n.t('cart.remove_item', 'إزالة العنصر') + '"],
    ["ملخص الطلب", "' + window.I18n.t('cart.summary', 'ملخص الطلب') + '"],
    ["إجمالي المنتجات", "' + window.I18n.t('cart.total_products', 'إجمالي المنتجات') + '"],
    ["الشحن والتوصيل", "' + window.I18n.t('cart.shipping', 'الشحن والتوصيل') + '"],
    ["'مجاني'", "window.I18n.t('cart.free', 'مجاني')"],
    ["كود خصم (${discount*100}%)", "' + window.I18n.t('cart.discount_code', 'كود خصم').replace('{discount}', discount*100) + '"],
    ["المبلغ الإجمالي", "' + window.I18n.t('cart.total', 'المبلغ الإجمالي') + '"],
    ["أدخل كود الخصم (مثل: SAVE10)", "' + window.I18n.t('cart.promo_placeholder', 'أدخل كود الخصم (مثل: SAVE10)') + '"],
    [">تطبيق<", ">' + window.I18n.t('cart.apply_promo', 'تطبيق') + '<"],
    ["إتمام الشراء", "' + window.I18n.t('cart.checkout_btn', 'إتمام الشراء') + '"],
    ["متابعة التسوق", "' + window.I18n.t('cart.continue_shopping', 'متابعة التسوق') + '"],
    ["'عربة التسوق فارغة'", "window.I18n.t('messages.cart_empty', 'عربة التسوق فارغة')"],
    ["'تم إلغاء كود الخصم'", "window.I18n.t('messages.promo_canceled', 'تم إلغاء كود الخصم')"],
    ["`تم تطبيق الخصم بنجاح! (${discount*100}%)`", "window.I18n.t('messages.promo_success', 'تم تطبيق الخصم بنجاح! ({discount}%)').replace('{discount}', discount*100)"],
    ["'كود الخصم غير صالح. استخدم SAVE10 أو SAVE20'", "window.I18n.t('messages.promo_invalid', 'كود الخصم غير صالح. استخدم SAVE10 أو SAVE20')"]
];

const jsCheckoutReplacements = [
    ["'فشل جلب الولايات'", "window.I18n.t('messages.fetch_wilayas_error', 'فشل جلب الولايات')"],
    ["'-- اختر ولايتك (58 ولاية) --'", "window.I18n.t('checkout.select_wilaya_58', '-- اختر ولايتك (58 ولاية) --')"],
    ["'16 - الجزائر العاصمة (Alger)'", "window.I18n.t('wilayas.algiers_16', '16 - الجزائر العاصمة (Alger)')"],
    ["`السعر: ${selectedWilaya.home_delivery_price.toLocaleString()} دج (${selectedWilaya.delivery_time_days})`", "`${window.I18n.t('checkout.price_prefix', 'السعر:')} ${selectedWilaya.home_delivery_price.toLocaleString()} ${window.I18n.t('common.currency', 'دج')} (${selectedWilaya.delivery_time_days})`"],
    ["`السعر: ${selectedWilaya.desk_delivery_price.toLocaleString()} دج (${selectedWilaya.delivery_time_days})`", "`${window.I18n.t('checkout.price_prefix', 'السعر:')} ${selectedWilaya.desk_delivery_price.toLocaleString()} ${window.I18n.t('common.currency', 'دج')} (${selectedWilaya.delivery_time_days})`"],
    ["'يرجى إدخال الاسم الكامل'", "window.I18n.t('messages.enter_full_name', 'يرجى إدخال الاسم الكامل')"],
    ["'يرجى إدخال رقم هاتف صحيح'", "window.I18n.t('messages.enter_valid_phone', 'يرجى إدخال رقم هاتف صحيح')"],
    ["'يرجى اختيار الولاية'", "window.I18n.t('messages.select_wilaya', 'يرجى اختيار الولاية')"],
    ["'يرجى إدخال العنوان بالتفصيل'", "window.I18n.t('messages.enter_address', 'يرجى إدخال العنوان بالتفصيل')"],
    ["'عربة التسوق فارغة، جاري تحويلك للمتجر...'", "window.I18n.t('messages.cart_empty_redirect', 'عربة التسوق فارغة، جاري تحويلك للمتجر...')"],
    ["الكمية: ${item.quantity}", "' + window.I18n.t('cart.item_qty', 'الكمية: {qty}').replace('{qty}', item.quantity) + '"],
    ["} دج<", "} ' + window.I18n.t('common.currency', 'دج') + '<"],
    ["'الولاية'", "window.I18n.t('checkout.wilaya_fallback', 'الولاية')"],
    ["`${subtotal.toLocaleString()} دج`", "`${subtotal.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${currentShippingCost.toLocaleString()} دج`", "`${currentShippingCost.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`${grandTotal.toLocaleString()} دج`", "`${grandTotal.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["`-${discount.toLocaleString()} دج`", "`-${discount.toLocaleString()} ${window.I18n.t('common.currency', 'دج')}`"],
    ["'يرجى الموافقة على شروط الخدمة لتأكيد الطلب'", "window.I18n.t('messages.agree_tos', 'يرجى الموافقة على شروط الخدمة لتأكيد الطلب')"],
    ["'عذراً، أنت غير متصل بالإنترنت حالياً. يلزم توفر اتصال فعلي لتأكيد الطلب والدفع.'", "window.I18n.t('messages.offline_error', 'عذراً، أنت غير متصل بالإنترنت حالياً. يلزم توفر اتصال فعلي لتأكيد الطلب والدفع.')"],
    ["'جاري تأكيد وتسجيل الطلب...'", "window.I18n.t('messages.confirming_order_full', 'جاري تأكيد وتسجيل الطلب...')"],
    ["'السلة فارغة!'", "window.I18n.t('messages.cart_empty', 'السلة فارغة!')"],
    ["تأكيد الطلب نهائياً", "' + window.I18n.t('checkout.final_confirm', 'تأكيد الطلب نهائياً') + '"],
    ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
    ["'الجزائر العاصمة'", "window.I18n.t('checkout.algiers_fallback', 'الجزائر العاصمة')"],
    ["'فشل في إنشاء الطلب'", "window.I18n.t('messages.create_order_fail', 'فشل في إنشاء الطلب')"],
    ["'تأكيد الطلب الآن'", "window.I18n.t('checkout.confirm_btn', 'تأكيد الطلب الآن')"]
];

function processFile(filename, replacements) {
    if (!fs.existsSync(filename)) {
        console.log("NOT FOUND: " + filename);
        return;
    }
    let content = fs.readFileSync(filename, 'utf8');
    replacements.forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(filename, content, 'utf8');
}

processFile('cart.html', cartReplacements);
processFile('checkout.html', checkoutReplacements);
processFile('js/cart.js', jsCartReplacements);
processFile('js/checkout.js', jsCheckoutReplacements);

console.log('Processed cart/checkout files successfully.');
