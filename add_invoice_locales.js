const fs = require('fs');

const ar = JSON.parse(fs.readFileSync('locales/ar.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('locales/fr.json', 'utf8'));

// Inject new keys
if (!ar.invoice) {
    ar.invoice = {
        title: "الفاتورة - متجر الجزائر بريميوم",
        invoice: "الفاتورة",
        order_num: "رقم الطلب:",
        date: "تاريخ الطلب:",
        status: "حالة الطلب:",
        bill_to: "بيانات العميل (الفوترة):",
        name: "الاسم:",
        phone: "رقم الهاتف:",
        address: "العنوان:",
        ship_to: "بيانات الشحن:",
        delivery: "طريقة التوصيل:",
        product: "المنتج / الوصف",
        qty: "الكمية",
        price: "سعر الوحدة",
        total: "المجموع",
        pay_method: "طريقة الدفع:",
        cod: "الدفع عند الاستلام (COD)",
        pay_status: "حالة الدفع:",
        unpaid: "غير مدفوع - قيد الانتظار",
        subtotal: "المجموع الفرعي:",
        shipping: "تكلفة التوصيل:",
        grand_total: "المجموع الإجمالي:",
        thanks: "شكراً لثقتكم بنا! في حال وجود أي استفسار يرجى عدم التردد في التواصل معنا عبر صفحة اتصل بنا.",
        footer: "© 2026 جميع الحقوق محفوظة.",
        back: "العودة للمتجر",
        track: "تتبع الطلب",
        download: "طباعة / تحميل PDF"
    };
    
    en.invoice = {
        title: "Invoice - Premium Algeria Store",
        invoice: "INVOICE",
        order_num: "Order #:",
        date: "Order Date:",
        status: "Status:",
        bill_to: "Billing Details:",
        name: "Name:",
        phone: "Phone:",
        address: "Address:",
        ship_to: "Shipping Details:",
        delivery: "Delivery Method:",
        product: "Product / Description",
        qty: "Quantity",
        price: "Unit Price",
        total: "Total",
        pay_method: "Payment Method:",
        cod: "Cash on Delivery (COD)",
        pay_status: "Payment Status:",
        unpaid: "Unpaid - Pending",
        subtotal: "Subtotal:",
        shipping: "Shipping Cost:",
        grand_total: "Grand Total:",
        thanks: "Thank you for your trust! If you have any inquiries, please do not hesitate to contact us.",
        footer: "© 2026 All rights reserved.",
        back: "Back to Store",
        track: "Track Order",
        download: "Print / Download PDF"
    };

    fr.invoice = {
        title: "Facture - Premium Algeria Store",
        invoice: "FACTURE",
        order_num: "N° de Commande:",
        date: "Date:",
        status: "Statut:",
        bill_to: "Détails de Facturation:",
        name: "Nom:",
        phone: "Téléphone:",
        address: "Adresse:",
        ship_to: "Détails de Livraison:",
        delivery: "Mode de Livraison:",
        product: "Produit / Description",
        qty: "Qté",
        price: "Prix Unitaire",
        total: "Total",
        pay_method: "Mode de Paiement:",
        cod: "Paiement à la Livraison (COD)",
        pay_status: "Statut du Paiement:",
        unpaid: "Non Payé - En Attente",
        subtotal: "Sous-total:",
        shipping: "Frais de Livraison:",
        grand_total: "Total Général:",
        thanks: "Merci pour votre confiance ! Si vous avez des questions, n'hésitez pas à nous contacter.",
        footer: "© 2026 Tous droits réservés.",
        back: "Retour à la Boutique",
        track: "Suivre la Commande",
        download: "Imprimer / Télécharger PDF"
    };
}

if (!ar.confirmation) {
    ar.confirmation = {
        title: "تم تأكيد طلبك",
        msg: "تم استلام طلبك بنجاح وسنقوم بمعالجته قريباً.",
        order_num: "رقم الطلب:",
        track: "تتبع طلبك",
        continue: "مواصلة التسوق"
    };

    en.confirmation = {
        title: "Order Confirmed",
        msg: "Your order has been successfully received and will be processed soon.",
        order_num: "Order #:",
        track: "Track Your Order",
        continue: "Continue Shopping"
    };

    fr.confirmation = {
        title: "Commande Confirmée",
        msg: "Votre commande a été reçue avec succès et sera traitée prochainement.",
        order_num: "Commande N°:",
        track: "Suivre votre Commande",
        continue: "Continuer vos Achats"
    };
}

fs.writeFileSync('locales/ar.json', JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync('locales/en.json', JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync('locales/fr.json', JSON.stringify(fr, null, 2), 'utf8');
console.log('Updated JSON locales');
