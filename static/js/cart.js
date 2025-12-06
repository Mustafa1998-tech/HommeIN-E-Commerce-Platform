// Cart management
class CartManager {
    constructor() {
        this.cartCount = 0;
        this.updateCartBadge();
    }

    async loadCart() {
        if (!Auth.isLoggedIn()) {
            return { items: [], total: 0, items_count: 0 };
        }

        try {
            const cart = await api.getCart();
            this.cartCount = cart.items_count;
            this.updateCartBadge();
            return cart;
        } catch (error) {
            console.error('Failed to load cart:', error);
            return { items: [], total: 0, items_count: 0 };
        }
    }

    async addToCart(productId, quantity = 1, size = null, color = null) {
        if (!Auth.isLoggedIn()) {
            showLoginModal();
            return;
        }

        try {
            await api.addToCart(productId, quantity, size, color);
            await this.loadCart();
            this.showNotification('تم إضافة المنتج إلى السلة', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async updateItem(itemId, quantity) {
        try {
            await api.updateCartItem(itemId, quantity);
            await this.loadCart();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async removeItem(itemId) {
        try {
            await api.removeFromCart(itemId);
            await this.loadCart();
            this.showNotification('تم حذف المنتج من السلة', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async clearCart() {
        try {
            await api.clearCart();
            this.cartCount = 0;
            this.updateCartBadge();
            this.showNotification('تم تفريغ السلة', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.textContent = this.cartCount;
            badge.style.display = this.cartCount > 0 ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Notification styles
const notificationStyles = `
  .notification {
    position: fixed;
    top: 100px;
    right: 20px;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl);
    z-index: 3000;
    transform: translateX(400px);
    transition: transform var(--transition-base);
    max-width: 400px;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification-success {
    background: var(--success);
    color: white;
  }

  .notification-error {
    background: var(--error);
    color: white;
  }

  .notification-info {
    background: var(--info);
    color: white;
  }
`;

const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);

// Export cart manager instance
const cart = new CartManager();

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
    }).format(price);
}

// Format date
function formatDate(dateString) {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(dateString));
}
