# HommeIN E-Commerce Platform

متجر إلكتروني متكامل للأزياء الرجالية مبني بتقنيات حديثة.

## التقنيات المستخدمة

### Backend
- **Python 3.8+**
- **FastAPI** - إطار عمل API سريع وحديث
- **SQLAlchemy** - ORM للتعامل مع قواعد البيانات
- **PostgreSQL / SQLite** - قاعدة البيانات
- **JWT** - المصادقة والتفويض
- **Pydantic** - التحقق من البيانات

### Frontend
- **HTML5**
- **CSS3** - تصميم عصري مع Dark Mode
- **JavaScript (Vanilla)** - بدون مكتبات خارجية

## المميزات

### للمستخدمين
- ✅ تسجيل الدخول والتسجيل
- ✅ تصفح المنتجات مع الفلترة والبحث
- ✅ إضافة المنتجات للسلة
- ✅ إتمام عملية الشراء
- ✅ تتبع الطلبات
- ✅ إدارة الحساب الشخصي

### للمسؤولين
- ✅ لوحة تحكم شاملة
- ✅ إدارة المنتجات (إضافة، تعديل، حذف)
- ✅ تحديث الأسعار والكميات
- ✅ إضافة صور المنتجات
- ✅ إدارة الطلبات وتحديث حالتها
- ✅ إدارة التصنيفات
- ✅ إحصائيات المبيعات

## التثبيت والتشغيل

### 1. تثبيت المتطلبات

```bash
pip install -r requirements.txt
```

### 2. إعداد البيئة

انسخ ملف `.env.example` إلى `.env`:

```bash
copy .env.example .env
```

### 3. تهيئة قاعدة البيانات

```bash
python database/init_db.py
```

سيتم إنشاء:
- قاعدة بيانات SQLite
- مستخدم مسؤول (admin)
- مستخدم تجريبي (user)
- تصنيفات ومنتجات تجريبية

### 4. تشغيل الخادم

**الطريقة الأولى: مباشرة**
```bash
uvicorn main:app --reload
```

**الطريقة الثانية: باستخدام Docker**
```bash
docker-compose up -d
```

الموقع سيعمل على: `http://localhost:8000`

### 5. النشر على GitHub

1. **ادفع المشروع إلى GitHub**
2. **فعل GitHub Pages** في إعدادات المستودع
3. **استخدم GitHub Actions** للنشر التلقائي

يمكن نشر التطبيق باستخدام:
- GitHub Actions (CI/CD)
- Docker Containers
- GitHub Pages (للمحتوى الثابت)

## بيانات الدخول الافتراضية

### المسؤول (Admin)
- **اسم المستخدم:** admin
- **كلمة المرور:** admin123
- **رابط لوحة الإدارة:** http://localhost:8000/admin

### مستخدم تجريبي
- **اسم المستخدم:** user
- **كلمة المرور:** user123

## هيكل المشروع

```
HommeIN/
├── models/              # نماذج قاعدة البيانات
│   ├── user.py
│   ├── product.py
│   ├── cart.py
│   └── order.py
├── controllers/         # Controllers (API Endpoints)
│   ├── auth.py
│   ├── products.py
│   ├── cart.py
│   ├── orders.py
│   └── admin.py
├── services/           # Business Logic
│   ├── auth_service.py
│   ├── product_service.py
│   └── order_service.py
├── templates/          # HTML Pages
│   ├── index.html
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── checkout.html
│   ├── account.html
│   └── admin.html
├── static/            # Static Files
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── cart.js
│       └── admin.js
├── database/          # Database Scripts
│   └── init_db.py
├── main.py           # FastAPI Application
├── config.py         # Configuration
└── requirements.txt  # Dependencies
```

## API Documentation

بعد تشغيل الخادم، يمكنك الوصول إلى:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## قاعدة البيانات

### SQLite (للتطوير)
يتم استخدام SQLite افتراضياً للتطوير والاختبار.

### PostgreSQL (للإنتاج)
لاستخدام PostgreSQL، قم بتحديث `DATABASE_URL` في ملف `.env`:

```
DATABASE_URL=postgresql://username:password@localhost/hommein
```

## الأمان

- 🔒 كلمات المرور مشفرة باستخدام bcrypt
- 🔒 المصادقة عبر JWT tokens
- 🔒 حماية نقاط API الحساسة
- 🔒 التحقق من صلاحيات المسؤول

## المساهمة

هذا المشروع مفتوح المصدر. يمكنك المساهمة عبر:
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push للفرع
5. فتح Pull Request

## الترخيص

MIT License

## الدعم

للدعم والاستفسارات:
- Email: info@hommein.com
- Phone: +20 123 456 7890
