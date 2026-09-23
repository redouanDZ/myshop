const fs = require('fs');

const replacements = {
    'account.html': [
        ['placeholder="تأكيد كلمة المرور"', 'data-i18n="account.confirm_pass_placeholder" placeholder="تأكيد كلمة المرور"'],
        ['حفظ التغيرات', '<span data-i18n="account.save_changes_btn">حفظ التغيرات</span>'],
        ['عناوين الشحن المكتوبة', '<span data-i18n="account.saved_addresses">عناوين الشحن المكتوبة</span>'],
        ['إضافة عنوان جديد', '<span data-i18n="account.add_address">إضافة عنوان جديد</span>'],
        ['سجل الطلبات', '<span data-i18n="account.order_history">سجل الطلبات</span>'],
        ['قائمة المفضلة', '<span data-i18n="account.wishlist_tab">قائمة المفضلة</span>'],
        ['إضافة عنوان شحن جديد', '<span data-i18n="account.add_new_address">إضافة عنوان شحن جديد</span>'],
        ['اسم العنوان (مثال: المنزل، العمل)', '<span data-i18n="account.address_title">اسم العنوان (مثال: المنزل، العمل)</span>'],
        ['placeholder="المنزل"', 'data-i18n="account.address_title_placeholder" placeholder="المنزل"'],
        ['الاسم الكامل للمستلم', '<span data-i18n="account.recipient_name">الاسم الكامل للمستلم</span>'],
        ['placeholder="الاسم الكامل"', 'data-i18n="account.recipient_name_placeholder" placeholder="الاسم الكامل"'],
        ['المدينة / الولاية', '<span data-i18n="account.city_wilaya">المدينة / الولاية</span>'],
        ['placeholder="الجزائر العاصمة"', 'data-i18n="account.algiers_placeholder" placeholder="الجزائر العاصمة"'],
        ['العنوان التفصيلي', '<span data-i18n="account.detailed_address">العنوان التفصيلي</span>'],
        ['placeholder="اسم الشارع، رقم العمارة، الشقة..."', 'data-i18n="account.detailed_address_placeholder" placeholder="اسم الشارع، رقم العمارة، الشقة..."'],
        ['تعيين كعنوان افتراضي', '<span data-i18n="account.set_default">تعيين كعنوان افتراضي</span>'],
        ['>إلغاء</button>', '><span data-i18n="common.cancel">إلغاء</span></button>'],
        ['>حفظ العنوان</button>', '><span data-i18n="account.save_address">حفظ العنوان</span></button>'],
        ['لوحة التحكم وإدارة الحساب والطلبات السابقة وعناوين الشحن بكل سهولة وأمان.', '<span data-i18n="account.footer_desc">لوحة التحكم وإدارة الحساب والطلبات السابقة وعناوين الشحن بكل سهولة وأمان.</span>'],
        ['>خدمة العملاء</h3>', '><span data-i18n="footer.customer_service">خدمة العملاء</span></h3>'],
        ['بيانات مشفرة ومحمية', '<span data-i18n="footer.data_protected">بيانات مشفرة ومحمية</span>'],
        ["user.username || user.name || 'مستخدم'", "user.username || user.name || window.I18n.t('account.user_default', 'مستخدم')"],
        ["showToast('كلمتا المرور غير متطابقتين'", "showToast(window.I18n.t('messages.pass_mismatch', 'كلمتا المرور غير متطابقتين')"],
        ["showToast('تم تحديث البيانات بنجاح 🎉'", "showToast(window.I18n.t('messages.data_update_success', 'تم تحديث البيانات بنجاح 🎉')"],
        ["showToast(data.message || 'حدث خطأ في تحديث البيانات'", "showToast(data.message || window.I18n.t('messages.data_update_error', 'حدث خطأ في تحديث البيانات')"],
        ["showToast('خطأ في الاتصال بالخادم'", "showToast(window.I18n.t('messages.server_error', 'خطأ في الاتصال بالخادم')"],
        ["لا توجد عناوين شحن محفوظة حتى الآن.", "' + window.I18n.t('account.no_addresses', 'لا توجد عناوين شحن محفوظة حتى الآن.') + '"],
        ["'العنوان الافتراضي'", "window.I18n.t('account.default_address_badge', 'العنوان الافتراضي')"],
        ["addr.title || 'عنوان'", "addr.title || window.I18n.t('account.address_fallback', 'عنوان')"],
        ["<strong>المستلم:</strong>", "<strong>' + window.I18n.t('account.recipient_label', 'المستلم:') + '</strong>"],
        ["<strong>الهاتف:</strong>", "<strong>' + window.I18n.t('account.phone_label', 'الهاتف:') + '</strong>"],
        ["<strong>المدينة:</strong>", "<strong>' + window.I18n.t('account.city_label', 'المدينة:') + '</strong>"],
        ["<strong>العنوان:</strong>", "<strong>' + window.I18n.t('account.address_label', 'العنوان:') + '</strong>"],
        ["حذف", "' + window.I18n.t('common.delete', 'حذف') + '"],
        ["showToast('تم حفظ العنوان بنجاح'", "showToast(window.I18n.t('messages.address_saved', 'تم حفظ العنوان بنجاح')"],
        ["showToast('حدث خطأ أثناء حفظ العنوان'", "showToast(window.I18n.t('messages.address_save_error', 'حدث خطأ أثناء حفظ العنوان')"],
        ["confirm('هل أنت تأكد من إزالة هذا العنوان؟')", "confirm(window.I18n.t('messages.confirm_delete_address', 'هل أنت تأكد من إزالة هذا العنوان؟'))"],
        ["showToast('تم حذف العنوان بنجاح'", "showToast(window.I18n.t('messages.address_deleted', 'تم حذف العنوان بنجاح')"],
        ["showToast('حدث خطأ في الحذف'", "showToast(window.I18n.t('messages.delete_error', 'حدث خطأ في الحذف')"],
        ["لم تقم بإجراء أي طلبات بعد.", "' + window.I18n.t('account.no_orders_yet', 'لم تقم بإجراء أي طلبات بعد.') + '"],
        ["طلب #${ord.id}", "' + window.I18n.t('account.order_id', 'طلب #{id}').replace('{id}', ord.id) + '"],
        ["د.ج", "' + window.I18n.t('common.currency_alt', 'د.ج') + '"],
        ["عرض التفاصيل", "' + window.I18n.t('account.view_details', 'عرض التفاصيل') + '"],
        ["خطأ في تحميل الطلبات", "' + window.I18n.t('messages.load_orders_error', 'خطأ في تحميل الطلبات') + '"],
        ["'قيد الانتظار'", "window.I18n.t('account.status_pending_alt', 'قيد الانتظار')"],
        ["'جاري المعالجة'", "window.I18n.t('account.status_processing_alt', 'جاري المعالجة')"],
        ["قائمة المفضلة فارغة حالياً.", "' + window.I18n.t('account.wishlist_empty', 'قائمة المفضلة فارغة حالياً.') + '"],
        ["السلة", "' + window.I18n.t('common.cart_title', 'السلة') + '"]
    ],
    'wishlist.html': [
        ['>قائمة الرغبات والمفضلة</h1>', '><span data-i18n="wishlist.page_title_alt">قائمة الرغبات والمفضلة</span></h1>'],
        ['>المنتجات المحفوظة</h1>', '><span data-i18n="wishlist.saved_products">المنتجات المحفوظة</span></h1>'],
        ['0 منتجات', '0 <span data-i18n="wishlist.products_count">منتجات</span>'],
        ['>جاري تحميل قائمة الرغبات...</p>', '><span data-i18n="wishlist.loading">جاري تحميل قائمة الرغبات...</span></p>'],
        ['احفظ منتجاتك المفضلة وتتبع توفرها وعروضها الخاصة في أي وقت.', '<span data-i18n="wishlist.footer_desc">احفظ منتجاتك المفضلة وتتبع توفرها وعروضها الخاصة في أي وقت.</span>'],
        ['تجربة تسوق موثوقة 100%', '<span data-i18n="footer.reliable_shopping">تجربة تسوق موثوقة 100%</span>'],
        ["${wishlistProducts.length} منتجات", "${wishlistProducts.length} ' + window.I18n.t('wishlist.products_count', 'منتجات') + '"],
        ["لم تقم بحفظ أي منتجات في المفضلة بعد. استكشف متجرنا وأضف المنتجات التي تنال إعجابك!", "' + window.I18n.t('wishlist.empty_msg_alt', 'لم تقم بحفظ أي منتجات في المفضلة بعد. استكشف متجرنا وأضف المنتجات التي تنال إعجابك!') + '"]
    ],
    'track-order.html': [
        ['>فتح الفاتورة', '><span data-i18n="track.open_invoice">فتح الفاتورة</span>'],
        ["'جاري البحث...'", "window.I18n.t('track.btn_tracking', 'جاري البحث...')"],
        ["'قيد التجهيز والتأكيد'", "window.I18n.t('track.status_processing', 'قيد التجهيز والتأكيد')"]
    ],
    'order-confirmation.html': [
        ['>0 دج</span>', '>0 <span data-i18n="common.currency">دج</span></span>'],
        ['>تتبع مسار الشحنة', '><span data-i18n="conf.track_btn">تتبع مسار الشحنة</span>'],
        ['>عرض وطباعة الفاتورة', '><span data-i18n="account.btn_invoice">عرض وطباعة الفاتورة</span>'],
        ['>مواصلة التسوق', '><span data-i18n="conf.continue_shopping">مواصلة التسوق</span>']
    ],
    'invoice.html': [
        ['>© 2026 جميع الحقوق محفوظة.</p>', '><span data-i18n="invoice.copyright">© 2026 جميع الحقوق محفوظة.</span></p>'],
        ['>العودة للمتجر</a>', '><span data-i18n="invoice.back_to_store">العودة للمتجر</span></a>'],
        ['>تتبع الطلب</a>', '><span data-i18n="invoice.track_order">تتبع الطلب</span></a>'],
        ['>طباعة / تحميل PDF</button>', '><span data-i18n="invoice.print">طباعة / تحميل PDF</span></button>'],
        ["'لم يتم تحديد رقم الطلب'", "window.I18n.t('invoice.no_order_id', 'لم يتم تحديد رقم الطلب')"]
    ]
};

Object.keys(replacements).forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    replacements[file].forEach(r => {
        content = content.split(r[0]).join(r[1]);
    });
    fs.writeFileSync(file, content, 'utf8');
});

console.log('Processed remaining str.');
