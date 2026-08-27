const fs = require('fs');

const translations = [
    {
        ar: 'متجري - المتجر الإلكتروني التقني المتكامل',
        en: 'MyShop - The Complete Tech E-Store',
        fr: 'MyShop - La Boutique High-Tech Complète',
        key: 'home.meta.title',
        replace: ['<title>متجري - المتجر الإلكتروني التقني المتكامل</title>', '<title data-i18n="home.meta.title">متجري - المتجر الإلكتروني التقني المتكامل</title>']
    },
    {
        ar: 'متجر إلكتروني حديث يقدم أفضل الأجهزة الإلكترونية والتقنية في الجزائر بأسعار تنافسية وتوصيل سريع.',
        en: 'A modern e-store offering the best electronics in Algeria with competitive prices and fast delivery.',
        fr: 'Une boutique moderne offrant les meilleurs appareils électroniques en Algérie avec des prix compétitifs et livraison rapide.',
        key: 'home.meta.description',
        replace: ['content="متجر إلكتروني حديث يقدم أفضل الأجهزة الإلكترونية والتقنية في الجزائر بأسعار تنافسية وتوصيل سريع."', 'data-i18n="home.meta.description" content="متجر إلكتروني حديث يقدم أفضل الأجهزة الإلكترونية والتقنية في الجزائر بأسعار تنافسية وتوصيل سريع."']
    },
    {
        ar: 'متجري - متجر الإلكترونيات العصرية',
        en: 'MyShop - Modern Electronics Store',
        fr: 'MyShop - Magasin d\'électronique moderne',
        key: 'home.meta.og_title',
        replace: ['content="متجري - متجر الإلكترونيات العصرية"', 'data-i18n="home.meta.og_title" content="متجري - متجر الإلكترونيات العصرية"']
    },
    {
        ar: 'تسوق أحدث الحواسيب والملحقات التقنية بأفضل الأسعار.',
        en: 'Shop the latest computers and tech accessories at the best prices.',
        fr: 'Achetez les derniers ordinateurs et accessoires tech aux meilleurs prix.',
        key: 'home.meta.og_desc',
        replace: ['content="تسوق أحدث الحواسيب والملحقات التقنية بأفضل الأسعار."', 'data-i18n="home.meta.og_desc" content="تسوق أحدث الحواسيب والملحقات التقنية بأفضل الأسعار."']
    },
    {
        ar: 'تبديل الوضع',
        en: 'Toggle Theme',
        fr: 'Changer le thème',
        key: 'common.toggle_theme',
        replace: ['title="تبديل الوضع"', 'data-i18n="common.toggle_theme" title="تبديل الوضع"']
    },
    {
        ar: 'المفضلة',
        en: 'Wishlist',
        fr: 'Favoris',
        key: 'common.wishlist',
        replace: ['title="المفضلة"', 'data-i18n="common.wishlist" title="المفضلة"']
    },
    {
        ar: 'السلة',
        en: 'Cart',
        fr: 'Panier',
        key: 'common.cart_title',
        replace: ['title="السلة"', 'data-i18n="common.cart_title" title="السلة"']
    },
    {
        ar: 'حسابي',
        en: 'My Account',
        fr: 'Mon Compte',
        key: 'common.my_account',
        replace: ['title="حسابي"', 'data-i18n="common.my_account" title="حسابي"']
    },
    {
        ar: 'القائمة',
        en: 'Menu',
        fr: 'Menu',
        key: 'common.menu',
        replace: ['aria-label="القائمة"', 'data-i18n="common.menu" aria-label="القائمة"']
    },
    {
        ar: 'ابحث عن هاتف، حاسوب، ملحقات تقنية...',
        en: 'Search for phone, laptop, tech accessories...',
        fr: 'Rechercher un téléphone, ordinateur, accessoires...',
        key: 'common.search_placeholder',
        replace: ['placeholder="ابحث عن هاتف، حاسوب، ملحقات تقنية..."', 'data-i18n="common.search_placeholder" placeholder="ابحث عن هاتف، حاسوب، ملحقات تقنية..."']
    },
    {
        ar: '🇩🇿 المتجر الإلكتروني الموثوق في الجزائر',
        en: '🇩🇿 The trusted e-store in Algeria',
        fr: '🇩🇿 La boutique de confiance en Algérie',
        key: 'home.trusted_badge',
        replace: ['<span>🇩🇿 المتجر الإلكتروني الموثوق في الجزائر</span>', '<span data-i18n="home.trusted_badge">🇩🇿 المتجر الإلكتروني الموثوق في الجزائر</span>']
    },
    {
        ar: 'تسوق أفضل الأجهزة والمنتجات التقنية بأسعار منافسة',
        en: 'Shop the best tech devices and products at competitive prices',
        fr: 'Achetez les meilleurs appareils et produits tech à des prix compétitifs',
        key: 'home.hero_title',
        replace: ['<h1>تسوق أفضل الأجهزة والمنتجات التقنية بأسعار منافسة</h1>', '<h1 data-i18n="home.hero_title">تسوق أفضل الأجهزة والمنتجات التقنية بأسعار منافسة</h1>']
    },
    {
        ar: 'توصيل سريع وموثوق إلى 58 ولاية مع إمكانية الدفع عند الاستلام وضمان الجودة وأصالة المنتجات 100%.',
        en: 'Fast and reliable delivery to 58 wilayas with cash on delivery and 100% authentic products guarantee.',
        fr: 'Livraison rapide et fiable vers 58 wilayas avec paiement à la livraison et garantie d\'authenticité à 100%.',
        key: 'home.hero_subtitle',
        replace: ['<p>توصيل سريع وموثوق إلى 58 ولاية مع إمكانية الدفع عند الاستلام وضمان الجودة وأصالة المنتجات 100%.</p>', '<p data-i18n="home.hero_subtitle">توصيل سريع وموثوق إلى 58 ولاية مع إمكانية الدفع عند الاستلام وضمان الجودة وأصالة المنتجات 100%.</p>']
    },
    {
        ar: 'ابدأ التسوق الآن',
        en: 'Start Shopping Now',
        fr: 'Commencez vos achats',
        key: 'home.start_shopping',
        replace: ['> ابدأ التسوق الآن', ' data-i18n="home.start_shopping">> ابدأ التسوق الآن']
    },
    {
        ar: 'تتبع طلبك الحالي',
        en: 'Track your order',
        fr: 'Suivre votre commande',
        key: 'home.track_order_btn',
        replace: ['> تتبع طلبك الحالي', ' data-i18n="home.track_order_btn">> تتبع طلبك الحالي']
    },
    {
        ar: 'الدفع عند الاستلام',
        en: 'Cash on Delivery',
        fr: 'Paiement à la livraison',
        key: 'features.cod_title',
        replace: ['<h3>الدفع عند الاستلام</h3>', '<h3 data-i18n="features.cod_title">الدفع عند الاستلام</h3>']
    },
    {
        ar: 'ادفع براحة وأمان بعد استلام وفحص طلبك في منزلك',
        en: 'Pay comfortably and safely after receiving your order',
        fr: 'Payez confortablement et en toute sécurité à la livraison',
        key: 'features.cod_desc',
        replace: ['<p>ادفع براحة وأمان بعد استلام وفحص طلبك في منزلك</p>', '<p data-i18n="features.cod_desc">ادفع براحة وأمان بعد استلام وفحص طلبك في منزلك</p>']
    },
    {
        ar: 'توصيل لكافة 58 ولاية',
        en: 'Delivery to all 58 Wilayas',
        fr: 'Livraison vers les 58 Wilayas',
        key: 'features.delivery_title',
        replace: ['<h3>توصيل لكافة 58 ولاية</h3>', '<h3 data-i18n="features.delivery_title">توصيل لكافة 58 ولاية</h3>']
    },
    {
        ar: 'شحن سريع إلى باب منزلك أو أقرب مكتب استلام',
        en: 'Fast shipping to your door or nearest desk',
        fr: 'Expédition rapide à votre porte ou bureau',
        key: 'features.delivery_desc',
        replace: ['<p>شحن سريع إلى باب منزلك أو أقرب مكتب استلام</p>', '<p data-i18n="features.delivery_desc">شحن سريع إلى باب منزلك أو أقرب مكتب استلام</p>']
    },
    {
        ar: 'منتجات أصلية 100%',
        en: '100% Authentic Products',
        fr: 'Produits 100% Authentiques',
        key: 'features.authentic_title',
        replace: ['<h3>منتجات أصلية 100%</h3>', '<h3 data-i18n="features.authentic_title">منتجات أصلية 100%</h3>']
    },
    {
        ar: 'ضمان رسمي وجودة عالية مفحوصة بدقة',
        en: 'Official warranty and high quality carefully inspected',
        fr: 'Garantie officielle et haute qualité soigneusement inspectée',
        key: 'features.authentic_desc',
        replace: ['<p>ضمان رسمي وجودة عالية مفحوصة بدقة</p>', '<p data-i18n="features.authentic_desc">ضمان رسمي وجودة عالية مفحوصة بدقة</p>']
    },
    {
        ar: 'دعم عملاء ومتابعة',
        en: 'Customer Support & Tracking',
        fr: 'Support Client & Suivi',
        key: 'features.support_title',
        replace: ['<h3>دعم عملاء ومتابعة</h3>', '<h3 data-i18n="features.support_title">دعم عملاء ومتابعة</h3>']
    },
    {
        ar: 'فريق متخصص لمساعدتك ومتابعة الشحنة حتى وصولها',
        en: 'Specialized team to help and track your shipment until arrival',
        fr: 'Équipe spécialisée pour aider et suivre votre envoi jusqu\'à l\'arrivée',
        key: 'features.support_desc',
        replace: ['<p>فريق متخصص لمساعدتك ومتابعة الشحنة حتى وصولها</p>', '<p data-i18n="features.support_desc">فريق متخصص لمساعدتك ومتابعة الشحنة حتى وصولها</p>']
    },
    {
        ar: 'جميع المنتجات',
        en: 'All Products',
        fr: 'Tous les produits',
        key: 'categories.all',
        replace: ['> جميع المنتجات', ' data-i18n="categories.all">> جميع المنتجات']
    },
    {
        ar: 'إلكترونيات',
        en: 'Electronics',
        fr: 'Électronique',
        key: 'categories.electronics',
        replace: ['> إلكترونيات', ' data-i18n="categories.electronics">> إلكترونيات']
    },
    {
        ar: 'هواتف وملحقات',
        en: 'Phones & Accessories',
        fr: 'Téléphones & Accessoires',
        key: 'categories.phones',
        replace: ['> هواتف وملحقات', ' data-i18n="categories.phones">> هواتف وملحقات']
    },
    {
        ar: 'صوتيات وسماعات',
        en: 'Audio & Headphones',
        fr: 'Audio & Écouteurs',
        key: 'categories.audio',
        replace: ['> صوتيات وسماعات', ' data-i18n="categories.audio">> صوتيات وسماعات']
    },
    {
        ar: 'أزياء وملابس',
        en: 'Fashion & Clothing',
        fr: 'Mode & Vêtements',
        key: 'categories.fashion',
        replace: ['> أزياء وملابس', ' data-i18n="categories.fashion">> أزياء وملابس']
    },
    {
        ar: 'كتب ومراجع',
        en: 'Books & References',
        fr: 'Livres & Références',
        key: 'categories.books',
        replace: ['> كتب ومراجع', ' data-i18n="categories.books">> كتب ومراجع']
    },
    {
        ar: 'المنتجات المميزة',
        en: 'Featured Products',
        fr: 'Produits en vedette',
        key: 'home.featured_title',
        replace: ['>المنتجات المميزة</h2', ' data-i18n="home.featured_title">المنتجات المميزة</h2']
    },
    {
        ar: 'اخترنا لك أفضل المنتجات ذات التقييمات العالية',
        en: 'We chose the best highly-rated products for you',
        fr: 'Nous avons choisi pour vous les meilleurs produits bien notés',
        key: 'home.featured_subtitle',
        replace: ['>اخترنا لك أفضل المنتجات ذات التقييمات العالية</p>', ' data-i18n="home.featured_subtitle">اخترنا لك أفضل المنتجات ذات التقييمات العالية</p>']
    },
    {
        ar: 'عرض كل المنتجات',
        en: 'View All Products',
        fr: 'Voir tous les produits',
        key: 'home.view_all',
        replace: ['> عرض كل المنتجات', ' data-i18n="home.view_all">> عرض كل المنتجات']
    },
    {
        ar: 'عروض وتخفيضات خاصة 🔥',
        en: 'Special Offers & Discounts 🔥',
        fr: 'Offres Spéciales & Réductions 🔥',
        key: 'home.offers_title',
        replace: ['>عروض وتخفيضات خاصة 🔥</h2', ' data-i18n="home.offers_title">عروض وتخفيضات خاصة 🔥</h2']
    },
    {
        ar: 'خصومات حصرية لفترة محدودة على تشكيلة مختارة',
        en: 'Exclusive limited-time discounts on selected items',
        fr: 'Réductions exclusives à durée limitée sur certains articles',
        key: 'home.offers_subtitle',
        replace: ['>خصومات حصرية لفترة محدودة على تشكيلة مختارة</p>', ' data-i18n="home.offers_subtitle">خصومات حصرية لفترة محدودة على تشكيلة مختارة</p>']
    },
    {
        ar: 'اكتشف جميع العروض',
        en: 'Discover All Offers',
        fr: 'Découvrir toutes les offres',
        key: 'home.discover_offers',
        replace: ['> اكتشف جميع العروض', ' data-i18n="home.discover_offers">> اكتشف جميع العروض']
    },
    {
        ar: 'المتجر الإلكتروني',
        en: 'MyShop',
        fr: 'MyShop',
        key: 'footer.brand',
        replace: ['> المتجر الإلكتروني\r\n', ' data-i18n="footer.brand">> المتجر الإلكتروني\r\n']
    },
    {
        ar: 'وجهتك الأولى الموثوقة للتسوق الإلكتروني في الجزائر. نقدم منتجات تقنية أصلية بأفضل الأسعار مع توصيل سريع لـ 58 ولاية ودفع آمن عند الاستلام.',
        en: 'Your trusted destination for e-shopping in Algeria. We offer authentic tech products at best prices with fast delivery to 58 wilayas and COD.',
        fr: 'Votre destination de confiance pour les achats en ligne en Algérie. Nous proposons des produits authentiques avec livraison vers 58 wilayas.',
        key: 'footer.description',
        replace: ['>وجهتك الأولى الموثوقة للتسوق الإلكتروني في الجزائر. نقدم منتجات تقنية أصلية بأفضل الأسعار مع توصيل سريع لـ 58 ولاية ودفع آمن عند الاستلام.</p>', ' data-i18n="footer.description">وجهتك الأولى الموثوقة للتسوق الإلكتروني في الجزائر. نقدم منتجات تقنية أصلية بأفضل الأسعار مع توصيل سريع لـ 58 ولاية ودفع آمن عند الاستلام.</p>']
    },
    {
        ar: '58 ولاية',
        en: '58 Wilayas',
        fr: '58 Wilayas',
        key: 'footer.badge_wilayas',
        replace: ['> 58 ولاية</span>', ' data-i18n="footer.badge_wilayas">> 58 ولاية</span>']
    },
    {
        ar: 'ضمان 100%',
        en: '100% Warranty',
        fr: '100% Garantie',
        key: 'footer.badge_warranty',
        replace: ['> ضمان 100%</span>', ' data-i18n="footer.badge_warranty">> ضمان 100%</span>']
    },
    {
        ar: 'الدفع عند الاستلام',
        en: 'Cash on Delivery',
        fr: 'Paiement à la livraison',
        key: 'footer.badge_cod',
        replace: ['> الدفع عند الاستلام</span>', ' data-i18n="footer.badge_cod">> الدفع عند الاستلام</span>']
    },
    {
        ar: 'روابط سريعة',
        en: 'Quick Links',
        fr: 'Liens Rapides',
        key: 'footer.quick_links',
        replace: ['<h3>روابط سريعة</h3>', '<h3 data-i18n="footer.quick_links">روابط سريعة</h3>']
    },
    {
        ar: 'الرئيسية',
        en: 'Home',
        fr: 'Accueil',
        key: 'footer.link_home',
        replace: ['> الرئيسية</a>', ' data-i18n="footer.link_home">> الرئيسية</a>']
    },
    {
        ar: 'متجر المنتجات',
        en: 'Shop',
        fr: 'Boutique',
        key: 'footer.link_shop',
        replace: ['> متجر المنتجات</a>', ' data-i18n="footer.link_shop">> متجر المنتجات</a>']
    },
    {
        ar: 'سلة التسوق',
        en: 'Cart',
        fr: 'Panier',
        key: 'footer.link_cart',
        replace: ['> سلة التسوق</a>', ' data-i18n="footer.link_cart">> سلة التسوق</a>']
    },
    {
        ar: 'قائمة المفضلة',
        en: 'Wishlist',
        fr: 'Favoris',
        key: 'footer.link_wishlist',
        replace: ['> قائمة المفضلة</a>', ' data-i18n="footer.link_wishlist">> قائمة المفضلة</a>']
    },
    {
        ar: 'تتبع طلبيتك',
        en: 'Track Order',
        fr: 'Suivi Commande',
        key: 'footer.link_track',
        replace: ['> تتبع طلبيتك</a>', ' data-i18n="footer.link_track">> تتبع طلبيتك</a>']
    },
    {
        ar: 'خدمة العملاء والتواصل',
        en: 'Customer Support & Contact',
        fr: 'Service Client & Contact',
        key: 'footer.contact',
        replace: ['<h3>خدمة العملاء والتواصل</h3>', '<h3 data-i18n="footer.contact">خدمة العملاء والتواصل</h3>']
    },
    {
        ar: 'الجزائر العاصمة، الجزائر',
        en: 'Algiers, Algeria',
        fr: 'Alger, Algérie',
        key: 'footer.address',
        replace: ['> الجزائر العاصمة، الجزائر</li>', ' data-i18n="footer.address">> الجزائر العاصمة، الجزائر</li>']
    },
    {
        ar: 'السبت - الخميس: 9:00 ص - 6:00 م',
        en: 'Sat - Thu: 9:00 AM - 6:00 PM',
        fr: 'Sam - Jeu: 9:00 - 18:00',
        key: 'footer.hours',
        replace: ['> السبت - الخميس: 9:00 ص - 6:00 م</li>', ' data-i18n="footer.hours">> السبت - الخميس: 9:00 ص - 6:00 م</li>']
    },
    {
        ar: 'طرق الدفع والشحن',
        en: 'Payment & Shipping',
        fr: 'Paiement & Livraison',
        key: 'footer.payment_shipping',
        replace: ['<h3>طرق الدفع والشحن</h3>', '<h3 data-i18n="footer.payment_shipping">طرق الدفع والشحن</h3>']
    },
    {
        ar: 'نقبل الدفع الآمن عند الاستلام أو عبر البطاقات الإلكترونية الجزائرية:',
        en: 'We accept secure Cash on Delivery or Algerian e-payment cards:',
        fr: 'Nous acceptons le paiement sécurisé à la livraison ou les cartes de paiement algériennes:',
        key: 'footer.payment_desc',
        replace: ['>نقبل الدفع الآمن عند الاستلام أو عبر البطاقات الإلكترونية الجزائرية:</p>', ' data-i18n="footer.payment_desc">نقبل الدفع الآمن عند الاستلام أو عبر البطاقات الإلكترونية الجزائرية:</p>']
    },
    {
        ar: 'COD نقداً',
        en: 'Cash (COD)',
        fr: 'Espèces (COD)',
        key: 'footer.cod_cash',
        replace: ['> COD نقداً</span>', ' data-i18n="footer.cod_cash">> COD نقداً</span>']
    },
    {
        ar: 'تابعنا على الشبكات',
        en: 'Follow Us',
        fr: 'Suivez-nous',
        key: 'footer.follow',
        replace: ['<h3>تابعنا على الشبكات</h3>', '<h3 data-i18n="footer.follow">تابعنا على الشبكات</h3>']
    },
    {
        ar: '© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.',
        en: '© 2026 MyShop. All rights reserved.',
        fr: '© 2026 MyShop. Tous droits réservés.',
        key: 'footer.copyright',
        replace: ['>© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</p>', ' data-i18n="footer.copyright">© 2026 متجر الإلكتروني (MYSHOP). جميع الحقوق محفوظة.</p>']
    },
    {
        ar: 'صُمم بأعلى معايير الأمان والتجارة الإلكترونية في الجزائر 🇩🇿',
        en: 'Designed with highest security & e-commerce standards in Algeria 🇩🇿',
        fr: 'Conçu avec les normes de sécurité et e-commerce les plus élevées en Algérie 🇩🇿',
        key: 'footer.made_in',
        replace: ['>صُمم بأعلى معايير الأمان والتجارة الإلكترونية في الجزائر 🇩🇿</p>', ' data-i18n="footer.made_in">صُمم بأعلى معايير الأمان والتجارة الإلكترونية في الجزائر 🇩🇿</p>']
    }
];

function updateJson(file, lang) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    translations.forEach(t => {
        const parts = t.key.split('.');
        let curr = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = t[lang];
    });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

updateJson('locales/ar.json', 'ar');
updateJson('locales/en.json', 'en');
updateJson('locales/fr.json', 'fr');

let html = fs.readFileSync('index.html', 'utf8');
translations.forEach(t => {
    html = html.replace(t.replace[0], t.replace[1]);
});
fs.writeFileSync('index.html', html, 'utf8');
console.log('Done indexing index.html translations.');
