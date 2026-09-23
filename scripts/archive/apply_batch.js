const fs = require('fs');

const replacements = {
    'account.html': [
        ['<title>حسابي - المتجر الإلكتروني</title>', '<title data-i18n="account.meta_title">حسابي - المتجر الإلكتروني</title>'],
        ['>لوحة تحكم الحساب</h1>', '><span data-i18n="account.page_title">لوحة تحكم الحساب</span></h1>'],
        ['>حسابي</a>', '><span data-i18n="account.sidebar_account">حسابي</span></a>'],
        ['>طلباتي</a>', '><span data-i18n="account.sidebar_orders">طلباتي</span></a>'],
        ['>إعدادات الحساب</a>', '><span data-i18n="account.sidebar_settings">إعدادات الحساب</span></a>'],
        ['>تسجيل الخروج</a>', '><span data-i18n="account.sidebar_logout">تسجيل الخروج</span></a>'],
        ['>مرحباً، ', '><span data-i18n="account.welcome">مرحباً، </span>'],
        ['>تصفح المتجر</a>', '><span data-i18n="account.view_store">تصفح المتجر</span></a>'],
        ['>إجمالي الطلبات</h3>', '><span data-i18n="account.total_orders">إجمالي الطلبات</span></h3>'],
        ['>تتبع الشحنات</h3>', '><span data-i18n="account.track_shipment">تتبع الشحنات</span></h3>'],
        ['>قائمة الطلبات الأخيرة</h2>', '><span data-i18n="account.orders_list_title">قائمة الطلبات الأخيرة</span></h2>'],
        ['>رقم الطلب</th>', '><span data-i18n="account.col_order_num">رقم الطلب</span></th>'],
        ['>التاريخ</th>', '><span data-i18n="account.col_date">التاريخ</span></th>'],
        ['>الحالة</th>', '><span data-i18n="account.col_status">الحالة</span></th>'],
        ['>الإجمالي</th>', '><span data-i18n="account.col_total">الإجمالي</span></th>'],
        ['>إجراءات</th>', '><span data-i18n="account.col_actions">إجراءات</span></th>'],
        ['>تغيير كلمة المرور</h2>', '><span data-i18n="account.change_password">تغيير كلمة المرور</span></h2>'],
        ['كلمة المرور الحالية:', '<span data-i18n="account.current_pass">كلمة المرور الحالية:</span>'],
        ['كلمة المرور الجديدة:', '<span data-i18n="account.new_pass">كلمة المرور الجديدة:</span>'],
        ['>حفظ التغييرات</button>', '><span data-i18n="account.save_changes">حفظ التغييرات</span></button>']
    ],
    'js/account.js': [
        ["'قيد المعالجة'", "window.I18n.t('account.status_pending', 'قيد المعالجة')"],
        ["'جاري التجهيز'", "window.I18n.t('account.status_processing', 'جاري التجهيز')"],
        ["'تم الشحن'", "window.I18n.t('account.status_shipped', 'تم الشحن')"],
        ["'تم التسليم'", "window.I18n.t('account.status_delivered', 'تم التسليم')"],
        ["'ملغى'", "window.I18n.t('account.status_cancelled', 'ملغى')"],
        ["'الفاتورة'", "window.I18n.t('account.btn_invoice', 'الفاتورة')"],
        ["'تتبع'", "window.I18n.t('account.btn_track', 'تتبع')"],
        ["'تعذر جلب الطلبات. يرجى إعادة تحميل الصفحة.'", "window.I18n.t('messages.load_orders_error', 'تعذر جلب الطلبات. يرجى إعادة تحميل الصفحة.')"],
        ["'لا توجد طلبات سابقة'", "window.I18n.t('account.no_orders', 'لا توجد طلبات سابقة')"],
        ["'ابدأ التسوق الآن'", "window.I18n.t('account.start_shopping', 'ابدأ التسوق الآن')"],
        ["'تم تحديث كلمة المرور بنجاح!'", "window.I18n.t('messages.pass_update_success', 'تم تحديث كلمة المرور بنجاح!')"]
    ],
    'wishlist.html': [
        ['<title>المفضلة - المتجر الإلكتروني</title>', '<title data-i18n="wishlist.meta_title">المفضلة - المتجر الإلكتروني</title>'],
        ['>قائمة الرغبات (المفضلة)</h1>', '><span data-i18n="wishlist.page_title">قائمة الرغبات (المفضلة)</span></h1>'],
        ['>قائمة الرغبات فارغة</h3>', '><span data-i18n="wishlist.empty_title">قائمة الرغبات فارغة</span></h3>'],
        ['>لم تقم بإضافة أي منتجات إلى مفضلتك بعد. تصفح المتجر واحتفظ بالمنتجات التي تعجبك هنا.</p>', '><span data-i18n="wishlist.empty_desc">لم تقم بإضافة أي منتجات إلى مفضلتك بعد. تصفح المتجر واحتفظ بالمنتجات التي تعجبك هنا.</span></p>'],
        ['>تصفح المتجر الآن</a>', '><span data-i18n="wishlist.empty_btn">تصفح المتجر الآن</span></a>']
    ],
    'js/wishlist.js': [
        ["'تم الحذف من المفضلة'", "window.I18n.t('messages.removed_wishlist', 'تم الحذف من المفضلة')"],
        ["'تمت الإضافة للمفضلة ❤️'", "window.I18n.t('messages.added_wishlist', 'تمت الإضافة للمفضلة ❤️')"],
        ["'تمت إزالة المنتج من قائمة الرغبات'", "window.I18n.t('messages.removed_wishlist_alt', 'تمت إزالة المنتج من قائمة الرغبات')"],
        ["'تمت إضافة المنتج إلى قائمة الرغبات ❤️'", "window.I18n.t('messages.added_wishlist_alt', 'تمت إضافة المنتج إلى قائمة الرغبات ❤️')"],
        ["product.name || 'منتج'", "product.name || window.I18n.t('product.store_customer', 'منتج')"],
        ["product.category || 'إلكترونيات'", "product.category || window.I18n.t('categories.electronics', 'إلكترونيات')"]
    ],
    'track-order.html': [
        ['<title>تتبع الطلب - المتجر الإلكتروني</title>', '<title data-i18n="track.meta_title">تتبع الطلب - المتجر الإلكتروني</title>'],
        ['>تتبع حالة الطلب</h1>', '><span data-i18n="track.page_title">تتبع حالة الطلب</span></h1>'],
        ['>أدخل رقم الطلب ورقم الهاتف الذي قمت بالطلب به لمعرفة حالة شحنتك الحالية.</p>', '><span data-i18n="track.form_desc">أدخل رقم الطلب ورقم الهاتف الذي قمت بالطلب به لمعرفة حالة شحنتك الحالية.</span></p>'],
        ['>رقم الطلب (مثال: 1234 أو DZ-2026-1234)</label>', '><span data-i18n="track.order_id_label">رقم الطلب (مثال: 1234 أو DZ-2026-1234)</span></label>'],
        ['placeholder="رقم الطلب"', 'data-i18n="track.order_id_placeholder" placeholder="رقم الطلب"'],
        ['>رقم الهاتف</label>', '><span data-i18n="track.phone_label">رقم الهاتف</span></label>'],
        ['placeholder="رقم الهاتف المستخدم في الطلب"', 'data-i18n="track.phone_placeholder" placeholder="رقم الهاتف المستخدم في الطلب"'],
        ['>بحث وتتبع</button>', '><span data-i18n="track.submit_btn">بحث وتتبع</span></button>']
    ],
    'js/track-order.js': [
        ["'تم استلام الطلب'", "window.I18n.t('track.status_pending', 'تم استلام الطلب')"],
        ["'جاري التجهيز والتأكيد'", "window.I18n.t('track.status_processing', 'جاري التجهيز والتأكيد')"],
        ["'تم الشحن للتوصيل'", "window.I18n.t('track.status_shipped', 'تم الشحن للتوصيل')"],
        ["'تم التسليم بنجاح'", "window.I18n.t('track.status_delivered', 'تم التسليم بنجاح')"],
        ["'يرجى إدخال رقم الطلب ورقم الهاتف'", "window.I18n.t('messages.enter_track_details', 'يرجى إدخال رقم الطلب ورقم الهاتف')"],
        ["'جاري البحث...'", "window.I18n.t('track.btn_tracking', 'جاري البحث...')"],
        ["'بحث وتتبع'", "window.I18n.t('track.submit_btn', 'بحث وتتبع')"],
        ["'حدث خطأ أثناء تتبع الطلب'", "window.I18n.t('messages.tracking_error', 'حدث خطأ أثناء تتبع الطلب')"]
    ],
    'order-confirmation.html': [
        ['<title>تأكيد الطلب - المتجر الإلكتروني</title>', '<title data-i18n="conf.meta_title">تأكيد الطلب - المتجر الإلكتروني</title>'],
        ['>تم تأكيد طلبك بنجاح!</h1>', '><span data-i18n="conf.success_title">تم تأكيد طلبك بنجاح!</span></h1>'],
        ['>شكراً لتسوقك معنا. سنقوم بتجهيز طلبك في أقرب وقت ممكن وسيتواصل معك موزعنا قريباً.</p>', '><span data-i18n="conf.success_desc">شكراً لتسوقك معنا. سنقوم بتجهيز طلبك في أقرب وقت ممكن وسيتواصل معك موزعنا قريباً.</span></p>'],
        ['>رقم الطلب:</span>', '><span data-i18n="conf.order_number">رقم الطلب:</span>'],
        ['>تفاصيل الطلب</h2>', '><span data-i18n="conf.order_details">تفاصيل الطلب</span></h2>'],
        ['>اسم العميل:</span>', '><span data-i18n="conf.customer_name">اسم العميل:</span>'],
        ['>جهة التوصيل:</span>', '><span data-i18n="conf.delivery_address">جهة التوصيل:</span>'],
        ['>طريقة الدفع:</span>', '><span data-i18n="conf.payment_method">طريقة الدفع:</span>'],
        ['>الحالة الحالية:</span>', '><span data-i18n="conf.current_status">الحالة الحالية:</span>'],
        ['>تتبع حالة الطلب</a>', '><span data-i18n="conf.track_btn">تتبع حالة الطلب</span></a>'],
        ['>متابعة التسوق</a>', '><span data-i18n="conf.continue_shopping">متابعة التسوق</span></a>'],
        ['>دعم واستفسارات</h3>', '><span data-i18n="conf.support_title">دعم واستفسارات</span></h3>'],
        ['>ضمان الجودة والتسليم</li>', '><span data-i18n="conf.guarantee">ضمان الجودة والتسليم</span></li>'],
        ["'فشل جلب الطلب'", "window.I18n.t('messages.fetch_order_fail', 'فشل جلب الطلب')"],
        ["'دفع إلكتروني (بطاقة ذهبية / CIB)'", "window.I18n.t('conf.epay', 'دفع إلكتروني (بطاقة ذهبية / CIB)')"],
        ["'الدفع عند الاستلام (COD)'", "window.I18n.t('checkout.cod_title', 'الدفع عند الاستلام (COD)')"],
        ["'عميل المتجر'", "window.I18n.t('product.store_customer', 'عميل المتجر')"],
        ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
        ["'مكتب'", "window.I18n.t('checkout.desk_delivery', 'مكتب')"],
        ["'منزل'", "window.I18n.t('checkout.home_delivery', 'منزل')"],
        ["text: 'قيد المعالجة'", "text: window.I18n.t('conf.status_pending', 'قيد المعالجة')"],
        ["text: 'قيد التجهيز والتأكيد'", "text: window.I18n.t('conf.status_processing', 'قيد التجهيز والتأكيد')"],
        ["text: 'تم الشحن'", "text: window.I18n.t('conf.status_shipped', 'تم الشحن')"],
        ["text: 'تم التسليم بنجاح'", "text: window.I18n.t('conf.status_delivered', 'تم التسليم بنجاح')"],
        ["الكمية: ${item.quantity}", "' + window.I18n.t('cart.item_qty', 'الكمية: {qty}').replace('{qty}', item.quantity) + '"],
        ["${lineTotal.toLocaleString()} دج", "${lineTotal.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${subtotal.toLocaleString()} دج", "${subtotal.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${shipping.toLocaleString()} دج", "${shipping.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${total.toLocaleString()} دج", "${total.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
    ],
    'invoice.html': [
        ['<title>فاتورة الطلب - المتجر الإلكتروني</title>', '<title data-i18n="invoice.meta_title">فاتورة الطلب - المتجر الإلكتروني</title>'],
        ['>المتجر الإلكتروني</h1>', '><span data-i18n="footer.brand">المتجر الإلكتروني</span></h1>'],
        ['>خدمة تسوق موثوقة في الجزائر</p>', '><span data-i18n="invoice.store_tagline">خدمة تسوق موثوقة في الجزائر</span></p>'],
        ['>هاتف: 0550000000 | بريد: contact@myshop.dz</p>', '><span data-i18n="invoice.store_contact">هاتف: 0550000000 | بريد: contact@myshop.dz</span></p>'],
        ['>فاتورة بيع</div>', '><span data-i18n="invoice.title">فاتورة بيع</span></div>'],
        ['رقم الفاتورة:', '<span data-i18n="invoice.invoice_num">رقم الفاتورة:</span>'],
        ['رقم الطلب:', '<span data-i18n="invoice.order_num">رقم الطلب:</span>'],
        ['التاريخ:', '<span data-i18n="invoice.date">التاريخ:</span>'],
        ['>معلومات المشتري (العميل):</h3>', '><span data-i18n="invoice.customer_info">معلومات المشتري (العميل):</span></h3>'],
        ['>الاسم:</strong>', '><span data-i18n="invoice.name">الاسم:</span></strong>'],
        ['>الهاتف:</strong>', '><span data-i18n="invoice.phone">الهاتف:</span></strong>'],
        ['>البريد:</strong>', '><span data-i18n="invoice.email">البريد:</span></strong>'],
        ['>عنوان وجهة التوصيل:</h3>', '><span data-i18n="invoice.address_info">عنوان وجهة التوصيل:</span></h3>'],
        ['>الولاية:</strong>', '><span data-i18n="invoice.wilaya">الولاية:</span></strong>'],
        ['>العنوان الكامل:</strong>', '><span data-i18n="invoice.full_address">العنوان الكامل:</span></strong>'],
        ['>نوع التوصيل:</strong>', '><span data-i18n="invoice.delivery_type">نوع التوصيل:</span></strong>'],
        ['>المنتج / الوصف</th>', '><span data-i18n="invoice.col_product">المنتج / الوصف</span></th>'],
        ['>الكمية</th>', '><span data-i18n="invoice.col_qty">الكمية</span></th>'],
        ['>السعر الفردي</th>', '><span data-i18n="invoice.col_price">السعر الفردي</span></th>'],
        ['>الإجمالي</th>', '><span data-i18n="invoice.col_total">الإجمالي</span></th>'],
        ['>طريقة وحالة الدفع:</h4>', '><span data-i18n="invoice.payment_info">طريقة وحالة الدفع:</span></h4>'],
        ['>الطريقة:</strong>', '><span data-i18n="invoice.method">الطريقة:</span></strong>'],
        ['>حالة الدفع:</strong>', '><span data-i18n="invoice.status">حالة الدفع:</span></strong>'],
        ['>المجموع الفرعي للمنتجات:</td>', '><span data-i18n="invoice.subtotal">المجموع الفرعي للمنتجات:</span></td>'],
        ['>رسوم الشحن والتوصيل:</td>', '><span data-i18n="invoice.shipping_fee">رسوم الشحن والتوصيل:</span></td>'],
        ['>المبلغ الإجمالي المستحق:</td>', '><span data-i18n="invoice.grand_total">المبلغ الإجمالي المستحق:</span></td>'],
        ['>شكراً لثقتكم وتسوّقكم معنا! إذا كان لديكم أي استفسار يرجى التواصل معنا عبر الهاتف أو البريد الإلكتروني الموضح أعلاه.</p>', '><span data-i18n="invoice.thank_you">شكراً لثقتكم وتسوّقكم معنا! إذا كان لديكم أي استفسار يرجى التواصل معنا عبر الهاتف أو البريد الإلكتروني الموضح أعلاه.</span></p>'],
        ['>© 2026 جميع الحقوق محفوظة.</p>', '><span data-i18n="invoice.copyright">© 2026 جميع الحقوق محفوظة.</span></p>'],
        ['>العودة للمتجر</a>', '><span data-i18n="invoice.back_to_store">العودة للمتجر</span></a>'],
        ['>تتبع الطلب</a>', '><span data-i18n="invoice.track_order">تتبع الطلب</span></a>'],
        ['>طباعة / تحميل PDF</button>', '><span data-i18n="invoice.print">طباعة / تحميل PDF</span></button>'],
        ["'لم يتم تحديد رقم الطلب'", "window.I18n.t('invoice.no_order_id', 'لم يتم تحديد رقم الطلب')"],
        ["'تعذر تحميل بيانات الفاتورة'", "window.I18n.t('messages.load_invoice_error', 'تعذر تحميل بيانات الفاتورة')"],
        ["'عميل المتجر'", "window.I18n.t('product.store_customer', 'عميل المتجر')"],
        ["'الجزائر'", "window.I18n.t('wilayas.algiers', 'الجزائر')"],
        ["'استلام من مكتب التوصيل'", "window.I18n.t('invoice.desk_pickup', 'استلام من مكتب التوصيل')"],
        ["'توصيل للمنزل'", "window.I18n.t('invoice.home_delivery', 'توصيل للمنزل')"],
        ["'دفع إلكتروني (بطاقة ذهبية / CIB)'", "window.I18n.t('conf.epay', 'دفع إلكتروني (بطاقة ذهبية / CIB)')"],
        ["'الدفع عند الاستلام (COD)'", "window.I18n.t('checkout.cod_title', 'الدفع عند الاستلام (COD)')"],
        ["'مدفوع إلكترونياً بالكامل ✅'", "window.I18n.t('invoice.status_paid', 'مدفوع إلكترونياً بالكامل ✅')"],
        ["'قيد التحصيل نقداً عند الاستلام 📦'", "window.I18n.t('invoice.status_unpaid', 'قيد التحصيل نقداً عند الاستلام 📦')"],
        ["${Number(item.price).toLocaleString()} دج", "${Number(item.price).toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${lineTotal.toLocaleString()} دج", "${lineTotal.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${subtotal.toLocaleString()} دج", "${subtotal.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${shippingCost.toLocaleString()} دج", "${shippingCost.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["${grandTotal.toLocaleString()} دج", "${grandTotal.toLocaleString()} ' + window.I18n.t('common.currency', 'دج') + '"],
        ["خطأ في تحميل الفاتورة:", "' + window.I18n.t('invoice.error_loading', 'خطأ في تحميل الفاتورة: {error}').replace('{error}', window.escapeHtml ? window.escapeHtml(err.message) : err.message) + '"],
        ["${window.escapeHtml ? window.escapeHtml(err.message) : err.message}</td></tr>`;", "</td></tr>`;"] // cleanup after previous replace
    ]
};

// General replacements common to many pages
const globalReplacements = [
    ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"'],
    ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"'],
    ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"'],
    ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"'],
    ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"'],
    ['المتجر الإلكتروني', '<span data-i18n="footer.brand">المتجر الإلكتروني</span>'],
    ['وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.', '<span data-i18n="footer.description">وجهتك الأولى للتسوق الإلكتروني في الجزائر. منتجات أصلية، توصيل لـ 58 ولاية، والدفع عند الاستلام.</span>'],
    ['الجزائر العاصمة، الجزائر', '<span data-i18n="footer.address">الجزائر العاصمة، الجزائر</span>'],
    ['الدفع عند الاستلام', '<span data-i18n="features.cod_title">الدفع عند الاستلام</span>'],
    ['<h3>روابط سريعة</h3>', '<h3 data-i18n="footer.quick_links">روابط سريعة</h3>'],
    ['>الرئيسية</a>', '><span data-i18n="footer.link_home">الرئيسية</span></a>'],
    ['>التسوق</a>', '><span data-i18n="footer.link_shop">التسوق</span></a>'],
    ['>عربة التسوق</a>', '><span data-i18n="footer.link_cart">عربة التسوق</span></a>'],
    ['>تتبع طلبي</a>', '><span data-i18n="footer.link_track">تتبع طلبي</span></a>'],
    ['<h3>تواصل معنا</h3>', '<h3 data-i18n="footer.contact">تواصل معنا</h3>'],
    ['<h3>طرق الدفع</h3>', '<h3 data-i18n="footer.payment_shipping">طرق الدفع</h3>'],
    ['© 2026 المتجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', '<span data-i18n="footer.copyright">© 2026 المتجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</span>']
];

Object.keys(replacements).forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Apply global first
    if (file.endsWith('.html')) {
        globalReplacements.forEach(r => {
            content = content.split(r[0]).join(r[1]);
        });
    }

    // Apply specific
    replacements[file].forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(file, content, 'utf8');
});

console.log('Processed batch replacements');
