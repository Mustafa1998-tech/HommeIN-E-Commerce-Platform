// Authentication utilities
class Auth {
    static isLoggedIn() {
        return !!localStorage.getItem('access_token');
    }

    static async getCurrentUser() {
        if (!this.isLoggedIn()) {
            return null;
        }

        try {
            const user = await api.getCurrentUser();
            return user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    static logout() {
        api.clearToken();
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    static async handleLogin(username, password) {
        try {
            const response = await api.login(username, password);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async handleRegister(userData) {
        try {
            const response = await api.register(userData);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            throw error;
        }
    }

    static getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

// Update navigation based on auth state
async function updateNavigation() {
    const user = Auth.getStoredUser();
    const authButtons = document.getElementById('auth-buttons');

    if (!authButtons) return;

    if (user) {
        authButtons.innerHTML = `
      <span class="nav-link">مرحباً، ${user.username}</span>
      <a href="/account" class="nav-link">حسابي</a>
      ${user.is_admin ? '<a href="/admin" class="nav-link">لوحة الإدارة</a>' : ''}
      <button onclick="Auth.logout()" class="btn btn-outline">تسجيل الخروج</button>
    `;
    } else {
        authButtons.innerHTML = `
      <button onclick="showLoginModal()" class="btn btn-outline">تسجيل الدخول</button>
      <button onclick="showRegisterModal()" class="btn btn-primary">إنشاء حساب</button>
    `;
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>تسجيل الدخول</h3>
        <button onclick="this.closest('.modal').remove()" class="btn-icon">&times;</button>
      </div>
      <form id="login-form" class="modal-body">
        <div class="form-group">
          <label class="form-label">اسم المستخدم أو البريد الإلكتروني</label>
          <input type="text" name="username" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">كلمة المرور</label>
          <input type="password" name="password" class="form-input" required>
        </div>
        <div id="login-error" class="error-message" style="display: none;"></div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">تسجيل الدخول</button>
      </form>
    </div>
  `;

    document.body.appendChild(modal);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const errorDiv = document.getElementById('login-error');

        try {
            await Auth.handleLogin(formData.get('username'), formData.get('password'));
            modal.remove();
            window.location.reload();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
}

// Show register modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>إنشاء حساب جديد</h3>
        <button onclick="this.closest('.modal').remove()" class="btn-icon">&times;</button>
      </div>
      <form id="register-form" class="modal-body">
        <div class="form-group">
          <label class="form-label">الاسم الكامل</label>
          <input type="text" name="full_name" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">اسم المستخدم</label>
          <input type="text" name="username" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" name="email" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">رقم الهاتف</label>
          <input type="tel" name="phone" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">كلمة المرور</label>
          <input type="password" name="password" class="form-input" required>
        </div>
        <div id="register-error" class="error-message" style="display: none;"></div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">إنشاء حساب</button>
      </form>
    </div>
  `;

    document.body.appendChild(modal);

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const errorDiv = document.getElementById('register-error');

        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            full_name: formData.get('full_name'),
            phone: formData.get('phone'),
        };

        try {
            await Auth.handleRegister(userData);
            modal.remove();
            window.location.reload();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    });
}

// Modal styles
const modalStyles = `
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease-out;
  }

  .modal-content {
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error);
    color: var(--error);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
  }
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateNavigation);
