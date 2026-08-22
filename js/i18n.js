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
        if (this.cache[lang]) return this.cache[lang];
        try {
            const res = await fetch(`/locales/${lang}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const dict = await res.json();
            this.cache[lang] = dict;
            return dict;
        } catch (err) {
            console.warn(`Could not load /locales/${lang}.json:`, err);
            return null;
        }
    },

    /**
     * استخراج القيمة من مسار مفاتيح متداخلة (e.g. 'nav.home')
     */
    getValue(dict, keyPath) {
        if (!dict || !keyPath) return '';
        const keys = keyPath.split('.');
        let val = dict;
        for (const k of keys) {
            if (val && val[k] !== undefined) {
                val = val[k];
            } else {
                return null;
            }
        }
        return val;
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

        // تحديث النصوص ذات سمة data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.getValue(dict, key);
            if (val !== null) {
                el.textContent = val;
            }
        });

        // تحديث النصوص ذات سمة data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = this.getValue(dict, key);
            if (val !== null) {
                el.placeholder = val;
            }
        });

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
                wrap.style.cssText = 'position:relative; display:inline-flex; align-items:center; margin: 0 4px;';

                const select = document.createElement('select');
                select.className = 'lang-select';
                select.setAttribute('aria-label', 'اختر اللغة');
                select.style.cssText = 'background:transparent; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; font-size:0.82rem; font-weight:600; cursor:pointer; color:inherit; outline:none;';
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
    },

    /**
     * ترجمة فورية لمفتاح معين
     */
    t(keyPath, defaultText = '') {
        const dict = this.cache[this.currentLang];
        const val = this.getValue(dict, keyPath);
        return val !== null ? val : defaultText;
    }
};

// تشغيل التهيئة فور تحميل الـ DOM
document.addEventListener('DOMContentLoaded', () => {
    window.I18n.setupLanguageSwitchers();
    window.I18n.setLanguage(window.I18n.currentLang);
});
