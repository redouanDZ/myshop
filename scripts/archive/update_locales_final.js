const fs = require('fs');

const keys = {
    'account.confirm_pass_placeholder': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
    'account.save_changes_btn': { ar: 'حفظ التغيرات', en: 'Save Changes', fr: 'Enregistrer les modifications' },
    'account.saved_addresses': { ar: 'عناوين الشحن المكتوبة', en: 'Saved Shipping Addresses', fr: 'Adresses de livraison enregistrées' },
    'account.add_address': { ar: 'إضافة عنوان جديد', en: 'Add New Address', fr: 'Ajouter une nouvelle adresse' },
    'account.order_history': { ar: 'سجل الطلبات', en: 'Order History', fr: 'Historique des commandes' },
    'account.wishlist_tab': { ar: 'قائمة المفضلة', en: 'Wishlist', fr: 'Liste de souhaits' },
    'account.add_new_address': { ar: 'إضافة عنوان شحن جديد', en: 'Add New Shipping Address', fr: 'Ajouter une nouvelle adresse de livraison' },
    'account.address_title': { ar: 'اسم العنوان (مثال: المنزل، العمل)', en: 'Address Title (e.g. Home, Work)', fr: 'Titre de l\'adresse (ex: Maison, Travail)' },
    'account.address_title_placeholder': { ar: 'المنزل', en: 'Home', fr: 'Maison' },
    'account.recipient_name': { ar: 'الاسم الكامل للمستلم', en: 'Recipient Full Name', fr: 'Nom complet du destinataire' },
    'account.recipient_name_placeholder': { ar: 'الاسم الكامل', en: 'Full Name', fr: 'Nom complet' },
    'account.city_wilaya': { ar: 'المدينة / الولاية', en: 'City / Wilaya', fr: 'Ville / Wilaya' },
    'account.algiers_placeholder': { ar: 'الجزائر العاصمة', en: 'Algiers', fr: 'Alger' },
    'account.detailed_address': { ar: 'العنوان التفصيلي', en: 'Detailed Address', fr: 'Adresse détaillée' },
    'account.detailed_address_placeholder': { ar: 'اسم الشارع، رقم العمارة، الشقة...', en: 'Street name, Building number, Apartment...', fr: 'Nom de la rue, Numéro de bâtiment, Appartement...' },
    'account.set_default': { ar: 'تعيين كعنوان افتراضي', en: 'Set as Default Address', fr: 'Définir comme adresse par défaut' },
    'common.cancel': { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' },
    'account.save_address': { ar: 'حفظ العنوان', en: 'Save Address', fr: 'Enregistrer l\'adresse' },
    'account.footer_desc': { ar: 'لوحة التحكم وإدارة الحساب والطلبات السابقة وعناوين الشحن بكل سهولة وأمان.', en: 'Dashboard to easily and securely manage your account, previous orders, and shipping addresses.', fr: 'Tableau de bord pour gérer facilement et en toute sécurité votre compte, vos commandes précédentes et vos adresses de livraison.' },
    'footer.customer_service': { ar: 'خدمة العملاء', en: 'Customer Service', fr: 'Service Client' },
    'footer.data_protected': { ar: 'بيانات مشفرة ومحمية', en: 'Data encrypted and protected', fr: 'Données cryptées et protégées' },
    'account.user_default': { ar: 'مستخدم', en: 'User', fr: 'Utilisateur' },
    'messages.pass_mismatch': { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas' },
    'messages.data_update_success': { ar: 'تم تحديث البيانات بنجاح 🎉', en: 'Data updated successfully 🎉', fr: 'Données mises à jour avec succès 🎉' },
    'messages.data_update_error': { ar: 'حدث خطأ في تحديث البيانات', en: 'Error updating data', fr: 'Erreur lors de la mise à jour des données' },
    'messages.server_error': { ar: 'خطأ في الاتصال بالخادم', en: 'Server connection error', fr: 'Erreur de connexion au serveur' },
    'account.no_addresses': { ar: 'لا توجد عناوين شحن محفوظة حتى الآن.', en: 'No shipping addresses saved yet.', fr: 'Aucune adresse de livraison enregistrée pour le moment.' },
    'account.default_address_badge': { ar: 'العنوان الافتراضي', en: 'Default Address', fr: 'Adresse par défaut' },
    'account.address_fallback': { ar: 'عنوان', en: 'Address', fr: 'Adresse' },
    'account.recipient_label': { ar: 'المستلم:', en: 'Recipient:', fr: 'Destinataire:' },
    'account.phone_label': { ar: 'الهاتف:', en: 'Phone:', fr: 'Téléphone:' },
    'account.city_label': { ar: 'المدينة:', en: 'City:', fr: 'Ville:' },
    'account.address_label': { ar: 'العنوان:', en: 'Address:', fr: 'Adresse:' },
    'common.delete': { ar: 'حذف', en: 'Delete', fr: 'Supprimer' },
    'messages.address_saved': { ar: 'تم حفظ العنوان بنجاح', en: 'Address saved successfully', fr: 'Adresse enregistrée avec succès' },
    'messages.address_save_error': { ar: 'حدث خطأ أثناء حفظ العنوان', en: 'Error saving address', fr: 'Erreur lors de l\'enregistrement de l\'adresse' },
    'messages.confirm_delete_address': { ar: 'هل أنت تأكد من إزالة هذا العنوان؟', en: 'Are you sure you want to remove this address?', fr: 'Êtes-vous sûr de vouloir supprimer cette adresse ?' },
    'messages.address_deleted': { ar: 'تم حذف العنوان بنجاح', en: 'Address deleted successfully', fr: 'Adresse supprimée avec succès' },
    'messages.delete_error': { ar: 'حدث خطأ في الحذف', en: 'Error deleting', fr: 'Erreur lors de la suppression' },
    'account.no_orders_yet': { ar: 'لم تقم بإجراء أي طلبات بعد.', en: 'You have not made any orders yet.', fr: 'Vous n\'avez pas encore passé de commande.' },
    'account.order_id': { ar: 'طلب #{id}', en: 'Order #{id}', fr: 'Commande #{id}' },
    'common.currency_alt': { ar: 'د.ج', en: 'DZD', fr: 'DA' },
    'account.view_details': { ar: 'عرض التفاصيل', en: 'View Details', fr: 'Voir les détails' },
    'account.status_pending_alt': { ar: 'قيد الانتظار', en: 'Pending', fr: 'En attente' },
    'account.status_processing_alt': { ar: 'جاري المعالجة', en: 'Processing', fr: 'En traitement' },
    'account.wishlist_empty': { ar: 'قائمة المفضلة فارغة حالياً.', en: 'Wishlist is currently empty.', fr: 'La liste de souhaits est actuellement vide.' },
    'wishlist.page_title_alt': { ar: 'قائمة الرغبات والمفضلة', en: 'Wishlist and Favorites', fr: 'Liste de souhaits et favoris' },
    'wishlist.saved_products': { ar: 'المنتجات المحفوظة', en: 'Saved Products', fr: 'Produits enregistrés' },
    'wishlist.products_count': { ar: 'منتجات', en: 'Products', fr: 'Produits' },
    'wishlist.loading': { ar: 'جاري تحميل قائمة الرغبات...', en: 'Loading wishlist...', fr: 'Chargement de la liste de souhaits...' },
    'wishlist.footer_desc': { ar: 'احفظ منتجاتك المفضلة وتتبع توفرها وعروضها الخاصة في أي وقت.', en: 'Save your favorite products and track their availability and special offers anytime.', fr: 'Enregistrez vos produits préférés et suivez leur disponibilité et leurs offres spéciales à tout moment.' },
    'footer.reliable_shopping': { ar: 'تجربة تسوق موثوقة 100%', en: '100% reliable shopping experience', fr: 'Expérience d\'achat 100% fiable' },
    'wishlist.empty_msg_alt': { ar: 'لم تقم بحفظ أي منتجات في المفضلة بعد. استكشف متجرنا وأضف المنتجات التي تنال إعجابك!', en: 'You haven\'t saved any products in your wishlist yet. Explore our store and add products you like!', fr: 'Vous n\'avez encore enregistré aucun produit dans vos favoris. Explorez notre boutique et ajoutez les produits que vous aimez !' }
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

console.log('Final JSON locales updated.');
