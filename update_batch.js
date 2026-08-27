const fs = require('fs');

const keys = {
    // account.html
    'account.meta_title': { ar: 'حسابي - المتجر الإلكتروني', en: 'My Account - E-Store', fr: 'Mon Compte - E-Store' },
    'account.page_title': { ar: 'لوحة تحكم الحساب', en: 'Account Dashboard', fr: 'Tableau de bord du compte' },
    'account.sidebar_account': { ar: 'حسابي', en: 'My Account', fr: 'Mon Compte' },
    'account.sidebar_orders': { ar: 'طلباتي', en: 'My Orders', fr: 'Mes Commandes' },
    'account.sidebar_settings': { ar: 'إعدادات الحساب', en: 'Account Settings', fr: 'Paramètres du compte' },
    'account.sidebar_logout': { ar: 'تسجيل الخروج', en: 'Logout', fr: 'Déconnexion' },
    'account.welcome': { ar: 'مرحباً،', en: 'Welcome,', fr: 'Bienvenue,' },
    'account.view_store': { ar: 'تصفح المتجر', en: 'Browse Store', fr: 'Parcourir la boutique' },
    'account.total_orders': { ar: 'إجمالي الطلبات', en: 'Total Orders', fr: 'Total des commandes' },
    'account.track_shipment': { ar: 'تتبع الشحنات', en: 'Track Shipments', fr: 'Suivre les expéditions' },
    'account.orders_list_title': { ar: 'قائمة الطلبات الأخيرة', en: 'Recent Orders', fr: 'Commandes récentes' },
    'account.col_order_num': { ar: 'رقم الطلب', en: 'Order Number', fr: 'Numéro de commande' },
    'account.col_date': { ar: 'التاريخ', en: 'Date', fr: 'Date' },
    'account.col_status': { ar: 'الحالة', en: 'Status', fr: 'Statut' },
    'account.col_total': { ar: 'الإجمالي', en: 'Total', fr: 'Total' },
    'account.col_actions': { ar: 'إجراءات', en: 'Actions', fr: 'Actions' },
    'account.change_password': { ar: 'تغيير كلمة المرور', en: 'Change Password', fr: 'Changer le mot de passe' },
    'account.current_pass': { ar: 'كلمة المرور الحالية:', en: 'Current Password:', fr: 'Mot de passe actuel:' },
    'account.new_pass': { ar: 'كلمة المرور الجديدة:', en: 'New Password:', fr: 'Nouveau mot de passe:' },
    'account.save_changes': { ar: 'حفظ التغييرات', en: 'Save Changes', fr: 'Enregistrer les modifications' },

    // js/account.js & account.html JS
    'account.status_pending': { ar: 'قيد المعالجة', en: 'Pending', fr: 'En attente' },
    'account.status_processing': { ar: 'جاري التجهيز', en: 'Processing', fr: 'En traitement' },
    'account.status_shipped': { ar: 'تم الشحن', en: 'Shipped', fr: 'Expédié' },
    'account.status_delivered': { ar: 'تم التسليم', en: 'Delivered', fr: 'Livré' },
    'account.status_cancelled': { ar: 'ملغى', en: 'Cancelled', fr: 'Annulé' },
    'account.btn_invoice': { ar: 'الفاتورة', en: 'Invoice', fr: 'Facture' },
    'account.btn_track': { ar: 'تتبع', en: 'Track', fr: 'Suivre' },
    'messages.load_orders_error': { ar: 'تعذر جلب الطلبات. يرجى إعادة تحميل الصفحة.', en: 'Could not fetch orders. Please refresh the page.', fr: 'Impossible de récupérer les commandes. Veuillez rafraîchir la page.' },
    'account.no_orders': { ar: 'لا توجد طلبات سابقة', en: 'No previous orders', fr: 'Aucune commande précédente' },
    'account.start_shopping': { ar: 'ابدأ التسوق الآن', en: 'Start shopping now', fr: 'Commencez vos achats maintenant' },
    'messages.pass_update_success': { ar: 'تم تحديث كلمة المرور بنجاح!', en: 'Password updated successfully!', fr: 'Mot de passe mis à jour avec succès!' },

    // wishlist.html
    'wishlist.meta_title': { ar: 'المفضلة - المتجر الإلكتروني', en: 'Wishlist - E-Store', fr: 'Favoris - E-Store' },
    'wishlist.page_title': { ar: 'قائمة الرغبات (المفضلة)', en: 'Wishlist', fr: 'Liste de souhaits (Favoris)' },
    'wishlist.empty_title': { ar: 'قائمة الرغبات فارغة', en: 'Wishlist is empty', fr: 'La liste de souhaits est vide' },
    'wishlist.empty_desc': { ar: 'لم تقم بإضافة أي منتجات إلى مفضلتك بعد. تصفح المتجر واحتفظ بالمنتجات التي تعجبك هنا.', en: 'You haven\'t added any products to your wishlist yet. Browse the store and save your favorite products here.', fr: 'Vous n\'avez encore ajouté aucun produit à vos favoris. Parcourez la boutique et enregistrez vos produits préférés ici.' },
    'wishlist.empty_btn': { ar: 'تصفح المتجر الآن', en: 'Browse Store Now', fr: 'Parcourir la boutique maintenant' },
    
    // js/wishlist.js
    'messages.removed_wishlist': { ar: 'تم الحذف من المفضلة', en: 'Removed from wishlist', fr: 'Retiré des favoris' },
    'messages.added_wishlist': { ar: 'تمت الإضافة للمفضلة ❤️', en: 'Added to wishlist ❤️', fr: 'Ajouté aux favoris ❤️' },
    'messages.removed_wishlist_alt': { ar: 'تمت إزالة المنتج من قائمة الرغبات', en: 'Product removed from wishlist', fr: 'Produit retiré de la liste de souhaits' },
    'messages.added_wishlist_alt': { ar: 'تمت إضافة المنتج إلى قائمة الرغبات ❤️', en: 'Product added to wishlist ❤️', fr: 'Produit ajouté à la liste de souhaits ❤️' },

    // track-order.html
    'track.meta_title': { ar: 'تتبع الطلب - المتجر الإلكتروني', en: 'Track Order - E-Store', fr: 'Suivre la commande - E-Store' },
    'track.page_title': { ar: 'تتبع حالة الطلب', en: 'Track Order Status', fr: 'Suivre l\'état de la commande' },
    'track.form_desc': { ar: 'أدخل رقم الطلب ورقم الهاتف الذي قمت بالطلب به لمعرفة حالة شحنتك الحالية.', en: 'Enter your order number and phone number to check your shipment status.', fr: 'Entrez votre numéro de commande et votre numéro de téléphone pour vérifier l\'état de votre expédition.' },
    'track.order_id_label': { ar: 'رقم الطلب (مثال: 1234 أو DZ-2026-1234)', en: 'Order Number (e.g. 1234 or DZ-2026-1234)', fr: 'Numéro de commande (ex: 1234 ou DZ-2026-1234)' },
    'track.order_id_placeholder': { ar: 'رقم الطلب', en: 'Order Number', fr: 'Numéro de commande' },
    'track.phone_label': { ar: 'رقم الهاتف', en: 'Phone Number', fr: 'Numéro de téléphone' },
    'track.phone_placeholder': { ar: 'رقم الهاتف المستخدم في الطلب', en: 'Phone number used for order', fr: 'Numéro de téléphone utilisé pour la commande' },
    'track.submit_btn': { ar: 'بحث وتتبع', en: 'Search and Track', fr: 'Rechercher et Suivre' },
    
    // js/track-order.js & track-order.html JS
    'track.status_pending': { ar: 'تم استلام الطلب', en: 'Order Received', fr: 'Commande reçue' },
    'track.status_processing': { ar: 'جاري التجهيز والتأكيد', en: 'Processing & Confirming', fr: 'En traitement et confirmation' },
    'track.status_shipped': { ar: 'تم الشحن للتوصيل', en: 'Shipped for Delivery', fr: 'Expédié pour livraison' },
    'track.status_delivered': { ar: 'تم التسليم بنجاح', en: 'Delivered Successfully', fr: 'Livré avec succès' },
    'messages.enter_track_details': { ar: 'يرجى إدخال رقم الطلب ورقم الهاتف', en: 'Please enter order number and phone number', fr: 'Veuillez entrer le numéro de commande et le numéro de téléphone' },
    'messages.tracking_error': { ar: 'حدث خطأ أثناء تتبع الطلب', en: 'Error tracking order', fr: 'Erreur lors du suivi de la commande' },
    'track.btn_tracking': { ar: 'جاري البحث...', en: 'Searching...', fr: 'Recherche en cours...' },

    // order-confirmation.html
    'conf.meta_title': { ar: 'تأكيد الطلب - المتجر الإلكتروني', en: 'Order Confirmation - E-Store', fr: 'Confirmation de commande - E-Store' },
    'conf.success_title': { ar: 'تم تأكيد طلبك بنجاح!', en: 'Order Confirmed Successfully!', fr: 'Commande confirmée avec succès !' },
    'conf.success_desc': { ar: 'شكراً لتسوقك معنا. سنقوم بتجهيز طلبك في أقرب وقت ممكن وسيتواصل معك موزعنا قريباً.', en: 'Thank you for shopping with us. We will process your order soon and our delivery agent will contact you.', fr: 'Merci pour vos achats. Nous traiterons votre commande sous peu et notre livreur vous contactera.' },
    'conf.order_number': { ar: 'رقم الطلب:', en: 'Order Number:', fr: 'Numéro de commande:' },
    'conf.order_details': { ar: 'تفاصيل الطلب', en: 'Order Details', fr: 'Détails de la commande' },
    'conf.customer_name': { ar: 'اسم العميل:', en: 'Customer Name:', fr: 'Nom du client:' },
    'conf.delivery_address': { ar: 'جهة التوصيل:', en: 'Delivery Address:', fr: 'Adresse de livraison:' },
    'conf.payment_method': { ar: 'طريقة الدفع:', en: 'Payment Method:', fr: 'Mode de paiement:' },
    'conf.current_status': { ar: 'الحالة الحالية:', en: 'Current Status:', fr: 'Statut actuel:' },
    'conf.track_btn': { ar: 'تتبع حالة الطلب', en: 'Track Order Status', fr: 'Suivre l\'état de la commande' },
    'conf.continue_shopping': { ar: 'متابعة التسوق', en: 'Continue Shopping', fr: 'Continuer vos achats' },
    'conf.support_title': { ar: 'دعم واستفسارات', en: 'Support & Inquiries', fr: 'Support et demandes' },
    'conf.guarantee': { ar: 'ضمان الجودة والتسليم', en: 'Quality and Delivery Guarantee', fr: 'Garantie de qualité et de livraison' },
    'messages.fetch_order_fail': { ar: 'فشل جلب الطلب', en: 'Failed to fetch order', fr: 'Échec de la récupération de la commande' },
    'conf.epay': { ar: 'دفع إلكتروني (بطاقة ذهبية / CIB)', en: 'E-Payment (Edahabia / CIB)', fr: 'Paiement électronique (Edahabia / CIB)' },
    'conf.status_pending': { ar: 'قيد المعالجة', en: 'Pending', fr: 'En attente' },
    'conf.status_processing': { ar: 'قيد التجهيز والتأكيد', en: 'Processing & Confirming', fr: 'En traitement et confirmation' },
    'conf.status_shipped': { ar: 'تم الشحن', en: 'Shipped', fr: 'Expédié' },
    'conf.status_delivered': { ar: 'تم التسليم بنجاح', en: 'Delivered Successfully', fr: 'Livré avec succès' },

    // invoice.html
    'invoice.meta_title': { ar: 'فاتورة الطلب - المتجر الإلكتروني', en: 'Order Invoice - E-Store', fr: 'Facture de commande - E-Store' },
    'invoice.store_tagline': { ar: 'خدمة تسوق موثوقة في الجزائر', en: 'Reliable shopping service in Algeria', fr: 'Service d\'achat fiable en Algérie' },
    'invoice.store_contact': { ar: 'هاتف: 0550000000 | بريد: contact@myshop.dz', en: 'Phone: 0550000000 | Email: contact@myshop.dz', fr: 'Tél: 0550000000 | Email: contact@myshop.dz' },
    'invoice.title': { ar: 'فاتورة بيع', en: 'Sales Invoice', fr: 'Facture de vente' },
    'invoice.invoice_num': { ar: 'رقم الفاتورة:', en: 'Invoice Number:', fr: 'Numéro de facture:' },
    'invoice.order_num': { ar: 'رقم الطلب:', en: 'Order Number:', fr: 'Numéro de commande:' },
    'invoice.date': { ar: 'التاريخ:', en: 'Date:', fr: 'Date:' },
    'invoice.customer_info': { ar: 'معلومات المشتري (العميل):', en: 'Buyer Information (Customer):', fr: 'Informations de l\'acheteur (Client):' },
    'invoice.name': { ar: 'الاسم:', en: 'Name:', fr: 'Nom:' },
    'invoice.phone': { ar: 'الهاتف:', en: 'Phone:', fr: 'Téléphone:' },
    'invoice.email': { ar: 'البريد:', en: 'Email:', fr: 'Email:' },
    'invoice.address_info': { ar: 'عنوان وجهة التوصيل:', en: 'Delivery Address Destination:', fr: 'Destination de l\'adresse de livraison:' },
    'invoice.wilaya': { ar: 'الولاية:', en: 'Wilaya:', fr: 'Wilaya:' },
    'invoice.full_address': { ar: 'العنوان الكامل:', en: 'Full Address:', fr: 'Adresse complète:' },
    'invoice.delivery_type': { ar: 'نوع التوصيل:', en: 'Delivery Type:', fr: 'Type de livraison:' },
    'invoice.col_product': { ar: 'المنتج / الوصف', en: 'Product / Description', fr: 'Produit / Description' },
    'invoice.col_qty': { ar: 'الكمية', en: 'Quantity', fr: 'Quantité' },
    'invoice.col_price': { ar: 'السعر الفردي', en: 'Unit Price', fr: 'Prix unitaire' },
    'invoice.col_total': { ar: 'الإجمالي', en: 'Total', fr: 'Total' },
    'invoice.payment_info': { ar: 'طريقة وحالة الدفع:', en: 'Payment Method & Status:', fr: 'Mode et statut de paiement:' },
    'invoice.method': { ar: 'الطريقة:', en: 'Method:', fr: 'Mode:' },
    'invoice.status': { ar: 'حالة الدفع:', en: 'Payment Status:', fr: 'Statut de paiement:' },
    'invoice.subtotal': { ar: 'المجموع الفرعي للمنتجات:', en: 'Products Subtotal:', fr: 'Sous-total des produits:' },
    'invoice.shipping_fee': { ar: 'رسوم الشحن والتوصيل:', en: 'Shipping & Delivery Fees:', fr: 'Frais d\'expédition et de livraison:' },
    'invoice.grand_total': { ar: 'المبلغ الإجمالي المستحق:', en: 'Total Amount Due:', fr: 'Montant Total Dû:' },
    'invoice.thank_you': { ar: 'شكراً لثقتكم وتسوّقكم معنا! إذا كان لديكم أي استفسار يرجى التواصل معنا عبر الهاتف أو البريد الإلكتروني الموضح أعلاه.', en: 'Thank you for your trust and shopping with us! If you have any inquiries, please contact us via phone or email above.', fr: 'Merci pour votre confiance et vos achats chez nous! Si vous avez des questions, veuillez nous contacter par téléphone ou par e-mail ci-dessus.' },
    'invoice.copyright': { ar: '© 2026 جميع الحقوق محفوظة.', en: '© 2026 All rights reserved.', fr: '© 2026 Tous droits réservés.' },
    'invoice.back_to_store': { ar: 'العودة للمتجر', en: 'Back to Store', fr: 'Retour à la boutique' },
    'invoice.track_order': { ar: 'تتبع الطلب', en: 'Track Order', fr: 'Suivre la commande' },
    'invoice.print': { ar: 'طباعة / تحميل PDF', en: 'Print / Download PDF', fr: 'Imprimer / Télécharger le PDF' },
    'invoice.no_order_id': { ar: 'لم يتم تحديد رقم الطلب', en: 'Order number not specified', fr: 'Numéro de commande non spécifié' },
    'messages.load_invoice_error': { ar: 'تعذر تحميل بيانات الفاتورة', en: 'Could not load invoice data', fr: 'Impossible de charger les données de la facture' },
    'invoice.desk_pickup': { ar: 'استلام من مكتب التوصيل', en: 'Pickup from delivery desk', fr: 'Retrait au bureau de livraison' },
    'invoice.home_delivery': { ar: 'توصيل للمنزل', en: 'Home Delivery', fr: 'Livraison à domicile' },
    'invoice.status_paid': { ar: 'مدفوع إلكترونياً بالكامل ✅', en: 'Fully paid online ✅', fr: 'Entièrement payé en ligne ✅' },
    'invoice.status_unpaid': { ar: 'قيد التحصيل نقداً عند الاستلام 📦', en: 'To be collected in cash on delivery 📦', fr: 'A encaisser en espèces à la livraison 📦' },
    'invoice.error_loading': { ar: 'خطأ في تحميل الفاتورة: {error}', en: 'Error loading invoice: {error}', fr: 'Erreur de chargement de la facture: {error}' },
};

['ar', 'en', 'fr'].forEach(lang => {
    const file = `locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    Object.keys(keys).forEach(keyPath => {
        const parts = keyPath.split('.');
        let curr = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = keys[keyPath][lang];
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
});
console.log('JSON locales updated with all batch keys.');
