const fs = require('fs');

const keys = {
    'shop.meta_title': { ar: 'التسوق - متجر الإلكتروني', en: 'Shop - E-Store', fr: 'Boutique - E-Store' },
    'shop.title': { ar: 'التسوق', en: 'Shop', fr: 'Boutique' },
    'shop.filters_title': { ar: 'فلاتر المنتجات', en: 'Product Filters', fr: 'Filtres de produits' },
    'shop.reset_filters': { ar: 'إعادة ضبط', en: 'Reset', fr: 'Réinitialiser' },
    'shop.categories_title': { ar: 'التصنيفات', en: 'Categories', fr: 'Catégories' },
    'shop.cat_all': { ar: 'الكل', en: 'All', fr: 'Tout' },
    'shop.max_price_title': { ar: 'أقصى سعر (دج)', en: 'Max Price (DZD)', fr: 'Prix Max (DA)' },
    'shop.price_up_to': { ar: 'حتى:', en: 'Up to:', fr: 'Jusqu\'à:' },
    'shop.rating_title': { ar: 'التقييم', en: 'Rating', fr: 'Évaluation' },
    'shop.all_ratings': { ar: 'جميع التقييمات', en: 'All Ratings', fr: 'Toutes les évaluations' },
    'shop.stars_4_5': { ar: '⭐ 4.5 فما فوق (ممتاز)', en: '⭐ 4.5 & up (Excellent)', fr: '⭐ 4.5 & plus (Excellent)' },
    'shop.stars_4_0': { ar: '⭐ 4.0 فما فوق (جيد جداً)', en: '⭐ 4.0 & up (Very Good)', fr: '⭐ 4.0 & plus (Très bien)' },
    'shop.stars_3_0': { ar: '⭐ 3.0 فما فوق', en: '⭐ 3.0 & up', fr: '⭐ 3.0 & plus' },
    'shop.availability_title': { ar: 'التوفر في المتجر', en: 'Availability', fr: 'Disponibilité' },
    'shop.in_stock_only': { ar: 'المتوفر في المخزون فقط', en: 'In Stock Only', fr: 'En stock uniquement' },
    'shop.search_placeholder': { ar: 'ابحث عن منتج بالاسم...', en: 'Search for product by name...', fr: 'Rechercher un produit par nom...' },
    'shop.sort_newest': { ar: 'الأحدث أولاً', en: 'Newest First', fr: 'Le plus récent d\'abord' },
    'shop.sort_rating': { ar: 'التقييم: الأعلى تقييماً ⭐', en: 'Rating: Highest Rated ⭐', fr: 'Évaluation : Les mieux notés ⭐' },
    'shop.sort_price_asc': { ar: 'السعر: الأقل إلى الأعلى', en: 'Price: Low to High', fr: 'Prix : Croissant' },
    'shop.sort_price_desc': { ar: 'السعر: الأعلى إلى الأقل', en: 'Price: High to Low', fr: 'Prix : Décroissant' },
    'shop.sort_name_asc': { ar: 'الاسم: أ-ي', en: 'Name: A-Z', fr: 'Nom : A-Z' },
    'shop.sort_name_desc': { ar: 'الاسم: ي-أ', en: 'Name: Z-A', fr: 'Nom : Z-A' },

    'product.meta_title': { ar: 'تفاصيل المنتج - متجر الإلكتروني', en: 'Product Details - E-Store', fr: 'Détails du produit - E-Store' },
    'product.page_title': { ar: 'تفاصيل المنتج', en: 'Product Details', fr: 'Détails du produit' },
    'product.main_image_alt': { ar: 'المنتج الرئيسي', en: 'Main Product', fr: 'Produit principal' },
    'product.color_label': { ar: 'اللون:', en: 'Color:', fr: 'Couleur:' },
    'product.size_label': { ar: 'المقاس:', en: 'Size:', fr: 'Taille:' },
    'product.add_wishlist_title': { ar: 'أضف للمفضلة', en: 'Add to Wishlist', fr: 'Ajouter aux favoris' },
    'product.quick_buy_title': { ar: 'الشراء السريع (الدفع عند الاستلام)', en: 'Quick Buy (Cash on Delivery)', fr: 'Achat Rapide (Paiement à la livraison)' },
    'product.direct_order': { ar: 'طلب مباشر', en: 'Direct Order', fr: 'Commande Directe' },
    'product.name_placeholder': { ar: 'مثال: أحمد بن علي', en: 'e.g. Ahmed Ben Ali', fr: 'ex: Ahmed Ben Ali' },
    'product.select_wilaya': { ar: '-- اختر الولاية --', en: '-- Select Wilaya --', fr: '-- Sélectionnez la Wilaya --' },
    'product.address_placeholder': { ar: 'البلدية أو العنوان', en: 'Commune or Address', fr: 'Commune ou Adresse' },
    'product.delivery_type': { ar: 'نوع التوصيل', en: 'Delivery Type', fr: 'Type de livraison' },
    'product.to_home': { ar: '🏠 للمنزل (', en: '🏠 To Home (', fr: '🏠 À Domicile (' },
    'product.to_desk': { ar: '🏢 للمكتب (', en: '🏢 To Desk (', fr: '🏢 Au Bureau (' },
    'product.products_price': { ar: 'سعر المنتجات (', en: 'Products Price (', fr: 'Prix des produits (' },
    'product.delivery_cost': { ar: 'تكلفة التوصيل:', en: 'Delivery Cost:', fr: 'Frais de livraison:' },
    'product.total_price': { ar: 'المجموع الإجمالي:', en: 'Total Price:', fr: 'Prix Total:' },
    'product.confirm_order_now': { ar: 'اضغط هنا لتأكيد الطلب الآن ⚡', en: 'Click here to confirm order now ⚡', fr: 'Cliquez ici pour confirmer la commande maintenant ⚡' },
    'product.shipping_58_wilayas': { ar: 'شحن متوفر لـ 58 ولاية', en: 'Shipping available to 58 wilayas', fr: 'Livraison disponible pour 58 wilayas' },
    'product.cod_available': { ar: 'الدفع نقداً عند الاستلام', en: 'Cash on delivery available', fr: 'Paiement à la livraison disponible' },
    'product.authentic_guarantee': { ar: 'منتج أصلي ومضمون 100%', en: '100% Authentic and guaranteed', fr: '100% Authentique et garanti' },
    'product.brand': { ar: 'العلامة التجارية', en: 'Brand', fr: 'Marque' },
    'product.certified_product': { ar: 'منتج معتمد', en: 'Certified Product', fr: 'Produit Certifié' },
    'product.warranty': { ar: 'الضمان', en: 'Warranty', fr: 'Garantie' },
    'product.warranty_desc': { ar: 'ضمان الجودة ضد عيوب الصناعة', en: 'Quality warranty against manufacturing defects', fr: 'Garantie de qualité contre les défauts de fabrication' },
    'product.review_placeholder': { ar: 'اكتب مراجعتك هنا...', en: 'Write your review here...', fr: 'Écrivez votre avis ici...' },
    'product.shipping_policy': { ar: 'نوفر خدمة التوصيل السريع والآمن إلى كافة ولايات الجزائر (58 ولاية). يتم حساب سعر الشحن تلقائياً عند الدفع بناءً على الولاية المختارة ونوع التوصيل (منزلي أو مكتب استلام).', en: 'We provide fast and safe delivery to all wilayas of Algeria (58 wilayas). Shipping price is calculated automatically at checkout based on the selected wilaya and delivery type (home or desk).', fr: 'Nous assurons une livraison rapide et sûre dans toutes les wilayas d\'Algérie (58 wilayas). Le prix d\'expédition est calculé automatiquement à la caisse en fonction de la wilaya sélectionnée et du type de livraison (domicile ou bureau).' },
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
console.log('JSON files updated.');
