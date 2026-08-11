/**
 * نظام إدارة الدفع والطلبات
 * يوفر وظائف للتعامل مع معلومات الدفع وتأكيد الطلبات
 * يعتمد على ملف cart.js لإدارة عربة التسوق
 */

// التأكد من تحميل ملف cart.js أولاً
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.cartModule !== 'undefined') {
        window.cart = window.cartModule.getCart();
    }
});

// استدعاء الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initCheckoutSteps();
    initFormValidation();
    loadCartDetails();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }
});

/**
 * تهيئة خطوات الدفع
 */
function initCheckoutSteps() {

    // تهيئة أزرار التنقل بين خطوات الدفع
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');


    if (nextButtons.length > 0) {
        nextButtons.forEach((button, index) => {

            button.addEventListener('click', function() {

                const currentStep = this.closest('.checkout-step');
                if (currentStep) {
                    const stepId = currentStep.id;

                    if (stepId === 'shipping-info' && validateShippingStep()) {

                        goToPaymentStep();
                    } else if (stepId === 'payment-method' && validatePaymentStep()) {

                        goToOrderReview();
                    }
                }
            });
        });
    }
    
    if (prevButtons.length > 0) {
        prevButtons.forEach((button, index) => {

            button.addEventListener('click', function() {
                const currentStep = this.closest('.checkout-step');
                if (currentStep) {
                    const stepId = currentStep.id;
                    
                    if (stepId === 'payment-method') {
                        goToShippingStep();
                    } else if (stepId === 'order-review') {
                        goToPaymentStep();
                    }
                }
            });
        });
    }
    
    // تهيئة خيارات الشحن
    initShippingOptions();
    
    // تهيئة خيارات الدفع
    initPaymentOptions();
}

// الانتقال إلى خطوة معلومات الشحن
function goToShippingStep() {

    const steps = document.querySelectorAll('.checkout-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const shippingInfo = document.getElementById('shipping-info');
    if (shippingInfo) {
        shippingInfo.classList.add('active');
        updateCheckoutTitle('معلومات الشحن');

    } else {

    }
}

// الانتقال إلى خطوة الدفع
function goToPaymentStep() {

    const steps = document.querySelectorAll('.checkout-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) {
        paymentMethod.classList.add('active');
        updateCheckoutTitle('طريقة الدفع');

    } else {

    }
}

// الانتقال إلى خطوة مراجعة الطلب
function goToOrderReview() {

    const steps = document.querySelectorAll('.checkout-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const orderReview = document.getElementById('order-review');
    if (orderReview) {
        orderReview.classList.add('active');
        updateCheckoutTitle('مراجعة الطلب');

        // تحديث ملخص الطلب في هذه الخطوة
        updateOrderReview();
    } else {

    }
}

// تحديث عنوان صفحة الدفع
function updateCheckoutTitle(title) {

    const titleElement = document.querySelector('.page-title h1');
    if (titleElement) {
        titleElement.textContent = title;

    } else {

    }
}



function validateStep(step) {
    switch(step) {
        case '1': return validateShippingStep();
        case '2': return validatePaymentStep();
        default: return true;
    }
}

function initShippingOptions() {

    const shippingOptions = document.querySelectorAll('input[name="shipping-method"]');

    if (shippingOptions.length === 0) {

        return;
    }
    
    shippingOptions.forEach((option, index) => {

        option.addEventListener('change', function() {

            updateShippingCost();
            updateOrderSummary();
        });
    });
}

function validateShippingStep() {

    const fullName = document.getElementById('fullname');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const postalCode = document.getElementById('postal-code');

    if (!fullName) { showNotification('لم يتم العثور على حقل الاسم الكامل', 'error'); return false; }
    if (!phone) { showNotification('لم يتم العثور على حقل رقم الهاتف', 'error'); return false; }
    if (!address) { showNotification('لم يتم العثور على حقل العنوان', 'error'); return false; }
    if (!city) { showNotification('لم يتم العثور على حقل المدينة', 'error'); return false; }
    if (!postalCode) { showNotification('لم يتم العثور على حقل الرمز البريدي', 'error'); return false; }

    if (!fullName.value.trim()) { showNotification('الرجاء إدخال الاسم الكامل', 'error'); fullName.focus(); return false; }
    if (!phone.value.trim()) { showNotification('الرجاء إدخال رقم الهاتف', 'error'); phone.focus(); return false; }
    if (!address.value.trim()) { showNotification('الرجاء إدخال العنوان', 'error'); address.focus(); return false; }
    if (!city.value.trim()) { showNotification('الرجاء إدخال المدينة', 'error'); city.focus(); return false; }
    if (!postalCode.value.trim()) { showNotification('الرجاء إدخال الرمز البريدي', 'error'); postalCode.focus(); return false; }

    saveShippingInfo();
    return true;
}

function saveShippingInfo() {
    const shippingInfo = {
        fullName: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postal-code').value,
        notes: document.getElementById('notes').value,
        shippingMethod: document.querySelector('input[name="shipping-method"]:checked')?.value || 'standard'
    };

    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
}

function initPaymentOptions() {

    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');

    if (paymentOptions.length === 0) {

        return;
    }
    
    paymentOptions.forEach((option, index) => {

        option.addEventListener('change', function() {

            const cardDetails = document.getElementById('bank-transfer-details');
            if (cardDetails) {
                cardDetails.style.display = (this.value === 'bank-transfer') ? 'block' : 'none';

            }
        });
    });
}

function validatePaymentStep() {

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!paymentMethod) { 

        showNotification('الرجاء اختيار طريقة الدفع', 'error'); 
        return false; 
    }

    // لا حاجة للتحقق من تفاصيل البطاقة لأننا نستخدم دفع عند الاستلام أو التحويل البنكي

    return true;
}

function saveCardInfo() {
    const cardInfo = {
        cardNumber: document.getElementById('card-number').value,
        expiryDate: document.getElementById('expiry-date').value,
        cvv: document.getElementById('cvv').value,
        cardName: document.getElementById('card-name').value
    };

    localStorage.setItem('cardInfo', JSON.stringify(cardInfo));
}

function loadCartDetails() {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
        showNotification('عربة التسوق فارغة', 'error');
        setTimeout(() => { window.location.href = 'shop.html'; }, 2000);
        return;
    }

    try { cart = JSON.parse(savedCart); }
    catch (e) { cart = []; }

    updateCartUI();
    updateOrderSummary();
}

function updateOrderReview() {
    const orderItems = document.querySelector('.order-items');
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p>لا توجد منتجات في الطلب</p>';
        return;
    }
    
    cart.forEach(item => {
        const itemHTML = `
            <div class="order-item">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-quantity">الكمية: ${item.quantity}</div>
                </div>
                <div class="item-price">${(item.price * item.quantity).toFixed(2)} دج</div>
            </div>
        `;
        orderItems.innerHTML += itemHTML;
    });
    
    updateOrderSummary();
}

function updateShippingCost() {
    const shippingMethod = document.querySelector('input[name="shipping-method"]:checked');
    if (!shippingMethod) return;

    let cost = 0;
    if (shippingMethod.value === 'standard') cost = 200;
    else if (shippingMethod.value === 'express') cost = 400;
    else if (shippingMethod.value === 'pickup') cost = 0;

    // تحديث تكلفة الشحن في ملخص الطلب
    const summaryContainer = document.querySelector('.order-summary');
    if (summaryContainer) {
        const shippingCostElement = summaryContainer.querySelector('.summary-item:nth-child(2) span:last-child');
        if (shippingCostElement) {
            shippingCostElement.textContent = cost.toFixed(2) + ' دج';
        }
        
        // إعادة حساب الإجمالي
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    // تحديث ملخص الطلب في صفحة الدفع
    const summaryContainer = document.querySelector('.order-summary');
    if (!summaryContainer) return;

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // الحصول على تكلفة الشحن
    let shippingCost = 0;
    const shippingMethod = document.querySelector('input[name="shipping-method"]:checked');
    if (shippingMethod) {
        if (shippingMethod.value === 'standard') shippingCost = 200;
        else if (shippingMethod.value === 'express') shippingCost = 400;
        else if (shippingMethod.value === 'pickup') shippingCost = 0;
    }

    const savedPromo = getSavedPromoCode();
    let discount = 0;
    let discountCode = '';

    if (savedPromo) {
        discount = subtotal * savedPromo.discount;
        discountCode = savedPromo.code;
    }

    const total = subtotal + shippingCost - discount;

    // تحديث ملخص الطلب الموجود في الصفحة
    const summaryItems = summaryContainer.querySelectorAll('.summary-item');
    if (summaryItems.length >= 3) {
        summaryItems[0].querySelector('span:last-child').textContent = subtotal.toFixed(2) + ' دج';
        summaryItems[1].querySelector('span:last-child').textContent = shippingCost.toFixed(2) + ' دج';
        
        if (discount > 0) {
            // إذا كان هناك خصم، تأكد من وجود عنصر الخصم
            let discountElement = summaryContainer.querySelector('.summary-item.discount');
            if (!discountElement) {
                // إنشاء عنصر الخصم إذا لم يكن موجوداً
                discountElement = document.createElement('div');
                discountElement.className = 'summary-item discount';
                summaryItems[1].after(discountElement);
            }
            discountElement.innerHTML = `
                <span>كود خصم (${discountCode})</span>
                <span>-${discount.toFixed(2)} دج</span>
            `;
        }
        
        // تحديث الإجمالي النهائي
        const totalElement = summaryContainer.querySelector('.summary-total span:last-child');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2) + ' دج';
        }
    }
}

async function placeOrder() {
    // التحقق من صحة خطوات الشحن والدفع
    if (!validateShippingStep() || !validatePaymentStep()) return;

    try {
        // الحصول على طريقة الشحن
        const shippingMethod = document.querySelector('input[name="shipping-method"]:checked')?.value || 'standard';
        const shippingText = shippingMethod === 'standard' ? 'شحن عادي' :
                             shippingMethod === 'express' ? 'شحن سريع' :
                             'استلام من المتجر';

        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const userId = (user && user.id) ? user.id : 1;
        const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 
                          (shippingMethod === 'standard' ? 200 : shippingMethod === 'express' ? 400 : 0);

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify({
                userId: userId,
                total: cartTotal,
                shippingInfo: JSON.parse(localStorage.getItem('shippingInfo') || '{}')
            })
        });

        if (response.ok) {
            const data = await response.json();
            const orderId = data.id || Math.floor(Math.random() * 90000) + 10000;

            if (window.cartModule && window.cartModule.clearCart) {
                window.cartModule.clearCart();
            } else {
                cart = [];
                localStorage.removeItem('cart');
            }
            localStorage.removeItem('promoCode');
            localStorage.setItem('lastOrderId', orderId);

            window.location.href = `order-confirmation.html?id=${orderId}`;
        } else {
            showNotification('فشل في إنشاء الطلب', 'error');
        }
    } catch (error) {

        showNotification('حدث خطأ أثناء إنشاء الطلب', 'error');
    }
}

function generateOrderId() {
    const date = new Date();
    return `ORD-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
}

function getSavedPromoCode() {
    const savedPromo = localStorage.getItem('promoCode');
    if (savedPromo) {
        try { return JSON.parse(savedPromo); }
        catch (e) { return null; }
    }
    return null;
}

// Fonction pour obtenir l'utilisateur courant
function getCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return null;
    try {
        return JSON.parse(savedUser);
    } catch (e) {

        return null;
    }
}

function showNotification(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function initFormValidation() {
    // منع إرسال النماذج التقليدي
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    });
    
    // إضافة التحقق من صحة حقول النموذج
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('error');
                showNotification(`الرجاء إدخال ${this.previousElementSibling.textContent}`.replace(':', ''), 'error');
            } else {
                this.classList.remove('error');
            }
        });
    });
}
