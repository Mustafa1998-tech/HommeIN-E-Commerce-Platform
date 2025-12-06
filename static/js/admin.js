// Admin Panel JavaScript

// Check if user is admin
async function checkAdminAccess() {
    const user = Auth.getStoredUser();
    if (!user || !user.is_admin) {
        alert('يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة');
        window.location.href = '/';
        return false;
    }
    return true;
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load section data
    if (sectionName === 'dashboard') loadDashboard();
    else if (sectionName === 'products') loadProducts();
    else if (sectionName === 'orders') loadOrders();
    else if (sectionName === 'categories') loadCategories();
}

// Dashboard
async function loadDashboard() {
    try {
        // Load stats
        const products = await api.getProducts({ limit: 1000 });
        const orders = await api.getAllOrders({ limit: 1000 });

        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('pending-orders').textContent = orders.filter(o => o.status === 'pending').length;

        // Load recent orders
        const recentOrders = orders.slice(0, 10);
        const tbody = document.getElementById('recent-orders');
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.order_number}</td>
                <td>عميل #${order.user_id}</td>
                <td>${formatPrice(order.total_amount)}</td>
                <td><span class="badge badge-${getStatusColor(order.status)}">${getStatusText(order.status)}</span></td>
                <td>${formatDate(order.created_at)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Products Management
async function loadProducts() {
    try {
        const products = await api.getProducts({ limit: 1000 });
        const tbody = document.getElementById('products-table');

        tbody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${product.name}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock_quantity}</td>
                <td><span class="badge badge-${product.is_available ? 'success' : 'error'}">${product.is_available ? 'متوفر' : 'غير متوفر'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editProduct(${product.id})" class="btn btn-primary" style="padding: 0.5rem 1rem;">تعديل</button>
                        <button onclick="deleteProduct(${product.id})" class="btn btn-secondary" style="padding: 0.5rem 1rem;">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Load categories for dropdown
        const categories = await api.getCategories();
        const categorySelect = document.getElementById('product-category');
        categorySelect.innerHTML = '<option value="">بدون تصنيف</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function showAddProductForm() {
    document.getElementById('product-form-container').style.display = 'block';
    document.getElementById('form-title').textContent = 'إضافة منتج جديد';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('image-preview').style.display = 'none';
}

function hideProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
    document.getElementById('product-form').reset();
}

async function editProduct(productId) {
    try {
        const product = await api.getProduct(productId);

        document.getElementById('product-form-container').style.display = 'block';
        document.getElementById('form-title').textContent = 'تعديل المنتج';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-sku').value = product.sku || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-sale-price').value = product.sale_price || '';
        document.getElementById('product-stock').value = product.stock_quantity;
        document.getElementById('product-category').value = product.category_id || '';
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-available').value = product.is_available.toString();
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image_url || '';
        document.getElementById('product-sizes').value = product.sizes || '';
        document.getElementById('product-colors').value = product.colors || '';

        if (product.image_url) {
            const preview = document.getElementById('image-preview');
            preview.src = product.image_url;
            preview.style.display = 'block';
        }

        // Scroll to form
        document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('فشل تحميل بيانات المنتج');
    }
}

async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
        await api.deleteProduct(productId);
        cart.showNotification('تم حذف المنتج بنجاح', 'success');
        await loadProducts();
    } catch (error) {
        cart.showNotification('فشل حذف المنتج', 'error');
    }
}

// Product form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value,
                sku: document.getElementById('product-sku').value || null,
                price: parseFloat(document.getElementById('product-price').value),
                sale_price: document.getElementById('product-sale-price').value ? parseFloat(document.getElementById('product-sale-price').value) : null,
                stock_quantity: parseInt(document.getElementById('product-stock').value),
                category_id: document.getElementById('product-category').value ? parseInt(document.getElementById('product-category').value) : null,
                brand: document.getElementById('product-brand').value || null,
                is_available: document.getElementById('product-available').value === 'true',
                description: document.getElementById('product-description').value || null,
                image_url: document.getElementById('product-image').value || null,
                sizes: document.getElementById('product-sizes').value || null,
                colors: document.getElementById('product-colors').value || null,
            };

            try {
                if (productId) {
                    await api.updateProduct(parseInt(productId), productData);
                    cart.showNotification('تم تحديث المنتج بنجاح', 'success');
                } else {
                    await api.createProduct(productData);
                    cart.showNotification('تم إضافة المنتج بنجاح', 'success');
                }

                hideProductForm();
                await loadProducts();
            } catch (error) {
                cart.showNotification(error.message, 'error');
            }
        });

        // Image preview
        document.getElementById('product-image').addEventListener('input', (e) => {
            const preview = document.getElementById('image-preview');
            if (e.target.value) {
                preview.src = e.target.value;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });
    }
});

// Orders Management
let currentOrderFilter = 'all';

async function loadOrders(status = null) {
    try {
        const params = status && status !== 'all' ? { status } : {};
        const orders = await api.getAllOrders(params);
        const tbody = document.getElementById('orders-table');

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.order_number}</td>
                <td>عميل #${order.user_id}</td>
                <td>${formatPrice(order.total_amount)}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="form-select" style="padding: 0.5rem;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>معلقة</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>مؤكدة</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select>
                </td>
                <td>${formatDate(order.created_at)}</td>
                <td>
                    <button onclick="viewOrderDetails(${order.id})" class="btn btn-primary" style="padding: 0.5rem 1rem;">عرض التفاصيل</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function filterOrders(status) {
    currentOrderFilter = status;
    loadOrders(status === 'all' ? null : status);
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await api.updateOrderStatus(orderId, newStatus);
        cart.showNotification('تم تحديث حالة الطلب', 'success');
    } catch (error) {
        cart.showNotification('فشل تحديث حالة الطلب', 'error');
        await loadOrders(currentOrderFilter === 'all' ? null : currentOrderFilter);
    }
}

function viewOrderDetails(orderId) {
    // This would open a modal with order details
    alert(`عرض تفاصيل الطلب #${orderId}`);
}

// Categories Management
async function loadCategories() {
    try {
        const categories = await api.getCategories();
        const container = document.getElementById('categories-list');

        container.innerHTML = categories.map(cat => `
            <div class="card">
                <img src="${cat.image_url || 'https://via.placeholder.com/300'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: var(--space-md);">
                <h3>${cat.name}</h3>
                <p style="color: var(--text-secondary);">${cat.description || ''}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function showAddCategoryForm() {
    document.getElementById('category-form-container').style.display = 'block';
}

function hideCategoryForm() {
    document.getElementById('category-form-container').style.display = 'none';
    document.getElementById('category-form').reset();
}

// Category form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('category-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const categoryData = {
                name: document.getElementById('category-name').value,
                description: document.getElementById('category-description').value || null,
                image_url: document.getElementById('category-image').value || null,
            };

            try {
                await api.request('/admin/categories', {
                    method: 'POST',
                    body: JSON.stringify(categoryData),
                });
                cart.showNotification('تم إضافة التصنيف بنجاح', 'success');
                hideCategoryForm();
                await loadCategories();
            } catch (error) {
                cart.showNotification(error.message, 'error');
            }
        });
    }
});

// Helper functions
function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        confirmed: 'info',
        processing: 'info',
        shipped: 'primary',
        delivered: 'success',
        cancelled: 'error',
    };
    return colors[status] || 'info';
}

function getStatusText(status) {
    const texts = {
        pending: 'معلقة',
        confirmed: 'مؤكدة',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
    };
    return texts[status] || status;
}

// Image upload functions
function toggleImageInput() {
    const imageType = document.querySelector('input[name="image-type"]:checked').value;
    const urlContainer = document.getElementById('url-input-container');
    const uploadContainer = document.getElementById('upload-input-container');

    if (imageType === 'url') {
        urlContainer.style.display = 'block';
        uploadContainer.style.display = 'none';
    } else {
        urlContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
    }
}

async function uploadImage() {
    const fileInput = document.getElementById('product-image-file');
    const file = fileInput.files[0];

    if (!file) {
        cart.showNotification('الرجاء اختيار صورة', 'error');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        cart.showNotification('نوع الملف غير مدعوم. استخدم PNG أو JPG', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        cart.showNotification('حجم الصورة كبير جداً. الحد الأقصى 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const progressDiv = document.getElementById('upload-progress');
    progressDiv.style.display = 'block';

    try {
        const response = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api.token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('فشل رفع الصورة');
        }

        const data = await response.json();

        // Set the image URL
        document.getElementById('product-image').value = data.image_url;

        // Show preview
        const preview = document.getElementById('image-preview');
        preview.src = data.image_url;
        preview.style.display = 'block';

        cart.showNotification('تم رفع الصورة بنجاح', 'success');
        progressDiv.style.display = 'none';
    } catch (error) {
        cart.showNotification(error.message, 'error');
        progressDiv.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (await checkAdminAccess()) {
        await loadDashboard();
    }
});
