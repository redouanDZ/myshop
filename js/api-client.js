/**
 * myshop API Client
 * مشغّل طلبات الشبكة الموحد للـ Frontend مع إدارة التوكنات وCSRF والأخطاء
 */
class ApiClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.csrfToken = null;
    }

    async getCsrfToken() {
        if (this.csrfToken) return this.csrfToken;
        try {
            const response = await fetch(`${this.baseURL}/csrf-token`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                this.csrfToken = data.csrfToken;
            }
        } catch (e) {
            console.warn('Could not fetch CSRF token:', e);
        }
        return this.csrfToken;
    }

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const method = (options.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const token = await this.getCsrfToken();
            if (token) {
                headers['X-CSRF-Token'] = token;
            }
        }

        const config = {
            credentials: 'include',
            ...options,
            headers,
            method
        };

        try {
            const response = await fetch(url, config);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (typeof data === 'object' && (data.message || data.error)) ? (data.message || data.error) : 'حدث خطأ في الاتصال بالخادم';
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Client Error [${method} ${url}]:`, error.message);
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: typeof body === 'string' ? body : JSON.stringify(body)
        });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: typeof body === 'string' ? body : JSON.stringify(body)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

window.apiClient = new ApiClient();
