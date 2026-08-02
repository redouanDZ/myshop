/**
 * Shopping Cart Module Bridge
 */

// Synchronize global cart
window.cartModule = {
    getCart: function() {
        return window.cart || [];
    },
    addToCart: function(product, quantity) {
        return window.addToCart ? window.addToCart(product, quantity) : false;
    },
    removeFromCart: function(productId) {
        return window.removeFromCart ? window.removeFromCart(productId) : false;
    },
    updateCartItemQuantity: function(productId, quantity) {
        return window.updateCartItemQuantity ? window.updateCartItemQuantity(productId, quantity) : false;
    },
    clearCart: function() {
        window.cart = [];
        localStorage.removeItem('cart');
        if (window.updateCartUI) window.updateCartUI();
        return true;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (window.updateCartUI) {
        window.updateCartUI();
    }
});


// تحديث واجهة عربة التسوق
function updateCartUI() {
    // تحديث عدد المنتجات في أيقونة السلة
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // تحديث محتوى عربة التسوق في صفحة السلة
    const cartItemsContainer = document.querySelector('.cart-items .cart-items-grid');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">عربة التسوق فارغة</div>';
            updateOrderSummary();
            return;
        }

        cart.forEach(item => {
            const cartItemHTML = createCartItemHTML(item);
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        initQuantityControls();
        initRemoveButtons();
        updateOrderSummary();
    }
}

// إنشاء HTML عنصر في عربة التسوق
function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <div class="item-options">
                    <span class="item-color">اللون: أزرق</span>
                    <span class="item-size">المقاس: M</span>
                </div>
                <div class="item-price">${item.price.toFixed(2)} دج</div>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" max="10" data-id="${item.id}">
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
            <div class="item-total">${(item.price * item.quantity).toFixed(2)} دج</div>
            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
}

// تهيئة أزرار الإضافة إلى السلة
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.dataset.productId || parseInt(this.dataset.id),
                name: this.dataset.productName || this.textContent.trim(),
                price: parseFloat(this.dataset.productPrice || this.dataset.price),
                image: this.dataset.productImage || this.dataset.image,
                quantity: 1
            };

            addToCart(product);
        });
    });
}

// إضافة منتج إلى السلة
function addToCart(product) {
    if (!product || !product.id) return;

    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        // زيادة الكمية إذا كان المنتج موجوداً بالفعل
        if (cart[existingProductIndex].quantity < 10) {
            cart[existingProductIndex].quantity += 1;
        }
    } else {
        // إضافة منتج جديد
        cart.push(product);
    }

    saveCartToStorage();
    updateCartUI();
    showNotification('تمت إضافة المنتج إلى السلة بنجاح!');
}

// تحديث كمية منتج في السلة
function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (quantity > 10) return;

    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex !== -1) {
        cart[productIndex].quantity = quantity;
        saveCartToStorage();
        updateCartUI();
    }
}

// إزالة منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    showNotification('تمت إزالة المنتج من السلة');
}

// تهيئة عناصر التحكم في الكمية
function initQuantityControls() {
    // أزرار زيادة/تقليل الكمية
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const isIncrease = this.classList.contains('increase');

            const item = cart.find(i => i.id === id);
            if (!item) return;

            const newQty = isIncrease ? 
                Math.min(item.quantity + 1, 10) : 
                Math.max(item.quantity - 1, 1);

            updateCartItemQuantity(id, newQty);
        });
    });

    // حقول إدخال الكمية
    const quantityInputs = document.querySelectorAll('.item-quantity input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateCartItemQuantity(parseInt(this.dataset.id), parseInt(this.value));
        });
    });
}

// تهيئة أزرار إزالة المنتجات
function initRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            removeFromCart(id);
        });
    });
}

// تحديث ملخص الطلب
function updateOrderSummary() {
    const summaryContainer = document.querySelector('.cart-summary');
    if (!summaryContainer) return;

    // حساب الإجماليات
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 5000 ? 0 : 300; // الشحن المجاني للطلبات الكبيرة
    const savedPromo = getSavedPromoCode();
    const discount = savedPromo ? savedPromo.discount : 0;
    const discountAmount = subtotal * discount;
    const total = subtotal + shippingCost - discountAmount;

    // إنشاء HTML ملخص الطلب
    summaryContainer.innerHTML = `
        <h2>ملخص الطلب</h2>
        <div class="summary-item">
            <span>إجمالي المنتجات</span>
            <span>${subtotal.toFixed(2)} دج</span>
        </div>
        <div class="summary-item">
            <span>الشحن والتوصيل</span>
            <span>${shippingCost.toFixed(2)} دج</span>
        </div>
        ${discount > 0 ? `
            <div class="summary-item discount">
                <span>كود خصم (${savedPromo.code})</span>
                <span>-${discountAmount.toFixed(2)} دج</span>
            </div>
        ` : ''}
        <div class="summary-total">
            <span>المبلغ الإجمالي</span>
            <span>${total.toFixed(2)} دج</span>
        </div>
        <div class="promo-code">
            <input type="text" placeholder="أدخل كود الخصم">
            <button class="apply-promo">تطبيق</button>
        </div>
        <button class="checkout-btn">إتمام الشراء</button>
        <a href="shop.html" class="continue-shopping">متابعة التسوق <i class="fas fa-arrow-left"></i></a>
    `;

    // إضافة مستمعات الأحداث للأزرار
    const promoInput = summaryContainer.querySelector('.promo-code input');
    const applyPromoBtn = summaryContainer.querySelector('.apply-promo');
    const checkoutBtn = summaryContainer.querySelector('.checkout-btn');

    applyPromoBtn.addEventListener('click', function() {
        applyPromoCode(promoInput.value.trim());
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('عربة التسوق فارغة', 'error');
        } else {
            window.location.href = 'checkout.html';
        }
    });
}

// تطبيق كود الخصم
function applyPromoCode(code) {
    const promoCodes = { 
        'SAVE10': 0.1, 
        'SAVE20': 0.2, 
        'WELCOME': 0.15 
    };

    const discount = promoCodes[code.toUpperCase()];
    if (discount) {
        localStorage.setItem('promoCode', JSON.stringify({ code, discount }));
        showNotification(`تم تطبيق الخصم بنجاح! (${discount*100}%)`);
        updateOrderSummary();
    } else {
        showNotification('كود الخصم غير صالح', 'error');
    }
}

// الحصول على كود الخصم المحفوظ
function getSavedPromoCode() {
    const saved = localStorage.getItem('promoCode');
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

// عرض الإشعارات
function showNotification(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-notification';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });

    notification.appendChild(closeBtn);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// إضافة أنماط الإشعارات إلى الصفحة
(function() {
    if (!document.getElementById('cart-notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'cart-notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--success-color);
                color: white;
                padding: 15px 25px;
                border-radius: var(--border-radius);
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                transform: translateX(150%);
                transition: transform 0.3s ease;
            }

            .notification.error {
                background-color: var(--danger-color);
            }

            .close-notification {
                margin-left: 15px;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
            }

            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(notificationStyles);
    }
})();
