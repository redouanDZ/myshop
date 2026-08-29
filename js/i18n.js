/**
 * myshop - نظام الترجمة خفيف الوزن (Lightweight i18n - Vanilla JS)
 */

window.I18n = {
    currentLang: localStorage.getItem('myshop_lang') || 'ar',
    cache: {},

    /**
     * جلب ملف الترجمة
     */
    async loadDictionary(lang) {
        const targetLang = lang || this.currentLang || 'ar';
        if (this.cache[targetLang]) return this.cache[targetLang];
        try {
            const res = await fetch(`/locales/${targetLang}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const dict = await res.json();
            this.cache[targetLang] = dict;
            return dict;
        } catch (err) {
            console.warn(`Could not load /locales/${targetLang}.json:`, err);
            return null;
        }
    },

    /**
     * استخراج القيمة من مسار مفاتيح متداخلة (e.g. 'nav.home')
     */
    getValue(dict, keyPath) {
        if (!dict || !keyPath) return null;
        const keys = String(keyPath).split('.');
        let val = dict;
        for (const k of keys) {
            if (val && typeof val === 'object' && val[k] !== undefined) {
                val = val[k];
            } else {
                return null;
            }
        }
        return val;
    },

    /**
     * ترجمة فورية لمفتاح معين مع نص بديل افتراضي
     */
    t(keyPath, defaultValue = '') {
        const dict = this.cache[this.currentLang];
        if (!dict) return defaultValue || keyPath;
        const val = this.getValue(dict, keyPath);
        return val !== null && val !== undefined ? val : (defaultValue || keyPath);
    },

    /**
     * ترجمة عناصر الصفحة أو حاوية محددة (data-i18n, data-i18n-placeholder, data-i18n-title)
     */
    async translatePage(targetRoot) {
        const root = (targetRoot && targetRoot.querySelectorAll) ? targetRoot : document;
        const dict = await this.loadDictionary(this.currentLang);
        if (!dict) return;

        // تحديث النصوص ذات سمة data-i18n
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const val = this.getValue(dict, key);
                if (val !== null && val !== undefined) {
                    el.textContent = val;
                }
            }
        });

        // تحديث النصوص ذات سمة data-i18n-placeholder
        root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                const val = this.getValue(dict, key);
                if (val !== null && val !== undefined) {
                    el.placeholder = val;
                }
            }
        });

        // تحديث النصوص ذات سمة data-i18n-title
        root.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                const val = this.getValue(dict, key);
                if (val !== null && val !== undefined) {
                    el.title = val;
                }
            }
        });
    },

    /**
     * تغيير لغة المتجر وتحديث كافة النصوص والاتجاه (RTL / LTR)
     */
    async setLanguage(lang) {
        if (!['ar', 'fr', 'en'].includes(lang)) lang = 'ar';
        this.currentLang = lang;
        localStorage.setItem('myshop_lang', lang);

        const dict = await this.loadDictionary(lang);
        if (!dict) return;

        // ضبط الاتجاه واللغة
        const dir = dict.dir || (lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
        if (document.body) document.body.dir = dir;

        // ترجمة كافة العناصر في الصفحة
        await this.translatePage(document);

        // مزامنة محدد اللغة
        document.querySelectorAll('.lang-select, #langSelect').forEach(select => {
            select.value = lang;
        });

        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, dir, dict } }));
    },

    /**
     * إدراج أداة اختيار اللغة في الهيدر تلقائياً
     */
    setupLanguageSwitchers() {
        const userActionsList = document.querySelectorAll('.user-actions');
        userActionsList.forEach(container => {
            if (!container.querySelector('.lang-switcher-wrap')) {
                const wrap = document.createElement('div');
                wrap.className = 'lang-switcher-wrap';

                const select = document.createElement('select');
                select.className = 'lang-select';
                select.setAttribute('aria-label', 'اختر اللغة');
                select.innerHTML = `
                    <option value="ar" ${this.currentLang === 'ar' ? 'selected' : ''}>🇩🇿 العربية</option>
                    <option value="fr" ${this.currentLang === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
                    <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                `;

                select.addEventListener('change', (e) => {
                    this.setLanguage(e.target.value);
                });

                wrap.appendChild(select);
                container.insertBefore(wrap, container.firstChild);
            }
        });
    }
};

// تشغيل التهيئة فور تحميل الـ DOM
document.addEventListener('DOMContentLoaded', () => {
    window.I18n.setupLanguageSwitchers();
    window.I18n.setLanguage(window.I18n.currentLang);
});
