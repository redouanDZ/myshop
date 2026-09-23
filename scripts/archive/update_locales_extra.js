const fs = require('fs');

const extraKeys = {
    'messages.fetch_products_error': { ar: 'خطأ في جلب المنتجات', en: 'Error fetching products', fr: 'Erreur de récupération des produits' },
    'messages.load_products_error': { ar: 'حدث خطأ في تحميل المنتجات. يرجى المحاولة لاحقاً.', en: 'Error loading products. Please try again later.', fr: 'Erreur de chargement des produits. Veuillez réessayer plus tard.' },
    'shop.products_found': { ar: 'عُثر على ({count}) منتج', en: 'Found ({count}) products', fr: 'Trouvé ({count}) produits' },
    'shop.empty_title': { ar: 'لم نجد منتجات مطابقة لخيارات البحث', en: 'No products matched your search', fr: 'Aucun produit ne correspond à votre recherche' },
    'shop.empty_desc': { ar: 'جرب استخدام كلمات بحث مختلفة أو قم بتوسيع نطاق السعر والتصنيفات المختارة.', en: 'Try using different keywords or expanding price and category filters.', fr: 'Essayez d\'utiliser des mots-clés différents ou d\'élargir les filtres de prix et de catégorie.' },
    'shop.reset_filters_btn': { ar: 'إعادة تعيين الفلاتر', en: 'Reset Filters', fr: 'Réinitialiser les filtres' },
    'shop.prev_page': { ar: ' السابق', en: ' Previous', fr: ' Précédent' },
    'shop.next_page': { ar: 'التالي', en: 'Next', fr: 'Suivant' },
    'messages.product_not_found': { ar: 'تعذر العثور على بيانات المنتج', en: 'Could not find product data', fr: 'Impossible de trouver les données du produit' },
    'messages.add_cart_success_name': { ar: 'تمت إضافة "{name}" إلى سلة التسوق 🛒', en: '"{name}" added to cart 🛒', fr: '"{name}" ajouté au panier 🛒' },
    
    'messages.fetch_product_error': { ar: 'خطأ في جلب المنتج', en: 'Error fetching product', fr: 'Erreur de récupération du produit' },
    'product.no_description': { ar: 'وصف غير متوفر', en: 'No description available', fr: 'Aucune description disponible' },
    'product.out_of_stock_now': { ar: 'نفد المخزون حالياً', en: 'Out of stock currently', fr: 'En rupture de stock actuellement' },
    'product.hurry_stock': { ar: '⚠️ سارع بالطلب! متبقي {count} قطع فقط في المخزون', en: '⚠️ Hurry! Only {count} items left in stock', fr: '⚠️ Dépêchez-vous ! Il ne reste que {count} articles en stock' },
    'product.image_alt': { ar: 'صورة {index}', en: 'Image {index}', fr: 'Image {index}' },
    'messages.load_product_error': { ar: 'خطأ في تحميل المنتج', en: 'Error loading product', fr: 'Erreur de chargement du produit' },
    'product.no_reviews_yet': { ar: 'لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيّم هذا المنتج!', en: 'No reviews for this product yet. Be the first to review!', fr: 'Aucun avis pour ce produit pour le moment. Soyez le premier à donner votre avis !' },
    'product.store_customer': { ar: 'عميل المتجر', en: 'Store Customer', fr: 'Client du magasin' },
    'product.available_options': { ar: 'الخيارات المتاحة (المقاس / اللون / السعة):', en: 'Available options (Size / Color / Capacity):', fr: 'Options disponibles (Taille / Couleur / Capacité):' },
    'colors.black': { ar: 'أسود', en: 'Black', fr: 'Noir' },
    'colors.white': { ar: 'أبيض', en: 'White', fr: 'Blanc' },
    'colors.blue': { ar: 'أزرق', en: 'Blue', fr: 'Bleu' },
    'messages.add_wishlist_success': { ar: 'تمت إضافة المنتج إلى قائمة الرغبات', en: 'Product added to wishlist', fr: 'Produit ajouté à la liste de souhaits' },
    'messages.review_validation': { ar: 'يرجى اختيار التقييم بالنجوم وكتابة تعليقك', en: 'Please select star rating and write a comment', fr: 'Veuillez sélectionner une note par étoiles et écrire un commentaire' },
    'common.sending': { ar: 'جاري الإرسال...', en: 'Sending...', fr: 'Envoi en cours...' },
    'messages.login_to_review': { ar: 'يرجى تسجيل الدخول أولاً لإضافة تقييمك ⭐', en: 'Please login first to add your review ⭐', fr: 'Veuillez vous connecter d\'abord pour ajouter votre avis ⭐' },
    'messages.login_to_review_alt': { ar: 'يرجى تسجيل الدخول أولاً لإضافة تقييمك', en: 'Please login first to add your review', fr: 'Veuillez vous connecter d\'abord pour ajouter votre avis' },
    'messages.submit_review_fail': { ar: 'فشل إرسال التقييم', en: 'Failed to submit review', fr: 'Échec de la soumission de l\'avis' },
    'messages.submit_review_success': { ar: 'تمت إضافة تقييمك بنجاح! ⭐', en: 'Review added successfully! ⭐', fr: 'Avis ajouté avec succès ! ⭐' },
    'product.no_similar_products': { ar: 'لا توجد منتجات مشابهة حالياً', en: 'No similar products currently', fr: 'Aucun produit similaire actuellement' },
    'product.no_similar_products_alt': { ar: 'لا توجد منتجات مشابهة', en: 'No similar products', fr: 'Aucun produit similaire' },
    'product.view_details': { ar: 'عرض التفاصيل', en: 'View Details', fr: 'Voir les détails' },
    'wilayas.algiers': { ar: 'الجزائر', en: 'Algiers', fr: 'Alger' },
    'wilayas.oran': { ar: 'وهران', en: 'Oran', fr: 'Oran' },
    'wilayas.constantine': { ar: 'قسنطينة', en: 'Constantine', fr: 'Constantine' },
    'wilayas.setif': { ar: 'سطيف', en: 'Setif', fr: 'Sétif' },
    'wilayas.blida': { ar: 'البليدة', en: 'Blida', fr: 'Blida' },
    'messages.enter_full_name': { ar: 'يرجى إدخال الاسم الكامل', en: 'Please enter your full name', fr: 'Veuillez entrer votre nom complet' },
    'messages.enter_valid_phone': { ar: 'يرجى إدخال رقم هاتف جزائري صحيح', en: 'Please enter a valid Algerian phone number', fr: 'Veuillez entrer un numéro de téléphone algérien valide' },
    'messages.select_wilaya': { ar: 'يرجى اختيار الولاية', en: 'Please select a Wilaya', fr: 'Veuillez sélectionner une Wilaya' },
    'messages.confirming_order': { ar: 'جاري تأكيد طلبك...', en: 'Confirming your order...', fr: 'Confirmation de votre commande...' },
    'messages.order_confirm_fail': { ar: 'تعذر تأكيد الطلب، يرجى المحاولة لاحقاً', en: 'Could not confirm order, please try again later', fr: 'Impossible de confirmer la commande, veuillez réessayer plus tard' },
    'messages.order_error': { ar: 'حدث خطأ أثناء تأكيد الطلب', en: 'An error occurred while confirming order', fr: 'Une erreur s\'est produite lors de la confirmation de la commande' }
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
console.log('Extra keys added to locales.');
