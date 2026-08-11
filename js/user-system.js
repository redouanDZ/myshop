
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
        const raw = sessionStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveSessionUser(user) {
    if (!user) {
        sessionStorage.removeItem('currentUser');
        return;
    }
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function clearSessionAuthState() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberedUser');
    localStorage.removeItem('rememberToken');
    localStorage.removeItem('redirectAfterLogin');
}

async function getCsrfToken() {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
    if (cookieMatch) {
        return decodeURIComponent(cookieMatch[1]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
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

    if (isMutatingRequest && csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    return fetch(url, {
        ...options,
        credentials: 'include',
        headers
    });
}

// Call functions when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkUserLoginStatus();
    initAuthButtons();
    initLoginForm();
    initSignupForm();
});

/**
 * Check user login status
 */
async function checkUserLoginStatus() {
    try {
        const response = await fetchJson(`${API_BASE_URL}/auth/session`);
        if (!response.ok) {
            clearSessionAuthState();
            return false;
        }

        const data = await response.json();
        if (!data.user) {
            clearSessionAuthState();
            return false;
        }

        saveSessionUser(data.user);
        updateUIForLoggedInUser(data.user);
        return true;
    } catch (error) {
        clearSessionAuthState();
        return false;
    }
}

/**
 * Update UI for logged-in user
 * @param {Object} user - User data object
 */
function updateUIForLoggedInUser(user) {
    // Update user icon
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        const usernameDisplay = user.username || user.name || 'حسابي';
        // Create user dropdown menu
        const dropdownHTML = `
            <div class="user-dropdown">
                <div class="user-info" style="padding: 10px 15px; border-bottom: 1px solid rgba(0,0,0,0.08); font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-circle" style="font-size: 1.3rem;"></i>
                    <span>${usernameDisplay}</span>
                    ${user.role === 'admin' ? '<span class="admin-badge" style="background:#e74c3c; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; margin-right: auto;">Admin</span>' : ''}
                </div>
                <ul style="list-style: none; padding: 5px 0; margin: 0;">
                    <li><a href="account.html?tab=profile" style="display: block; padding: 8px 15px; text-decoration: none;"><i class="fas fa-user-cog" style="margin-left: 8px;"></i>الملف الشخصي</a></li>
                    <li><a href="account.html?tab=addresses" style="display: block; padding: 8px 15px; text-decoration: none;"><i class="fas fa-map-marker-alt" style="margin-left: 8px;"></i>عناوين الشحن</a></li>
                    <li><a href="account.html?tab=orders" style="display: block; padding: 8px 15px; text-decoration: none;"><i class="fas fa-box" style="margin-left: 8px;"></i>طلباتي</a></li>
                    <li><a href="account.html?tab=wishlist" style="display: block; padding: 8px 15px; text-decoration: none;"><i class="fas fa-heart" style="margin-left: 8px;"></i>المفضلة</a></li>
                    ${user.role === 'admin' ? '<li><a href="admin/index.html" style="display: block; padding: 8px 15px; text-decoration: none;"><i class="fas fa-tachometer-alt" style="margin-left: 8px;"></i>لوحة التحكم</a></li>' : ''}
                    <li style="border-top: 1px solid rgba(0,0,0,0.08); margin-top: 5px; padding-top: 5px;"><a href="#" id="logout-btn" style="display: block; padding: 8px 15px; text-decoration: none; color: #e74c3c;"><i class="fas fa-sign-out-alt" style="margin-left: 8px;"></i>تسجيل الخروج</a></li>
                </ul>
            </div>
        `;
        
        userIcon.innerHTML = dropdownHTML;

        // Add event listener for logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
        
        // Add click event to dropdown to toggle visibility
        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userIcon.contains(e.target)) {
                const dropdown = userIcon.querySelector('.user-dropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }
    
    // Update cart if exists
    updateCartUI();
}

/**
 * Initialize authentication buttons
 */
function initAuthButtons() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Signup button
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }

    // User icon click when logged out
    const userIcon = document.querySelector('.user-icon');
    if (userIcon && !userIcon.querySelector('.user-dropdown')) {
        userIcon.style.cursor = 'pointer';
        userIcon.addEventListener('click', async function(e) {
            const user = readSessionUser();
            if (!user) {
                e.preventDefault();
                showLoginForm();
            }
        });
    }
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
    // إنشاء أو العثور على نافذة منبثقة
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
                <h2>تسجيل الدخول</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email">البريد الإلكتروني</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">كلمة المرور</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="remember-me"> تذكرني
                        </label>
                    </div>
                    <button type="submit" class="btn">تسجيل الدخول</button>
                    <div class="auth-links">
                        <a href="#" id="show-signup">إنشاء حساب جديد</a>
                        <a href="#">نسيت كلمة المرور؟</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    // إظهار النافذة
    modal.style.display = 'block';

    // إضافة مستمعي الأحداث
    const closeModalBtn = modal.querySelector('.close-modal');
    const showSignupLink = modal.querySelector('#show-signup');

    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });
}

/**
 * عرض نموذج إنشاء حساب
 */
function showSignupForm() {
    // إنشاء أو العثور على نافذة منبثقة
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
                <h2>إنشاء حساب جديد</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="signup-form">
                    <div class="form-group">
                        <label for="signup-name">الاسم الكامل</label>
                        <input type="text" id="signup-name" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">البريد الإلكتروني</label>
                        <input type="email" id="signup-email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-phone">رقم الهاتف</label>
                        <input type="tel" id="signup-phone" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">كلمة المرور</label>
                        <input type="password" id="signup-password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="signup-confirm-password">تأكيد كلمة المرور</label>
                        <input type="password" id="signup-confirm-password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="agree-terms" required> أوافق على الشروط والأحكام
                        </label>
                    </div>
                    <button type="submit" class="btn">إنشاء الحساب</button>
                    <div class="auth-links">
                        <a href="#" id="show-login">لديك حساب بالفعل؟ سجل الدخول</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    // إظهار النافذة
    modal.style.display = 'block';

    // إضافة مستمعي الأحداث
    const closeModalBtn = modal.querySelector('.close-modal');
    const showLoginLink = modal.querySelector('#show-login');

    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

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
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify(data.user));
            }

            document.getElementById('auth-modal').style.display = 'none';
            updateUIForLoggedInUser(data.user);
            showNotification(data.message || 'Login successful!');
            updateCartUI();

            setTimeout(() => {
                const redirectUrl = localStorage.getItem('redirectAfterLogin') || '../index.html';
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            showNotification(data.message || 'Email or password is incorrect', 'error');
        }
    } catch (error) {
        showNotification('An error occurred during login. Please try again.', 'error');
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
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

