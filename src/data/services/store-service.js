const bcrypt = require('bcryptjs');

class StoreService {
  constructor(repository) {
    this.repository = repository;
  }

  async getProducts(options = {}) {
    return this.repository.getProducts(options);
  }

  async getProductById(id) {
    return this.repository.getProductById(id);
  }

  async createProduct(productData) {
    if (!productData || !productData.name || !productData.category || !Number.isFinite(Number(productData.price)) || !Number.isFinite(Number(productData.stock))) {
      throw new Error('جميع الحقول مطلوبة (الاسم، القسم، السعر، الكمية)');
    }
    return this.repository.createProduct(productData);
  }

  async updateProduct(id, productData) {
    return this.repository.updateProduct(id, productData);
  }

  async deleteProduct(id) {
    return this.repository.deleteProduct(id);
  }

  async createUser(userData) {
    if (!userData || !String(userData.email || '').trim()) {
      throw new Error('البريد الإلكتروني مطلوب');
    }
    if (!userData.password || String(userData.password).length < 6) {
      throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
    return this.repository.createUser(userData);
  }

  async verifyUserCredentials(email, password) {
    if (!email || !password) return null;
    return this.repository.verifyUserCredentials(email, password);
  }

  async findUserByEmail(email) {
    return this.repository.findUserByEmail(email);
  }

  async findUserById(id) {
    return this.repository.findUserById(id);
  }

  async updateUserProfile(id, data) {
    return this.repository.updateUserProfile(id, data);
  }

  async addUserAddress(userId, addressData) {
    return this.repository.addUserAddress(userId, addressData);
  }

  async deleteUserAddress(userId, addressId) {
    return this.repository.deleteUserAddress(userId, addressId);
  }

  async addToCart(userId, productId, quantity = 1) {
    return this.repository.addToCart(userId, productId, quantity);
  }

  async getCartItems(userId) {
    return this.repository.getCartItems(userId);
  }

  async updateCartItem(cartItemId, quantity) {
    return this.repository.updateCartItem(cartItemId, quantity);
  }

  async removeCartItem(cartItemId) {
    return this.repository.removeCartItem(cartItemId);
  }

  async createOrder(orderData) {
    if (!orderData || (!orderData.cart && !orderData.total)) {
      throw new Error('السلة أو الإجمالي مطلوب');
    }
    return this.repository.createOrder(orderData);
  }

  async getOrderById(id) {
    return this.repository.getOrderById(id);
  }

  async getOrderByNumber(orderNumber) {
    return this.repository.getOrderByNumber(orderNumber);
  }

  async getOrderByTracking(orderIdOrNumber, phone) {
    return this.repository.getOrderByTracking(orderIdOrNumber, phone);
  }

  async updateOrderStatus(orderId, status) {
    return this.repository.updateOrderStatus(orderId, status);
  }

  async updateOrderPaymentStatus(orderId, paymentStatus, paymentMethod = null) {
    return this.repository.updateOrderPaymentStatus(orderId, paymentStatus, paymentMethod);
  }

  async getOrderItems(orderId) {
    return this.repository.getOrderItems(orderId);
  }

  async getOrders(userId = null) {
    return this.repository.getOrders(userId);
  }

  async getWilayas() {
    return this.repository.getWilayas();
  }

  async getWilayaById(id) {
    return this.repository.getWilayaById(id);
  }

  async updateWilayaPrice(id, data) {
    return this.repository.updateWilayaPrice(id, data);
  }

  async getAdminDashboardStats() {
    return this.repository.getAdminDashboardStats();
  }

  async addToWishlist(userId, productId) {
    return this.repository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(userId, productId) {
    return this.repository.removeFromWishlist(userId, productId);
  }

  async getWishlist(userId) {
    return this.repository.getWishlist(userId);
  }

  async isInWishlist(userId, productId) {
    return this.repository.isInWishlist(userId, productId);
  }

  async createSession(sessionData) {
    return this.repository.createSession(sessionData);
  }

  async getSession(sessionId) {
    return this.repository.getSession(sessionId);
  }

  async touchSession(sessionId, lastSeen) {
    return this.repository.touchSession(sessionId, lastSeen);
  }

  async revokeSession(sessionId) {
    return this.repository.revokeSession(sessionId);
  }

  async getUserSessions(userId) {
    return this.repository.getUserSessions(userId);
  }

  async revokeAllUserSessions(userId) {
    return this.repository.revokeAllUserSessions(userId);
  }

  async getAdminUsers(options) {
    return this.repository.getAdminUsers(options);
  }

  async getAdminUserById(userId) {
    return this.repository.getAdminUserById(userId);
  }

  async getCoupons(options) {
    return this.repository.getCoupons(options);
  }

  async getCouponByCode(code) {
    return this.repository.getCouponByCode(code);
  }

  async createCoupon(data) {
    return this.repository.createCoupon(data);
  }

  async updateCoupon(id, data) {
    return this.repository.updateCoupon(id, data);
  }

  async deleteCoupon(id) {
    return this.repository.deleteCoupon(id);
  }

  async incrementCouponUsage(code) {
    return this.repository.incrementCouponUsage(code);
  }

  async getProductReviews(productId) {
    return this.repository.getProductReviews(productId);
  }

  async createProductReview(data) {
    return this.repository.createProductReview(data);
  }

  async getAdminReviews(options) {
    return this.repository.getAdminReviews(options);
  }

  async updateReviewStatus(id, status) {
    return this.repository.updateReviewStatus(id, status);
  }

  async deleteReview(id) {
    return this.repository.deleteReview(id);
  }

  async getStoreSettings() {
    return this.repository.getStoreSettings();
  }

  async updateStoreSettings(settings) {
    return this.repository.updateStoreSettings(settings);
  }

  async getProductVariants(productId) {
    return this.repository.getProductVariants(productId);
  }

  async createProductVariant(data) {
    return this.repository.createProductVariant(data);
  }

  async updateProductVariant(id, data) {
    return this.repository.updateProductVariant(id, data);
  }

  async deleteProductVariant(id) {
    return this.repository.deleteProductVariant(id);
  }
}

module.exports = {
  createStoreService: (repository) => new StoreService(repository)
};
