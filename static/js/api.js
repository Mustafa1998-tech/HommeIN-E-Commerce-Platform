// API Configuration
const API_BASE_URL = window.location.origin;
const API_URL = `${API_BASE_URL}/api`;

// API Client
class APIClient {
    constructor() {
        this.token = localStorage.getItem('access_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('access_token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/';
                throw new Error('Unauthorized');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        this.setToken(data.access_token);
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Product endpoints
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products?${queryString}`);
    }

    async getProduct(productId) {
        return this.request(`/products/${productId}`);
    }

    async getCategories() {
        return this.request('/products/categories');
    }

    // Cart endpoints
    async getCart() {
        return this.request('/cart/');
    }

    async addToCart(productId, quantity = 1, size = null, color = null) {
        return this.request('/cart/items', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                quantity,
                size,
                color,
            }),
        });
    }

    async updateCartItem(itemId, quantity) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    }

    async removeFromCart(itemId) {
        return this.request(`/cart/items/${itemId}`, {
            method: 'DELETE',
        });
    }

    async clearCart() {
        return this.request('/cart/clear', {
            method: 'DELETE',
        });
    }

    // Order endpoints
    async createOrder(orderData) {
        return this.request('/orders/', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getOrders() {
        return this.request('/orders/');
    }

    async getOrder(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    // Admin endpoints
    async createProduct(productData) {
        return this.request('/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(productId, productData) {
        return this.request(`/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(productId) {
        return this.request(`/admin/products/${productId}`, {
            method: 'DELETE',
        });
    }

    async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/orders?${queryString}`);
    }

    async updateOrderStatus(orderId, status) {
        return this.request(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
}

// Export singleton instance
const api = new APIClient();
