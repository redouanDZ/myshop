const fs = require('fs');

let inv = fs.readFileSync('invoice.html', 'utf8');

// Title & Meta
inv = inv.replace(/<title>.*?<\/title>/g, '<title data-i18n="invoice.title">الفاتورة - متجر الجزائر بريميوم</title>');
inv = inv.replace(/<div class="invoice-title">الفاتورة<\/div>/g, '<div class="invoice-title" data-i18n="invoice.invoice">الفاتورة</div>');

// Details
inv = inv.replace(/رقم الطلب:/g, '<span data-i18n="invoice.order_num">رقم الطلب:</span>');
inv = inv.replace(/تاريخ الطلب:/g, '<span data-i18n="invoice.date">تاريخ الطلب:</span>');
inv = inv.replace(/حالة الطلب:/g, '<span data-i18n="invoice.status">حالة الطلب:</span>');
inv = inv.replace(/<h3>بيانات العميل \(الفوترة\):<\/h3>/g, '<h3 data-i18n="invoice.bill_to">بيانات العميل (الفوترة):</h3>');
inv = inv.replace(/<strong>الاسم:<\/strong>/g, '<strong data-i18n="invoice.name">الاسم:</strong>');
inv = inv.replace(/<strong>رقم الهاتف:<\/strong>/g, '<strong data-i18n="invoice.phone">رقم الهاتف:</strong>');
inv = inv.replace(/<strong>العنوان:<\/strong>/g, '<strong data-i18n="invoice.address">العنوان:</strong>');
inv = inv.replace(/<h3>بيانات الشحن:<\/h3>/g, '<h3 data-i18n="invoice.ship_to">بيانات الشحن:</h3>');
inv = inv.replace(/<strong>طريقة التوصيل:<\/strong>/g, '<strong data-i18n="invoice.delivery">طريقة التوصيل:</strong>');

// Table
inv = inv.replace(/<th>المنتج \/ الوصف<\/th>/g, '<th data-i18n="invoice.product">المنتج / الوصف</th>');
inv = inv.replace(/<th>الكمية<\/th>/g, '<th data-i18n="invoice.qty">الكمية</th>');
inv = inv.replace(/<th>سعر الوحدة<\/th>/g, '<th data-i18n="invoice.price">سعر الوحدة</th>');
inv = inv.replace(/<th>المجموع<\/th>/g, '<th data-i18n="invoice.total">المجموع</th>');

// Payment
inv = inv.replace(/<h4>طريقة الدفع:<\/h4>/g, '<h4 data-i18n="invoice.pay_method">طريقة الدفع:</h4>');
inv = inv.replace(/الدفع عند الاستلام \(COD\)/g, '<span data-i18n="invoice.cod">الدفع عند الاستلام (COD)</span>');
inv = inv.replace(/<strong>حالة الدفع:<\/strong>/g, '<strong data-i18n="invoice.pay_status">حالة الدفع:</strong>');
inv = inv.replace(/غير مدفوع - قيد الانتظار/g, '<span data-i18n="invoice.unpaid">غير مدفوع - قيد الانتظار</span>');

// Totals
inv = inv.replace(/<td>المجموع الفرعي:<\/td>/g, '<td data-i18n="invoice.subtotal">المجموع الفرعي:</td>');
inv = inv.replace(/<td>تكلفة التوصيل:<\/td>/g, '<td data-i18n="invoice.shipping">تكلفة التوصيل:</td>');
inv = inv.replace(/<td>المجموع الإجمالي:<\/td>/g, '<td data-i18n="invoice.grand_total">المجموع الإجمالي:</td>');

// Footer
inv = inv.replace(/<p>شكراً لثقتكم بنا! في حال وجود أي استفسار يرجى عدم التردد في التواصل معنا عبر صفحة اتصل بنا.<\/p>/g, '<p data-i18n="invoice.thanks">شكراً لثقتكم بنا! في حال وجود أي استفسار يرجى عدم التردد في التواصل معنا عبر صفحة اتصل بنا.</p>');
inv = inv.replace(/<p>© 2026 جميع الحقوق محفوظة.<\/p>/g, '<p data-i18n="invoice.footer">© 2026 جميع الحقوق محفوظة.</p>');

// Buttons
inv = inv.replace(/>العودة للمتجر<\/a>/g, ' data-i18n="invoice.back">العودة للمتجر</a>');
inv = inv.replace(/>تتبع الطلب<\/a>/g, ' data-i18n="invoice.track">تتبع الطلب</a>');
inv = inv.replace(/>طباعة \/ تحميل PDF<\/button>/g, ' data-i18n="invoice.download">طباعة / تحميل PDF</button>');

fs.writeFileSync('invoice.html', inv, 'utf8');
console.log('Fixed invoice.html');

let conf = fs.readFileSync('order-confirmation.html', 'utf8');

// The h1 might be hard to target safely, let's just use some specific replaces
conf = conf.replace(/<h1>.*?تم استلام طلبك بنجاح.*?<\/h1>/g, '<h1 data-i18n="confirmation.title">تم تأكيد طلبك</h1><p data-i18n="confirmation.msg">تم استلام طلبك بنجاح وسنقوم بمعالجته قريباً.</p>');
conf = conf.replace(/<p>تم استلام طلبك بنجاح وسنقوم بمعالجته قريباً.<\/p>/g, '<p data-i18n="confirmation.msg">تم استلام طلبك بنجاح وسنقوم بمعالجته قريباً.</p>');
conf = conf.replace(/<h3>رقم الطلب<\/h3>/g, '<h3 data-i18n="confirmation.order_num">رقم الطلب</h3>');
conf = conf.replace(/>تتبع طلبك<\/a>/g, ' data-i18n="confirmation.track">تتبع طلبك</a>');
conf = conf.replace(/>مواصلة التسوق<\/a>/g, ' data-i18n="confirmation.continue">مواصلة التسوق</a>');

fs.writeFileSync('order-confirmation.html', conf, 'utf8');
console.log('Fixed order-confirmation.html');
