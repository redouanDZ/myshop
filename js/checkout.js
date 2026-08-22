/**
 * myshop - نظام إدارة الدفع والولايات والطلبات
 */

let allWilayas = [];
let selectedWilaya = null;
let currentDeliveryType = 'home';
let currentShippingCost = 500;

document.addEventListener('DOMContentLoaded', async function() {
    await loadWilayas();
    loadCartData();
    initPaymentMethodListeners();
    prefillCustomerInfo();
});

/**
 * جلب قائمة الولايات الـ 58 من API
 */
async function loadWilayas() {
    const select = document.getElementById('wilayaSelect');
    if (!select) return;

    try {
        const response = await fetch('/api/wilayas');
        if (!response.ok) throw new Error('فشل جلب الولايات');
        allWilayas = await response.json();

        select.innerHTML = '<option value="">-- اختر ولايتك (58 ولاية) --</option>';
        allWilayas.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.id;
            opt.textContent = `${w.code} - ${w.name_ar} (${w.name_fr})`;
            select.appendChild(opt);
        });

        // Set default to Alger (16) or first
        const defaultWilaya = allWilayas.find(w => w.code === '16') || allWilayas[0];
        if (defaultWilaya) {
            select.value = defaultWilaya.id;
            onWilayaChange();
        }
    } catch (error) {
        console.error('Error loading wilayas:', error);
        select.innerHTML = '<option value="16">16 - الجزائر العاصمة (Alger)</option>';
        currentShippingCost = 400;
        updateOrderSummary();
    }
}

/**
 * عند تغيير الولاية
 */
function onWilayaChange() {
    const select = document.getElementById('wilayaSelect');
    const wilayaId = Number(select.value);
    selectedWilaya = allWilayas.find(w => Number(w.id) === wilayaId) || null;

    if (selectedWilaya) {
        document.getElementById('homeDeliveryPriceLabel').textContent = `السعر: ${selectedWilaya.home_delivery_price.toLocaleString()} دج (${selectedWilaya.delivery_time_days})`;
        document.getElementById('deskDeliveryPriceLabel').textContent = `السعر: ${selectedWilaya.desk_delivery_price.toLocaleString()} دج (${selectedWilaya.delivery_time_days})`;
        
        currentShippingCost = currentDeliveryType === 'home' 
            ? selectedWilaya.home_delivery_price 
            : selectedWilaya.desk_delivery_price;
    } else {
        currentShippingCost = 500;
    }

    updateOrderSummary();
}

/**
 * عند تغيير نوع التوصيل (منزل / مكتب)
 */
function onDeliveryTypeChange() {
    const homeRadio = document.querySelector('input[name="delivery-type"][value="home"]');
    const deskRadio = document.querySelector('input[name="delivery-type"][value="desk"]');
    const homeCard = document.getElementById('deliveryCardHome');
    const deskCard = document.getElementById('deliveryCardDesk');

    if (homeRadio && homeRadio.checked) {
        currentDeliveryType = 'home';
        homeCard.classList.add('active');
        deskCard.classList.remove('active');
    } else {
        currentDeliveryType = 'desk';
        deskCard.classList.add('active');
        homeCard.classList.remove('active');
    }

    if (selectedWilaya) {
        currentShippingCost = currentDeliveryType === 'home' 
            ? selectedWilaya.home_delivery_price 
            : selectedWilaya.desk_delivery_price;
    }

    updateOrderSummary();
}

/**
 * تهيئة الاستماع لطرق الدفع
 */
function initPaymentMethodListeners() {
    const radios = document.querySelectorAll('input[name="payment-method"]');
    const bankDetails = document.getElementById('bank-transfer-details');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
            this.closest('.payment-option').classList.add('active');

            if (bankDetails) {
                bankDetails.style.display = this.value === 'bank-transfer' ? 'block' : 'none';
            }
        });
    });
}

/**
 * التنقل بين الخطوات
 */
function goToShippingStep() {
    switchStep(1);
}

function proceedToPayment() {
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const wilaya = document.getElementById('wilayaSelect').value;

    if (!fullname) { showNotification('يرجى إدخال الاسم الكامل', 'error'); return; }
    if (!phone || phone.length < 8) { showNotification('يرجى إدخال رقم هاتف صحيح', 'error'); return; }
    if (!wilaya) { showNotification('يرجى اختيار الولاية', 'error'); return; }
    if (!address) { showNotification('يرجى إدخال العنوان بالتفصيل', 'error'); return; }

    switchStep(2);
}

function goToPaymentStep() {
    switchStep(2);
}

function proceedToReview() {
    renderReviewItems();
    updateOrderSummary();
    switchStep(3);
}

function switchStep(stepNumber) {
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.checkout-steps .step').forEach(el => el.classList.remove('active'));

    if (stepNumber === 1) {
        document.getElementById('shipping-info').classList.add('active');
        document.getElementById('stepIndicator1').classList.add('active');
    } else if (stepNumber === 2) {
        document.getElementById('payment-method').classList.add('active');
        document.getElementById('stepIndicator2').classList.add('active');
    } else if (stepNumber === 3) {
        document.getElementById('order-review').classList.add('active');
        document.getElementById('stepIndicator3').classList.add('active');
    }
}

/**
 * تحميل السلة وتحديث الملخص
 */
function loadCartData() {
    const saved = localStorage.getItem('cart');
    let cart = [];
    try { cart = saved ? JSON.parse(saved) : []; } catch (e) { cart = []; }

    if (cart.length === 0) {
        showNotification('عربة التسوق فارغة، جاري تحويلك للمتجر...', 'error');
        setTimeout(() => { window.location.href = 'shop.html'; }, 1500);
        return;
    }

    updateOrderSummary();
}

function renderReviewItems() {
    const container = document.getElementById('reviewOrderItems');
    if (!container) return;

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) {}

    container.innerHTML = cart.map(item => `
        <div class="order-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.image || item.image_url || '/images/product-placeholder.jpg'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
                <div>
                    <strong style="display: block; font-size: 0.95rem; color: #1e293b;">${item.name}</strong>
                    <span style="font-size: 0.85rem; color: #64748b;">الكمية: ${item.quantity}</span>
                </div>
            </div>
            <strong style="color: #2563eb;">${(Number(item.price) * Number(item.quantity)).toLocaleString()} دج</strong>
        </div>
    `).join('');
}

function updateOrderSummary() {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) {}

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const wilayaName = selectedWilaya ? selectedWilaya.name_ar : 'الولاية';
    
    // Promo discount if applicable
    const promo = getSavedPromo();
    const discount = promo ? subtotal * promo.discount : 0;
    const grandTotal = Math.max(0, subtotal + currentShippingCost - discount);

    const subtotalEl = document.getElementById('reviewSubtotal');
    const shippingEl = document.getElementById('reviewShippingCost');
    const wilayaNameEl = document.getElementById('reviewWilayaName');
    const grandTotalEl = document.getElementById('reviewGrandTotal');
    const discountRow = document.getElementById('reviewDiscountRow');
    const discountEl = document.getElementById('reviewDiscount');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} دج`;
    if (shippingEl) shippingEl.textContent = `${currentShippingCost.toLocaleString()} دج`;
    if (wilayaNameEl) wilayaNameEl.textContent = wilayaName;
    if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toLocaleString()} دج`;

    if (discount > 0 && discountRow && discountEl) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${discount.toLocaleString()} دج`;
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }
}

function getSavedPromo() {
    try {
        const p = localStorage.getItem('promoCode');
        return p ? JSON.parse(p) : null;
    } catch (e) {
        return null;
    }
}

/**
 * إرسال وإنشاء الطلب
 */
async function placeOrderNow() {
    const terms = document.getElementById('terms');
    if (terms && !terms.checked) {
        showNotification('يرجى الموافقة على شروط الخدمة لتأكيد الطلب', 'error');
        return;
    }

    const btn = document.getElementById('confirmOrderBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تأكيد وتسجيل الطلب...';
    }

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) {}
    if (cart.length === 0) {
        showNotification('السلة فارغة!', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const promo = getSavedPromo();
    const discount = promo ? subtotal * promo.discount : 0;
    const grandTotal = Math.max(0, subtotal + currentShippingCost - discount);

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod';
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const notes = document.getElementById('notes').value.trim();

    // Check if user is logged in
    let currentUser = null;
    try { currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (e) {}

    const orderPayload = {
        userId: currentUser && currentUser.id ? currentUser.id : null,
        paymentMethod: paymentMethod,
        total: grandTotal,
        cart: cart.map(item => ({
            id: item.id || item.product_id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image_url: item.image || item.image_url || '/images/product-placeholder.jpg'
        })),
        shippingInfo: {
            fullName: fullname,
            phone: phone,
            email: email,
            address: address,
            city: selectedWilaya ? selectedWilaya.name_ar : 'الجزائر',
            wilayaId: selectedWilaya ? selectedWilaya.id : 16,
            wilayaName: selectedWilaya ? selectedWilaya.name_ar : 'الجزائر العاصمة',
            deliveryType: currentDeliveryType,
            shippingCost: currentShippingCost,
            paymentMethod: paymentMethod,
            notes: notes
        }
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentUser && currentUser.token ? `Bearer ${currentUser.token}` : ''
            },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || 'فشل في إنشاء الطلب');
        }

        const orderId = data.id;
        const orderNumber = data.orderNumber || `DZ-${orderId}`;
        const trackingToken = data.trackingToken || '';

        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('promoCode');
        localStorage.setItem('lastOrderId', orderId);
        localStorage.setItem('lastOrderPhone', phone);
        localStorage.setItem('lastOrderToken', trackingToken);

        // If Chargily Pay selected: Redirect to payment gateway
        if (paymentMethod === 'chargily') {
            try {
                const payRes = await fetch('/api/payments/chargily/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                });
                const payData = await payRes.json();
                if (payRes.ok && payData.checkoutUrl) {
                    window.location.href = payData.checkoutUrl;
                    return;
                }
            } catch (payErr) {
                console.error('Chargily redirect error:', payErr);
            }
        }

        // Direct Confirmation
        window.location.href = `order-confirmation.html?id=${orderId}&token=${trackingToken}&phone=${encodeURIComponent(phone)}`;
    } catch (error) {
        showNotification(error.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> تأكيد الطلب الآن';
        }
    }
}

function prefillCustomerInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (user) {
            if (user.username && document.getElementById('fullname')) document.getElementById('fullname').value = user.username;
            if (user.phone && document.getElementById('phone')) document.getElementById('phone').value = user.phone;
            if (user.email && document.getElementById('email')) document.getElementById('email').value = user.email;
        }
    } catch (e) {}
}

function showNotification(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add('show'), 10);
    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => n.remove(), 300);
    }, 3500);
}
