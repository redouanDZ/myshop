/**
 * myshop - إدارة قائمة الأمنيات والرغبات (Wishlist)
 */

window.WishlistManager = {
    /**
     * التحقق مما إذا كان المستخدم مسجلاً
     */
    isUserLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
            return Boolean(user && (user.id || user.token));
        } catch (e) {
            return false;
        }
    },

    /**
     * جلب عناصر المفضلة (من الخادم أو التخزين المحلي)
     */
    async getItems() {
        if (this.isUserLoggedIn()) {
            try {
                const res = await fetch('/api/wishlist');
                if (res.ok) {
                    const items = await res.json();
                    return items;
                }
            } catch (err) {
                console.warn('Could not fetch server wishlist, falling back to local:', err.message);
            }
        }
        return this.getLocalItems();
    },

    /**
     * جلب العناصر من LocalStorage
     */
    getLocalItems() {
        try {
            return JSON.parse(localStorage.getItem('myshop_wishlist') || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * حفظ العناصر في LocalStorage
     */
    saveLocalItems(items) {
        localStorage.setItem('myshop_wishlist', JSON.stringify(items));
        this.updateBadgeCount();
    },

    /**
     * إضافة أو إزالة منتج (تبديل الحالة)
     */
    async toggleItem(product) {
        if (!product || !product.id) return false;
        const prodId = Number(product.id);

        if (this.isUserLoggedIn()) {
            const inList = await this.isInWishlist(prodId);
            const method = inList ? 'DELETE' : 'POST';
            try {
                const res = await fetch(`/api/wishlist/${prodId}`, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    this.showToast(data.message || (inList ? 'تم الحذف من المفضلة' : 'تمت الإضافة للمفضلة ❤️'), 'success');
                    this.updateBadgeCount();
                    return !inList;
                }
            } catch (err) {
                console.error('Error toggling server wishlist:', err);
            }
        }

        // Local Storage for guests
        let local = this.getLocalItems();
        const index = local.findIndex(p => Number(p.id) === prodId);
        let nowInList = false;

        if (index > -1) {
            local.splice(index, 1);
            this.showToast('تمت إزالة المنتج من قائمة الرغبات', 'info');
        } else {
            local.push({
                id: prodId,
                name: product.name,
                price: Number(product.price),
                stock: Number(product.stock || 10),
                image_url: product.image_url || product.image || '/images/product-placeholder.jpg',
                category: product.category || 'إلكترونيات',
                added_at: new Date().toISOString()
            });
            nowInList = true;
            this.showToast('تمت إضافة المنتج إلى قائمة الرغبات ❤️', 'success');
        }

        this.saveLocalItems(local);
        return nowInList;
    },

    /**
     * فحص هل المنتج موجود في المفضلة
     */
    async isInWishlist(productId) {
        const prodId = Number(productId);
        if (this.isUserLoggedIn()) {
            try {
                const res = await fetch(`/api/wishlist/check/${prodId}`);
                if (res.ok) {
                    const data = await res.json();
                    return Boolean(data.inWishlist);
                }
            } catch (e) {}
        }
        const local = this.getLocalItems();
        return local.some(p => Number(p.id) === prodId);
    },

    /**
     * إزالة منتج بالمعرف
     */
    async removeItem(productId) {
        const prodId = Number(productId);
        if (this.isUserLoggedIn()) {
            try {
                await fetch(`/api/wishlist/${prodId}`, { method: 'DELETE' });
            } catch (e) {}
        }
        let local = this.getLocalItems();
        local = local.filter(p => Number(p.id) !== prodId);
        this.saveLocalItems(local);
        this.updateBadgeCount();
    },

    /**
     * تحديث عداد الشارة في الهيدر
     */
    async updateBadgeCount() {
        const badges = document.querySelectorAll('.wishlist-count, #wishlist-count');
        if (!badges.length) return;

        let count = 0;
        if (this.isUserLoggedIn()) {
            try {
                const res = await fetch('/api/wishlist');
                if (res.ok) {
                    const items = await res.json();
                    count = items.length;
                } else {
                    count = this.getLocalItems().length;
                }
            } catch (e) {
                count = this.getLocalItems().length;
            }
        } else {
            count = this.getLocalItems().length;
        }

        badges.forEach(b => {
            b.textContent = count;
            b.style.display = count > 0 ? 'inline-block' : 'inline-block';
        });
    },

    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        const toast = document.createElement('div');
        toast.className = `notification ${type} show`;
        toast.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; background:#2563eb; color:#fff; padding:12px 20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:bold;';
        if (type === 'info') toast.style.background = '#0284c7';
        if (type === 'error') toast.style.background = '#ef4444';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Auto update badge on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.WishlistManager.updateBadgeCount();
});
