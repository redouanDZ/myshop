
/**
 * User Account Management System
 * Provides functions for login, logout, and user profile management
 */

// API endpoint URLs
const API_BASE_URL = '/api';

// Notification helper
function showNotification(msg, type = 'success') {
    if (window.showToast) {
        window.showToast(msg, type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
    } else {
        alert(msg);
    }
}

// Helper to safely update cart UI if available
function updateCartUI() {
    if (window.loadCart) window.loadCart();
}

function readSessionUser() {
    try {
        const raw = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveSessionUser(user) {
    if (!user) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        return;
    }
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

async function getCsrfToken() {
    const cookieToken = getCookie('csrf_token');
    if (cookieToken) return cookieToken;

    try {
        const response = await fetch('/api/csrf-token', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) return '';
        const data = await response.json();
        return data.csrfToken || '';
    } catch (error) {
        return '';
    }
}

async function fetchJson(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isMutatingRequest = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    const csrfToken = isMutatingRequest ? await getCsrfToken() : '';

    const headers = {
        ...(options.headers || {})
    };

    if (!(headers['Content-Type'] || headers['content-type'])) {
        if (options.body && typeof options.body === 'string') {
            headers['Content-Type'] = 'application/json';
        }
    }

    if (csrfToken && !headers['X-CSRF-Token'] && !headers['x-csrf-token']) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    return fetch(url, {
        credentials: 'include',
        ...options,
        headers
    });
}

/**
 * تهيئة نموذج تسجيل الدخول
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

/**
 * تهيئة نموذج إنشاء حساب
 */
function initSignupForm() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
}

/**
 * عرض نموذج تسجيل الدخول
 */
function showLoginForm() {
    let modal = document.getElementById('auth-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 data-i18n="auth.login_title">تسجيل الدخول</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email" data-i18n="auth.email">البريد الإلكتروني</label>
                        <input type="email" id="login-email" required placeholder="name@example.com">
                    </div>
                    <div class="form-group">
                        <label for="login-password" data-i18n="auth.password">كلمة المرور</label>
                        <input type="password" id="login-password" required placeholder="******">
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: normal; cursor: pointer;">
                            <input type="checkbox" id="remember-me"> تذكرني
                        </label>
                    </div>
                    <button type="submit" class="btn" style="width: 100%;"><span data-i18n="auth.login_btn">تسجيل الدخول</span></button>

                    <div style="display: flex; align-items: center; margin: 14px 0; text-align: center; color: var(--light-text, #94a3b8); font-size: 0.85rem;">
                        <div style="flex: 1; height: 1px; background: var(--border-color, #e2e8f0);"></div>
                        <span style="padding: 0 12px; font-weight: 600;">أو</span>
                        <div style="flex: 1; height: 1px; background: var(--border-color, #e2e8f0);"></div>
                    </div>

                    <button type="button" class="google-btn" onclick="initiateGoogleLogin()" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; color: #1e293b; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>متابعة باستخدام Google</span>
                    </button>

                    <div class="auth-links" style="margin-top: 14px;">
                        <a href="#" id="show-signup" data-i18n="auth.create_account">إنشاء حساب جديد</a>
                        <a href="#" id="show-forgot-password" data-i18n="auth.forgot_password">نسيت كلمة المرور؟</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    // إظهار النافذة
    modal.style.display = 'block';

    if (window.I18n && typeof window.I18n.translatePage === 'function') {
        window.I18n.translatePage(modal);
    }

    // إضافة مستمعي الأحداث
    const closeModalBtn = modal.querySelector('.close-modal');
    const showSignupLink = modal.querySelector('#show-signup');
    const showForgotLink = modal.querySelector('#show-forgot-password');
    const loginForm = modal.querySelector('#login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }

    if (showForgotLink) {
        showForgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordForm();
        });
    }
}

/**
 * عرض نموذج إنشاء حساب
 */
function showSignupForm() {
    let modal = document.getElementById('auth-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 data-i18n="auth.register_title">إنشاء حساب جديد</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="signup-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="signup-name" data-i18n="auth.username">الاسم الكامل</label>
                            <input type="text" id="signup-name" required placeholder="الاسم الكامل">
                        </div>
                        <div class="form-group">
                            <label for="signup-phone" data-i18n="auth.phone">رقم الهاتف</label>
                            <input type="tel" id="signup-phone" required placeholder="05/06/07...">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="signup-email" data-i18n="auth.email">البريد الإلكتروني</label>
                        <input type="email" id="signup-email" required placeholder="name@example.com">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="signup-password" data-i18n="auth.password">كلمة المرور</label>
                            <input type="password" id="signup-password" required minlength="6" placeholder="******">
                        </div>
                        <div class="form-group">
                            <label for="signup-confirm-password" data-i18n="auth.confirm_new_password">تأكيد كلمة المرور</label>
                            <input type="password" id="signup-confirm-password" required minlength="6" placeholder="******">
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: normal; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="agree-terms" required> <span>أوافق على الشروط والأحكام</span>
                        </label>
                    </div>
                    <button type="submit" class="btn" style="width: 100%;"><span data-i18n="auth.register_btn">إنشاء الحساب</span></button>

                    <div style="display: flex; align-items: center; margin: 14px 0; text-align: center; color: var(--light-text, #94a3b8); font-size: 0.85rem;">
                        <div style="flex: 1; height: 1px; background: var(--border-color, #e2e8f0);"></div>
                        <span style="padding: 0 12px; font-weight: 600;">أو</span>
                        <div style="flex: 1; height: 1px; background: var(--border-color, #e2e8f0);"></div>
                    </div>

                    <button type="button" class="google-btn" onclick="initiateGoogleLogin()" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; color: #1e293b; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>التسجيل باستخدام Google</span>
                    </button>

                    <div class="auth-links" style="margin-top: 14px; justify-content: center;">
                        <a href="#" id="show-login" data-i18n="auth.have_account">لديك حساب بالفعل؟ سجل الدخول</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    if (window.I18n && typeof window.I18n.translatePage === 'function') {
        window.I18n.translatePage(modal);
    }

    const closeModalBtn = modal.querySelector('.close-modal');
    const showLoginLink = modal.querySelector('#show-login');
    const signupForm = modal.querySelector('#signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
}
/**
 * عرض نموذج استعادة كلمة المرور
 */
function showForgotPasswordForm() {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 data-i18n="auth.forgot_password_title">استعادة كلمة المرور</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--light-text, #64748b); font-size: 0.9rem; margin-bottom: 18px; line-height: 1.5;" data-i18n="auth.forgot_password_desc">
                    أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات استعادة كلمة المرور.
                </p>
                <form id="forgot-password-form">
                    <div class="form-group">
                        <label for="forgot-email" data-i18n="auth.email">البريد الإلكتروني</label>
                        <input type="email" id="forgot-email" required placeholder="name@example.com">
                    </div>
                    <button type="submit" id="forgot-submit-btn" class="btn" style="width: 100%; margin-top: 10px;">
                        <span data-i18n="auth.send_reset_btn">إرسال رابط الاستعادة</span>
                    </button>
                    <div class="auth-links" style="margin-top: 18px; text-align: center;">
                        <a href="#" id="forgot-back-to-login" data-i18n="auth.back_to_login">العودة لتسجيل الدخول</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    if (window.I18n && typeof window.I18n.translatePage === 'function') {
        window.I18n.translatePage(modal);
    }

    const closeModalBtn = modal.querySelector('.close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

    const backToLogin = modal.querySelector('#forgot-back-to-login');
    if (backToLogin) backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    const form = modal.querySelector('#forgot-password-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('forgot-email');
            const submitBtn = document.getElementById('forgot-submit-btn');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (window.I18n ? window.I18n.t('common.sending', 'جاري الإرسال...') : 'جاري الإرسال...');

            try {
                const res = await fetchJson(`${API_BASE_URL}/auth/forgot-password`, {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (res.ok) {
                    showNotification(data.message || 'تم إرسال تعليمات الاستعادة بنجاح!', 'success');
                    if (data.resetToken) {
                        setTimeout(() => {
                            showResetPasswordForm(data.resetToken, email);
                        }, 1200);
                    }
                } else {
                    showNotification(data.message || 'حدث خطأ أثناء معالجة الطلب', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = window.I18n ? window.I18n.t('auth.send_reset_btn', 'إرسال رابط الاستعادة') : 'إرسال رابط الاستعادة';
                }
            } catch (err) {
                showNotification('حدث خطأ في الاتصال بالخادم', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = window.I18n ? window.I18n.t('auth.send_reset_btn', 'إرسال رابط الاستعادة') : 'إرسال رابط الاستعادة';
            }
        });
    }
}

/**
 * عرض نموذج تعيين كلمة المرور الجديدة
 */
function showResetPasswordForm(prefilledToken = '', userEmail = '') {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 data-i18n="auth.reset_password_title">تعيين كلمة مرور جديدة</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="reset-password-form">
                    <div class="form-group">
                        <label for="reset-token" data-i18n="auth.reset_token">رمز الاستعادة / Token</label>
                        <input type="text" id="reset-token" required value="${prefilledToken || ''}" placeholder="أدخل الرمز المستلم...">
                    </div>
                    <div class="form-group">
                        <label for="reset-password" data-i18n="auth.new_password">كلمة المرور الجديدة</label>
                        <input type="password" id="reset-password" required minlength="6" placeholder="******">
                    </div>
                    <div class="form-group">
                        <label for="reset-confirm-password" data-i18n="auth.confirm_new_password">تأكيد كلمة المرور</label>
                        <input type="password" id="reset-confirm-password" required minlength="6" placeholder="******">
                    </div>
                    <button type="submit" id="reset-submit-btn" class="btn" style="width: 100%; margin-top: 10px;">
                        <span data-i18n="auth.reset_password_btn">حفظ كلمة المرور الجديدة</span>
                    </button>
                    <div class="auth-links" style="margin-top: 18px; text-align: center;">
                        <a href="#" id="reset-back-to-login" data-i18n="auth.back_to_login">العودة لتسجيل الدخول</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    if (window.I18n && typeof window.I18n.translatePage === 'function') {
        window.I18n.translatePage(modal);
    }

    const closeModalBtn = modal.querySelector('.close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

    const backToLogin = modal.querySelector('#reset-back-to-login');
    if (backToLogin) backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    const form = modal.querySelector('#reset-password-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const token = document.getElementById('reset-token').value.trim();
            const password = document.getElementById('reset-password').value;
            const confirmPassword = document.getElementById('reset-confirm-password').value;
            const submitBtn = document.getElementById('reset-submit-btn');

            if (!token) {
                showNotification('يرجى إدخال رمز التحقق المستلم', 'error');
                return;
            }
            if (!password || password.length < 6) {
                showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showNotification('كلمتا المرور غير متطابقتين', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (window.I18n ? window.I18n.t('common.sending', 'جاري التحديث...') : 'جاري التحديث...');

            try {
                const res = await fetchJson(`${API_BASE_URL}/auth/reset-password`, {
                    method: 'POST',
                    body: JSON.stringify({ token, password })
                });
                const data = await res.json();
                if (res.ok) {
                    showNotification(data.message || 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
                    setTimeout(() => {
                        showLoginForm();
                    }, 1000);
                } else {
                    showNotification(data.message || 'فشل تحديث كلمة المرور. الرمز غير صالح أو منتهي الصلاحية.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = window.I18n ? window.I18n.t('auth.reset_password_btn', 'حفظ كلمة المرور الجديدة') : 'حفظ كلمة المرور الجديدة';
                }
            } catch (err) {
                showNotification('حدث خطأ في الاتصال بالخادم', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = window.I18n ? window.I18n.t('auth.reset_password_btn', 'حفظ كلمة المرور الجديدة') : 'حفظ كلمة المرور الجديدة';
            }
        });
    }
}


/**
 * Handle Google Sign-In authentication flow
 */
window.initiateGoogleLogin = async function() {
    try {
        let clientId = '';
        try {
            const settingsRes = await fetch('/api/settings');
            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                clientId = settings.google_client_id || '';
            }
        } catch (e) {}

        if (clientId && window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: window.handleGoogleCredentialResponse
            });
            window.google.accounts.id.prompt();
            return;
        }

        showNotification('تسجيل الدخول عبر Google غير مُفعَّل حالياً على هذا المتجر', 'warning');
    } catch (err) {
        showNotification(err.message || 'خطأ أثناء تسجيل الدخول عبر Google', 'error');
    }
};

window.handleGoogleCredentialResponse = async function(response) {
    try {
        const res = await fetchJson('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'فشل التحقق من حساب Google');

        saveSessionUser(data.user);
        updateUIForLoggedInUser(data.user);
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
        showNotification('تم تسجيل الدخول بنجاح عبر Google! 🎉', 'success');
        if (window.location.pathname.includes('account.html')) {
            window.location.reload();
        }
    } catch (err) {
        showNotification(err.message, 'error');
    }
};

/**
 * Handle login process
 */
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Validate input data
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }

    try {
        const response = await fetchJson(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveSessionUser(data.user);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify(data.user));
            }

            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.style.display = 'none';
            updateUIForLoggedInUser(data.user);
            showNotification(data.message || 'تم تسجيل الدخول بنجاح! 🎉', 'success');
            updateCartUI();

            setTimeout(() => {
                const savedRedirect = localStorage.getItem('redirectAfterLogin');
                const isSafeLocalUrl = (url) => {
                    if (!url || typeof url !== 'string') return false;
                    const trimmed = url.trim();
                    if (/^(?:[a-z]+:|\/\/)/i.test(trimmed)) return false;
                    return !trimmed.toLowerCase().includes('javascript:') && !trimmed.toLowerCase().includes('data:');
                };

                if (savedRedirect && isSafeLocalUrl(savedRedirect)) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = savedRedirect;
                } else if (data.user && data.user.role === 'admin') {
                    window.location.href = 'admin/index.html';
                } else {
                    window.location.href = 'account.html';
                }
            }, 800);
        } else {
            showNotification(data.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة لاحقاً.', 'error');
    }
}

/**
 * Handle new account creation
 */
async function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;

    // Validate input data
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Password and confirmation do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    if (!agreeTerms) {
        showNotification('You must agree to the terms and conditions', 'error');
        return;
    }

    try {
        const response = await fetchJson(`${API_BASE_URL}/register`, {
            method: 'POST',
            body: JSON.stringify({ username: name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            const loginResponse = await fetchJson(`${API_BASE_URL}/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                saveSessionUser(loginData.user);
                document.getElementById('auth-modal').style.display = 'none';
                updateUIForLoggedInUser(loginData.user);
                showNotification(data.message || 'Account created successfully!');

                setTimeout(() => {
                    const redirectUrl = localStorage.getItem('redirectAfterLogin') || '../index.html';
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                showNotification(loginData.message || 'Account created but login failed. Please login manually.', 'error');
                document.getElementById('auth-modal').style.display = 'none';
            }
        } else {
            showNotification(data.message || 'An error occurred while creating the account', 'error');
        }
    } catch (error) {
        showNotification('An error occurred while creating the account. Please try again.', 'error');
    }
}

/**
 * User logout
 */
async function logoutUser() {
    try {
        await fetchJson(`${API_BASE_URL}/logout`, {
            method: 'POST'
        });
    } catch (error) {
        // Ignore server-side logout failures and clear the UI state anyway.
    }

    clearSessionAuthState();
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        userIcon.innerHTML = '<i class="fas fa-user"></i>';
    }

    showNotification('Logged out successfully');
    updateCartUI();

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

/**
 * الحصول على بيانات المستخدم الحالي بشكل متزامن من التخزين المحلي
 * @returns {Object|null}
 */
function getCurrentUserSync() {
    return readSessionUser();
}

/**
 * الحصول على بيانات المستخدم الحالي والتحقق من التوكن عبر السيرفر
 * @returns {Promise<Object|null>} - كائن بيانات المستخدم أو null إذا لم يكن مسجلاً
 */
async function getCurrentUser() {
    const savedUser = getCurrentUserSync();
    try {
        const response = await fetchJson(`${API_BASE_URL}/auth/session`);
        if (response.ok) {
            const userData = await response.json();
            saveSessionUser(userData.user);
            return userData.user;
        }

        clearSessionAuthState();
        return null;
    } catch (error) {
        return savedUser;
    }
}

/**
 * التحقق من ما إذا كان المستخدم مسجلاً
 * @returns {boolean} - true إذا كان مسجلاً، false إذا لم يكن
 */
function isLoggedIn() {
    return getCurrentUserSync() !== null;
}

/**
 * إضافة عنوان شحن جديد للمستخدم
 * @param {Object} address - كائن العنوان
 */
function addShippingAddress(address) {
    const user = getCurrentUserSync();
    if (!user) {
        showNotification('يجب تسجيل الدخول لإضافة العنوان', 'error');
        return false;
    }

    // الحصول على قائمة المستخدمين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex === -1) {
        showNotification('لم يتم العثور على حساب المستخدم', 'error');
        return false;
    }

    // إضافة العنوان
    if (!users[userIndex].addresses) {
        users[userIndex].addresses = [];
    }

    address.id = Date.now(); // استخدام الطابع الزمني كـ ID
    address.createdAt = new Date().toISOString();
    users[userIndex].addresses.push(address);

    // حفظ القائمة المحدثة
    localStorage.setItem('users', JSON.stringify(users));

    // تحديث بيانات المستخدم في الجلسة
    const updatedUser = {
        ...user,
        addresses: users[userIndex].addresses
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    showNotification('تمت إضافة العنوان بنجاح');
    return true;
}

/**
 * الحصول على عناوين الشحن للمستخدم
 * @returns {Array} - قائمة العناوين
 */
function getUserAddresses() {
    const user = getCurrentUserSync();
    if (!user) {
        return [];
    }

    // الحصول على قائمة المستخدمين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(u => u.id === user.id);

    return userData ? userData.addresses || [] : [];
}

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {number|null} - Order ID or null in case of error
 */
async function createOrder(orderData) {
    const user = getCurrentUserSync();

    try {
        // Get shopping cart
        const savedCart = localStorage.getItem('cart');
        if (!savedCart) {
            showNotification('Shopping cart is empty', 'error');
            return null;
        }

        const cart = JSON.parse(savedCart);

        // Create order object
        const order = {
            userId: user ? user.id : 1,
            total: orderData.total,
            shippingInfo: orderData.shippingInfo || {},
            cart: cart
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.removeItem('cart');
            localStorage.setItem('lastOrderId', data.id);
            showNotification('Order created successfully');
            return data.id;
        } else {
            const errData = await response.json();
            showNotification(errData.error || 'An error occurred while creating the order', 'error');
            return null;
        }
    } catch (e) {

        showNotification('An error occurred while creating the order', 'error');
        return null;
    }
}

/**
 * Get user orders
 * @returns {Array} - List of orders
 */
function getUserOrders() {
    const user = getCurrentUserSync();
    if (!user) {
        return [];
    }

    // Get user list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(u => u.id === user.id);

    return userData ? userData.orders || [] : [];
}

/**
 * Get details of a specific order
 * @param {number} orderId - Order ID
 * @returns {Object|null} - Order data object or null if not found
 */
function getOrderDetails(orderId) {
    const user = getCurrentUserSync();
    if (!user) {
        return null;
    }

    // Get user list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(u => u.id === user.id);

    if (!userData || !userData.orders) {
        return null;
    }

    return userData.orders.find(order => order.id === orderId) || null;
}

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {boolean} - true if update was successful, false in case of error
 */
function updateOrderStatus(orderId, status) {
    const user = getCurrentUserSync();
    if (!user) {
        showNotification('You must be logged in to update order status', 'error');
        return false;
    }

    // Get user list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex === -1) {
        showNotification('User account not found', 'error');
        return false;
    }

    // Find the order and update its status
    const orderIndex = users[userIndex].orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        showNotification('Order not found', 'error');
        return false;
    }

    users[userIndex].orders[orderIndex].status = status;
    users[userIndex].orders[orderIndex].updatedAt = new Date().toISOString();

    // Save the updated list
    localStorage.setItem('users', JSON.stringify(users));

    // Update user data in session
    const updatedUser = {
        ...user,
        orders: users[userIndex].orders
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    showNotification('Order status updated successfully');
    return true;
}

// Make functions available globally
window.getCurrentUserSync = getCurrentUserSync;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;

// Bind user icon click to open login modal if user is not logged in
document.addEventListener('DOMContentLoaded', () => {
    const userIcons = document.querySelectorAll('.user-icon');
    userIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (!isLoggedIn()) {
                e.preventDefault();
                showLoginForm();
            }
        });
    });
});

