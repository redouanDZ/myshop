/**
 * Client-Side Shopping Cart System
 */

var cart = window.cart || [];

document.addEventListener('DOMContentLoaded', function() {
    initCart();
    const savedPromo = getSavedPromoCode();
    if (savedPromo) updateOrderSummary();
});

async function initCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
        window.cart = cart;
        updateCartUI();
    } catch (error) {

        cart = [];
        window.cart = cart;
        updateCartUI();
    }
}

async function addToCart(product, quantity = 1) {
    if (!product || quantity <= 0) return false;

    const productId = product.id || product.product_id;
    if (!productId) return false;

    try {
        const existingIndex = cart.findIndex(item => item.id === productId);
        if (existingIndex !== -1) {
            const newQty = cart[existingIndex].quantity + quantity;
            if (newQty > 20) {
                showNotification('لا يمكن إضافة أكثر من 20 قطعة من نفس المنتج', 'error');
                return false;
            }
            cart[existingIndex].quantity = newQty;
        } else {
            cart.push({ 
                id: productId, 
                name: product.name || 'منتج', 
                price: Number(product.price) || 0, 
                image: product.image || product.image_url || '/images/product-placeholder.jpg', 
                quantity: quantity 
            });
        }

        window.cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        
        showNotification(`تمت إضافة "${product.name || 'المنتج'}" إلى سلة التسوق 🛒`, 'success');
        return true;
    } catch (error) {

        showNotification('حدث خطأ أثناء إضافة المنتج إلى عربة التسوق', 'error');
        return false;
    }
}

async function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) { 
        removeFromCart(productId); 
        return; 
    }
    if (quantity > 20) {
        showNotification('لا يمكن أن تتجاوز الكمية 20 قطعة', 'error');
        return;
    }

    try {
        const index = cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            cart[index].quantity = quantity;
            window.cart = cart;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    } catch (error) {

        showNotification('حدث خطأ أثناء تحديث كمية المنتج', 'error');
    }
}

async function removeFromCart(productId) {
    try {
        cart = cart.filter(item => item.id !== productId);
        window.cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        showNotification('تمت إزالة المنتج من السلة', 'info');
    } catch (error) {

        showNotification('حدث خطأ أثناء إزالة المنتج من عربة التسوق', 'error');
    }
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => el.textContent = totalCount);

    const container = document.querySelector('.cart-items .products-grid') || document.querySelector('.cart-items .cart-items-grid');
    if (!container) return;
    
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state" style="text-align: center; padding: 50px 20px; background: white; border-radius: 16px; border: 1px solid var(--border-color); grid-column: 1 / -1;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--light-text); margin-bottom: 15px;"></i>
                <h3 style="font-size: 1.25rem; margin-bottom: 10px; color: var(--dark-color);">عربة التسوق فارغة حالياً</h3>
                <p style="color: var(--light-text); margin-bottom: 20px;">استكشف تشكيلتنا الواسعة وأضف منتجاتك المفضلة للسلة!</p>
                <a href="shop.html" class="btn btn-primary"><i class="fas fa-store"></i> تصفح المنتجات</a>
            </div>
        `;
        updateOrderSummary(0);
        return;
    }

    cart.forEach(item => container.innerHTML += createCartItemHTML(item));
    initCartControls();
    updateOrderSummary();
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <div class="item-price">${item.price.toLocaleString()} دج</div>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" max="20" data-id="${item.id}">
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
            <div class="item-total">${(item.price * item.quantity).toLocaleString()} دج</div>
            <button class="remove-item" data-id="${item.id}" title="إزالة العنصر"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
}

function initCartControls() {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id, 10);
            const isIncrease = this.classList.contains('increase');
            const item = cart.find(i => i.id === id);
            if (!item) return;
            const newQty = isIncrease ? Math.min(item.quantity + 1, 20) : Math.max(item.quantity - 1, 1);
            updateCartItemQuantity(id, newQty);
        });
    });

    document.querySelectorAll('.item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const val = parseInt(this.value, 10);
            const id = parseInt(this.dataset.id, 10);
            if (!isNaN(val) && val > 0) {
                updateCartItemQuantity(id, val);
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id, 10);
            removeFromCart(id);
        });
    });
}

function updateOrderSummary(subtotal = null) {
    const summaryContainer = document.querySelector('.cart-summary');
    if (!summaryContainer) return;

    if (subtotal === null) subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 50000 || subtotal === 0 ? 0 : 800;
    const savedPromo = getSavedPromoCode();
    const discount = savedPromo ? savedPromo.discount : 0;
    const discountAmount = subtotal * discount;
    const total = subtotal + shippingCost - discountAmount;

    summaryContainer.innerHTML = `
        <h2>ملخص الطلب</h2>
        <div class="summary-item"><span>إجمالي المنتجات</span><span>${subtotal.toLocaleString()} دج</span></div>
        <div class="summary-item"><span>الشحن والتوصيل</span><span>${shippingCost === 0 ? 'مجاني' : shippingCost.toLocaleString() + ' دج'}</span></div>
        ${discount > 0 ? `<div class="summary-item discount" style="color: var(--success-color); font-weight: 700;"><span>كود خصم (${discount*100}%)</span><span>-${discountAmount.toLocaleString()} دج</span></div>` : ''}
        <div class="summary-total" style="font-size: 1.2rem; font-weight: 800; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between;"><span>المبلغ الإجمالي</span><span style="color: var(--primary-color);">${total.toLocaleString()} دج</span></div>
        <div class="promo-code" style="margin: 15px 0; display: flex; gap: 8px;"><input type="text" placeholder="أدخل كود الخصم (مثل: SAVE10)" value="${savedPromo ? savedPromo.code : ''}" style="flex:1; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px;"><button class="apply-promo btn btn-outline" style="padding: 10px 16px;">تطبيق</button></div>
        <button class="checkout-btn btn btn-primary w-full" style="width: 100%; margin-top: 10px; padding: 14px;"><i class="fas fa-credit-card"></i> إتمام الشراء</button>
        <a href="shop.html" class="continue-shopping" style="display: block; text-align: center; margin-top: 15px; color: var(--light-text);"><i class="fas fa-arrow-right"></i> متابعة التسوق</a>
    `;

    const promoInput = summaryContainer.querySelector('.promo-code input');
    const applyBtn = summaryContainer.querySelector('.apply-promo');
    if (applyBtn && promoInput) {
        applyBtn.addEventListener('click', () => applyPromoCode(promoInput.value.trim()));
    }

    const checkoutBtn = summaryContainer.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('عربة التسوق فارغة', 'error');
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }
}

function applyPromoCode(code) {
    if (!code) {
        localStorage.removeItem('promoCode');
        showNotification('تم إلغاء كود الخصم', 'info');
        updateOrderSummary();
        return;
    }
    const promoCodes = { 'SAVE10': 0.1, 'SAVE20': 0.2, 'WELCOME': 0.15 };
    const discount = promoCodes[code.toUpperCase()];
    if (discount) {
        localStorage.setItem('promoCode', JSON.stringify({ code: code.toUpperCase(), discount }));
        showNotification(`تم تطبيق الخصم بنجاح! (${discount*100}%)`, 'success');
        updateOrderSummary();
    } else {
        showNotification('كود الخصم غير صالح. استخدم SAVE10 أو SAVE20', 'error');
    }
}

function getSavedPromoCode() {
    const saved = localStorage.getItem('promoCode');
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
}

function showNotification(message, type='success') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

// Global Exports
window.cart = cart;
window.initCart = initCart;
window.addToCart = addToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.updateCartUI = updateCartUI;

