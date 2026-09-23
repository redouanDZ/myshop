const fs = require('fs');

const extraKeys = {
    // cart.html
    'cart.meta_title': { ar: 'عربة التسوق - متجر الإلكتروني', en: 'Shopping Cart - E-Store', fr: 'Panier - E-Store' },
    'cart.added_products': { ar: 'المنتجات المضافة', en: 'Added Products', fr: 'Produits ajoutés' },
    'cart.empty_title': { ar: 'عربة التسوق فارغة حالياً', en: 'Your shopping cart is currently empty', fr: 'Votre panier est actuellement vide' },
    'cart.empty_desc': { ar: 'لم تقم بإضافة أي منتجات إلى سلتك بعد. استكشف تشكيلتنا الواسعة وابدأ التسوق الآن.', en: 'You haven\'t added any products to your cart yet. Explore our wide collection and start shopping now.', fr: 'Vous n\'avez encore ajouté aucun produit à votre panier. Explorez notre large collection et commencez vos achats dès maintenant.' },
    'cart.browse_shop': { ar: 'تصفح متجر المنتجات', en: 'Browse Products Shop', fr: 'Parcourir la boutique' },
    
    // checkout.html
    'checkout.meta_title': { ar: 'إتمام الطلب والدفع - المتجر الإلكتروني', en: 'Checkout & Payment - E-Store', fr: 'Paiement - E-Store' },
    'checkout.shipping_info': { ar: 'معلومات الشحن والتوصيل', en: 'Shipping & Delivery Information', fr: 'Informations d\'expédition et de livraison' },
    'checkout.name_placeholder': { ar: 'أدخل اسمك الكامل', en: 'Enter your full name', fr: 'Entrez votre nom complet' },
    'checkout.phone_label': { ar: 'رقم الهاتف (الجزائر)', en: 'Phone Number (Algeria)', fr: 'Numéro de téléphone (Algérie)' },
    'checkout.phone_placeholder': { ar: 'مثال: 0550123456 أو 0660123456', en: 'e.g. 0550123456 or 0660123456', fr: 'ex: 0550123456 ou 0660123456' },
    'checkout.email_label': { ar: 'البريد الإلكتروني (اختياري لاستلام الفاتورة)', en: 'Email (Optional, for invoice)', fr: 'Email (Optionnel, pour la facture)' },
    'checkout.wilaya_label': { ar: 'الولاية (58 ولاية)', en: 'Wilaya (58 Wilayas)', fr: 'Wilaya (58 Wilayas)' },
    'checkout.wilaya_loading': { ar: 'جاري تحميل الولايات...', en: 'Loading wilayas...', fr: 'Chargement des wilayas...' },
    'checkout.address_label': { ar: 'العنوان الكامل / البلدية', en: 'Full Address / Commune', fr: 'Adresse Complète / Commune' },
    'checkout.address_placeholder': { ar: 'البلدية، اسم الشارع، رقم العمارة أو المنزل...', en: 'Commune, Street name, Building or House number...', fr: 'Commune, nom de la rue, numéro de bâtiment ou de maison...' },
    'checkout.delivery_type_label': { ar: 'نوع التوصيل المفضل:', en: 'Preferred Delivery Type:', fr: 'Type de livraison préféré:' },
    'checkout.home_delivery': { ar: 'توصيل للمنزل (Home Delivery)', en: 'Home Delivery', fr: 'Livraison à domicile' },
    'checkout.home_delivery_price': { ar: 'السعر: حسب الولاية', en: 'Price: Depends on Wilaya', fr: 'Prix: Selon la wilaya' },
    'checkout.desk_delivery': { ar: 'استلام من المكتب (Stop Desk)', en: 'Stop Desk (Pickup)', fr: 'Stop Desk (Point relais)' },
    'checkout.desk_delivery_price': { ar: 'السعر: خيار اقتصادي', en: 'Price: Economic option', fr: 'Prix: Option économique' },
    'checkout.notes_label': { ar: 'ملاحظات خاصة بالموزع (اختياري)', en: 'Special notes for delivery (Optional)', fr: 'Notes spéciales pour le livreur (Optionnel)' },
    'checkout.notes_placeholder': { ar: 'أوقات التواجد المفضلة، تفاصيل إضافية...', en: 'Preferred availability times, extra details...', fr: 'Temps de disponibilité préférés, détails supplémentaires...' },
    'checkout.next_payment': { ar: 'التالي: اختيار طريقة الدفع', en: 'Next: Choose Payment Method', fr: 'Suivant: Choisir le mode de paiement' },
    'checkout.payment_method': { ar: 'طريقة الدفع', en: 'Payment Method', fr: 'Mode de paiement' },
    'checkout.cod_title': { ar: 'الدفع عند الاستلام (COD)', en: 'Cash on Delivery (COD)', fr: 'Paiement à la livraison (COD)' },
    'checkout.most_used': { ar: 'الأكثر استخداماً', en: 'Most Used', fr: 'Le plus utilisé' },
    'checkout.cod_desc': { ar: 'ادفع نقداً ومباشرة عند استلام الطلب من موزع شركة التوصيل.', en: 'Pay in cash directly when receiving the order from the delivery person.', fr: 'Payez en espèces directement à la réception de la commande.' },
    'checkout.epay_title': { ar: 'الدفع الإلكتروني (البطاقة الذهبية / CIB)', en: 'E-Payment (Edahabia / CIB)', fr: 'Paiement électronique (Edahabia / CIB)' },
    'checkout.epay_desc': { ar: 'دفع فوري وآمن عبر بوابة الدفع الإلكتروني الجزائرية الرسمية.', en: 'Instant and secure payment via the official Algerian e-payment gateway.', fr: 'Paiement instantané et sécurisé via le portail officiel de paiement électronique algérien.' },
    'checkout.ccp_title': { ar: 'تحويل بريدي / بنكي (CCP / BaridiMob)', en: 'Postal / Bank Transfer (CCP / BaridiMob)', fr: 'Virement postal / bancaire (CCP / BaridiMob)' },
    'checkout.ccp_desc': { ar: 'إرسال المبلغ إلى الحساب البريدي وتأكيد الطلب بإرسال الوصل.', en: 'Send the amount to the postal account and confirm the order by sending the receipt.', fr: 'Envoyez le montant sur le compte postal et confirmez la commande en envoyant le reçu.' },
    'checkout.ccp_info_title': { ar: 'معلومات الحساب البريدي (CCP / BaridiMob)', en: 'Postal Account Information (CCP / BaridiMob)', fr: 'Informations du compte postal (CCP / BaridiMob)' },
    'checkout.ccp_info_desc': { ar: 'يرجى تحويل إجمالي الطلب إلى الحساب التالي وإرسال صورة الوصل عبر واتساب أو البريد:', en: 'Please transfer the total order amount to the following account and send the receipt photo via WhatsApp or Email:', fr: 'Veuillez transférer le montant total de la commande sur le compte suivant et envoyer la photo du reçu via WhatsApp ou par e-mail:' },
    'checkout.ccp_account_number': { ar: 'رقم الحساب البريدي (CCP):', en: 'Postal Account Number (CCP):', fr: 'Numéro de compte postal (CCP):' },
    'checkout.ccp_key': { ar: 'المفتاح', en: 'Key', fr: 'Clé' },
    'checkout.ccp_name': { ar: 'الاسم:', en: 'Name:', fr: 'Nom:' },
    'checkout.prev_shipping': { ar: 'السابق: معلومات الشحن', en: 'Previous: Shipping Info', fr: 'Précédent: Infos d\'expédition' },
    'checkout.next_review': { ar: 'التالي: مراجعة الطلب', en: 'Next: Review Order', fr: 'Suivant: Réviser la commande' },
    'checkout.review_title': { ar: 'مراجعة وتأكيد الطلب', en: 'Review and Confirm Order', fr: 'Réviser et confirmer la commande' },
    'checkout.summary_title': { ar: 'ملخص المنتجات والتوصيل', en: 'Products & Delivery Summary', fr: 'Résumé des produits et de la livraison' },
    'checkout.subtotal': { ar: 'المجموع الفرعي للمنتجات:', en: 'Products Subtotal:', fr: 'Sous-total des produits:' },
    'checkout.shipping_cost': { ar: 'تكلفة الشحن والتوصيل (', en: 'Shipping & Delivery Cost (', fr: 'Frais d\'expédition et de livraison (' },
    'checkout.discount': { ar: 'الخصم المطبق:', en: 'Applied Discount:', fr: 'Remise appliquée:' },
    'checkout.total': { ar: 'المبلغ الإجمالي المستحق:', en: 'Total Amount Due:', fr: 'Montant total dû:' },
    'checkout.agree': { ar: 'أوافق على', en: 'I agree to the', fr: 'J\'accepte les' },
    'checkout.tos': { ar: 'شروط الخدمة', en: 'Terms of Service', fr: 'Conditions d\'utilisation' },
    'checkout.and_policy': { ar: 'وسياسة الاسترجاع الخاصة بالمتجر.', en: 'and the store\'s return policy.', fr: 'et la politique de retour du magasin.' },
    'checkout.prev_payment': { ar: 'السابق: طريقة الدفع', en: 'Previous: Payment Method', fr: 'Précédent: Mode de paiement' },
    'checkout.confirm_btn': { ar: 'تأكيد الطلب الآن', en: 'Confirm Order Now', fr: 'Confirmer la commande maintenant' },
    'checkout.footer_desc': { ar: 'تسوق آمن وموثوق لـ 58 ولاية جزائرية مع ضمان الدفع عند الاستلام وسرعة الشحن.', en: 'Secure and reliable shopping for 58 Algerian wilayas with COD guarantee and fast shipping.', fr: 'Achats sécurisés et fiables pour les 58 wilayas algériennes avec garantie de paiement à la livraison et expédition rapide.' },
    'checkout.footer_links': { ar: 'روابط هامة', en: 'Important Links', fr: 'Liens importants' },
    'checkout.footer_support': { ar: 'دعم الطلبات', en: 'Order Support', fr: 'Support de commande' },
    'checkout.footer_protection': { ar: 'حماية تامة للبيانات والطلبات', en: 'Full data and order protection', fr: 'Protection totale des données et des commandes' },
    'checkout.footer_copyright': { ar: '© 2026 المتجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.', en: '© 2026 E-Store (MYSHOP). All rights reserved.', fr: '© 2026 E-Store (MYSHOP). Tous droits réservés.' },
    
    // JS messages
    'messages.cart_limit': { ar: 'لا يمكن إضافة أكثر من 20 قطعة من نفس المنتج', en: 'Cannot add more than 20 items of the same product', fr: 'Impossible d\'ajouter plus de 20 articles du même produit' },
    'messages.add_cart_error_2': { ar: 'حدث خطأ أثناء إضافة المنتج إلى عربة التسوق', en: 'Error adding product to cart', fr: 'Erreur lors de l\'ajout du produit au panier' },
    'messages.qty_limit': { ar: 'لا يمكن أن تتجاوز الكمية 20 قطعة', en: 'Quantity cannot exceed 20 items', fr: 'La quantité ne peut pas dépasser 20 articles' },
    'messages.update_qty_error': { ar: 'حدث خطأ أثناء تحديث كمية المنتج', en: 'Error updating product quantity', fr: 'Erreur lors de la mise à jour de la quantité du produit' },
    'messages.item_removed': { ar: 'تمت إزالة المنتج من السلة', en: 'Product removed from cart', fr: 'Produit retiré du panier' },
    'messages.remove_error': { ar: 'حدث خطأ أثناء إزالة المنتج من عربة التسوق', en: 'Error removing product from cart', fr: 'Erreur lors de la suppression du produit du panier' },
    'cart.summary': { ar: 'ملخص الطلب', en: 'Order Summary', fr: 'Résumé de la commande' },
    'cart.total_products': { ar: 'إجمالي المنتجات', en: 'Total Products', fr: 'Total des produits' },
    'cart.shipping': { ar: 'الشحن والتوصيل', en: 'Shipping & Delivery', fr: 'Expédition et livraison' },
    'cart.free': { ar: 'مجاني', en: 'Free', fr: 'Gratuit' },
    'cart.discount_code': { ar: 'كود خصم', en: 'Discount Code', fr: 'Code de réduction' },
    'cart.total': { ar: 'المبلغ الإجمالي', en: 'Total Amount', fr: 'Montant Total' },
    'cart.promo_placeholder': { ar: 'أدخل كود الخصم (مثل: SAVE10)', en: 'Enter discount code (e.g. SAVE10)', fr: 'Entrez le code de réduction (ex: SAVE10)' },
    'cart.apply_promo': { ar: 'تطبيق', en: 'Apply', fr: 'Appliquer' },
    'cart.checkout_btn': { ar: 'إتمام الشراء', en: 'Proceed to Checkout', fr: 'Passer à la caisse' },
    'cart.continue_shopping': { ar: 'متابعة التسوق', en: 'Continue Shopping', fr: 'Continuer vos achats' },
    'messages.cart_empty': { ar: 'عربة التسوق فارغة', en: 'Shopping cart is empty', fr: 'Le panier est vide' },
    'messages.promo_canceled': { ar: 'تم إلغاء كود الخصم', en: 'Discount code canceled', fr: 'Code de réduction annulé' },
    'messages.promo_success': { ar: 'تم تطبيق الخصم بنجاح! ({discount}%)', en: 'Discount applied successfully! ({discount}%)', fr: 'Réduction appliquée avec succès ! ({discount}%)' },
    'messages.promo_invalid': { ar: 'كود الخصم غير صالح. استخدم SAVE10 أو SAVE20', en: 'Invalid discount code. Use SAVE10 or SAVE20', fr: 'Code de réduction invalide. Utilisez SAVE10 ou SAVE20' },

    'messages.fetch_wilayas_error': { ar: 'فشل جلب الولايات', en: 'Failed to fetch wilayas', fr: 'Échec de la récupération des wilayas' },
    'checkout.select_wilaya_58': { ar: '-- اختر ولايتك (58 ولاية) --', en: '-- Select your Wilaya (58 Wilayas) --', fr: '-- Sélectionnez votre Wilaya (58 Wilayas) --' },
    'wilayas.algiers_16': { ar: '16 - الجزائر العاصمة (Alger)', en: '16 - Algiers (Alger)', fr: '16 - Alger' },
    'checkout.price_prefix': { ar: 'السعر:', en: 'Price:', fr: 'Prix:' },
    'messages.enter_address': { ar: 'يرجى إدخال العنوان بالتفصيل', en: 'Please enter your detailed address', fr: 'Veuillez entrer votre adresse détaillée' },
    'messages.cart_empty_redirect': { ar: 'عربة التسوق فارغة، جاري تحويلك للمتجر...', en: 'Cart is empty, redirecting to store...', fr: 'Le panier est vide, redirection vers la boutique...' },
    'cart.item_qty': { ar: 'الكمية: {qty}', en: 'Quantity: {qty}', fr: 'Quantité: {qty}' },
    'checkout.wilaya_fallback': { ar: 'الولاية', en: 'Wilaya', fr: 'Wilaya' },
    'messages.agree_tos': { ar: 'يرجى الموافقة على شروط الخدمة لتأكيد الطلب', en: 'Please agree to the Terms of Service to confirm your order', fr: 'Veuillez accepter les conditions d\'utilisation pour confirmer votre commande' },
    'messages.offline_error': { ar: 'عذراً، أنت غير متصل بالإنترنت حالياً. يلزم توفر اتصال فعلي لتأكيد الطلب والدفع.', en: 'Sorry, you are currently offline. An active internet connection is required to confirm the order and pay.', fr: 'Désolé, vous êtes actuellement hors ligne. Une connexion Internet active est requise pour confirmer la commande et payer.' },
    'messages.confirming_order_full': { ar: 'جاري تأكيد وتسجيل الطلب...', en: 'Confirming and registering order...', fr: 'Confirmation et enregistrement de la commande...' },
    'checkout.final_confirm': { ar: 'تأكيد الطلب نهائياً', en: 'Final Confirm Order', fr: 'Confirmation finale de la commande' },
    'checkout.algiers_fallback': { ar: 'الجزائر العاصمة', en: 'Algiers', fr: 'Alger' },
    'messages.create_order_fail': { ar: 'فشل في إنشاء الطلب', en: 'Failed to create order', fr: 'Échec de la création de la commande' },
};

['ar', 'en', 'fr'].forEach(lang => {
    const file = `locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    Object.keys(extraKeys).forEach(keyPath => {
        const parts = keyPath.split('.');
        let curr = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = extraKeys[keyPath][lang];
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
});
console.log('JSON files updated for cart/checkout.');
